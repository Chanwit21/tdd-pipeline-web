"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useMasterConfig } from "@/lib/hooks";
import { useToast } from "@/components/Toast";
import { crossFieldHint, situationFor, stagesForStatus, validateDeal } from "@/lib/validation";
import { formatDateTime, todayIso } from "@/lib/format";
import { IcoClose, IcoAlertTriangle } from "@/components/icons";
import type { Deal, DealFormValues, FieldError } from "@/lib/types";

const EMPTY: DealFormValues = {
  departmentId: null,
  customer: "",
  dealName: "",
  dealType: "",
  dealStatus: "",
  dealStage: "",
  probability: "",
  closedDate: "",
  amount: "",
  projectCode: "",
  costSheetNo: "",
  createdDate: "",
};

interface Props {
  target: number | "new" | null;
  onClose: () => void;
  onSaved: () => void;
}

export function DealFormModal({ target, onClose, onSaved }: Props) {
  const { user } = useAuth();
  const { config } = useMasterConfig();
  const toast = useToast();
  const isAdmin = user?.role === "ADMIN";
  const isNew = target === "new";

  const [tab, setTab] = useState<"info" | "notes">("info");
  const [v, setV] = useState<DealFormValues>(EMPTY);
  const [deal, setDeal] = useState<Deal | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [noteText, setNoteText] = useState("");

  useEffect(() => {
    if (target === null || !config) return;
    setLoading(true);
    setTab("info");
    setErrors({});
    if (isNew) {
      setDeal(null);
      setV({ ...EMPTY, departmentId: isAdmin ? null : user?.departmentId ?? null, createdDate: todayIso() });
      setLoading(false);
    } else {
      api<Deal>(`/api/deals/${target}`)
        .then((d) => {
          setDeal(d);
          setV({
            departmentId: d.departmentId,
            customer: d.customer,
            dealName: d.dealName,
            dealType: d.dealType,
            dealStatus: d.dealStatus,
            dealStage: d.dealStage,
            probability: d.probability,
            closedDate: d.closedDate,
            amount: String(d.amount),
            projectCode: d.projectCode ?? "",
            costSheetNo: d.costSheetNo ?? "",
            createdDate: d.createdDate,
          });
        })
        .catch((e) => toast.push(e instanceof ApiError ? e.message : "โหลด deal ไม่สำเร็จ", "error"))
        .finally(() => setLoading(false));
    }
  }, [target, config, isNew, isAdmin, user, toast]);

  const dealOwner = useMemo(() => {
    if (!config || !v.departmentId) return deal?.dealOwner ?? "";
    return config.departments.find((d) => d.id === v.departmentId)?.defaultOwner ?? "";
  }, [config, v.departmentId, deal]);

  const situation = config ? situationFor(v.probability, config) : "";
  const stageOptions = config ? stagesForStatus(v.dealStatus, config).filter(s =>
    (s !== "Won" || v.probability === config.rules.wonProbability) &&
    (s !== "PO" || v.probability === config.rules.poProbability)) : [];
  const statusOptions = config ? config.dealStatuses.filter(status => stagesForStatus(status, config).some(s =>
    (s !== "Won" || v.probability === config.rules.wonProbability) &&
    (s !== "PO" || v.probability === config.rules.poProbability))) : [];
  const liveHint = config ? crossFieldHint(v, config) : null;

  function set<K extends keyof DealFormValues>(key: K, val: DealFormValues[K]) {
    setV((prev) => {
      const next = { ...prev, [key]: val };
      if (key === "dealStatus") next.dealStage = "";
      if (key === "probability" && config) {
        const allowed = stagesForStatus(next.dealStatus, config).filter(s => (s !== "Won" || next.probability === config.rules.wonProbability) && (s !== "PO" || next.probability === config.rules.poProbability));
        if (!allowed.includes(next.dealStage)) next.dealStage = "";
        if (!allowed.length) next.dealStatus = "";
      }
      return next;
    });
    setErrors((prev) => {
      const { [key]: _drop, ...rest } = prev;
      return rest;
    });
  }

  function applyErrors(list: FieldError[]) {
    const map: Record<string, string> = {};
    for (const e of list) if (e.field) map[e.field] = e.message;
    setErrors(map);
    const first = list.find((e) => e.field)?.field;
    if (first) document.getElementById(`fld-${first}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function save() {
    if (!config) return;
    const clientErrors = validateDeal(v, config);
    if (clientErrors.length) {
      applyErrors(clientErrors);
      toast.push("กรุณาแก้ไขข้อมูลที่ยังไม่ถูกต้องก่อนบันทึก", "error");
      return;
    }
    setSaving(true);
    const payload = {
      departmentId: v.departmentId,
      customer: v.customer,
      dealName: v.dealName,
      dealType: v.dealType,
      dealStatus: v.dealStatus,
      dealStage: v.dealStage,
      probability: v.probability,
      closedDate: v.closedDate,
      amount: v.amount,
      projectCode: v.projectCode || null,
      costSheetNo: v.costSheetNo || null,
      createdDate: v.createdDate,
    };
    try {
      if (isNew) await api("/api/deals", { method: "POST", body: payload });
      else await api(`/api/deals/${target}`, { method: "PUT", body: payload });
      toast.push("บันทึกข้อมูลเรียบร้อยแล้ว", "success");
      onSaved();
      onClose();
    } catch (e) {
      if (e instanceof ApiError && e.errors.length) {
        applyErrors(e.errors);
        toast.push(`บันทึกไม่สำเร็จ: ${e.errors.length} จุดต้องแก้ไข`, "error");
      } else {
        toast.push(e instanceof ApiError ? e.message : "บันทึกไม่สำเร็จ", "error");
      }
    } finally {
      setSaving(false);
    }
  }

  async function addNote() {
    if (!noteText.trim() || isNew || target === null) return;
    try {
      const updated = await api<Deal>(`/api/deals/${target}/notes`, {
        method: "POST",
        body: { text: noteText.trim() },
      });
      setDeal(updated);
      setNoteText("");
    } catch (e) {
      toast.push(e instanceof ApiError ? e.message : "เพิ่ม note ไม่สำเร็จ", "error");
    }
  }

  if (target === null) return null;
  const deptLocked = !isAdmin;

  return (
    <Modal open onClose={() => { if (!saving) onClose(); }}>
      <div className="modal-head">
        <div>
          <h3>{isNew ? "สร้าง Deal ใหม่" : `แก้ไข Deal — ${deal?.recordId ?? ""}`}</h3>
          <div className="sub">
            {isNew
              ? "กรอกข้อมูลดีลใหม่ให้ครบก่อนบันทึก"
              : deal
              ? `${deal.customer} · ${deal.dealName}`
              : "…"}
          </div>
        </div>
        <button className="icon-x" aria-label="ปิด" onClick={onClose}>
          <IcoClose size={15} />
        </button>
      </div>

      <div className="modal-tabs">
        <button className={`mtab${tab === "info" ? " active" : ""}`} onClick={() => setTab("info")}>
          ข้อมูล Deal
        </button>
        <button
          className={`mtab${tab === "notes" ? " active" : ""}`}
          onClick={() => setTab("notes")}
          disabled={isNew}
        >
          Notes &amp; ประวัติ
        </button>
      </div>

      {loading || !config ? (
        <div className="mpanel" style={{ textAlign: "center", padding: "48px 0" }}>
          <div className="spinner" style={{ margin: "0 auto" }} />
        </div>
      ) : tab === "info" ? (
        <div className="mpanel">
          {deal?.legacyMigrated && deal.migrationRemark && (
            <div className="warn-banner">
              <IcoAlertTriangle size={15} />
              <span>ข้อมูลนี้ import จาก Excel เดิมและไม่ตรงกฎ: {deal.migrationRemark} — แก้ไขให้ตรงกฎก่อนกดบันทึก</span>
            </div>
          )}
          <div className="form-grid">
            <FF id="departmentId" label="แผนก" required error={errors.departmentId}>
              <select value={v.departmentId ?? ""} disabled={deptLocked} onChange={(e) => set("departmentId", e.target.value ? Number(e.target.value) : null)}>
                <option value="">— เลือกแผนก —</option>
                {config.departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code} — {d.name}
                  </option>
                ))}
              </select>
            </FF>

            <FF id="dealOwner" label="Deal Owner (ล็อกตามแผนก)" readonly>
              <input value={dealOwner} disabled />
            </FF>

            <FF id="customer" label="ลูกค้า" required error={errors.customer}>
              <input value={v.customer} onChange={(e) => set("customer", e.target.value)} />
            </FF>

            <FF id="dealType" label="Deal Type" required error={errors.dealType}>
              <select value={v.dealType} onChange={(e) => set("dealType", e.target.value)}>
                <option value="">— เลือก —</option>
                {config.dealTypes.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </FF>

            <FF id="dealName" label="Deal Name" required span2 error={errors.dealName}>
              <textarea value={v.dealName} onChange={(e) => set("dealName", e.target.value)} />
            </FF>

            <FF id="probability" label="Probability" required error={errors.probability || liveHint || undefined}>
              <select value={v.probability} onChange={(e) => set("probability", e.target.value)}>
                <option value="">— เลือก —</option>
                {config.probabilities.map((p) => (
                  <option key={p.probability}>{p.probability}</option>
                ))}
              </select>
            </FF>

            <FF id="situation" label="Situation (คำนวณอัตโนมัติ)" readonly>
              <input value={situation} disabled />
            </FF>

            <FF id="dealStatus" label="Deal Status" required error={errors.dealStatus}>
              <select disabled={!v.probability} value={v.dealStatus} onChange={(e) => set("dealStatus", e.target.value)}>
                <option value="">— เลือก —</option>
                {statusOptions.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </FF>

            <FF id="dealStage" label="Deal Stage" required error={errors.dealStage}>
              <select value={v.dealStage} disabled={!v.dealStatus} onChange={(e) => set("dealStage", e.target.value)}>
                <option value="">— เลือก —</option>
                {stageOptions.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </FF>

            <FF id="closedDate" label="Closed Date (เดือน/ปี)" required error={errors.closedDate}>
              <input type="month" value={v.closedDate} onChange={(e) => set("closedDate", e.target.value)} />
            </FF>

            <FF id="amount" label="Amount (บาท)" required error={errors.amount}>
              <input
                value={v.amount}
                inputMode="numeric"
                onChange={(e) => set("amount", e.target.value)}
                onBlur={() => {
                  const n = v.amount.replace(/,/g, "");
                  if (/^\d+$/.test(n)) set("amount", Number(n).toLocaleString("en-US"));
                }}
              />
            </FF>

            <FF id="projectCode" label="รหัสโครงการ">
              <input placeholder="ไม่บังคับ" value={v.projectCode} onChange={(e) => set("projectCode", e.target.value)} />
            </FF>

            <FF id="costSheetNo" label="Cost sheet No.">
              <input placeholder="ไม่บังคับ" value={v.costSheetNo} onChange={(e) => set("costSheetNo", e.target.value)} />
            </FF>

            <FF
              id="createdDate"
              label={
                <>
                  Created Date <span className="req">*</span>{" "}
                  <span className="field-today" onClick={() => set("createdDate", todayIso())}>
                    วันนี้
                  </span>
                </>
              }
              rawLabel
              error={errors.createdDate}
            >
              <input type="date" value={v.createdDate} onChange={(e) => set("createdDate", e.target.value)} />
            </FF>
          </div>
        </div>
      ) : (
        <div className="mpanel">
          <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Note Timeline</div>
          {(deal?.notes ?? []).length === 0 && (
            <div className="cell-muted" style={{ fontSize: 13, padding: "8px 0" }}>
              ยังไม่มี note
            </div>
          )}
          {deal?.notes.map((n) => (
            <div className="note-item" key={n.id}>
              <div className="avatar">{n.authorName?.[0] ?? "?"}</div>
              <div>
                <div className="note-head">
                  <b>{n.authorName}</b>
                  <span>{formatDateTime(n.createdAt)}</span>
                </div>
                <div className="note-text">{n.text}</div>
              </div>
            </div>
          ))}
          <div className="note-compose">
            <textarea
              placeholder="เพิ่ม note ใหม่..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
            <button className="btn btn-primary" style={{ alignSelf: "flex-end" }} onClick={addNote} disabled={!noteText.trim()}>
              เพิ่ม Note
            </button>
          </div>

          <div style={{ fontSize: 12.5, fontWeight: 700, margin: "20px 0 4px" }}>ประวัติการแก้ไข (Change History)</div>
          {(deal?.history ?? []).length === 0 && (
            <div className="cell-muted" style={{ fontSize: 12.5, padding: "8px 0" }}>
              ยังไม่มีประวัติการแก้ไข
            </div>
          )}
          {deal?.history.map((h) => (
            <div className="hist-row" key={h.id}>
              <div className="hist-time">{formatDateTime(h.changedAt)}</div>
              <div className="hist-diff">
                {h.changedByName} แก้ <b>{h.field}</b>: <span className="from">{h.oldValue ?? "—"}</span> →{" "}
                <span className="to">{h.newValue ?? "—"}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="modal-foot">
        <button className="btn" onClick={onClose}>
          ยกเลิก
        </button>
        <button className="btn btn-primary" onClick={save} disabled={saving || loading}>
          {saving ? "กำลังบันทึก…" : "บันทึก"}
        </button>
      </div>
    </Modal>
  );
}

function FF({
  id,
  label,
  required,
  span2,
  readonly,
  rawLabel,
  error,
  children,
}: {
  id: string;
  label: React.ReactNode;
  required?: boolean;
  span2?: boolean;
  readonly?: boolean;
  rawLabel?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      id={`fld-${id}`}
      className={`form-field${span2 ? " span2" : ""}${readonly ? " readonly" : ""}${error ? " has-error" : ""}`}
    >
      <label>
        {label}
        {!rawLabel && required && <span className="req"> *</span>}
      </label>
      {children}
      {error && <div className="field-err">{error}</div>}
    </div>
  );
}
