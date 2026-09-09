"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
  Tabs,
  Alert,
  Timeline,
  Table,
  Typography,
  Space,
  Spin,
} from "antd";
import dayjs from "dayjs";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useMasterConfig } from "@/lib/hooks";
import { useToast } from "@/lib/toast";
import { crossFieldHint, situationFor, stagesForStatus, validateDeal } from "@/lib/validation";
import { formatDateTime } from "@/lib/format";
import type { Deal, DealFormValues, FieldError } from "@/lib/types";

interface Props {
  target: number | "new" | null;
  onClose: () => void;
  onSaved: () => void;
}

type FormShape = {
  departmentId?: number;
  customer?: string;
  dealName?: string;
  dealType?: string;
  dealStatus?: string;
  dealStage?: string;
  probability?: string;
  closedDate?: dayjs.Dayjs;
  amount?: number;
  projectCode?: string;
  costSheetNo?: string;
  createdDate?: dayjs.Dayjs;
};

export function DealFormModal({ target, onClose, onSaved }: Props) {
  const { user } = useAuth();
  const { config } = useMasterConfig();
  const toast = useToast();
  const [form] = Form.useForm<FormShape>();
  const isAdmin = user?.role === "ADMIN";
  const isNew = target === "new";

  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("deal");
  const [noteText, setNoteText] = useState("");
  const [watch, setWatch] = useState<FormShape>({});

  useEffect(() => {
    if (target === null || !config) return;
    setLoading(true);
    setTab("deal");
    form.resetFields();

    if (isNew) {
      setDeal(null);
      const init: FormShape = {
        departmentId: isAdmin ? undefined : user?.departmentId ?? undefined,
        createdDate: dayjs(),
      };
      form.setFieldsValue(init);
      setWatch(init);
      setLoading(false);
    } else {
      api<Deal>(`/api/deals/${target}`)
        .then((d) => {
          setDeal(d);
          const v: FormShape = {
            departmentId: d.departmentId,
            customer: d.customer,
            dealName: d.dealName,
            dealType: d.dealType,
            dealStatus: d.dealStatus,
            dealStage: d.dealStage,
            probability: d.probability,
            closedDate: dayjs(d.closedDate + "-01"),
            amount: d.amount,
            projectCode: d.projectCode ?? undefined,
            costSheetNo: d.costSheetNo ?? undefined,
            createdDate: dayjs(d.createdDate),
          };
          form.setFieldsValue(v);
          setWatch(v);
        })
        .catch((e) => toast.push(e instanceof ApiError ? e.message : "โหลด deal ไม่สำเร็จ", "error"))
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, config, isNew]);

  const dealOwner = useMemo(() => {
    if (!config || !watch.departmentId) return deal?.dealOwner ?? "";
    return config.departments.find((d) => d.id === watch.departmentId)?.defaultOwner ?? "";
  }, [config, watch.departmentId, deal]);

  const situation = config && watch.probability ? situationFor(watch.probability, config) : "";
  const stageOptions = config && watch.dealStatus ? stagesForStatus(watch.dealStatus, config) : [];
  const liveHint =
    config && watch.probability
      ? crossFieldHint(
          { ...(watch as unknown as DealFormValues), dealStage: watch.dealStage ?? "" },
          config,
        )
      : null;

  function toFormValues(v: FormShape): DealFormValues {
    return {
      departmentId: v.departmentId ?? null,
      customer: v.customer ?? "",
      dealName: v.dealName ?? "",
      dealType: v.dealType ?? "",
      dealStatus: v.dealStatus ?? "",
      dealStage: v.dealStage ?? "",
      probability: v.probability ?? "",
      closedDate: v.closedDate ? v.closedDate.format("YYYY-MM") : "",
      amount: v.amount != null ? String(v.amount) : "",
      projectCode: v.projectCode ?? "",
      costSheetNo: v.costSheetNo ?? "",
      createdDate: v.createdDate ? v.createdDate.format("YYYY-MM-DD") : "",
    };
  }

  async function save() {
    if (!config) return;
    const raw = form.getFieldsValue(true) as FormShape;
    const values = toFormValues(raw);
    const errs = validateDeal(values, config);
    if (errs.length) {
      applyErrors(errs);
      toast.push(`กรอกข้อมูลไม่ครบ/ไม่ถูกต้อง ${errs.length} จุด`, "error");
      return;
    }
    setSaving(true);
    const payload = {
      departmentId: values.departmentId,
      customer: values.customer,
      dealName: values.dealName,
      dealType: values.dealType,
      dealStatus: values.dealStatus,
      dealStage: values.dealStage,
      probability: values.probability,
      closedDate: values.closedDate,
      amount: values.amount,
      projectCode: values.projectCode || null,
      costSheetNo: values.costSheetNo || null,
      createdDate: values.createdDate,
    };
    try {
      if (isNew) await api("/api/deals", { method: "POST", body: payload });
      else await api(`/api/deals/${target}`, { method: "PUT", body: payload });
      toast.push("บันทึกสำเร็จ", "success");
      onSaved();
      onClose();
    } catch (e) {
      if (e instanceof ApiError && e.errors.length) {
        applyErrors(e.errors);
        toast.push(`บันทึกไม่สำเร็จ: ${e.errors.length} จุดต้องแก้ไข`, "error");
      } else {
        toast.push(e instanceof ApiError ? e.message : "บันทึกไม่สำเร็จ", "error");
      }
    } finally {
      setSaving(false);
    }
  }

  function applyErrors(list: FieldError[]) {
    const byField = new Map<string, string[]>();
    for (const e of list) {
      if (!e.field) continue;
      byField.set(e.field, [...(byField.get(e.field) ?? []), e.message]);
    }
    form.setFields([...byField.entries()].map(([name, errors]) => ({ name, errors })) as never);
  }

  async function addNote() {
    if (!noteText.trim() || isNew || target === null) return;
    try {
      const updated = await api<Deal>(`/api/deals/${target}/notes`, {
        method: "POST",
        body: { text: noteText.trim() },
      });
      setDeal(updated);
      setNoteText("");
    } catch (e) {
      toast.push(e instanceof ApiError ? e.message : "เพิ่ม note ไม่สำเร็จ", "error");
    }
  }

  const dealTab = (
    <Form
      form={form}
      layout="vertical"
      requiredMark
      onValuesChange={(changed, all) => {
        if ("dealStatus" in changed) {
          form.setFieldValue("dealStage", undefined);
          setWatch({ ...all, dealStage: undefined });
        } else {
          setWatch(all);
        }
      }}
    >
      <div className="grid gap-x-4 sm:grid-cols-2">
        <Form.Item name="departmentId" label="Department" rules={[{ required: true, message: "กรุณาเลือกแผนก" }]}>
          <Select
            disabled={!isAdmin}
            placeholder="เลือกแผนก"
            options={config?.departments.map((d) => ({ value: d.id, label: `${d.code} — ${d.name}` }))}
          />
        </Form.Item>

        <Form.Item label="Deal Owner (auto)">
          <Input value={dealOwner} disabled />
        </Form.Item>

        <Form.Item name="customer" label="Customer" rules={[{ required: true, message: "กรุณากรอกชื่อลูกค้า" }]}>
          <Input />
        </Form.Item>

        <Form.Item name="dealType" label="Deal Type" rules={[{ required: true, message: "กรุณาเลือก Deal Type" }]}>
          <Select options={config?.dealTypes.map((t) => ({ value: t, label: t }))} />
        </Form.Item>

        <Form.Item
          name="dealName"
          label="Deal Name"
          className="sm:col-span-2"
          rules={[{ required: true, message: "กรุณากรอกชื่อ Deal" }]}
        >
          <Input.TextArea autoSize={{ minRows: 2 }} />
        </Form.Item>

        <Form.Item name="dealStatus" label="Deal Status" rules={[{ required: true, message: "กรุณาเลือก Deal Status" }]}>
          <Select options={config?.dealStatuses.map((s) => ({ value: s, label: s }))} />
        </Form.Item>

        <Form.Item name="dealStage" label="Deal Stage" rules={[{ required: true, message: "กรุณาเลือก Deal Stage" }]}>
          <Select
            disabled={!watch.dealStatus}
            options={stageOptions.map((s) => ({ value: s, label: s }))}
          />
        </Form.Item>

        <Form.Item
          name="probability"
          label="Probability"
          rules={[{ required: true, message: "กรุณาเลือก Probability" }]}
          validateStatus={liveHint ? "error" : undefined}
          help={liveHint || undefined}
        >
          <Select options={config?.probabilities.map((p) => ({ value: p.probability, label: p.probability }))} />
        </Form.Item>

        <Form.Item label="Situation (auto)">
          <Input value={situation} disabled />
        </Form.Item>

        <Form.Item
          name="closedDate"
          label="Closed Date (เดือน/ปี)"
          rules={[{ required: true, message: "กรุณาเลือก Closed Date" }]}
        >
          <DatePicker picker="month" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          name="amount"
          label="Amount (บาท)"
          rules={[
            { required: true, message: "กรุณากรอก Amount" },
            { type: "number", min: 1, message: "Amount ต้องเป็นตัวเลขบวก" },
          ]}
        >
          <InputNumber<number>
            style={{ width: "100%" }}
            className="num"
            min={0}
            formatter={(v) => (v === undefined ? "" : `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ","))}
            parser={(v) => Number((v ?? "").replace(/,/g, "")) || 0}
          />
        </Form.Item>

        <Form.Item label="Created Date" required className="sm:col-span-2">
          <Space.Compact style={{ width: "100%" }}>
            <Form.Item name="createdDate" noStyle rules={[{ required: true, message: "กรุณาเลือก Created Date" }]}>
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
            <Button onClick={() => form.setFieldValue("createdDate", dayjs())}>วันนี้</Button>
          </Space.Compact>
        </Form.Item>

        <Form.Item name="projectCode" label="รหัสโครงการ (optional)">
          <Input />
        </Form.Item>

        <Form.Item name="costSheetNo" label="Cost sheet No. (optional)">
          <Input />
        </Form.Item>
      </div>
    </Form>
  );

  const notesTab = (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <div>
        <Typography.Title level={5}>Note Timeline</Typography.Title>
        <Space.Compact style={{ width: "100%" }}>
          <Input.TextArea
            autoSize={{ minRows: 1 }}
            placeholder="เพิ่ม note ใหม่…"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
          />
          <Button type="primary" onClick={addNote} disabled={!noteText.trim()}>
            เพิ่ม Note
          </Button>
        </Space.Compact>
        <Timeline
          style={{ marginTop: 16 }}
          items={
            (deal?.notes ?? []).map((n) => ({
              children: (
                <div>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {formatDateTime(n.createdAt)} · {n.authorName}
                  </Typography.Text>
                  <div style={{ whiteSpace: "pre-wrap" }}>{n.text}</div>
                </div>
              ),
            })) || []
          }
        />
        {deal?.notes.length === 0 && <Typography.Text type="secondary">ยังไม่มี note</Typography.Text>}
      </div>

      <div>
        <Typography.Title level={5}>ประวัติการแก้ไข (Change History)</Typography.Title>
        <Table
          size="small"
          rowKey="id"
          pagination={false}
          dataSource={deal?.history}
          locale={{ emptyText: "ยังไม่มีประวัติการแก้ไข" }}
          columns={[
            { title: "เวลา", dataIndex: "changedAt", render: (v) => formatDateTime(v), width: 170 },
            { title: "ผู้แก้ไข", dataIndex: "changedByName", width: 130 },
            { title: "Field", dataIndex: "field", width: 120 },
            {
              title: "ค่าเดิม → ค่าใหม่",
              key: "diff",
              render: (_, h) => (
                <span>
                  <Typography.Text delete type="secondary">
                    {h.oldValue ?? "—"}
                  </Typography.Text>{" "}
                  → <b>{h.newValue ?? "—"}</b>
                </span>
              ),
            },
          ]}
        />
      </div>
    </Space>
  );

  return (
    <Modal
      open={target !== null}
      onCancel={onClose}
      title={isNew ? "สร้าง Deal ใหม่" : `แก้ไข Deal ${deal?.recordId ?? ""}`}
      width={780}
      styles={{ body: { maxHeight: "70vh", overflowY: "auto" } }}
      footer={[
        <Button key="cancel" onClick={onClose}>
          ยกเลิก
        </Button>,
        <Button key="save" type="primary" loading={saving} onClick={save} disabled={loading}>
          บันทึก
        </Button>,
      ]}
      destroyOnClose
    >
      {loading || !config ? (
        <div className="grid place-items-center py-16">
          <Spin />
        </div>
      ) : (
        <>
          {deal?.legacyMigrated && deal.migrationRemark && (
            <Alert
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
              message="ข้อมูลนี้ import จาก Excel เดิมและไม่ตรงกฎ"
              description={`${deal.migrationRemark} — แก้ไขให้ตรงกฎก่อนกดบันทึก`}
            />
          )}
          <Tabs
            activeKey={tab}
            onChange={setTab}
            items={[
              { key: "deal", label: "ข้อมูล Deal", children: dealTab },
              { key: "notes", label: "Notes & ประวัติ", children: notesTab, disabled: isNew },
            ]}
          />
        </>
      )}
    </Modal>
  );
}
