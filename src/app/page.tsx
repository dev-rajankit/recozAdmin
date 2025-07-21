"use client";

import * as React from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { MembersView } from "@/components/members/members-view";
import { ExpensesView } from "@/components/expenses/expenses-view";
import { FinancialView } from "@/components/financial/financial-view";

type Section = "dashboard" | "members" | "expenses" | "reports" | "settings";

export default function Home() {
  const [activeSection, setActiveSection] = React.useState<Section>("dashboard");

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardView />;
      case "members":
        return <MembersView />;
      case "expenses":
        return <ExpensesView />;
      case "reports":
        return <FinancialView />;
      case "settings":
        return <div className="p-6"><h1 className="text-2xl font-headline">Settings</h1><p>System configuration options will be available here.</p></div>
      default:
        return <DashboardView />;
    }
  };
  
  const sectionTitles: Record<Section, string> = {
    dashboard: "Dashboard",
    members: "Member Management",
    expenses: "Expense Tracking",
    reports: "Financial Reports",
    settings: "Settings"
  };

  return (
    <SidebarProvider>
      <AppSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <SidebarInset className="bg-background min-h-screen">
        <Header title={sectionTitles[activeSection]} />
        <main className="p-4 sm:p-6 lg:p-8">
          {renderSection()}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
