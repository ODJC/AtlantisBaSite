export interface AtlantisTemplateConfig {
  name: string;
  width: number;
  height: number;
  backgroundColor: string;
}

/** Background PNG is 1000×300; HTML displays it at 500×150 for sharper scaling in clients. */
export const atlantisTemplate: AtlantisTemplateConfig = {
  name: 'Atlantis',
  width: 500,
  height: 150,
  backgroundColor: '#001540',
};

export function generateAtlantisSignature(data: {
  name: string;
  title: string;
  email: string;
  phone?: string;
}) {
  const phoneValue = data.phone ? String(data.phone).trim() : '';
  const emailHtml = data.email || 'email@example.com';
  const emailTop = phoneValue ? '77px' : '79px';
  const phoneRow = phoneValue
    ? `<div style="position: absolute; left: 38px; top: 88px; font-size: 8px; font-weight: bold; color: #0020D1; max-width: 240px; line-height: 1.2;">${phoneValue}</div>`
    : '';
  const addressTop = phoneValue ? '102px' : '98px';

  return `
    <div style="width: 500px; height: 150px; position: relative; font-family: Arial, Helvetica, sans-serif;">
      <img src="atlantis/background.png" alt="" width="500" height="150" style="display: block; position: absolute; left: 0; top: 0; width: 500px; height: 150px;" />
      <div style="position: absolute; left: 38px; top: 24px; font-size: 25px; font-weight: bold; color: #0020D1; max-width: 268px; line-height: 1.1;">${data.name || 'Name'}</div>
      <div style="position: absolute; left: 38px; top: 52px; font-size: 12px; font-weight: bold; color: #001040; max-width: 250px; line-height: 1.2;">${data.title || 'Title'}</div>
      <div style="position: absolute; left: 38px; top: ${emailTop}; font-size: 8px; font-weight: bold; color: #0020D1; max-width: 240px; line-height: 1.2;">${emailHtml}</div>
      ${phoneRow}
      <div style="position: absolute; left: 38px; top: ${addressTop}; font-size: 8px; font-weight: 600; color: #0020D1; max-width: 235px; line-height: 1.25;">Av. Ing. Militares 76, San Lorenzo Tlaltenango, Miguel Hidalgo, CDMX</div>
    </div>
  `;
}
