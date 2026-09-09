"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Layout, Menu, Avatar, Dropdown, Button, Grid } from "antd";
import type { MenuProps } from "antd";
import {
  AppstoreOutlined,
  BarsOutlined,
  BarChartOutlined,
  DatabaseOutlined,
  TeamOutlined,
  LogoutOutlined,
  LeftOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/lib/auth";

const { Sider, Content } = Layout;
const { useBreakpoint } = Grid;

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/pipeline": "Sales Pipeline",
  "/reports/pr-by-team": "Report — PR by Team",
  "/reports/smt-qbr": "Report — SMT QBR",
  "/reports/pipeline-by-team": "Report — Pipeline by Team",
  "/admin/users": "User Management",
  "/admin/master-config": "Master Data",
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const screens = useBreakpoint();
  const [collapsed, setCollapsed] = useState(false);
  const isAdmin = user?.role === "ADMIN";

  const items: MenuProps["items"] = [
    { key: "/dashboard", icon: <AppstoreOutlined />, label: "Dashboard" },
    { key: "/pipeline", icon: <BarsOutlined />, label: "Sales Pipeline" },
    {
      key: "report",
      icon: <BarChartOutlined />,
      label: "Report",
      children: [
        { key: "/reports/pr-by-team", label: "PR by Team" },
        { key: "/reports/smt-qbr", label: "SMT QBR" },
        { key: "/reports/pipeline-by-team", label: "Pipeline by Team" },
      ],
    },
    ...(isAdmin
      ? [
          {
            type: "group" as const,
            label: "จัดการระบบ",
            children: [
              { key: "/admin/master-config", icon: <DatabaseOutlined />, label: "Master Data" },
              { key: "/admin/users", icon: <TeamOutlined />, label: "User Management" },
            ],
          },
        ]
      : []),
  ];

  const selectedKey =
    Object.keys(TITLES)
      .filter((k) => pathname === k || pathname.startsWith(k + "/"))
      .sort((a, b) => b.length - a.length)[0] ?? pathname;
  const openKey = selectedKey.startsWith("/reports/") ? ["report"] : [];
  const currentTitle = TITLES[selectedKey] ?? "";

  const sider = (
    <Sider
      theme="dark"
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      breakpoint="lg"
      width={236}
      style={{ position: "sticky", top: 0, height: "100vh", overflow: "auto" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "18px 16px 20px" }}>
        <div
          style={{
            width: 36,
            height: 36,
            flex: "none",
            borderRadius: 10,
            display: "grid",
            placeItems: "center",
            fontWeight: 800,
            color: "#1a0e04",
            background: "linear-gradient(135deg,#ff7a1f,#ff9c4d)",
            boxShadow: "0 6px 16px -4px rgba(255,122,31,.55)",
          }}
        >
          TP
        </div>
        {!collapsed && (
          <div style={{ lineHeight: 1.25, color: "#fff" }}>
            <div style={{ fontWeight: 700 }}>TDD Pipeline</div>
            <div style={{ fontSize: 11, color: "#8890a8" }}>Sales Pipeline Console</div>
          </div>
        )}
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        defaultOpenKeys={openKey}
        items={items}
        onClick={({ key }) => key.startsWith("/") && router.push(key)}
      />
    </Sider>
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {screens.lg !== false && sider}
      <Layout>
        <header
          style={{
            height: 62,
            flex: "none",
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "0 22px",
            background: "#fff",
            borderBottom: "1px solid var(--border)",
            position: "sticky",
            top: 0,
            zIndex: 20,
          }}
        >
          {screens.lg === false ? (
            <Button type="text" icon={<BarsOutlined />} onClick={() => router.push("/dashboard")} />
          ) : (
            <button
              onClick={() => router.back()}
              aria-label="ย้อนกลับ"
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                border: "1px solid var(--border)",
                background: "#fff",
                cursor: "pointer",
                display: "grid",
                placeItems: "center",
              }}
            >
              <LeftOutlined style={{ fontSize: 12 }} />
            </button>
          )}
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, minWidth: 0 }}>
            <span style={{ fontSize: 12, color: "#9aa1b3", fontWeight: 600 }}>TDD Pipeline</span>
            <span style={{ color: "#9aa1b3" }}>/</span>
            <span style={{ fontSize: 14, fontWeight: 700 }}>{currentTitle}</span>
          </div>

          <Dropdown
            menu={{ items: [{ key: "logout", label: "ออกจากระบบ", icon: <LogoutOutlined />, onClick: logout }] }}
          >
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <Avatar style={{ backgroundColor: "var(--accent)", color: "#1a0e04", fontWeight: 700 }} size="small">
                {user?.fullName?.[0] ?? "?"}
              </Avatar>
              <span style={{ fontSize: 13 }} className="hidden sm:inline">
                {user?.fullName}
                <span style={{ color: "#9aa1b3" }}>
                  {" · "}
                  {isAdmin ? "Admin" : user?.departmentCode}
                </span>
              </span>
            </div>
          </Dropdown>
        </header>

        <Content style={{ padding: "22px 26px 60px" }}>
          <div style={{ maxWidth: 1280, marginInline: "auto" }}>{children}</div>
        </Content>
      </Layout>
    </Layout>
  );
}
