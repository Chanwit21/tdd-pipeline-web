import type { Config } from "tailwindcss";

// App-wide as of ADR-0009 (supersedes the ADR-0008 Dashboard-only scope).
// preflight stays off PERMANENTLY, not just transitionally: only Dashboard
// and part of Sales Pipeline were rebuilt with real Tailwind utility
// classes. Reports, Master Data, User Management, Login, and DealFormModal
// still render through globals.css's hand-written classes (buttons, tables,
// lists, modals) that assume the browser's un-reset defaults — turning
// preflight on would strip those out from under them. Revisit only if a
// future initiative actually rewrites those pages onto Tailwind utilities.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        border: "var(--border)",
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        text: "var(--text)",
        "text-muted": "var(--text-muted)",
        sidebar: "var(--sidebar)",
        "sidebar-2": "var(--sidebar-2)",
        accent: "var(--accent)",
        "accent-weak": "var(--accent-weak)",
        success: "var(--success)",
        "success-weak": "var(--success-weak)",
        warning: "var(--warning)",
        "warning-weak": "var(--warning-weak)",
        danger: "var(--danger)",
        "danger-weak": "var(--danger-weak)",
        info: "var(--info)",
        "info-weak": "var(--info-weak)",
      },
      borderRadius: {
        lg: "14px",
        md: "12px",
        sm: "8px",
      },
    },
  },
  plugins: [],
};
export default config;
