"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import { format } from "date-fns";
import type { Expense, ExpenseCategory } from "@/types";

interface AddExpenseFormProps {
  onAddExpense: (expense: Omit<Expense, "id">) => void;
}

const expenseCategories: ExpenseCategory[] = ['Rent', 'Electricity', 'Internet', 'Water', 'Maintenance', 'Supplies', 'Cleaning', 'Other'];

export function AddExpenseForm({ onAddExpense }: AddExpenseFormProps) {
  const [type, setType] = useState<ExpenseCategory | undefined>();
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [description, setDescription] = useState("");

  const handleDateChange = (value: string, setter: (d: Date | undefined) => void) => {
    if (!value) {
      setter(undefined);
      return;
    }
    const [year, month, day] = value.split("-").map(Number);
    setter(new Date(year, month - 1, day));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !amount || !date) {
      alert("Please fill all required fields");
      return;
    }
    onAddExpense({
      type,
      amount: parseFloat(amount),
      date,
      description,
    });
    // Reset form
    setType(undefined);
    setAmount("");
    setDate(new Date());
    setDescription("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="expenseType">Expense Type</Label>
        <Select onValueChange={(value: ExpenseCategory) => setType(value)} value={type}>
          <SelectTrigger id="expenseType">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {expenseCategories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="amount">Amount (₹)</Label>
        <Input
          id="amount"
          type="number"
          placeholder="e.g., 1500"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={date ? format(date, "yyyy-MM-dd") : ""}
          onChange={(e) => handleDateChange(e.target.value, setDate)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Optional details..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <Button type="submit" className="w-full">
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Expense
      </Button>
    </form>
  );
}
