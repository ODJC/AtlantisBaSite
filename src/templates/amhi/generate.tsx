import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import { join } from 'path';

export interface AMHITemplateData {
  name: string;
  title: string;
  email: string;
  phone?: string;
  requestUrl: string;
}

export async function generateAMHITemplate(data: AMHITemplateData) {
  // Load images from file system and convert to data URIs for reliability
  const imageBasePath = join(process.cwd(), 'public', 'amhi');
  
  const backgroundPath = join(imageBasePath, 'background.png');
  const phoneIconPath = join(imageBasePath, 'phone.png');
  const emailIconPath = join(imageBasePath, 'mail.png');
  const addressIconPath = join(imageBasePath, 'address.png');
  const urlIconPath = join(imageBasePath, 'url.png');
  
  // Read images as buffers and convert to base64 data URIs
  const [backgroundData, phoneIconData, emailIconData, addressIconData, urlIconData] = await Promise.all([
    readFile(backgroundPath),
    readFile(phoneIconPath),
    readFile(emailIconPath),
    readFile(addressIconPath),
    readFile(urlIconPath),
  ]);
  
  const backgroundUrl = `data:image/png;base64,${backgroundData.toString('base64')}`;
  const phoneIconUrl = `data:image/png;base64,${phoneIconData.toString('base64')}`;
  const emailIconUrl = `data:image/png;base64,${emailIconData.toString('base64')}`;
  const addressIconUrl = `data:image/png;base64,${addressIconData.toString('base64')}`;
  const urlIconUrl = `data:image/png;base64,${urlIconData.toString('base64')}`;
  
  // Load Exo2 Regular font
  const exo2FontPath = join(process.cwd(), 'public', 'amhi', 'Exo2-Regular.otf');
  const exo2FontData = await readFile(exo2FontPath);
  
  // Load Exo2 Bold font
  const exo2BoldFontPath = join(process.cwd(), 'public', 'amhi', 'Exo2-Bold.otf');
  const exo2BoldFontData = await readFile(exo2BoldFontPath);
  
  // Load ARBORIA Black font
  const arboriaFontPath = join(process.cwd(), 'public', 'amhi', 'fonnts.com-Arboria_Black.otf');
  const arboriaFontData = await readFile(arboriaFontPath);
  
  // Split name into first name and last name
  const nameParts = data.name.trim().split(/\s+/);
  const firstName = nameParts.slice(0, -1).join(' ').toUpperCase();
  const lastName = nameParts[nameParts.length - 1] || '';
  const lastNameUpper = lastName.toUpperCase();
  
  return new ImageResponse(
    (
      <div
        style={{
          width: 4800,
          height: 1600,
          position: 'relative',
          display: 'flex',
        }}
      >
        <img src={backgroundUrl} width={4800} height={1600} />
        
        {/* Contact Information - positioned left of center */}
        <div style={{ position: 'absolute', left: '50%', top: 120, display: 'flex', flexDirection: 'column', gap: 64, fontFamily: 'Exo2' }}>
          {/* Name */}
          <div style={{ fontSize: 168, fontFamily: 'ARBORIA', fontWeight: 900, marginBottom: -60, display: 'flex', gap: 32 }}>
            <span style={{ color: '#334035' }}>{firstName}</span>
            <span style={{ color: '#008890' }}>{lastNameUpper}</span>
          </div>
          
          {/* Position */}
          <div style={{ fontSize: 96, color: '#2e3e3c', marginBottom: 80, fontFamily: 'Exo2', fontWeight: 400 }}>
            {data.title}
          </div>
          
          {/* Blue thick rounded line divider */}
          <div style={{ width: 1200, height: 16, background: '#008890', borderRadius: 8, marginBottom: 80 }} />
          
          {/* Phone with icon */}
          {data.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 40, fontSize: 72, color: '#2e3e3c', fontFamily: 'Exo2', fontWeight: 400, marginBottom: 20 }}>
              <img src={phoneIconUrl} width={96} height={80} style={{ flexShrink: 0, marginTop: 12 }} />
              <div>{data.phone}</div>
            </div>
          )}
          
          {/* Email with icon */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 40, fontSize: 72, color: '#2e3e3c', fontFamily: 'Exo2', fontWeight: 400, marginBottom: 20 }}>
            <img src={emailIconUrl} width={96} height={80} style={{ flexShrink: 0, marginTop: 12 }} />
            <div>{data.email}</div>
          </div>
          
          {/* Address with icon */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 40, fontSize: 72, color: '#2e3e3c', maxWidth: 2000, lineHeight: 1.3, marginBottom: 20, fontFamily: 'Exo2', fontWeight: 400 }}>
            <img src={addressIconUrl} width={96} height={80} style={{ flexShrink: 0, marginTop: 20 }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div>Av. Ingenieros Militares 76, San Lorenzo Tlaltenango,</div>
              <div> Miguel Hidalgo, 11210 Ciudad de México, CDMX</div>
            </div>
          </div>
          
          {/* URL with icon */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 40, fontSize: 112, color: '#008890', fontFamily: 'Exo2Bold', marginBottom: 20 }}>
            <img src={urlIconUrl} width={96} height={80} style={{ flexShrink: 0, marginTop: 16 }} />
            <div>amhi.mx</div>
          </div>
        </div>
      </div>
    ),
    {
      width: 4800,
      height: 1600,
      fonts: [
        {
          name: 'Exo2',
          data: exo2FontData,
          style: 'normal',
          weight: 400,
        },
        {
          name: 'Exo2Bold',
          data: exo2BoldFontData,
          style: 'normal',
          weight: 700,
        },
        {
          name: 'ARBORIA',
          data: arboriaFontData,
          style: 'normal',
          weight: 900,
        },
      ],
    },
  );
}

