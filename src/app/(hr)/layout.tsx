"use client";

import Sidebar, { MenuItem } from "@/components/layout/Sidebar";
import TopNav from "@/components/layout/TopNav";
import {
  LayoutDashboard,
  FilePlus,
  FileText,
  FileSearch,
  Briefcase,
  ClipboardList,
  UserCheck,
  Award,
  CalendarCheck,
  UserX,
} from "lucide-react";

const hrMenuItems: MenuItem[] = [
  { label: "Dashboard รวม", href: "/hr/dashboard", icon: LayoutDashboard },
  { label: "From Resume", href: "/hr/from-resume", icon: FilePlus },
  { label: "Resume", href: "/hr/resume", icon: FileText },
  { label: "ข้อมูล Resume", href: "/hr/resume-data", icon: FileSearch },
  { label: "ตำแหน่งงาน", href: "/hr/postings", icon: Briefcase },
  { label: "Form ใบสมัคร", href: "/apply", icon: ClipboardList },
  { label: "ใบสมัครงาน (HR)", href: "/hr/applications", icon: FileText },
  { label: "ใบประเมินสัมภาษณ์", href: "/hr/interviews", icon: UserCheck },
  { label: "ใบประเมินทดลองงาน", href: "/hr/probation", icon: Award },
  { label: "สัมภาษณ์", href: "/hr/schedule", icon: CalendarCheck },
  { label: "ไม่ผ่าน/ปฏิเสธ", href: "/hr/rejected", icon: UserX },
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
