"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Eye,
  Loader2,
  RefreshCw,
  Search,
  UserX,
} from "lucide-react";
import { COMPANIES, EMPLOYEE_TYPES } from "@/lib/form-constants";
import { FORM_STATUS_COLORS, FORM_STATUS_LABELS } from "@/lib/status-helpers";
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
        className="h-10 w-10 rounded-full object-cover ring-2 ring-red-100"
      />
    );
  }
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-sm font-semibold text-red-700 ring-2 ring-red-200">
      {initials || "?"}
    </div>
  );
}

export default function HRRejectedPage() {
  const router = useRouter();
  const [rows, setRows] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [companyFilter, setCompanyFilter] = useState<string>("");
  const [employeeTypeFilter, setEmployeeTypeFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [reopening, setReopening] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("status", "REJECTED");
      if (companyFilter) params.set("company", companyFilter);
      if (employeeTypeFilter) params.set("employeeType", employeeTypeFilter);
      if (searchTerm.trim()) params.set("q", searchTerm.trim());

      const res = await fetch(`/api/application-forms?${params.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as ApplicationRow[];
      setRows(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [companyFilter, employeeTypeFilter, searchTerm]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  async function reopen(id: string) {
    if (
      !window.confirm(
        "ยืนยันการเปิดใบสมัครนี้อีกครั้ง?\nสถานะจะถูกเปลี่ยนกลับเป็น 'ส่งใบสมัครแล้ว'"
      )
    ) {
      return;
    }
    setReopening(id);
    try {
      const res = await fetch(`/api/application-forms/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "SUBMITTED",
          note: "HR reopened rejected application",
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await load();
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "ไม่สามารถเปิดใบสมัครได้");
    } finally {
      setReopening(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ไม่ผ่าน/ปฏิเสธ</h1>
          <p className="mt-1 text-sm text-gray-500">
            รายการใบสมัครที่ไม่ผ่าน หรือถูกปฏิเสธ สามารถเปิดใบสมัครใหม่ได้
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-red-700 ring-1 ring-red-200">
          <UserX className="h-5 w-5" />
          <span className="text-sm font-medium">
            ทั้งหมด {rows.length} ใบสมัคร
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-3">
        <div className="relative">
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
            <thead className="bg-red-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-red-800">
                  รูป
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-red-800">
                  ชื่อ-สกุล
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-red-800">
                  ตำแหน่ง
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-red-800">
                  บริษัท
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-red-800">
                  ประเภท
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-red-800">
                  สถานะ
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-red-800">
                  วันที่ปฏิเสธ
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-red-800">
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
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    ไม่มีใบสมัครที่ถูกปฏิเสธ
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                rows.map((r) => {
                  const name = getFullName(r);
                  const dateStr = r.updatedAt
                    ? formatDate(r.updatedAt)
                    : r.submittedAt
                      ? formatDate(r.submittedAt)
                      : formatDate(r.createdAt);
                  return (
                    <tr
                      key={r.id}
                      className="transition-colors hover:bg-red-50/60"
                    >
                      <td
                        className="cursor-pointer px-4 py-3"
                        onClick={() => router.push(`/hr/applications/${r.id}`)}
                      >
                        <Avatar src={r.photoUrl} name={name} />
                      </td>
                      <td
                        className="cursor-pointer px-4 py-3"
                        onClick={() => router.push(`/hr/applications/${r.id}`)}
                      >
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
                        <div className="inline-flex items-center gap-2">
                          <Link
                            href={`/hr/applications/${r.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
                          >
                            <Eye className="h-4 w-4" />
                            ดู
                          </Link>
                          <button
                            onClick={() => reopen(r.id)}
                            disabled={reopening === r.id}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-100 disabled:opacity-50"
                          >
                            {reopening === r.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                            เปิดใบสมัครใหม่
                          </button>
                        </div>
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
