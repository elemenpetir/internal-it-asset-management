# PRD — Internal IT Asset Management & Risk Scoring System

## 1. Ringkasan Proyek

**Nama proyek:** Internal IT Asset Management & Risk Scoring System  
**Tipe proyek:** REST API backend untuk Proyek 1  
**Target roadmap:** Mini Project Bulan 2, dipakai sebagai backend untuk React di Bulan 3  
**Stack utama:** Node.js, Express.js, MySQL, JWT, Jest, React frontend nanti

Project ini adalah sistem manajemen aset IT internal perusahaan untuk melacak aset, assignment ke karyawan, maintenance request, status lifecycle, audit log, dan analitik risiko aset.

Project ini tidak diposisikan sebagai aplikasi CRUD barang biasa, tetapi sebagai sistem internal perusahaan yang membantu tim IT/admin asset memonitor penggunaan aset, histori perpindahan, kondisi maintenance, dan kandidat aset berisiko tinggi.

---

## 2. Problem Statement

Perusahaan besar maupun menengah biasanya memiliki banyak aset IT seperti laptop, PC, monitor, printer, router, switch, perangkat jaringan, dan lisensi software. Masalah yang sering muncul:

- Aset sedang dipakai siapa tidak jelas.
- Riwayat perpindahan aset tidak terdokumentasi rapi.
- Aset rusak tetapi proses maintenance tidak ter-track.
- Aset idle atau available tidak terlihat secara cepat.
- Aset lama atau sering rusak tidak mudah diidentifikasi.
- Sulit melakukan audit aset per divisi atau per karyawan.
- Tidak ada metrik sederhana untuk menentukan aset mana yang perlu diprioritaskan untuk maintenance atau replacement review.

Sistem ini menyelesaikan masalah tersebut dengan menyediakan asset tracking, assignment history, maintenance workflow, audit log, operational analytics, dan rule-based risk scoring.

---

## 3. Tujuan Proyek

### Tujuan utama

Membangun REST API untuk mengelola aset IT internal perusahaan dengan fitur authentication, role-based access, asset lifecycle, assignment tracking, maintenance workflow, audit log, dan risk scoring.

### Tujuan teknis

- Menerapkan Express.js dengan struktur MVC.
- Menggunakan MySQL relational database.
- Menerapkan JWT authentication.
- Menerapkan role-based access control.
- Membuat workflow assignment dan maintenance.
- Membuat audit log untuk perubahan penting.
- Membuat analytics endpoint untuk dashboard.
- Membuat rule-based asset risk scoring.
- Menambahkan unit/integration test dasar.
- Menyediakan README dan dokumentasi API.

---

## 4. Target User & Role

### 4.1 Employee

Employee adalah karyawan yang menggunakan aset perusahaan.

Fitur yang bisa dilakukan:

- Login.
- Melihat aset yang sedang di-assign ke dirinya.
- Melihat detail aset miliknya.
- Membuat maintenance request jika aset bermasalah.
- Melihat status maintenance request.
- Melihat histori aset yang pernah dipakai.

Batasan:

- Tidak bisa membuat/edit asset.
- Tidak bisa assign asset.
- Tidak bisa melihat semua asset perusahaan secara penuh.
- Tidak bisa melihat dashboard risk seluruh perusahaan.

### 4.2 Asset Admin / IT Admin

Asset Admin adalah tim IT/admin yang mengelola aset.

Fitur yang bisa dilakukan:

- CRUD asset.
- CRUD employee sederhana.
- CRUD department sederhana.
- Assign asset ke employee.
- Return asset dari employee.
- Update status asset.
- Memproses maintenance request.
- Melihat assignment history.
- Melihat audit log.
- Melihat daftar asset high risk.

### 4.3 Manager

Manager adalah user yang memonitor kondisi aset dan mengambil keputusan operasional.

Fitur yang bisa dilakukan:

- Melihat dashboard ringkasan aset.
- Melihat asset utilization.
- Melihat asset distribution per department.
- Melihat maintenance analytics.
- Melihat asset high risk.
- Melihat kandidat asset untuk replacement review.

Batasan:

- Tidak fokus pada CRUD operasional harian.
- Tidak perlu melakukan assignment langsung pada MVP.

---

## 5. Scope MVP Backend Bulan 2

### 5.1 Authentication & Authorization

- Register user.
- Login user.
- JWT token.
- Middleware auth.
- Middleware role-based access.
- Role awal:
  - `employee`
  - `asset_admin`
  - `manager`

### 5.2 Employee & Department

- Create employee.
- Get all employees.
- Get employee detail.
- Update employee.
- Department sederhana.

Data employee hanya sebagai master data pendukung asset management, bukan HRIS penuh.

### 5.3 Asset Management

- Create asset.
- Get all assets.
- Get asset detail.
- Update asset.
- Delete/soft delete asset.
- Asset category.
- Asset status:
  - `available`
  - `assigned`
  - `under_maintenance`
  - `retired`

### 5.4 Asset Assignment

- Assign asset ke employee.
- Return asset.
- Melihat assignment aktif.
- Melihat assignment history.

Rule dasar:

- Hanya asset dengan status `available` yang bisa di-assign.
- Saat asset di-assign, status berubah menjadi `assigned`.
- Saat asset dikembalikan, status berubah menjadi `available`.
- Semua assignment dan return tercatat di audit log.

### 5.5 Maintenance Workflow

- Employee membuat maintenance request.
- Asset Admin melihat semua maintenance request.
- Asset Admin update status maintenance.
- Maintenance status:
  - `submitted`
  - `in_progress`
  - `completed`
  - `cancelled`

Rule dasar:

- Maintenance request harus terkait asset tertentu.
- Saat maintenance berjalan, asset bisa berubah menjadi `under_maintenance`.
- Setelah completed, asset bisa kembali ke `available` atau `assigned`, tergantung kondisi.
- Jika asset sudah tidak layak, asset bisa diubah ke `retired`.

### 5.6 Audit Log

Audit log mencatat perubahan penting.

Contoh aktivitas yang dicatat:

- Asset dibuat.
- Asset di-update.
- Asset di-assign.
- Asset dikembalikan.
- Status asset berubah.
- Maintenance request dibuat.
- Maintenance status berubah.

Data audit log minimal:

- `id`
- `entity_type`
- `entity_id`
- `action`
- `old_value`
- `new_value`
- `changed_by`
- `created_at`

### 5.7 Analytics & Risk Scoring

Dashboard analytics backend menyediakan:

- Total assets.
- Total assigned assets.
- Total available assets.
- Total assets under maintenance.
- Total retired assets.
- Asset count by department.
- Asset count by category.
- Maintenance count per month.
- High risk assets.
- Replacement candidate assets.

Risk scoring menggunakan rule-based method.

---

## 6. Rule-Based Asset Risk Scoring

### 6.1 Tujuan

Risk scoring digunakan untuk membantu admin/manager mengidentifikasi asset yang perlu diprioritaskan untuk maintenance review atau replacement review.

Sistem tidak memberi keputusan final, hanya memberi indikator risiko.

### 6.2 Faktor Risk Score

Faktor awal:

- Usia aset.
- Jumlah maintenance request.
- Status asset saat ini.
- Durasi asset under maintenance.
- Jumlah perpindahan assignment.

### 6.3 Contoh formula awal

Formula MVP bisa dibuat sederhana:

```txt
risk_score = age_score + maintenance_score + status_score + assignment_score
```

Contoh scoring:

```txt
age_score:
- < 2 tahun: 5
- 2–4 tahun: 15
- > 4 tahun: 30

maintenance_score:
- 0 request: 0
- 1–2 request: 15
- > 2 request: 30

status_score:
- available/assigned: 0
- under_maintenance: 20
- retired: 40

assignment_score:
- <= 2 assignment: 5
- 3–5 assignment: 10
- > 5 assignment: 15
```

Risk level:

```txt
0–30   = low
31–60  = medium
61–100 = high
```

### 6.4 Output risk scoring

```json
{
  "asset_id": 12,
  "asset_name": "Lenovo ThinkPad T480",
  "risk_score": 78,
  "risk_level": "high",
  "recommendation": "candidate for maintenance or replacement review"
}
```

---

## 7. Data Model Awal

### 7.1 users

```txt
id
name
email
password
role
created_at
updated_at
```

### 7.2 departments

```txt
id
name
created_at
updated_at
```

### 7.3 employees

```txt
id
user_id nullable
name
employee_number
email
department_id
position
status
created_at
updated_at
```

### 7.4 asset_categories

```txt
id
name
created_at
updated_at
```

### 7.5 assets

```txt
id
asset_code
name
category_id
brand
model
serial_number
purchase_date
status
location
notes
created_at
updated_at
```

### 7.6 asset_assignments

```txt
id
asset_id
employee_id
assigned_by
assigned_at
returned_at
status
notes
created_at
updated_at
```

### 7.7 maintenance_requests

```txt
id
asset_id
requested_by
issue_description
status
handled_by
resolution_note
created_at
updated_at
completed_at
```

### 7.8 audit_logs

```txt
id
entity_type
entity_id
action
old_value
new_value
changed_by
created_at
```

---

## 8. API Endpoint Draft

### 8.1 Auth

```txt
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### 8.2 Employees

```txt
GET    /api/employees
GET    /api/employees/:id
POST   /api/employees
PUT    /api/employees/:id
DELETE /api/employees/:id
```

### 8.3 Departments

```txt
GET    /api/departments
POST   /api/departments
PUT    /api/departments/:id
DELETE /api/departments/:id
```

### 8.4 Assets

```txt
GET    /api/assets
GET    /api/assets/:id
POST   /api/assets
PUT    /api/assets/:id
DELETE /api/assets/:id
```

Query filter:

```txt
GET /api/assets?status=assigned&category_id=1&department_id=2&page=1&limit=10
```

### 8.5 Asset Assignment

```txt
POST /api/assets/:id/assign
POST /api/assets/:id/return
GET  /api/assets/:id/assignments
GET  /api/employees/:id/assets
```

### 8.6 Maintenance

```txt
GET  /api/maintenance-requests
GET  /api/maintenance-requests/:id
POST /api/maintenance-requests
PUT  /api/maintenance-requests/:id/status
```

### 8.7 Audit Logs

```txt
GET /api/audit-logs
GET /api/assets/:id/audit-logs
```

### 8.8 Analytics

```txt
GET /api/analytics/overview
GET /api/analytics/assets-by-department
GET /api/analytics/assets-by-category
GET /api/analytics/maintenance-summary
GET /api/analytics/high-risk-assets
GET /api/assets/:id/risk-score
```

---

## 9. Frontend React Scope Bulan 3

Frontend React tidak dikerjakan di Bulan 2, tetapi backend harus disiapkan agar mudah dikonsumsi.

Frontend MVP:

- Login/register page.
- Dashboard overview.
- Asset list page.
- Asset detail page.
- Create/edit asset form.
- Employee list page.
- Assignment page.
- Maintenance request page.
- Audit history page.
- Analytics cards/chart sederhana.

Tidak perlu di awal:

- Upload file.
- Realtime notification.
- Drag and drop.
- QR code asset.
- AI integration.

---

## 10. Testing Scope

Minimal 3–5 test case endpoint utama.

Prioritas test:

- Auth login/register.
- Create asset.
- Assign asset.
- Create maintenance request.
- Get analytics overview.

Contoh test case:

```txt
1. User bisa login dan menerima JWT.
2. Asset admin bisa membuat asset baru.
3. Asset dengan status available bisa di-assign ke employee.
4. Employee bisa membuat maintenance request untuk asset miliknya.
5. Analytics overview mengembalikan total asset dan status summary.
```

---

## 11. Non-Functional Requirements

- `.env` tidak boleh di-commit.
- Password harus di-hash.
- Semua protected route wajib memakai JWT middleware.
- Role-based route harus dibatasi.
- Response error harus konsisten.
- Query list harus mendukung pagination.
- Input harus divalidasi.
- Audit log tidak boleh dihapus oleh user biasa.
- README harus menjelaskan problem, fitur, tech stack, setup, API, dan ERD.

---

## 12. Out of Scope untuk MVP

Fitur berikut tidak dikerjakan dulu:

- QR code asset.
- Upload dokumen/foto asset.
- Approval bertingkat.
- Notification email/Telegram.
- Realtime update.
- AI real.
- Barcode scanner.
- Import Excel.
- Export PDF/Excel.
- Docker Compose.
- CI/CD.

Fitur tersebut bisa menjadi enhancement setelah MVP selesai.

---

## 13. Roadmap Implementasi

### Minggu 4 Bulan 2 — Backend MVP

Fokus utama: backend inti yang siap dipakai React bulan Juni.

1. Setup project structure.
2. Setup database schema dasar.
3. Auth + JWT.
4. Role-based middleware.
5. Employee & department master data.
6. CRUD asset.
7. Asset assignment flow:
   - assign asset to employee
   - return asset
   - assignment history
8. Audit log dasar:
   - asset created
   - asset updated
   - asset assigned
   - asset returned
9. README awal:
   - deskripsi project
   - problem statement
   - tech stack
   - cara install
   - daftar endpoint awal

### Optional Minggu 4 — Jika Waktu Cukup

1. Maintenance request flow versi sederhana.
2. Dashboard summary endpoint sederhana.
3. Unit test dasar 1–3 endpoint utama.

### Bulan 3 — React Frontend + Backend Enhancement

Fokus utama: frontend React dan penyempurnaan backend bertahap.

1. Auth UI.
2. Dashboard overview.
3. Asset list/detail.
4. Form tambah/edit asset.
5. Assignment UI.
6. Maintenance UI.
7. Audit history UI.
8. Analytics cards/chart sederhana.
9. Backend enhancement:
   - maintenance workflow lengkap
   - analytics endpoint
   - risk scoring function
   - unit test tambahan

### Bulan 4 — Deployment & DevOps

1. Deploy app.
2. Dockerize backend.
3. GitHub Actions basic.
4. README final dengan screenshot.

---

## 14. CV Positioning

Draft wording:

```txt
Internal IT Asset Management & Risk Scoring System
Built a REST API for managing internal IT assets with role-based access control, asset assignment tracking, maintenance workflow, audit logs, operational analytics, and rule-based asset risk scoring using Node.js, Express, MySQL, JWT, and unit testing.
```

---

## 15. Success Criteria

Project dianggap selesai untuk MVP jika:

- Auth dan role berjalan.
- Asset CRUD berjalan.
- Assignment asset berjalan.
- Maintenance request berjalan.
- Audit log tercatat untuk perubahan penting.
- Analytics overview tersedia.
- Risk scoring tersedia.
- Minimal 3–5 test case berjalan.
- README lengkap.
- Backend siap dikonsumsi React di Bulan 3.
