import { ImageResponse } from 'next/og';

export interface OMATemplateData {
  name: string;
  title: string;
  email: string;
  phone?: string;
  requestUrl: string;
}

export function generateOMATemplate(data: OMATemplateData) {
  const baseUrl = new URL(data.requestUrl);
  const origin = `${baseUrl.protocol}//${baseUrl.host}`;
  
  const backgroundUrl = `${origin}/oma/Background_oma.png`;
  const personIcon = `${origin}/oma/noun-person-7956361.png`;
  const emailIcon = `${origin}/oma/noun-email-7956355.png`;
  const phoneIcon = `${origin}/oma/noun-phone-7956365.png`;
  const phoneIcon2 = `${origin}/oma/noun-phone-5090644.png`;
  const locationIcon = `${origin}/oma/noun-location-7956358.png`;
  
  // Process phone value - ensure it's a valid non-empty string
  const phoneValue = data.phone ? String(data.phone).trim() : '';
  const hasPhone = phoneValue.length > 0;
  
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 400,
          background: '#4f7cac',
          position: 'relative',
          display: 'flex',
        }}
      >
        <img src={backgroundUrl} width={1200} height={400} />
        
        <svg width="500" height="400" style={{ position: 'absolute', left: 0, top: 0 }}>
          <polygon points="0,0 850,0 1000,200 850,400 0,400" fill="#f5f8fa" />
        </svg>
        
        <img src={personIcon} width={27.82} height={27.82} style={{ position: 'absolute', left: 33.46, top: 65, filter: 'invert(46%) sepia(39%) saturate(722%) hue-rotate(177deg) brightness(92%) contrast(87%)' }} />
        <div style={{ position: 'absolute', left: 70, top: 60, fontSize: 24, fontWeight: 900, color: '#342d69' }}>
          {data.name}
        </div>
        
        <div style={{ position: 'absolute', left: 70, top: 88, fontSize: 20, color: '#342d69' }}>
          {data.title}
        </div>
        <div style={{ position: 'absolute', left: 70, top: 123.38, width: 353.82, height: 1.12, background: '#342d69' }} />

        {hasPhone && (
          <img src={phoneIcon2} width={27.82} height={27.82} style={{ position: 'absolute', left: 33.46, top: 164, filter: 'invert(46%) sepia(39%) saturate(722%) hue-rotate(177deg) brightness(92%) contrast(87%)' }} />
        )}
        {hasPhone && (
          <div style={{ position: 'absolute', left: 70, top: 164, fontSize: 16, color: '#342d69', whiteSpace: 'nowrap' }}>
            {phoneValue}
          </div>
        )}
        
        <img src={emailIcon} width={27.82} height={27.82} style={{ position: 'absolute', left: 33.46, top: hasPhone ? 198 : 164, filter: 'invert(46%) sepia(39%) saturate(722%) hue-rotate(177deg) brightness(92%) contrast(87%)' }} />
        <div style={{ position: 'absolute', left: 70, top: hasPhone ? 198 : 164, fontSize: 16, color: '#342d69' }}>
          {data.email}
        </div>
        
        <img src={phoneIcon} width={27.82} height={27.82} style={{ position: 'absolute', left: 33.46, top: hasPhone ? 232 : 198, filter: 'invert(46%) sepia(39%) saturate(722%) hue-rotate(177deg) brightness(92%) contrast(87%)' }} />
        <div style={{ position: 'absolute', left: 70, top: hasPhone ? 232 : 198, fontSize: 16, color: '#342d69' }}>
          +52 55 5444 2850
        </div>
        <div style={{ position: 'absolute', left: 70, top: hasPhone ? 276.94 : 242.94, width: 353.82, height: 1.12, background: '#342d69' }} />
        <img src={locationIcon} width={27.82} height={27.82} style={{ position: 'absolute', left: 33.46, top: hasPhone ? 316 : 282, filter: 'invert(46%) sepia(39%) saturate(722%) hue-rotate(177deg) brightness(92%) contrast(87%)' }} />
        <div style={{ position: 'absolute', left: 70, top: hasPhone ? 316 : 282, fontSize: 16, color: '#342d69', maxWidth: 320, lineHeight: 1.3 }}>
          Av. Ingenieros Militares 76, San Lorenzo Tlaltenango, Miguel Hidalgo, 11210 Ciudad de México, CDMX
        </div>
        
        <div style={{ position: 'absolute', left: 780, top: 330, fontSize: 28, color: '#f5f8fa', display: 'flex', letterSpacing: 2 }}>
          <span style={{ fontWeight: 900 }}>EXPERIENCIA</span>
          <span style={{ fontWeight: 400, marginLeft: 12 }}>QUE UNE,</span>
        </div>
        
        <div style={{ position: 'absolute', left: 720, top: 365, fontSize: 28, color: '#f5f8fa', display: 'flex', letterSpacing: 2 }}>
          <span style={{ fontWeight: 900 }}>CONFIANZA</span>
          <span style={{ fontWeight: 400, marginLeft: 12 }}>QUE TRASCIENDE</span>
        </div>
      </div>
    ),
    { width: 1200, height: 400 },
  );
}

