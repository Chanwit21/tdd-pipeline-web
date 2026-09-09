"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Row, Col, Card, Statistic, Select, DatePicker, Table, Typography, Tag, Space, Button } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useMasterConfig } from "@/lib/hooks";
import { formatAmount, formatMonth } from "@/lib/format";

interface Summary {
  statCards: {
    totalPipelineAmount: number;
    bestCaseAmount: number;
    wonAmount: number;
    activeDealCount: number;
  };
  overdue: {
    id: number;
    recordId: string;
    customer: string;
    dealName: string;
    department: string;
    dealOwner: string;
    closedDate: string;
    amount: number;
  }[];
  byDepartment?: { department: string; dealCount: number; amount: number; bestCase: number }[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { config } = useMasterConfig();
  const router = useRouter();
  const isAdmin = user?.role === "ADMIN";

  const [departmentId, setDepartmentId] = useState<number | undefined>();
  const [range, setRange] = useState<[Dayjs, Dayjs]>([dayjs().startOf("year"), dayjs()]);
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api<Summary>("/api/dashboard/summary", {
      query: {
        departmentId: isAdmin ? departmentId : undefined,
        from: range[0].format("YYYY-MM"),
        to: range[1].format("YYYY-MM"),
      },
    })
      .then(setData)
      .finally(() => setLoading(false));
  }, [departmentId, range, isAdmin]);

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Dashboard
          </Typography.Title>
          <Typography.Text type="secondary">
            ภาพรวม pipeline {isAdmin ? "— ทุกแผนก" : `— แผนก ${user?.departmentCode}`}
          </Typography.Text>
        </div>
        <Space wrap>
          {isAdmin && (
            <Select
              allowClear
              placeholder="ทุกแผนก"
              style={{ width: 200 }}
              value={departmentId}
              onChange={setDepartmentId}
              options={config?.departments.map((d) => ({ value: d.id, label: `${d.code} — ${d.name}` }))}
            />
          )}
          <DatePicker.RangePicker
            picker="month"
            value={range}
            allowClear={false}
            onChange={(v) => v && v[0] && v[1] && setRange([v[0], v[1]])}
          />
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <StatCol label="Total Pipeline Amount" value={data?.statCards.totalPipelineAmount} hint="deal ที่ยัง active" />
        <StatCol label="Best Case Amount" value={data?.statCards.bestCaseAmount} hint="Situation = Best Case" />
        <StatCol label="Won / PO Amount" value={data?.statCards.wonAmount} hint="ตามช่วงเดือนที่เลือก" />
        <StatCol label="จำนวน Deal (active)" value={data?.statCards.activeDealCount} hint="ไม่รวม Inactive" plain />
      </Row>

      {isAdmin && data?.byDepartment && (
        <Card title="Breakdown ตามแผนก" size="small">
          <Table
            size="small"
            rowKey="department"
            pagination={false}
            loading={loading}
            dataSource={data.byDepartment}
            columns={[
              { title: "แผนก", dataIndex: "department" },
              { title: "จำนวนดีล", dataIndex: "dealCount" },
              {
                title: "Sum of Amount",
                dataIndex: "amount",
                align: "right",
                render: (v) => <span className="num">{formatAmount(v)}</span>,
              },
              {
                title: "Best Case",
                dataIndex: "bestCase",
                align: "right",
                render: (v) => <span className="num">{formatAmount(v)}</span>,
              },
            ]}
          />
        </Card>
      )}

      <Card
        title="Overdue List"
        size="small"
        extra={<Tag color="error">{data?.overdue.length ?? 0} รายการ</Tag>}
      >
        <Table
          size="small"
          rowKey="id"
          loading={loading}
          dataSource={data?.overdue}
          pagination={false}
          locale={{ emptyText: "ไม่มี deal overdue 🎉" }}
          columns={[
            { title: "Customer", dataIndex: "customer" },
            { title: "Deal Name", dataIndex: "dealName", ellipsis: true },
            { title: "แผนก", dataIndex: "department", width: 90 },
            { title: "Deal Owner", dataIndex: "dealOwner", width: 120 },
            {
              title: "Closed Date",
              dataIndex: "closedDate",
              width: 110,
              render: (v) => formatMonth(v),
            },
            {
              title: "Amount",
              dataIndex: "amount",
              align: "right",
              render: (v) => <span className="num">{formatAmount(v)}</span>,
            },
            {
              title: "",
              key: "action",
              width: 100,
              render: (_, r) => (
                <Button type="link" size="small" onClick={() => router.push(`/pipeline/${r.id}`)}>
                  เปิดแก้ไข
                </Button>
              ),
            },
          ]}
        />
      </Card>
    </Space>
  );
}

function StatCol({
  label,
  value,
  hint,
  plain,
}: {
  label: string;
  value: number | undefined;
  hint: string;
  plain?: boolean;
}) {
  return (
    <Col xs={24} sm={12} xl={6}>
      <Card size="small">
        <Statistic
          title={label}
          value={value ?? 0}
          formatter={plain ? undefined : (v) => formatAmount(Number(v))}
          valueStyle={{ fontFamily: "var(--font-jakarta)" }}
        />
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {hint}
        </Typography.Text>
      </Card>
    </Col>
  );
}
