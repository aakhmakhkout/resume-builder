import { useEffect, useMemo, useRef, useState } from 'react';
import { useResume } from '../context/ResumeContext';
import { toCustomEntryModel } from '../utils/customSectionRender';
import { getSectionStyle, getWebFontFamily } from '../utils/designSettings';
import { fromCustomSectionKey, isCustomSectionKey, resolveSectionLabel, toCustomSectionKey } from '../utils/sections';
import { getSafeSectionOrder, getSinglePageFitSettings } from '../utils/singlePageFit';

const PREVIEW_URL_REVOKE_DELAY_MS = 60_000;
const DOWNLOAD_URL_REVOKE_DELAY_MS = 5000;
const SINGLE_PAGE_MODE_STORAGE_KEY = 'resume_builder_single_page_mode';

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

const splitNonEmptyLines = (value = '') =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

export default function ResumePreview() {
  const { resume } = useResume();
  const [singlePageMode, setSinglePageMode] = useState(getInitialSinglePageMode);
  const [dlMenuOpen, setDlMenuOpen] = useState(false);
  const dlMenuRef = useRef(null);
  const customSectionKeys = useMemo(
    () => resume.customSections.map((section) => toCustomSectionKey(section.id)),
    [resume.customSections],
  );
  const sectionOrder = useMemo(
    () => getSafeSectionOrder(resume.sectionOrder, customSectionKeys),
    [customSectionKeys, resume.sectionOrder],
  );
  const singlePageFit = getSinglePageFitSettings(resume, { enabled: singlePageMode });
  const globalDesign = resume.designSettings.global;

  useEffect(() => {
    const handler = (event) => {
      if (dlMenuRef.current && !dlMenuRef.current.contains(event.target)) {
        setDlMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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
    const doc = (
      <ResumePdfDocument
        resume={resume}
        singlePage={singlePage}
        singlePageMode={singlePageMode}
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

  const handleDownload = async (singlePage) => {
    setDlMenuOpen(false);
    const blob = await buildResumePdfBlob({ singlePage });
    downloadBlob(blob, `${resume.personalInfo.fullName || 'resume'}.pdf`);
  };

  const handlePreview = async (singlePage) => {
    setDlMenuOpen(false);
    const blob = await buildResumePdfBlob({ singlePage });
    openPreviewFromBlob(blob);
  };

  const hasContent = resume.personalInfo.fullName || resume.personalInfo.email;
  const customSectionMap = useMemo(
    () => new Map(resume.customSections.map((section) => [section.id, section])),
    [resume.customSections],
  );

  const renderSection = (sectionKey) => {
    const sectionStyle = getSectionStyle(resume.designSettings, sectionKey);
    const wrapperStyle = {
      marginTop: sectionStyle.marginTop * singlePageFit.marginScale,
      marginBottom: (sectionStyle.marginBottom + globalDesign.sectionGap) * singlePageFit.sectionGapScale,
      paddingLeft: sectionStyle.paddingLeft * singlePageFit.marginScale,
      paddingRight: sectionStyle.paddingRight * singlePageFit.marginScale,
      fontSize: sectionStyle.fontSize * singlePageFit.fontScale,
      color: sectionStyle.textColor,
      fontWeight: sectionStyle.fontWeight,
      lineHeight: globalDesign.lineHeight * singlePageFit.lineHeightScale,
    };
    const headingStyle = {
      fontSize: sectionStyle.headingFontSize * singlePageFit.fontScale,
      color: sectionStyle.headingColor,
      borderBottomWidth: sectionStyle.dividerVisible ? sectionStyle.dividerThickness || globalDesign.dividerThickness : 0,
      borderBottomColor: sectionStyle.dividerColor,
    };

    if (sectionKey === 'summary') {
      if (!resume.personalInfo.summary) return null;
      return (
        <section key={sectionKey} className="resume-section-v2" style={wrapperStyle}>
          <h3 className="resume-section-title-v2" style={headingStyle}>Professional Summary</h3>
          <p>{resume.personalInfo.summary}</p>
        </section>
      );
    }

    if (sectionKey === 'workExperience') {
      if (!resume.workExperience.length) return null;
      return (
        <section key={sectionKey} className="resume-section-v2" style={wrapperStyle}>
          <h3 className="resume-section-title-v2" style={headingStyle}>Experience</h3>
          {resume.workExperience.map((exp, index) => (
            <div className="resume-entry-v2" key={`exp-${index}`}>
              <div className="resume-entry-head-v2">
                <div>
                  <strong>{exp.jobTitle}</strong>
                  {exp.company ? <span> | {exp.company}</span> : null}
                </div>
                <span className="resume-date-v2">{renderDateRange(exp.startDate, exp.endDate, exp.current)}</span>
              </div>
              {exp.location ? <p className="resume-subtext-v2">{exp.location}</p> : null}
              {splitNonEmptyLines(exp.description).map((line, lineIndex) => (
                <p className="resume-indent-v2" key={`exp-line-${index}-${lineIndex}`}>– {line}</p>
              ))}
            </div>
          ))}
        </section>
      );
    }

    if (sectionKey === 'education') {
      if (!resume.education.length) return null;
      return (
        <section key={sectionKey} className="resume-section-v2" style={wrapperStyle}>
          <h3 className="resume-section-title-v2" style={headingStyle}>Education</h3>
          {resume.education.map((edu, index) => (
            <div className="resume-entry-v2" key={`edu-${index}`}>
              <div className="resume-entry-head-v2">
                <div>
                  <strong>{edu.institution}</strong>
                  {(edu.degree || edu.fieldOfStudy) ? (
                    <span> | {[edu.degree, edu.fieldOfStudy].filter(Boolean).join(', ')}</span>
                  ) : null}
                </div>
                <span className="resume-date-v2">{renderDateRange(edu.startDate, edu.endDate, false)}</span>
              </div>
              {edu.gpa ? <p className="resume-subtext-v2">GPA: {edu.gpa}</p> : null}
            </div>
          ))}
        </section>
      );
    }

    if (sectionKey === 'skills') {
      if (!resume.skills.length) return null;
      return (
        <section key={sectionKey} className="resume-section-v2" style={wrapperStyle}>
          <h3 className="resume-section-title-v2" style={headingStyle}>Technical Skills</h3>
          <p>{resume.skills.join(', ')}</p>
        </section>
      );
    }

    if (sectionKey === 'projects') {
      if (!resume.projects.length) return null;
      return (
        <section key={sectionKey} className="resume-section-v2" style={wrapperStyle}>
          <h3 className="resume-section-title-v2" style={headingStyle}>Projects</h3>
          {resume.projects.map((project, index) => (
            <div className="resume-entry-v2" key={`proj-${index}`}>
              <div className="resume-entry-head-v2">
                <div>
                  <strong>{project.name}</strong>
                  {project.technologies ? <span> | <em>{project.technologies}</em></span> : null}
                </div>
              </div>
              {project.link ? <p className="resume-subtext-v2">{project.link}</p> : null}
              {splitNonEmptyLines(project.description).map((line, lineIndex) => (
                <p className="resume-indent-v2" key={`proj-line-${index}-${lineIndex}`}>– {line}</p>
              ))}
            </div>
          ))}
        </section>
      );
    }

    if (sectionKey === 'certifications') {
      if (!resume.certifications.length) return null;
      return (
        <section key={sectionKey} className="resume-section-v2" style={wrapperStyle}>
          <h3 className="resume-section-title-v2" style={headingStyle}>Certifications</h3>
          {resume.certifications.map((cert, index) => (
            <div className="resume-entry-v2" key={`cert-${index}`}>
              <div className="resume-entry-head-v2">
                <div>
                  <strong>{cert.name}</strong>
                  {cert.organization ? <span> | {cert.organization}</span> : null}
                </div>
                <span className="resume-date-v2">{cert.date}</span>
              </div>
            </div>
          ))}
        </section>
      );
    }

    if (sectionKey === 'languages') {
      if (!resume.languages.length) return null;
      return (
        <section key={sectionKey} className="resume-section-v2" style={wrapperStyle}>
          <h3 className="resume-section-title-v2" style={headingStyle}>Languages</h3>
          <p>{resume.languages.map((lang) => `${lang.language}${lang.proficiency ? ` (${lang.proficiency})` : ''}`).join(', ')}</p>
        </section>
      );
    }

    if (!isCustomSectionKey(sectionKey)) return null;
    const customSection = customSectionMap.get(fromCustomSectionKey(sectionKey));
    if (!customSection || !customSection.entries.length) return null;

    return (
      <section key={sectionKey} className="resume-section-v2" style={wrapperStyle}>
        <h3 className="resume-section-title-v2" style={headingStyle}>
          {resolveSectionLabel(sectionKey, resume.customSections)}
        </h3>
        {customSection.entries.map((entry) => {
          const model = toCustomEntryModel(customSection.typeId, entry.values);
          return (
            <div className="resume-entry-v2" key={entry.id}>
              {(model.title || model.subtitle || model.date) ? (
                <div className="resume-entry-head-v2">
                  <div>
                    {model.title ? <strong>{model.title}</strong> : null}
                    {model.subtitle ? <span>{model.title ? ' | ' : ''}{model.subtitle}</span> : null}
                  </div>
                  {model.date ? <span className="resume-date-v2">{model.date}</span> : null}
                </div>
              ) : null}
              {model.paragraphs.map((paragraph, index) => (
                <p className="resume-indent-v2" key={`${entry.id}-p-${index}`}>{paragraph}</p>
              ))}
              {model.bullets.map((bullet, index) => (
                <p className="resume-indent-v2" key={`${entry.id}-b-${index}`}>– {bullet}</p>
              ))}
              {model.keyValues.map((pair, index) => (
                <p className="resume-indent-v2" key={`${entry.id}-k-${index}`}>
                  {pair.label ? <strong>{pair.label}:</strong> : null} {pair.value}
                </p>
              ))}
            </div>
          );
        })}
      </section>
    );
  };

  const contactLine = [
    resume.personalInfo.phone,
    resume.personalInfo.email,
    resume.personalInfo.linkedin,
    resume.personalInfo.github,
    resume.personalInfo.location,
  ].filter(Boolean).join('   ');

  return (
    <div className="preview-panel">
      <div className="preview-toolbar">
        <h2 className="preview-title">Live Preview</h2>
        <div className="preview-toolbar-actions">
          <label className="single-page-toggle" htmlFor="single-page-mode-toggle">
            <input
              id="single-page-mode-toggle"
              type="checkbox"
              checked={singlePageMode}
              onChange={(event) => setSinglePageMode(event.target.checked)}
            />
            Single Page Fit
          </label>
          <button className="btn-preview" onClick={() => handlePreview(true)} disabled={!hasContent}>
            👁 Preview PDF
          </button>
          <div className="btn-download-group" ref={dlMenuRef}>
            <button className="btn-download" onClick={() => handleDownload(true)} disabled={!hasContent}>
              ⬇ Download PDF
            </button>
            <button
              className="btn-download btn-download-arrow"
              onClick={() => setDlMenuOpen((open) => !open)}
              disabled={!hasContent}
              aria-label="More download options"
            >
              ▾
            </button>
            {dlMenuOpen && (
              <div className="download-menu">
                <button onClick={() => handleDownload(true)}>Single-Page PDF</button>
                <button onClick={() => handleDownload(false)}>Multi-Page PDF</button>
                <button onClick={() => handlePreview(false)}>Multi-Page Preview</button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="resume-paper-wrapper">
        <div
          className="resume-paper resume-paper-v2"
          style={{
            margin: globalDesign.pageMargin * singlePageFit.marginScale,
            padding: globalDesign.pagePadding * singlePageFit.pagePaddingScale,
            fontFamily: getWebFontFamily(globalDesign.fontFamily),
            fontSize: globalDesign.baseFontSize * singlePageFit.fontScale,
            lineHeight: globalDesign.lineHeight * singlePageFit.lineHeightScale,
          }}
        >
          <header className="resume-header-v2">
            {resume.personalInfo.fullName ? (
              <h1 className="resume-name-v2">{resume.personalInfo.fullName}</h1>
            ) : null}
            {contactLine ? <p className="resume-contact-v2">{contactLine}</p> : null}
          </header>
          {sectionOrder.map((sectionKey) => renderSection(sectionKey))}

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
