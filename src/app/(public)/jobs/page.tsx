"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  Briefcase,
  Building2,
  MapPin,
  Clock,
  Banknote,
  Loader2,
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  salaryMin: number;
  salaryMax: number;
  postedAt: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch("/api/jobs");
        if (res.ok) {
          const data = await res.json();
          setJobs(data);
        }
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              ตำแหน่งงานที่เปิดรับ
            </h1>
            <p className="mt-3 text-lg text-blue-100">
              ค้นหาตำแหน่งงานที่เหมาะสมกับคุณ
            </p>
          </div>

          {/* Search */}
          <div className="mx-auto mt-8 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหาตำแหน่งงาน, แผนก..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border-0 py-4 pl-12 pr-4 text-base shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Job Grid */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <Briefcase className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <p className="text-lg font-medium text-gray-900">ไม่พบตำแหน่งงาน</p>
            <p className="mt-1 text-sm text-gray-500">
              ลองค้นหาด้วยคำค้นอื่น หรือกลับมาดูอีกครั้งในภายหลัง
            </p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-gray-500">
              พบ {filteredJobs.length} ตำแหน่ง
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-blue-200 hover:shadow-md"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                      <Briefcase className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                      {typeLabels[job.type] || job.type}
                    </span>
                  </div>

                  <h3 className="mb-1 text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                    {job.title}
                  </h3>

                  <div className="mb-4 space-y-1.5">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Building2 className="h-4 w-4" />
                      <span>{job.department}</span>
                    </div>
                    {job.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Banknote className="h-4 w-4" />
                      <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="h-3 w-3" />
                    <span>โพสต์เมื่อ {job.postedAt}</span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
