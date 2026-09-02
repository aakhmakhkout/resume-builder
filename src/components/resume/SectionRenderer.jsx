export default function SectionRenderer({
  target,
  title,
  headingStyle,
  sectionStyle,
  children,
  pdfPrimitives,
}) {
  if (target === 'pdf') {
    const { Text, View } = pdfPrimitives;
    return (
      <View style={sectionStyle}>
        <Text style={headingStyle} minPresenceAhead={26}>{title}</Text>
        {children}
      </View>
    );
  }

  return (
    <section className="resume-section-v2" style={sectionStyle}>
      <h3 className="resume-section-title-v2" style={headingStyle}>{title}</h3>
      {children}
    </section>
  );
}
