"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Row, Col, Card, Select, DatePicker, Table, Tag, Space, Button } from "antd";
import {
  DollarOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useMasterConfig } from "@/lib/hooks";
import { formatAmount, formatMonth } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import { FilterPanel, FilterField } from "@/components/FilterPanel";
import { KpiCard } from "@/components/KpiCard";

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

  const s = data?.statCards;

  return (
    <Space direction="vertical" size={18} style={{ width: "100%" }}>
      <PageHeader
        title="Dashboard"
        subtitle={`ภาพรวม pipeline ${isAdmin ? "— ทุกแผนก" : `— แผนก ${user?.departmentCode}`}`}
      />

      <FilterPanel>
        {isAdmin && (
          <FilterField label="แผนก">
            <Select
              allowClear
              placeholder="ทุกแผนก"
              style={{ width: 200 }}
              value={departmentId}
              onChange={setDepartmentId}
              options={config?.departments.map((d) => ({ value: d.id, label: `${d.code} — ${d.name}` }))}
            />
          </FilterField>
        )}
        <FilterField label="ช่วงเดือน (Closed Date)">
          <DatePicker.RangePicker
            picker="month"
            value={range}
            allowClear={false}
            onChange={(v) => v && v[0] && v[1] && setRange([v[0], v[1]])}
          />
        </FilterField>
      </FilterPanel>

      <Row gutter={[14, 14]}>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            label="Total Pipeline Amount"
            value={formatAmount(s?.totalPipelineAmount)}
            icon={<DollarOutlined />}
            tone="info"
            sub={`รวม ${s?.activeDealCount ?? 0} ดีล ที่ยัง Active`}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            label="Best Case Amount"
            value={formatAmount(s?.bestCaseAmount)}
            icon={<CheckCircleOutlined />}
            tone="success"
            sub="Probability 75% ขึ้นไป"
            subStrong
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            label="Won / PO Amount"
            value={formatAmount(s?.wonAmount)}
            icon={<TrophyOutlined />}
            tone="accent"
            sub="ตามช่วงเดือนที่เลือก"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            label="Overdue Follow Up"
            value={String(data?.overdue.length ?? 0)}
            icon={<WarningOutlined />}
            tone="danger"
            sub={data && data.overdue.length > 0 ? "ต้องติดตามด่วน" : "ไม่มีรายการค้าง"}
          />
        </Col>
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
        extra={<Tag color="error" bordered={false}>{data?.overdue.length ?? 0} รายการ</Tag>}
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
            { title: "Closed Date", dataIndex: "closedDate", width: 110, render: (v) => formatMonth(v) },
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
