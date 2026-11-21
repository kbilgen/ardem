// ARDEM — the signature hero: gold poured from a crucible becomes a thread,
// the thread is turned into a ring, the ring is set with a stone.
// Driven by scroll progress (0..1).
import { Renderer, Mesh } from './renderer.js?v=20261121c';
import { buildSolitaire, materialState } from './jewels.js?v=20261121c';
import * as G from './geometry.js?v=20261121c';
import { m4, v3, smooth, clamp, lerp, mix3, easeOutCubic } from './math.js?v=20261121c';

const TAU = Math.PI * 2;
const N = 300;       // samples along the thread
const RAD = 16;      // cross-section segments
const CRUCIBLE = [-0.95, 1.2, 0];
const LIP_LOCAL = [0.61, 0.47, 0];

const hash = (i) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// the pour: from the crucible lip, falling under gravity, with a little liquid sway
const pourCurve = (lip) => (u, t) => [
  lip[0] + 0.3 * u - 0.08 * u * u + 0.035 * Math.sin(u * 9 + t * 2.1) * u,
  lip[1] - 3.9 * Math.pow(u, 1.45),
  lip[2] + 0.05 * Math.sin(u * 6.5 - t * 1.6) * u,
];
const curveB = (u, t) => [
  (u - 0.5) * 9.4,
  0.55 * Math.sin(u * 7.0 + t * 0.55) + 0.2 * Math.sin(u * 15 - t * 0.8) - 0.15,
  1.1 * Math.cos(u * 4.4 + t * 0.35) - 0.9,
];
// ring-space curves (ring centre at origin, XY plane, start at the top)
const curveD = (u, t) => {
  const a = u * TAU + Math.PI / 2;
  const rr = 1.85 + 0.35 * Math.sin(3 * a + t * 0.6);
  return [Math.cos(a) * rr, Math.sin(a) * rr, 0.65 * Math.sin(2 * a + t * 0.4)];
};
const curveC = (u) => {
  const a = u * TAU + Math.PI / 2, q = 9;
  const rr = 1 + 0.2 * Math.cos(q * a);
  return [Math.cos(a) * rr, Math.sin(a) * rr, 0.2 * Math.sin(q * a)];
};
const curveE = (u) => {
  const a = u * TAU + Math.PI / 2;
  return [Math.cos(a), Math.sin(a), 0];
};

export class Hero {
  constructor(canvas, { onFrame } = {}) {
    this.canvas = canvas;
    this.r = new Renderer(canvas, { transparent: true, dprCap: 1.75 });
    const r = this.r;
    this.onFrame = onFrame;
    this.crucible = new Mesh(r.gl, G.crucible());
    this.pool = new Mesh(r.gl, G.pool());
    this.drop = new Mesh(r.gl, G.sphere(24, 32));
    const n = N * RAD;
    this.buf = { positions: new Float32Array(n * 3), normals: new Float32Array(n * 3) };
    this.thread = new Mesh(r.gl, { ...this.buf, indices: G.tubeIndices(N, RAD, false) }, { dynamic: true });
    this.ring = buildSolitaire(r);
    this.mat = materialState('champagne');
    this.pts = Array.from({ length: N }, () => [0, 0, 0]);
    this.target = 0;
    this.p = 0;
    this.t0 = performance.now();
    this.last = this.t0;
    this.running = false;
    this.lastPave = -1;
    this.pointer = [0, 0];
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  setProgress(p) { this.target = clamp(p); }
  setPointer(x, y) { this.pointer = [x, y]; }
  resize() {
    const b = this.canvas.getBoundingClientRect();
    this.r.resize(b.width, b.height);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    const loop = (now) => {
      if (!this.running) return;
      this.frame(now);
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }
  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  crucibleWorld(tilt, rise) {
    return m4.mul(
      m4.translate(CRUCIBLE[0] * (this.cx ?? 1) - rise * 0.35, CRUCIBLE[1] + rise, CRUCIBLE[2]),
      m4.rotX(0.3), m4.rotY(-0.42), m4.rotZ(-tilt), m4.scale(0.95),
    );
  }
  ringWorld(spin, tilt, y) {
    return m4.mul(m4.translate(0, y, 0), m4.rotY(spin), m4.rotX(tilt));
  }

  frame(now) {
    const r = this.r;
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    const t = (now - this.t0) / 1000;
    r.time = t;
    this.p += (this.target - this.p) * (1 - Math.exp(-dt * (this.reduced ? 60 : 5.5)));
    if (Math.abs(this.target - this.p) < 1e-4) this.p = this.target;
    const p = this.p;

    // ---- stage weights ----
    const appear = this.reduced ? 1 : easeOutCubic(t / 2.4);
    const tiltIn = smooth(0.0, 0.07, p);       // crucible tips forward
    const pour = smooth(0.025, 0.15, p);       // the stream falls from the lip
    const release = smooth(0.15, 0.26, p);     // crucible withdraws, the stream is free
    const flow = smooth(0.19, 0.4, p);         // the stream becomes a floating thread
    const orbit = smooth(0.38, 0.54, p);
    const coil = smooth(0.52, 0.64, p);
    const tight = smooth(0.62, 0.73, p);
    const heat = 1 - smooth(0.5, 0.78, p);
    const swapped = p > 0.735;
    const prongs = smooth(0.735, 0.8, p);
    const pave = smooth(0.75, 0.86, p);
    const drop = smooth(0.8, 0.9, p);
    const reveal = smooth(0.9, 0.985, p);

    // ---- camera (portrait screens pull back) ----
    const aspect = r.width / r.height || 1;
    const fit = clamp(0.62 / aspect, 1, 2.1);
    this.cx = clamp(aspect / 1.3, 0.5, 1); // narrow screens: bring the crucible toward the centre
    const fov = 0.6;
    let cam = [0, 0.5, 6.7];
    cam = mix3(cam, [0, 0.5, 7.8], smooth(0.12, 0.32, p));
    cam = mix3(cam, [0, 0.55, 6.6], smooth(0.45, 0.66, p));
    cam = mix3(cam, [0, 0.75, 6.0], smooth(0.74, 0.86, p));
    cam = mix3(cam, [0, 0.35, 9.8], reveal);
    const tgtY = lerp(lerp(0.5, 0.0, smooth(0.12, 0.32, p)), 0.25, smooth(0.5, 0.8, p)) * (1 - reveal);
    const pm = this.reduced ? 0 : 1;
    const dist = cam[2] * fit;
    r.cam = { pos: [cam[0] + this.pointer[0] * 0.25 * pm, cam[1] - this.pointer[1] * 0.15 * pm, dist], target: [0, tgtY, 0], fov };

    // ---- ring placement ----
    const spin = 0.4 + p * 0.45 + (this.reduced ? 0 : (t * 0.22) % TAU) * smooth(0.78, 0.95, p);
    const rTilt = lerp(0.12, 0.32, smooth(0.6, 0.85, p));
    const ndcY = aspect < 0.8 ? 0.42 : 0.33;
    const finalY = ndcY * dist * Math.tan(fov / 2) - 0.45;
    const RW = this.ringWorld(spin, rTilt, lerp(0, finalY, reveal) - 0.05 * (1 - reveal));
    const centre = m4.transformPoint(RW, [0, 0, 0]);

    // ---- environment ----
    r.env.mix = reveal * 0.72;
    r.env.rot = p * 2.4 + t * 0.03;
    r.env.exposure = 1.0 + 0.1 * reveal;
    r.env.keyBoost = 1;
    r.resize(this.canvas.clientWidth, this.canvas.clientHeight);
    r.begin([0, 0, 0, 0]);
    r.dust(220, (1 - reveal) * 0.7 * appear * (0.4 + 0.6 * flow));

    const metal = { ...this.mat.metal, heat };

    // ---- crucible ----
    const tilt = lerp(lerp(0.32, 1.02, tiltIn), 0.25, release);
    const CW = this.crucibleWorld(tilt, release * release * 2.6);
    const fadeC = appear * (1 - smooth(0.17, 0.27, p));
    const poolC = m4.transformPoint(CW, [0.02, 0.44, 0]);
    const glowK = (0.75 + 0.25 * Math.sin(t * 2.3) * Math.sin(t * 1.3)) * fadeC;
    // lip position frozen at full tilt so the stream stays put while the crucible withdraws
    const lip = m4.transformPoint(this.crucibleWorld(lerp(0.32, 1.02, tiltIn), 0), LIP_LOCAL);
    if (fadeC > 0.005) {
      // halo first, so the opaque crucible sits in front of its own glow
      r.sprite(poolC, 1.6, 0.42 * glowK, { mode: 1, color: [1, 0.42, 0.1] });
      r.drawMetal(this.crucible, CW, {
        f0: [0.035, 0.033, 0.03], rough: 0.62, heat: 0, fade: fadeC,
        albedo: [0.05, 0.044, 0.04], plMask: 1, plPos: [poolC[0], poolC[1] + 0.18, poolC[2] + 0.15],
        plCol: [5.0 * glowK, 1.9 * glowK, 0.55 * glowK],
      });
      // molten surface, kept roughly level as the crucible tips
      const PW = m4.mul(CW, m4.translate(0.0, 0.4 - tiltIn * 0.06, 0), m4.rotZ(tilt * 0.55), m4.scale(0.98, 1, 0.98));
      r.drawMetal(this.pool, PW, { ...metal, heat: 1, fade: fadeC });
      r.sprite(m4.transformPoint(CW, [0.05, 0.62, 0]), 0.45, 0.22 * glowK, { mode: 1, color: [1, 0.55, 0.18] });
    }

    // ---- the stream / thread ----
    const pc = pourCurve(lip);
    if (!swapped && pour > 0.001) {
      this.updateThread(t, { pour, release, flow, orbit, coil, tight }, RW, centre, pc);
      r.drawMetal(this.thread, m4.identity(), metal);
      // leading drop while the stream is still falling
      if (pour < 0.999) {
        const tip = pc(pour, t);
        const W = m4.mul(m4.translate(...tip), m4.scale(0.07, 0.095, 0.07));
        r.drawMetal(this.drop, W, { ...metal, heat: 1, wobble: 0.6 });
        r.sprite(tip, 0.32, 0.35, { mode: 1, color: [1, 0.5, 0.14] });
      }
      r.sprite(lip, 0.55, 0.42 * (1 - release) * pour, { mode: 1, color: [1, 0.55, 0.16] });
    }

    // ---- embers rising from the pour ----
    const emberK = fadeC * (0.35 + 0.65 * pour) * (this.reduced ? 0 : 1);
    if (emberK > 0.01) {
      for (let i = 0; i < 18; i++) {
        const life = (t * (0.32 + hash(i) * 0.25) + hash(i + 7)) % 1;
        const fromStream = i % 3 !== 0 && pour > 0.05;
        const base = fromStream ? pc(hash(i + 3) * pour * 0.7, t) : poolC;
        const pos = [
          base[0] + (hash(i + 11) - 0.35) * 0.9 * life,
          base[1] + life * (0.6 + hash(i + 5) * 0.9) - life * life * 0.25,
          base[2] + (hash(i + 13) - 0.5) * 0.5 * life,
        ];
        const k = Math.pow(1 - life, 1.6) * Math.min(1, life * 8) * emberK;
        r.sprite(pos, 0.035 + hash(i + 2) * 0.03, k * 1.3, { mode: 1, color: [1, 0.6 + hash(i) * 0.2, 0.2] });
      }
    }

    // ---- the ring ----
    if (swapped) {
      const pv = Math.round(pave * 40) / 40;
      if (pv !== this.lastPave) {
        this.ring.setPave(pv);
        this.lastPave = pv;
      }
      const meta = this.ring.meta;
      const dy = (1 - easeOutCubic(drop)) * 3.4;
      const gemSpin = (1 - easeOutCubic(drop)) * 2.6;
      const k = Math.max(0.0001, prongs);
      this.ring.draw(r, RW, {
        metal,
        stone: this.mat.stone,
        morph: 0,
        pre: {
          gem: m4.mul(m4.translate(0, dy, 0), m4.rotY(gemSpin)),
          prong: m4.mul(m4.translate(0, meta.topY, 0), m4.scale(1, k, 1), m4.translate(0, -meta.topY, 0)),
        },
        hide: { gem: drop <= 0.001 },
      });
      const top = m4.transformPoint(RW, [0, meta.gemTop - 0.02 + dy, 0]);
      const seat = Math.exp(-Math.pow((p - 0.9) / 0.018, 2));
      r.sprite(top, 0.6, seat * 1.15, { rotate: 0.3 });
      if (drop > 0.99) {
        for (let i = 0; i < 3; i++) {
          const a = i * 2.1 + 0.4;
          const wp = m4.transformPoint(RW, [Math.cos(a) * meta.g * 0.45, meta.gemTop - 0.03, Math.sin(a) * meta.g * 0.45]);
          const tw = Math.pow(Math.max(0, Math.sin(spin * 3.0 + i * 2.4 + t * 0.7)), 24);
          r.sprite(wp, 0.38, tw * (1.1 - reveal * 0.6), { rotate: 0.25 + i * 0.4 });
        }
      }
    }

    if (this.onFrame) this.onFrame({ p, reveal, heat, appear, t, project: (pt) => r.project(pt), centre });
  }

  updateThread(t, w, RW, centre, curveA) {
    const { pour, release, flow, orbit, coil, tight } = w;
    const ext = Math.max(0.02, pour);
    const pts = this.pts;
    const xf = (q) => m4.transformPoint(RW, q);
    for (let i = 0; i < N; i++) {
      const u = i / (N - 1);
      let P = curveA(u * ext, t);
      if (flow > 0) P = mix3(P, curveB(u, t), flow);
      if (orbit > 0) P = mix3(P, xf(curveD(u, t)), orbit);
      if (coil > 0) P = mix3(P, xf(curveC(u)), coil);
      if (tight > 0) P = mix3(P, xf(curveE(u)), tight);
      pts[i][0] = P[0]; pts[i][1] = P[1]; pts[i][2] = P[2];
    }
    const closed = orbit > 0.98;
    const centreMode = orbit > 0.5;
    const fr = centreMode ? null : G.frames(pts, false);
    const axis = v3.norm(m4.transformPoint(RW, [0, 0, 1]).map((v, k) => v - centre[k]));
    const baseR = lerp(lerp(lerp(0.068, 0.05, flow), 0.052, orbit), 0.056, coil);
    const ra = lerp(baseR, 0.08, tight);
    const rb = lerp(baseR, 0.105, tight);
    const P = this.buf.positions, Nn = this.buf.normals;
    const freeTop = Math.max(release, flow);
    let k = 0;
    for (let i = 0; i < N; i++) {
      const u = i / (N - 1);
      const c = pts[i];
      let n, b;
      if (centreMode) {
        const prev = pts[closed ? (i - 1 + N - 1) % (N - 1) : Math.max(0, i - 1)];
        const next = pts[closed ? (i + 1) % (N - 1) : Math.min(N - 1, i + 1)];
        const T = v3.norm(v3.sub(next, prev));
        let rad = v3.sub(c, centre);
        rad = v3.sub(rad, v3.scale(T, v3.dot(rad, T)));
        rad = v3.sub(rad, v3.scale(axis, v3.dot(rad, axis) * tight));
        n = v3.norm(rad);
        b = v3.cross(T, n);
      } else {
        n = fr.N[i];
        b = fr.B[i];
      }
      // while pouring, the top stays attached to the lip and the stream narrows as it falls
      const fall = lerp(1.25 - 0.55 * u, 1, freeTop);
      const topT = lerp(1, Math.min(1, u / 0.05), freeTop);
      const tipT = Math.min(1, (1 - u) / (0.08 + 0.15 * (1 - flow)));
      const taper = topT * tipT;
      const tp = lerp(1, Math.pow(Math.max(0, taper), 0.7), 1 - orbit) * fall;
      const swell = 1 + 0.1 * Math.sin(u * 23 + t * 2.3) * (1 - tight);
      const a1 = ra * tp * swell, b1 = rb * tp * swell;
      for (let j = 0; j < RAD; j++) {
        const ang = (j / RAD) * TAU;
        const ca = Math.cos(ang), sa = Math.sin(ang);
        P[k] = c[0] + n[0] * a1 * ca + b[0] * b1 * sa;
        P[k + 1] = c[1] + n[1] * a1 * ca + b[1] * b1 * sa;
        P[k + 2] = c[2] + n[2] * a1 * ca + b[2] * b1 * sa;
        const nx = n[0] * b1 * ca + b[0] * a1 * sa;
        const ny = n[1] * b1 * ca + b[1] * a1 * sa;
        const nz = n[2] * b1 * ca + b[2] * a1 * sa;
        const l = Math.hypot(nx, ny, nz) || 1;
        Nn[k] = nx / l; Nn[k + 1] = ny / l; Nn[k + 2] = nz / l;
        k += 3;
      }
    }
    this.thread.update(P, Nn);
  }
}
