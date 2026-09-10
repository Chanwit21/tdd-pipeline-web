"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useMasterConfig } from "@/lib/hooks";
import { formatAmount } from "@/lib/format";
import { PageHead, Field, Select, Subtabs } from "@/components/ui";
import type { PivotReport } from "@/lib/types";

type ReportKey = "pr-by-team" | "smt-qbr" | "pipeline-by-team";

const TABS: { value: ReportKey; label: string }[] = [
  { value: "pr-by-team", label: "PR by Team" },
  { value: "smt-qbr", label: "SMT QBR" },
  { value: "pipeline-by-team", label: "Pipeline by Team" },
];

const DESC: Record<ReportKey, string> = {
  "pr-by-team": "Sum of Amount — Deal Status = PR, แยกตาม Closed Date",
  "smt-qbr": "Sum of Amount — แยกตาม Probability × Deal Stage",
  "pipeline-by-team": "Sum of Amount — Department × Closed Date",
};

const CUR = new Date().getFullYear();
const YEARS = [CUR + 1, CUR, CUR - 1, CUR - 2];

export function ReportPage({ report }: { report: ReportKey }) {
  const { user } = useAuth();
  const { config } = useMasterConfig();
  const router = useRouter();
  const isAdmin = user?.role === "ADMIN";

  const [departmentId, setDepartmentId] = useState("");
  const [year, setYear] = useState(CUR);
  const [dealStatus, setDealStatus] = useState("");
  const [probability, setProbability] = useState("");
  const [dealStage, setDealStage] = useState("");
  const [tick, setTick] = useState(0);
  const [data, setData] = useState<PivotReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const query: Record<string, string | undefined> = {
      departmentId: isAdmin ? departmentId || undefined : undefined,
      year: String(year),
    };
    if (report !== "pr-by-team") query.dealStatus = dealStatus || undefined;
    if (report === "pipeline-by-team") {
      query.probability = probability || undefined;
      query.dealStage = dealStage || undefined;
    }
    api<PivotReport>(`/api/reports/${report}`, { query })
      .then(setData)
      .finally(() => setLoading(false));
  }, [report, isAdmin, departmentId, year, dealStatus, probability, dealStage, tick]);

  return (
    <div className="stack">
      <PageHead title="Report" subtitle={DESC[report]} />

      <Subtabs
        value={report}
        onChange={(v) => router.push(`/reports/${v}`)}
        items={TABS}
        style={{ marginBottom: 16 }}
      />

      {(() => {
        const fields: ReactNode[] = [
          <Field key="year" label="ปี">
            <Select
              value={String(year)}
              onChange={(v) => setYear(Number(v))}
              options={YEARS.map((y) => ({ value: String(y), label: String(y) }))}
            />
          </Field>,
        ];
        if (isAdmin)
          fields.push(
            <Field key="dept" label="แผนก">
              <Select
                value={departmentId}
                onChange={setDepartmentId}
                all="ทั้งหมด"
                options={(config?.departments ?? []).map((d) => ({ value: String(d.id), label: d.code }))}
              />
            </Field>,
          );
        if (report !== "pr-by-team")
          fields.push(
            <Field key="status" label="Deal Status">
              <Select
                value={dealStatus}
                onChange={setDealStatus}
                all="ทั้งหมด"
                options={(config?.dealStatuses ?? []).map((s) => ({ value: s, label: s }))}
              />
            </Field>,
          );
        if (report === "pipeline-by-team") {
          fields.push(
            <Field key="prob" label="Probability">
              <Select
                value={probability}
                onChange={setProbability}
                all="ทั้งหมด"
                options={(config?.probabilities ?? []).map((p) => ({ value: p.probability, label: p.probability }))}
              />
            </Field>,
            <Field key="stage" label="Deal Stage">
              <Select
                value={dealStage}
                onChange={setDealStage}
                all="ทั้งหมด"
                options={(config?.dealStages ?? []).map((s) => ({ value: s.name, label: s.name }))}
              />
            </Field>,
          );
        }
        return (
          <div className="panel">
            <div
              className="filter-grid"
              style={{
                gridTemplateColumns: `repeat(${fields.length + 1}, minmax(0, 200px))`,
                paddingBottom: 16,
              }}
            >
              {fields}
              <Field label={" "}>
                <button className="btn btn-primary btn-sm" onClick={() => setTick((t) => t + 1)}>
                  Refresh
                </button>
              </Field>
            </div>
            <ReportTable data={data} loading={loading} />
          </div>
        );
      })()}
    </div>
  );
}

function ReportTable({ data, loading }: { data: PivotReport | null; loading: boolean }) {
  return (
    <>
        <div className="table-wrap" style={{ padding: "0 18px 18px" }}>
          <table className="pivot">
            <thead>
              <tr>
                <th className="col-no">No.</th>
                <th>{data?.rowHeader ?? "—"}</th>
                {(data?.columns ?? []).map((c) => (
                  <th key={c}>{c}</th>
                ))}
                <th>Grand Total</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr className="empty-row">
                  <td colSpan={(data?.columns.length ?? 3) + 3}>กำลังโหลด…</td>
                </tr>
              )}
              {!loading &&
                data?.rows.map((r, i) => (
                  <tr key={r.label}>
                    <td className="col-no">{i + 1}</td>
                    <td>{r.label}</td>
                    {data.columns.map((c) => (
                      <td key={c} className="num">
                        {r.values[c] ? formatAmount(r.values[c]) : "—"}
                      </td>
                    ))}
                    <td className="num grand">{r.total ? formatAmount(r.total) : "—"}</td>
                  </tr>
                ))}
              {!loading && data && (
                <tr className="total">
                  <td className="col-no">—</td>
                  <td>Grand Total</td>
                  {data.columns.map((c) => (
                    <td key={c} className="num">
                      {data.columnTotals[c] ? formatAmount(data.columnTotals[c]) : "—"}
                    </td>
                  ))}
                  <td className="num grand">{formatAmount(data.grandTotal)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
    </>
  );
}
