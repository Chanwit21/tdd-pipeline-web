import { Card, CardHeader, CardTitle } from "./ui/Card";

const GRADIENTS: Record<string, string> = {
  accent: "linear-gradient(135deg,#F2661C,#f2884d)",
  success: "linear-gradient(135deg,#1A9A5B,#4dbf85)",
  info: "linear-gradient(135deg,#2E6BE6,#6f96f0)",
  danger: "linear-gradient(135deg,#E5484D,#ec7679)",
};

export function KpiCard({
  icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: string;
  label: string;
  value: string;
  sub: string;
  tone: "accent" | "success" | "info" | "danger";
}) {
  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        <div
          className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px] text-sm text-white"
          style={{ background: GRADIENTS[tone] }}
          aria-hidden
        >
          {icon}
        </div>
      </CardHeader>
      <div className="text-[19px] font-extrabold text-[#161c2c]">{value}</div>
      <div className="mt-1 text-xs text-[#6c7486]">{sub}</div>
    </Card>
  );
}
