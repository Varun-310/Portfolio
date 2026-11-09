import { useEffect, useRef, useState } from 'react';
import { DownloadSimple, X } from '@phosphor-icons/react';
import ResumeDoc from './ResumeDoc';
import { RESUME_PDF } from '../resume';
import { pauseScroll, resumeScroll } from '../lib/scroll';

// Open the viewer from anywhere: window.dispatchEvent(new Event('resume:open'))
export const openResume = () => window.dispatchEvent(new Event('resume:open'));

// The resume as a sheet that rises inside the portfolio, with a download button.
export default function ResumeViewer() {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const closeBtn = useRef(null);
  const lastFocus = useRef(null);

  useEffect(() => {
    const onOpen = () => { lastFocus.current = document.activeElement; setOpen(true); };
    window.addEventListener('resume:open', onOpen);
    return () => window.removeEventListener('resume:open', onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    pauseScroll();
    const raf = requestAnimationFrame(() => setShown(true));
    closeBtn.current?.focus({ preventScroll: true });
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      // Keep keyboard focus inside the sheet.
      if (e.key === 'Tab') {
        const f = [...document.querySelectorAll('.rv [href], .rv button')];
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('keydown', onKey); };
  }, [open]);

  // Fit the A4 page to narrow screens.
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    if (!open) return;
    const fit = () => setZoom(Math.min(1, (window.innerWidth - 24) / 794));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [open]);

  const close = () => {
    setShown(false);
    setTimeout(() => {
      setOpen(false);
      resumeScroll();
      lastFocus.current?.focus?.({ preventScroll: true });
    }, 420);
  };

  if (!open) return null;
  return (
    <div className={`rv ${shown ? 'is-shown' : ''}`} role="dialog" aria-modal="true" aria-label="Resume">
      <div className="rv-scrim" onClick={close} />
      <div className="rv-sheet">
        <div className="rv-bar">
          <div className="rv-file">
            <span className="rv-dot" aria-hidden="true" />
            <span>Varun K S, Resume</span>
            <span className="rv-meta">A4, 1 page</span>
          </div>
          <div className="rv-actions">
            <a className="btn btn-small" href={RESUME_PDF} download="Varun_K_S_Resume.pdf">
              <DownloadSimple weight="bold" aria-hidden="true" /> Download PDF
            </a>
            <button type="button" className="icon-btn" onClick={close} ref={closeBtn} aria-label="Close resume">
              <X weight="bold" />
            </button>
          </div>
        </div>
        <div className="rv-scroll" data-lenis-prevent>
          <div className="rv-paper" style={{ zoom }}>
            <ResumeDoc />
          </div>
        </div>
      </div>
    </div>
  );
}
