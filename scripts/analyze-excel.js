const XLSX = require("xlsx");
const path = require("path");

const filePath = path.join(__dirname, "..", "ใบสมัคร Comets - ICT. (1).xlsx");
console.log("Reading:", filePath);

const wb = XLSX.readFile(filePath);
const sheets = wb.SheetNames;

console.log(`\n=== Total Sheets: ${sheets.length} ===\n`);

sheets.forEach((name, i) => {
  const ws = wb.Sheets[name];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
  const dataRows = rows.filter((r) => r.some((c) => c !== null && c !== ""));
  const headers = rows[0] || [];

  console.log(`[${i + 1}] "${name}"`);
  console.log(`    Rows: ${dataRows.length - 1} (data) | Columns: ${headers.length}`);
  const headerStr = headers
    .slice(0, 8)
    .filter(Boolean)
    .map((h) => String(h).slice(0, 20))
    .join(" | ");
  console.log(`    Headers: ${headerStr}${headers.length > 8 ? " ..." : ""}`);
  console.log("");
});
