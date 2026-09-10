"use client";

import { useEffect, useRef, useState } from "react";

// Empty array means all. A separate explicit sentinel represents selecting none.
export const NONE = "-1";
export function MultiCheckbox({ value, onChange, options, label }: {
  value: string[]; onChange: (value: string[]) => void;
  options: { value: string; label: string }[]; label: string;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const allBox = useRef<HTMLInputElement>(null);
  const selected = value.length === 0 ? options.map(o => o.value) : value.filter(v => v !== NONE);
  const all = options.length > 0 && selected.length === options.length;
  useEffect(() => { if (allBox.current) allBox.current.indeterminate = selected.length > 0 && !all; }, [all, selected.length]);
  useEffect(() => {
    const close = (e: MouseEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  function toggle(v: string) {
    const next = selected.includes(v) ? selected.filter(x => x !== v) : [...selected, v];
    onChange(next.length === options.length ? [] : next.length ? next : [NONE]);
  }
  const summary = value.length === 0 ? "ทั้งหมด" : selected.length === 0 ? "ไม่ได้เลือก" : options.filter(o => selected.includes(o.value)).map(o => o.label).join(", ");
  return <div className="multi-select" ref={root} onKeyDown={e => { if (e.key === "Escape") { setOpen(false); root.current?.querySelector("button")?.focus(); } }}>
    <button type="button" className="multi-trigger" aria-label={label} aria-expanded={open} onClick={() => setOpen(!open)} title={summary}><span>{summary}</span><span aria-hidden>⌄</span></button>
    {open && <div className="multi-options" role="group" aria-label={label}>
      <label><input ref={allBox} type="checkbox" checked={all} disabled={!options.length} onChange={() => onChange(all ? [NONE] : [])} />เลือกทั้งหมด</label>
      {options.map(o => <label key={o.value}><input type="checkbox" checked={selected.includes(o.value)} onChange={() => toggle(o.value)} />{o.label}</label>)}
      {!options.length && <span>ไม่มีตัวเลือก</span>}
    </div>}
  </div>;
}
