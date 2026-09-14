import { HTMLAttributes } from "react";
import { cn } from "./cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[#f0e6da] bg-white p-[18px] shadow-[0_12px_28px_-16px_rgba(255,122,31,0.25)]",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-3 flex items-start justify-between gap-2", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-[11px] font-semibold uppercase tracking-wide text-[#6c7486]", className)} {...props} />;
}
