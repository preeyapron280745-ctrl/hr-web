"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  UploadCloud,
  CheckCircle2,
  X,
  FileText as FileIcon,
  AlertCircle,
} from "lucide-react";
import { COMPANIES, EMPLOYEE_TYPES, EDUCATION_LEVELS } from "@/lib/form-constants";

interface Position {
  id: string;
  title: string;
  company: string | null;
  active: boolean;
}

interface UploadedFile {
  url: string;
  fileName: string;
  fileSize?: number;
}

const CHANNELS = [
  "พนักงานที่รู้จัก",
  "Walk in (เข้ามาสมัครด้วยตนเอง)",
  "ป้ายประกาศ",
  "Job Thai",
  "Job DB",
  "Facebook",
  "Linkedin",
  "Job BKK",
];

export default function FromResumePage() {
  const router = useRouter();
  const [positions, setPositions] = useState<Position[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ข้อมูลการสมัคร
  const [employeeType, setEmployeeType] = useState("");
  const [company, setCompany] = useState("");
  const [positionId1, setPositionId1] = useState("");
  const [positionId2, setPositionId2] = useState("");
  const [positionId3, setPositionId3] = useState("");
  const [channel, setChannel] = useState("");
  const [applicationCode, setApplicationCode] = useState(""); // optional - กรอกถ้ามาจาก Job Thai etc.

  // ข้อมูลผู้สมัคร
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"" | "MALE" | "FEMALE">("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [educationLevel, setEducationLevel] = useState("");

  // ประสบการณ์ล่าสุด
  const [lastCompany, setLastCompany] = useState("");
  const [lastPosition, setLastPosition] = useState("");
  const [lastSalaryMin, setLastSalaryMin] = useState("");
  const [lastSalaryMax, setLastSalaryMax] = useState("");

  // เอกสาร
  const [photo, setPhoto] = useState<UploadedFile | null>(null);
  const [resume, setResume] = useState<UploadedFile | null>(null);

  useEffect(() => {
    fetch("/api/positions")
      .then((r) => r.json())
      .then((d: Position[]) => setPositions(d.filter((p) => p.active)))
      .catch(() => {});
  }, []);

  const filteredPositions = company
    ? positions.filter((p) => !p.company || p.company === company)
    : positions;

  const uploadFile = async (
    file: File,
    folder: string,
    setState: (v: UploadedFile | null) => void,
    setBusy: (v: boolean) => void
  ) => {
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("bucket", "documents");
      fd.append("folder", folder);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err?.error || "อัปโหลดไฟล์ไม่สำเร็จ");
        return;
      }
      const data = await res.json();
      setState({ url: data.url, fileName: data.fileName ?? file.name, fileSize: data.fileSize });
    } catch (err) {
      setError("อัปโหลดไฟล์ไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!employeeType) return setError("กรุณาเลือกประเภทพนักงาน");
    if (!company) return setError("กรุณาเลือกบริษัท");
    if (!positionId1) return setError("กรุณาเลือกสนใจสมัครตำแหน่ง 1");
    if (!fullName.trim()) return setError("กรุณากรอกชื่อ - นามสกุล");
    if (!phone.trim()) return setError("กรุณากรอกเบอร์โทร");
    if (!email.trim()) return setError("กรุณากรอก Email");
    if (!educationLevel) return setError("กรุณาเลือกระดับการศึกษา");
    if (!lastCompany.trim()) return setError("กรุณากรอกบริษัทล่าสุด");
    if (!lastPosition.trim()) return setError("กรุณากรอกตำแหน่งล่าสุด");
    if (!resume) return setError("กรุณาอัปโหลด Resume");

    const pos1 = positions.find((p) => p.id === positionId1);
    const pos2 = positions.find((p) => p.id === positionId2);
    const pos3 = positions.find((p) => p.id === positionId3);

    const parts = fullName.trim().split(/\s+/);
    const firstNameTh = parts[0] ?? "";
    const lastNameTh = parts.slice(1).join(" ");

    setSaving(true);
    try {
      const payload = {
        employeeType,
        company,
        positionId: positionId1,
        positionTitle: pos1?.title || "",
        positionId2: positionId2 || null,
        positionTitle2: pos2?.title || null,
        positionId3: positionId3 || null,
        positionTitle3: pos3?.title || null,
        applicationCode: applicationCode.trim() || null,
        channel: channel || null,
        firstNameTh,
        lastNameTh,
        age: age ? parseInt(age) : null,
        gender: gender || null,
        phone: phone.trim(),
        email: email.trim(),
        educationLevelText: educationLevel,
        lastCompany: lastCompany.trim(),
        lastPosition: lastPosition.trim(),
        lastSalaryMin: lastSalaryMin ? parseFloat(lastSalaryMin) : null,
        lastSalaryMax: lastSalaryMax ? parseFloat(lastSalaryMax) : null,
        photoUrl: photo?.url ?? null,
        resumeUrl: resume.url,
      };
      const res = await fetch("/api/forms/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err?.error || "บันทึกข้อมูลไม่สำเร็จ");
        return;
      }
      router.push("/hr/applications");
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 -mx-4 mb-4 flex items-center justify-between border-b border-green-200 bg-white px-4 py-3 sm:-mx-6 sm:px-6">
        <h1 className="text-xl font-bold text-gray-900">From Resume</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            form="from-resume-form"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-green-600/30 hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            บันทึก
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <form id="from-resume-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Section: ข้อมูลการสมัคร */}
        <Card>
          <Field label="ประเภทพนักงาน" required>
            <ButtonGroup
              options={EMPLOYEE_TYPES}
              value={employeeType}
              onChange={setEmployeeType}
            />
          </Field>

          <Field label="บริษัท" required>
            <select
              value={company}
              onChange={(e) => {
                setCompany(e.target.value);
                setPositionId1("");
                setPositionId2("");
                setPositionId3("");
              }}
              className={inputCls}
              required
            >
              <option value="">-- เลือกบริษัท --</option>
              {COMPANIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </Field>

          <Field label="สนใจสมัครตำแหน่ง 1" required>
            <select value={positionId1} onChange={(e) => setPositionId1(e.target.value)} className={inputCls} required>
              <option value="">-- เลือกตำแหน่ง --</option>
              {filteredPositions.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </Field>

          <Field label="สนใจสมัครตำแหน่ง 2">
            <select value={positionId2} onChange={(e) => setPositionId2(e.target.value)} className={inputCls}>
              <option value="">-- ไม่ระบุ --</option>
              {filteredPositions.filter((p) => p.id !== positionId1).map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </Field>

          <Field label="สนใจสมัครตำแหน่ง 3">
            <select value={positionId3} onChange={(e) => setPositionId3(e.target.value)} className={inputCls}>
              <option value="">-- ไม่ระบุ --</option>
              {filteredPositions.filter((p) => p.id !== positionId1 && p.id !== positionId2).map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </Field>

          <Field label="ช่องทาง">
            <select value={channel} onChange={(e) => setChannel(e.target.value)} className={inputCls}>
              <option value="">-- เลือกช่องทาง --</option>
              {CHANNELS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>

          <Field label="รหัสใบสมัคร" help="กรอกถ้ามาจาก Job Thai หรือช่องทางอื่นๆ ถ้าไม่มีไม่ต้องใส่">
            <input
              type="text"
              value={applicationCode}
              onChange={(e) => setApplicationCode(e.target.value)}
              className={inputCls}
              placeholder="เช่น JT-12345"
            />
          </Field>
        </Card>

        {/* Section: ข้อมูลผู้สมัคร */}
        <Card>
          <Field label="ชื่อ - นามสกุล" required>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputCls}
              placeholder="เช่น สมชาย ใจดี"
              required
            />
          </Field>

          <Field label="อายุ" required>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className={inputCls}
              min={0}
              required
            />
          </Field>

          <Field label="เพศ">
            <ButtonGroup
              options={[
                { value: "MALE", label: "ชาย" },
                { value: "FEMALE", label: "หญิง" },
              ]}
              value={gender}
              onChange={(v) => setGender(v as any)}
            />
          </Field>

          <Field label="เบอร์โทร" required>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputCls}
              placeholder="0812345678"
              required
            />
          </Field>

          <Field label="Email" required>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              placeholder="example@email.com"
              required
            />
          </Field>

          <Field label="ระดับการศึกษา" required>
            <select
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value)}
              className={inputCls}
              required
            >
              <option value="">-- เลือกระดับการศึกษา --</option>
              {EDUCATION_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </Field>

          <Field label="บริษัทล่าสุด" required>
            <input
              type="text"
              value={lastCompany}
              onChange={(e) => setLastCompany(e.target.value)}
              className={inputCls}
              required
            />
          </Field>

          <Field label="ตำแหน่งล่าสุด" required>
            <input
              type="text"
              value={lastPosition}
              onChange={(e) => setLastPosition(e.target.value)}
              className={inputCls}
              required
            />
          </Field>

          <Field label="เงินเดือนล่าสุด Min" required>
            <input
              type="number"
              value={lastSalaryMin}
              onChange={(e) => setLastSalaryMin(e.target.value)}
              className={inputCls}
              min={0}
              required
            />
          </Field>

          <Field label="เงินเดือนล่าสุด Max" required>
            <input
              type="number"
              value={lastSalaryMax}
              onChange={(e) => setLastSalaryMax(e.target.value)}
              className={inputCls}
              min={0}
              required
            />
          </Field>

          <Field label="รูปถ่าย">
            <FileField
              value={photo}
              uploading={uploadingPhoto}
              accept="image/*"
              onChange={(file) => uploadFile(file, "photos", setPhoto, setUploadingPhoto)}
              onClear={() => setPhoto(null)}
            />
          </Field>

          <Field label="Resume" required>
            <FileField
              value={resume}
              uploading={uploadingResume}
              accept=".pdf,image/*,.doc,.docx"
              onChange={(file) => uploadFile(file, "resumes", setResume, setUploadingResume)}
              onClear={() => setResume(null)}
            />
          </Field>
        </Card>
      </form>
    </div>
  );
}

const inputCls =
  "block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function Field({
  label,
  required,
  help,
  children,
}: {
  label: string;
  required?: boolean;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid items-start gap-3 sm:grid-cols-[180px_1fr]">
      <label className="pt-2 text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div>
        {children}
        {help && <p className="mt-1 text-xs text-gray-500">{help}</p>}
      </div>
    </div>
  );
}

function ButtonGroup({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`flex-1 rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-all ${
            value === o.value
              ? "border-green-600 bg-green-600 text-white shadow-sm"
              : "border-gray-200 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function FileField({
  value,
  uploading,
  accept,
  onChange,
  onClear,
}: {
  value: { url: string; fileName: string; fileSize?: number } | null;
  uploading: boolean;
  accept: string;
  onChange: (file: File) => void;
  onClear: () => void;
}) {
  if (value) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3">
        <div className="flex items-center gap-2 truncate">
          <FileIcon className="h-5 w-5 flex-shrink-0 text-green-600" />
          <span className="truncate text-sm text-gray-800">{value.fileName}</span>
        </div>
        <button type="button" onClick={onClear} className="text-red-500 hover:text-red-700">
          <X className="h-5 w-5" />
        </button>
      </div>
    );
  }
  return (
    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-green-300 bg-green-50/50 p-4 text-center hover:bg-green-50">
      {uploading ? (
        <Loader2 className="h-6 w-6 animate-spin text-green-600" />
      ) : (
        <UploadCloud className="h-6 w-6 text-green-600" />
      )}
      <span className="text-sm text-gray-700">คลิกเพื่อเลือกไฟล์ (สูงสุด 10MB)</span>
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onChange(file);
        }}
      />
    </label>
  );
}
