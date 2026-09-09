export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap",
        marginBottom: 4,
      }}
    >
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--font-jakarta)", margin: 0 }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ margin: "5px 0 0", color: "var(--text-muted)", fontSize: 13 }}>{subtitle}</p>
        )}
      </div>
      {actions && <div style={{ display: "flex", gap: 10 }}>{actions}</div>}
    </div>
  );
}
