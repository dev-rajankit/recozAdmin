import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ExpenseModel from '@/models/expense';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const { id } = params;
  try {
    const deletedExpense = await ExpenseModel.findByIdAndDelete(id);

    if (!deletedExpense) {
      return NextResponse.json({ message: 'Expense not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Expense deleted successfully' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
