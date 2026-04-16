"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Loader2, Power, Briefcase } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { COMPANIES } from "@/lib/form-constants";

interface Department {
  id: string;
  name: string;
  active?: boolean;
}

interface Position {
  id: string;
  title: string;
  departmentId: string;
  company: string | null;
  active: boolean;
  department?: { id: string; name: string };
}

type CompanyFilter = "ALL" | "COMETS_HQ" | "COMETS_FACTORY" | "ICT";

const COMPANY_SHORT: Record<string, string> = {
  COMETS_HQ: "COMETS HQ",
  COMETS_FACTORY: "COMETS Factory",
  ICT: "ICT",
};

export default function HRPostingsPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyFilter, setCompanyFilter] = useState<CompanyFilter>("ALL");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Position | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [company, setCompany] = useState("");
  const [active, setActive] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [posRes, depRes] = await Promise.all([
        fetch("/api/positions"),
        fetch("/api/departments"),
      ]);
      if (posRes.ok) {
        const posData = await posRes.json();
        setPositions(posData);
      }
      if (depRes.ok) {
        const depData = await depRes.json();
        setDepartments(depData);
      }
    } catch (err) {
      console.error("Failed to fetch:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPositions = useMemo(() => {
    if (companyFilter === "ALL") return positions;
    return positions.filter((p) => p.company === companyFilter);
  }, [positions, companyFilter]);

  const openCreate = () => {
    setEditing(null);
    setTitle("");
    setDepartmentId(departments[0]?.id ?? "");
    setCompany("");
    setActive(true);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (pos: Position) => {
    setEditing(pos);
    setTitle(pos.title);
    setDepartmentId(pos.departmentId);
    setCompany(pos.company ?? "");
    setActive(pos.active);
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditing(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError("กรุณากรอกชื่อตำแหน่ง");
      return;
    }
    if (!departmentId) {
      setFormError("กรุณาเลือกแผนก");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        departmentId,
        company: company || null,
        active,
      };

      const url = editing ? `/api/positions/${editing.id}` : "/api/positions";
      const method = editing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setFormError(err?.error || "ไม่สามารถบันทึกข้อมูลได้");
        return;
      }

      setModalOpen(false);
      setEditing(null);
      await fetchAll();
    } catch (err) {
      console.error("Save position failed:", err);
      setFormError("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (pos: Position) => {
    const nextActive = !pos.active;
    const confirmText = nextActive
      ? `เปิดการใช้งานตำแหน่ง "${pos.title}" ใช่หรือไม่?`
      : `ปิดการใช้งานตำแหน่ง "${pos.title}" ใช่หรือไม่?`;
    if (!confirm(confirmText)) return;

    try {
      const res = await fetch(`/api/positions/${pos.id}`, {
        method: nextActive ? "PUT" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: nextActive
          ? JSON.stringify({ active: true })
          : undefined,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err?.error || "ไม่สามารถเปลี่ยนสถานะได้");
        return;
      }
      await fetchAll();
    } catch (err) {
      console.error("Toggle active failed:", err);
      alert("เกิดข้อผิดพลาด");
    }
  };

  const tabs: { value: CompanyFilter; label: string }[] = [
    { value: "ALL", label: "ทั้งหมด" },
    { value: "COMETS_HQ", label: "COMETS HQ" },
    { value: "COMETS_FACTORY", label: "COMETS Factory" },
    { value: "ICT", label: "ICT" },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            จัดการตำแหน่งงาน
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            เพิ่ม แก้ไข หรือปิดการใช้งานตำแหน่งงานแต่ละแผนก
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
        >
          <Plus className="h-4 w-4" />
          เพิ่มตำแหน่ง
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex flex-wrap gap-2 border-b border-gray-200">
        {tabs.map((tab) => {
          const isActive = companyFilter === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setCompanyFilter(tab.value)}
              className={
                "relative -mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors " +
                (isActive
                  ? "border-green-600 text-green-700"
                  : "border-transparent text-gray-500 hover:text-gray-700")
              }
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      ) : filteredPositions.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <Briefcase className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="text-gray-500">ยังไม่มีตำแหน่งในรายการนี้</p>
          <button
            onClick={openCreate}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
            เพิ่มตำแหน่งแรก
          </button>
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>ชื่อตำแหน่ง</TableHeader>
              <TableHeader>แผนก</TableHeader>
              <TableHeader>บริษัท</TableHeader>
              <TableHeader>สถานะ</TableHeader>
              <TableHeader className="text-right">การกระทำ</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPositions.map((pos) => (
              <TableRow key={pos.id}>
                <TableCell className="font-medium text-gray-900">
                  {pos.title}
                </TableCell>
                <TableCell>{pos.department?.name ?? "-"}</TableCell>
                <TableCell>
                  {pos.company ? COMPANY_SHORT[pos.company] ?? pos.company : "-"}
                </TableCell>
                <TableCell>
                  {pos.active ? (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                      เปิดใช้งาน
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                      ปิดใช้งาน
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEdit(pos)}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      แก้ไข
                    </button>
                    <button
                      onClick={() => handleToggleActive(pos)}
                      className={
                        "inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors " +
                        (pos.active
                          ? "border-red-200 bg-white text-red-600 hover:bg-red-50"
                          : "border-green-200 bg-white text-green-700 hover:bg-green-50")
                      }
                    >
                      <Power className="h-3.5 w-3.5" />
                      {pos.active ? "ปิด" : "เปิด"}
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? "แก้ไขตำแหน่งงาน" : "เพิ่มตำแหน่งงาน"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="ชื่อตำแหน่ง"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="เช่น นักพัฒนาโปรแกรม"
            required
          />

          <div className="w-full">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              แผนก<span className="ml-0.5 text-red-500">*</span>
            </label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              required
              className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
            >
              <option value="" disabled>
                -- เลือกแผนก --
              </option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              บริษัท
            </label>
            <select
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
            >
              <option value="">-- ทุกบริษัท / ไม่ระบุ --</option>
              {COMPANIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {editing && (
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
              <input
                id="active-toggle"
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <label
                htmlFor="active-toggle"
                className="text-sm font-medium text-gray-700"
              >
                เปิดใช้งานตำแหน่งนี้
              </label>
            </div>
          )}

          {formError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {formError}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={closeModal}
              disabled={saving}
            >
              ยกเลิก
            </Button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? "บันทึกการแก้ไข" : "เพิ่มตำแหน่ง"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
