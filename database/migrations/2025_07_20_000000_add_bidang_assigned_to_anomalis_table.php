<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Periksa apakah tabel anomalis sudah ada sebelum menambahkan kolom
        if (Schema::hasTable('anomalis')) {
            Schema::table('anomalis', function (Blueprint $table) {
                // Periksa apakah kolom bidang_assigned belum ada
                if (!Schema::hasColumn('anomalis', 'bidang_assigned')) {
                    $table->enum('bidang_assigned', ['Master', 'MULTG', 'Renev', 'Hargi', 'Harjar', 'Harpro', 'K3', 'GI'])->nullable()->after('assign_to');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('anomalis') && Schema::hasColumn('anomalis', 'bidang_assigned')) {
            Schema::table('anomalis', function (Blueprint $table) {
                $table->dropColumn('bidang_assigned');
            });
        }
    }
};