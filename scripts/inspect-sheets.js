const XLSX = require("xlsx");
const path = require("path");

const filePath = path.join(__dirname, "..", "ใบสมัคร Comets - ICT. (1).xlsx");
const wb = XLSX.readFile(filePath);

const target = [
  "User",
  "ตำแหน่งงาน",
  "ใบสมัคร",
  "หลักสูตร",
  "ประสบการณ์ทำงาน",
  "ความรู้ด้านภาษา",
  "ใบสัมภาษณ์",
  "ใบประเมิน",
  "ชื่อสถานพยาบาล",
  "จังหวัด",
];

target.forEach((name) => {
  const ws = wb.Sheets[name];
  if (!ws) {
    console.log(`NOT FOUND: ${name}`);
    return;
  }
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
  const headers = (rows[0] || []).map((h) => (h == null ? "" : String(h)));
  const firstData = rows[1] || [];

  console.log("=".repeat(80));
  console.log(`SHEET: ${name}`);
  console.log(`Total rows: ${rows.length - 1}`);
  console.log("-".repeat(80));
  console.log("COLUMNS:");
  headers.forEach((h, i) => {
    const sample = firstData[i];
    const sampleStr =
      sample == null
        ? "(null)"
        : typeof sample === "string"
        ? sample.slice(0, 40)
        : String(sample).slice(0, 40);
    console.log(`  [${i}] "${h}" → "${sampleStr}"`);
  });
  console.log("");
});
