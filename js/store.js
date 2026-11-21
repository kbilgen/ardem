// ARDEM — reservation & appointment storage.
// Uses the hosting platform's shared database when this page runs as a Claude artifact
// (requests become readable by the owner); otherwise keeps a local copy in this browser.

const REF_CHARS = 'ACDEFGHJKMNPQRTUVWXY34679';
export function makeRef(prefix = 'ARD') {
  let s = '';
  const buf = new Uint32Array(6);
  (window.crypto || window.msCrypto).getRandomValues(buf);
  for (const n of buf) s += REF_CHARS[n % REF_CHARS.length];
  return `${prefix}-${s.slice(0, 3)}${s.slice(3)}`;
}

let ctxPromise = null;
// resolves { db, uid } when this page runs as a Claude artifact with a signed-in viewer, else null
function getCtx() {
  if (ctxPromise) return ctxPromise;
  ctxPromise = new Promise((resolve) => {
    const use = window.claude && typeof window.claude.use === 'function';
    if (!use) return resolve(null);
    const timer = setTimeout(() => resolve(null), 10000);
    Promise.all([window.claude.use('db'), window.claude.use('user')])
      .then(async ([db, user]) => {
        const uid = db && user ? await user.id() : null;
        clearTimeout(timer);
        resolve(db && uid ? { db, uid } : null);
      })
      .catch(() => { clearTimeout(timer); resolve(null); });
  });
  return ctxPromise;
}

function saveLocal(kind, ref, record) {
  try {
    const key = `ardem:${kind}`;
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    list.push({ ref, ...record });
    localStorage.setItem(key, JSON.stringify(list.slice(-50)));
    return true;
  } catch {
    return false;
  }
}

/** kind: 'reservations' | 'appointments'. Resolves { ref, mode: 'db' | 'local' | 'none' } */
export async function submitRequest(kind, payload) {
  const ref = makeRef(kind === 'appointments' ? 'APT' : 'ARD');
  const record = { ...payload, createdAt: new Date().toISOString(), status: 'new' };
  const ctx = await getCtx();
  if (ctx) {
    try {
      // one document per person: <kind>/<viewer id>, holding their requests.
      // Rules let each person write only their own; the owner and editors read them all.
      const doc = ctx.db.doc(`${kind}/${ctx.uid}`);
      const snap = await doc.get();
      const prev = snap.exists && Array.isArray(snap.data().requests) ? snap.data().requests : [];
      await Promise.race([
        doc.set({ requests: [...prev, { ref, ...record }].slice(-25), updatedAt: record.createdAt }),
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 10000)),
      ]);
      return { ref, mode: 'db' };
    } catch {
      /* not permitted for this viewer, or unavailable: keep a local copy instead */
    }
  }
  return { ref, mode: saveLocal(kind, ref, record) ? 'local' : 'none' };
}
