"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";

function ActivateForm() {
  const { activate } = useAuth();
  const token = useSearchParams().get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!token) {
    return <div className="login-error">ลิงก์ไม่ถูกต้อง — กรุณาใช้ลิงก์จากอีเมลที่ได้รับ</div>;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("กรุณากรอกรหัสผ่านอย่างน้อย 8 ตัวอักษร");
      return;
    }
    if (password !== confirm) {
      setError("รหัสผ่านทั้งสองช่องไม่ตรงกัน");
      return;
    }
    setBusy(true);
    try {
      await activate(token, password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "ตั้งรหัสผ่านไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="login-form" onSubmit={submit}>
      {error && <div className="login-error">{error}</div>}
      <div className="form-field">
        <label>รหัสผ่านใหม่</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          autoComplete="new-password"
        />
      </div>
      <div className="form-field">
        <label>ยืนยันรหัสผ่าน</label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
        />
      </div>
      <button type="submit" className="btn-login" disabled={busy}>
        {busy ? "กำลังตั้งรหัสผ่าน…" : "ตั้งรหัสผ่านและเข้าสู่ระบบ"}
      </button>
    </form>
  );
}

export default function ActivatePage() {
  return (
    <div className="login-screen">
      <div className="login-panel" style={{ width: "100%" }}>
        <div className="login-card">
          <h1>ตั้งรหัสผ่านบัญชีของคุณ</h1>
          <p className="lede">กรอกรหัสผ่านใหม่เพื่อเปิดใช้งานบัญชี TDD Pipeline ของคุณ</p>
          <Suspense fallback={null}>
            <ActivateForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
