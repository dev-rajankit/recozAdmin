
import dbConnect from '@/lib/db';
import UserModel from '@/models/user';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  await dbConnect();

  try {
    // Check if any user already exists
    const userCount = await UserModel.countDocuments();
    if (userCount > 0) {
      return NextResponse.json({ message: 'Signup is disabled. Only one admin account is allowed.' }, { status: 403 });
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    // The existingUser check is technically redundant if we only allow one user, but it's good practice.
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
