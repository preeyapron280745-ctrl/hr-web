import Link from "next/link";
import { Briefcase, LogIn } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="border-b border-blue-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">HR Recruit</span>
          </div>
          <Link
            href="/login"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <LogIn className="h-4 w-4" />
            เข้าสู่ระบบ
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="mx-auto flex max-w-7xl flex-col items-center px-6 py-24 text-center lg:py-32">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700">
          <Briefcase className="h-4 w-4" />
          เปิดรับสมัครงานหลายตำแหน่ง
        </div>

        <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
          ระบบสมัครงานออนไลน์
        </h1>

        <p className="mb-10 max-w-2xl text-lg text-gray-600 sm:text-xl">
          ค้นหาตำแหน่งงานที่เหมาะสมกับคุณ สมัครง่าย ติดตามสถานะได้ตลอดเวลา
          ร่วมเป็นส่วนหนึ่งของทีมงานคุณภาพกับเรา
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/jobs"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-8 py-3 text-base font-medium text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30"
          >
            <Briefcase className="h-5 w-5" />
            ดูตำแหน่งงาน
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-8 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <LogIn className="h-5 w-5" />
            เข้าสู่ระบบ
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-20 grid w-full max-w-3xl grid-cols-2 gap-8 sm:grid-cols-4">
          {[
            { value: "50+", label: "ตำแหน่งงาน" },
            { value: "1,200+", label: "ผู้สมัคร" },
            { value: "20+", label: "แผนก" },
            { value: "98%", label: "ความพึงพอใจ" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-bold text-blue-600">{stat.value}</p>
              <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
