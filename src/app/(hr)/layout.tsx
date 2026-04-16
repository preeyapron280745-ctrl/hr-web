"use client";

import Sidebar, { MenuItem } from "@/components/layout/Sidebar";
import TopNav from "@/components/layout/TopNav";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  CalendarCheck,
  Users,
  BarChart3,
} from "lucide-react";

const hrMenuItems: MenuItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "ตำแหน่งงาน", href: "/postings", icon: Briefcase },
  { label: "ใบสมัคร", href: "/applications", icon: FileText },
  { label: "สัมภาษณ์", href: "/interviews", icon: CalendarCheck },
  { label: "ผู้สมัคร", href: "/candidates", icon: Users },
  { label: "รายงาน", href: "/reports", icon: BarChart3 },
];

export default function HRLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar role="hr" menuItems={hrMenuItems} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
