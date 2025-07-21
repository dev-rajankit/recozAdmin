"use client";

import React, { useEffect, useState } from "react";
import { StatCard } from "./stat-card";
import { Users, IndianRupee, UserX, Hourglass } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import type { Member } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  activeMembers: number;
  expiredMembers: number;
  monthlyRevenue: number;
  pendingPayments: number;
}

export function DashboardView() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/members');
        if (!response.ok) {
          throw new Error('Failed to fetch member data');
        }
        const members: Member[] = await response.json();
        
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const activeMembers = members.filter(m => new Date(m.dueDate) >= now).length;
        const expiredMembers = members.length - activeMembers;
        
        const monthlyRevenue = members
            .filter(m => new Date(m.paymentDate) >= firstDayOfMonth)
            .reduce((sum, m) => sum + m.feesPaid, 0);

        const pendingPayments = members
            .filter(m => new Date(m.dueDate) < now) 
            .reduce((sum, m) => sum + m.feesPaid, 0);


        setStats({
          activeMembers,
          expiredMembers,
          monthlyRevenue,
          pendingPayments,
        });

      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error fetching dashboard data',
          description: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  if (isLoading || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
    );
  }

  const activeMembersTrend = 0;
  const expiredMembersTrend = 0;
  const revenueTrend = 0;
  const pendingPaymentsTrend = 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Active Members"
        value={stats.activeMembers.toString()}
        trend={activeMembersTrend}
        icon={<Users className="h-5 w-5" />}
      />
      <StatCard
        title="Expired Members"
        value={stats.expiredMembers.toString()}
        trend={expiredMembersTrend}
        icon={<UserX className="h-5 w-5" />}
        trendPeriod=""
      />
      <StatCard
        title="Monthly Revenue"
        value={stats.monthlyRevenue.toLocaleString('en-IN')}
        valuePrefix="₹"
        trend={revenueTrend}
        icon={<IndianRupee className="h-5 w-5" />}
      />
      <StatCard
        title="Pending Payments"
        value={stats.pendingPayments.toLocaleString('en-IN')}
        valuePrefix="₹"
        trend={pendingPaymentsTrend}
        icon={<Hourglass className="h-5 w-5" />}
      />
    </div>
  );
}
