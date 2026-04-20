import XLSX from "xlsx";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const FILE = path.join(__dirname, "..", "ใบสมัคร Comets - ICT. (1).xlsx");

function toStr(v: any): string | null {
  if (v == null || v === "") return null;
  return String(v).trim() || null;
}

function mapEmployeeType(th: any): string | null {
  if (!th) return null;
  const s = String(th);
  if (s.includes("รายเดือน")) return "MONTHLY";
  if (s.includes("รายวัน")) return "DAILY";
  if (s.includes("ฝึก")) return "INTERN";
  return null;
}

async function main() {
  const wb = XLSX.readFile(FILE);
  const rows = XLSX.utils.sheet_to_json(wb.Sheets["ตำแหน่งงาน"], { defval: null }) as any[];

  let updated = 0;
  for (const r of rows) {
    const excelId = toStr(r["ID"]);
    const empType = mapEmployeeType(r["ประเภทพนักงาน"]);
    if (!excelId || !empType) continue;
    const id = `pos_x${excelId}`;
    try {
      await (prisma as any).jobPosition.update({
        where: { id },
        data: { employeeType: empType },
      });
      updated++;
    } catch {}
  }
  console.log(`✓ Updated employeeType for ${updated} positions`);
}

main().then(() => prisma.$disconnect()).catch(async e => { console.error(e); await prisma.$disconnect(); process.exit(1); });
