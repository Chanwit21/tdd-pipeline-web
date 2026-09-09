import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        text: "var(--text)",
        "text-muted": "var(--text-muted)",
        "text-faint": "var(--text-faint)",
        sidebar: "var(--sidebar)",
        "sidebar-2": "var(--sidebar-2)",
        accent: "var(--accent)",
        "accent-ink": "var(--accent-ink)",
        "accent-weak": "var(--accent-weak)",
        success: "var(--success)",
        "success-weak": "var(--success-weak)",
        warning: "var(--warning)",
        "warning-weak": "var(--warning-weak)",
        danger: "var(--danger)",
        "danger-weak": "var(--danger-weak)",
        info: "var(--info)",
        "info-weak": "var(--info-weak)",
        slate: "var(--slate)",
        "slate-weak": "var(--slate-weak)",
      },
      borderRadius: {
        s: "8px",
        m: "12px",
        l: "16px",
      },
      fontFamily: {
        sans: ["var(--font-noto-thai)", "var(--font-jakarta)", "system-ui", "sans-serif"],
        display: ["var(--font-jakarta)", "var(--font-noto-thai)", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,48,.04), 0 8px 24px -12px rgba(16,24,48,.10)",
        pop: "0 20px 60px -12px rgba(10,16,32,.35)",
      },
    },
  },
  plugins: [],
};

export default config;
