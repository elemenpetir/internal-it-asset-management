# Bug Register — Internal IT Asset Management

> Sumber: audit kode menyeluruh (backend, frontend, tests) vs PRD + README.
> Urutan: Kritis (Batch 1) → Sedang (Batch 2) → Rendah + Test (Batch 3).
>
> Aturan main:
> - Centang `[x]` hanya saat fix + verifikasinya hijau.
> - Tiap fix wajib sebut ID (`B3`, `T2`) di pesan commit.
> - Baris yang ternyata bukan bug tidak dihapus, tapi dicoret `~~seperti ini~~` + alasan.

## Kritis — Batch 1

- [ ] **B1. Transisi asset status bebas.** `PATCH /assets/:id/status`
      (backend/src/controllers/assetController.js) hanya whitelist nilai,
      tanpa matriks transisi. Repro: `PATCH {status:available}` saat aset
      masih `assigned` aktif → status berubah, `asset_assignments` tetap `active`.
- [ ] **B2. Transisi maintenance bebas.** `PATCH /maintenance-requests/:id/status`
      terima `in_progress/completed/canceled` dari status apa pun
      (controller + maintenanceRequestModel.js). Repro: request `reported`
      langsung `PATCH {status:completed}` → aset dipaksa `assigned` tanpa
      pernah `under_maintenance`.
- [ ] **B3. Race assignment ganda.** Cek `asset.status !== available` di luar
      transaksi + tanpa constraint cegah 2 assignment `active` per aset
      (assetAssignmentController.js + assetAssignmentModel.js + schema.sql).
      Repro: 2x `POST /api/asset-assignments` paralel → 2 baris `active`.
- [ ] **B4. Audit `changed_by` salah orang.** `createMaintenance`
      (maintenanceRequestModel.js) isi `changed_by` dengan `employees.id`,
      padahal FK-nya `users.id`. Repro: employee dengan `employees.id ≠ users.id`
      submit request → FK error/rollback request valid, atau audit menunjuk orang salah.
- [ ] **B5. IDOR assignment + maintenance detail.** `GET /asset-assignments/:id`
      dan `GET /maintenance-requests/:id/detail` tanpa `roleMiddleware`.
      Repro: employee A `GET` data milik employee B → 200.
- [ ] **B6. Crash 500 ganti 404.** `PATCH /maintenance-requests/:id/status`
      baca `currentData[0].status` tanpa cek kosong (maintenanceRequestModel.js).
      Repro: `PATCH /9999/status` → `TypeError` 500, seharusnya 404.
- [ ] **B7. Return timpa maintenance.** Cek `under_maintenance` di luar transaksi,
      transaksi buta set `assets=available`. Repro: return dicek `assigned`,
      sebelum commit admin set `in_progress` → commit timpa jadi `available`.
- [ ] **B8. Route frontend tanpa guard role.** `App.jsx` hanya cek token.
      Repro: employee buka `/employees`, `/audit-logs`, `/assets/new` → render + fetch 403 sia-sia.
- [ ] **B9. Manager read-only (KEPUTUSAN: ikut PRD 4.3 + README).**
      Route `POST /asset-assignments` dan `PATCH /:id/return` izinkan `manager`;
      frontend sembunyikan form untuk manager. Backend dan frontend tidak sepakat.
      Fix: cabut `manager` dari kedua route + samakan frontend (tetap sembunyi).
- [ ] **B10. Validasi form vs backend tidak sinkron.** Form employee hanya wajibkan
      nama+email (backend wajib 5 field); `completed` tanpa note selalu 400;
      admin hapus `employee_number` setelah Search → 400. Fix di frontend
      (wajibkan + kunci field yang dipakai submit).

## Sedang — Batch 2

- [ ] **B11. Status employee tak di-whitelist.** `PUT /employees/:id` teruskan
      string apa pun ke `ENUM(active,inactive)` → 500, seharusnya 400.
- [ ] **B12. Paginasi tak divalidasi.** `page/limit` mentah ke `LIMIT/OFFSET`.
      Repro: `?limit=abc` / `limit=0` → 500 atau `total_pages: NaN`.
- [ ] **B13. Complete buta set `assigned`.** Maintenance aset `available`
      (tanpa assignment) → complete → jadi `assigned` tanpa baris assignment.
- [ ] **B14. Deactivate ber-assignment.** `DELETE /employees/:id` tanpa cek
      assignment aktif → aset terjebak `assigned`, histori yatim.
- [ ] **B15. Hapus department terpakai → 500.** `ER_ROW_IS_REFERENCED_2` tak
      ditangani errorMiddleware (hanya DUP_ENTRY + NO_REFERENCED_ROW).
- [ ] **B16. `my-assets` kosong → 404.** Seharusnya 200 `[]` (employee baru
      tanpa assignment tampil error, padahal state valid).
- [ ] **B17. Update aset assigned.** `PUT /assets/:id` boleh ganti
      `asset_code/serial/category` saat `assigned/under_maintenance`.
- [ ] **B18. `roleMiddleware` crash tanpa auth.** Akses `req.user.role` sebelum
      cek `req.user` → `TypeError` 500 jika dipasang tanpa `authMiddleware`.
- [ ] **B19. Token malformed → blank page.** `utils/auth.js` tanpa try/catch;
      `localStorage token="xxx"` → reload → exception.
- [ ] **B20. Next aktif saat 0 hasil.** `total_pages=0`, `1!==0` → `setPage(0)`
      → fetch `page=0`.
- [ ] **B21. Fetch tanpa Abort ×3.** Risk/history AssetDetail, 6 analytics
      Dashboard, Search aset CreateMaintenance → data basi menimpa.
- [ ] **B22. `department_id: 0` terkirim.** Form employee tanpa pilih department
      kirim `Number("")=0` → 400 tipe salah.
- [ ] **B23. Umur null → +30.** `getAgeScore(null)` = `new Date(null)` = 1970
      → aset tanpa tanggal selalu terlihat tua.
- [ ] **B24. `canceled` hilang dari strip.** Ringkasan maintenance hanya hitung
      reported/in_progress/completed.
- [ ] **B25. Tanpa route 404.** URL asing render kosong (hanya Toaster).

## Rendah + Test — Batch 3

- [ ] **B26. `Invalid Date`.** `Departments.jsx` tanpa fallback saat `created_at` null.
- [ ] **B27. `undefined (undefined)`.** `MaintenanceDetail.jsx` tanpa fallback
      saat employee pengaju dihapus.
- [ ] **B28. RiskCell fallback hijau.** `risk_level` null/unknown → badge `low`,
      menyesatkan.
- [ ] **B29. Back link reset filter.** Detail → Back selalu ke page 1 tanpa
      filter/search sebelumnya.
- [ ] **B30. Audit fetch 403 sebelum redirect.** Employee buka `/audit-logs`:
      redirect + fetch 403 jalan bersamaan.
- [ ] **B31. Kategori gagal tanpa retry.** `AssetForm.jsx`: Select kosong,
      user terkunci validasi.
- [ ] **B32. Badge kosong.** `StatusBadge` status null → badge abu tanpa label.
- [ ] **B33. `GET /me` tanpa nama.** Hanya `{id,role}`; Topbar butuh nama.
- [ ] **T1. Test return assignment.** Happy-path + double-return 400 + tolak
      saat `under_maintenance` (satu-satunya penulis status kembali, nol test).
- [ ] **T2. Test transisi maintenance.** Full transisi + `completed` tanpa
      `resolution_note` → 400.
- [ ] **T3. Test aktivasi.** Sukses + aktivasi ganda 400.
- [ ] **T4. Test guard maintenance.** Tolak aset bukan miliknya + tolak duplikat
      active-request.
- [ ] **T5. Test risk score.** Unit `calculateRiskScore` + boundary low/medium/high.
