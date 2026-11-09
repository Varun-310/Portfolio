import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Moon, Sun } from '@phosphor-icons/react';
import { nav, person } from '../data';
import { scrollToId } from '../lib/scroll';
import { openResume } from './ResumeViewer';

const readTheme = () => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');

// Rolling label: the word slides up and a copy slides in from below on hover.
const Roll = ({ children }) => (
  <span className="roll" data-text={children}><span>{children}</span></span>
);

// A floating pill. A highlight slides to whichever section you are reading,
// a thin progress line fills along its bottom edge, and it tightens once you scroll.
export default function Nav() {
  const [theme, setTheme] = useState(readTheme);
  const [active, setActive] = useState(-1);
  const bar = useRef(null);
  const links = useRef([]);
  const pill = useRef(null);
  const prog = useRef(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#E6E3D7' : '#0F1512');
  }, [theme]);

  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        bar.current?.classList.toggle('is-scrolled', self.scroll() > 40);
        prog.current?.style.setProperty('transform', `scaleX(${self.progress.toFixed(4)})`);
      },
    });
    const ts = nav.map((n, i) => {
      const el = document.getElementById(n.id);
      return el && ScrollTrigger.create({
        trigger: el, start: 'top 50%', end: 'bottom 50%',
        onToggle: (s) => (s.isActive ? setActive(i) : setActive((a) => (a === i ? -1 : a))),
      });
    });
    return () => { st.kill(); ts.forEach((t) => t && t.kill()); };
  }, []);

  // Move the highlight under the active link.
  useLayoutEffect(() => {
    const p = pill.current;
    const a = links.current[active];
    if (!p) return;
    if (!a) { p.style.opacity = 0; return; }
    p.style.opacity = 1;
    p.style.width = `${a.offsetWidth}px`;
    p.style.transform = `translateX(${a.offsetLeft}px)`;
  }, [active]);

  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    try { localStorage.setItem('theme', next); } catch { /* storage unavailable */ }
  };
  const go = (e, id) => { e.preventDefault(); scrollToId(id); };

  return (
    <div className="nav" ref={bar}>
      <a className="nav-name" href="#top" onClick={(e) => go(e, 'top')}>
        <span className="nav-mark" aria-hidden="true">V</span>
        <span className="nav-who"><Roll>{person.name}</Roll></span>
      </a>
      <nav className="nav-links" aria-label="Sections">
        <span className="nav-pill" ref={pill} aria-hidden="true" />
        {nav.map((l, i) => (
          <a
            key={l.id}
            ref={(n) => (links.current[i] = n)}
            href={`#${l.id}`}
            className={i === active ? 'is-on' : ''}
            aria-current={i === active ? 'true' : undefined}
            onClick={(e) => go(e, l.id)}
          >
            <Roll>{l.label}</Roll>
          </a>
        ))}
      </nav>
      <div className="nav-end">
        <a className="nav-resume" href={person.resume} onClick={(e) => { e.preventDefault(); openResume(); }} aria-haspopup="dialog"><Roll>Resume</Roll></a>
        <button
          type="button"
          className="icon-btn"
          onClick={toggle}
          aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
        >
          {theme === 'light' ? <Moon weight="bold" /> : <Sun weight="bold" />}
        </button>
        <a className="btn btn-small" href={`mailto:${person.email}`}><Roll>Email me</Roll></a>
      </div>
      <span className="nav-progress" ref={prog} aria-hidden="true" />
    </div>
  );
}
