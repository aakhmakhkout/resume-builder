export default function SkillCategoryRenderer({
  target,
  categoryName,
  items,
  style,
  pdfBoldStyle,
  pdfPrimitives,
}) {
  const joined = items.join(', ');

  if (target === 'pdf') {
    const { Text } = pdfPrimitives;
    return (
      <Text style={style}>
        <Text style={pdfBoldStyle}>{categoryName}: </Text>
        {joined}
      </Text>
    );
  }

  return (
    <p className="resume-indent-v2" style={style}>
      <strong>{categoryName}:</strong> {joined}
    </p>
  );
}
