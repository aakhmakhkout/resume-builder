export const moveItemInArray = (items, fromIndex, toIndex) => {
  if (!Array.isArray(items)) return items;
  if (fromIndex === toIndex) return items;
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length
  ) {
    return items;
  }

  const updated = [...items];
  const [moved] = updated.splice(fromIndex, 1);
  updated.splice(toIndex, 0, moved);
  return updated;
};
