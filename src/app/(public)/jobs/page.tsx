"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Briefcase,
  Building2,
  FileText,
  Loader2,
} from "lucide-react";

interface Position {
  id: string;
  title: string;
  company: string | null;
  active: boolean;
  department?: { id: string; name: string };
}

const COMPANY_INFO: Record<string, { name: string; short: string; color: string }> = {
  COMETS_HQ: {
    name: "บริษัท คอมเม็ทส์ อินเตอร์เทรด จำกัด (Head Quarter)",
    short: "Comets HQ",
    color: "bg-green-100 text-green-700",
  },
  COMETS_FACTORY: {
    name: "บริษัท คอมเม็ทส์ อินเตอร์เทรด จำกัด (Factory)",
    short: "Comets Factory",
    color: "bg-emerald-100 text-emerald-700",
  },
  ICT: {
    name: "ICT MANUFACTURING CO., LTD.",
    short: "ICT Manufacturing",
    color: "bg-teal-100 text-teal-700",
  },
};

export default function JobsPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");

  useEffect(() => {
    fetch("/api/positions")
      .then((r) => r.json())
      .then((data: Position[]) => setPositions(data.filter((p) => p.active)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return positions.filter((p) => {
      if (companyFilter && p.company !== companyFilter) return false;
      if (q.trim()) {
        const s = q.trim().toLowerCase();
        const name = p.title.toLowerCase();
        const dept = p.department?.name?.toLowerCase() || "";
        if (!name.includes(s) && !dept.includes(s)) return false;
      }
      return true;
    });
  }, [positions, q, companyFilter]);

  const grouped = useMemo(() => {
    const map: Record<string, Position[]> = {};
    filtered.forEach((p) => {
      const key = p.company || "OTHER";
      if (!map[key]) map[key] = [];
      map[key].push(p);
    });
    return map;
  }, [filtered]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-600">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">Comets HR</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 hover:text-green-600">
              เจ้าหน้าที่
            </Link>
            <Link
              href="/apply"
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              สมัครงาน
            </Link>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <div className="border-b border-gray-100 bg-green-50/50 py-10">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900">ตำแหน่งงานที่เปิดรับ</h1>
          <p className="mt-2 text-gray-600">ค้นหาตำแหน่งที่เหมาะสมกับคุณ</p>

          <div className="mx-auto mt-6 max-w-2xl">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ค้นหาตำแหน่งงาน, แผนก..."
                className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-12 pr-4 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
              />
            </div>
          </div>

          {/* Company filter */}
          <div className="mx-auto mt-4 flex max-w-2xl flex-wrap justify-center gap-2">
            <button
              onClick={() => setCompanyFilter("")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                !companyFilter
                  ? "bg-green-600 text-white shadow"
                  : "bg-white text-gray-700 border border-gray-300 hover:border-green-400"
              }`}
            >
              ทั้งหมด ({positions.length})
            </button>
            {Object.entries(COMPANY_INFO).map(([key, info]) => {
              const count = positions.filter((p) => p.company === key).length;
              return (
                <button
                  key={key}
                  onClick={() => setCompanyFilter(companyFilter === key ? "" : key)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                    companyFilter === key
                      ? "bg-green-600 text-white shadow"
                      : "bg-white text-gray-700 border border-gray-300 hover:border-green-400"
                  }`}
                >
                  {info.short} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-6 py-8">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <Briefcase className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <p className="text-lg font-semibold text-gray-700">ไม่พบตำแหน่งงาน</p>
            <p className="mt-1 text-sm text-gray-500">ลองค้นหาด้วยคำค้นอื่น หรือกลับมาดูอีกครั้งในภายหลัง</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([companyKey, jobs]) => {
              const info = COMPANY_INFO[companyKey];
              return (
                <div key={companyKey}>
                  <div className="mb-3 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-green-600" />
                    <h2 className="text-lg font-semibold text-gray-900">
                      {info?.name || companyKey}
                    </h2>
                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                      {jobs.length} ตำแหน่ง
                    </span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {jobs.map((job) => (
                      <div
                        key={job.id}
                        className="group rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-green-400 hover:shadow-md"
                      >
                        <div className="mb-3 flex items-start justify-between">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
                            <Briefcase className="h-5 w-5" />
                          </div>
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${info?.color || "bg-gray-100 text-gray-700"}`}>
                            {info?.short || "อื่นๆ"}
                          </span>
                        </div>
                        <h3 className="mb-1 font-semibold text-gray-900 group-hover:text-green-700">
                          {job.title}
                        </h3>
                        {job.department && (
                          <p className="mb-3 text-sm text-gray-500">แผนก: {job.department.name}</p>
                        )}
                        <Link
                          href="/apply"
                          className="inline-flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700"
                        >
                          <FileText className="h-4 w-4" />
                          สมัครตำแหน่งนี้
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-6">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-gray-500">
          © 2026 Comets Intertrade Co., Ltd. | ICT Manufacturing Co., Ltd.
        </div>
      </footer>
    </div>
  );
}
