<?php

namespace App\Http\Controllers;

use App\Models\Berita;
use App\Models\Karyawan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class BeritaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Dashboard/Berita/Berita', [
            'berita' => Berita::with('user')->latest()->paginate(6)
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Dashboard/Berita/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {

        $validator = Validator::make($request->all(), [
            'judul' => 'required|string|max:255',
            'isi' => 'required|string',
            'excerpt' => 'required|string',
            'gambar' => 'required|array',
            'gambar.*' => 'required|image|max:5048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'type' => 'error',
                'message' => 'Gagal membuat berita: ' . $validator->errors()->first()
            ], 422);
        }

        $photos = [];
        if ($request->hasFile('gambar')) {
            $gambar = $request->file('gambar');

            foreach ($gambar as $file) {
                // Periksa jika file valid
                if ($file->isValid()) {
                    // Nama file gambar
                    $namaGambar = time() . '_' . uniqid() . $file->getClientOriginalName();
                    // Simpan gambar ke direktori public/berita
                    $file->storeAs('berita', $namaGambar, 'public');
                    // Tambahkan nama file ke dalam array photos
                    $photos[] = $namaGambar;
                }
            }
        }

        if (empty($photos)) {
            return response()->json([
                'type' => 'error',
                'message' => 'Tidak ada foto yang valid untuk diunggah'
            ], 422);
        }

        try {
            $berita = Berita::create([
                'judul' => $request->judul,
                'slug' => $request->slug,
                'excerpt' => $request->excerpt,
                'user_id' => Auth::id(),
                'isi' => $request->isi,
                'gambar' => json_encode($photos),  // Simpan array gambar dalam bentuk JSON
            ]);

            return response()->json([
                'type' => 'success',
                'message' => 'Berita Berhasil dibuat',
                'berita' => $berita
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'type' => 'error',
                'message' => 'Gagal membuat Berita: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($slug)
    {
        $berita = Berita::where('slug', $slug)->first();

        if ($berita) {
            $berita->increment('read_count');
        }

        return Inertia::render('Dashboard/Berita/Detail', [
            'berita' => $berita
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Berita $berita)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Berita $berita)
    {
        $request->validate([
            'judul' => 'required|string|max:255',
            'isi' => 'required|string',
            'gambar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'karyawan_id' => 'required|exists:karyawans,id',
        ]);

        $data = $request->all();
        $data['slug'] = Str::slug($request->judul);

        if ($request->hasFile('gambar')) {
            // Delete old image if exists
            if ($berita->gambar) {
                Storage::delete('public/berita/' . $berita->gambar);
            }

            $gambar = $request->file('gambar');
            $namaGambar = time() . '_' . str_replace(' ', '-', $gambar->getClientOriginalName());
            $gambar->storeAs('public/berita', $namaGambar);
            $data['gambar'] = $namaGambar;
        }

        $berita->update($data);

        return redirect()->route('berita.index')
            ->with('success', 'Berita berhasil diperbarui');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Berita $berita)
    {
        if ($berita->gambar) {
            Storage::delete('public/berita/' . $berita->gambar);
        }

        $berita->delete();

        return redirect()->route('berita.index')
            ->with('success', 'Berita berhasil dihapus');
    }


}
