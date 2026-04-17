const XLSX = require("xlsx");
const path = require("path");
const wb = XLSX.readFile(path.join(__dirname, "..", "ใบสมัคร Comets - ICT. (1).xlsx"));
const rows = XLSX.utils.sheet_to_json(wb.Sheets["Email"], { defval: null });
console.log(`Rows: ${rows.length}`);
const headers = Object.keys(rows[0] || {}).filter(k => k);
console.log("Columns:", headers.join(" | "));
console.log("\nFirst 5 rows:");
rows.slice(0, 5).forEach((r, i) => {
  console.log(`[${i}] ชื่อ: ${r["ชื่อ"]} | ชื่อเล่น: ${r["ชื่อเล่น"]} | อีเมล: ${r["อีเมล"]}`);
});
console.log("\nAll names:");
rows.forEach(r => {
  if (r["ชื่อ"] || r["ชื่อเล่น"]) console.log(`  ${r["ชื่อเล่น"] || ""} — ${r["ชื่อ"] || ""} — ${r["อีเมล"] || ""}`);
});
