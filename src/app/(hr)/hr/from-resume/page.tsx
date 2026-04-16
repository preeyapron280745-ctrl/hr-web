"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UploadCloud, CheckCircle2, X } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { COMPANIES, EMPLOYEE_TYPES } from "@/lib/form-constants";

interface Position {
  id: string;
  title: string;
  company: string | null;
  active: boolean;
  department?: { id: string; name: string };
}

interface UploadedFile {
  url: string;
  fileName: string;
  fileSize?: number;
}

export default function FromResumePage() {
  const router = useRouter();

  const [positions, setPositions] = useState<Position[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [employeeType, setEmployeeType] = useState("");
  const [company, setCompany] = useState("");
  const [positionId, setPositionId] = useState("");
  const [fullNameTh, setFullNameTh] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [photo, setPhoto] = useState<UploadedFile | null>(null);
  const [resume, setResume] = useState<UploadedFile | null>(null);

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    try {
      const res = await fetch("/api/positions");
      if (res.ok) {
        const data: Position[] = await res.json();
        setPositions(data.filter((p) => p.active));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredPositions = company
    ? positions.filter((p) => !p.company || p.company === company)
    : positions;

  const handleFileUpload = async (
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
      setState({
        url: data.url,
        fileName: data.fileName ?? file.name,
        fileSize: data.fileSize ?? file.size,
      });
    } catch (err) {
      console.error(err);
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
    if (!positionId) return setError("กรุณาเลือกตำแหน่ง");
    if (!fullNameTh.trim()) return setError("กรุณากรอกชื่อ-นามสกุล (ภาษาไทย)");
    if (!phone.trim()) return setError("กรุณากรอกเบอร์โทรศัพท์");

    const selectedPosition = positions.find((p) => p.id === positionId);
    if (!selectedPosition) {
      return setError("ไม่พบตำแหน่งที่เลือก");
    }

    // Split full name into first and last
    const parts = fullNameTh.trim().split(/\s+/);
    const firstNameTh = parts[0] ?? "";
    const lastNameTh = parts.slice(1).join(" ");

    setSaving(true);
    try {
      const payload = {
        employeeType,
        company,
        positionId,
        positionTitle: selectedPosition.title,
        firstNameTh,
        lastNameTh,
        phone: phone.trim(),
        email: email.trim() || null,
        photoUrl: photo?.url ?? null,
        resumeUrl: resume?.url ?? null,
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
      console.error(err);
      setError("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          From Resume (บันทึกใบสมัครจาก Resume)
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          ใช้สำหรับ HR บันทึกข้อมูลผู้สมัครที่ส่ง Resume เป็นกระดาษหรือไฟล์มาด้วยตนเอง
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        {/* Row 1: employeeType & company */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              ประเภทพนักงาน<span className="ml-0.5 text-red-500">*</span>
            </label>
            <select
              value={employeeType}
              onChange={(e) => setEmployeeType(e.target.value)}
              required
              className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
            >
              <option value="" disabled>
                -- เลือกประเภทพนักงาน --
              </option>
              {EMPLOYEE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              บริษัท<span className="ml-0.5 text-red-500">*</span>
            </label>
            <select
              value={company}
              onChange={(e) => {
                setCompany(e.target.value);
                setPositionId("");
              }}
              required
              className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
            >
              <option value="" disabled>
                -- เลือกบริษัท --
              </option>
              {COMPANIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Position */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            ตำแหน่ง<span className="ml-0.5 text-red-500">*</span>
          </label>
          <select
            value={positionId}
            onChange={(e) => setPositionId(e.target.value)}
            required
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
          >
            <option value="" disabled>
              -- เลือกตำแหน่ง --
            </option>
            {filteredPositions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
                {p.department?.name ? ` (${p.department.name})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Name */}
        <Input
          label="ชื่อ-นามสกุล (ภาษาไทย)"
          type="text"
          value={fullNameTh}
          onChange={(e) => setFullNameTh(e.target.value)}
          placeholder="เช่น สมชาย ใจดี"
          required
        />

        {/* Contact */}
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="เบอร์โทรศัพท์"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0812345678"
            required
          />
          <Input
            label="อีเมล"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
          />
        </div>

        {/* Uploads */}
        <div className="grid gap-4 md:grid-cols-2">
          <FileUploadBox
            label="อัปโหลดรูปถ่าย"
            accept="image/*"
            busy={uploadingPhoto}
            file={photo}
            onChoose={(file) =>
              handleFileUpload(file, "photos", setPhoto, setUploadingPhoto)
            }
            onClear={() => setPhoto(null)}
          />
          <FileUploadBox
            label="อัปโหลด Resume (PDF / รูปภาพ)"
            accept=".pdf,image/*"
            busy={uploadingResume}
            file={resume}
            onChoose={(file) =>
              handleFileUpload(file, "resumes", setResume, setUploadingResume)
            }
            onClear={() => setResume(null)}
          />
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push("/hr/applications")}
            disabled={saving}
          >
            ยกเลิก
          </Button>
          <button
            type="submit"
            disabled={saving || uploadingPhoto || uploadingResume}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            บันทึกใบสมัคร
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------- File upload sub component ---------- */

interface FileUploadBoxProps {
  label: string;
  accept: string;
  busy: boolean;
  file: UploadedFile | null;
  onChoose: (file: File) => void;
  onClear: () => void;
}

function FileUploadBox({
  label,
  accept,
  busy,
  file,
  onChoose,
  onClear,
}: FileUploadBoxProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>

      {file ? (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-800">
              {file.fileName}
            </p>
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-green-700 underline"
            >
              ดูไฟล์
            </a>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="rounded p-1 text-gray-400 hover:bg-white hover:text-gray-600"
            aria-label="ลบไฟล์"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label
          className={
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 transition-colors " +
            (busy
              ? "border-green-400 bg-green-50"
              : "border-gray-300 bg-gray-50 hover:border-green-400 hover:bg-green-50/50")
          }
        >
          {busy ? (
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          ) : (
            <UploadCloud className="h-8 w-8 text-gray-400" />
          )}
          <span className="text-center text-xs text-gray-500">
            {busy ? "กำลังอัปโหลด..." : "คลิกเพื่อเลือกไฟล์ (สูงสุด 10MB)"}
          </span>
          <input
            type="file"
            accept={accept}
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onChoose(f);
              e.target.value = "";
            }}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}
