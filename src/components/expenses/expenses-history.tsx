"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Expense, ExpenseCategory } from "@/types";

interface ExpensesHistoryProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
  typeFilter: ExpenseCategory | "all";
  setTypeFilter: (value: ExpenseCategory | "all") => void;
  startDate?: Date;
  setStartDate: (date?: Date) => void;
  endDate?: Date;
  setEndDate: (date?: Date) => void;
  resetFilters: () => void;
}

const expenseCategories: ExpenseCategory[] = ['Rent', 'Electricity', 'Internet', 'Water', 'Maintenance', 'Supplies', 'Cleaning', 'Other'];

const categoryColors: Record<ExpenseCategory, string> = {
  Rent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  Electricity: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  Internet: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  Water: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  Maintenance: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  Supplies: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Cleaning: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  Other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
};

export function ExpensesHistory({ expenses, onDelete, typeFilter, setTypeFilter, startDate, setStartDate, endDate, setEndDate, resetFilters }: ExpensesHistoryProps) {
  const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);

  const expenseBreakdown = expenses.reduce((acc, expense) => {
    acc[expense.type] = (acc[expense.type] || 0) + expense.amount;
    return acc;
  }, {} as Record<ExpenseCategory, number>);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>Expense History</CardTitle>
                <CardDescription>View and manage past expenses.</CardDescription>
            </div>
            <Badge variant="secondary" className="text-base">
              Total: ₹{totalExpenses.toLocaleString("en-IN")}
            </Badge>
        </div>
        <div className="pt-4 flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[150px] space-y-1">
                <label className="text-sm font-medium">Filter by Type</label>
                <Select onValueChange={setTypeFilter} value={typeFilter}>
                    <SelectTrigger><SelectValue placeholder="All Types" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {expenseCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
             <div className="flex-1 min-w-[150px] space-y-1">
                <label className="text-sm font-medium">Start Date</label>
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={startDate} onSelect={setStartDate} /></PopoverContent>
                </Popover>
            </div>
            <div className="flex-1 min-w-[150px] space-y-1">
                <label className="text-sm font-medium">End Date</label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={endDate} onSelect={setEndDate} /></PopoverContent>
                </Popover>
            </div>
            <Button variant="ghost" onClick={resetFilters}>Reset</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {expenses.length > 0 ? (
                    expenses.map((expense) => (
                    <TableRow key={expense.id}>
                        <TableCell><Badge variant="outline" className={cn("border-transparent", categoryColors[expense.type])}>{expense.type}</Badge></TableCell>
                        <TableCell>₹{expense.amount.toLocaleString("en-IN")}</TableCell>
                        <TableCell>{format(expense.date, "MMM dd, yyyy")}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{expense.description}</TableCell>
                        <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => onDelete(expense.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        No expenses found for the selected filters.
                    </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
        </div>
      </CardContent>
      {Object.keys(expenseBreakdown).length > 0 && (
        <CardFooter className="flex-col items-start gap-4">
            <h3 className="font-headline font-semibold">Expense Breakdown by Category</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
                {Object.entries(expenseBreakdown).map(([category, total]) => (
                    <Card key={category} className="bg-muted/50">
                        <CardHeader className="p-4">
                            <CardTitle className="text-sm font-medium">{category}</CardTitle>
                            <p className="text-lg font-bold">₹{total.toLocaleString("en-IN")}</p>
                        </CardHeader>
                    </Card>
                ))}
            </div>
        </CardFooter>
      )}
    </Card>
  );
}
