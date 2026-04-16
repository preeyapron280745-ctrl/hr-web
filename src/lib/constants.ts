export const STATUS_LABELS: Record<string, string> = {
  APPLIED: "สมัครแล้ว",
  SCREENING: "กำลังคัดกรอง",
  INTERVIEW_SCHEDULED: "นัดสัมภาษณ์",
  INTERVIEWED: "สัมภาษณ์แล้ว",
  PENDING_APPROVAL: "รออนุมัติ",
  APPROVED: "อนุมัติแล้ว",
  OFFER_SENT: "ส่ง Offer แล้ว",
  OFFER_ACCEPTED: "รับ Offer แล้ว",
  HIRED: "เข้าทำงานแล้ว",
  REJECTED: "ไม่ผ่าน",
  WITHDRAWN: "ถอนใบสมัคร",
};

export const STATUS_COLORS: Record<string, string> = {
  APPLIED: "bg-blue-100 text-blue-800",
  SCREENING: "bg-yellow-100 text-yellow-800",
  INTERVIEW_SCHEDULED: "bg-purple-100 text-purple-800",
  INTERVIEWED: "bg-indigo-100 text-indigo-800",
  PENDING_APPROVAL: "bg-orange-100 text-orange-800",
  APPROVED: "bg-green-100 text-green-800",
  OFFER_SENT: "bg-teal-100 text-teal-800",
  OFFER_ACCEPTED: "bg-emerald-100 text-emerald-800",
  HIRED: "bg-green-200 text-green-900",
  REJECTED: "bg-red-100 text-red-800",
  WITHDRAWN: "bg-gray-100 text-gray-800",
};

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "ผู้ดูแลระบบ",
  HR: "ฝ่ายบุคคล",
  MANAGER: "หัวหน้าแผนก",
  APPLICANT: "ผู้สมัครงาน",
};

export const GENDER_LABELS: Record<string, string> = {
  MALE: "ชาย",
  FEMALE: "หญิง",
  OTHER: "อื่นๆ",
};

export const MARITAL_LABELS: Record<string, string> = {
  SINGLE: "โสด",
  MARRIED: "สมรส",
  DIVORCED: "หย่า",
  WIDOWED: "หม้าย",
};

export const EDUCATION_LEVELS = [
  "มัธยมศึกษาตอนต้น",
  "มัธยมศึกษาตอนปลาย",
  "ปวช.",
  "ปวส.",
  "ปริญญาตรี",
  "ปริญญาโท",
  "ปริญญาเอก",
];

export const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "พนักงานประจำ",
  PART_TIME: "พนักงานชั่วคราว",
  CONTRACT: "สัญญาจ้าง",
  INTERNSHIP: "ฝึกงาน",
};

export const LANGUAGE_PROFICIENCY = ["ดี", "พอใช้", "อ่อน"];

export const TITLE_OPTIONS = ["นาย", "นาง", "นางสาว"];
