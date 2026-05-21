import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ExpenseModel from '@/models/expense';

export async function GET() {
  await dbConnect();
  try {
    const expenses = await ExpenseModel.find({}).sort({ date: -1 });
     const sanitizedExpenses = expenses.map(expense => ({
        ...expense.toObject(),
        id: expense._id.toString(),
    }));
    return NextResponse.json(sanitizedExpenses, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  try {
    const body = await req.json();
    const newExpense = new ExpenseModel(body);
    const savedExpense = await newExpense.save();
    return NextResponse.json(savedExpense, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
