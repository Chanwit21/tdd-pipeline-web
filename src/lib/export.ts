export function downloadCsv(filename: string, rows: unknown[][]) {
  const cell = (v: unknown) => {
    let s = v == null ? "" : String(v);
    // Prevent spreadsheet formulas from user-entered text.
    if (typeof v !== "number" && /^[\s]*[=+@-]/.test(s)) s = "'" + s;
    return '"' + s.replace(/"/g, '""') + '"';
  };
  const blob = new Blob(["\uFEFF", rows.map(r => r.map(cell).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
