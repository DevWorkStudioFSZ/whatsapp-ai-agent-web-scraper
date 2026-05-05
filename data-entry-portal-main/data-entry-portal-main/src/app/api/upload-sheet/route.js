import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { getSchemas, saveSchema } from '@/lib/db';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const formName = formData.get('name');

    if (!file || !formName) {
      return NextResponse.json({ success: false, error: 'File and name are required' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse Excel
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Extract headers
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    if (data.length === 0) {
      return NextResponse.json({ success: false, error: 'Excel sheet is empty' }, { status: 400 });
    }
    
    const headers = data[0]; // First row headers
    if (!headers || headers.length === 0) {
        return NextResponse.json({ success: false, error: 'No headers found in the first row' }, { status: 400 });
    }

    // Build Schema fields dynamically
    const fields = headers.map((header) => {
        const cleanHeader = String(header).replace(/\r\n/g, ' ').trim();
        const nameStr = cleanHeader.toLowerCase().replace(/[^a-z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
        return { name: nameStr || 'field', label: cleanHeader, type: 'text' };
    });

    const schemaId = formName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const newSchema = { id: schemaId, title: formName, fields };

    // Update via DB layer
    await saveSchema(newSchema);

    return NextResponse.json({ success: true, schemaId, newSchema });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ success: false, error: 'Failed to process sheet' }, { status: 500 });
  }
}
