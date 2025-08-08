<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Anomali;
use App\Models\AnomaliTimeline;
use App\Models\User;
use Carbon\Carbon;

class AnomaliTimelineSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get first anomali and user for testing
        $anomali = Anomali::first();
        $user = User::first();
        
        if (!$anomali || !$user) {
            $this->command->info('No anomali or user found. Please create some data first.');
            return;
        }

        // Create timeline entries
        $timelines = [
            [
                'anomali_id' => $anomali->id,
                'event_type' => 'created',
                'description' => 'Anomali dilaporkan',
                'comment' => 'Anomali baru telah dilaporkan dan menunggu review.',
                'user_id' => $user->id,
                'created_at' => Carbon::now()->subDays(5),
                'updated_at' => Carbon::now()->subDays(5),
            ],
            [
                'anomali_id' => $anomali->id,
                'event_type' => 'status_changed',
                'old_value' => 'Pending',
                'new_value' => 'In Progress',
                'description' => 'Status anomali diubah',
                'comment' => 'Status anomali diubah dari Pending menjadi In Progress.',
                'user_id' => $user->id,
                'created_at' => Carbon::now()->subDays(4),
                'updated_at' => Carbon::now()->subDays(4),
            ],
            [
                'anomali_id' => $anomali->id,
                'event_type' => 'assigned',
                'description' => 'Anomali ditugaskan',
                'comment' => 'Anomali telah ditugaskan kepada teknisi untuk penanganan.',
                'user_id' => $user->id,
                'created_at' => Carbon::now()->subDays(3),
                'updated_at' => Carbon::now()->subDays(3),
            ],
            [
                'anomali_id' => $anomali->id,
                'event_type' => 'comment_added',
                'description' => 'Komentar ditambahkan',
                'comment' => 'Teknisi telah melakukan inspeksi awal dan menemukan penyebab masalah.',
                'user_id' => $user->id,
                'created_at' => Carbon::now()->subDays(2),
                'updated_at' => Carbon::now()->subDays(2),
            ],
            [
                'anomali_id' => $anomali->id,
                'event_type' => 'approved',
                'description' => 'Anomali disetujui',
                'comment' => 'Laporan anomali telah disetujui dan siap untuk penanganan.',
                'user_id' => $user->id,
                'created_at' => Carbon::now()->subDays(1),
                'updated_at' => Carbon::now()->subDays(1),
            ],
        ];

        foreach ($timelines as $timeline) {
            AnomaliTimeline::create($timeline);
        }

        $this->command->info('Sample timeline data created successfully!');
    }
}