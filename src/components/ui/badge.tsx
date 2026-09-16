import { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./cn";

const badgeVariants = cva("inline-flex items-center rounded-full px-3 py-1 text-xs font-bold", {
  variants: {
    tone: {
      warning: "bg-warning-weak text-warning",
      success: "bg-success-weak text-success",
      danger: "bg-danger-weak text-danger",
      info: "bg-info-weak text-info",
      slate: "bg-[#F0F1F5] text-[#5b6577]",
      accent: "bg-accent-weak text-accent",
    },
  },
  defaultVariants: { tone: "slate" },
});

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
