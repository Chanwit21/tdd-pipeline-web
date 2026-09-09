"use client";

import { ConfigProvider, App as AntApp } from "antd";
import thTH from "antd/locale/th_TH";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { AuthProvider } from "@/lib/auth";
import { antdTheme } from "@/lib/theme";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AntdRegistry>
      <ConfigProvider theme={antdTheme} locale={thTH}>
        <AntApp>
          <AuthProvider>{children}</AuthProvider>
        </AntApp>
      </ConfigProvider>
    </AntdRegistry>
  );
}
