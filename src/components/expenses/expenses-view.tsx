"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddExpenseForm } from "./add-expense-form";
import { ExpensesHistory } from "./expenses-history";
import { expenses as initialExpenses } from "@/lib/data";
import type { Expense, ExpenseCategory } from "@/types";

export function ExpensesView() {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [typeFilter, setTypeFilter] = useState<ExpenseCategory | "all">("all");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const handleAddExpense = (expense: Omit<Expense, "id">) => {
    const newExpense: Expense = {
      ...expense,
      id: (expenses.length + 1).toString(),
    };
    setExpenses((prev) => [newExpense, ...prev]);
  };

  const handleDeleteExpense = (expenseId: string) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== expenseId));
  };
  
  const resetFilters = () => {
    setTypeFilter("all");
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const typeMatch = typeFilter === 'all' || expense.type === typeFilter;
      const startDateMatch = !startDate || expense.date >= startDate;
      const endDateMatch = !endDate || expense.date <= endDate;
      return typeMatch && startDateMatch && endDateMatch;
    });
  }, [expenses, typeFilter, startDate, endDate]);

  return (
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
          onDelete={handleDeleteExpense}
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
  );
}
