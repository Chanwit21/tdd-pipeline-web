# tdd-pipeline-web

Frontend ของ TDD Pipeline. **ขยายจาก** workspace `CLAUDE.md` ที่ repo
`tdd-support-workspace` (clone ไว้ระดับเดียวกัน) — อ่านอันนั้นก่อนสำหรับภาพรวม
ทั้งโปรแกรม, git/MR conventions, human/AI split, และ ADR ทั้งหมด.

## Stack

| | |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| UI | **ไม่มี component library** — CSS ของ prototype ยกมาตรง ๆ ([ADR-0002](../tdd-support-workspace/docs/adr/0002-frontend-no-component-library.md)) |
| Auth | JWT ใน `localStorage` + client-side route guard ([ADR-0003](../tdd-support-workspace/docs/adr/0003-jwt-localstorage-client-auth.md)) |
| Backend | `tdd-pipeline-api` — `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:8080`) |

## Dev

```bash
npm install
npm run dev              # http://localhost:3000  (ต้องมี backend ที่ :8080)
npm run build            # ต้องผ่านก่อนเปิด MR
```

## โครงสร้าง

```
src/
├── app/
│   ├── login/                   หน้า login (two-panel split)
│   └── (app)/                   route group ที่ต้อง auth (มี AppShell)
│       ├── dashboard / pipeline / [id] / reports / admin/*
│       └── layout.tsx           guard: ไม่มี user → /login
├── components/
│   ├── AppShell.tsx             sidebar (collapse toggle) + topbar + content
│   ├── ui.tsx                   primitives: PageHead, Panel, FilterBar, Field, Select,
│   │                            Badge, StageBadge, StatusBadge, SituationBadge, Pager,
│   │                            Subtabs, Modal, CenterSpinner
│   ├── icons.tsx                inline SVG
│   ├── Toast.tsx                toast context
│   ├── deal/                    PipelineView, DealFormModal
│   └── report/ReportPage.tsx    3 reports = component เดียว + subtabs
├── lib/
│   ├── api.ts                   fetch wrapper + JWT + ApiError (map 422 → field ด้วย code)
│   ├── auth.tsx                 AuthProvider / useAuth
│   ├── validation.ts            mirror ของ backend DealValidator ([ADR-0005](../tdd-support-workspace/docs/adr/0005-validation-mirrored-error-code-contract.md))
│   ├── hooks.ts                 useMasterConfig (cached)
│   └── format.ts / types.ts
└── app/globals.css              = prototype CSS (design tokens + ทุก component class)
```

## กฎเฉพาะ repo นี้

- **ตรงกับ `../tdd-support-workspace/detailed-spec-webapp/tdd_pipeline_ui_web.html` เป๊ะ** —
  ห้ามเพิ่ม max-width / centering / padding ที่ prototype ไม่มี. `.content` =
  `padding: 22px 26px 60px; width: 100%`. ดู `docs/ANTI-PATTERNS.md` ใน 워크스페이스.
  ข้อยกเว้นที่ผู้ใช้สั่ง: ตัวอักษรในปุ่ม primary/login/pager เป็น `#fff`.
- Filter ใช้ native `<select>` (single-value + option "ทั้งหมด") — ไม่ทำ fancy multi-select
- `validation.ts` เป็นแค่ UX — **server เป็น source of truth**. แก้กฎ = แตะทั้ง
  `validation.ts`, `DealValidator.java`, spec table, และ test ฝั่ง BE
- Situation / Deal Owner เป็น read-only จาก server เสมอ — FE แค่ disable field ไว้
- `npm run build` ต้องผ่าน (type-check + lint) ก่อนเปิด MR — ดู skill `manage-mr`

## Deploy

`output: "standalone"` + `Dockerfile` (multi-stage). Build arg `NEXT_PUBLIC_API_BASE_URL`.
Compose อยู่ที่ `tdd-support-workspace/docker-compose.yml`.
