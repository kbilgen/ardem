// ARDEM — jewelry models assembled from procedural parts
import { Mesh } from './renderer.js';
import * as G from './geometry.js';
import { m4, v3 } from './math.js';

const TAU = Math.PI * 2;
const I = m4.identity();

/* ---------- materials ---------- */
export const METALS = {
  champagne: { f0: [0.98, 0.75, 0.43], rough: 0.07 },
  yellow: { f0: [1.0, 0.7, 0.28], rough: 0.065 },
  rose: { f0: [0.96, 0.63, 0.52], rough: 0.075 },
  white: { f0: [0.8, 0.8, 0.79], rough: 0.06 },
};
export const STONES = {
  diamond: { ior: 2.42, disp: 0.024, absorb: [0, 0, 0], body: [1, 1, 1] },
  emerald: { ior: 1.58, disp: 0.008, absorb: [5.5, 1.25, 3.4], body: [0.45, 0.8, 0.62] },
};

// Signature variants: metal + centre stone
export const VARIANTS = {
  champagne: { label: 'Champagne Gold', metal: 'champagne', stone: 'diamond', morph: 0 },
  rose: { label: 'Rose Gold', metal: 'rose', stone: 'diamond', morph: 0 },
  white: { label: 'Diamond White', metal: 'white', stone: 'diamond', morph: 0 },
  emerald: { label: 'Emerald Green', metal: 'yellow', stone: 'emerald', morph: 1 },
};

/* ---------- mesh cache ---------- */
function cache(r) {
  return r._jc || (r._jc = {});
}
const SHAPE_XF = { pear: [1, 1.28, 0.22, 0], oval: [0.85, 1.16, 0, 0] };
function gemMesh(r, a = 'round', b = a) {
  const c = cache(r), k = 'gem:' + a + ':' + b;
  if (!c[k]) {
    c[k] = new Mesh(r.gl, G.brilliant(G.outlines[a], G.outlines[b]));
    c[k].shapeXf = SHAPE_XF[a];
  }
  return c[k];
}
function sphereMesh(r) {
  const c = cache(r);
  return c.sphere || (c.sphere = new Mesh(r.gl, G.sphere(14, 20)));
}
function linkMesh(r) {
  const c = cache(r);
  return c.link || (c.link = new Mesh(r.gl, G.torus(1, 0.26, 24, 10)));
}
export function shadowMesh(r) {
  const c = cache(r);
  if (!c.shadow) {
    c.shadow = new Mesh(r.gl, {
      positions: new Float32Array([-1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1]),
      normals: new Float32Array([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]),
      indices: new Uint16Array([0, 1, 2, 0, 2, 3]),
    });
  }
  return c.shadow;
}

const T = (x, y, z) => m4.translate(x, y, z);
const S = (x, y = x, z = x) => m4.scale(x, y, z);
const pack = (mats) => {
  const out = new Float32Array(mats.length * 16);
  mats.forEach((m, i) => out.set(m, i * 16));
  return out;
};

function cubic(p0, p1, p2, p3, n) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, u = 1 - t;
    const a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
    pts.push([0, 1, 2].map((k) => a * p0[k] + b * p1[k] + c * p2[k] + d * p3[k]));
  }
  return pts;
}

/* ---------- piece container ---------- */
class Piece {
  constructor() {
    this.parts = [];
  }
  add(mesh, kind, role, local = I, extra = {}) {
    this.parts.push({ mesh, kind, role, local, shapeXf: mesh.shapeXf, ...extra });
    return this;
  }
  /**
   * st: { metal:{f0,rough,heat}, stone:{ior,...}, accent:{...}, fade, morph,
   *       pre:{role:mat4}, post:{role:mat4}, hide:{role:true} }
   */
  draw(r, W, st) {
    const fade = st.fade ?? 1;
    // metals first, then stones
    for (const pass of ['metal', 'gem']) {
      for (const p of this.parts) {
        if (p.kind !== pass) continue;
        if (st.hide && st.hide[p.role]) continue;
        const pre = st.pre && st.pre[p.role];
        const post = st.post && st.post[p.role];
        let model = pre ? m4.multiply(W, pre) : W;
        model = m4.multiply(model, p.local);
        if (post) model = m4.multiply(model, post);
        if (pass === 'metal') {
          const mat = (p.role === 'accent' && st.accent) || st.metal;
          r.drawMetal(p.mesh, model, { ...mat, fade });
        } else {
          const stone = p.role === 'pave' || p.role === 'halo' ? STONES.diamond : st.stone;
          r.drawGem(p.mesh, model, {
            ...stone,
            bounces: p.bounces ?? 4,
            shapeXf: p.shapeXf,
            morph: p.morphs ? st.morph || 0 : 0,
            fade,
          });
        }
      }
    }
  }
}

/* ---------- reusable parts ---------- */
function shankFns(base = 0.15, top = 0.035, wBase = 0.19, wTop = 0.06) {
  const s = (a) => Math.pow(Math.max(0, Math.sin(a)), 3);
  return {
    thick: (a) => base + top * s(a),
    width: (a) => wBase + wTop * s(a),
  };
}

// single-row pavé on the outer surface of a band
function paveRow(R, thick, angles, stone) {
  const stones = [], beads = [];
  angles.forEach((a, i) => {
    const rd = [Math.cos(a), Math.sin(a), 0];
    const rho = R + thick(a) / 2 - 0.004;
    stones.push(m4.mul(T(rd[0] * rho, rd[1] * rho, 0), m4.alignY(rd), S(stone)));
    const step = i < angles.length - 1 ? angles[i + 1] - a : a - angles[i - 1];
    const ab = a + step / 2;
    const rb = [Math.cos(ab), Math.sin(ab), 0];
    const rr = R + thick(ab) / 2 + 0.002;
    for (const z of [-1, 1]) beads.push(m4.mul(T(rb[0] * rr, rb[1] * rr, z * stone * 1.12), S(stone * 0.34)));
  });
  return { stones, beads };
}

function clawPath(theta, g, yG, baseR, baseY) {
  const c = Math.cos(theta), s = Math.sin(theta);
  const at = (rad, y) => [rad * c, y, rad * s];
  const pts = cubic(at(baseR, baseY), at(baseR + 0.22, baseY + 0.12), at(g + 0.06, yG - 0.16), at(g + 0.03, yG - 0.01), 18);
  const hook = cubic(at(g + 0.03, yG - 0.01), at(g + 0.03, yG + 0.04), at(g * 0.97, yG + 0.07), at(g * 0.9, yG + 0.085), 6);
  return pts.concat(hook.slice(1));
}

function addClaws(piece, r, thetas, g, yG, baseR, baseY, radius = 0.034, role = 'prong') {
  const geos = [];
  const tips = [];
  for (const th of thetas) {
    const path = clawPath(th, g, yG, baseR, baseY);
    geos.push(G.tube(path, 10, (i) => {
      const t = i / (path.length - 1);
      const rr = radius * (1 - 0.18 * t);
      return [rr, rr];
    }));
    tips.push(path[path.length - 1]);
  }
  piece.add(new Mesh(r.gl, G.merge(geos)), 'metal', role);
  const sph = sphereMesh(r);
  const tipMats = tips.map((p) => m4.mul(T(...p), S(radius * 1.05)));
  const tipMesh = new Mesh(r.gl, G.sphere(10, 14));
  tipMesh.setInstances(pack(tipMats));
  piece.add(tipMesh, 'metal', role);
  return sph;
}

function ringXZ(radius, y, tubeR, seg = 64) {
  const pts = [];
  for (let i = 0; i < seg; i++) {
    const a = (i / seg) * TAU;
    pts.push([Math.cos(a) * radius, y, Math.sin(a) * radius]);
  }
  return G.tube(pts, 10, tubeR, { closed: true });
}

function outlineLoop(shape, scale, y, tubeR, seg = 90) {
  const pts = [];
  for (let i = 0; i < seg; i++) {
    const o = G.outlines[shape]((i / seg) * TAU);
    pts.push([o[0] * scale, y, o[1] * scale]);
  }
  return G.tube(pts, 10, tubeR, { closed: true });
}

// stones following an outline, tables up
function haloStones(shape, dist, y, stone, count, tilt = 0.25) {
  const fn = (t) => {
    const o = G.outlines[shape](t * TAU);
    return [o[0] * dist, y, o[1] * dist];
  };
  const { points } = G.arcLengthPoints(fn, count + 1);
  return points.slice(0, count).map(({ p }) => {
    const out = v3.norm([p[0], 0, p[2]]);
    const up = v3.norm([out[0] * tilt, 1, out[2] * tilt]);
    return m4.mul(T(...p), m4.alignY(up), S(stone));
  });
}

/* ---------- the signature solitaire ---------- */
export function buildSolitaire(r) {
  const piece = new Piece();
  const R = 1;
  const { thick, width } = shankFns();
  piece.add(new Mesh(r.gl, G.band(R, thick, width)), 'metal', 'band');
  const g = 0.4;
  const topY = R + thick(Math.PI / 2) / 2;
  const yG = topY + 0.89 * g + 0.035;
  // pavé shoulders
  const angles = [];
  for (let k = 0; k < 7; k++) angles.push(Math.PI / 2 - (0.34 + k * 0.104));
  for (let k = 0; k < 7; k++) angles.push(Math.PI / 2 + (0.34 + k * 0.104));
  const left = paveRow(R, thick, angles.slice(0, 7), 0.05);
  const right = paveRow(R, thick, angles.slice(7), 0.05);
  const paveMesh = new Mesh(r.gl, G.brilliant());
  piece.paveMats = [...left.stones, ...right.stones];
  paveMesh.setInstances(pack(piece.paveMats));
  piece.add(paveMesh, 'gem', 'pave', I, { bounces: 2 });
  const beadMesh = new Mesh(r.gl, G.sphere(8, 10));
  piece.beadMats = [...left.beads, ...right.beads];
  beadMesh.setInstances(pack(piece.beadMats));
  piece.add(beadMesh, 'metal', 'beads');
  piece.paveMesh = paveMesh;
  piece.beadMesh = beadMesh;
  // head: four claws + gallery rail
  addClaws(piece, r, [0.25, 0.75, 1.25, 1.75].map((k) => k * Math.PI), g, yG, 0.1, topY - 0.03);
  piece.add(new Mesh(r.gl, ringXZ(g * 0.8, yG - 0.24, 0.022)), 'metal', 'prong');
  // centre stone (round ↔ cushion morph)
  const gem = gemMesh(r, 'round', 'cushion');
  piece.add(gem, 'gem', 'gem', m4.mul(T(0, yG, 0), S(g)), { morphs: true, bounces: 5 });
  piece.meta = { R, yG, g, topY, gemTop: yG + 0.33 * g, centre: [0, 0.35, 0] };
  // staggered "setting" of the pavé (0..1)
  piece.setPave = (k) => {
    const n = piece.paveMats.length;
    const sc = (i) => {
      const order = i % 7; // from head outward
      const t = Math.min(1, Math.max(0, k * 1.6 - order * 0.09));
      return t * t * (3 - 2 * t);
    };
    paveMesh.setInstances(pack(piece.paveMats.map((m, i) => m4.multiply(m, S(Math.max(0.0001, sc(i)))))));
    beadMesh.setInstances(pack(piece.beadMats.map((m, i) => m4.multiply(m, S(Math.max(0.0001, sc(Math.floor(i / 2))))))));
    void n;
  };
  return piece;
}

/* ---------- other rings ---------- */
export function buildCluster(r) {
  // after reference 1: large round centre within a crown of round stones on ball claws
  const piece = new Piece();
  const R = 1;
  const { thick, width } = shankFns(0.12, 0.04, 0.17, 0.08);
  piece.add(new Mesh(r.gl, G.band(R, thick, width)), 'metal', 'band');
  const angles = [];
  for (let k = 0; k < 6; k++) angles.push(Math.PI / 2 - (0.52 + k * 0.09), Math.PI / 2 + (0.52 + k * 0.09));
  const pv = paveRow(R, thick, angles.sort(), 0.045);
  const pm = new Mesh(r.gl, G.brilliant());
  pm.setInstances(pack(pv.stones));
  piece.add(pm, 'gem', 'pave', I, { bounces: 2 });
  const bm = new Mesh(r.gl, G.sphere(8, 10));
  bm.setInstances(pack(pv.beads));
  piece.add(bm, 'metal', 'beads');
  const g = 0.36;
  const topY = R + thick(Math.PI / 2) / 2;
  const yG = topY + 0.89 * g + 0.12;
  piece.add(gemMesh(r), 'gem', 'gem', m4.mul(T(0, yG, 0), S(g)), { bounces: 5 });
  // crown of stones
  const crown = haloStones('round', 0.6, yG - 0.1, 0.135, 12, 0.7);
  const cm = new Mesh(r.gl, G.brilliant());
  cm.setInstances(pack(crown));
  piece.add(cm, 'gem', 'halo', I, { bounces: 3 });
  // ball claws between the crown stones, six around the centre
  const balls = [];
  for (let k = 0; k < 12; k++) {
    const a = ((k + 0.5) / 12) * TAU;
    balls.push(m4.mul(T(Math.cos(a) * 0.6, yG - 0.04, Math.sin(a) * 0.6), S(0.034)));
    balls.push(m4.mul(T(Math.cos(a) * 0.71, yG - 0.11, Math.sin(a) * 0.71), S(0.03)));
  }
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * TAU;
    balls.push(m4.mul(T(Math.cos(a) * g * 0.98, yG + 0.03, Math.sin(a) * g * 0.98), S(0.04, 0.05, 0.04)));
  }
  const ballMesh = new Mesh(r.gl, G.sphere(12, 16));
  ballMesh.setInstances(pack(balls));
  piece.add(ballMesh, 'metal', 'prong');
  piece.add(new Mesh(r.gl, ringXZ(0.58, yG - 0.24, 0.05)), 'metal', 'prong');
  piece.add(new Mesh(r.gl, ringXZ(0.3, yG - 0.34, 0.03)), 'metal', 'prong');
  piece.meta = { centre: [0, 0.4, 0] };
  return piece;
}

export function buildHalo(r, shape = 'cushion') {
  // after reference 2: cushion centre, diamond halo, pavé shank
  const piece = new Piece();
  const R = 1;
  const { thick, width } = shankFns(0.095, 0.02, 0.13, 0.05);
  piece.add(new Mesh(r.gl, G.band(R, thick, width)), 'metal', 'band');
  const angles = [];
  for (let k = 0; k < 9; k++) angles.push(Math.PI / 2 - (0.42 + k * 0.08), Math.PI / 2 + (0.42 + k * 0.08));
  const pv = paveRow(R, thick, angles.sort(), 0.034);
  const pm = new Mesh(r.gl, G.brilliant());
  pm.setInstances(pack(pv.stones));
  piece.add(pm, 'gem', 'pave', I, { bounces: 2 });
  const bm = new Mesh(r.gl, G.sphere(8, 10));
  bm.setInstances(pack(pv.beads));
  piece.add(bm, 'metal', 'beads');
  const g = 0.4;
  const topY = R + thick(Math.PI / 2) / 2;
  const yG = topY + 0.89 * g + 0.06;
  piece.add(gemMesh(r, shape), 'gem', 'gem', m4.mul(T(0, yG, 0), S(g)), { bounces: 5 });
  const halo = haloStones(shape, g + 0.065, yG - 0.035, 0.042, 26, 0.15);
  const hm = new Mesh(r.gl, G.brilliant());
  hm.setInstances(pack(halo));
  piece.add(hm, 'gem', 'halo', I, { bounces: 2 });
  piece.add(new Mesh(r.gl, outlineLoop(shape, g + 0.12, yG - 0.05, 0.022)), 'metal', 'prong');
  piece.add(new Mesh(r.gl, outlineLoop(shape, g + 0.02, yG - 0.06, 0.016)), 'metal', 'prong');
  piece.add(new Mesh(r.gl, ringXZ(0.26, yG - 0.3, 0.03)), 'metal', 'prong');
  // corner claws
  const claws = [0.25, 0.75, 1.25, 1.75].map((k) => {
    const o = G.outlines[shape](k * Math.PI);
    return m4.mul(T(o[0] * g * 0.98, yG + 0.02, o[1] * g * 0.98), S(0.03, 0.045, 0.03));
  });
  const cl = new Mesh(r.gl, G.sphere(10, 14));
  cl.setInstances(pack(claws));
  piece.add(cl, 'metal', 'prong');
  piece.meta = { centre: [0, 0.35, 0] };
  return piece;
}

export function buildRopeBand(r, R = 1, coil = 0.055, strand = 0.05, turns = 24) {
  const piece = new Piece();
  piece.add(new Mesh(r.gl, G.ropeBand(R, coil, strand, turns)), 'metal', 'band');
  piece.meta = { centre: [0, 0, 0] };
  return piece;
}

export function buildPaveBangle(r) {
  const piece = new Piece();
  const R = 1;
  const thick = () => 0.11, width = () => 0.2;
  piece.add(new Mesh(r.gl, G.band(R, thick, width, 220, 28)), 'metal', 'band');
  const angles = [];
  for (let k = 0; k < 30; k++) angles.push(0.25 + k * 0.088);
  const pv = paveRow(R, thick, angles, 0.04);
  const pm = new Mesh(r.gl, G.brilliant());
  pm.setInstances(pack(pv.stones));
  piece.add(pm, 'gem', 'pave', I, { bounces: 2 });
  const bm = new Mesh(r.gl, G.sphere(8, 10));
  bm.setInstances(pack(pv.beads));
  piece.add(bm, 'metal', 'beads');
  piece.meta = { centre: [0, 0, 0] };
  return piece;
}

export function buildTennis(r) {
  // a loop of collet-set round stones, tables facing outward
  const piece = new Piece();
  const R = 1, n = 30, g = 0.085;
  const stones = [], collets = [], links = [];
  for (let k = 0; k < n; k++) {
    const a = (k / n) * TAU;
    const rd = [Math.cos(a), Math.sin(a), 0];
    stones.push(m4.mul(T(rd[0] * R, rd[1] * R, 0), m4.alignY(rd), S(g)));
    collets.push(m4.mul(T(rd[0] * (R - 0.012), rd[1] * (R - 0.012), 0), m4.alignY(rd), m4.rotX(Math.PI / 2), S(g * 1.02, g * 1.02, g * 1.2)));
    const ab = a + Math.PI / n;
    const rb = [Math.cos(ab), Math.sin(ab), 0];
    links.push(m4.mul(T(rb[0] * (R - 0.04), rb[1] * (R - 0.04), 0), m4.alignY(rb), S(0.03, 0.05, 0.07)));
  }
  const sm = new Mesh(r.gl, G.brilliant());
  sm.setInstances(pack(stones));
  piece.add(sm, 'gem', 'pave', I, { bounces: 3 });
  const cm = new Mesh(r.gl, G.torus(1, 0.16, 28, 8));
  cm.setInstances(pack(collets));
  piece.add(cm, 'metal', 'band');
  const lm = new Mesh(r.gl, G.sphere(8, 12));
  lm.setInstances(pack(links));
  piece.add(lm, 'metal', 'band');
  piece.meta = { centre: [0, 0, 0] };
  return piece;
}

/* ---------- pendants & earrings (front-facing, tables toward +z) ---------- */
const FACE = (x, y, z, rotZ, g) => m4.mul(T(x, y, z), m4.rotZ(rotZ), m4.rotX(Math.PI / 2), S(g));

function chainLinks(fn, spacing = 0.072, size = 0.05) {
  const { points, length } = G.arcLengthPoints(fn, 40);
  const count = Math.max(2, Math.floor(length / spacing));
  const { points: pts } = G.arcLengthPoints(fn, count);
  void points;
  return pts.map(({ p, tangent }, i) => {
    const t = tangent;
    let b = v3.norm(v3.cross([0, 0, 1], t));
    let n = v3.cross(t, b);
    if (i % 2) [b, n] = [n, v3.scale(b, -1)];
    const m = m4.identity();
    const sx = size * 1.35, sy = size;
    m[0] = t[0] * sx; m[1] = t[1] * sx; m[2] = t[2] * sx;
    m[4] = b[0] * sy; m[5] = b[1] * sy; m[6] = b[2] * sy;
    m[8] = n[0] * size; m[9] = n[1] * size; m[10] = n[2] * size;
    m[12] = p[0]; m[13] = p[1]; m[14] = p[2];
    return m;
  });
}

function addChain(piece, r, from, spread = 2.6, height = 3.6) {
  const mats = [];
  for (const side of [-1, 1]) {
    const fn = (t) => [from[0] + side * (Math.sin(t * Math.PI * 0.5) * spread), from[1] + t * t * height * 0.55 + t * height * 0.45, from[2] - t * 0.6];
    mats.push(...chainLinks(fn));
  }
  const lm = linkMesh(r);
  const mesh = new Mesh(r.gl, G.torus(1, 0.26, 20, 8));
  void lm;
  mesh.setInstances(pack(mats));
  piece.add(mesh, 'metal', 'chain');
}

function bezelOutline(shape, g, rotZ, at) {
  // gold bezel rim around a front-facing stone
  const pts = [];
  const seg = 90;
  const R = m4.mul(T(...at), m4.rotZ(rotZ), m4.rotX(Math.PI / 2));
  for (let i = 0; i < seg; i++) {
    const o = G.outlines[shape]((i / seg) * TAU);
    pts.push(m4.transformPoint(R, [o[0] * (g + 0.018), -0.02, o[1] * (g + 0.018)]));
  }
  return G.tube(pts, 10, 0.024, { closed: true });
}

export function buildDropPendant(r, shape = 'pear', stone = 'diamond', halo = false) {
  const piece = new Piece();
  const g = shape === 'pear' ? 0.42 : 0.4;
  const rz = shape === 'pear' ? Math.PI / 2 : 0;
  const c = [0, -0.2, 0];
  piece.add(gemMesh(r, shape), 'gem', 'gem', FACE(c[0], c[1], c[2], rz, g), { bounces: 5 });
  piece.add(new Mesh(r.gl, bezelOutline(shape, g, rz, c)), 'metal', 'prong');
  if (halo) {
    const hs = haloStones(shape, g + 0.075, 0, 0.04, 28, 0).map((m) => m4.mul(T(...c), m4.rotZ(rz), m4.rotX(Math.PI / 2), m));
    const hm = new Mesh(r.gl, G.brilliant());
    hm.setInstances(pack(hs));
    piece.add(hm, 'gem', 'halo', I, { bounces: 2 });
    piece.add(new Mesh(r.gl, bezelOutline(shape, g + 0.12, rz, c)), 'metal', 'prong');
  }
  const top = shape === 'pear' ? c[1] + g * 1.22 + 0.03 : c[1] + g * (halo ? 1.22 : 1.07);
  const bail = new Mesh(r.gl, G.torus(0.09, 0.022, 40, 10));
  piece.add(bail, 'metal', 'prong', m4.mul(T(0, top + 0.09, -0.02), m4.rotY(Math.PI / 2)));
  addChain(piece, r, [0, top + 0.17, -0.02]);
  piece.meta = { centre: [0, -0.1, 0] };
  return piece;
}

export function buildRiviere(r) {
  const piece = new Piece();
  const stones = [], cups = [];
  const n = 19;
  const fn = (t) => {
    const x = (t - 0.5) * 3.4;
    return [x, -1.25 + 0.42 * x * x, -0.18 * x * x];
  };
  const { points } = G.arcLengthPoints(fn, n);
  points.forEach(({ p }, i) => {
    const d = Math.abs(i - (n - 1) / 2) / ((n - 1) / 2);
    const g = 0.17 - d * 0.075;
    stones.push(m4.mul(T(...p), m4.rotX(Math.PI / 2 - 0.2), S(g)));
    cups.push(m4.mul(T(p[0], p[1], p[2] - 0.015), m4.rotX(-0.2), S(g * 1.03, g * 1.03, g * 1.1)));
  });
  const sm = new Mesh(r.gl, G.brilliant());
  sm.setInstances(pack(stones));
  piece.add(sm, 'gem', 'pave', I, { bounces: 3 });
  const cm = new Mesh(r.gl, G.torus(1, 0.1, 32, 8));
  cm.setInstances(pack(cups));
  piece.add(cm, 'metal', 'band');
  const first = points[0].p, last = points[n - 1].p;
  const chain = [];
  for (const [end, side] of [[first, -1], [last, 1]]) {
    const f = (t) => [end[0] + side * Math.sin(t * Math.PI * 0.45) * 0.7, end[1] + t * 3.0, end[2] - t * 0.4];
    chain.push(...chainLinks(f));
  }
  const ch = new Mesh(r.gl, G.torus(1, 0.26, 20, 8));
  ch.setInstances(pack(chain));
  piece.add(ch, 'metal', 'chain');
  piece.meta = { centre: [0, -0.6, 0] };
  return piece;
}

function earring(piece, r, x, kind) {
  const studY = 0.95;
  // stud
  const sg = kind === 'stud' ? 0.27 : 0.14;
  const sy = kind === 'stud' ? 0 : studY;
  piece.add(gemMesh(r), 'gem', kind === 'emerald' ? 'pave' : 'gem', FACE(x, sy, 0, 0, sg), { bounces: 4 });
  const claws = [0.25, 0.75, 1.25, 1.75].map((k) => {
    const a = k * Math.PI;
    return m4.mul(T(x + Math.cos(a) * sg * 0.96, sy + Math.sin(a) * sg * 0.96, 0.03), S(sg * 0.12));
  });
  const cm = new Mesh(r.gl, G.sphere(10, 12));
  cm.setInstances(pack(claws));
  piece.add(cm, 'metal', 'prong');
  piece.add(new Mesh(r.gl, bezelOutline('round', sg * 0.94, 0, [x, sy, -0.01])), 'metal', 'prong');
  if (kind === 'stud') return;
  // link
  const link = new Mesh(r.gl, G.torus(0.06, 0.016, 32, 8));
  piece.add(link, 'metal', 'prong', m4.mul(T(x, studY - sg - 0.07, 0), m4.rotY(Math.PI / 2)));
  if (kind === 'drop') {
    const g = 0.36, c = [x, studY - sg - 0.14 - g * 1.2, 0];
    piece.add(gemMesh(r, 'pear'), 'gem', 'gem', FACE(c[0], c[1], c[2], -Math.PI / 2 + Math.PI, g), { bounces: 5 });
    piece.add(new Mesh(r.gl, bezelOutline('pear', g, Math.PI / 2, c)), 'metal', 'prong');
  } else {
    const g = 0.3, c = [x, studY - sg - 0.2 - g * 1.25, 0];
    piece.add(gemMesh(r, 'cushion'), 'gem', 'gem', FACE(c[0], c[1], c[2], 0, g), { bounces: 5 });
    const hs = haloStones('cushion', g + 0.06, 0, 0.034, 24, 0).map((m) => m4.mul(T(...c), m4.rotX(Math.PI / 2), m));
    const hm = new Mesh(r.gl, G.brilliant());
    hm.setInstances(pack(hs));
    piece.add(hm, 'gem', 'halo', I, { bounces: 2 });
    piece.add(new Mesh(r.gl, bezelOutline('cushion', g + 0.1, 0, c)), 'metal', 'prong');
    piece.add(new Mesh(r.gl, bezelOutline('cushion', g, 0, c)), 'metal', 'prong');
  }
}

export function buildEarrings(r, kind = 'drop') {
  const piece = new Piece();
  earring(piece, r, -0.62, kind);
  earring(piece, r, 0.62, kind);
  piece.meta = { centre: [0, kind === 'stud' ? 0 : 0.2, 0] };
  return piece;
}

/* ---------- registry used by the site ---------- */
export const BUILDERS = {
  solitaire: (r) => buildSolitaire(r),
  cluster: (r) => buildCluster(r),
  halo: (r) => buildHalo(r, 'cushion'),
  rope: (r) => buildRopeBand(r),
  dropPendant: (r) => buildDropPendant(r, 'pear', 'diamond'),
  haloPendant: (r) => buildDropPendant(r, 'cushion', 'emerald', true),
  riviere: (r) => buildRiviere(r),
  dropEarrings: (r) => buildEarrings(r, 'drop'),
  studs: (r) => buildEarrings(r, 'stud'),
  emeraldDrops: (r) => buildEarrings(r, 'emerald'),
  tennis: (r) => buildTennis(r),
  ropeBangle: (r) => buildRopeBand(r, 1, 0.06, 0.052, 30),
  paveBangle: (r) => buildPaveBangle(r),
};

export function materialState(variant) {
  const v = VARIANTS[variant] || VARIANTS.champagne;
  return { metal: { ...METALS[v.metal] }, stone: { ...STONES[v.stone] }, morph: v.morph };
}

export function blendState(a, b, t) {
  const L = (x, y) => x + (y - x) * t;
  const LA = (x, y) => x.map((v, i) => L(v, y[i]));
  return {
    metal: { f0: LA(a.metal.f0, b.metal.f0), rough: L(a.metal.rough, b.metal.rough), heat: 0 },
    stone: {
      ior: L(a.stone.ior, b.stone.ior),
      disp: L(a.stone.disp, b.stone.disp),
      absorb: LA(a.stone.absorb, b.stone.absorb),
      body: LA(a.stone.body, b.stone.body),
    },
    morph: L(a.morph, b.morph),
  };
}
