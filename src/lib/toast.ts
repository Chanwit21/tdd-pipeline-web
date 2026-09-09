"use client";

import { App } from "antd";

type Kind = "success" | "error" | "info" | "warning";

/** Thin wrapper over antd's App message API so call sites stay small. */
export function useToast() {
  const { message } = App.useApp();
  return {
    push: (text: string, kind: Kind = "info") => message[kind](text),
  };
}
