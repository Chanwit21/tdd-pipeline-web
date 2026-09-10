"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useMasterConfig } from "@/lib/hooks";
import { formatAmount, formatMonth, formatDate } from "@/lib/format";
import { PageHead, FilterBar, Field, Select, Badge, StageBadge, StatusBadge, Pager } from "@/components/ui";
import { IcoPipeline, IcoPlus } from "@/components/icons";
import { DealFormModal } from "@/components/deal/DealFormModal";
import type { Deal, Page } from "@/lib/types";

const DEFAULT_FILTERS = {
  departmentId: "",
  dealStatus: "",
  dealStage: "",
  probability: "",
  closedFrom: "",
  closedTo: "",
  search: "",
  overdueOnly: false,
};

export function PipelineView({ initialTarget }: { initialTarget?: number | "new" }) {
  const { user } = useAuth();
  const { config } = useMasterConfig();
  const router = useRouter();
  const isAdmin = user?.role === "ADMIN";

  const [draft, setDraft] = useState(DEFAULT_FILTERS);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(25);
  const [data, setData] = useState<Page<Deal> | null>(null);
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState<number | "new" | null>(initialTarget ?? null);

  const load = useCallback(() => {
    setLoading(true);
    api<Page<Deal>>("/api/deals", {
      query: {
        departmentId: isAdmin ? filters.departmentId : undefined,
        dealStatus: filters.dealStatus || undefined,
        dealStage: filters.dealStage || undefined,
        search: filters.search || undefined,
        overdueOnly: filters.overdueOnly || undefined,
        closedFrom: filters.closedFrom || undefined,
        closedTo: filters.closedTo || undefined,
        page: page - 1,
        size,
      },
    })
      .then(setData)
      .finally(() => setLoading(false));
  }, [isAdmin, filters, page, size]);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(() => {
    const c = data?.content ?? [];
    return {
      all: data?.totalElements ?? 0,
      followUp: c.filter((d) => d.dealStatus === "Follow Up").length,
      pr: c.filter((d) => d.dealStatus === "PR").length,
      inactive: c.filter((d) => d.dealStatus === "Inactive").length,
    };
  }, [data]);

  function apply() {
    setPage(1);
    setFilters(draft);
  }
  function reset() {
    setDraft(DEFAULT_FILTERS);
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  }
  function closeModal() {
    setTarget(null);
    if (initialTarget !== undefined) router.replace("/pipeline");
  }

  const stageOpts = (config?.dealStages ?? []).map((s) => ({ value: s.name, label: s.name }));

  return (
    <div className="stack">
      <PageHead
        title="Sales Pipeline"
        icon={<IcoPipeline size={19} />}
        subtitle="เพิ่มและติดตามดีลทั้งหมดในระบบ"
        actions={
          <button className="btn btn-primary" onClick={() => setTarget("new")}>
            <IcoPlus size={14} /> เพิ่ม Deal ใหม่
          </button>
        }
      />

      <div className="stat-row">
        <StatChip on label="ทั้งหมด" value={counts.all} />
        <StatChip label="Follow Up (หน้านี้)" value={counts.followUp} />
        <StatChip label="PR (หน้านี้)" value={counts.pr} />
        <StatChip label="Inactive (หน้านี้)" value={counts.inactive} />
        <div className="updates-card">
          <div>
            <b>สรุป</b>
            <div style={{ color: "var(--text-muted)", fontSize: 11.5, marginTop: 2 }}>
              {data?.content.filter((d) => d.overdue).length ?? 0} ดีล overdue ·{" "}
              {data?.content.filter((d) => d.legacyMigrated).length ?? 0} ดีล migrate รอตรวจสอบ
            </div>
          </div>
          <div className="bar" />
        </div>
      </div>

      <FilterBar
        title="ตัวกรองการค้นหา"
        actions={
          <>
            <button className="btn btn-primary btn-sm" onClick={apply}>
              🔍 ค้นหา
            </button>
            <button className="btn btn-ghost btn-sm" onClick={reset}>
              ล้างค่า
            </button>
          </>
        }
      >
        {isAdmin && (
          <Field label="แผนก">
            <Select
              value={draft.departmentId}
              onChange={(v) => setDraft({ ...draft, departmentId: v })}
              all="ทั้งหมด"
              options={(config?.departments ?? []).map((d) => ({ value: String(d.id), label: d.code }))}
            />
          </Field>
        )}
        <Field label="Deal Status">
          <Select
            value={draft.dealStatus}
            onChange={(v) => setDraft({ ...draft, dealStatus: v })}
            all="ทั้งหมด"
            options={(config?.dealStatuses ?? []).map((s) => ({ value: s, label: s }))}
          />
        </Field>
        <Field label="Deal Stage">
          <Select
            value={draft.dealStage}
            onChange={(v) => setDraft({ ...draft, dealStage: v })}
            all="ทั้งหมด"
            options={stageOpts}
          />
        </Field>
        <Field label="Probability">
          <Select
            value={draft.probability}
            onChange={(v) => setDraft({ ...draft, probability: v })}
            all="ทั้งหมด"
            options={(config?.probabilities ?? []).map((p) => ({ value: p.probability, label: p.probability }))}
          />
        </Field>
        <Field label="ค้นหา (ลูกค้า / Deal Name)">
          <input value={draft.search} onChange={(e) => setDraft({ ...draft, search: e.target.value })} />
        </Field>
        <Field label=" ">
          <label className="check">
            <input
              type="checkbox"
              checked={draft.overdueOnly}
              onChange={(e) => setDraft({ ...draft, overdueOnly: e.target.checked })}
            />
            แสดงเฉพาะ Overdue
          </label>
        </Field>
        <Field label="Closed Date ตั้งแต่">
          <input type="month" value={draft.closedFrom} onChange={(e) => setDraft({ ...draft, closedFrom: e.target.value })} />
        </Field>
        <Field label="ถึง">
          <input type="month" value={draft.closedTo} onChange={(e) => setDraft({ ...draft, closedTo: e.target.value })} />
        </Field>
      </FilterBar>

      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th className="col-no">No.</th>
                <th>Record ID</th>
                <th>ลูกค้า</th>
                <th>Deal Name</th>
                <th>แผนก</th>
                <th>Status</th>
                <th>Stage</th>
                <th>Probability</th>
                <th>Situation</th>
                <th>Amount</th>
                <th>Closed Date</th>
                <th>Created Date</th>
                <th>Deal Owner</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr className="empty-row">
                  <td colSpan={13}>กำลังโหลด…</td>
                </tr>
              )}
              {!loading && data?.content.length === 0 && (
                <tr className="empty-row">
                  <td colSpan={13}>ไม่พบ deal ตามเงื่อนไข</td>
                </tr>
              )}
              {data?.content.map((d, i) => (
                <tr
                  key={d.id}
                  className={`clickable${d.rowColor !== "normal" ? ` row-${d.rowColor}` : ""}`}
                  onClick={() => setTarget(d.id)}
                >
                  <td className="col-no">{(page - 1) * size + i + 1}</td>
                  <td className={`cell-strong${d.rowColor === "danger" ? " cell-accentbar" : ""}`}>
                    {d.recordId}
                    {d.legacyMigrated && (
                      <>
                        {" "}
                        <Badge tone="warning">legacy</Badge>
                      </>
                    )}
                  </td>
                  <td>{d.customer}</td>
                  <td className="ellipsis" title={d.dealName}>
                    {d.dealName}
                  </td>
                  <td>
                    <Badge tone="slate">{d.departmentCode}</Badge>
                  </td>
                  <td>
                    <StatusBadge status={d.dealStatus} />
                  </td>
                  <td>
                    <StageBadge stage={d.dealStage} />
                  </td>
                  <td className="cell-muted">{d.probability}</td>
                  <td className="cell-muted">{d.situation}</td>
                  <td className="num cell-strong">{formatAmount(d.amount)}</td>
                  <td className="cell-muted">{formatMonth(d.closedDate)}</td>
                  <td className="cell-muted">{formatDate(d.createdDate)}</td>
                  <td>{d.dealOwner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-foot">
          <span>
            {data
              ? `แสดง ${data.totalElements === 0 ? 0 : (page - 1) * size + 1}–${Math.min(page * size, data.totalElements)} จาก ${data.totalElements} รายการ`
              : "…"}
          </span>
          <Pager page={page} totalPages={data?.totalPages ?? 1} onPage={setPage} />
          <span>
            จำนวนรายการต่อหน้า{" "}
            <select
              className="foot-select"
              value={size}
              onChange={(e) => {
                setPage(1);
                setSize(Number(e.target.value));
              }}
            >
              {[25, 50, 100].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </span>
        </div>
      </div>

      <DealFormModal target={target} onClose={closeModal} onSaved={load} />
    </div>
  );
}

function StatChip({ label, value, on }: { label: string; value: number; on?: boolean }) {
  return (
    <div className={`stat-chip${on ? " on" : ""}`}>
      <div className="stat-icon">≡</div>
      <div>
        <div className="lbl">{label}</div>
        <div className="val num">{value}</div>
      </div>
    </div>
  );
}
