<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>403 - Akses Ditolak</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
</head>
<body class="bg-gray-100 flex items-center justify-center min-h-screen text-gray-800">

    <div class="max-w-md w-full text-center px-6 py-10 bg-white shadow-md rounded-xl">
        <h1 class="text-6xl font-extrabold text-blue-700">403</h1>
        <p class="text-2xl font-semibold mt-4">Akses Ditolak</p>
        <p class="mt-2 text-gray-600">
            Anda tidak memiliki izin untuk mengakses halaman ini.
        </p>

        <div class="mt-6 flex justify-center gap-4">
            <a href="{{ url()->previous() }}"
               class="px-5 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition">
                Kembali
            </a>
            <a href="{{ url('/') }}"
               class="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition">
                Beranda
            </a>
        </div>

        <p class="text-sm text-gray-400 mt-8">&copy; {{ date('Y') }} Aplikasi Internal</p>
    </div>

</body>
</html>
