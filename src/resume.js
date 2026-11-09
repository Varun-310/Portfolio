// Resume content. The in-site viewer and the downloadable PDF both render from this file.

export const resume = {
  name: 'Varun K S',
  title: 'AI Engineer',
  contact: [
    { label: 'India, open to relocation' },
    { label: '+91 96007 85828', href: 'tel:+919600785828' },
    { label: 'itsvarun310@gmail.com', href: 'mailto:itsvarun310@gmail.com' },
    { label: 'github.com/Varun-310', href: 'https://github.com/Varun-310' },
    { label: 'linkedin.com/in/varun-ks-', href: 'https://www.linkedin.com/in/varun-ks-/' },
  ],
  summary:
    'AI engineer who builds LLM applications for messy, real-world problems: RAG pipelines, agentic systems and conversational AI, with additional depth in computer vision. Winner of Smart India Hackathon 2024 and a top 2% national finalist at the India AI Impact Buildathon. Currently interning as an AI engineer at Rapdfly.',

  experience: [
    {
      role: 'AI Engineering Intern',
      org: 'Rapdfly',
      when: '2026 - Present',
      points: [
        'Work on AI features and release builds for Rapdfly products, including the VinoVault app.',
        'Rebuilt the company website, with scroll-driven product storytelling and working lead forms.',
      ],
    },
  ],

  projects: [
    {
      name: 'Dhurvam',
      kind: 'AI honeypot for scam intelligence',
      note: 'Top 2% nationally, India AI Impact Buildathon 2026',
      stack: 'LangChain, Ollama, FastAPI, Redis',
      points: [
        'Detects scam messages, replies as a believable victim using LLM-driven dialogue, and keeps the scammer engaged.',
        'Extracts actionable intelligence from each conversation: payment IDs, phone numbers, links and scripts.',
      ],
    },
    {
      name: 'GLOF Early Warning System',
      kind: 'Flood prediction for glacial lakes',
      note: 'Winner, Smart India Hackathon 2024 (DRDO)',
      stack: 'XGBoost, TensorFlow, FastAPI, React, ESP32, LoRa, Twilio',
      points: [
        'Led the ML work: XGBoost anomaly detection on live IoT telemetry (water level, temperature, ground motion, pressure, flow).',
        'Trained CNNs on Sentinel-1 SAR imagery to flag early lake changes through cloud cover; alerts go out by SMS and a live dashboard.',
      ],
    },
    {
      name: 'Samudra (FloatChat)',
      kind: 'Conversational ocean data platform',
      stack: 'Gemini, LangChain, Pandas, Streamlit',
      points: [
        'Lets users ask plain-language questions over ARGO float data and get answers and charts straight from NetCDF profiles.',
      ],
    },
    {
      name: 'Aran',
      kind: 'Local vulnerability report generator',
      note: 'Finalist, Israel-India Global Innovators Hackathon',
      stack: 'Ollama, Llama 3, FastAPI',
      points: [
        'Generates structured vulnerability reports with fully local inference, so sensitive scan data never leaves the machine.',
      ],
    },
    {
      name: 'Solace',
      kind: 'AI mental health companion',
      stack: 'Gemini, LangChain, Node.js',
      points: [
        'Reads sentiment and keeps conversational memory to give empathetic, context-aware replies.',
      ],
    },
  ],

  // Skills are kept exactly to what the earlier resume listed.
  skills: [
    { group: 'LLMs and AI engineering', items: 'LLM application development, RAG pipelines, LangChain, prompt engineering, agentic systems, LLM inference (local and API)' },
    { group: 'AI and ML', items: 'Machine learning, deep learning, NLP, computer vision' },
    { group: 'Frameworks', items: 'TensorFlow / Keras, scikit-learn, XGBoost, OpenCV, PyTorch' },
    { group: 'Languages and tools', items: 'Python, SQL, C, n8n (workflow automation), Git' },
    { group: 'Soft skills', items: 'Team leadership, communication, research and documentation' },
  ],

  achievements: [
    { what: 'Smart India Hackathon 2024', result: 'Winner', when: '' },
    { what: 'India AI Impact Buildathon, HCL GUVI', result: 'Top 2% nationally', when: '2026' },
    { what: 'Israel-India Global Innovators Hackathon', result: 'Finalist', when: '' },
  ],

  education: {
    degree: 'B.Tech, Artificial Intelligence and Machine Learning',
    school: 'Bannari Amman Institute of Technology, Coimbatore',
    when: '2022 - 2026',
  },

  certifications:
    'Google Cloud: Introduction to Generative AI, Introduction to Large Language Models, Transformer Models and BERT',
};

export const RESUME_PDF = '/Varun_K_S_Resume.pdf';
