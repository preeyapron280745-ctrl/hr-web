import XLSX from "xlsx";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const FILE = path.join(__dirname, "..", "ใบสมัคร Comets - ICT. (1).xlsx");

function toStr(v: any): string | null {
  if (v == null || v === "") return null;
  return String(v).trim() || null;
}

function mapCompany(th: any): "COMETS_HQ" | "COMETS_FACTORY" | "ICT" | null {
  if (!th) return null;
  const s = String(th);
  if (s.includes("Head") || s.includes("Hea")) return "COMETS_HQ";
  if (s.includes("Factory")) return "COMETS_FACTORY";
  if (s.includes("ICT") || s.includes("ไอซีที")) return "ICT";
  return null;
}

async function main() {
  console.log("Reading ตำแหน่งงาน...");
  const wb = XLSX.readFile(FILE);
  const rows = XLSX.utils.sheet_to_json(wb.Sheets["ตำแหน่งงาน"], { defval: null }) as any[];
  console.log(`Total rows: ${rows.length}`);

  // Ensure all departments exist
  const deptSet = new Set<string>();
  rows.forEach((r) => { const d = toStr(r["แผนก"]); if (d) deptSet.add(d); });

  const deptIdByName: Record<string, string> = {};
  for (const name of Array.from(deptSet)) {
    const d = await prisma.department.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    deptIdByName[name] = d.id;
  }
  console.log(`Departments: ${Object.keys(deptIdByName).length}`);

  let created = 0;
  let skipped = 0;
  let updated = 0;

  for (const r of rows) {
    const excelId = toStr(r["ID"]);
    const title = toStr(r["ตำแหน่งงาน"]) || toStr(r["ตำแหน่งในระบบ"]);
    const deptName = toStr(r["แผนก"]);
    const company = mapCompany(r["บริษัท"]);
    const statusStr = toStr(r["สถานะ"]);
    const active = statusStr !== "OFFLINE";
    const empType = toStr(r["ประเภทพนักงาน"]);
    const head1 = toStr(r["หัวหน้าแผนก คนที่ 1"]);
    const head2 = toStr(r["หัวหน้าแผนก คนที่ 2"]);

    if (!title) {
      skipped++;
      continue;
    }

    // Use department or create default
    const deptId = deptName
      ? deptIdByName[deptName]
      : deptIdByName["อื่นๆ"] || (await prisma.department.upsert({
          where: { name: "อื่นๆ" },
          update: {},
          create: { name: "อื่นๆ" },
        })).id;

    if (!deptId) {
      skipped++;
      continue;
    }

    const id = excelId ? `pos_x${excelId}` : `pos_auto_${Math.random().toString(36).slice(2, 10)}`;

    try {
      await prisma.jobPosition.upsert({
        where: { id },
        update: { title, departmentId: deptId, company, active },
        create: { id, title, departmentId: deptId, company, active },
      });
      created++;
    } catch (e: any) {
      // Might be duplicate — try without ID
      try {
        const existing = await prisma.jobPosition.findFirst({
          where: { title, company },
        });
        if (existing) {
          await prisma.jobPosition.update({
            where: { id: existing.id },
            data: { departmentId: deptId, active },
          });
          updated++;
        } else {
          await prisma.jobPosition.create({
            data: { title, departmentId: deptId, company, active },
          });
          created++;
        }
      } catch (e2: any) {
        console.error(`  ! Skip "${title}": ${e2.message}`);
        skipped++;
      }
    }
  }

  console.log(`\n✓ Created/Upserted: ${created} | Updated: ${updated} | Skipped: ${skipped}`);

  // Final count
  const total = await prisma.jobPosition.count();
  console.log(`Total positions in DB: ${total}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
