export const FONT_OPTIONS = [
  { value: 'times', label: 'Times New Roman' },
  { value: 'georgia', label: 'Georgia' },
  { value: 'helvetica', label: 'Helvetica / Arial' },
  { value: 'courier', label: 'Courier New' },
];

export const RESUME_STYLE_PRESETS = [
  { id: 'classicAts', label: 'Classic ATS', overrides: {} },
  {
    id: 'modernDeveloper',
    label: 'Modern Developer',
    overrides: {
      fontFamily: 'helvetica',
      resumeNameSize: 31,
      sectionHeadingSize: 13,
      sectionHeadingWeight: 700,
      bodySize: 11,
      bodyWeight: 400,
      lineHeight: 1.4,
      sectionSpacing: 13,
      paragraphSpacing: 3,
      bulletSpacing: 2,
      dividerThickness: 1,
    },
  },
  {
    id: 'minimalProfessional',
    label: 'Minimal Professional',
    overrides: {
      fontFamily: 'georgia',
      resumeNameSize: 29,
      sectionHeadingSize: 12,
      sectionHeadingWeight: 600,
      bodySize: 10.8,
      lineHeight: 1.34,
      sectionSpacing: 11,
      paragraphSpacing: 2,
      bulletSpacing: 1,
      headingUppercase: false,
      headingDivider: false,
    },
  },
  {
    id: 'compactResume',
    label: 'Compact Resume',
    overrides: {
      resumeNameSize: 27,
      sectionHeadingSize: 11.5,
      bodySize: 10,
      lineHeight: 1.28,
      sectionSpacing: 8,
      paragraphSpacing: 1,
      bulletSpacing: 1,
      pagePaddingTop: 26,
      pagePaddingBottom: 26,
      pagePaddingLeft: 28,
      pagePaddingRight: 28,
    },
  },
  {
    id: 'academic',
    label: 'Academic',
    overrides: {
      fontFamily: 'times',
      resumeNameSize: 30,
      sectionHeadingSize: 13,
      sectionHeadingWeight: 700,
      bodySize: 11.5,
      lineHeight: 1.45,
      sectionSpacing: 14,
      paragraphSpacing: 3,
      bulletSpacing: 2,
      pagePaddingTop: 40,
      pagePaddingBottom: 40,
      pagePaddingLeft: 42,
      pagePaddingRight: 42,
    },
  },
  { id: 'custom', label: 'Custom Design', overrides: {} },
];

export const DEFAULT_RESUME_STYLE = {
  pageWidthMm: 210,
  pageHeightMm: 297,
  pageWidthPt: 595.28,
  pageHeightPt: 841.89,

  fontFamily: 'times',
  resumeNameSize: 30,
  sectionHeadingSize: 12.5,
  sectionHeadingWeight: 700,
  bodySize: 11,
  bodyWeight: 400,

  lineHeight: 1.36,
  sectionSpacing: 11,
  paragraphSpacing: 2,
  bulletSpacing: 1,

  pageMarginTop: 16,
  pageMarginBottom: 16,
  pageMarginLeft: 16,
  pageMarginRight: 16,

  pagePaddingTop: 36,
  pagePaddingBottom: 36,
  pagePaddingLeft: 36,
  pagePaddingRight: 36,

  headingUppercase: true,
  headingDivider: true,
  dividerThickness: 0.8,
};

const presetMap = new Map(RESUME_STYLE_PRESETS.map((preset) => [preset.id, preset]));

const sanitizeNumeric = (value, fallback, min, max) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
};

const normalizePresetId = (presetId) => (presetMap.has(presetId) ? presetId : 'classicAts');

const mapLegacyToCustom = (settings = {}) => {
  const global = settings.global || {};
  if (!Object.keys(global).length) return settings.custom || {};

  return {
    fontFamily: global.fontFamily,
    bodySize: global.baseFontSize,
    lineHeight: global.lineHeight,
    sectionSpacing: global.sectionGap,
    dividerThickness: global.dividerThickness,
    pageMarginTop: global.pageMargin,
    pageMarginBottom: global.pageMargin,
    pageMarginLeft: global.pageMargin,
    pageMarginRight: global.pageMargin,
    pagePaddingTop: global.pagePadding,
    pagePaddingBottom: global.pagePadding,
    pagePaddingLeft: global.pagePadding,
    pagePaddingRight: global.pagePadding,
  };
};

export const normalizeDesignSettings = (settings = {}) => {
  const hasLegacyGlobal = Boolean(settings.global && Object.keys(settings.global).length);
  const fallbackPreset = hasLegacyGlobal ? 'custom' : 'classicAts';
  const presetId = normalizePresetId(settings.presetId || fallbackPreset);
  const mergedCustom = {
    ...mapLegacyToCustom(settings),
    ...(settings.custom || {}),
  };

  return {
    presetId,
    custom: {
      fontFamily: mergedCustom.fontFamily,
      resumeNameSize: sanitizeNumeric(mergedCustom.resumeNameSize, DEFAULT_RESUME_STYLE.resumeNameSize, 20, 50),
      sectionHeadingSize: sanitizeNumeric(mergedCustom.sectionHeadingSize, DEFAULT_RESUME_STYLE.sectionHeadingSize, 9, 24),
      sectionHeadingWeight: sanitizeNumeric(mergedCustom.sectionHeadingWeight, DEFAULT_RESUME_STYLE.sectionHeadingWeight, 300, 900),
      bodySize: sanitizeNumeric(mergedCustom.bodySize, DEFAULT_RESUME_STYLE.bodySize, 8, 18),
      bodyWeight: sanitizeNumeric(mergedCustom.bodyWeight, DEFAULT_RESUME_STYLE.bodyWeight, 300, 700),
      lineHeight: sanitizeNumeric(mergedCustom.lineHeight, DEFAULT_RESUME_STYLE.lineHeight, 1, 2),
      sectionSpacing: sanitizeNumeric(mergedCustom.sectionSpacing, DEFAULT_RESUME_STYLE.sectionSpacing, 0, 40),
      paragraphSpacing: sanitizeNumeric(mergedCustom.paragraphSpacing, DEFAULT_RESUME_STYLE.paragraphSpacing, 0, 12),
      bulletSpacing: sanitizeNumeric(mergedCustom.bulletSpacing, DEFAULT_RESUME_STYLE.bulletSpacing, 0, 12),
      pageMarginTop: sanitizeNumeric(mergedCustom.pageMarginTop, DEFAULT_RESUME_STYLE.pageMarginTop, 0, 60),
      pageMarginBottom: sanitizeNumeric(mergedCustom.pageMarginBottom, DEFAULT_RESUME_STYLE.pageMarginBottom, 0, 60),
      pageMarginLeft: sanitizeNumeric(mergedCustom.pageMarginLeft, DEFAULT_RESUME_STYLE.pageMarginLeft, 0, 60),
      pageMarginRight: sanitizeNumeric(mergedCustom.pageMarginRight, DEFAULT_RESUME_STYLE.pageMarginRight, 0, 60),
      pagePaddingTop: sanitizeNumeric(mergedCustom.pagePaddingTop, DEFAULT_RESUME_STYLE.pagePaddingTop, 0, 80),
      pagePaddingBottom: sanitizeNumeric(mergedCustom.pagePaddingBottom, DEFAULT_RESUME_STYLE.pagePaddingBottom, 0, 80),
      pagePaddingLeft: sanitizeNumeric(mergedCustom.pagePaddingLeft, DEFAULT_RESUME_STYLE.pagePaddingLeft, 0, 80),
      pagePaddingRight: sanitizeNumeric(mergedCustom.pagePaddingRight, DEFAULT_RESUME_STYLE.pagePaddingRight, 0, 80),
      headingUppercase: typeof mergedCustom.headingUppercase === 'boolean'
        ? mergedCustom.headingUppercase
        : DEFAULT_RESUME_STYLE.headingUppercase,
      headingDivider: typeof mergedCustom.headingDivider === 'boolean'
        ? mergedCustom.headingDivider
        : DEFAULT_RESUME_STYLE.headingDivider,
      dividerThickness: sanitizeNumeric(mergedCustom.dividerThickness, DEFAULT_RESUME_STYLE.dividerThickness, 0, 4),
    },
  };
};

export const getWebFontFamily = (fontFamily) => {
  if (fontFamily === 'georgia') return 'Georgia, "Times New Roman", serif';
  if (fontFamily === 'helvetica') return 'Arial, Helvetica, sans-serif';
  if (fontFamily === 'courier') return '"Courier New", Courier, monospace';
  return '"Times New Roman", Times, serif';
};

export const getPdfFontFamily = (fontFamily) => {
  if (fontFamily === 'helvetica') return 'Helvetica';
  if (fontFamily === 'courier') return 'Courier';
  return 'Times-Roman';
};

const getPresetOverrides = (presetId) => presetMap.get(presetId)?.overrides || {};

export const getResumeStyle = (designSettings, fitSettings = {}) => {
  const normalized = normalizeDesignSettings(designSettings);
  const scale = {
    fontScale: fitSettings.fontScale || 1,
    lineHeightScale: fitSettings.lineHeightScale || 1,
    sectionGapScale: fitSettings.sectionGapScale || 1,
    marginScale: fitSettings.marginScale || 1,
    pagePaddingScale: fitSettings.pagePaddingScale || 1,
  };
  const presetStyle = {
    ...DEFAULT_RESUME_STYLE,
    ...getPresetOverrides(normalized.presetId),
  };
  const baseStyle = normalized.presetId === 'custom'
    ? {
      ...DEFAULT_RESUME_STYLE,
      ...normalized.custom,
    }
    : presetStyle;

  return {
    ...baseStyle,
    webFontFamily: getWebFontFamily(baseStyle.fontFamily),
    pdfFontFamily: getPdfFontFamily(baseStyle.fontFamily),
    scaled: {
      ...baseStyle,
      resumeNameSize: baseStyle.resumeNameSize * scale.fontScale,
      sectionHeadingSize: baseStyle.sectionHeadingSize * scale.fontScale,
      bodySize: baseStyle.bodySize * scale.fontScale,
      lineHeight: baseStyle.lineHeight * scale.lineHeightScale,
      sectionSpacing: baseStyle.sectionSpacing * scale.sectionGapScale,
      paragraphSpacing: baseStyle.paragraphSpacing * scale.marginScale,
      bulletSpacing: baseStyle.bulletSpacing * scale.marginScale,
      pagePaddingTop: baseStyle.pagePaddingTop * scale.pagePaddingScale,
      pagePaddingBottom: baseStyle.pagePaddingBottom * scale.pagePaddingScale,
      pagePaddingLeft: baseStyle.pagePaddingLeft * scale.pagePaddingScale,
      pagePaddingRight: baseStyle.pagePaddingRight * scale.pagePaddingScale,
      pageMarginTop: baseStyle.pageMarginTop * scale.marginScale,
      pageMarginBottom: baseStyle.pageMarginBottom * scale.marginScale,
      pageMarginLeft: baseStyle.pageMarginLeft * scale.marginScale,
      pageMarginRight: baseStyle.pageMarginRight * scale.marginScale,
      dividerThickness: baseStyle.dividerThickness * scale.marginScale,
    },
  };
};

export const updateDesignCustomField = (designSettings, field, value) => {
  const normalized = normalizeDesignSettings(designSettings);
  return {
    ...normalized,
    presetId: 'custom',
    custom: {
      ...normalized.custom,
      [field]: value,
    },
  };
};

export const setDesignPreset = (designSettings, presetId) => {
  const normalized = normalizeDesignSettings(designSettings);
  return {
    ...normalized,
    presetId: normalizePresetId(presetId),
  };
};
