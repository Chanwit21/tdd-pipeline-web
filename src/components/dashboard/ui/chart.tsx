"use client";

import * as React from "react";
import { ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { cn } from "./cn";

export type ChartConfig = Record<
  string,
  { label: React.ReactNode; color: string }
>;

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null);

export function ChartContainer({
  config,
  className,
  children,
}: {
  config: ChartConfig;
  className?: string;
  children: React.ReactElement;
}) {
  const style = Object.fromEntries(
    Object.entries(config).map(([key, value]) => [`--color-${key}`, value.color])
  ) as React.CSSProperties;

  return (
    <ChartContext.Provider value={{ config }}>
      <div className={cn("dashboard-shadcn-scope w-full", className)} style={style}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

export const ChartTooltip = RechartsTooltip;

export function ChartTooltipContent({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color?: string; dataKey?: string }[];
  label?: string;
  formatter?: (value: number, name: string) => string;
}) {
  const { config } = React.useContext(ChartContext) ?? { config: {} as ChartConfig };
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[#f0e6da] bg-white px-3 py-2 text-xs shadow-[0_12px_28px_-16px_rgba(255,122,31,0.35)]">
      {label && <div className="mb-1 font-semibold text-[#161c2c]">{label}</div>}
      {payload.map((item) => {
        const key = item.dataKey ?? item.name;
        const entry = config[key];
        return (
          <div key={key} className="flex items-center gap-2 py-0.5">
            <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
            <span className="text-[#6c7486]">{entry?.label ?? item.name}</span>
            <span className="ml-auto font-semibold text-[#161c2c]">
              {formatter ? formatter(item.value, key) : item.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
