import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  FileText,
  FilePlus,
  ClipboardList,
  UserCheck,
  Award,
  UserX,
  Settings,
  FileSearch,
  Inbox,
  LucideIcon,
} from "lucide-react";

export interface MenuItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const ADMIN_MENU: MenuItem[] = [
  { label: "Dashboard รวม", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "ถังพัก", href: "/hr/tank", icon: Inbox },
  { label: "From Resume", href: "/hr/from-resume", icon: FilePlus },
  { label: "Resume", href: "/hr/resume", icon: FileText },
  { label: "ข้อมูล Resume", href: "/manager/resume-data", icon: FileSearch },
  { label: "ตำแหน่งงาน", href: "/hr/postings", icon: Briefcase },
  { label: "Form ใบสมัคร", href: "/apply", icon: ClipboardList },
  { label: "ใบสมัครงาน (HR)", href: "/hr/applications", icon: FileText },
  { label: "ใบสมัครงาน (หัวหน้าแผนก)", href: "/manager/reviews", icon: FileText },
  { label: "ใบประเมินสัมภาษณ์", href: "/manager/interview-eval", icon: UserCheck },
  { label: "ใบประเมินทดลองงาน", href: "/hr/probation", icon: Award },
  { label: "ไม่ผ่าน/ปฏิเสธ", href: "/hr/rejected", icon: UserX },
  { label: "จัดการผู้ใช้", href: "/admin/users", icon: Users },
  { label: "แผนก/ตำแหน่ง", href: "/admin/departments", icon: Building2 },
  { label: "ตั้งค่าระบบ", href: "/admin/settings", icon: Settings },
];

export const HR_MENU: MenuItem[] = [
  { label: "Dashboard รวม", href: "/hr/dashboard", icon: LayoutDashboard },
  { label: "ถังพัก", href: "/hr/tank", icon: Inbox },
  { label: "From Resume", href: "/hr/from-resume", icon: FilePlus },
  { label: "Resume", href: "/hr/resume", icon: FileText },
  { label: "ตำแหน่งงาน", href: "/hr/postings", icon: Briefcase },
  { label: "Form ใบสมัคร", href: "/apply", icon: ClipboardList },
  { label: "ใบสมัครงาน (HR)", href: "/hr/applications", icon: FileText },
  { label: "ใบประเมินสัมภาษณ์", href: "/manager/interview-eval", icon: UserCheck },
  { label: "ใบประเมินทดลองงาน", href: "/hr/probation", icon: Award },
  { label: "ไม่ผ่าน/ปฏิเสธ", href: "/hr/rejected", icon: UserX },
];

export const MANAGER_MENU: MenuItem[] = [
  { label: "Dashboard รวม", href: "/manager/dashboard", icon: LayoutDashboard },
  { label: "ข้อมูล Resume", href: "/manager/resume-data", icon: FileSearch },
  { label: "ใบสมัครงาน (หัวหน้าแผนก)", href: "/manager/reviews", icon: FileText },
  { label: "ใบประเมินสัมภาษณ์", href: "/manager/interview-eval", icon: UserCheck },
  { label: "ใบประเมินทดลองงาน", href: "/manager/probation-eval", icon: Award },
];

export function getMenuByRole(role: string | undefined): MenuItem[] {
  if (role === "ADMIN") return ADMIN_MENU;
  if (role === "HR") return HR_MENU;
  if (role === "MANAGER") return MANAGER_MENU;
  return [];
}
