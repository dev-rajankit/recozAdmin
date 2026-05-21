"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Badge } from "../ui/badge";

interface ExpensePieChartProps {
  data: { name: string; value: number, fill: string }[];
}

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};


const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col space-y-1">
            <span className="text-sm text-muted-foreground">
              {payload[0].name}
            </span>
            <span className="font-bold">
              ₹{payload[0].value.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};


export function ExpensePieChart({ data }: ExpensePieChartProps) {
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 items-center" style={{ height: 350 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-col gap-2">
          <h3 className="font-semibold mb-2">Categories</h3>
          {data.map((entry) => (
              <div key={entry.name} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{backgroundColor: entry.fill}} />
                      <span>{entry.name}</span>
                  </div>
                  <Badge variant="outline">₹{entry.value.toLocaleString('en-IN')}</Badge>
              </div>
          ))}
      </div>
    </div>
  );
}
