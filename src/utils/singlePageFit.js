const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const lerp = (start, end, t) => start + (end - start) * t;

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

const estimateResumeLines = (resume, layout = 'traditional') => {
  const { personalInfo, workExperience, education, skills, projects, certifications, languages } = resume;
  let lines = 0;

  if (personalInfo.fullName) lines += 2.5;
  if (personalInfo.jobTitle) lines += 1.5;
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
  if (languages.length) {
    lines += 2 + estimateWrappedLines(
      languages.map((language) => `${language.language}${language.proficiency ? ` (${language.proficiency})` : ''}`).join(' • '),
      95,
    );
  }

  if (layout === 'two-column') return lines * 0.84;
  if (layout === 'modern') return lines * 0.9;
  return lines;
};

const getTargetLines = (layout) => {
  if (layout === 'two-column') return 84;
  if (layout === 'modern') return 82;
  return 80;
};

export function getSafeSectionOrder(sectionOrder) {
  if (!Array.isArray(sectionOrder)) return [...DEFAULT_SECTION_ORDER];
  const filtered = sectionOrder.filter((section) => DEFAULT_SECTION_ORDER.includes(section));
  const missing = DEFAULT_SECTION_ORDER.filter((section) => !filtered.includes(section));
  return [...filtered, ...missing];
}

export function getSinglePageFitSettings(resume, { enabled = false, layout = 'traditional' } = {}) {
  const estimatedLines = estimateResumeLines(resume, layout);
  const targetLines = getTargetLines(layout);

  const defaultSettings = {
    enabled,
    estimatedLines,
    targetLines,
    compactness: 0,
    fontScale: 1,
    lineHeightScale: 1,
    pagePaddingScale: 1,
    marginScale: 1,
    sectionGapScale: 1,
    isAtSafeLimit: false,
  };

  if (!enabled || !estimatedLines || estimatedLines <= targetLines) {
    return defaultSettings;
  }

  const overflowRatio = (estimatedLines - targetLines) / targetLines;
  const compactness = clamp(overflowRatio * 1.75, 0, 1);

  return {
    ...defaultSettings,
    compactness,
    fontScale: lerp(1, 0.9, compactness),
    lineHeightScale: lerp(1, 0.93, compactness),
    pagePaddingScale: lerp(1, 0.72, compactness),
    marginScale: lerp(1, 0.72, compactness),
    sectionGapScale: lerp(1, 0.74, compactness),
    isAtSafeLimit: compactness >= 1,
  };
}

export function getLegacyPdfScale(resume, { singlePage }) {
  const estimatedLines = estimateResumeLines(resume);

  if (singlePage) {
    const targetLines = 80;
    if (!estimatedLines || estimatedLines <= targetLines) return 1;
    return clamp((targetLines / estimatedLines) * 0.98, 0.55, 1);
  }

  if (estimatedLines <= 80) return 1;
  if (estimatedLines <= 160) return 0.95;
  if (estimatedLines <= 240) return 0.9;
  if (estimatedLines <= 320) return 0.85;
  return 0.8;
}
