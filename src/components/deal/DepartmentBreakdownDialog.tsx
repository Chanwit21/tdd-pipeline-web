"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const DEPT_ORDER = ["AMC", "AMO", "AMT", "IRM", "SPM", "TIN", "UXT", "SP1"];

function sortedDepts(bucket: { total: number; counts: Record<string, number> }) {
  return DEPT_ORDER.map((code) => ({ code, count: bucket.counts[code] ?? 0 })).sort((a, b) => b.count - a.count);
}

function DeptRow({ code, count, total, tone }: { code: string; count: number; total: number; tone: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-text">
        <span className="h-[7px] w-[7px] flex-none rounded-full" style={{ background: tone }} />
        {code}
      </div>
      <div className="flex items-center gap-2">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#EDEEF2]">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: tone }} />
        </div>
        <span className="whitespace-nowrap text-[11px] font-semibold text-text-muted">
          {count} ({pct}%)
        </span>
      </div>
    </div>
  );
}

export function DepartmentBreakdownDialog({
  open,
  onOpenChange,
  label,
  tone,
  bucket,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  label: string;
  tone: string;
  bucket: { total: number; counts: Record<string, number> };
}) {
  const rows = sortedDepts(bucket);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div>
            <DialogTitle className="text-[16px] font-extrabold text-text">{label}</DialogTitle>
            <div className="mt-0.5 text-xs text-text-muted">จำนวนแผนก {DEPT_ORDER.length} แผนก</div>
          </div>
        </DialogHeader>
        <div className="flex flex-col gap-3.5 p-5">
          {rows.map((r) => (
            <DeptRow key={r.code} code={r.code} count={r.count} total={bucket.total} tone={tone} />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
