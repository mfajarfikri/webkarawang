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
        Schema::create('jabatans', function (Blueprint $table) {
            $table->id();
            $table->string('nama_jabatan');
            $table->string('level'); // MANAJER, ASMAN, TL, PJ, STAFF
            $table->timestamps();
        });

        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->string('nama_department'); // RENEV, KEUANGAN & UMUM, KONSTRUKSI, PDKB, etc
            $table->timestamps();
        });

        Schema::create('karyawans', function (Blueprint $table) {
            $table->id();
            $table->string('nip')->unique();
            $table->string('name');
            $table->string('email')->unique();
            $table->enum('jenis_kelamin', ['L', 'P']);
            $table->foreignId('jabatan_id')->constrained('jabatans');
            $table->foreignId('department_id')->nullable()->constrained('departments');
            $table->foreignId('parent_id')->nullable()->constrained('karyawans');
            $table->enum('kedudukan', [
                'UPT Karawang',
                'ULTG Karawang',
                'ULTG Purwakarta'
            ])->default('UPT Karawang');
            $table->string('foto_profil')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('karyawans');
        Schema::dropIfExists('departments');
        Schema::dropIfExists('jabatans');
    }
};
