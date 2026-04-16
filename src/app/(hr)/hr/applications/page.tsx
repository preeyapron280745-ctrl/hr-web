"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Search, Loader2, AlertCircle, Users } from "lucide-react";
import { COMPANIES, EMPLOYEE_TYPES } from "@/lib/form-constants";
import {
  FORM_STATUS_LABELS,
  FORM_STATUS_COLORS,
} from "@/lib/status-helpers";
import { formatDate } from "@/lib/utils";

type ApplicationRow = {
  id: string;
  employeeType: string;
  company: string;
  positionTitle: string;
  firstNameTh: string | null;
  lastNameTh: string | null;
  firstNameEn: string | null;
  lastNameEn: string | null;
  phone: string | null;
  email: string | null;
  photoUrl: string | null;
  status: string;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const STATUS_TABS: { value: string; label: string }[] = [
  { value: "ALL", label: "ทั้งหมด" },
  { value: "SUBMITTED", label: FORM_STATUS_LABELS.SUBMITTED },
  { value: "SCREENING", label: FORM_STATUS_LABELS.SCREENING },
  { value: "INTERVIEW_SCHEDULED", label: FORM_STATUS_LABELS.INTERVIEW_SCHEDULED },
  { value: "INTERVIEWED", label: FORM_STATUS_LABELS.INTERVIEWED },
  { value: "PROBATION", label: FORM_STATUS_LABELS.PROBATION },
  { value: "HIRED", label: FORM_STATUS_LABELS.HIRED },
  { value: "REJECTED", label: FORM_STATUS_LABELS.REJECTED },
];

function getFullName(row: ApplicationRow): string {
  const th = [row.firstNameTh, row.lastNameTh].filter(Boolean).join(" ").trim();
  if (th) return th;
  const en = [row.firstNameEn, row.lastNameEn].filter(Boolean).join(" ").trim();
  return en || "-";
}

function getCompanyLabel(value: string): string {
  return COMPANIES.find((c) => c.value === value)?.label ?? value;
}

function getEmployeeTypeLabel(value: string): string {
  return EMPLOYEE_TYPES.find((e) => e.value === value)?.label ?? value;
}

function Avatar({ src, name }: { src: string | null; name: string }) {
  const initials = name
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={name}
        className="h-10 w-10 rounded-full object-cover ring-2 ring-green-100"
      />
    );
  }
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-700 ring-2 ring-green-200">
      {initials || "?"}
    </div>
  );
}

export default function HRApplicationsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [companyFilter, setCompanyFilter] = useState<string>("");
  const [employeeTypeFilter, setEmployeeTypeFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (statusFilter && statusFilter !== "ALL") {
          params.set("status", statusFilter);
        }
        if (companyFilter) params.set("company", companyFilter);
        if (employeeTypeFilter) params.set("employeeType", employeeTypeFilter);
        if (searchTerm.trim()) params.set("q", searchTerm.trim());

        const res = await fetch(`/api/application-forms?${params.toString()}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = (await res.json()) as ApplicationRow[];
        if (!cancelled) setRows(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error(err);
        if (!cancelled) setError(err?.message || "โหลดข้อมูลไม่สำเร็จ");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    const t = setTimeout(load, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [statusFilter, companyFilter, employeeTypeFilter, searchTerm]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: rows.length };
    for (const r of rows) {
      c[r.status] = (c[r.status] ?? 0) + 1;
    }
    return c;
  }, [rows]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ใบสมัครงาน (HR)</h1>
          <p className="mt-1 text-sm text-gray-500">
            รายการใบสมัครงานทั้งหมด คัดกรอง สัมภาษณ์ และรับเข้าทำงาน
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2 text-green-700 ring-1 ring-green-200">
          <Users className="h-5 w-5" />
          <span className="text-sm font-medium">ทั้งหมด {rows.length} ใบสมัคร</span>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2 rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
        {STATUS_TABS.map((tab) => {
          const active = statusFilter === tab.value;
          const count = counts[tab.value] ?? 0;
          return (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors " +
                (active
                  ? "bg-green-600 text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-100")
              }
            >
              <span>{tab.label}</span>
              <span
                className={
                  "inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-xs font-semibold " +
                  (active ? "bg-white/25 text-white" : "bg-gray-100 text-gray-700")
                }
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-3">
        <div className="relative md:col-span-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาด้วยชื่อ/ตำแหน่ง/อีเมล/เบอร์โทร"
            className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
          />
        </div>
        <div>
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
          >
            <option value="">บริษัททั้งหมด</option>
            {COMPANIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <select
            value={employeeTypeFilter}
            onChange={(e) => setEmployeeTypeFilter(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
          >
            <option value="">ประเภทพนักงานทั้งหมด</option>
            {EMPLOYEE_TYPES.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-green-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-green-800">
                  รูป
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-green-800">
                  ชื่อ-สกุล
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-green-800">
                  ตำแหน่ง
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-green-800">
                  บริษัท
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-green-800">
                  ประเภท
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-green-800">
                  สถานะ
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-green-800">
                  วันที่สมัคร
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-green-800">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                      <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                      <span>กำลังโหลดข้อมูล...</span>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-red-600">
                      <AlertCircle className="h-6 w-6" />
                      <span>{error}</span>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && !error && rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                    ไม่พบใบสมัครที่ตรงกับเงื่อนไข
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                rows.map((r) => {
                  const name = getFullName(r);
                  const dateStr = r.submittedAt
                    ? formatDate(r.submittedAt)
                    : formatDate(r.createdAt);
                  return (
                    <tr
                      key={r.id}
                      onClick={() => router.push(`/hr/applications/${r.id}`)}
                      className="cursor-pointer transition-colors hover:bg-green-50/60"
                    >
                      <td className="px-4 py-3">
                        <Avatar src={r.photoUrl} name={name} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{name}</div>
                        {r.email && (
                          <div className="text-xs text-gray-500">{r.email}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {r.positionTitle || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        <span className="line-clamp-2 max-w-xs text-xs">
                          {getCompanyLabel(r.company)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {getEmployeeTypeLabel(r.employeeType)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium " +
                            (FORM_STATUS_COLORS[r.status] ??
                              "bg-gray-100 text-gray-700 border-gray-200")
                          }
                        >
                          {FORM_STATUS_LABELS[r.status] ?? r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{dateStr}</td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/hr/applications/${r.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-100"
                        >
                          <Eye className="h-4 w-4" />
                          ดู
                        </Link>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
