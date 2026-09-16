"use client";

import { useAuth } from "@/lib/auth";

export function ViewerPendingScreen() {
  const { user, logout } = useAuth();
  return (
    <div className="app">
      <div className="main" style={{ width: "100%" }}>
        <header className="topbar">
          <div className="breadcrumb">
            <span className="crumb-root">TDD Pipeline</span>
          </div>
          <div className="topbar-right">
            <button className="btn btn-sm" onClick={logout}>
              ออกจากระบบ
            </button>
          </div>
        </header>
        <main className="content" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
          <div className="panel panel-body" style={{ maxWidth: 420, textAlign: "center" }}>
            <h1 style={{ fontSize: 18, marginBottom: 8 }}>รอ Admin กำหนดสิทธิ์การใช้งาน</h1>
            <p style={{ color: "var(--text-muted)", fontSize: 13.5 }}>
              บัญชี <b>{user?.fullName}</b> เข้าสู่ระบบสำเร็จแล้ว แต่ยังไม่ได้รับสิทธิ์การใช้งาน
              — กรุณาติดต่อ Admin เพื่อกำหนด Role ให้กับบัญชีของคุณ
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
