import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { subscribe } from '../lib/pose';

gsap.registerPlugin(ScrollTrigger);

// Pose art lives in /public/avatar/<pose>.png (cut from Varun's pixel sprite sheet).
// Any pose without its own image falls back to `idle`, then `hello`.
export const POSE_FILES = ['hello', 'idle', 'curious', 'glacier', 'scam', 'ocean', 'local', 'calm', 'building', 'trophy', 'contact'];
const VERSION = 3; // bump when the art changes, so browsers drop the old files

// Checks which pose images exist (the dev server answers missing files with HTML).
export async function findPoseImages() {
  const found = {};
  await Promise.all(POSE_FILES.map(async (p) => {
    const url = `/avatar/${p}.png?v=${VERSION}`;
    try {
      const r = await fetch(url, { method: 'HEAD' });
      if (r.ok && (r.headers.get('content-type') || '').startsWith('image/')) found[p] = url;
    } catch { /* missing */ }
  }));
  return found;
}

// Poses he can mirror (no text or symbols that would read backwards).
const FLIPPABLE = new Set(['idle', 'hello', 'calm', 'trophy', 'ocean']);

/*
  Keeps the sprite alive between poses:
  breathing and sway, a walking bounce while you scroll, a hop on every pose
  change, turning to face the cursor, a wave when the cursor comes close,
  a nod while he talks, small moves of his own every few seconds, and a jump
  when clicked. The ground shadow squashes with every jump.
*/
export default function ImageAvatar({ images, onPoke }) {
  const body = useRef(null);
  const shadow = useRef(null);
  const [pose, setPose] = useState('hello');
  const [override, setOverride] = useState(null);
  const pick = (p) => (images[p] ? p : images.idle ? 'idle' : 'hello');

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const now = () => performance.now();
    const s = {
      pose: 'hello', talking: false, walk: 0, walkT: 0, phase: 0, lean: 0, leanT: 0,
      face: 1, faceT: 1, near: false, waving: false, nextMove: now() + 3000,
      hop: { y: 0, sx: 1, sy: 1, r: 0 },
    };
    const jump = (p = 1) => gsap.timeline()
      .to(s.hop, { sy: 0.92, sx: 1.06, y: 3, duration: 0.1, ease: 'power2.out' })
      .to(s.hop, { sy: 1.06, sx: 0.96, y: -20 * p, duration: 0.24, ease: 'power2.out' })
      .to(s.hop, { sy: 0.94, sx: 1.05, y: 0, duration: 0.18, ease: 'power2.in' })
      .to(s.hop, { sy: 1, sx: 1, duration: 0.4, ease: 'elastic.out(1, 0.45)' });

    const moves = [
      () => jump(0.5),
      () => { jump(0.35); setTimeout(() => jump(0.25), 420); },
      () => gsap.to(s.hop, { r: -6, duration: 0.35, yoyo: true, repeat: 1, ease: 'sine.inOut' }),
      () => { s.faceT = -s.faceT; setTimeout(() => { s.faceT = -s.faceT; }, 1300); },
      () => gsap.to(s.hop, { y: 4, sy: 0.96, duration: 0.25, yoyo: true, repeat: 3, ease: 'sine.inOut' }),
    ];

    const unsub = subscribe(({ pose: next, talking }) => {
      s.talking = talking;
      if (next !== s.pose) { s.pose = next; setPose(next); if (!reduce) jump(0.7); }
    });

    const onMove = (e) => {
      const b = body.current?.getBoundingClientRect();
      if (!b || !b.width) return;
      const cx = b.left + b.width / 2;
      s.faceT = e.clientX < cx - 20 ? -1 : e.clientX > cx + 20 ? 1 : s.faceT;
      const close = Math.hypot(e.clientX - cx, e.clientY - (b.top + b.height / 2)) < b.height * 0.75;
      // Wave when the visitor's cursor comes close, if he is not busy with a prop.
      if (close && !s.near && !s.waving && (s.pose === 'idle' || s.pose === 'calm')) {
        s.waving = true;
        setOverride('hello');
        jump(0.4);
        setTimeout(() => { setOverride(null); s.waving = false; }, 1600);
      }
      s.near = close;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    const st = ScrollTrigger.create({
      trigger: document.documentElement, start: 'top top', end: 'bottom bottom',
      onUpdate: (self) => {
        const v = self.getVelocity();
        s.walkT = Math.min(1, Math.abs(v) / 900);
        s.leanT = gsap.utils.clamp(-5, 5, -v / 450);
      },
    });

    const tick = (t, dtMs) => {
      const dt = Math.min(0.05, dtMs / 1000);
      if (now() > s.nextMove) {
        s.nextMove = now() + 3500 + Math.random() * 3500;
        if (s.walk < 0.2 && !s.talking) moves[Math.floor(Math.random() * moves.length)]();
      }
      s.walkT *= 0.94; s.walk += (s.walkT - s.walk) * 0.12;
      s.phase += dt * (5 + s.walk * 7);
      s.leanT *= 0.9; s.lean += (s.leanT - s.lean) * 0.1;
      const canFlip = FLIPPABLE.has(s.pose) || s.waving;
      s.face += ((canFlip ? s.faceT : 1) - s.face) * 0.2;
      const bob = Math.abs(Math.sin(s.phase)) * s.walk * 7;
      const sway = Math.sin(t * 0.9) * 1.1 + Math.sin(s.phase) * s.walk * 3 + s.lean + s.hop.r;
      const breath = 1 + Math.sin(t * 1.8) * 0.012;
      const nod = s.talking ? Math.abs(Math.sin(t * 8)) * -3 : 0;
      const h = s.hop;
      const y = h.y - bob + nod;
      if (body.current) body.current.style.transform =
        `translateY(${y.toFixed(1)}px) rotate(${sway.toFixed(2)}deg) scale(${(h.sx * s.face).toFixed(3)}, ${(h.sy * breath).toFixed(3)})`;
      if (shadow.current) {
        const lift = Math.min(1, Math.max(0, -y / 24));
        shadow.current.style.transform = `translateX(-50%) scale(${(1 - lift * 0.4).toFixed(3)})`;
        shadow.current.style.opacity = (0.5 - lift * 0.3).toFixed(2);
      }
    };
    if (!reduce) gsap.ticker.add(tick);
    s.poke = () => jump(1.1);
    body.current.__poke = s.poke;
    return () => { gsap.ticker.remove(tick); unsub(); st.kill(); window.removeEventListener('pointermove', onMove); };
  }, []);

  const shown = pick(override || pose);
  return (
    <div
      className="img-avatar"
      onClick={() => { body.current?.__poke?.(); onPoke?.(); }}
      role="img"
      aria-label="Varun, as a pixel-art character"
    >
      <span className="img-avatar-shadow" ref={shadow} aria-hidden="true" />
      <div className="img-avatar-body" ref={body}>
        {Object.entries(images).map(([p, src]) => (
          <img key={p} src={src} alt="" draggable="false" decoding="async" className={p === shown ? 'is-on' : ''} />
        ))}
      </div>
    </div>
  );
}
