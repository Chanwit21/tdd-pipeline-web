"use client";

import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Select, Switch, Tag, Space, Popconfirm } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/PageHeader";
import { api, ApiError } from "@/lib/api";
import { useMasterConfig } from "@/lib/hooks";
import { useToast } from "@/lib/toast";
import type { AdminUser, FieldError } from "@/lib/types";

type FormShape = {
  username: string;
  fullName: string;
  password?: string;
  role: "MANAGER" | "ADMIN";
  departmentId?: number;
  active: boolean;
};

export default function UserManagementPage() {
  const { config } = useMasterConfig();
  const toast = useToast();
  const [form] = Form.useForm<FormShape>();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const role = Form.useWatch("role", form);

  const load = () => {
    setLoading(true);
    api<AdminUser[]>("/api/admin/users")
      .then(setUsers)
      .finally(() => setLoading(false));
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  function openNew() {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ role: "MANAGER", active: true });
    setOpen(true);
  }
  function openEdit(u: AdminUser) {
    setEditing(u);
    form.resetFields();
    form.setFieldsValue({
      username: u.username,
      fullName: u.fullName,
      role: u.role,
      departmentId: u.departmentId ?? undefined,
      active: u.active,
    });
    setOpen(true);
  }

  async function submit() {
    const v = await form.validateFields();
    setSaving(true);
    try {
      const body = {
        username: v.username,
        fullName: v.fullName,
        password: v.password || null,
        role: v.role,
        departmentId: v.role === "MANAGER" ? v.departmentId : null,
        active: v.active,
      };
      if (editing) await api(`/api/admin/users/${editing.id}`, { method: "PUT", body });
      else await api("/api/admin/users", { method: "POST", body });
      toast.push("บันทึกผู้ใช้สำเร็จ", "success");
      setOpen(false);
      load();
    } catch (e) {
      if (e instanceof ApiError && e.errors.length) {
        form.setFields(
          (e.errors as FieldError[])
            .filter((x) => x.field)
            .map((x) => ({ name: x.field as string, errors: [x.message] })) as never,
        );
      } else {
        toast.push(e instanceof ApiError ? e.message : "บันทึกไม่สำเร็จ", "error");
      }
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(u: AdminUser) {
    try {
      await api(`/api/admin/users/${u.id}/active`, { method: "PATCH", body: { active: !u.active } });
      load();
    } catch (e) {
      toast.push(e instanceof ApiError ? e.message : "อัปเดตไม่สำเร็จ", "error");
    }
  }

  return (
    <Space direction="vertical" size={18} style={{ width: "100%" }}>
      <PageHeader
        title="User Management"
        subtitle="1 Manager ต่อ 1 แผนก · Admin ไม่ผูกแผนก"
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={openNew}>
            เพิ่มผู้ใช้
          </Button>
        }
      />

      <Table<AdminUser>
        rowKey="id"
        loading={loading}
        dataSource={users}
        pagination={false}
        columns={[
          { title: "Username", dataIndex: "username" },
          { title: "ชื่อ-นามสกุล", dataIndex: "fullName" },
          {
            title: "Role",
            dataIndex: "role",
            render: (v) => <Tag color={v === "ADMIN" ? "blue" : "orange"}>{v}</Tag>,
          },
          { title: "แผนก", dataIndex: "departmentCode", render: (v) => v ?? "—" },
          {
            title: "สถานะ",
            dataIndex: "active",
            render: (v) => <Tag color={v ? "success" : "default"}>{v ? "Active" : "Inactive"}</Tag>,
          },
          {
            title: "",
            key: "action",
            align: "right",
            render: (_, u) => (
              <Space>
                <Button type="link" size="small" onClick={() => openEdit(u)}>
                  แก้ไข
                </Button>
                <Popconfirm
                  title={u.active ? "ปิดใช้งานผู้ใช้นี้?" : "เปิดใช้งานผู้ใช้นี้?"}
                  onConfirm={() => toggleActive(u)}
                >
                  <Button type="link" size="small">
                    {u.active ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                  </Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        open={open}
        title={editing ? "แก้ไขผู้ใช้" : "เพิ่มผู้ใช้"}
        onCancel={() => setOpen(false)}
        onOk={submit}
        confirmLoading={saving}
        okText="บันทึก"
        destroyOnClose
      >
        <Form form={form} layout="vertical" requiredMark>
          <Form.Item name="username" label="Username" rules={[{ required: true, message: "กรุณากรอก Username" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="fullName" label="ชื่อ-นามสกุล" rules={[{ required: true, message: "กรุณากรอกชื่อ-นามสกุล" }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label={editing ? "รหัสผ่านใหม่ (เว้นว่าง = ไม่เปลี่ยน)" : "รหัสผ่าน (≥ 8 ตัว)"}
            rules={editing ? [] : [{ required: true, min: 8, message: "อย่างน้อย 8 ตัวอักษร" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select
              options={[
                { value: "MANAGER", label: "MANAGER" },
                { value: "ADMIN", label: "ADMIN" },
              ]}
            />
          </Form.Item>
          {role === "MANAGER" && (
            <Form.Item name="departmentId" label="แผนก" rules={[{ required: true, message: "กรุณาเลือกแผนก" }]}>
              <Select
                options={config?.departments.map((d) => ({ value: d.id, label: `${d.code} — ${d.name}` }))}
              />
            </Form.Item>
          )}
          <Form.Item name="active" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
