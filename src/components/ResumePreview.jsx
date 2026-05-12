import { useResume } from '../context/ResumeContext';
import { useRef, useState, useEffect } from 'react';

// A4 printable area at 96 dpi (297mm - 2×12.7mm = 271.6mm)
const MM_TO_PX = 96 / 25.4;
const AVAIL_H_PX = (297 - 2 * 12.7) * MM_TO_PX; // ≈ 1026 px
const AVAIL_W_PX = (210 - 2 * 12.7) * MM_TO_PX; // ≈ 698 px
const MIN_FONT_SCALE = 0.60; // won't reduce below 6 pt for a 10 pt base

export default function ResumePreview() {
  const { resume } = useResume();
  const { personalInfo, workExperience, education, skills, projects, certifications, languages } = resume;
  const resumeRef = useRef(null);
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

  const getPdfOptions = (filename) => ({
    margin: [12.7, 12.7, 12.7, 12.7],
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['css', 'legacy'] },
  });

  /**
   * Calculate the font scale needed to fit everything on one A4 page.
   * Returns a value between MIN_FONT_SCALE and 1.
   * element.style.padding must already be '0' before calling.
   */
  const calcSinglePageScale = (element) => {
    const contentH = element.scrollHeight;
    const contentW = element.offsetWidth > 0 ? element.offsetWidth : AVAIL_W_PX;
    // How tall the content would be in the PDF (scaled to available width)
    const heightInPdf = (contentH / contentW) * AVAIL_W_PX;
    if (heightInPdf <= AVAIL_H_PX) return 1; // already fits
    const scale = AVAIL_H_PX / heightInPdf;
    return Math.max(scale, MIN_FONT_SCALE);
  };

  const withPdfElement = (action, { singlePage = false } = {}) => {
    const element = resumeRef.current;
    if (!element) return;

    const origPadding = element.style.padding;
    const origFontSize = element.style.fontSize;
    element.style.padding = '0';

    let appliedScale = 1;
    if (singlePage) {
      appliedScale = calcSinglePageScale(element);
      if (appliedScale < 1) {
        element.style.fontSize = `${10 * appliedScale}pt`;
      }
    }

    import('html2pdf.js')
      .then(({ default: html2pdf }) => {
        const opt = getPdfOptions(`${personalInfo.fullName || 'resume'}.pdf`);
        return action(html2pdf, opt, element, appliedScale);
      })
      .catch(() => {})
      .finally(() => {
        element.style.padding = origPadding;
        element.style.fontSize = origFontSize;
      });
  };

  const handleDownloadMultiPage = () => {
    setDlMenuOpen(false);
    withPdfElement((html2pdf, opt, element) =>
      html2pdf().set(opt).from(element).save()
    );
  };

  const handleDownloadSinglePage = () => {
    setDlMenuOpen(false);
    withPdfElement(
      (html2pdf, opt, element) => html2pdf().set(opt).from(element).save(),
      { singlePage: true }
    );
  };

  const handlePreviewPDF = () => {
    withPdfElement((html2pdf, opt, element) =>
      html2pdf().set(opt).from(element).outputPdf('bloburl').then((blobUrl) => {
        window.open(blobUrl, '_blank');
      })
    );
  };

  const hasContent = personalInfo.fullName || personalInfo.email;

  return (
    <div className="preview-panel">
      <div className="preview-toolbar">
        <h2 className="preview-title">Live Preview</h2>
        <div className="preview-toolbar-actions">
          <button className="btn-preview" onClick={handlePreviewPDF} disabled={!hasContent}>
            👁 Preview PDF
          </button>
          <div className="btn-download-group" ref={dlMenuRef}>
            <button className="btn-download" onClick={handleDownloadMultiPage} disabled={!hasContent}>
              ⬇ Download PDF
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
                <button onClick={handleDownloadMultiPage}>📑 Multi-Page PDF</button>
                <button onClick={handleDownloadSinglePage}>📄 Single-Page PDF</button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="resume-paper-wrapper">
        <div className="resume-paper" ref={resumeRef}>
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
