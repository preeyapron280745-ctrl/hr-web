"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Briefcase, FileText, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const applicantMenu = [
  { label: "ใบสมัครของฉัน", href: "/my-applications", icon: FileText },
  { label: "โปรไฟล์", href: "/profile", icon: User },
];

export default function ApplicantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userName = session?.user?.name || "ผู้สมัครงาน";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">HR Recruit</span>
            </Link>

            <nav className="hidden items-center gap-1 sm:flex">
              {applicantMenu.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-700">
              ผู้สมัครงาน
            </span>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <span className="hidden text-sm font-medium text-gray-700 sm:block">
                {userName}
              </span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login/applicant" })}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              title="ออกจากระบบ"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="flex border-t border-gray-100 sm:hidden">
          {applicantMenu.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 py-2.5 text-xs font-medium transition-colors",
                  isActive
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-4 sm:p-6">{children}</main>
    </div>
  );
}
