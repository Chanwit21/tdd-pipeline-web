"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spin } from "antd";
import { useAuth } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="grid h-screen place-items-center">
        <Spin size="large" />
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
