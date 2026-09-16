"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useMasterConfig, useClosedYears } from "@/lib/hooks";
import { stagesForStatuses, withStatusFilter } from "@/lib/validation";
import { formatAmount } from "@/lib/format";
import { downloadCsv } from "@/lib/export";
import { PageHead, Field, Select, Subtabs } from "@/components/ui";
import { MultiCheckbox } from "@/components/MultiCheckbox";
import type { PivotReport } from "@/lib/types";
type ReportKey = "pr-by-team" | "smt-qbr" | "pipeline-by-team";
const TABS: { value: ReportKey; label: string }[] = [{ value: "pr-by-team", label: "PR by Team" }, { value: "smt-qbr", label: "SMT QBR" }, { value: "pipeline-by-team", label: "Pipeline by Team" }];
const DESC = { "pr-by-team": "Sum of Amount — Deal Status = PR, Closed Date", "smt-qbr": "Sum of Amount — Probability × Deal Stage", "pipeline-by-team": "Sum of Amount — Department × Closed Date" };
const INITIAL = { year: String(new Date().getFullYear()), departmentId: [] as string[], dealStatus: [] as string[], probability: [] as string[], dealStage: [] as string[] };
export function ReportPage({ report }: { report: ReportKey }) {
  const { user } = useAuth(); const { config } = useMasterConfig(); const closedYears = useClosedYears(); const router = useRouter();
  const [draft, setDraft] = useState(INITIAL); const [filters, setFilters] = useState(INITIAL);
  const [tick, setTick] = useState(0); const [data, setData] = useState<PivotReport | null>(null);
  const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const admin = user?.role === "ADMIN";
  const stageNames = config ? stagesForStatuses(draft.dealStatus, config) : [];
  const stageOpts = stageNames.map((name) => ({ value: name, label: name }));
  useEffect(() => {
    let current = true; setLoading(true); setError("");
    api<PivotReport>(`/api/reports/${report}`, { query: {
      year: filters.year, departmentId: admin ? filters.departmentId : undefined,
      dealStatus: report !== "pr-by-team" ? filters.dealStatus : undefined,
      probability: report === "pipeline-by-team" ? filters.probability : undefined,
      dealStage: report === "pipeline-by-team" ? filters.dealStage : undefined,
    } }).then(d => { if (current) setData(d); }).catch(e => { if (current) { setError(e.message); setData(null); } }).finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [report, filters, tick, admin]);
  useEffect(() => {
    if (!closedYears.length || closedYears.some(y => String(y) === draft.year)) return;
    const y = String(closedYears[0]);
    setDraft(d => ({ ...d, year: y }));
    setFilters(f => ({ ...f, year: y }));
  }, [closedYears, draft.year]);
  function exportReport() {
    if (!data) return;
    const rows: unknown[][] = [["No.", data.rowHeader, ...data.columns, "Grand Total"], ...data.rows.map((r, i) => [i + 1, r.label, ...data.columns.map(c => r.values[c]), r.total])];
    if (report !== "pr-by-team") rows.push(["", "Grand Total", ...data.columns.map(c => data.columnTotals[c]), data.grandTotal]);
    downloadCsv(`${report}-${filters.year}.csv`, rows);
  }
  return <div className="stack">
    <PageHead title="Report" subtitle={DESC[report]} />
    <Subtabs value={report} onChange={r => router.push(`/reports/${r}`)} items={TABS} style={{ marginBottom: 16 }} />
    <div className="panel">
      <form
        className="filter-grid report-filters"
        onSubmit={(e) => { e.preventDefault(); if (/^\d{4}$/.test(draft.year)) { setFilters(draft); setTick(t => t + 1); } }}
      >
        <Field label="ปี (Closed Date)"><Select value={draft.year} onChange={v => setDraft({ ...draft, year: v })} options={closedYears.map(y => ({ value: String(y), label: String(y) }))} /></Field>
        {admin && <Field label="Department"><MultiCheckbox label="Department" value={draft.departmentId} onChange={v => setDraft({ ...draft, departmentId: v })} options={(config?.departments ?? []).map(d => ({ value: String(d.id), label: d.code }))} /></Field>}
        {report === "pipeline-by-team" && <Field label="Probability"><MultiCheckbox label="Probability" value={draft.probability} onChange={v => setDraft({ ...draft, probability: v })} options={(config?.probabilities ?? []).map(p => ({ value: p.probability, label: p.probability }))} /></Field>}
        {report !== "pr-by-team" && <Field label="Deal Status"><MultiCheckbox label="Deal Status" value={draft.dealStatus} onChange={v => setDraft(d => withStatusFilter(d, v, config))} options={(config?.dealStatuses ?? []).map(s => ({ value: s, label: s }))} /></Field>}
        {report === "pipeline-by-team" && <Field label="Deal Stage"><MultiCheckbox label="Deal Stage" value={draft.dealStage} onChange={v => setDraft({ ...draft, dealStage: v })} options={stageOpts} /></Field>}
        <div className="filter-buttons">
          <button type="submit" className="btn btn-primary btn-sm" disabled={!/^\d{4}$/.test(draft.year)}>ค้นหา</button>
          <button type="button" className="btn btn-sm" disabled={loading || !data} onClick={exportReport}>↓ Export</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setDraft(INITIAL); setFilters(INITIAL); }}>ล้างค่า</button>
        </div>
      </form>
      {error && <div className="warn-banner" role="alert">{error}</div>}
      <div className="table-wrap" style={{ padding: "0 18px 18px" }}><table className="pivot">
        <thead><tr><th className="col-no">No.</th><th>{data?.rowHeader ?? "Department"}</th>{data?.columns.map(c => <th key={c}>{c}</th>)}<th>Grand Total</th></tr></thead>
        <tbody>
          {loading ? <tr className="empty-row"><td colSpan={(data?.columns.length ?? 0) + 3}>กำลังโหลด…</td></tr> : <>
            {!data?.rows.length && <tr className="empty-row"><td colSpan={(data?.columns.length ?? 0) + 3}>ไม่พบข้อมูลตามเงื่อนไข</td></tr>}
            {data?.rows.map((r, i) => <tr key={r.label}><td className="col-no">{i + 1}</td><td>{r.label}</td>{data.columns.map(c => <td className="num" key={c}>{r.values[c] ? formatAmount(r.values[c]) : "—"}</td>)}<td className="num grand">{r.total ? formatAmount(r.total) : "—"}</td></tr>)}
            {data && report !== "pr-by-team" && <tr className="total"><td className="col-no"></td><td>Grand Total</td>{data.columns.map(c => <td className="num" key={c}>{data.columnTotals[c] ? formatAmount(data.columnTotals[c]) : "—"}</td>)}<td className="num grand">{formatAmount(data.grandTotal)}</td></tr>}
          </>}
        </tbody>
      </table></div>
    </div>
  </div>;
}
