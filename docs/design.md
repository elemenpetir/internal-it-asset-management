# Design Direction — Internal IT Asset Management

> Kontrak visual redesign shadcn. Keputusan di sini mengikat eksekusi Fase 0–3.
> Menolak sesuatu di Bagian 6 butuh alasan tertulis, bukan selera sesaat.

## 1. Arah visual

Utilitarian IT operations console untuk admin/manager internal. Prioritas:
**density, hierarchy, clarity, scanability** — bukan dekorasi. Terasa seperti
software operasional sungguhan (Jira/Linear internal tool), bukan template
dashboard AI: tanpa gradient, glassmorphism, blur, oversized icon, ilustrasi.

## 2. Design tokens

| Token              | Nilai       | Penggunaan                        |
| ------------------ | ----------- | --------------------------------- |
| Primary 600        | `#2563EB`   | Button, active nav, link, CTA     |
| Primary 700        | `#1D4ED8`   | Hover, active state               |
| Primary 100        | `#DBEAFE`   | Active nav background (terukur)   |
| Background         | `#F8FAFC`   | Background aplikasi               |
| Surface            | `#FFFFFF`   | Sidebar, tabel, modal, dialog     |
| Border             | `#E2E8F0`   | Border/divider (pengganti shadow) |
| Text primary       | `#0F172A`   | Judul, angka KPI                  |
| Text secondary     | `#64748B`   | Label, metadata                   |
| Text muted         | `#94A3B8`   | Placeholder, hint                 |
| Success            | `#16A34A`   | Available, completed, low risk    |
| Warning            | `#D97706`   | Medium risk, maintenance          |
| Danger             | `#DC2626`   | High risk, retired, error         |
| Info               | `#0891B2`   | Status informasional              |

- Blue hanya untuk action/selection/link/active-nav. Satu-satunya warna
  bermakna lain di layar adalah semantic color (status/risk).
- Tipografi: **Inter** (page 24–28/700, section 16–18/600, body 14, tabel
  13–14, metadata 12–13, KPI 28–32/700). Asset code pakai `font-mono`,
  angka KPI/tabel pakai `tabular-nums`.
- Radius: card/modal 12px, input/button 8px, badge 999px.
- Shadow: nyaris tidak ada — `0 1px 2px rgba(15,23,42,.05)` maksimal,
  selebihnya `1px solid #E2E8F0`.
- Ikon: Lucide outline. Risk divisualkan segmented bar + angka, bukan
  badge warna saja.

## 3. Layout shell

- Sidebar **terang** (`#FFFFFF`, border kanan `#E2E8F0`), bukan navy.
  Active item: background blue sangat terukur + indikator kiri.
- Grup nav (presentasional saja, route tidak berubah):

```text
INTERNAL IT ASSET
Overview            → /
Assets
  Inventory         → /assets
  Assignments       → /assignments
Employees           → /employees
Maintenance         → /maintenance
Audit Log           → /audit-logs
────────────────────
Administration
Departments         → /departments
```

- Topbar minimal: judul halaman + info user + logout. Search tetap per
  halaman, bukan global.
- Content `#F8FAFC`. Seksi flat + border; kartu hanya di mana perlu
  kontainer (auth, dialog, seksi detail aset).

## 4. Pola per halaman

- **Dashboard:** summary strip padat satu baris (Total/Assigned/Available/
  Maintenance, tanpa kartu melayang) + donut distribusi + line maintenance
  trend + tabel high-risk kompak. Recharts dipertahankan.
- **Operasional (Assets, Assignments, Maintenance, Employees, Audit):**
  toolbar (search + filter + tombol aksi) → summary strip → tabel dense
  (header `#F8FAFC`, hover `#F1F5F9`, 13–14px).
- **Auth:** satu-satunya halaman card penuh (Card terpusat).
- Flash message `navigate(state)` diganti Sonner; modal tambah/edit diganti
  Dialog; loading box diganti Skeleton.

## 5. Komponen shadcn yang dipakai (daftar tutup)

`Button`, `Input`, `Select`, `Textarea`, `Label`, `Table`, `Badge`,
`Card` (auth/dialog/detail saja), `Dialog`, `Sonner`, `Skeleton`,
`Pagination`, `Separator`. Plus `lucide-react`. Tidak ada komponen
dekoratif di luar daftar ini tanpa update dokumen.

## 6. Yang eksplisit DITOLAK

- Sidebar navy / full dark mode — pola template AI-slop; sidebar terang
  adalah pembeda utama.
- Nav Analytics/Settings — halamannya tidak ada; tidak ada tombol mati.
- KPI "↑ N this month" — backend tanpa snapshot historis; backlog bersama
  pagination audit.
- Global search Topbar — butuh desain API; search per halaman cukup.
- Gradient, glassmorphism, blur, ilustrasi, oversized icon — bukan produk
  operasional.
- Migrasi TypeScript — tetap `.jsx`; shadcn dipakai dalam bentuk JS.

## 7. Fase eksekusi

- **Fase 0 — Fondasi.** `npx shadcn init` (template vite, CSS variables,
  light only) + verifikasi CLI emit JS (fallback: copy manual + hapus
  anotasi tipe) + `@theme` tokens + Inter + `lib/utils.js`.
  Selesai jika: `vite build` hijau + 1 komponen shadcn render.
- **Fase 1 — Primitif.** Daftar Bagian 5 terpasang; `StatusBadge`,
  `DashboardCard`, `PageHeader`, `ArrowIcon` lama pensiun.
  Selesai jika: build hijau, tidak ada import komponen lama.
- **Fase 2 — Per area.** Shell → auth → dashboard → 6 halaman operasional
  → audit logs. Satu commit per area.
  Selesai jika: tiap area lolos cek 3 role + 403 + modal + pagination.
- **Fase 3 — Finishing.** README (stack + tokens), screenshot ulang/hapus
  yang basi. Selesai jika: README akurat, CI hijau.
