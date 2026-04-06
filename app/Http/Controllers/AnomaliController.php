<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use App\Models\Anomali;
use App\Models\Kategori;
use App\Models\GarduInduk;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\AnomaliExport;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Http\Controllers\AnomaliTimelineController;

use function PHPUnit\Framework\isEmpty;

class AnomaliController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $anomalis = Anomali::with(['gardu_induk', 'kategori', 'user'])->orderBy('created_at', 'desc')->get();
        $kategoris = Kategori::all();
        return Inertia::render("Dashboard/Anomali/Anomali", [
            'anomalis' => $anomalis,
            'kategoris' => $kategoris
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
                'tanda_tangan_pemilik' => Auth::user()->tanda_tangan_path,
            ]);

            // Add timeline entry for anomali creation
            $timelineController = new AnomaliTimelineController();
            $timelineController->addCreationEntry($anomali->id, 'Anomali baru telah dibuat');

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
    public function show(Anomali $anomali)
    {
        $anomali->load(['gardu_induk', 'kategori', 'user', 'assignedUser', 'approvedBy', 'timelines.user']);
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

    public function exportPdf(Request $request, Anomali $anomali)
    {
        try {
            $anomali->load(['gardu_induk', 'kategori', 'user', 'approvedBy']);

            $pdf = Pdf::loadView('exports.pdf', ['anomali' => $anomali])
                ->setPaper('a4', 'portrait');

            $filename = 'anomali_' . preg_replace('/\s+/', '_', $anomali->judul) . '.pdf';

            $etag = '"' . sha1($anomali->id . '|' . optional($anomali->updated_at)->timestamp) . '"';
            $headers = [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
                'Cache-Control' => 'private, max-age=3600',
                'ETag' => $etag,
                'X-Content-Type-Options' => 'nosniff',
            ];

            if ($request->headers->get('If-None-Match') === $etag) {
                return response('', 304, $headers);
            }

            return response($pdf->output(), 200, $headers);
        } catch (\Exception $e) {
            Log::error('Export PDF error: ' . $e->getMessage(), [
                'id' => $anomali->id,
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'error' => 'Export PDF failed: ' . $e->getMessage()
            ], 500);
        }
        

    }

    public function review(Anomali $anomali) {
        $anomali->load(['gardu_induk', 'kategori', 'user', 'assignedUser', 'approvedBy']);
        
        // Ambil daftar pengguna untuk dropdown assign
        $users = User::all(['id', 'name']);
        
        return Inertia::render("Dashboard/Anomali/Review", [
            'anomalis' => $anomali,
            'users' => $users
        ]);
    }


    
    /**
     * Approve or reject an anomaly
     */
    public function approve(Request $request, Anomali $anomali) {

        if (empty(Auth::user()->tanda_tangan_path)) {   
            return response()->json([
                'type' => 'error',
                'message' => 'Tanda tangan belum diunggah. Silakan unggah tanda tangan terlebih dahulu pada menu Pengaturan.'
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'approve' => 'required|in:Yes,No,1,0',
            'reject_reason' => 'required_if:approve,No|required_if:approve,0|nullable|string',
            'bidang' => 'required_if:approve,Yes|required_if:approve,1|nullable|in:Master,MULTG,Renev,Hargi,Harjar,Harpro,K3,GI',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        try {
            
            // Update status anomali
            $anomali->approve = $request->approve;
            $anomali->approve_by = Auth::user()->id;
            $anomali->tanda_tangan_approve = Auth::user()->tanda_tangan_path;
            $anomali->tanggal_approve = now();
            
            if ($request->approve == 'Yes' || $request->approve == 1) {
                $anomali->status = 'Open';
                $anomali->bidang_assigned = $request->bidang;
            } else {
                $anomali->status = 'Rejected';
                $anomali->reject_reason = $request->reject_reason;
            }
            
            $anomali->save();
            
            // Add timeline entry for approval/rejection
            $timelineController = new AnomaliTimelineController();
            if ($request->approve == 'Yes' || $request->approve == 1) {
                $timelineController->addApprovalEntry($anomali->id, true, 'Anomali disetujui dan ditugaskan ke bidang ' . $request->bidang);
                if ($request->bidang) {
                    $timelineController->addAssignmentEntry($anomali->id, null, 'Anomali ditugaskan kepada bidang ' . $request->bidang);
                }
            } else {
                $timelineController->addApprovalEntry($anomali->id, false, $request->reject_reason);
            }
            
            $message = ($request->approve == 'Yes' || $request->approve == 1) ? 'Anomali berhasil disetujui' : 'Anomali berhasil ditolak';
            
            return response()->json([
                'success' => true,
                'message' => $message,
                'redirect' => route('dashboard.anomali.index')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memproses persetujuan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show the form for editing schedule of the specified resource.
     */
    public function schedule(Anomali $anomali)
    {
        $anomali->load(['gardu_induk', 'kategori', 'user', 'assignedUser', 'approvedBy', 'timelines']);
        return Inertia::render('Dashboard/Anomali/Schedule', [
            'anomalis' => $anomali
        ]);
    }

    /**
     * Update the schedule of the specified resource.
     */
    public function updateSchedule(Request $request, Anomali $anomali)
    {
        $validator = Validator::make($request->all(), [
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'required|date|after_or_equal:tanggal_mulai',
            'job_type' => 'nullable|string|max:100',
        ], [
            'tanggal_mulai.required' => 'Tanggal mulai harus diisi',
            'tanggal_mulai.date' => 'Format tanggal mulai tidak valid',
            'tanggal_selesai.required' => 'Tanggal selesai harus diisi',
            'tanggal_selesai.date' => 'Format tanggal selesai tidak valid',
            'tanggal_selesai.after_or_equal' => 'Tanggal selesai harus sama atau setelah tanggal mulai',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $anomali->update([
                'tanggal_mulai' => $request->tanggal_mulai,
                'tanggal_selesai' => $request->tanggal_selesai,
                'job_type' => $request->job_type,
            ]);

            // Membuat timeline entry untuk penjadwalan
            $anomali->timelines()->create([
                'event_type' => 'scheduled',
                'description' => 'Anomali telah dijadwalkan untuk dikerjakan',
                'old_value' => $anomali->tanggal_mulai ? $anomali->tanggal_mulai . ' - ' . $anomali->tanggal_selesai : null,
                'new_value' => $request->tanggal_mulai . ' - ' . $request->tanggal_selesai,
                'comment' => 'Penjadwalan pekerjaan anomali dari tanggal ' . date('d F Y', strtotime($request->tanggal_mulai)) . ' sampai ' . date('d F Y', strtotime($request->tanggal_selesai)),
                'user_id' => Auth::user()->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Schedule anomali berhasil diperbarui',
                'redirect' => route('dashboard.anomali.show', $anomali->slug)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui schedule: ' . $e->getMessage()
            ], 500);
        }
    }

    public function closeForm(Anomali $anomali)
    {
        $anomali->load(['gardu_induk', 'kategori', 'user', 'assignedUser', 'approvedBy']);
        return Inertia::render('Dashboard/Anomali/Close', [
            'anomalis' => $anomali
        ]);
    }

    public function closeStore(Request $request, Anomali $anomali)
    {
        if ($anomali->status === 'Close') {
            return response()->json([
                'success' => false,
                'message' => 'Anomali sudah ditutup.'
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'tanggal_pekerjaan' => 'required|date|before_or_equal:today',
            'lampiran_pdf' => 'required|file|mimes:pdf|max:5120',
        ], [
            'tanggal_pekerjaan.required' => 'Tanggal pekerjaan harus diisi',
            'tanggal_pekerjaan.date' => 'Format tanggal pekerjaan tidak valid',
            'tanggal_pekerjaan.before_or_equal' => 'Tanggal pekerjaan tidak boleh melebihi hari ini',
            'lampiran_pdf.required' => 'File PDF wajib diunggah',
            'lampiran_pdf.file' => 'Lampiran harus berupa file',
            'lampiran_pdf.mimes' => 'Lampiran harus berformat PDF',
            'lampiran_pdf.max' => 'Ukuran file PDF maksimal 5MB',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $tanggalPekerjaan = $request->input('tanggal_pekerjaan');
            $pdfFile = $request->file('lampiran_pdf');

            $result = DB::transaction(function () use ($anomali, $tanggalPekerjaan, $pdfFile) {
                $pdfPath = $pdfFile->store('Lampiran Penutupan Anomali', 'public');

                DB::table('anomali_closures')->insert([
                    'anomali_id' => $anomali->id,
                    'tanggal_pekerjaan' => $tanggalPekerjaan,
                    'lampiran_pdf_path' => $pdfPath,
                    'created_by' => Auth::id(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $oldStatus = $anomali->status;
                $anomali->status = 'Close';
                $anomali->tanggal_selesai = $tanggalPekerjaan;
                $anomali->save();

                $timelineController = new AnomaliTimelineController();
                $timelineController->addStatusChangeEntry(
                    $anomali->id,
                    $oldStatus,
                    'Close',
                    'Anomali ditutup pada tanggal ' . date('d F Y', strtotime($tanggalPekerjaan)),
                );
                $timelineController->addCompletionEntry(
                    $anomali->id,
                    'Penanganan anomali selesai pada tanggal ' . date('d F Y', strtotime($tanggalPekerjaan)),
                );

                return [
                    'pdf_path' => $pdfPath,
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Anomali berhasil ditutup',
                'redirect' => route('dashboard.anomali.index'),
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menutup anomali: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the schedule of the specified resource.
     */
    public function deleteSchedule(Anomali $anomali)
    {
        try {
            $oldValue = $anomali->tanggal_mulai && $anomali->tanggal_selesai
                ? $anomali->tanggal_mulai . ' - ' . $anomali->tanggal_selesai
                : null;

            $anomali->update([
                'tanggal_mulai' => null,
                'tanggal_selesai' => null,
            ]);

            if ($oldValue) {
                $anomali->timelines()->create([
                    'event_type' => 'schedule_deleted',
                    'description' => 'Jadwal pekerjaan anomali dihapus',
                    'old_value' => $oldValue,
                    'new_value' => null,
                    'comment' => 'Jadwal pekerjaan anomali dihapus oleh ' . Auth::user()->name,
                    'user_id' => Auth::user()->id,
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Jadwal pekerjaan berhasil dihapus',
                'redirect' => route('dashboard.anomali.schedule', $anomali->slug),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus jadwal: ' . $e->getMessage(),
            ], 500);
        }
    }
}
