import { NextResponse } from 'next/server';
import { geAmlTraining, getInductionProgram } from '@/lib/db';
import * as XLSX from 'xlsx';

export async function GET() {
  try {
    const amlData = await geAmlTraining();
    const inductionData = await getInductionProgram();

    const workbook = XLSX.utils.book_new();

    // Map AML data to specific columns requested if needed, or just export all
    const amlSheet = XLSX.utils.json_to_sheet(amlData);
    XLSX.utils.book_append_sheet(workbook, amlSheet, "AML Training");

    const inductionSheet = XLSX.utils.json_to_sheet(inductionData);
    XLSX.utils.book_append_sheet(workbook, inductionSheet, "Induction Program");

    const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Disposition': 'attachment; filename="exported_data.xlsx"',
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
  } catch (error) {
    console.error('Export Error:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}
