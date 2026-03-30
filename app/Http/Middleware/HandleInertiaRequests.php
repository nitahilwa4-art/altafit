<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'app' => [
                'name' => config('app.name', 'Altafit'),
                'brand' => 'Altafit',
                'tagline' => 'Editorial wellness tracker',
            ],
            'auth' => [
                'user' => $request->user(),
            ],
            'errors' => fn () => $request->session()->get('errors')?->all() ?? [],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
            ],
        ];
    }
}
