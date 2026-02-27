<?php

use App\Models\CompanyProfile;
use App\Models\CompanyProfileVersion;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        CompanyProfile::query()
            ->select(['id', 'draft_data', 'published_data'])
            ->orderBy('id')
            ->chunkById(100, function ($rows) {
                foreach ($rows as $row) {
                    $draft = $row->draft_data;
                    $published = $row->published_data;

                    $changed = false;

                    if (is_array($draft) && array_key_exists('founded_year', $draft)) {
                        unset($draft['founded_year']);
                        $changed = true;
                    }

                    if (is_array($published) && array_key_exists('founded_year', $published)) {
                        unset($published['founded_year']);
                        $changed = true;
                    }

                    if ($changed) {
                        $row->update([
                            'draft_data' => $draft,
                            'published_data' => $published,
                        ]);
                    }
                }
            });

        CompanyProfileVersion::query()
            ->select(['id', 'snapshot_data'])
            ->orderBy('id')
            ->chunkById(200, function ($rows) {
                foreach ($rows as $row) {
                    $snapshot = $row->snapshot_data;
                    if (!is_array($snapshot) || !array_key_exists('founded_year', $snapshot)) {
                        continue;
                    }

                    unset($snapshot['founded_year']);

                    $row->update([
                        'snapshot_data' => $snapshot,
                    ]);
                }
            });
    }

    public function down(): void
    {
    }
};

