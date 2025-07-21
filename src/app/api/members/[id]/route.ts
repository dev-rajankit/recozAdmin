import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MemberModel from '@/models/member';
import { MemberStatus } from '@/types';
import { addDays, startOfDay } from 'date-fns';

const getStatus = (dueDate: Date): MemberStatus => {
  const now = startOfDay(new Date());
  const due = startOfDay(new Date(dueDate));
  const sevenDaysFromNow = addDays(now, 7);

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
    
    const sanitizedMember = {
        ...updatedMember.toObject(),
        id: updatedMember._id.toString(),
    }
    return NextResponse.json(sanitizedMember, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const { id } = params;
  try {
    const deletedMember = await MemberModel.findByIdAndDelete(id);

    if (!deletedMember) {
        return NextResponse.json({ message: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Member permanently deleted' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
