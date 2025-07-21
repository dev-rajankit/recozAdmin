import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserModel from '@/models/user';
import crypto from 'crypto';

export async function POST(req: Request) {
  await dbConnect();
  try {
    const { token, password } = await req.json();

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await UserModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 400 });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return NextResponse.json({ success: true, message: 'Password reset successful' }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}