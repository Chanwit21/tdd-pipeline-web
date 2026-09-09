"use client";

import { useState } from "react";
import { Select } from "antd";
import { ReportShell } from "@/components/report/ReportShell";
import { FilterField } from "@/components/FilterPanel";

const STATUS = ["Follow Up", "PR", "Inactive"].map((s) => ({ value: s, label: s }));

export default function SmtQbrReport() {
  const [status, setStatus] = useState<string[]>([]);

  return (
    <ReportShell
      title="Report — SMT QBR"
      description="Sum of Amount · แถว = Probability · คอลัมน์ = Deal Stage"
      endpoint="/api/reports/smt-qbr"
      extraQuery={{ dealStatus: status.length ? status : undefined }}
      extraFilters={
        <FilterField label="Deal Status">
          <Select
            mode="multiple"
            allowClear
            placeholder="ทั้งหมด"
            style={{ minWidth: 220 }}
            value={status}
            onChange={setStatus}
            options={STATUS}
          />
        </FilterField>
      }
    />
  );
}
