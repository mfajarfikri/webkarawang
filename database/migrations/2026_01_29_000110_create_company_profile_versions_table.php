<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('company_profile_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_profile_id')->constrained('company_profiles')->cascadeOnDelete();
            $table->unsignedInteger('version_number');
            $table->string('state')->default('draft');
            $table->json('snapshot_data');
            $table->text('change_note')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['company_profile_id', 'version_number'], 'cpv_profile_version_uniq');
            $table->index(['company_profile_id', 'created_at'], 'cpv_profile_created_at_idx');
            $table->index(['company_profile_id', 'state'], 'cpv_profile_state_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('company_profile_versions');
    }
};
