import { Children } from 'react';

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
    // Group the heading with the first content item in a single non-wrapping block.
    // Without this, react-pdf is free to place the heading at the very bottom of a
    // page and push all of its content to the next one, leaving an orphaned heading.
    const items = Children.toArray(children);
    const [firstItem, ...restItems] = items;
    return (
      <View style={sectionStyle}>
        <View wrap={false}>
          <Text style={headingStyle}>{title}</Text>
          {firstItem}
        </View>
        {restItems}
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
