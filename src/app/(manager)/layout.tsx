"use client";

import Sidebar, { MenuItem } from "@/components/layout/Sidebar";
import TopNav from "@/components/layout/TopNav";
import {
  LayoutDashboard,
  FileSearch,
  FileText,
  UserCheck,
  Award,
} from "lucide-react";

const managerMenuItems: MenuItem[] = [
  { label: "Dashboard รวม", href: "/manager/dashboard", icon: LayoutDashboard },
  { label: "ข้อมูล Resume", href: "/manager/resume-data", icon: FileSearch },
  { label: "ใบสมัครงาน (หัวหน้าแผนก)", href: "/manager/reviews", icon: FileText },
  { label: "ใบประเมินสัมภาษณ์", href: "/manager/interview-eval", icon: UserCheck },
  { label: "ใบประเมินทดลองงาน", href: "/manager/probation-eval", icon: Award },
];

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar role="manager" menuItems={managerMenuItems} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
