import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function SuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-green-200 bg-white p-8 text-center shadow-xl">
        <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        <h1 className="mb-3 text-2xl font-bold text-gray-900">
          บันทึกข้อมูลเรียบร้อยแล้ว
        </h1>
        <p className="mb-6 text-gray-600">
          ขอบคุณที่สมัครงานกับเรา เราจะติดต่อกลับโดยเร็วที่สุด
          <br />
          <span className="text-sm text-gray-500">
            (ข้อมูลของท่านไม่สามารถแก้ไขย้อนหลังได้)
          </span>
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
        >
          กลับสู่หน้าแรก
        </Link>
      </div>
    </div>
  );
}
