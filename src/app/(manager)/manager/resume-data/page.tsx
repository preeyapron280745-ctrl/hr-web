"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  Search,
  FileText,
  Eye,
  UserCircle,
} from "lucide-react";
import { COMPANIES, EMPLOYEE_TYPES } from "@/lib/form-constants";
import { formatDate } from "@/lib/utils";

interface ResumeForm {
  id: string;
  employeeType: string;
  company: string;
  positionId: string | null;
  positionTitle: string;
  firstNameTh: string | null;
  lastNameTh: string | null;
  firstNameEn: string | null;
  lastNameEn: string | null;
  nicknameTh: string | null;
  phone: string | null;
  email: string | null;
  photoUrl: string | null;
  resumeUrl: string | null;
  status: string;
  submittedAt: string | null;
  createdAt: string;
}

interface Position {
  id: string;
  title: string;
  department?: { id: string; name: string };
}

const COMPANY_SHORT: Record<string, string> = {
  COMETS_HQ: "COMETS HQ",
  COMETS_FACTORY: "COMETS Factory",
  ICT: "ICT",
};

export default function ManagerResumeDataPage() {
  const [forms, setForms] = useState<ResumeForm[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);

  const [company, setCompany] = useState("");
  const [employeeType, setEmployeeType] = useState("");
  const [positionId, setPositionId] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    fetchPositions();
  }, []);

  useEffect(() => {
    fetchForms();
  }, [company, employeeType, positionId, q]);

  const fetchPositions = async () => {
    try {
      const res = await fetch("/api/positions");
      if (res.ok) setPositions(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchForms = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("status", "RESUME");
      if (company) params.set("company", company);
      if (employeeType) params.set("employeeType", employeeType);
      if (positionId) params.set("positionId", positionId);
      if (q.trim()) params.set("q", q.trim());

      const res = await fetch(`/api/application-forms?${params.toString()}`);
      if (res.ok) {
        const data: ResumeForm[] = await res.json();
        setForms(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const positionOptions = useMemo(() => {
    return positions
      .slice()
      .sort((a, b) => a.title.localeCompare(b.title, "th"));
  }, [positions]);

  const fullName = (f: ResumeForm) => {
    const th = [f.firstNameTh, f.lastNameTh].filter(Boolean).join(" ");
    if (th) return th;
    const en = [f.firstNameEn, f.lastNameEn].filter(Boolean).join(" ");
    return en || "(ไม่ระบุชื่อ)";
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">ข้อมูล Resume</h1>
        <p className="mt-1 text-sm text-gray-500">
          รายชื่อผู้สมัครที่แนบ Resume ไว้ในใบสมัคร (อ่านอย่างเดียว)
        </p>
      </div>

      {/* Filter bar */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">
              บริษัท
            </label>
            <select
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
            >
              <option value="">ทั้งหมด</option>
              {COMPANIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {COMPANY_SHORT[c.value] ?? c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">
              ประเภทพนักงาน
            </label>
            <select
              value={employeeType}
              onChange={(e) => setEmployeeType(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
            >
              <option value="">ทั้งหมด</option>
              {EMPLOYEE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">
              ตำแหน่ง
            </label>
            <select
              value={positionId}
              onChange={(e) => setPositionId(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
            >
              <option value="">ทั้งหมด</option>
              {positionOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">
              ค้นหาชื่อ
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ชื่อ, เบอร์, อีเมล..."
                className="block w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
              />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      ) : forms.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <FileText className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="text-gray-500">ไม่พบ Resume ตามเงื่อนไขที่เลือก</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {forms.map((f) => (
            <Link
              key={f.id}
              href={`/manager/reviews/${f.id}`}
              className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-green-300 hover:shadow-md"
            >
              <div className="flex items-start gap-3 p-4">
                {f.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={f.photoUrl}
                    alt={fullName(f)}
                    className="h-16 w-16 flex-shrink-0 rounded-full border-2 border-green-100 object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-green-50 text-green-500">
                    <UserCircle className="h-10 w-10" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold text-gray-900">
                    {fullName(f)}
                  </h3>
                  <p className="mt-0.5 truncate text-sm text-gray-600">
                    {f.positionTitle || "-"}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1">
                    <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                      {COMPANY_SHORT[f.company] ?? f.company}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                      {EMPLOYEE_TYPES.find((t) => t.value === f.employeeType)
                        ?.label ?? f.employeeType}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 px-4 py-3 text-xs text-gray-500">
                <div className="flex items-center justify-between">
                  <span>สมัครเมื่อ</span>
                  <span className="font-medium text-gray-700">
                    {f.submittedAt
                      ? formatDate(f.submittedAt)
                      : formatDate(f.createdAt)}
                  </span>
                </div>
                {f.phone && (
                  <div className="mt-1 flex items-center justify-between">
                    <span>เบอร์โทร</span>
                    <span className="font-medium text-gray-700">
                      {f.phone}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-auto flex items-center justify-center gap-1 border-t border-gray-100 bg-green-50 px-4 py-2.5 text-xs font-medium text-green-700">
                <Eye className="h-3.5 w-3.5" />
                ดูรายละเอียดใบสมัคร
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
