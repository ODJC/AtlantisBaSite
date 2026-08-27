import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import { join } from 'path';

export interface AtlantisTemplateData {
  name: string;
  title: string;
  email: string;
  phone?: string;
  requestUrl: string;
}

const ACCENT_BLUE = '#0020D1';
const TEXT_NAVY = '#001040';

/** 2× logical layout (1000×300) for sharper PNG output; preview/HTML stay 500×150 display. */
const W = 1000;
const H = 300;

export async function generateAtlantisTemplate(data: AtlantisTemplateData) {
  const imageBasePath = join(process.cwd(), 'public', 'atlantis');
  const backgroundData = await readFile(join(imageBasePath, 'background.png'));
  const backgroundUrl = `data:image/png;base64,${backgroundData.toString('base64')}`;

  const phoneValue = data.phone ? String(data.phone).trim() : '';
  const hasPhone = phoneValue.length > 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          position: 'relative',
          display: 'flex',
          fontFamily: 'Arial, Helvetica, sans-serif',
        }}
      >
        <img src={backgroundUrl} width={W} height={H} alt="" />
        <div
          style={{
            position: 'absolute',
            left: 76,
            top: 48,
            fontSize: 50,
            fontWeight: 700,
            color: ACCENT_BLUE,
            maxWidth: 536,
            lineHeight: 1.1,
          }}
        >
          {data.name}
        </div>
        <div
          style={{
            position: 'absolute',
            left: 76,
            top: 104,
            fontSize: 24,
            fontWeight: 700,
            color: TEXT_NAVY,
            maxWidth: 500,
            lineHeight: 1.2,
          }}
        >
          {data.title}
        </div>
        <div
          style={{
            position: 'absolute',
            left: 76,
            top: hasPhone ? 154 : 158,
            fontSize: 16,
            fontWeight: 700,
            color: ACCENT_BLUE,
            maxWidth: 480,
            lineHeight: 1.2,
          }}
        >
          {data.email}
        </div>
        {hasPhone && (
          <div
            style={{
              position: 'absolute',
              left: 76,
              top: 176,
              fontSize: 16,
              fontWeight: 700,
              color: ACCENT_BLUE,
              maxWidth: 480,
              lineHeight: 1.2,
            }}
          >
            {phoneValue}
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            left: 76,
            top: hasPhone ? 204 : 196,
            fontSize: 16,
            fontWeight: 600,
            color: ACCENT_BLUE,
            maxWidth: 470,
            lineHeight: 1.25,
          }}
        >
          Av. Ing. Militares 76, San Lorenzo Tlaltenango, Miguel Hidalgo, CDMX
        </div>
      </div>
    ),
    { width: W, height: H },
  );
}
