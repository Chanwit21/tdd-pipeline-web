type Tone = "info" | "success" | "accent" | "danger";

const TONE: Record<Tone, { bg: string; fg: string }> = {
  info: { bg: "var(--info-weak, #e9f0ff)", fg: "var(--info)" },
  success: { bg: "var(--success-weak, #e5f7ec)", fg: "var(--success)" },
  accent: { bg: "var(--accent-weak, #fff0e2)", fg: "var(--accent-ink)" },
  danger: { bg: "var(--danger-weak, #fdeae7)", fg: "var(--danger)" },
};

export function KpiCard({
  label,
  value,
  icon,
  tone = "info",
  sub,
  subStrong,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone?: Tone;
  sub?: string;
  subStrong?: boolean;
}) {
  const t = TONE[tone];
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: 18,
        boxShadow: "0 1px 2px rgba(16,24,48,.04), 0 8px 24px -12px rgba(16,24,48,.10)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>{label}</span>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            display: "grid",
            placeItems: "center",
            background: t.bg,
            color: t.fg,
          }}
        >
          {icon}
        </div>
      </div>
      <div
        className="num"
        style={{ fontSize: 25, fontWeight: 800, marginTop: 10, letterSpacing: "-0.01em" }}
      >
        {value}
      </div>
      {sub && (
        <div
          style={{
            marginTop: 5,
            fontSize: 11.5,
            color: subStrong ? "var(--success)" : "var(--text-faint, #9aa1b3)",
            fontWeight: subStrong ? 700 : 400,
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}
