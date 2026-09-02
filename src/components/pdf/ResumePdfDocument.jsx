import { Document, Link, Page, Text, View } from '@react-pdf/renderer';
import { getSinglePageFitSettings } from '../../utils/singlePageFit';
import ResumeRenderer from '../resume/ResumeRenderer';

export default function ResumePdfDocument({
  resume,
  singlePage,
  singlePageMode = false,
}) {
  const fitSettings = getSinglePageFitSettings(resume, { enabled: singlePageMode && singlePage });

  return (
    <Document title={`${resume.personalInfo.fullName || 'Resume'} Resume`}>
      <Page size="A4">
        <ResumeRenderer
          resume={resume}
          target="pdf"
          fitSettings={fitSettings}
          pdfPrimitives={{ Text, View, Link }}
        />
      </Page>
    </Document>
  );
}
