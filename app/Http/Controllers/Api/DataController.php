<?php

namespace App\Http\Controllers\Api;

use App\Models\Berita;
use App\Models\Anomali;
use App\Models\GarduInduk;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;

class DataController extends Controller
{
    public function ShowBerita(Request $request){
        try {
            $berita = Berita::with('user')->where('enabled', true)->get();
            return response()->json([
                'success' => true,
                'message' => "Found {$berita->count()} berita",
                'berita' => $berita
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting berita: ' . $e->getMessage(), [
                'exception' => $e,
                'executed_at' => now()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while getting berita',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateBeritaHomepage(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'enabled' => ['required', 'boolean'],
            ]);

            $berita = Berita::findOrFail($id);
            $berita->enabled = $validated['enabled'];
            $berita->save();

            return response()->json([
                'success' => true,
                'message' => 'Berita homepage visibility updated',
                'berita' => $berita->only(['id', 'enabled'])
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating berita homepage: ' . $e->getMessage(), [
                'exception' => $e,
                'executed_at' => now()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while updating berita homepage',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function ShowAnomali(Request $request) {
        $anomalis = Anomali::with(['gardu_induk', 'kategori', 'user'])
            ->where('status', '!=', 'Rejected')
            ->get();
        return response()->json([
            'anomalis' => $anomalis
        ]);
    }

    /**
     * Update overdue anomalies to pending status
     * This endpoint can be called manually or via scheduled tasks
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateOverdueAnomalies(Request $request){
        try {
            // Get overdue anomalies before updating
            $overdueAnomalies = Anomali::getOverdueAnomalies();
            $overdueCount = $overdueAnomalies->count();
            
            if ($overdueCount === 0) {
                return response()->json([
                    'success' => true,
                    'message' => 'No overdue anomalies found',
                    'data' => [
                        'overdue_count' => 0,
                        'updated_count' => 0,
                        'overdue_anomalies' => []
                    ]
                ]);
            }

            // Update overdue anomalies
            $updatedCount = Anomali::updateOverdueAnomaliesToPending();
            
            // Prepare response data
            $overdueData = $overdueAnomalies->map(function ($anomali) {
                return [
                    'id' => $anomali->id,
                    'judul' => $anomali->judul,
                    'status' => $anomali->status,
                    'tanggal_selesai' => $anomali->tanggal_selesai,
                    'ultg' => $anomali->ultg,
                    'kategori' => $anomali->kategori->nama ?? null,
                    'gardu_induk' => $anomali->gardu_induk->nama ?? null,
                ];
            });

            // Log the action
            Log::info("API: Updated {$updatedCount} overdue anomalies to Pending status", [
                'endpoint' => 'updateOverdueAnomalies',
                'updated_count' => $updatedCount,
                'overdue_count' => $overdueCount,
                'executed_at' => now(),
                'user_agent' => $request->userAgent(),
                'ip' => $request->ip()
            ]);

            return response()->json([
                'success' => true,
                'message' => "Successfully updated {$updatedCount} overdue anomalies to Pending status",
                'data' => [
                    'overdue_count' => $overdueCount,
                    'updated_count' => $updatedCount,
                    'overdue_anomalies' => $overdueData
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating overdue anomalies: ' . $e->getMessage(), [
                'exception' => $e,
                'executed_at' => now()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while updating overdue anomalies',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get list of overdue anomalies without updating them
     * This endpoint is useful for checking which anomalies are overdue
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getOverdueAnomalies(Request $request){
        try {
            $overdueAnomalies = Anomali::getOverdueAnomalies();
            
            $overdueData = $overdueAnomalies->map(function ($anomali) {
                return [
                    'id' => $anomali->id,
                    'judul' => $anomali->judul,
                    'status' => $anomali->status,
                    'tanggal_selesai' => $anomali->tanggal_selesai,
                    'tanggal_kejadian' => $anomali->tanggal_kejadian,
                    'ultg' => $anomali->ultg,
                    'kategori' => $anomali->kategori->nama ?? null,
                    'gardu_induk' => $anomali->gardu_induk->nama ?? null,
                    'user' => $anomali->user->name ?? null,
                    'assigned_user' => $anomali->assignedUser->name ?? null,
                    'days_overdue' => now()->diffInDays($anomali->tanggal_selesai)
                ];
            });

            return response()->json([
                'success' => true,
                'message' => "Found {$overdueAnomalies->count()} overdue anomalies",
                'data' => [
                    'count' => $overdueAnomalies->count(),
                    'overdue_anomalies' => $overdueData
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting overdue anomalies: ' . $e->getMessage(), [
                'exception' => $e,
                'executed_at' => now()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while getting overdue anomalies',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function themes()
    {
        $themes = \App\Models\Tema::all();
        return response()->json([
            'themes' => $themes
        ]);
    }

    public function berita(Request $request)
    {
        $perPage = $request->query('per_page', 9); // Default 9 items per page
        $berita = Berita::with(['user', 'tema'])->latest()->paginate($perPage);

        return response()->json([
            'berita' => $berita->items(),
            'pagination' => [
                'total' => $berita->total(),
                'per_page' => $berita->perPage(),
                'current_page' => $berita->currentPage(),
                'last_page' => $berita->lastPage(),
                'from' => $berita->firstItem(),
                'to' => $berita->lastItem()
            ]
        ]);
    }

    public function Showgardu()
    {
        $gardu = GarduInduk::all();

        return response()->json([
            'gardu' => $gardu
        ]);
    }

    /**
     * Increment the read count for a berita by slug.
     */
    public function incrementReadCount($slug)
    {
        $berita = Berita::where('slug', $slug)->first();

        if (!$berita) {
            return response()->json(['message' => 'Berita not found'], 404);
        }

        $berita->increment('read_count');

        return response()->json(['message' => 'Read count incremented successfully']);
    }

    
}
