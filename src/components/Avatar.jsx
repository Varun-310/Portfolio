import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { subscribe } from '../lib/pose';

gsap.registerPlugin(ScrollTrigger);

/*
  Varun, the character. Early twenties: wavy, messy dark hair falling over his
  forehead, thin round gold glasses, a light moustache, charcoal shirt with the
  sleeves rolled, denim, white sneakers.

  He is never still: he walks while you scroll, turns his head toward your
  cursor, and every few seconds does something on his own (looks around, peeks
  at the page, bounces, scratches his head, pushes his glasses up, shrugs).
  Arms are two-bone IK: a pose says where the hands go; elbows follow.
*/

const SL = [76, 136], SR = [124, 136];
const UA = 37, FA = 36;

const POSES = {
  hello: { L: [82, 204], R: [150, 92], tilt: -4, expr: 'smile', anim: 'wave', pocketL: true, free: [] },
  curious: { L: [48, 142], R: [106, 122], tilt: -9, expr: 'o', free: [] },
  glacier: { L: [86, 170], R: [114, 170], tilt: 4, expr: 'focus', free: [] },
  scam: { L: [58, 132], R: [150, 156], tilt: -6, expr: 'smirk', free: [] },
  ocean: { L: [82, 204], R: [148, 130], tilt: 6, expr: 'smile', pocketL: true, free: ['L'] },
  local: { L: [84, 180], R: [116, 180], tilt: 2, expr: 'smirk', free: [] },
  calm: { L: [92, 154], R: [110, 154], tilt: 6, expr: 'calm', free: [] },
  building: { L: [88, 188], R: [112, 188], tilt: 4, expr: 'focus', anim: 'type', free: [] },
  trophy: { L: [74, 190], R: [146, 60], tilt: -5, expr: 'grin', free: [] },
  contact: { L: [52, 152], R: [150, 92], tilt: -3, expr: 'smile', anim: 'wave', free: [] },
  idle: { L: [82, 204], R: [130, 208], tilt: 0, expr: 'smile', pocketL: true, free: ['R', 'L'] },
};

// Things he does on his own. `hand` actions only run if that hand is free in the pose.
const ACTIONS = [
  { name: 'look', head: [-5, -8], dur: 1.0, then: { head: [5, 7] } },
  { name: 'peek', lean: -6, head: [-4, -10], expr: 'o', dur: 1.2 },
  { name: 'bounce', bounce: true },
  { name: 'shrug', shrug: true, expr: 'smirk', dur: 0.9 },
  { name: 'nod', nod: true, dur: 1 },
  { name: 'glasses', hand: 'R', to: [113, 82], expr: 'focus', dur: 1.0 },
  { name: 'scratch', hand: 'R', to: [124, 50], expr: 'smirk', scratch: true, dur: 1.4 },
  { name: 'stretch', both: [[64, 40], [136, 40]], expr: 'yawn', dur: 1.6 },
  { name: 'watch', hand: 'L', to: [96, 116], head: [0, 4], expr: 'focus', dur: 1.2 },
];

const ik = (S, T, outward) => {
  let dx = T[0] - S[0], dy = T[1] - S[1];
  let d = Math.hypot(dx, dy);
  const max = UA + FA - 0.5;
  if (d > max) { dx *= max / d; dy *= max / d; d = max; }
  const a = Math.atan2(dy, dx);
  const c = Math.min(1, Math.max(-1, (UA * UA + d * d - FA * FA) / (2 * UA * d)));
  const off = Math.acos(c);
  const e1 = [S[0] + UA * Math.cos(a + off), S[1] + UA * Math.sin(a + off)];
  const e2 = [S[0] + UA * Math.cos(a - off), S[1] + UA * Math.sin(a - off)];
  const E = outward < 0 ? (e1[0] < e2[0] ? e1 : e2) : (e1[0] > e2[0] ? e1 : e2);
  return { E, T: [S[0] + dx, S[1] + dy] };
};
const f = (n) => n.toFixed(1);

export default function Avatar({ onPoke }) {
  const svg = useRef(null);
  const r = useRef({});
  const [pose, setPose] = useState('hello');
  const [talking, setTalking] = useState(false);
  const [expr, setExpr] = useState(null);

  useEffect(() => {
    const el = r.current;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const now = () => performance.now();
    const s = {
      pose: 'hello',
      cur: { lx: 82, ly: 204, rx: 150, ry: 92, tilt: -4, pocket: 1 },
      act: { w: 0, lx: 0, ly: 0, rx: 0, ry: 0, useL: 0, useR: 0, hx: 0, hy: 0, lean: 0, shrug: 0, nod: 0, scratch: 0 },
      hop: { y: 0, sx: 1, sy: 1 },
      lean: 0, leanV: 0, leanT: 0,
      hair: 0, hairV: 0,
      walk: 0, walkT: 0, phase: 0,
      gaze: [0, 0], gazeT: [0, 0], look: [0, 0], lookT: [0, 0],
      lastPointer: 0, sacc: 0, near: false,
      busy: false, talking: false, nextAct: now() + 2500,
      startle: 0,
    };

    // Crouch, spring, land with squash; hair trails behind.
    const jump = (power = 1) => {
      gsap.timeline()
        .to(s.hop, { sy: 0.93, sx: 1.05, y: 2, duration: 0.1, ease: 'power2.out' })
        .to(s.hop, { sy: 1.05, sx: 0.97, y: -14 * power, duration: 0.22, ease: 'power2.out' })
        .to(s.hop, { sy: 0.95, sx: 1.04, y: 0, duration: 0.18, ease: 'power2.in' })
        .to(s.hop, { sy: 1, sx: 1, duration: 0.35, ease: 'elastic.out(1, 0.45)' });
      s.hairV -= 1.8 * power;
    };

    const applyPose = (name, hop = true) => {
      const p = POSES[name] || POSES.idle;
      s.pose = name;
      gsap.to(s.cur, {
        lx: p.L[0], ly: p.L[1], rx: p.R[0], ry: p.R[1], tilt: p.tilt, pocket: p.pocketL ? 1 : 0,
        duration: reduce ? 0 : 0.8, ease: 'back.out(1.3)', delay: hop && !reduce ? 0.14 : 0,
      });
      if (hop && !reduce) {
        jump(0.75);
        // A quick glance toward the page, as if to say "look at this".
        s.lookT = [-5, -2];
        setTimeout(() => { s.lookT = [0, 0]; }, 900);
      }
    };

    const act = (a) => {
      if (s.busy || s.talking || reduce) return;
      const P = POSES[s.pose] || POSES.idle;
      if (a.hand && !P.free.includes(a.hand)) return act(ACTIONS[Math.floor(Math.random() * 5)]);
      if (a.both && P.free.length < 2) return act(ACTIONS[Math.floor(Math.random() * 5)]);
      if (a.bounce) { jump(0.45); setTimeout(() => jump(0.3), 380); return; }
      s.busy = true;
      if (a.expr) setExpr(a.expr);
      const A = s.act;
      A.useL = 0; A.useR = 0;
      if (a.hand === 'L') { A.useL = 1; [A.lx, A.ly] = a.to; }
      if (a.hand === 'R') { A.useR = 1; [A.rx, A.ry] = a.to; }
      if (a.both) { A.useL = 1; A.useR = 1; [A.lx, A.ly] = a.both[0]; [A.rx, A.ry] = a.both[1]; }
      const tl = gsap.timeline({
        onComplete: () => { s.busy = false; setExpr(null); },
      });
      tl.to(A, {
        w: 1, hx: a.head?.[0] || 0, hy: a.head?.[1] || 0, lean: a.lean || 0,
        shrug: a.shrug ? 1 : 0, nod: a.nod ? 1 : 0, scratch: a.scratch ? 1 : 0,
        duration: 0.45, ease: 'power2.inOut',
      });
      if (a.then) tl.to(A, { hx: a.then.head[0], hy: a.then.head[1], duration: 0.6, ease: 'power2.inOut' }, `+=${a.dur * 0.5}`);
      tl.to(A, { w: 0, hx: 0, hy: 0, lean: 0, shrug: 0, nod: 0, scratch: 0, duration: 0.5, ease: 'power2.inOut' }, `+=${a.dur * 0.6}`);
      if (a.name === 'glasses') tl.call(() => { s.hairV += 0.8; }, null, 0.45);
    };

    const unsub = subscribe(({ pose: next, talking: t }) => {
      if (next !== s.pose) { setPose(next); applyPose(next); }
      s.talking = t;
      setTalking(t);
    });

    const onMove = (e) => {
      const b = svg.current?.getBoundingClientRect();
      if (!b || !b.width) return;
      const hx = b.left + b.width * 0.5, hy = b.top + b.height * 0.28;
      const dx = e.clientX - hx, dy = e.clientY - hy;
      const d = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, d / 280);
      s.gazeT = [(dx / d) * 2.6 * k, (dy / d) * 1.8 * k];
      // Head turns toward the cursor too, a little.
      s.lookT = [(dx / d) * 4 * k, (dy / d) * 3 * k];
      s.lastPointer = now();
      // Wave back if the cursor comes close and he is free.
      const close = d < b.width * 0.9;
      if (close && !s.near && !s.busy && (POSES[s.pose] || POSES.idle).free.includes('R')) {
        setExpr('grin');
        s.busy = true;
        gsap.timeline({ onComplete: () => { s.busy = false; setExpr(null); } })
          .to(s.act, { w: 1, useR: 1, rx: 150, ry: 88, duration: 0.35, ease: 'back.out(1.6)', onStart: () => { s.act.useR = 1; s.act.useL = 0; } })
          .to(s.act, { rx: 158, duration: 0.18, yoyo: true, repeat: 5, ease: 'sine.inOut' })
          .to(s.act, { w: 0, duration: 0.4 });
      }
      s.near = close;
    };
    const onOver = (e) => el.root && svg.current?.classList.toggle('av-interested', !!e.target.closest?.('a, button'));
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver, { passive: true });

    // Scrolling makes him walk along with you; a hard flick startles him.
    const st = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const v = self.getVelocity();
        s.walkT = Math.min(1, Math.abs(v) / 900);
        s.leanT = gsap.utils.clamp(-6, 6, -v / 420);
        if (Math.abs(v) > 3400 && now() - s.startle > 2500) {
          s.startle = now();
          setExpr('o');
          setTimeout(() => setExpr(null), 700);
          s.hairV += 2.4;
        }
      },
    });

    let bt;
    const blink = () => {
      svg.current?.classList.add('av-blink');
      setTimeout(() => svg.current?.classList.remove('av-blink'), 120);
      bt = setTimeout(blink, Math.random() < 0.2 ? 250 : 2000 + Math.random() * 3200);
    };
    if (!reduce) bt = setTimeout(blink, 1400);

    const tick = (time, dtMs) => {
      const t = time, dt = Math.min(0.05, dtMs / 1000);
      const c = s.cur, A = s.act;
      if (now() > s.nextAct) {
        s.nextAct = now() + 3200 + Math.random() * 3000;
        if (s.walk < 0.2) act(ACTIONS[Math.floor(Math.random() * ACTIONS.length)]);
      }

      // Walking: follows scroll speed, eases out when scrolling stops.
      s.walkT *= 0.94;
      s.walk += (s.walkT - s.walk) * 0.12;
      s.phase += dt * (5 + s.walk * 7);
      const step = Math.sin(s.phase) * s.walk;
      const bob = Math.abs(Math.cos(s.phase)) * s.walk * 3;

      const P = POSES[s.pose] || POSES.idle;
      let lx = c.lx + Math.sin(t * 1.1) * 1.3, ly = c.ly + Math.sin(t * 1.7 + 1) * 1.2;
      let rx = c.rx + Math.sin(t * 1.3 + 2) * 1.3, ry = c.ry + Math.sin(t * 1.5) * 1.2;
      // Free hands swing while walking.
      if (P.free.includes('L')) { lx += step * 8; }
      if (P.free.includes('R')) { rx -= step * 8; }
      if (P.anim === 'wave') { rx += Math.sin(t * 9) * 8; ry += Math.cos(t * 9) * 2; }
      if (P.anim === 'type') { ly += Math.max(0, Math.sin(t * 15)) * -3; ry += Math.max(0, Math.sin(t * 15 + 1.7)) * -3; }
      if (A.useL) { lx += (A.lx - lx) * A.w; ly += (A.ly - ly) * A.w; }
      if (A.useR) { rx += (A.rx - rx) * A.w; ry += (A.ry - ry) * A.w + Math.sin(t * 22) * 2.5 * A.scratch; }
      const pk = c.pocket * (1 - (A.useL ? A.w : 0));
      ly += pk * 6;
      const shrug = A.shrug * 5;

      const SLs = [SL[0], SL[1] - shrug], SRs = [SR[0], SR[1] - shrug];
      const L = ik(SLs, [lx, ly - shrug * 0.5], -1);
      const R = ik(SRs, [rx, ry - shrug * 0.5], 1);
      el.uaL.setAttribute('d', `M${f(SLs[0])} ${f(SLs[1])} L${f(L.E[0])} ${f(L.E[1])}`);
      el.faL.setAttribute('d', `M${f(L.E[0])} ${f(L.E[1])} L${f(L.T[0])} ${f(L.T[1])}`);
      el.hL.setAttribute('cx', f(L.T[0])); el.hL.setAttribute('cy', f(L.T[1]));
      el.hL.style.opacity = pk > 0.5 ? 0 : 1;
      el.uaR.setAttribute('d', `M${f(SRs[0])} ${f(SRs[1])} L${f(R.E[0])} ${f(R.E[1])}`);
      el.faR.setAttribute('d', `M${f(R.E[0])} ${f(R.E[1])} L${f(R.T[0])} ${f(R.T[1])}`);
      el.hR.setAttribute('cx', f(R.T[0])); el.hR.setAttribute('cy', f(R.T[1]));

      // Legs: a stride while walking, otherwise a slow weight shift.
      const idleShift = Math.sin(t * 0.5) * 2;
      el.legL.setAttribute('transform', `rotate(${f(step * 16 + idleShift)} 89 206)`);
      el.legR.setAttribute('transform', `rotate(${f(-step * 16 + idleShift * 0.4)} 111 206)`);

      // Lean (spring) and hair follow-through.
      s.leanT *= 0.9;
      s.leanV += (s.leanT + A.lean * A.w - s.lean) * 60 * dt; s.leanV *= 0.82; s.lean += s.leanV * dt * 10;
      s.hairV += (-s.lean * 0.7 - s.hair) * 40 * dt + bob * 0.05; s.hairV *= 0.86; s.hair += s.hairV * dt * 12;

      const breath = Math.sin(t * 1.7) * 0.012;
      const h = s.hop;
      el.root.setAttribute('transform',
        `translate(100 ${f(292 + h.y - bob)}) rotate(${f(s.lean)}) scale(${h.sx.toFixed(3)} ${h.sy.toFixed(3)}) translate(-100 -292)`);
      el.torso.setAttribute('transform', `translate(0 ${f(-shrug * 0.6)}) translate(100 206) scale(1 ${(1 + breath).toFixed(4)}) translate(-100 -206)`);

      // Head: pose tilt + curiosity toward the cursor + actions + talking nod.
      if (now() - s.lastPointer > 2600 && !A.w) s.lookT = [0, 0];
      s.look[0] += (s.lookT[0] + A.hx * A.w - s.look[0]) * 0.08;
      s.look[1] += (s.lookT[1] + A.hy * A.w - s.look[1]) * 0.08;
      const nod = (s.talking ? Math.sin(t * 7) * 1.8 : 0) + Math.sin(t * 6) * 4 * A.nod;
      const tilt = c.tilt + Math.sin(t * 0.9) * 1.8 + s.look[0] * 0.9 + s.lean * 0.4 + nod;
      el.head.setAttribute('transform', `translate(0 ${f(-shrug * 0.8 + breath * -40)}) rotate(${f(tilt)} 100 120)`);
      el.hair.setAttribute('transform', `rotate(${f(s.hair)} 100 60)`);
      // Turning the head: the face slides a little inside it (a cheap 3/4 turn).
      el.face.setAttribute('transform', `translate(${f(s.look[0] * 0.9)} ${f(s.look[1] * 0.5)})`);

      if (now() - s.lastPointer > 2600 && t > s.sacc) {
        s.gazeT = [(Math.random() - 0.5) * 3.2, (Math.random() - 0.5) * 1.8];
        s.sacc = t + 0.7 + Math.random() * 2;
      }
      s.gaze[0] += (s.gazeT[0] - s.gaze[0]) * 0.3; s.gaze[1] += (s.gazeT[1] - s.gaze[1]) * 0.3;
      el.eyes.setAttribute('transform', `translate(${f(s.gaze[0])} ${f(s.gaze[1])})`);
    };

    applyPose('hello', false);
    if (reduce) tick(0, 16); else gsap.ticker.add(tick);
    r.current.poke = () => {
      jump(1.1);
      setExpr('grin');
      setTimeout(() => setExpr(null), 1400);
    };

    return () => {
      gsap.ticker.remove(tick);
      unsub();
      st.kill();
      clearTimeout(bt);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
    };
  }, []);

  const shownExpr = expr || POSES[pose]?.expr || 'smile';
  const set = (k) => (n) => { r.current[k] = n; };

  return (
    <svg
      ref={svg}
      className="avatar"
      viewBox="0 0 200 300"
      data-pose={pose}
      data-expr={shownExpr}
      data-talking={talking || undefined}
      onClick={() => { r.current.poke?.(); onPoke?.(); }}
      role="img"
      aria-label="Varun, illustrated"
    >
      <ellipse className="av-shadow" cx="100" cy="293" rx="38" ry="4.5" />
      <g className="prop prop-ocean">
        <path className="av-wave" d="M10 282 q10 -6 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" />
        <path className="av-wave av-wave-2" d="M0 291 q10 -6 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" />
      </g>

      <g ref={set('root')}>
        {/* legs */}
        <g ref={set('legL')}>
          <path className="av-denim" d="M76 204 L100 204 L98 282 L82 282 Z" />
          <rect className="av-shoe" x="76" y="279" width="25" height="11" rx="5.5" />
          <path className="av-sole" d="M77 288 H100" />
        </g>
        <g ref={set('legR')}>
          <path className="av-denim" d="M100 204 L124 204 L118 282 L102 282 Z" />
          <rect className="av-shoe" x="100" y="279" width="25" height="11" rx="5.5" />
          <path className="av-sole" d="M101 288 H124" />
        </g>
        <path className="av-seam" d="M88 210 L90 278 M112 210 L110 278" />
        <path className="av-pocket" d="M80 210 Q86 216 94 212" />

        {/* torso */}
        <g ref={set('torso')}>
          <path className="av-shirt" d="M72 134 C78 127 88 124 93 126 L100 138 L107 126 C112 124 122 127 128 134 L131 206 C118 211 82 211 69 206 Z" />
          <path className="av-shirt-hi" d="M76 140 Q80 172 76 204" />
          <path className="av-neck" d="M93 116 L107 116 L107 128 L100 138 L93 128 Z" />
          <path className="av-collar" d="M92 125 L100 140 L108 125" />
          <path className="av-collar-tip" d="M92 125 L87 133 L97 134 Z M108 125 L113 133 L103 134 Z" />
          <circle className="av-btn" cx="100" cy="154" r="1.3" />
          <circle className="av-btn" cx="100" cy="170" r="1.3" />
          <circle className="av-btn" cx="100" cy="186" r="1.3" />
        </g>

        {/* head: drawn from his photo. Longer oval face, forehead showing,
            thick wavy hair pushed up and back, short sides, thin silver frames,
            thick straight brows, a full moustache and light stubble. */}
        <g ref={set('head')}>
          <g ref={set('hair')}>
            {/* volume on top, pushed up and back */}
            <path className="av-hair" d="M67 80 C61 62 61 42 72 31 C80 18 97 11 111 15 C126 12 141 22 139 39 C144 50 140 64 133 80 C132 70 129 62 124 58 C118 55 112 57 106 54 C100 57 92 55 86 58 C80 57 74 62 72 69 C70 73 68 77 67 80 Z" />
            <path className="av-curl" d="M74 34 c-5 -7 3 -14 9 -8 M95 18 c0 -8 11 -9 12 -1 M118 18 c4 -7 13 -2 10 5 M135 34 c7 -2 9 7 2 9" />
          </g>
          <ellipse className="av-skin" cx="69.5" cy="92" rx="5" ry="8" />
          <ellipse className="av-skin" cx="130.5" cy="92" rx="5" ry="8" />
          <path className="av-skin" d="M70 74 C70 58 82 52 100 52 C118 52 130 58 130 74 L130 92 C130 112 118 125 100 125 C82 125 70 112 70 92 Z" />
          {/* light stubble along the jaw and chin */}
          <path className="av-stubble" d="M72 97 C75 114 87 125 100 125 C113 125 125 114 128 97 C125 107 119 113 113 113 C109 117 91 117 87 113 C81 113 75 107 72 97 Z" />
          {/* sideburns */}
          <path className="av-hair" d="M70 72 L74 72 L74 88 L71 86 Z M130 72 L126 72 L126 88 L129 86 Z" />
          {/* wave texture on top */}
          <path className="av-hair-hi" d="M76 46 q9 -9 19 -3 q9 5 17 -3 M80 33 q8 -8 17 -2 M110 27 q9 -6 18 2 M114 44 q8 -5 15 1" />

          <g ref={set('face')}>
            <path className="av-brow" d="M79 75.5 L94 73.5" />
            <path className="av-brow" d="M106 73.5 L121 75.5" />
            <ellipse className="av-white" cx="87" cy="84.5" rx="4.6" ry="3.1" />
            <ellipse className="av-white" cx="113" cy="84.5" rx="4.6" ry="3.1" />
            <g ref={set('eyes')}>
              <g className="eye-open">
                <circle className="av-iris" cx="87" cy="84.6" r="2.5" />
                <circle className="av-iris" cx="113" cy="84.6" r="2.5" />
                <circle className="av-glint" cx="87.9" cy="83.7" r="0.7" />
                <circle className="av-glint" cx="113.9" cy="83.7" r="0.7" />
              </g>
            </g>
            <path className="av-lid-line" d="M82 83 Q87 80.4 92 83 M108 83 Q113 80.4 118 83" />
            <path className="eye-closed" d="M82.5 85 Q87 87.5 91.5 85 M108.5 85 Q113 87.5 117.5 85" />
            <g className="av-glasses">
              <rect x="76.5" y="77" width="21" height="16" rx="7.5" />
              <rect x="102.5" y="77" width="21" height="16" rx="7.5" />
              <path d="M97.5 83 Q100 81 102.5 83 M76.5 82 L71 80.5 M123.5 82 L129 80.5" />
            </g>
            <path className="av-nose" d="M100 86 Q97 98 98.4 101.4 Q101 103 104 101.4" />
            <path className="av-stache" d="M89 107 Q94.5 102.2 100 103.8 Q105.5 102.2 111 107 Q105.5 108.6 100 107.6 Q94.5 108.6 89 107 Z" />
            <g className="av-mouths">
              <path className="m m-smile" d="M94.5 111.5 Q100 115 105.5 111.5" />
              <path className="m m-smirk" d="M95 112.5 Q101 113.6 106.5 110.2" />
              <path className="m m-focus" d="M96 112.5 L104 112.5" />
              <path className="m m-calm" d="M95.5 111.5 Q100 114 104.5 111.5" />
              <path className="m m-grin m-fill" d="M94 110.5 Q100 118.5 106 110.5 Z" />
              <ellipse className="m m-o m-fill" cx="100" cy="113" rx="2.2" ry="2.8" />
              <ellipse className="m m-yawn m-fill" cx="100" cy="113.5" rx="3.6" ry="4.6" />
              <ellipse className="m-talk m-fill" cx="100" cy="113" rx="3.2" ry="2.6" />
            </g>
            <path className="av-soul" d="M98.5 117.5 Q100 120 101.5 117.5 Z" />
          </g>

          <g className="prop prop-glacier">
            <path className="av-beanie" d="M58 70 C52 6 148 6 142 70 Z" />
            <rect className="av-beanie-band" x="56" y="60" width="88" height="12" rx="6" />
            <circle className="av-pom" cx="100" cy="14" r="7" />
          </g>
        </g>

        {/* arms */}
        <path ref={set('uaL')} className="av-sleeve" />
        <path ref={set('faL')} className="av-forearm" />
        <circle ref={set('hL')} className="av-hand" r="6.4" />
        <path ref={set('uaR')} className="av-sleeve" />
        <path ref={set('faR')} className="av-forearm" />
        <circle ref={set('hR')} className="av-hand" r="6.4" />

        {/* hand props */}
        <g className="prop prop-curious">
          <circle className="av-lens" cx="38" cy="122" r="11" />
          <path className="av-handle" d="M43 132 L48 142" />
          <text className="av-mark" x="150" y="44">?</text>
          <text className="av-mark av-mark-2" x="162" y="66">?</text>
        </g>
        <g className="prop prop-glacier">
          <rect className="av-device" x="79" y="148" width="44" height="29" rx="3" />
          <polyline className="av-chart" points="84,171 91,167 97,169 104,163 110,164 117,153" />
          <circle className="av-alert" cx="117" cy="153" r="2.6" />
          <circle className="av-snow" cx="40" cy="40" r="1.8" /><circle className="av-snow s2" cx="160" cy="30" r="1.5" /><circle className="av-snow s3" cx="150" cy="100" r="1.8" /><circle className="av-snow s4" cx="30" cy="110" r="1.4" />
        </g>
        <g className="prop prop-scam">
          <rect className="av-device" x="47" y="110" width="21" height="36" rx="3.5" />
          <circle className="av-alert-big" cx="57.5" cy="124" r="5.5" />
          <path className="av-alert-mark" d="M57.5 121 V125 M57.5 127.2 V127.4" />
          <path className="av-line" d="M150 156 L156 216" />
          <path className="av-hook" d="M156 216 q0 8 -6 8 q-5 0 -5 -5" />
          <rect className="av-letter" x="141" y="222" width="22" height="15" rx="2" />
          <path className="av-letter-flap" d="M141 223 L152 231 L163 223" />
        </g>
        <g className="prop prop-ocean">
          <rect className="av-float" x="142" y="90" width="13" height="44" rx="6.5" />
          <path className="av-antenna" d="M148.5 90 V76 M144 76 H153" />
          <path className="av-float-band" d="M142 106 H155 M142 116 H155" />
        </g>
        <g className="prop prop-local">
          <rect className="av-device" x="76" y="148" width="50" height="32" rx="3" />
          <path className="av-lock-icon" d="M96 162 V158 a5 5 0 0 1 10 0 V162" />
          <rect className="av-lock-body" x="94" y="161.5" width="14" height="10" rx="2" />
          <rect className="av-base" x="70" y="179" width="62" height="5" rx="2.5" />
          <path className="av-cloud" d="M146 50 a7 7 0 0 1 13 -3 a6 6 0 0 1 8 8 h-21 a4 4 0 0 1 0 -5" />
          <path className="av-slash" d="M144 62 L170 38" />
        </g>
        <g className="prop prop-calm">
          <path className="av-steam" d="M97 138 q-3 -5 0 -10 q3 -5 0 -10 M105 138 q-3 -5 0 -10 q3 -5 0 -10" />
          <rect className="av-mug" x="91" y="140" width="21" height="21" rx="3.5" />
          <path className="av-mug-handle" d="M112 145 a5 5 0 0 1 0 11" />
          <path className="av-heart" d="M140 60 c-3 -5 -11 -2 -8 4 l8 8 l8 -8 c3 -6 -5 -9 -8 -4 z" />
        </g>
        <g className="prop prop-building">
          <rect className="av-lid" x="72" y="156" width="58" height="34" rx="3" />
          <circle className="av-logo" cx="101" cy="173" r="3.5" />
          <rect className="av-base" x="66" y="189" width="70" height="5" rx="2.5" />
          <text className="av-code" x="138" y="58">{'</>'}</text>
          <g className="av-gear-g"><path className="av-gear" d="M48 52 m-7 0 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0 M48 41 V45 M48 59 V63 M37 52 H41 M55 52 H59" /></g>
        </g>
        <g className="prop prop-trophy">
          <path className="av-cup" d="M135 32 H157 L155 46 C153 55 139 55 137 46 Z" />
          <path className="av-cup-h" d="M135 35 q-7 0 -5 7 q2 5 7 4 M157 35 q7 0 5 7 q-2 5 -7 4" />
          <rect className="av-cup" x="143.5" y="53" width="5" height="6" />
          <rect className="av-cup" x="138" y="58" width="16" height="4" rx="1.5" />
          <rect className="av-confetti" x="40" y="40" width="4" height="7" rx="1" /><rect className="av-confetti c2" x="170" y="20" width="4" height="7" rx="1" /><rect className="av-confetti c3" x="60" y="16" width="4" height="7" rx="1" /><rect className="av-confetti c4" x="120" y="8" width="4" height="7" rx="1" />
        </g>
        <g className="prop prop-contact">
          <rect className="av-letter" x="39" y="142" width="27" height="19" rx="2" />
          <path className="av-letter-flap" d="M39 143 L52.5 153 L66 143" />
        </g>
      </g>
    </svg>
  );
}
