// ====================================================================================
// Central Resume Style Configuration
// ------------------------------------------------------------------------------------
// This is the SINGLE source of truth for every visual value used to render a resume,
// in both the React (web) live preview and the @react-pdf/renderer PDF export.
//
// All raw numeric typography/spacing values below (font sizes, line height, margins,
// padding, spacing, divider thickness) are expressed in POINTS (pt) — the native unit
// of @react-pdf/renderer / PDF documents. The web renderer converts these to CSS
// pixels via `ptToPx` so that 1pt of "paper" always looks the same physical size in
// both places (96px = 72pt = 1in, per the CSS spec). Never hardcode a raw px/pt number
// anywhere else in the app — add a field here instead.
// ====================================================================================

// CSS px-per-pt at the standard 96dpi browser reference pixel ratio (96/72).
export const PT_TO_PX = 96 / 72;
export const ptToPx = (pt) => pt * PT_TO_PX;

// ------------------------------------------------------------------------------------
// Fonts
// ------------------------------------------------------------------------------------
// The PDF renderer uses react-pdf's built-in standard 14 PDF fonts (Times-Roman,
// Helvetica, Courier + their Bold variants). These ship inside the PDF spec itself —
// no network fetch, no external font file, so PDF generation can never fail because
// of a font. The web preview uses the closest matching system font stack. The two
// aren't pixel-identical (different font vendors), but they're metrically close and,
// critically, PDF export can never break because a font failed to load.
export const FONT_ASSETS = {
  times: {
    label: 'Times New Roman',
    webFallback: '"Times New Roman", Times, serif',
    pdfFamily: 'Times-Roman',
    pdfBoldFamily: 'Times-Bold',
  },
  georgia: {
    label: 'Georgia',
    webFallback: 'Georgia, "Times New Roman", serif',
    // No PDF standard-font equivalent for Georgia; Times is the closest serif shape.
    pdfFamily: 'Times-Roman',
    pdfBoldFamily: 'Times-Bold',
  },
  helvetica: {
    label: 'Helvetica / Arial',
    webFallback: 'Arial, Helvetica, sans-serif',
    pdfFamily: 'Helvetica',
    pdfBoldFamily: 'Helvetica-Bold',
  },
  courier: {
    label: 'Courier New',
    webFallback: '"Courier New", Courier, monospace',
    pdfFamily: 'Courier',
    pdfBoldFamily: 'Courier-Bold',
  },
};

export const FONT_OPTIONS = Object.entries(FONT_ASSETS).map(([value, asset]) => ({
  value,
  label: asset.label,
}));

const getFontAsset = (fontFamily) => FONT_ASSETS[fontFamily] || FONT_ASSETS.times;

export const getWebFontFamily = (fontFamily) => getFontAsset(fontFamily).webFallback;

export const getPdfFontFamily = (fontFamily) => getFontAsset(fontFamily).pdfFamily;
export const getPdfBoldFontFamily = (fontFamily) => getFontAsset(fontFamily).pdfBoldFamily;

// ------------------------------------------------------------------------------------
// Style presets — each preset ONLY sets values on the shared resumeStyle shape.
// There is exactly one renderer (ResumeRenderer); presets never branch layout.
// ------------------------------------------------------------------------------------
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

// All raw values are in points (pt) — the natural unit for a printed page. Page
// dimensions stay in mm since that is a physical unit shared identically by both
// CSS (`mm`) and react-pdf's `Page size`.
export const DEFAULT_RESUME_STYLE = {
  pageWidthMm: 210,
  pageHeightMm: 297,

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

  // Only padding controls the inset between the page edge and the resume content —
  // there is no separate "margin" concept inside the document itself. (A margin here
  // only ever made sense as breathing room in the app's own preview canvas, outside
  // the actual resume/PDF — it never needs to shift the resume's own content.)
  pagePaddingTop: 36,
  pagePaddingBottom: 36,
  pagePaddingLeft: 36,
  pagePaddingRight: 36,

  headingUppercase: true,
  headingDivider: true,
  dividerThickness: 0.8,

  // Values below are intentionally not exposed in the Custom Design panel — they are
  // still centralized here (instead of scattered as inline literals in the renderer)
  // so there is exactly one place that owns every visual value in the document.
  textColor: '#111111',
  mutedTextColor: '#333333',
  subtleTextColor: '#2f2f2f',
  dividerColor: '#444444',
  contactSizeRatio: 0.88,
  subtleSizeRatio: 0.92,
  dateSizeRatio: 0.9,
  entryHeaderGap: 6,
  bulletIndent: 10.5,
  headingLetterSpacing: 0.4,
};

const presetMap = new Map(RESUME_STYLE_PRESETS.map((preset) => [preset.id, preset]));
const getPresetOverrides = (presetId) => presetMap.get(presetId)?.overrides || {};
const normalizePresetId = (presetId) => (presetMap.has(presetId) ? presetId : 'classicAts');

const sanitizeNumeric = (value, fallback, min, max) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
};

const mapLegacyToCustom = (settings = {}) => {
  const global = settings.global || {};
  if (!Object.keys(global).length) return settings.custom || {};

  return {
    fontFamily: global.fontFamily,
    bodySize: global.baseFontSize,
    lineHeight: global.lineHeight,
    sectionSpacing: global.sectionGap,
    dividerThickness: global.dividerThickness,
    pagePaddingTop: global.pagePadding ?? global.pageMargin,
    pagePaddingBottom: global.pagePadding ?? global.pageMargin,
    pagePaddingLeft: global.pagePadding ?? global.pageMargin,
    pagePaddingRight: global.pagePadding ?? global.pageMargin,
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

// The list of keys the Custom Design panel is allowed to edit directly. Kept here so
// the "seed custom from the active preset" logic below always stays in sync with it.
const TUNABLE_KEYS = [
  'fontFamily', 'resumeNameSize', 'sectionHeadingSize', 'sectionHeadingWeight',
  'bodySize', 'bodyWeight', 'lineHeight', 'sectionSpacing', 'paragraphSpacing',
  'bulletSpacing', 'pagePaddingTop', 'pagePaddingBottom', 'pagePaddingLeft', 'pagePaddingRight',
  'headingUppercase', 'headingDivider', 'dividerThickness',
];

const getActiveBaseStyle = (normalized) => (
  normalized.presetId === 'custom'
    ? { ...DEFAULT_RESUME_STYLE, ...normalized.custom }
    : { ...DEFAULT_RESUME_STYLE, ...getPresetOverrides(normalized.presetId) }
);

export const getResumeStyle = (designSettings, fitSettings = {}) => {
  const normalized = normalizeDesignSettings(designSettings);
  const scale = {
    fontScale: fitSettings.fontScale || 1,
    lineHeightScale: fitSettings.lineHeightScale || 1,
    sectionGapScale: fitSettings.sectionGapScale || 1,
    marginScale: fitSettings.marginScale || 1,
    pagePaddingScale: fitSettings.pagePaddingScale || 1,
  };
  const baseStyle = getActiveBaseStyle(normalized);

  // `scaled` = raw points, consumed directly by the PDF renderer.
  const scaled = {
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
    dividerThickness: baseStyle.dividerThickness * scale.marginScale,
  };

  // `scaledWeb` = the exact same values converted pt -> px, so 1pt of "paper" is the
  // same physical size in the browser as it is in the exported PDF. This is what
  // keeps the live preview and the PDF from drifting apart pixel-for-pixel.
  const pxKeys = [
    'resumeNameSize', 'sectionHeadingSize', 'bodySize', 'sectionSpacing',
    'paragraphSpacing', 'bulletSpacing', 'pagePaddingTop', 'pagePaddingBottom',
    'pagePaddingLeft', 'pagePaddingRight', 'dividerThickness', 'entryHeaderGap', 'bulletIndent',
  ];
  const scaledWeb = { ...scaled };
  pxKeys.forEach((key) => {
    scaledWeb[key] = ptToPx(scaled[key]);
  });

  return {
    ...baseStyle,
    webFontFamily: getWebFontFamily(baseStyle.fontFamily),
    pdfFontFamily: getPdfFontFamily(baseStyle.fontFamily),
    pdfBoldFontFamily: getPdfBoldFontFamily(baseStyle.fontFamily),
    scaled,
    scaledWeb,
  };
};

export const updateDesignCustomField = (designSettings, field, value) => {
  const normalized = normalizeDesignSettings(designSettings);
  // Seed the new custom config from whatever style is CURRENTLY showing on screen
  // (the active preset merged with defaults), not from a possibly-stale/empty
  // `custom` bucket left over from before the preset was selected. Otherwise the
  // very first edit while a preset is active silently reverts every other field
  // back to the global defaults instead of preserving the preset's look.
  const activeBase = getActiveBaseStyle(normalized);
  const nextCustom = { ...normalized.custom };
  TUNABLE_KEYS.forEach((key) => {
    nextCustom[key] = activeBase[key];
  });
  nextCustom[field] = value;

  return {
    presetId: 'custom',
    custom: nextCustom,
  };
};

export const setDesignPreset = (designSettings, presetId) => {
  const normalized = normalizeDesignSettings(designSettings);
  return {
    ...normalized,
    presetId: normalizePresetId(presetId),
  };
};
