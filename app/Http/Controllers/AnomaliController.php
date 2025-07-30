<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use App\Models\Anomali;
use App\Models\Kategori;
use App\Models\GarduInduk;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\AnomaliExport;
use Barryvdh\DomPDF\Facade\Pdf;

use function PHPUnit\Framework\isEmpty;

class AnomaliController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $anomalis = Anomali::with(['gardu_induk', 'kategori', 'user'])->orderBy('created_at', 'desc')->get();
        return Inertia::render("Dashboard/Anomali/Anomali", [
            'anomalis' => $anomalis
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $user = Auth::user();
        if ($user && is_array($user->gardu_induk_ids) && count($user->gardu_induk_ids) > 0) {
            $gardus = GarduInduk::whereIn('id', $user->gardu_induk_ids)->get(['id', 'name', 'ultg']);
            $defaultGarduId = $user->gardu_induk_ids[0];
        } else {
            $gardus = GarduInduk::all(['id', 'name', 'ultg']);
            $defaultGarduId = null;
        }
        $kategoris = Kategori::all(['id', 'name']);
        $users = User::all(['id', 'name']);
        $userWilayah = $user ? $user->wilayah : null;
        return Inertia::render("Dashboard/Anomali/Create", [
            'gardus' => $gardus,
            'kategoris' => $kategoris,
            'users' => $users,
            'defaultGarduId' => $defaultGarduId,
            'userWilayah' => $userWilayah,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        if (empty(Auth::user()->tanda_tangan_path)) {
            return response()->json([
                'type' => 'error',
                'message' => 'Tanda tangan belum diunggah. Silakan unggah tanda tangan terlebih dahulu pada menu Pengaturan.'
            ], 400);
        }
        
        $validator = Validator::make($request->all(), [
            'judul' => 'required|string',
            'ultg' => 'required|string',
            'gardu_id' => 'required|integer',
            'bagian' => 'required|string',
            'tipe' => 'required|string',
            'kategori_id' => 'required|integer',
            'peralatan' => 'required|string',
            'merek' => 'nullable|string',
            'tipe_alat' => 'nullable|string',
            'no_seri' => 'nullable|string',
            'harga' => 'nullable|string',
            'kode_asset' => 'nullable|string',
            'tahun_operasi' => 'nullable|string',
            'tahun_buat' => 'nullable|string',
            'penempatan_alat' => 'required|string',
            'tanggal_kejadian' => 'required|date',
            'penyebab' => 'required|string',
            'akibat' => 'required|string',
            'usul_saran' => 'required|string',
            'lampiran_foto' => 'nullable|array',
            'lampiran_foto.*' => 'nullable|image|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'type' => 'error',
                'message' => 'Gagal membuat Anomali : ' . $validator->errors()->first()
            ], 422);
        }

        $data = $validator->validated();

        $photos = [];
        if ($request->hasFile('lampiran_foto')) {
            foreach ($request->file('lampiran_foto') as $photo) {
                $path = $photo->store('Lampiran Foto Anomali', 'public');
                $photos[] = $path;
            }
        }

        try {
            $anomali = Anomali::create([
                'judul' => $data['judul'],
                'ultg' => $data['ultg'],
                'gardu_id' => $data['gardu_id'],
                'bagian' => $data['bagian'],
                'tipe' => $data['tipe'],
                'kategori_id' => $data['kategori_id'],
                'peralatan' => $data['peralatan'],
                'merek' => $data['merek'] ?? null,
                'tipe_alat' => $data['tipe_alat'] ?? null,
                'no_seri' => $data['no_seri'] ?? null,
                'harga' => $data['harga'] ?? null,
                'kode_asset' => $data['kode_asset'] ?? null,
                'tahun_operasi' => $data['tahun_operasi'] ?? null,
                'tahun_buat' => $data['tahun_buat'] ?? null,
                'penempatan_alat' => $data['penempatan_alat'],
                'tanggal_kejadian' => $data['tanggal_kejadian'],
                'penyebab' => $data['penyebab'],
                'akibat' => $data['akibat'],
                'usul_saran' => $data['usul_saran'],
                'lampiran_foto' => json_encode($photos),
                'status' => 'New',
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'type' => 'success',
                'message' => 'Anomali berhasil ditambahkan',
                'anomali' => $anomali
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'type' => 'error',
                'message' => 'Gagal menambahkan Anomali : ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($judul)
    {
        $anomali = Anomali::with(['gardu_induk', 'kategori', 'user'])->where('judul', $judul)->firstOrFail();
        return Inertia::render('Dashboard/Anomali/Detail', [
            'anomalis' => $anomali
        ]);
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

    public function export(Request $request)
    {
        try {
            $months = $request->get('months', '');
            $ultgs = $request->get('ultgs', '');
            $gardus = $request->get('gardus', '');
            
            // Convert comma-separated strings to arrays
            $monthArray = $months ? explode(',', $months) : [];
            $ultgArray = $ultgs ? explode(',', $ultgs) : [];
            $garduArray = $gardus ? explode(',', $gardus) : [];
            
            // Generate filename
            $filename = 'anomali_export_' . date('Y-m-d_H-i-s') . '.xlsx';
            
            return Excel::download(
                new AnomaliExport($monthArray, $ultgArray, $garduArray),
                $filename
            );
        } catch (\Exception $e) {
            Log::error('Export error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Export failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function exportPdf($judul)
    {
        $anomali = Anomali::with(['gardu_induk', 'kategori', 'user'])->where('judul', $judul)->firstOrFail();
        $pdf = Pdf::loadView('exports.pdf', compact('anomali'));
        $filename = 'anomali_' . str_replace(' ', '_', $judul) . '.pdf';
        // return $pdf->download($filename);
        return view('exports.pdf', compact('anomali'));

    }

    public function review($id) {
        return Inertia::render("Dashboard/Anomali/Review");
    }
}
