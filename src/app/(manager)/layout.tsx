"use client";

import Sidebar, { MenuItem } from "@/components/layout/Sidebar";
import TopNav from "@/components/layout/TopNav";
import {
  LayoutDashboard,
  UserCheck,
  CalendarCheck,
} from "lucide-react";

const managerMenuItems: MenuItem[] = [
  { label: "Dashboard", href: "/manager/dashboard", icon: LayoutDashboard },
  { label: "รีวิวผู้สมัคร", href: "/manager/reviews", icon: UserCheck },
  { label: "สัมภาษณ์", href: "/manager/interviews", icon: CalendarCheck },
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
