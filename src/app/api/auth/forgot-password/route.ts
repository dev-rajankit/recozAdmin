import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserModel from '@/models/user';
import { sendPasswordResetEmail } from '@/lib/mail';

export async function POST(req: Request) {
  await dbConnect();
  try {
    const { email } = await req.json();

    const user = await UserModel.findOne({ email });

    if (!user) {
      // Don't reveal that the user does not exist.
      return NextResponse.json({ message: 'Email sent' }, { status: 200 });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    try {
      await sendPasswordResetEmail(user.email, resetToken);
      return NextResponse.json({ message: 'Email sent' }, { status: 200 });
    } catch (error) {
      console.error(error);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return NextResponse.json({ message: 'Email could not be sent' }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}