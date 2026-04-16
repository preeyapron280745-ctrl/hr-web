"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  ClipboardList,
  UserCheck,
  Award,
  ArrowUpRight,
  TrendingUp,
  Users,
  Building2,
  Briefcase,
} from "lucide-react";
import Link from "next/link";

type Stats = {
  resumes: number;
  applications: number;
  interviews: number;
  probations: number;
  byStatus?: Record<string, number>;
  byCompany?: Record<string, number>;
  byEmployeeType?: Record<string, number>;
  totalDepartments?: number;
  totalPositions?: number;
};

const STATUS_LABELS: Record<string, string> = {
  SUBMITTED: "ส่งใบสมัครแล้ว",
  SCREENING: "กำลังคัดกรอง",
  INTERVIEW_SCHEDULED: "นัดสัมภาษณ์",
  INTERVIEWED: "สัมภาษณ์แล้ว",
  PROBATION: "ทดลองงาน",
  HIRED: "บรรจุแล้ว",
  REJECTED: "ไม่ผ่าน",
};

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: "bg-blue-500",
  SCREENING: "bg-yellow-500",
  INTERVIEW_SCHEDULED: "bg-purple-500",
  INTERVIEWED: "bg-indigo-500",
  PROBATION: "bg-orange-500",
  HIRED: "bg-green-600",
  REJECTED: "bg-red-500",
};

const COMPANY_LABELS: Record<string, string> = {
  COMETS_HQ: "Comets HQ",
  COMETS_FACTORY: "Comets Factory",
  ICT: "ICT Manufacturing",
};

const EMPLOYEE_TYPE_LABELS: Record<string, string> = {
  MONTHLY: "พนักงานรายเดือน",
  DAILY: "พนักงานรายวัน",
  INTERN: "นักศึกษาฝึกงาน",
};

export default function DashboardOverview({ role }: { role: "hr" | "manager" | "admin" }) {
  const [stats, setStats] = useState<Stats>({
    resumes: 0,
    applications: 0,
    interviews: 0,
    probations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      title: "สรุปภาพรวม RESUME",
      subtitle: "จำนวน RESUME",
      value: stats.resumes,
      icon: FileText,
      color: "bg-green-600",
      lightColor: "bg-green-50",
      textColor: "text-green-700",
      href: role === "manager" ? "/manager/resume-data" : "/hr/resume",
    },
    {
      title: "สรุปภาพรวม ใบสมัครงาน",
      subtitle: "จำนวนใบสมัครงาน",
      value: stats.applications,
      icon: ClipboardList,
      color: "bg-emerald-600",
      lightColor: "bg-emerald-50",
      textColor: "text-emerald-700",
      href: role === "manager" ? "/manager/reviews" : "/hr/applications",
    },
    {
      title: "สรุปภาพรวม ใบประเมินสัมภาษณ์",
      subtitle: "จำนวนใบประเมินสัมภาษณ์",
      value: stats.interviews,
      icon: UserCheck,
      color: "bg-teal-600",
      lightColor: "bg-teal-50",
      textColor: "text-teal-700",
      href: role === "manager" ? "/manager/interview-eval" : "/hr/interviews",
    },
    {
      title: "สรุปภาพรวม ใบประเมินทดลองงาน",
      subtitle: "จำนวนใบประเมินทดลองงาน",
      value: stats.probations,
      icon: Award,
      color: "bg-lime-600",
      lightColor: "bg-lime-50",
      textColor: "text-lime-700",
      href: role === "manager" ? "/manager/probation-eval" : "/hr/probation",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard รวม</h1>
        <p className="mt-1 text-sm text-gray-500">ภาพรวมสถานะระบบสมัครงาน</p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-green-400 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.color} text-white`}>
                <card.icon className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-gray-400 transition-colors group-hover:text-green-600" />
            </div>
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-500">{card.title}</p>
              <p className="mt-1 text-sm font-semibold text-gray-700">{card.subtitle}</p>
              <p className={`mt-2 text-4xl font-bold ${card.textColor}`}>
                {loading ? "..." : card.value.toLocaleString()}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Pipeline by Status */}
      {stats.byStatus && Object.keys(stats.byStatus).length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Pipeline ตามสถานะ</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(STATUS_LABELS).map(([key, label]) => {
              const count = stats.byStatus?.[key] ?? 0;
              const total = stats.applications;
              const pct = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={key} className="rounded-lg border border-gray-100 bg-gray-50/50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">{label}</span>
                    <span className="text-xs text-gray-400">{pct.toFixed(0)}%</span>
                  </div>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {count.toLocaleString()}
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={`h-full ${STATUS_COLORS[key]} transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* By Company & Employee Type */}
      <div className="grid gap-6 lg:grid-cols-2">
        {stats.byCompany && Object.keys(stats.byCompany).length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">แยกตามบริษัท</h2>
            </div>
            <div className="space-y-3">
              {Object.entries(stats.byCompany).map(([key, count]) => {
                const total = Object.values(stats.byCompany!).reduce((a, b) => a + b, 0);
                const pct = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={key}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">
                        {COMPANY_LABELS[key] || key}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {count.toLocaleString()} ({pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-600"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {stats.byEmployeeType && Object.keys(stats.byEmployeeType).length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">แยกตามประเภทพนักงาน</h2>
            </div>
            <div className="space-y-3">
              {Object.entries(stats.byEmployeeType).map(([key, count]) => {
                const total = Object.values(stats.byEmployeeType!).reduce((a, b) => a + b, 0);
                const pct = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={key}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">
                        {EMPLOYEE_TYPE_LABELS[key] || key}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {count.toLocaleString()} ({pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-green-600"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {(stats.totalDepartments != null || stats.totalPositions != null) && (
        <div className="grid gap-4 md:grid-cols-2">
          {stats.totalDepartments != null && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-700">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">จำนวนแผนก</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalDepartments}</p>
                </div>
              </div>
            </div>
          )}
          {stats.totalPositions != null && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">ตำแหน่งงานเปิดรับ</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPositions}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
