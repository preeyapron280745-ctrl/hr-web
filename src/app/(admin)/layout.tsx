"use client";

import Sidebar, { MenuItem } from "@/components/layout/Sidebar";
import TopNav from "@/components/layout/TopNav";
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  FileText,
  UserCheck,
  Award,
  UserX,
  Settings,
  FileSearch,
} from "lucide-react";

const adminMenuItems: MenuItem[] = [
  { label: "Dashboard รวม", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "จัดการผู้ใช้", href: "/admin/users", icon: Users },
  { label: "แผนก/ตำแหน่ง", href: "/admin/departments", icon: Building2 },
  { label: "ตำแหน่งงาน", href: "/hr/postings", icon: Briefcase },
  { label: "ใบสมัครทั้งหมด", href: "/hr/applications", icon: FileText },
  { label: "ข้อมูล Resume", href: "/hr/resume-data", icon: FileSearch },
  { label: "ใบประเมินสัมภาษณ์", href: "/hr/interviews", icon: UserCheck },
  { label: "ใบประเมินทดลองงาน", href: "/hr/probation", icon: Award },
  { label: "ไม่ผ่าน/ปฏิเสธ", href: "/hr/rejected", icon: UserX },
  { label: "ตั้งค่าระบบ", href: "/admin/settings", icon: Settings },
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
