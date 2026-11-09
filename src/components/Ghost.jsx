import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { prefersReducedMotion } from '../lib/scroll';

// A huge outlined word behind a chapter that drifts sideways with the scroll,
// so every section is moving a little even when its content is still.
export default function Ghost({ children, from = 12, to = -18 }) {
  const ref = useRef(null);
  useGSAP(() => {
    if (prefersReducedMotion()) return;
    gsap.fromTo(
      ref.current,
      { xPercent: from },
      {
        xPercent: to,
        ease: 'none',
        scrollTrigger: { trigger: ref.current.parentElement, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
      }
    );
  });
  return (
    <span className="ghost" ref={ref} aria-hidden="true">
      {children}
    </span>
  );
}
