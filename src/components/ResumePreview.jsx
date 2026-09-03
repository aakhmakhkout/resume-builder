import { useEffect, useMemo, useRef, useState } from 'react';
import { useResume } from '../context/ResumeContext';
import { getSinglePageFitSettings } from '../utils/singlePageFit';
import ResumeRenderer from './resume/ResumeRenderer';

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

export default function ResumePreview() {
  const { resume } = useResume();
  const [singlePageMode, setSinglePageMode] = useState(getInitialSinglePageMode);
  const [dlMenuOpen, setDlMenuOpen] = useState(false);
  const dlMenuRef = useRef(null);

  const singlePageFit = useMemo(
    () => getSinglePageFitSettings(resume, { enabled: singlePageMode }),
    [resume, singlePageMode],
  );

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
        <ResumeRenderer resume={resume} target="web" fitSettings={singlePageFit} />
      </div>
    </div>
  );
}
