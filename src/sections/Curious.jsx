import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { curious, education } from '../data';
import { prefersReducedMotion } from '../lib/scroll';
import { useReveal } from '../lib/reveal';
import Ghost from '../components/Ghost';

// About, told as curiosity: the paragraph is "read" as you scroll, then the
// questions behind the projects stream past, speeding up with your scroll.
export default function Curious() {
  const scope = useRef(null);
  useReveal(scope);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      gsap.fromTo(
        '.read-word',
        { opacity: 0.14 },
        {
          opacity: 1,
          ease: 'none',
          stagger: 0.1,
          scrollTrigger: { trigger: '.curious-text', start: 'top 80%', end: 'bottom 55%', scrub: 0.4 },
        }
      );
      // The photo rises slower than the page and sharpens into place.
      gsap.fromTo('.real-frame', { yPercent: 14, rotate: -3 }, {
        yPercent: -6, rotate: 1.5, ease: 'none',
        scrollTrigger: { trigger: '.curious-grid', start: 'top bottom', end: 'bottom top', scrub: 0.8 },
      });

      // Two rows of questions drift in opposite directions; scrolling pushes them
      // faster and scrolling up reverses them.
      const rows = gsap.utils.toArray('.q-row-track').map((el, i) => ({
        el,
        x: i % 2 ? -el.scrollWidth / 2 : 0,
        dir: i % 2 ? 1 : -1,
        setX: gsap.quickSetter(el, 'x', 'px'),
      }));
      let boost = 0;
      let flip = 1;
      let visible = false;
      const tick = (time, dt) => {
        if (!visible) return;
        boost *= 0.92;
        const speed = (36 + boost) * (dt / 1000);
        rows.forEach((r) => {
          const half = r.el.scrollWidth / 2;
          r.x += r.dir * flip * speed;
          if (r.x <= -half) r.x += half;
          if (r.x > 0) r.x -= half;
          r.setX(r.x);
        });
      };
      gsap.ticker.add(tick);
      ScrollTrigger.create({
        trigger: '.questions',
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => { visible = self.isActive; },
        onUpdate: (self) => {
          flip = self.direction;
          boost = Math.min(900, Math.abs(self.getVelocity()) * 0.5);
        },
      });
      return () => gsap.ticker.remove(tick);
    },
    { scope }
  );

  return (
    <section id="curious" className="chapter curious" ref={scope} aria-labelledby="curious-h">
      <Ghost>curious</Ghost>
      <div className="curious-grid">
        <div>
          <h2 id="curious-h" className="h2" data-split>
            I take things apart <em>until they make sense.</em>
          </h2>
          <p className="curious-text">
            {curious.text.split(' ').map((w, i) => (
              <span key={i} className="read-word">{w} </span>
            ))}
          </p>
        </div>
        <figure className="real">
          <div className="real-frame">
            <img src="/varun.png" alt="Varun K S, in a black shirt and round glasses" width="400" height="400" loading="lazy" />
          </div>
          <figcaption>The real one. Same glasses, same hair.</figcaption>
        </figure>
      </div>

      <div className="questions" aria-label="Questions behind the projects">
        {curious.questions.map((row, i) => (
          <div key={i} className="q-row">
            <div className="q-row-track">
              {[...row, ...row].map((q, k) => (
                <span key={k} className="q" aria-hidden={k >= row.length}>
                  {q}
                  <span className="q-dot" aria-hidden="true" />
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <dl className="origin-meta" data-reveal>
        <div><dt>Studied</dt><dd>{education.degree}</dd></div>
        <div><dt>At</dt><dd>{education.school}, {education.when}</dd></div>
      </dl>
    </section>
  );
}
