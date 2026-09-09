"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Layout, Menu, Avatar, Dropdown, Button, Grid } from "antd";
import {
  DashboardOutlined,
  FundOutlined,
  BarChartOutlined,
  TeamOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/lib/auth";

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

type Item = { key: string; label: string; icon: React.ReactNode; adminOnly?: boolean };

const NAV: Item[] = [
  { key: "/dashboard", label: "Dashboard", icon: <DashboardOutlined /> },
  { key: "/pipeline", label: "Sales Pipeline", icon: <FundOutlined /> },
  { key: "/reports/pr-by-team", label: "PR by Team", icon: <BarChartOutlined /> },
  { key: "/reports/smt-qbr", label: "SMT QBR", icon: <BarChartOutlined /> },
  { key: "/reports/pipeline-by-team", label: "Pipeline by Team", icon: <BarChartOutlined /> },
  { key: "/admin/users", label: "จัดการผู้ใช้งาน", icon: <TeamOutlined />, adminOnly: true },
  { key: "/admin/master-config", label: "Master Config", icon: <SettingOutlined />, adminOnly: true },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const screens = useBreakpoint();
  const [collapsed, setCollapsed] = useState(false);

  const isAdmin = user?.role === "ADMIN";
  const items = NAV.filter((n) => !n.adminOnly || isAdmin).map((n) => ({
    key: n.key,
    label: n.label,
    icon: n.icon,
  }));

  const selectedKey =
    NAV.map((n) => n.key)
      .filter((k) => pathname === k || pathname.startsWith(k + "/"))
      .sort((a, b) => b.length - a.length)[0] ?? pathname;

  const sider = (
    <Sider
      theme="dark"
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      breakpoint="lg"
      width={232}
      style={{ position: "sticky", top: 0, height: "100vh" }}
    >
      <div className="flex items-center gap-2 px-4 py-4 text-white">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--accent)] font-bold">
          T
        </div>
        {!collapsed && <span className="font-semibold">TDD Pipeline</span>}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        items={items}
        onClick={({ key }) => router.push(key)}
      />
    </Sider>
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {screens.lg !== false && sider}
      <Layout>
        <Header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingInline: 20,
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div className="flex items-center gap-3">
            {screens.lg === false && (
              <Button type="text" icon={<MenuOutlined />} onClick={() => router.push("/dashboard")} />
            )}
            <span className="font-semibold">
              {user?.role === "ADMIN" ? "มุมมอง Admin — ทุกแผนก" : `แผนก ${user?.departmentCode ?? ""}`}
            </span>
          </div>
          <Dropdown
            menu={{
              items: [
                { key: "logout", label: "ออกจากระบบ", icon: <LogoutOutlined />, onClick: logout },
              ],
            }}
          >
            <div className="flex cursor-pointer items-center gap-2">
              <Avatar style={{ backgroundColor: "var(--accent)" }} size="small">
                {user?.fullName?.[0] ?? "?"}
              </Avatar>
              <span className="hidden text-sm sm:inline">{user?.fullName}</span>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: 20 }}>
          <div style={{ maxWidth: 1280, marginInline: "auto" }}>{children}</div>
        </Content>
      </Layout>
    </Layout>
  );
}
