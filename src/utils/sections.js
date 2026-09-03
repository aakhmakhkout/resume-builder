export const BUILTIN_SECTIONS = [
  { key: 'summary', label: 'Professional Summary' },
  { key: 'workExperience', label: 'Work Experience' },
  { key: 'education', label: 'Education' },
  { key: 'skills', label: 'Skills' },
  { key: 'projects', label: 'Projects' },
  { key: 'certifications', label: 'Certifications' },
  { key: 'languages', label: 'Languages' },
];

export const BUILTIN_SECTION_KEYS = BUILTIN_SECTIONS.map((section) => section.key);

export const toCustomSectionKey = (sectionId) => `custom:${sectionId}`;
export const isCustomSectionKey = (sectionKey) => sectionKey.startsWith('custom:');
export const fromCustomSectionKey = (sectionKey) => sectionKey.replace(/^custom:/, '');

export const resolveSectionLabel = (sectionKey, customSections = []) => {
  const builtin = BUILTIN_SECTIONS.find((section) => section.key === sectionKey);
  if (builtin) return builtin.label;
  if (!isCustomSectionKey(sectionKey)) return sectionKey;
  const customId = fromCustomSectionKey(sectionKey);
  const customSection = customSections.find((section) => section.id === customId);
  return customSection?.name || 'Custom Section';
};
