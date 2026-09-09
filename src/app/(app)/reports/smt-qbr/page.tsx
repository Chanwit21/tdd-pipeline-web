"use client";

import { useState } from "react";
import { Select } from "antd";
import { ReportShell } from "@/components/report/ReportShell";

const STATUS = ["Follow Up", "PR", "Inactive"].map((s) => ({ value: s, label: s }));

export default function SmtQbrReport() {
  const [status, setStatus] = useState<string[]>([]);

  return (
    <ReportShell
      title="Report: SMT QBR"
      description="Sum of Amount · แถว = Probability · คอลัมน์ = Deal Stage"
      endpoint="/api/reports/smt-qbr"
      extraQuery={{ dealStatus: status.length ? status : undefined }}
      extraFilters={
        <Select
          mode="multiple"
          allowClear
          placeholder="Deal Status"
          style={{ minWidth: 220 }}
          value={status}
          onChange={setStatus}
          options={STATUS}
        />
      }
    />
  );
}
