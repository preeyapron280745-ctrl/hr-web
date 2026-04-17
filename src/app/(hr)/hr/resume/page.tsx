"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  Search,
  FileText,
  Download,
  Eye,
  UserCircle,
  Send,
  CheckCircle2,
  X,
} from "lucide-react";
import { COMPANIES, EMPLOYEE_TYPES } from "@/lib/form-constants";
import { formatDate } from "@/lib/utils";

interface ResumeForm {
  id: string;
  employeeType: string;
  company: string;
  positionTitle: string;
  firstNameTh: string | null;
  lastNameTh: string | null;
  nicknameTh: string | null;
  phone: string | null;
  email: string | null;
  photoUrl: string | null;
  resumeUrl: string | null;
  status: string;
  tankStatus: string | null;
  reviewer1: string | null;
  reviewerStatus1: string | null;
  submittedAt: string | null;
  createdAt: string;
}

interface Manager {
  id: string;
  name: string;
  username: string | null;
  department: string | null;
  role: string;
}

const COMPANY_SHORT: Record<string, string> = {
  COMETS_HQ: "COMETS HQ",
  COMETS_FACTORY: "COMETS Factory",
  ICT: "ICT",
};

function fullName(f: ResumeForm) {
  return [f.firstNameTh, f.lastNameTh].filter(Boolean).join(" ") || "(ไม่ระบุ)";
}

function getStatusLabel(f: ResumeForm) {
  if (f.reviewer1) return "รอพิจารณา คนที่ 1";
  return "รอส่งข้อมูล";
}

function getStatusColor(f: ResumeForm) {
  if (f.reviewer1) return "bg-amber-100 text-amber-700";
  return "bg-gray-100 text-gray-700";
}

export default function HRResumePage() {
  const [forms, setForms] = useState<ResumeForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [company, setCompany] = useState("");
  const [employeeType, setEmployeeType] = useState("");
  const [q, setQ] = useState("");

  // Send modal
  const [sendTarget, setSendTarget] = useState<ResumeForm | null>(null);
  const [selectedManager, setSelectedManager] = useState("");
  const [managerSearch, setManagerSearch] = useState("");
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchForms();
    fetch("/api/users").then(r => r.json()).then(d => setManagers(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  useEffect(() => { fetchForms(); }, [company, employeeType, q]);

  const fetchForms = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("status", "RESUME");
      if (company) params.set("company", company);
      if (employeeType) params.set("employeeType", employeeType);
      if (q.trim()) params.set("q", q.trim());
      const res = await fetch(`/api/application-forms?${params}`);
      if (res.ok) setForms(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const filteredManagers = useMemo(() => {
    const s = managerSearch.trim().toLowerCase();
    return managers.filter(m => {
      if (!s) return true;
      return m.name.toLowerCase().includes(s) || (m.department || "").toLowerCase().includes(s) || (m.username || "").toLowerCase().includes(s);
    });
  }, [managers, managerSearch]);

  const handleSend = async () => {
    if (!sendTarget || !selectedManager) return;
    const mgr = managers.find(m => m.id === selectedManager);
    setSending(true);
    try {
      const res = await fetch(`/api/application-forms/${sendTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "RESUME",
          note: `ส่งให้ ${mgr?.name} พิจารณา`,
        }),
      });
      if (!res.ok) throw new Error("Failed");

      // Update reviewer1 directly via a separate call
      await fetch(`/api/application-forms/${sendTarget.id}/reviewer`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewer1: mgr?.name, tankStatus: "รอพิจารณา คนที่ 1" }),
      });

      setSuccessMsg(`ส่งข้อมูล "${fullName(sendTarget)}" ให้ ${mgr?.name} พิจารณาแล้ว`);
      setSendTarget(null);
      setSelectedManager("");
      setManagerSearch("");
      await fetchForms();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (e) {
      alert("เกิดข้อผิดพลาด");
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Resume</h1>
        <p className="mt-1 text-sm text-gray-500">รายชื่อผู้สมัครที่แนบ Resume ไว้ในใบสมัคร</p>
      </div>

      {successMsg && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4" />
          {successMsg}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">บริษัท</label>
            <select value={company} onChange={e => setCompany(e.target.value)} className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20">
              <option value="">ทั้งหมด</option>
              {COMPANIES.map(c => <option key={c.value} value={c.value}>{COMPANY_SHORT[c.value] ?? c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">ประเภทพนักงาน</label>
            <select value={employeeType} onChange={e => setEmployeeType(e.target.value)} className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20">
              <option value="">ทั้งหมด</option>
              {EMPLOYEE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-gray-700">ค้นหาชื่อ</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input type="text" value={q} onChange={e => setQ(e.target.value)} placeholder="ชื่อ, เบอร์, อีเมล..." className="block w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20" />
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>
      ) : forms.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <FileText className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="text-gray-500">ไม่พบ Resume</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {forms.map(f => (
            <div key={f.id} className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-start gap-3 p-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                  <UserCircle className="h-7 w-7" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900">{fullName(f)}</h3>
                  <p className="text-sm text-gray-600">{f.positionTitle}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-700">{COMPANY_SHORT[f.company] || f.company}</span>
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">{EMPLOYEE_TYPES.find(t => t.value === f.employeeType)?.label || f.employeeType}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 px-4 py-3">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div>
                    <span>สมัครเมื่อ {formatDate(f.submittedAt || f.createdAt)}</span>
                    {f.phone && <span className="ml-2">| {f.phone}</span>}
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(f)}`}>
                    {getStatusLabel(f)}
                  </span>
                </div>
                {f.reviewer1 && (
                  <p className="mt-1 text-xs text-amber-600">ผู้พิจารณา: {f.reviewer1}</p>
                )}
              </div>

              <div className="flex border-t border-gray-100">
                <Link href={`/hr/applications/${f.id}`} className="flex flex-1 items-center justify-center gap-1.5 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                  <Eye className="h-4 w-4" />
                  ดูใบสมัคร
                </Link>
                {f.resumeUrl && (
                  <a href={f.resumeUrl} target="_blank" rel="noopener noreferrer" className="flex flex-1 items-center justify-center gap-1.5 border-l border-gray-100 py-3 text-sm text-green-600 hover:bg-green-50 hover:text-green-700">
                    <Download className="h-4 w-4" />
                    Resume
                  </a>
                )}
                {!f.reviewer1 && (
                  <button onClick={() => { setSendTarget(f); setSelectedManager(""); setManagerSearch(""); }} className="flex flex-1 items-center justify-center gap-1.5 border-l border-gray-100 py-3 text-sm font-semibold text-green-600 hover:bg-green-50 hover:text-green-700">
                    <Send className="h-4 w-4" />
                    ส่งข้อมูล
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Send Modal */}
      {sendTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSendTarget(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Form Resume ส่งข้อมูล</h3>
              <div className="flex gap-2">
                <button onClick={() => setSendTarget(null)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">ยกเลิก</button>
                <button onClick={handleSend} disabled={!selectedManager || sending} className="rounded-lg bg-green-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50">
                  {sending ? "กำลังส่ง..." : "บันทึก"}
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-4 rounded-lg bg-green-50 p-3">
                <p className="text-sm font-medium text-gray-900">{fullName(sendTarget)}</p>
                <p className="text-xs text-gray-600">{sendTarget.positionTitle} — {COMPANY_SHORT[sendTarget.company]}</p>
              </div>

              <label className="mb-2 block text-sm font-medium text-gray-700">ผู้พิจารณา คนที่ 1</label>
              <div className="relative mb-3">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={managerSearch}
                  onChange={e => setManagerSearch(e.target.value)}
                  placeholder="Search"
                  className="w-full rounded-lg border border-green-500 bg-white pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-200">
                {filteredManagers.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedManager(m.id)}
                    className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors ${
                      selectedManager === m.id
                        ? "bg-green-100 text-green-800 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <div>
                      <span>{m.name}</span>
                      {m.department && <span className="ml-2 text-xs text-gray-400">({m.department})</span>}
                    </div>
                    {selectedManager === m.id && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                  </button>
                ))}
                {filteredManagers.length === 0 && (
                  <p className="px-4 py-6 text-center text-sm text-gray-500">ไม่พบผู้พิจารณา</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
