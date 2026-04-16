"use client";

import Sidebar, { MenuItem } from "@/components/layout/Sidebar";
import TopNav from "@/components/layout/TopNav";
import {
  LayoutDashboard,
  Users,
  Building2,
  Settings,
} from "lucide-react";

const adminMenuItems: MenuItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "จัดการผู้ใช้", href: "/admin/users", icon: Users },
  { label: "แผนก/ตำแหน่ง", href: "/admin/departments", icon: Building2 },
  { label: "ตั้งค่า", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar role="admin" menuItems={adminMenuItems} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
