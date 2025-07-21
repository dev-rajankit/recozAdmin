'use server';

import {NextResponse} from 'next/server';
import dbConnect from '@/lib/db';
import MemberModel from '@/models/member';
import type {MemberStatus} from '@/types';
import {addDays, startOfDay} from 'date-fns';

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
  const { searchParams } = new URL(req.url);
  const includeDeleted = searchParams.get('includeDeleted') === 'true';

  try {
    const query = includeDeleted ? { deletedAt: { $ne: null } } : { deletedAt: null };
    
    const members = await MemberModel.find(query);
    
    if (!includeDeleted) {
      for (const member of members) {
        const newStatus = getStatus(member.dueDate);
        if (newStatus !== member.status) {
          member.status = newStatus;
          await member.save();
        }
      }
    }
    
    const refreshedMembers = await MemberModel.find(query);

    const sanitizedMembers = refreshedMembers.map(member => ({
      ...member.toObject(),
      id: member._id.toString(),
    }));
    return NextResponse.json(sanitizedMembers, {status: 200});
  } catch (error) {
    return NextResponse.json({message: 'Server Error'}, {status: 500});
  }
}

export async function POST(req: Request) {
  await dbConnect();
  try {
    const body = await req.json();
    const {
      name,
      phone,
      aadharNumber,
      dueDate,
      seatingHours,
      feesPaid,
      paymentDate,
      seatNumber,
      isSeatReserved,
    } = body;

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
    return NextResponse.json(
      {...savedMember.toObject(), id: savedMember._id.toString()},
      {status: 201}
    );
  } catch (error: any) {
    return NextResponse.json({message: error.message}, {status: 400});
  }
}
