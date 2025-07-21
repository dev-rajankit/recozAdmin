"use client";

import React from "react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BarChart2,
  Settings,
  LogOut,
  Building,
  User,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";

type Section = "dashboard" | "members" | "expenses" | "reports" | "account" | "settings";

interface AppSidebarProps {
  activeSection: Section;
  setActiveSection: (section: Section) => void;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "members", label: "Members", icon: Users },
  { id: "expenses", label: "Expenses", icon: CreditCard },
  { id: "reports", label: "Reports", icon: BarChart2 },
] as const;

const settingsItems = [
    { id: "account", label: "My Account", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
] as const;

export function AppSidebar({ activeSection, setActiveSection }: AppSidebarProps) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <Button variant="ghost" size="icon" className="h-9 w-9 bg-primary/10 text-primary">
            <Building className="h-5 w-5" />
          </Button>
          <div className="flex flex-col">
            <h2 className="font-headline text-lg font-semibold">CoWork Central</h2>
            <p className="text-xs text-muted-foreground">Recoz Admin</p>
          </div>
        </div>
      </SidebarHeader>
      <Separator />
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                onClick={() => setActiveSection(item.id)}
                isActive={activeSection === item.id}
                tooltip={item.label}
              >
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <Separator />
      <SidebarFooter>
        <SidebarMenu>
          {settingsItems.map((item) => (
             <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                onClick={() => setActiveSection(item.id)}
                isActive={activeSection === item.id}
                tooltip={item.label}
              >
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Logout" onClick={handleLogout}>
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
