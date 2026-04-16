"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Filter,
  CalendarCheck,
  Clock,
  TrendingUp,
  Loader2,
} from "lucide-react";

interface DashboardStats {
  total: number;
  screening: number;
  interview: number;
  pendingApproval: number;
}

export default function HRDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    screening: 0,
    interview: 0,
    pendingApproval: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/applications?stats=true");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      label: "จำนวนใบสมัครทั้งหมด",
      value: stats.total,
      icon: FileText,
      color: "bg-blue-500",
      bgLight: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "รอคัดกรอง",
      value: stats.screening,
      icon: Filter,
      color: "bg-amber-500",
      bgLight: "bg-amber-50",
      textColor: "text-amber-600",
    },
    {
      label: "นัดสัมภาษณ์",
      value: stats.interview,
      icon: CalendarCheck,
      color: "bg-green-500",
      bgLight: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      label: "รออนุมัติ",
      value: stats.pendingApproval,
      icon: Clock,
      color: "bg-purple-500",
      bgLight: "bg-purple-50",
      textColor: "text-purple-600",
    },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          ภาพรวมการสมัครงานและกระบวนการสรรหา
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {card.label}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {card.value}
                  </p>
                </div>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.bgLight}`}
                >
                  <Icon className={`h-6 w-6 ${card.textColor}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs text-gray-500">
                <TrendingUp className="h-3 w-3" />
                <span>อัปเดตล่าสุด</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Placeholder sections */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            ใบสมัครล่าสุด
          </h2>
          <p className="text-sm text-gray-500">ยังไม่มีข้อมูลใบสมัคร</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            การสัมภาษณ์ที่กำลังจะมาถึง
          </h2>
          <p className="text-sm text-gray-500">ยังไม่มีนัดสัมภาษณ์</p>
        </div>
      </div>
    </div>
  );
}
