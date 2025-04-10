<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
class HomeController extends Controller
{
    public function index()
    {
        return Inertia::render('Home/Home');
    }

    public function gallery()
    {
        return Inertia::render('Home/Gallery');
    }

    public function strukturOrganisasi()
    {
        return Inertia::render('Home/StrukturOrganisasi');
    }
}
