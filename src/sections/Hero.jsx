import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { SplitText } from 'gsap/SplitText';
import { ArrowDownRight, ArrowUpRight } from '@phosphor-icons/react';
import { askMe, person } from '../data';
import { scrollToId, prefersReducedMotion } from '../lib/scroll';
import { setTalking } from '../lib/pose';
import { EASE } from '../lib/reveal';

const INTRO = "Ask me something. I'll keep it short.";

// Streams an answer a few characters at a time, like a model generating tokens.
// While it streams, the character talks.
function useStream() {
  const [text, setText] = useState(INTRO);
  const [busy, setBusy] = useState(false);
  const timer = useRef();
  const play = (full) => {
    clearInterval(timer.current);
    if (prefersReducedMotion()) {
      setText(full);
      return;
    }
    let i = 0;
    setBusy(true);
    setTalking(true);
    setText('');
    timer.current = setInterval(() => {
      i = Math.min(full.length, i + 2 + Math.floor(Math.random() * 3));
      setText(full.slice(0, i));
      if (i >= full.length) {
        clearInterval(timer.current);
        setBusy(false);
        setTalking(false);
      }
    }, 28);
  };
  useEffect(() => () => { clearInterval(timer.current); setTalking(false); }, []);
  return { text, busy, play };
}

export default function Hero() {
  const scope = useRef(null);
  const [asked, setAsked] = useState(-1);
  const { text, busy, play } = useStream();

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const split = SplitText.create('.hero-title', { type: 'lines,words', mask: 'lines', linesClass: 'ln' });
      gsap.timeline({ defaults: { ease: EASE } })
        .from('.hero-stage .arch', { yPercent: 10, autoAlpha: 0, duration: 1.2 }, 0)
        .from(split.words, { yPercent: 115, duration: 1.2, stagger: 0.06 }, 0.15)
        .from('.hero-sub, .hero-ctas, .ask', { y: 20, autoAlpha: 0, duration: 1, stagger: 0.1 }, 0.7);
      // As he walks off, the empty arch sinks away behind him.
      gsap.fromTo('.hero-stage .arch', { yPercent: 0, autoAlpha: 1 }, {
        yPercent: 14, autoAlpha: 0, ease: 'power1.in', immediateRender: false,
        scrollTrigger: { trigger: scope.current, start: 'top top', end: 'bottom top', scrub: true },
      });
      return () => split.revert();
    },
    { scope }
  );

  const ask = (i) => {
    setAsked(i);
    play(askMe[i].a);
  };

  return (
    <header id="top" className="hero" ref={scope}>
      <div className="hero-copy">
        <h1 className="hero-title">
          Messy inputs in. <em>Useful answers</em> out.
        </h1>
        <p className="hero-sub">
          I'm Varun, an AI engineer who takes problems apart until they make sense, then builds what fixes them.
        </p>
        <div className="hero-ctas">
          <button type="button" className="btn btn-solid" onClick={() => scrollToId('impact')}>
            See the work <ArrowDownRight weight="bold" aria-hidden="true" />
          </button>
          <a className="btn btn-ghost" href={`mailto:${person.email}`}>
            Email me <ArrowUpRight weight="bold" aria-hidden="true" />
          </a>
        </div>
        <div className="ask">
          <p className="ask-label">Ask me</p>
          <div className="ask-chips" role="group" aria-label="Ask Varun">
            {askMe.map((x, i) => (
              <button
                key={x.q}
                type="button"
                className={`chip ${asked === i ? 'is-on' : ''}`}
                aria-pressed={asked === i}
                onClick={() => ask(i)}
              >
                {x.q}
              </button>
            ))}
          </div>
          {/* On phones the answer shows right under the questions. */}
          {asked >= 0 && (
            <p className="ask-inline" aria-live="polite">
              {text}
              {busy && <span className="caret" />}
            </p>
          )}
        </div>
      </div>

      <div className="hero-visual">
        <div className="hero-stage">
          <div className="arch" aria-hidden="true" />
          <div className="avatar-slot" />
          <p className={`ask-bubble ${busy ? 'is-busy' : ''}`} aria-live="polite">
            {text}
            {busy && <span className="caret" aria-hidden="true" />}
          </p>
        </div>
      </div>
    </header>
  );
}
