"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";

const config: ChartConfig = {
  dealCount: { label: "จำนวนดีล", color: "hsl(var(--chart-1))" },
};

export function DepartmentBarChart({ data }: { data: { department: string; dealCount: number }[] }) {
  if (!data.length) return <span className="text-sm text-[#6c7486]">ไม่พบข้อมูล</span>;
  return (
    <ChartContainer config={config} className="h-[220px]">
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
        <CartesianGrid horizontal={false} stroke="#eef0f5" />
        <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#6c7486" }} />
        <YAxis
          type="category"
          dataKey="department"
          tickLine={false}
          axisLine={false}
          width={64}
          tick={{ fontSize: 11, fill: "#161c2c", fontWeight: 700 }}
        />
        <ChartTooltip content={<ChartTooltipContent formatter={(v) => `${v} ดีล`} />} cursor={{ fill: "#fff0e2" }} />
        <Bar dataKey="dealCount" fill="url(#dept-gradient)" radius={[0, 8, 8, 0]} barSize={18} />
        <defs>
          {/* Same gradient as the KPI accent icon chip, for visual consistency */}
          <linearGradient id="dept-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ff7a1f" />
            <stop offset="100%" stopColor="#ff9c4d" />
          </linearGradient>
        </defs>
      </BarChart>
    </ChartContainer>
  );
}
