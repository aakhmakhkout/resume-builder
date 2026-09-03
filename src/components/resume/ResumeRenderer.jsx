import { useMemo } from 'react';
import { toCustomEntryModel } from '../../utils/customSectionRender';
import { fromCustomSectionKey, isCustomSectionKey, resolveSectionLabel, toCustomSectionKey } from '../../utils/sections';
import { flattenSkillCategories, normalizeSkillCategories } from '../../utils/skillCategories';
import { getSafeSectionOrder } from '../../utils/singlePageFit';
import SectionRenderer from './SectionRenderer';
import SkillCategoryRenderer from './SkillCategoryRenderer';
import { StyleProvider, useResumeStyle } from './StyleProvider';

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

const renderDateRange = (startDate, endDate, current) => (
  `${startDate || ''}${startDate && (endDate || current) ? ' – ' : ''}${current ? 'Present' : endDate || ''}`.trim()
);

function RendererBody({ resume, target, pdfPrimitives }) {
  const resumeStyle = useResumeStyle();
  const scaled = resumeStyle.scaled;
  const isPdf = target === 'pdf';
  const Text = isPdf ? pdfPrimitives.Text : null;
  const View = isPdf ? pdfPrimitives.View : null;
  const Link = isPdf ? pdfPrimitives.Link : null;

  const customSectionKeys = useMemo(
    () => resume.customSections.map((section) => toCustomSectionKey(section.id)),
    [resume.customSections],
  );
  const sectionOrder = useMemo(
    () => getSafeSectionOrder(resume.sectionOrder, customSectionKeys),
    [customSectionKeys, resume.sectionOrder],
  );
  const customSectionMap = useMemo(
    () => new Map(resume.customSections.map((section) => [section.id, section])),
    [resume.customSections],
  );

  const skillCategories = useMemo(
    () => normalizeSkillCategories(resume),
    [resume],
  );
  const fallbackSkills = flattenSkillCategories(skillCategories).join(', ');

  const rootStyle = isPdf
    ? {
      marginTop: scaled.pageMarginTop,
      marginBottom: scaled.pageMarginBottom,
      marginLeft: scaled.pageMarginLeft,
      marginRight: scaled.pageMarginRight,
      paddingTop: scaled.pagePaddingTop,
      paddingBottom: scaled.pagePaddingBottom,
      paddingLeft: scaled.pagePaddingLeft,
      paddingRight: scaled.pagePaddingRight,
      fontFamily: resumeStyle.pdfFontFamily,
      fontSize: scaled.bodySize,
      fontWeight: scaled.bodyWeight,
      lineHeight: scaled.lineHeight,
      color: '#111111',
    }
    : {
      marginTop: scaled.pageMarginTop,
      marginBottom: scaled.pageMarginBottom,
      marginLeft: scaled.pageMarginLeft,
      marginRight: scaled.pageMarginRight,
      paddingTop: scaled.pagePaddingTop,
      paddingBottom: scaled.pagePaddingBottom,
      paddingLeft: scaled.pagePaddingLeft,
      paddingRight: scaled.pagePaddingRight,
      fontFamily: resumeStyle.webFontFamily,
      fontSize: scaled.bodySize,
      fontWeight: scaled.bodyWeight,
      lineHeight: scaled.lineHeight,
      color: '#111111',
      width: `${resumeStyle.pageWidthMm}mm`,
      minHeight: `${resumeStyle.pageHeightMm}mm`,
    };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: scaled.sectionSpacing,
  };
  const nameStyle = {
    fontSize: scaled.resumeNameSize,
    margin: 0,
    marginBottom: scaled.paragraphSpacing,
    fontFamily: isPdf ? `${resumeStyle.pdfFontFamily.split('-')[0]}-Bold` : undefined,
    fontWeight: 700,
  };
  const contactStyle = {
    margin: 0,
    fontSize: scaled.bodySize * 0.88,
    color: '#333333',
  };

  const sectionStyle = {
    marginBottom: scaled.sectionSpacing,
    breakInside: 'avoid-page',
    pageBreakInside: 'avoid',
  };
  const sectionHeadingStyle = {
    fontSize: scaled.sectionHeadingSize,
    fontWeight: scaled.sectionHeadingWeight,
    textTransform: resumeStyle.headingUppercase ? 'uppercase' : 'none',
    letterSpacing: resumeStyle.headingUppercase ? 0.5 : 0,
    margin: 0,
    marginBottom: scaled.paragraphSpacing,
    paddingBottom: scaled.paragraphSpacing,
    borderBottomWidth: resumeStyle.headingDivider ? scaled.dividerThickness : 0,
    borderBottomStyle: 'solid',
    borderBottomColor: '#444444',
  };

  const entryStyle = {
    marginBottom: scaled.paragraphSpacing + scaled.bulletSpacing,
    breakInside: 'avoid-page',
    pageBreakInside: 'avoid',
  };
  const entryHeadStyle = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 8,
  };
  const lineStyle = {
    margin: 0,
    marginTop: scaled.bulletSpacing,
    marginLeft: 14,
  };
  const subtleStyle = {
    margin: 0,
    marginTop: scaled.bulletSpacing,
    color: '#333333',
    fontSize: scaled.bodySize * 0.92,
  };
  const dateStyle = {
    fontSize: scaled.bodySize * 0.9,
    color: '#2f2f2f',
    ...(isPdf ? {} : { whiteSpace: 'nowrap' }),
  };
  const boldStyle = isPdf
    ? { fontFamily: `${resumeStyle.pdfFontFamily.split('-')[0]}-Bold` }
    : { fontWeight: 700 };

  const contactLine = [
    resume.personalInfo.phone,
    resume.personalInfo.email,
    resume.personalInfo.linkedin,
    resume.personalInfo.github,
    resume.personalInfo.location,
  ].filter(Boolean).join('   ');

  const renderBulletLine = (text, key) => {
    if (isPdf) return <Text style={lineStyle} key={key}>– {text}</Text>;
    return <p className="resume-indent-v2" style={lineStyle} key={key}>– {text}</p>;
  };

  const renderPlainLine = (text, key) => {
    if (isPdf) return <Text style={lineStyle} key={key}>{text}</Text>;
    return <p className="resume-indent-v2" style={lineStyle} key={key}>{text}</p>;
  };
  const renderBold = (text) => (isPdf ? <Text style={boldStyle}>{text}</Text> : <strong>{text}</strong>);
  const renderInline = (text) => (isPdf ? <Text>{text}</Text> : <span>{text}</span>);

  const renderEntryHeader = (left, right) => {
    if (isPdf) {
      return (
        <View style={entryHeadStyle} wrap={false}>
          <View style={{ flexGrow: 1 }}>{left}</View>
          {right || null}
        </View>
      );
    }
    return (
      <div className="resume-entry-head-v2" style={entryHeadStyle}>
        <div>{left}</div>
        {right || null}
      </div>
    );
  };

  const renderSectionBody = (sectionKey) => {
    if (sectionKey === 'summary') {
      if (!resume.personalInfo.summary) return null;
      if (isPdf) return <Text>{resume.personalInfo.summary}</Text>;
      return <p>{resume.personalInfo.summary}</p>;
    }

    if (sectionKey === 'workExperience') {
      if (!resume.workExperience.length) return null;
      return resume.workExperience.map((exp, index) => {
        const content = (
          <>
            {renderEntryHeader(
              <>
                {exp.jobTitle ? renderBold(exp.jobTitle) : null}
                {exp.company ? renderInline(`${exp.jobTitle ? ' | ' : ''}${exp.company}`) : null}
              </>,
              renderDateRange(exp.startDate, exp.endDate, exp.current)
                ? (isPdf ? <Text style={dateStyle}>{renderDateRange(exp.startDate, exp.endDate, exp.current)}</Text> : <span className="resume-date-v2" style={dateStyle}>{renderDateRange(exp.startDate, exp.endDate, exp.current)}</span>)
                : null,
            )}
            {exp.location ? (isPdf ? <Text style={subtleStyle}>{exp.location}</Text> : <p className="resume-subtext-v2" style={subtleStyle}>{exp.location}</p>) : null}
            {splitNonEmptyLines(exp.description).map((line, lineIndex) => renderBulletLine(line, `exp-${index}-${lineIndex}`))}
          </>
        );

        if (isPdf) return <View style={entryStyle} key={`exp-${index}`} wrap={false}>{content}</View>;
        return <div className="resume-entry-v2" style={entryStyle} key={`exp-${index}`}>{content}</div>;
      });
    }

    if (sectionKey === 'education') {
      if (!resume.education.length) return null;
      return resume.education.map((edu, index) => {
        const content = (
          <>
            {renderEntryHeader(
              <>
                {edu.institution ? renderBold(edu.institution) : null}
                {(edu.degree || edu.fieldOfStudy) ? renderInline(`${edu.institution ? ' | ' : ''}${[edu.degree, edu.fieldOfStudy].filter(Boolean).join(', ')}`) : null}
              </>,
              renderDateRange(edu.startDate, edu.endDate, false)
                ? (isPdf ? <Text style={dateStyle}>{renderDateRange(edu.startDate, edu.endDate, false)}</Text> : <span className="resume-date-v2" style={dateStyle}>{renderDateRange(edu.startDate, edu.endDate, false)}</span>)
                : null,
            )}
            {edu.gpa ? (isPdf ? <Text style={subtleStyle}>GPA: {edu.gpa}</Text> : <p className="resume-subtext-v2" style={subtleStyle}>GPA: {edu.gpa}</p>) : null}
          </>
        );
        if (isPdf) return <View style={entryStyle} key={`edu-${index}`} wrap={false}>{content}</View>;
        return <div className="resume-entry-v2" style={entryStyle} key={`edu-${index}`}>{content}</div>;
      });
    }

    if (sectionKey === 'skills') {
      if (!skillCategories.length && !fallbackSkills) return null;
      if (skillCategories.length) {
        return skillCategories.map((category) => (
          <SkillCategoryRenderer
            key={category.id}
            target={target}
            categoryName={category.name}
            items={category.items}
            style={lineStyle}
            pdfBoldStyle={boldStyle}
            pdfPrimitives={pdfPrimitives}
          />
        ));
      }
      if (isPdf) return <Text>{fallbackSkills}</Text>;
      return <p>{fallbackSkills}</p>;
    }

    if (sectionKey === 'projects') {
      if (!resume.projects.length) return null;
      return resume.projects.map((project, index) => {
        const content = (
          <>
            {renderEntryHeader(
              <>
                {project.name ? renderBold(project.name) : null}
                {project.technologies ? renderInline(`${project.name ? ' | ' : ''}${project.technologies}`) : null}
              </>,
              null,
            )}
            {project.link
              ? (isPdf
                ? <Link src={normalizeUrl(project.link)} style={subtleStyle}>{project.link}</Link>
                : <p className="resume-subtext-v2" style={subtleStyle}>{project.link}</p>)
              : null}
            {splitNonEmptyLines(project.description).map((line, lineIndex) => renderBulletLine(line, `proj-${index}-${lineIndex}`))}
          </>
        );
        if (isPdf) return <View style={entryStyle} key={`proj-${index}`} wrap={false}>{content}</View>;
        return <div className="resume-entry-v2" style={entryStyle} key={`proj-${index}`}>{content}</div>;
      });
    }

    if (sectionKey === 'certifications') {
      if (!resume.certifications.length) return null;
      return resume.certifications.map((cert, index) => {
        const content = renderEntryHeader(
          <>
            {cert.name ? renderBold(cert.name) : null}
            {cert.organization ? renderInline(`${cert.name ? ' | ' : ''}${cert.organization}`) : null}
          </>,
          cert.date
            ? (isPdf ? <Text style={dateStyle}>{cert.date}</Text> : <span className="resume-date-v2" style={dateStyle}>{cert.date}</span>)
            : null,
        );
        if (isPdf) return <View style={entryStyle} key={`cert-${index}`} wrap={false}>{content}</View>;
        return <div className="resume-entry-v2" style={entryStyle} key={`cert-${index}`}>{content}</div>;
      });
    }

    if (sectionKey === 'languages') {
      if (!resume.languages.length) return null;
      const label = resume.languages
        .map((lang) => `${lang.language}${lang.proficiency ? ` (${lang.proficiency})` : ''}`)
        .join(', ');
      if (isPdf) return <Text>{label}</Text>;
      return <p>{label}</p>;
    }

    if (!isCustomSectionKey(sectionKey)) return null;
    const customSection = customSectionMap.get(fromCustomSectionKey(sectionKey));
    if (!customSection || !customSection.entries.length) return null;

    return customSection.entries.map((entry) => {
      const model = toCustomEntryModel(customSection.typeId, entry.values);
      const content = (
        <>
          {(model.title || model.subtitle || model.date)
            ? renderEntryHeader(
              <>
                {model.title ? <strong>{model.title}</strong> : null}
                {model.title ? renderBold(model.title) : null}
                {model.subtitle ? renderInline(`${model.title ? ' | ' : ''}${model.subtitle}`) : null}
              </>,
              model.date
                ? (isPdf ? <Text style={dateStyle}>{model.date}</Text> : <span className="resume-date-v2" style={dateStyle}>{model.date}</span>)
                : null,
            )
            : null}
          {model.paragraphs.map((paragraph, index) => renderPlainLine(paragraph, `${entry.id}-p-${index}`))}
          {model.bullets.map((bullet, index) => renderBulletLine(bullet, `${entry.id}-b-${index}`))}
          {model.keyValues.map((pair, index) => renderPlainLine(`${pair.label ? `${pair.label}: ` : ''}${pair.value}`, `${entry.id}-k-${index}`))}
        </>
      );
      if (isPdf) return <View style={entryStyle} key={entry.id} wrap={false}>{content}</View>;
      return <div className="resume-entry-v2" style={entryStyle} key={entry.id}>{content}</div>;
    });
  };

  const renderedSections = sectionOrder
    .map((sectionKey) => {
      const body = renderSectionBody(sectionKey);
      if (!body) return null;
      return (
        <SectionRenderer
          key={sectionKey}
          target={target}
          title={resolveSectionLabel(sectionKey, resume.customSections)}
          headingStyle={sectionHeadingStyle}
          sectionStyle={sectionStyle}
          pdfPrimitives={pdfPrimitives}
        >
          {body}
        </SectionRenderer>
      );
    })
    .filter(Boolean);

  if (isPdf) {
    return (
      <View style={rootStyle}>
        <View style={headerStyle} wrap={false}>
          {resume.personalInfo.fullName ? <Text style={nameStyle}>{resume.personalInfo.fullName}</Text> : null}
          {contactLine ? <Text style={contactStyle}>{contactLine}</Text> : null}
        </View>
        {renderedSections}
      </View>
    );
  }

  return (
    <div className="resume-paper resume-paper-v2" style={rootStyle}>
      <header className="resume-header-v2" style={headerStyle}>
        {resume.personalInfo.fullName ? <h1 className="resume-name-v2" style={nameStyle}>{resume.personalInfo.fullName}</h1> : null}
        {contactLine ? <p className="resume-contact-v2" style={contactStyle}>{contactLine}</p> : null}
      </header>
      {renderedSections}
      {!resume.personalInfo.fullName && !resume.personalInfo.email ? (
        <div className="resume-empty-state">
          <p>Start filling in the form to see your resume preview here.</p>
        </div>
      ) : null}
    </div>
  );
}

export default function ResumeRenderer({ resume, target, fitSettings, pdfPrimitives }) {
  return (
    <StyleProvider designSettings={resume.designSettings} fitSettings={fitSettings}>
      <RendererBody resume={resume} target={target} pdfPrimitives={pdfPrimitives} />
    </StyleProvider>
  );
}
