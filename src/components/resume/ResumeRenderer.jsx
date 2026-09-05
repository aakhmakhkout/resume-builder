import { useMemo } from 'react';
import { toCustomEntryModel } from '../../utils/customSectionRender';
import { fromCustomSectionKey, isCustomSectionKey, resolveSectionLabel, toCustomSectionKey } from '../../utils/sections';
import { flattenSkillCategories, normalizeSkillCategories } from '../../utils/skillCategories';
import { getSafeSectionOrder } from '../../utils/singlePageFit';
import ContactIcon from './ContactIcons';
import SectionRenderer from './SectionRenderer';
import SkillCategoryRenderer from './SkillCategoryRenderer';
import { StyleProvider, useResumeStyle } from './StyleProvider';

// Strips a leading bullet/number marker a user may have pasted in from elsewhere
// (•, -, *, ‣, ●, ▪, 1., 1), a., a)) so it never doubles up with the bullet the
// renderer itself adds in front of each line.
const BULLET_PREFIX_RE = /^(?:[-*•‣◦▪▫●○∙·–—]|\d+[.)]|[a-zA-Z][.)])\s+/;

const splitNonEmptyLines = (value = '') =>
  value
    .split('\n')
    .map((line) => line.trim().replace(BULLET_PREFIX_RE, '').trim())
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
  const isPdf = target === 'pdf';
  // Same central config either way — only the unit differs (pt for PDF, px for web).
  const scaled = isPdf ? resumeStyle.scaled : resumeStyle.scaledWeb;
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
      paddingTop: scaled.pagePaddingTop,
      paddingBottom: scaled.pagePaddingBottom,
      paddingLeft: scaled.pagePaddingLeft,
      paddingRight: scaled.pagePaddingRight,
      fontFamily: resumeStyle.pdfFontFamily,
      fontSize: scaled.bodySize,
      fontWeight: scaled.bodyWeight,
      lineHeight: scaled.lineHeight,
      color: resumeStyle.textColor,
    }
    : {
      paddingTop: scaled.pagePaddingTop,
      paddingBottom: scaled.pagePaddingBottom,
      paddingLeft: scaled.pagePaddingLeft,
      paddingRight: scaled.pagePaddingRight,
      fontFamily: resumeStyle.webFontFamily,
      fontSize: scaled.bodySize,
      fontWeight: scaled.bodyWeight,
      lineHeight: scaled.lineHeight,
      color: resumeStyle.textColor,
      width: `${resumeStyle.pageWidthMm}mm`,
      minHeight: `${resumeStyle.pageHeightMm}mm`,
    };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: scaled.sectionSpacing,
  };
  const nameStyle = {
    fontSize: scaled.resumeNameSize,
    // Explicit line-height on every text style below (not just the root) — some
    // renderers inherit a unitless line-height as a fixed computed value instead
    // of re-deriving it from each element's own font size, which visually
    // collapses the gap for anything far larger than the root font size (like the
    // name heading) and makes it overlap the line right after it.
    lineHeight: scaled.lineHeight,
    margin: 0,
    marginBottom: scaled.paragraphSpacing * 2,
    fontFamily: isPdf ? resumeStyle.pdfBoldFontFamily : undefined,
    fontWeight: 700,
  };
  const contactRowStyle = isPdf
    ? {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
    }
    : {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
      rowGap: scaled.bulletSpacing,
    };
  const contactItemStyle = isPdf
    ? { display: 'flex', flexDirection: 'row', alignItems: 'center' }
    : { display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' };
  const contactStyle = {
    margin: 0,
    lineHeight: scaled.lineHeight,
    fontSize: scaled.bodySize * resumeStyle.contactSizeRatio,
    color: resumeStyle.mutedTextColor,
  };
  const contactSeparatorStyle = {
    ...contactStyle,
    marginLeft: scaled.entryHeaderGap,
    marginRight: scaled.entryHeaderGap,
  };
  const contactIconGap = scaled.entryHeaderGap / 2;

  const sectionStyle = {
    marginBottom: scaled.sectionSpacing,
    breakInside: 'avoid-page',
    pageBreakInside: 'avoid',
  };
  const sectionHeadingStyle = {
    fontSize: scaled.sectionHeadingSize,
    lineHeight: scaled.lineHeight,
    fontFamily: (isPdf && scaled.sectionHeadingWeight >= 600) ? resumeStyle.pdfBoldFontFamily : undefined,
    fontWeight: scaled.sectionHeadingWeight,
    textTransform: resumeStyle.headingUppercase ? 'uppercase' : 'none',
    letterSpacing: resumeStyle.headingUppercase ? resumeStyle.headingLetterSpacing : 0,
    margin: 0,
    marginBottom: scaled.paragraphSpacing,
    paddingBottom: scaled.paragraphSpacing,
    borderBottomWidth: resumeStyle.headingDivider ? scaled.dividerThickness : 0,
    borderBottomStyle: 'solid',
    borderBottomColor: resumeStyle.dividerColor,
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
    gap: scaled.entryHeaderGap,
  };
  const lineStyle = {
    margin: 0,
    marginTop: scaled.bulletSpacing,
    marginLeft: scaled.bulletIndent,
  };
  const subtleStyle = {
    margin: 0,
    lineHeight: scaled.lineHeight,
    marginTop: scaled.bulletSpacing,
    color: resumeStyle.subtleTextColor,
    fontSize: scaled.bodySize * resumeStyle.subtleSizeRatio,
  };
  // Italic secondary line under an entry title (company/institution/issuer) — sized
  // close to body text, not shrunk like subtleStyle, matching a classic ATS layout
  // where the subtitle is still clearly legible, just visually secondary via italics.
  const subtitleStyle = {
    margin: 0,
    lineHeight: scaled.lineHeight,
    marginTop: scaled.bulletSpacing,
    fontStyle: 'italic',
    color: resumeStyle.textColor,
    fontSize: scaled.bodySize,
  };
  const technologiesLineStyle = {
    ...subtitleStyle,
    color: resumeStyle.mutedTextColor,
  };
  const linkLineStyle = {
    margin: 0,
    lineHeight: scaled.lineHeight,
    marginTop: scaled.bulletSpacing,
    color: resumeStyle.textColor,
    textDecoration: 'none',
    fontSize: scaled.bodySize * resumeStyle.subtleSizeRatio,
  };
  const dateStyle = {
    lineHeight: scaled.lineHeight,
    fontSize: scaled.bodySize * resumeStyle.dateSizeRatio,
    color: resumeStyle.subtleTextColor,
    ...(isPdf ? {} : { whiteSpace: 'nowrap' }),
  };
  const boldStyle = isPdf ? { fontFamily: resumeStyle.pdfBoldFontFamily } : { fontWeight: 700 };

  const contactItems = [
    resume.personalInfo.phone ? { type: 'phone', text: resume.personalInfo.phone } : null,
    resume.personalInfo.email ? { type: 'email', text: resume.personalInfo.email, href: `mailto:${resume.personalInfo.email}` } : null,
    resume.personalInfo.location ? { type: 'location', text: resume.personalInfo.location } : null,
    resume.personalInfo.linkedin ? { type: 'linkedin', text: 'LinkedIn', href: normalizeUrl(resume.personalInfo.linkedin) } : null,
    resume.personalInfo.github ? { type: 'github', text: 'GitHub', href: normalizeUrl(resume.personalInfo.github) } : null,
  ].filter(Boolean);

  const renderContactRow = () => {
    if (!contactItems.length) return null;
    const iconSize = scaled.bodySize * resumeStyle.contactSizeRatio;

    if (isPdf) {
      return (
        <View style={contactRowStyle}>
          {contactItems.map((item, index) => (
            <View style={contactItemStyle} key={`${item.type}-${index}`} wrap={false}>
              {index > 0 ? <Text style={contactSeparatorStyle}>|</Text> : null}
              <View style={{ marginRight: contactIconGap }}>
                <ContactIcon type={item.type} size={iconSize} color={resumeStyle.mutedTextColor} target="pdf" pdfPrimitives={pdfPrimitives} />
              </View>
              {item.href
                ? <Link src={item.href} style={{ ...contactStyle, color: resumeStyle.textColor, textDecoration: 'none' }}>{item.text}</Link>
                : <Text style={contactStyle}>{item.text}</Text>}
            </View>
          ))}
        </View>
      );
    }

    return (
      <div className="resume-contact-v2" style={contactRowStyle}>
        {contactItems.map((item, index) => (
          <span style={contactItemStyle} key={`${item.type}-${index}`}>
            {index > 0 ? <span style={contactSeparatorStyle}>|</span> : null}
            <span style={{ marginRight: contactIconGap, display: 'inline-flex' }}>
              <ContactIcon type={item.type} size={iconSize} color={resumeStyle.mutedTextColor} target="web" />
            </span>
            {item.href
              ? <a href={item.href} target="_blank" rel="noreferrer" style={{ ...contactStyle, color: resumeStyle.textColor, textDecoration: 'none' }}>{item.text}</a>
              : <span style={contactStyle}>{item.text}</span>}
          </span>
        ))}
      </div>
    );
  };

  const renderBulletLine = (text, key) => {
    if (isPdf) return <Text style={lineStyle} key={key}>• {text}</Text>;
    return <p className="resume-indent-v2" style={lineStyle} key={key}>• {text}</p>;
  };

  const renderPlainLine = (text, key) => {
    if (isPdf) return <Text style={lineStyle} key={key}>{text}</Text>;
    return <p className="resume-indent-v2" style={lineStyle} key={key}>{text}</p>;
  };
  const renderBold = (text) => (isPdf ? <Text style={boldStyle}>{text}</Text> : <strong>{text}</strong>);
  // Italic secondary line under an entry title — e.g. "Company, Location" under a
  // job title, or "University Of Kashmir" under a degree. Own line, no leading pipe.
  const renderSubtitleLine = (text, style = subtitleStyle) => {
    if (!text) return null;
    if (isPdf) return <Text style={style}>{text}</Text>;
    return <p className="resume-subtext-v2" style={style}>{text}</p>;
  };
  const renderLinkLine = (url) => {
    if (!url) return null;
    const href = normalizeUrl(url);
    if (isPdf) return <Link src={href} style={linkLineStyle}>{url}</Link>;
    return <a className="resume-link-line-v2" href={href} target="_blank" rel="noreferrer" style={{ ...linkLineStyle, display: 'block', textDecoration: 'none' }}>{url}</a>;
  };

  const renderEntryHeader = (left, right) => {
    if (isPdf) {
      return (
        <View style={entryHeadStyle} wrap={false}>
          <View style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>{left}</View>
          {right ? <View style={{ flexShrink: 0 }}>{right}</View> : null}
        </View>
      );
    }
    return (
      <div className="resume-entry-head-v2" style={entryHeadStyle}>
        <div style={{ flex: '1 1 auto', minWidth: 0 }}>{left}</div>
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
              exp.jobTitle ? renderBold(exp.jobTitle) : null,
              renderDateRange(exp.startDate, exp.endDate, exp.current)
                ? (isPdf ? <Text style={dateStyle}>{renderDateRange(exp.startDate, exp.endDate, exp.current)}</Text> : <span className="resume-date-v2" style={dateStyle}>{renderDateRange(exp.startDate, exp.endDate, exp.current)}</span>)
                : null,
            )}
            {renderSubtitleLine([exp.company, exp.location].filter(Boolean).join(', '))}
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
        const degreeTitle = edu.degree && edu.fieldOfStudy
          ? `${edu.degree} in ${edu.fieldOfStudy}`
          : (edu.degree || edu.fieldOfStudy || '');
        const content = (
          <>
            {renderEntryHeader(
              degreeTitle ? renderBold(degreeTitle) : (edu.institution ? renderBold(edu.institution) : null),
              renderDateRange(edu.startDate, edu.endDate, false)
                ? (isPdf ? <Text style={dateStyle}>{renderDateRange(edu.startDate, edu.endDate, false)}</Text> : <span className="resume-date-v2" style={dateStyle}>{renderDateRange(edu.startDate, edu.endDate, false)}</span>)
                : null,
            )}
            {degreeTitle ? renderSubtitleLine(edu.institution) : null}
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
            {renderEntryHeader(project.name ? renderBold(project.name) : null, null)}
            {renderLinkLine(project.link)}
            {project.technologies ? renderSubtitleLine(`Technologies: ${project.technologies}`, technologiesLineStyle) : null}
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
        const content = (
          <>
            {renderEntryHeader(
              cert.name ? renderBold(cert.name) : null,
              cert.date
                ? (isPdf ? <Text style={dateStyle}>{cert.date}</Text> : <span className="resume-date-v2" style={dateStyle}>{cert.date}</span>)
                : null,
            )}
            {renderSubtitleLine(cert.organization)}
          </>
        );
        if (isPdf) return <View style={entryStyle} key={`cert-${index}`} wrap={false}>{content}</View>;
        return <div className="resume-entry-v2" style={entryStyle} key={`cert-${index}`}>{content}</div>;
      });
    }

    if (sectionKey === 'languages') {
      if (!resume.languages.length) return null;
      const label = resume.languages
        .map((lang) => `${lang.language}${lang.proficiency ? ` (${lang.proficiency})` : ''}`)
        .join('   •   ');
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
          {(model.title || model.date)
            ? renderEntryHeader(
              model.title ? renderBold(model.title) : null,
              model.date
                ? (isPdf ? <Text style={dateStyle}>{model.date}</Text> : <span className="resume-date-v2" style={dateStyle}>{model.date}</span>)
                : null,
            )
            : null}
          {renderSubtitleLine(model.subtitle)}
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
          {renderContactRow()}
        </View>
        {renderedSections}
      </View>
    );
  }

  return (
    <div className="resume-paper resume-paper-v2" style={rootStyle}>
      <header className="resume-header-v2" style={headerStyle}>
        {resume.personalInfo.fullName ? <h1 className="resume-name-v2" style={nameStyle}>{resume.personalInfo.fullName}</h1> : null}
        {renderContactRow()}
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
