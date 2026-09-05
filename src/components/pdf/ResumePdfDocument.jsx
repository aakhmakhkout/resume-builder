import { Circle, Document, G, Link, Page, Path, Rect, Svg, Text, View } from '@react-pdf/renderer';
import { getSinglePageFitSettings } from '../../utils/singlePageFit';
import { ensurePdfFontsRegistered } from '../../utils/pdfFonts';
import ResumeRenderer from '../resume/ResumeRenderer';

ensurePdfFontsRegistered();

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
          pdfPrimitives={{ Text, View, Link, Svg, Rect, Circle, Path, G }}
        />
      </Page>
    </Document>
  );
}
