"use client";

import { useState } from "react";
import { Select } from "antd";
import { ReportShell } from "@/components/report/ReportShell";
import { useMasterConfig } from "@/lib/hooks";

const STATUS = ["Follow Up", "PR", "Inactive"].map((s) => ({ value: s, label: s }));

export default function PipelineByTeamReport() {
  const { config } = useMasterConfig();
  const [status, setStatus] = useState<string[]>([]);
  const [prob, setProb] = useState<string[]>([]);
  const [stage, setStage] = useState<string[]>([]);

  return (
    <ReportShell
      title="Report: Pipeline by Team"
      description="Sum of Amount · แถว = แผนก · คอลัมน์ = เดือน Closed Date"
      endpoint="/api/reports/pipeline-by-team"
      extraQuery={{
        dealStatus: status.length ? status : undefined,
        probability: prob.length ? prob : undefined,
        dealStage: stage.length ? stage : undefined,
      }}
      extraFilters={
        <>
          <Select
            mode="multiple"
            allowClear
            placeholder="Deal Status"
            style={{ minWidth: 160 }}
            value={status}
            onChange={setStatus}
            options={STATUS}
          />
          <Select
            mode="multiple"
            allowClear
            placeholder="Probability"
            style={{ minWidth: 160 }}
            value={prob}
            onChange={setProb}
            options={config?.probabilities.map((p) => ({ value: p.probability, label: p.probability }))}
          />
          <Select
            mode="multiple"
            allowClear
            placeholder="Deal Stage"
            style={{ minWidth: 180 }}
            value={stage}
            onChange={setStage}
            options={config?.dealStages.map((s) => ({ value: s.name, label: s.name }))}
          />
        </>
      }
    />
  );
}
