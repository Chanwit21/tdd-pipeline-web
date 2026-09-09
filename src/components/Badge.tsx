import { Tag } from "antd";

const STAGE_GREEN = ["Won", "PO"];
const STAGE_GREY = ["Lost", "Cancelled", "On Hold"];

export function StageBadge({ stage }: { stage: string }) {
  const color = STAGE_GREEN.includes(stage)
    ? "success"
    : STAGE_GREY.includes(stage)
    ? "default"
    : "orange";
  return <Tag color={color} bordered={false}>{stage}</Tag>;
}

export function StatusBadge({ status }: { status: string }) {
  const color = status === "PR" ? "blue" : status === "Inactive" ? "default" : "gold";
  return <Tag color={color} bordered={false}>{status}</Tag>;
}

export function SituationBadge({ situation }: { situation: string }) {
  const color =
    situation === "Best Case" ? "success" : situation === "Worst Case" ? "error" : "blue";
  return <Tag color={color} bordered={false}>{situation}</Tag>;
}
