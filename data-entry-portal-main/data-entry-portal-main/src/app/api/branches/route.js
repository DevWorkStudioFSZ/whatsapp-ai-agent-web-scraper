import { NextResponse } from 'next/server';
import { getBranches, updateBranch } from '@/lib/db';

export async function GET() {
  try {
    const branches = await getBranches();
    return NextResponse.json({ success: true, branches });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, branches: {} });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    if (body.action === 'update') {
      await updateBranch(body.code, { branchName: body.branchName, region: body.region });
      const branches = await getBranches();
      return NextResponse.json({ success: true, branches });
    }
    return NextResponse.json({ success: false, error: 'Invalid action' });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: 'Failed to update branch' }, { status: 500 });
  }
}
