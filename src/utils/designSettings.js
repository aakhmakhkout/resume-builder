export const FONT_OPTIONS = [
  { value: 'times', label: 'Times New Roman' },
  { value: 'georgia', label: 'Georgia' },
  { value: 'helvetica', label: 'Helvetica / Arial' },
  { value: 'courier', label: 'Courier New' },
];

export const DEFAULT_GLOBAL_DESIGN = {
  pageMargin: 16,
  pagePadding: 36,
  fontFamily: 'times',
  baseFontSize: 12,
  lineHeight: 1.35,
  sectionGap: 12,
  dividerThickness: 0.8,
};

export const DEFAULT_SECTION_STYLE = {
  fontSize: 12,
  headingFontSize: 24,
  fontWeight: 500,
  textColor: '#111111',
  headingColor: '#111111',
  marginTop: 0,
  marginBottom: 0,
  paddingLeft: 0,
  paddingRight: 0,
  dividerVisible: true,
  dividerThickness: 0.8,
  dividerColor: '#444444',
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

export const normalizeDesignSettings = (settings = {}) => ({
  global: {
    ...DEFAULT_GLOBAL_DESIGN,
    ...(settings.global || {}),
  },
  sections: {
    ...(settings.sections || {}),
  },
});

export const getSectionStyle = (designSettings, sectionKey) => ({
  ...DEFAULT_SECTION_STYLE,
  ...(designSettings?.sections?.[sectionKey] || {}),
});
