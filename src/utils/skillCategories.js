const createId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const normalizeSkillCategory = (category = {}) => ({
  id: category.id || createId('skill-cat'),
  name: (category.name || 'Skills').trim() || 'Skills',
  items: Array.isArray(category.items)
    ? category.items.map((item) => String(item || '').trim()).filter(Boolean)
    : [],
});

export const normalizeSkillCategories = (resumeLike = {}) => {
  const categories = Array.isArray(resumeLike.skillCategories)
    ? resumeLike.skillCategories.map(normalizeSkillCategory)
    : [];

  if (categories.length) return categories;

  const legacySkills = Array.isArray(resumeLike.skills) ? resumeLike.skills : [];
  const items = legacySkills.map((item) => String(item || '').trim()).filter(Boolean);
  if (!items.length) return [];

  return [{
    id: createId('skill-cat'),
    name: 'Skills',
    items,
  }];
};

export const flattenSkillCategories = (categories = []) =>
  categories.flatMap((category) => category.items || []);

export const createEmptySkillCategory = () => ({
  id: createId('skill-cat'),
  name: 'New Category',
  items: [],
});
