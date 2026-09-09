"use client";

import { useEffect, useState } from "react";
import { api } from "./api";
import type { MasterConfig } from "./types";

let cache: MasterConfig | null = null;

export function useMasterConfig() {
  const [config, setConfig] = useState<MasterConfig | null>(cache);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (cache) return;
    api<MasterConfig>("/api/master-config")
      .then((c) => {
        cache = c;
        setConfig(c);
      })
      .finally(() => setLoading(false));
  }, []);

  return { config, loading };
}

export function invalidateMasterConfig() {
  cache = null;
}
