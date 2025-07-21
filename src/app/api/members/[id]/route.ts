import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MemberModel from '@/models/member';
import { MemberStatus } from '@/types';

const getStatus = (dueDate: Date): MemberStatus => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const sevenDaysFromNow = new Date(now);
  sevenDaysFromNow.setDate(now.getDate() + 7);

  if (due < now) return 'Expired';
  if (due <= sevenDaysFromNow) return 'Expiring Soon';
  return 'Active';
};

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const { id } = params;
  try {
    const body = await req.json();
    const { name, phone, aadharNumber, dueDate, seatingHours, feesPaid, paymentDate, seatNumber, isSeatReserved } = body;

    const status = getStatus(new Date(dueDate));
    
    const updatedData = {
        name,
        phone,
        aadharNumber,
        dueDate: new Date(dueDate),
        seatingHours,
        feesPaid,
        paymentDate: new Date(paymentDate),
        status,
        seatNumber,
        isSeatReserved,
    };

    const updatedMember = await MemberModel.findByIdAndUpdate(id, updatedData, { new: true });

    if (!updatedMember) {
      return NextResponse.json({ message: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json(updatedMember, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const { id } = params;
  try {
    const { searchParams } = new URL(req.url);
    const permanent = searchParams.get('permanent') === 'true';

    if (permanent) {
       const deletedMember = await MemberModel.findByIdAndDelete(id);
        if (!deletedMember) {
            return NextResponse.json({ message: 'Member not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Member permanently deleted' }, { status: 200 });
    } else {
        const softDeletedMember = await MemberModel.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true });
        if (!softDeletedMember) {
            return NextResponse.json({ message: 'Member not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Member moved to deleted' }, { status: 200 });
    }
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}