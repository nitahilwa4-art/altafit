# Implementation Plan

## Judul
- Nama perubahan / fitur: Altafit — bootstrap aplikasi Laravel + React Inertia + MySQL dengan UI mengikuti Stitch
- Jenis: System-Refactor Plan
- Status: In Progress

## Ringkasan
- Tujuan perubahan: membangun aplikasi baru di `C:\laragon\www\Altafit` menggunakan Laravel 11 + React + Inertia + MySQL, dengan hasil visual dan struktur halaman semirip mungkin dengan referensi Stitch yang sudah disediakan.
- Kenapa ini perlu: saat ini repo target praktis masih kosong dan baru berisi aset/referensi desain pada folder `Stich`, jadi perlu perencanaan dulu sebelum bootstrap project dan translasi desain ke komponen aplikasi nyata.
- Hasil yang diharapkan: tersedia fondasi aplikasi full-stack yang bisa dikembangkan bertahap, dengan layout, warna, tipografi, spacing, dan flow utama mengikuti desain Stitch:
  - Dashboard (`compact_dashboard_with_detailed_charts`)
  - Chat / AI logging (`compact_chat`)
  - Plans (`compact_plans`)
  - Profile (`compact_profile`)
  - Design system utama dari `verdant_vitality/DESIGN.md`
- Definition of done:
  - Project Laravel + React Inertia berhasil dibuat di root `Altafit`
  - Koneksi MySQL disiapkan via `.env`
  - Design token Stitch diterjemahkan ke Tailwind/theme app
  - Minimal 4 halaman utama tersedia dan visually close dengan Stitch
  - Layout shared (top bar / bottom nav / app shell) konsisten
  - Struktur backend dasar, route, controller, dan seed/mock data siap untuk pengembangan lanjutan

## Proposed Changes
### Dependencies
- [NEW] Laravel 11 application scaffold
- [NEW] Inertia.js + React integration
- [NEW] Vite frontend pipeline
- [NEW] Tailwind CSS theme customization sesuai Stitch
- [OPTIONAL] chart library (mis. Recharts) bila diperlukan untuk chart dashboard
- [OPTIONAL] icon setup yang mendekati Material Symbols dari mockup

### Frontend / Backend / Database / Other
- [NEW] Shared app layout untuk mobile-first wellness app shell
- [NEW] React pages: Dashboard, Chat, Plans, Profile
- [NEW] Reusable UI components: top app bar, bottom nav, cards, chips, progress ring/bar, chat bubbles
- [NEW] Laravel routes + controllers untuk tiap page
- [NEW] MySQL schema awal untuk user profile, meal logs, water logs, plans/milestones
- [NEW] Seed/sample data agar tampilan langsung bisa direview
- [MODIFY] Tailwind config / CSS tokens agar mengikuti palette dan spacing Stitch
- [OPTIONAL] AI logging endpoint placeholder mengikuti dokumen integrasi yang ada di folder Stitch

## Files Affected
### New Files
- `composer.json` dan struktur default Laravel (jika project dibootstrap dari nol)
- `package.json`
- `routes/web.php`
- `app/Http/Controllers/*`
- `resources/js/Pages/*`
- `resources/js/Components/*`
- `resources/js/Layouts/*`
- `resources/css/app.css`
- `tailwind.config.js` / konfigurasi Tailwind setara
- `database/migrations/*`
- `database/seeders/*`
- `.env.example` / `.env` (disesuaikan lokal, tanpa menulis kredensial rahasia ke plan)

### Modified Files
- Belum ada file aplikasi yang dimodifikasi; repo target saat ini baru berisi folder referensi `Stich`

## Impact Area
- Frontend:
  - High impact — hampir seluruh UI akan dibangun dari nol berdasarkan HTML Stitch
  - Fokus fidelity: warna, layout, spacing, radius, visual hierarchy, navigation shell
- Backend:
  - Medium impact — perlu route/controller dasar dan penyajian data untuk tiap halaman
- Database:
  - Medium impact — perlu skema awal MySQL untuk data nutrisi, profil, hidrasi, dan plan
- UX:
  - High impact — target utama adalah “persis sama” semaksimal mungkin terhadap Stitch, tetapi tetap ditranslasikan ke komponen React/Inertia yang maintainable
- Testing:
  - Medium impact — perlu validasi visual, build, route rendering, dan integrasi dasar Inertia

## Risk Level
- Level: High
- Alasan:
  - Ini bukan sekadar styling; project baru akan dibangun dari nol
  - Ada translasi dari static HTML mockup ke aplikasi Laravel + React Inertia nyata
  - Permintaan “persis sama” butuh keputusan implementasi detail agar tetap maintainable
  - Database, routing, asset pipeline, dan design system semuanya disentuh sekaligus

## Referensi Stitch yang Sudah Dipelajari
- `Stich/stitch/verdant_vitality/DESIGN.md`
- `Stich/stitch/compact_dashboard_with_detailed_charts/code.html`
- `Stich/stitch/compact_chat/code.html`
- `Stich/stitch/compact_plans/code.html`
- `Stich/stitch/compact_profile/code.html`
- `Stich/technical_implementation_guide_laravel_react.html`
- `Stich/ai_integration_json_guide.html`

## Temuan Awal
- Folder target `C:\laragon\www\Altafit` saat ini hanya berisi folder `Stich`
- Stitch sudah memberi 4 screen utama + 1 design system document + 2 implementation guides
- Arah produknya terlihat seperti aplikasi health / nutrition tracker dengan brand “Vitality”; nama aplikasi bisa tetap Altafit, tetapi bahasa visual mengikuti desain Stitch
- Desain menggunakan mobile-first shell, warna utama hijau editorial, warm surface background, kartu tanpa border keras, glassmorphism ringan, dan bottom navigation tetap

## Out of Scope
- Integrasi AI production-ready ke Gemini/OpenAI pada fase awal
- Auth lengkap multi-role / permission kompleks
- Upload media production-grade (optimization, storage cloud, moderation)
- Sinkronisasi Apple Health / Google Fit sungguhan
- Real analytics, notifications engine, dan cron reminder penuh
- Deployment server / CI-CD

## Proposed Approach
- Pendekatan implementasi:
  1. Bootstrap project Laravel + React Inertia + Tailwind di root `Altafit`
  2. Buat fondasi theme dari token Stitch (warna, typography, spacing, radius, shadow, gradient)
  3. Bangun app shell bersama: top bar, bottom nav, container, glass panel, editorial card
  4. Implement 4 halaman utama berdasarkan masing-masing screen HTML Stitch
  5. Sambungkan ke route/controller Inertia dengan mock/sample data dulu
  6. Tambahkan migration + seeder untuk data inti agar UI bisa hidup
  7. Rapikan mismatch visual sampai mendekati referensi setepat mungkin
- Kenapa pendekatan ini dipilih:
  - Mengurangi risiko langsung lompat ke logic kompleks sebelum fondasi visual stabil
  - Membuat review UI lebih cepat
  - Menjaga hasil tetap dekat dengan Stitch sekaligus rapi untuk dikembangkan lanjut
- Alternatif yang dipertimbangkan (opsional):
  - Menyalin HTML mentah ke Blade: lebih cepat, tetapi tidak sesuai target stack React + Inertia dan akan susah dipelihara
  - Membangun backend penuh dulu: tidak ideal karena prioritas user saat ini adalah fidelity terhadap desain Stitch

## Impact Analysis Detail
### Files yang kemungkinan besar akan dimodifikasi
- `routes/web.php`
- `resources/js/app.jsx` atau entry setara
- `resources/css/app.css`
- `tailwind.config.js`
- `vite.config.js`
- `app/Http/Controllers/DashboardController.php`
- `app/Http/Controllers/ChatController.php`
- `app/Http/Controllers/PlansController.php`
- `app/Http/Controllers/ProfileController.php`

### Files yang mungkin terdampak tidak langsung
- `config/app.php`
- `config/database.php`
- `bootstrap/app.php` / middleware bootstrap tergantung struktur Laravel versi terpasang
- `database/seeders/DatabaseSeeder.php`
- asset/font/icon setup

### Routes / Controllers / Models / Pages yang terlibat
- Routes:
  - `/`
  - `/dashboard`
  - `/chat`
  - `/plans`
  - `/profile`
- Controllers:
  - DashboardController
  - ChatController
  - PlansController
  - ProfileController
- Models (kemungkinan):
  - User
  - Meal
  - WaterLog
  - Goal / Plan / Milestone
- Pages:
  - `Dashboard.jsx`
  - `Chat.jsx`
  - `Plans.jsx`
  - `Profile.jsx`

### Key verification areas dan regression points
- Inertia boot berhasil dan semua page render normal
- Theme Tailwind benar-benar mengikuti warna/spacing/radius Stitch
- Bottom navigation dan top app bar konsisten di semua halaman
- Komponen chart/progress tidak rusak saat data berubah
- Responsiveness mobile-first tetap aman
- Tampilan desktop/web tetap proporsional, tidak sekadar versi HP yang dilebarkan
- Build Vite sukses tanpa import error
- MySQL migration bisa jalan tanpa konflik

## Fase Implementasi yang Disarankan
### Fase 1 — Foundation
- Bootstrap Laravel + React Inertia
- Setup Tailwind/theme/token
- Setup route dasar dan layout shared

### Fase 2 — UI Fidelity
- Implement Dashboard
- Implement Chat
- Implement Plans
- Implement Profile
- Cocokkan spacing, warna, radius, iconography, dan hierarchy

### Fase 3 — Data Wiring
- Migration dan model dasar
- Controller + sample payload Inertia
- Seeder/mock data untuk review cepat

### Fase 4 — Refinement
- Fine-tuning visual
- Build/test pass
- Walkthrough perubahan

## Verification Plan
### Manual Verification
- Buka masing-masing halaman dan bandingkan dengan referensi Stitch screen-by-screen
- Cek top bar, bottom nav, warna, spacing, radius, dan hierarchy visual
- Cek transisi page dan active state navigation
- Cek komponen utama:
  - dashboard progress ring, macro cards, chart, hydration card
  - chat bubbles, input bar, suggestion chips
  - plans card, recommendations, milestones
  - profile header, settings list, CTA

### Build / Test Verification
- `composer install` / `php artisan key:generate` / setup env
- `php artisan migrate`
- `npm install`
- `npm run build`
- `php artisan test` untuk sanity check route/basic app bila tersedia

### User Check
- Yang perlu dicek user:
  - apakah hasil visual sudah cukup “persis sama” dengan Stitch
  - apakah nama app/branding tetap ingin “Altafit” atau mengikuti “Vitality” di UI
  - apakah fase awal cukup pakai mock data atau langsung ingin CRUD nyata
- Hasil yang diharapkan:
  - user setuju fondasi visual dan struktur app sebelum logic lebih dalam ditambahkan
- Edge case:
  - perbedaan kecil antara HTML statis Stitch dan perilaku komponen React nyata
  - ikon/font tertentu mungkin perlu pendekatan alternatif jika asset berbeda

## Catatan Keputusan yang Perlu Dipastikan Sebelum Implementasi Penuh
- Nama produk yang tampil di UI: `Altafit` atau `Vitality`
- Perlu auth bawaan Laravel sejak awal atau langsung fokus ke UI dulu
- Database name MySQL yang akan dipakai
- Mau mulai dari mock data dulu atau langsung data persisted penuh

## Rollback / Revert Note
- File utama untuk revert: seluruh scaffold project baru yang akan dibuat di root `Altafit`
- Catatan rollback:
  - Karena repo target masih praktis kosong, rollback paling mudah adalah membuang scaffold baru sebelum commit
  - Untuk saat ini belum ada perubahan destruktif dilakukan

## Approval Gate
- Saya membutuhkan persetujuan Anda sebelum mulai implementasi karena ini termasuk pekerjaan skala sedang-besar: bootstrap project baru, setup database, dan translasi desain Stitch ke stack Laravel + React Inertia.
