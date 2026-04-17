"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Loader2, Search, FileText, Download, Eye, UserCircle,
  Send, CheckCircle2, ThumbsUp, ThumbsDown, Calendar,
} from "lucide-react";
import { COMPANIES, EMPLOYEE_TYPES } from "@/lib/form-constants";
import { formatDate } from "@/lib/utils";
import { useSession } from "next-auth/react";

interface ResumeForm {
  id: string; employeeType: string; company: string; positionTitle: string;
  firstNameTh: string | null; lastNameTh: string | null;
  phone: string | null; email: string | null; resumeUrl: string | null;
  status: string; tankStatus: string | null;
  reviewer1: string | null; reviewerStatus1: string | null;
  submittedAt: string | null; createdAt: string;
}

interface Reviewer { id: string; name: string; nickname: string | null; email: string | null; }

const COMPANY_SHORT: Record<string, string> = { COMETS_HQ: "COMETS HQ", COMETS_FACTORY: "COMETS Factory", ICT: "ICT" };
const INTERVIEW_TIMES = ["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30","20:00","20:30","21:00","21:30","22:00","22:30","23:00","23:30","00:00"];

function fullName(f: ResumeForm) { return [f.firstNameTh, f.lastNameTh].filter(Boolean).join(" ") || "(ไม่ระบุ)"; }
function getStatusLabel(f: ResumeForm) {
  if (f.tankStatus === "รอพิจารณา คนที่ 1" && f.reviewerStatus1 === "สนใจ") return "สนใจ - นัดสัมภาษณ์";
  if (f.tankStatus === "รอพิจารณา คนที่ 1" && f.reviewerStatus1 === "ไม่สนใจ") return "ไม่สนใจ";
  if (f.reviewer1) return "รอพิจารณา คนที่ 1";
  return "รอส่งข้อมูล";
}
function getStatusColor(f: ResumeForm) {
  if (f.reviewerStatus1 === "สนใจ") return "bg-green-100 text-green-700";
  if (f.reviewerStatus1 === "ไม่สนใจ") return "bg-red-100 text-red-700";
  if (f.reviewer1) return "bg-amber-100 text-amber-700";
  return "bg-gray-100 text-gray-700";
}

export default function HRResumePage() {
  const { data: session } = useSession();
  const currentUser = (session?.user as any)?.name || "ผู้พิจารณา";

  const [forms, setForms] = useState<ResumeForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [company, setCompany] = useState("");
  const [employeeType, setEmployeeType] = useState("");
  const [q, setQ] = useState("");

  // Send modal
  const [sendTarget, setSendTarget] = useState<ResumeForm | null>(null);
  const [selectedReviewer, setSelectedReviewer] = useState("");
  const [reviewerSearch, setReviewerSearch] = useState("");

  // Interest modal (สนใจ → นัดสัมภาษณ์)
  const [interestTarget, setInterestTarget] = useState<ResumeForm | null>(null);
  const [slots, setSlots] = useState([
    { date: "", time: "", location: "ONSITE" },
    { date: "", time: "", location: "" },
    { date: "", time: "", location: "" },
  ]);

  // Reject modal (ไม่สนใจ)
  const [rejectTarget, setRejectTarget] = useState<ResumeForm | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const [processing, setProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchForms();
    fetch("/api/reviewers").then(r => r.json()).then(d => setReviewers(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  useEffect(() => { fetchForms(); }, [company, employeeType, q]);

  const fetchForms = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: "RESUME" });
      if (company) params.set("company", company);
      if (employeeType) params.set("employeeType", employeeType);
      if (q.trim()) params.set("q", q.trim());
      const res = await fetch(`/api/application-forms?${params}`);
      if (res.ok) setForms(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const filteredReviewers = useMemo(() => {
    const s = reviewerSearch.trim().toLowerCase();
    return reviewers.filter(m => !s || m.name.toLowerCase().includes(s) || (m.nickname || "").toLowerCase().includes(s));
  }, [reviewers, reviewerSearch]);

  // Send to reviewer
  const handleSend = async () => {
    if (!sendTarget || !selectedReviewer) return;
    const mgr = reviewers.find(m => m.id === selectedReviewer);
    setProcessing(true);
    try {
      await fetch(`/api/application-forms/${sendTarget.id}/reviewer`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewer1: mgr?.nickname || mgr?.name, tankStatus: "รอพิจารณา คนที่ 1" }),
      });
      setSuccessMsg(`ส่งให้ ${mgr?.nickname || mgr?.name} พิจารณาแล้ว`);
      setSendTarget(null); setSelectedReviewer(""); setReviewerSearch("");
      await fetchForms();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch { alert("เกิดข้อผิดพลาด"); }
    finally { setProcessing(false); }
  };

  // สนใจ → บันทึกวันนัดสัมภาษณ์
  const handleInterest = async () => {
    if (!interestTarget || !slots[0].date || !slots[0].time) { alert("กรุณาระบุวันที่และเวลาสัมภาษณ์ช่วงที่ 1"); return; }
    setProcessing(true);
    try {
      await fetch(`/api/application-forms/${interestTarget.id}/reviewer`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewerStatus1: "สนใจ",
          tankStatus: "สนใจ - นัดสัมภาษณ์",
          interviewSlot1Date: slots[0].date || null,
          interviewSlot1Time: slots[0].time || null,
          interviewSlot1Location: slots[0].location || null,
          interviewSlot2Date: slots[1].date || null,
          interviewSlot2Time: slots[1].time || null,
          interviewSlot2Location: slots[1].location || null,
          interviewSlot3Date: slots[2].date || null,
          interviewSlot3Time: slots[2].time || null,
          interviewSlot3Location: slots[2].location || null,
        }),
      });
      setSuccessMsg(`แจ้งวันนัดสัมภาษณ์ "${fullName(interestTarget)}" เรียบร้อย`);
      setInterestTarget(null);
      setSlots([{ date: "", time: "", location: "ONSITE" }, { date: "", time: "", location: "" }, { date: "", time: "", location: "" }]);
      await fetchForms();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch { alert("เกิดข้อผิดพลาด"); }
    finally { setProcessing(false); }
  };

  // ไม่สนใจ
  const handleReject = async () => {
    if (!rejectTarget || !rejectReason.trim()) { alert("กรุณาระบุเหตุผล"); return; }
    setProcessing(true);
    try {
      await fetch(`/api/application-forms/${rejectTarget.id}/reviewer`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewerStatus1: "ไม่สนใจ",
          tankStatus: "ไม่สนใจ Resume",
          tankRejectReason: rejectReason,
          status: "TANK_REJECTED",
        }),
      });
      setSuccessMsg(`"${fullName(rejectTarget)}" — ไม่สนใจ`);
      setRejectTarget(null); setRejectReason("");
      await fetchForms();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch { alert("เกิดข้อผิดพลาด"); }
    finally { setProcessing(false); }
  };

  // Check if current user is a reviewer of this record
  const isMyReview = (f: ResumeForm) => {
    return f.reviewer1 && !f.reviewerStatus1;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Resume</h1>
        <p className="mt-1 text-sm text-gray-500">รายชื่อผู้สมัครที่แนบ Resume ไว้ในใบสมัคร</p>
      </div>

      {successMsg && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4" />{successMsg}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-3">
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
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">ค้นหาชื่อ</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input type="text" value={q} onChange={e => setQ(e.target.value)} placeholder="ชื่อ, เบอร์, อีเมล..." className="block w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20" />
            </div>
          </div>
        </div>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>
      ) : forms.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <FileText className="mx-auto mb-3 h-12 w-12 text-gray-300" /><p className="text-gray-500">ไม่พบ Resume</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {forms.map(f => (
            <div key={f.id} className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md">
              <div className="flex items-start gap-3 p-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                  <UserCircle className="h-7 w-7" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900">{fullName(f)}</h3>
                  <p className="text-sm text-gray-600">{f.positionTitle}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-700">{COMPANY_SHORT[f.company]}</span>
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">{EMPLOYEE_TYPES.find(t => t.value === f.employeeType)?.label}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 px-4 py-2">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>สมัครเมื่อ {formatDate(f.submittedAt || f.createdAt)} {f.phone && `| ${f.phone}`}</span>
                  <span className={`rounded-full px-2 py-0.5 font-medium ${getStatusColor(f)}`}>{getStatusLabel(f)}</span>
                </div>
                {f.reviewer1 && <p className="mt-1 text-xs text-amber-600">ผู้พิจารณา: {f.reviewer1}</p>}
              </div>

              {/* Action buttons */}
              <div className="flex border-t border-gray-100">
                <Link href={`/hr/applications/${f.id}`} className="flex flex-1 items-center justify-center gap-1 py-2.5 text-xs text-gray-600 hover:bg-gray-50">
                  <Eye className="h-3.5 w-3.5" />ดูใบสมัคร
                </Link>
                {f.resumeUrl && (
                  <a href={f.resumeUrl} target="_blank" rel="noopener noreferrer" className="flex flex-1 items-center justify-center gap-1 border-l border-gray-100 py-2.5 text-xs text-green-600 hover:bg-green-50">
                    <Download className="h-3.5 w-3.5" />Resume
                  </a>
                )}
                {/* ยังไม่ส่ง → ปุ่มส่งข้อมูล */}
                {!f.reviewer1 && (
                  <button onClick={() => { setSendTarget(f); setSelectedReviewer(""); }} className="flex flex-1 items-center justify-center gap-1 border-l border-gray-100 py-2.5 text-xs font-semibold text-green-600 hover:bg-green-50">
                    <Send className="h-3.5 w-3.5" />ส่งข้อมูล
                  </button>
                )}
                {/* ส่งแล้ว รอพิจารณา → ปุ่มสนใจ/ไม่สนใจ */}
                {isMyReview(f) && (
                  <>
                    <button onClick={() => { setInterestTarget(f); setSlots([{ date: "", time: "", location: "ONSITE" }, { date: "", time: "", location: "" }, { date: "", time: "", location: "" }]); }} className="flex flex-1 items-center justify-center gap-1 border-l border-gray-100 py-2.5 text-xs font-semibold text-green-600 hover:bg-green-50">
                      <ThumbsUp className="h-3.5 w-3.5" />สนใจ
                    </button>
                    <button onClick={() => { setRejectTarget(f); setRejectReason(""); }} className="flex flex-1 items-center justify-center gap-1 border-l border-gray-100 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-50">
                      <ThumbsDown className="h-3.5 w-3.5" />ไม่สนใจ
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== MODAL: ส่งข้อมูล ===== */}
      {sendTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSendTarget(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h3 className="text-lg font-semibold">Form Resume ส่งข้อมูล</h3>
              <div className="flex gap-2">
                <button onClick={() => setSendTarget(null)} className="rounded-lg border px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">ยกเลิก</button>
                <button onClick={handleSend} disabled={!selectedReviewer || processing} className="rounded-lg bg-green-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50">บันทึก</button>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4 rounded-lg bg-green-50 p-3">
                <p className="font-medium">{fullName(sendTarget)}</p>
                <p className="text-xs text-gray-600">{sendTarget.positionTitle} — {COMPANY_SHORT[sendTarget.company]}</p>
              </div>
              <label className="mb-2 block text-sm font-medium">ผู้พิจารณา คนที่ 1</label>
              <div className="relative mb-3">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input type="text" value={reviewerSearch} onChange={e => setReviewerSearch(e.target.value)} placeholder="Search" className="w-full rounded-lg border border-green-500 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-100" />
              </div>
              <div className="max-h-64 overflow-y-auto rounded-lg border">
                {filteredReviewers.map(m => (
                  <button key={m.id} onClick={() => setSelectedReviewer(m.id)} className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm ${selectedReviewer === m.id ? "bg-green-100 font-medium" : "hover:bg-gray-50"}`}>
                    <span>{m.nickname || m.name} <span className="text-xs text-gray-400">{m.name}</span></span>
                    {selectedReviewer === m.id && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL: สนใจ → แจ้งวันนัดสัมภาษณ์ ===== */}
      {interestTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setInterestTarget(null)}>
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 flex items-center justify-between border-b bg-white px-6 py-4">
              <h3 className="text-lg font-semibold">แจ้งวันนัดสัมภาษณ์</h3>
              <div className="flex gap-2">
                <button onClick={() => setInterestTarget(null)} className="rounded-lg border px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">ยกเลิก</button>
                <button onClick={handleInterest} disabled={processing} className="rounded-lg bg-green-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50">บันทึก</button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="text-sm text-gray-500">ผู้พิจารณา</label>
                <span className="ml-2 rounded-full bg-gray-100 px-3 py-1 text-sm">{currentUser}</span>
              </div>

              {[0, 1, 2].map(i => (
                <div key={i}>
                  <h4 className="mb-3 text-base font-semibold text-gray-900">ช่วงเวลาที่ {i + 1}</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-[80px_1fr] items-center gap-3">
                      <label className="text-sm text-gray-600">วันที่ {i === 0 && <span className="text-red-500">*</span>}</label>
                      <input type="date" value={slots[i].date} onChange={e => { const s = [...slots]; s[i].date = e.target.value; setSlots(s); }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100" />
                    </div>
                    <div className="grid grid-cols-[80px_1fr] items-center gap-3">
                      <label className="text-sm text-gray-600">เวลา {i === 0 && <span className="text-red-500">*</span>}</label>
                      <select value={slots[i].time} onChange={e => { const s = [...slots]; s[i].time = e.target.value; setSlots(s); }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100">
                        <option value=""></option>
                        {INTERVIEW_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-[80px_1fr] items-center gap-3">
                      <label className="text-sm text-gray-600">สถานที่ {i === 0 && <span className="text-red-500">*</span>}</label>
                      <div className="flex gap-2">
                        {["ONSITE", "ONLINE"].map(loc => (
                          <button key={loc} type="button" onClick={() => { const s = [...slots]; s[i].location = loc; setSlots(s); }}
                            className={`flex-1 rounded-lg border-2 px-4 py-2 text-sm font-medium transition ${slots[i].location === loc ? "border-green-600 bg-green-600 text-white" : "border-gray-200 text-gray-700 hover:border-green-300"}`}>
                            {loc}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL: ไม่สนใจ ===== */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setRejectTarget(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h3 className="text-lg font-semibold">Form ไม่สนใจ Resume</h3>
              <div className="flex gap-2">
                <button onClick={() => setRejectTarget(null)} className="rounded-lg border px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">ยกเลิก</button>
                <button onClick={handleReject} disabled={!rejectReason.trim() || processing} className="rounded-lg bg-green-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50">บันทึก</button>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="text-sm text-gray-500">ผู้พิจารณา</label>
                <span className="ml-2 rounded-full bg-gray-100 px-3 py-1 text-sm">{currentUser}</span>
              </div>
              <label className="mb-2 block text-sm font-medium text-gray-700">เหตุผลที่ไม่สนใจ Resume <span className="text-red-500">*</span></label>
              <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={4} placeholder="ระบุเหตุผล..." className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
