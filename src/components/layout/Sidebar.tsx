"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Briefcase, LogOut, X, ChevronLeft, ChevronRight, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MenuItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarProps {
  role: string;
  menuItems: MenuItem[];
}

export default function Sidebar({ role, menuItems }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const roleLabels: Record<string, string> = {
    hr: "HR",
    admin: "ผู้ดูแลระบบ",
    manager: "ผู้จัดการ",
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-blue-700 px-4">
        <Link href="/" className="flex items-center gap-2 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <span className="whitespace-nowrap text-lg font-bold text-white">
              HR Recruit
            </span>
          )}
        </Link>
        {/* Close on mobile */}
        <button
          onClick={() => setMobileOpen(false)}
          className="text-white/70 hover:text-white lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
        {/* Collapse on desktop */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden text-white/70 hover:text-white lg:block"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className="px-4 py-3">
          <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-blue-200">
            {roleLabels[role] || role}
          </span>
        </div>
      )}

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-white/15 text-white"
                      : "text-blue-100 hover:bg-white/10 hover:text-white"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="border-t border-blue-700 p-3">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-blue-100 transition-colors hover:bg-white/10 hover:text-white"
          title={collapsed ? "ออกจากระบบ" : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>ออกจากระบบ</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-blue-800 transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden h-screen flex-col bg-blue-800 transition-all duration-300 lg:flex",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile trigger - exposed via data attribute for TopNav */}
      <button
        data-sidebar-trigger
        onClick={() => setMobileOpen(true)}
        className="hidden"
        aria-label="เปิดเมนู"
      />
    </>
  );
}
