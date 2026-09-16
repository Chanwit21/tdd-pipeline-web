"use client";

import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";
import { formatAmount } from "@/lib/format";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";

// Amount uses the brand's info-blue (already used on the Total Pipeline KPI
// card) so it reads clearly against the orange dealCount bars — same
// overall brand palette, just paired for contrast instead of orange-on-orange.
const config: ChartConfig = {
  dealCount: { label: "จำนวนดีล", color: "#ffcfa0" },
  amount: { label: "Amount", color: "#2058c9" },
};

export function YearTrendChart({ data }: { data: { year: number; dealCount: number; amount: number }[] }) {
  if (!data.length) return <span className="text-sm text-[#6c7486]">ไม่พบข้อมูล</span>;
  const ariaLabel = `กราฟสรุปตามปีที่สร้าง: ${data.map((r) => `${r.year} ${r.dealCount} ดีล ${formatAmount(r.amount)} บาท`).join(", ")}`;
  return (
    <ChartContainer config={config} className="h-[220px]" ariaLabel={ariaLabel}>
      <ComposedChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} stroke="#eef0f5" />
        <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#161c2c", fontWeight: 700 }} />
        <YAxis yAxisId="count" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#6c7486" }} width={28} />
        <YAxis yAxisId="amount" orientation="right" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#6c7486" }} width={0} hide />
        <ChartTooltip
          content={<ChartTooltipContent formatter={(v, key) => (key === "amount" ? formatAmount(v) : `${v} ดีล`)} />}
          cursor={{ fill: "#fff0e2" }}
        />
        <Bar yAxisId="count" dataKey="dealCount" fill="var(--color-dealCount)" radius={[6, 6, 0, 0]} barSize={22} />
        <Line
          yAxisId="amount"
          dataKey="amount"
          type="monotone"
          stroke="var(--color-amount)"
          strokeWidth={2.5}
          dot={{ r: 3.5, fill: "var(--color-amount)", strokeWidth: 2, stroke: "#fff" }}
        />
      </ComposedChart>
    </ChartContainer>
  );
}
