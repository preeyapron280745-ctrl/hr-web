"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Briefcase, LogIn } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function StaffLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("staff", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      } else {
        const session = await getSession();
        const role = (session?.user as any)?.role;
        if (role === "ADMIN") router.push("/admin/dashboard");
        else if (role === "HR") router.push("/hr/dashboard");
        else if (role === "MANAGER") router.push("/manager/dashboard");
        else router.push("/");
        router.refresh();
      }
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">HR - ใบสมัครงาน</span>
          </Link>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900">Log in</h1>
            <p className="mt-1 text-sm text-gray-500">
              สำหรับเจ้าหน้าที่ HR / หัวหน้าแผนก / ผู้ดูแลระบบ
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="ชื่อผู้ใช้ (Username)"
              type="text"
              placeholder="admin / hr / manager"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <Input
              label="รหัสผ่าน (Password)"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" loading={loading} className="w-full !bg-green-600 hover:!bg-green-700">
              <LogIn className="h-4 w-4" />
              เข้าสู่ระบบ
            </Button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-green-600">
            ← กลับหน้าหลัก
          </Link>
        </div>
      </div>
    </div>
  );
}
