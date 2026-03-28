# Implementation Plan

## Judul
- Nama perubahan / fitur: Altafit — autonomous polish + CRUD roadmap lanjutan
- Jenis: Feature Plan
- Status: In Progress

## Ringkasan
- Tujuan perubahan: melanjutkan Altafit secara bertahap dengan urutan implementasi paling bernilai tanpa menunggu arahan mikro dari user.
- Strategi kerja:
  1. Perkuat **meal logs** sebagai inti penggunaan harian
  2. Lanjutkan **plans** agar lebih lengkap dan fleksibel
  3. Buat **dashboard** lebih data-driven dari data nyata
- Kenapa urutan ini dipilih:
  - meal logs adalah loop penggunaan paling sering
  - plans sudah mulai hidup, jadi bagus untuk diperdalam setelah data makan lebih solid
  - dashboard paling kuat kalau sumber datanya sudah lebih baik

## Fase Lanjutan
### Fase 1 — Meal Logs
- tambah field dan UX meal log agar lebih realistis dipakai harian
- rapikan create/update/delete flow
- pertimbangkan waktu log, kategori, dan notes bila cocok tanpa overkill

### Fase 2 — Plans Advanced
- add/delete milestone
- dukung lebih dari satu plan
- pilih/set active plan

### Fase 3 — Dashboard Data-Driven
- weekly progress dihitung dari data nyata
- hydration/progress summary lebih representatif
- kurangi angka placeholder statis

## Prinsip Eksekusi
- build harus tetap lolos setiap langkah
- test dasar tetap hijau
- perubahan tetap uncommitted
- utamakan nilai nyata dibanding fitur terlalu banyak tapi setengah matang
