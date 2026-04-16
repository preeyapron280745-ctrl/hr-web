"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ClipboardList,
  Loader2,
  Plus,
  Search,
  Star,
  UserCheck,
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
};

type Evaluation = {
  id: string;
  formId: string;
  evaluationDate: string;
  round: number;
  personality?: number | null;
  communication?: number | null;
  knowledge?: number | null;
  experience?: number | null;
  attitude?: number | null;
  overallScore?: number | null;
  recommendation?: string | null;
  strengths?: string | null;
  weaknesses?: string | null;
  notes?: string | null;
  createdAt: string;
  form?: FormRow | null;
};

const SCORE_FIELDS: {
  key:
    | "personality"
    | "communication"
    | "knowledge"
    | "experience"
    | "attitude";
  label: string;
}[] = [
  { key: "personality", label: "บุคลิกภาพ" },
  { key: "communication", label: "การสื่อสาร" },
  { key: "knowledge", label: "ความรู้ความสามารถ" },
  { key: "experience", label: "ประสบการณ์" },
  { key: "attitude", label: "ทัศนคติ" },
];

const RECOMMEND_LABELS: Record<string, string> = {
  HIRE: "สมควรจ้าง",
  REINTERVIEW: "เห็นควรให้มีการสัมภาษณ์อีกครั้ง",
  OTHER_DEPT: "เหมาะสมกับแผนกอื่น",
  HOLD: "ไม่เหมาะสมในขณะนี้ (เก็บข้อมูลไว้พิจารณาต่อไป)",
  REJECT: "ไม่เหมาะสม",
};

const RECOMMEND_OPTIONS = [
  { v: "HIRE", l: "สมควรจ้าง", desc: "ผ่านสัมภาษณ์ ส่งเข้าทดลองงาน" },
  { v: "REINTERVIEW", l: "เห็นควรให้มีการสัมภาษณ์อีกครั้ง", desc: "นัดสัมภาษณ์รอบถัดไป" },
  { v: "OTHER_DEPT", l: "เหมาะสมกับแผนกอื่น", desc: "แนะนำให้พิจารณากับแผนกอื่น" },
  { v: "HOLD", l: "ไม่เหมาะสมในขณะนี้ (เก็บข้อมูลไว้พิจารณาต่อไป)", desc: "เก็บข้อมูลไว้พิจารณาในอนาคต" },
  { v: "REJECT", l: "ไม่เหมาะสม", desc: "ปฏิเสธไม่ผ่านการพิจารณา" },
];

function fullName(f?: FormRow | null) {
  if (!f) return "-";
  return (
    `${f.firstNameTh ?? ""} ${f.lastNameTh ?? ""}`.trim() ||
    f.firstNameEn ||
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

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="rounded-full p-1 transition-colors hover:bg-green-50"
          aria-label={`ให้คะแนน ${n}`}
        >
          <Star
            className={`h-6 w-6 ${
              n <= value ? "fill-green-500 text-green-500" : "text-gray-300"
            }`}
          />
        </button>
      ))}
      <span className="ml-2 text-sm text-gray-600">
        {value > 0 ? `${value}/5` : "ยังไม่ให้คะแนน"}
      </span>
    </div>
  );
}

export default function ManagerInterviewEvalPage() {
  const [tab, setTab] = useState<"list" | "new">("list");
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [candidates, setCandidates] = useState<FormRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [search, setSearch] = useState("");

  const [selectedForm, setSelectedForm] = useState<FormRow | null>(null);
  const [round, setRound] = useState(1);
  const [scores, setScores] = useState({
    personality: 0,
    communication: 0,
    knowledge: 0,
    experience: 0,
    attitude: 0,
    overallScore: 0,
  });
  const [recommendation, setRecommendation] = useState("");
  const [strengths, setStrengths] = useState("");
  const [weaknesses, setWeaknesses] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  async function fetchEvaluations() {
    setLoading(true);
    try {
      const res = await fetch("/api/interview-evaluations");
      if (res.ok) {
        const data = await res.json();
        setEvaluations(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCandidates() {
    setLoadingCandidates(true);
    try {
      const res = await fetch(
        "/api/application-forms?status=INTERVIEW_SCHEDULED"
      );
      if (res.ok) {
        const data = await res.json();
        setCandidates(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCandidates(false);
    }
  }

  useEffect(() => {
    fetchEvaluations();
  }, []);

  useEffect(() => {
    if (tab === "new") fetchCandidates();
  }, [tab]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return evaluations;
    return evaluations.filter((e) => {
      const n = fullName(e.form).toLowerCase();
      const p = (e.form?.positionTitle || "").toLowerCase();
      return n.includes(s) || p.includes(s);
    });
  }, [evaluations, search]);

  function resetForm() {
    setSelectedForm(null);
    setRound(1);
    setScores({
      personality: 0,
      communication: 0,
      knowledge: 0,
      experience: 0,
      attitude: 0,
      overallScore: 0,
    });
    setRecommendation("");
    setStrengths("");
    setWeaknesses("");
    setNotes("");
    setErrorMsg("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!selectedForm) {
      setErrorMsg("กรุณาเลือกผู้สมัครที่ต้องการประเมิน");
      return;
    }
    if (!recommendation) {
      setErrorMsg("กรุณาเลือกข้อเสนอแนะ");
      return;
    }
    if (scores.overallScore === 0) {
      setErrorMsg("กรุณาให้คะแนนรวม");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/interview-evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId: selectedForm.id,
          round,
          ...scores,
          recommendation,
          strengths,
          weaknesses,
          notes,
          evaluationDate: new Date().toISOString(),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "บันทึกไม่สำเร็จ");
      }
      setSuccessMsg("บันทึกใบประเมินสัมภาษณ์เรียบร้อยแล้ว");
      resetForm();
      await fetchEvaluations();
      setTab("list");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <UserCheck className="h-6 w-6 text-green-600" />
          ใบประเมินสัมภาษณ์
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          บันทึกผลการประเมินการสัมภาษณ์ผู้สมัครในแผนกของคุณ
        </p>
      </div>

      {successMsg && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setTab("list")}
          className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            tab === "list"
              ? "border-green-600 text-green-700"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <ClipboardList className="h-4 w-4" />
          รายการใบประเมิน
          <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
            {evaluations.length}
          </span>
        </button>
        <button
          onClick={() => setTab("new")}
          className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            tab === "new"
              ? "border-green-600 text-green-700"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Plus className="h-4 w-4" />
          ประเมินใหม่
        </button>
      </div>

      {tab === "list" && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อหรือตำแหน่ง..."
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
            />
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-green-600" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-3 rounded-full bg-green-50 p-4">
                  <UserCheck className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-gray-600">ยังไม่มีรายการใบประเมิน</p>
                <button
                  onClick={() => setTab("new")}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                >
                  <Plus className="h-4 w-4" />
                  สร้างใบประเมินใหม่
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-green-50 text-left text-xs font-semibold uppercase tracking-wide text-green-800">
                    <tr>
                      <th className="px-4 py-3">ชื่อ</th>
                      <th className="px-4 py-3">ตำแหน่ง</th>
                      <th className="px-4 py-3">ครั้งที่</th>
                      <th className="px-4 py-3">วันประเมิน</th>
                      <th className="px-4 py-3 text-center">คะแนนรวม</th>
                      <th className="px-4 py-3">ข้อเสนอแนะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map((e) => (
                      <tr key={e.id} className="hover:bg-green-50/40">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {fullName(e.form)}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {e.form?.positionTitle || "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          ครั้งที่ {e.round}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {formatDate(e.evaluationDate)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800">
                            <Star className="h-3 w-3 fill-green-600 text-green-600" />
                            {e.overallScore ?? "-"}/5
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {e.recommendation
                            ? RECOMMEND_LABELS[e.recommendation] ||
                              e.recommendation
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "new" && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Candidate picker */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
              <UserCheck className="h-5 w-5 text-green-600" />
              1. เลือกผู้สมัคร (สถานะ: รอสัมภาษณ์)
            </h2>

            {loadingCandidates ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-green-600" />
              </div>
            ) : candidates.length === 0 ? (
              <p className="rounded-lg bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
                ไม่พบผู้สมัครที่รอสัมภาษณ์
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {candidates.map((c) => {
                  const selected = selectedForm?.id === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedForm(c)}
                      className={`rounded-lg border-2 p-3 text-left transition-all ${
                        selected
                          ? "border-green-600 bg-green-50"
                          : "border-gray-200 hover:border-green-300 hover:bg-green-50/30"
                      }`}
                    >
                      <p className="font-medium text-gray-900">{fullName(c)}</p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {c.positionTitle || "-"}
                      </p>
                      {selected && (
                        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-green-600 px-2 py-0.5 text-xs font-medium text-white">
                          <CheckCircle2 className="h-3 w-3" />
                          เลือกแล้ว
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                ครั้งที่สัมภาษณ์
              </label>
              <select
                value={round}
                onChange={(e) => setRound(Number(e.target.value))}
                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
              >
                {[1, 2, 3, 4, 5].map((r) => (
                  <option key={r} value={r}>
                    ครั้งที่ {r}
                  </option>
                ))}
              </select>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="mb-2 block text-sm font-semibold text-gray-900">
                วันที่ประเมิน
              </p>
              <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
                {formatDate(new Date().toISOString())}
              </div>
            </div>
          </div>

          {/* Scoring */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-gray-900">
              2. ให้คะแนน (1-5)
            </h2>
            <div className="space-y-4">
              {SCORE_FIELDS.map(({ key, label }) => (
                <div
                  key={key}
                  className="flex flex-col gap-2 rounded-lg border border-gray-100 bg-gray-50/50 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {label}
                  </span>
                  <StarRating
                    value={scores[key]}
                    onChange={(v) => setScores((s) => ({ ...s, [key]: v }))}
                  />
                </div>
              ))}
              <div className="flex flex-col gap-2 rounded-lg border-2 border-green-200 bg-green-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm font-semibold text-green-900">
                  คะแนนรวม (Overall)
                </span>
                <StarRating
                  value={scores.overallScore}
                  onChange={(v) =>
                    setScores((s) => ({ ...s, overallScore: v }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-gray-900">
              3. ข้อเสนอแนะ
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {RECOMMEND_OPTIONS.map((r) => (
                <button
                  key={r.v}
                  type="button"
                  onClick={() => setRecommendation(r.v)}
                  className={`rounded-lg border-2 px-3 py-3 text-sm font-medium transition-all ${
                    recommendation === r.v
                      ? "border-green-600 bg-green-600 text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:border-green-300"
                  }`}
                >
                  {r.l}
                </button>
              ))}
            </div>
          </div>

          {/* Text fields */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-gray-900">
              4. รายละเอียดเพิ่มเติม
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  จุดแข็ง (Strengths)
                </label>
                <textarea
                  rows={3}
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  placeholder="จุดแข็งของผู้สมัคร..."
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  จุดที่ควรพัฒนา (Weaknesses)
                </label>
                <textarea
                  rows={3}
                  value={weaknesses}
                  onChange={(e) => setWeaknesses(e.target.value)}
                  placeholder="จุดที่ผู้สมัครควรพัฒนา..."
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  หมายเหตุ (Notes)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ข้อสังเกตหรือหมายเหตุเพิ่มเติม..."
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                />
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMsg}
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                resetForm();
                setTab("list");
              }}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              บันทึกใบประเมิน
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
