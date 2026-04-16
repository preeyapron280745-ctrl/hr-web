import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <ShieldAlert className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="mb-2 text-3xl font-bold text-gray-900">ไม่มีสิทธิ์เข้าถึง</h1>
        <p className="mb-6 text-gray-600">คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้</p>
        <Link
          href="/"
          className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
        >
          กลับสู่หน้าแรก
        </Link>
      </div>
    </div>
  );
}
