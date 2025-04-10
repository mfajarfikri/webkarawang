<?php

namespace Database\Factories;

use App\Models\Karyawan;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Berita>
 */
class BeritaFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Array judul berita yang relevan dengan PLN UPT Karawang
        $judulBerita = [
            'Pemeliharaan Rutin Gardu Induk {nama_gi} Selesai Dilaksanakan',
            'Peningkatan Keandalan Transmisi di Wilayah {wilayah}',
            'Program Modernisasi Sistem Proteksi Gardu Induk',
            'Kunjungan Kerja Direktur Regional ke UPT Karawang',
            'Implementasi Teknologi Smart Grid di {nama_gi}',
            'Pelatihan {jenis_pelatihan} untuk Tim Pemeliharaan',
            'Pencapaian Zero Trip pada Sistem Transmisi Bulan {bulan}',
            'Penggantian Transformator Daya di Gardu Induk {nama_gi}',
            'Evaluasi Kinerja Sistem Transmisi Triwulan {triwulan}',
            'Workshop Keselamatan Kerja untuk Petugas Lapangan'
        ];

        // Array nama Gardu Induk
        $namaGI = ['Karawang', 'Dawuan', 'Cikampek', 'Purwakarta', 'Cilamaya'];

        // Array wilayah
        $wilayah = ['Karawang Barat', 'Karawang Timur', 'Cikampek', 'Purwakarta', 'Cilamaya'];

        // Array jenis pelatihan
        $jenisPelatihan = ['K3', 'Pemeliharaan Preventif', 'Penanganan Gangguan', 'Sistem Proteksi', 'Pengoperasian Peralatan'];

        // Array bulan
        $bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

        // Pilih judul secara random dan ganti placeholder
        $judul = $this->faker->randomElement($judulBerita);
        $judul = str_replace(
            ['{nama_gi}', '{wilayah}', '{jenis_pelatihan}', '{bulan}', '{triwulan}'],
            [
                $this->faker->randomElement($namaGI),
                $this->faker->randomElement($wilayah),
                $this->faker->randomElement($jenisPelatihan),
                $this->faker->randomElement($bulan),
                $this->faker->numberBetween(1, 4)
            ],
            $judul
        );

        // Generate paragraf berita yang relevan
        $isiBerita = $this->faker->paragraph(2) . "\n\n" .
            "Kegiatan ini merupakan bagian dari program peningkatan keandalan sistem transmisi PLN UPT Karawang. " .
            $this->faker->paragraph(1) . "\n\n" .
            "Tim teknis telah melakukan berbagai pengujian dan pemeriksaan sesuai dengan Standar Operasional Prosedur (SOP). " .
            $this->faker->paragraph(2) . "\n\n" .
            "Pencapaian ini menunjukkan komitmen PLN UPT Karawang dalam menjaga keandalan pasokan listrik untuk pelanggan.";

        // Array nama file gambar
        $namaGambar = [
            'transmisi.jpg',
            'gardu-induk.jpg',
            'pemeliharaan.jpg',
            'pelatihan.jpg',
            'kunjungan.jpg',
            'monitoring.jpg'
        ];

        return [
            'judul' => $judul,
            'slug' => Str::slug($judul),
            'isi' => $isiBerita,
            'gambar' => 'berita/' . $this->faker->randomElement($namaGambar),
            'karyawan_id' => Karyawan::factory(),
            'created_by' => User::factory(),
            'created_at' => $this->faker->dateTimeBetween('-3 months', 'now'),
            'updated_at' => function (array $attributes) {
                return $attributes['created_at'];
            },
        ];
    }

    /**
     * State untuk berita terbaru.
     */
    public function terbaru()
    {
        return $this->state(function (array $attributes) {
            return [
                'created_at' => $this->faker->dateTimeBetween('-1 week', 'now'),
            ];
        });
    }

    /**
     * State untuk berita dengan gambar spesifik.
     */
    public function withImage(string $imageName)
    {
        return $this->state(function (array $attributes) use ($imageName) {
            return [
                'gambar' => 'berita/' . $imageName,
            ];
        });
    }

    /**
     * State untuk berita dari karyawan spesifik.
     */
    public function fromKaryawan(Karyawan $karyawan)
    {
        return $this->state(function (array $attributes) use ($karyawan) {
            return [
                'karyawan_id' => $karyawan->id,
            ];
        });
    }
}
