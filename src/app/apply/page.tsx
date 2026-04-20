"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Briefcase,
  Check,
  ChevronLeft,
  ChevronRight,
  Upload,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  EMPLOYEE_TYPES,
  COMPANIES,
  SOURCE_OF_INFO,
  INCOME_TYPES,
  TITLE_TH,
  TITLE_EN,
  TITLE_FATHER,
  TITLE_MOTHER,
  NATIONALITIES,
  RELIGIONS,
  SOCIAL_SECURITY,
  MARITAL_STATUS,
  PARENT_STATUS,
  EDUCATION_LEVELS,
  STUDY_YEARS,
  ADVISOR_TITLES,
  COMPUTER_SKILLS,
  EXCEL_SKILLS,
  WORD_SKILLS,
  POWERPOINT_SKILLS,
  PHOTOSHOP_SKILLS,
  TRAVEL_MODES,
  SHUTTLE_ROUTES,
  YES_NO,
  HAS_OR_NOT,
  EVER_OR_NOT,
  CAN_DRIVE,
  REASONS_SMOKE_ALCOHOL,
  FREQUENCIES,
  NON_REL_RELATIONS,
  PREV_EMPLOYER_CONTACT,
  CONSENT_OPTIONS,
  CONSENT_TEXT_COMETS,
  CONSENT_TEXT_ICT,
  CERTIFY_TEXT_EMPLOYEE,
  CERTIFY_TEXT_INTERN,
} from "@/lib/form-constants";

const TOTAL_PAGES = 12;

type FormData = Record<string, any>;

export default function ApplyPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<FormData>({
    sourceOfInfo: [],
    incomeTypes: [],
    educationLevels: [],
    computerSkills: [],
    excelSkills: [],
    wordSkills: [],
    powerpointSkills: [],
    photoshopSkills: [],
    trainings: [],
    workExperiences: [],
    languages: [{ language: "ภาษาไทย", speaking: "", reading: "", writing: "", listening: "" }],
    educationData: {},
  });
  const [positions, setPositions] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);

  const isMonthly = data.employeeType === "MONTHLY";
  const isDaily = data.employeeType === "DAILY";
  const isIntern = data.employeeType === "INTERN";
  const isEmployee = isMonthly || isDaily;
  const isICT = data.company === "ICT";

  const update = (key: string, value: any) => setData((d) => ({ ...d, [key]: value }));

  const toggleArray = (key: string, value: string) => {
    setData((d) => {
      const arr: string[] = d[key] || [];
      return {
        ...d,
        [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  };

  // Fetch reference data
  useEffect(() => {
    fetch("/api/reference?type=hospitals").then((r) => r.json()).then(setHospitals).catch(() => {});
    fetch("/api/reference?type=provinces").then((r) => r.json()).then(setProvinces).catch(() => {});
  }, []);

  useEffect(() => {
    if (data.company) {
      const params = new URLSearchParams({ type: "positions", company: data.company });
      if (data.employeeType) params.set("employeeType", data.employeeType);
      fetch(`/api/reference?${params}`)
        .then((r) => r.json())
        .then(setPositions)
        .catch(() => setPositions([]));
    }
  }, [data.company, data.employeeType]);

  // Age calculation
  useEffect(() => {
    if (data.dateOfBirth) {
      const dob = new Date(data.dateOfBirth);
      const now = new Date();
      let age = now.getFullYear() - dob.getFullYear();
      const m = now.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
      update("age", age);
    }
  }, [data.dateOfBirth]);

  // Compute visible pages based on employee type
  const pageVisible = (p: number): boolean => {
    if (!data.employeeType && p > 1) return false;
    if (p === 9 && isIntern) return false;
    if (p === 12 && isIntern) return false;
    return true;
  };

  const nextPage = () => {
    let p = page + 1;
    while (p <= TOTAL_PAGES && !pageVisible(p)) p++;
    setPage(Math.min(p, TOTAL_PAGES));
  };
  const prevPage = () => {
    let p = page - 1;
    while (p >= 1 && !pageVisible(p)) p--;
    setPage(Math.max(p, 1));
  };

  const visiblePages = useMemo(
    () => Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1).filter(pageVisible),
    [data.employeeType]
  );

  const submit = async () => {
    setSubmitting(true);
    try {
      const position = positions.find((p) => p.id === data.positionId);
      const payload: any = {
        ...data,
        positionTitle: position?.title || data.positionTitle || "",
      };

      const res = await fetch("/api/forms/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await res.json();
      if (j.success) {
        router.push("/success");
      } else {
        alert("เกิดข้อผิดพลาด: " + j.error);
      }
    } catch (e) {
      alert("ไม่สามารถส่งข้อมูลได้: " + String(e));
    } finally {
      setSubmitting(false);
    }
  };

  // Canjump = page 1 has employeeType selected
  const canProceed = () => {
    if (page === 1) return !!data.employeeType;
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 pb-32">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-green-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-600">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 md:text-xl">ใบสมัครงาน</span>
          </Link>
          <div className="text-sm text-gray-500">
            หน้า {page}/{TOTAL_PAGES}
          </div>
        </div>
        {/* Progress Bar */}
        <div className="h-1.5 bg-gray-100">
          <div
            className="h-full bg-green-600 transition-all"
            style={{ width: `${(page / TOTAL_PAGES) * 100}%` }}
          />
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-8 md:px-6">
        <div className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm md:p-8">
          {page === 1 && <Page1 data={data} update={update} />}
          {page === 2 && (
            <Page2
              data={data}
              update={update}
              toggleArray={toggleArray}
              positions={positions}
              isMonthly={isMonthly}
              isDaily={isDaily}
              isIntern={isIntern}
              isEmployee={isEmployee}
            />
          )}
          {page === 3 && (
            <Page3
              data={data}
              update={update}
              hospitals={hospitals}
              provinces={provinces}
              isEmployee={isEmployee}
              isIntern={isIntern}
              isMonthly={isMonthly}
            />
          )}
          {page === 4 && (
            <Page4
              data={data}
              update={update}
              toggleArray={toggleArray}
              isMonthly={isMonthly}
              isDaily={isDaily}
              isIntern={isIntern}
            />
          )}
          {page === 5 && (isMonthly || isIntern) && <Page5 data={data} update={update} />}
          {page === 5 && !(isMonthly || isIntern) && <SkippedPage />}
          {page === 6 && isEmployee && <Page6 data={data} update={update} />}
          {page === 6 && !isEmployee && <SkippedPage />}
          {page === 7 && <Page7 data={data} update={update} />}
          {page === 8 && (
            <Page8
              data={data}
              update={update}
              toggleArray={toggleArray}
              isMonthly={isMonthly}
              isDaily={isDaily}
              isIntern={isIntern}
              isICT={isICT}
            />
          )}
          {page === 9 && isEmployee && <Page9 data={data} update={update} />}
          {page === 9 && !isEmployee && <SkippedPage />}
          {page === 10 && <Page10 data={data} update={update} />}
          {page === 11 && <Page11 data={data} isIntern={isIntern} />}
          {page === 12 && isEmployee && <Page12 data={data} update={update} />}
          {page === 12 && !isEmployee && <SkippedPage />}
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between gap-4">
          <button
            onClick={prevPage}
            disabled={page === 1}
            className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="h-5 w-5" />
            ย้อนกลับ
          </button>
          {page < TOTAL_PAGES ? (
            <button
              onClick={nextPage}
              disabled={!canProceed()}
              className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white shadow-lg shadow-green-600/30 hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ถัดไป
              <ChevronRight className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={submitting || data.consent1 !== "ยินยอม"}
              className="flex items-center gap-2 rounded-xl bg-green-600 px-8 py-3 font-semibold text-white shadow-lg shadow-green-600/30 hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <Check className="h-5 w-5" />
                  บันทึกใบสมัคร
                </>
              )}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

/* ======= Page Components ======= */

function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6 border-b border-green-100 pb-4">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h3 className="mb-4 mt-6 border-l-4 border-green-600 pl-3 text-lg font-semibold text-gray-900">
      {title}
    </h3>
  );
}

function Field({
  label,
  required,
  children,
  help,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  help?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {help && <p className="mt-1 text-xs text-gray-500">{help}</p>}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100 ${props.className || ""}`}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      rows={props.rows || 3}
      className={`w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100 ${props.className || ""}`}
    />
  );
}

function RadioGroup({
  options,
  value,
  onChange,
  columns = 1,
}: {
  options: { value: string; label: string }[] | string[];
  value: string;
  onChange: (v: string) => void;
  columns?: number;
}) {
  const opts = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  return (
    <div
      className={`grid gap-2 ${columns === 2 ? "md:grid-cols-2" : columns === 3 ? "md:grid-cols-3" : ""}`}
    >
      {opts.map((o) => (
        <label
          key={o.value}
          className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
            value === o.value
              ? "border-green-600 bg-green-50 ring-2 ring-green-100"
              : "border-gray-200 bg-white hover:border-green-300"
          }`}
        >
          <input
            type="radio"
            checked={value === o.value}
            onChange={() => onChange(o.value)}
            className="h-4 w-4 accent-green-600"
          />
          <span className="text-sm text-gray-900">{o.label}</span>
        </label>
      ))}
    </div>
  );
}

function CheckboxGroup({
  options,
  value,
  onChange,
  columns = 1,
}: {
  options: string[];
  value: string[];
  onChange: (v: string) => void;
  columns?: number;
}) {
  return (
    <div
      className={`grid gap-2 ${columns === 2 ? "md:grid-cols-2" : columns === 3 ? "md:grid-cols-3" : ""}`}
    >
      {options.map((o) => (
        <label
          key={o}
          className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
            value.includes(o)
              ? "border-green-600 bg-green-50 ring-2 ring-green-100"
              : "border-gray-200 bg-white hover:border-green-300"
          }`}
        >
          <input
            type="checkbox"
            checked={value.includes(o)}
            onChange={() => onChange(o)}
            className="h-4 w-4 accent-green-600"
          />
          <span className="text-sm text-gray-900">{o}</span>
        </label>
      ))}
    </div>
  );
}

function FileUploadField({
  label,
  required,
  accept,
  onUploaded,
  value,
}: {
  label: string;
  required?: boolean;
  accept: string;
  onUploaded: (url: string) => void;
  value?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "applications");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const j = await res.json();
      if (j.url) onUploaded(j.url);
      else alert("Upload failed: " + j.error);
    } catch (err) {
      alert("Upload error: " + String(err));
    } finally {
      setUploading(false);
    }
  };
  return (
    <Field label={label} required={required}>
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-green-300 bg-green-50 p-6 hover:bg-green-100">
        {uploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        ) : value ? (
          <>
            <Check className="h-8 w-8 text-green-600" />
            <span className="text-sm text-green-700">อัปโหลดสำเร็จ (คลิกเพื่อเปลี่ยน)</span>
          </>
        ) : (
          <>
            <Upload className="h-8 w-8 text-green-600" />
            <span className="text-sm text-gray-700">คลิกเพื่ออัปโหลด</span>
          </>
        )}
        <input type="file" accept={accept} onChange={handleUpload} className="hidden" />
      </label>
    </Field>
  );
}

function SkippedPage() {
  return (
    <div className="py-12 text-center">
      <p className="text-gray-500">หน้านี้ไม่จำเป็นสำหรับประเภทผู้สมัครของคุณ กด &quot;ถัดไป&quot; เพื่อข้าม</p>
    </div>
  );
}

/* ======= PAGE 1: ประเภทพนักงาน ======= */
function Page1({ data, update }: any) {
  return (
    <div>
      <PageHeader title="ใบสมัครงาน" subtitle="กรุณาเลือกประเภทผู้สมัครของคุณ" />
      <SectionHeader title="ประเภทพนักงาน" />
      <Field label="ประเภทพนักงาน" required>
        <RadioGroup
          options={EMPLOYEE_TYPES}
          value={data.employeeType || ""}
          onChange={(v) => update("employeeType", v)}
          columns={3}
        />
      </Field>
    </div>
  );
}

/* ======= PAGE 2: ข้อมูลการสมัครงาน ======= */
function Page2({ data, update, toggleArray, positions, isMonthly, isDaily, isIntern, isEmployee }: any) {
  const selectedCompany = COMPANIES.find((c) => c.value === data.company);
  const incomeTypes = data.incomeTypes || [];
  const sourceOfInfo = data.sourceOfInfo || [];

  return (
    <div className="space-y-6">
      <PageHeader title="ข้อมูลการสมัครงาน" />

      <Field label="บริษัท" required>
        <RadioGroup
          options={COMPANIES.map((c) => ({ value: c.value, label: c.label }))}
          value={data.company || ""}
          onChange={(v) => {
            update("company", v);
            update("positionId", "");
          }}
        />
      </Field>

      {selectedCompany && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="text-xs font-medium text-green-700">ที่ตั้ง</div>
          <div className="mt-1 text-sm text-gray-800">{selectedCompany.address}</div>
        </div>
      )}

      {data.company && (
        <Field label="ตำแหน่งที่ต้องการสมัครงาน" required>
          <select
            value={data.positionId || ""}
            onChange={(e) => update("positionId", e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
          >
            <option value="">-- เลือกตำแหน่ง --</option>
            {positions.map((p: any) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </Field>
      )}

      <Field label="ท่านทราบข่าวรับสมัครจาก">
        <CheckboxGroup
          options={SOURCE_OF_INFO}
          value={sourceOfInfo}
          onChange={(v) => toggleArray("sourceOfInfo", v)}
          columns={2}
        />
        <Input
          type="text"
          placeholder="ช่องทางอื่นๆ (ถ้ามี)"
          value={data.sourceOfInfoOther || ""}
          onChange={(e) => update("sourceOfInfoOther", e.target.value)}
          className="mt-3"
        />
      </Field>

      {sourceOfInfo.includes("พนักงานที่รู้จัก") && (
        <Field label="แนะนำชื่อ">
          <Input
            value={data.referredBy || ""}
            onChange={(e) => update("referredBy", e.target.value)}
            placeholder="ชื่อพนักงานที่แนะนำ"
          />
        </Field>
      )}

      {isEmployee && (
        <>
          <SectionHeader title="ข้อมูลรายได้" />
          <Field label="แหล่งรายได้ปัจจุบัน (เลือกได้หลายข้อ)">
            <CheckboxGroup
              options={INCOME_TYPES}
              value={incomeTypes}
              onChange={(v) => toggleArray("incomeTypes", v)}
              columns={2}
            />
          </Field>

          {incomeTypes.includes("เงินเดือนปัจจุบัน") && (
            <Field label="เงินเดือนปัจจุบัน (บาท/เดือน)" required>
              <Input type="number" required value={data.currentSalary || ""} onChange={(e) => update("currentSalary", +e.target.value)} />
            </Field>
          )}
          {incomeTypes.includes("ค่าโอที") && (
            <Field label="ค่าโอที (บาท/เดือน)" required>
              <Input type="number" required value={data.otAllowance || ""} onChange={(e) => update("otAllowance", +e.target.value)} />
            </Field>
          )}
          {incomeTypes.includes("ค่ากะ") && (
            <Field label="ค่ากะ (บาท/เดือน)" required>
              <Input type="number" required value={data.shiftAllowance || ""} onChange={(e) => update("shiftAllowance", +e.target.value)} />
            </Field>
          )}
          {incomeTypes.includes("ค่าตำแหน่ง") && (
            <Field label="ค่าตำแหน่ง (บาท/เดือน)" required>
              <Input type="number" required value={data.positionAllowance || ""} onChange={(e) => update("positionAllowance", +e.target.value)} />
            </Field>
          )}
          {incomeTypes.includes("ค่าอาหาร") && (
            <Field label="ค่าอาหาร (บาท/เดือน)" required>
              <Input type="number" required value={data.foodAllowance || ""} onChange={(e) => update("foodAllowance", +e.target.value)} />
            </Field>
          )}
          {incomeTypes.includes("ค่าเดินทาง") && (
            <Field label="ค่าเดินทาง (บาท/เดือน)" required>
              <Input type="number" required value={data.travelAllowance || ""} onChange={(e) => update("travelAllowance", +e.target.value)} />
            </Field>
          )}
          {incomeTypes.includes("โบนัส") && (
            <Field label="โบนัส (บาท/ปี)" required>
              <Input type="number" required value={data.bonusYearly || ""} onChange={(e) => update("bonusYearly", +e.target.value)} />
            </Field>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="เงินเดือนที่ต้องการ (ต่ำสุด)" required>
              <Input type="number" required value={data.expectedSalaryMin || ""} onChange={(e) => update("expectedSalaryMin", +e.target.value)} />
            </Field>
            <Field label="เงินเดือนที่ต้องการ (สูงสุด)" required>
              <Input type="number" required value={data.expectedSalaryMax || ""} onChange={(e) => update("expectedSalaryMax", +e.target.value)} />
            </Field>
          </div>

          <Field label="วันที่สะดวกเริ่มงาน" required>
            <Input
              type="date"
              value={data.availableStartDate || ""}
              onChange={(e) => update("availableStartDate", e.target.value)}
            />
          </Field>
        </>
      )}

      {isDaily && (
        <Field label="เล่าประสบการณ์ทำงานของคุณ (1 ปีล่าสุด)">
          <Textarea
            value={data.lastYearExperience || ""}
            onChange={(e) => update("lastYearExperience", e.target.value)}
            rows={4}
          />
        </Field>
      )}

      {isIntern && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="เริ่มฝึกงานวันที่" required>
              <Input type="date" value={data.internStartDate || ""} onChange={(e) => update("internStartDate", e.target.value)} />
            </Field>
            <Field label="สิ้นสุดฝึกงานวันที่" required>
              <Input type="date" value={data.internEndDate || ""} onChange={(e) => update("internEndDate", e.target.value)} />
            </Field>
          </div>
          <Field label="ฝ่าย/แผนก/ลักษณะงานที่ต้องการฝึก" required>
            <Textarea value={data.internDepartment || ""} onChange={(e) => update("internDepartment", e.target.value)} />
          </Field>
        </>
      )}

      <FileUploadField
        label="รูปถ่ายผู้สมัคร (หน้าตรง)"
        required
        accept="image/*"
        value={data.photoUrl}
        onUploaded={(url) => update("photoUrl", url)}
      />

      {(isMonthly || isIntern) && (
        <FileUploadField
          label="Resume"
          accept=".pdf,.doc,.docx"
          value={data.resumeUrl}
          onUploaded={(url) => update("resumeUrl", url)}
        />
      )}
    </div>
  );
}

/* ======= PAGE 3: ประวัติส่วนตัว ======= */
function Page3({ data, update, hospitals, provinces, isEmployee, isIntern, isMonthly }: any) {
  const isFemale = data.titleTh === "นาง" || data.titleTh === "นางสาว";
  const isMale = data.titleTh === "นาย";

  return (
    <div className="space-y-6">
      <PageHeader title="ประวัติส่วนตัว" />

      {/* ภาษาไทย */}
      <div className="space-y-3 rounded-lg border border-green-100 bg-green-50/30 p-4">
        <Field label="คำนำหน้า (ไทย)" required>
          <RadioGroup options={TITLE_TH} value={data.titleTh || ""} onChange={(v) => update("titleTh", v)} columns={3} />
        </Field>
        <Field label="ชื่อ-นามสกุล (ไทย)" required>
          <div className="grid gap-3 md:grid-cols-2">
            <Input value={data.firstNameTh || ""} onChange={(e) => update("firstNameTh", e.target.value)} placeholder="ชื่อ" required />
            <Input value={data.lastNameTh || ""} onChange={(e) => update("lastNameTh", e.target.value)} placeholder="นามสกุล" required />
          </div>
        </Field>
      </div>

      {/* ภาษาอังกฤษ */}
      <div className="space-y-3 rounded-lg border border-green-100 bg-green-50/30 p-4">
        <Field label="Name Title (English)" required>
          <RadioGroup options={TITLE_EN} value={data.titleEn || ""} onChange={(v) => update("titleEn", v)} columns={3} />
        </Field>
        <Field label="ชื่อ-นามสกุล (English)" required>
          <div className="grid gap-3 md:grid-cols-2">
            <Input value={data.firstNameEn || ""} onChange={(e) => update("firstNameEn", e.target.value)} placeholder="First Name" required />
            <Input value={data.lastNameEn || ""} onChange={(e) => update("lastNameEn", e.target.value)} placeholder="Last Name" required />
          </div>
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="ชื่อเล่น (ไทย)" required>
          <Input value={data.nicknameTh || ""} onChange={(e) => update("nicknameTh", e.target.value)} />
        </Field>
        <Field label="ชื่อเล่น (ภาษาอังกฤษ)" required>
          <Input value={data.nicknameEn || ""} onChange={(e) => update("nicknameEn", e.target.value)} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="โทรศัพท์" required>
          <Input type="tel" value={data.phone || ""} onChange={(e) => update("phone", e.target.value)} />
        </Field>
        <Field label="ID Line" required>
          <Input value={data.lineId || ""} onChange={(e) => update("lineId", e.target.value)} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="วัน/เดือน/ปีเกิด" required>
          <Input type="date" value={data.dateOfBirth || ""} onChange={(e) => update("dateOfBirth", e.target.value)} />
        </Field>
        <Field label="อายุ">
          <Input type="number" value={data.age || ""} readOnly className="bg-gray-50" />
        </Field>
        {isIntern && (
          <Field label="เกิดที่จังหวัด" required>
            <select
              value={data.birthProvince || ""}
              onChange={(e) => update("birthProvince", e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
            >
              <option value="">-- เลือกจังหวัด --</option>
              {provinces.map((p: any) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="สัญชาติ" required>
          <select value={data.nationality || ""} onChange={(e) => update("nationality", e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5">
            <option value="">-- เลือก --</option>
            {NATIONALITIES.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </Field>
        <Field label="เชื้อชาติ" required>
          <select value={data.ethnicity || ""} onChange={(e) => update("ethnicity", e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5">
            <option value="">-- เลือก --</option>
            {NATIONALITIES.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </Field>
        <Field label="ศาสนา" required>
          <select value={data.religion || ""} onChange={(e) => update("religion", e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5">
            <option value="">-- เลือก --</option>
            {RELIGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="ส่วนสูง (ซม.)" required>
          <Input type="number" value={data.height || ""} onChange={(e) => update("height", +e.target.value)} />
        </Field>
        <Field label="น้ำหนัก (กก.)" required>
          <Input type="number" value={data.weight || ""} onChange={(e) => update("weight", +e.target.value)} />
        </Field>
      </div>

      {(isMonthly || isIntern) && (
        <Field label="E-mail" required>
          <Input type="email" value={data.email || ""} onChange={(e) => update("email", e.target.value)} />
        </Field>
      )}

      <Field label="ที่อยู่ปัจจุบัน" required>
        <Textarea value={data.currentAddress || ""} onChange={(e) => update("currentAddress", e.target.value)} />
      </Field>
      <Field label="ที่อยู่ตามทะเบียนบ้าน" required>
        <Textarea value={data.permanentAddress || ""} onChange={(e) => update("permanentAddress", e.target.value)} />
      </Field>

      {isEmployee && (
        <>
          <Field label="สิทธิประกันสังคม" required>
            <RadioGroup options={SOCIAL_SECURITY} value={data.socialSecurityStatus || ""} onChange={(v) => update("socialSecurityStatus", v)} columns={2} />
          </Field>
          {data.socialSecurityStatus === "มีสิทธิประกันสังคม" && (
            <>
              <Field label="บัตรรับรองสิทธิกับโรงพยาบาล">
                <select value={data.hospitalWithSS || ""} onChange={(e) => update("hospitalWithSS", e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5">
                  <option value="">-- เลือกโรงพยาบาล --</option>
                  {hospitals.map((h: any) => <option key={h.id} value={h.name}>{h.name}</option>)}
                </select>
              </Field>
              {data.hospitalWithSS === "อื่นๆ" && (
                <Field label="โปรดระบุ">
                  <Input value={data.hospitalWithSSOther || ""} onChange={(e) => update("hospitalWithSSOther", e.target.value)} />
                </Field>
              )}
            </>
          )}
          {data.socialSecurityStatus === "ไม่มีสิทธิประกันสังคม" && (
            <>
              <Field label="ระบุโรงพยาบาล">
                <select value={data.hospitalNoSS || ""} onChange={(e) => update("hospitalNoSS", e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5">
                  <option value="">-- เลือกโรงพยาบาล --</option>
                  {hospitals.map((h: any) => <option key={h.id} value={h.name}>{h.name}</option>)}
                </select>
              </Field>
              {data.hospitalNoSS === "อื่นๆ" && (
                <Field label="โปรดระบุ">
                  <Input value={data.hospitalNoSSOther || ""} onChange={(e) => update("hospitalNoSSOther", e.target.value)} />
                </Field>
              )}
            </>
          )}

          <SectionHeader title="สถานะทางครอบครัว" />
          <Field label="สถานะ">
            <RadioGroup options={MARITAL_STATUS} value={data.maritalStatus || ""} onChange={(v) => update("maritalStatus", v)} columns={4} />
          </Field>
          {data.maritalStatus === "สมรส" && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="คำนำหน้าคู่สมรส">
                  <RadioGroup options={TITLE_TH} value={data.spouseTitle || ""} onChange={(v) => update("spouseTitle", v)} columns={3} />
                </Field>
                <Field label="ชื่อ-นามสกุลคู่สมรส">
                  <Input value={data.spouseName || ""} onChange={(e) => update("spouseName", e.target.value)} />
                </Field>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="อาชีพคู่สมรส">
                  <Input value={data.spouseOccupation || ""} onChange={(e) => update("spouseOccupation", e.target.value)} />
                </Field>
                <Field label="สถานที่ทำงานคู่สมรส">
                  <Input value={data.spouseWorkplace || ""} onChange={(e) => update("spouseWorkplace", e.target.value)} />
                </Field>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="เบอร์โทรคู่สมรส">
                  <Input type="tel" value={data.spousePhone || ""} onChange={(e) => update("spousePhone", e.target.value)} />
                </Field>
                <Field label="จำนวนบุตร">
                  <Input type="number" value={data.numChildren || ""} onChange={(e) => update("numChildren", +e.target.value)} />
                </Field>
              </div>
            </>
          )}
        </>
      )}

      <SectionHeader title="ข้อมูลบิดา-มารดา" />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="คำนำหน้า (บิดา)">
          <RadioGroup options={TITLE_FATHER} value={data.fatherTitle || "นาย"} onChange={(v) => update("fatherTitle", v)} />
        </Field>
        <Field label="ชื่อ-นามสกุล (บิดา)">
          <Input value={data.fatherName || ""} onChange={(e) => update("fatherName", e.target.value)} />
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Field label="สถานะบิดา">
          <RadioGroup options={PARENT_STATUS} value={data.fatherStatus || ""} onChange={(v) => update("fatherStatus", v)} />
        </Field>
        <Field label="อายุ"><Input type="number" value={data.fatherAge || ""} onChange={(e) => update("fatherAge", +e.target.value)} /></Field>
        <Field label="อาชีพ"><Input value={data.fatherOccupation || ""} onChange={(e) => update("fatherOccupation", e.target.value)} /></Field>
        <Field label="เบอร์โทร"><Input type="tel" value={data.fatherPhone || ""} onChange={(e) => update("fatherPhone", e.target.value)} /></Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="คำนำหน้า (มารดา)">
          <RadioGroup options={TITLE_MOTHER} value={data.motherTitle || ""} onChange={(v) => update("motherTitle", v)} columns={2} />
        </Field>
        <Field label="ชื่อ-นามสกุล (มารดา)">
          <Input value={data.motherName || ""} onChange={(e) => update("motherName", e.target.value)} />
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Field label="สถานะมารดา">
          <RadioGroup options={PARENT_STATUS} value={data.motherStatus || ""} onChange={(v) => update("motherStatus", v)} />
        </Field>
        <Field label="อายุ"><Input type="number" value={data.motherAge || ""} onChange={(e) => update("motherAge", +e.target.value)} /></Field>
        <Field label="อาชีพ"><Input value={data.motherOccupation || ""} onChange={(e) => update("motherOccupation", e.target.value)} /></Field>
        <Field label="เบอร์โทร"><Input type="tel" value={data.motherPhone || ""} onChange={(e) => update("motherPhone", e.target.value)} /></Field>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="พี่น้องร่วมบิดามารดา (รวมผู้สมัคร)">
          <Input type="number" value={data.siblings || ""} onChange={(e) => update("siblings", +e.target.value)} />
        </Field>
        <Field label="ท่านเป็นลูกคนที่">
          <Input type="number" value={data.childOrder || ""} onChange={(e) => update("childOrder", +e.target.value)} />
        </Field>
      </div>
    </div>
  );
}

/* ======= PAGE 4: ประวัติการศึกษา ======= */
function Page4({ data, update, toggleArray, isMonthly, isDaily, isIntern }: any) {
  const levels = data.educationLevels || [];
  const availableLevels = isDaily ? EDUCATION_LEVELS.slice(0, 6) : EDUCATION_LEVELS;
  const eduData = data.educationData || {};

  const updateEdu = (level: string, field: string, value: any) => {
    update("educationData", { ...eduData, [level]: { ...(eduData[level] || {}), [field]: value } });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="ประวัติการศึกษา" />

      {(isMonthly || isDaily) && (
        <>
          <Field label="ระดับการศึกษา (เลือกได้หลายข้อ)">
            <CheckboxGroup options={availableLevels} value={levels} onChange={(v) => toggleArray("educationLevels", v)} columns={2} />
          </Field>

          {levels.map((level: string) => (
            <div key={level} className="rounded-lg border border-green-200 bg-green-50/50 p-4">
              <h4 className="mb-3 font-semibold text-green-700">{level}</h4>
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="ชื่อสถานศึกษา" required>
                  <Input value={eduData[level]?.institution || ""} onChange={(e) => updateEdu(level, "institution", e.target.value)} />
                </Field>
                {!level.includes("ประถม") && (
                  <Field label="สาขาวิชา" required>
                    <Input value={eduData[level]?.major || ""} onChange={(e) => updateEdu(level, "major", e.target.value)} />
                  </Field>
                )}
                {(level.includes("ปริญญา")) && (
                  <Field label="คณะ" required>
                    <Input value={eduData[level]?.faculty || ""} onChange={(e) => updateEdu(level, "faculty", e.target.value)} />
                  </Field>
                )}
                <Field label="เริ่มปี พ.ศ." required>
                  <Input type="number" value={eduData[level]?.startYear || ""} onChange={(e) => updateEdu(level, "startYear", +e.target.value)} />
                </Field>
                <Field label="สำเร็จปี พ.ศ." required>
                  <Input type="number" value={eduData[level]?.endYear || ""} onChange={(e) => updateEdu(level, "endYear", +e.target.value)} />
                </Field>
                <Field label="เกรดเฉลี่ย" required>
                  <Input type="number" step="0.01" value={eduData[level]?.gpa || ""} onChange={(e) => updateEdu(level, "gpa", +e.target.value)} />
                </Field>
              </div>
            </div>
          ))}
        </>
      )}

      {isIntern && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="ปัจจุบันกำลังศึกษาอยู่ชั้นปีที่" required>
              <RadioGroup options={STUDY_YEARS} value={data.internStudyYear || ""} onChange={(v) => update("internStudyYear", v)} columns={4} />
            </Field>
            <Field label="เกรดเฉลี่ย" required>
              <Input type="number" step="0.01" value={data.internGpa || ""} onChange={(e) => update("internGpa", +e.target.value)} />
            </Field>
          </div>
          <Field label="สถาบัน/มหาวิทยาลัย" required>
            <Input value={data.internInstitution || ""} onChange={(e) => update("internInstitution", e.target.value)} />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="คณะ" required>
              <Input value={data.internFaculty || ""} onChange={(e) => update("internFaculty", e.target.value)} />
            </Field>
            <Field label="สาขาวิชา/วิชาเอก" required>
              <Input value={data.internMajor || ""} onChange={(e) => update("internMajor", e.target.value)} />
            </Field>
          </div>
          <SectionHeader title="อาจารย์ที่ปรึกษา" />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="คำนำหน้า" required>
              <select value={data.advisorTitle || ""} onChange={(e) => update("advisorTitle", e.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-2.5">
                <option value="">-- เลือก --</option>
                {ADVISOR_TITLES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="ชื่ออาจารย์" required>
              <Input value={data.advisorName || ""} onChange={(e) => update("advisorName", e.target.value)} />
            </Field>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="เบอร์โทรอาจารย์" required>
              <Input type="tel" value={data.advisorPhone || ""} onChange={(e) => update("advisorPhone", e.target.value)} />
            </Field>
            <Field label="E-mail อาจารย์" required>
              <Input type="email" value={data.advisorEmail || ""} onChange={(e) => update("advisorEmail", e.target.value)} />
            </Field>
          </div>
        </>
      )}
    </div>
  );
}

/* ======= PAGE 5: หลักสูตรอบรม ======= */
function Page5({ data, update }: any) {
  const items = data.trainings || [];
  const addItem = () => update("trainings", [...items, { courseName: "", institution: "", year: "", duration: "", certificate: false }]);
  const removeItem = (i: number) => update("trainings", items.filter((_: any, idx: number) => idx !== i));
  const updateItem = (i: number, field: string, value: any) => {
    const next = [...items];
    next[i] = { ...next[i], [field]: value };
    update("trainings", next);
  };

  return (
    <div className="space-y-4">
      <PageHeader title="หลักสูตรอบรม" subtitle="ไม่บังคับกรอก สามารถข้ามได้" />
      {items.map((item: any, i: number) => (
        <div key={i} className="rounded-lg border border-green-200 bg-green-50/50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-semibold">หลักสูตร #{i + 1}</h4>
            <button onClick={() => removeItem(i)} className="text-red-500 hover:text-red-700">
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="ชื่อหลักสูตร"><Input value={item.courseName} onChange={(e) => updateItem(i, "courseName", e.target.value)} /></Field>
            <Field label="สถาบัน"><Input value={item.institution} onChange={(e) => updateItem(i, "institution", e.target.value)} /></Field>
            <Field label="ปี"><Input type="number" value={item.year} onChange={(e) => updateItem(i, "year", +e.target.value)} /></Field>
            <Field label="ระยะเวลา"><Input value={item.duration} onChange={(e) => updateItem(i, "duration", e.target.value)} /></Field>
          </div>
          <label className="mt-3 flex items-center gap-2">
            <input type="checkbox" checked={item.certificate} onChange={(e) => updateItem(i, "certificate", e.target.checked)} className="h-4 w-4 accent-green-600" />
            <span className="text-sm">ได้รับประกาศนียบัตร</span>
          </label>
        </div>
      ))}
      <button onClick={addItem} className="flex items-center gap-2 rounded-lg border-2 border-dashed border-green-300 bg-green-50 px-4 py-3 text-green-700 hover:bg-green-100">
        <Plus className="h-5 w-5" />
        เพิ่มหลักสูตร
      </button>
    </div>
  );
}

/* ======= PAGE 6: ประสบการณ์ทำงาน ======= */
function Page6({ data, update }: any) {
  const items = data.workExperiences || [];
  const addItem = () => update("workExperiences", [...items, { company: "", position: "", startDate: "", endDate: "", salary: "", reasonForLeaving: "", responsibilities: "" }]);
  const removeItem = (i: number) => update("workExperiences", items.filter((_: any, idx: number) => idx !== i));
  const updateItem = (i: number, field: string, value: any) => {
    const next = [...items];
    next[i] = { ...next[i], [field]: value };
    update("workExperiences", next);
  };

  return (
    <div className="space-y-4">
      <PageHeader title="ประสบการณ์ทำงาน 3 บริษัทล่าสุด" />
      {items.map((item: any, i: number) => (
        <div key={i} className="rounded-lg border border-green-200 bg-green-50/50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-semibold">บริษัท #{i + 1}</h4>
            <button onClick={() => removeItem(i)} className="text-red-500 hover:text-red-700">
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="ชื่อบริษัท"><Input value={item.company} onChange={(e) => updateItem(i, "company", e.target.value)} /></Field>
            <Field label="ตำแหน่ง"><Input value={item.position} onChange={(e) => updateItem(i, "position", e.target.value)} /></Field>
            <Field label="เริ่มงาน"><Input type="date" value={item.startDate} onChange={(e) => updateItem(i, "startDate", e.target.value)} /></Field>
            <Field label="ถึง"><Input type="date" value={item.endDate} onChange={(e) => updateItem(i, "endDate", e.target.value)} /></Field>
            <Field label="เงินเดือน (บาท)"><Input type="number" value={item.salary} onChange={(e) => updateItem(i, "salary", +e.target.value)} /></Field>
            <Field label="เหตุผลที่ออก"><Input value={item.reasonForLeaving} onChange={(e) => updateItem(i, "reasonForLeaving", e.target.value)} /></Field>
          </div>
          <Field label="หน้าที่รับผิดชอบ"><Textarea value={item.responsibilities} onChange={(e) => updateItem(i, "responsibilities", e.target.value)} /></Field>
        </div>
      ))}
      {items.length < 3 && (
        <button onClick={addItem} className="flex items-center gap-2 rounded-lg border-2 border-dashed border-green-300 bg-green-50 px-4 py-3 text-green-700 hover:bg-green-100">
          <Plus className="h-5 w-5" />
          เพิ่มประสบการณ์ทำงาน
        </button>
      )}
    </div>
  );
}

/* ======= PAGE 7: ความรู้ด้านภาษา ======= */
function Page7({ data, update }: any) {
  const items = data.languages || [];
  const addItem = () => update("languages", [...items, { language: "", speaking: "", reading: "", writing: "", listening: "" }]);
  const removeItem = (i: number) => update("languages", items.filter((_: any, idx: number) => idx !== i));
  const updateItem = (i: number, field: string, value: any) => {
    const next = [...items];
    next[i] = { ...next[i], [field]: value };
    update("languages", next);
  };
  const levels = ["ดี", "พอใช้", "อ่อน"];

  return (
    <div className="space-y-4">
      <PageHeader title="ความรู้ด้านภาษา" />
      {items.map((item: any, i: number) => (
        <div key={i} className="rounded-lg border border-green-200 bg-green-50/50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-semibold">ภาษา #{i + 1}</h4>
            {i > 0 && (
              <button onClick={() => removeItem(i)} className="text-red-500 hover:text-red-700">
                <Trash2 className="h-5 w-5" />
              </button>
            )}
          </div>
          <Field label="ภาษา"><Input value={item.language} onChange={(e) => updateItem(i, "language", e.target.value)} placeholder="เช่น ภาษาอังกฤษ" /></Field>
          <div className="mt-3 grid gap-3 md:grid-cols-4">
            {["speaking", "reading", "writing", "listening"].map((k) => (
              <Field key={k} label={k === "speaking" ? "พูด" : k === "reading" ? "อ่าน" : k === "writing" ? "เขียน" : "ฟัง"}>
                <select value={item[k] || ""} onChange={(e) => updateItem(i, k, e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2">
                  <option value="">--</option>
                  {levels.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </Field>
            ))}
          </div>
        </div>
      ))}
      <button onClick={addItem} className="flex items-center gap-2 rounded-lg border-2 border-dashed border-green-300 bg-green-50 px-4 py-3 text-green-700 hover:bg-green-100">
        <Plus className="h-5 w-5" />
        เพิ่มภาษา
      </button>
    </div>
  );
}

/* ======= PAGE 8: ทักษะพิเศษ ======= */
function Page8({ data, update, toggleArray, isMonthly, isDaily, isIntern, isICT }: any) {
  const cs = data.computerSkills || [];
  return (
    <div className="space-y-6">
      <PageHeader title="ความสามารถพิเศษ/อื่นๆ" />

      {(isMonthly || isIntern) && (
        <>
          <Field label="คอมพิวเตอร์ (เลือกได้หลายข้อ)">
            <CheckboxGroup options={COMPUTER_SKILLS} value={cs} onChange={(v) => toggleArray("computerSkills", v)} columns={3} />
          </Field>
          {cs.includes("Excel") && (
            <Field label="ทักษะการใช้ Excel" required>
              <CheckboxGroup options={EXCEL_SKILLS} value={data.excelSkills || []} onChange={(v) => toggleArray("excelSkills", v)} />
              <Input className="mt-2" placeholder="อื่นๆ" value={data.excelSkillsOther || ""} onChange={(e) => update("excelSkillsOther", e.target.value)} />
            </Field>
          )}
          {cs.includes("Word") && (
            <Field label="ทักษะการใช้ Word" required>
              <CheckboxGroup options={WORD_SKILLS} value={data.wordSkills || []} onChange={(v) => toggleArray("wordSkills", v)} />
              <Input className="mt-2" placeholder="อื่นๆ" value={data.wordSkillsOther || ""} onChange={(e) => update("wordSkillsOther", e.target.value)} />
            </Field>
          )}
          {cs.includes("Power Point") && (
            <Field label="ทักษะการใช้ Power Point" required>
              <CheckboxGroup options={POWERPOINT_SKILLS} value={data.powerpointSkills || []} onChange={(v) => toggleArray("powerpointSkills", v)} />
              <Input className="mt-2" placeholder="อื่นๆ" value={data.powerpointSkillsOther || ""} onChange={(e) => update("powerpointSkillsOther", e.target.value)} />
            </Field>
          )}
          {cs.includes("Photoshop") && (
            <Field label="ทักษะการใช้ Photoshop" required>
              <CheckboxGroup options={PHOTOSHOP_SKILLS} value={data.photoshopSkills || []} onChange={(v) => toggleArray("photoshopSkills", v)} />
              <Input className="mt-2" placeholder="อื่นๆ" value={data.photoshopSkillsOther || ""} onChange={(e) => update("photoshopSkillsOther", e.target.value)} />
            </Field>
          )}
          {cs.includes("อื่นๆ") && (
            <Field label="อื่นๆ" required>
              <Textarea value={data.otherSkills || ""} onChange={(e) => update("otherSkills", e.target.value)} />
            </Field>
          )}
        </>
      )}

      {isIntern && (
        <Field label="ลักษณะงานที่สนใจ" required help="โปรดอธิบายลักษณะงานที่ท่านมีความถนัดและสนใจ">
          <Textarea value={data.interestedWork || ""} onChange={(e) => update("interestedWork", e.target.value)} rows={4} />
        </Field>
      )}

      {/* Transportation */}
      {isDaily && isICT && (
        <>
          <Field label="คุณเดินทางโดยรถส่วนตัวหรือรถบริษัท" required>
            <RadioGroup options={TRAVEL_MODES} value={data.travelMode || ""} onChange={(v) => update("travelMode", v)} columns={2} />
          </Field>
          {data.travelMode === "รถบริษัท" && (
            <Field label="รถรับ-ส่ง" required>
              <select value={data.shuttleRoute || ""} onChange={(e) => update("shuttleRoute", e.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-2.5">
                <option value="">-- เลือก --</option>
                {SHUTTLE_ROUTES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          )}
        </>
      )}

      {(isMonthly || (isDaily && data.travelMode === "รถส่วนตัว")) && (
        <>
          <Field label="ขับรถยนต์" required>
            <RadioGroup options={CAN_DRIVE} value={data.canDriveCar || ""} onChange={(v) => update("canDriveCar", v)} columns={2} />
          </Field>
          {data.canDriveCar === "ขับได้" && (
            <Field label="เลขที่ใบขับขี่รถยนต์"><Input value={data.carLicenseNumber || ""} onChange={(e) => update("carLicenseNumber", e.target.value)} /></Field>
          )}
          <Field label="ท่านมีรถยนต์หรือไม่" required>
            <RadioGroup options={HAS_OR_NOT} value={data.hasCar || ""} onChange={(v) => update("hasCar", v)} columns={2} />
          </Field>
          {data.hasCar === "มี" && (
            <Field label="ทะเบียนรถยนต์"><Input value={data.carPlate || ""} onChange={(e) => update("carPlate", e.target.value)} /></Field>
          )}

          <Field label="ขับรถมอเตอร์ไซด์" required>
            <RadioGroup options={CAN_DRIVE} value={data.canDriveMotorcycle || ""} onChange={(v) => update("canDriveMotorcycle", v)} columns={2} />
          </Field>
          {data.canDriveMotorcycle === "ขับได้" && (
            <Field label="เลขที่ใบขับขี่"><Input value={data.motorcycleLicenseNumber || ""} onChange={(e) => update("motorcycleLicenseNumber", e.target.value)} /></Field>
          )}
          <Field label="ท่านมีรถมอเตอร์ไซด์หรือไม่" required>
            <RadioGroup options={HAS_OR_NOT} value={data.hasMotorcycle || ""} onChange={(v) => update("hasMotorcycle", v)} columns={2} />
          </Field>
          {data.hasMotorcycle === "มี" && (
            <Field label="ทะเบียน"><Input value={data.motorcyclePlate || ""} onChange={(e) => update("motorcyclePlate", e.target.value)} /></Field>
          )}
        </>
      )}

      <Field label="ท่านเคยถูกไล่ออก ปลดออก หรือให้ออกจากงาน เพราะทุจริตต่อหน้าที่หรือไม่" required>
        <RadioGroup options={EVER_OR_NOT} value={data.firedForMisconduct || ""} onChange={(v) => update("firedForMisconduct", v)} columns={2} />
      </Field>
      {data.firedForMisconduct === "เคย" && (
        <Field label="เหตุผลเพราะ" required>
          <Textarea value={data.firedReason || ""} onChange={(e) => update("firedReason", e.target.value)} />
        </Field>
      )}
    </div>
  );
}

/* ======= PAGE 9: สุขภาพ ======= */
function Page9({ data, update }: any) {
  const isFemale = data.titleTh === "นาง" || data.titleTh === "นางสาว";
  const isMale = data.titleTh === "นาย";
  return (
    <div className="space-y-6">
      <PageHeader title="ประวัติสุขภาพ" subtitle="โปรดกรอกตามความจริงทุกประการเพื่อประโยชน์ของท่านเอง" />

      <Field label="ท่านสูบบุหรี่หรือไม่" required>
        <RadioGroup options={YES_NO} value={data.smoke || ""} onChange={(v) => update("smoke", v)} columns={2} />
      </Field>
      {data.smoke === "ใช่" && (
        <>
          <Field label="ระบุเหตุผล" required>
            <RadioGroup options={REASONS_SMOKE_ALCOHOL} value={data.smokeReason || ""} onChange={(v) => update("smokeReason", v)} columns={3} />
          </Field>
          <Field label="ความถี่" required>
            <RadioGroup options={FREQUENCIES} value={data.smokeFrequency || ""} onChange={(v) => update("smokeFrequency", v)} columns={2} />
          </Field>
        </>
      )}

      <Field label="ท่านดื่มสุราหรือไม่" required>
        <RadioGroup options={YES_NO} value={data.alcohol || ""} onChange={(v) => update("alcohol", v)} columns={2} />
      </Field>
      {data.alcohol === "ใช่" && (
        <>
          <Field label="ระบุเหตุผล" required>
            <RadioGroup options={REASONS_SMOKE_ALCOHOL} value={data.alcoholReason || ""} onChange={(v) => update("alcoholReason", v)} columns={3} />
          </Field>
          <Field label="ความถี่" required>
            <RadioGroup options={FREQUENCIES} value={data.alcoholFrequency || ""} onChange={(v) => update("alcoholFrequency", v)} columns={2} />
          </Field>
        </>
      )}

      <Field label="ท่านเคยมีประวัติการใช้ยาเสพติดหรือไม่" required>
        <RadioGroup options={HAS_OR_NOT} value={data.drugs || ""} onChange={(v) => update("drugs", v)} columns={2} />
      </Field>
      {data.drugs === "มี" && <Field label="ระบุเหตุผล" required><Textarea value={data.drugsReason || ""} onChange={(e) => update("drugsReason", e.target.value)} /></Field>}

      <Field label="ท่านเคยมีส่วนไหนของร่างกายหัก/แตกแบบรุนแรงหรือไม่" required>
        <RadioGroup options={HAS_OR_NOT} value={data.seriousInjury || ""} onChange={(v) => update("seriousInjury", v)} columns={2} />
      </Field>
      {data.seriousInjury === "มี" && <Field label="ระบุส่วนที่บาดเจ็บ" required><Textarea value={data.injuryDetail || ""} onChange={(e) => update("injuryDetail", e.target.value)} /></Field>}

      <Field label="ท่านมีโรคประจำตัวหรือการเจ็บป่วยเรื้อรังหรือไม่" required>
        <RadioGroup options={HAS_OR_NOT} value={data.chronicDisease || ""} onChange={(v) => update("chronicDisease", v)} columns={2} />
      </Field>
      {data.chronicDisease === "มี" && <Field label="ระบุโรค" required><Textarea value={data.chronicDiseaseDetail || ""} onChange={(e) => update("chronicDiseaseDetail", e.target.value)} /></Field>}

      <Field label="ท่านเคยป่วยหนักและเป็นโรคติดต่อร้ายแรงมาก่อนหรือไม่" required>
        <RadioGroup options={YES_NO} value={data.seriousDisease || ""} onChange={(v) => update("seriousDisease", v)} columns={2} />
      </Field>
      {data.seriousDisease === "ใช่" && <Field label="ระบุโรค" required><Textarea value={data.seriousDiseaseDetail || ""} onChange={(e) => update("seriousDiseaseDetail", e.target.value)} /></Field>}

      <Field label="ท่านเคยผ่าตัดมาหรือไม่" required>
        <RadioGroup options={YES_NO} value={data.surgery || ""} onChange={(v) => update("surgery", v)} columns={2} />
      </Field>
      {data.surgery === "ใช่" && <Field label="ระบุส่วนที่ผ่าตัด" required><Textarea value={data.surgeryDetail || ""} onChange={(e) => update("surgeryDetail", e.target.value)} /></Field>}

      <Field label="ท่านเคยถูกให้ออกจากงานหรือเลิกจ้าง เนื่องจากกระทำผิดกฎระเบียบของบริษัทหรือไม่" required>
        <RadioGroup options={EVER_OR_NOT} value={data.firedForRule || ""} onChange={(v) => update("firedForRule", v)} columns={2} />
      </Field>
      {data.firedForRule === "เคย" && <Field label="ระบุเหตุ" required><Textarea value={data.firedRuleReason || ""} onChange={(e) => update("firedRuleReason", e.target.value)} /></Field>}

      <Field label="ท่านเคยได้รับโทษจำคุกหรือศาลพิพากษาให้จำคุกหรือไม่" required>
        <RadioGroup options={EVER_OR_NOT} value={data.jailed || ""} onChange={(v) => update("jailed", v)} columns={2} />
      </Field>
      {data.jailed === "เคย" && <Field label="ระบุเหตุผล" required><Textarea value={data.jailedReason || ""} onChange={(e) => update("jailedReason", e.target.value)} /></Field>}

      <Field label="ท่านอยู่ระหว่างการติดตามหรือรอยื่นฟ้องดำเนินคดีเพื่อชำระหนี้สินหรือไม่" required>
        <RadioGroup options={YES_NO} value={data.debtLawsuit || ""} onChange={(v) => update("debtLawsuit", v)} columns={2} />
      </Field>
      {data.debtLawsuit === "ใช่" && <Field label="ระบุเหตุผล" required><Textarea value={data.debtReason || ""} onChange={(e) => update("debtReason", e.target.value)} /></Field>}

      <Field label="ร่างกายของท่านแข็งแรงสมบูรณ์ ไม่มีความพิการ และทุพพลภาพ ใช่หรือไม่" required>
        <RadioGroup options={YES_NO} value={data.healthy || ""} onChange={(v) => update("healthy", v)} columns={2} />
      </Field>
      {data.healthy === "ไม่ใช่" && <Field label="ระบุส่วนที่ไม่แข็งแรง" required><Textarea value={data.disabilityDetail || ""} onChange={(e) => update("disabilityDetail", e.target.value)} /></Field>}

      {isFemale && (
        <>
          <Field label="ขณะนี้ท่านอยู่ระหว่างการตั้งครรภ์หรือไม่" required>
            <RadioGroup options={YES_NO} value={data.pregnant || ""} onChange={(v) => update("pregnant", v)} columns={2} />
          </Field>
          {data.pregnant === "ใช่" && <Field label="อายุครรภ์" required><Input value={data.pregnancyWeeks || ""} onChange={(e) => update("pregnancyWeeks", e.target.value)} /></Field>}
          <Field label="ท่านมักมีปัญหาการปวดท้องประจำเดือนอย่างหนักหรือไม่" required>
            <RadioGroup options={YES_NO} value={data.severeMenstrualPain || ""} onChange={(v) => update("severeMenstrualPain", v)} columns={2} />
          </Field>
        </>
      )}

      <Field label="ท่านมีประวัติโรคซึมเศร้าหรือเคยเป็นผู้ป่วยจิตเวชหรือไม่" required>
        <RadioGroup options={YES_NO} value={data.mentalIllness || ""} onChange={(v) => update("mentalIllness", v)} columns={2} />
      </Field>
      {data.mentalIllness === "ใช่" && <Field label="ระบุประวัติ" required><Textarea value={data.mentalIllnessDetail || ""} onChange={(e) => update("mentalIllnessDetail", e.target.value)} /></Field>}

      {isMale && (
        <>
          <Field label="ภรรยาหรือคู่สมรสของท่านกำลังตั้งครรภ์อยู่หรือไม่" required>
            <RadioGroup options={YES_NO} value={data.wifePregnant || ""} onChange={(v) => update("wifePregnant", v)} columns={2} />
          </Field>
          {data.wifePregnant === "ใช่" && <Field label="อายุครรภ์" required><Input value={data.wifePregnancyWeeks || ""} onChange={(e) => update("wifePregnancyWeeks", e.target.value)} /></Field>}
        </>
      )}
    </div>
  );
}

/* ======= PAGE 10: ผู้ติดต่อฉุกเฉิน ======= */
function Page10({ data, update }: any) {
  return (
    <div className="space-y-6">
      <PageHeader title="กรณีฉุกเฉิน" />
      <SectionHeader title="ผู้ติดต่อคนที่ 1" />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="คำนำหน้า" required>
          <RadioGroup options={TITLE_TH} value={data.emTitle1 || ""} onChange={(v) => update("emTitle1", v)} columns={3} />
        </Field>
        <Field label="บุคคลที่ติดต่อได้" required>
          <Input value={data.emName1 || ""} onChange={(e) => update("emName1", e.target.value)} />
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="เกี่ยวข้องกับผู้สมัคร" required>
          <Input value={data.emRelation1 || ""} onChange={(e) => update("emRelation1", e.target.value)} />
        </Field>
        <Field label="เบอร์โทรศัพท์" required>
          <Input type="tel" value={data.emPhone1 || ""} onChange={(e) => update("emPhone1", e.target.value)} />
        </Field>
      </div>

      <SectionHeader title="ผู้ติดต่อคนที่ 2 (ถ้ามี)" />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="คำนำหน้า"><RadioGroup options={TITLE_TH} value={data.emTitle2 || ""} onChange={(v) => update("emTitle2", v)} columns={3} /></Field>
        <Field label="ชื่อ"><Input value={data.emName2 || ""} onChange={(e) => update("emName2", e.target.value)} /></Field>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="เกี่ยวข้องกับผู้สมัคร"><Input value={data.emRelation2 || ""} onChange={(e) => update("emRelation2", e.target.value)} /></Field>
        <Field label="เบอร์โทรศัพท์"><Input type="tel" value={data.emPhone2 || ""} onChange={(e) => update("emPhone2", e.target.value)} /></Field>
      </div>

      <SectionHeader title="บริษัทฯจะสอบถามไปยังนายจ้างที่ท่านทำงานอยู่" />
      <Field label="ท่านจะขัดข้องหรือไม่" required>
        <RadioGroup options={PREV_EMPLOYER_CONTACT} value={data.allowPrevEmployerContact || ""} onChange={(v) => update("allowPrevEmployerContact", v)} columns={2} />
      </Field>
      {data.allowPrevEmployerContact === "ขัดข้อง" && (
        <Field label="เพราะ"><Textarea value={data.allowPrevEmployerReason || ""} onChange={(e) => update("allowPrevEmployerReason", e.target.value)} /></Field>
      )}

      <SectionHeader title="บุคคลที่ไม่ใช่ญาติซึ่งทราบประวัติของข้าพเจ้า" />
      <Field label="ความสัมพันธ์">
        <RadioGroup options={NON_REL_RELATIONS} value={data.nonRelRelation || ""} onChange={(v) => update("nonRelRelation", v)} columns={2} />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="คำนำหน้า"><RadioGroup options={TITLE_TH} value={data.nonRelTitle || ""} onChange={(v) => update("nonRelTitle", v)} columns={3} /></Field>
        <Field label="ชื่อ-นามสกุล"><Input value={data.nonRelName || ""} onChange={(e) => update("nonRelName", e.target.value)} /></Field>
      </div>
      <Field label="ที่อยู่/บริษัท"><Input value={data.nonRelAddress || ""} onChange={(e) => update("nonRelAddress", e.target.value)} /></Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="โทรศัพท์"><Input type="tel" value={data.nonRelPhone || ""} onChange={(e) => update("nonRelPhone", e.target.value)} /></Field>
        <Field label="ตำแหน่ง"><Input value={data.nonRelPosition || ""} onChange={(e) => update("nonRelPosition", e.target.value)} /></Field>
      </div>
    </div>
  );
}

/* ======= PAGE 11: Certification ======= */
function Page11({ data, isIntern }: any) {
  return (
    <div>
      <PageHeader title="โปรดอ่านรายละเอียดด้านล่าง" />
      <div className="rounded-lg border border-green-200 bg-green-50 p-6">
        <p className="whitespace-pre-line text-sm leading-relaxed text-gray-800">
          {isIntern ? CERTIFY_TEXT_INTERN : CERTIFY_TEXT_EMPLOYEE}
        </p>
      </div>
      <div className="mt-4 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
        ℹ️ กรุณาอ่านให้ละเอียด แล้วกด &quot;ถัดไป&quot; เพื่อให้ความยินยอม
      </div>
    </div>
  );
}

/* ======= PAGE 12: Consent ======= */
function Page12({ data, update }: any) {
  const consentText = data.company === "ICT" ? CONSENT_TEXT_ICT : CONSENT_TEXT_COMETS;

  return (
    <div className="space-y-6">
      <PageHeader title="หนังสือให้ความยินยอมการเก็บรวบรวม ใช้ และ/หรือเปิดเผยข้อมูลส่วนบุคคล" subtitle="Consent Form สำหรับผู้สมัครงาน" />
      <div className="max-h-96 overflow-y-auto rounded-lg border border-green-200 bg-green-50 p-6">
        <p className="whitespace-pre-line text-sm leading-relaxed text-gray-800">{consentText}</p>
      </div>

      <Field label="ท่านยินยอมหรือไม่" required>
        <RadioGroup options={CONSENT_OPTIONS} value={data.consent1 || ""} onChange={(v) => update("consent1", v)} columns={2} />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="คำนำหน้า" required>
          <RadioGroup options={TITLE_TH} value={data.consentSignerTitle || ""} onChange={(v) => update("consentSignerTitle", v)} columns={3} />
        </Field>
        <Field label="ชื่อ-นามสกุล" required>
          <Input value={data.consentSignerName || ""} onChange={(e) => update("consentSignerName", e.target.value)} />
        </Field>
      </div>

      <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
        💡 หลังจากกดบันทึก ข้อมูลจะไม่สามารถแก้ไขได้อีก กรุณาตรวจสอบความถูกต้องก่อนส่ง
      </div>
    </div>
  );
}
