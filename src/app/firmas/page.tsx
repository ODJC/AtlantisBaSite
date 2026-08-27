'use client';

import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';

interface SignatureData {
  company: string;
  name: string;
  title: string;
  email: string;
  phone: string;
}

export default function Home() {
  const [formData, setFormData] = useState<SignatureData>({
    company: 'OMA',
    name: '',
    title: '',
    email: '',
    phone: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState('');
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkCompany, setBulkCompany] = useState<string>('OMA');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'company' && value === 'Sintercare') {
      setFormData((prev) => ({ ...prev, company: value, phone: '' }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openPreview = () => {
    if (!formData.name || !formData.email) {
      alert('Por favor complete los campos Nombre y Correo electrónico');
      return;
    }
    
    const params = new URLSearchParams({
      company: formData.company,
      name: formData.name,
      title: formData.title,
      email: formData.email,
    });
    if (formData.company.toLowerCase() !== 'sintercare') {
      params.set('phone', formData.phone || '');
    }

    const url = `/firmas/preview?${params.toString()}`;
    window.open(url, '_blank');
  };

  const generateSignature = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        company: formData.company,
        name: formData.name,
        title: formData.title,
        email: formData.email,
      });
      if (formData.company.toLowerCase() !== 'sintercare') {
        params.set('phone', formData.phone || '');
      }

      const response = await fetch(`/api/generate?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Error al generar la firma');
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      
      // Automatically download the image
      const a = document.createElement('a');
      a.href = imageUrl;
      // Sanitize filename: replace spaces with underscores and remove invalid characters
      const sanitizedName = formData.name.trim().replace(/\s+/g, '_').replace(/[<>:"/\\|?*]/g, '');
      a.download = `${sanitizedName}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Clean up the URL
      URL.revokeObjectURL(imageUrl);
    } catch (error) {
      console.error('Error generating signature:', error);
      alert('Error al generar la firma. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBulkFile(file);
    } else {
      setBulkFile(null);
    }
  };

  const processBulkUpload = async () => {
    if (!bulkFile) {
      alert('Por favor seleccione un archivo primero');
      return;
    }

    setBulkLoading(true);
    setBulkProgress('Leyendo archivo Excel...');

    try {
      // Validate file type
      if (!bulkFile.name.match(/\.(xlsx|xls)$/i)) {
        throw new Error('Tipo de archivo inválido. Por favor suba un archivo Excel (.xlsx o .xls)');
      }

      const arrayBuffer = await bulkFile.arrayBuffer();
      
      if (arrayBuffer.byteLength === 0) {
        throw new Error('El archivo está vacío o no se pudo leer');
      }

      let workbook;
      try {
        workbook = XLSX.read(arrayBuffer, { type: 'array' });
      } catch (readError) {
        throw new Error('Error al leer el archivo Excel. Por favor asegúrese de que el archivo no esté corrupto y sea un formato Excel válido.');
      }

      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new Error('El archivo Excel no tiene hojas');
      }

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      if (!worksheet) {
        throw new Error('No se pudo leer la primera hoja del archivo Excel');
      }

      // Convert to JSON with first row as headers
      const rawData = XLSX.utils.sheet_to_json<any>(worksheet, { 
        defval: '',
        raw: false 
      });

      console.log('Raw data from Excel:', rawData);
      console.log('Number of rows:', rawData.length);
      if (rawData.length > 0) {
        console.log('First row sample:', rawData[0]);
        console.log('Available columns:', Object.keys(rawData[0]));
      }

      if (rawData.length === 0) {
        throw new Error('El archivo Excel está vacío - no se encontraron filas de datos');
      }

      // Filter out completely empty rows
      const data = rawData.filter((row: any) => {
        return Object.values(row).some(val => val && String(val).trim() !== '');
      });

      console.log('Filtered data rows:', data.length);

      if (data.length === 0) {
        throw new Error('No se encontraron filas de datos válidas en el archivo Excel - todas las filas parecen estar vacías');
      }

      setBulkProgress(`Procesando ${data.length} firma(s)...`);

      // Helper function to get column value case-insensitively
      const getColumnValue = (row: any, possibleNames: string[]): string => {
        for (const name of possibleNames) {
          // Try exact match first
          if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
            return String(row[name]).trim();
          }
          // Try case-insensitive match
          const lowerName = name.toLowerCase();
          for (const key in row) {
            if (key.toLowerCase() === lowerName && row[key] !== undefined && row[key] !== null && row[key] !== '') {
              return String(row[key]).trim();
            }
          }
        }
        return '';
      };

      const zip = new JSZip();
      let successCount = 0;
      let skipCount = 0;
      
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        setBulkProgress(`Generando firma ${i + 1} de ${data.length}...`);

        // Get values with flexible column name matching
        const name = getColumnValue(row, ['Name', 'name', 'NAME', 'Full Name', 'FullName']);
        const title = getColumnValue(row, ['Title', 'title', 'TITLE', 'Position', 'position', 'Job Title', 'JobTitle']);
        const email = getColumnValue(row, ['Email', 'email', 'EMAIL', 'E-mail', 'E-Mail', 'E-Mail Address']);
        const phone = getColumnValue(row, ['Phone', 'phone', 'PHONE', 'Mobile', 'mobile', 'Phone Number', 'PhoneNumber', 'Tel', 'tel']);

        // Skip rows with missing required fields
        if (!name || !email) {
          console.warn(`Skipping row ${i + 1}: missing name or email`, { name, email, row });
          skipCount++;
          continue;
        }

        const params = new URLSearchParams({
          company: bulkCompany,
          name: name,
          title: title || 'Título',
          email: email,
        });
        if (bulkCompany.toLowerCase() !== 'sintercare') {
          params.set('phone', phone || '');
        }

        try {
          const response = await fetch(`/api/generate?${params.toString()}`);
          
          if (response.ok) {
            const blob = await response.blob();
            const arrayBuffer = await blob.arrayBuffer();
            // Sanitize filename: replace spaces with underscores and remove invalid characters
            const sanitizedName = name.replace(/\s+/g, '_').replace(/[<>:"/\\|?*]/g, '');
            const fileName = `${sanitizedName}.png`;
            zip.file(fileName, arrayBuffer);
            successCount++;
          } else {
            console.error(`Failed to generate signature for row ${i + 1}:`, response.status, response.statusText);
            skipCount++;
          }
        } catch (error) {
          console.error(`Error generating signature for row ${i + 1}:`, error);
          skipCount++;
        }

        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Check if we have any files in the zip
      const fileCount = Object.keys(zip.files).length;
      
      if (fileCount === 0) {
        throw new Error(`No se generaron firmas. ${skipCount} fila(s) fueron omitidas. Por favor verifique que su archivo tenga columnas válidas de Nombre y Correo electrónico.`);
      }

      setBulkProgress(`Creando archivo zip con ${fileCount} firma(s)...`);
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'firmas-email.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setBulkProgress(`¡Completado! ${successCount} firma(s) generada(s), ${skipCount} fila(s) omitida(s).`);
      setTimeout(() => {
        setBulkProgress('');
        setBulkLoading(false);
        setBulkFile(null);
        // Reset file input using ref
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 3000);

    } catch (error) {
      console.error('Error processing bulk upload:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error details:', {
        message: errorMessage,
        error: error,
        file: bulkFile?.name,
        fileSize: bulkFile?.size,
        fileType: bulkFile?.type,
      });
      
      // Show more specific error message
      if (errorMessage.includes('vacío') || errorMessage.includes('empty')) {
        alert(`Error: ${errorMessage}\n\nPor favor asegúrese de que su archivo Excel contenga filas de datos.`);
      } else if (errorMessage.includes('No se encontraron filas') || errorMessage.includes('No valid data rows')) {
        alert(`Error: ${errorMessage}\n\nPor favor asegúrese de que su archivo Excel tenga datos en las filas.`);
      } else if (errorMessage.includes('No se generaron') || errorMessage.includes('No signatures were generated')) {
        alert(`Error: ${errorMessage}\n\nPor favor verifique que su archivo tenga columnas válidas de Nombre y Correo electrónico.`);
      } else {
        alert(`Error: ${errorMessage}\n\nPor favor verifique el formato de su archivo Excel e intente nuevamente.`);
      }
      
      setBulkLoading(false);
      setBulkProgress('');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 text-white">
         Generador de Firmas
        </h1>
    
        <div className="grid md:grid-cols-2 gap-8">
          {/* Bulk Upload Section */}
          <div className="bg-slate-800 rounded-lg shadow-2xl p-6 border border-blue-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-blue-100">Carga Masiva</h2>
              <a 
                href="/sample-template.csv" 
                download
                className="text-sm text-blue-300 underline hover:text-blue-100"
              >Descargar Plantilla
              </a>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-1">
                  Empresa
                </label>
                <select
                  value={bulkCompany}
                  onChange={(e) => setBulkCompany(e.target.value)}
                  disabled={bulkLoading}
                  className="w-full px-3 py-2 border border-blue-700 bg-slate-700 text-blue-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="OMA">OMA</option>
                  <option value="AMHI">AMHI</option>
                  <option value="Atlantis">Atlantis</option>
                  <option value="Sintercare">Sintercare</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-100 mb-2">
                  Subir Archivo Excel (.xlsx)
                </label>
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    disabled={bulkLoading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                  />
                  <div className="w-full px-3 py-2 border border-blue-700 bg-slate-700 text-blue-100 rounded-md focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 flex items-center justify-between">
                    <span className="text-sm text-blue-200 truncate mr-4">
                      {bulkFile ? bulkFile.name : 'Seleccionar archivo...'}
                    </span>
                    <span className="px-4 py-2 bg-blue-700 text-white text-sm font-semibold rounded-md hover:bg-blue-600 transition duration-200 flex-shrink-0 pointer-events-none">
                      Examinar
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={processBulkUpload}
                disabled={bulkLoading || !bulkFile}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-500 transition duration-200 disabled:bg-slate-600 disabled:cursor-not-allowed"
              >
                {bulkLoading ? 'Procesando...' : 'Procesar Archivo'}
              </button>

              {bulkLoading && (
                <div className="bg-blue-900 bg-opacity-50 border border-blue-700 rounded-md p-4">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-300 mr-3"></div>
                    <p className="text-sm text-blue-200">{bulkProgress}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Single Signature Form */}
          <div className="bg-slate-800 rounded-lg shadow-2xl p-6 border border-blue-800">
            <h2 className="text-2xl font-semibold mb-4 text-blue-100">Firma Individual</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-1">
                  Empresa
                </label>
                <select
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-blue-700 bg-slate-700 text-blue-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="OMA">OMA</option>
                  <option value="AMHI">AMHI</option>
                  <option value="Atlantis">Atlantis</option>
                  <option value="Sintercare">Sintercare</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-100 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-blue-700 bg-slate-700 text-blue-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-100 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-blue-700 bg-slate-700 text-blue-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-100 mb-1">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-blue-700 bg-slate-700 text-blue-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
                  required
                />
              </div>

              {formData.company.toLowerCase() !== 'sintercare' && (
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-1">
                  Teléfono Móvil
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-blue-700 bg-slate-700 text-blue-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
                />
              </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={openPreview}
                  disabled={!formData.name || !formData.email}
                  className="flex-1 bg-slate-600 text-white py-2 px-4 rounded-md hover:bg-slate-500 transition duration-200 disabled:bg-slate-700 disabled:cursor-not-allowed"
                >
                  Vista Previa
                </button>
                <button
                  onClick={generateSignature}
                  disabled={loading || !formData.name || !formData.email}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-500 transition duration-200 disabled:bg-slate-600 disabled:cursor-not-allowed"
                >
                  {loading ? 'Generando...' : 'Descargar PNG'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-blue-300 text-sm space-y-2">
          <p>Atlantis 2025</p>
          <button
            type="button"
            onClick={async () => {
              await fetch("/api/firmas/auth", { method: "DELETE" });
              window.location.href = "/firmas/login";
            }}
            className="text-blue-400 hover:text-blue-200 underline underline-offset-2"
          >
            Salir
          </button>
        </div>
        </div>
      </main>
  );
}
