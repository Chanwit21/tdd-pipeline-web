import { FilterOutlined } from "@ant-design/icons";

/** White card with a "ตัวกรอง" header + funnel icon, matching the prototype filter panel. */
export function FilterPanel({
  title = "ตัวกรอง",
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        boxShadow: "0 1px 2px rgba(16,24,48,.04), 0 8px 24px -12px rgba(16,24,48,.10)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "13px 18px 4px",
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        <FilterOutlined style={{ color: "var(--accent-ink)" }} />
        {title}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end", padding: "8px 18px 16px" }}>
        {children}
      </div>
    </div>
  );
}

export function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-muted)" }}>{label}</span>
      {children}
    </div>
  );
}
