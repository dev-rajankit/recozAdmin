import dbConnect from '@/lib/db';
import UserModel from '@/models/user';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const user = await UserModel.findOne({ email }).select('+password');

    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // In a real app, you would generate a JWT token here and send it back
    return NextResponse.json({ success: true, user: { id: user._id, email: user.email } }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
