"use client";

import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { formatAmount } from "@/lib/format";
import type { PivotReport } from "@/lib/types";

interface Row {
  key: string;
  label: string;
  total: number;
  values: Record<string, number>;
  isFooter?: boolean;
}

export function PivotTable({ data, loading }: { data: PivotReport | null; loading?: boolean }) {
  const columns: ColumnsType<Row> = [
    {
      title: data?.rowHeader ?? "",
      dataIndex: "label",
      fixed: "left",
      width: 180,
      render: (v, r) => <span className={r.isFooter ? "font-semibold" : "font-medium"}>{v}</span>,
    },
    ...(data?.columns ?? []).map((c) => ({
      title: c,
      dataIndex: ["values", c],
      align: "right" as const,
      width: 120,
      render: (v: number) => <span className="num">{v ? formatAmount(v) : "—"}</span>,
    })),
    {
      title: "Grand Total",
      dataIndex: "total",
      align: "right" as const,
      width: 140,
      fixed: "right" as const,
      render: (v: number) => <span className="num font-semibold">{formatAmount(v)}</span>,
    },
  ];

  const rows: Row[] = (data?.rows ?? []).map((r) => ({
    key: r.label,
    label: r.label,
    total: r.total,
    values: r.values,
  }));

  if (data) {
    rows.push({
      key: "__grand__",
      label: "Grand Total",
      total: data.grandTotal,
      values: data.columnTotals,
      isFooter: true,
    });
  }

  return (
    <Table<Row>
      size="small"
      loading={loading}
      columns={columns}
      dataSource={rows}
      pagination={false}
      scroll={{ x: "max-content" }}
      rowClassName={(r) => (r.isFooter ? "row-slate" : "")}
    />
  );
}
