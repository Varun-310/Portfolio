import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useSpring, useInView, useMotionValue, useTransform } from 'framer-motion';
import Gutter from './Gutter';
import { GithubIcon, LinkedInIcon, MailIcon, DownloadIcon } from './Icons';
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
function ProjectCard({ decorator, fnName, description, features, tech, repoUrl, badge, children }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-20px' });
  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
    ref.current.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
  };

  return (
    <motion.div ref={ref} className="project-block" onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 18 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}>
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
      <span className="line i2"><span className="vr">tech</span> <span className="pnc">=</span> <span className="pnc">[</span>{tech.map((t, i) => <span key={i}><span className="str">"{t}"</span>{i < tech.length - 1 && <span className="pnc">, </span>}</span>)}<span className="pnc">]</span></span>
      {children}
      <a href={repoUrl} target="_blank" rel="noreferrer" className="project-link"><GithubIcon /> view on github</a>
      {badge && <span className="highlight-tag">{badge}</span>}
    </motion.div>
  );
}

/* ════════════════════════════════════════
   Skill tag with spring
   ════════════════════════════════════════ */
function SkillTag({ name, delay }) {
  return (
    <motion.span className="skill-tag"
      initial={{ opacity: 0, scale: 0.7, y: 6 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.3, type: 'spring', stiffness: 200, damping: 15 }}
      viewport={{ once: true }}
    >{name}</motion.span>
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
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            opacity: [0, 0.4, 0],
          }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

/* ════════════════════════════════════════
   Minimap sidebar (VS Code style)
   ════════════════════════════════════════ */
function Minimap() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 240]);

  const blocks = [
    { top: 0, height: 40, color: 'rgba(122, 162, 247, 0.2)' },
    { top: 48, height: 30, color: 'rgba(158, 206, 106, 0.15)' },
    { top: 86, height: 24, color: 'rgba(187, 154, 247, 0.15)' },
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
  const heroText = 'AI Engineer — building intelligent systems that make a real-world impact.';
  const { displayed, done } = useTyping(heroText);

  // Parallax values for hero photo
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
    { id: 'hero', label: '__init__' },
    { id: 'about', label: 'about()' },
    { id: 'skills', label: 'skills' },
    { id: 'projects', label: 'projects' },
    { id: 'certifications', label: 'certs' },
    { id: 'events', label: 'events' },
    { id: 'education', label: 'education' },
    { id: 'contact', label: '__main__' },
  ];

  return (
    <>
      <motion.div className="scroll-progress" style={{ scaleX }} />
      <FloatingParticles />

      {/* Title bar */}
      <div className="terminal-titlebar">
        <div className="titlebar-dots">
          <span className="dot-close" /><span className="dot-min" /><span className="dot-max" />
        </div>
        <span className="titlebar-tab">varun_portfolio.py</span>
      </div>

      {/* Nav */}
      <nav className="nav-bar">
        {navItems.map(item => (
          <button key={item.id} className={`nav-link ${activeNav === item.id ? 'active' : ''}`}
            onClick={() => scrollTo(item.id)}>{item.label}</button>
        ))}
      </nav>

      {/* Minimap */}
      <Minimap />

      {/* Editor */}
      <div className="terminal-body">

        {/* ═══ HERO — full viewport, image on the right ═══ */}
        <section id="hero" className="hero-section">
          <div className="hero-left">
            <Gutter start={1} count={13} />
            <div className="code-content">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}>
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
                <span className="line i1"><span className="vr">phone</span> <span className="pnc">=</span> <span className="str">"9600785828"</span></span>
              </motion.div>

              {/* Quick links under the code */}
              <motion.div className="hero-links" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 0.6 }}>
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

          {/* Hero right — floating photo + stats */}
          <motion.div className="hero-right" style={{ y: heroParallax }}>
            <motion.div className="hero-photo-wrapper"
              initial={{ opacity: 0, scale: 0.9, x: 30 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}>
              <img src="/image.png" alt="Varun K S" className="hero-photo" />
              <div className="photo-glow" />
            </motion.div>

            {/* Stats cards */}
            <motion.div className="hero-stats"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}>
              <div className="stat-card">
                <span className="stat-value">SIH '24</span>
                <span className="stat-label">Winner 🏆</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">4+</span>
                <span className="stat-label">Projects</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">5+</span>
                <span className="stat-label">Certifications</span>
              </div>
            </motion.div>

            {/* Terminal-style status */}
            <motion.div className="hero-terminal-status"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
              <span className="pnc">&gt;&gt;&gt;</span> <span className="fn">status</span><span className="pnc">()</span>
              <br />
              <span className="str">"Open to opportunities"</span>
              <span className="status-dot" />
            </motion.div>
          </motion.div>
        </section>

        {/* ═══ ABOUT ═══ */}
        <CodeSection id="about" gutterStart={14} gutterCount={11}>
          <span className="line">&nbsp;</span>
          <span className="line"><span className="cmt"># ─── Professional Summary ─────────────────────────────────</span></span>
          <span className="line">&nbsp;</span>
          <span className="line i1"><span className="kw">def</span> <span className="fn">about_me</span><span className="pnc">(</span><span className="slf">self</span><span className="pnc">):</span></span>
          <span className="line i2"><span className="str">"""Returns a brief professional summary."""</span></span>
          <span className="line i2"><span className="kw">return</span> <span className="pnc">(</span></span>
          <span className="line i3"><span className="str">"AI engineer with hands-on experience designing"</span></span>
          <span className="line i3"><span className="str">"and deploying end-to-end AI systems across NLP,"</span></span>
          <span className="line i3"><span className="str">"computer vision, and sensor-driven intelligence."</span></span>
          <span className="line i3"><span className="str">"Strong focus on practical deployment, automation,"</span></span>
          <span className="line i3"><span className="str">"and real-world impact in startup and production environments."</span></span>
          <span className="line i2"><span className="pnc">)</span></span>
        </CodeSection>

        {/* ═══ SKILLS ═══ */}
        <CodeSection id="skills" gutterStart={25} gutterCount={10}>
          <span className="line">&nbsp;</span>
          <span className="line"><span className="cmt"># ─── Skills & Expertise ───────────────────────────────────</span></span>
          <span className="line">&nbsp;</span>
          <span className="line i1"><span className="vr">skills</span> <span className="pnc">=</span> <span className="pnc">{'{'}</span></span>
          <div className="skills-grid">
            <div className="skill-category">
              <span className="line i2"><span className="str">"languages"</span><span className="pnc">:</span> <span className="pnc">[</span></span>
              {['Python', 'SQL', 'C'].map((s, i) => <SkillTag key={s} name={s} delay={i * 0.06 + 0.2} />)}
              <span className="line i2"><span className="pnc">],</span></span>
            </div>
            <div className="skill-category">
              <span className="line i2"><span className="str">"domains"</span><span className="pnc">:</span> <span className="pnc">[</span></span>
              {['Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision'].map((s, i) => <SkillTag key={s} name={s} delay={i * 0.06 + 0.2} />)}
              <span className="line i2"><span className="pnc">],</span></span>
            </div>
            <div className="skill-category">
              <span className="line i2"><span className="str">"tools"</span><span className="pnc">:</span> <span className="pnc">[</span></span>
              {['n8n', 'FastAPI', 'React', 'TensorFlow', 'Scikit-learn'].map((s, i) => <SkillTag key={s} name={s} delay={i * 0.06 + 0.2} />)}
              <span className="line i2"><span className="pnc">],</span></span>
            </div>
            <div className="skill-category">
              <span className="line i2"><span className="str">"soft_skills"</span><span className="pnc">:</span> <span className="pnc">[</span></span>
              {['Team Leadership', 'Communication'].map((s, i) => <SkillTag key={s} name={s} delay={i * 0.06 + 0.2} />)}
              <span className="line i2"><span className="pnc">],</span></span>
            </div>
          </div>
          <span className="line i1"><span className="pnc">{'}'}</span></span>
        </CodeSection>

        {/* ═══ PROJECTS ═══ */}
        <CodeSection id="projects" gutterStart={35} gutterCount={66}>
          <span className="line">&nbsp;</span>
          <span className="line"><span className="cmt"># ─── Projects ─────────────────────────────────────────────</span></span>
          <span className="line">&nbsp;</span>
          <ProjectCard decorator="GLOF Early Warning System" fnName="glof_early_warning"
            description={['A comprehensive Glacial Lake Outburst Flood prediction', 'and early warning system developed for Smart India', 'Hackathon 2024 (SIH1650).']}
            features={['Real-time GLOF Probability (XGBoost + live sensors)', 'Interactive React Dashboard with visualizations', 'SAR Image Analysis (Sentinel-1 CNN)', 'Automated Lake Size Detection', 'DEM-based Terrain & Water Flow Analysis', 'SMS Emergency Alerts (Twilio)', 'Live Weather Integration']}
            tech={['FastAPI', 'XGBoost', 'TensorFlow', 'React', 'Arduino/ESP32', 'LoRa']}
            repoUrl="https://github.com/Varun-310/Early-Warning-System-for-GLOF"
            badge="🏆 SIH '24 Winner">
            <div className="sub-project">
              <span className="line"><span className="cmt"># ↳ Sub-module: SAR Image Classification for GLOF</span></span>
              <span className="line"><span className="kw">class</span> <span className="cls">SARClassification</span><span className="pnc">(</span><span className="cls">GLOFSystem</span><span className="pnc">):</span></span>
              <span className="line i1"><span className="str">"""Sentinel-1 SAR imagery + CNNs for GLOF prediction."""</span></span>
              <span className="line i1"><span className="vr">tech</span> <span className="pnc">=</span> <span className="pnc">[</span><span className="str">"CNN"</span><span className="pnc">,</span> <span className="str">"Sentinel-1"</span><span className="pnc">,</span> <span className="str">"OpenCV"</span><span className="pnc">,</span> <span className="str">"Rasterio"</span><span className="pnc">]</span></span>
              <a href="https://github.com/Varun-310/SAR-IMAGE-CLASSIFICATION-FOR-GLOF-" target="_blank" rel="noreferrer" className="project-link"><GithubIcon /> view on github</a>
            </div>
          </ProjectCard>
          <ProjectCard decorator="Solace" fnName="solace"
            description={['A compassionate mental health companion powered by local AI.', 'Personalized assistant using emotion detection & contextual', 'memory for empathetic, human-like responses.', 'Runs 100% locally — no external API dependencies.']}
            features={['Emotion Detection — 27 different emotions via NLP', 'Contextual Memory — coherent conversation history', 'Empathetic Responses — adapted to emotional state', 'Privacy-First — all processing happens locally', 'No API Keys — uses local Ollama models (Gemma, Qwen)']}
            tech={['Python', 'Ollama', 'Node.js', 'Redis', 'NLP']}
            repoUrl="https://github.com/Varun-310/Solace" />
          <ProjectCard decorator="SCREAM" fnName="scream_detection"
            description={['Real-time scream detection application using MFCC', 'feature extraction with SVM and MLPClassifier.', 'Designed for enhancing security and emergency', 'response systems.']}
            features={['Real-time detection via live microphone input', 'High accuracy SVM + MLP prediction models', 'Modern Kivy UI with intuitive controls', 'Automated pop-up + SMS alerts (Twilio)']}
            tech={['Python', 'Scikit-learn', 'Kivy', 'Librosa', 'Twilio']}
            repoUrl="https://github.com/Varun-310/SCREAM" />
        </CodeSection>

        {/* ═══ CERTIFICATIONS ═══ */}
        <CodeSection id="certifications" gutterStart={101} gutterCount={10}>
          <span className="line">&nbsp;</span>
          <span className="line"><span className="cmt"># ─── Certifications ───────────────────────────────────────</span></span>
          <span className="line">&nbsp;</span>
          <span className="line i1"><span className="vr">certifications</span> <span className="pnc">=</span> <span className="pnc">[</span></span>
          <div className="list-block">
            {['Introduction to Generative AI — Google Cloud Skills Boost', 'Introduction to Large Language Models — Google Cloud Skills Boost', 'Transformer Models and BERT Model — Google Cloud Skills Boost', 'Create Your First Python Program — UST (Coursera)', 'Python 101 for Data Science — Cognitive Class'].map((c, i) => <div className="list-item" key={i}>{c}</div>)}
          </div>
          <span className="line i1"><span className="pnc">]</span></span>
        </CodeSection>

        {/* ═══ EVENTS ═══ */}
        <CodeSection id="events" gutterStart={111} gutterCount={9}>
          <span className="line">&nbsp;</span>
          <span className="line"><span className="cmt"># ─── Events & Achievements ────────────────────────────────</span></span>
          <span className="line">&nbsp;</span>
          <span className="line i1"><span className="vr">events</span> <span className="pnc">=</span> <span className="pnc">[</span></span>
          <div className="list-block">
            {["Smart India Hackathon '24 — Winner 🏆 Developed early warning system for GLOFs (DRDO)", "IMPELLZ'23 — Paper on 'Secure Biometric-Enabled Medical Data Management System'", "4th Intl Conf on Engineering & Technology — Paper on 'Nanostructured Materials'", "Bit Hacks Software Edition 2023 — Qualified to finals in AR/VR"].map((e, i) => <div className="list-item" key={i}>{e}</div>)}
          </div>
          <span className="line i1"><span className="pnc">]</span></span>
        </CodeSection>

        {/* ═══ EDUCATION ═══ */}
        <CodeSection id="education" gutterStart={120} gutterCount={8}>
          <span className="line">&nbsp;</span>
          <span className="line"><span className="cmt"># ─── Education ────────────────────────────────────────────</span></span>
          <span className="line">&nbsp;</span>
          <span className="line i1"><span className="vr">education</span> <span className="pnc">=</span> <span className="pnc">{'{'}</span></span>
          <span className="line i2"><span className="str">"degree"</span><span className="pnc">:</span> <span className="str">"B.Tech, AI and Machine Learning"</span><span className="pnc">,</span></span>
          <span className="line i2"><span className="str">"institution"</span><span className="pnc">:</span> <span className="str">"Bannari Amman Institute of Technology"</span><span className="pnc">,</span></span>
          <span className="line i2"><span className="str">"graduation"</span><span className="pnc">:</span> <span className="str">"March 2026"</span><span className="pnc">,</span></span>
          <span className="line i1"><span className="pnc">{'}'}</span></span>
        </CodeSection>

        {/* ═══ CONTACT ═══ */}
        <CodeSection id="contact" gutterStart={128} gutterCount={15}>
          <span className="line">&nbsp;</span>
          <span className="line"><span className="cmt"># ─── Connect ──────────────────────────────────────────────</span></span>
          <span className="line">&nbsp;</span>
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
    </>
  );
}
