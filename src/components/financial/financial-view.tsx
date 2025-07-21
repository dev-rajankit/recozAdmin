"use client";

import React from "react";
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
import { financialData } from "@/lib/data";

export function FinancialView() {
  const { revenueVsExpenses, memberGrowth, expenseBreakdown } = financialData;

  const totalRevenue = revenueVsExpenses.reduce((sum, item) => sum + item.revenue, 0);
  const totalExpenses = revenueVsExpenses.reduce((sum, item) => sum + item.expenses, 0);
  const netProfit = totalRevenue - totalExpenses;
  const netProfitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
            <CardDescription>Cumulative revenue across all months.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">₹{totalRevenue.toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Expenses</CardTitle>
            <CardDescription>Cumulative expenses across all months.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">₹{totalExpenses.toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Net Profit</CardTitle>
            <CardDescription>Revenue minus expenses.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              ₹{netProfit.toLocaleString("en-IN")}
            </p>
            <p className="text-sm text-muted-foreground">{netProfitMargin.toFixed(1)}% margin</p>
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
              <CardTitle>Member Growth</CardTitle>
              <CardDescription>Member count progression over the last 6 months.</CardDescription>
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
              <CardDescription>Distribution of expenses by category.</CardDescription>
            </CardHeader>
            <CardContent>
              <ExpensePieChart data={expenseBreakdown} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
