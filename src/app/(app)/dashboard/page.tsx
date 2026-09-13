"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useMasterConfig, useCreatedYears } from "@/lib/hooks";
import { formatAmount, formatMonth } from "@/lib/format";
import { downloadCsv } from "@/lib/export";
import { PageHead, Panel, Field, Select, Badge } from "@/components/ui";
import { MultiCheckbox } from "@/components/MultiCheckbox";
import { IcoDownload } from "@/components/icons";
interface Summary {
  statCards: { totalPipelineAmount: number; bestCaseAmount: number; wonAmount: number; activeDealCount: number };
  overdue: { id: number; recordId: string; customer: string; dealName: string; department: string; dealOwner: string; closedDate: string; amount: number }[];
  byDepartment: { department: string; dealCount: number; amount: number; bestCase: number; wonAmount: number }[];
  byYear: { year: number; dealCount: number; amount: number }[];
}
const INITIAL = { departmentId: [] as string[], probability: [] as string[], dealStatus: [] as string[], createdYear: "", quarter: "" };
export default function DashboardPage() {
  const { user } = useAuth(); const { config } = useMasterConfig(); const createdYears = useCreatedYears(); const router = useRouter();
  const [draft, setDraft] = useState(INITIAL); const [filters, setFilters] = useState(INITIAL);
  const [data, setData] = useState<Summary | null>(null); const [error, setError] = useState(""); const [loading, setLoading] = useState(true);
  useEffect(() => {
    let current = true; setLoading(true); setError("");
    api<Summary>("/api/dashboard/summary", { query: { ...filters, departmentId: user?.role === "ADMIN" ? filters.departmentId : undefined } })
      .then(d => { if (current) setData(d); }).catch(e => { if (current) { setData(null); setError(e.message); } }).finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [filters, user?.role]);
  function exportSummary() {
    if (!data) return;
    downloadCsv("dashboard-summary.csv", [
      ["Created Year", filters.createdYear || "All", "Quarter", filters.quarter || "All"],
      ["Metric", "Amount / Count"], ["Total Pipeline Amount", data.statCards.totalPipelineAmount], ["Best Case Amount", data.statCards.bestCaseAmount], ["Won / PO this month", data.statCards.wonAmount], ["Overdue Follow Up", data.overdue.length], [],
      ["Department", "Active Deals", "Sum of Amount", "Best Case", "Won / PO this month"], ...data.byDepartment.map(r => [r.department, r.dealCount, r.amount, r.bestCase, r.wonAmount]), [],
      ["Created Year (all years within department/status/probability filters)", "Deals", "Amount"], ...data.byYear.map(r => [r.year, r.dealCount, r.amount]), [],
      ["Overdue Record ID", "Customer", "Deal Name", "Department", "Deal Owner", "Closed Date", "Amount"], ...data.overdue.map(r => [r.recordId, r.customer, r.dealName, r.department, r.dealOwner, formatMonth(r.closedDate), r.amount]),
    ]);
  }
  const s = data?.statCards;
  return <div className="stack">
    <PageHead title="Dashboard" subtitle={user?.role === "ADMIN" ? "ภาพรวม Sales Pipeline ทุกแผนก" : `ภาพรวม Sales Pipeline แผนก ${user?.departmentCode}`} actions={<button className="btn" disabled={loading || !data} onClick={exportSummary}><IcoDownload size={14} /> Export สรุป</button>} />
    <div className="panel">
      <div className="filter-title">ตัวกรอง Dashboard</div>
      <form
        className="filter-grid report-filters"
        style={{ paddingBottom: 18 }}
        onSubmit={(e) => { e.preventDefault(); setFilters(draft); }}
      >
        {user?.role === "ADMIN" && <Field label="Department"><MultiCheckbox label="Department" value={draft.departmentId} onChange={v => setDraft({ ...draft, departmentId: v })} options={(config?.departments ?? []).map(d => ({ value: String(d.id), label: d.code }))} /></Field>}
        <Field label="Deal Status"><MultiCheckbox label="Deal Status" value={draft.dealStatus} onChange={v => setDraft({ ...draft, dealStatus: v })} options={(config?.dealStatuses ?? []).map(s => ({ value: s, label: s }))} /></Field>
        <Field label="Probability"><MultiCheckbox label="Probability" value={draft.probability} onChange={v => setDraft({ ...draft, probability: v })} options={(config?.probabilities ?? []).map(p => ({ value: p.probability, label: p.probability }))} /></Field>
        <Field label="ปีที่สร้าง (Created Date)"><Select value={draft.createdYear} onChange={v => setDraft({ ...draft, createdYear: v })} all="ทุกปี" options={createdYears.map(y => ({ value: String(y), label: String(y) }))} /></Field>
        <Field label="ไตรมาสที่สร้าง"><Select value={draft.quarter} onChange={v => setDraft({ ...draft, quarter: v })} all="ทุกไตรมาส" options={[1,2,3,4].map(q => ({ value: String(q), label: `Q${q}` }))} /></Field>
        <div className="filter-buttons"><button type="submit" className="btn btn-primary btn-sm">กรอง</button><button type="button" className="btn btn-ghost btn-sm" onClick={() => { setDraft(INITIAL); setFilters(INITIAL); }}>ล้างค่า</button></div>
      </form>
    </div>
    {error && <div className="warn-banner" role="alert">{error}</div>}
    {loading ? <div className="panel panel-body">กำลังโหลด…</div> : <>
      <div className="kpi-grid">
        <Kpi icon="฿" tone="info" label="Total Pipeline Amount" value={formatAmount(s?.totalPipelineAmount)} sub={`รวม ${s?.activeDealCount ?? 0} ดีล Active`} />
        <Kpi icon="✓" tone="success" label="Best Case Amount" value={formatAmount(s?.bestCaseAmount)} sub="Probability 75% ขึ้นไป" />
        <Kpi icon="🏆" tone="accent" label="Won / PO เดือนนี้" value={formatAmount(s?.wonAmount)} sub="Closed Date เดือนปัจจุบัน ภายใต้ตัวกรอง" />
        <Kpi icon="!" tone="danger" label="Overdue Follow Up" value={String(data?.overdue.length ?? 0)} sub="ดีลที่ต้องติดตาม" />
      </div>
      <Panel title="Deal ที่เลย Closed Date (Overdue)" extra={<Badge tone="danger">{data?.overdue.length ?? 0} รายการ</Badge>} bodyPad={false}>
        <div className="table-wrap"><table><thead><tr><th className="col-no">No.</th><th>Record ID</th><th>ลูกค้า</th><th>Deal Name</th><th>Department</th><th>Deal Owner</th><th>Closed Date</th><th className="amount-cell">Amount</th><th /></tr></thead><tbody>
          {data?.overdue.map((r,i) => <tr key={r.id}><td className="col-no">{i+1}</td><td className="cell-strong cell-accentbar">{r.recordId}</td><td>{r.customer}</td><td className="ellipsis" title={r.dealName}>{r.dealName}</td><td><Badge tone="slate">{r.department}</Badge></td><td>{r.dealOwner}</td><td className="date-cell">{formatMonth(r.closedDate)}</td><td className="num">{formatAmount(r.amount)}</td><td><button className="btn btn-sm" onClick={() => router.push(`/pipeline/${r.id}`)}>เปิดแก้ไข</button></td></tr>)}
          {!data?.overdue.length && <tr className="empty-row"><td colSpan={9}>ไม่มีรายการ Overdue</td></tr>}
        </tbody></table></div>
      </Panel>
      <div className="dash-cols">
        <Panel title="สรุป Pipeline แยกตามแผนก (Active)" bodyPad={false}>
          <div className="table-wrap"><table className="pivot"><thead><tr><th className="col-no">No.</th><th>Department</th><th>จำนวนดีล</th><th>Sum of Amount</th><th>Best Case</th><th>Won / PO เดือนนี้</th></tr></thead><tbody>
            {data?.byDepartment.map((r,i) => <tr key={r.department}><td className="col-no">{i+1}</td><td>{r.department}</td><td className="num">{r.dealCount}</td><td className="num">{formatAmount(r.amount)}</td><td className="num">{formatAmount(r.bestCase)}</td><td className="num">{formatAmount(r.wonAmount)}</td></tr>)}
            {!!data?.byDepartment.length && <tr className="total"><td className="col-no"></td><td>Grand Total</td>{(["dealCount","amount","bestCase","wonAmount"] as const).map(k => <td className="num" key={k}>{formatAmount(data.byDepartment.reduce((n,r) => n+r[k],0))}</td>)}</tr>}
            {!data?.byDepartment.length && <tr className="empty-row"><td colSpan={6}>ไม่พบข้อมูล</td></tr>}
          </tbody></table></div>
        </Panel>
        <Panel title="จำนวน Deal ที่ Active แยกทีม">
          <div className="bar-chart">{data?.byDepartment.map(r => <div className="bar-chart-row" key={r.department}><b>{r.department}</b><div className="bar-track" role="img" aria-label={`${r.department}: ${r.dealCount} deals`}><div className="bar-fill" style={{ width: `${100*r.dealCount/Math.max(1,...data.byDepartment.map(d=>d.dealCount))}%` }} /></div><span className="num">{r.dealCount}</span></div>)}{!data?.byDepartment.length && <span>ไม่พบข้อมูล</span>}</div>
        </Panel>
      </div>
      <Panel title="สรุปตามปีที่สร้าง — ทุกปีภายใต้ตัวกรองแผนก/สถานะ/Probability">
        <div className="bar-chart">
          {data?.byYear.map(r => (
            <div className="bar-chart-row" style={{ gridTemplateColumns: "116px 1fr 40px 120px" }} key={r.year}>
              <b>{r.year}{r.year === new Date().getFullYear() ? " (ปีปัจจุบัน)" : ""}</b>
              <div className="bar-track" role="img" aria-label={`${r.year}: ${r.dealCount} deals, ${formatAmount(r.amount)} บาท`}>
                <div className="bar-fill" style={{ width: `${100 * r.dealCount / Math.max(1, ...data.byYear.map(d => d.dealCount))}%` }} />
              </div>
              <span className="num">{r.dealCount}</span>
              <span className="num cell-muted" style={{ textAlign: "right" }}>{formatAmount(r.amount)}</span>
            </div>
          ))}
          {!data?.byYear.length && <span>ไม่พบข้อมูล</span>}
        </div>
      </Panel>
    </>}
  </div>;
}
function Kpi({label,value,sub,icon,tone}:{label:string;value:string;sub:string;icon:string;tone:string}) { return <div className="kpi-card"><div className="kpi-top"><span>{label}</span><div className="kpi-ico" aria-hidden="true" style={{background:`var(--${tone}-weak)`,color:`var(--${tone})`}}>{icon}</div></div><div className="kpi-val num">{value}</div><div className="kpi-sub">{sub}</div></div>; }

