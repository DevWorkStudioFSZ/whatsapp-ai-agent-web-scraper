import { NextResponse } from 'next/server';
import { getSchemas } from '@/lib/db';

export async function GET() {
  try {
    const schemas = await getSchemas();
    return NextResponse.json({ success: true, schemas });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}
