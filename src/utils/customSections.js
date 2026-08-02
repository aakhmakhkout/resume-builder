export const SUBSECTION_TYPES = [
  {
    id: 'titleSubtitleDateDescription',
    label: 'Title + Subtitle + Date + Description',
    fields: [
      { key: 'title', label: 'Title' },
      { key: 'subtitle', label: 'Subtitle' },
      { key: 'date', label: 'Date' },
      { key: 'description', label: 'Description', multiline: true, rows: 3 },
    ],
  },
  {
    id: 'organizationRoleDatesBullets',
    label: 'Organization + Role + Dates + Bullet Points',
    fields: [
      { key: 'organization', label: 'Organization' },
      { key: 'role', label: 'Role' },
      { key: 'startDate', label: 'Start Date' },
      { key: 'endDate', label: 'End Date' },
      { key: 'bulletPoints', label: 'Bullet Points (one per line)', multiline: true, rows: 4 },
    ],
  },
  {
    id: 'headingParagraph',
    label: 'Heading + Paragraph',
    fields: [
      { key: 'heading', label: 'Heading' },
      { key: 'paragraph', label: 'Paragraph', multiline: true, rows: 4 },
    ],
  },
  {
    id: 'titleLocationDateDescription',
    label: 'Title + Location + Date + Description',
    fields: [
      { key: 'title', label: 'Title' },
      { key: 'location', label: 'Location' },
      { key: 'date', label: 'Date' },
      { key: 'description', label: 'Description', multiline: true, rows: 3 },
    ],
  },
  {
    id: 'simpleBullets',
    label: 'Simple Bullet List',
    fields: [
      { key: 'bulletPoints', label: 'Bullets (one per line)', multiline: true, rows: 4 },
    ],
  },
  {
    id: 'headingMultiParagraphs',
    label: 'Heading + Multiple Paragraphs',
    fields: [
      { key: 'heading', label: 'Heading' },
      { key: 'paragraphs', label: 'Paragraphs (separate by blank lines)', multiline: true, rows: 6 },
    ],
  },
  {
    id: 'keyValuePairs',
    label: 'Key Value Pairs',
    fields: [
      { key: 'pairs', label: 'Pairs (Label: Value per line)', multiline: true, rows: 5 },
    ],
  },
  {
    id: 'richTextBlock',
    label: 'Custom Rich Text Block',
    fields: [
      { key: 'richText', label: 'Rich Text', multiline: true, rows: 6 },
    ],
  },
];

export const DEFAULT_SUBSECTION_TYPE = SUBSECTION_TYPES[0].id;

export const getSubsectionType = (typeId) =>
  SUBSECTION_TYPES.find((type) => type.id === typeId) || SUBSECTION_TYPES[0];

export const createEmptyCustomEntry = (typeId) => {
  const definition = getSubsectionType(typeId);
  const values = definition.fields.reduce((acc, field) => {
    acc[field.key] = '';
    return acc;
  }, {});
  return {
    id: `entry-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    collapsed: false,
    values,
  };
};
