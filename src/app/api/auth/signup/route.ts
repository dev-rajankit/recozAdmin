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

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 409 });
    }

    const user = await UserModel.create({ email, password });

    // In a real app, you would generate a JWT token here and send it back
    return NextResponse.json({ success: true, user: { id: user._id, email: user.email } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
