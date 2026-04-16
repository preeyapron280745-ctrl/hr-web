import Link from "next/link";
import { Briefcase, FileText, Users, LogIn } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      <header className="border-b border-green-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Comets HR Recruitment</span>
          </div>
          <Link
            href="/login"
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-green-500 hover:text-green-600"
          >
            <LogIn className="h-4 w-4" />
            เจ้าหน้าที่
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-1 text-sm font-medium text-green-700">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            </span>
            เปิดรับสมัครงาน
          </div>
          <h1 className="mb-6 text-4xl font-bold text-gray-900 md:text-6xl">
            ร่วมเป็นส่วนหนึ่ง
            <br />
            <span className="text-green-600">กับทีมของเรา</span>
          </h1>
          <p className="mb-10 text-lg text-gray-600 md:text-xl">
            กรอกใบสมัครงานออนไลน์ได้ทันที ไม่ต้องสมัครสมาชิก
            <br />
            รวดเร็ว สะดวก ใช้งานง่ายทั้งบนมือถือและคอมพิวเตอร์
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/apply"
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-green-600/30 transition-all hover:bg-green-700 hover:shadow-xl"
            >
              <FileText className="h-5 w-5" />
              สมัครงาน
            </Link>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-green-600 bg-white px-8 py-4 text-lg font-semibold text-green-600 transition-all hover:bg-green-50"
            >
              <Briefcase className="h-5 w-5" />
              ดูตำแหน่งที่เปิดรับ
            </Link>
          </div>
        </div>

        <div className="mt-20 grid gap-6 md:grid-cols-3">
          <FeatureCard icon={<FileText className="h-6 w-6" />} title="กรอกใบสมัครออนไลน์" description="ระบบฟอร์มหลายขั้นตอนที่ใช้งานง่าย บันทึกได้ทันที" />
          <FeatureCard icon={<Briefcase className="h-6 w-6" />} title="ตำแหน่งงานหลากหลาย" description="เปิดรับพนักงานรายเดือน รายวัน และนักศึกษาฝึกงาน" />
          <FeatureCard icon={<Users className="h-6 w-6" />} title="3 บริษัทในเครือ" description="Comets HQ, Comets Factory และ ICT Manufacturing" />
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-gray-500">
          © 2026 Comets Intertrade Co., Ltd. | ICT Manufacturing Co., Ltd.
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm transition-all hover:border-green-300 hover:shadow-md">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
