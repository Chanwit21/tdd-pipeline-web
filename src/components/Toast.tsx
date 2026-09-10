"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type Kind = "info" | "success" | "error";
interface Item { id: number; text: string; kind: Kind; }
interface ToastApi { push: (text: string, kind?: Kind) => void; }

const Ctx = createContext<ToastApi | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);

  const push = useCallback((text: string, kind: Kind = "info") => {
    const id = Date.now() + Math.random();
    setItems((p) => [...p, { id, text, kind }]);
    setTimeout(() => setItems((p) => p.filter((t) => t.id !== id)), 2800);
  }, []);

  const context = useMemo(() => ({ push }), [push]);
  return (
    <Ctx.Provider value={context}>
      {children}
      <div className="toast-wrap">
        {items.map((t) => (
          <div key={t.id} className={`toast ${t.kind}`}>
            {t.text}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast(): ToastApi {
  const c = useContext(Ctx);
  if (!c) throw new Error("useToast outside provider");
  return c;
}
