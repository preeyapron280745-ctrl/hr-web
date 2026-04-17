const XLSX = require("xlsx");
const path = require("path");
const wb = XLSX.readFile(path.join(__dirname, "..", "ใบสมัคร Comets - ICT. (1).xlsx"));
const ws = wb.Sheets["ถังพัก"];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
const headers = (rows[0] || []).map((h, i) => {
  const sample = rows[1] ? rows[1][i] : null;
  return { i, col: h ? String(h).slice(0, 40) : "", sample: sample ? String(sample).slice(0, 40) : "" };
});
headers.filter(h => h.col).forEach(h => {
  console.log(`[${h.i}] "${h.col}" → "${h.sample}"`);
});
