import { ButtonHTMLAttributes, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./cn";

const buttonVariants = cva(
  // appearance-none + border-0 + explicit bg-transparent: preflight is off
  // app-wide (ADR-0009/Task 11), so a bare <button> otherwise inherits the
  // browser's native chrome (background, border, padding) underneath these
  // utility classes — every variant below must set its own bg/border on
  // top of this reset, never rely on the browser default being invisible.
  "inline-flex cursor-pointer appearance-none items-center justify-center gap-2 rounded-lg border-0 bg-transparent font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
  {
    variants: {
      variant: {
        default: "bg-accent text-white hover:brightness-95",
        outline: "border border-border bg-white text-text hover:border-accent hover:text-accent",
        ghost: "bg-transparent text-text-muted hover:bg-surface-2",
      },
      size: {
        default: "text-[13px] px-4 py-2",
        sm: "text-[12.5px] px-3 py-1.5",
        icon: "h-7 w-7 p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
);
Button.displayName = "Button";
