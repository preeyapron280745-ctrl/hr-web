// Import data from "ใบสมัคร Comets - ICT. (1).xlsx" into Supabase
// Usage: npx tsx scripts/import-from-excel.ts [--dry-run]

import XLSX from "xlsx";
import bcrypt from "bcryptjs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const DRY_RUN = process.argv.includes("--dry-run");
const prisma = new PrismaClient();

const FILE = path.join(__dirname, "..", "ใบสมัคร Comets - ICT. (1).xlsx");

// ================= Helpers =================
function excelDateToJs(v: any): Date | null {
  if (v == null || v === "") return null;
  if (v instanceof Date) return v;
  if (typeof v === "number") {
    const o = XLSX.SSF.parse_date_code(v);
    if (!o) return null;
    return new Date(Date.UTC(o.y, o.m - 1, o.d, o.H || 0, o.M || 0, Math.floor(o.S || 0)));
  }
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

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

function mapCompany(th: any): "COMETS_HQ" | "COMETS_FACTORY" | "ICT" | null {
  if (!th) return null;
  const s = String(th);
  if (s.includes("Head") || s.includes("Hea")) return "COMETS_HQ";
  if (s.includes("Factory")) return "COMETS_FACTORY";
  if (s.includes("ICT") || s.includes("ไอซีที")) return "ICT";
  return null;
}

function mapEmployeeType(th: any): "MONTHLY" | "DAILY" | "INTERN" | null {
  if (!th) return null;
  const s = String(th);
  if (s.includes("รายเดือน")) return "MONTHLY";
  if (s.includes("รายวัน")) return "DAILY";
  if (s.includes("ฝึก")) return "INTERN";
  return null;
}

function mapGender(title: any): "MALE" | "FEMALE" | null {
  if (!title) return null;
  const s = String(title);
  if (s === "นาย" || s === "Mr.") return "MALE";
  if (s === "นาง" || s === "นางสาว" || s === "Mrs." || s === "Miss") return "FEMALE";
  return null;
}

function sheet<T = any>(wb: XLSX.WorkBook, name: string): T[] {
  const ws = wb.Sheets[name];
  if (!ws) return [];
  return XLSX.utils.sheet_to_json(ws, { defval: null }) as T[];
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function main() {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`IMPORT MODE: ${DRY_RUN ? "DRY RUN (no DB writes)" : "LIVE"}`);
  console.log("=".repeat(60));
  console.log(`Reading: ${FILE}\n`);

  const wb = XLSX.readFile(FILE);

  // =========== 1. Province ===========
  console.log("[1/10] Importing Province...");
  const provinces = sheet(wb, "จังหวัด")
    .map((r: any) => toStr(r["จังหวัด"]))
    .filter((n): n is string => !!n);
  console.log(`  Found ${provinces.length} provinces`);

  if (!DRY_RUN) {
    for (const name of provinces) {
      await prisma.province.upsert({
        where: { name },
        update: {},
        create: { name },
      });
    }
  }
  console.log(`  ✓ Provinces: ${provinces.length}\n`);

  // =========== 2. Hospital ===========
  console.log("[2/10] Importing Hospital...");
  const hosps = sheet(wb, "ชื่อสถานพยาบาล")
    .map((r: any) => toStr(r["สถานพยาบาล"]))
    .filter((n): n is string => !!n);
  console.log(`  Found ${hosps.length} hospitals`);

  if (!DRY_RUN) {
    // clear old seed hospitals first to avoid duplicates
    const existing = await prisma.hospital.findMany({ select: { name: true } });
    const existingNames = new Set(existing.map((h) => h.name));
    const toCreate = hosps.filter((n) => !existingNames.has(n));
    if (toCreate.length > 0) {
      await prisma.hospital.createMany({
        data: toCreate.map((name) => ({ name })),
        skipDuplicates: true,
      });
    }
  }
  console.log(`  ✓ Hospitals: ${hosps.length}\n`);

  // =========== 3. Department (extract from ตำแหน่งงาน) ===========
  console.log("[3/10] Importing Department...");
  const posRows = sheet(wb, "ตำแหน่งงาน");
  const deptSet = new Set<string>();
  posRows.forEach((r: any) => {
    const d = toStr(r["แผนก"]);
    if (d) deptSet.add(d);
  });
  const departments = Array.from(deptSet);
  console.log(`  Found ${departments.length} departments`);

  const deptIdByName: Record<string, string> = {};
  if (!DRY_RUN) {
    for (const name of departments) {
      const d = await prisma.department.upsert({
        where: { name },
        update: {},
        create: { name },
      });
      deptIdByName[name] = d.id;
    }
  } else {
    departments.forEach((d, i) => (deptIdByName[d] = `dept_${i}`));
  }
  console.log(`  ✓ Departments: ${departments.length}\n`);

  // =========== 4. JobPosition ===========
  console.log("[4/10] Importing JobPosition...");
  const posIdByExcelId: Record<string, string> = {};
  let posCount = 0;
  const posToCreate: any[] = [];
  for (const r of posRows as any[]) {
    const excelId = toStr(r["ID"]);
    const title = toStr(r["ตำแหน่งงาน"]);
    const deptName = toStr(r["แผนก"]);
    const company = mapCompany(r["บริษัท"]);
    if (!excelId || !title || !deptName || !company) continue;
    const deptId = deptIdByName[deptName];
    if (!deptId) continue;
    const active = toStr(r["สถานะ"]) !== "OFFLINE";
    const id = `pos_x${excelId}`;
    posIdByExcelId[excelId] = id;
    posToCreate.push({ id, title, departmentId: deptId, company, active });
    posCount++;
  }

  if (!DRY_RUN && posToCreate.length > 0) {
    for (const b of chunk(posToCreate, 100)) {
      await prisma.jobPosition.createMany({ data: b, skipDuplicates: true });
    }
  }
  console.log(`  ✓ JobPositions: ${posCount}\n`);

  // =========== 5. User ===========
  console.log("[5/10] Importing User...");
  const userRows = sheet(wb, "User");
  let userCount = 0;
  for (const r of userRows as any[]) {
    const username = toStr(r["Username"]);
    const rawPw = toStr(r["Password"]);
    const deptName = toStr(r["แผนก"]);
    const status = toStr(r["สถานะ"]);
    if (!username || !rawPw) continue;

    const email = `${username.toLowerCase()}@hrweb.local`;
    const hash = bcrypt.hashSync(rawPw, 10);
    const role = username.toLowerCase().includes("admin")
      ? "ADMIN"
      : deptName && deptName.toUpperCase().includes("HR")
      ? "HR"
      : "MANAGER";

    if (!DRY_RUN) {
      await prisma.user.upsert({
        where: { email },
        update: { username, name: status || username, department: deptName, role },
        create: {
          username,
          email,
          password: hash,
          name: status || username,
          role,
          department: deptName,
          active: true,
        },
      });
    }
    userCount++;
  }
  console.log(`  ✓ Users: ${userCount}\n`);

  // =========== 6. ApplicationForm ===========
  console.log("[6/10] Importing ApplicationForm (main data)...");
  const formRows = sheet(wb, "ใบสมัคร");
  const formIdByExcelId: Record<string, string> = {};
  let formCount = 0;
  let skippedForms = 0;

  for (const r of formRows as any[]) {
    const excelId = toStr(r["ID"]);
    if (!excelId) {
      skippedForms++;
      continue;
    }

    const company = mapCompany(r["บริษัท "]);
    const employeeType = mapEmployeeType(r["ประเภทพนักงาน"]);
    if (!company || !employeeType) {
      skippedForms++;
      continue;
    }

    const fullNameTh = toStr(r["ชื่อ-นามสกุล (ไทย)"]);
    const parts = fullNameTh ? fullNameTh.split(/\s+/) : [];
    const firstNameTh = parts[0] || "(ไม่ระบุ)";
    const lastNameTh = parts.slice(1).join(" ") || "(ไม่ระบุ)";

    const positionExcelId = toStr(r["ตำแหน่งที่ต้องการสมัครงาน"]);
    const positionDbId = positionExcelId ? posIdByExcelId[positionExcelId] : null;
    const positionTitle = toStr(r["ชื่อตำแหน่งที่ต้องการสมัครงาน"]) || "(ไม่ระบุ)";

    const id = `form_x${excelId}`;
    formIdByExcelId[excelId] = id;

    const data: any = {
      id,
      status: "SUBMITTED",
      employeeType,
      company,
      positionId: positionDbId,
      positionTitle,
      applicationCode: excelId,

      sourceOfInfo: toStr(r["ท่านทราบข่าวรับสมัคร"])
        ? [toStr(r["ท่านทราบข่าวรับสมัคร"])!]
        : [],
      referredBy: toStr(r["แนะนำชื่อ"]),
      incomeTypes: toStr(r["แหล่งรายได้ปัจจุบัน"])
        ? [toStr(r["แหล่งรายได้ปัจจุบัน"])!]
        : [],
      currentSalary: toFloat(r["เงินเดือนปัจจุบัน (บาท/เดือน)"]),
      otAllowance: toFloat(r["ค่าโอที (บาท/เดือน)"]),
      shiftAllowance: toFloat(r["ค่ากะ (บาท/เดือน)"]),
      positionAllowance: toFloat(r["ค่าตำแหน่ง (บาท/เดือน)"]),
      foodAllowance: toFloat(r["ค่าอาหาร (บาท/เดือน)"]),
      travelAllowance: toFloat(r["ค่าเดินทาง (บาท/เดือน)"]),
      bonusYearly: toFloat(r["โบนัส (บาท/ปี)"]),
      expectedSalaryMin: toFloat(r["เงินเดือนที่ต้องการ (ต่ำสุด)"]) || toFloat(r["เงินเดือนที่ต้องการ"]),
      expectedSalaryMax: toFloat(r["เงินเดือนที่ต้องการ (สูงสุด)"]),
      availableStartDate: excelDateToJs(r["วันที่สะดวกเริ่มงาน"]),

      titleTh: toStr(r["คำนำหน้า"]),
      firstNameTh,
      lastNameTh,
      titleEn: toStr(r["Name Title"]),
      firstNameEn: toStr(r["ชื่อ-นามสกุล (ภาษาอังกฤษ)"])?.split(/\s+/)[0],
      lastNameEn: toStr(r["ชื่อ-นามสกุล (ภาษาอังกฤษ)"])?.split(/\s+/).slice(1).join(" "),
      nicknameTh: toStr(r["ชื่อเล่น (ไทย)"]),
      nicknameEn: toStr(r["ชื่อเล่น (ภาษาอังกฤษ)"]),
      phone: toStr(r["โทรศัพท์"]),
      dateOfBirth: excelDateToJs(r["วัน/เดือน/ปีเกิด"]),
      age: toInt(r["อายุ"]),
      nationality: toStr(r["สัญชาติ"]),
      ethnicity: toStr(r["เชื้อชาติ"]),
      religion: toStr(r["ศาสนา"]),
      height: toFloat(r["ส่วนสูง"]),
      weight: toFloat(r["น้ำหนัก"]),
      email: toStr(r["E-mail"]),
      lineId: toStr(r["ID Line"]),
      currentAddress: toStr(r["ที่อยู่ปัจจุบัน"]),
      permanentAddress: toStr(r["ที่อยู่ตามทะเบียนบ้าน"]),
      socialSecurityStatus: toStr(r["สิทธิประกันสังคม"]),
      hospitalWithSS: toStr(r["บัตรรับรองสิทธิกับโรงพยาบาล"]),
      hospitalWithSSOther: toStr(r["โปรดระบุ"]),
      hospitalNoSS: toStr(r["ระบุโรงพยาบาล"]),
      hospitalNoSSOther: toStr(r["โปรดระบุ."]),
      maritalStatus: toStr(r["สถานะทางครอบครัว"]),
      spouseTitle: toStr(r["คำนำหน้า 2"]),
      spouseName: toStr(r["ชื่อ-นามสกุลคู่สมรส"]),
      spouseOccupation: toStr(r["อาชีพคู่สมรส"]),
      spouseWorkplace: toStr(r["สถานที่ทำงานคู่สมรส"]),
      spousePhone: toStr(r["เบอร์โทรศัพท์คู่สมรส"]),
      numChildren: toInt(r["จำนวนบุตร"]),
      fatherTitle: toStr(r["คำนำหน้า 3"]),
      fatherName: toStr(r["ชื่อ-นามสกุล (บิดา)"]),
      fatherStatus: toStr(r["บิดา"]),
      fatherAge: toInt(r["อายุบิดา"]),
      fatherOccupation: toStr(r["อาชีพบิดา"]),
      fatherPhone: toStr(r["เบอร์โทรบิดา"]),
      motherTitle: toStr(r["คำนำหน้า 4"]),
      motherName: toStr(r["ชื่อ-นามสกุล (มารดา)"]),
      motherStatus: toStr(r["มารดา"]),
      motherAge: toInt(r["อายุมารดา"]),
      motherOccupation: toStr(r["อาชีพมารดา"]),
      motherPhone: toStr(r["เบอร์โทรมารดา"]),
      siblings: toInt(r["พี่น้องร่วมบิดามารดารวมผู้สมัคร"]),
      childOrder: toInt(r["ท่านเป็นลูกคนที่"]),

      educationLevels: toStr(r["ระดับการศึกษา"]) ? [toStr(r["ระดับการศึกษา"])!] : [],
      educationData: {},

      computerSkills: toStr(r["คอมพิวเตอร์"])
        ? String(r["คอมพิวเตอร์"]).split(/\s*,\s*/).filter(Boolean)
        : [],
      excelSkills: toStr(r["ทักษะการใช้ Excel "])
        ? String(r["ทักษะการใช้ Excel "]).split(/\s*,\s*/).filter(Boolean)
        : [],
      wordSkills: toStr(r["ทักษะการใช้ Word "])
        ? String(r["ทักษะการใช้ Word "]).split(/\s*,\s*/).filter(Boolean)
        : [],
      powerpointSkills: toStr(r["ทักษะการใช้ Power Point "])
        ? String(r["ทักษะการใช้ Power Point "]).split(/\s*,\s*/).filter(Boolean)
        : [],
      photoshopSkills: toStr(r["ทักษะการใช้ Photoshop "])
        ? String(r["ทักษะการใช้ Photoshop "]).split(/\s*,\s*/).filter(Boolean)
        : [],
      otherSkills: toStr(r["อื่นๆ "]),

      canDriveCar: toStr(r["ขับรถยนต์"]),
      carLicenseNumber: toStr(r["เลขที่ใบขับขี่รถยนต์"]),
      hasCar: toStr(r["ท่านมีรถยนต์หรือไม่"]),
      carPlate: toStr(r["ทะเบียนรถยนต์"]),
      canDriveMotorcycle: toStr(r["ขับรถมอเตอร์ไซด์"]),
      motorcycleLicenseNumber: toStr(r["เลขที่ใบขับขี่ "]),
      hasMotorcycle: toStr(r["ท่านมีรถมอเตอร์ไซด์หรือไม่"]),
      motorcyclePlate: toStr(r["ทะเบียน"]),
      firedForMisconduct: toStr(r["ท่านเคยถูกไล่ออก ปลดออก หรือให้ออกจากงาน เพราะทุจริตต่อหน้าที่หรือไม่"]),
      firedReason: toStr(r["เหตุผลเพราะ"]),

      smoke: toStr(r["ท่านสูบบุหรี่หรือไม่"]),
      smokeReason: toStr(r["ระบุเหตุผล (ถ้ามี) บุหรี่"]),
      smokeFrequency: toStr(r["ความถี่ในการสูบบุหรี่"]),
      alcohol: toStr(r["ท่านดื่มสุราหรือไม่"]),
      alcoholReason: toStr(r["ระบุเหตุผล (ถ้ามี) สุรา"]),
      alcoholFrequency: toStr(r["ความถี่ในการดื่มสุรา"]),
      drugs: toStr(r["ท่านเคยมีประวัติการใช้ยาเสพติดหรือไม่"]),
      drugsReason: toStr(r["ระบุเหตุผล (ถ้ามี) ยาเสพติด"]),
      seriousInjury: toStr(r["ท่านเคยมีส่วนไหนของร่างกายหัก/แตกแบบรุนแรงหรือไม่"]),
      injuryDetail: toStr(r["ระบุส่วนที่ได้รับบาดเจ็บ"]),
      chronicDisease: toStr(r["ท่านมีโรคประจำตัวหรือการเจ็บป่วยเรื้อรังหรือไม่"]),
      chronicDiseaseDetail: toStr(r["ระบุโรคประจำตัวหรือการเจ็บป่วยเรื้อรัง"]),

      emTitle1: toStr(r["คำนำหน้า 5"]),
      emName1: toStr(r["บุคคลที่ติดต่อได้"]),
      emRelation1: toStr(r["เกี่ยวข้องกับผู้สมัคร"]),
      emPhone1: toStr(r["เบอร์โทรศัพท์ผู้ติดต่อฉุกเฉิน"]),
      emTitle2: toStr(r["คำนำหน้า 5.1"]),
      emName2: toStr(r["บุคคลที่ติดต่อได้1"]),
      emRelation2: toStr(r["เกี่ยวข้องกับผู้สมัคร1"]),
      emPhone2: toStr(r["เบอร์โทรศัพท์ผู้ติดต่อฉุกเฉิน1"]),
      allowPrevEmployerContact: toStr(r["ท่านจะขัดข้องหรือไม่ "]),
      allowPrevEmployerReason: toStr(r["เพราะ"]),

      consent1: toStr(r["ท่านยินยอมหรือไม่"]),
      consentSignerTitle: toStr(r["คำนำหน้า 7"]),
      consentSignerName: toStr(r["ชื่อ-นามสกุล 1"]),
      consent2: toStr(r["ท่านยินยอมหรือไม่ 2"]),

      photoUrl: toStr(r["รูปถ่ายผู้สมัคร (หน้าตรง)"]),
      resumeUrl: toStr(r["Resume"]),

      submittedAt: excelDateToJs(r["วันที่สมัคร"]),
    };

    if (!DRY_RUN) {
      try {
        await prisma.applicationForm.upsert({
          where: { id },
          update: data,
          create: data,
        });
      } catch (e: any) {
        console.error(`  ! Error importing form ${excelId}:`, e.message);
        continue;
      }
    }
    formCount++;
    if (formCount % 100 === 0) console.log(`    ... ${formCount}`);
  }
  console.log(`  ✓ ApplicationForms: ${formCount} (skipped: ${skippedForms})\n`);

  // =========== 7. TrainingItem ===========
  console.log("[7/10] Importing TrainingItem...");
  const trRows = sheet(wb, "หลักสูตร");
  let trCount = 0;
  const trToCreate: any[] = [];
  for (const r of trRows as any[]) {
    const key = toStr(r["Key"]);
    const courseName = toStr(r["หลักสูตรที่อบรม"]);
    if (!key || !courseName) continue;
    const formId = formIdByExcelId[key];
    if (!formId) continue;
    trToCreate.push({
      id: `tr_${toStr(r["ID"]) || Math.random().toString(36).slice(2, 10)}`,
      formId,
      courseName,
      institution: toStr(r["สถานที่จัดอบรม"]),
      duration: toStr(r["ระยะเวลา"]) ? `${toStr(r["ระยะเวลา"])} ${toStr(r["หน่วย"]) || ""}`.trim() : null,
      certificate: false,
    });
    trCount++;
  }
  if (!DRY_RUN && trToCreate.length > 0) {
    for (const b of chunk(trToCreate, 200)) {
      await prisma.trainingItem.createMany({ data: b, skipDuplicates: true });
    }
  }
  console.log(`  ✓ TrainingItems: ${trCount}\n`);

  // =========== 8. WorkExperienceItem ===========
  console.log("[8/10] Importing WorkExperienceItem...");
  const weRows = sheet(wb, "ประสบการณ์ทำงาน");
  let weCount = 0;
  const weToCreate: any[] = [];
  for (const r of weRows as any[]) {
    const key = toStr(r["Key"]);
    const company = toStr(r["บริษัท "]);
    if (!key || !company) continue;
    const formId = formIdByExcelId[key];
    if (!formId) continue;
    weToCreate.push({
      id: `we_${toStr(r["ID"]) || Math.random().toString(36).slice(2, 10)}`,
      formId,
      company,
      position: toStr(r["ตำแหน่งงาน"]) || "(ไม่ระบุ)",
      reasonForLeaving: toStr(r["สาเหตุที่ออก"]),
      responsibilities: toStr(r["หน้าที่ที่รับผิดชอบ (พอสังเขป)"]),
    });
    weCount++;
  }
  if (!DRY_RUN && weToCreate.length > 0) {
    for (const b of chunk(weToCreate, 200)) {
      await prisma.workExperienceItem.createMany({ data: b, skipDuplicates: true });
    }
  }
  console.log(`  ✓ WorkExperienceItems: ${weCount}\n`);

  // =========== 9. LanguageItem ===========
  console.log("[9/10] Importing LanguageItem...");
  const langRows = sheet(wb, "ความรู้ด้านภาษา");
  let langCount = 0;
  const langToCreate: any[] = [];
  for (const r of langRows as any[]) {
    const key = toStr(r["KEY"]);
    const language = toStr(r["ภาษา"]);
    if (!key || !language) continue;
    const formId = formIdByExcelId[key];
    if (!formId) continue;
    langToCreate.push({
      id: `lang_${toStr(r["ID"]) || Math.random().toString(36).slice(2, 10)}`,
      formId,
      language,
      speaking: toStr(r["พูด"]),
      reading: toStr(r["อ่าน"]),
      writing: toStr(r["เขียน"]),
      listening: toStr(r["ฟัง"]),
    });
    langCount++;
  }
  if (!DRY_RUN && langToCreate.length > 0) {
    for (const b of chunk(langToCreate, 200)) {
      await prisma.languageItem.createMany({ data: b, skipDuplicates: true });
    }
  }
  console.log(`  ✓ LanguageItems: ${langCount}\n`);

  // =========== 10. InterviewEvaluation & ProbationEvaluation ===========
  console.log("[10/10] Importing Evaluations...");
  const ieRows = sheet(wb, "ใบสัมภาษณ์");
  let ieCount = 0;
  const ieToCreate: any[] = [];
  for (const r of ieRows as any[]) {
    const key = toStr(r["ใบสมัคร"]);
    if (!key) continue;
    const formId = formIdByExcelId[key];
    if (!formId) continue;
    ieToCreate.push({
      id: `ie_${toStr(r["ID"]) || Math.random().toString(36).slice(2, 10)}`,
      formId,
      evaluationDate: excelDateToJs(r["วันที่"]) || new Date(),
      round: 1,
      overallScore: toInt(r["รวมคะแนน"]),
      notes: toStr(r["ความคิดเห็นเพิ่มเติม"]),
    });
    ieCount++;
  }
  if (!DRY_RUN && ieToCreate.length > 0) {
    for (const b of chunk(ieToCreate, 100)) {
      await prisma.interviewEvaluation.createMany({ data: b, skipDuplicates: true });
    }
  }

  const peRows = sheet(wb, "ใบประเมิน");
  let peCount = 0;
  const peToCreate: any[] = [];
  for (const r of peRows as any[]) {
    const key = toStr(r["ใบสมัคร"]);
    if (!key) continue;
    const formId = formIdByExcelId[key];
    if (!formId) continue;
    peToCreate.push({
      id: `pe_${toStr(r["ID"]) || Math.random().toString(36).slice(2, 10)}`,
      formId,
      evaluationDate: new Date(),
      round: 1,
      overallScore: toInt(r["รวมคะแนนเฉลี่ย"]),
      result: toStr(r["ผลการประเมิน"]),
    });
    peCount++;
  }
  if (!DRY_RUN && peToCreate.length > 0) {
    for (const b of chunk(peToCreate, 100)) {
      await prisma.probationEvaluation.createMany({ data: b, skipDuplicates: true });
    }
  }
  console.log(`  ✓ InterviewEvaluations: ${ieCount}`);
  console.log(`  ✓ ProbationEvaluations: ${peCount}\n`);

  console.log("=".repeat(60));
  console.log("IMPORT COMPLETE ✓");
  console.log("=".repeat(60));
  console.log(`
  Provinces:          ${provinces.length}
  Hospitals:          ${hosps.length}
  Departments:        ${departments.length}
  JobPositions:       ${posCount}
  Users:              ${userCount}
  ApplicationForms:   ${formCount} (skipped ${skippedForms})
  TrainingItems:      ${trCount}
  WorkExperiences:    ${weCount}
  Languages:          ${langCount}
  InterviewEvals:     ${ieCount}
  ProbationEvals:     ${peCount}
  `);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
