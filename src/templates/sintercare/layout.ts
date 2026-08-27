import { join } from 'path';

/** Matches `EDITABLE.svg` (viewBox 300×150, display 400×200). */
export const SINTERCARE_VB = { w: 300, h: 150 } as const;

export const SINTERCARE_NAVY = '#08183a';
/** Same as top accent strip & bottom brand blue in `EDITABLE.svg` (`#5083b4` paths). */
export const SINTERCARE_ACCENT_BLUE = '#5083b4';
export const SINTERCARE_NAME_ON_STRIPE = '#ffffff';

/**
 * ViewBox (300×150) — title above mid `#4f83b2` rule (~y 92), **to the right of** that bar’s
 * right edge (~x 131); email beside icons; name on thick bottom `#5083b4` bar.
 */
export const SINTERCARE_TEXT = {
  /**
   * Title: band starts ~flush with `#4f83b2` bar right (~x 131); right-aligned in `maxWidthTitle`.
   */
  titleX: 130,
  titleY: 77,
  maxWidthTitle: 158,
  /** Email: same x as address/url glyphs (`matrix(1,0,0,1,156,72)` & `...,156,100)`); y on envelope row. */
  emailX: 156,
  emailY: 56,
  maxWidthEmail: 141,
  nameX: 101,
  nameY: 126,
  maxWidthName: 232,
} as const;

export function sintercarePx(
  displayW: number,
  displayH: number,
): {
  titleLeft: number;
  titleTop: number;
  emailLeft: number;
  emailTop: number;
  nameLeft: number;
  nameTop: number;
  maxWidthTitle: number;
  maxWidthEmail: number;
  maxWidthName: number;
  titleSize: number;
  emailSize: number;
  nameSize: number;
} {
  const sx = displayW / SINTERCARE_VB.w;
  const sy = displayH / SINTERCARE_VB.h;
  return {
    titleLeft: SINTERCARE_TEXT.titleX * sx,
    titleTop: SINTERCARE_TEXT.titleY * sy,
    emailLeft: SINTERCARE_TEXT.emailX * sx,
    emailTop: SINTERCARE_TEXT.emailY * sy,
    nameLeft: SINTERCARE_TEXT.nameX * sx,
    nameTop: SINTERCARE_TEXT.nameY * sy,
    maxWidthTitle: SINTERCARE_TEXT.maxWidthTitle * sx,
    maxWidthEmail: SINTERCARE_TEXT.maxWidthEmail * sx,
    maxWidthName: SINTERCARE_TEXT.maxWidthName * sx,
    titleSize: Math.max(14, 11.5 * sy),
    emailSize: Math.max(9, 6.8 * sy),
    nameSize: Math.max(13, 10.5 * sy),
  };
}

export function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function escapeHtml(s: string): string {
  return escapeXml(s);
}

export function sintercareEditableSvgPath(): string {
  return join(process.cwd(), 'src', 'templates', 'sintercare', 'EDITABLE.svg');
}
