import dbConnect from '@/lib/db';
import UserModel from '@/models/user';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { email, currentPassword, newPassword } = await req.json();

    if (!email || !currentPassword || !newPassword) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    const user = await UserModel.findOne({ email }).select('+password');

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return NextResponse.json({ message: 'Incorrect current password' }, { status: 401 });
    }

    user.password = newPassword;
    await user.save();
    
    return NextResponse.json({ success: true, message: "Password updated successfully." }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}