import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowUpRight, Copy, Check, DownloadSimple, FileText, GithubLogo, LinkedinLogo } from '@phosphor-icons/react';
import { openResume } from '../components/ResumeViewer';
import { building, toolkit, usedIn, milestones, certifications, person } from '../data';
import { prefersReducedMotion } from '../lib/scroll';
import { useReveal } from '../lib/reveal';
import Ghost from '../components/Ghost';

export function Building() {
  const scope = useRef(null);
  const [tool, setTool] = useState(null);
  useReveal(scope);
  useGSAP(
    () => {
      // Each line of exploration slides in as its own row, and the
      // "in progress" bars keep filling while it is on screen.
      if (prefersReducedMotion()) return;
      gsap.utils.toArray('.explore li').forEach((li, i) => {
        gsap.fromTo(li, { x: i % 2 ? 80 : -80, autoAlpha: 0 }, {
          x: 0, autoAlpha: 1, ease: 'power3.out',
          scrollTrigger: { trigger: li, start: 'top 95%', end: 'top 60%', scrub: 0.6 },
        });
      });
    },
    { scope }
  );
  return (
    <section id="building" className="chapter building" ref={scope} aria-labelledby="building-h">
      <Ghost>building</Ghost>
      <h2 id="building-h" className="h2" data-split>
        Still curious. <em>Still building.</em>
      </h2>
      <p className="lede" data-reveal>{building.lede}</p>
      <ol className="explore">
        {building.exploring.map((x, i) => (
          <li key={x.t}>
            <span className="explore-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
            <div>
              <h3>{x.t}</h3>
              <p>{x.d}</p>
            </div>
            <span className="wip" aria-label="In progress"><i /></span>
          </li>
        ))}
      </ol>
      <p className="more" data-reveal>
        New things land on{' '}
        <a className="text-link" href={person.github} target="_blank" rel="noreferrer">
          GitHub <ArrowUpRight aria-hidden="true" />
        </a>
      </p>

      <div className="toolkit" data-reveal>
        <div className="toolkit-head">
          <h3 className="h3">Toolkit</h3>
          <p className="toolkit-hint" aria-live="polite">
            {tool ? <><strong>{tool}</strong>: {usedIn(tool).join(', ')}</> : 'Point at a tool to see where I used it.'}
          </p>
        </div>
        <div className="toolkit-groups">
          {toolkit.map((g) => (
            <div key={g.group} className="tool-group">
              <p className="tool-group-name">{g.group}</p>
              <ul>
                {g.items.map((t) => (
                  <li key={t}>
                    <button
                      type="button"
                      className={`tool ${tool === t ? 'is-on' : ''}`}
                      onPointerEnter={() => setTool(t)}
                      onFocus={() => setTool(t)}
                      onClick={() => setTool(t)}
                    >
                      {t}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Along() {
  const scope = useRef(null);
  useReveal(scope);
  useGSAP(
    () => {
      gsap.utils.toArray('.milestones li').forEach((li) =>
        ScrollTrigger.create({ trigger: li, start: 'top 72%', toggleClass: { targets: li, className: 'is-reached' }, once: true })
      );
      if (prefersReducedMotion()) return gsap.set('.m-line', { scaleY: 1 });
      gsap.fromTo('.m-line', { scaleY: 0 }, {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: { trigger: '.milestones', start: 'top 72%', end: 'bottom 72%', scrub: 0.4 },
      });
      gsap.utils.toArray('.milestones li').forEach((li) =>
        gsap.from(li.querySelectorAll('.m-body, .m-result, .m-when'), {
          x: 30, autoAlpha: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08,
          scrollTrigger: { trigger: li, start: 'top 80%', once: true },
        })
      );
    },
    { scope }
  );
  return (
    <section id="along" className="chapter along" ref={scope} aria-labelledby="along-h">
      <Ghost>milestones</Ghost>
      <h2 id="along-h" className="h2" data-split>
        Markers <em>along the way.</em>
      </h2>
      <div className="timeline">
        <span className="m-track" aria-hidden="true"><span className="m-line" /></span>
        <ol className="milestones">
          {milestones.map((m) => (
            <li key={m.what} className={m.win ? 'is-win' : ''}>
              <span className="m-when">{m.when}</span>
              <div className="m-body">
                <h3>{m.what}</h3>
                <p>{m.note}</p>
              </div>
              <span className="m-result">{m.result}</span>
            </li>
          ))}
        </ol>
      </div>
      <details className="certs" data-reveal>
        <summary>Certifications ({certifications.length})</summary>
        <ul>{certifications.map((c) => <li key={c}>{c}</li>)}</ul>
      </details>
    </section>
  );
}

export function Next() {
  const scope = useRef(null);
  const [copied, setCopied] = useState(false);
  useReveal(scope);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from('.next .arch', {
        yPercent: 20, autoAlpha: 0, ease: 'power2.out',
        scrollTrigger: { trigger: scope.current, start: 'top 90%', end: 'top 35%', scrub: 0.6 },
      });
      gsap.from('.mail-link', {
        backgroundSize: '0% 2px', duration: 1.4, ease: 'expo.out',
        scrollTrigger: { trigger: '.mail-link', start: 'top 85%', once: true },
      });
    },
    { scope }
  );
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(person.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${person.email}`;
    }
  };
  return (
    <section id="next" className="chapter next" ref={scope} aria-labelledby="next-h">
      <div className="next-top">
        <div>
          <h2 id="next-h" className="h1" data-split>
            Got a messy problem? <em>Let's talk.</em>
          </h2>
          <div className="mail" data-reveal>
            <a className="mail-link" href={`mailto:${person.email}`}>{person.email}</a>
            <button type="button" className="icon-btn" onClick={copy} aria-label={copied ? 'Email copied' : 'Copy email address'}>
              {copied ? <Check weight="bold" /> : <Copy weight="bold" />}
            </button>
            <span className="copied" aria-live="polite">{copied ? 'Copied' : ''}</span>
          </div>
          <ul className="next-links" data-reveal>
            <li><a className="btn btn-ghost" href={person.github} target="_blank" rel="noreferrer"><GithubLogo weight="bold" aria-hidden="true" /> GitHub</a></li>
            <li><a className="btn btn-ghost" href={person.linkedin} target="_blank" rel="noreferrer"><LinkedinLogo weight="bold" aria-hidden="true" /> LinkedIn</a></li>
            <li><button type="button" className="btn btn-ghost" onClick={openResume} aria-haspopup="dialog"><FileText weight="bold" aria-hidden="true" /> View resume</button></li>
            <li><a className="btn btn-ghost" href={person.resume} download="Varun_K_S_Resume.pdf"><DownloadSimple weight="bold" aria-hidden="true" /> Download resume</a></li>
          </ul>
        </div>
        <div className="next-stage">
          <div className="arch" aria-hidden="true" />
          <div className="avatar-slot" />
        </div>
      </div>
      <footer className="foot">
        <span>Designed and built by {person.name}, {new Date().getFullYear()}.</span>
        <span className="foot-quiet">{person.interning}</span>
        <span>{person.location}</span>
      </footer>
    </section>
  );
}
