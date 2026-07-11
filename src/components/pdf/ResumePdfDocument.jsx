import { Document, Page, Text, View, Link, StyleSheet } from '@react-pdf/renderer';
import { getLegacyPdfScale, getSafeSectionOrder, getSinglePageFitSettings } from '../../utils/singlePageFit';

const isNonEmptyLine = (line) => line.trim();
const normalizeUrl = (value) => {
  if (!value) return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const LEFT_COLUMN_SECTIONS = new Set(['skills', 'languages', 'certifications']);
const LAYOUT_VALUES = new Set(['traditional', 'two-column', 'modern']);

const normalizeLayout = (layout) => (LAYOUT_VALUES.has(layout) ? layout : 'traditional');

const createStyles = ({ scale, fitSettings }) => StyleSheet.create({
  page: {
    paddingTop: 36 * fitSettings.pagePaddingScale,
    paddingBottom: 36 * fitSettings.pagePaddingScale,
    paddingHorizontal: 36 * fitSettings.pagePaddingScale,
    fontFamily: 'Times-Roman',
    fontSize: 10 * scale,
    color: '#111111',
    lineHeight: 1.5 * fitSettings.lineHeightScale,
  },
  header: {
    textAlign: 'center',
    borderBottomWidth: 1.2,
    borderBottomColor: '#1d4ed8',
    paddingBottom: 8 * scale * fitSettings.marginScale,
    marginBottom: 10 * scale * fitSettings.sectionGapScale,
  },
  modernHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 8 * scale * fitSettings.marginScale,
    marginBottom: 10 * scale * fitSettings.sectionGapScale,
    gap: 10 * scale,
  },
  name: {
    fontSize: 20 * scale,
    fontFamily: 'Times-Bold',
    marginBottom: 6 * scale * fitSettings.marginScale,
  },
  modernName: {
    color: '#0f172a',
    marginBottom: 2 * scale,
  },
  jobTitle: {
    fontSize: 10.5 * scale,
    color: '#1d4ed8',
    marginBottom: 4 * scale * fitSettings.marginScale,
  },
  modernJobTitle: {
    color: '#334155',
    marginBottom: 0,
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
  sidebarContactText: {
    fontSize: 8.2 * scale,
    color: '#334155',
    marginBottom: 3 * scale * fitSettings.marginScale,
    lineHeight: 1.4,
  },
  section: {
    marginBottom: 10 * scale * fitSettings.sectionGapScale,
  },
  sectionCompact: {
    marginBottom: 8 * scale * fitSettings.sectionGapScale,
  },
  sectionModern: {
    marginBottom: 8 * scale * fitSettings.sectionGapScale,
    borderWidth: 0.7,
    borderColor: '#e2e8f0',
    padding: 6 * scale * fitSettings.marginScale,
    borderRadius: 2,
    backgroundColor: '#f8fafc',
  },
  sectionTitle: {
    fontSize: 8.8 * scale,
    fontFamily: 'Times-Bold',
    textTransform: 'uppercase',
    color: '#1d4ed8',
    borderBottomWidth: 0.7,
    borderBottomColor: '#bfdbfe',
    paddingBottom: 2 * scale * fitSettings.marginScale,
    marginBottom: 6 * scale * fitSettings.marginScale,
    letterSpacing: 0.7 * scale,
  },
  sectionTitleCompact: {
    fontSize: 8.3 * scale,
  },
  sectionTitleModern: {
    color: '#0f172a',
    borderBottomColor: '#cbd5e1',
  },
  entry: {
    marginBottom: 7 * scale * fitSettings.marginScale,
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
    marginTop: 1 * scale * fitSettings.marginScale,
  },
  projectTechText: {
    fontSize: 8.2 * scale,
    color: '#6b7280',
    marginTop: 1 * scale * fitSettings.marginScale,
    fontStyle: 'italic',
  },
  bodyText: {
    fontSize: 9 * scale,
    color: '#374151',
    marginTop: 2 * scale * fitSettings.marginScale,
    lineHeight: 1.45,
  },
  bulletList: {
    marginTop: 2 * scale * fitSettings.marginScale,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 1 * scale * fitSettings.marginScale,
    break: 'avoid',
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
    marginTop: 1 * scale * fitSettings.marginScale,
  },
  twoColumnWrap: {
    display: 'flex',
    flexDirection: 'row',
    gap: 10 * scale * fitSettings.marginScale,
  },
  sidebar: {
    width: '32%',
    backgroundColor: '#eff6ff',
    borderRightWidth: 1,
    borderRightColor: '#bfdbfe',
    padding: 7 * scale * fitSettings.marginScale,
  },
  sidebarName: {
    fontSize: 15 * scale,
    marginBottom: 2 * scale * fitSettings.marginScale,
  },
  sidebarJobTitle: {
    fontSize: 9 * scale,
    color: '#334155',
    marginBottom: 4 * scale * fitSettings.marginScale,
  },
  sidebarContactWrap: {
    marginBottom: 6 * scale * fitSettings.marginScale,
  },
  mainColumn: {
    width: '68%',
    paddingLeft: 2 * scale * fitSettings.marginScale,
  },
  modernGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8 * scale * fitSettings.marginScale,
  },
  modernItemWide: {
    width: '100%',
  },
  modernItemHalf: {
    width: '48%',
  },
  modernContactWrap: {
    maxWidth: '52%',
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

const SidebarContactText = ({ personalInfo, styles }) => {
  const lines = [
    personalInfo.email?.trim(),
    personalInfo.phone?.trim(),
    personalInfo.location?.trim(),
    personalInfo.linkedin?.trim(),
    personalInfo.github?.trim(),
  ].filter(Boolean);

  if (!lines.length) return null;

  return (
    <View style={styles.sidebarContactWrap}>
      {lines.map((value, index) => {
        const href =
          value === personalInfo.email?.trim()
            ? `mailto:${value}`
            : value === personalInfo.linkedin?.trim() || value === personalInfo.github?.trim()
              ? normalizeUrl(value)
              : '';
        if (href) {
          return (
            <Link key={`sidebar-link-${index}`} src={href} style={[styles.sidebarContactText, styles.contactLink]}>
              {value}
            </Link>
          );
        }
        return (
          <Text key={`sidebar-text-${index}`} style={styles.sidebarContactText}>{value}</Text>
        );
      })}
    </View>
  );
};

const createSectionRenderers = ({
  personalInfo,
  workExperience,
  education,
  skills,
  projects,
  certifications,
  languages,
  styles,
  variant = 'default',
}) => {
  const sectionStyle = [styles.section];
  const sectionTitleStyle = [styles.sectionTitle];

  if (variant === 'compact') {
    sectionStyle.push(styles.sectionCompact);
    sectionTitleStyle.push(styles.sectionTitleCompact);
  }

  if (variant === 'modern') {
    sectionStyle.push(styles.sectionModern);
    sectionTitleStyle.push(styles.sectionTitleModern);
  }

  return {
    summary: (key) => (
      personalInfo.summary ? (
        <View style={sectionStyle} key={key}>
          <Text style={sectionTitleStyle}>Professional Summary</Text>
          <Text style={styles.bodyText}>{personalInfo.summary}</Text>
        </View>
      ) : null
    ),
    workExperience: (key) => (
      workExperience.length > 0 ? (
        <View style={sectionStyle} key={key}>
          <Text style={sectionTitleStyle}>Work Experience</Text>
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
                  <Text key={`work-desc-${index}-${lineIndex}`} style={styles.bodyText}>{line}</Text>
                ))
                : null}
            </View>
          ))}
        </View>
      ) : null
    ),
    education: (key) => (
      education.length > 0 ? (
        <View style={sectionStyle} key={key}>
          <Text style={sectionTitleStyle}>Education</Text>
          {education.map((edu, index) => (
            <View style={styles.entry} key={`edu-${index}`}>
              <View style={styles.entryHeader}>
                <View style={styles.entryHeadingWrap}>
                  {edu.degree || edu.fieldOfStudy ? (
                    <Text style={styles.entryTitle}>{edu.degree || ''}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}</Text>
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
        <View style={sectionStyle} key={key}>
          <Text style={sectionTitleStyle}>Skills</Text>
          <Text style={styles.bodyText}>{skills.join(' • ')}</Text>
        </View>
      ) : null
    ),
    projects: (key) => (
      projects.length > 0 ? (
        <View style={sectionStyle} key={key}>
          <Text style={sectionTitleStyle}>Projects</Text>
          {projects.map((proj, index) => {
            const descriptionLines = proj.description
              ? proj.description.split('\n').filter(isNonEmptyLine)
              : [];
            const projectLink = proj.link?.trim();
            return (
              <View style={styles.entry} key={`proj-${index}`}>
                {proj.name ? <Text style={styles.entryTitle}>{proj.name}</Text> : null}
                {projectLink ? <Link src={normalizeUrl(projectLink)} style={styles.projectLink}>{projectLink}</Link> : null}
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
        <View style={sectionStyle} key={key}>
          <Text style={sectionTitleStyle}>Certifications</Text>
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
        <View style={sectionStyle} key={key}>
          <Text style={sectionTitleStyle}>Languages</Text>
          <Text style={styles.bodyText}>
            {languages.map((lang) => `${lang.language}${lang.proficiency ? ` (${lang.proficiency})` : ''}`).join(' • ')}
          </Text>
        </View>
      ) : null
    ),
  };
};

export default function ResumePdfDocument({
  resume,
  singlePage = true,
  singlePageMode = false,
  layout = 'traditional',
}) {
  const { personalInfo, workExperience, education, skills, projects, certifications, languages } = resume;
  const normalizedLayout = normalizeLayout(layout);
  const fitSettings = getSinglePageFitSettings(resume, { enabled: singlePageMode, layout: normalizedLayout });
  const scale = singlePageMode
    ? fitSettings.fontScale
    : getLegacyPdfScale(resume, { singlePage });
  const styles = createStyles({ scale, fitSettings });
  const sectionOrder = getSafeSectionOrder(resume.sectionOrder);

  const defaultSectionRenderers = createSectionRenderers({
    personalInfo,
    workExperience,
    education,
    skills,
    projects,
    certifications,
    languages,
    styles,
  });

  const compactSectionRenderers = createSectionRenderers({
    personalInfo,
    workExperience,
    education,
    skills,
    projects,
    certifications,
    languages,
    styles,
    variant: 'compact',
  });

  const modernSectionRenderers = createSectionRenderers({
    personalInfo,
    workExperience,
    education,
    skills,
    projects,
    certifications,
    languages,
    styles,
    variant: 'modern',
  });

  const leftColumnOrder = sectionOrder.filter((sectionKey) => LEFT_COLUMN_SECTIONS.has(sectionKey));
  const rightColumnOrder = sectionOrder.filter((sectionKey) => !LEFT_COLUMN_SECTIONS.has(sectionKey));

  const renderTraditional = () => (
    <>
      <View style={styles.header}>
        {personalInfo.fullName ? <Text style={styles.name}>{personalInfo.fullName}</Text> : null}
        {personalInfo.jobTitle ? <Text style={styles.jobTitle}>{personalInfo.jobTitle}</Text> : null}
        <ContactText personalInfo={personalInfo} styles={styles} />
      </View>
      {sectionOrder.map((sectionKey) => defaultSectionRenderers[sectionKey]?.(sectionKey))}
    </>
  );

  const renderTwoColumn = () => (
    <View style={styles.twoColumnWrap}>
      <View style={styles.sidebar}>
        {personalInfo.fullName ? <Text style={[styles.name, styles.sidebarName]}>{personalInfo.fullName}</Text> : null}
        {personalInfo.jobTitle ? <Text style={styles.sidebarJobTitle}>{personalInfo.jobTitle}</Text> : null}
        <SidebarContactText personalInfo={personalInfo} styles={styles} />
        {leftColumnOrder.map((sectionKey) => compactSectionRenderers[sectionKey]?.(`left-${sectionKey}`))}
      </View>
      <View style={styles.mainColumn}>
        {rightColumnOrder.map((sectionKey) => defaultSectionRenderers[sectionKey]?.(`right-${sectionKey}`))}
      </View>
    </View>
  );

  const renderModern = () => (
    <>
      <View style={styles.modernHeader}>
        <View>
          {personalInfo.fullName ? <Text style={[styles.name, styles.modernName]}>{personalInfo.fullName}</Text> : null}
          {personalInfo.jobTitle ? <Text style={[styles.jobTitle, styles.modernJobTitle]}>{personalInfo.jobTitle}</Text> : null}
        </View>
        <View style={styles.modernContactWrap}>
          <ContactText personalInfo={personalInfo} styles={styles} />
        </View>
      </View>
      <View style={styles.modernGrid}>
        {sectionOrder.map((sectionKey) => {
          const isWide = ['summary', 'workExperience', 'projects'].includes(sectionKey);
          const renderedSection = modernSectionRenderers[sectionKey]?.(`modern-${sectionKey}`);
          if (!renderedSection) return null;
          return (
            <View key={`modern-wrap-${sectionKey}`} style={isWide ? styles.modernItemWide : styles.modernItemHalf}>
              {renderedSection}
            </View>
          );
        })}
      </View>
    </>
  );

  const renderLayout = () => {
    if (normalizedLayout === 'two-column') return renderTwoColumn();
    if (normalizedLayout === 'modern') return renderModern();
    return renderTraditional();
  };

  return (
    <Document title={`${personalInfo.fullName || 'Resume'} Resume`}>
      <Page size="A4" style={styles.page}>
        {renderLayout()}
      </Page>
    </Document>
  );
}
