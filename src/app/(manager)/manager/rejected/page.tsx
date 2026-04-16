"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, UserX } from "lucide-react";

type FormRow = {
  id: string;
  firstNameTh?: string | null;
  lastNameTh?: string | null;
  firstNameEn?: string | null;
  lastNameEn?: string | null;
  positionTitle?: string | null;
  company?: string | null;
  status?: string | null;
  photoUrl?: string | null;
  email?: string | null;
  phone?: string | null;
  submittedAt?: string | null;
  updatedAt?: string | null;
};

function fullName(f: FormRow) {
  return (
    `${f.firstNameTh ?? ""} ${f.lastNameTh ?? ""}`.trim() ||
    `${f.firstNameEn ?? ""} ${f.lastNameEn ?? ""}`.trim() ||
    "-"
  );
}

function formatDate(d?: string | null) {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "-";
  }
}

export default function ManagerRejectedPage() {
  const [forms, setForms] = useState<FormRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch("/api/application-forms?status=REJECTED");
      if (res.ok) {
        const data = await res.json();
        setForms(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return forms;
    return forms.filter((f) => {
      const n = fullName(f).toLowerCase();
      const p = (f.positionTitle || "").toLowerCase();
      return n.includes(s) || p.includes(s);
    });
  }, [forms, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <UserX className="h-6 w-6 text-red-600" />
          ไม่ผ่าน / ปฏิเสธ
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          รายชื่อผู้สมัครที่ถูกปฏิเสธหรือไม่ผ่านการพิจารณา (อ่านอย่างเดียว)
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาชื่อหรือตำแหน่ง..."
          className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-green-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 rounded-full bg-green-50 p-4">
              <UserX className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-gray-600">ไม่พบข้อมูลผู้สมัครที่ถูกปฏิเสธ</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-green-50 text-left text-xs font-semibold uppercase tracking-wide text-green-800">
                <tr>
                  <th className="px-4 py-3">ชื่อ</th>
                  <th className="px-4 py-3">ตำแหน่ง</th>
                  <th className="px-4 py-3">บริษัท</th>
                  <th className="px-4 py-3">อีเมล</th>
                  <th className="px-4 py-3">วันที่สมัคร</th>
                  <th className="px-4 py-3">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((f) => (
                  <tr key={f.id} className="hover:bg-red-50/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {f.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={f.photoUrl}
                            alt=""
                            className="h-9 w-9 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
                            {fullName(f).charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">
                            {fullName(f)}
                          </p>
                          {f.phone && (
                            <p className="text-xs text-gray-500">{f.phone}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {f.positionTitle || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {f.company || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {f.email || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {formatDate(f.submittedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                        ไม่ผ่าน / ปฏิเสธ
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
