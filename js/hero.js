// ARDEM — the signature hero: a drop of molten gold drawn into a thread,
// turned into a ring, set with a stone. Driven by scroll progress (0..1).
import { Renderer, Mesh } from './renderer.js';
import { buildSolitaire, materialState } from './jewels.js';
import * as G from './geometry.js';
import { m4, v3, smooth, clamp, lerp, mix3, easeOutCubic } from './math.js';

const TAU = Math.PI * 2;
const N = 300;       // samples along the thread
const RAD = 16;      // cross-section segments
const D0 = [0, 0.32, 0];

const curveA = (u, t) => [
  D0[0] + Math.sin(u * 2.4) * 0.6 * u,
  D0[1] - u * 2.4,
  D0[2] + Math.sin(u * 3.1 + t * 0.5) * 0.3 * u,
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
    this.droplet = new Mesh(r.gl, G.sphere(40, 56));
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

  setProgress(p) {
    this.target = clamp(p);
  }
  setPointer(x, y) {
    this.pointer = [x, y];
  }

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

  ringWorld(spin, tilt, y) {
    return m4.mul(m4.translate(0, y, 0), m4.rotY(spin), m4.rotX(tilt));
  }

  frame(now) {
    const r = this.r;
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    const t = (now - this.t0) / 1000;
    r.time = t;
    // ease toward the scroll target
    this.p += (this.target - this.p) * (1 - Math.exp(-dt * (this.reduced ? 60 : 5.5)));
    if (Math.abs(this.target - this.p) < 1e-4) this.p = this.target;
    const p = this.p;

    // ---- stage weights ----
    const appear = this.reduced ? 1 : easeOutCubic(t / 2.6);
    const stretch = smooth(0.05, 0.22, p);
    const flow = smooth(0.17, 0.4, p);
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
    const fov = 0.6;
    const camA = [0, 0.32, 6.0];
    const camB = [0, 0.5, 7.8];
    const camC = [0, 0.55, 6.6];
    const camD = [0, 0.75, 6.0];
    const camE = [0, 0.35, 9.8];
    let cam = camA;
    cam = mix3(cam, camB, smooth(0.08, 0.3, p));
    cam = mix3(cam, camC, smooth(0.45, 0.66, p));
    cam = mix3(cam, camD, smooth(0.74, 0.86, p));
    cam = mix3(cam, camE, reveal);
    const tgtY = lerp(lerp(0.32, 0.0, smooth(0.08, 0.3, p)), 0.25, smooth(0.5, 0.8, p)) * (1 - reveal);
    // gentle pointer parallax
    const px = this.pointer[0] * 0.25 * (this.reduced ? 0 : 1);
    const py = this.pointer[1] * 0.15 * (this.reduced ? 0 : 1);
    const dist = cam[2] * fit;
    r.cam = { pos: [cam[0] + px, cam[1] - py, dist], target: [0, tgtY, 0], fov };

    // ---- ring placement ----
    const spin = 0.4 + p * 0.45 + (this.reduced ? 0 : (t * 0.22) % TAU) * smooth(0.78, 0.95, p);
    const tilt = lerp(0.12, 0.32, smooth(0.6, 0.85, p));
    const ndcY = aspect < 0.8 ? 0.42 : 0.33;
    const finalY = ndcY * dist * Math.tan(fov / 2) - 0.45;
    const ringY = lerp(0, finalY, reveal) - 0.05 * (1 - reveal);
    const RW = this.ringWorld(spin, tilt, ringY);
    const centre = m4.transformPoint(RW, [0, 0, 0]);

    // ---- environment ----
    r.env.mix = reveal * 0.72;
    r.env.rot = p * 2.4 + t * 0.03;
    r.env.exposure = 1.0 + 0.1 * reveal;
    r.env.keyBoost = 1;

    r.resize(this.canvas.clientWidth, this.canvas.clientHeight);
    r.begin([0, 0, 0, 0]);

    // gold dust in the dark
    r.dust(260, (1 - reveal) * 0.9 * appear);

    const metal = { ...this.mat.metal, heat };

    // ---- droplet ----
    const dropScale = 0.3 * appear * Math.pow(1 - stretch, 0.55) * (1 + 0.02 * Math.sin(t * 1.4));
    if (dropScale > 0.01) {
      const W = m4.mul(m4.translate(...D0), m4.scale(dropScale));
      r.drawMetal(this.droplet, W, { ...metal, heat: Math.max(heat, 0.95), wobble: 1, drip: stretch * 1.3 });
      r.sprite(D0, 1.0 * appear * (0.85 + 0.15 * Math.sin(t * 1.4)), 0.42 * appear * (1 - stretch * 0.6), { mode: 1, color: [1, 0.5, 0.14] });
    }

    // ---- thread ----
    if (!swapped && stretch > 0.001) {
      this.updateThread(p, t, { stretch, flow, orbit, coil, tight }, RW, centre);
      r.drawMetal(this.thread, m4.identity(), metal);
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
      // seating flash + twinkles
      const top = m4.transformPoint(RW, [0, meta.gemTop - 0.02 + dy, 0]);
      const seat = Math.exp(-Math.pow((p - 0.9) / 0.018, 2));
      r.sprite(top, 0.6, seat * 1.15, { rotate: 0.3 });
      if (drop > 0.99) {
        for (let i = 0; i < 3; i++) {
          const a = i * 2.1 + 0.4;
          const lp = [Math.cos(a) * meta.g * 0.45, meta.gemTop - 0.03, Math.sin(a) * meta.g * 0.45];
          const wp = m4.transformPoint(RW, lp);
          const tw = Math.pow(Math.max(0, Math.sin(spin * 3.0 + i * 2.4 + t * 0.7)), 24);
          r.sprite(wp, 0.38, tw * (1.1 - reveal * 0.6), { rotate: 0.25 + i * 0.4 });
        }
      }
    }

    if (this.onFrame) this.onFrame({ p, reveal, heat, appear, t, project: (pt) => r.project(pt), centre });
  }

  updateThread(p, t, w, RW, centre) {
    const { stretch, flow, orbit, coil, tight } = w;
    const ext = Math.max(0.03, stretch);
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
    let fr = null;
    if (!centreMode) fr = G.frames(pts, false);
    const axis = v3.norm(m4.transformPoint(RW, [0, 0, 1]).map((v, k) => v - centre[k]));
    // radii
    const baseR = lerp(lerp(lerp(0.075, 0.042, flow), 0.05, orbit), 0.056, coil);
    const ra = lerp(baseR, 0.08, tight);
    const rb = lerp(baseR, 0.105, tight);
    const P = this.buf.positions, Nn = this.buf.normals;
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
        // keep the radial direction in the ring plane once the coil tightens
        rad = v3.sub(rad, v3.scale(axis, v3.dot(rad, axis) * tight));
        n = v3.norm(rad);
        b = v3.cross(T, n);
      } else {
        n = fr.N[i];
        b = fr.B[i];
      }
      // tapered ends while the thread is open
      const taper = Math.min(1, u / 0.05) * Math.min(1, (1 - u) / (0.1 + 0.15 * (1 - flow)));
      const open = 1 - orbit;
      const tp = lerp(1, Math.pow(Math.max(0, taper), 0.7), open);
      const swell = 1 + 0.25 * Math.sin(u * 23 + t * 1.3) * (1 - tight) * 0.4;
      const a1 = ra * tp * swell, b1 = rb * tp * swell;
      for (let j = 0; j < RAD; j++) {
        const ang = (j / RAD) * TAU;
        const ca = Math.cos(ang), sa = Math.sin(ang);
        P[k] = c[0] + n[0] * a1 * ca + b[0] * b1 * sa;
        P[k + 1] = c[1] + n[1] * a1 * ca + b[1] * b1 * sa;
        P[k + 2] = c[2] + n[2] * a1 * ca + b[2] * b1 * sa;
        let nx = n[0] * b1 * ca + b[0] * a1 * sa;
        let ny = n[1] * b1 * ca + b[1] * a1 * sa;
        let nz = n[2] * b1 * ca + b[2] * a1 * sa;
        const l = Math.hypot(nx, ny, nz) || 1;
        Nn[k] = nx / l; Nn[k + 1] = ny / l; Nn[k + 2] = nz / l;
        k += 3;
      }
    }
    this.thread.update(P, Nn);
  }
}
