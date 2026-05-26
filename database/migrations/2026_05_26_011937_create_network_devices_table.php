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
            $table->foreignId('gardu_induk_id')
                ->nullable()
                ->constrained('gardu_induks')
                ->nullOnDelete();
            $table->string('name');
            $table->string('ip_address');
            $table->string('type'); // e.g., Router, Switch, Server, Gateway
            $table->string('icon_key')->nullable();
            $table->boolean('use_snmp')->default(true);
            $table->string('snmp_community')->default('public');
            $table->string('snmp_version')->default('v2c');
            $table->integer('snmp_port')->default(161);
            $table->integer('snmp_timeout')->default(5);
            $table->string('snmp_v3_user')->nullable();
            $table->string('snmp_v3_security_level')->nullable(); // noAuthNoPriv, authNoPriv, authPriv
            $table->string('snmp_v3_auth_protocol')->nullable(); // MD5, SHA
            $table->text('snmp_v3_auth_passphrase')->nullable();
            $table->string('snmp_v3_priv_protocol')->nullable(); // DES, AES
            $table->text('snmp_v3_priv_passphrase')->nullable();
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
