<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AutoPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, $permission): Response
    {
        if(!Auth::check() || !Auth::user()->can($permission)){
            abort(403, 'Akses Ditolak mohon hubungi IT Administrator untuk mendapatkan akses : '. $permission);
        }

        return $next($request);
    }
}
