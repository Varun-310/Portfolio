import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Avatar from './Avatar';
import ImageAvatar, { findPoseImages } from './ImageAvatar';
import { chapters } from '../data';
import { setChapterPose } from '../lib/pose';

gsap.registerPlugin(ScrollTrigger);

// What he does in each chapter. Projects override this while one is in focus.
const CHAPTER_POSE = {
  top: 'hello', curious: 'curious', glacier: 'glacier', impact: 'idle',
  building: 'building', along: 'trophy', next: 'contact',
};

const POKES = [
  "Yes, I'm drawn. The real me is in the About section.",
  'That tickles. Keep scrolling.',
  'Still here. Still curious.',
  "If you're hiring, the email is at the bottom.",
  'I built this whole page. Ask me how.',
];

const ease = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
const lerp = (a, b, t) => a + (b - a) * t;

// One character, carried through the page: he starts standing in the hero arch,
// moves down to the corner while you read, and returns for the closing.
export default function Companion() {
  const box = useRef(null);
  const bub = useRef(null);
  const [line, setLine] = useState('');
  const [show, setShow] = useState(false);
  const timer = useRef();
  const docked = useRef(false);
  // Generated pose art (public/avatar/*.png) replaces the drawn character when present.
  const [images, setImages] = useState(null);
  useEffect(() => { findPoseImages().then((f) => setImages(Object.keys(f).length ? f : false)); }, []);

  const say = (text, ms = 4200) => {
    setLine(text);
    setShow(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setShow(false), ms);
  };

  useEffect(() => {
    const el = box.current;
    const heroSlot = document.querySelector('.hero .avatar-slot');
    const nextSlot = document.querySelector('.next .avatar-slot');
    const cur = { x: 0, y: 0, s: 1, init: false };
    const BASE = 200;

    const tHero = ScrollTrigger.create({ trigger: '#top', start: 'top top', end: 'bottom 15%' });
    const tNext = ScrollTrigger.create({ trigger: '#next', start: 'top 95%', end: 'top 25%' });

    const dock = () => {
      const w = window.innerWidth < 760 ? 78 : 118;
      return { x: window.innerWidth - w - 16, y: window.innerHeight - w * 1.5 - 8, w };
    };
    const rectOf = (slot) => {
      const b = slot.getBoundingClientRect();
      return { x: b.left, y: b.top, w: b.width };
    };

    const tick = () => {
      const d = dock();
      const p1 = ease(gsap.utils.clamp(0, 1, tHero.progress));
      const p2 = ease(gsap.utils.clamp(0, 1, tNext.progress));
      let t;
      if (p2 > 0 && nextSlot && nextSlot.offsetWidth) {
        const n = rectOf(nextSlot);
        t = { x: lerp(d.x, n.x, p2), y: lerp(d.y, n.y, p2), w: lerp(d.w, n.w, p2) };
      } else if (heroSlot) {
        const h = rectOf(heroSlot);
        t = { x: lerp(h.x, d.x, p1), y: lerp(h.y, d.y, p1), w: lerp(h.w, d.w, p1) };
      } else t = d;
      const k = cur.init ? 0.35 : 1;
      cur.init = true;
      cur.x += (t.x - cur.x) * k;
      cur.y += (t.y - cur.y) * k;
      cur.s += (t.w / BASE - cur.s) * k;
      el.style.transform = `translate3d(${cur.x.toFixed(1)}px, ${cur.y.toFixed(1)}px, 0) scale(${cur.s.toFixed(4)})`;

      // Speech bubble sits above his head, kept on screen.
      const w = BASE * cur.s;
      const bw = bub.current.offsetWidth;
      const bx = Math.min(window.innerWidth - bw - 12, Math.max(12, cur.x + w / 2 - bw * 0.75));
      bub.current.style.transform = `translate3d(${bx.toFixed(1)}px, ${(cur.y - bub.current.offsetHeight + w * 0.05).toFixed(1)}px, 0)`;
      bub.current.style.setProperty('--tail', `${(cur.x + w * 0.52 - bx).toFixed(1)}px`);
      docked.current = p1 > 0.95 && p2 < 0.05;
    };
    gsap.ticker.add(tick);

    // Chapter tracking: pose and the line he says.
    const marks = chapters.map((c) => {
      const e = document.getElementById(c.id);
      return e ? ScrollTrigger.create({ trigger: e, start: 'top 55%' }) : null;
    });
    let active = -1;
    const pick = (y) => {
      let idx = 0;
      marks.forEach((m, i) => { if (m && y >= m.start) idx = i; });
      if (y >= ScrollTrigger.maxScroll(window) - 4) idx = chapters.length - 1;
      if (idx === active) return;
      active = idx;
      setChapterPose(CHAPTER_POSE[chapters[idx].id] || 'idle');
      if (idx > 0 && idx < chapters.length - 1) say(chapters[idx].say);
      else setShow(false);
    };
    const watch = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (s) => pick(s.scroll()),
      onRefresh: (s) => pick(s.scroll()),
    });

    return () => {
      gsap.ticker.remove(tick);
      [tHero, tNext, watch, ...marks].forEach((m) => m && m.kill());
      clearTimeout(timer.current);
    };
  }, []);

  const poke = () => {
    if (!docked.current) return;
    say(POKES[Math.floor(Math.random() * POKES.length)], 3200);
  };

  return (
    <>
      <div className={`say ${show ? 'is-on' : ''}`} ref={bub} aria-live="polite">{line}</div>
      <div className="companion" ref={box}>
        {images ? <ImageAvatar images={images} onPoke={poke} /> : images === false ? <Avatar onPoke={poke} /> : null}
      </div>
    </>
  );
}
