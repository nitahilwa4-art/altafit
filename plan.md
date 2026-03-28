# Implementation Plan

## Judul
- Nama perubahan / fitur: Altafit — complete improvement plan (batch 1)
- Jenis: Feature Plan
- Status: In Progress

## Ringkasan
- Tujuan perubahan: meningkatkan Altafit dari sisi UI/UX, logic, fitur, dan kesiapan produk berdasarkan plan besar yang diberikan user.
- Strategi batch saat ini:
  1. Kerjakan **Phase 1 (UI/UX polish & animations)**
  2. Kerjakan **logic fixes inti Phase 2** yang paling aman dan berdampak
  3. Tunda auth/scalability besar sampai fondasi UX + logic benar-benar matang
- Kenapa urutan ini dipilih:
  - impact visual + akurasi logic paling cepat terasa
  - risiko lebih rendah dibanding lompat langsung ke auth atau refactor besar
  - cocok dengan status app sekarang yang sudah cukup kaya fitur tapi masih perlu polish dan data accuracy

## Scope Batch Ini
### In scope
- calorie ring progress akurat dari data
- animated/reusable progress UI primitives
- macro progress bars
- flash banner auto-dismiss + animasi
- page transition wrapper
- animated number untuk KPI utama
- dynamic chart Y-axis labels
- hydration feedback visual yang lebih baik
- NutritionEstimator upgrade besar (termasuk preset makanan Indonesia, porsi, compound foods, confidence lebih baik)
- confidence badge di chat
- perbaikan note analysis berbasis context yang lebih kuat

### Out of scope for this batch
- auth penuh
- middleware auth di semua route
- API layer terpisah
- refactor CSS monolith besar-besaran ke architecture baru penuh
- dark mode penuh jika batch ini terlalu besar
- export data
- weight history table

## Impact Analysis
### Files likely modified
- `resources/css/app.css`
- `resources/js/Layouts/AppShell.jsx`
- `resources/js/Pages/Dashboard.jsx`
- `resources/js/Pages/Chat.jsx`
- `resources/js/Pages/Plans.jsx`
- `resources/js/Components/layout/TopBar.jsx`
- `resources/js/Components/layout/BottomNav.jsx`
- `app/Http/Controllers/DashboardController.php`
- `app/Http/Controllers/ChatController.php`
- `app/Support/NutritionEstimator.php`
- `plan.md`
- `task.md`

### Files likely added
- `resources/js/Components/ui/PageTransition.jsx`
- `resources/js/Components/ui/AnimatedNumber.jsx`
- `resources/js/Components/ui/ProgressRing.jsx`
- `resources/js/Components/ui/ProgressBar.jsx`
- `resources/js/Components/ui/FlashBanner.jsx`

### Indirectly affected
- shared shell behavior
- page load animation feel
- chat UX and nutrition estimation confidence
- dashboard KPI rendering

## Proposed Approach
1. Add reusable UI primitives for transitions, flash, ring, progress, animated numbers
2. Refactor Dashboard to use real ring progress + dynamic chart labels + progress bars
3. Upgrade Chat with confidence badge + better estimator inputs/results
4. Improve shared polish in CSS without full architecture rewrite yet
5. Validate with tests and build after each meaningful batch

## Definition of Done
- dashboard ring no longer hardcoded
- chart Y labels derived from data
- macros have visible progress bars
- flash messages animate and auto-dismiss
- chat confidence score is visible and meaningful
- NutritionEstimator noticeably better with more foods and portion handling
- build/test remain green
- changes remain uncommitted for user review

## Verification Plan
### Automated
- `php artisan test`
- `npm run build`

### Manual
- verify dashboard ring follows real calories
- verify chart labels adapt to data
- verify flash banners animate out
- verify animated numbers/render do not break layout
- test meal phrases with Indonesian foods and compound meals
- verify confidence badge changes based on input quality

## User Check
- apakah polish visual batch ini terasa lebih hidup
- apakah estimator makanan sekarang lebih masuk akal
- apakah confidence badge dan dashboard progress terasa berguna
