// ARDEM — WebGL2 jewelry renderer: physically based gold, faceted gems with dispersion,
// procedural studio lighting, glints, gold dust and photographic backdrops.
import { m4 } from './math.js?v=20261121c';

const ENV = /* glsl */ `
uniform float uEnvRot;
uniform float uEnvMix;     // 0 = dark studio, 1 = ivory studio
uniform float uExposure;
uniform float uKeyBoost;
vec3 rotY(vec3 d, float a){ float c=cos(a), s=sin(a); return vec3(c*d.x + s*d.z, d.y, -s*d.x + c*d.z); }
float softbox(vec3 d, vec3 f, vec3 r0, vec2 hs, float soft){
  float t = dot(d, f);
  if (t <= 0.0) return 0.0;
  vec3 r = normalize(r0 - f * dot(r0, f));
  vec3 u = cross(f, r);
  vec2 p = vec2(dot(d, r), dot(d, u)) / t;
  vec2 q = 1.0 - smoothstep(hs - soft, hs + soft, abs(p));
  return q.x * q.y;
}
vec3 studio(vec3 d, float rough){
  d = rotY(d, uEnvRot);
  float s = 0.012 + rough * 0.5;
  vec3 dark = mix(vec3(0.006,0.005,0.004), vec3(0.045,0.038,0.032), smoothstep(-0.5, 0.9, d.y));
  vec3 ivory = mix(vec3(0.09,0.075,0.06), vec3(0.95,0.90,0.82), smoothstep(-0.3, 0.6, d.y));
  float flags = softbox(d, normalize(vec3(-0.95,0.05,-0.25)), vec3(0,0,1), vec2(0.32,1.3), s + 0.04)
              + softbox(d, normalize(vec3(0.85,-0.05,0.55)), vec3(0,0,-1), vec2(0.22,1.3), s + 0.04)
              + softbox(d, normalize(vec3(0.1,0.1,-1.0)), vec3(1,0,0), vec2(0.5,0.18), s + 0.04);
  ivory *= 1.0 - 0.88 * clamp(flags, 0.0, 1.0);
  vec3 c = mix(dark, ivory, uEnvMix);
  vec3 L = vec3(0.0);
  L += vec3(1.00,0.92,0.80) * 7.0 * uKeyBoost * softbox(d, normalize(vec3(0.0,1.0,0.3)),  vec3(1,0,0), vec2(0.85,0.42), s);
  L += vec3(1.00,0.96,0.90) * 4.2 * softbox(d, normalize(vec3(-1.0,0.25,0.5)), vec3(0,0,1), vec2(0.07,1.5), s);
  L += vec3(1.00,0.90,0.76) * 3.2 * softbox(d, normalize(vec3(1.0,0.05,0.25)), vec3(0,0,-1), vec2(0.05,1.5), s);
  L += vec3(0.95,0.90,0.84) * 2.2 * softbox(d, normalize(vec3(0.0,0.3,1.0)),  vec3(1,0,0), vec2(0.8,0.06), s);
  L += vec3(1.00,0.94,0.86) * 1.6 * softbox(d, normalize(vec3(0.35,0.15,-1.0)), vec3(1,0,0), vec2(1.1,0.22), s);
  L += vec3(0.85,0.80,0.75) * 0.7 * softbox(d, normalize(vec3(-0.2,-1.0,0.2)), vec3(1,0,0), vec2(0.9,0.9), s);
  float sh = 1.0 / (1.0 + rough * 260.0);
  L += vec3(1.0) * 16.0 * pow(max(dot(d, normalize(vec3(0.55,0.8,0.55))), 0.0), 1400.0 * sh);
  L += vec3(1.0) * 12.0 * pow(max(dot(d, normalize(vec3(-0.6,0.65,0.35))), 0.0), 1800.0 * sh);
  L += vec3(1.0) * 9.0  * pow(max(dot(d, normalize(vec3(0.1,0.5,-0.9))), 0.0), 1500.0 * sh);
  return c + L * mix(1.0, 0.55, uEnvMix);
}
vec3 aces(vec3 x){ return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14), 0.0, 1.0); }
vec3 outColor(vec3 c){ return pow(aces(c * uExposure), vec3(1.0/2.2)); }
`;

const MESH_VS = /* glsl */ `#version 300 es
layout(location=0) in vec3 aPos;
layout(location=1) in vec3 aNormal;
layout(location=2) in vec3 aMorph;
layout(location=4) in vec4 aI0;
layout(location=5) in vec4 aI1;
layout(location=6) in vec4 aI2;
layout(location=7) in vec4 aI3;
uniform mat4 uModel;
uniform mat4 uViewProj;
uniform float uMorphT;
uniform float uTime;
uniform float uWobble;
uniform float uDrip;
out vec3 vW;
out vec3 vN;
out vec3 vO;
out mat3 vRot;
void main(){
  mat4 inst = mat4(aI0, aI1, aI2, aI3);
  mat4 model = uModel * inst;
  vec3 p = mix(aPos, aMorph, uMorphT);
  vec3 n = aNormal;
  if (uDrip > 0.0 && p.y < 0.0) { p.xz *= 1.0 + p.y * 0.55 * uDrip; p.y *= 1.0 + 0.9 * uDrip; }
  if (uWobble > 0.0) {
    float w = sin(p.y * 7.0 + uTime * 2.3) * 0.5 + sin(p.x * 9.0 - uTime * 1.7) * 0.35 + sin(p.z * 8.0 + uTime * 2.9) * 0.3;
    p += n * w * 0.035 * uWobble;
  }
  vO = p;
  vec4 w = model * vec4(p, 1.0);
  vW = w.xyz;
  mat3 m3 = mat3(model);
  vec3 c0 = normalize(m3[0]); vec3 c1 = normalize(m3[1]); vec3 c2 = normalize(m3[2]);
  vRot = mat3(c0, c1, c2);
  vN = normalize(transpose(inverse(m3)) * n);
  gl_Position = uViewProj * w;
}`;

const METAL_FS = /* glsl */ `#version 300 es
precision highp float;
in vec3 vW; in vec3 vN; in vec3 vO; in mat3 vRot;
uniform vec3 uCam;
uniform vec3 uF0;
uniform float uRough;
uniform float uHeat;
uniform float uFade;
uniform float uTime;
uniform vec3 uAlbedo;
uniform vec3 uPLPos;
uniform vec3 uPLCol;
uniform float uPLMask;
${ENV}
out vec4 o;
float hsh(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
void main(){
  vec3 N = normalize(vN);
  vec3 V = normalize(uCam - vW);
  if (dot(N, V) < 0.0) N = -N;
  float NdV = clamp(dot(N, V), 1e-3, 1.0);
  vec3 R = reflect(-V, N);
  vec3 F = uF0 + (1.0 - uF0) * pow(1.0 - NdV, 5.0);
  vec3 col = studio(R, uRough) * F;
  // crisp direct highlight (GGX)
  vec3 Ld = normalize(vec3(0.35, 0.9, 0.7));
  vec3 H = normalize(Ld + V);
  float a = max(uRough * uRough, 0.004); float a2 = a * a;
  float NdH = max(dot(N, H), 0.0);
  float D = a2 / (3.14159 * pow(NdH * NdH * (a2 - 1.0) + 1.0, 2.0));
  col += F * min(D, 400.0) * 0.012 * max(dot(N, Ld), 0.0);
  // dielectric bodies (the crucible): diffuse from the room and from the molten pool
  if (uAlbedo.r + uAlbedo.g + uAlbedo.b > 0.0) {
    float grain = 0.78 + 0.22 * hsh(floor(vO * 140.0));
    vec3 Lp = uPLPos - vW; float d2 = dot(Lp, Lp); Lp = normalize(Lp);
    // light from the molten pool reaches only the inner wall (no shadow maps: mask by normal side)
    vec3 nObj = transpose(vRot) * normalize(vN);
    float radial = dot(normalize(vO.xz + 1e-5), nObj.xz) * uPLMask;
    float inner = uPLMask == 0.0 ? 1.0 : smoothstep(0.15, -0.35, radial) + smoothstep(0.42, 0.52, vO.y) * 0.35;
    vec3 diff = studio(N, 1.0) * 0.22 + uPLCol * inner * max(dot(N, Lp), 0.0) / (0.35 + d2 * 1.6);
    col += uAlbedo * grain * diff;
  }
  // molten gold: a flowing blackbody glow, bright yellow at the core, orange at the edges,
  // cooling smoothly into polished metal as uHeat falls
  float h = clamp(uHeat, 0.0, 1.0);
  if (h > 0.001) {
    float flow = sin(vO.y * 11.0 - uTime * 2.6 + sin(vO.x * 7.0 + uTime) * 1.4) * 0.5 + 0.5;
    flow = mix(flow, sin(vO.x * 17.0 + vO.z * 13.0 - uTime * 1.9) * 0.5 + 0.5, 0.35);
    float core = smoothstep(0.05, 0.85, NdV);
    vec3 edgeC = vec3(0.62, 0.11, 0.01);
    vec3 midC = vec3(1.0, 0.36, 0.035);
    vec3 coreC = vec3(1.0, 0.6, 0.15);
    vec3 emis = mix(edgeC, midC, smoothstep(0.0, 0.55, core));
    emis = mix(emis, coreC, smoothstep(0.5, 1.0, core) * (0.65 + 0.35 * flow));
    emis *= (0.42 + 0.78 * h) * (0.85 + 0.3 * flow);
    vec3 sheen = studio(R, 0.12) * F * 0.18;
    col = mix(col, emis + sheen, smoothstep(0.0, 0.6, h));
  }
  o = vec4(outColor(col) * uFade, uFade);
}`;

const GEM_FS = /* glsl */ `#version 300 es
precision highp float;
in vec3 vW; in vec3 vN; in vec3 vO; in mat3 vRot;
uniform vec3 uCam;
uniform float uIor;
uniform float uDisp;
uniform vec3 uAbsorb;
uniform vec3 uBody;
uniform int uBounces;
uniform float uFade;
uniform vec4 uShapeXf;
${ENV}
out vec4 o;
float pavY(float r){ return -0.03 - (1.0 - r) * 0.86; }
float crY(float r){ return r < 0.56 ? 0.33 : 0.03 + (1.0 - r) / 0.44 * 0.30; }
bool inside(vec3 q){ float r = length(q.xz); return r <= 1.0 && q.y >= pavY(r) && q.y <= crY(r); }
vec3 facetN(vec3 p, float n, float ang, float sgn, float off){
  float phi = atan(p.z, p.x);
  float st = 6.2831853 / n;
  float q = (floor(phi / st + off) + 0.5 - off) * st;
  return normalize(vec3(sin(ang) * cos(q), sgn * cos(ang), sin(ang) * sin(q)));
}
vec3 surfN(vec3 h){
  float r = length(h.xz);
  if (h.y < -0.03) return facetN(h, 16.0, 0.7112, -1.0, 0.0);
  if (r > 0.965 && h.y < 0.05) return normalize(vec3(h.x, 0.0, h.z));
  if (r < 0.56 && h.y > 0.31) return vec3(0.0, 1.0, 0.0);
  return facetN(h, 32.0, 0.6021, 1.0, 0.5);
}
vec3 hitSurf(vec3 p, vec3 d){
  float lo = 0.0, hi = 2.6;
  for (int i = 0; i < 11; i++){
    float m = (lo + hi) * 0.5;
    if (inside(p + d * m)) lo = m; else hi = m;
  }
  return p + d * lo;
}
void main(){
  vec3 V = normalize(uCam - vW);
  vec3 Nw = normalize(cross(dFdx(vW), dFdy(vW)));
  if (dot(Nw, V) < 0.0) Nw = -Nw;
  float NdV = clamp(dot(Nw, V), 1e-3, 1.0);
  float F0 = pow((uIor - 1.0) / (uIor + 1.0), 2.0);
  float Fe = F0 + (1.0 - F0) * pow(1.0 - NdV, 5.0);
  vec3 refl = studio(reflect(-V, Nw), 0.0);

  // object space ray into the stone
  mat3 toObj = transpose(vRot);
  vec3 Vo = toObj * V;
  vec3 No = toObj * Nw;
  vec3 d = refract(-Vo, No, 1.0 / uIor);
  if (dot(d, d) < 1e-6) d = -Vo;
  vec3 sx = vec3(uShapeXf.x, 1.0, uShapeXf.y);
  d = normalize(d * sx);
  vec3 p = vec3((vO.x - uShapeXf.z) * uShapeXf.x, vO.y, vO.z * uShapeXf.y) + d * 0.004;
  vec3 acc = vec3(0.0);
  vec3 w = vec3(1.0);
  for (int b = 0; b < 5; b++){
    if (b >= uBounces) break;
    vec3 h = hitSurf(p, d);
    w *= exp(-uAbsorb * length(h - p));
    vec3 n = surfN(h);
    float ci = clamp(dot(d, n), 0.0, 1.0);
    vec3 tG = refract(d, -n, uIor);
    if (dot(tG, tG) > 0.0){
      float Fr = F0 + (1.0 - F0) * pow(1.0 - ci, 5.0);
      vec3 tR = refract(d, -n, uIor - uDisp);
      vec3 tB = refract(d, -n, uIor + uDisp);
      if (dot(tR, tR) == 0.0) tR = tG;
      if (dot(tB, tB) == 0.0) tB = tG;
      vec3 e = vec3(studio(vRot * tR, 0.0).r, studio(vRot * tG, 0.0).g, studio(vRot * tB, 0.0).b);
      acc += w * (1.0 - Fr) * e;
      w *= Fr;
    }
    d = reflect(d, n);
    p = h - n * 0.003;
  }
  acc += w * mix(vec3(0.02), vec3(0.25), uEnvMix);
  vec3 col = refl * Fe + acc * (1.0 - Fe) * uBody;
  o = vec4(outColor(col) * uFade, uFade);
}`;

const SPRITE_VS = /* glsl */ `#version 300 es
layout(location=0) in vec2 aCorner;
uniform vec3 uCenter;      // world position
uniform float uSize;       // world-ish size (scaled by projection)
uniform mat4 uViewProj;
uniform float uAspect;
out vec2 vUv;
void main(){
  vec4 c = uViewProj * vec4(uCenter, 1.0);
  vUv = aCorner;
  vec2 off = aCorner * uSize;
  off.x /= uAspect;
  gl_Position = vec4(c.xy + off * c.w, c.z, c.w);
}`;

const SPRITE_FS = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
uniform float uIntensity;
uniform float uMode;       // 0 = star glint, 1 = soft halo
uniform vec3 uColor;
uniform float uRotate;
out vec4 o;
void main(){
  float c = cos(uRotate), s = sin(uRotate);
  vec2 p = mat2(c, -s, s, c) * vUv;
  float r = length(p);
  float v;
  if (uMode < 0.5){
    float rays = exp(-abs(p.x) * 60.0) * exp(-abs(p.y) * 2.6) + exp(-abs(p.y) * 60.0) * exp(-abs(p.x) * 2.6);
    float diag = (exp(-abs(p.x - p.y) * 80.0) + exp(-abs(p.x + p.y) * 80.0)) * exp(-r * 5.0) * 0.35;
    v = rays + diag + exp(-r * 14.0) * 1.4;
  } else {
    v = exp(-r * r * 6.0) * 0.9 + exp(-r * 2.2) * 0.25;
  }
  v *= smoothstep(1.0, 0.7, r) * uIntensity;
  // premultiplied, alpha 0 => additive over the page
  o = vec4(uColor * v, 0.0);
}`;

const DUST_VS = /* glsl */ `#version 300 es
layout(location=0) in vec4 aSeed;
uniform mat4 uViewProj;
uniform float uTime;
uniform float uPx;
out float vTw;
void main(){
  vec3 p = aSeed.xyz;
  float t = uTime * (0.04 + aSeed.w * 0.05);
  p.y = mod(p.y + t + 4.0, 8.0) - 4.0;
  p.x += sin(uTime * 0.2 + aSeed.w * 30.0) * 0.25;
  vec4 c = uViewProj * vec4(p, 1.0);
  gl_Position = c;
  gl_PointSize = uPx * (0.6 + aSeed.w * 1.6) / c.w * 6.0;
  vTw = 0.35 + 0.65 * pow(0.5 + 0.5 * sin(uTime * (0.8 + aSeed.w * 2.0) + aSeed.w * 40.0), 3.0);
}`;

const DUST_FS = /* glsl */ `#version 300 es
precision highp float;
in float vTw;
uniform float uAlpha;
out vec4 o;
void main(){
  vec2 q = gl_PointCoord * 2.0 - 1.0;
  float v = exp(-dot(q, q) * 4.0) * vTw * uAlpha;
  o = vec4(vec3(1.0, 0.82, 0.55) * v, 0.0);
}`;

const BACKDROP_VS = /* glsl */ `#version 300 es
const vec2 P[3] = vec2[3](vec2(-1.0,-1.0), vec2(3.0,-1.0), vec2(-1.0,3.0));
out vec2 vUv;
void main(){ vUv = P[gl_VertexID] * 0.5 + 0.5; gl_Position = vec4(P[gl_VertexID], 0.999, 1.0); }`;

const BACKDROP_FS = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
uniform int uMode;   // 0 ivory seamless, 1 onyx velvet, 2 champagne satin glow, 3 sage
uniform vec2 uRes;
uniform vec2 uPool;  // light pool centre (uv)
out vec4 o;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), f.x), mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y); }
float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }
void main(){
  vec2 uv = vUv;
  vec2 asp = vec2(uRes.x / uRes.y, 1.0);
  float pool = exp(-dot((uv - uPool) * asp, (uv - uPool) * asp) * 2.2);
  vec3 c;
  if (uMode == 0){
    vec3 top = vec3(0.957, 0.937, 0.894), bot = vec3(0.86, 0.82, 0.75);
    c = mix(bot, top, smoothstep(0.0, 0.85, uv.y));
    c += pool * 0.06;
    c *= 1.0 - 0.18 * pow(length((uv - 0.5) * asp * 0.9), 2.0);
  } else if (uMode == 1){
    float fib = fbm(uv * uRes / 3.5) * 0.6 + fbm(uv * uRes / 40.0) * 0.4;
    c = vec3(0.022, 0.018, 0.016) * (0.7 + fib * 0.6);
    c += vec3(0.16, 0.13, 0.10) * pool * (0.7 + fib * 0.5);
    c *= 1.0 - 0.45 * pow(length((uv - 0.5) * asp), 2.0);
  } else if (uMode == 2){
    float folds = fbm(vec2(uv.x * 2.0 + uv.y * 1.2, uv.y * 3.0) * 1.6);
    vec3 a = vec3(0.70, 0.56, 0.38), b = vec3(0.96, 0.86, 0.68);
    c = mix(a, b, smoothstep(0.25, 0.8, folds + pool * 0.4));
    c *= 0.82 + 0.25 * pool;
  } else {
    vec3 top = vec3(0.80, 0.82, 0.76), bot = vec3(0.60, 0.64, 0.57);
    c = mix(bot, top, smoothstep(0.0, 0.9, uv.y)) + pool * 0.05;
  }
  c += (hash(uv * uRes) - 0.5) * 0.012;
  o = vec4(c, 1.0);
}`;

const SHADOW_FS = /* glsl */ `#version 300 es
precision highp float;
in vec3 vW; in vec3 vN; in vec3 vO; in mat3 vRot;
uniform float uFade;
uniform float uStrength;
out vec4 o;
void main(){
  float r = length(vO.xz);
  float a = exp(-r * r * 3.2) * uStrength * uFade;
  o = vec4(vec3(0.12, 0.09, 0.06) * a, a);
}`;

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(s);
    gl.deleteShader(s);
    throw new Error('ARDEM shader: ' + log);
  }
  return s;
}

function program(gl, vs, fs) {
  const p = gl.createProgram();
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, vs));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('ARDEM link: ' + gl.getProgramInfoLog(p));
  const uniforms = {};
  const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < n; i++) {
    const info = gl.getActiveUniform(p, i);
    uniforms[info.name.replace(/\[0\]$/, '')] = gl.getUniformLocation(p, info.name);
  }
  return { p, u: uniforms };
}

export class Mesh {
  constructor(gl, geo, { dynamic = false } = {}) {
    this.gl = gl;
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    const usage = dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW;
    this.posBuf = this._attrib(0, geo.positions, 3, usage);
    this.nrmBuf = this._attrib(1, geo.normals || new Float32Array(geo.positions.length), 3, usage);
    this.morphBuf = this._attrib(2, geo.morph || geo.positions, 3, usage);
    this.ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geo.indices, gl.STATIC_DRAW);
    this.count = geo.indices.length;
    this.indexType = geo.indices instanceof Uint32Array ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;
    this.instances = 0;
    gl.bindVertexArray(null);
  }
  _attrib(loc, data, size, usage) {
    const gl = this.gl;
    const b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, data, usage);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
    return b;
  }
  update(positions, normals) {
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, positions);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.morphBuf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, positions);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.nrmBuf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, normals);
  }
  // per-instance model matrices (Float32Array of n*16)
  setInstances(mats) {
    const gl = this.gl;
    gl.bindVertexArray(this.vao);
    if (!this.instBuf) this.instBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.instBuf);
    gl.bufferData(gl.ARRAY_BUFFER, mats, gl.DYNAMIC_DRAW);
    for (let i = 0; i < 4; i++) {
      gl.enableVertexAttribArray(4 + i);
      gl.vertexAttribPointer(4 + i, 4, gl.FLOAT, false, 64, i * 16);
      gl.vertexAttribDivisor(4 + i, 1);
    }
    this.instances = mats.length / 16;
    gl.bindVertexArray(null);
  }
  draw() {
    const gl = this.gl;
    gl.bindVertexArray(this.vao);
    if (!this.instances) {
      gl.vertexAttrib4f(4, 1, 0, 0, 0);
      gl.vertexAttrib4f(5, 0, 1, 0, 0);
      gl.vertexAttrib4f(6, 0, 0, 1, 0);
      gl.vertexAttrib4f(7, 0, 0, 0, 1);
      gl.drawElements(gl.TRIANGLES, this.count, this.indexType, 0);
    } else {
      gl.drawElementsInstanced(gl.TRIANGLES, this.count, this.indexType, 0, this.instances);
    }
  }
}

export class Renderer {
  constructor(canvas, { transparent = true, dprCap = 2 } = {}) {
    this.canvas = canvas;
    const gl = canvas.getContext('webgl2', {
      antialias: true,
      alpha: transparent,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance',
    });
    if (!gl) throw new Error('WebGL2 unavailable');
    this.gl = gl;
    this.transparent = transparent;
    this.dprCap = dprCap;
    this.progs = {
      metal: program(gl, MESH_VS, METAL_FS),
      gem: program(gl, MESH_VS, GEM_FS),
      shadow: program(gl, MESH_VS, SHADOW_FS),
      sprite: program(gl, SPRITE_VS, SPRITE_FS),
      dust: program(gl, DUST_VS, DUST_FS),
      backdrop: program(gl, BACKDROP_VS, BACKDROP_FS),
    };
    // sprite quad
    this.quadVao = gl.createVertexArray();
    gl.bindVertexArray(this.quadVao);
    const qb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, qb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
    this.emptyVao = gl.createVertexArray();
    this.env = { rot: 0, mix: 0, exposure: 1, keyBoost: 1 };
    this.cam = { pos: [0, 0, 6], target: [0, 0, 0], fov: 0.6 };
    this.width = 1;
    this.height = 1;
    this.time = 0;
    this.viewProj = m4.identity();
  }

  resize(w, h) {
    const dpr = Math.min(window.devicePixelRatio || 1, this.dprCap);
    const W = Math.max(1, Math.round(w * dpr)), H = Math.max(1, Math.round(h * dpr));
    if (this.canvas.width !== W || this.canvas.height !== H) {
      this.canvas.width = W;
      this.canvas.height = H;
    }
    this.width = W;
    this.height = H;
    this.dpr = dpr;
  }

  begin(clear = [0, 0, 0, 0]) {
    const gl = this.gl;
    gl.viewport(0, 0, this.width, this.height);
    gl.clearColor(...clear);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.disable(gl.CULL_FACE);
    gl.disable(gl.BLEND);
    const aspect = this.width / this.height;
    this.aspect = aspect;
    const proj = m4.perspective(this.cam.fov, aspect, 0.05, 60);
    const view = m4.lookAt(this.cam.pos, this.cam.target);
    this.viewProj = m4.multiply(proj, view);
  }

  _env(u) {
    const gl = this.gl;
    gl.uniform1f(u.uEnvRot, this.env.rot);
    gl.uniform1f(u.uEnvMix, this.env.mix);
    gl.uniform1f(u.uExposure, this.env.exposure);
    if (u.uKeyBoost) gl.uniform1f(u.uKeyBoost, this.env.keyBoost);
  }

  _common(prog, model, extra = {}) {
    const gl = this.gl, u = prog.u;
    gl.useProgram(prog.p);
    gl.uniformMatrix4fv(u.uModel, false, model);
    gl.uniformMatrix4fv(u.uViewProj, false, this.viewProj);
    if (u.uCam) gl.uniform3fv(u.uCam, this.cam.pos);
    if (u.uMorphT) gl.uniform1f(u.uMorphT, extra.morph || 0);
    if (u.uTime) gl.uniform1f(u.uTime, this.time);
    if (u.uWobble) gl.uniform1f(u.uWobble, extra.wobble || 0);
    if (u.uDrip) gl.uniform1f(u.uDrip, extra.drip || 0);
    if (u.uFade) gl.uniform1f(u.uFade, extra.fade ?? 1);
    if (u.uEnvMix) this._env(u);
  }

  drawMetal(mesh, model, mat) {
    const gl = this.gl, prog = this.progs.metal;
    this._common(prog, model, mat);
    gl.uniform3fv(prog.u.uF0, mat.f0);
    gl.uniform1f(prog.u.uRough, mat.rough ?? 0.08);
    gl.uniform1f(prog.u.uHeat, mat.heat || 0);
    gl.uniform3fv(prog.u.uAlbedo, mat.albedo || [0, 0, 0]);
    gl.uniform3fv(prog.u.uPLPos, mat.plPos || [0, 0, 0]);
    gl.uniform3fv(prog.u.uPLCol, mat.plCol || [0, 0, 0]);
    gl.uniform1f(prog.u.uPLMask, mat.plMask || 0);
    this._blendFor(mat);
    mesh.draw();
  }

  drawGem(mesh, model, mat) {
    const gl = this.gl, prog = this.progs.gem;
    this._common(prog, model, mat);
    gl.uniform1f(prog.u.uIor, mat.ior ?? 2.42);
    gl.uniform1f(prog.u.uDisp, mat.disp ?? 0.03);
    gl.uniform3fv(prog.u.uAbsorb, mat.absorb || [0, 0, 0]);
    gl.uniform3fv(prog.u.uBody, mat.body || [1, 1, 1]);
    gl.uniform1i(prog.u.uBounces, mat.bounces ?? 4);
    gl.uniform4fv(prog.u.uShapeXf, mat.shapeXf || [1, 1, 0, 0]);
    this._blendFor(mat);
    mesh.draw();
  }

  drawShadow(mesh, model, strength = 0.5, fade = 1) {
    const gl = this.gl, prog = this.progs.shadow;
    this._common(prog, model, { fade });
    gl.uniform1f(prog.u.uStrength, strength);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.depthMask(false);
    mesh.draw();
    gl.depthMask(true);
    gl.disable(gl.BLEND);
  }

  _blendFor(mat) {
    const gl = this.gl;
    if ((mat.fade ?? 1) < 0.999) {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    } else gl.disable(gl.BLEND);
  }

  sprite(center, size, intensity, { mode = 0, color = [1, 0.97, 0.9], rotate = 0 } = {}) {
    if (intensity <= 0.002) return;
    const gl = this.gl, prog = this.progs.sprite, u = prog.u;
    gl.useProgram(prog.p);
    gl.uniform3fv(u.uCenter, center);
    gl.uniform1f(u.uSize, size);
    gl.uniformMatrix4fv(u.uViewProj, false, this.viewProj);
    gl.uniform1f(u.uAspect, this.aspect);
    gl.uniform1f(u.uIntensity, intensity);
    gl.uniform1f(u.uMode, mode);
    gl.uniform3fv(u.uColor, color);
    gl.uniform1f(u.uRotate, rotate);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.disable(gl.DEPTH_TEST);
    gl.bindVertexArray(this.quadVao);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
  }

  dust(count = 260, alpha = 1) {
    const gl = this.gl, prog = this.progs.dust;
    if (!this.dustVao) {
      this.dustVao = gl.createVertexArray();
      gl.bindVertexArray(this.dustVao);
      const seeds = new Float32Array(count * 4);
      let s = 7;
      const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
      for (let i = 0; i < count; i++) {
        seeds[i * 4] = (rnd() - 0.5) * 14;
        seeds[i * 4 + 1] = (rnd() - 0.5) * 8;
        seeds[i * 4 + 2] = (rnd() - 0.5) * 8 - 1.5;
        seeds[i * 4 + 3] = rnd();
      }
      const b = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, seeds, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);
      gl.bindVertexArray(null);
      this.dustCount = count;
    }
    if (alpha <= 0.002) return;
    gl.useProgram(prog.p);
    gl.uniformMatrix4fv(prog.u.uViewProj, false, this.viewProj);
    gl.uniform1f(prog.u.uTime, this.time);
    gl.uniform1f(prog.u.uPx, this.height / 900);
    gl.uniform1f(prog.u.uAlpha, alpha);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.depthMask(false);
    gl.bindVertexArray(this.dustVao);
    gl.drawArrays(gl.POINTS, 0, this.dustCount);
    gl.depthMask(true);
    gl.disable(gl.BLEND);
  }

  backdrop(mode = 0, pool = [0.5, 0.55]) {
    const gl = this.gl, prog = this.progs.backdrop;
    gl.useProgram(prog.p);
    gl.uniform1i(prog.u.uMode, mode);
    gl.uniform2f(prog.u.uRes, this.width, this.height);
    gl.uniform2f(prog.u.uPool, pool[0], pool[1]);
    gl.depthMask(false);
    gl.bindVertexArray(this.emptyVao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.depthMask(true);
  }

  // project world point to CSS pixels
  project(p) {
    const m = this.viewProj;
    const x = m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12];
    const y = m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13];
    const w = m[3] * p[0] + m[7] * p[1] + m[11] * p[2] + m[15];
    return [((x / w) * 0.5 + 0.5) * (this.width / this.dpr), ((1 - (y / w)) * 0.5) * (this.height / this.dpr)];
  }
}
