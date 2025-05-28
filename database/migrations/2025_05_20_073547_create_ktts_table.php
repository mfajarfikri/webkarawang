<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

use function Laravel\Prompts\table;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ktts', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('lokasi', ['Karawang', 'Purwakarta'])->nullable();
            $table->enum('tipe', ['Khusus', 'Gold', 'Silver', 'Bronze', 'Reguler', '<30'])->nullable();
            $table->decimal('kapasitas');
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ktts');
    }
};
