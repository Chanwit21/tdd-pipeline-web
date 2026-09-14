"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { setToken } from "@/lib/api";
import { CenterSpinner } from "@/components/ui";

export default function AzureCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      setToken(token);
      window.history.replaceState({}, "", "/auth/azure/callback");
      window.location.replace("/dashboard");
    } else {
      router.push("/login?error=AZURE-TOKEN-EXCHANGE-FAILED");
    }
  }, [router]);

  return <CenterSpinner />;
}
