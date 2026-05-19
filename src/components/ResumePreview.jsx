import { useResume } from '../context/ResumeContext';
import { useRef, useState, useEffect } from 'react';

// Keep preview URLs alive longer so users can read/open the new tab reliably.
const PREVIEW_URL_REVOKE_DELAY_MS = 60_000;
// Download URLs can be revoked quickly after the browser starts the file save.
const DOWNLOAD_URL_REVOKE_DELAY_MS = 5000;
const DEFAULT_SECTION_ORDER = [
  'summary',
  'workExperience',
  'education',
  'skills',
  'projects',
  'certifications',
  'languages',
];

export default function ResumePreview() {
  const { resume } = useResume();
  const {
    personalInfo,
    workExperience,
    education,
    skills,
    projects,
    certifications,
    languages,
    sectionOrder: storedSectionOrder,
  } = resume;
  const sectionOrder = Array.isArray(storedSectionOrder) ? storedSectionOrder : DEFAULT_SECTION_ORDER;
  const [dlMenuOpen, setDlMenuOpen] = useState(false);
  const dlMenuRef = useRef(null);

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dlMenuRef.current && !dlMenuRef.current.contains(e.target)) {
        setDlMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const buildResumePdfBlob = async ({ singlePage }) => {
    const [{ pdf }, { default: ResumePdfDocument }] = await Promise.all([
      import('@react-pdf/renderer'),
      import('./pdf/ResumePdfDocument'),
    ]);
    const doc = <ResumePdfDocument resume={resume} singlePage={singlePage} />;
    return pdf(doc).toBlob();
  };

  const openPreviewFromBlob = (blob) => {
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank', 'noopener,noreferrer');
    setTimeout(() => URL.revokeObjectURL(blobUrl), PREVIEW_URL_REVOKE_DELAY_MS);
  };

  const downloadBlob = (blob, filename) => {
    const blobUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = blobUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(blobUrl), DOWNLOAD_URL_REVOKE_DELAY_MS);
  };

  const handleDownloadMultiPage = async () => {
    setDlMenuOpen(false);
    const blob = await buildResumePdfBlob({ singlePage: false });
    downloadBlob(blob, `${personalInfo.fullName || 'resume'}.pdf`);
  };

  const handleDownloadSinglePage = async () => {
    setDlMenuOpen(false);
    const blob = await buildResumePdfBlob({ singlePage: true });
    downloadBlob(blob, `${personalInfo.fullName || 'resume'}.pdf`);
  };

  const handlePreviewPDF = async () => {
    setDlMenuOpen(false);
    const blob = await buildResumePdfBlob({ singlePage: true });
    openPreviewFromBlob(blob);
  };

  const handlePreviewMultiPage = async () => {
    setDlMenuOpen(false);
    const blob = await buildResumePdfBlob({ singlePage: false });
    openPreviewFromBlob(blob);
  };

  const hasContent = personalInfo.fullName || personalInfo.email;

  const sectionRenderers = {
    summary: (key) => (
      personalInfo.summary ? (
        <section className="resume-section" key={key}>
          <h3 className="resume-section-title">Professional Summary</h3>
          <p className="resume-summary">{personalInfo.summary}</p>
        </section>
      ) : null
    ),
    workExperience: (key) => (
      workExperience.length > 0 ? (
        <section className="resume-section" key={key}>
          <h3 className="resume-section-title">Work Experience</h3>
          {workExperience.map((exp, i) => (
            <div className="resume-entry" key={i}>
              <div className="resume-entry-header">
                <div>
                  <span className="resume-entry-title">{exp.jobTitle}</span>
                  {exp.company && <span className="resume-entry-subtitle"> — {exp.company}</span>}
                </div>
                <span className="resume-entry-date">
                  {exp.startDate}{exp.startDate && (exp.endDate || exp.current) ? ' – ' : ''}{exp.current ? 'Present' : exp.endDate}
                </span>
              </div>
              {exp.location && <p className="resume-entry-location">{exp.location}</p>}
              {exp.description && (
                <div className="resume-entry-desc">
                  {exp.description.split('\n').map((line, j) => (
                    <p key={j}>{line}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>
      ) : null
    ),
    education: (key) => (
      education.length > 0 ? (
        <section className="resume-section" key={key}>
          <h3 className="resume-section-title">Education</h3>
          {education.map((edu, i) => (
            <div className="resume-entry" key={i}>
              <div className="resume-entry-header">
                <div>
                  <span className="resume-entry-title">{edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}</span>
                  {edu.institution && <span className="resume-entry-subtitle"> — {edu.institution}</span>}
                </div>
                <span className="resume-entry-date">
                  {edu.startDate}{edu.startDate && edu.endDate ? ' – ' : ''}{edu.endDate}
                </span>
              </div>
              {edu.gpa && <p className="resume-entry-location">GPA: {edu.gpa}</p>}
            </div>
          ))}
        </section>
      ) : null
    ),
    skills: (key) => (
      skills.length > 0 ? (
        <section className="resume-section" key={key}>
          <h3 className="resume-section-title">Skills</h3>
          <p className="resume-skills-plain">{skills.join(' • ')}</p>
        </section>
      ) : null
    ),
    projects: (key) => (
      projects.length > 0 ? (
        <section className="resume-section" key={key}>
          <h3 className="resume-section-title">Projects</h3>
          {projects.map((proj, i) => {
            const descriptionLines = proj.description
              ? proj.description.split('\n').map(line => line.trim()).filter(Boolean)
              : [];
            return (
              <div className="resume-entry" key={i}>
                <div className="resume-entry-header">
                  <div className="resume-proj-name-row">
                    <span className="resume-entry-title">{proj.name}</span>
                    {proj.link && (
                      <a href={proj.link} className="resume-entry-link" target="_blank" rel="noreferrer">
                        {proj.link}
                      </a>
                    )}
                  </div>
                </div>
                {proj.technologies && <p className="resume-entry-location"><em>Technologies: {proj.technologies}</em></p>}
                {descriptionLines.length > 0 && (
                  <ul className="resume-proj-desc-list">
                    {descriptionLines.map((line, j) => (
                      <li key={j}>{line}</li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </section>
      ) : null
    ),
    certifications: (key) => (
      certifications.length > 0 ? (
        <section className="resume-section" key={key}>
          <h3 className="resume-section-title">Certifications</h3>
          {certifications.map((cert, i) => (
            <div className="resume-entry" key={i}>
              <div className="resume-entry-header">
                <span className="resume-entry-title">{cert.name}</span>
                <span className="resume-entry-date">{cert.date}</span>
              </div>
              {cert.organization && <p className="resume-entry-location">{cert.organization}</p>}
            </div>
          ))}
        </section>
      ) : null
    ),
    languages: (key) => (
      languages.length > 0 ? (
        <section className="resume-section" key={key}>
          <h3 className="resume-section-title">Languages</h3>
          <div className="resume-languages">
            {languages.map((lang, i) => (
              <span className="resume-language-item" key={i}>
                {lang.language}{lang.proficiency ? ` (${lang.proficiency})` : ''}
              </span>
            ))}
          </div>
        </section>
      ) : null
    ),
  };

  return (
    <div className="preview-panel">
      <div className="preview-toolbar">
        <h2 className="preview-title">Live Preview</h2>
        <div className="preview-toolbar-actions">
          <button className="btn-preview" onClick={handlePreviewPDF} disabled={!hasContent}>
            👁 Preview PDF (Single Page)
          </button>
          <div className="btn-download-group" ref={dlMenuRef}>
            <button className="btn-download" onClick={handleDownloadSinglePage} disabled={!hasContent}>
              ⬇ Download PDF (Single Page)
            </button>
            <button
              className="btn-download btn-download-arrow"
              onClick={() => setDlMenuOpen(o => !o)}
              disabled={!hasContent}
              aria-label="More download options"
            >
              ▾
            </button>
            {dlMenuOpen && (
              <div className="download-menu">
                <button onClick={handleDownloadSinglePage}>📄 Single-Page PDF (Default)</button>
                <button onClick={handleDownloadMultiPage}>📑 Multi-Page PDF</button>
                <button onClick={handlePreviewMultiPage}>👁 Multi-Page Preview</button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="resume-paper-wrapper">
        <div className="resume-paper">
          {/* Header */}
          <div className="resume-header">
            {personalInfo.fullName && <h1 className="resume-name">{personalInfo.fullName}</h1>}
            {personalInfo.jobTitle && <p className="resume-job-title">{personalInfo.jobTitle}</p>}
            <div className="resume-contact">
              {personalInfo.email && <span>{personalInfo.email}</span>}
              {personalInfo.phone && <span>{personalInfo.phone}</span>}
              {personalInfo.location && <span>{personalInfo.location}</span>}
              {personalInfo.linkedin && (
                <span>
                  <a href={personalInfo.linkedin} target="_blank" rel="noreferrer">{personalInfo.linkedin}</a>
                </span>
              )}
              {personalInfo.github && (
                <span>
                  <a href={personalInfo.github} target="_blank" rel="noreferrer">{personalInfo.github}</a>
                </span>
              )}
            </div>
          </div>

          {sectionOrder.map((sectionKey) => sectionRenderers[sectionKey]?.(sectionKey))}

          {!hasContent && (
            <div className="resume-empty-state">
              <p>Start filling in the form to see your resume preview here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
