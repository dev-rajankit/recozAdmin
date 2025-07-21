import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MemberModel from '@/models/member';
import type { MemberStatus } from '@/types';
import { addDays, startOfDay } from 'date-fns';

const getStatus = (dueDate: Date): MemberStatus => {
  const now = startOfDay(new Date());
  const due = startOfDay(new Date(dueDate));
  const sevenDaysFromNow = addDays(now, 7);

  if (due < now) return 'Expired';
  if (due <= sevenDaysFromNow) return 'Expiring Soon';
  return 'Active';
};

export async function GET(req: Request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const tab = searchParams.get('tab') || 'all';
    
    // First, update statuses for all active members
    const activeMembers = await MemberModel.find({ deletedAt: null });
    for (const member of activeMembers) {
        const newStatus = getStatus(member.dueDate);
        if (newStatus !== member.status) {
            await MemberModel.findByIdAndUpdate(member._id, { status: newStatus });
        }
    }

    let query = {};
    const now = startOfDay(new Date());
    const sevenDaysFromNow = addDays(now, 7);

    switch (tab) {
        case 'active':
            query = { deletedAt: null, status: 'Active' };
            break;
        case 'expiring':
            query = { deletedAt: null, status: 'Expiring Soon' };
            break;
        case 'expired':
            query = { deletedAt: null, status: 'Expired' };
            break;
        case 'deleted':
            query = { deletedAt: { $ne: null } };
            break;
        case 'all':
        default:
            query = { deletedAt: null };
            break;
    }
    
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