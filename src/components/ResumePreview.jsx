import { useResume } from '../context/ResumeContext';
import { useState } from 'react';

// Keep preview URLs alive longer so users can read/open the new tab reliably.
const PREVIEW_URL_REVOKE_DELAY_MS = 60_000;
// Download URLs can be revoked quickly after the browser starts the file save.
const DOWNLOAD_URL_REVOKE_DELAY_MS = 5000;

export default function ResumePreview() {
  const { resume } = useResume();
  const { personalInfo, workExperience, education, skills, projects, certifications, languages } = resume;
  const [exportMode, setExportMode] = useState('single');
  const isSinglePage = exportMode === 'single';
  const selectedModeLabel = isSinglePage ? 'Single Page' : 'Multi-Page';

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

  const handlePreviewPDF = async () => {
    const blob = await buildResumePdfBlob({ singlePage: isSinglePage });
    openPreviewFromBlob(blob);
  };

  const handleDownloadPDF = async () => {
    const blob = await buildResumePdfBlob({ singlePage: isSinglePage });
    downloadBlob(blob, `${personalInfo.fullName || 'resume'}.pdf`);
  };

  const hasContent = personalInfo.fullName || personalInfo.email;

  return (
    <div className="preview-panel">
      <div className="preview-toolbar">
        <h2 className="preview-title">Live Preview</h2>
        <div className="preview-toolbar-actions">
          <div className="export-mode-selector" role="radiogroup" aria-label="PDF export mode">
            <label className="export-mode-option">
              <input
                type="radio"
                name="export-mode"
                value="single"
                checked={isSinglePage}
                onChange={() => setExportMode('single')}
              />
              Single Page
            </label>
            <label className="export-mode-option">
              <input
                type="radio"
                name="export-mode"
                value="multi"
                checked={!isSinglePage}
                onChange={() => setExportMode('multi')}
              />
              Multi-Page
            </label>
          </div>
          <button className="btn-preview" onClick={handlePreviewPDF} disabled={!hasContent}>
            👁 Preview PDF ({selectedModeLabel})
          </button>
          <button className="btn-download" onClick={handleDownloadPDF} disabled={!hasContent}>
            ⬇ Download PDF ({selectedModeLabel})
          </button>
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

          {/* Summary */}
          {personalInfo.summary && (
            <section className="resume-section">
              <h3 className="resume-section-title">Professional Summary</h3>
              <p className="resume-summary">{personalInfo.summary}</p>
            </section>
          )}

          {/* Work Experience */}
          {workExperience.length > 0 && (
            <section className="resume-section">
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
          )}

          {/* Education */}
          {education.length > 0 && (
            <section className="resume-section">
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
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <section className="resume-section">
              <h3 className="resume-section-title">Skills</h3>
              <p className="resume-skills-plain">{skills.join(' • ')}</p>
            </section>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <section className="resume-section">
              <h3 className="resume-section-title">Projects</h3>
              {projects.map((proj, i) => (
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
                  {proj.description && <p className="resume-proj-desc">{proj.description}</p>}
                </div>
              ))}
            </section>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <section className="resume-section">
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
          )}

          {/* Languages */}
          {languages.length > 0 && (
            <section className="resume-section">
              <h3 className="resume-section-title">Languages</h3>
              <div className="resume-languages">
                {languages.map((lang, i) => (
                  <span className="resume-language-item" key={i}>
                    {lang.language}{lang.proficiency ? ` (${lang.proficiency})` : ''}
                  </span>
                ))}
              </div>
            </section>
          )}

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
