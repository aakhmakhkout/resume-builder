import { Font } from '@react-pdf/renderer';

let registered = false;

// The PDF renderer uses react-pdf's built-in standard 14 fonts (see designSettings.js
// FONT_ASSETS) — these require zero network fetch, so PDF generation can never fail
// because a font failed to load. The only thing we configure here is disabling
// react-pdf's default word hyphenation, since the browser doesn't hyphenate the
// preview either (no `hyphens: auto` in the web CSS) — leaving it on would make the
// PDF wrap long words differently than the live preview even with matching fonts.
export function ensurePdfFontsRegistered() {
  if (registered) return;
  registered = true;
  Font.registerHyphenationCallback((word) => [word]);
}
