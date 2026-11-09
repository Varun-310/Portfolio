import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowUpRight, LockSimple } from '@phosphor-icons/react';
import { impact, person } from '../data';
import { prefersReducedMotion } from '../lib/scroll';
import { setProjectPose } from '../lib/pose';
import { useReveal } from '../lib/reveal';
import Ghost from '../components/Ghost';

// Each project gets a small live demo of the effect it has.
function Demo({ kind }) {
  if (kind === 'scam')
    return (
      <div className="demo demo-chat" aria-hidden="true">
        <p className="msg them" style={{ '--d': 0 }}>Your KYC is blocked. Pay Rs 10 to verify: kyc.help@okpay</p>
        <p className="msg me" style={{ '--d': 1 }}>Oh no. Which bank is this? Can you call me?</p>
        <p className="msg them" style={{ '--d': 2 }}>Call 98XXX XXX21 now sir, very urgent</p>
        <div className="intel" style={{ '--d': 3 }}>
          <span>Extracted</span>
          <b>UPI ID</b><b>Phone</b><b>Urgency script</b>
        </div>
      </div>
    );
  if (kind === 'ocean')
    return (
      <div className="demo demo-ocean" aria-hidden="true">
        <p className="msg me" style={{ '--d': 0 }}>How does salinity change with depth in the Bay of Bengal?</p>
        <svg viewBox="0 0 260 150" className="profile" style={{ '--d': 1 }}>
          <path className="axis" d="M30 10 V140 H250" />
          <path className="curve c1" d="M60 14 C120 30 150 60 170 90 S200 130 210 138" />
          <path className="curve c2" d="M50 14 C90 40 130 70 150 100 S180 132 190 138" />
          <text x="32" y="148">surface</text>
          <text x="196" y="148">depth</text>
        </svg>
        <p className="msg them" style={{ '--d': 2 }}>Fresher near the surface from river inflow, rising sharply below 50 m.</p>
      </div>
    );
  if (kind === 'local')
    return (
      <div className="demo demo-local" aria-hidden="true">
        <div className="machine">
          <span className="chip-k">Llama 3, local</span>
          <span className="net">Network off</span>
        </div>
        {['Critical: outdated OpenSSL on 2 hosts', 'High: default admin password on router', 'Medium: TLS 1.0 still enabled', 'Fixes ranked by effort and risk'].map((l, i) => (
          <p key={l} className="report-line" style={{ '--d': i }}>{l}</p>
        ))}
      </div>
    );
  return (
    <div className="demo demo-calm" aria-hidden="true">
      <p className="msg me" style={{ '--d': 0 }}>I can't sleep. Everything feels like too much.</p>
      <div className="mood" style={{ '--d': 1 }}>
        <span>heavy</span>
        <i><b /></i>
        <span>heard</span>
      </div>
      <p className="msg them" style={{ '--d': 2 }}>That sounds exhausting. Want to tell me what's weighing on you most tonight?</p>
    </div>
  );
}

const POSE = { scam: 'scam', ocean: 'ocean', local: 'local', calm: 'calm' };

export default function Impact() {
  const scope = useRef(null);
  const [cur, setCur] = useState(0);
  useReveal(scope);

  useGSAP(
    () => {
      const cases = gsap.utils.toArray('.case');
      // He only picks up a project's props while the showcase is on screen.
      let inside = false;
      let last = 0;
      const focus = (i) => {
        last = i;
        setCur(i);
        cases.forEach((c, k) => c.classList.toggle('is-live', k === i));
        if (inside) setProjectPose(POSE[impact[i].demo]);
      };
      const enter = () => { inside = true; setProjectPose(POSE[impact[last].demo]); };
      const leave = () => { inside = false; setProjectPose(null); };
      const toggle = (self) => (self.isActive ? enter() : leave());
      const mm = gsap.matchMedia();

      mm.add('(min-width: 960px) and (prefers-reduced-motion: no-preference)', () => {
        const track = scope.current.querySelector('.cases');
        const dist = () => track.scrollWidth - window.innerWidth;
        const pan = gsap.to(track, {
          x: () => -dist(),
          ease: 'none',
          scrollTrigger: {
            trigger: '.impact-pin',
            start: 'top top',
            end: () => `+=${dist()}`,
            pin: true,
            scrub: 0.7,
            invalidateOnRefresh: true,
            onToggle: toggle,
          },
        });
        cases.forEach((c, i) => {
          ScrollTrigger.create({
            trigger: c,
            containerAnimation: pan,
            start: 'left 55%',
            end: 'right 55%',
            onToggle: (s) => s.isActive && focus(i),
          });
          // The demo card drifts against the movement a little, for depth.
          gsap.fromTo(c.querySelector('.demo-wrap'), { x: 80 }, {
            x: -80, ease: 'none',
            scrollTrigger: { trigger: c, containerAnimation: pan, start: 'left right', end: 'right left', scrub: true },
          });
        });
      });

      mm.add('(max-width: 959px), (prefers-reduced-motion: reduce)', () => {
        cases.forEach((c, i) =>
          ScrollTrigger.create({
            trigger: c, start: 'top 60%', end: 'bottom 40%',
            onToggle: (s) => (s.isActive ? focus(i) : null),
          })
        );
        ScrollTrigger.create({ trigger: '.cases', start: 'top 60%', end: 'bottom 40%', onToggle: toggle });
      });
    },
    { scope }
  );

  return (
    <section id="impact" className="impact" ref={scope} aria-labelledby="impact-h">
      <div className="impact-pin">
        <Ghost>impact</Ghost>
        <div className="impact-head">
          <h2 id="impact-h" className="h2" data-split>
            Work that <em>moved something.</em>
          </h2>
          <p className="impact-count" aria-hidden="true">
            <span key={cur}>{String(cur + 1).padStart(2, '0')}</span> / {String(impact.length).padStart(2, '0')}
          </p>
        </div>
        <div className="cases">
          {impact.map((p, i) => (
            <article key={p.id} className={`case ${i === 0 ? 'is-live' : ''}`} aria-labelledby={`case-${p.id}`}>
              <div className="case-copy">
                <p className="case-tag">{p.tag}</p>
                <h3 id={`case-${p.id}`} className="case-name">{p.name}</h3>
                <dl className="case-story">
                  <div><dt>Problem</dt><dd>{p.problem}</dd></div>
                  <div><dt>What I built</dt><dd>{p.built}</dd></div>
                  <div className="effect"><dt>Effect</dt><dd>{p.effect}</dd></div>
                </dl>
                <div className="case-foot">
                  <ul className="case-tech" aria-label="Built with">
                    {p.tech.map((t) => <li key={t}>{t}</li>)}
                  </ul>
                  {p.private ? (
                    <a className="text-link" href={`mailto:${person.email}?subject=${encodeURIComponent(`Walkthrough of ${p.name}`)}`}>
                      <LockSimple weight="bold" aria-hidden="true" /> Private repo, ask for a walkthrough
                    </a>
                  ) : (
                    <a className="text-link" href={p.repo} target="_blank" rel="noreferrer">
                      See the code <ArrowUpRight aria-hidden="true" /><span className="sr-only"> for {p.name} on GitHub</span>
                    </a>
                  )}
                </div>
              </div>
              <div className="demo-wrap">
                <Demo kind={p.demo} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
