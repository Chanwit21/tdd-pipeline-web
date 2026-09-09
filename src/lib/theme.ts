import type { ThemeConfig } from "antd";

/** antd theme mapped to the prototype design tokens (orange accent, navy sidebar). */
export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: "#ff7a1f",
    colorInfo: "#2058c9",
    colorSuccess: "#178a4c",
    colorWarning: "#b26a00",
    colorError: "#c8321f",
    colorTextBase: "#161c2c",
    colorBgLayout: "#eef1f7",
    borderRadius: 8,
    fontFamily: "var(--font-noto-thai), var(--font-jakarta), system-ui, sans-serif",
    fontSize: 14,
  },
  components: {
    Layout: {
      siderBg: "#0f1830",
      headerBg: "#ffffff",
      bodyBg: "#eef1f7",
    },
    Menu: {
      darkItemBg: "transparent",
      darkSubMenuItemBg: "transparent",
      darkItemColor: "rgba(255,255,255,0.68)",
      darkItemHoverColor: "#ffffff",
      darkItemSelectedBg: "rgba(255,255,255,0.10)",
      darkItemSelectedColor: "#ffffff",
    },
    Card: { borderRadiusLG: 16 },
    Table: { headerBg: "#f7f8fc", headerColor: "#6c7486", borderColor: "#e3e7f0" },
    Statistic: { titleFontSize: 13 },
  },
};
