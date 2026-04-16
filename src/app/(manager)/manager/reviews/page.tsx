"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  FileText,
  Loader2,
  Search,
  Users,
} from "lucide-react";

type FormRow = {
  id: string;
  firstNameTh?: string | null;
  lastNameTh?: string | null;
  firstNameEn?: string | null;
  lastNameEn?: string | null;
  positionTitle?: string | null;
  company?: string | null;
  status?: string | null;
  photoUrl?: string | null;
  email?: string | null;
  phone?: string | null;
  submittedAt?: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  INTERVIEW_SCHEDULED: "นัดสัมภาษณ์แล้ว",
  INTERVIEWED: "สัมภาษณ์แล้ว",
};

const STATUS_COLORS: Record<string, string> = {
  INTERVIEW_SCHEDULED: "bg-amber-100 text-amber-700",
  INTERVIEWED: "bg-blue-100 text-blue-700",
};

function fullName(f: FormRow) {
  return (
    `${f.firstNameTh ?? ""} ${f.lastNameTh ?? ""}`.trim() ||
    `${f.firstNameEn ?? ""} ${f.lastNameEn ?? ""}`.trim() ||
    "-"
  );
}

function formatDate(d?: string | null) {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "-";
  }
}

export default function ManagerReviewsPage() {
  const [forms, setForms] = useState<FormRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  async function fetchData() {
    setLoading(true);
    try {
      // fetch two statuses
      const [r1, r2] = await Promise.all([
        fetch("/api/application-forms?status=INTERVIEW_SCHEDULED"),
        fetch("/api/application-forms?status=INTERVIEWED"),
      ]);
      const d1: FormRow[] = r1.ok ? await r1.json() : [];
      const d2: FormRow[] = r2.ok ? await r2.json() : [];
      setForms([...d1, ...d2]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return forms.filter((f) => {
      const passStatus = statusFilter === "ALL" || f.status === statusFilter;
      if (!passStatus) return false;
      if (!s) return true;
      const n = fullName(f).toLowerCase();
      const p = (f.positionTitle || "").toLowerCase();
      return n.includes(s) || p.includes(s);
    });
  }, [forms, search, statusFilter]);

  const counts = useMemo(() => {
    const scheduled = forms.filter(
      (f) => f.status === "INTERVIEW_SCHEDULED"
    ).length;
    const interviewed = forms.filter((f) => f.status === "INTERVIEWED").length;
    return { all: forms.length, scheduled, interviewed };
  }, [forms]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <FileText className="h-6 w-6 text-green-600" />
          ใบสมัครงาน (หัวหน้าแผนก)
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          ตรวจสอบและประเมินผู้สมัครที่อยู่ในขั้นตอนสัมภาษณ์
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2">
              <Users className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">ทั้งหมด</p>
              <p className="text-xl font-bold text-gray-900">{counts.all}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2">
              <Users className="h-5 w-5 text-amber-700" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">รอสัมภาษณ์</p>
              <p className="text-xl font-bold text-gray-900">
                {counts.scheduled}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <Users className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">สัมภาษณ์แล้ว</p>
              <p className="text-xl font-bold text-gray-900">
                {counts.interviewed}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อหรือตำแหน่ง..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
          />
        </div>
        <div className="flex gap-2">
          {[
            { v: "ALL", l: "ทั้งหมด" },
            { v: "INTERVIEW_SCHEDULED", l: "รอสัมภาษณ์" },
            { v: "INTERVIEWED", l: "สัมภาษณ์แล้ว" },
          ].map((o) => (
            <button
              key={o.v}
              onClick={() => setStatusFilter(o.v)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                statusFilter === o.v
                  ? "border-green-600 bg-green-600 text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {o.l}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-green-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 rounded-full bg-green-50 p-4">
              <FileText className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-gray-600">ไม่พบข้อมูลใบสมัคร</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-green-50 text-left text-xs font-semibold uppercase tracking-wide text-green-800">
                <tr>
                  <th className="px-4 py-3">ชื่อ</th>
                  <th className="px-4 py-3">ตำแหน่ง</th>
                  <th className="px-4 py-3">บริษัท</th>
                  <th className="px-4 py-3">วันที่สมัคร</th>
                  <th className="px-4 py-3">สถานะ</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((f) => (
                  <tr key={f.id} className="hover:bg-green-50/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {f.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={f.photoUrl}
                            alt=""
                            className="h-9 w-9 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-700">
                            {fullName(f).charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">
                            {fullName(f)}
                          </p>
                          {f.email && (
                            <p className="text-xs text-gray-500">{f.email}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {f.positionTitle || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {f.company || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {formatDate(f.submittedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          STATUS_COLORS[f.status || ""] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {STATUS_LABELS[f.status || ""] || f.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/manager/reviews/${f.id}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                      >
                        ดูรายละเอียด
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
