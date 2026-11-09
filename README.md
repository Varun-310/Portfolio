# Varun K S, portfolio

A scroll-driven story of who I am and what I build, with a pixel-art version of me that walks through the page and changes what he is doing for each chapter and project.

Built with React, Vite, GSAP (ScrollTrigger, SplitText) and Lenis.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs dist/
```

## Where things live

| What | File |
|---|---|
| Site copy (about, projects, milestones, toolkit) | `src/data.js` |
| Resume content (viewer and PDF) | `src/resume.js` |
| Resume PDF served for download | `public/Varun_K_S_Resume.pdf` |
| Avatar poses (one PNG per pose) | `public/avatar/` |
| Sections | `src/sections/` |
| Avatar, nav, resume viewer | `src/components/` |
| Styles | `src/styles.css`, `src/resume.css` |

The resume page can be printed on its own at `/?print=resume` (A4, one page), which is how the PDF is made.

If you replace the avatar art, bump `VERSION` in `src/components/ImageAvatar.jsx` so browsers fetch the new files.
