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
        Schema::create('anomalis', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('judul');
            $table->enum('ultg', ['ULTG Karawang', 'ULTG Purwakarta']);
            $table->unsignedBigInteger('gardu_id');
            $table->enum('bagian', ['Banghal', 'Hargi', 'Harjar', 'Harpro', 'K3L']);
            $table->enum('tipe', ['Major', 'Minor']);
            $table->unsignedBigInteger('kategori_id');
            $table->string('peralatan');
            $table->string('merek')->nullable();
            $table->string('tipe_alat')->nullable();
            $table->string('no_seri')->nullable();
            $table->string('harga')->nullable();
            $table->string('kode_asset')->nullable();
            $table->string('tahun_operasi')->nullable();
            $table->string('tahun_buat')->nullable();
            $table->string('penempatan_alat');
            $table->date('tanggal_kejadian');
            $table->text('penyebab');
            $table->text('akibat');
            $table->text('usul_saran')->nullable(); 
            $table->json('lampiran_foto')->nullable();
            $table->enum('status', ['New', 'Open', 'Pending']);
            
            $table->unsignedBigInteger('assign_to')->nullable();
            $table->date('tanggal_approve')->nullable();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('approve_by')->nullable();

            // diisi ketika approve
            $table->date('tanggal_mulai')->nullable();
            $table->date('tanggal_selesai')->nullable();


            $table->foreign('gardu_id')->references('id')->on('gardu_induks')->onDelete('cascade');
            $table->foreign('kategori_id')->references('id')->on('kategoris')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('assign_to')->references('id')->on('users')->onDelete('set null');
            $table->foreign('approve_by')->references('id')->on('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('anomalis');
    }
};
