"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Loader2,
  Mail,
  Phone,
  Star,
  User,
  XCircle,
} from "lucide-react";

type Evaluation = {
  id: string;
  formId: string;
  evaluatorId?: string | null;
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
};

type FormDetail = {
  id: string;
  status?: string | null;
  firstNameTh?: string | null;
  lastNameTh?: string | null;
  firstNameEn?: string | null;
  lastNameEn?: string | null;
  email?: string | null;
  phone?: string | null;
  positionTitle?: string | null;
  company?: string | null;
  employeeType?: string | null;
  photoUrl?: string | null;
  expectedSalaryMin?: number | null;
  expectedSalaryMax?: number | null;
  availableStartDate?: string | null;
  currentAddress?: string | null;
  dateOfBirth?: string | null;
  age?: number | null;
  submittedAt?: string | null;
  interviewEvaluations?: Evaluation[];
};

const STATUS_LABELS: Record<string, string> = {
  SUBMITTED: "ส่งใบสมัคร",
  SCREENING: "กำลังคัดกรอง",
  INTERVIEW_SCHEDULED: "นัดสัมภาษณ์แล้ว",
  INTERVIEWED: "สัมภาษณ์แล้ว",
  PROBATION: "ทดลองงาน",
  HIRED: "ผ่านการทดลองงาน",
  REJECTED: "ไม่ผ่าน",
};

const RECOMMEND_LABELS: Record<string, string> = {
  STRONGLY_RECOMMEND: "แนะนำอย่างยิ่ง",
  RECOMMEND: "แนะนำ",
  NEUTRAL: "เป็นกลาง",
  NOT_RECOMMEND: "ไม่แนะนำ",
};

const RECOMMEND_OPTIONS = [
  { v: "STRONGLY_RECOMMEND", l: "แนะนำอย่างยิ่ง" },
  { v: "RECOMMEND", l: "แนะนำ" },
  { v: "NEUTRAL", l: "เป็นกลาง" },
  { v: "NOT_RECOMMEND", l: "ไม่แนะนำ" },
];

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

function fullName(f?: FormDetail | null) {
  if (!f) return "-";
  return `${f.firstNameTh ?? ""} ${f.lastNameTh ?? ""}`.trim() || "-";
}

function formatDate(d?: string | null) {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "-";
  }
}

function StarDisplay({ value }: { value?: number | null }) {
  const v = value || 0;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-4 w-4 ${
            n <= v ? "fill-green-500 text-green-500" : "text-gray-300"
          }`}
        />
      ))}
      <span className="ml-1 text-xs text-gray-600">{v}/5</span>
    </div>
  );
}

function StarInput({
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

export default function ManagerReviewDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const [form, setForm] = useState<FormDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // evaluation form state
  const [evalDate] = useState(() => new Date().toISOString().slice(0, 10));
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
  const [statusUpdating, setStatusUpdating] = useState(false);

  async function fetchForm() {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/application-forms/${id}`);
      if (res.ok) {
        const d = await res.json();
        setForm(d);
        // Use next round by default
        const max = (d.interviewEvaluations || []).reduce(
          (a: number, b: Evaluation) => Math.max(a, b.round),
          0
        );
        setRound(Math.min(max + 1, 5));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchForm();
  }, [id]);

  function resetForm() {
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
          formId: id,
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
      setSuccessMsg("บันทึกใบประเมินเรียบร้อยแล้ว");
      setModalOpen(false);
      resetForm();
      await fetchForm();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  }

  async function changeStatus(newStatus: string, note?: string) {
    if (!id) return;
    setStatusUpdating(true);
    try {
      const res = await fetch(`/api/application-forms/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, note }),
      });
      if (!res.ok) throw new Error("อัปเดตสถานะไม่สำเร็จ");
      await fetchForm();
      setSuccessMsg(
        newStatus === "PROBATION"
          ? "ย้ายผู้สมัครไปขั้นตอนทดลองงานแล้ว"
          : newStatus === "REJECTED"
          ? "บันทึกผลไม่ผ่านเรียบร้อยแล้ว"
          : "อัปเดตสถานะเรียบร้อยแล้ว"
      );
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (e: any) {
      setErrorMsg(e.message || "อัปเดตสถานะไม่สำเร็จ");
    } finally {
      setStatusUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-green-600" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-600">ไม่พบข้อมูลใบสมัคร</p>
        <Link
          href="/manager/reviews"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-green-700 hover:text-green-800"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับไปหน้ารายการ
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <div>
        <Link
          href="/manager/reviews"
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-green-700"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับไปรายการใบสมัคร
        </Link>
      </div>

      {successMsg && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMsg}
        </div>
      )}

      {/* Header card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            {form.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.photoUrl}
                alt=""
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-xl font-semibold text-green-700">
                {fullName(form).charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {fullName(form)}
              </h1>
              <p className="mt-0.5 text-sm text-gray-600">
                {form.positionTitle || "-"} ({form.company || "-"})
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                  {STATUS_LABELS[form.status || ""] || form.status}
                </span>
                {form.employeeType && (
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                    {form.employeeType}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-green-700"
          >
            <ClipboardCheck className="h-4 w-4" />
            บันทึกการประเมินสัมภาษณ์
          </button>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <User className="h-4 w-4 text-green-600" />
            ข้อมูลส่วนตัว
          </h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">วันเกิด</dt>
              <dd className="text-gray-900">{formatDate(form.dateOfBirth)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">อายุ</dt>
              <dd className="text-gray-900">
                {form.age != null ? `${form.age} ปี` : "-"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Mail className="h-4 w-4 text-green-600" />
            ติดต่อ
          </h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-gray-500">อีเมล</dt>
              <dd className="truncate text-gray-900">{form.email || "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">โทรศัพท์</dt>
              <dd className="text-gray-900">
                <span className="inline-flex items-center gap-1">
                  {form.phone && <Phone className="h-3 w-3 text-gray-400" />}
                  {form.phone || "-"}
                </span>
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Briefcase className="h-4 w-4 text-green-600" />
            งาน
          </h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">เงินเดือนคาดหวัง</dt>
              <dd className="text-gray-900">
                {form.expectedSalaryMin || form.expectedSalaryMax
                  ? `${form.expectedSalaryMin ?? "-"} - ${
                      form.expectedSalaryMax ?? "-"
                    }`
                  : "-"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">เริ่มงานได้</dt>
              <dd className="text-gray-900">
                {formatDate(form.availableStartDate)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">สมัครเมื่อ</dt>
              <dd className="text-gray-900">{formatDate(form.submittedAt)}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Past evaluations */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
          <FileText className="h-5 w-5 text-green-600" />
          ประวัติการประเมินสัมภาษณ์
        </h2>

        {!form.interviewEvaluations ||
        form.interviewEvaluations.length === 0 ? (
          <p className="rounded-lg bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
            ยังไม่มีการประเมิน
          </p>
        ) : (
          <div className="space-y-3">
            {form.interviewEvaluations.map((e) => (
              <div
                key={e.id}
                className="rounded-lg border border-gray-200 bg-gradient-to-br from-white to-green-50/30 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      สัมภาษณ์ครั้งที่ {e.round}{" "}
                      <span className="ml-2 text-xs font-normal text-gray-500">
                        {formatDate(e.evaluationDate)}
                      </span>
                    </p>
                    {e.recommendation && (
                      <span className="mt-1 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        {RECOMMEND_LABELS[e.recommendation] ||
                          e.recommendation}
                      </span>
                    )}
                  </div>
                  <div className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white">
                    <Star className="mr-1 inline h-3 w-3 fill-white" />
                    {e.overallScore ?? "-"}/5
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {SCORE_FIELDS.map((f) => (
                    <div key={f.key} className="text-xs">
                      <p className="text-gray-500">{f.label}</p>
                      <StarDisplay value={(e as any)[f.key]} />
                    </div>
                  ))}
                </div>

                {(e.strengths || e.weaknesses || e.notes) && (
                  <div className="mt-3 space-y-2 border-t border-gray-100 pt-3 text-xs">
                    {e.strengths && (
                      <p>
                        <span className="font-medium text-gray-700">
                          จุดแข็ง:
                        </span>{" "}
                        <span className="text-gray-600">{e.strengths}</span>
                      </p>
                    )}
                    {e.weaknesses && (
                      <p>
                        <span className="font-medium text-gray-700">
                          จุดที่ควรพัฒนา:
                        </span>{" "}
                        <span className="text-gray-600">{e.weaknesses}</span>
                      </p>
                    )}
                    {e.notes && (
                      <p>
                        <span className="font-medium text-gray-700">
                          หมายเหตุ:
                        </span>{" "}
                        <span className="text-gray-600">{e.notes}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-gray-900">
          การดำเนินการ
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            disabled={statusUpdating}
            onClick={() =>
              changeStatus("PROBATION", "ผ่านสัมภาษณ์ ไปขั้นทดลองงาน")
            }
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {statusUpdating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            ผ่านสัมภาษณ์ - ทดลองงาน
          </button>
          <button
            disabled={statusUpdating}
            onClick={() => changeStatus("REJECTED", "ไม่ผ่านสัมภาษณ์")}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {statusUpdating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            ไม่ผ่าน
          </button>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative z-10 my-8 w-full max-w-3xl rounded-xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between rounded-t-xl border-b border-gray-200 bg-white px-6 py-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <ClipboardCheck className="h-5 w-5 text-green-600" />
                บันทึกการประเมินสัมภาษณ์
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              <div className="rounded-lg bg-green-50 p-4">
                <p className="text-sm text-green-800">
                  ผู้สมัคร:{" "}
                  <span className="font-semibold">{fullName(form)}</span> ·{" "}
                  {form.positionTitle}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    ครั้งที่
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
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    วันที่ประเมิน
                  </label>
                  <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {formatDate(evalDate)}
                  </div>
                </div>
              </div>

              {/* Scoring */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  คะแนนประเมิน (1-5)
                </h3>
                {SCORE_FIELDS.map((f) => (
                  <div
                    key={f.key}
                    className="flex flex-col gap-2 rounded-lg border border-gray-100 bg-gray-50/50 p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {f.label}
                    </span>
                    <StarInput
                      value={scores[f.key]}
                      onChange={(v) =>
                        setScores((s) => ({ ...s, [f.key]: v }))
                      }
                    />
                  </div>
                ))}
                <div className="flex flex-col gap-2 rounded-lg border-2 border-green-200 bg-green-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm font-semibold text-green-900">
                    คะแนนรวม (Overall)
                  </span>
                  <StarInput
                    value={scores.overallScore}
                    onChange={(v) =>
                      setScores((s) => ({ ...s, overallScore: v }))
                    }
                  />
                </div>
              </div>

              {/* Recommendation */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  ข้อเสนอแนะ
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {RECOMMEND_OPTIONS.map((r) => (
                    <button
                      key={r.v}
                      type="button"
                      onClick={() => setRecommendation(r.v)}
                      className={`rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all ${
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

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  จุดแข็ง
                </label>
                <textarea
                  rows={2}
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  จุดที่ควรพัฒนา
                </label>
                <textarea
                  rows={2}
                  value={weaknesses}
                  onChange={(e) => setWeaknesses(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  หมายเหตุ
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                />
              </div>

              {errorMsg && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMsg}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
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
          </div>
        </div>
      )}
    </div>
  );
}
