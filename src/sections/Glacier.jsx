import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ArrowUpRight } from '@phosphor-icons/react';
import { glacier } from '../data';
import { prefersReducedMotion } from '../lib/scroll';
import { useReveal } from '../lib/reveal';
import Ghost from '../components/Ghost';

// A plausible lake-level trace: a slow seasonal rise, sensor noise, then a sharp surge.
const W = 560, H = 300, N = 72, SURGE = 54;
const trace = (() => {
  let s = 11;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280) - 0.5;
  const pts = [];
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    let y = 0.32 + 0.12 * Math.sin(t * 5.2) + t * 0.16 + rnd() * 0.05;
    if (i >= SURGE) y += Math.pow((i - SURGE) / (N - SURGE), 1.6) * 0.42;
    pts.push([t * W, H - Math.min(0.96, y) * H]);
  }
  return pts;
})();
const pathD = trace.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
const surgeD = trace.slice(SURGE).map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
const threshold = H * 0.28;
const [ax, ay] = trace[N - 1];

export default function Glacier() {
  const scope = useRef(null);
  const [step, setStep] = useState(0);
  useReveal(scope);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const full = () => {
        gsap.set('.trace, .surge', { strokeDashoffset: 0 });
        gsap.set('.alarm', { autoAlpha: 1 });
        setStep(3);
      };
      if (prefersReducedMotion()) return full();

      // Gap longer than the dash so the round cap never shows as a stray dot.
      ['.trace', '.surge'].forEach((sel) => {
        const l = scope.current.querySelector(sel).getTotalLength();
        gsap.set(sel, { strokeDasharray: `${l} ${l + 20}`, strokeDashoffset: l + 10 });
      });
      gsap.set('.alarm', { autoAlpha: 0, scale: 0.6, transformOrigin: '50% 50%' });

      const build = (pinIt) => {
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: pinIt ? '.glacier-stage' : '.glacier-chart',
            start: pinIt ? 'top top' : 'top 80%',
            end: pinIt ? '+=130%' : 'bottom 40%',
            pin: pinIt,
            scrub: 0.6,
            onUpdate: (self) => setStep(Math.min(3, Math.floor(self.progress * 4.2))),
          },
        });
        tl.to('.trace', { strokeDashoffset: 0, duration: 0.75 })
          .to('.surge', { strokeDashoffset: 0, duration: 0.15 }, 0.72)
          .to('.alarm', { autoAlpha: 1, scale: 1, duration: 0.08, ease: 'back.out(3)' }, 0.86)
          .to({}, { duration: 0.1 });
      };
      mm.add('(min-width: 960px)', () => build(true));
      mm.add('(max-width: 959px)', () => build(false));
    },
    { scope }
  );

  return (
    <section id="glacier" className="chapter glacier" ref={scope} aria-labelledby="glacier-h">
      <Ghost>SIH 2024</Ghost>
      <div className="glacier-stage">
        <div className="glacier-copy">
          <h2 id="glacier-h" className="h2" data-split>
            First real stakes: a lake <em>that could burst.</em>
          </h2>
          <p className="lede" data-reveal>
            Smart India Hackathon 2024, with a problem statement from DRDO. Glacial lakes in the Himalaya can break
            through their moraine walls with little warning. Our team built an early warning system, and I led the
            machine learning.
          </p>
          <ol className="steps">
            {glacier.steps.map((s, i) => (
              <li key={s.k} className={i <= step ? 'is-on' : ''} aria-current={i === step ? 'step' : undefined}>
                <span className="step-k">{s.k}</span>
                <div>
                  <h3>{s.t}</h3>
                  <div className="step-d"><p>{s.d}</p></div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <figure className="glacier-chart">
          <svg viewBox={`-8 -24 ${W + 16} ${H + 48}`} role="img" aria-label="Lake water level trace, rising slowly then surging past the alert threshold">
            {[0.25, 0.5, 0.75].map((g) => (
              <line key={g} className="grid" x1="0" x2={W} y1={H * g} y2={H * g} />
            ))}
            <line className="threshold" x1="0" x2={W} y1={threshold} y2={threshold} />
            <text className="chart-note" x="0" y={threshold - 10}>alert threshold</text>
            <path className="trace" d={pathD} />
            <path className="surge" d={surgeD} />
            <g className="alarm">
              <circle className="alarm-ring" cx={ax} cy={ay} r="16" />
              <circle className="alarm-dot" cx={ax} cy={ay} r="6" />
            </g>
          </svg>
          <figcaption>
            <span>Water level, illustrative trace</span>
            <strong className={step >= 3 ? 'is-hot' : ''}>{step >= 3 ? 'Alert sent' : 'Watching'}</strong>
          </figcaption>
        </figure>
      </div>

      <div className="glacier-after" data-reveal>
        <p className="big-claim">We won.</p>
        <ul className="link-row">
          {glacier.links.map((l) => (
            <li key={l.href}>
              <a className="text-link" href={l.href} target="_blank" rel="noreferrer">
                {l.label} <ArrowUpRight aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
