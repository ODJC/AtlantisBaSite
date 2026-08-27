'use client';

export interface AMHIPreviewData {
  name: string;
  title: string;
  email: string;
  phone?: string;
}

export function AMHIPreview({ name, title, email, phone }: AMHIPreviewData) {
  // Split name into first name and last name
  const nameParts = name.trim().split(/\s+/);
  const firstName = nameParts.slice(0, -1).join(' ').toUpperCase();
  const lastName = nameParts[nameParts.length - 1] || '';
  const lastNameUpper = lastName.toUpperCase();
  
  return (
    <>
      <style>{`
        @font-face {
          font-family: 'Exo2';
          src: url('/amhi/Exo2-Regular.otf') format('opentype');
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: 'Exo2Bold';
          src: url('/amhi/Exo2-Bold.otf') format('opentype');
          font-weight: 700;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: 'ARBORIA';
          src: url('/amhi/fonnts.com-Arboria_Black.otf') format('opentype');
          font-weight: 900;
          font-style: normal;
          font-display: swap;
        }
      `}</style>
      <div style={{
        position: 'relative',
        display: 'inline-block',
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}>
      {/* Background Image */}
      <img
        src="/amhi/background.png"
        alt="background"
        style={{
          display: 'block',
          width: '1200px',
          height: '400px',
          maxWidth: '100%',
        }}
      />
      
      {/* Contact Information - positioned left of center */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '30px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        fontFamily: 'Exo2, sans-serif',
      }}>
        {/* Name */}
        <div style={{
          fontSize: '42px',
          fontFamily: 'ARBORIA, sans-serif',
          fontWeight: 900,
          display: 'flex',
          gap: '8px',
          marginBottom: '-20px',
        }}>
          <span style={{ color: '#334035' }}>{firstName}</span>
          <span style={{ color: '#008890' }}>{lastNameUpper}</span>
        </div>
        
        {/* Position */}
        <div style={{
          fontSize: '24px',
          color: '#2e3e3c',
          marginBottom: '20px',
          fontFamily: 'Exo2, sans-serif',
          fontWeight: 400,
        }}>
          {title}
        </div>
        
        {/* Blue thick rounded line divider */}
        <div style={{
          width: '300px',
          height: '4px',
          background: '#008890',
          borderRadius: '2px',
          marginBottom: '20px',
        }} />
        
        {/* Phone with icon */}
        {phone && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '18px',
            color: '#2e3e3c',
            fontFamily: 'Exo2, sans-serif',
            fontWeight: 400,
            marginBottom: '5px',
          }}>
            <img src="/amhi/phone.png" width={24} height={20} style={{ flexShrink: 0, marginTop: '3px' }} alt="phone" />
            <span>{phone}</span>
          </div>
        )}
        
        {/* Email with icon */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '18px',
          color: '#2e3e3c',
          fontFamily: 'Exo2, sans-serif',
          fontWeight: 400,
          marginBottom: '5px',
        }}>
          <img src="/amhi/mail.png" width={24} height={20} style={{ flexShrink: 0, marginTop: '3px' }} alt="email" />
          <span>{email}</span>
        </div>
        
        {/* Address with icon */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          fontSize: '18px',
          color: '#2e3e3c',
          maxWidth: '500px',
          lineHeight: 1.3,
          marginBottom: '5px',
          fontFamily: 'Exo2, sans-serif',
          fontWeight: 400,
        }}>
          <img src="/amhi/address.png" width={24} height={20} style={{ flexShrink: 0, marginTop: '5px' }} alt="address" />
          <span>Av. Ingenieros Militares 76, San Lorenzo Tlaltenango,<br /> Miguel Hidalgo, 11210 Ciudad de México, CDMX</span>
        </div>
        
        {/* URL with icon */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '28px',
          color: '#008890',
          fontFamily: 'Exo2Bold, sans-serif',
          marginBottom: '5px',
        }}>
          <img src="/amhi/url.png" width={24} height={20} style={{ flexShrink: 0, marginTop: '4px' }} alt="url" />
          <span>amhi.mx</span>
        </div>
      </div>
      </div>
    </>
  );
}

