// All site copy and content lives here. Edit this file to update the portfolio.

export const person = {
  name: 'Varun K S',
  first: 'Varun',
  role: 'AI Engineer',
  email: 'itsvarun310@gmail.com',
  github: 'https://github.com/Varun-310',
  linkedin: 'https://www.linkedin.com/in/varun-ks-/',
  resume: '/Varun_K_S_Resume.pdf',
  location: 'India, open to relocation',
  // Kept deliberately quiet: one small line near the footer.
  interning: 'Currently interning at Rapdfly and TrakIntel.',
};

// Chapters drive the companion avatar. `say` is his line for that chapter.
export const chapters = [
  { id: 'top', label: 'Hello', say: "Hi, I'm Varun. I'll walk you through it." },
  { id: 'curious', label: 'Curious', say: 'I like taking things apart. This is where that started.' },
  { id: 'glacier', label: 'The lake', say: 'Our first problem with real stakes. Keep scrolling and watch the lake.' },
  { id: 'impact', label: 'Impact', say: 'Projects where something actually changed. Keep scrolling, they slide past.' },
  { id: 'building', label: 'Building', say: 'Still curious, still building.' },
  { id: 'along', label: 'Milestones', say: 'A few markers along the way.' },
  { id: 'next', label: 'Next', say: "That's the story so far. Your turn." },
];

export const nav = [
  { id: 'curious', label: 'About' },
  { id: 'impact', label: 'Work' },
  { id: 'building', label: 'Building' },
  { id: 'next', label: 'Contact' },
];

export const askMe = [
  {
    q: 'What do you build?',
    a: 'AI systems for messy, real-world problems. A honeypot that talks back to scammers, an early warning system for glacial lakes, a way to ask the ocean questions in plain language.',
  },
  {
    q: 'What are you curious about?',
    a: 'How models actually reason, why people trust what they trust, and how small models can do big jobs. Outside code, almost anything I do not understand yet.',
  },
  {
    q: 'What are you doing now?',
    a: 'Interning, shipping AI into real products, and always halfway through building the next project of my own.',
  },
  {
    q: 'Can we talk?',
    a: "Yes. AI engineering roles, collaborations, or a problem you're stuck on. Email reaches me fastest, and I reply.",
  },
];

export const curious = {
  text: "Honestly, I can't use something for long without wanting to know how it works. So I open it up. I read what's under the hood instead of just calling it, I break small things on purpose, and I keep rebuilding until the why clicks. Somewhere along the way I noticed the hard part is rarely the code. It's understanding the person on the other side. That's the part I keep coming back to. And most weeks, I'm halfway through learning something new. I like it that way.",
  questions: [
    ['How does it actually work?', 'What happens if I change this?', 'Who is this really for?', 'What is the simplest version?'],
    ['Why do people trust what they trust?', 'What did the docs leave out?', 'Where does this break?', 'What should I learn next?'],
  ],
};

export const glacier = {
  steps: [
    {
      k: 'Sense',
      t: 'IoT sensors on the lake',
      d: 'Water level, temperature, ground motion, pressure and flow rate, streamed over LoRa where there is no network.',
    },
    {
      k: 'Flag',
      t: 'XGBoost on the telemetry',
      d: 'Anomaly detection on the sensor stream, tuned to catch the slow rise before the fast one.',
    },
    {
      k: 'See',
      t: 'Sentinel-1 SAR from orbit',
      d: 'CNNs on radar imagery that sees through cloud, to watch the lake itself change shape.',
    },
    {
      k: 'Warn',
      t: 'An alert people receive',
      d: 'SMS through Twilio to the villages downstream, plus a live dashboard for the people in charge.',
    },
  ],
  links: [
    { label: 'Early warning system', href: 'https://github.com/Varun-310/Early-Warning-System-for-GLOF' },
    { label: 'SAR classification', href: 'https://github.com/Varun-310/SAR-IMAGE-CLASSIFICATION-FOR-GLOF-' },
    { label: 'Sensor and alert code', href: 'https://github.com/Varun-310/GLOF-SENSOR-and-ALERT' },
  ],
};

const gh = (repo) => `https://github.com/Varun-310/${repo}`;

// Projects with a visible effect. `demo` picks the live visual for each one.
export const impact = [
  {
    id: 'dhurvam',
    name: 'Dhurvam',
    tag: 'Top 2% nationally, India AI Impact Buildathon',
    problem: "Scam messages reach millions of people, and most reports stop at 'block this number'.",
    built: 'An AI honeypot that spots the scam, replies as a believable victim, and keeps the scammer talking.',
    effect: 'Every conversation turns into intelligence: payment IDs, phone numbers, links and the script they follow.',
    tech: ['LangChain', 'Ollama', 'FastAPI', 'Redis'],
    private: true,
    demo: 'scam',
  },
  {
    id: 'samudra',
    name: 'Samudra',
    tag: 'Conversational ocean data, FloatChat',
    problem: 'ARGO floats send back rich ocean data, locked inside NetCDF files only specialists can read.',
    built: 'A chat interface where you ask in plain language and get answers and charts straight from the raw float profiles.',
    effect: 'Students, researchers and the plainly curious can explore the ocean without writing a line of code.',
    tech: ['Gemini', 'LangChain', 'Pandas', 'Streamlit'],
    repo: gh('SAMUDRA'),
    demo: 'ocean',
  },
  {
    id: 'aran',
    name: 'Aran',
    tag: 'Finalist, Israel-India Global Innovators Hackathon',
    problem: "Security teams can't paste vulnerability data into a cloud chatbot.",
    built: 'A report generator that runs Llama 3 entirely on the local machine.',
    effect: 'Clear vulnerability reports in minutes, and the sensitive data never leaves the building.',
    tech: ['Ollama', 'Llama 3', 'FastAPI'],
    private: true,
    demo: 'local',
  },
  {
    id: 'solace',
    name: 'Solace',
    tag: 'An AI companion for hard nights',
    problem: 'When things feel heavy, the hardest part is finding someone who listens without judging.',
    built: 'A Gemini companion that reads sentiment, remembers what you said, and adjusts its tone.',
    effect: 'Replies that stay gentle and relevant, instead of generic advice.',
    tech: ['Gemini', 'LangChain', 'NLP', 'Node.js'],
    repo: gh('Solace'),
    demo: 'calm',
  },
];

export const building = {
  lede: 'The list of questions keeps growing, so the list of projects does too. What I am digging into now:',
  exploring: [
    { t: 'Agents that check their own work', d: 'A second opinion inside the system, before an answer ever reaches a person.' },
    { t: 'Small models, close to the data', d: 'Useful AI that runs on hardware you own, for the data that should never leave.' },
    { t: 'Reasoning you can inspect', d: 'Making a model show its working, so people can trust it for the right reasons.' },
  ],
};

// Kept exactly to the skills on the earlier resume.
export const toolkit = [
  { group: 'LLMs and AI', items: ['LLM apps', 'RAG pipelines', 'LangChain', 'Prompt engineering', 'Agentic systems', 'LLM inference'] },
  { group: 'AI and ML', items: ['Machine learning', 'Deep learning', 'NLP', 'Computer vision'] },
  { group: 'Frameworks', items: ['TensorFlow / Keras', 'scikit-learn', 'XGBoost', 'OpenCV', 'PyTorch'] },
  { group: 'Languages', items: ['Python', 'SQL', 'C'] },
  { group: 'Tools', items: ['n8n', 'Git'] },
];

// Where each skill shows up, so hovering one lights up its projects.
const used = {
  'LLM apps': ['Samudra', 'Solace', 'Dhurvam'],
  'RAG pipelines': ['Samudra'],
  LangChain: ['Dhurvam', 'Samudra', 'Solace'],
  'Prompt engineering': ['Dhurvam', 'Solace'],
  'Agentic systems': ['Dhurvam'],
  'LLM inference': ['Aran (local)', 'Dhurvam (local)', 'Samudra (API)'],
  'Machine learning': ['GLOF sensor anomalies'],
  'Deep learning': ['GLOF SAR imagery'],
  NLP: ['Solace', 'Dhurvam'],
  'Computer vision': ['GLOF SAR imagery'],
  'TensorFlow / Keras': ['GLOF SAR imagery'],
  'scikit-learn': ['Audio classification'],
  XGBoost: ['GLOF sensor anomalies'],
  OpenCV: ['GLOF SAR imagery'],
  PyTorch: ['Model experiments'],
  Python: ['Almost everything'],
  SQL: ['Data work'],
  C: ['Embedded and coursework'],
  n8n: ['Automation workflows'],
  Git: ['Every project'],
};
export const usedIn = (tool) => used[tool] || [];

export const milestones = [
  {
    when: '2024',
    what: 'Smart India Hackathon',
    result: 'Winner',
    note: 'Led the ML work on the GLOF early warning system. Problem statement from DRDO.',
    win: true,
  },
  {
    when: '2026',
    what: 'India AI Impact Buildathon, HCL GUVI',
    result: 'Top 2% nationally',
    note: 'Built Dhurvam for the AI Impact Summit 2026.',
  },
  {
    when: '',
    what: 'Israel-India Global Innovators Hackathon',
    result: 'Finalist',
    note: 'Built Aran, a fully local vulnerability report generator.',
  },
];

export const certifications = [
  'Google Cloud Skills Boost: Introduction to Generative AI',
  'Google Cloud Skills Boost: Introduction to Large Language Models',
  'Google Cloud Skills Boost: Transformer Models and BERT Model',
  'Coursera (UST): Create Your First Python Program',
  'Cognitive Class: Python 101 for Data Science',
];

export const education = {
  degree: 'B.Tech, Artificial Intelligence and Machine Learning',
  school: 'Bannari Amman Institute of Technology',
  when: '2022 - 2026',
};
