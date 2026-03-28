# Task

## Judul
- Nama perubahan / fitur: Altafit — complete improvement plan batch 1
- Jenis: Feature
- Status: In Progress

## Checklist
### Planning
- [x] Sinkronkan plan repo dengan improvement plan user
- [x] Tetapkan batch aman: Phase 1 + logic fixes inti Phase 2

### Shared UI primitives
- [ ] Tambah `PageTransition.jsx`
- [ ] Tambah `AnimatedNumber.jsx`
- [ ] Tambah `ProgressRing.jsx`
- [ ] Tambah `ProgressBar.jsx`
- [ ] Tambah `FlashBanner.jsx`

### Dashboard polish + logic
- [ ] Kirim ring progress dari backend
- [ ] Ganti ring hardcoded dengan progress real
- [ ] Tambah animated number untuk KPI utama
- [ ] Tambah macro progress bars
- [ ] Dynamic Y-axis labels
- [ ] Flash banner auto-dismiss

### Chat polish + logic
- [ ] Tampilkan confidence badge
- [ ] Upgrade `NutritionEstimator` dengan preset lebih kaya
- [ ] Support makanan Indonesia
- [ ] Improve portion multiplier handling
- [ ] Support compound foods
- [ ] Improve confidence score calculation

### Shared polish
- [ ] Tambah keyframes/transition tokens dasar
- [ ] Tambah hover polish dan transition kecil
- [ ] Tambah page transition wrapper

### Validation
- [ ] `php artisan test`
- [ ] `npm run build`
- [ ] Ringkas hasil untuk user

## Guardrails
- [ ] Biarkan perubahan tetap uncommitted
- [ ] Hindari refactor besar auth/scalability dulu pada batch ini

## Notes
- User meminta pengerjaan mengikuti plan besar, jadi implementasi diprioritaskan per batch agar tetap aman dan reviewable
