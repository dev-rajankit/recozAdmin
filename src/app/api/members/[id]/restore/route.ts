import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MemberModel from '@/models/member';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const { id } = params;
  try {
    const restoredMember = await MemberModel.findByIdAndUpdate(id, { deletedAt: null }, { new: true });

    if (!restoredMember) {
      return NextResponse.json({ message: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json(restoredMember, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
