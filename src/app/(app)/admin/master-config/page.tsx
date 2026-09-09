"use client";

import { useEffect, useState } from "react";
import { Card, Table, Alert, Select, Button, Space, Typography, Spin } from "antd";
import { api, ApiError } from "@/lib/api";
import { useToast } from "@/lib/toast";
import { invalidateMasterConfig } from "@/lib/hooks";
import { PageHeader } from "@/components/PageHeader";
import type { MasterConfig } from "@/lib/types";

export default function MasterConfigPage() {
  const toast = useToast();
  const [config, setConfig] = useState<MasterConfig | null>(null);
  const [wonProb, setWonProb] = useState("");
  const [poProb, setPoProb] = useState("");

  const load = () =>
    api<MasterConfig>("/api/master-config").then((c) => {
      setConfig(c);
      setWonProb(c.rules.wonProbability);
      setPoProb(c.rules.poProbability);
    });

  useEffect(() => {
    load();
  }, []);

  async function saveRule(key: string, value: string) {
    try {
      await api("/api/admin/master-config/rules", { method: "PUT", body: { key, value } });
      invalidateMasterConfig();
      toast.push("อัปเดตกฎแล้ว — มีผลกับ deal ทั้งหมด", "success");
      load();
    } catch (e) {
      toast.push(e instanceof ApiError ? e.message : "อัปเดตไม่สำเร็จ", "error");
    }
  }

  if (!config) {
    return (
      <div className="grid place-items-center py-20">
        <Spin size="large" />
      </div>
    );
  }

  const probOptions = config.probabilities.map((p) => ({ value: p.probability, label: p.probability }));

  return (
    <Space direction="vertical" size={18} style={{ width: "100%" }}>
      <PageHeader
        title="Master Data"
        subtitle="แก้ dropdown list และกฎ cascade ที่เคยอยู่ในชีต Master_Config"
      />

      <Alert
        type="warning"
        showIcon
        message="การแก้ค่าที่นี่กระทบ dropdown และ validation ของ deal ทั้งหมดที่กำลังใช้งานอยู่"
      />

      <Card title="กฎ Validation (threshold แก้ได้)" size="small">
        <Space size="large" wrap>
          <div>
            <Typography.Text strong>Deal Stage = Won ต้องมี Probability</Typography.Text>
            <div className="mt-1">
              <Space.Compact>
                <Select style={{ width: 160 }} value={wonProb} onChange={setWonProb} options={probOptions} />
                <Button type="primary" onClick={() => saveRule("XREF_WON_PROBABILITY", wonProb)}>
                  บันทึก
                </Button>
              </Space.Compact>
            </div>
          </div>
          <div>
            <Typography.Text strong>Deal Stage = PO ต้องมี Probability</Typography.Text>
            <div className="mt-1">
              <Space.Compact>
                <Select style={{ width: 160 }} value={poProb} onChange={setPoProb} options={probOptions} />
                <Button type="primary" onClick={() => saveRule("XREF_PO_PROBABILITY", poProb)}>
                  บันทึก
                </Button>
              </Space.Compact>
            </div>
          </div>
        </Space>
      </Card>

      <Card title="Department" size="small">
        <Table
          size="small"
          rowKey="code"
          pagination={false}
          dataSource={config.departments}
          columns={[
            { title: "Code", dataIndex: "code" },
            { title: "ชื่อเต็ม", dataIndex: "name" },
            { title: "Deal Owner (default)", dataIndex: "defaultOwner", render: (v) => v || "—" },
          ]}
        />
      </Card>

      <Card title="Deal Stage → Deal Status ที่อนุญาต (cascade)" size="small">
        <Table
          size="small"
          rowKey="name"
          pagination={false}
          dataSource={config.dealStages}
          columns={[
            { title: "Deal Stage", dataIndex: "name" },
            { title: "อยู่ภายใต้ Deal Status", dataIndex: "allowedFor", render: (v: string[]) => v.join(", ") },
          ]}
        />
      </Card>

      <Card title="Probability → Situation" size="small">
        <Table
          size="small"
          rowKey="probability"
          pagination={false}
          dataSource={config.probabilities}
          columns={[
            { title: "Probability", dataIndex: "probability" },
            { title: "Situation", dataIndex: "situation" },
          ]}
        />
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card title="Deal Type" size="small">
          <ul className="m-0 pl-5">
            {config.dealTypes.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </Card>
        <Card title="Deal Status" size="small">
          <ul className="m-0 pl-5">
            {config.dealStatuses.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </Card>
      </div>
    </Space>
  );
}
