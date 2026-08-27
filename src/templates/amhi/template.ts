export interface AMHITemplateConfig {
  name: string;
  width: number;
  height: number;
  backgroundColor: string;
  backgroundImage?: string;
  logo?: string;
}

export const amhiTemplate: AMHITemplateConfig = {
  name: 'AMHI',
  width: 1200,
  height: 400,
  backgroundColor: '#ffffff',
  backgroundImage: 'AMHI_background.png',
  logo: 'Logo_AMHI_Variantes-01.png',
};

export function generateAMHISignature(data: {
  name: string;
  title: string;
  email: string;
  phone?: string;
}) {
  return `
    <div style="width: 1200px; height: 400px; background: white; position: relative; display: flex; font-family: Arial;">
      <div style="position: absolute; left: 280px; top: 100px; display: flex; flex-direction: column;">
        <div style="font-size: 32px; font-weight: bold; color: #000000; margin-bottom: 8px;">${data.name || 'Name'}</div>
        <div style="font-size: 24px; color: #333333; margin-bottom: 16px;">${data.title || 'Title'}</div>
        <div style="font-size: 20px; color: #333333; margin-bottom: 8px;">${data.email || 'email@example.com'}</div>
        ${data.phone ? `<div style="font-size: 20px; color: #333333;">${data.phone}</div>` : ''}
      </div>
    </div>
  `;
}

