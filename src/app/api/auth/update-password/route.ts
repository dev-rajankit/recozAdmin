import dbConnect from '@/lib/db';
import UserModel from '@/models/user';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { email, newPassword } = await req.json();

    if (!email || !newPassword) {
      return NextResponse.json({ message: 'Email and new password are required' }, { status: 400 });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    // In a real app, you'd also want to verify the current password before updating.
    // For simplicity here, we'll just update it.

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    
    return NextResponse.json({ success: true, message: "Password updated successfully." }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
