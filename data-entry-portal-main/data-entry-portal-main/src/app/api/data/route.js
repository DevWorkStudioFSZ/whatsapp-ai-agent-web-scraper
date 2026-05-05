import { NextResponse } from 'next/server';
import { geAmlTraining, getInductionProgram, getDynamicData } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const amlData = await geAmlTraining();
    const inductionData = await getInductionProgram();

    const schemas = await getSchemas();

    const dynamicData = {};
    for (const schema of schemas) {
        dynamicData[schema.id] = await getDynamicData(schema.id);
    }

    return NextResponse.json({ 
        success: true, 
        data: { 
            aml: amlData, 
            induction: inductionData,
            ...dynamicData
        } 
    });
  } catch (error) {
    console.error('Fetch Error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
