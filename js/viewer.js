// ARDEM — live 3D showcase: drag to rotate, animated metal/stone transitions.
import { Renderer } from './renderer.js?v=20261121c';
import { BUILDERS, METALS, STONES, VARIANTS, materialState, blendState, shadowMesh } from './jewels.js?v=20261121c';
import { m4, clamp, easeInOutCubic } from './math.js?v=20261121c';

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function stateFor(product, key) {
  if (product.signature) return materialState(key);
  const metal = METALS[key] || METALS.champagne;
  return { metal: { ...metal }, stone: { ...STONES[product.stone || 'diamond'] }, morph: 0 };
}

export class Showcase {
  /**
   * opts: { product, variant, envMix, envRot, spin, glints, onDragStart }
   */
  constructor(canvas, opts) {
    this.canvas = canvas;
    this.opts = opts;
    this.r = new Renderer(canvas, { transparent: true, dprCap: 1.75 });
    this.product = opts.product;
    this.piece = BUILDERS[this.product.builder](this.r);
    this.state = stateFor(this.product, opts.variant);
    this.from = this.state;
    this.to = this.state;
    this.blendT = 1;
    this.yaw = 0;
    this.pitch = 0;
    this.vel = 0;
    this.dragging = false;
    this.visible = false;
    this.t0 = performance.now();
    this.last = this.t0;
    this.flash = 0;
    this._bind();
    this.io = new IntersectionObserver((es) => {
      this.visible = es[0].isIntersecting;
      if (this.visible) this.start(); else this.stop();
    }, { rootMargin: '120px' });
    this.io.observe(canvas);
  }

  setVariant(key) {
    const next = stateFor(this.product, key);
    if (reduced()) {
      this.state = this.from = this.to = next;
      this.blendT = 1;
      this.renderOnce();
      return;
    }
    this.from = this.state;
    this.to = next;
    this.blendT = 0;
    this.flash = 1;
    this.vel += 1.6; // a half-turn flourish while the material changes
    this.start();
  }

  _bind() {
    const c = this.canvas;
    let lastX = 0, lastY = 0, lastT = 0;
    const down = (e) => {
      this.dragging = true;
      lastX = e.clientX; lastY = e.clientY; lastT = performance.now();
      c.setPointerCapture?.(e.pointerId);
      c.classList.add('is-grabbing');
      this.opts.onDragStart?.();
    };
    const move = (e) => {
      if (!this.dragging) return;
      const now = performance.now();
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      this.yaw += dx * 0.01;
      this.pitch = clamp(this.pitch + dy * 0.005, -0.45, 0.45);
      this.vel = (dx * 0.01) / Math.max(0.008, (now - lastT) / 1000) * 0.08;
      lastX = e.clientX; lastY = e.clientY; lastT = now;
      this.start();
    };
    const up = () => {
      this.dragging = false;
      c.classList.remove('is-grabbing');
    };
    c.addEventListener('pointerdown', down);
    c.addEventListener('pointermove', move);
    c.addEventListener('pointerup', up);
    c.addEventListener('pointercancel', up);
    // keyboard rotation for accessibility
    c.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { this.yaw -= 0.25; this.renderOnce(); e.preventDefault(); }
      if (e.key === 'ArrowRight') { this.yaw += 0.25; this.renderOnce(); e.preventDefault(); }
    });
    this._resize = () => this.renderOnce();
    window.addEventListener('resize', this._resize);
  }

  start() {
    if (this.running || !this.visible) return;
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
  renderOnce() {
    if (!this.running) this.frame(performance.now());
  }

  frame(now) {
    const r = this.r;
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    const t = (now - this.t0) / 1000;
    r.time = t;
    const rm = reduced();
    if (this.blendT < 1) {
      this.blendT = Math.min(1, this.blendT + dt / 1.3);
      this.state = blendState(this.from, this.to, easeInOutCubic(this.blendT));
    }
    if (!this.dragging) {
      const auto = rm ? 0 : (this.opts.spin ?? 0.18);
      this.vel *= Math.exp(-dt * 2.2);
      this.yaw += (auto + this.vel) * dt;
      this.pitch *= Math.exp(-dt * 1.5);
    }
    this.flash *= Math.exp(-dt * 2.5);
    const b = this.canvas.getBoundingClientRect();
    r.resize(b.width, b.height);
    const view = this.opts.view || this.product.view;
    const aspect = r.width / r.height || 1;
    const fit = clamp((this.opts.fitAspect ?? 0.8) / aspect, 1, 1.9);
    const cam = view.cam;
    r.cam = {
      pos: [cam.pos[0], cam.pos[1], cam.pos[2] * fit],
      target: cam.target,
      fov: cam.fov,
    };
    r.env.mix = this.opts.envMix ?? 0.85;
    r.env.rot = (this.opts.envRot ?? 0.3) + this.yaw * 0.35 + this.flash * 1.2;
    r.env.exposure = 1;
    r.env.keyBoost = 1 + this.flash * 0.6;
    r.begin([0, 0, 0, 0]);
    const rot = view.rot;
    const W = m4.mul(m4.rotY(rot[1] + this.yaw), m4.rotX(rot[0] + this.pitch), m4.rotZ(rot[2]));
    if (this.opts.shadow) {
      r.drawShadow(shadowMesh(r), m4.mul(m4.translate(0, -1.45, 0), m4.scale(1.3, 1, 0.55)), 0.28);
    }
    this.piece.draw(r, W, this.state);
    if (this.opts.glints && this.piece.meta?.gemTop) {
      const meta = this.piece.meta;
      for (let i = 0; i < 3; i++) {
        const a = i * 2.1 + 0.4;
        const wp = m4.transformPoint(W, [Math.cos(a) * meta.g * 0.45, meta.gemTop - 0.03, Math.sin(a) * meta.g * 0.45]);
        const tw = Math.pow(Math.max(0, Math.sin(this.yaw * 3 + i * 2.4 + t * 0.6)), 26);
        r.sprite(wp, 0.34, tw * (this.opts.glints ?? 1), { rotate: 0.25 + i * 0.4 });
      }
    }
    if (rm && this.blendT >= 1 && !this.dragging) this.stop();
  }

  dispose() {
    this.stop();
    this.io.disconnect();
    window.removeEventListener('resize', this._resize);
    this.r.gl.getExtension('WEBGL_lose_context')?.loseContext();
  }
}

export { VARIANTS };
