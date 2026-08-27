'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { OMAPreview } from '@/templates/oma/preview';
import { AMHIPreview } from '@/templates/amhi/preview';
import { AtlantisPreview } from '@/templates/atlantis/preview';
import { SintercarePreview } from '@/templates/sintercare/preview';

function PreviewContent() {
  const searchParams = useSearchParams();
  
  const company = (searchParams.get('company') || 'OMA').trim();
  const companyNorm = company.toLowerCase();
  const name = searchParams.get('name') || 'Name Here';
  const title = searchParams.get('title') || 'Title';
  const email = searchParams.get('email') || 'email@example.com';
  const phone = searchParams.get('phone') || '';

  if (companyNorm === 'oma') {
    return <OMAPreview name={name} title={title} email={email} phone={phone} />;
  }

  if (companyNorm === 'amhi') {
    return <AMHIPreview name={name} title={title} email={email} phone={phone} />;
  }

  if (companyNorm === 'atlantis') {
    return <AtlantisPreview name={name} title={title} email={email} phone={phone} />;
  }

  if (companyNorm === 'sintercare') {
    return <SintercarePreview name={name} title={title} email={email} />;
  }

  // Default template for other companies
  return (
    <div style={{
      width: '600px',
      height: '150px',
      background: 'white',
      display: 'flex',
      alignItems: 'center',
      padding: '20px',
      fontFamily: 'Arial',
      border: '1px solid #ddd',
    }}>
      <div>
        <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
          {name}
        </div>
        <div style={{ fontSize: '18px', color: '#666', marginBottom: '10px' }}>
          {title}
        </div>
        <div style={{ fontSize: '14px', color: '#333' }}>
          {email} {phone && `| ${phone}`}
        </div>
        <div style={{ fontSize: '14px', color: '#999', marginTop: '10px' }}>
          {company}
        </div>
      </div>
    </div>
  );
}

export default function PreviewPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#1e293b',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <Suspense fallback={<div style={{ color: 'white' }}>Cargando vista previa...</div>}>
        <PreviewContent />
      </Suspense>
    </div>
  );
}

