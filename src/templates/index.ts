import { generateOMASignature } from './oma/template';
import { generateAMHISignature } from './amhi/template';
import { generateAtlantisSignature } from './atlantis/template';
import { generateSintercareSignature } from './sintercare/template';

export interface SignatureData {
  name: string;
  title: string;
  email: string;
  phone?: string;
}

export function getTemplateGenerator(company: string) {
  switch (company.toLowerCase()) {
    case 'oma':
      return generateOMASignature;
    case 'amhi':
      return generateAMHISignature;
    case 'atlantis':
      return generateAtlantisSignature;
    case 'sintercare':
      return generateSintercareSignature;
    default:
      return generateOMASignature;
  }
}

export function generateSignatureHTML(company: string, data: SignatureData): string {
  const generator = getTemplateGenerator(company);
  return generator(data);
}

