"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Building2,
  Briefcase,
  DoorOpen,
  TrendingUp,
  Loader2,
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalDepartments: number;
  totalPositions: number;
  openPositions: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalDepartments: 0,
    totalPositions: 0,
    openPositions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch admin stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      label: "จำนวนผู้ใช้",
      value: stats.totalUsers,
      icon: Users,
      bgLight: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "แผนก",
      value: stats.totalDepartments,
      icon: Building2,
      bgLight: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      label: "ตำแหน่งงาน",
      value: stats.totalPositions,
      icon: Briefcase,
      bgLight: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      label: "ตำแหน่งที่เปิดรับ",
      value: stats.openPositions,
      icon: DoorOpen,
      bgLight: "bg-amber-50",
      textColor: "text-amber-600",
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
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard ผู้ดูแลระบบ
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          ภาพรวมระบบและการจัดการผู้ใช้งาน
        </p>
      </div>

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

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            ผู้ใช้งานล่าสุด
          </h2>
          <p className="text-sm text-gray-500">ยังไม่มีข้อมูลผู้ใช้งาน</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            กิจกรรมล่าสุด
          </h2>
          <p className="text-sm text-gray-500">ยังไม่มีกิจกรรม</p>
        </div>
      </div>
    </div>
  );
}
