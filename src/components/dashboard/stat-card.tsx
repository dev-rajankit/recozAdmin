import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  trend: number; // Positive for growth, negative for decline
  icon: React.ReactNode;
  trendPeriod?: string;
  valuePrefix?: string;
}

export function StatCard({ title, value, trend, icon, trendPeriod = "from last month", valuePrefix = "" }: StatCardProps) {
  const isPositive = trend >= 0;
  const trendColor = isPositive ? "text-green-600" : "text-red-600";
  const TrendIcon = isPositive ? ArrowUp : ArrowDown;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {valuePrefix}{value}
        </div>
        <p className="text-xs text-muted-foreground flex items-center">
          <span className={`flex items-center ${trendColor}`}>
            <TrendIcon className="h-4 w-4 mr-1" />
            {Math.abs(trend)}%
          </span>
          <span className="ml-1">{trendPeriod}</span>
        </p>
      </CardContent>
    </Card>
  );
}
