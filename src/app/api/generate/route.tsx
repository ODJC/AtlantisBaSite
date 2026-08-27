import { ImageResponse } from 'next/og';
import { generateOMATemplate } from '@/templates/oma/generate';
import { generateAMHITemplate } from '@/templates/amhi/generate';
import { generateAtlantisTemplate } from '@/templates/atlantis/generate';
import { generateSintercareTemplate } from '@/templates/sintercare/generate';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const companyRaw = searchParams.get('company') || 'OMA';
    const company = companyRaw.trim();
    const companyNorm = company.toLowerCase();
    const name = searchParams.get('name') || 'Name Here';
    const title = searchParams.get('title') || 'Title';
    const email = searchParams.get('email') || 'email@example.com';
    const phoneParam = searchParams.get('phone');
    const phone = phoneParam ? String(phoneParam).trim() : '';

    // OMA Template
    if (companyNorm === 'oma') {
      const templateData: any = {
        name,
        title,
        email,
        requestUrl: request.url,
      };
      
      // Only add phone if it has a value
      if (phone && phone.length > 0) {
        templateData.phone = phone;
      }
      
      return generateOMATemplate(templateData);
    }
    
    // AMHI Template
    if (companyNorm === 'amhi') {
      return await generateAMHITemplate({
        name,
        title,
        email,
        phone,
        requestUrl: request.url,
      });
    }

    // Atlantis Template
    if (companyNorm === 'atlantis') {
      const atlantisData: {
        name: string;
        title: string;
        email: string;
        requestUrl: string;
        phone?: string;
      } = {
        name,
        title,
        email,
        requestUrl: request.url,
      };
      if (phone && phone.length > 0) {
        atlantisData.phone = phone;
      }
      return await generateAtlantisTemplate(atlantisData);
    }

    if (companyNorm === 'sintercare') {
      return await generateSintercareTemplate({
        name,
        title,
        email,
        requestUrl: request.url,
      });
    }

    // Default fallback
    return new ImageResponse(
      (
        <div
          style={{
            width: '600px',
            height: '150px',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            padding: '20px',
            fontFamily: 'Arial',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
              {name}
            </div>
            <div style={{ fontSize: '18px', color: '#666', marginBottom: '10px' }}>
              {title}
            </div>
            <div style={{ fontSize: '14px', color: '#333' }}>
              {email} | {phone}
            </div>
            <div style={{ fontSize: '14px', color: '#999', marginTop: '10px' }}>
              {company}
            </div>
          </div>
        </div>
      ),
      {
        width: 600,
        height: 150,
      },
    );
  } catch (error) {
    console.error('Error generating signature:', error);
    return new Response('Error generating signature', { status: 500 });
  }
}

