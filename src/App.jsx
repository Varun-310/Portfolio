import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useSpring, useInView, useTransform } from 'framer-motion';
import Gutter from './Gutter';
import { GithubIcon, LinkedInIcon, MailIcon, DownloadIcon, TrophyIcon, MedalIcon, CalendarIcon, LockIcon, CodeIcon } from './Icons';
import './App.css';

/* ════════════════════════════════════════
   Animated Section wrapper
   ════════════════════════════════════════ */
function CodeSection({ id, className = '', gutterStart, gutterCount, children }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  const handleMouseMove = useCallback((e) => {
    const section = ref.current;
    if (!section) return;
    const gutter = section.querySelector('.gutter');
    const codeContent = section.querySelector('.code-content');
    if (!gutter || !codeContent) return;
    const rect = codeContent.getBoundingClientRect();
    const relY = e.clientY - rect.top;
    const lineHeight = 14 * 1.65;
    const lineIndex = Math.floor(relY / lineHeight);
    gutter.querySelectorAll('.ln').forEach((ln, i) => ln.classList.toggle('ln-active', i === lineIndex));
  }, []);

  const handleMouseLeave = useCallback(() => {
    const section = ref.current;
    if (!section) return;
    const gutter = section.querySelector('.gutter');
    if (gutter) gutter.querySelectorAll('.ln').forEach(ln => ln.classList.remove('ln-active'));
  }, []);

  return (
    <motion.section
      id={id}
      ref={ref}
      className={`code-section ${className}`}
      initial={{ opacity: 0, y: 12 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <Gutter start={gutterStart} count={gutterCount} />
      <div className="code-content">
        {isInView ? <StaggerChildren>{children}</StaggerChildren> : children}
      </div>
    </motion.section>
  );
}

/* ════════════════════════════════════════
   Stagger children on reveal
   ════════════════════════════════════════ */
function StaggerChildren({ children }) {
  return (
    <motion.div
      initial="hidden" animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.025 } } }}
    >
      {(Array.isArray(children) ? children : [children]).map((child, i) => (
        <motion.div
          key={i}
          variants={{
            hidden: { opacity: 0, x: -8 },
            visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
          }}
        >{child}</motion.div>
      ))}
    </motion.div>
  );
}

/* ════════════════════════════════════════
   Typing hook
   ════════════════════════════════════════ */
function useTyping(text, speed = 22) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      if (i < text.length) { setDisplayed(text.slice(0, ++i)); }
      else { clearInterval(id); setTimeout(() => setDone(true), 3500); }
    }, speed + Math.random() * 14);
    return () => clearInterval(id);
  }, [text, speed]);
  return { displayed, done };
}

/* ════════════════════════════════════════
   Project card
   ════════════════════════════════════════ */
function ProjectCard({ decorator, fnName, description, features, tech, repoUrl, badge, isPrivate, accent, children }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-20px' });
  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
    ref.current.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
  };

  return (
    <motion.div
      ref={ref}
      className={`project-block project-accent-${accent || 'blue'}`}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 18 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <span className="line i1"><span className="dec">@project</span><span className="pnc">(</span><span className="str">"{decorator}"</span><span className="pnc">)</span></span>
      <span className="line i1"><span className="kw">def</span> <span className="fn">{fnName}</span><span className="pnc">(</span><span className="slf">self</span><span className="pnc">):</span></span>
      <span className="line i2"><span className="str">"""</span></span>
      {description.map((d, i) => <span className="line i2" key={i}><span className="str">{d}</span></span>)}
      <span className="line i2"><span className="str">"""</span></span>
      <span className="line">&nbsp;</span>
      <span className="line i2"><span className="vr">features</span> <span className="pnc">=</span> <span className="pnc">[</span></span>
      {features.map((f, i) => <span className="line i3" key={i}><span className="str">"{f}"</span><span className="pnc">,</span></span>)}
      <span className="line i2"><span className="pnc">]</span></span>
      <span className="line">&nbsp;</span>
      <span className="line i2">
        <span className="vr">tech</span> <span className="pnc">=</span> <span className="pnc">[</span>
        {tech.map((t, i) => <span key={i}><span className="str">"{t}"</span>{i < tech.length - 1 && <span className="pnc">, </span>}</span>)}
        <span className="pnc">]</span>
      </span>
      {children}
      <div className="project-card-footer">
        {isPrivate ? (
          <span className="private-badge"><LockIcon /> Private Repository</span>
        ) : (
          <a href={repoUrl} target="_blank" rel="noreferrer" className="project-link">
            <GithubIcon /> view on github
          </a>
        )}
        {badge && <span className="highlight-tag">{badge}</span>}
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════
   Skill tag with spring
   ════════════════════════════════════════ */
function SkillTag({ name, delay, color }) {
  return (
    <motion.span
      className={`skill-tag skill-tag-${color || 'default'}`}
      initial={{ opacity: 0, scale: 0.7, y: 6 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.3, type: 'spring', stiffness: 200, damping: 15 }}
      viewport={{ once: true }}
    >{name}</motion.span>
  );
}

/* ════════════════════════════════════════
   Event card with icon badge
   ════════════════════════════════════════ */
const EVENT_ICONS = { winner: TrophyIcon, finalist: MedalIcon, participant: CalendarIcon };
const STATUS_LABELS = { winner: 'Winner', finalist: 'Finalist', participant: 'Participated' };

function EventCard({ title, description, status, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-20px' });
  const Icon = EVENT_ICONS[status] || CalendarIcon;

  return (
    <motion.div
      ref={ref}
      className={`event-card event-${status}`}
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className={`event-icon-wrap event-icon-${status}`}>
        <Icon />
      </div>
      <div className="event-content">
        <div className="event-header">
          <span className="event-title">{title}</span>
          <span className={`event-status event-status-${status}`}>{STATUS_LABELS[status]}</span>
        </div>
        <span className="event-desc">{description}</span>
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════
   Floating particles for ambient life
   ════════════════════════════════════════ */
function FloatingParticles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1 + Math.random() * 2,
    duration: 15 + Math.random() * 25,
    delay: Math.random() * 10,
  }));
  return (
    <div className="particles-container">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="particle"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [-20, 20, -20], x: [-10, 10, -10], opacity: [0, 0.4, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

/* ════════════════════════════════════════
   Loading Screen — module-level constant (never recreated)
   ════════════════════════════════════════ */
const BOOT_LINES = [
  { text: '#!/usr/bin/env python3', cls: 'cmt' },
  { text: '# -*- coding: utf-8 -*-', cls: 'cmt' },
  { text: '', cls: '' },
  { text: 'import sys, os, time', cls: 'syn' },
  { text: 'from portfolio.core import VarunKS', cls: 'imp' },
  { text: 'from portfolio.projects import GLOF, Dhurvam, Solace, SCREAM', cls: 'imp' },
  { text: 'from portfolio.skills import AI, MachineLearning, NLP', cls: 'imp' },
  { text: '', cls: '' },
  { text: '# Initializing portfolio instance...', cls: 'cmt' },
  { text: 'varun = VarunKS(name="Varun K S", role="AI Engineer")', cls: 'syn' },
  { text: 'varun.load_projects()     # 7 projects loaded', cls: 'syn' },
  { text: 'varun.compile_skills()    # stack ready', cls: 'syn' },
  { text: '', cls: '' },
  { text: 'print("Portfolio ready. Launching...")', cls: 'syn' },
];

function LoadingScreen({ onComplete }) {
  const [visibleLines, setVisibleLines] = useState([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < BOOT_LINES.length) {
        const line = BOOT_LINES[i]; // capture before i changes
        setVisibleLines(prev => [...prev, line]);
        setProgress(Math.round(((i + 1) / BOOT_LINES.length) * 100));
        i++;
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 550);
      }
    }, 130);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div
      className="loading-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, y: -8, transition: { duration: 0.45, ease: 'easeInOut' } }}
    >
      <div className="loading-titlebar">
        <div className="titlebar-dots">
          <span className="dot-close" />
          <span className="dot-min" />
          <span className="dot-max" />
        </div>
        <span className="loading-filename">varun_portfolio.py</span>
      </div>
      <div className="loading-body">
        <div className="loading-gutter">
          {visibleLines.map((_, i) => (
            <span key={i} className="ln">{i + 1}</span>
          ))}
        </div>
        <div className="loading-code">
          {visibleLines.map((line, i) => (
            <motion.div
              key={i}
              className={`loading-line loading-${line.cls || 'plain'}`}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.18 }}
            >
              {line.text || '\u00a0'}
            </motion.div>
          ))}
          <span className="typing-cursor" />
        </div>
      </div>
      <div className="loading-footer">
        <div className="loading-progress-track">
          <motion.div
            className="loading-progress-fill"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.15 }}
          />
        </div>
        <span className="loading-status">
          {progress < 100 ? 'Loading...' : 'Done.'}
        </span>
        <span className="loading-pct">{progress}%</span>
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════
   Minimap sidebar (VS Code style)
   ════════════════════════════════════════ */
function Minimap() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 240]);

  const blocks = [
    { top: 0,   height: 40, color: 'rgba(122, 162, 247, 0.2)' },
    { top: 48,  height: 30, color: 'rgba(158, 206, 106, 0.15)' },
    { top: 86,  height: 24, color: 'rgba(187, 154, 247, 0.15)' },
    { top: 118, height: 80, color: 'rgba(125, 207, 255, 0.12)' },
    { top: 206, height: 20, color: 'rgba(255, 158, 100, 0.12)' },
    { top: 234, height: 18, color: 'rgba(224, 175, 104, 0.12)' },
    { top: 260, height: 22, color: 'rgba(247, 118, 142, 0.15)' },
    { top: 290, height: 30, color: 'rgba(158, 206, 106, 0.12)' },
  ];

  return (
    <div className="minimap">
      <div className="minimap-label">MINIMAP</div>
      <div className="minimap-track">
        {blocks.map((b, i) => (
          <div key={i} className="minimap-block" style={{ top: b.top, height: b.height, background: b.color }} />
        ))}
        <motion.div className="minimap-viewport" style={{ y }} />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   MAIN APP
   ════════════════════════════════════════ */
export default function App() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const [activeNav, setActiveNav] = useState('hero');
  const [isLoading, setIsLoading] = useState(true);
  const handleLoadComplete = useCallback(() => setIsLoading(false), []);
  const heroText = 'AI Engineer — building intelligent systems that make a real-world impact.';
  // Only start typing after the loading screen is done
  const { displayed, done } = useTyping(isLoading ? '' : heroText);

  const heroParallax = useTransform(scrollYProgress, [0, 0.3], [0, -60]);

  useEffect(() => {
    const sectionIds = ['hero', 'about', 'skills', 'projects', 'certifications', 'events', 'education', 'contact'];
    const handleScroll = () => {
      let current = 'hero';
      sectionIds.forEach(id => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 120) current = id;
      });
      setActiveNav(current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - 80, behavior: 'smooth' });
  };

  const navItems = [
    { id: 'hero',           label: '__init__' },
    { id: 'about',          label: 'about()' },
    { id: 'skills',         label: 'skills' },
    { id: 'projects',       label: 'projects' },
    { id: 'certifications', label: 'certs' },
    { id: 'events',         label: 'events' },
    { id: 'education',      label: 'education' },
    { id: 'contact',        label: '__main__' },
  ];

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <LoadingScreen key="loader" onComplete={handleLoadComplete} />
        )}
      </AnimatePresence>

      {!isLoading && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <motion.div className="scroll-progress" style={{ scaleX }} />
        <FloatingParticles />

        {/* ─── Title bar ─── */}
        <div className="terminal-titlebar">
          <div className="titlebar-dots">
            <span className="dot-close" /><span className="dot-min" /><span className="dot-max" />
          </div>
          <span className="titlebar-tab">varun_portfolio.py</span>
        </div>

        {/* ─── Nav ─── */}
        <nav className="nav-bar">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-link ${activeNav === item.id ? 'active' : ''}`}
              onClick={() => scrollTo(item.id)}
            >{item.label}</button>
          ))}
        </nav>


        {/* ─── Editor body ─── */}
        <div className="terminal-body">

          {/* ══ HERO ══ */}
          <section id="hero" className="hero-section">
            <div className="hero-left">
              <Gutter start={1} count={13} />
              <div className="code-content">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <span className="line"><span className="cmt">#!/usr/bin/env python3</span></span>
                  <span className="line"><span className="cmt"># -*- coding: utf-8 -*-</span></span>
                  <span className="line">&nbsp;</span>
                  <span className="line"><span className="kw">class</span> <span className="cls">VarunKS</span><span className="pnc">:</span></span>
                  <span className="line i1"><span className="str">"""</span></span>
                  <span className="line i1">
                    <span className="str">{displayed}</span>
                    {!done && <span className="typing-cursor" />}
                  </span>
                  <span className="line i1"><span className="str">"""</span></span>
                  <span className="line">&nbsp;</span>
                  <span className="line i1"><span className="vr">name</span> <span className="pnc">=</span> <span className="str">"Varun K S"</span></span>
                  <span className="line i1"><span className="vr">role</span> <span className="pnc">=</span> <span className="str">"AI Engineer"</span></span>
                  <span className="line i1"><span className="vr">location</span> <span className="pnc">=</span> <span className="str">"Pollachi, Coimbatore"</span></span>
                  <span className="line i1"><span className="vr">email</span> <span className="pnc">=</span> <span className="str">"itsvarun310@gmail.com"</span></span>
                </motion.div>

                <motion.div
                  className="hero-links"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5, duration: 0.6 }}
                >
                  <a href="https://github.com/Varun-310" target="_blank" rel="noreferrer" className="hero-link-btn">
                    <GithubIcon /> GitHub
                  </a>
                  <a href="https://www.linkedin.com/in/varun-ks-/" target="_blank" rel="noreferrer" className="hero-link-btn">
                    <LinkedInIcon /> LinkedIn
                  </a>
                  <a href="mailto:itsvarun310@gmail.com" className="hero-link-btn">
                    <MailIcon /> Email
                  </a>
                </motion.div>
              </div>
            </div>

            {/* Hero right — single floating popup window (draggable) */}
            <motion.div
              className="hero-popup"
              drag
              dragConstraints={{ top: -300, left: -500, right: 500, bottom: 500 }}
              dragElastic={0.15}
              dragMomentum={true}
              dragTransition={{ power: 0.15, timeConstant: 250 }}
              whileDrag={{ scale: 1.02, boxShadow: '0 16px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(125,207,255,0.12)' }}
              initial={{ opacity: 0, scale: 0.92, x: 40 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {/* Popup titlebar — drag handle */}
              <div className="popup-titlebar popup-drag-handle">
                <div className="titlebar-dots">
                  <span className="dot-close" /><span className="dot-min" /><span className="dot-max" />
                </div>
                <span className="popup-title">profile_card.py</span>
                <span className="photo-editor-badge">AI Engineer</span>
              </div>

              {/* Photo */}
              <div className="popup-photo-area">
                <img src="/image.png" alt="Varun K S" className="hero-photo" />
                <div className="photo-glow" />
              </div>

              {/* Info strip */}
              <div className="popup-info-strip">
                <span className="cmt"># B.Tech AI &amp; ML · Bannari Amman Institute of Technology</span>
              </div>

              {/* Stats strip — compact inline */}
              <div className="popup-stats-strip">
                <div className="popup-stat popup-stat-highlight">
                  <TrophyIcon />
                  <span className="popup-stat-val">SIH '24</span>
                  <span className="popup-stat-lbl">Winner</span>
                </div>
                <div className="popup-stat">
                  <CodeIcon />
                  <span className="popup-stat-val">7+</span>
                  <span className="popup-stat-lbl">Projects</span>
                </div>
                <div className="popup-stat">
                  <CalendarIcon />
                  <span className="popup-stat-val">6</span>
                  <span className="popup-stat-lbl">Events</span>
                </div>
                <div className="popup-stat">
                  <MedalIcon />
                  <span className="popup-stat-val">5+</span>
                  <span className="popup-stat-lbl">Certs</span>
                </div>
              </div>

              {/* Status bar */}
              <div className="popup-statusbar">
                <span className="pnc">&gt;&gt;&gt;</span> <span className="fn">status</span><span className="pnc">()</span>
                <span className="popup-status-result">
                  <span className="str">"Open to opportunities"</span>
                  <span className="status-dot" />
                </span>
              </div>
            </motion.div>
          </section>

          <CodeSection id="about" gutterStart={14} gutterCount={11}>
            <span className="line"><span className="cmt"># ─── Professional Summary ─────────────────────────────────</span></span>
            <span className="line i1"><span className="kw">def</span> <span className="fn">about_me</span><span className="pnc">(</span><span className="slf">self</span><span className="pnc">):</span></span>
            <span className="line i2"><span className="str">"""Returns a brief professional summary."""</span></span>
            <span className="line i2"><span className="kw">return</span> <span className="pnc">(</span></span>
            <span className="line i3"><span className="str">"AI Engineer specializing in LLM application development, Retrieval-Augmented Generation (RAG),"</span></span>
            <span className="line i3"><span className="str">"and end-to-end conversational AI systems, with additional depth in computer vision."</span></span>
            <span className="line i3"><span className="str">"Experienced in building and deploying LLM-driven products — from natural language data platforms"</span></span>
            <span className="line i3"><span className="str">"and domain-specific chatbots to autonomous agentic systems — using tools such as LangChain, Gemini API,"</span></span>
            <span className="line i3"><span className="str">"and n8n. Proven track record at national and international hackathons, including SIH 2024 Winner"</span></span>
            <span className="line i3"><span className="str">"and Top 2% Finalist at the India AI Impact Buildathon."</span></span>
            <span className="line i2"><span className="pnc">)</span></span>
          </CodeSection>

          {/* ══ SKILLS ══ */}
          <CodeSection id="skills" gutterStart={25} gutterCount={10}>
            <span className="line"><span className="cmt"># ─── Skills &amp; Expertise ───────────────────────────────────</span></span>
            <span className="line i1"><span className="vr">skills</span> <span className="pnc">=</span> <span className="pnc">{'{'}</span></span>
            <div className="skills-grid">
              <div className="skill-category">
                <span className="line i2"><span className="str">"languages"</span><span className="pnc">:</span> <span className="pnc">[</span></span>
                {['Python', 'SQL', 'C'].map((s, i) => (
                  <SkillTag key={s} name={s} delay={i * 0.06 + 0.2} color="blue" />
                ))}
                <span className="line i2"><span className="pnc">],</span></span>
              </div>
              <div className="skill-category">
                <span className="line i2"><span className="str">"ai_and_ml_engineering"</span><span className="pnc">:</span> <span className="pnc">[</span></span>
                {['LLM App Development', 'RAG Pipelines', 'LangChain', 'Prompt Engineering', 'Agentic Systems', 'LLM Inference', 'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision'].map((s, i) => (
                  <SkillTag key={s} name={s} delay={i * 0.06 + 0.2} color="violet" />
                ))}
                <span className="line i2"><span className="pnc">],</span></span>
              </div>
              <div className="skill-category">
                <span className="line i2"><span className="str">"frameworks_and_tools"</span><span className="pnc">:</span> <span className="pnc">[</span></span>
                {['TensorFlow / Keras', 'scikit-learn', 'XGBoost', 'OpenCV', 'PyTorch', 'n8n', 'Git'].map((s, i) => (
                  <SkillTag key={s} name={s} delay={i * 0.06 + 0.2} color="green" />
                ))}
                <span className="line i2"><span className="pnc">],</span></span>
              </div>
              <div className="skill-category">
                <span className="line i2"><span className="str">"soft_skills"</span><span className="pnc">:</span> <span className="pnc">[</span></span>
                {['Team Leadership', 'Communication', 'Research & Documentation'].map((s, i) => (
                  <SkillTag key={s} name={s} delay={i * 0.06 + 0.2} color="orange" />
                ))}
                <span className="line i2"><span className="pnc">],</span></span>
              </div>
            </div>
            <span className="line i1"><span className="pnc">{'}'}</span></span>
          </CodeSection>

          {/* ══ PROJECTS ══ */}
          <CodeSection id="projects" gutterStart={35} gutterCount={90}>
            <span className="line"><span className="cmt"># ─── Projects ─────────────────────────────────────────────</span></span>

            <ProjectCard
              decorator="Dhurvam — AI-Powered Honeypot System"
              fnName="dhurvam"
              accent="violet"
              isPrivate={true}
              badge="Top 2% National Finalist"
              description={[
                'Engineered an AI-powered honeypot that detects scam messages, engages scammers',
                'in convincing believable conversations, and extracts actionable intelligence — built',
                'for the GUVI AI Hackathon (India AI Impact Buildathon 2026 — Top 2% National Finalist).',
              ]}
              features={[
                'Autonomous scam message detection pipeline',
                'LLM-based dialogue management simulating realistic victim behavior',
                'Actionable intelligence extraction on scam tactics and actors',
              ]}
              tech={['Python', 'LangChain', 'Ollama', 'FastAPI', 'Redis']}
              repoUrl=""
            />

            <ProjectCard
              decorator="GLOF Warning — SAR Analysis"
              fnName="glof_sar_analysis"
              accent="blue"
              description={[
                'Designed a predictive risk-detection system using Sentinel-1 SAR satellite imagery',
                'and CNN models to identify early-stage Glacial Lake Outburst Flood (GLOF) indicators.',
                'Achieved high spatial accuracy by fine-tuning convolutional architectures.',
              ]}
              features={[
                'CNN models for early-stage GLOF risk detection',
                'High spatial accuracy geospatial imagery classification',
                'Sentinel-1 SAR radar imagery processing and Rasterio analysis',
              ]}
              tech={['Python', 'TensorFlow', 'CNN', 'Sentinel-1', 'OpenCV', 'Rasterio']}
              repoUrl="https://github.com/Varun-310/SAR-IMAGE-CLASSIFICATION-FOR-GLOF-"
            />

            <ProjectCard
              decorator="GLOF Warning — IoT Sensor Network"
              fnName="glof_iot_sensors"
              accent="blue"
              badge="SIH '24 Winner"
              description={[
                'Developed a real-time GLOF monitoring system integrating water level, temperature,',
                'ground motion, pressure, and flow rate IoT sensors with XGBoost for anomaly detection.',
                'Won Smart India Hackathon 2024 (problem statement by DRDO); system designed for Himalayan glacial zones.',
              ]}
              features={[
                'Real-time IoT sensor telemetry (water level, motion, temperature, pressure, flow rate)',
                'XGBoost ML classifier for instant anomaly detection',
                'Twilio SMS alerts and React dashboard visualization',
              ]}
              tech={['FastAPI', 'XGBoost', 'React', 'Arduino/ESP32', 'LoRa', 'Twilio']}
              repoUrl="https://github.com/Varun-310/Early-Warning-System-for-GLOF"
            />

            <ProjectCard
              decorator="Samudra (FloatChat) — Conversational Ocean Data Platform"
              fnName="samudra_floatchat"
              accent="green"
              description={[
                'Built an AI-powered conversational platform that transforms access to ARGO ocean data',
                'by converting complex NetCDF files into user-friendly, searchable, and visual formats',
                'through LLM-driven natural language queries.',
              ]}
              features={[
                'Natural language querying of complex ARGO NetCDF oceanographic files',
                'Automated data ingestion and advanced analytics pipelines',
                'Interactive dashboard visualizations for experts and non-specialists',
              ]}
              tech={['Python', 'Gemini API', 'LangChain', 'NetCDF', 'Streamlit', 'Pandas']}
              repoUrl="https://github.com/Varun-310"
            />

            <ProjectCard
              decorator="Solace — AI Mental Health Chatbot"
              fnName="solace_chatbot"
              accent="violet"
              description={[
                'Built an emotionally intelligent mental health chatbot using Google Gemini',
                'with real-time NLP, sentiment analysis, and dynamic user personalization',
                'for empathetic, context-aware responses.',
              ]}
              features={[
                'Empathetic and context-aware dialogue generation',
                'Real-time NLP sentiment analysis engine',
                'Dynamic user personalization and conversation memory',
              ]}
              tech={['Python', 'Gemini API', 'LangChain', 'NLP', 'Node.js']}
              repoUrl="https://github.com/Varun-310/Solace"
            />

            <ProjectCard
              decorator="Scream — Real-Time Scream Detection"
              fnName="scream_detection"
              accent="orange"
              description={[
                'Developed a real-time audio classification application using MFCC feature extraction',
                'combined with SVM and MLPClassifier models, achieving high accuracy in distinguishing screams',
                'from ambient noise.',
              ]}
              features={[
                'Real-time detection via live microphone stream',
                'MFCC feature extraction with SVM + MLPClassifier ML models',
                'Kivy user interface with instant pop-up & SMS alerts (Twilio)',
              ]}
              tech={['Python', 'Scikit-learn', 'Librosa', 'Kivy', 'Twilio']}
              repoUrl="https://github.com/Varun-310/SCREAM"
            />

            <ProjectCard
              decorator="Aran — Local Vulnerability Report Generator"
              fnName="aran_report_generator"
              accent="green"
              badge="Innovators Hackathon Finalist"
              description={[
                'Built a local LLM-inference-powered report generator for vulnerability analysis —',
                'Finalist at the Israel-India Global Innovators Hackathon.',
              ]}
              features={[
                '100% local LLM inference for sensitive report generation',
                'Automated software vulnerability scanning & analysis summary output',
                'Clean report format structure generation',
              ]}
              tech={['Python', 'Ollama', 'Llama-3', 'FastAPI', 'Markdown']}
              repoUrl="https://github.com/Varun-310"
            />

            <ProjectCard
              decorator="Neethi — AI Legal Assistance Chatbot"
              fnName="neethi_legal_assistance"
              accent="orange"
              badge="Final Year Project"
              description={[
                'Designed an AI-powered conversational assistant to help Indian citizens navigate legal services',
                'and access information about various Department of Justice initiatives.',
                'Leveraged RAG technology with local LLM integration to deliver accurate, contextual responses.',
              ]}
              features={[
                'RAG (Retrieval-Augmented Generation) query system over Indian legal documents',
                'Local LLM integration protecting user data privacy',
                'Intuitive conversational flow for guidance on Justice initiatives',
              ]}
              tech={['Python', 'LangChain', 'Ollama', 'ChromaDB', 'RAG']}
              repoUrl="https://github.com/Varun-310"
            />

            <span className="line">&nbsp;</span>
            <span className="line"><span className="cmt"># ─── More projects available on GitHub ────────────────────</span></span>
            <div className="see-more-wrap">
              <motion.a
                href="https://github.com/Varun-310"
                target="_blank"
                rel="noreferrer"
                className="see-more-btn"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <GithubIcon /> github.com/Varun-310 — View all projects
              </motion.a>
            </div>
          </CodeSection>

          {/* ══ CERTIFICATIONS ══ */}
          <CodeSection id="certifications" gutterStart={126} gutterCount={10}>
            <span className="line"><span className="cmt"># ─── Certifications ───────────────────────────────────────</span></span>
            <span className="line i1"><span className="vr">certifications</span> <span className="pnc">=</span> <span className="pnc">[</span></span>
            <div className="list-block">
              {[
                'Google Cloud Skills Boost: Introduction to Generative AI',
                'Google Cloud Skills Boost: Introduction to Large Language Models',
                'Google Cloud Skills Boost: Transformer Models and BERT Model',
                'Coursera (UST): Create Your First Python Program',
                'Cognitive Class: Python 101 for Data Science',
              ].map((c, i) => <div className="list-item" key={i}>{c}</div>)}
            </div>
            <span className="line i1"><span className="pnc">]</span></span>
          </CodeSection>

          {/* ══ EVENTS ══ */}
          <CodeSection id="events" gutterStart={136} gutterCount={14}>
            <span className="line"><span className="cmt"># ─── Events &amp; Achievements ────────────────────────────────</span></span>
            <span className="line i1"><span className="vr">events</span> <span className="pnc">=</span> <span className="pnc">[</span></span>
            <div className="events-grid">
              {[
                { title: "Smart India Hackathon 2024", description: "Winner: Led ML/DL development for GLOF early warning system; problem statement provided by DRDO.", status: 'winner' },
                { title: "India AI Impact Buildathon by HCL GUVI", description: "Top 2% National Finalist: Part of AI Impact Summit 2026; built Dhurvam, an AI honeypot system for scam detection and intelligence extraction.", status: 'finalist' },
                { title: "Israel-India Global Innovators Hackathon", description: "Finalist: Developed Aran, a local LLM-based vulnerability analysis report generator.", status: 'finalist' },
                { title: "4th International Conference on Engineering", description: "Presented research paper: 'Advancement in Nanostructured Materials for Sustainable Energy Harvesting and Storage'.", status: 'participant' },
              ].map((evt, i) => <EventCard key={i} index={i} {...evt} />)}
            </div>
            <span className="line i1"><span className="pnc">]</span></span>
          </CodeSection>

          {/* ══ EDUCATION ══ */}
          <CodeSection id="education" gutterStart={150} gutterCount={8}>
            <span className="line"><span className="cmt"># ─── Education ────────────────────────────────────────────</span></span>
            <span className="line i1"><span className="vr">education</span> <span className="pnc">=</span> <span className="pnc">{'{'}</span></span>
            <span className="line i2"><span className="str">"degree"</span><span className="pnc">:</span> <span className="str">"B.Tech, AI and Machine Learning"</span><span className="pnc">,</span></span>
            <span className="line i2"><span className="str">"institution"</span><span className="pnc">:</span> <span className="str">"Bannari Amman Institute of Technology"</span><span className="pnc">,</span></span>
            <span className="line i2"><span className="str">"graduation"</span><span className="pnc">:</span> <span className="str">"March 2026"</span><span className="pnc">,</span></span>
            <span className="line i1"><span className="pnc">{'}'}</span></span>
          </CodeSection>

          {/* ══ CONTACT ══ */}
          <CodeSection id="contact" gutterStart={158} gutterCount={15}>
            <span className="line"><span className="cmt"># ─── Connect ──────────────────────────────────────────────</span></span>
            <span className="line"><span className="kw">if</span> <span className="vr">__name__</span> <span className="pnc">==</span> <span className="str">"__main__"</span><span className="pnc">:</span></span>
            <span className="line">&nbsp;</span>
            <span className="line i1"><span className="cmt"># Let's connect</span></span>
            <span className="line i1"><span className="fn">print</span><span className="pnc">(</span><span className="str">"Let's build something amazing together."</span><span className="pnc">)</span></span>
            <span className="line">&nbsp;</span>
            <div className="contact-links" style={{ paddingLeft: '2em' }}>
              <motion.a href="https://github.com/Varun-310" target="_blank" rel="noreferrer" className="contact-link"
                whileHover={{ scale: 1.04, y: -2 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                <GithubIcon /> GitHub
              </motion.a>
              <motion.a href="https://www.linkedin.com/in/varun-ks-/" target="_blank" rel="noreferrer" className="contact-link"
                whileHover={{ scale: 1.04, y: -2 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                <LinkedInIcon /> LinkedIn
              </motion.a>
              <motion.a href="mailto:itsvarun310@gmail.com" className="contact-link"
                whileHover={{ scale: 1.04, y: -2 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                <MailIcon /> itsvarun310@gmail.com
              </motion.a>
            </div>
            <span className="line">&nbsp;</span>
            <div style={{ paddingLeft: '2em' }}>
              <span className="line"><span className="cmt"># Download my resume</span></span>
              <motion.a href="/RESUME.pdf" download className="download-btn"
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <DownloadIcon /> &gt;&gt;&gt; download_resume("RESUME.pdf")
              </motion.a>
            </div>
            <span className="line">&nbsp;</span>
            <span className="line"><span className="cmt"># ─── EOF ──────────────────────────────────────────────────</span></span>
          </CodeSection>

        </div>
      </motion.div>
      )}
    </>
  );
}
