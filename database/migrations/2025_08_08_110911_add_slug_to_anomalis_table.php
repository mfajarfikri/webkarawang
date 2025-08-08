<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use App\Models\Anomali;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Cek apakah kolom slug sudah ada
        if (!Schema::hasColumn('anomalis', 'slug')) {
            // Tambahkan kolom slug tanpa constraint unique dulu
            Schema::table('anomalis', function (Blueprint $table) {
                $table->string('slug')->nullable()->after('judul');
            });
        }

        // Generate slug untuk data yang sudah ada
        $anomalis = Anomali::all();
        foreach ($anomalis as $anomali) {
            if (empty($anomali->slug)) {
                $baseSlug = Str::slug($anomali->judul);
                $slug = $baseSlug;
                $counter = 1;
                
                // Pastikan slug unik
                while (Anomali::where('slug', $slug)->where('id', '!=', $anomali->id)->exists()) {
                    $slug = $baseSlug . '-' . $counter;
                    $counter++;
                }
                
                $anomali->update(['slug' => $slug]);
            }
        }

        // Sekarang tambahkan constraint unique dan not null jika belum ada
        Schema::table('anomalis', function (Blueprint $table) {
            $table->string('slug')->nullable(false)->unique()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('anomalis', function (Blueprint $table) {
            $table->dropColumn('slug');
        });
    }
};
