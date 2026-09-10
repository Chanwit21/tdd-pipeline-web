"use client";

import { useEffect } from "react";
import { IcoFilter } from "@/components/icons";

/* ---------- PageHead ---------- */
export function PageHead({
  title,
  subtitle,
  icon,
  actions,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="page-head">
      <div>
        <h1>
          {icon}
          {title}
        </h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}

/* ---------- Panel ---------- */
export function Panel({
  title,
  extra,
  children,
  bodyPad = true,
}: {
  title?: React.ReactNode;
  extra?: React.ReactNode;
  children: React.ReactNode;
  bodyPad?: boolean;
}) {
  return (
    <div className="panel">
      {title && (
        <div className="panel-head">
          <h3>{title}</h3>
          {extra}
        </div>
      )}
      {bodyPad ? <div className="panel-body">{children}</div> : children}
    </div>
  );
}

/* ---------- FilterBar ---------- */
export function FilterBar({
  title = "ตัวกรอง",
  embedded = false,
  cols,
  children,
  actions,
}: {
  title?: string;
  cols?: 4 | 5 | 6;
  embedded?: boolean;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className={embedded ? "filter-section" : "panel"}>
      <div className="filter-title">
        <IcoFilter size={14} /> {title}
      </div>
      <div className={`filter-grid${cols ? ` cols-${cols}` : ""}`}>{children}</div>
      {actions && <div className="filter-actions">{actions}</div>}
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="field">
      {label !== undefined && <label>{label || " "}</label>}
      {children}
    </div>
  );
}

/** Native <select> with a leading "ทั้งหมด" option when `all` is set. */
export function Select({
  value,
  onChange,
  options,
  all,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  all?: string;
  disabled?: boolean;
}) {
  return (
    <select value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
      {all !== undefined && <option value="">{all}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/* ---------- Badge ---------- */
export type BadgeTone = "warning" | "success" | "danger" | "info" | "slate" | "accent";
export function Badge({ tone, children }: { tone: BadgeTone; children: React.ReactNode }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

const STAGE_GREEN = ["Won", "PO"];
const STAGE_GREY = ["Lost", "Cancelled", "On Hold"];
export function StageBadge({ stage }: { stage: string }) {
  const tone: BadgeTone = STAGE_GREEN.includes(stage) ? "success" : STAGE_GREY.includes(stage) ? "slate" : "accent";
  return <Badge tone={tone}>{stage}</Badge>;
}
export function StatusBadge({ status }: { status: string }) {
  const tone: BadgeTone = status === "PR" ? "info" : status === "Inactive" ? "slate" : "warning";
  return <Badge tone={tone}>{status}</Badge>;
}
export function SituationBadge({ situation }: { situation: string }) {
  const tone: BadgeTone =
    situation === "Best Case" ? "success" : situation === "Worst Case" ? "danger" : "warning";
  return <Badge tone={tone}>{situation}</Badge>;
}

/* ---------- Pager ---------- */
export function Pager({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}) {
  const tp = Math.max(totalPages, 1);
  return (
    <div className="pager">
      <button disabled={page <= 1} onClick={() => onPage(page - 1)}>
        ‹
      </button>
      <button className="on">{page}</button>
      <button disabled={page >= tp} onClick={() => onPage(page + 1)}>
        ›
      </button>
    </div>
  );
}

/* ---------- Subtabs ---------- */
export function Subtabs<T extends string>({
  value,
  onChange,
  items,
  style,
}: {
  value: T;
  onChange: (v: T) => void;
  items: { value: T; label: string }[];
  style?: React.CSSProperties;
}) {
  return (
    <div className="subtabs" style={style}>
      {items.map((it) => (
        <button
          key={it.value}
          className={`subtab${value === it.value ? " active" : ""}`}
          onClick={() => onChange(it.value)}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- Modal ---------- */
export function Modal({
  open,
  onClose,
  children,
  width,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" style={width ? { maxWidth: width } : undefined} onMouseDown={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

/* ---------- Spinner ---------- */
export function CenterSpinner() {
  return (
    <div className="center-screen">
      <div className="spinner" />
    </div>
  );
}
