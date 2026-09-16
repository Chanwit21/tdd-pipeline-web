"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useMasterConfig, useCreatedYears } from "@/lib/hooks";
import { formatAmount, formatMonth, formatDate } from "@/lib/format";
import { stagesForStatuses, withStatusFilter } from "@/lib/validation";
import { PageHead, FilterBar, Field, Select, Badge, StageBadge, StatusBadge, Pager } from "@/components/ui";
import { Card } from "@/components/ui/card";
import { IcoPipeline, IcoPlus, IcoDownload, IcoBell, IcoTrendUp, IcoCheckCircle, IcoArchive, IcoSearch } from "@/components/icons";
import { DealFormModal } from "@/components/deal/DealFormModal";
import { DepartmentBreakdownDialog } from "@/components/deal/DepartmentBreakdownDialog";
import { MultiCheckbox } from "@/components/MultiCheckbox";
import { downloadCsv } from "@/lib/export";
import { useToast } from "@/components/Toast";
import type { Deal, Page } from "@/lib/types";

type DeptModalKey = "total" | "followUp" | "pr" | "inactive";
const DEPT_MODAL_LABEL: Record<DeptModalKey, string> = {
  total: "ทั้งหมด", followUp: "Follow Up", pr: "PR / PO", inactive: "Inactive",
};
const DEPT_MODAL_TONE: Record<DeptModalKey, string> = {
  total: "#F2661C", followUp: "#2E6BE6", pr: "#1A9A5B", inactive: "#6B7280",
};

const DEFAULT_FILTERS = {
  departmentId: [] as string[],
  dealStatus: [] as string[],
  dealStage: [] as string[],
  probability: [] as string[],
  createdYear: "",
  closedFrom: "",
  closedTo: "",
  search: "",
  overdueOnly: false,
};

export function PipelineView({ initialTarget }: { initialTarget?: number | "new" }) {
  const { user } = useAuth();
  const { config } = useMasterConfig();
  const createdYears = useCreatedYears();
  const router = useRouter();
  const isAdmin = user?.role === "ADMIN";

  const [draft, setDraft] = useState(DEFAULT_FILTERS);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [data, setData] = useState<Page<Deal> | null>(null);
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState<number | "new" | null>(initialTarget ?? null);

  const toast = useToast();
  const [exporting, setExporting] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [deptModal, setDeptModal] = useState<DeptModalKey | null>(null);
  const requestId = useRef(0);
  const query = {
    ...filters, departmentId: isAdmin ? filters.departmentId : undefined,
    dealStage: filters.dealStage.length ? filters.dealStage : undefined,
    probability: filters.probability.length ? filters.probability : undefined,
    createdYear: filters.createdYear || undefined,
  };
  const load = useCallback(() => {
    const id = ++requestId.current;
    setLoading(true);
    api<Page<Deal>>("/api/deals", {
      query: {
        departmentId: isAdmin ? filters.departmentId : undefined,
        dealStatus: filters.dealStatus.length ? filters.dealStatus : undefined,
        dealStage: filters.dealStage.length ? filters.dealStage : undefined,
        probability: filters.probability.length ? filters.probability : undefined,
        createdYear: filters.createdYear || undefined,
        search: filters.search || undefined,
        overdueOnly: filters.overdueOnly || undefined,
        closedFrom: filters.closedFrom || undefined,
        closedTo: filters.closedTo || undefined,
        page: page - 1,
        size,
      },
    })
      .then(result => { if (id === requestId.current) setData(result); })
      .catch(e => { if (id === requestId.current) { setData(null); toast.push(e.message || "โหลดข้อมูลไม่สำเร็จ", "error"); } })
      .finally(() => { if (id === requestId.current) setLoading(false); });
  }, [isAdmin, filters, page, size, toast]);

  useEffect(() => {
    load();
    return () => { requestId.current++; };
  }, [load]);

  const counts = useMemo(() => {
    const c = data?.content ?? [];
    return {
      all: data?.totalElements ?? 0,
      followUp: c.filter((d) => d.dealStatus === "Follow Up").length,
      pr: c.filter((d) => d.dealStatus === "PR").length,
      inactive: c.filter((d) => d.dealStatus === "Inactive").length,
      overdue: c.filter((d) => d.overdue).length,
      legacy: c.filter((d) => d.legacyMigrated).length,
    };
  }, [data]);

  const deptBreakdown = useMemo<Record<DeptModalKey, { total: number; counts: Record<string, number> }>>(() => {
    const c = data?.content ?? [];
    const bucket = (filter: (d: Deal) => boolean) => {
      const rows = c.filter(filter);
      const byDept: Record<string, number> = {};
      for (const d of rows) byDept[d.departmentCode] = (byDept[d.departmentCode] ?? 0) + 1;
      return { total: rows.length, counts: byDept };
    };
    return {
      total: bucket(() => true),
      followUp: bucket((d) => d.dealStatus === "Follow Up"),
      pr: bucket((d) => d.dealStatus === "PR"),
      inactive: bucket((d) => d.dealStatus === "Inactive"),
    };
  }, [data]);

  function apply() {
    setPage(1);
    setFilters(draft);
    setSelected([]);
  }
  function selectStatus(statuses: string[]) {
    setDraft((d) => withStatusFilter(d, statuses, config));
    setFilters((f) => withStatusFilter(f, statuses, config));
    setPage(1);
    setSelected([]);
  }
  function reset() {
    setSelected([]);
    setDraft(DEFAULT_FILTERS);
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  }
  function closeModal() {
    setTarget(null);
    if (initialTarget !== undefined) router.replace("/pipeline");
  }

  async function exportDeals() {
    setExporting(true);
    try {
      let rows: Deal[] = [];
      if (selected.length) rows = (data?.content ?? []).filter(d => selected.includes(d.id));
      else {
        let p = 0, pages = 1;
        do {
          const result = await api<Page<Deal>>("/api/deals", { query: { ...query, page: p, size: 200 } });
          rows.push(...result.content); pages = result.totalPages; p++;
        } while (p < pages);
      }
      downloadCsv("sales-pipeline.csv", [["Record ID", "Customer", "Deal Name", "Department", "Deal Status", "Deal Stage", "Probability", "Situation", "Amount", "Closed Date", "Created Date", "Deal Owner"], ...rows.map(d => [d.recordId, d.customer, d.dealName, d.departmentCode, d.dealStatus, d.dealStage, d.probability, d.situation, d.amount, formatMonth(d.closedDate), formatDate(d.createdDate), d.dealOwner])]);
    } catch (e) { toast.push(e instanceof Error ? e.message : "Export ไม่สำเร็จ", "error"); }
    finally { setExporting(false); }
  }

  // Deal Stage options narrow to whatever's reachable from the selected Deal Status filter(s),
  // same relationship the Deal form already enforces — avoids offering combinations that can
  // never match anything (e.g. "Won" while only "PR" is selected).
  const stageNames = config ? stagesForStatuses(draft.dealStatus, config) : [];
  const stageOpts = stageNames.map((name) => ({ value: name, label: name }));

  return (
    <div className="stack">
      <PageHead
        title="Sales Pipeline"
        icon={<IcoPipeline size={19} />}
        subtitle="เพิ่มและติดตามดีลทั้งหมดในระบบ"
        actions={
          <>
          <button className="btn" disabled={exporting || loading} onClick={exportDeals}>{exporting ? "กำลัง Export…" : <><IcoDownload size={14} /> {selected.length ? `Export ที่เลือก (${selected.length})` : "Export ทั้งหมดตามตัวกรอง"}</>}</button>
          <button className="btn btn-primary" onClick={() => setTarget("new")}>
            <IcoPlus size={14} /> เพิ่ม Deal ใหม่
          </button></>
        }
      />

      <div className="flex flex-wrap items-stretch gap-4">
        <StatCard
          on={filters.dealStatus.length === 0}
          label="ทั้งหมด" tone="#F2661C" bucket={deptBreakdown.total} icon={<IcoPipeline size={16} />}
          onClick={() => selectStatus([])} onViewAll={() => setDeptModal("total")}
        />
        <StatCard
          on={filters.dealStatus.length === 1 && filters.dealStatus[0] === "Follow Up"}
          label="Follow Up (หน้านี้)" tone="#2E6BE6" bucket={deptBreakdown.followUp} icon={<IcoTrendUp size={16} />}
          onClick={() => selectStatus(["Follow Up"])} onViewAll={() => setDeptModal("followUp")}
        />
        <StatCard
          on={filters.dealStatus.length === 1 && filters.dealStatus[0] === "PR"}
          label="PR / PO (หน้านี้)" tone="#1A9A5B" bucket={deptBreakdown.pr} icon={<IcoCheckCircle size={16} />}
          onClick={() => selectStatus(["PR"])} onViewAll={() => setDeptModal("pr")}
        />
        <StatCard
          on={filters.dealStatus.length === 1 && filters.dealStatus[0] === "Inactive"}
          label="Inactive (หน้านี้)" tone="#6B7280" bucket={deptBreakdown.inactive} icon={<IcoArchive size={16} />}
          onClick={() => selectStatus(["Inactive"])} onViewAll={() => setDeptModal("inactive")}
        />
        <div className="updates-card">
          <div className="bar" />
          <div className="stat-icon" aria-hidden="true"><IcoBell size={18} /></div>
          <div>
            <b>แจ้งเตือน (หน้านี้)</b>
            <div style={{ color: "var(--text-muted)", fontSize: 11.5, marginTop: 2 }}>
              {counts.overdue} ดีล overdue ต้องติดตาม · {counts.legacy} ดีล migrate จาก Excel รอตรวจสอบ
            </div>
          </div>
        </div>
      </div>
      <DepartmentBreakdownDialog
        open={deptModal !== null}
        onOpenChange={(o) => !o && setDeptModal(null)}
        label={deptModal ? DEPT_MODAL_LABEL[deptModal] : ""}
        tone={deptModal ? DEPT_MODAL_TONE[deptModal] : "#F2661C"}
        bucket={deptModal ? deptBreakdown[deptModal] : { total: 0, counts: {} }}
      />

      <div className="panel pipeline-panel">
      <FilterBar embedded
        title="ตัวกรองการค้นหา"
        onSubmit={apply}
        actions={
          <>
            <button type="submit" className="btn btn-primary btn-sm">
              <IcoSearch size={14} /> ค้นหา
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={reset}>
              ล้างค่า
            </button>
          </>
        }
      >
        <Field label="ปีที่สร้าง (Created Date)">
          <Select value={draft.createdYear} onChange={(v) => setDraft({ ...draft, createdYear: v })} all="ทุกปี"
            options={createdYears.map((y) => ({ value: String(y), label: String(y) }))} />
        </Field>
        {isAdmin && (
          <Field label="Department">
            <MultiCheckbox label="Department"
              value={draft.departmentId}
              onChange={(v) => setDraft({ ...draft, departmentId: v })}
              options={(config?.departments ?? []).map((d) => ({ value: String(d.id), label: d.code }))}
            />
          </Field>
        )}
        <Field label="Deal Status">
          <MultiCheckbox label="Deal Status"
            value={draft.dealStatus}
            onChange={(v) => setDraft(d => withStatusFilter(d, v, config))}
            options={(config?.dealStatuses ?? []).map((s) => ({ value: s, label: s }))}
          />
        </Field>
        <Field label="Deal Stage">
          <MultiCheckbox label="Deal Stage"
            value={draft.dealStage}
            onChange={(v) => setDraft({ ...draft, dealStage: v })}
            options={stageOpts}
          />
        </Field>
        <Field label="Probability">
          <MultiCheckbox label="Probability"
            value={draft.probability}
            onChange={(v) => setDraft({ ...draft, probability: v })}
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

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th className="col-check"><input type="checkbox" aria-label="เลือกทั้งหมดในหน้านี้" checked={!!data?.content.length && data.content.every(d => selected.includes(d.id))} onChange={e => setSelected(e.target.checked ? data?.content.map(d => d.id) ?? [] : [])} /></th>
                <th className="col-no">No.</th>
                <th>Record ID</th>
                <th>ลูกค้า</th>
                <th>Deal Name</th>
                <th>Department</th>
                <th>Deal Status</th>
                <th>Deal Stage</th>
                <th>Probability</th>
                <th>Situation</th>
                <th>Amount</th>
                <th>Closed Date</th>
                <th>Created Date</th>
                <th>Deal Owner</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr className="empty-row">
                  <td colSpan={15}>กำลังโหลด…</td>
                </tr>
              )}
              {!loading && data?.content.length === 0 && (
                <tr className="empty-row">
                  <td colSpan={15}>ไม่พบ deal ตามเงื่อนไข</td>
                </tr>
              )}
              {data?.content.map((d, i) => (
                <tr
                  key={d.id}
                  className={`clickable${d.rowColor !== "normal" ? ` row-${d.rowColor}` : ""}${d.legacyMigrated ? " bg-[#FFF8F0] shadow-[inset_3px_0_0_#F2661C]" : ""}`}
                  onClick={() => setTarget(d.id)}
                >
                  <td onClick={e => e.stopPropagation()}><input type="checkbox" aria-label={`เลือก ${d.recordId}`} checked={selected.includes(d.id)} onChange={e => setSelected(e.target.checked ? [...selected, d.id] : selected.filter(id => id !== d.id))} /></td>
                  <td className="col-no">{(page - 1) * size + i + 1}</td>
                  <td className="cell-strong">
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
                  <td className="cell-muted date-cell">{formatMonth(d.closedDate)}</td>
                  <td className="cell-muted date-cell">{formatDate(d.createdDate)}</td>
                  <td>{d.dealOwner}</td>
                  <td>
                    <button
                      className="rowbtn"
                      title={`แก้ไข ${d.recordId}`}
                      aria-label={`แก้ไข ${d.recordId}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setTarget(d.id);
                      }}
                    >
                      ✎
                    </button>
                  </td>
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
          <Pager page={page} totalPages={data?.totalPages ?? 1} onPage={p => { setPage(p); setSelected([]); }} />
          <span>
            จำนวนรายการต่อหน้า{" "}
            <select
              className="foot-select"
              value={size}
              onChange={(e) => {
                setPage(1);
                setSize(Number(e.target.value));
                setSelected([]);
              }}
            >
              {[10, 25, 50].map((n) => (
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

function StatCard({
  label,
  tone,
  bucket,
  icon,
  on,
  onClick,
  onViewAll,
}: {
  label: string;
  tone: string;
  bucket: { total: number; counts: Record<string, number> };
  icon: React.ReactNode;
  on?: boolean;
  onClick?: () => void;
  onViewAll: () => void;
}) {
  const top5 = Object.entries(bucket.counts)
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  return (
    <Card
      className={`relative flex flex-1 min-w-[190px] cursor-pointer flex-col gap-3.5 overflow-hidden p-[18px_20px]${on ? " ring-2 ring-accent" : ""}`}
      onClick={onClick}
    >
      <span className="absolute left-0 top-0 bottom-0 w-1" style={{ background: tone }} />
      <div className="flex w-full items-center gap-3">
        <div
          className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-full"
          style={{ background: tone + "22", color: tone }}
          aria-hidden="true"
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[20px] font-extrabold leading-tight text-text">{bucket.total}</div>
          <div className="whitespace-nowrap text-xs text-text-muted">{label}</div>
        </div>
        <button
          type="button"
          className="flex-none appearance-none border-0 bg-transparent p-0 text-[11px] font-semibold text-text-muted underline decoration-1 underline-offset-2 hover:text-accent cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onViewAll();
          }}
        >
          ดูทั้งหมด
        </button>
      </div>
      {bucket.total > 0 && (
        <div className="flex flex-col gap-2.5 border-t border-border pt-3">
          {top5.map((r) => (
            <div key={r.code} className="flex items-center gap-2">
              <span className="w-9 text-[11px] font-semibold text-text">{r.code}</span>
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#EDEEF2]">
                <div className="h-full rounded-full" style={{ width: `${Math.round((r.count / bucket.total) * 100)}%`, background: tone }} />
              </div>
              <span className="text-[11px] font-semibold text-text-muted">{r.count}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
