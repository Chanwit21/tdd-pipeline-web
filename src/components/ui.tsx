"use client";

import { useEffect, useRef } from "react";
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
  onSubmit,
}: {
  title?: string;
  cols?: 4 | 5 | 6;
  embedded?: boolean;
  children: React.ReactNode;
  actions?: React.ReactNode;
  /** Wraps the fields+actions in a <form>, so pressing Enter in any field triggers this (same as clicking the primary action). */
  onSubmit?: () => void;
}) {
  const body = (
    <>
      <div className={`filter-grid${cols ? ` cols-${cols}` : ""}`}>{children}</div>
      {actions && <div className="filter-actions">{actions}</div>}
    </>
  );
  return (
    <div className={embedded ? "filter-section" : "panel"}>
      <div className="filter-title">
        <IcoFilter size={14} /> {title}
      </div>
      {onSubmit ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          {body}
        </form>
      ) : (
        body
      )}
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
      <button aria-label="หน้าก่อนหน้า" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        ‹
      </button>
      <button className="on" aria-current="page">{page}</button>
      <button aria-label="หน้าถัดไป" disabled={page >= tp} onClick={() => onPage(page + 1)}>
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
const FOCUSABLE = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

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
  const ref = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    // Depends only on `open` (not `onClose`, which callers pass as a fresh inline
    // function on every render): otherwise this effect would tear down and rebuild
    // on every keystroke inside the modal, breaking the focus trap mid-interaction.
    if (!open) return;
    restoreFocus.current = document.activeElement as HTMLElement | null;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (e.key === "Tab" && ref.current) {
        const list = Array.from(ref.current.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (!list.length) return;
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      const firstFocusable = ref.current?.querySelector<HTMLElement>(FOCUSABLE);
      (firstFocusable ?? ref.current)?.focus();
    }, 0);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      window.clearTimeout(focusTimer);
      restoreFocus.current?.focus?.();
    };
  }, [open]);

  if (!open) return null;
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="modal"
        ref={ref}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        style={width ? { maxWidth: width } : undefined}
        onMouseDown={(e) => e.stopPropagation()}
      >
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

/** Placeholder table rows that reserve real row height, so a table doesn't collapse to a single line while loading. */
export function SkeletonRows({ cols, rows = 5 }: { cols: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr className="skel-row" key={r} aria-hidden="true">
          {Array.from({ length: cols }).map((__, c) => (
            <td key={c}>
              <span className="skel" style={{ width: `${55 + ((r * 13 + c * 29) % 40)}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
