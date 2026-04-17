"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import {
  Inbox,
  Loader2,
  Search,
  Send,
  XCircle,
  Eye,
  FileText,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { COMPANIES, EMPLOYEE_TYPES } from "@/lib/form-constants";

type TankRow = {
  id: string;
  employeeType: string;
  company: string;
  positionTitle: string;
  firstNameTh: string | null;
  lastNameTh: string | null;
  phone: string | null;
  email: string | null;
  photoUrl: string | null;
  resumeUrl: string | null;
  status: string;
  applicationCode: string | null;
  channel: string | null;
  educationLevelText: string | null;
  lastCompany: string | null;
  lastPosition: string | null;
  lastSalaryMin: number | null;
  lastSalaryMax: number | null;
  tankStatus: string | null;
  reviewer1: string | null;
  reviewerStatus1: string | null;
  age: number | null;
  createdAt: string;
};

const COMPANY_SHORT: Record<string, string> = {
  COMETS_HQ: "Comets HQ",
  COMETS_FACTORY: "Comets Factory",
  ICT: "ICT",
};

const EMPTYPE_SHORT: Record<string, string> = {
  MONTHLY: "รายเดือน",
  DAILY: "รายวัน",
  INTERN: "ฝึกงาน",
};

function fullName(f: TankRow) {
  return [f.firstNameTh, f.lastNameTh].filter(Boolean).join(" ") || "(ไม่ระบุ)";
}

export default function TankPage() {
  const [rows, setRows] = useState<TankRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyFilter, setCompanyFilter] = useState("");
  const [empFilter, setEmpFilter] = useState("");
  const [q, setQ] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Modal
  const [selectedRow, setSelectedRow] = useState<TankRow | null>(null);
  const [modalType, setModalType] = useState<"send" | "reject" | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("status", "TANK");
      if (companyFilter) params.set("company", companyFilter);
      if (empFilter) params.set("employeeType", empFilter);
      if (q.trim()) params.set("q", q.trim());
      const res = await fetch(`/api/application-forms?${params}`);
      if (res.ok) setRows(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [companyFilter, empFilter, q]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const handleSend = async () => {
    if (!selectedRow) return;
    setProcessing(true);
    try {
      const res = await fetch(`/api/application-forms/${selectedRow.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "RESUME", note: "ส่งต่อจากถังพัก" }),
      });
      if (!res.ok) throw new Error("Failed");
      setSuccessMsg(`ส่ง "${fullName(selectedRow)}" ไปยัง Resume แล้ว`);
      setModalType(null);
      setSelectedRow(null);
      await load();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (e) {
      alert("เกิดข้อผิดพลาด");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRow) return;
    setProcessing(true);
    try {
      const res = await fetch(`/api/application-forms/${selectedRow.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "TANK_REJECTED", note: rejectReason || "ไม่สนใจ" }),
      });
      if (!res.ok) throw new Error("Failed");
      setSuccessMsg(`"${fullName(selectedRow)}" — ไม่สนใจ`);
      setModalType(null);
      setSelectedRow(null);
      setRejectReason("");
      await load();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (e) {
      alert("เกิดข้อผิดพลาด");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <Inbox className="h-6 w-6 text-green-600" />
            ถังพัก
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Resume จาก Job Thai และช่องทางอื่นๆ รอผู้บริหาร/หัวหน้าแผนกพิจารณา
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2 text-green-700 ring-1 ring-green-200">
          <Inbox className="h-5 w-5" />
          <span className="text-sm font-medium">ทั้งหมด {rows.length} รายการ</span>
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4" />
          {successMsg}
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ค้นหาชื่อ/ตำแหน่ง/เบอร์/อีเมล"
            className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
          />
        </div>
        <select
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
          className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
        >
          <option value="">บริษัททั้งหมด</option>
          {COMPANIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select
          value={empFilter}
          onChange={(e) => setEmpFilter(e.target.value)}
          className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
        >
          <option value="">ประเภทพนักงานทั้งหมด</option>
          {EMPLOYEE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-green-600" />
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Inbox className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <p className="text-gray-500">ไม่มีข้อมูลในถังพัก</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-green-50 text-left text-xs font-semibold uppercase tracking-wide text-green-800">
                <tr>
                  <th className="px-4 py-3">ชื่อ</th>
                  <th className="px-4 py-3">ตำแหน่งที่สนใจ</th>
                  <th className="px-4 py-3">บริษัท</th>
                  <th className="px-4 py-3">ประเภท</th>
                  <th className="px-4 py-3">การศึกษา</th>
                  <th className="px-4 py-3">ประสบการณ์ล่าสุด</th>
                  <th className="px-4 py-3">เงินเดือน</th>
                  <th className="px-4 py-3">ช่องทาง</th>
                  <th className="px-4 py-3">Resume</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-green-50/30">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{fullName(r)}</p>
                        <p className="text-xs text-gray-500">{r.phone || r.email || ""}</p>
                        {r.age && <p className="text-xs text-gray-400">อายุ {r.age} ปี</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{r.positionTitle}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs">{COMPANY_SHORT[r.company] || r.company}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs">{EMPTYPE_SHORT[r.employeeType] || r.employeeType}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{r.educationLevelText || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="text-xs">
                        <p className="text-gray-700">{r.lastCompany || "-"}</p>
                        <p className="text-gray-500">{r.lastPosition || ""}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-700">
                      {r.lastSalaryMin || r.lastSalaryMax
                        ? `${(r.lastSalaryMin || 0).toLocaleString()}-${(r.lastSalaryMax || 0).toLocaleString()}`
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{r.channel || "-"}</td>
                    <td className="px-4 py-3">
                      {r.resumeUrl ? (
                        <a href={r.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700">
                          <FileText className="h-4 w-4" />
                        </a>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/hr/applications/${r.id}`}
                          className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                          title="ดูรายละเอียด"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => { setSelectedRow(r); setModalType("send"); }}
                          className="rounded p-1.5 text-green-600 hover:bg-green-100 hover:text-green-700"
                          title="สนใจ - ส่งต่อ"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => { setSelectedRow(r); setModalType("reject"); }}
                          className="rounded p-1.5 text-red-500 hover:bg-red-100 hover:text-red-700"
                          title="ไม่สนใจ"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Send Modal */}
      {modalType === "send" && selectedRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => { setModalType(null); setSelectedRow(null); }}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">สนใจ — ส่งต่อไปยัง Resume</h3>
            <div className="mb-4 rounded-lg bg-green-50 p-4">
              <p className="font-medium text-gray-900">{fullName(selectedRow)}</p>
              <p className="text-sm text-gray-600">ตำแหน่ง: {selectedRow.positionTitle}</p>
              <p className="text-sm text-gray-600">บริษัท: {COMPANY_SHORT[selectedRow.company] || selectedRow.company}</p>
            </div>
            <p className="mb-4 text-sm text-gray-600">
              ยืนยันการส่งต่อไปยังขั้นตอน Resume? สถานะจะเปลี่ยนเป็น &quot;ส่งใบสมัครแล้ว&quot;
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setModalType(null); setSelectedRow(null); }}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSend}
                disabled={processing}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
              >
                {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                ส่งต่อ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {modalType === "reject" && selectedRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => { setModalType(null); setSelectedRow(null); }}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">ไม่สนใจ Resume</h3>
            <div className="mb-4 rounded-lg bg-red-50 p-4">
              <p className="font-medium text-gray-900">{fullName(selectedRow)}</p>
              <p className="text-sm text-gray-600">ตำแหน่ง: {selectedRow.positionTitle}</p>
            </div>
            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">เหตุผลที่ไม่สนใจ</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
                placeholder="ระบุเหตุผล (ไม่บังคับ)"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setModalType(null); setSelectedRow(null); setRejectReason(""); }}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleReject}
                disabled={processing}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                ไม่สนใจ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
