"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  X,
  Loader2,
  User,
  MoreVertical,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

const roleLabels: Record<string, string> = {
  hr: "HR",
  admin: "ผู้ดูแลระบบ",
  manager: "ผู้จัดการ",
};

const roleBadgeColors: Record<string, string> = {
  hr: "bg-blue-100 text-blue-700",
  admin: "bg-purple-100 text-purple-700",
  manager: "bg-green-100 text-green-700",
};

const statusLabels: Record<string, string> = {
  active: "ใช้งาน",
  inactive: "ปิดใช้งาน",
};

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-500",
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);

  // New user form
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("hr");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          role: newRole,
          password: newPassword,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setNewName("");
        setNewEmail("");
        setNewRole("hr");
        setNewPassword("");
        fetchUsers();
      }
    } catch (err) {
      console.error("Failed to add user:", err);
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการผู้ใช้</h1>
          <p className="mt-1 text-sm text-gray-500">
            จัดการบัญชีผู้ใช้งานในระบบ
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" />
          เพิ่มผู้ใช้
        </Button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหาผู้ใช้..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 font-medium text-gray-500">ชื่อ</th>
                  <th className="px-6 py-3 font-medium text-gray-500">อีเมล</th>
                  <th className="px-6 py-3 font-medium text-gray-500">บทบาท</th>
                  <th className="px-6 py-3 font-medium text-gray-500">สถานะ</th>
                  <th className="px-6 py-3 font-medium text-gray-500"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      ไม่พบข้อมูลผู้ใช้
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="transition-colors hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <span className="font-medium text-gray-900">
                            {user.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                            roleBadgeColors[user.role] ||
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {roleLabels[user.role] || user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                            statusColors[user.status] ||
                            "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {statusLabels[user.status] || user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                เพิ่มผู้ใช้ใหม่
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <Input
                label="ชื่อ-นามสกุล"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
              <Input
                label="อีเมล"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  บทบาท
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="hr">HR</option>
                  <option value="manager">ผู้จัดการ</option>
                  <option value="admin">ผู้ดูแลระบบ</option>
                </select>
              </div>
              <Input
                label="รหัสผ่าน"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                >
                  ยกเลิก
                </Button>
                <Button type="submit" loading={saving}>
                  บันทึก
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
