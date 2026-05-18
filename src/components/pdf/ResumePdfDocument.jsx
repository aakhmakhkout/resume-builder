import { Document, Page, Text, View, Link, StyleSheet } from '@react-pdf/renderer';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const isNonEmptyLine = (line) => line.trim();

const LAYOUT_PROFILES = {
  compact: {
    pagePaddingTopBottom: 24,
    pagePaddingHorizontal: 24,
    baseFontSize: 9.2,
    baseLineHeight: 1.38,
    headerBorderWidth: 1,
    headerPaddingBottom: 6,
    headerMarginBottom: 8,
    nameFontSize: 17,
    nameLineHeight: 1.16,
    nameMarginBottom: 3.2,
    jobTitleFontSize: 9.4,
    jobTitleLineHeight: 1.32,
    jobTitleMarginBottom: 4.2,
    contactFontSize: 7.5,
    contactLineHeight: 1.35,
    contactMarginTop: 2,
    sectionMarginBottom: 6,
    sectionTitleFontSize: 8,
    sectionTitlePaddingBottom: 1.8,
    sectionTitleMarginBottom: 4,
    sectionTitleLetterSpacing: 0.58,
    entryMarginBottom: 4.8,
    entryHeaderGap: 6,
    entryHeadingGap: 1.6,
    entryTitleSize: 8.7,
    entrySubtitleSize: 8.7,
    entryDateSize: 7.4,
    subTextSize: 7.4,
    subTextMarginTop: 0.8,
    bodyTextSize: 8.2,
    bodyTextMarginTop: 1.4,
    bodyTextLineHeight: 1.34,
    projectLinkSize: 7.1,
    projectLinkMarginTop: 0.8,
    targetLines: 74,
    minScale: 0.5,
    maxScale: 1,
    headingMinPresenceAhead: 16,
  },
  print: {
    pagePaddingTopBottom: 38,
    pagePaddingHorizontal: 38,
    baseFontSize: 10.4,
    baseLineHeight: 1.56,
    headerBorderWidth: 1.2,
    headerPaddingBottom: 9,
    headerMarginBottom: 12,
    nameFontSize: 22,
    nameLineHeight: 1.16,
    nameMarginBottom: 4.8,
    jobTitleFontSize: 11.2,
    jobTitleLineHeight: 1.3,
    jobTitleMarginBottom: 5.8,
    contactFontSize: 8.6,
    contactLineHeight: 1.4,
    contactMarginTop: 2.6,
    sectionMarginBottom: 10,
    sectionTitleFontSize: 9.2,
    sectionTitlePaddingBottom: 2.1,
    sectionTitleMarginBottom: 5.6,
    sectionTitleLetterSpacing: 0.74,
    entryMarginBottom: 7.2,
    entryHeaderGap: 9,
    entryHeadingGap: 2.2,
    entryTitleSize: 9.8,
    entrySubtitleSize: 9.8,
    entryDateSize: 8.4,
    subTextSize: 8.4,
    subTextMarginTop: 1,
    bodyTextSize: 9.2,
    bodyTextMarginTop: 2.2,
    bodyTextLineHeight: 1.47,
    projectLinkSize: 8.1,
    projectLinkMarginTop: 1.2,
    targetLines: 88,
    minScale: 1,
    maxScale: 1,
    headingMinPresenceAhead: 24,
  },
};

const estimateWrappedLines = (text, charsPerLine = 85) => {
  if (!text) return 0;
  return text
    .split('\n')
    .reduce((sum, line) => sum + Math.max(1, Math.ceil(line.trim().length / charsPerLine)), 0);
};

const estimateResumeLines = (resume) => {
  const { personalInfo, workExperience, education, skills, projects, certifications, languages } = resume;
  let lines = 0;

  if (personalInfo.fullName) lines += 2;
  if (personalInfo.jobTitle) lines += 1;
  if (personalInfo.email || personalInfo.phone || personalInfo.location || personalInfo.linkedin || personalInfo.github) lines += 2;
  lines += estimateWrappedLines(personalInfo.summary, 95);

  if (workExperience.length) {
    lines += 2;
    workExperience.forEach((exp) => {
      lines += 2;
      if (exp.location) lines += 1;
      lines += estimateWrappedLines(exp.description, 88);
    });
  }

  if (education.length) {
    lines += 2;
    education.forEach((edu) => {
      lines += 2;
      if (edu.gpa) lines += 1;
    });
  }

  if (skills.length) lines += 2 + estimateWrappedLines(skills.join(' • '), 95);

  if (projects.length) {
    lines += 2;
    projects.forEach((proj) => {
      lines += 2;
      if (proj.technologies) lines += estimateWrappedLines(`Technologies: ${proj.technologies}`, 95);
      if (proj.description) lines += estimateWrappedLines(proj.description, 88);
    });
  }

  if (certifications.length) lines += 2 + certifications.length * 2;
  if (languages.length) lines += 2 + estimateWrappedLines(languages.map((l) => `${l.language}${l.proficiency ? ` (${l.proficiency})` : ''}`).join(' • '), 95);

  return lines;
};

const getPdfScale = (resume, { singlePage, profile }) => {
  if (!singlePage) return 1;
  const estimatedLines = estimateResumeLines(resume);
  const targetLines = profile.targetLines;
  if (!estimatedLines || estimatedLines <= targetLines) return profile.maxScale;
  return clamp((targetLines / estimatedLines) * 0.99, profile.minScale, profile.maxScale);
};

const createStyles = (scale, profile) =>
  StyleSheet.create({
    page: {
      paddingTop: profile.pagePaddingTopBottom * scale,
      paddingBottom: profile.pagePaddingTopBottom * scale,
      paddingHorizontal: profile.pagePaddingHorizontal * scale,
      fontFamily: 'Times-Roman',
      fontSize: profile.baseFontSize * scale,
      color: '#111111',
      lineHeight: profile.baseLineHeight,
    },
    header: {
      textAlign: 'center',
      borderBottomWidth: profile.headerBorderWidth,
      borderBottomColor: '#1d4ed8',
      paddingBottom: profile.headerPaddingBottom * scale,
      marginBottom: profile.headerMarginBottom * scale,
    },
    name: {
      fontSize: profile.nameFontSize * scale,
      fontFamily: 'Times-Bold',
      lineHeight: profile.nameLineHeight,
      marginBottom: profile.nameMarginBottom * scale,
    },
    jobTitle: {
      fontSize: profile.jobTitleFontSize * scale,
      color: '#1d4ed8',
      lineHeight: profile.jobTitleLineHeight,
      marginBottom: profile.jobTitleMarginBottom * scale,
    },
    contactText: {
      fontSize: profile.contactFontSize * scale,
      color: '#4b5563',
      lineHeight: profile.contactLineHeight,
      marginTop: profile.contactMarginTop * scale,
    },
    section: {
      marginBottom: profile.sectionMarginBottom * scale,
    },
    sectionTitle: {
      fontSize: profile.sectionTitleFontSize * scale,
      fontFamily: 'Times-Bold',
      textTransform: 'uppercase',
      color: '#1d4ed8',
      borderBottomWidth: 0.7,
      borderBottomColor: '#bfdbfe',
      paddingBottom: profile.sectionTitlePaddingBottom * scale,
      marginBottom: profile.sectionTitleMarginBottom * scale,
      letterSpacing: profile.sectionTitleLetterSpacing * scale,
    },
    entry: {
      marginBottom: profile.entryMarginBottom * scale,
    },
    entryHeader: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: profile.entryHeaderGap * scale,
    },
    entryHeadingWrap: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      flexGrow: 1,
      gap: profile.entryHeadingGap * scale,
    },
    entryTitle: {
      fontFamily: 'Times-Bold',
      fontSize: profile.entryTitleSize * scale,
    },
    entrySubtitle: {
      fontSize: profile.entrySubtitleSize * scale,
      color: '#374151',
    },
    entryDate: {
      fontSize: profile.entryDateSize * scale,
      color: '#6b7280',
      textAlign: 'right',
      flexShrink: 0,
    },
    subText: {
      fontSize: profile.subTextSize * scale,
      color: '#6b7280',
      marginTop: profile.subTextMarginTop * scale,
    },
    bodyText: {
      fontSize: profile.bodyTextSize * scale,
      color: '#374151',
      marginTop: profile.bodyTextMarginTop * scale,
      lineHeight: profile.bodyTextLineHeight,
    },
    projectLink: {
      fontSize: profile.projectLinkSize * scale,
      color: '#1d4ed8',
      textDecoration: 'none',
      marginTop: profile.projectLinkMarginTop * scale,
    },
  });

const renderDateRange = (startDate, endDate, current) => {
  const normalizedStart = startDate || '';
  const normalizedEnd = current ? 'Present' : endDate || '';
  const hasRangeSeparator = Boolean(normalizedStart && normalizedEnd);
  return `${normalizedStart}${hasRangeSeparator ? ' – ' : ''}${normalizedEnd}`.trim();
};

const ContactText = ({ personalInfo, styles }) => {
  const items = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.location,
    personalInfo.linkedin,
    personalInfo.github,
  ].filter(Boolean);

  if (!items.length) return null;
  return <Text style={styles.contactText}>Contact: {items.join(' | ')}</Text>;
};

export default function ResumePdfDocument({ resume, singlePage = true }) {
  const { personalInfo, workExperience, education, skills, projects, certifications, languages } = resume;
  const profile = singlePage ? LAYOUT_PROFILES.compact : LAYOUT_PROFILES.print;
  const scale = getPdfScale(resume, { singlePage, profile });
  const styles = createStyles(scale, profile);
  const headingMinPresenceAhead = profile.headingMinPresenceAhead * scale;

  return (
    <Document title={`${personalInfo.fullName || 'Resume'} Resume`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {personalInfo.fullName ? <Text style={styles.name}>{personalInfo.fullName}</Text> : null}
          {personalInfo.jobTitle ? <Text style={styles.jobTitle}>{personalInfo.jobTitle}</Text> : null}
          <ContactText personalInfo={personalInfo} styles={styles} />
        </View>

        {personalInfo.summary ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle} minPresenceAhead={headingMinPresenceAhead}>Professional Summary</Text>
            <Text style={styles.bodyText}>{personalInfo.summary}</Text>
          </View>
        ) : null}

        {workExperience.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle} minPresenceAhead={headingMinPresenceAhead}>Work Experience</Text>
            {workExperience.map((exp, index) => (
              <View style={styles.entry} key={`work-${index}`}>
                <View style={styles.entryHeader}>
                  <View style={styles.entryHeadingWrap}>
                    {exp.jobTitle ? <Text style={styles.entryTitle}>{exp.jobTitle}</Text> : null}
                    {exp.company ? <Text style={styles.entrySubtitle}>— {exp.company}</Text> : null}
                  </View>
                  {renderDateRange(exp.startDate, exp.endDate, exp.current) ? (
                    <Text style={styles.entryDate}>{renderDateRange(exp.startDate, exp.endDate, exp.current)}</Text>
                  ) : null}
                </View>
                {exp.location ? <Text style={styles.subText}>{exp.location}</Text> : null}
                {exp.description
                  ? exp.description.split('\n').filter(isNonEmptyLine).map((line, lineIndex) => (
                    <Text key={`work-desc-${index}-${lineIndex}`} style={styles.bodyText}>
                      {line}
                    </Text>
                  ))
                  : null}
              </View>
            ))}
          </View>
        ) : null}

        {education.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle} minPresenceAhead={headingMinPresenceAhead}>Education</Text>
            {education.map((edu, index) => (
              <View style={styles.entry} key={`edu-${index}`}>
                <View style={styles.entryHeader}>
                  <View style={styles.entryHeadingWrap}>
                    {edu.degree || edu.fieldOfStudy ? (
                      <Text style={styles.entryTitle}>
                        {edu.degree || ''}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
                      </Text>
                    ) : null}
                    {edu.institution ? <Text style={styles.entrySubtitle}>— {edu.institution}</Text> : null}
                  </View>
                  {renderDateRange(edu.startDate, edu.endDate, false) ? (
                    <Text style={styles.entryDate}>{renderDateRange(edu.startDate, edu.endDate, false)}</Text>
                  ) : null}
                </View>
                {edu.gpa ? <Text style={styles.subText}>GPA: {edu.gpa}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        {skills.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle} minPresenceAhead={headingMinPresenceAhead}>Skills</Text>
            <Text style={styles.bodyText}>{skills.join(' • ')}</Text>
          </View>
        ) : null}

        {projects.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle} minPresenceAhead={headingMinPresenceAhead}>Projects</Text>
            {projects.map((proj, index) => (
              <View style={styles.entry} key={`proj-${index}`}>
                {proj.name ? <Text style={styles.entryTitle}>{proj.name}</Text> : null}
                {proj.link ? <Link src={proj.link} style={styles.projectLink}>{proj.link}</Link> : null}
                {proj.technologies ? <Text style={styles.subText}>Technologies: {proj.technologies}</Text> : null}
                {proj.description ? <Text style={styles.bodyText}>{proj.description}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        {certifications.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle} minPresenceAhead={headingMinPresenceAhead}>Certifications</Text>
            {certifications.map((cert, index) => (
              <View style={styles.entry} key={`cert-${index}`}>
                <View style={styles.entryHeader}>
                  {cert.name ? <Text style={styles.entryTitle}>{cert.name}</Text> : null}
                  {cert.date ? <Text style={styles.entryDate}>{cert.date}</Text> : null}
                </View>
                {cert.organization ? <Text style={styles.subText}>{cert.organization}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        {languages.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle} minPresenceAhead={headingMinPresenceAhead}>Languages</Text>
            <Text style={styles.bodyText}>
              {languages.map((lang) => `${lang.language}${lang.proficiency ? ` (${lang.proficiency})` : ''}`).join(' • ')}
            </Text>
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
