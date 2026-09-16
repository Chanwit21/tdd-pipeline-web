"use client";

import * as RadixDialog from "@radix-ui/react-dialog";
import { HTMLAttributes } from "react";
import { cn } from "./cn";

export const Dialog = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;

export function DialogContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 z-[100] bg-[rgba(15,18,30,0.45)] data-[state=open]:animate-in data-[state=open]:fade-in" />
      <RadixDialog.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-[101] w-full max-w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)] max-h-[80vh] overflow-y-auto",
          className
        )}
        {...props}
      >
        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}

export function DialogHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "sticky top-0 flex items-center justify-between gap-3 border-b border-border bg-white px-5 py-4",
        className
      )}
      {...props}
    />
  );
}

export const DialogTitle = RadixDialog.Title;
export const DialogClose = RadixDialog.Close;
