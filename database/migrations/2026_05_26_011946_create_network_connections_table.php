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
        Schema::create('network_connections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('source_id')->constrained('network_devices')->onDelete('cascade');
            $table->foreignId('target_id')->constrained('network_devices')->onDelete('cascade');
            $table->string('type')->default('ethernet'); // fiber, ethernet, wireless
            $table->string('status')->default('active'); // active, down
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('network_connections');
    }
};
