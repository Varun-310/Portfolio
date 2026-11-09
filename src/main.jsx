import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/schibsted-grotesk/wght.css';
import '@fontsource-variable/schibsted-grotesk/wght-italic.css';
import '@fontsource-variable/jetbrains-mono/wght.css';
import './styles.css';
import './resume.css';
import App from './App';
import ResumeDoc from './components/ResumeDoc';

// `?print=resume` renders only the resume page; used to produce the PDF.
const printing = new URLSearchParams(window.location.search).get('print') === 'resume';
if (printing) document.documentElement.classList.add('print-resume');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {printing ? <ResumeDoc /> : <App />}
  </StrictMode>
);
