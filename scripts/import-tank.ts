import XLSX from "xlsx";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const FILE = path.join(__dirname, "..", "ใบสมัคร Comets - ICT. (1).xlsx");

function toStr(v: any): string | null {
  if (v == null || v === "") return null;
  return String(v).trim() || null;
}
function toInt(v: any): number | null {
  if (v == null || v === "") return null;
  const n = parseInt(String(v));
  return isNaN(n) ? null : n;
}
function toFloat(v: any): number | null {
  if (v == null || v === "") return null;
  const n = parseFloat(String(v).replace(/,/g, ""));
  return isNaN(n) ? null : n;
}
function mapCompany(th: any): "COMETS_HQ" | "COMETS_FACTORY" | "ICT" {
  if (!th) return "COMETS_HQ";
  const s = String(th);
  if (s.includes("Head") || s.includes("Hea")) return "COMETS_HQ";
  if (s.includes("Factory")) return "COMETS_FACTORY";
  if (s.includes("ICT") || s.includes("ไอซีที")) return "ICT";
  return "COMETS_HQ";
}
function mapEmployeeType(th: any): "MONTHLY" | "DAILY" | "INTERN" {
  if (!th) return "MONTHLY";
  const s = String(th);
  if (s.includes("รายวัน")) return "DAILY";
  if (s.includes("ฝึก")) return "INTERN";
  return "MONTHLY";
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function main() {
  console.log("Reading ถังพัก from Excel...");
  const wb = XLSX.readFile(FILE);
  const rows = XLSX.utils.sheet_to_json(wb.Sheets["ถังพัก"], { defval: null }) as any[];
  console.log(`Found ${rows.length} rows`);

  let count = 0;
  let skipped = 0;

  for (const r of rows) {
    const excelId = toStr(r["ID"]);
    if (!excelId) { skipped++; continue; }

    const fullName = toStr(r["ชื่อ - นามสกุล"]);
    if (!fullName) { skipped++; continue; }

    const parts = fullName.split(/\s+/);
    const firstNameTh = parts[0] || "(ไม่ระบุ)";
    const lastNameTh = parts.slice(1).join(" ") || "";

    const id = `tank_x${excelId}`;

    const data: any = {
      id,
      status: "TANK",
      employeeType: mapEmployeeType(r["ประเภทพนักงาน"]),
      company: mapCompany(r["บริษัท"]),
      positionTitle: toStr(r["สนใจสมัครตำแหน่ง 1"]) || "(ไม่ระบุ)",
      positionId2: null,
      positionTitle2: toStr(r["สนใจสมัครตำแหน่ง 2"]),
      positionId3: null,
      positionTitle3: toStr(r["สนใจสมัครตำแหน่ง 3"]),
      channel: toStr(r["ช่องทาง"]),
      applicationCode: toStr(r["รหัสใบสมัคร"]),
      firstNameTh,
      lastNameTh,
      age: toInt(r["อายุ"]),
      phone: toStr(r["เบอร์โทร"]),
      email: toStr(r["Email"]),
      educationLevelText: toStr(r["ระดับการศึกษา"]),
      lastCompany: toStr(r["บริษัทล่าสุด"]),
      lastPosition: toStr(r["ตำแหน่งล่าสุด"]),
      lastSalaryMin: toFloat(r["เงินเดือนล่าสุด Min"]),
      lastSalaryMax: toFloat(r["เงินเดือนล่าสุด Max"]),
      resumeUrl: toStr(r["Resume"]),
      tankStatus: toStr(r["สถานะรอพิจารณา"]) || "รอส่งข้อมูล",
      reviewer1: toStr(r["ผู้พิจารณา คนที่ 1"]),
      reviewer2: toStr(r["ผู้พิจารณา คนที่ 2"]),
      reviewer3: toStr(r["ผู้พิจารณา คนที่ 3"]),
      reviewerStatus1: toStr(r["สถานะการพิจารณา คนที่ 1"]),
      reviewerStatus2: toStr(r["สถานะการพิจารณา คนที่ 2"]),
      reviewerStatus3: toStr(r["สถานะการพิจารณา คนที่ 3"]),
      // Education data stored as JSON
      educationData: {
        "ระดับประถมศึกษา": { institution: toStr(r["ชื่อสถานศึกษา (ประถมศึกษา)"]), startYear: toStr(r["เริ่มปี พ.ศ. (ประถมศึกษา)"]), endYear: toStr(r["สำเร็จปี พ.ศ. (ประถมศึกษา)"]), gpa: toStr(r["เกรดเฉลี่ย (ประถมศึกษา)"]) },
        "ระดับมัธยมต้น": { institution: toStr(r["ชื่อสถานศึกษา (มัธยมต้น)"]), major: toStr(r["สาขาวิชา (มัธยมต้น)"]), startYear: toStr(r["เริ่มปี พ.ศ. (มัธยมต้น)"]), endYear: toStr(r["สำเร็จปี พ.ศ. (มัธยมต้น)"]), gpa: toStr(r["เกรดเฉลี่ย (มัธยมต้น)"]) },
        "ระดับปริญญาตรี": { institution: toStr(r["ชื่อสถานศึกษาปริญญาตรี"]), faculty: toStr(r["คณะ (ปริญญาตรี)"]), major: toStr(r["สาขาวิชา (ปริญญาตรี)"]), startYear: toStr(r["เริ่มปี พ.ศ. (ปริญญาตรี)"]), endYear: toStr(r["สำเร็จปี พ.ศ. (ปริญญาตรี)"]), gpa: toStr(r["เกรดเฉลี่ย (ปริญญาตรี)"]) },
        "ระดับปริญญาโท": { institution: toStr(r["ชื่อสถานศึกษา (ปริญญาโท)"]), faculty: toStr(r["คณะ (ปริญญาโท)"]), major: toStr(r["สาขาวิชา (ปริญญาโท)"]), startYear: toStr(r["เริ่มปี พ.ศ. (ปริญญาโท)"]), endYear: toStr(r["สำเร็จปี พ.ศ. (ปริญญาโท)"]), gpa: toStr(r["เกรดเฉลี่ย (ปริญญาโท)"]) },
      },
      sourceOfInfo: [],
      incomeTypes: [],
      educationLevels: toStr(r["ระดับการศึกษา"]) ? [toStr(r["ระดับการศึกษา"])!] : [],
      computerSkills: [],
      excelSkills: [],
      wordSkills: [],
      powerpointSkills: [],
      photoshopSkills: [],
    };

    try {
      await prisma.applicationForm.upsert({
        where: { id },
        update: data,
        create: data,
      });
      count++;
      if (count % 200 === 0) console.log(`  ... ${count}`);
    } catch (e: any) {
      console.error(`  ! Error: ${excelId}: ${e.message}`);
    }
  }

  console.log(`\n✓ Imported: ${count} | Skipped: ${skipped}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
