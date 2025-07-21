export type MemberStatus = 'Active' | 'Expiring Soon' | 'Expired';

export type Member = {
  id: string;
  name: string;
  dueDate: Date;
  seatingHours: number;
  feesPaid: number;
  paymentDate: Date;
  status: MemberStatus;
  avatarUrl: string;
};

export type ExpenseCategory = 'Rent' | 'Electricity' | 'Internet' | 'Water' | 'Maintenance' | 'Supplies' | 'Cleaning' | 'Other';

export type Expense = {
  id: string;
  type: ExpenseCategory;
  amount: number;
  date: Date;
  description?: string;
};
