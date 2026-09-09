"use client";

import { useState } from "react";
import { Select } from "antd";
import { ReportShell } from "@/components/report/ReportShell";
import { FilterField } from "@/components/FilterPanel";
import { useMasterConfig } from "@/lib/hooks";

const STATUS = ["Follow Up", "PR", "Inactive"].map((s) => ({ value: s, label: s }));

export default function PipelineByTeamReport() {
  const { config } = useMasterConfig();
  const [status, setStatus] = useState<string[]>([]);
  const [prob, setProb] = useState<string[]>([]);
  const [stage, setStage] = useState<string[]>([]);

  return (
    <ReportShell
      title="Report — Pipeline by Team"
      description="Sum of Amount · แถว = แผนก · คอลัมน์ = เดือน Closed Date"
      endpoint="/api/reports/pipeline-by-team"
      extraQuery={{
        dealStatus: status.length ? status : undefined,
        probability: prob.length ? prob : undefined,
        dealStage: stage.length ? stage : undefined,
      }}
      extraFilters={
        <>
          <FilterField label="Deal Status">
            <Select
              mode="multiple"
              allowClear
              placeholder="ทั้งหมด"
              style={{ minWidth: 150 }}
              value={status}
              onChange={setStatus}
              options={STATUS}
            />
          </FilterField>
          <FilterField label="Probability">
            <Select
              mode="multiple"
              allowClear
              placeholder="ทั้งหมด"
              style={{ minWidth: 150 }}
              value={prob}
              onChange={setProb}
              options={config?.probabilities.map((p) => ({ value: p.probability, label: p.probability }))}
            />
          </FilterField>
          <FilterField label="Deal Stage">
            <Select
              mode="multiple"
              allowClear
              placeholder="ทั้งหมด"
              style={{ minWidth: 170 }}
              value={stage}
              onChange={setStage}
              options={config?.dealStages.map((s) => ({ value: s.name, label: s.name }))}
            />
          </FilterField>
        </>
      }
    />
  );
}
