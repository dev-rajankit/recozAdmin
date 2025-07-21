"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RevenueChart } from "./revenue-chart";
import { GrowthChart } from "./growth-chart";
import { ExpensePieChart } from "./expense-pie-chart";
import { useToast } from "@/hooks/use-toast";
import type { Member, Expense, ExpenseCategory } from "@/types";
import { subMonths, format, startOfMonth, endOfMonth } from 'date-fns';
import { Skeleton } from "../ui/skeleton";

interface MonthlyData {
  name: string;
  revenue: number;
  expenses: number;
}

interface GrowthData {
    name: string;
    members: number;
}

interface BreakdownData {
    name: string;
    value: number;
    fill: string;
}

const chartFills: Record<string, string> = {
  'Rent': "hsl(var(--chart-1))",
  'Electricity': "hsl(var(--chart-2))",
  'Internet': "hsl(var(--chart-3))",
  'Water': "hsl(var(--chart-4))",
  'Maintenance': "hsl(var(--chart-5))",
  'Supplies': "hsl(var(--destructive))",
  'Cleaning': "hsl(var(--primary))",
  'Other': "hsl(var(--secondary))",
};


export function FinancialView() {
  const [revenueVsExpenses, setRevenueVsExpenses] = useState<MonthlyData[]>([]);
  const [memberGrowth, setMemberGrowth] = useState<GrowthData[]>([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState<BreakdownData[]>([]);
  const [totals, setTotals] = useState({ revenue: 0, expenses: 0, profit: 0, margin: 0});
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchFinancialData = async () => {
      setIsLoading(true);
      try {
        const [membersRes, expensesRes] = await Promise.all([
          fetch('/api/members'),
          fetch('/api/expenses')
        ]);

        if (!membersRes.ok || !expensesRes.ok) {
          throw new Error('Failed to fetch financial data');
        }

        const members: Member[] = await membersRes.json();
        const expenses: Expense[] = await expensesRes.json();
        
        // --- Process Data ---
        const now = new Date();
        const monthlyData: MonthlyData[] = [];
        const growthData: GrowthData[] = [];

        for (let i = 5; i >= 0; i--) {
            const date = subMonths(now, i);
            const monthName = format(date, 'MMM');
            const monthStart = startOfMonth(date);
            const monthEnd = endOfMonth(date);

            const monthlyRevenue = members
                .filter(m => {
                    const paymentDate = new Date(m.paymentDate);
                    return paymentDate >= monthStart && paymentDate <= monthEnd;
                })
                .reduce((sum, m) => sum + m.feesPaid, 0);

            const monthlyExpenses = expenses
                .filter(e => {
                    const expenseDate = new Date(e.date);
                    return expenseDate >= monthStart && expenseDate <= monthEnd;
                })
                .reduce((sum, e) => sum + e.amount, 0);
            
            monthlyData.push({ name: monthName, revenue: monthlyRevenue, expenses: monthlyExpenses });

            const newMembersThisMonth = members.filter(m => {
                const paymentDate = new Date(m.paymentDate);
                return paymentDate >= monthStart && paymentDate <= monthEnd;
            }).length;
            
            growthData.push({ name: monthName, members: newMembersThisMonth });
        }
        
        const expenseCategories = expenses.reduce((acc, expense) => {
            const category = expense.type;
            acc[category] = (acc[category] || 0) + expense.amount;
            return acc;
        }, {} as Record<ExpenseCategory, number>);
        
        const breakdownData = Object.entries(expenseCategories).map(([name, value]) => ({
            name,
            value,
            fill: chartFills[name] || "hsl(var(--muted-foreground))"
        }));

        const totalRevenue = monthlyData.reduce((sum, item) => sum + item.revenue, 0);
        const totalExpenses = monthlyData.reduce((sum, item) => sum + item.expenses, 0);
        const netProfit = totalRevenue - totalExpenses;
        const netProfitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

        setRevenueVsExpenses(monthlyData);
        setMemberGrowth(growthData);
        setExpenseBreakdown(breakdownData);
        setTotals({
            revenue: totalRevenue,
            expenses: totalExpenses,
            profit: netProfit,
            margin: netProfitMargin,
        });

      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error fetching report data',
          description: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFinancialData();
  }, [toast]);


  if (isLoading) {
    return (
       <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
           <Skeleton className="h-[450px]" />
       </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
            <CardDescription>Last 6 months.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">₹{totals.revenue.toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Expenses</CardTitle>
            <CardDescription>Last 6 months.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">₹{totals.expenses.toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Net Profit</CardTitle>
            <CardDescription>Revenue minus expenses.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${totals.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{totals.profit.toLocaleString("en-IN")}
            </p>
            <p className="text-sm text-muted-foreground">{totals.margin.toFixed(1)}% margin</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="revenue">Revenue vs Expenses</TabsTrigger>
          <TabsTrigger value="growth">Member Growth</TabsTrigger>
          <TabsTrigger value="breakdown">Expense Breakdown</TabsTrigger>
        </TabsList>
        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue vs Expenses</CardTitle>
              <CardDescription>Comparison over the last 6 months.</CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueChart data={revenueVsExpenses} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="growth">
          <Card>
            <CardHeader>
              <CardTitle>New/Renewed Members</CardTitle>
              <CardDescription>Members with payments in the last 6 months.</CardDescription>
            </CardHeader>
            <CardContent>
              <GrowthChart data={memberGrowth} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="breakdown">
          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
              <CardDescription>Distribution of all-time expenses by category.</CardDescription>
            </CardHeader>
            <CardContent>
                {expenseBreakdown.length > 0 ? (
                    <ExpensePieChart data={expenseBreakdown} />
                ) : (
                    <div className="flex items-center justify-center h-[350px]">
                        <p>No expense data to display.</p>
                    </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
