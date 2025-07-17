<?php

namespace App\Http\Controllers;

use App\Models\Anomali;
use App\Models\GarduInduk;
use App\Models\Kategori;
use App\Models\Bay;
use App\Models\User;
use App\Models\Peralatan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnomaliController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render("Dashboard/Anomali/Anomali");
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $gardus = GarduInduk::all(['id', 'name']);
        // $kategoris = Kategori::all(['id', 'name']);
        // $bays = Bay::all(['id', 'name']);
        $users = User::all(['id', 'name']);
        // $peralatans = Peralatan::all(['id', 'name']);
        return Inertia::render("Dashboard/Anomali/Create", 
        compact(
            'gardus', 
            // 'kategoris', 
            // 'bays', 
            'users', 
            // 'peralatans'
            )
    );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Anomali $anomali)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Anomali $anomali)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Anomali $anomali)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Anomali $anomali)
    {
        //
    }
}
