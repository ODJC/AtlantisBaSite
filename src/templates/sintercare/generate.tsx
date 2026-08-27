import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import sharp from 'sharp';
import {
  SINTERCARE_ACCENT_BLUE,
  SINTERCARE_NAME_ON_STRIPE,
  SINTERCARE_NAVY,
  sintercareEditableSvgPath,
  sintercarePx,
} from './layout';

export interface SintercareTemplateData {
  name: string;
  title: string;
  email: string;
  requestUrl: string;
}

/** 2× native SVG display (400×200) for sharper PNG. */
const W = 800;
const H = 400;

export async function generateSintercareTemplate(data: SintercareTemplateData) {
  const layoutSvg = await readFile(sintercareEditableSvgPath(), 'utf8');
  const pngBuffer = await sharp(Buffer.from(layoutSvg, 'utf8'), { limitInputPixels: false })
    .resize(W, H)
    .png()
    .toBuffer();
  const bgUrl = `data:image/png;base64,${pngBuffer.toString('base64')}`;

  const px = sintercarePx(W, H);

  return new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          position: 'relative',
          display: 'flex',
          background: '#ffffff',
          fontFamily: 'Arial, Helvetica, sans-serif',
        }}
      >
        <img src={bgUrl} width={W} height={H} alt="" style={{ position: 'absolute', left: 0, top: 0 }} />
        <div
          style={{
            position: 'absolute',
            left: px.titleLeft,
            top: px.titleTop,
            width: px.maxWidthTitle,
            maxWidth: px.maxWidthTitle,
            fontSize: px.titleSize,
            fontWeight: 700,
            color: SINTERCARE_ACCENT_BLUE,
            lineHeight: 1.15,
            textAlign: 'right',
          }}
        >
          {data.title}
        </div>
        <div
          style={{
            position: 'absolute',
            left: px.emailLeft,
            top: px.emailTop,
            fontSize: px.emailSize,
            fontWeight: 600,
            color: SINTERCARE_NAVY,
            maxWidth: px.maxWidthEmail,
            lineHeight: 1.2,
          }}
        >
          {data.email}
        </div>
        <div
          style={{
            position: 'absolute',
            left: px.nameLeft,
            top: px.nameTop,
            fontSize: px.nameSize,
            fontWeight: 700,
            color: SINTERCARE_NAME_ON_STRIPE,
            maxWidth: px.maxWidthName,
            lineHeight: 1.1,
          }}
        >
          {data.name}
        </div>
      </div>
    ),
    { width: W, height: H },
  );
}
