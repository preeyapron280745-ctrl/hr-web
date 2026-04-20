"use client";

import { useSession } from "next-auth/react";
import Sidebar from "@/components/layout/Sidebar";
import TopNav from "@/components/layout/TopNav";
import { getMenuByRole } from "@/lib/menu-items";

export default function HRLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role || "HR";
  const menu = getMenuByRole(role);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar role={role.toLowerCase()} menuItems={menu} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
