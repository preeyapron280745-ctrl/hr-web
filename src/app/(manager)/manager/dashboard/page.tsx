"use client";

import { useEffect, useState } from "react";
import {
  UserCheck,
  CalendarCheck,
  Clock,
  Loader2,
  ChevronRight,
} from "lucide-react";

interface ManagerStats {
  pendingReviews: number;
  upcomingInterviews: Interview[];
}

interface Interview {
  id: string;
  candidateName: string;
  position: string;
  date: string;
  time: string;
}

export default function ManagerDashboardPage() {
  const [stats, setStats] = useState<ManagerStats>({
    pendingReviews: 0,
    upcomingInterviews: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/manager/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch manager stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

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
          Dashboard ผู้จัดการ
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          รีวิวผู้สมัครและจัดการสัมภาษณ์
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                รอรีวิว
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats.pendingReviews}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-50">
              <UserCheck className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <a
            href="/manager/reviews"
            className="mt-4 flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            ดูทั้งหมด
            <ChevronRight className="h-4 w-4" />
          </a>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                สัมภาษณ์ที่กำลังจะมาถึง
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats.upcomingInterviews.length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
              <CalendarCheck className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <a
            href="/manager/interviews"
            className="mt-4 flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            ดูทั้งหมด
            <ChevronRight className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* Upcoming Interviews */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          การสัมภาษณ์ที่กำลังจะมาถึง
        </h2>
        {stats.upcomingInterviews.length === 0 ? (
          <div className="py-8 text-center">
            <CalendarCheck className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <p className="text-sm text-gray-500">ยังไม่มีนัดสัมภาษณ์</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.upcomingInterviews.map((interview) => (
              <div
                key={interview.id}
                className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {interview.candidateName}
                  </p>
                  <p className="text-sm text-gray-500">{interview.position}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>
                    {interview.date} {interview.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
