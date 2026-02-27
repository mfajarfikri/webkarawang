<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('anomali_closures', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('anomali_id');
            $table->date('tanggal_pekerjaan');
            $table->string('lampiran_pdf_path');
            $table->unsignedBigInteger('created_by');
            $table->timestamps();

            $table->foreign('anomali_id')->references('id')->on('anomalis')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');

            $table->index(['anomali_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('anomali_closures');
    }
};

