<?php

namespace App\Http\Controllers;

use Exception;
use Inertia\Inertia;
use App\Models\Berita;
use App\Models\Tema;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Http;

class BeritaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Dashboard/Berita/Berita', [
            'berita' => Berita::with(['user', 'tema'])->latest()->paginate(6)
        ]);
    
    }

    public function fetchUrl(Request $request)
    {
        $url = $request->query('url');
        
        if (!$url) {
            return response()->json([
                'success' => 0,
                'error' => 'URL is required'
            ]);
        }

        try {
            // Validate URL format
            if (!filter_var($url, FILTER_VALIDATE_URL)) {
                throw new Exception('Invalid URL format');
            }

            // Use a real User-Agent to avoid being blocked by some sites
            $response = Http::withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            ])->timeout(10)->get($url);
            
            if (!$response->successful()) {
                throw new Exception('Gagal mengambil data dari URL (Status: ' . $response->status() . ')');
            }

            $html = $response->body();
            
            // Improved parsing for OpenGraph and Meta tags
            $title = '';
            $description = '';
            $imageUrl = '';

            // Title
            if (preg_match('/<meta[^>]+property=["\']og:title["\'][^>]+content=["\'](.*?)["\']/i', $html, $matches)) {
                $title = $matches[1];
            } elseif (preg_match('/<title>(.*?)<\/title>/i', $html, $matches)) {
                $title = $matches[1];
            }

            // Description
            if (preg_match('/<meta[^>]+property=["\']og:description["\'][^>]+content=["\'](.*?)["\']/i', $html, $matches)) {
                $description = $matches[1];
            } elseif (preg_match('/<meta[^>]+name=["\']description["\'][^>]+content=["\'](.*?)["\']/i', $html, $matches)) {
                $description = $matches[1];
            }

            // Image
            if (preg_match('/<meta[^>]+property=["\']og:image["\'][^>]+content=["\'](.*?)["\']/i', $html, $matches)) {
                $imageUrl = $matches[1];
            }

            $meta = [
                  'title' => html_entity_decode($title ?: $url),
                  'description' => html_entity_decode($description),
                  'image' => [
                      'url' => $imageUrl
                  ],
                  'url' => $url
              ];

              return response()->json([
                  'success' => 1,
                  'link' => $url,
                  'meta' => $meta
              ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => 0,
                'error' => $e->getMessage()
            ]);
        }
    }


    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Dashboard/Berita/Create', [
            'temas' => Tema::select('id', 'nama')->get()
        ]);
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
            'tema' => 'nullable|string|max:255',
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
            $temaId = null;
            if ($request->tema) {
                $tema = Tema::firstOrCreate(
                    ['nama' => $request->tema],
                    ['slug' => Str::slug($request->tema)]
                );
                $temaId = $tema->id;
            }

            $berita = Berita::create([
                'judul' => $request->judul,
                'slug' => $request->slug,
                'excerpt' => $request->excerpt,
                'user_id' => Auth::id(),
                'isi' => $request->isi,
                'content_json' => $request->content_json ? json_decode($request->content_json) : null,
                'tema_id' => $temaId,
                'gambar' => $photos,  // Eloquent handles serialization because of 'array' cast
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
        $berita->load('tema');
        return Inertia::render('Dashboard/Berita/Edit', [
            'berita' => $berita,
            'temas' => Tema::select('id', 'nama')->get()
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Berita $berita)
    {
        $validator = Validator::make($request->all(), [
            'judul' => 'required|string|max:255',
            'isi' => 'required|string',
            'content_json' => 'nullable|string',
            'excerpt' => 'required|string',
            'gambar' => 'nullable|array',
            'gambar.*' => 'image|max:5048',
            'existing_images' => 'nullable|array',
            'tema' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'type' => 'error',
                'message' => 'Gagal memperbarui berita: ' . $validator->errors()->first()
            ], 422);
        }

        try {
            // Handle Tema
            $temaId = null;
            if ($request->tema) {
                $tema = Tema::firstOrCreate(
                    ['nama' => $request->tema],
                    ['slug' => Str::slug($request->tema)]
                );
                $temaId = $tema->id;
            }

            // Handle Images
            $finalPhotos = $request->existing_images ?? [];
            
            // Delete removed images
            $oldPhotos = $berita->gambar ?? [];
            $keptPhotos = $request->existing_images ?? [];
            if (is_array($oldPhotos)) {
                $removedPhotos = array_diff($oldPhotos, $keptPhotos);
                foreach ($removedPhotos as $photo) {
                    Storage::disk('public')->delete('berita/' . $photo);
                }
            }

            // Add new images
            if ($request->hasFile('gambar')) {
                foreach ($request->file('gambar') as $file) {
                    if ($file->isValid()) {
                        $namaGambar = time() . '_' . uniqid() . $file->getClientOriginalName();
                        $file->storeAs('berita', $namaGambar, 'public');
                        $finalPhotos[] = $namaGambar;
                    }
                }
            }

            if (empty($finalPhotos)) {
                return response()->json([
                    'type' => 'error',
                    'message' => 'Minimal satu foto harus tersedia'
                ], 422);
            }

            $berita->update([
                'judul' => $request->judul,
                'slug' => $request->slug,
                'excerpt' => $request->excerpt,
                'isi' => $request->isi,
                'content_json' => $request->content_json ? json_decode($request->content_json) : null,
                'tema_id' => $temaId,
                'gambar' => $finalPhotos,
            ]);

            return response()->json([
                'type' => 'success',
                'message' => 'Berita Berhasil diperbarui',
                'berita' => $berita
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'type' => 'error',
                'message' => 'Gagal memperbarui Berita: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Berita $berita)
    {
        try {
            // Hapus semua gambar terkait
            if ($berita->gambar) {
                try {
                    // Cek apakah gambar sudah dalam bentuk array (karena model memiliki cast array)
                    if (is_array($berita->gambar) && !empty($berita->gambar)) {
                        foreach ($berita->gambar as $gambar) {
                            if (!empty($gambar) && is_string($gambar)) {
                                Storage::delete('public/berita/' . $gambar);
                            }
                        }
                    } else if (is_string($berita->gambar) && !empty($berita->gambar)) {
                        // Jika masih dalam bentuk string JSON, decode terlebih dahulu
                        $gambarArray = json_decode($berita->gambar, true);
                        if (is_array($gambarArray) && !empty($gambarArray)) {
                            foreach ($gambarArray as $gambar) {
                                if (!empty($gambar) && is_string($gambar)) {
                                    Storage::delete('public/berita/' . $gambar);
                                }
                            }
                        } else if (is_string($berita->gambar)) {
                            // Jika bukan array, mungkin hanya satu gambar dalam bentuk string
                            Storage::delete('public/berita/' . $berita->gambar);
                        }
                    }
                } catch (Exception $ex) {
                    // Lanjutkan proses meskipun ada error saat menghapus gambar
                }
            }

            $berita->delete();

            return response()->json([
                'type' => 'success',
                'message' => 'Berita berhasil dihapus'
            ], 200);
        } catch (Exception $e) {            
            return response()->json([
                'type' => 'error',
                'message' => 'Gagal menghapus berita: ' . $e->getMessage()
            ], 500);
        }
    }


}
