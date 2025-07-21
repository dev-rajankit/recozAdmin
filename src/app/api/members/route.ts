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


export async function GET() {
  await dbConnect();
  try {
    const members = await MemberModel.find({});
    // We map to ensure the id is a string, not an ObjectId
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
    const { name, dueDate, seatingHours, feesPaid, paymentDate } = body;

    const status = getStatus(new Date(dueDate));

    const newMember = new MemberModel({
      name,
      dueDate: new Date(dueDate),
      seatingHours,
      feesPaid,
      paymentDate: new Date(paymentDate),
      status,
      avatarUrl: `https://placehold.co/40x40.png`,
    });

    const savedMember = await newMember.save();
    return NextResponse.json(savedMember, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
