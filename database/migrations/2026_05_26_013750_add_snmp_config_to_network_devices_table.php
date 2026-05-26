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
        Schema::table('network_devices', function (Blueprint $table) {
            $table->string('snmp_version')->default('v2c')->after('snmp_community');
            $table->integer('snmp_port')->default(161)->after('snmp_version');
            $table->integer('snmp_timeout')->default(5)->after('snmp_port');
            // SNMP v3 Auth
            $table->string('snmp_v3_user')->nullable()->after('snmp_timeout');
            $table->string('snmp_v3_security_level')->nullable()->after('snmp_v3_user'); // noAuthNoPriv, authNoPriv, authPriv
            $table->string('snmp_v3_auth_protocol')->nullable()->after('snmp_v3_security_level'); // MD5, SHA
            $table->text('snmp_v3_auth_passphrase')->nullable()->after('snmp_v3_auth_protocol');
            $table->string('snmp_v3_priv_protocol')->nullable()->after('snmp_v3_auth_passphrase'); // DES, AES
            $table->text('snmp_v3_priv_passphrase')->nullable()->after('snmp_v3_priv_protocol');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('network_devices', function (Blueprint $table) {
            $table->dropColumn([
                'snmp_version', 'snmp_port', 'snmp_timeout',
                'snmp_v3_user', 'snmp_v3_security_level',
                'snmp_v3_auth_protocol', 'snmp_v3_auth_passphrase',
                'snmp_v3_priv_protocol', 'snmp_v3_priv_passphrase'
            ]);
        });
    }
};
