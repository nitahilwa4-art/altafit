# Altafit

Altafit is a Laravel + React + Inertia wellness tracking app inspired by the Stitch design references bundled in the repository.

## Current Stack
- Laravel 13
- React + Inertia.js
- Vite
- MySQL (Laragon)
- Tailwind CSS v4 (theme tokens via app CSS)

## Current Features
- Editorial mobile-first dashboard
- AI-style meal logging from text input
- Keyword-based nutrition estimator placeholder
- Plans page with milestones and recommended meals
- Profile and goals update form
- Hydration quick actions and hydration history
- Recent meal log review + delete action

## Local Environment
This project is currently configured for Laragon MySQL using:

- DB host: `127.0.0.1`
- DB port: `3306`
- DB name: `altafit`
- DB user: `root`
- DB password: empty by default

## Quick Start
```bash
composer install
npm install
php artisan key:generate
php artisan migrate:fresh --seed
npm run build
php artisan serve
```

For local development with Vite:
```bash
npm run dev
```

## Project Notes
- Main visual reference lives under `Stich/`
- Planning docs live in `plan.md` and `task.md`
- Current AI nutrition logic is placeholder logic in `app/Support/NutritionEstimator.php`
- The app is intentionally structured in a modular way for future expansion

## Suggested Next Steps
- Replace keyword estimator with Gemini/OpenAI integration
- Add edit flow for meals
- Add richer charts and trend calculations
- Add auth and user-specific sessions
- Add media upload for meal photos
