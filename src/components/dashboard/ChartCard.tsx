import { ReactNode } from "react";
import { Card } from "./ui/Card";

export function ChartCard({ title, extra, children }: { title: string; extra?: ReactNode; children: ReactNode }) {
  return (
    <Card className="flex-1">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-[13px] font-bold text-[#161c2c]">{title}</h3>
        {extra}
      </div>
      {children}
    </Card>
  );
}
