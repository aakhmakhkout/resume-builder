import { Document, Page, Text, View, Link, StyleSheet } from '@react-pdf/renderer';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const isNonEmptyLine = (line) => line.trim();
const normalizeUrl = (value) => {
  if (!value) return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const DEFAULT_SECTION_ORDER = [
  'summary',
  'workExperience',
  'education',
  'skills',
  'projects',
  'certifications',
  'languages',
];

const estimateWrappedLines = (text, charsPerLine = 85) => {
  if (!text) return 0;
  return text
    .split('\n')
    .reduce((sum, line) => sum + Math.max(1, Math.ceil(line.trim().length / charsPerLine)), 0);
};

const estimateResumeLines = (resume) => {
  const { personalInfo, workExperience, education, skills, projects, certifications, languages } = resume;
  let lines = 0;

  // Header with improved spacing
  if (personalInfo.fullName) lines += 2.5; // Name with extra spacing below
  if (personalInfo.jobTitle) lines += 1.5; // Job title with extra spacing below
  if (personalInfo.email || personalInfo.phone || personalInfo.location || personalInfo.linkedin || personalInfo.github) lines += 2;
  lines += estimateWrappedLines(personalInfo.summary, 95);

  if (workExperience.length) {
    lines += 2; // Section title with extra space
    workExperience.forEach((exp) => {
      lines += 2;
      if (exp.location) lines += 1;
      lines += estimateWrappedLines(exp.description, 88);
    });
  }

  if (education.length) {
    lines += 2; // Section title with extra space
    education.forEach((edu) => {
      lines += 2;
      if (edu.gpa) lines += 1;
    });
  }

  if (skills.length) lines += 2 + estimateWrappedLines(skills.join(' • '), 95);

  if (projects.length) {
    lines += 2; // Section title with extra space
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

const getPdfScale = (resume, { singlePage }) => {
  if (singlePage) {
    const estimatedLines = estimateResumeLines(resume);
    const targetLines = 80; // Slightly increased to account for better spacing
    if (!estimatedLines || estimatedLines <= targetLines) return 1;
    return clamp((targetLines / estimatedLines) * 0.98, 0.55, 1);
  }
  // For multi-page, use appropriate scale for better readability
  // Reduce scale based on content volume to maintain consistent spacing
  const estimatedLines = estimateResumeLines(resume);
  if (estimatedLines <= 80) return 1;
  if (estimatedLines <= 160) return 0.95;
  if (estimatedLines <= 240) return 0.90;
  if (estimatedLines <= 320) return 0.85;
  return clamp(0.80, 0.55, 1);
};

const createStyles = (scale) =>
  StyleSheet.create({
    page: {
      paddingTop: 36,
      paddingBottom: 36,
      paddingHorizontal: 36,
      fontFamily: 'Times-Roman',
      fontSize: 10 * scale,
      color: '#111111',
      lineHeight: 1.5,
    },
    header: {
      textAlign: 'center',
      borderBottomWidth: 1.2,
      borderBottomColor: '#1d4ed8',
      paddingBottom: 8 * scale,
      marginBottom: 10 * scale,
    },
    name: {
      fontSize: 20 * scale,
      fontFamily: 'Times-Bold',
      marginBottom: 6 * scale,
    },
    jobTitle: {
      fontSize: 10.5 * scale,
      color: '#1d4ed8',
      marginBottom: 4 * scale,
    },
    contactText: {
      fontSize: 8.2 * scale,
      color: '#4b5563',
      lineHeight: 1.35,
    },
    contactSeparator: {
      color: '#9ca3af',
    },
    contactLink: {
      color: '#1d4ed8',
      textDecoration: 'none',
    },
    section: {
      marginBottom: 10 * scale,
    },
    sectionTitle: {
      fontSize: 8.8 * scale,
      fontFamily: 'Times-Bold',
      textTransform: 'uppercase',
      color: '#1d4ed8',
      borderBottomWidth: 0.7,
      borderBottomColor: '#bfdbfe',
      paddingBottom: 2 * scale,
      marginBottom: 6 * scale,
      letterSpacing: 0.7 * scale,
    },
    entry: {
      marginBottom: 7 * scale,
    },
    entryHeader: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 8 * scale,
    },
    entryHeadingWrap: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      flexGrow: 1,
      gap: 2 * scale,
    },
    entryTitle: {
      fontFamily: 'Times-Bold',
      fontSize: 9.5 * scale,
    },
    entrySubtitle: {
      fontSize: 9.5 * scale,
      color: '#374151',
    },
    entryDate: {
      fontSize: 8.2 * scale,
      color: '#6b7280',
      textAlign: 'right',
      flexShrink: 0,
    },
    subText: {
      fontSize: 8.2 * scale,
      color: '#6b7280',
      marginTop: 1 * scale,
    },
    projectTechText: {
      fontSize: 8.2 * scale,
      color: '#6b7280',
      marginTop: 1 * scale,
      fontStyle: 'italic',
    },
    bodyText: {
      fontSize: 9 * scale,
      color: '#374151',
      marginTop: 2 * scale,
      lineHeight: 1.45,
    },
    bulletList: {
      marginTop: 2 * scale,
    },
    bulletRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 1 * scale,
    },
    bulletSymbol: {
      fontSize: 9 * scale,
      marginRight: 4 * scale,
      lineHeight: 1.45,
    },
    bulletText: {
      flex: 1,
      fontSize: 9 * scale,
      color: '#374151',
      lineHeight: 1.45,
    },
    projectLink: {
      fontSize: 7.8 * scale,
      color: '#1d4ed8',
      textDecoration: 'none',
      marginTop: 1 * scale,
    },
  });

const renderDateRange = (startDate, endDate, current) => {
  const normalizedStart = startDate || '';
  const normalizedEnd = current ? 'Present' : endDate || '';
  const hasRangeSeparator = Boolean(normalizedStart && normalizedEnd);
  return `${normalizedStart}${hasRangeSeparator ? ' – ' : ''}${normalizedEnd}`.trim();
};

const ContactText = ({ personalInfo, styles }) => {
  const emailValue = personalInfo.email?.trim();
  const phoneValue = personalInfo.phone?.trim();
  const locationValue = personalInfo.location?.trim();
  const linkedinValue = personalInfo.linkedin?.trim();
  const githubValue = personalInfo.github?.trim();
  const items = [
    {
      type: 'link',
      value: emailValue,
      href: emailValue ? `mailto:${emailValue}` : '',
    },
    { type: 'text', value: phoneValue },
    { type: 'text', value: locationValue },
    { type: 'link', value: linkedinValue, href: normalizeUrl(linkedinValue) },
    { type: 'link', value: githubValue, href: normalizeUrl(githubValue) },
  ].filter((item) => item.value);

  if (!items.length) return null;

  const renderedItems = [];
  items.forEach((item, index) => {
    if (index > 0) {
      renderedItems.push(
        <Text key={`sep-${index}`} style={styles.contactSeparator}> | </Text>,
      );
    }
    if (item.type === 'link' && item.href) {
      renderedItems.push(
        <Link key={`link-${index}`} src={item.href} style={[styles.contactText, styles.contactLink]}>
          {item.value}
        </Link>,
      );
    } else {
      renderedItems.push(
        <Text key={`text-${index}`}>{item.value}</Text>,
      );
    }
  });

  return (
    <Text style={styles.contactText}>
      Contact: {renderedItems}
    </Text>
  );
};

export default function ResumePdfDocument({ resume, singlePage = true }) {
  const { personalInfo, workExperience, education, skills, projects, certifications, languages } = resume;
  const scale = getPdfScale(resume, { singlePage });
  const styles = createStyles(scale);
  const sectionOrder = Array.isArray(resume.sectionOrder) ? resume.sectionOrder : DEFAULT_SECTION_ORDER;

  const sectionRenderers = {
    summary: (key) => (
      personalInfo.summary ? (
        <View style={styles.section} key={key}>
          <Text style={styles.sectionTitle}>Professional Summary</Text>
          <Text style={styles.bodyText}>{personalInfo.summary}</Text>
        </View>
      ) : null
    ),
    workExperience: (key) => (
      workExperience.length > 0 ? (
        <View style={styles.section} key={key}>
          <Text style={styles.sectionTitle}>Work Experience</Text>
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
      ) : null
    ),
    education: (key) => (
      education.length > 0 ? (
        <View style={styles.section} key={key}>
          <Text style={styles.sectionTitle}>Education</Text>
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
      ) : null
    ),
    skills: (key) => (
      skills.length > 0 ? (
        <View style={styles.section} key={key}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <Text style={styles.bodyText}>{skills.join(' • ')}</Text>
        </View>
      ) : null
    ),
    projects: (key) => (
      projects.length > 0 ? (
        <View style={styles.section} key={key}>
          <Text style={styles.sectionTitle}>Projects</Text>
          {projects.map((proj, index) => {
            const descriptionLines = proj.description
              ? proj.description.split('\n').filter(isNonEmptyLine)
              : [];
            const projectLink = proj.link?.trim();
            return (
              <View style={styles.entry} key={`proj-${index}`}>
                {proj.name ? <Text style={styles.entryTitle}>{proj.name}</Text> : null}
                {projectLink ? <Link src={projectLink} style={styles.projectLink}>{projectLink}</Link> : null}
                {proj.technologies ? <Text style={styles.projectTechText}>Technologies: {proj.technologies}</Text> : null}
                {descriptionLines.length > 0 ? (
                  <View style={styles.bulletList}>
                    {descriptionLines.map((line, lineIndex) => (
                      <View style={styles.bulletRow} key={`proj-${index}-line-${lineIndex}`}>
                        <Text style={styles.bulletSymbol}>•</Text>
                        <Text style={styles.bulletText}>{line}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      ) : null
    ),
    certifications: (key) => (
      certifications.length > 0 ? (
        <View style={styles.section} key={key}>
          <Text style={styles.sectionTitle}>Certifications</Text>
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
      ) : null
    ),
    languages: (key) => (
      languages.length > 0 ? (
        <View style={styles.section} key={key}>
          <Text style={styles.sectionTitle}>Languages</Text>
          <Text style={styles.bodyText}>
            {languages.map((lang) => `${lang.language}${lang.proficiency ? ` (${lang.proficiency})` : ''}`).join(' • ')}
          </Text>
        </View>
      ) : null
    ),
  };

  return (
    <Document title={`${personalInfo.fullName || 'Resume'} Resume`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {personalInfo.fullName ? <Text style={styles.name}>{personalInfo.fullName}</Text> : null}
          {personalInfo.jobTitle ? <Text style={styles.jobTitle}>{personalInfo.jobTitle}</Text> : null}
          <ContactText personalInfo={personalInfo} styles={styles} />
        </View>

        {sectionOrder.map((sectionKey) => sectionRenderers[sectionKey]?.(sectionKey))}
      </Page>
    </Document>
  );
}
