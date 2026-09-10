"use client";

import { PipelineView } from "@/components/deal/PipelineView";

/** /pipeline/:id and /pipeline/new both render the list with the form modal open. */
export default function PipelineDealPage({ params }: { params: { id: string } }) {
  const target = params.id === "new" ? "new" : Number(params.id);
  return <PipelineView initialTarget={target} />;
}
