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

let createdYearsCache: number[] | null = null;

export function useCreatedYears(): number[] {
  const [years, setYears] = useState<number[]>(createdYearsCache ?? []);
  useEffect(() => {
    if (createdYearsCache) return;
    api<number[]>("/api/deals/created-years").then((y) => {
      createdYearsCache = y;
      setYears(y);
    });
  }, []);
  return years;
}

export function invalidateCreatedYears() {
  createdYearsCache = null;
}

let closedYearsCache: number[] | null = null;

export function useClosedYears(): number[] {
  const [years, setYears] = useState<number[]>(closedYearsCache ?? []);
  useEffect(() => {
    if (closedYearsCache) return;
    api<number[]>("/api/deals/closed-years").then((y) => {
      closedYearsCache = y;
      setYears(y);
    });
  }, []);
  return years;
}

export function invalidateClosedYears() {
  closedYearsCache = null;
}
