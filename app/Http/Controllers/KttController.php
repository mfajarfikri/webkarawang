<?php

namespace App\Http\Controllers;

use App\Models\Ktt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class KttController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $ktts = Ktt::latest()->get();

        // Return Inertia view for web requests
        if (request()->wantsJson()) {
            return response()->json($ktts);
        }

        return Inertia::render('Dashboard/Ktt/Ktt', [
            'ktts' => $ktts
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'lokasi' => 'required|string',
            'tipe' => 'required|string',
            'kapasitas' => 'required|numeric|min:1',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'type' => 'error',
                'message' => 'Gagal membuat KTT: ' . $validator->errors()->first()
            ], 422);
        }

        try {
            $ktt = Ktt::Create([
                'name' => $request->name,
                'lokasi' => $request->lokasi,
                'tipe' => $request->tipe,
                'kapasitas' => $request->kapasitas,
                'latitude' => $request->latitude,
                'longitude' => $request->longitude
            ]);

            return response()->json([
                'type' => 'success',
                'message' => 'Berhasil membuat KTT'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'type' => 'error',
                'message' => 'Gagal membuat KTT: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(ktt $ktt)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ktt $ktt)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ktt $ktt)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ktt $ktt)
    {
        //
    }
}
