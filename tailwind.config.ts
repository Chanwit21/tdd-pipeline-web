import type { Config } from "tailwindcss";

// Scoped to the Dashboard page only (ADR-0008) — content globs limit which
// files Tailwind scans for class names, so no utility class is ever
// generated for the rest of the app even though the PostCSS plugin runs
// globally. preflight is off so the base reset never touches globals.css.
const config: Config = {
  content: [
    "./src/app/(app)/dashboard/**/*.{ts,tsx}",
    "./src/components/dashboard/**/*.{ts,tsx}",
  ],
  corePlugins: {
    preflight: false,
  },
  plugins: [],
};
export default config;
