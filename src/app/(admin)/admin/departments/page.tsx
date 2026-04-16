"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  ChevronDown,
  ChevronRight,
  Building2,
  Briefcase,
  X,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface Position {
  id: string;
  title: string;
  level: string;
}

interface Department {
  id: string;
  name: string;
  positions: Position[];
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showPosModal, setShowPosModal] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [saving, setSaving] = useState(false);

  // Department form
  const [deptName, setDeptName] = useState("");

  // Position form
  const [posTitle, setPosTitle] = useState("");
  const [posLevel, setPosLevel] = useState("");

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await fetch("/api/admin/departments");
      if (res.ok) {
        const data = await res.json();
        setDepartments(data);
      }
    } catch (err) {
      console.error("Failed to fetch departments:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleDept = (id: string) => {
    setExpandedDepts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleAddDept = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: deptName }),
      });
      if (res.ok) {
        setShowDeptModal(false);
        setDeptName("");
        fetchDepartments();
      }
    } catch (err) {
      console.error("Failed to add department:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddPosition = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/departments/${selectedDeptId}/positions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: posTitle, level: posLevel }),
      });
      if (res.ok) {
        setShowPosModal(false);
        setPosTitle("");
        setPosLevel("");
        fetchDepartments();
      }
    } catch (err) {
      console.error("Failed to add position:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">แผนก/ตำแหน่ง</h1>
          <p className="mt-1 text-sm text-gray-500">
            จัดการแผนกและตำแหน่งงานในองค์กร
          </p>
        </div>
        <Button onClick={() => setShowDeptModal(true)}>
          <Plus className="h-4 w-4" />
          เพิ่มแผนก
        </Button>
      </div>

      {/* Department List */}
      <div className="space-y-3">
        {departments.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <Building2 className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <p className="text-gray-500">ยังไม่มีข้อมูลแผนก</p>
          </div>
        ) : (
          departments.map((dept) => {
            const isExpanded = expandedDepts.has(dept.id);
            return (
              <div
                key={dept.id}
                className="rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                <button
                  onClick={() => toggleDept(dept.id)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-gray-900">
                      {dept.name}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                      {dept.positions.length} ตำแหน่ง
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-100 px-6 py-4">
                    {dept.positions.length === 0 ? (
                      <p className="py-4 text-center text-sm text-gray-400">
                        ยังไม่มีตำแหน่งในแผนกนี้
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {dept.positions.map((pos) => (
                          <div
                            key={pos.id}
                            className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3"
                          >
                            <div className="flex items-center gap-3">
                              <Briefcase className="h-4 w-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-700">
                                {pos.title}
                              </span>
                              {pos.level && (
                                <span className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
                                  {pos.level}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <button className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600">
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => {
                        setSelectedDeptId(dept.id);
                        setShowPosModal(true);
                      }}
                      className="mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50"
                    >
                      <Plus className="h-4 w-4" />
                      เพิ่มตำแหน่ง
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Department Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                เพิ่มแผนกใหม่
              </h2>
              <button
                onClick={() => setShowDeptModal(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddDept} className="space-y-4">
              <Input
                label="ชื่อแผนก"
                type="text"
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
                required
              />
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowDeptModal(false)}
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

      {/* Add Position Modal */}
      {showPosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                เพิ่มตำแหน่งใหม่
              </h2>
              <button
                onClick={() => setShowPosModal(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddPosition} className="space-y-4">
              <Input
                label="ชื่อตำแหน่ง"
                type="text"
                value={posTitle}
                onChange={(e) => setPosTitle(e.target.value)}
                required
              />
              <Input
                label="ระดับ"
                type="text"
                placeholder="เช่น Junior, Senior, Lead"
                value={posLevel}
                onChange={(e) => setPosLevel(e.target.value)}
              />
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowPosModal(false)}
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
