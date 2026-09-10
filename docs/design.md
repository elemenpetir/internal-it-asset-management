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
| Primary 600        | `#2563EB`   | Button fill, active nav, CTA      |
| Primary 500        | `#3B82F6`   | Hover (dicerahkan untuk dark bg)  |
| Link               | `#60A5FA`   | Warna teks link (bukan primary: `#2563EB` sebagai teks hanya 3.5 kontras, gagal WCAG AA) |
| Background         | `#020617`   | Background konten (slate-950)     |
| Sidebar            | `#0F172A`   | Panel sidebar (slate-900)         |
| Card               | `#0F172A`   | Tabel, modal, dialog (slate-900)  |
| Border             | `#1E293B`   | Border/divider (slate-800)        |
| Text primary       | `#F1F5F9`   | Judul, angka KPI (slate-100)      |
| Text secondary     | `#94A3B8`   | Label, metadata (slate-400)       |
| Success            | `#22C55E`   | Available, completed, low risk    |
| Warning            | `#F59E0B`   | Medium risk, maintenance          |
| Danger             | `#F87171`   | High risk, retired, error         |
| Info               | `#22D3EE`   | Status informasional              |

- Tema: **dark only, slate (bukan hitam)**. Tidak ada toggle, tidak ada
  class `.dark` — `:root` langsung bernilai gelap. Alasan: background putih
  menyebabkan silau untuk pemakaian operasional lama.
- Semantic di dark memakai gaya translucent + teks terang (misal
  `bg-green-500/15 text-green-400`), bukan badge muted terang.
- Blue hanya untuk action/selection/link/active-nav.
- Tipografi: **Inter** (page 24–28/700, section 16–18/600, body 14, tabel
  13–14, metadata 12–13, KPI 28–32/700). Asset code pakai `font-mono`,
  angka KPI/tabel pakai `tabular-nums`.
- Radius: card/modal 12px, input/button 8px, badge 999px.
- Shadow: nyaris tidak ada — `0 1px 2px rgba(15,23,42,.05)` maksimal,
  selebihnya `1px solid #1E293B`.
- Ikon: Lucide outline. Risk divisualkan segmented bar + angka, bukan
  badge warna saja.

## 3. Layout shell

- Sidebar `#0F172A` dengan border kanan `#1E293B`; konten `#020617`.
  Active item: background blue translucent + indikator primary.
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
- Content `#020617`. Seksi flat + border; kartu hanya di mana perlu
  kontainer (auth, dialog, seksi detail aset).

## 4. Pola per halaman

- **Dashboard:** summary strip padat satu baris (Total/Assigned/Available/
  Maintenance, tanpa kartu melayang) + donut distribusi + line maintenance
  trend + tabel high-risk kompak. Recharts dipertahankan.
- **Operasional (Assets, Assignments, Maintenance, Employees, Audit):**
  toolbar (search + filter + tombol aksi) → summary strip → tabel dense
  (header `#0F172A`, hover `#1E293B`, 13–14px).
- **Auth:** satu-satunya halaman card penuh (Card terpusat).
- Flash message `navigate(state)` diganti Sonner; modal tambah/edit diganti
  Dialog; loading box diganti Skeleton.

## 5. Komponen shadcn yang dipakai (daftar tutup)

`Button`, `Input`, `Select`, `Textarea`, `Label`, `Table`, `Badge`,
`Card` (auth/dialog/detail saja), `Dialog`, `Sonner`, `Skeleton`,
`Pagination`, `Separator`. Plus `lucide-react`. Tidak ada komponen
dekoratif di luar daftar ini tanpa update dokumen.

## 6. Yang eksplisit DITOLAK

- Light mode penuh — aplikasi dark-only; background putih menyebabkan
  silau untuk pemakaian operasional lama. Tidak ada toggle tema.
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

## 8. Mobile (≤768px)

- Sidebar jadi drawer: hidden default, hamburger di Topbar (`md:hidden`),
  backdrop gelap, auto-close saat navigasi. Desktop tidak berubah.
- Strip angka: `gap-px` di atas `bg-border` (bukan `divide-x`) agar wrap
  2×2 rapi tanpa garis nyasar.
- Tabel: geser horizontal dalam kartu (bawaan shadcn `Table`).
- Grid → 1 kolom; toolbar → vertikal; dialog/auth sudah aman.
- Verifikasi di 375px tiap ubah layout.
