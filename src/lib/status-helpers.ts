export const FORM_STATUS_LABELS: Record<string, string> = {
  DRAFT: "ร่าง",
  TANK: "ถังพัก (รอพิจารณา)",
  TANK_REJECTED: "ถังพัก (ไม่สนใจ)",
  RESUME: "Resume (รอพิจารณา)",
  SUBMITTED: "ส่งใบสมัครแล้ว",
  SCREENING: "กำลังคัดกรอง",
  INTERVIEW_SCHEDULED: "นัดสัมภาษณ์",
  INTERVIEWED: "สัมภาษณ์แล้ว",
  PROBATION: "ทดลองงาน",
  HIRED: "รับเข้าทำงาน",
  REJECTED: "ไม่ผ่าน/ปฏิเสธ",
};

export const FORM_STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700 border-gray-200",
  TANK: "bg-pink-100 text-pink-700 border-pink-200",
  TANK_REJECTED: "bg-pink-50 text-pink-500 border-pink-200",
  RESUME: "bg-cyan-100 text-cyan-700 border-cyan-200",
  SUBMITTED: "bg-blue-100 text-blue-700 border-blue-200",
  SCREENING: "bg-yellow-100 text-yellow-700 border-yellow-200",
  INTERVIEW_SCHEDULED: "bg-purple-100 text-purple-700 border-purple-200",
  INTERVIEWED: "bg-indigo-100 text-indigo-700 border-indigo-200",
  PROBATION: "bg-orange-100 text-orange-700 border-orange-200",
  HIRED: "bg-green-100 text-green-700 border-green-200",
  REJECTED: "bg-red-100 text-red-700 border-red-200",
};

export const FORM_STATUS_ORDER: string[] = [
  "DRAFT",
  "SUBMITTED",
  "SCREENING",
  "INTERVIEW_SCHEDULED",
  "INTERVIEWED",
  "PROBATION",
  "HIRED",
  "REJECTED",
];

export function getStatusLabel(status: string | null | undefined): string {
  if (!status) return "-";
  return FORM_STATUS_LABELS[status] ?? status;
}

export function getStatusColor(status: string | null | undefined): string {
  if (!status) return "bg-gray-100 text-gray-700 border-gray-200";
  return FORM_STATUS_COLORS[status] ?? "bg-gray-100 text-gray-700 border-gray-200";
}
