"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertCircle,
  Loader2,
  FileText,
  Download,
  CheckCircle2,
  XCircle,
  Search,
  UserCheck,
  BriefcaseBusiness,
  User2,
  Users,
  GraduationCap,
  BookOpen,
  Languages,
  Sparkles,
  HeartPulse,
  PhoneCall,
  FolderOpen,
  ClipboardCheck,
  Award,
} from "lucide-react";
import { COMPANIES, EMPLOYEE_TYPES } from "@/lib/form-constants";
import {
  FORM_STATUS_COLORS,
  FORM_STATUS_LABELS,
} from "@/lib/status-helpers";
import { formatDate, formatSalary } from "@/lib/utils";

type TrainingItem = {
  id: string;
  courseName: string;
  institution: string | null;
  year: number | null;
  duration: string | null;
  certificate: boolean;
};

type WorkExperienceItem = {
  id: string;
  company: string;
  position: string;
  startDate: string | null;
  endDate: string | null;
  salary: number | null;
  reasonForLeaving: string | null;
  responsibilities: string | null;
};

type LanguageItem = {
  id: string;
  language: string;
  speaking: string | null;
  reading: string | null;
  writing: string | null;
  listening: string | null;
};

type InterviewEvaluation = {
  id: string;
  evaluatorId: string | null;
  evaluationDate: string;
  round: number;
  personality: number | null;
  communication: number | null;
  knowledge: number | null;
  experience: number | null;
  attitude: number | null;
  overallScore: number | null;
  recommendation: string | null;
  strengths: string | null;
  weaknesses: string | null;
  notes: string | null;
};

type ProbationEvaluation = {
  id: string;
  evaluatorId: string | null;
  evaluationDate: string;
  workQuality: number | null;
  discipline: number | null;
  teamwork: number | null;
  responsibility: number | null;
  learningAbility: number | null;
  overallScore: number | null;
  result: string | null;
  notes: string | null;
};

type ApplicationFormFull = {
  id: string;
  status: string;
  employeeType: string;
  company: string;
  positionId: string | null;
  positionTitle: string;
  sourceOfInfo: string[];
  sourceOfInfoOther: string | null;
  referredBy: string | null;
  incomeTypes: string[];
  currentSalary: number | null;
  otAllowance: number | null;
  shiftAllowance: number | null;
  positionAllowance: number | null;
  foodAllowance: number | null;
  travelAllowance: number | null;
  bonusYearly: number | null;
  expectedSalaryMin: number | null;
  expectedSalaryMax: number | null;
  availableStartDate: string | null;
  lastYearExperience: string | null;
  internStartDate: string | null;
  internEndDate: string | null;
  internDepartment: string | null;
  photoUrl: string | null;
  resumeUrl: string | null;
  titleTh: string | null;
  firstNameTh: string | null;
  lastNameTh: string | null;
  titleEn: string | null;
  firstNameEn: string | null;
  lastNameEn: string | null;
  nicknameTh: string | null;
  nicknameEn: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  age: number | null;
  birthProvince: string | null;
  nationality: string | null;
  ethnicity: string | null;
  religion: string | null;
  height: number | null;
  weight: number | null;
  email: string | null;
  lineId: string | null;
  currentAddress: string | null;
  permanentAddress: string | null;
  socialSecurityStatus: string | null;
  hospitalWithSS: string | null;
  hospitalWithSSOther: string | null;
  hospitalNoSS: string | null;
  hospitalNoSSOther: string | null;
  maritalStatus: string | null;
  spouseTitle: string | null;
  spouseName: string | null;
  spouseOccupation: string | null;
  spouseWorkplace: string | null;
  spousePhone: string | null;
  numChildren: number | null;
  fatherTitle: string | null;
  fatherName: string | null;
  fatherStatus: string | null;
  fatherAge: number | null;
  fatherOccupation: string | null;
  fatherPhone: string | null;
  motherTitle: string | null;
  motherName: string | null;
  motherStatus: string | null;
  motherAge: number | null;
  motherOccupation: string | null;
  motherPhone: string | null;
  siblings: number | null;
  childOrder: number | null;
  educationLevels: string[];
  educationData: any;
  internStudyYear: string | null;
  internGpa: number | null;
  internInstitution: string | null;
  internFaculty: string | null;
  internMajor: string | null;
  advisorTitle: string | null;
  advisorName: string | null;
  advisorPhone: string | null;
  advisorEmail: string | null;
  computerSkills: string[];
  excelSkills: string[];
  excelSkillsOther: string | null;
  wordSkills: string[];
  wordSkillsOther: string | null;
  powerpointSkills: string[];
  powerpointSkillsOther: string | null;
  photoshopSkills: string[];
  photoshopSkillsOther: string | null;
  otherSkills: string | null;
  interestedWork: string | null;
  travelMode: string | null;
  shuttleRoute: string | null;
  canDriveCar: string | null;
  carLicenseNumber: string | null;
  hasCar: string | null;
  carPlate: string | null;
  canDriveMotorcycle: string | null;
  motorcycleLicenseNumber: string | null;
  hasMotorcycle: string | null;
  motorcyclePlate: string | null;
  firedForMisconduct: string | null;
  firedReason: string | null;
  smoke: string | null;
  smokeReason: string | null;
  smokeFrequency: string | null;
  alcohol: string | null;
  alcoholReason: string | null;
  alcoholFrequency: string | null;
  drugs: string | null;
  drugsReason: string | null;
  seriousInjury: string | null;
  injuryDetail: string | null;
  chronicDisease: string | null;
  chronicDiseaseDetail: string | null;
  seriousDisease: string | null;
  seriousDiseaseDetail: string | null;
  surgery: string | null;
  surgeryDetail: string | null;
  firedForRule: string | null;
  firedRuleReason: string | null;
  jailed: string | null;
  jailedReason: string | null;
  debtLawsuit: string | null;
  debtReason: string | null;
  healthy: string | null;
  disabilityDetail: string | null;
  pregnant: string | null;
  pregnancyWeeks: string | null;
  severeMenstrualPain: string | null;
  mentalIllness: string | null;
  mentalIllnessDetail: string | null;
  wifePregnant: string | null;
  wifePregnancyWeeks: string | null;
  emTitle1: string | null;
  emName1: string | null;
  emRelation1: string | null;
  emPhone1: string | null;
  emTitle2: string | null;
  emName2: string | null;
  emRelation2: string | null;
  emPhone2: string | null;
  allowPrevEmployerContact: string | null;
  allowPrevEmployerReason: string | null;
  nonRelRelation: string | null;
  nonRelTitle: string | null;
  nonRelName: string | null;
  nonRelAddress: string | null;
  nonRelPhone: string | null;
  nonRelPosition: string | null;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
  trainings: TrainingItem[];
  workExperiences: WorkExperienceItem[];
  languages: LanguageItem[];
  interviewEvaluations: InterviewEvaluation[];
  probationEvaluations: ProbationEvaluation[];
};

const COMPANY_LABEL = (v: string) =>
  COMPANIES.find((c) => c.value === v)?.label ?? v;
const EMP_TYPE_LABEL = (v: string) =>
  EMPLOYEE_TYPES.find((e) => e.value === v)?.label ?? v;

function val(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return "-";
  const s = String(v).trim();
  return s.length === 0 ? "-" : s;
}

function dateVal(d: string | null | undefined): string {
  if (!d) return "-";
  try {
    return formatDate(d);
  } catch {
    return d;
  }
}

function money(n: number | null | undefined): string {
  if (n === null || n === undefined) return "-";
  try {
    return formatSalary(n);
  } catch {
    return `${n}`;
  }
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={"flex flex-col gap-0.5 " + className}>
      <div className="text-xs font-medium text-gray-500">{label}</div>
      <div className="text-sm text-gray-900">{children ?? "-"}</div>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
  id,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section
      id={id}
      className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
    >
      <div className="flex items-center gap-2 border-b border-gray-200 bg-green-50 px-5 py-3">
        <Icon className="h-5 w-5 text-green-700" />
        <h2 className="text-base font-semibold text-green-800">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function ListOrDash({ items }: { items: string[] | null | undefined }) {
  if (!items || items.length === 0) return <>-</>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((it) => (
        <span
          key={it}
          className="inline-flex rounded-md border border-green-200 bg-green-50 px-2 py-0.5 text-xs text-green-700"
        >
          {it}
        </span>
      ))}
    </div>
  );
}

const EDU_FIELD_LABELS: Record<string, string> = {
  institution: "ชื่อสถานศึกษา",
  faculty: "คณะ",
  major: "สาขาวิชา",
  startYear: "เริ่มปี พ.ศ.",
  endYear: "สำเร็จปี พ.ศ.",
  gpa: "เกรดเฉลี่ย",
  degree: "วุฒิ",
};

function EducationView({ data }: { data: any }) {
  if (!data || (typeof data === "object" && Object.keys(data).length === 0)) {
    return <div className="text-sm text-gray-500">-</div>;
  }

  if (typeof data === "object" && !Array.isArray(data)) {
    const entries = Object.entries(data);
    if (entries.length === 0) return <div className="text-sm text-gray-500">-</div>;

    return (
      <div className="space-y-3">
        {entries.map(([level, detail]) => (
          <div key={level} className="rounded-lg border border-green-200 bg-green-50/50 p-4">
            <h4 className="mb-2 font-semibold text-green-700">{level}</h4>
            {typeof detail === "object" && detail !== null ? (
              <div className="grid gap-2 md:grid-cols-2">
                {Object.entries(detail as Record<string, any>).map(([k, v]) => {
                  const label = EDU_FIELD_LABELS[k] || k;
                  const value = v === null || v === "" || v === undefined ? "-" : String(v);
                  return (
                    <div key={k} className="flex gap-2 text-sm">
                      <span className="min-w-[130px] font-medium text-gray-500">{label}:</span>
                      <span className="text-gray-900">{value}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <span className="text-sm text-gray-700">{String(detail ?? "-")}</span>
            )}
          </div>
        ))}
      </div>
    );
  }

  return <div className="text-sm text-gray-700">{String(data)}</div>;
}

export default function HRApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const [form, setForm] = useState<ApplicationFormFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/application-forms/${id}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as ApplicationFormFull;
      setForm(data);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(next: string, confirmMsg?: string) {
    if (!form) return;
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    setActing(next);
    try {
      const res = await fetch(`/api/application-forms/${form.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await load();
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "อัปเดตสถานะไม่สำเร็จ");
    } finally {
      setActing(null);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-gray-500">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <span>กำลังโหลดข้อมูลใบสมัคร...</span>
        </div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="mx-auto max-w-md">
        <div className="flex flex-col items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <div className="font-medium text-red-700">ไม่สามารถโหลดใบสมัครได้</div>
          <div className="text-sm text-red-600">{error || "ไม่พบข้อมูล"}</div>
          <Link
            href="/hr/applications"
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับหน้ารายการ
          </Link>
        </div>
      </div>
    );
  }

  const fullNameTh =
    [form.titleTh, form.firstNameTh, form.lastNameTh]
      .filter(Boolean)
      .join(" ")
      .trim() || "-";
  const fullNameEn =
    [form.titleEn, form.firstNameEn, form.lastNameEn]
      .filter(Boolean)
      .join(" ")
      .trim() || "-";

  const status = form.status;

  const canScreen = status === "SUBMITTED";
  const canPassScreening = status === "SCREENING";
  const canHire = status === "INTERVIEWED" || status === "PROBATION";
  const canReject = ![
    "REJECTED",
    "HIRED",
    "DRAFT",
  ].includes(status);

  return (
    <div className="space-y-6">
      {/* Top Nav / Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/hr/applications")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับ
        </button>
        <a
          href={`/hr/applications/${form.id}/print`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-green-700"
        >
          📄 Export PDF
        </a>
      </div>

      {/* Header Card */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-white p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            {form.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.photoUrl}
                alt={fullNameTh}
                className="h-24 w-24 rounded-lg border-2 border-green-200 object-cover shadow-sm"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-green-200 bg-green-100 text-2xl font-semibold text-green-700">
                {(form.firstNameTh?.[0] || form.firstNameEn?.[0] || "?").toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">{fullNameTh}</h1>
                <span
                  className={
                    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium " +
                    (FORM_STATUS_COLORS[status] ??
                      "bg-gray-100 text-gray-700 border-gray-200")
                  }
                >
                  {FORM_STATUS_LABELS[status] ?? status}
                </span>
              </div>
              <div className="mt-0.5 text-sm text-gray-500">{fullNameEn}</div>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-700">
                <span className="flex items-center gap-1">
                  <BriefcaseBusiness className="h-4 w-4 text-green-600" />
                  {val(form.positionTitle)}
                </span>
                <span>{EMP_TYPE_LABEL(form.employeeType)}</span>
                <span className="text-xs text-gray-500">
                  {COMPANY_LABEL(form.company)}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                <span>อีเมล: {val(form.email)}</span>
                <span>โทร: {val(form.phone)}</span>
                <span>
                  วันที่สมัคร:{" "}
                  {form.submittedAt
                    ? dateVal(form.submittedAt)
                    : dateVal(form.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 border-t border-gray-200 bg-gray-50 px-5 py-3">
          {canScreen && (
            <button
              onClick={() => updateStatus("SCREENING")}
              disabled={acting !== null}
              className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-green-700 disabled:opacity-50"
            >
              {acting === "SCREENING" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              เริ่มคัดกรอง
            </button>
          )}
          {canPassScreening && (
            <button
              onClick={() => updateStatus("INTERVIEW_SCHEDULED")}
              disabled={acting !== null}
              className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-green-700 disabled:opacity-50"
            >
              {acting === "INTERVIEW_SCHEDULED" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              ผ่านคัดกรอง
            </button>
          )}
          {canHire && (
            <button
              onClick={() =>
                updateStatus("HIRED", "ยืนยันรับผู้สมัครเข้าทำงาน?")
              }
              disabled={acting !== null}
              className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-green-700 disabled:opacity-50"
            >
              {acting === "HIRED" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserCheck className="h-4 w-4" />
              )}
              รับเข้าทำงาน
            </button>
          )}
          {canReject && (
            <button
              onClick={() =>
                updateStatus(
                  "REJECTED",
                  "ยืนยันไม่ผ่าน/ปฏิเสธผู้สมัครรายนี้?"
                )
              }
              disabled={acting !== null}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 shadow-sm transition-colors hover:bg-red-100 disabled:opacity-50"
            >
              {acting === "REJECTED" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              ไม่ผ่าน/ปฏิเสธ
            </button>
          )}
          {!canScreen && !canPassScreening && !canHire && !canReject && (
            <span className="text-xs text-gray-500">
              ไม่มีการดำเนินการเพิ่มเติม
            </span>
          )}
        </div>
      </div>

      {/* 1. ข้อมูลการสมัคร */}
      <Section title="1. ข้อมูลการสมัคร" icon={BriefcaseBusiness}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="ประเภทพนักงาน">
            {EMP_TYPE_LABEL(form.employeeType)}
          </Field>
          <Field label="บริษัท">{COMPANY_LABEL(form.company)}</Field>
          <Field label="ตำแหน่งที่สมัคร">{val(form.positionTitle)}</Field>
          <Field label="แหล่งที่ทราบข่าว">
            <ListOrDash items={form.sourceOfInfo} />
          </Field>
          <Field label="แหล่งข่าวอื่น ๆ">{val(form.sourceOfInfoOther)}</Field>
          <Field label="แนะนำโดย">{val(form.referredBy)}</Field>
          <Field label="วันที่พร้อมเริ่มงาน">
            {dateVal(form.availableStartDate)}
          </Field>
          <Field label="ประสบการณ์ (ปีล่าสุด)">
            {val(form.lastYearExperience)}
          </Field>
          <Field label="เงินเดือนปัจจุบัน">{money(form.currentSalary)}</Field>
          <Field label="เงินเดือนที่คาดหวัง">
            {form.expectedSalaryMin || form.expectedSalaryMax
              ? `${money(form.expectedSalaryMin)} - ${money(
                  form.expectedSalaryMax
                )}`
              : "-"}
          </Field>
          <Field label="ค่าโอที">{money(form.otAllowance)}</Field>
          <Field label="ค่ากะ">{money(form.shiftAllowance)}</Field>
          <Field label="ค่าตำแหน่ง">{money(form.positionAllowance)}</Field>
          <Field label="ค่าอาหาร">{money(form.foodAllowance)}</Field>
          <Field label="ค่าเดินทาง">{money(form.travelAllowance)}</Field>
          <Field label="โบนัสรายปี">{money(form.bonusYearly)}</Field>
          <Field label="ประเภทรายได้">
            <ListOrDash items={form.incomeTypes} />
          </Field>
          {form.employeeType === "INTERN" && (
            <>
              <Field label="วันเริ่มฝึกงาน">
                {dateVal(form.internStartDate)}
              </Field>
              <Field label="วันสิ้นสุดฝึกงาน">
                {dateVal(form.internEndDate)}
              </Field>
              <Field label="แผนกที่ฝึกงาน">{val(form.internDepartment)}</Field>
            </>
          )}
        </div>
      </Section>

      {/* 2. ข้อมูลส่วนตัว */}
      <Section title="2. ข้อมูลส่วนตัว" icon={User2}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="ชื่อ-สกุล (ไทย)">{fullNameTh}</Field>
          <Field label="ชื่อ-สกุล (อังกฤษ)">{fullNameEn}</Field>
          <Field label="ชื่อเล่น (ไทย)">{val(form.nicknameTh)}</Field>
          <Field label="ชื่อเล่น (อังกฤษ)">{val(form.nicknameEn)}</Field>
          <Field label="วันเกิด">{dateVal(form.dateOfBirth)}</Field>
          <Field label="อายุ">{val(form.age)}</Field>
          <Field label="จังหวัดเกิด">{val(form.birthProvince)}</Field>
          <Field label="สัญชาติ">{val(form.nationality)}</Field>
          <Field label="เชื้อชาติ">{val(form.ethnicity)}</Field>
          <Field label="ศาสนา">{val(form.religion)}</Field>
          <Field label="ส่วนสูง (ซม.)">{val(form.height)}</Field>
          <Field label="น้ำหนัก (กก.)">{val(form.weight)}</Field>
          <Field label="อีเมล">{val(form.email)}</Field>
          <Field label="เบอร์โทร">{val(form.phone)}</Field>
          <Field label="LINE ID">{val(form.lineId)}</Field>
          <Field label="ที่อยู่ปัจจุบัน" className="md:col-span-3">
            <div className="whitespace-pre-wrap">{val(form.currentAddress)}</div>
          </Field>
          <Field label="ที่อยู่ตามทะเบียนบ้าน" className="md:col-span-3">
            <div className="whitespace-pre-wrap">{val(form.permanentAddress)}</div>
          </Field>
          <Field label="สิทธิประกันสังคม">
            {val(form.socialSecurityStatus)}
          </Field>
          <Field label="โรงพยาบาลประกันสังคม">
            {val(form.hospitalWithSS)}
            {form.hospitalWithSSOther ? ` (${form.hospitalWithSSOther})` : ""}
          </Field>
          <Field label="โรงพยาบาลกรณีไม่มีสิทธิ">
            {val(form.hospitalNoSS)}
            {form.hospitalNoSSOther ? ` (${form.hospitalNoSSOther})` : ""}
          </Field>
        </div>
      </Section>

      {/* 3. ครอบครัว */}
      <Section title="3. ครอบครัว" icon={Users}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="สถานภาพ">{val(form.maritalStatus)}</Field>
          <Field label="จำนวนบุตร">{val(form.numChildren)}</Field>
          <Field label="จำนวนพี่น้อง">{val(form.siblings)}</Field>
          <Field label="เป็นบุตรคนที่">{val(form.childOrder)}</Field>

          <Field label="คู่สมรส - คำนำหน้า">{val(form.spouseTitle)}</Field>
          <Field label="คู่สมรส - ชื่อ-สกุล">{val(form.spouseName)}</Field>
          <Field label="คู่สมรส - อาชีพ">{val(form.spouseOccupation)}</Field>
          <Field label="คู่สมรส - ที่ทำงาน">{val(form.spouseWorkplace)}</Field>
          <Field label="คู่สมรส - เบอร์โทร">{val(form.spousePhone)}</Field>

          <Field label="บิดา - คำนำหน้า">{val(form.fatherTitle)}</Field>
          <Field label="บิดา - ชื่อ-สกุล">{val(form.fatherName)}</Field>
          <Field label="บิดา - สถานะ">{val(form.fatherStatus)}</Field>
          <Field label="บิดา - อายุ">{val(form.fatherAge)}</Field>
          <Field label="บิดา - อาชีพ">{val(form.fatherOccupation)}</Field>
          <Field label="บิดา - เบอร์โทร">{val(form.fatherPhone)}</Field>

          <Field label="มารดา - คำนำหน้า">{val(form.motherTitle)}</Field>
          <Field label="มารดา - ชื่อ-สกุล">{val(form.motherName)}</Field>
          <Field label="มารดา - สถานะ">{val(form.motherStatus)}</Field>
          <Field label="มารดา - อายุ">{val(form.motherAge)}</Field>
          <Field label="มารดา - อาชีพ">{val(form.motherOccupation)}</Field>
          <Field label="มารดา - เบอร์โทร">{val(form.motherPhone)}</Field>
        </div>
      </Section>

      {/* 4. ประวัติการศึกษา */}
      <Section title="4. ประวัติการศึกษา" icon={GraduationCap}>
        <div className="grid grid-cols-1 gap-4">
          <Field label="ระดับการศึกษา">
            <ListOrDash items={form.educationLevels} />
          </Field>
          <Field label="รายละเอียดการศึกษา">
            <EducationView data={form.educationData} />
          </Field>

          {form.employeeType === "INTERN" && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label="ชั้นปี (ฝึกงาน)">{val(form.internStudyYear)}</Field>
              <Field label="เกรดเฉลี่ย">{val(form.internGpa)}</Field>
              <Field label="สถาบัน">{val(form.internInstitution)}</Field>
              <Field label="คณะ">{val(form.internFaculty)}</Field>
              <Field label="สาขา">{val(form.internMajor)}</Field>
              <Field label="อาจารย์ที่ปรึกษา">
                {[form.advisorTitle, form.advisorName]
                  .filter(Boolean)
                  .join(" ") || "-"}
              </Field>
              <Field label="โทรศัพท์อาจารย์">{val(form.advisorPhone)}</Field>
              <Field label="อีเมลอาจารย์">{val(form.advisorEmail)}</Field>
            </div>
          )}
        </div>
      </Section>

      {/* 5. ประสบการณ์ทำงาน */}
      <Section title="5. ประสบการณ์ทำงาน" icon={BookOpen}>
        {form.workExperiences.length === 0 ? (
          <div className="text-sm text-gray-500">ไม่มีข้อมูล</div>
        ) : (
          <div className="space-y-3">
            {form.workExperiences.map((w) => (
              <div
                key={w.id}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {val(w.position)} @ {val(w.company)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {dateVal(w.startDate)} - {dateVal(w.endDate)}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-green-700">
                    {money(w.salary)}
                  </div>
                </div>
                {w.responsibilities && (
                  <div className="mt-2 text-sm text-gray-700">
                    <span className="font-medium text-gray-500">
                      หน้าที่รับผิดชอบ:
                    </span>{" "}
                    <span className="whitespace-pre-wrap">
                      {w.responsibilities}
                    </span>
                  </div>
                )}
                {w.reasonForLeaving && (
                  <div className="mt-1 text-sm text-gray-700">
                    <span className="font-medium text-gray-500">
                      เหตุผลที่ออก:
                    </span>{" "}
                    {w.reasonForLeaving}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* 6. ภาษา */}
      <Section title="6. ภาษา" icon={Languages}>
        {form.languages.length === 0 ? (
          <div className="text-sm text-gray-500">ไม่มีข้อมูล</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-3 py-2 text-left">ภาษา</th>
                  <th className="px-3 py-2 text-left">พูด</th>
                  <th className="px-3 py-2 text-left">ฟัง</th>
                  <th className="px-3 py-2 text-left">อ่าน</th>
                  <th className="px-3 py-2 text-left">เขียน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {form.languages.map((l) => (
                  <tr key={l.id}>
                    <td className="px-3 py-2 font-medium text-gray-900">
                      {val(l.language)}
                    </td>
                    <td className="px-3 py-2 text-gray-700">
                      {val(l.speaking)}
                    </td>
                    <td className="px-3 py-2 text-gray-700">
                      {val(l.listening)}
                    </td>
                    <td className="px-3 py-2 text-gray-700">
                      {val(l.reading)}
                    </td>
                    <td className="px-3 py-2 text-gray-700">
                      {val(l.writing)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* 7. หลักสูตรอบรม */}
      <Section title="7. หลักสูตรอบรม" icon={Award}>
        {form.trainings.length === 0 ? (
          <div className="text-sm text-gray-500">ไม่มีข้อมูล</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-3 py-2 text-left">หลักสูตร</th>
                  <th className="px-3 py-2 text-left">สถาบัน</th>
                  <th className="px-3 py-2 text-left">ปี</th>
                  <th className="px-3 py-2 text-left">ระยะเวลา</th>
                  <th className="px-3 py-2 text-left">ใบรับรอง</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {form.trainings.map((t) => (
                  <tr key={t.id}>
                    <td className="px-3 py-2 font-medium text-gray-900">
                      {val(t.courseName)}
                    </td>
                    <td className="px-3 py-2 text-gray-700">
                      {val(t.institution)}
                    </td>
                    <td className="px-3 py-2 text-gray-700">{val(t.year)}</td>
                    <td className="px-3 py-2 text-gray-700">
                      {val(t.duration)}
                    </td>
                    <td className="px-3 py-2">
                      {t.certificate ? (
                        <span className="inline-flex rounded-md bg-green-100 px-2 py-0.5 text-xs text-green-700">
                          มีใบรับรอง
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* 8. ทักษะ */}
      <Section title="8. ทักษะ" icon={Sparkles}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="ทักษะคอมพิวเตอร์">
            <ListOrDash items={form.computerSkills} />
          </Field>
          <Field label="Excel">
            <ListOrDash items={form.excelSkills} />
            {form.excelSkillsOther && (
              <div className="mt-1 text-xs text-gray-500">
                อื่นๆ: {form.excelSkillsOther}
              </div>
            )}
          </Field>
          <Field label="Word">
            <ListOrDash items={form.wordSkills} />
            {form.wordSkillsOther && (
              <div className="mt-1 text-xs text-gray-500">
                อื่นๆ: {form.wordSkillsOther}
              </div>
            )}
          </Field>
          <Field label="PowerPoint">
            <ListOrDash items={form.powerpointSkills} />
            {form.powerpointSkillsOther && (
              <div className="mt-1 text-xs text-gray-500">
                อื่นๆ: {form.powerpointSkillsOther}
              </div>
            )}
          </Field>
          <Field label="Photoshop">
            <ListOrDash items={form.photoshopSkills} />
            {form.photoshopSkillsOther && (
              <div className="mt-1 text-xs text-gray-500">
                อื่นๆ: {form.photoshopSkillsOther}
              </div>
            )}
          </Field>
          <Field label="ทักษะอื่น ๆ">{val(form.otherSkills)}</Field>
          <Field label="ลักษณะงานที่สนใจ" className="md:col-span-2">
            <div className="whitespace-pre-wrap">{val(form.interestedWork)}</div>
          </Field>

          <Field label="การเดินทาง">{val(form.travelMode)}</Field>
          <Field label="สายรถรับส่ง">{val(form.shuttleRoute)}</Field>

          <Field label="ขับรถยนต์">
            {val(form.canDriveCar)}
            {form.hasCar ? ` / รถส่วนตัว: ${form.hasCar}` : ""}
          </Field>
          <Field label="ใบขับขี่รถยนต์">{val(form.carLicenseNumber)}</Field>
          <Field label="ทะเบียนรถยนต์">{val(form.carPlate)}</Field>

          <Field label="ขับมอเตอร์ไซค์">
            {val(form.canDriveMotorcycle)}
            {form.hasMotorcycle
              ? ` / มอไซค์ส่วนตัว: ${form.hasMotorcycle}`
              : ""}
          </Field>
          <Field label="ใบขับขี่ จยย.">
            {val(form.motorcycleLicenseNumber)}
          </Field>
          <Field label="ทะเบียน จยย.">{val(form.motorcyclePlate)}</Field>
        </div>
      </Section>

      {/* 9. สุขภาพ */}
      <Section title="9. สุขภาพ" icon={HeartPulse}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="สูบบุหรี่">
            {val(form.smoke)}
            {form.smokeReason ? ` / เหตุผล: ${form.smokeReason}` : ""}
            {form.smokeFrequency ? ` / ความถี่: ${form.smokeFrequency}` : ""}
          </Field>
          <Field label="ดื่มแอลกอฮอล์">
            {val(form.alcohol)}
            {form.alcoholReason ? ` / เหตุผล: ${form.alcoholReason}` : ""}
            {form.alcoholFrequency
              ? ` / ความถี่: ${form.alcoholFrequency}`
              : ""}
          </Field>
          <Field label="ยาเสพติด">
            {val(form.drugs)}
            {form.drugsReason ? ` / เหตุผล: ${form.drugsReason}` : ""}
          </Field>
          <Field label="เคยบาดเจ็บสาหัส">
            {val(form.seriousInjury)}
            {form.injuryDetail ? ` / ${form.injuryDetail}` : ""}
          </Field>
          <Field label="โรคเรื้อรัง">
            {val(form.chronicDisease)}
            {form.chronicDiseaseDetail
              ? ` / ${form.chronicDiseaseDetail}`
              : ""}
          </Field>
          <Field label="โรคร้ายแรง">
            {val(form.seriousDisease)}
            {form.seriousDiseaseDetail
              ? ` / ${form.seriousDiseaseDetail}`
              : ""}
          </Field>
          <Field label="ผ่าตัด">
            {val(form.surgery)}
            {form.surgeryDetail ? ` / ${form.surgeryDetail}` : ""}
          </Field>
          <Field label="สุขภาพแข็งแรง">{val(form.healthy)}</Field>
          <Field label="ความพิการ">{val(form.disabilityDetail)}</Field>
          <Field label="ตั้งครรภ์">
            {val(form.pregnant)}
            {form.pregnancyWeeks ? ` / ${form.pregnancyWeeks} สัปดาห์` : ""}
          </Field>
          <Field label="ประจำเดือนเจ็บปวดรุนแรง">
            {val(form.severeMenstrualPain)}
          </Field>
          <Field label="ป่วยทางจิต">
            {val(form.mentalIllness)}
            {form.mentalIllnessDetail ? ` / ${form.mentalIllnessDetail}` : ""}
          </Field>
          <Field label="ภรรยาตั้งครรภ์">
            {val(form.wifePregnant)}
            {form.wifePregnancyWeeks
              ? ` / ${form.wifePregnancyWeeks} สัปดาห์`
              : ""}
          </Field>
          <Field label="เคยถูกไล่ออก (ประพฤติ)">
            {val(form.firedForMisconduct)}
            {form.firedReason ? ` / ${form.firedReason}` : ""}
          </Field>
          <Field label="เคยถูกไล่ออก (ระเบียบ)">
            {val(form.firedForRule)}
            {form.firedRuleReason ? ` / ${form.firedRuleReason}` : ""}
          </Field>
          <Field label="เคยถูกคุมขัง">
            {val(form.jailed)}
            {form.jailedReason ? ` / ${form.jailedReason}` : ""}
          </Field>
          <Field label="คดีหนี้สิน">
            {val(form.debtLawsuit)}
            {form.debtReason ? ` / ${form.debtReason}` : ""}
          </Field>
        </div>
      </Section>

      {/* 10. ผู้ติดต่อฉุกเฉิน */}
      <Section title="10. ผู้ติดต่อฉุกเฉิน" icon={PhoneCall}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="mb-2 text-sm font-semibold text-green-700">
              บุคคลอ้างอิง #1
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <Field label="คำนำหน้า">{val(form.emTitle1)}</Field>
              <Field label="ชื่อ-สกุล">{val(form.emName1)}</Field>
              <Field label="ความสัมพันธ์">{val(form.emRelation1)}</Field>
              <Field label="เบอร์โทร">{val(form.emPhone1)}</Field>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="mb-2 text-sm font-semibold text-green-700">
              บุคคลอ้างอิง #2
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <Field label="คำนำหน้า">{val(form.emTitle2)}</Field>
              <Field label="ชื่อ-สกุล">{val(form.emName2)}</Field>
              <Field label="ความสัมพันธ์">{val(form.emRelation2)}</Field>
              <Field label="เบอร์โทร">{val(form.emPhone2)}</Field>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 md:col-span-2">
            <div className="mb-2 text-sm font-semibold text-green-700">
              บุคคลอ้างอิงในสถานที่ทำงานเดิม
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              <Field label="อนุญาตให้ติดต่อนายจ้างเดิม">
                {val(form.allowPrevEmployerContact)}
              </Field>
              <Field label="เหตุผล" className="md:col-span-2">
                {val(form.allowPrevEmployerReason)}
              </Field>
              <Field label="ความสัมพันธ์">{val(form.nonRelRelation)}</Field>
              <Field label="คำนำหน้า">{val(form.nonRelTitle)}</Field>
              <Field label="ชื่อ-สกุล">{val(form.nonRelName)}</Field>
              <Field label="ตำแหน่ง">{val(form.nonRelPosition)}</Field>
              <Field label="เบอร์โทร">{val(form.nonRelPhone)}</Field>
              <Field label="ที่อยู่" className="md:col-span-3">
                <div className="whitespace-pre-wrap">
                  {val(form.nonRelAddress)}
                </div>
              </Field>
            </div>
          </div>
        </div>
      </Section>

      {/* 11. เอกสาร */}
      <Section title="11. เอกสาร" icon={FolderOpen}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="mb-2 text-sm font-medium text-gray-500">
              รูปถ่าย
            </div>
            {form.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.photoUrl}
                alt="photo"
                className="max-h-60 rounded-lg border border-gray-200 object-contain"
              />
            ) : (
              <div className="text-sm text-gray-500">ไม่มีรูปถ่าย</div>
            )}
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="mb-2 text-sm font-medium text-gray-500">Resume</div>
            {form.resumeUrl ? (
              <a
                href={form.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-100"
              >
                <FileText className="h-4 w-4" />
                เปิดดู Resume
                <Download className="h-4 w-4" />
              </a>
            ) : (
              <div className="text-sm text-gray-500">ไม่มีไฟล์ Resume</div>
            )}
          </div>
        </div>
      </Section>

      {/* 12. ใบประเมินสัมภาษณ์ */}
      <Section title="12. ใบประเมินสัมภาษณ์" icon={ClipboardCheck}>
        {form.interviewEvaluations.length === 0 ? (
          <div className="text-sm text-gray-500">ยังไม่มีใบประเมินสัมภาษณ์</div>
        ) : (
          <div className="space-y-3">
            {form.interviewEvaluations.map((e) => (
              <div
                key={e.id}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-semibold text-gray-900">
                    รอบที่ {e.round} - {dateVal(e.evaluationDate)}
                  </div>
                  {e.overallScore !== null && (
                    <div className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                      คะแนนรวม: {e.overallScore}
                    </div>
                  )}
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-5">
                  <Field label="บุคลิก">{val(e.personality)}</Field>
                  <Field label="การสื่อสาร">{val(e.communication)}</Field>
                  <Field label="ความรู้">{val(e.knowledge)}</Field>
                  <Field label="ประสบการณ์">{val(e.experience)}</Field>
                  <Field label="ทัศนคติ">{val(e.attitude)}</Field>
                </div>
                <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                  <Field label="จุดแข็ง">{val(e.strengths)}</Field>
                  <Field label="จุดอ่อน">{val(e.weaknesses)}</Field>
                  <Field label="คำแนะนำ" className="md:col-span-2">
                    {val(e.recommendation)}
                  </Field>
                  <Field label="บันทึกเพิ่มเติม" className="md:col-span-2">
                    <div className="whitespace-pre-wrap">{val(e.notes)}</div>
                  </Field>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* 13. ใบประเมินทดลองงาน */}
      <Section title="13. ใบประเมินทดลองงาน" icon={Award}>
        {form.probationEvaluations.length === 0 ? (
          <div className="text-sm text-gray-500">
            ยังไม่มีใบประเมินทดลองงาน
          </div>
        ) : (
          <div className="space-y-3">
            {form.probationEvaluations.map((e) => (
              <div
                key={e.id}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-semibold text-gray-900">
                    วันประเมิน: {dateVal(e.evaluationDate)}
                  </div>
                  {e.result && (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                      {e.result}
                    </span>
                  )}
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-5">
                  <Field label="คุณภาพงาน">{val(e.workQuality)}</Field>
                  <Field label="ระเบียบวินัย">{val(e.discipline)}</Field>
                  <Field label="ทำงานร่วมกัน">{val(e.teamwork)}</Field>
                  <Field label="ความรับผิดชอบ">{val(e.responsibility)}</Field>
                  <Field label="การเรียนรู้">{val(e.learningAbility)}</Field>
                </div>
                {e.overallScore !== null && (
                  <div className="mt-2 text-sm font-medium text-green-700">
                    คะแนนรวม: {e.overallScore}
                  </div>
                )}
                <div className="mt-2">
                  <Field label="บันทึก">
                    <div className="whitespace-pre-wrap">{val(e.notes)}</div>
                  </Field>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
