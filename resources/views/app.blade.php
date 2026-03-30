<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <meta name="theme-color" content="#006a34">
        <meta name="description" content="Altafit — Nutrition & Habit Tracker">
        <link rel="manifest" href="/manifest.json">
        <link rel="icon" type="image/x-icon" href="/favicon.ico">
        <title inertia>{{ config('app.name', 'Altafit') }}</title>
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
        @stack('scripts')
    </body>
</html>
