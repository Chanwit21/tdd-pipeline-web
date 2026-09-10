"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useMasterConfig } from "@/lib/hooks";
import { formatAmount, formatMonth, currentYearMonth } from "@/lib/format";
import { PageHead, Panel, FilterBar, Field, Select, Badge } from "@/components/ui";

interface Summary {
  statCards: { totalPipelineAmount: number; bestCaseAmount: number; wonAmount: number; activeDealCount: number };
  overdue: {
    id: number;
    recordId: string;
    customer: string;
    dealName: string;
    department: string;
    dealOwner: string;
    closedDate: string;
    amount: number;
  }[];
  byDepartment?: { department: string; dealCount: number; amount: number; bestCase: number }[];
}

const yearStart = () => currentYearMonth().slice(0, 4) + "-01";

export default function DashboardPage() {
  const { user } = useAuth();
  const { config } = useMasterConfig();
  const router = useRouter();
  const isAdmin = user?.role === "ADMIN";

  const [departmentId, setDepartmentId] = useState("");
  const [from, setFrom] = useState(yearStart());
  const [to, setTo] = useState(currentYearMonth());
  const [applied, setApplied] = useState({ departmentId: "", from: yearStart(), to: currentYearMonth() });
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api<Summary>("/api/dashboard/summary", {
      query: {
        departmentId: isAdmin ? applied.departmentId : undefined,
        from: applied.from,
        to: applied.to,
      },
    })
      .then(setData)
      .finally(() => setLoading(false));
  }, [applied, isAdmin]);

  const s = data?.statCards;

  return (
    <div className="stack">
      <PageHead
        title="Dashboard"
        subtitle={isAdmin ? "ภาพรวม Sales Pipeline ทุกแผนก" : `ภาพรวม Sales Pipeline แผนก ${user?.departmentCode}`}
      />

      <FilterBar
        title="ตัวกรอง Dashboard"
        cols={4}
        actions={
          <>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setApplied({ departmentId, from, to })}
            >
              🔍 กรอง
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setDepartmentId("");
                setFrom(yearStart());
                setTo(currentYearMonth());
                setApplied({ departmentId: "", from: yearStart(), to: currentYearMonth() });
              }}
            >
              ล้างค่า
            </button>
          </>
        }
      >
        {isAdmin && (
          <Field label="แผนก">
            <Select
              value={departmentId}
              onChange={setDepartmentId}
              all="ทั้งหมด"
              options={(config?.departments ?? []).map((d) => ({ value: String(d.id), label: d.code }))}
            />
          </Field>
        )}
        <Field label="ตั้งแต่เดือน">
          <input type="month" value={from} onChange={(e) => setFrom(e.target.value)} />
        </Field>
        <Field label="ถึงเดือน">
          <input type="month" value={to} onChange={(e) => setTo(e.target.value)} />
        </Field>
      </FilterBar>

      <div className="kpi-grid">
        <Kpi label="Total Pipeline Amount" value={formatAmount(s?.totalPipelineAmount)} ico="฿" bg="var(--info-weak)" fg="var(--info)" sub={`รวม ${s?.activeDealCount ?? 0} ดีล ที่ยัง Active`} />
        <Kpi label="Best Case Amount" value={formatAmount(s?.bestCaseAmount)} ico="✓" bg="var(--success-weak)" fg="var(--success)" sub="Probability 75% ขึ้นไป" subStrong />
        <Kpi label="Won / PO Amount" value={formatAmount(s?.wonAmount)} ico="🏆" bg="var(--accent-weak)" fg="var(--accent-ink)" sub="ตามช่วงเดือนที่เลือก" />
        <Kpi label="Overdue Follow Up" value={String(data?.overdue.length ?? 0)} ico="!" bg="var(--danger-weak)" fg="var(--danger)" sub={data && data.overdue.length ? "ต้องติดตามด่วน" : "ไม่มีรายการค้าง"} subDanger={!!data?.overdue.length} />
      </div>

      {isAdmin && data?.byDepartment && (
        <Panel title="สรุป Pipeline แยกตามแผนก" bodyPad={false}>
          <div className="table-wrap">
            <table className="pivot">
              <thead>
                <tr>
                  <th className="col-no">No.</th>
                  <th>แผนก</th>
                  <th>จำนวนดีล</th>
                  <th>Sum of Amount</th>
                  <th>Best Case</th>
                </tr>
              </thead>
              <tbody>
                {data.byDepartment.map((r, i) => (
                  <tr key={r.department}>
                    <td className="col-no">{i + 1}</td>
                    <td>{r.department}</td>
                    <td className="num">{r.dealCount}</td>
                    <td className="num">{formatAmount(r.amount)}</td>
                    <td className="num">{r.bestCase ? formatAmount(r.bestCase) : "—"}</td>
                  </tr>
                ))}
                <tr className="total">
                  <td className="col-no">—</td>
                  <td>Grand Total</td>
                  <td className="num">{data.byDepartment.reduce((a, r) => a + r.dealCount, 0)}</td>
                  <td className="num grand">{formatAmount(data.byDepartment.reduce((a, r) => a + r.amount, 0))}</td>
                  <td className="num">{formatAmount(data.byDepartment.reduce((a, r) => a + r.bestCase, 0))}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      <Panel
        title={<>Deal ที่เลย Closed Date (Overdue)</>}
        extra={<Badge tone="danger">{data?.overdue.length ?? 0} รายการ</Badge>}
        bodyPad={false}
      >
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th className="col-no">No.</th>
                <th>Record ID</th>
                <th>ลูกค้า</th>
                <th>Deal Name</th>
                <th>แผนก</th>
                <th>Deal Owner</th>
                <th>Closed Date</th>
                <th>Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr className="empty-row">
                  <td colSpan={9}>กำลังโหลด…</td>
                </tr>
              )}
              {!loading && data?.overdue.length === 0 && (
                <tr className="empty-row">
                  <td colSpan={9}>ไม่มี deal overdue 🎉</td>
                </tr>
              )}
              {data?.overdue.map((r, i) => (
                <tr key={r.id}>
                  <td className="col-no">{i + 1}</td>
                  <td className="cell-strong cell-accentbar">{r.recordId}</td>
                  <td>{r.customer}</td>
                  <td className="ellipsis" title={r.dealName}>
                    {r.dealName}
                  </td>
                  <td>
                    <Badge tone="slate">{r.department}</Badge>
                  </td>
                  <td>{r.dealOwner}</td>
                  <td className="cell-muted">{formatMonth(r.closedDate)}</td>
                  <td className="num cell-strong">{formatAmount(r.amount)}</td>
                  <td>
                    <button className="btn btn-sm" onClick={() => router.push(`/pipeline/${r.id}`)}>
                      เปิดแก้ไข
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function Kpi({
  label,
  value,
  ico,
  bg,
  fg,
  sub,
  subStrong,
  subDanger,
}: {
  label: string;
  value: string;
  ico: string;
  bg: string;
  fg: string;
  sub: string;
  subStrong?: boolean;
  subDanger?: boolean;
}) {
  return (
    <div className="kpi-card">
      <div className="kpi-top">
        <span>{label}</span>
        <div className="kpi-ico" style={{ background: bg, color: fg }}>
          {ico}
        </div>
      </div>
      <div className="kpi-val num">{value}</div>
      <div className={`kpi-sub${subDanger ? " danger" : ""}`}>{subStrong ? <b>{sub}</b> : sub}</div>
    </div>
  );
}
