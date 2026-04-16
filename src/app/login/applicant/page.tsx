"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Briefcase, LogIn, UserPlus } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

type TabType = "login" | "register";

export default function ApplicantLoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("applicant", {
        email: loginEmail,
        password: loginPassword,
        redirect: false,
      });

      if (result?.error) {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      } else {
        router.push("/my-applications");
        router.refresh();
      }
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (registerPassword !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    if (registerPassword.length < 8) {
      setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/applicants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email: registerEmail,
          password: registerPassword,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "เกิดข้อผิดพลาดในการลงทะเบียน");
        return;
      }

      setSuccess("ลงทะเบียนสำเร็จ! กรุณาเข้าสู่ระบบ");
      setActiveTab("login");
      setLoginEmail(registerEmail);
      setFirstName("");
      setLastName("");
      setRegisterEmail("");
      setRegisterPassword("");
      setConfirmPassword("");
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">HR Recruit</span>
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => {
                setActiveTab("login");
                setError("");
                setSuccess("");
              }}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "login"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              เข้าสู่ระบบ
            </button>
            <button
              onClick={() => {
                setActiveTab("register");
                setError("");
                setSuccess("");
              }}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "register"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              ลงทะเบียน
            </button>
          </div>

          <div className="p-8">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                {activeTab === "login" ? "เข้าสู่ระบบผู้สมัครงาน" : "ลงทะเบียนผู้สมัครงาน"}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {activeTab === "login"
                  ? "เข้าสู่ระบบเพื่อติดตามสถานะการสมัครงาน"
                  : "สร้างบัญชีเพื่อเริ่มสมัครงาน"}
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-600">
                {success}
              </div>
            )}

            {/* Login Form */}
            {activeTab === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  label="อีเมล"
                  type="email"
                  placeholder="name@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
                <Input
                  label="รหัสผ่าน"
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
                <Button type="submit" loading={loading} className="w-full">
                  <LogIn className="h-4 w-4" />
                  เข้าสู่ระบบ
                </Button>
              </form>
            )}

            {/* Register Form */}
            {activeTab === "register" && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="ชื่อ"
                    type="text"
                    placeholder="สมชาย"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                  <Input
                    label="นามสกุล"
                    type="text"
                    placeholder="ใจดี"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
                <Input
                  label="อีเมล"
                  type="email"
                  placeholder="name@example.com"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                />
                <Input
                  label="รหัสผ่าน"
                  type="password"
                  placeholder="อย่างน้อย 8 ตัวอักษร"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                />
                <Input
                  label="ยืนยันรหัสผ่าน"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <Button type="submit" loading={loading} className="w-full">
                  <UserPlus className="h-4 w-4" />
                  ลงทะเบียน
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Staff Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            เจ้าหน้าที่{" "}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              เข้าสู่ระบบที่นี่
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
