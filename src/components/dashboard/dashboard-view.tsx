import React from "react";
import { StatCard } from "./stat-card";
import { Users, IndianRupee, UserX, Hourglass } from "lucide-react";
import { members } from "@/lib/data";

export function DashboardView() {
  const activeMembers = members.filter(m => m.status === 'Active').length;
  const expiredMembers = members.filter(m => m.status === 'Expired').length;
  // Dummy data for trends
  const activeMembersTrend = 12.5;
  const expiredMembersTrend = -3.2;
  const monthlyRevenue = 85600;
  const revenueTrend = 20.1;
  const pendingPayments = 12500;
  const pendingPaymentsTrend = 5;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Active Members"
        value={activeMembers.toString()}
        trend={activeMembersTrend}
        icon={<Users className="h-5 w-5" />}
      />
      <StatCard
        title="Expired Members"
        value={expiredMembers.toString()}
        trend={expiredMembersTrend}
        icon={<UserX className="h-5 w-5" />}
        trendPeriod="less than last month"
      />
      <StatCard
        title="Monthly Revenue"
        value={monthlyRevenue.toLocaleString('en-IN')}
        valuePrefix="₹"
        trend={revenueTrend}
        icon={<IndianRupee className="h-5 w-5" />}
      />
      <StatCard
        title="Pending Payments"
        value={pendingPayments.toLocaleString('en-IN')}
        valuePrefix="₹"
        trend={pendingPaymentsTrend}
        icon={<Hourglass className="h-5 w-5" />}
      />
    </div>
  );
}
