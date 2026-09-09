"use client";

import { useState } from "react";
import { Form, Input, Button, Card, Typography, Alert } from "antd";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export default function LoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onFinish = async (v: { username: string; password: string }) => {
    setError(null);
    setBusy(true);
    try {
      await login(v.username.trim(), v.password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="grid min-h-screen place-items-center p-4"
      style={{ background: "linear-gradient(135deg,#0f1830,#182446)" }}
    >
      <Card style={{ width: 360 }} styles={{ body: { padding: 28 } }}>
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--accent)] text-lg font-extrabold text-white">
            T
          </div>
          <div>
            <Typography.Title level={4} style={{ margin: 0 }}>
              TDD Pipeline
            </Typography.Title>
            <Typography.Text type="secondary">จัดการ Sales Pipeline</Typography.Text>
          </div>
        </div>

        {error && <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} />}

        <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: "กรุณากรอก Username" }]}
          >
            <Input size="large" autoFocus />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "กรุณากรอก Password" }]}
          >
            <Input.Password size="large" />
          </Form.Item>
          <Button type="primary" htmlType="submit" size="large" block loading={busy}>
            เข้าสู่ระบบ
          </Button>
        </Form>

        <Typography.Paragraph type="secondary" style={{ textAlign: "center", marginTop: 20, fontSize: 12 }}>
          ตัวอย่าง: admin / admin1234 · manager.irm / manager1234
        </Typography.Paragraph>
      </Card>
    </div>
  );
}
