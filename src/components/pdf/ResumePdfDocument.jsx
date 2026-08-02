import { Document, Link, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { toCustomEntryModel } from '../../utils/customSectionRender';
import { getPdfFontFamily, getSectionStyle } from '../../utils/designSettings';
import { fromCustomSectionKey, isCustomSectionKey, resolveSectionLabel, toCustomSectionKey } from '../../utils/sections';
import { getLegacyPdfScale, getSafeSectionOrder, getSinglePageFitSettings } from '../../utils/singlePageFit';

const splitNonEmptyLines = (value = '') =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

const normalizeUrl = (value) => {
  if (!value) return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const createStyles = ({ resume, scale, fitSettings }) => {
  const global = resume.designSettings.global;
  const baseFontSize = global.baseFontSize * scale;
  return StyleSheet.create({
    page: {
      padding: global.pagePadding * fitSettings.pagePaddingScale,
      fontFamily: getPdfFontFamily(global.fontFamily),
      fontSize: baseFontSize,
      color: '#111111',
      lineHeight: global.lineHeight * fitSettings.lineHeightScale,
    },
    header: {
      marginBottom: 10 * fitSettings.sectionGapScale,
      textAlign: 'center',
    },
    name: {
      fontSize: baseFontSize * 1.9,
      fontFamily: 'Times-Bold',
      marginBottom: 3,
    },
    contact: {
      fontSize: baseFontSize * 0.78,
      color: '#333333',
    },
    section: {
      marginBottom: global.sectionGap * fitSettings.sectionGapScale,
    },
    sectionTitle: {
      textTransform: 'uppercase',
      marginBottom: 4,
      fontFamily: 'Times-Bold',
      letterSpacing: 0.5,
    },
    entry: {
      marginBottom: 4,
    },
    entryHead: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 8,
    },
    entryHeadLeft: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 2,
      flexGrow: 1,
    },
    entryTitle: {
      fontFamily: 'Times-Bold',
    },
    date: {
      fontSize: baseFontSize * 0.9,
      color: '#2f2f2f',
      textAlign: 'right',
      flexShrink: 0,
    },
    line: {
      marginTop: 1,
      marginLeft: 10,
      fontSize: baseFontSize * 0.98,
    },
    subtle: {
      fontSize: baseFontSize * 0.92,
      color: '#333333',
      marginTop: 1,
    },
    link: {
      color: '#1d4ed8',
      textDecoration: 'none',
    },
    keyLabel: {
      fontFamily: 'Times-Bold',
    },
  });
};

const renderDateRange = (startDate, endDate, current) => (
  `${startDate || ''}${startDate && (endDate || current) ? ' – ' : ''}${current ? 'Present' : endDate || ''}`.trim()
);

const SectionBlock = ({ title, sectionKey, resume, styles, fitSettings, children }) => {
  const global = resume.designSettings.global;
  const sectionStyle = getSectionStyle(resume.designSettings, sectionKey);
  const sectionTitleStyle = {
    fontSize: sectionStyle.headingFontSize * fitSettings.fontScale,
    color: sectionStyle.headingColor,
    borderBottomWidth: sectionStyle.dividerVisible ? sectionStyle.dividerThickness || global.dividerThickness : 0,
    borderBottomColor: sectionStyle.dividerColor,
    paddingBottom: 2,
  };
  const wrapperStyle = {
    marginTop: sectionStyle.marginTop * fitSettings.marginScale,
    marginBottom: (sectionStyle.marginBottom + global.sectionGap) * fitSettings.sectionGapScale,
    paddingLeft: sectionStyle.paddingLeft * fitSettings.marginScale,
    paddingRight: sectionStyle.paddingRight * fitSettings.marginScale,
    fontSize: sectionStyle.fontSize * fitSettings.fontScale,
    color: sectionStyle.textColor,
    fontWeight: sectionStyle.fontWeight,
  };

  return (
    <View style={[styles.section, wrapperStyle]}>
      <Text style={[styles.sectionTitle, sectionTitleStyle]}>{title}</Text>
      {children}
    </View>
  );
};

export default function ResumePdfDocument({
  resume,
  singlePage = true,
  singlePageMode = false,
}) {
  const fitSettings = getSinglePageFitSettings(resume, { enabled: singlePageMode });
  const scale = singlePageMode
    ? fitSettings.fontScale
    : getLegacyPdfScale(resume, { singlePage });
  const styles = createStyles({ resume, scale, fitSettings });
  const customSectionKeys = resume.customSections.map((section) => toCustomSectionKey(section.id));
  const sectionOrder = getSafeSectionOrder(resume.sectionOrder, customSectionKeys);
  const customSectionMap = new Map(resume.customSections.map((section) => [section.id, section]));

  const contactItems = [
    resume.personalInfo.phone,
    resume.personalInfo.email,
    resume.personalInfo.linkedin,
    resume.personalInfo.github,
    resume.personalInfo.location,
  ].filter(Boolean);

  const renderSection = (sectionKey) => {
    if (sectionKey === 'summary') {
      if (!resume.personalInfo.summary) return null;
      return (
        <SectionBlock
          key={sectionKey}
          title="Professional Summary"
          sectionKey={sectionKey}
          resume={resume}
          styles={styles}
          fitSettings={fitSettings}
        >
          <Text>{resume.personalInfo.summary}</Text>
        </SectionBlock>
      );
    }

    if (sectionKey === 'workExperience') {
      if (!resume.workExperience.length) return null;
      return (
        <SectionBlock key={sectionKey} title="Experience" sectionKey={sectionKey} resume={resume} styles={styles} fitSettings={fitSettings}>
          {resume.workExperience.map((exp, index) => (
            <View style={styles.entry} key={`exp-${index}`}>
              <View style={styles.entryHead}>
                <View style={styles.entryHeadLeft}>
                  {exp.jobTitle ? <Text style={styles.entryTitle}>{exp.jobTitle}</Text> : null}
                  {exp.company ? <Text>| {exp.company}</Text> : null}
                </View>
                {renderDateRange(exp.startDate, exp.endDate, exp.current) ? (
                  <Text style={styles.date}>{renderDateRange(exp.startDate, exp.endDate, exp.current)}</Text>
                ) : null}
              </View>
              {exp.location ? <Text style={styles.subtle}>{exp.location}</Text> : null}
              {splitNonEmptyLines(exp.description).map((line, lineIndex) => (
                <Text style={styles.line} key={`exp-line-${index}-${lineIndex}`}>– {line}</Text>
              ))}
            </View>
          ))}
        </SectionBlock>
      );
    }

    if (sectionKey === 'education') {
      if (!resume.education.length) return null;
      return (
        <SectionBlock key={sectionKey} title="Education" sectionKey={sectionKey} resume={resume} styles={styles} fitSettings={fitSettings}>
          {resume.education.map((edu, index) => (
            <View style={styles.entry} key={`edu-${index}`}>
              <View style={styles.entryHead}>
                <View style={styles.entryHeadLeft}>
                  {edu.institution ? <Text style={styles.entryTitle}>{edu.institution}</Text> : null}
                  {(edu.degree || edu.fieldOfStudy) ? <Text>| {[edu.degree, edu.fieldOfStudy].filter(Boolean).join(', ')}</Text> : null}
                </View>
                {renderDateRange(edu.startDate, edu.endDate, false) ? (
                  <Text style={styles.date}>{renderDateRange(edu.startDate, edu.endDate, false)}</Text>
                ) : null}
              </View>
              {edu.gpa ? <Text style={styles.subtle}>GPA: {edu.gpa}</Text> : null}
            </View>
          ))}
        </SectionBlock>
      );
    }

    if (sectionKey === 'skills') {
      if (!resume.skills.length) return null;
      return (
        <SectionBlock key={sectionKey} title="Technical Skills" sectionKey={sectionKey} resume={resume} styles={styles} fitSettings={fitSettings}>
          <Text>{resume.skills.join(', ')}</Text>
        </SectionBlock>
      );
    }

    if (sectionKey === 'projects') {
      if (!resume.projects.length) return null;
      return (
        <SectionBlock key={sectionKey} title="Projects" sectionKey={sectionKey} resume={resume} styles={styles} fitSettings={fitSettings}>
          {resume.projects.map((project, index) => (
            <View style={styles.entry} key={`project-${index}`}>
              <View style={styles.entryHead}>
                <View style={styles.entryHeadLeft}>
                  {project.name ? <Text style={styles.entryTitle}>{project.name}</Text> : null}
                  {project.technologies ? <Text>| {project.technologies}</Text> : null}
                </View>
              </View>
              {project.link ? (
                <Link src={normalizeUrl(project.link)} style={[styles.subtle, styles.link]}>
                  {project.link}
                </Link>
              ) : null}
              {splitNonEmptyLines(project.description).map((line, lineIndex) => (
                <Text style={styles.line} key={`project-line-${index}-${lineIndex}`}>– {line}</Text>
              ))}
            </View>
          ))}
        </SectionBlock>
      );
    }

    if (sectionKey === 'certifications') {
      if (!resume.certifications.length) return null;
      return (
        <SectionBlock key={sectionKey} title="Certifications" sectionKey={sectionKey} resume={resume} styles={styles} fitSettings={fitSettings}>
          {resume.certifications.map((cert, index) => (
            <View style={styles.entry} key={`cert-${index}`}>
              <View style={styles.entryHead}>
                <View style={styles.entryHeadLeft}>
                  {cert.name ? <Text style={styles.entryTitle}>{cert.name}</Text> : null}
                  {cert.organization ? <Text>| {cert.organization}</Text> : null}
                </View>
                {cert.date ? <Text style={styles.date}>{cert.date}</Text> : null}
              </View>
            </View>
          ))}
        </SectionBlock>
      );
    }

    if (sectionKey === 'languages') {
      if (!resume.languages.length) return null;
      return (
        <SectionBlock key={sectionKey} title="Languages" sectionKey={sectionKey} resume={resume} styles={styles} fitSettings={fitSettings}>
          <Text>{resume.languages.map((lang) => `${lang.language}${lang.proficiency ? ` (${lang.proficiency})` : ''}`).join(', ')}</Text>
        </SectionBlock>
      );
    }

    if (!isCustomSectionKey(sectionKey)) return null;
    const customSection = customSectionMap.get(fromCustomSectionKey(sectionKey));
    if (!customSection || !customSection.entries.length) return null;

    return (
      <SectionBlock
        key={sectionKey}
        title={resolveSectionLabel(sectionKey, resume.customSections)}
        sectionKey={sectionKey}
        resume={resume}
        styles={styles}
        fitSettings={fitSettings}
      >
        {customSection.entries.map((entry) => {
          const model = toCustomEntryModel(customSection.typeId, entry.values);
          return (
            <View style={styles.entry} key={entry.id}>
              {(model.title || model.subtitle || model.date) ? (
                <View style={styles.entryHead}>
                  <View style={styles.entryHeadLeft}>
                    {model.title ? <Text style={styles.entryTitle}>{model.title}</Text> : null}
                    {model.subtitle ? <Text>{model.title ? '| ' : ''}{model.subtitle}</Text> : null}
                  </View>
                  {model.date ? <Text style={styles.date}>{model.date}</Text> : null}
                </View>
              ) : null}
              {model.paragraphs.map((paragraph, index) => (
                <Text style={styles.line} key={`${entry.id}-p-${index}`}>{paragraph}</Text>
              ))}
              {model.bullets.map((bullet, index) => (
                <Text style={styles.line} key={`${entry.id}-b-${index}`}>– {bullet}</Text>
              ))}
              {model.keyValues.map((pair, index) => (
                <Text style={styles.line} key={`${entry.id}-k-${index}`}>
                  {pair.label ? <Text style={styles.keyLabel}>{pair.label}: </Text> : null}
                  {pair.value}
                </Text>
              ))}
            </View>
          );
        })}
      </SectionBlock>
    );
  };

  return (
    <Document title={`${resume.personalInfo.fullName || 'Resume'} Resume`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {resume.personalInfo.fullName ? <Text style={styles.name}>{resume.personalInfo.fullName}</Text> : null}
          {contactItems.length ? (
            <Text style={styles.contact}>
              {contactItems.join('   ')}
            </Text>
          ) : null}
        </View>
        {sectionOrder.map((sectionKey) => renderSection(sectionKey))}
      </Page>
    </Document>
  );
}
