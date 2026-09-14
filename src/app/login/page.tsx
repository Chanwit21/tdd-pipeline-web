"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { ApiError, API_BASE } from "@/lib/api";

const AZURE_ERROR_MESSAGES: Record<string, string> = {
  "AZURE-NO-ACCOUNT": "ไม่พบบัญชีผู้ใช้ที่ตรงกับอีเมลนี้ในระบบ — ติดต่อ Admin เพื่อสร้างบัญชีก่อน",
  "AZURE-STATE-INVALID": "เซสชันการเข้าสู่ระบบหมดอายุหรือถูกใช้ไปแล้ว กรุณาลองใหม่อีกครั้ง",
  "AZURE-TOKEN-EXCHANGE-FAILED": "เข้าสู่ระบบด้วย Microsoft ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
  "AZURE-NOT-CONFIGURED": "ยังไม่ได้ตั้งค่า Azure AD สำหรับสภาพแวดล้อมนี้",
  "AZURE-SIGNIN-CANCELLED": "การเข้าสู่ระบบด้วย Microsoft ถูกยกเลิก",
};

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const azureError = params.get("error");
    if (azureError) {
      setError(AZURE_ERROR_MESSAGES[azureError] || "เข้าสู่ระบบด้วย Microsoft ไม่สำเร็จ");
      return;
    }
    if (params.get("method") === "azure") {
      window.location.href = `${API_BASE}/api/auth/azure/login`;
    }
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(username.trim(), password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-visual">
        <div className="login-brand">
          <div className="brand-mark">TP</div>
          <div>
            <b>TDD Pipeline</b>
            <span>Sales Pipeline Console</span>
          </div>
        </div>

        <div className="login-headline">
          <div className="eyebrow">Sales Pipeline Console</div>
          <h2>จัดการ Sales Pipeline ทุกแผนกในที่เดียว แทน Excel ที่แก้ทับกันไม่ได้</h2>
          <p>
            ติดตามดีล, ตรวจสอบความสอดคล้องของข้อมูลอัตโนมัติ และดูรายงาน PR by Team, SMT QBR,
            Pipeline by Team แบบเรียลไทม์
          </p>
        </div>

        <div>
          <div className="login-stats">
            <div className="login-stat">
              <b className="num">8</b>
              <span>แผนกที่ใช้งาน</span>
            </div>
            <div className="login-stat">
              <b className="num">3</b>
              <span>รายงานหลัก</span>
            </div>
            <div className="login-stat">
              <b className="num">24/7</b>
              <span>เข้าถึงได้ทุกที่</span>
            </div>
          </div>
          <div className="login-foot" style={{ marginTop: 18 }}>
            © 2569 G-ABLE-TDD · Internal Sales Operations
          </div>
        </div>
      </div>

      <div className="login-panel">
        <div className="login-card">
          <h1>เข้าสู่ระบบ</h1>
          <p className="lede">กรอกบัญชีผู้ใช้งานของคุณเพื่อเข้าใช้งาน TDD Pipeline</p>

          <form className="login-form" onSubmit={submit}>
            {error && <div className="login-error">{error}</div>}
            <div className="form-field">
              <label>Username</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus autoComplete="username" />
            </div>
            <div className="form-field">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="btn-login" disabled={busy}>
              {busy ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
            </button>
          </form>

          <div className="login-divider">หรือ</div>
          <a
            className="btn-login"
            style={{ display: "block", textAlign: "center", textDecoration: "none" }}
            href={`${API_BASE}/api/auth/azure/login`}
          >
            Sign in with Microsoft
          </a>

          <div className="login-divider">demo</div>
          <div className="login-role-hint">
            <span>
              ตัวอย่างบัญชี: <b>admin / admin1234</b> (Admin ทุกแผนก) ·{" "}
              <b>manager.irm / manager1234</b> (Manager แผนก IRM)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
