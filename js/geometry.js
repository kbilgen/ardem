// ARDEM — procedural jewelry geometry (gem cuts, bands, claws, tubes, chains)
import { v3 } from './math.js?v=20261121d';

const TAU = Math.PI * 2;

/* ---------- gem outlines (unit girdle) ---------- */
export const outlines = {
  round: (t) => [Math.cos(t), Math.sin(t)],
  // cushion: superellipse with corners at radius 1, slightly elongated along z
  cushion: (t) => {
    const n = 3.4;
    const c = Math.cos(t), s = Math.sin(t);
    const r = Math.pow(Math.pow(Math.abs(c), n) + Math.pow(Math.abs(s), n), -1 / n);
    const k = 1 / Math.pow(2 * Math.pow(Math.SQRT1_2, n), -1 / n); // normalise corner radius to 1
    return [c * r * k * 0.94, s * r * k * 1.06];
  },
  // pear: rounded end at -x, point at +x
  pear: (t) => {
    const c = Math.cos(t), s = Math.sin(t);
    if (c <= 0) return [c * 0.78, s * 0.78];
    const taper = 1 - 0.62 * Math.pow(c, 1.6);
    return [c * 1.22, s * 0.78 * taper];
  },
  oval: (t) => [Math.cos(t) * 1.18, Math.sin(t) * 0.86],
};

function pushRing(pos, morph, n, off, k, y, shapeA, shapeB) {
  const start = pos.length / 3;
  for (let i = 0; i < n; i++) {
    const t = off + (i / n) * TAU;
    const a = shapeA(t), b = shapeB(t);
    pos.push(a[0] * k, y, a[1] * k);
    morph.push(b[0] * k, y, b[1] * k);
  }
  return { start, n, off };
}

// stitch two rings of possibly different counts by walking their angles
function stitch(idx, A, B) {
  let i = 0, j = 0;
  const angA = (k) => A.off + (k / A.n) * TAU;
  const angB = (k) => B.off + (k / B.n) * TAU;
  while (i < A.n || j < B.n) {
    const a0 = A.start + (i % A.n), b0 = B.start + (j % B.n);
    const nextA = i < A.n ? angA(i + 1) : Infinity;
    const nextB = j < B.n ? angB(j + 1) : Infinity;
    if (nextA <= nextB) {
      idx.push(a0, b0, A.start + ((i + 1) % A.n));
      i++;
    } else {
      idx.push(a0, b0, B.start + ((j + 1) % B.n));
      j++;
    }
  }
}

function fan(idx, center, R, reverse) {
  for (let i = 0; i < R.n; i++) {
    const a = R.start + i, b = R.start + ((i + 1) % R.n);
    if (reverse) idx.push(center, b, a); else idx.push(center, a, b);
  }
}

/**
 * Brilliant-style faceted gem. Units: girdle radius 1, table up (+y).
 * Returns positions and a morph target (second outline) with identical topology.
 */
export function brilliant(shapeA = outlines.round, shapeB = shapeA) {
  const pos = [], morph = [], idx = [];
  const s = TAU / 16;
  const yT = 0.33, yG = 0.03;
  // table centre
  pos.push(0, yT, 0); morph.push(0, yT, 0);
  const T = pushRing(pos, morph, 8, 0, 0.56, yT, shapeA, shapeB);
  const S = pushRing(pos, morph, 8, s, 0.8, yG + 0.3 * 0.42, shapeA, shapeB);
  const G1 = pushRing(pos, morph, 16, s * 0.5, 1, yG, shapeA, shapeB);
  const G2 = pushRing(pos, morph, 16, s * 0.5, 1, -yG, shapeA, shapeB);
  const P = pushRing(pos, morph, 8, s, 0.42, -yG - 0.86 * 0.58, shapeA, shapeB);
  const culet = pos.length / 3;
  pos.push(0, -0.89, 0); morph.push(0, -0.89, 0);
  fan(idx, 0, T);
  stitch(idx, T, S);
  stitch(idx, S, G1);
  stitch(idx, G1, G2);
  stitch(idx, G2, P);
  fan(idx, culet, P, true);
  return {
    positions: new Float32Array(pos),
    morph: new Float32Array(morph),
    normals: new Float32Array(pos.length), // gem shader derives facet normals
    indices: new Uint16Array(idx),
  };
}

/* ---------- swept tubes ---------- */

// parallel-transport frames along a polyline
export function frames(pts, closed = false) {
  const n = pts.length;
  const T = [], N = [], B = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    let t = v3.sub(b, a);
    if (closed) t = v3.sub(pts[(i + 1) % n], pts[(i - 1 + n) % n]);
    T.push(v3.norm(t));
  }
  // initial normal
  const t0 = T[0];
  const ref = Math.abs(t0[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
  let nrm = v3.norm(v3.cross(t0, v3.cross(ref, t0)));
  for (let i = 0; i < n; i++) {
    if (i > 0) {
      const ax = v3.cross(T[i - 1], T[i]);
      const l = v3.len(ax);
      if (l > 1e-6) {
        const axis = v3.scale(ax, 1 / l);
        const ang = Math.acos(Math.max(-1, Math.min(1, v3.dot(T[i - 1], T[i]))));
        nrm = rotateAround(nrm, axis, ang);
      }
      nrm = v3.norm(v3.sub(nrm, v3.scale(T[i], v3.dot(nrm, T[i]))));
    }
    N.push(nrm);
    B.push(v3.cross(T[i], nrm));
  }
  return { T, N, B };
}

function rotateAround(v, k, a) {
  const c = Math.cos(a), s = Math.sin(a);
  const kxv = v3.cross(k, v);
  const kdv = v3.dot(k, v);
  return [
    v[0] * c + kxv[0] * s + k[0] * kdv * (1 - c),
    v[1] * c + kxv[1] * s + k[1] * kdv * (1 - c),
    v[2] * c + kxv[2] * s + k[2] * kdv * (1 - c),
  ];
}

/**
 * Write a tube into existing typed arrays (used for animated tubes too).
 * frameFn(i) -> {n, b}: optional override of cross-section axes (e.g. ring plane aligned).
 * radius(i) -> [ra, rb]: elliptical cross-section radii along n and b.
 */
export function writeTube(out, pts, radial, radius, opts = {}) {
  const { closed = false, frameOverride = null } = opts;
  const fr = frameOverride ? null : frames(pts, closed);
  const P = out.positions, Nn = out.normals;
  let k = 0;
  for (let i = 0; i < pts.length; i++) {
    let n, b;
    if (frameOverride) ({ n, b } = frameOverride(i));
    else { n = fr.N[i]; b = fr.B[i]; }
    const [ra, rb] = radius(i);
    const c = pts[i];
    for (let j = 0; j < radial; j++) {
      const a = (j / radial) * TAU;
      const ca = Math.cos(a), sa = Math.sin(a);
      P[k] = c[0] + n[0] * ra * ca + b[0] * rb * sa;
      P[k + 1] = c[1] + n[1] * ra * ca + b[1] * rb * sa;
      P[k + 2] = c[2] + n[2] * ra * ca + b[2] * rb * sa;
      // ellipse normal
      let nx = n[0] * rb * ca + b[0] * ra * sa;
      let ny = n[1] * rb * ca + b[1] * ra * sa;
      let nz = n[2] * rb * ca + b[2] * ra * sa;
      const l = Math.hypot(nx, ny, nz) || 1;
      Nn[k] = nx / l; Nn[k + 1] = ny / l; Nn[k + 2] = nz / l;
      k += 3;
    }
  }
}

export function tubeIndices(segments, radial, closed = false) {
  const idx = [];
  const rows = closed ? segments : segments - 1;
  for (let i = 0; i < rows; i++) {
    const i2 = (i + 1) % segments;
    for (let j = 0; j < radial; j++) {
      const j2 = (j + 1) % radial;
      const a = i * radial + j, b = i2 * radial + j, c = i2 * radial + j2, d = i * radial + j2;
      idx.push(a, b, d, b, c, d);
    }
  }
  return segments * radial > 65535 ? new Uint32Array(idx) : new Uint16Array(idx);
}

export function tube(pts, radial, radius, opts = {}) {
  const n = pts.length * radial;
  const out = { positions: new Float32Array(n * 3), normals: new Float32Array(n * 3) };
  writeTube(out, pts, radial, typeof radius === 'number' ? () => [radius, radius] : radius, opts);
  out.indices = tubeIndices(pts.length, radial, opts.closed);
  return out;
}

export function bezier(p0, p1, p2, steps) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, u = 1 - t;
    pts.push([
      u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
      u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1],
      u * u * p0[2] + 2 * u * t * p1[2] + t * t * p2[2],
    ]);
  }
  return pts;
}

/* ---------- primitives ---------- */
export function sphere(lat = 24, lon = 32) {
  const pos = [], nrm = [], idx = [];
  for (let i = 0; i <= lat; i++) {
    const th = (i / lat) * Math.PI;
    for (let j = 0; j <= lon; j++) {
      const ph = (j / lon) * TAU;
      const x = Math.sin(th) * Math.cos(ph), y = Math.cos(th), z = Math.sin(th) * Math.sin(ph);
      pos.push(x, y, z); nrm.push(x, y, z);
    }
  }
  for (let i = 0; i < lat; i++) {
    for (let j = 0; j < lon; j++) {
      const a = i * (lon + 1) + j, b = a + lon + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  return { positions: new Float32Array(pos), normals: new Float32Array(nrm), indices: new Uint16Array(idx) };
}

export function torus(R, r, seg = 64, radial = 16) {
  const pts = [];
  for (let i = 0; i < seg; i++) {
    const a = (i / seg) * TAU;
    pts.push([Math.cos(a) * R, Math.sin(a) * R, 0]);
  }
  return tube(pts, radial, r, {
    closed: true,
    frameOverride: (i) => {
      const a = (i / seg) * TAU;
      return { n: [Math.cos(a), Math.sin(a), 0], b: [0, 0, 1] };
    },
  });
}

/**
 * Ring band in the XY plane (finger axis = Z), radius R to the band centre line.
 * thick(angle) / width(angle) let the band taper toward the shoulders.
 * Profile: domed outside, gently curved comfort-fit inside.
 */
export function band(R, thick, width, seg = 160, radial = 28) {
  const pos = [], nrm = [];
  for (let i = 0; i < seg; i++) {
    const a = (i / seg) * TAU;
    const radialDir = [Math.cos(a), Math.sin(a), 0];
    const ta = thick(a) / 2, wa = width(a) / 2;
    for (let j = 0; j < radial; j++) {
      const p = (j / radial) * TAU;
      const cp = Math.cos(p), sp = Math.sin(p);
      // squircle-ish profile: flatter sides
      const ex = 0.55;
      const sx = Math.sign(cp) * Math.pow(Math.abs(cp), ex);
      const sz = Math.sign(sp) * Math.pow(Math.abs(sp), 0.8);
      const inner = cp < 0 ? 0.55 : 1;
      const r = ta * sx * inner;
      const z = wa * sz;
      pos.push(radialDir[0] * (R + r), radialDir[1] * (R + r), z);
      // approximate normal from profile derivative
      const nx = cp * (cp < 0 ? 0.6 : 1) / Math.max(ta, 1e-4);
      const nz = sp / Math.max(wa, 1e-4);
      const l = Math.hypot(nx, nz) || 1;
      nrm.push(radialDir[0] * nx / l, radialDir[1] * nx / l, nz / l);
    }
  }
  return {
    positions: new Float32Array(pos),
    normals: new Float32Array(nrm),
    indices: tubeIndices(seg, radial, true),
  };
}

/** Rope band: two strands twisted around a circle (the "thread" motif). */
export function ropeBand(R, coil, strandR, turns, seg = 420, radial = 14) {
  const out = [];
  for (let s = 0; s < 2; s++) {
    const pts = [];
    for (let i = 0; i < seg; i++) {
      const a = (i / seg) * TAU;
      const ph = a * turns + s * Math.PI;
      const rd = [Math.cos(a), Math.sin(a), 0];
      pts.push([
        rd[0] * (R + Math.cos(ph) * coil),
        rd[1] * (R + Math.cos(ph) * coil),
        Math.sin(ph) * coil,
      ]);
    }
    out.push(tube(pts, radial, strandR, { closed: true }));
  }
  return merge(out);
}

export function merge(geos) {
  let nv = 0, ni = 0;
  for (const g of geos) { nv += g.positions.length; ni += g.indices.length; }
  const positions = new Float32Array(nv), normals = new Float32Array(nv);
  const indices = nv / 3 > 65535 ? new Uint32Array(ni) : new Uint16Array(ni);
  let ov = 0, oi = 0;
  for (const g of geos) {
    positions.set(g.positions, ov);
    normals.set(g.normals, ov);
    const base = ov / 3;
    for (let k = 0; k < g.indices.length; k++) indices[oi + k] = g.indices[k] + base;
    ov += g.positions.length;
    oi += g.indices.length;
  }
  return { positions, normals, indices };
}

/* ---------- catenary/curve helpers ---------- */
export function sampleCurve(fn, n) {
  const pts = [];
  for (let i = 0; i < n; i++) pts.push(fn(i / (n - 1)));
  return pts;
}

export function arcLengthPoints(fn, count, samples = 600) {
  // returns `count` points evenly spaced by arc length along fn(t), t in [0,1]
  const pts = sampleCurve(fn, samples);
  const acc = [0];
  for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + v3.len(v3.sub(pts[i], pts[i - 1])));
  const total = acc[acc.length - 1];
  const out = [];
  let j = 0;
  for (let k = 0; k < count; k++) {
    const target = (k / (count - 1)) * total;
    while (j < acc.length - 2 && acc[j + 1] < target) j++;
    const seg = acc[j + 1] - acc[j] || 1;
    const t = (target - acc[j]) / seg;
    const a = pts[j], b = pts[j + 1];
    out.push({
      p: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t],
      tangent: v3.norm(v3.sub(b, a)),
    });
  }
  return { points: out, length: total };
}

/* ---------- lathe (revolved profile) with optional per-vertex deform ---------- */
export function computeNormals(pos, idx) {
  const n = new Float32Array(pos.length);
  for (let i = 0; i < idx.length; i += 3) {
    const a = idx[i] * 3, b = idx[i + 1] * 3, c = idx[i + 2] * 3;
    const ux = pos[b] - pos[a], uy = pos[b + 1] - pos[a + 1], uz = pos[b + 2] - pos[a + 2];
    const vx = pos[c] - pos[a], vy = pos[c + 1] - pos[a + 1], vz = pos[c + 2] - pos[a + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    for (const k of [a, b, c]) { n[k] += nx; n[k + 1] += ny; n[k + 2] += nz; }
  }
  for (let i = 0; i < n.length; i += 3) {
    const l = Math.hypot(n[i], n[i + 1], n[i + 2]) || 1;
    n[i] /= l; n[i + 1] /= l; n[i + 2] /= l;
  }
  return n;
}

export function lathe(profile, seg = 64, deform = null) {
  const pos = [], idx = [];
  for (let i = 0; i < profile.length; i++) {
    const [r, y] = profile[i];
    for (let j = 0; j < seg; j++) {
      const a = (j / seg) * TAU;
      let p = [Math.cos(a) * r, y, Math.sin(a) * r];
      if (deform) p = deform(p, a, i);
      pos.push(p[0], p[1], p[2]);
    }
  }
  for (let i = 0; i < profile.length - 1; i++) {
    for (let j = 0; j < seg; j++) {
      const j2 = (j + 1) % seg;
      const a = i * seg + j, b = (i + 1) * seg + j, c = (i + 1) * seg + j2, d = i * seg + j2;
      idx.push(a, b, d, b, c, d);
    }
  }
  const positions = new Float32Array(pos);
  const indices = new Uint16Array(idx);
  return { positions, normals: computeNormals(positions, indices), indices };
}

/** A pouring crucible: thick walls, rounded base, a lip pulled out toward +x. Height ~1, centred on y=0. */
export function crucible(seg = 72) {
  const profile = [
    [0.0, -0.5], [0.16, -0.5], [0.26, -0.48], [0.32, -0.43], [0.35, -0.34],
    [0.39, 0.05], [0.43, 0.38], [0.455, 0.47], [0.45, 0.51], [0.42, 0.525],
    [0.395, 0.5], [0.37, 0.4], [0.33, 0.02], [0.3, -0.27], [0.25, -0.36], [0.12, -0.39], [0.0, -0.39],
  ];
  const lip = (p, a) => {
    const d = Math.max(0, Math.cos(a) - 0.8) / 0.2; // 0..1 near the spout
    const k = d * d * Math.max(0, Math.min(1, (p[1] - 0.15) / 0.35));
    return [p[0] + Math.cos(a) * 0.17 * k, p[1] - 0.06 * k, p[2] + Math.sin(a) * 0.04 * k];
  };
  return lathe(profile, seg, lip);
}

/** Molten surface inside the crucible: a gently domed disc. */
export function pool(radius = 0.36, seg = 64) {
  return lathe([[0, 0.012], [radius * 0.5, 0.01], [radius, 0]], seg, (p, a) => [p[0] + Math.max(0, Math.cos(a) - 0.8) * 0.4 * (Math.hypot(p[0], p[2]) / radius), p[1], p[2]]);
}
