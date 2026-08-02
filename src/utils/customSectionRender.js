const splitLines = (value = '') =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

const splitParagraphs = (value = '') =>
  value
    .split(/\n\s*\n/g)
    .map((line) => line.trim())
    .filter(Boolean);

const parseKeyValues = (value = '') =>
  splitLines(value).map((line) => {
    const [label, ...rest] = line.split(':');
    if (!rest.length) return { label: '', value: line };
    return {
      label: label.trim(),
      value: rest.join(':').trim(),
    };
  });

export const toCustomEntryModel = (typeId, values = {}) => {
  if (typeId === 'organizationRoleDatesBullets') {
    const date = [values.startDate, values.endDate].filter(Boolean).join(' – ');
    return {
      title: values.organization,
      subtitle: values.role,
      date,
      bullets: splitLines(values.bulletPoints),
      paragraphs: [],
      keyValues: [],
    };
  }

  if (typeId === 'headingParagraph') {
    return {
      title: values.heading,
      subtitle: '',
      date: '',
      bullets: [],
      paragraphs: values.paragraph ? [values.paragraph] : [],
      keyValues: [],
    };
  }

  if (typeId === 'titleLocationDateDescription') {
    return {
      title: values.title,
      subtitle: values.location,
      date: values.date,
      bullets: splitLines(values.description),
      paragraphs: [],
      keyValues: [],
    };
  }

  if (typeId === 'simpleBullets') {
    return {
      title: '',
      subtitle: '',
      date: '',
      bullets: splitLines(values.bulletPoints),
      paragraphs: [],
      keyValues: [],
    };
  }

  if (typeId === 'headingMultiParagraphs') {
    return {
      title: values.heading,
      subtitle: '',
      date: '',
      bullets: [],
      paragraphs: splitParagraphs(values.paragraphs),
      keyValues: [],
    };
  }

  if (typeId === 'keyValuePairs') {
    return {
      title: '',
      subtitle: '',
      date: '',
      bullets: [],
      paragraphs: [],
      keyValues: parseKeyValues(values.pairs),
    };
  }

  if (typeId === 'richTextBlock') {
    return {
      title: '',
      subtitle: '',
      date: '',
      bullets: [],
      paragraphs: splitParagraphs(values.richText),
      keyValues: [],
    };
  }

  return {
    title: values.title,
    subtitle: values.subtitle,
    date: values.date,
    bullets: splitLines(values.description),
    paragraphs: [],
    keyValues: [],
  };
};
