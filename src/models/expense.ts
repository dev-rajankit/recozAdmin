import mongoose, { Document, Schema, Model } from 'mongoose';
import type { ExpenseCategory } from '@/types';

export interface IExpense extends Document {
  type: ExpenseCategory;
  amount: number;
  date: Date;
  description?: string;
}

const expenseCategories: ExpenseCategory[] = ['Rent', 'Electricity', 'Internet', 'Water', 'Maintenance', 'Supplies', 'Cleaning', 'Other'];

const ExpenseSchema: Schema<IExpense> = new Schema({
  type: { type: String, required: true, enum: expenseCategories },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  description: { type: String },
});

const ExpenseModel: Model<IExpense> = mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);

export default ExpenseModel;
