"use client";

import { useEffect, useState } from "react";
import { FileText, ClipboardList, UserCheck, Award, ArrowUpRight } from "lucide-react";
import Link from "next/link";

type Stats = {
  resumes: number;
  applications: number;
  interviews: number;
  probations: number;
};

export default function DashboardOverview({ role }: { role: "hr" | "manager" | "admin" }) {
  const [stats, setStats] = useState<Stats>({ resumes: 0, applications: 0, interviews: 0, probations: 0 });
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
      href: role === "manager" ? "/manager/resume-data" : "/hr/resume",
    },
    {
      title: "สรุปภาพรวม ใบสมัครงาน",
      subtitle: "จำนวนใบสมัครงาน",
      value: stats.applications,
      icon: ClipboardList,
      color: "bg-emerald-600",
      href: role === "manager" ? "/manager/reviews" : "/hr/applications",
    },
    {
      title: "สรุปภาพรวม ใบประเมินสัมภาษณ์",
      subtitle: "จำนวนใบประเมินสัมภาษณ์",
      value: stats.interviews,
      icon: UserCheck,
      color: "bg-teal-600",
      href: role === "manager" ? "/manager/interview-eval" : "/hr/interviews",
    },
    {
      title: "สรุปภาพรวม ใบประเมินทดลองงาน",
      subtitle: "จำนวนใบประเมินทดลองงาน",
      value: stats.probations,
      icon: Award,
      color: "bg-lime-600",
      href: role === "manager" ? "/manager/probation-eval" : "/hr/probation",
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard รวม</h1>
        <p className="mt-1 text-sm text-gray-500">ภาพรวมสถานะระบบสมัครงาน</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-green-400 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.color} text-white`}>
                  <card.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600">{card.title}</h3>
                </div>
              </div>
              <ArrowUpRight className="h-5 w-5 text-gray-400 transition-colors group-hover:text-green-600" />
            </div>
            <div className="mt-6">
              <p className="text-lg font-semibold text-gray-700">{card.subtitle}</p>
              <p className="mt-2 text-5xl font-bold text-gray-900">
                {loading ? "..." : card.value.toLocaleString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
