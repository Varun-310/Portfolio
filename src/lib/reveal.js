import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';
import { prefersReducedMotion } from './scroll';

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

export const EASE = 'expo.out';

// Headlines marked [data-split] rise word by word out of a line mask.
// Blocks marked [data-reveal] fade up once, in document order.
export function useReveal(scope) {
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      gsap.utils.toArray('[data-split]', scope.current).forEach((el) => {
        SplitText.create(el, {
          type: 'lines,words',
          linesClass: 'ln',
          mask: 'lines',
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.words, {
              yPercent: 115,
              duration: 1.1,
              ease: EASE,
              stagger: 0.045,
              scrollTrigger: { trigger: el, start: 'top 86%', once: true },
            }),
        });
      });

      const blocks = gsap.utils.toArray('[data-reveal]', scope.current);
      gsap.set(blocks, { autoAlpha: 0 });
      ScrollTrigger.batch(blocks, {
        start: 'top 90%',
        once: true,
        onEnter: (els) =>
          gsap.fromTo(
            els,
            { y: 28, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.9, ease: EASE, stagger: 0.08, overwrite: true }
          ),
      });
    },
    { scope }
  );
}
