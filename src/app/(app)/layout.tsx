"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { CenterSpinner } from "@/components/ui";
import { ViewerPendingScreen } from "@/components/ViewerPendingScreen";

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  if (loading || !user) return <CenterSpinner />;
  // Viewer has no data access anywhere in the app (see VIEWER-ROLE-DESIGN.md) —
  // stop here before any page underneath tries to fetch and gets a 403.
  if (user.role === "VIEWER") return <ViewerPendingScreen />;
  return <AppShell>{children}</AppShell>;
}
