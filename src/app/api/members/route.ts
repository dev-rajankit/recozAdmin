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


export async function GET(req: Request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const includeDeleted = searchParams.get('includeDeleted') === 'true';

    const query = includeDeleted ? { deletedAt: { $ne: null } } : { deletedAt: null };
    
    const members = await MemberModel.find(query);
    
    const sanitizedMembers = members.map(member => ({
        ...member.toObject(),
        id: member._id.toString(),
    }));
    return NextResponse.json(sanitizedMembers, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  try {
    const body = await req.json();
    const { name, phone, aadharNumber, dueDate, seatingHours, feesPaid, paymentDate, seatNumber, isSeatReserved } = body;

    const status = getStatus(new Date(dueDate));

    const newMember = new MemberModel({
      name,
      phone,
      aadharNumber,
      dueDate: new Date(dueDate),
      seatingHours,
      feesPaid,
      paymentDate: new Date(paymentDate),
      status,
      avatarUrl: `https://placehold.co/40x40.png`,
      seatNumber,
      isSeatReserved,
    });

    const savedMember = await newMember.save();
    return NextResponse.json(savedMember, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
