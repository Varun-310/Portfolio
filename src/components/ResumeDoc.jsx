import { resume as r } from '../resume';

// One A4 page. Rendered inside the in-site viewer and printed to the PDF.
export default function ResumeDoc() {
  return (
    <article className="rdoc" aria-label="Resume of Varun K S">
      <header className="rdoc-head">
        <div>
          <h1>{r.name}</h1>
          <p className="rdoc-title">{r.title}</p>
        </div>
        <ul className="rdoc-contact">
          {r.contact.map((c) => (
            <li key={c.label}>{c.href ? <a href={c.href}>{c.label}</a> : c.label}</li>
          ))}
        </ul>
      </header>

      <p className="rdoc-summary">{r.summary}</p>

      <section>
        <h2>Experience</h2>
        {r.experience.map((e) => (
          <div key={e.org} className="rdoc-item">
            <div className="rdoc-row">
              <h3>{e.role}, <span>{e.org}</span></h3>
              <span className="rdoc-when">{e.when}</span>
            </div>
            <ul className="rdoc-points">{e.points.map((p) => <li key={p}>{p}</li>)}</ul>
          </div>
        ))}
      </section>

      <section>
        <h2>Selected projects</h2>
        {r.projects.map((p) => (
          <div key={p.name} className="rdoc-item">
            <div className="rdoc-row">
              <h3>{p.name} <span className="rdoc-kind">{p.kind}</span></h3>
              {p.note && <span className="rdoc-note">{p.note}</span>}
            </div>
            <ul className="rdoc-points">{p.points.map((x) => <li key={x}>{x}</li>)}</ul>
            <p className="rdoc-stack">{p.stack}</p>
          </div>
        ))}
      </section>

      <div className="rdoc-cols">
        <section>
          <h2>Skills</h2>
          <dl className="rdoc-skills">
            {r.skills.map((s) => (
              <div key={s.group}><dt>{s.group}</dt><dd>{s.items}</dd></div>
            ))}
          </dl>
        </section>
        <section>
          <h2>Achievements</h2>
          <ul className="rdoc-ach">
            {r.achievements.map((a) => (
              <li key={a.what}><b>{a.result}</b>, {a.what}{a.when ? ` (${a.when})` : ''}</li>
            ))}
          </ul>
          <h2 className="rdoc-gap">Education</h2>
          <p className="rdoc-edu"><b>{r.education.degree}</b><br />{r.education.school}, {r.education.when}</p>
          <h2 className="rdoc-gap">Certifications</h2>
          <p className="rdoc-cert">{r.certifications}</p>
        </section>
      </div>
    </article>
  );
}
