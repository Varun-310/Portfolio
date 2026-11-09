import { useEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Nav from './components/Nav';
import Companion from './components/Companion';
import ResumeViewer from './components/ResumeViewer';
import Hero from './sections/Hero';
import Curious from './sections/Curious';
import Glacier from './sections/Glacier';
import Impact from './sections/Impact';
import { Building, Along, Next } from './sections/Rest';
import { startSmoothScroll } from './lib/scroll';

export default function App() {
  useEffect(() => {
    const stop = startSmoothScroll();
    // Measure every trigger once all sections have mounted, then again when
    // fonts and images have settled (layout shifts move trigger positions).
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    const onLoad = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(onLoad);
    window.addEventListener('load', onLoad);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('load', onLoad);
      stop();
    };
  }, []);

  return (
    <>
      {/* Duotone used on the real photo: shadows to ink, highlights to paper. */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
        <filter id="duotone" colorInterpolationFilters="sRGB">
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncR type="table" tableValues="0.059 0.902" />
            <feFuncG type="table" tableValues="0.082 0.890" />
            <feFuncB type="table" tableValues="0.071 0.843" />
          </feComponentTransfer>
        </filter>
      </svg>
      <a className="skip" href="#main">Skip to content</a>
      <Nav />
      <main id="main">
        <Hero />
        <Curious />
        <Glacier />
        <Impact />
        <Building />
        <Along />
        <Next />
      </main>
      <Companion />
      <ResumeViewer />
    </>
  );
}
