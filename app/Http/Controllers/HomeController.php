<?php

namespace App\Http\Controllers;

use App\Models\Berita;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        return Inertia::render('Home/Home', [
            'berita' => Berita::with('user')->latest()->get()
        ]);
    }

    public function garduInduk()
    {
        return Inertia::render('Home/GarduInduk');
    }

    public function gallery()
    {
        return Inertia::render('Home/Gallery');
    }

    public function ruangRapat()
    {
        return Inertia::render('Home/RuangRapat');
    }

    public function strukturOrganisasi()
    {
        return Inertia::render('Home/StrukturOrganisasi');
    }

    public function berita()
    {
        return Inertia::render('Home/Berita', [
            'berita' => Berita::with('user')->latest()->get()
        ]);
    }

    public function beritaDetail($slug)
    {
        $berita = Berita::where('slug', $slug)->with('user')->firstOrFail();

        return Inertia::render('Home/BeritaDetail', [
            'berita' => $berita
        ]);
    }

    public function ktt() {
        return Inertia::render('Home/Ktt');
    }

    public function anomali()
    {
        return Inertia::render('Home/Anomali/Anomali');
    }
}
