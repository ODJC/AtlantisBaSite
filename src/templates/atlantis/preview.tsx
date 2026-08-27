'use client';

export interface AtlantisPreviewData {
  name: string;
  title: string;
  email: string;
  phone?: string;
}

const ACCENT_BLUE = '#0020D1';
const TEXT_NAVY = '#001040';

export function AtlantisPreview({ name, title, email, phone }: AtlantisPreviewData) {
  const phoneValue = phone ? String(phone).trim() : '';
  const hasPhone = phoneValue.length > 0;

  return (
    <div
      style={{
        width: '500px',
        height: '150px',
        position: 'relative',
        fontFamily: 'Arial, Helvetica, sans-serif',
        overflow: 'hidden',
      }}
    >
      <img
        src="/atlantis/background.png"
        alt=""
        width={1000}
        height={300}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '500px',
          height: '150px',
          display: 'block',
          objectFit: 'fill',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '38px',
          top: '24px',
          fontSize: '25px',
          fontWeight: 700,
          color: ACCENT_BLUE,
          maxWidth: '268px',
          lineHeight: 1.1,
        }}
      >
        {name}
      </div>
      <div
        style={{
          position: 'absolute',
          left: '38px',
          top: '52px',
          fontSize: '12px',
          fontWeight: 700,
          color: TEXT_NAVY,
          maxWidth: '250px',
          lineHeight: 1.2,
        }}
      >
        {title}
      </div>
      <div
        style={{
          position: 'absolute',
          left: '38px',
          top: hasPhone ? '77px' : '79px',
          fontSize: '8px',
          fontWeight: 700,
          color: ACCENT_BLUE,
          maxWidth: '240px',
          lineHeight: 1.2,
        }}
      >
        {email}
      </div>
      {hasPhone && (
        <div
          style={{
            position: 'absolute',
            left: '38px',
            top: '88px',
            fontSize: '8px',
            fontWeight: 700,
            color: ACCENT_BLUE,
            maxWidth: '240px',
            lineHeight: 1.2,
          }}
        >
          {phoneValue}
        </div>
      )}
      <div
        style={{
          position: 'absolute',
          left: '38px',
          top: hasPhone ? '102px' : '98px',
          fontSize: '8px',
          fontWeight: 600,
          color: ACCENT_BLUE,
          maxWidth: '235px',
          lineHeight: 1.25,
        }}
      >
        Av. Ing. Militares 76, San Lorenzo Tlaltenango, Miguel Hidalgo, CDMX
      </div>
    </div>
  );
}
