import XLSX from "xlsx";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const FILE = path.join(__dirname, "..", "ใบสมัคร Comets - ICT. (1).xlsx");

async function main() {
  const wb = XLSX.readFile(FILE);
  const rows = XLSX.utils.sheet_to_json(wb.Sheets["Email"], { defval: null }) as any[];
  let count = 0;

  for (const r of rows) {
    const name = (r["ชื่อ"] || "").trim();
    const nickname = (r["ชื่อเล่น"] || "").trim();
    const email = (r["อีเมล"] || "").trim();
    if (!name && !nickname) continue;

    const id = `rev_${count + 1}`;
    await (prisma as any).reviewer.upsert({
      where: { id },
      update: { name, nickname, email },
      create: { id, name, nickname, email, active: true },
    });
    count++;
  }
  console.log(`✓ Imported ${count} reviewers`);
}

main().then(() => prisma.$disconnect()).catch(async e => { console.error(e); await prisma.$disconnect(); process.exit(1); });
