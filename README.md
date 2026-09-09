# TDD Pipeline Web (Frontend)

Frontend ของ **TDD Pipeline Web Application** (Phase 1)

| | |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| UI | Ant Design 5 — ธีมสีส้ม/navy ตาม prototype (`src/lib/theme.ts`) |
| Auth | JWT เก็บใน `localStorage`, `AuthProvider` + guard ที่ `app/(app)/layout.tsx` |
| Backend | [tdd-pipeline-api](https://git.g-able.com/amc/tdd-pipeline-api) |

## Dev

```bash
npm install
npm run dev          # http://localhost:3000
```

ต้องมี backend รันที่ `http://localhost:8080` (ดู repo `tdd-pipeline-api` หรือ `tdd-support-workspace` สำหรับ docker-compose รวม)

ตั้ง base URL ของ API ผ่าน env:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

## Build

```bash
npm run build && npm start
```

หรือ Docker (`output: "standalone"`):

```bash
docker build --build-arg NEXT_PUBLIC_API_BASE_URL=http://localhost:8080 -t tdd-pipeline-web .
docker run -p 3000:3000 tdd-pipeline-web
```

## โครงสร้าง

```
src/
├── app/
│   ├── login/                     หน้า login
│   └── (app)/                     กลุ่ม route ที่ต้อง auth (มี AppShell sidebar)
│       ├── dashboard/
│       ├── pipeline/  [id]/       ตาราง + form modal (ทั้งสร้าง/แก้ไข)
│       ├── reports/               pr-by-team / smt-qbr / pipeline-by-team
│       └── admin/                 users / master-config
├── components/
│   ├── AppShell.tsx               Layout + Sider + Menu
│   ├── deal/                      PipelineView, DealFormModal
│   └── report/                    ReportShell, PivotTable
└── lib/
    ├── api.ts                     fetch wrapper + JWT + ApiError
    ├── auth.tsx                   AuthProvider / useAuth
    ├── validation.ts              mirror ของ backend DealValidator (error code ตรงกัน)
    ├── theme.ts                   antd ConfigProvider theme
    └── format.ts / types.ts / hooks.ts / toast.ts
```

## Validation

`src/lib/validation.ts` เป็น mirror ของ `DealValidator.java` ฝั่ง backend — ใช้เพื่อ inline UX เท่านั้น
server เป็น source of truth เสมอ (422 `{errors:[{field,code,message}]}` จะถูก map เข้า field ของ antd Form ผ่าน error `code`)
