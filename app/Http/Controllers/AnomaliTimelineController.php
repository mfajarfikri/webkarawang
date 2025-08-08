<?php

namespace App\Http\Controllers;

use App\Models\Anomali;
use App\Models\AnomaliTimeline;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class AnomaliTimelineController extends Controller
{
    /**
     * Get timeline entries for a specific anomali
     */
    public function index(Request $request, $anomaliId): JsonResponse
    {
        $anomali = Anomali::findOrFail($anomaliId);
        
        $timelines = AnomaliTimeline::where('anomali_id', $anomaliId)
            ->with('user:id,name')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $timelines,
            'anomali' => $anomali->only(['id', 'judul', 'status'])
        ]);
    }

    /**
     * Store a new timeline entry
     */
    public function store(Request $request, $anomaliId): JsonResponse
    {
        $anomali = Anomali::findOrFail($anomaliId);
        
        $validated = $request->validate([
            'event_type' => [
                'required',
                'string',
                Rule::in([
                    'created', 'status_changed', 'assigned', 'approved', 
                    'rejected', 'completed', 'comment_added', 'updated'
                ])
            ],
            'description' => 'required|string|max:255',
            'comment' => 'nullable|string|max:1000',
            'old_value' => 'nullable|string|max:255',
            'new_value' => 'nullable|string|max:255',
        ]);

        $timeline = AnomaliTimeline::create([
            'anomali_id' => $anomaliId,
            'event_type' => $validated['event_type'],
            'description' => $validated['description'],
            'comment' => $validated['comment'] ?? null,
            'old_value' => $validated['old_value'] ?? null,
            'new_value' => $validated['new_value'] ?? null,
            'user_id' => Auth::id(),
        ]);

        $timeline->load('user:id,name');

        return response()->json([
            'success' => true,
            'message' => 'Timeline entry berhasil ditambahkan',
            'data' => $timeline
        ], 201);
    }

    /**
     * Update a timeline entry
     */
    public function update(Request $request, $anomaliId, $timelineId): JsonResponse
    {
        $anomali = Anomali::findOrFail($anomaliId);
        $timeline = AnomaliTimeline::where('anomali_id', $anomaliId)
            ->where('id', $timelineId)
            ->firstOrFail();

        // Only allow the creator or admin to update
        if ($timeline->user_id !== Auth::id() && !Auth::user()->hasRole('admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki izin untuk mengubah timeline ini'
            ], 403);
        }

        $validated = $request->validate([
            'description' => 'sometimes|required|string|max:255',
            'comment' => 'nullable|string|max:1000',
        ]);

        $timeline->update($validated);
        $timeline->load('user:id,name');

        return response()->json([
            'success' => true,
            'message' => 'Timeline entry berhasil diperbarui',
            'data' => $timeline
        ]);
    }

    /**
     * Delete a timeline entry
     */
    public function destroy($anomaliId, $timelineId): JsonResponse
    {
        $anomali = Anomali::findOrFail($anomaliId);
        $timeline = AnomaliTimeline::where('anomali_id', $anomaliId)
            ->where('id', $timelineId)
            ->firstOrFail();

        // Only allow the creator or admin to delete
        if ($timeline->user_id !== Auth::id() && !Auth::user()->hasRole('admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki izin untuk menghapus timeline ini'
            ], 403);
        }

        $timeline->delete();

        return response()->json([
            'success' => true,
            'message' => 'Timeline entry berhasil dihapus'
        ]);
    }

    /**
     * Add timeline entry when anomali is created
     */
    public function addCreationEntry($anomaliId, $comment = null): void
    {
        AnomaliTimeline::create([
            'anomali_id' => $anomaliId,
            'event_type' => 'created',
            'description' => 'Anomali dibuat',
            'comment' => $comment ?? 'Anomali baru telah dibuat',
            'user_id' => Auth::id(),
        ]);
    }

    /**
     * Add timeline entry when anomali status changes
     */
    public function addStatusChangeEntry($anomaliId, $oldStatus, $newStatus, $comment = null): void
    {
        AnomaliTimeline::create([
            'anomali_id' => $anomaliId,
            'event_type' => 'status_changed',
            'description' => 'Status anomali diubah',
            'comment' => $comment ?? "Status diubah dari {$oldStatus} menjadi {$newStatus}",
            'old_value' => $oldStatus,
            'new_value' => $newStatus,
            'user_id' => Auth::id(),
        ]);
    }

    /**
     * Add timeline entry when anomali is assigned
     */
    public function addAssignmentEntry($anomaliId, $assignedUserId, $comment = null): void
    {
        $assignedUser = null;
        $assignedUserName = null;
        
        if ($assignedUserId) {
            $assignedUser = \App\Models\User::find($assignedUserId);
            $assignedUserName = $assignedUser ? $assignedUser->name : null;
        }
        
        AnomaliTimeline::create([
            'anomali_id' => $anomaliId,
            'event_type' => 'assigned',
            'description' => 'Anomali ditugaskan',
            'comment' => $comment ?? ($assignedUserName ? "Anomali ditugaskan kepada {$assignedUserName}" : 'Anomali ditugaskan'),
            'new_value' => $assignedUserName,
            'user_id' => Auth::id(),
        ]);
    }

    /**
     * Add timeline entry when anomali is approved/rejected
     */
    public function addApprovalEntry($anomaliId, $isApproved, $comment = null): void
    {
        AnomaliTimeline::create([
            'anomali_id' => $anomaliId,
            'event_type' => $isApproved ? 'approved' : 'rejected',
            'description' => $isApproved ? 'Anomali disetujui' : 'Anomali ditolak',
            'comment' => $comment,
            'user_id' => Auth::id(),
        ]);
    }

    /**
     * Add timeline entry when comment is added
     */
    public function addCommentEntry($anomaliId, $comment): void
    {
        AnomaliTimeline::create([
            'anomali_id' => $anomaliId,
            'event_type' => 'comment_added',
            'description' => 'Komentar ditambahkan',
            'comment' => $comment,
            'user_id' => Auth::id(),
        ]);
    }

    /**
     * Add timeline entry when anomali is completed
     */
    public function addCompletionEntry($anomaliId, $comment = null): void
    {
        AnomaliTimeline::create([
            'anomali_id' => $anomaliId,
            'event_type' => 'completed',
            'description' => 'Anomali diselesaikan',
            'comment' => $comment ?? 'Penanganan anomali telah selesai',
            'user_id' => Auth::id(),
        ]);
    }

    /**
     * Get timeline statistics for an anomali
     */
    public function statistics($anomaliId): JsonResponse
    {
        $anomali = Anomali::findOrFail($anomaliId);
        
        $stats = AnomaliTimeline::where('anomali_id', $anomaliId)
            ->selectRaw('event_type, COUNT(*) as count')
            ->groupBy('event_type')
            ->pluck('count', 'event_type')
            ->toArray();

        $totalEntries = AnomaliTimeline::where('anomali_id', $anomaliId)->count();
        $lastActivity = AnomaliTimeline::where('anomali_id', $anomaliId)
            ->latest()
            ->first();

        return response()->json([
            'success' => true,
            'data' => [
                'total_entries' => $totalEntries,
                'event_types' => $stats,
                'last_activity' => $lastActivity,
                'anomali' => $anomali->only(['id', 'judul', 'status', 'created_at'])
            ]
        ]);
    }
}