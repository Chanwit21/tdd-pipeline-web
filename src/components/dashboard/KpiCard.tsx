import { Card, CardHeader, CardTitle } from "./ui/Card";

const GRADIENTS: Record<string, string> = {
  accent: "linear-gradient(135deg,#ff7a1f,#ff9c4d)",
  success: "linear-gradient(135deg,#178a4c,#3fb877)",
  info: "linear-gradient(135deg,#2058c9,#5b8cf0)",
  danger: "linear-gradient(135deg,#c8321f,#e2624f)",
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
