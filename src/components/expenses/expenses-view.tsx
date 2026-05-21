"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddExpenseForm } from "./add-expense-form";
import { ExpensesHistory } from "./expenses-history";
import type { Expense, ExpenseCategory } from "@/types";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function ExpensesView() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [typeFilter, setTypeFilter] = useState<ExpenseCategory | "all">("all");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/expenses');
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch expenses');
      setExpenses(data.map((e:any) => ({...e, date: new Date(e.date)})));
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleAddExpense = async (expense: Omit<Expense, "id">) => {
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to add expense');
      toast({ title: 'Success', description: 'Expense added successfully.' });
      fetchExpenses();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!expenseToDelete) return;
     try {
      const response = await fetch(`/api/expenses/${expenseToDelete}`, {
        method: 'DELETE',
      });
       const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete expense');
      toast({ title: 'Success', description: 'Expense deleted successfully.' });
      fetchExpenses();
    } catch (error: any)
    {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
        setExpenseToDelete(null);
    }
  };
  
  const resetFilters = () => {
    setTypeFilter("all");
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const typeMatch = typeFilter === 'all' || expense.type === typeFilter;
      const startDateMatch = !startDate || new Date(expense.date) >= startDate;
      const endDateMatch = !endDate || new Date(expense.date) <= endDate;
      return typeMatch && startDateMatch && endDateMatch;
    });
  }, [expenses, typeFilter, startDate, endDate]);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Add New Expense</CardTitle>
            </CardHeader>
            <CardContent>
              <AddExpenseForm onAddExpense={handleAddExpense} />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <ExpensesHistory
            expenses={filteredExpenses}
            onDelete={setExpenseToDelete}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            resetFilters={resetFilters}
          />
        </div>
      </div>

       <AlertDialog open={!!expenseToDelete} onOpenChange={(open) => !open && setExpenseToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this expense record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setExpenseToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
