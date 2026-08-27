'use client';

export interface OMAPreviewData {
  name: string;
  title: string;
  email: string;
  phone?: string;
}

export function OMAPreview({ name, title, email, phone }: OMAPreviewData) {
  return (
    <div style={{
      width: '600px',
      height: '200px',
      background: '#4f7cac',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Arial, Helvetica, sans-serif',
    }}>
      {/* Background Image */}
      <img
        src="/oma/Background_oma.png"
        alt="background"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '600px',
          height: '200px',
          objectFit: 'cover',
        }}
      />
      
      {/* Left white panel with diagonal edge */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '241.73px',
        height: '200px',
        background: '#f5f8fa',
        clipPath: 'polygon(0 0, 77.4% 0, 100% 50%, 77.4% 100%, 0 100%)',
      }} />
      
      {/* Divider lines */}
      <div style={{
        position: 'absolute',
        left: '40px',
        top: '65.69px',
        width: '176.91px',
        height: '0.56px',
        background: '#342d69',
      }} />
      <div style={{
        position: 'absolute',
        left: '40px',
        top: '138.47px',
        width: '176.91px',
        height: '0.56px',
        background: '#342d69',
      }} />
      
      {/* Icons */}
      <img
        src="/oma/noun-person-7956361.png"
        style={{
          position: 'absolute',
          left: '21.73px',
          top: '31.13px',
          width: '13.91px',
          height: '13.91px',
          filter: 'invert(46%) sepia(39%) saturate(722%) hue-rotate(177deg) brightness(92%) contrast(87%)',
        }}
      />
      
      <img
        src="/oma/noun-phone-5090644.png"
        style={{
          position: 'absolute',
          left: '21.73px',
          top: '79.06px',
          width: '13.91px',
          height: '13.91px',
          filter: 'invert(46%) sepia(39%) saturate(722%) hue-rotate(177deg) brightness(92%) contrast(87%)',
        }}
      />
      
      <img
        src="/oma/noun-email-7956355.png"
        style={{
          position: 'absolute',
          left: '21.73px',
          top: '96.25px',
          width: '13.91px',
          height: '13.91px',
          filter: 'invert(46%) sepia(39%) saturate(722%) hue-rotate(177deg) brightness(92%) contrast(87%)',
        }}
      />
      
      {phone && (
        <img
          src="/oma/noun-phone-7956365.png"
          style={{
            position: 'absolute',
            left: '21.73px',
            top: '113.44px',
            width: '13.91px',
            height: '13.91px',
            filter: 'invert(46%) sepia(39%) saturate(722%) hue-rotate(177deg) brightness(92%) contrast(87%)',
          }}
        />
      )}
      
      <img
        src="/oma/noun-location-7956358.png"
        style={{
          position: 'absolute',
          left: '21.73px',
          top: phone ? '155.82px' : '142px',
          width: '13.91px',
          height: '13.91px',
          filter: 'invert(46%) sepia(39%) saturate(722%) hue-rotate(177deg) brightness(92%) contrast(87%)',
        }}
      />
      
      {/* Text Content */}
      <div style={{
        position: 'absolute',
        left: '40px',
        top: '34px',
        fontSize: '10px',
        fontWeight: 'bold',
        color: '#342d69',
        maxWidth: '150px',
        lineHeight: 1.2,
      }}>
        {name}
      </div>
      
      <div style={{
        position: 'absolute',
        left: '40px',
        top: '48px',
        fontSize: '9px',
        color: '#342d69',
        maxWidth: '150px',
      }}>
        {title}
      </div>
      
      <div style={{
        position: 'absolute',
        left: '40px',
        top: '82px',
        fontSize: '8px',
        color: '#342d69',
      }}>
        +52 55 0000 0000
      </div>
      
      <div style={{
        position: 'absolute',
        left: '40px',
        top: '99px',
        fontSize: '8px',
        color: '#342d69',
        maxWidth: '150px',
      }}>
        {email}
      </div>
      
      {phone && (
        <div style={{
          position: 'absolute',
          left: '40px',
          top: '116px',
          fontSize: '8px',
          color: '#342d69',
        }}>
          Móvil: {phone}
        </div>
      )}
      
      <div style={{
        position: 'absolute',
        left: '40px',
        top: phone ? '158px' : '145px',
        fontSize: '8px',
        color: '#342d69',
        maxWidth: '150px',
        lineHeight: 1.3,
      }}>
        Av. Ingenieros Militares 76, San Lorenzo Tlaltenango, Miguel Hidalgo, 11210 Ciudad de México, CDMX
      </div>
      
      <div style={{
        position: 'absolute',
        left: '390px',
        top: '165px',
        fontSize: '14px',
        color: '#f5f8fa',
        letterSpacing: '1px',
      }}>
        <span style={{ fontWeight: 'bold' }}>EXPERIENCIA</span> QUE UNE,
      </div>
      
      <div style={{
        position: 'absolute',
        left: '360px',
        top: '180px',
        fontSize: '14px',
        color: '#f5f8fa',
        letterSpacing: '1px',
      }}>
        CONFIANZA QUE <span style={{ fontWeight: 'bold' }}>TRASCIENDE.</span>
      </div>
    </div>
  );
}

