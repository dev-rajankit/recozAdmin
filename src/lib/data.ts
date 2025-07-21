import type { Member, Expense, MemberStatus, ExpenseCategory } from "@/types";

const today = new Date();
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// This is now just a utility function and not used for initial status calculation
const getStatus = (dueDate: Date): MemberStatus => {
  const now = new Date();
  const sevenDaysFromNow = addDays(new Date(), 7);
  if (dueDate < now) {
    return 'Expired';
  }
  if (dueDate <= sevenDaysFromNow) {
    return 'Expiring Soon';
  }
  return 'Active';
};

// This data is now for seeding purposes or as a fallback.
// The app will fetch data from MongoDB.

export const members: Member[] = [
  { id: '1', name: 'Aarav Sharma', dueDate: addDays(today, 30), seatingHours: 100, feesPaid: 5000, paymentDate: addDays(today, -5), status: 'Active', avatarUrl: 'https://placehold.co/40x40.png' },
  { id: '2', name: 'Priya Patel', dueDate: addDays(today, 5), seatingHours: 80, feesPaid: 4500, paymentDate: addDays(today, -10), status: 'Expiring Soon', avatarUrl: 'https://placehold.co/40x40.png' },
  { id: '3', name: 'Rohan Mehta', dueDate: addDays(today, -10), seatingHours: 120, feesPaid: 6000, paymentDate: addDays(today, -40), status: 'Expired', avatarUrl: 'https://placehold.co/40x40.png' },
  { id: '4', name: 'Sneha Reddy', dueDate: addDays(today, 60), seatingHours: 150, feesPaid: 7000, paymentDate: addDays(today, -2), status: 'Active', avatarUrl: 'https://placehold.co/40x40.png' },
  { id: '5', name: 'Vikram Singh', dueDate: addDays(today, 2), seatingHours: 60, feesPaid: 3000, paymentDate: addDays(today, -28), status: 'Expiring Soon', avatarUrl: 'https://placehold.co/40x40.png' },
  { id: '6', name: 'Anjali Gupta', dueDate: addDays(today, -2), seatingHours: 90, feesPaid: 5500, paymentDate: addDays(today, -32), status: 'Expired', avatarUrl: 'https://placehold.co/40x40.png' },
  { id: '7', name: 'Karan Malhotra', dueDate: addDays(today, 90), seatingHours: 200, feesPaid: 8000, paymentDate: addDays(today, -1), status: 'Active', avatarUrl: 'https://placehold.co/40x40.png' },
  { id: '8', name: 'Sunita Nair', dueDate: addDays(today, 45), seatingHours: 110, feesPaid: 5200, paymentDate: addDays(today, -15), status: 'Active', avatarUrl: 'https://placehold.co/40x40.png' },
];


export const expenses: Expense[] = [
  { id: '1', type: 'Rent', amount: 3000, date: new Date('2024-06-01'), description: 'Monthly office rent' },
  { id: '2', type: 'Electricity', amount: 850, date: new Date('2024-06-05'), description: 'Electricity bill for May' },
  { id: '3', type: 'Internet', amount: 500, date: new Date('2024-06-07') },
  { id: '4', type: 'Maintenance', amount: 800, date: new Date('2024-06-10'), description: 'AC repair' },
  { id: '5', type: 'Supplies', amount: 400, date: new Date('2024-06-12'), description: 'Coffee and snacks' },
  { id: '6', type: 'Cleaning', amount: 600, date: new Date('2024-06-15') },
  { id: '7', type: 'Other', amount: 300, date: new Date('2024-06-20'), description: 'Marketing materials' },
  { id: '8', type: 'Water', amount: 250, date: new Date('2024-05-25') },
];

export const financialData = {
  revenueVsExpenses: [
    { name: 'Jan', revenue: 4000, expenses: 2400 },
    { name: 'Feb', revenue: 3000, expenses: 1398 },
    { name: 'Mar', revenue: 5000, expenses: 3800 },
    { name: 'Apr', revenue: 4780, expenses: 3908 },
    { name: 'May', revenue: 5890, expenses: 4800 },
    { name: 'Jun', revenue: 6390, expenses: 3800 },
  ],
  memberGrowth: [
    { name: 'Jan', members: 20 },
    { name: 'Feb', members: 25 },
    { name: 'Mar', members: 30 },
    { name: 'Apr', members: 35 },
    { name: 'May', members: 45 },
    { name: 'Jun', members: 50 },
  ],
  expenseBreakdown: [
    { name: 'Rent', value: 3000, fill: "hsl(var(--chart-1))" },
    { name: 'Utilities', value: 1200, fill: "hsl(var(--chart-2))" },
    { name: 'Internet', value: 500, fill: "hsl(var(--chart-3))" },
    { name: 'Maintenance', value: 800, fill: "hsl(var(--chart-4))" },
    { name: 'Supplies', value: 400, fill: "hsl(var(--chart-5))" },
    { name: 'Miscellaneous', value: 300, fill: "hsl(var(--destructive))" },
  ]
};