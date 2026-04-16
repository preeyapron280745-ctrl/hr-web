"use client";

import { useSession, signOut } from "next-auth/react";
import { Menu, LogOut, User } from "lucide-react";

interface TopNavProps {
  title?: string;
  showHamburger?: boolean;
}

export default function TopNav({ title, showHamburger = true }: TopNavProps) {
  const { data: session } = useSession();

  const roleLabels: Record<string, string> = {
    hr: "HR",
    admin: "ผู้ดูแลระบบ",
    manager: "ผู้จัดการ",
    applicant: "ผู้สมัครงาน",
  };

  const roleBadgeColors: Record<string, string> = {
    hr: "bg-blue-100 text-blue-700",
    admin: "bg-purple-100 text-purple-700",
    manager: "bg-green-100 text-green-700",
    applicant: "bg-orange-100 text-orange-700",
  };

  const handleMobileMenu = () => {
    const trigger = document.querySelector<HTMLButtonElement>(
      "[data-sidebar-trigger]"
    );
    trigger?.click();
  };

  const userRole = (session?.user as { role?: string })?.role || "";
  const userName = session?.user?.name || "ผู้ใช้งาน";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        {showHamburger && (
          <button
            onClick={handleMobileMenu}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
            aria-label="เปิดเมนู"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        {title && (
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-3">
        {userRole && (
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              roleBadgeColors[userRole] || "bg-gray-100 text-gray-700"
            }`}
          >
            {roleLabels[userRole] || userRole}
          </span>
        )}

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <span className="hidden text-sm font-medium text-gray-700 sm:block">
            {userName}
          </span>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          title="ออกจากระบบ"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
