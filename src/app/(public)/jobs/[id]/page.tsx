"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  MapPin,
  Banknote,
  Clock,
  Users,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import Button from "@/components/ui/Button";

interface JobDetail {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  salaryMin: number;
  salaryMax: number;
  description: string;
  requirements: string[];
  benefits: string[];
  positions: number;
  postedAt: string;
}

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await fetch(`/api/jobs/${jobId}`);
        if (res.ok) {
          const data = await res.json();
          setJob(data);
        }
      } catch (err) {
        console.error("Failed to fetch job:", err);
      } finally {
        setLoading(false);
      }
    };
    if (jobId) fetchJob();
  }, [jobId]);

  const formatSalary = (min: number, max: number) => {
    const fmt = (n: number) => n.toLocaleString("th-TH");
    if (min && max) return `${fmt(min)} - ${fmt(max)} บาท`;
    if (min) return `${fmt(min)}+ บาท`;
    return "ตามตกลง";
  };

  const typeLabels: Record<string, string> = {
    fulltime: "เต็มเวลา",
    parttime: "พาร์ทไทม์",
    contract: "สัญญาจ้าง",
    intern: "ฝึกงาน",
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <Briefcase className="mb-4 h-16 w-16 text-gray-300" />
        <h1 className="text-xl font-bold text-gray-900">ไม่พบตำแหน่งงาน</h1>
        <p className="mt-2 text-gray-500">ตำแหน่งงานนี้อาจถูกลบหรือปิดรับสมัครแล้ว</p>
        <Link
          href="/jobs"
          className="mt-6 flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-700"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับไปดูตำแหน่งงานทั้งหมด
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-600">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
          <Link
            href="/jobs"
            className="mb-4 inline-flex items-center gap-1 text-sm text-green-100 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับไปดูตำแหน่งงานทั้งหมด
          </Link>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium text-white">
                  {typeLabels[job.type] || job.type}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                {job.title}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-green-100">
                <span className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {job.department}
                </span>
                {job.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {job.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Banknote className="h-4 w-4" />
                  {formatSalary(job.salaryMin, job.salaryMax)}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {job.positions} อัตรา
                </span>
              </div>
            </div>

            <Link href={`/apply/${job.id}`}>
              <Button size="lg" className="whitespace-nowrap shadow-lg">
                สมัครงาน
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Description */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                รายละเอียดงาน
              </h2>
              <div className="prose prose-sm max-w-none text-gray-600">
                <p className="whitespace-pre-line">{job.description}</p>
              </div>
            </div>

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  คุณสมบัติที่ต้องการ
                </h2>
                <ul className="space-y-2">
                  {job.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  สวัสดิการ
                </h2>
                <ul className="space-y-2">
                  {job.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-gray-900">ข้อมูลสรุป</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">ประเภท</span>
                  <span className="font-medium text-gray-900">
                    {typeLabels[job.type] || job.type}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">แผนก</span>
                  <span className="font-medium text-gray-900">
                    {job.department}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">เงินเดือน</span>
                  <span className="font-medium text-gray-900">
                    {formatSalary(job.salaryMin, job.salaryMax)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">จำนวนรับ</span>
                  <span className="font-medium text-gray-900">
                    {job.positions} อัตรา
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">โพสต์เมื่อ</span>
                  <span className="font-medium text-gray-900">
                    {job.postedAt}
                  </span>
                </div>
              </div>

              <Link href={`/apply/${job.id}`} className="mt-6 block">
                <Button className="w-full">สมัครงาน</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
