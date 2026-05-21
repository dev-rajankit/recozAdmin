
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserModel from '@/models/user';

export async function GET() {
  await dbConnect();
  try {
    const userCount = await UserModel.countDocuments();
    return NextResponse.json({ userExists: userCount > 0 });
  } catch (error) {
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}
