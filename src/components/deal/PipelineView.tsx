"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table, Input, Select, DatePicker, Checkbox, Button, Space, Tag } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/PageHeader";
import { FilterPanel, FilterField } from "@/components/FilterPanel";
import type { ColumnsType } from "antd/es/table";
import dayjs, { Dayjs } from "dayjs";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useMasterConfig } from "@/lib/hooks";
import { formatAmount, formatMonth } from "@/lib/format";
import { SituationBadge, StageBadge, StatusBadge } from "@/components/Badge";
import { DealFormModal } from "@/components/deal/DealFormModal";
import type { Deal, Page } from "@/lib/types";

const STATUS_OPTIONS = ["Follow Up", "PR", "Inactive"].map((s) => ({ value: s, label: s }));

export function PipelineView({ initialTarget }: { initialTarget?: number | "new" }) {
  const { user } = useAuth();
  const { config } = useMasterConfig();
  const router = useRouter();
  const isAdmin = user?.role === "ADMIN";

  const [departmentId, setDepartmentId] = useState<number | undefined>();
  const [statuses, setStatuses] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [closed, setClosed] = useState<[Dayjs | null, Dayjs | null]>([null, null]);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(25);
  const [data, setData] = useState<Page<Deal> | null>(null);
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState<number | "new" | null>(initialTarget ?? null);

  const load = useCallback(() => {
    setLoading(true);
    api<Page<Deal>>("/api/deals", {
      query: {
        departmentId: isAdmin ? departmentId : undefined,
        dealStatus: statuses.length ? statuses : undefined,
        search: search || undefined,
        overdueOnly: overdueOnly || undefined,
        closedFrom: closed[0]?.format("YYYY-MM"),
        closedTo: closed[1]?.format("YYYY-MM"),
        page: page - 1,
        size,
      },
    })
      .then(setData)
      .finally(() => setLoading(false));
  }, [isAdmin, departmentId, statuses, search, overdueOnly, closed, page, size]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  function closeModal() {
    setTarget(null);
    if (initialTarget !== undefined) router.replace("/pipeline");
  }

  const columns: ColumnsType<Deal> = [
    {
      title: "Record ID",
      dataIndex: "recordId",
      width: 140,
      render: (v, r) => (
        <Space size={4}>
          <span className="font-medium">{v}</span>
          {r.overdue && <Tag color="error">overdue</Tag>}
          {r.legacyMigrated && <Tag color="gold">legacy</Tag>}
        </Space>
      ),
    },
    { title: "Customer", dataIndex: "customer", width: 130 },
    { title: "Deal Name", dataIndex: "dealName", ellipsis: true },
    { title: "Dept", dataIndex: "departmentCode", width: 70 },
    { title: "Status", dataIndex: "dealStatus", width: 110, render: (v) => <StatusBadge status={v} /> },
    { title: "Stage", dataIndex: "dealStage", width: 150, render: (v) => <StageBadge stage={v} /> },
    { title: "Prob.", dataIndex: "probability", width: 100 },
    { title: "Situation", dataIndex: "situation", width: 120, render: (v) => <SituationBadge situation={v} /> },
    {
      title: "Amount",
      dataIndex: "amount",
      width: 130,
      align: "right",
      render: (v) => <span className="num">{formatAmount(v)}</span>,
    },
    { title: "Closed", dataIndex: "closedDate", width: 90, render: (v) => formatMonth(v) },
    { title: "Owner", dataIndex: "dealOwner", width: 110 },
  ];

  return (
    <Space direction="vertical" size={18} style={{ width: "100%" }}>
      <PageHeader
        title="Sales Pipeline"
        subtitle={`${data ? data.totalElements : "…"} deal${
          user?.departmentCode ? ` · แผนก ${user.departmentCode}` : ""
        }`}
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setTarget("new")}>
            เพิ่ม Deal
          </Button>
        }
      />

      <FilterPanel>
        {isAdmin && (
          <FilterField label="แผนก">
            <Select
              allowClear
              placeholder="ทุกแผนก"
              style={{ width: 140 }}
              value={departmentId}
              onChange={(v) => {
                setPage(1);
                setDepartmentId(v);
              }}
              options={config?.departments.map((d) => ({ value: d.id, label: d.code }))}
            />
          </FilterField>
        )}
        <FilterField label="Deal Status">
          <Select
            mode="multiple"
            allowClear
            placeholder="ทั้งหมด"
            style={{ minWidth: 200 }}
            value={statuses}
            onChange={(v) => {
              setPage(1);
              setStatuses(v);
            }}
            options={STATUS_OPTIONS}
          />
        </FilterField>
        <FilterField label="ช่วง Closed Date">
          <DatePicker.RangePicker
            picker="month"
            placeholder={["จาก", "ถึง"]}
            value={closed}
            onChange={(v) => {
              setPage(1);
              setClosed(v ?? [null, null]);
            }}
          />
        </FilterField>
        <FilterField label="ค้นหา">
          <Input.Search
            allowClear
            placeholder="Customer / Deal Name"
            style={{ width: 240 }}
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </FilterField>
        <Checkbox
          style={{ paddingBottom: 6 }}
          checked={overdueOnly}
          onChange={(e) => setOverdueOnly(e.target.checked)}
        >
          เฉพาะ Overdue
        </Checkbox>
      </FilterPanel>

      <Table<Deal>
        rowKey="id"
        size="small"
        loading={loading}
        columns={columns}
        dataSource={data?.content}
        scroll={{ x: 1200 }}
        onRow={(r) => ({
          onClick: () => setTarget(r.id),
          style: { cursor: "pointer" },
          className: r.rowColor !== "normal" ? `row-${r.rowColor}` : undefined,
        })}
        pagination={{
          current: page,
          pageSize: size,
          total: data?.totalElements ?? 0,
          showSizeChanger: true,
          pageSizeOptions: [25, 50, 100],
          onChange: (p, s) => {
            setPage(p);
            setSize(s);
          },
        }}
      />

      <DealFormModal target={target} onClose={closeModal} onSaved={load} />
    </Space>
  );
}
