# Task

## Judul
- Nama perubahan / fitur: Altafit — bootstrap aplikasi Laravel + React Inertia + MySQL dengan UI Stitch yang clean, modular, responsive
- Jenis: System-Refactor
- Status: Planning

## Checklist
### Prep
- [x] Konfirmasi scope
- [x] Identifikasi file target
- [x] Buat/update `plan.md`
- [x] Buat/update `task.md`

### Foundation
- [ ] Bootstrap project Laravel di root `C:\laragon\www\Altafit`
- [ ] Integrasikan React + Inertia + Vite
- [ ] Setup Tailwind/CSS tokens sesuai Stitch design system
- [ ] Rapikan struktur folder frontend agar modular dan mudah dirawat
- [ ] Setup routing dasar untuk dashboard, chat, plans, profile

### UI Implementation
- [ ] Implement shared app shell (top app bar, bottom nav, page container)
- [ ] Implement halaman Dashboard mengikuti Stitch
- [ ] Implement halaman Chat mengikuti Stitch
- [ ] Implement halaman Plans mengikuti Stitch
- [ ] Implement halaman Profile mengikuti Stitch
- [ ] Pastikan layout mobile-first sangat nyaman di HP
- [ ] Pastikan layout web/desktop tetap proporsional dan tidak terasa sekadar stretched mobile UI

### Data & Backend
- [ ] Buat controller Inertia untuk tiap halaman utama
- [ ] Buat migration dasar untuk data user, meals, water logs, plans/milestones
- [ ] Buat model/struktur data seperlunya
- [ ] Siapkan mock/seeder data agar UI bisa direview cepat
- [ ] Siapkan placeholder endpoint/struktur untuk AI logging bila diperlukan

### Quality
- [ ] Jaga code tetap clean, modular, dan scalable sesuai kebutuhan
- [ ] Hindari abstraction / over-engineering yang belum perlu
- [ ] Konsistenkan penamaan file, komponen, props, dan utilitas
- [ ] Pisahkan design tokens, layout primitives, dan page-specific components dengan rapi

### Validation
- [ ] Manual happy path
- [ ] Manual basic error path
- [ ] Manual UI/behavior check
- [ ] Jalankan build/test verification yang relevan
- [ ] Cek regresi yang jelas terlihat

### Handoff
- [ ] Ringkas file yang berubah
- [ ] Biarkan perubahan tetap uncommitted untuk review user
- [ ] Catat follow-up bila ada

## Changed Files
- `plan.md`
- `task.md`

## User Check
- Yang perlu dicek user:
  - hasil visual vs referensi Stitch
  - kenyamanan di HP dan web/desktop
  - keputusan branding `Altafit` vs `Vitality`
  - apakah fase awal cukup dengan mock data atau ingin langsung CRUD nyata
- Hasil yang diharapkan:
  - fondasi aplikasi disetujui sebelum fitur lanjutan ditambah
- Edge case yang layak dicoba:
  - viewport kecil HP
  - viewport tablet
  - viewport desktop lebar
  - konsistensi active navigation antar page

## Notes
- Fokus saat ini:
  - fondasi project sudah hidup, clean, modular, dan dekat dengan Stitch
  - mobile-first tetapi tetap enak dipakai di web
- Blocker:
  - belum ada keputusan final soal branding di UI dan nama database MySQL
  - migration/model nyata belum dibuat
- Keputusan penting:
  - pendekatan awal pakai mock/sample data dulu agar review UI lebih cepat
  - prioritas: fidelity desain + struktur kode yang maintainable
- Follow-up:
  - buat migration + model nyata
  - tambahkan placeholder AI logging flow
  - refinement visual pixel-by-pixel terhadap referensi Stitch
