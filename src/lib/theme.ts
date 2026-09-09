import type { ThemeConfig } from "antd";

/** antd theme mapped to the prototype design tokens (tdd_pipeline_ui_web.html). */
export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: "#ff7a1f",
    colorInfo: "#2058c9",
    colorSuccess: "#178a4c",
    colorWarning: "#b26a00",
    colorError: "#c8321f",
    colorText: "#161c2c",
    colorTextSecondary: "#6c7486",
    colorBorder: "#e3e7f0",
    colorBorderSecondary: "#e3e7f0",
    colorBgLayout: "#eef1f7",
    borderRadius: 8,
    borderRadiusLG: 12,
    fontFamily: "var(--font-noto-thai), var(--font-jakarta), system-ui, sans-serif",
    fontSize: 14,
    boxShadowTertiary:
      "0 1px 2px rgba(16,24,48,.04), 0 8px 24px -12px rgba(16,24,48,.10)",
  },
  components: {
    Layout: {
      siderBg: "#0f1830",
      headerBg: "#ffffff",
      headerHeight: 62,
      headerPadding: "0 22px",
      bodyBg: "#eef1f7",
    },
    Menu: {
      darkItemBg: "transparent",
      darkSubMenuItemBg: "transparent",
      darkPopupBg: "#182446",
      darkItemColor: "#aab2c9",
      darkItemHoverColor: "#ffffff",
      darkItemHoverBg: "rgba(255,255,255,0.06)",
      darkItemSelectedBg: "#ff7a1f",
      darkItemSelectedColor: "#1a0e04",
      darkGroupTitleColor: "#616c8a",
      itemBorderRadius: 8,
      itemMarginInline: 8,
      itemHeight: 40,
      iconSize: 16,
    },
    Button: {
      primaryColor: "#1a0e04",
      borderRadius: 9,
      borderRadiusLG: 10,
      fontWeight: 600,
      primaryShadow: "0 8px 18px -8px rgba(255,122,31,.6)",
      defaultShadow: "none",
    },
    Card: {
      borderRadiusLG: 12,
      boxShadowTertiary:
        "0 1px 2px rgba(16,24,48,.04), 0 8px 24px -12px rgba(16,24,48,.10)",
    },
    Table: {
      headerBg: "#f7f8fc",
      headerColor: "#9aa1b3",
      headerSplitColor: "transparent",
      borderColor: "#e3e7f0",
      rowHoverBg: "#f7f8fc",
      cellPaddingBlock: 12,
    },
    Statistic: { titleFontSize: 12, contentFontSize: 25 },
    Input: { borderRadius: 8 },
    Select: { borderRadius: 8 },
    Modal: { borderRadiusLG: 16 },
    Tag: { borderRadiusSM: 20 },
  },
};
