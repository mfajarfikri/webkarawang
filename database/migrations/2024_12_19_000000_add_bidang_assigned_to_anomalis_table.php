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
        Schema::table('anomalis', function (Blueprint $table) {
            $table->enum('bidang_assigned', ['Master', 'MULTG', 'Renev', 'Hargi', 'Harjar', 'Harpro', 'K3', 'GI'])->nullable()->after('assign_to');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('anomalis', function (Blueprint $table) {
            $table->dropColumn('bidang_assigned');
        });
    }
};