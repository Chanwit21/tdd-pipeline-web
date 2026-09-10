"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  IcoDashboard,
  IcoPipeline,
  IcoReport,
  IcoMaster,
  IcoUsers,
  IcoBell,
  IcoChevronLeft,
  IcoMenu,
} from "@/components/icons";

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/pipeline": "Sales Pipeline",
  "/reports/pr-by-team": "Report · PR by Team",
  "/reports/smt-qbr": "Report · SMT QBR",
  "/reports/pipeline-by-team": "Report · Pipeline by Team",
  "/admin/master-config": "Master Data",
  "/admin/users": "User Management",
};

function initials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isAdmin = user?.role === "ADMIN";

  const nav = [
    { href: "/dashboard", label: "Dashboard", icon: <IcoDashboard /> },
    { href: "/pipeline", label: "Sales Pipeline", icon: <IcoPipeline /> },
    { href: "/reports/pr-by-team", label: "Report", icon: <IcoReport />, match: "/reports" },
  ];
  const adminNav = [
    { href: "/admin/master-config", label: "Master Data", icon: <IcoMaster /> },
    { href: "/admin/users", label: "User Management", icon: <IcoUsers /> },
  ];

  const active = (href: string, match?: string) =>
    pathname === href || pathname.startsWith((match ?? href) + "/") || pathname === match;

  const currentKey =
    Object.keys(TITLES)
      .filter((k) => pathname === k || pathname.startsWith(k + "/"))
      .sort((a, b) => b.length - a.length)[0] ?? pathname;
  const now = new Date();
  const dateStr = now.toLocaleDateString("th-TH", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  const timeStr = now.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="app">
      <aside className={`sidebar${open ? " open" : ""}`}>
        <div className="sidebar-inner">
          <div className="brand">
            <div className="brand-mark">TP</div>
            <div className="brand-text">
              <b>TDD Pipeline</b>
              <span>Sales Pipeline Console</span>
            </div>
          </div>

          <ul className="nav">
            {nav.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  className={`nav-item${active(n.href, n.match) ? " active" : ""}`}
                  onClick={() => setOpen(false)}
                >
                  {n.icon}
                  <span className="nav-text">{n.label}</span>
                </Link>
              </li>
            ))}

            {isAdmin && (
              <>
                <div className="nav-label">จัดการระบบ</div>
                {adminNav.map((n) => (
                  <li key={n.href}>
                    <Link
                      href={n.href}
                      className={`nav-item${active(n.href) ? " active" : ""}`}
                      onClick={() => setOpen(false)}
                    >
                      {n.icon}
                      <span className="nav-text">{n.label}</span>
                    </Link>
                  </li>
                ))}
              </>
            )}
          </ul>

          <div className="sidebar-footer">
            <div className="role-pill">
              <div className="avatar">{initials(user?.fullName)}</div>
              <div className="role-pill-text">
                <b>{user?.fullName}</b>
                <span>{isAdmin ? "Admin · ทุกแผนก" : `Manager · ${user?.departmentCode ?? ""}`}</span>
              </div>
            </div>
            <button className="sidebar-logout" onClick={logout}>
              ออกจากระบบ
            </button>
          </div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <button className="crumb-back topbar-menu" onClick={() => setOpen((o) => !o)} aria-label="เมนู">
            <IcoMenu size={14} />
          </button>
          <button
            className="crumb-back"
            onClick={() => (window.history.length > 1 ? router.back() : router.push("/dashboard"))}
            aria-label="ย้อนกลับ"
          >
            <IcoChevronLeft size={14} />
          </button>
          <div className="breadcrumb">
            <span className="crumb-root">TDD Pipeline</span>
            <span className="crumb-sep">/</span>
            <span className="crumb-current">{TITLES[currentKey] ?? ""}</span>
          </div>
          <div className="topbar-right">
            <div className="clock">
              <b>{dateStr}</b>
              <span>เวลา {timeStr} น.</span>
            </div>
            <div className="bell">
              <IcoBell size={16} />
              <span className="dot" />
            </div>
          </div>
        </header>

        <main className="content">{children}</main>
      </div>
    </div>
  );
}
