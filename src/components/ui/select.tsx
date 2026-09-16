"use client";

import * as RadixSelect from "@radix-ui/react-select";
import { cn } from "./cn";

export function Select({
  value,
  onChange,
  options,
  all,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  all?: string;
  disabled?: boolean;
}) {
  return (
    <RadixSelect.Root value={value || "__all__"} onValueChange={(v) => onChange(v === "__all__" ? "" : v)} disabled={disabled}>
      <RadixSelect.Trigger className="flex w-full items-center justify-between rounded-lg border border-border bg-white px-2.5 py-2 text-[13px] text-text focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-weak">
        <RadixSelect.Value />
        <RadixSelect.Icon>⌄</RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content className="z-[110] overflow-hidden rounded-lg border border-border bg-white shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
          <RadixSelect.Viewport className="p-1">
            {all !== undefined && (
              <RadixSelect.Item
                value="__all__"
                className={cn("cursor-pointer rounded-md px-2.5 py-1.5 text-[13px] outline-none data-[highlighted]:bg-accent-weak")}
              >
                <RadixSelect.ItemText>{all}</RadixSelect.ItemText>
              </RadixSelect.Item>
            )}
            {options.map((o) => (
              <RadixSelect.Item
                key={o.value}
                value={o.value}
                className={cn("cursor-pointer rounded-md px-2.5 py-1.5 text-[13px] outline-none data-[highlighted]:bg-accent-weak")}
              >
                <RadixSelect.ItemText>{o.label}</RadixSelect.ItemText>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
