import {
  SINTERCARE_ACCENT_BLUE,
  SINTERCARE_NAME_ON_STRIPE,
  SINTERCARE_NAVY,
  escapeHtml,
  sintercarePx,
} from './layout';

export interface SintercareTemplateConfig {
  name: string;
  width: number;
  height: number;
}

export const sintercareTemplate: SintercareTemplateConfig = {
  name: 'Sintercare',
  width: 400,
  height: 200,
};

const DW = 400;
const DH = 200;

export function generateSintercareSignature(data: {
  name: string;
  title: string;
  email: string;
}) {
  const px = sintercarePx(DW, DH);

  const name = escapeHtml(data.name || 'Name');
  const title = escapeHtml(data.title || 'Title');
  const email = escapeHtml(data.email || 'email@example.com');

  return `
    <div style="width: ${DW}px; height: ${DH}px; position: relative; font-family: Arial, Helvetica, sans-serif; overflow: hidden;">
      <img src="sintercare/design.svg" alt="" width="${DW}" height="${DH}" style="display: block; position: absolute; left: 0; top: 0; width: ${DW}px; height: ${DH}px;" />
      <div style="position: absolute; left: ${px.titleLeft}px; top: ${px.titleTop}px; width: ${px.maxWidthTitle}px; max-width: ${px.maxWidthTitle}px; font-size: ${px.titleSize}px; font-weight: 700; color: ${SINTERCARE_ACCENT_BLUE}; line-height: 1.15; text-align: right;">${title}</div>
      <div style="position: absolute; left: ${px.emailLeft}px; top: ${px.emailTop}px; font-size: ${px.emailSize}px; font-weight: 600; color: ${SINTERCARE_NAVY}; max-width: ${px.maxWidthEmail}px; line-height: 1.2;">${email}</div>
      <div style="position: absolute; left: ${px.nameLeft}px; top: ${px.nameTop}px; font-size: ${px.nameSize}px; font-weight: 700; color: ${SINTERCARE_NAME_ON_STRIPE}; max-width: ${px.maxWidthName}px; line-height: 1.1;">${name}</div>
    </div>
  `;
}
