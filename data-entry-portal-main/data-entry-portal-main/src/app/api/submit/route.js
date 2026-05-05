import { NextResponse } from 'next/server';
import { insertAmlTraining, insertInductionProgram, insertDynamicData } from '@/lib/db';

export async function POST(req) {
  try {
    const data = await req.json();
    const { formType, ...formData } = data;

    if (formType === 'aml') {
      await insertAmlTraining(formData);
    } else if (formType === 'induction') {
      await insertInductionProgram(formData);
    } else {
      await insertDynamicData(formType, formData);
    }

    return NextResponse.json({ success: true, message: 'Data saved successfully' });
  } catch (error) {
    console.error('Submit Error:', error);
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}
