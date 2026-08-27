export interface OMATemplateConfig {
  name: string;
  width: number;
  height: number;
  backgroundColor: string;
  backgroundImage?: string;
  logo?: string;
}

export const omaTemplate: OMATemplateConfig = {
  name: 'OMA',
  width: 600,
  height: 200,
  backgroundColor: '#4f7cac',
  backgroundImage: 'Background_oma.png', // Located in src/templates/oma/
  // logo: 'logo_oma.png', // Optional: Located in src/templates/oma/
};

export function generateOMASignature(data: {
  name: string;
  title: string;
  email: string;
  phone?: string;
}) {
  const bgImage = omaTemplate.backgroundImage;
  const backgroundStyle = bgImage 
    ? `background-image: url('${bgImage}'); background-size: cover; background-position: center; background-repeat: no-repeat;`
    : `background: ${omaTemplate.backgroundColor};`;
  
  return `
    <div style="width: 600px; height: 200px; ${backgroundStyle} position: relative; overflow: hidden; font-family: Arial, sans-serif;">
      <!-- Text Content -->
      <div style="position: absolute; left: 40px; top: 34px; font-size: 10px; font-weight: bold; color: #342d69;">${data.name || 'Name Here'}</div>
      <div style="position: absolute; left: 40px; top: 48px; font-size: 9px; color: #342d69;">${data.title || 'Title'}</div>
      <div style="position: absolute; left: 40px; top: 82px; font-size: 8px; color: #342d69;">+52 55 0000 0000</div>
      <div style="position: absolute; left: 40px; top: 99px; font-size: 8px; color: #342d69;">${data.email || 'email@example.com'}</div>
      ${data.phone ? `<div style="position: absolute; left: 40px; top: 116px; font-size: 8px; color: #342d69;">Móvil: ${data.phone}</div>` : ''}
      <div style="position: absolute; left: 40px; top: 158px; font-size: 8px; color: #342d69; width: 150px; line-height: 1.3;">Av. Ingenieros Militares 76, San Lorenzo Tlaltenango, Miguel Hidalgo, 11210 Ciudad de México, CDMX</div>
    </div>
  `;
}

