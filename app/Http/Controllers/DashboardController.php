<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        return Inertia::render('Dashboard/Dashboard', [
            'foto_profil' => $user->foto_profil ? Storage::url($user->foto_profil) : null,
            'apiUrl' => url('/api/anomali')
        ]);
    }
}
