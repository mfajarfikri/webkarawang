<?php

namespace Database\Factories;

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
        
        // Buat excerpt dari isi berita
        $excerpt = Str::limit(strip_tags($isiBerita), 200);
        
        // Buat array gambar untuk menyimpan dalam format JSON
        $gambarArray = [$this->faker->randomElement($namaGambar)];

        // Tambahkan unique ID untuk memastikan keunikan slug
        $uniqueId = uniqid();
        
        return [
            'judul' => $judul,
            'slug' => Str::slug($judul) . '-' . $uniqueId,
            'excerpt' => $excerpt,
            'isi' => $isiBerita,
            'gambar' => $gambarArray,
            'user_id' => User::factory(),
            'created_by' => function (array $attributes) {
                return $attributes['user_id'];
            },
            'read_count' => $this->faker->numberBetween(0, 1000),
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
                'gambar' => [$imageName],
            ];
        });
    }

    /**
     * State untuk berita dengan multiple gambar.
     */
    public function withImages(array $imageNames)
    {
        return $this->state(function (array $attributes) use ($imageNames) {
            return [
                'gambar' => $imageNames,
            ];
        });
    }

    /**
     * State untuk berita dari user spesifik.
     */
    public function fromUser(User $user)
    {
        return $this->state(function (array $attributes) use ($user) {
            return [
                'user_id' => $user->id,
                'created_by' => $user->id,
            ];
        });
    }
    
    /**
     * State untuk berita dengan jumlah pembaca tertentu.
     */
    public function withReadCount(int $count)
    {
        return $this->state(function (array $attributes) use ($count) {
            return [
                'read_count' => $count,
            ];
        });
    }
}
