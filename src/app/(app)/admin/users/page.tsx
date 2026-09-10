"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useMasterConfig } from "@/lib/hooks";
import { useToast } from "@/components/Toast";
import { PageHead, Modal, Badge, Pager } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import type { AdminUser, FieldError } from "@/lib/types";

interface FormState {
  id: number | null;
  username: string;
  fullName: string;
  password: string;
  role: "MANAGER" | "ADMIN";
  departmentId: number | null;
  active: boolean;
}

const EMPTY: FormState = {
  id: null,
  username: "",
  fullName: "",
  password: "",
  role: "MANAGER",
  departmentId: null,
  active: true,
};

export default function UserManagementPage() {
  const { config } = useMasterConfig();
  const toast = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [form, setForm] = useState<FormState | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const size = 10;
  const currentPage = Math.min(page, Math.max(1, Math.ceil(users.length / size)));

  const load = () => api<AdminUser[]>("/api/admin/users").then(setUsers);
  useEffect(() => {
    load();
  }, []);

  async function save() {
    if (!form) return;
    setSaving(true);
    setErrors({});
    try {
      const body = {
        username: form.username,
        fullName: form.fullName,
        password: form.password || null,
        role: form.role,
        departmentId: form.role === "MANAGER" ? form.departmentId : null,
        active: form.active,
      };
      if (form.id) await api(`/api/admin/users/${form.id}`, { method: "PUT", body });
      else await api("/api/admin/users", { method: "POST", body });
      toast.push("บันทึกผู้ใช้สำเร็จ", "success");
      setForm(null);
      load();
    } catch (e) {
      if (e instanceof ApiError && e.errors.length) {
        const map: Record<string, string> = {};
        (e.errors as FieldError[]).forEach((x) => x.field && (map[x.field] = x.message));
        setErrors(map);
        toast.push("ตรวจสอบข้อมูลในฟอร์ม", "error");
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
    <div className="stack">
      <PageHead
        title="User Management"
        subtitle="จัดการบัญชีผู้ใช้งานและผูก Manager เข้ากับแผนก"
        actions={
          <button
            className="btn btn-primary"
            onClick={() => {
              setErrors({});
              setForm(EMPTY);
            }}
          >
            + เพิ่มผู้ใช้งาน
          </button>
        }
      />

      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th className="col-no">No.</th>
                <th>Username</th>
                <th>ชื่อ-นามสกุล</th>
                <th>Role</th>
                <th>แผนก</th>
                <th>สถานะ</th>
                <th>เข้าใช้ล่าสุด</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.slice((currentPage - 1) * size, currentPage * size).map((u, i) => (
                <tr key={u.id}>
                  <td className="col-no">{(currentPage - 1) * size + i + 1}</td>
                  <td className="cell-strong">{u.username}</td>
                  <td>{u.fullName}</td>
                  <td>
                    <Badge tone={u.role === "ADMIN" ? "accent" : "info"}>{u.role}</Badge>
                  </td>
                  <td>{u.departmentCode ? <Badge tone="slate">{u.departmentCode}</Badge> : <span className="cell-muted">ทุกแผนก</span>}</td>
                  <td>
                    <Badge tone={u.active ? "success" : "slate"}>{u.active ? "Active" : "Inactive"}</Badge>
                  </td>
                  <td className="date-cell cell-muted">{u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "—"}</td>
                  <td style={{ textAlign: "right" }}>
                    <span className="sr-only">Actions</span>
                    <button
                      className="rowbtn"
                      title={`แก้ไข ${u.username}`}
                      style={{ marginRight: 14 }}
                      onClick={() => {
                        setErrors({});
                        setForm({
                          id: u.id,
                          username: u.username,
                          fullName: u.fullName,
                          password: "",
                          role: u.role,
                          departmentId: u.departmentId,
                          active: u.active,
                        });
                      }}
                    >
                      ✎
                    </button>
                    <button className="linkbtn" style={{ color: "var(--text-muted)" }} onClick={() => toggleActive(u)}>
                      {u.active ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-foot">
          <span>แสดง {users.length} รายการ</span>
          <Pager page={currentPage} totalPages={Math.ceil(users.length / size)} onPage={setPage} />
        </div>
      </div>

      <Modal open={form !== null} onClose={() => setForm(null)} width={520}>
        {form && (
          <>
            <div className="modal-head">
              <h3>{form.id ? "แก้ไขผู้ใช้" : "เพิ่มผู้ใช้งาน"}</h3>
              <button className="icon-x" onClick={() => setForm(null)}>
                ✕
              </button>
            </div>
            <div className="mpanel">
              <div className="form-grid" style={{ gridTemplateColumns: "1fr" }}>
                <UF label="Username" error={errors.username}>
                  <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
                </UF>
                <UF label="ชื่อ-นามสกุล" error={errors.fullName}>
                  <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                </UF>
                <UF
                  label={form.id ? "รหัสผ่านใหม่ (เว้นว่าง = ไม่เปลี่ยน)" : "รหัสผ่าน (≥ 8 ตัว)"}
                  error={errors.password}
                >
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </UF>
                <UF label="Role" error={errors.role}>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value as FormState["role"] })}
                  >
                    <option value="MANAGER">MANAGER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </UF>
                {form.role === "MANAGER" && (
                  <UF label="แผนก" error={errors.departmentId}>
                    <select
                      value={form.departmentId ?? ""}
                      onChange={(e) => setForm({ ...form, departmentId: e.target.value ? Number(e.target.value) : null })}
                    >
                      <option value="">— เลือกแผนก —</option>
                      {config?.departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.code} — {d.name}
                        </option>
                      ))}
                    </select>
                  </UF>
                )}
                <label className="check" style={{ padding: 0 }}>
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  />
                  Active
                </label>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn" onClick={() => setForm(null)}>
                ยกเลิก
              </button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>
                บันทึก
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

function UF({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className={`form-field${error ? " has-error" : ""}`}>
      <label>{label}</label>
      {children}
      {error && <div className="field-err">{error}</div>}
    </div>
  );
}
