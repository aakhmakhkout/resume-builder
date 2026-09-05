// All icons share one outer badge viewBox so a single `size` prop scales
// everything proportionally — this is what makes them track the "Body/Content
// size" setting in the Custom Design panel (contact icon size = bodySize *
// contactSizeRatio, computed in ResumeRenderer), instead of being a fixed image.
const BADGE_VIEWBOX = 16;
const BADGE_RADIUS = 3.2;

// Simple geometric glyphs for phone/email/location, built only from basic shapes
// (rect/circle/path with straight lines) — no icon font, no network fetch.
const VECTOR_ICONS = {
  phone: {
    shapes: [{ type: 'rect', x: 3, y: 0.5, width: 4, height: 9, rx: 1 }],
  },
  email: {
    shapes: [
      { type: 'rect', x: 0.5, y: 1.5, width: 9, height: 6, rx: 0.6, outline: true },
      { type: 'path', d: 'M1 2.3 L5 5.6 L9 2.3', outline: true },
    ],
  },
  location: {
    shapes: [
      { type: 'circle', cx: 5, cy: 3.6, r: 2.4 },
      { type: 'path', d: 'M2.8 4.6 L5 9.3 L7.2 4.6 Z' },
    ],
  },
};

// GitHub's official "mark-github" glyph from their own Octicons library (MIT
// licensed, published by GitHub specifically as a reusable icon) — rendered on a
// dark badge I control. Verified by actually rasterizing this exact path before
// shipping it, rather than trusting memory alone.
const GITHUB_PATH = 'M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 '
  + '0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13 '
  + '-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66 '
  + '.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15 '
  + '-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 '
  + '1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 '
  + '0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 '
  + '0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z';

const GITHUB_ICON = { background: '#171515', path: GITHUB_PATH };

// LinkedIn's "in" mark built from plain geometry (circle + rects) rather than a
// memorized brand path — verified by rasterizing it before shipping. Coordinates
// are in a 24-unit box: a dot+stem for "i", and a left-leg/bridge/right-leg
// bracket for "n" (bridge sits near the top, right leg shorter, like a real n).
const LINKEDIN_ICON = {
  background: '#0A66C2',
  viewBox: 24,
  shapes: [
    { type: 'circle', cx: 4.3, cy: 4.3, r: 2.1 },
    { type: 'rect', x: 2.6, y: 9.2, width: 3.4, height: 12.2 },
    { type: 'rect', x: 9.2, y: 9.2, width: 3.4, height: 12.2 },
    { type: 'rect', x: 9.2, y: 9.2, width: 12.2, height: 3.4 },
    { type: 'rect', x: 18, y: 12.6, width: 3.4, height: 8.8 },
  ],
};

export default function ContactIcon({ type, size = 8, color = '#333333', badgeColor, target, pdfPrimitives }) {
  if (type === 'github') {
    if (target === 'pdf') {
      const { Svg, Rect, Path, G } = pdfPrimitives;
      const scale = BADGE_VIEWBOX / 16;
      return (
        <Svg width={size} height={size} viewBox={`0 0 ${BADGE_VIEWBOX} ${BADGE_VIEWBOX}`}>
          <Rect x={0} y={0} width={BADGE_VIEWBOX} height={BADGE_VIEWBOX} rx={BADGE_RADIUS} fill={GITHUB_ICON.background} />
          <G transform={`scale(${scale})`}>
            <Path d={GITHUB_ICON.path} fill="#ffffff" />
          </G>
        </Svg>
      );
    }
    return (
      <svg width={size} height={size} viewBox={`0 0 ${BADGE_VIEWBOX} ${BADGE_VIEWBOX}`} aria-hidden="true" focusable="false">
        <rect x={0} y={0} width={BADGE_VIEWBOX} height={BADGE_VIEWBOX} rx={BADGE_RADIUS} fill={GITHUB_ICON.background} />
        <path d={GITHUB_ICON.path} fill="#ffffff" />
      </svg>
    );
  }

  if (type === 'linkedin') {
    const vb = LINKEDIN_ICON.viewBox;
    const renderShapes = (Rect, Circle) => LINKEDIN_ICON.shapes.map((shape, i) => (
      shape.type === 'circle'
        ? <Circle key={i} cx={shape.cx} cy={shape.cy} r={shape.r} fill="#ffffff" />
        : <Rect key={i} x={shape.x} y={shape.y} width={shape.width} height={shape.height} fill="#ffffff" />
    ));
    if (target === 'pdf') {
      const { Svg, Rect, Circle } = pdfPrimitives;
      return (
        <Svg width={size} height={size} viewBox={`0 0 ${vb} ${vb}`}>
          <Rect x={0} y={0} width={vb} height={vb} rx={vb * 0.2} fill={LINKEDIN_ICON.background} />
          {renderShapes(Rect, Circle)}
        </Svg>
      );
    }
    return (
      <svg width={size} height={size} viewBox={`0 0 ${vb} ${vb}`} aria-hidden="true" focusable="false">
        <rect x={0} y={0} width={vb} height={vb} rx={vb * 0.2} fill={LINKEDIN_ICON.background} />
        {LINKEDIN_ICON.shapes.map((shape, i) => (
          shape.type === 'circle'
            ? <circle key={i} cx={shape.cx} cy={shape.cy} r={shape.r} fill="#ffffff" />
            : <rect key={i} x={shape.x} y={shape.y} width={shape.width} height={shape.height} fill="#ffffff" />
        ))}
      </svg>
    );
  }

  const icon = VECTOR_ICONS[type];
  if (!icon) return null;
  const iconColor = badgeColor ? '#ffffff' : color;

  if (target === 'pdf') {
    const { Svg, Rect, Circle, Path } = pdfPrimitives;
    return (
      <Svg width={size} height={size} viewBox="0 0 10 10">
        {badgeColor ? <Rect x={0} y={0} width={10} height={10} rx={2.4} fill={badgeColor} /> : null}
        {icon.shapes.map((shape, i) => {
          const strokeProps = shape.outline
            ? { fill: 'none', stroke: iconColor, strokeWidth: 0.9 }
            : { fill: iconColor };
          if (shape.type === 'rect') {
            return <Rect key={i} x={shape.x} y={shape.y} width={shape.width} height={shape.height} rx={shape.rx} {...strokeProps} />;
          }
          if (shape.type === 'circle') {
            return <Circle key={i} cx={shape.cx} cy={shape.cy} r={shape.r} {...strokeProps} />;
          }
          if (shape.type === 'path') {
            return <Path key={i} d={shape.d} strokeLinecap="round" strokeLinejoin="round" {...strokeProps} />;
          }
          return null;
        })}
      </Svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 10 10" aria-hidden="true" focusable="false">
      {badgeColor ? <rect x={0} y={0} width={10} height={10} rx={2.4} fill={badgeColor} /> : null}
      {icon.shapes.map((shape, i) => {
        const strokeProps = shape.outline
          ? { fill: 'none', stroke: iconColor, strokeWidth: 0.9 }
          : { fill: iconColor };
        if (shape.type === 'rect') {
          return <rect key={i} x={shape.x} y={shape.y} width={shape.width} height={shape.height} rx={shape.rx} {...strokeProps} />;
        }
        if (shape.type === 'circle') {
          return <circle key={i} cx={shape.cx} cy={shape.cy} r={shape.r} {...strokeProps} />;
        }
        if (shape.type === 'path') {
          return <path key={i} d={shape.d} strokeLinecap="round" strokeLinejoin="round" {...strokeProps} />;
        }
        return null;
      })}
    </svg>
  );
}
