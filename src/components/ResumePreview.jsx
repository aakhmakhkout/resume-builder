import { useResume } from '../context/ResumeContext';
import { useRef, useState, useEffect } from 'react';
import { getSafeSectionOrder, getSinglePageFitSettings } from '../utils/singlePageFit';

// Keep preview URLs alive longer so users can read/open the new tab reliably.
const PREVIEW_URL_REVOKE_DELAY_MS = 60_000;
// Download URLs can be revoked quickly after the browser starts the file save.
const DOWNLOAD_URL_REVOKE_DELAY_MS = 5000;
const LAYOUT_STORAGE_KEY = 'resume_builder_layout';
const SINGLE_PAGE_MODE_STORAGE_KEY = 'resume_builder_single_page_mode';
const LAYOUT_OPTIONS = [
  { value: 'traditional', label: 'Layout 1 · Traditional' },
  { value: 'two-column', label: 'Layout 2 · Two Column' },
  { value: 'modern', label: 'Layout 3 · Modern Professional' },
];
const LAYOUT_VALUES = new Set(LAYOUT_OPTIONS.map((option) => option.value));
const LEFT_COLUMN_SECTIONS = new Set(['skills', 'languages', 'certifications']);

const getInitialLayout = () => {
  try {
    const stored = localStorage.getItem(LAYOUT_STORAGE_KEY);
    return LAYOUT_VALUES.has(stored) ? stored : 'traditional';
  } catch {
    return 'traditional';
  }
};

const getInitialSinglePageMode = () => {
  try {
    return localStorage.getItem(SINGLE_PAGE_MODE_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
};

const renderDateRange = (startDate, endDate, current) => (
  `${startDate || ''}${startDate && (endDate || current) ? ' – ' : ''}${current ? 'Present' : endDate || ''}`.trim()
);

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
  const sectionOrder = getSafeSectionOrder(storedSectionOrder);
  const [selectedLayout, setSelectedLayout] = useState(getInitialLayout);
  const [singlePageMode, setSinglePageMode] = useState(getInitialSinglePageMode);
  const [dlMenuOpen, setDlMenuOpen] = useState(false);
  const dlMenuRef = useRef(null);
  const singlePageFit = getSinglePageFitSettings(resume, { enabled: singlePageMode, layout: selectedLayout });

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

  useEffect(() => {
    try {
      localStorage.setItem(LAYOUT_STORAGE_KEY, selectedLayout);
    } catch {
      // ignore storage errors
    }
  }, [selectedLayout]);

  useEffect(() => {
    try {
      localStorage.setItem(SINGLE_PAGE_MODE_STORAGE_KEY, String(singlePageMode));
    } catch {
      // ignore storage errors
    }
  }, [singlePageMode]);

  const buildResumePdfBlob = async ({ singlePage }) => {
    const [{ pdf }, { default: ResumePdfDocument }] = await Promise.all([
      import('@react-pdf/renderer'),
      import('./pdf/ResumePdfDocument'),
    ]);
    const effectiveSinglePage = singlePageMode || singlePage;
    const doc = (
      <ResumePdfDocument
        resume={resume}
        singlePage={effectiveSinglePage}
        singlePageMode={singlePageMode}
        layout={selectedLayout}
      />
    );
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

  const renderContact = (stacked = false) => (
    <div className={`resume-contact${stacked ? ' resume-contact--stacked' : ''}`}>
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
  );

  const renderSection = (sectionKey, key, variant = 'default') => {
    const isCompact = variant === 'compact';
    const isModern = variant === 'modern';
    const isModernWide = isModern && ['summary', 'workExperience', 'projects'].includes(sectionKey);
    const sectionClass = [
      'resume-section',
      isCompact ? 'resume-section--compact' : '',
      isModern ? 'resume-section--modern' : '',
      isModernWide ? 'resume-section--modern-wide' : '',
    ].filter(Boolean).join(' ');
    const titleClass = [
      'resume-section-title',
      isModern ? 'resume-section-title--modern' : '',
    ].filter(Boolean).join(' ');

    if (sectionKey === 'summary') {
      return personalInfo.summary ? (
        <section className={sectionClass} key={key}>
          <h3 className={titleClass}>Professional Summary</h3>
          <p className="resume-summary">{personalInfo.summary}</p>
        </section>
      ) : null;
    }

    if (sectionKey === 'workExperience') {
      return workExperience.length > 0 ? (
        <section className={sectionClass} key={key}>
          <h3 className={titleClass}>Work Experience</h3>
          {workExperience.map((exp, i) => (
            <div className="resume-entry" key={i}>
              <div className="resume-entry-header">
                <div>
                  <span className="resume-entry-title">{exp.jobTitle}</span>
                  {exp.company && <span className="resume-entry-subtitle"> — {exp.company}</span>}
                </div>
                <span className="resume-entry-date">{renderDateRange(exp.startDate, exp.endDate, exp.current)}</span>
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
      ) : null;
    }

    if (sectionKey === 'education') {
      return education.length > 0 ? (
        <section className={sectionClass} key={key}>
          <h3 className={titleClass}>Education</h3>
          {education.map((edu, i) => (
            <div className="resume-entry" key={i}>
              <div className="resume-entry-header">
                <div>
                  <span className="resume-entry-title">{edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}</span>
                  {edu.institution && <span className="resume-entry-subtitle"> — {edu.institution}</span>}
                </div>
                <span className="resume-entry-date">{renderDateRange(edu.startDate, edu.endDate, false)}</span>
              </div>
              {edu.gpa && <p className="resume-entry-location">GPA: {edu.gpa}</p>}
            </div>
          ))}
        </section>
      ) : null;
    }

    if (sectionKey === 'skills') {
      return skills.length > 0 ? (
        <section className={sectionClass} key={key}>
          <h3 className={titleClass}>Skills</h3>
          <p className="resume-skills-plain">{skills.join(' • ')}</p>
        </section>
      ) : null;
    }

    if (sectionKey === 'projects') {
      return projects.length > 0 ? (
        <section className={sectionClass} key={key}>
          <h3 className={titleClass}>Projects</h3>
          {projects.map((proj, i) => {
            const descriptionLines = proj.description
              ? proj.description.split('\n').map((line) => line.trim()).filter(Boolean)
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
      ) : null;
    }

    if (sectionKey === 'certifications') {
      return certifications.length > 0 ? (
        <section className={sectionClass} key={key}>
          <h3 className={titleClass}>Certifications</h3>
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
      ) : null;
    }

    if (sectionKey === 'languages') {
      return languages.length > 0 ? (
        <section className={sectionClass} key={key}>
          <h3 className={titleClass}>Languages</h3>
          <div className="resume-languages">
            {languages.map((lang, i) => (
              <span className="resume-language-item" key={i}>
                {lang.language}{lang.proficiency ? ` (${lang.proficiency})` : ''}
              </span>
            ))}
          </div>
        </section>
      ) : null;
    }

    return null;
  };

  const leftColumnOrder = sectionOrder.filter((sectionKey) => LEFT_COLUMN_SECTIONS.has(sectionKey));
  const rightColumnOrder = sectionOrder.filter((sectionKey) => !LEFT_COLUMN_SECTIONS.has(sectionKey));

  const renderTraditionalLayout = () => (
    <>
      <div className="resume-header">
        {personalInfo.fullName && <h1 className="resume-name">{personalInfo.fullName}</h1>}
        {personalInfo.jobTitle && <p className="resume-job-title">{personalInfo.jobTitle}</p>}
        {renderContact(false)}
      </div>
      {sectionOrder.map((sectionKey) => renderSection(sectionKey, sectionKey, 'default'))}
    </>
  );

  const renderTwoColumnLayout = () => (
    <div className="resume-layout-two-column">
      <aside className="resume-sidebar">
        {personalInfo.fullName && <h1 className="resume-name resume-name--sidebar">{personalInfo.fullName}</h1>}
        {personalInfo.jobTitle && <p className="resume-job-title resume-job-title--sidebar">{personalInfo.jobTitle}</p>}
        {renderContact(true)}
        {leftColumnOrder.map((sectionKey) => renderSection(sectionKey, `left-${sectionKey}`, 'compact'))}
      </aside>
      <main className="resume-main-column">
        {rightColumnOrder.map((sectionKey) => renderSection(sectionKey, `right-${sectionKey}`, 'default'))}
      </main>
    </div>
  );

  const renderModernLayout = () => (
    <>
      <div className="resume-header resume-header--modern">
        <div>
          {personalInfo.fullName && <h1 className="resume-name resume-name--modern">{personalInfo.fullName}</h1>}
          {personalInfo.jobTitle && <p className="resume-job-title resume-job-title--modern">{personalInfo.jobTitle}</p>}
        </div>
        {renderContact(false)}
      </div>
      <div className="resume-modern-grid">
        {sectionOrder.map((sectionKey) => renderSection(sectionKey, `modern-${sectionKey}`, 'modern'))}
      </div>
    </>
  );

  const renderLayout = () => {
    if (selectedLayout === 'two-column') return renderTwoColumnLayout();
    if (selectedLayout === 'modern') return renderModernLayout();
    return renderTraditionalLayout();
  };

  return (
    <div className="preview-panel">
      <div className="preview-toolbar">
        <h2 className="preview-title">Live Preview</h2>
        <div className="preview-toolbar-actions">
          <div className="layout-selector">
            <label htmlFor="resume-layout-select">Layout</label>
            <select
              id="resume-layout-select"
              value={selectedLayout}
              onChange={(e) => setSelectedLayout(e.target.value)}
            >
              {LAYOUT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <label className="single-page-toggle" htmlFor="single-page-mode-toggle">
            <input
              id="single-page-mode-toggle"
              type="checkbox"
              checked={singlePageMode}
              onChange={(e) => setSinglePageMode(e.target.checked)}
            />
            Single Page Mode
          </label>
          <button className="btn-preview" onClick={handlePreviewPDF} disabled={!hasContent}>
            👁 Preview PDF (Single Page)
          </button>
          <div className="btn-download-group" ref={dlMenuRef}>
            <button className="btn-download" onClick={handleDownloadSinglePage} disabled={!hasContent}>
              ⬇ Download PDF (Single Page)
            </button>
            <button
              className="btn-download btn-download-arrow"
              onClick={() => setDlMenuOpen((o) => !o)}
              disabled={!hasContent}
              aria-label="More download options"
            >
              ▾
            </button>
            {dlMenuOpen && (
              <div className="download-menu">
                <button onClick={handleDownloadSinglePage}>📄 Single-Page PDF (Default)</button>
                {!singlePageMode ? (
                  <>
                    <button onClick={handleDownloadMultiPage}>📑 Multi-Page PDF</button>
                    <button onClick={handlePreviewMultiPage}>👁 Multi-Page Preview</button>
                  </>
                ) : (
                  <button type="button" disabled>Single Page Mode locks export to one-page fitting</button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="preview-note">
        <small><em>
          {singlePageMode
            ? `Single Page Mode is active. Spacing and typography are reduced within safe limits to fit one page${singlePageFit.isAtSafeLimit ? '; content may still continue naturally onto the next page if needed.' : '.'}`
            : 'Single Page Mode is off. Preview and PDF keep standard spacing.'}
        </em></small>
      </div>
      <div className="resume-paper-wrapper">
        <div
          className={`resume-paper resume-layout-${selectedLayout}${singlePageMode ? ' resume-paper--single-page-mode' : ''}`}
          style={{
            '--resume-font-scale': singlePageFit.fontScale,
            '--resume-line-height-scale': singlePageFit.lineHeightScale,
            '--resume-padding-scale': singlePageFit.pagePaddingScale,
            '--resume-margin-scale': singlePageFit.marginScale,
            '--resume-section-gap-scale': singlePageFit.sectionGapScale,
          }}
        >
          {renderLayout()}

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
