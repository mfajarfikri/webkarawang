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
        Schema::create('network_devices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('gardu_induk_id')->constrained('gardu_induks')->onDelete('cascade');
            $table->string('name');
            $table->string('ip_address');
            $table->string('type'); // e.g., Router, Switch, Server, Gateway
            $table->string('snmp_community')->default('public');
            $table->string('status')->default('unknown'); // Online, Offline, Unknown
            $table->timestamp('last_seen')->nullable();
            $table->json('snmp_data')->nullable(); // Store dynamic stats like bandwidth, cpu, mem
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('network_devices');
    }
};
