"use client";

import { Suspense } from "react";
import { PipelineView } from "@/components/deal/PipelineView";

export default function PipelinePage() {
  return (
    <Suspense fallback={<div className="text-text-muted">กำลังโหลด…</div>}>
      <PipelineView />
    </Suspense>
  );
}
