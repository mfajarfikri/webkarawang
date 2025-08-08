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
        Schema::create('anomali_timelines', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('anomali_id');
            $table->string('event_type'); // 'created', 'status_changed', 'assigned', 'approved', 'rejected', 'completed', 'comment_added'
            $table->string('old_value')->nullable(); // untuk menyimpan nilai lama (misal status lama)
            $table->string('new_value')->nullable(); // untuk menyimpan nilai baru (misal status baru)
            $table->text('description'); // deskripsi event
            $table->text('comment')->nullable(); // komentar tambahan
            $table->unsignedBigInteger('user_id'); // user yang melakukan aksi
            $table->timestamps();

            $table->foreign('anomali_id')->references('id')->on('anomalis')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            
            $table->index(['anomali_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('anomali_timelines');
    }
};