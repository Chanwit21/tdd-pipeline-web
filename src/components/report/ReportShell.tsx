"use client";

import { useEffect, useState } from "react";
import { Card, Select, Button, Space, Typography } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useMasterConfig } from "@/lib/hooks";
import { PivotTable } from "@/components/report/PivotTable";
import type { PivotReport } from "@/lib/types";

interface Props {
  title: string;
  description: string;
  endpoint: string;
  extraFilters?: React.ReactNode;
  extraQuery?: Record<string, string | string[] | undefined>;
}

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR + 1, CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2];

export function ReportShell({ title, description, endpoint, extraFilters, extraQuery }: Props) {
  const { user } = useAuth();
  const { config } = useMasterConfig();
  const isAdmin = user?.role === "ADMIN";

  const [departmentId, setDepartmentId] = useState<number | undefined>();
  const [year, setYear] = useState(CURRENT_YEAR);
  const [data, setData] = useState<PivotReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setLoading(true);
    api<PivotReport>(endpoint, {
      query: { departmentId: isAdmin ? departmentId : undefined, year, ...extraQuery },
    })
      .then(setData)
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, isAdmin, departmentId, year, tick, JSON.stringify(extraQuery)]);

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <div>
        <Typography.Title level={3} style={{ margin: 0 }}>
          {title}
        </Typography.Title>
        <Typography.Text type="secondary">{description}</Typography.Text>
      </div>

      <Card size="small">
        <Space wrap size="middle" align="end">
          {isAdmin && (
            <Select
              allowClear
              placeholder="ทุกแผนก"
              style={{ width: 140 }}
              value={departmentId}
              onChange={setDepartmentId}
              options={config?.departments.map((d) => ({ value: d.id, label: d.code }))}
            />
          )}
          <Select
            style={{ width: 110 }}
            value={year}
            onChange={setYear}
            options={YEARS.map((y) => ({ value: y, label: String(y) }))}
          />
          {extraFilters}
          <Button icon={<ReloadOutlined />} onClick={() => setTick((t) => t + 1)}>
            Refresh
          </Button>
        </Space>
      </Card>

      <PivotTable data={data} loading={loading} />
    </Space>
  );
}
