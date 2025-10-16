<?php

namespace App\Console\Commands;

use App\Models\Anomali;
use Illuminate\Support\Str;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class UpdateOverdueAnomalies extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'anomali:update-overdue {--dry-run : Show what would be updated without making changes}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update overdue anomalies to pending status when tanggal_selesai has passed';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 Checking for overdue anomalies...');
        
        // Get overdue anomalies first to show details
        $overdueAnomalies = Anomali::getOverdueAnomalies();
        
        if ($overdueAnomalies->isEmpty()) {
            $this->info('✅ No overdue anomalies found.');
            return 0;
        }

        $this->info("📋 Found {$overdueAnomalies->count()} overdue anomalies:");
        
        // Display table of overdue anomalies
        $tableData = $overdueAnomalies->map(function ($anomali) {
            return [
                'ID' => $anomali->id,
                'Judul' => Str::limit($anomali->judul, 30),
                'Status' => $anomali->status,
                'Tanggal Selesai' => $anomali->tanggal_selesai,
                'ULTG' => $anomali->ultg,
                'Kategori' => $anomali->kategori->nama ?? 'N/A',
            ];
        })->toArray();

        $this->table(
            ['ID', 'Judul', 'Status', 'Tanggal Selesai', 'ULTG', 'Kategori'],
            $tableData
        );

        if ($this->option('dry-run')) {
            $this->warn('🔍 DRY RUN: No changes were made. Remove --dry-run flag to update records.');
            return 0;
        }

        // Confirm before updating
        if (!$this->confirm('Do you want to update these anomalies to Pending status?')) {
            $this->info('❌ Operation cancelled.');
            return 0;
        }

        // Update overdue anomalies
        $updatedCount = Anomali::updateOverdueAnomaliesToPending();
        
        if ($updatedCount > 0) {
            $this->info("✅ Successfully updated {$updatedCount} anomalies to Pending status.");
            
            // Log the action
            Log::info("Updated {$updatedCount} overdue anomalies to Pending status", [
                'command' => 'anomali:update-overdue',
                'updated_count' => $updatedCount,
                'executed_at' => now()
            ]);
        } else {
            $this->warn('⚠️ No anomalies were updated.');
        }

        return 0;
    }
}
