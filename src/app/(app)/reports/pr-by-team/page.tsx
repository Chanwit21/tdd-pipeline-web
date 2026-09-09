"use client";

import { ReportShell } from "@/components/report/ReportShell";

export default function PrByTeamReport() {
  return (
    <ReportShell
      title="Report — PR by Team"
      description="Sum of Amount · Deal Status = PR (คงที่) · แถว = แผนก · คอลัมน์ = เดือน Closed Date"
      endpoint="/api/reports/pr-by-team"
    />
  );
}
