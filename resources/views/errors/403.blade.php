<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>403 - Akses Ditolak</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                    },
                    keyframes: {
                        float: {
                            '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
                            '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
                            '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                        }
                    },
                    animation: {
                        'float-slow': 'float 15s infinite ease-in-out',
                        'float-medium': 'float 10s infinite ease-in-out reverse',
                    }
                }
            }
        }
    </script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    </style>
</head>
<body class="bg-gray-500/50 backdrop-blur-sm flex items-center justify-center min-h-screen text-white overflow-hidden relative selection:bg-blue-500/30">

    <!-- Background Effects -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
    
        
        <!-- Animated Orbs -->
        <div class="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-[100px] animate-float-slow mix-blend-screen"></div>
        <div class="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-indigo-500/20 blur-[100px] animate-float-medium mix-blend-screen"></div>
        <div class="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full bg-cyan-500/10 blur-[80px] animate-pulse mix-blend-screen" style="animation-duration: 8s;"></div>
        
        <!-- Pattern Overlay -->
        <div class="absolute inset-0 bg-[image:radial-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:24px_24px] opacity-[0.03]"></div>
    </div>

    <div class="relative z-10 w-full max-w-lg px-6">
        <!-- Main Card -->
        <div class="bg-white/[0.03] backdrop-blur-[20px] border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] rounded-[2.5rem] p-10 md:p-14 text-center relative overflow-hidden group">
            
            <!-- Shine effect -->
            <div class="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

            <div class="relative z-10">
                <!-- Icon Container -->
                <div class="mx-auto w-24 h-24 rounded-[2rem] bg-gradient-to-br from-white/10 to-white/5 border border-white/20 flex items-center justify-center mb-8 shadow-xl backdrop-blur-md group-hover:scale-105 transition-transform duration-500">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-white/90 drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>

                <h1 class="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 tracking-tight mb-2 drop-shadow-sm">403</h1>
                <h2 class="text-xl font-medium text-white/90 mb-4 tracking-wide">Akses Dibatasi</h2>
                <p class="text-white mb-10 text-sm leading-relaxed font-light">
                    Halaman ini dilindungi. Anda tidak memiliki izin yang cukup untuk mengakses area ini.
                </p>

                <div class="flex flex-col gap-3">
                    <a href="{{ url()->previous() }}"
                       class="bg-white/10 backdrop-blur-[10px] border border-white/20 transition-all duration-300 hover:bg-white/20 hover:-translate-y-0.5 hover:shadow-[0_10px_20px_-5px_rgba(0,0,0,0.3)] w-full py-3.5 rounded-2xl font-medium text-white text-sm flex items-center justify-center group/btn relative overflow-hidden">
                        <div class="absolute inset-0 bg-blue-500/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                        <span class="relative flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-2 transition-transform group-hover/btn:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Kembali ke Halaman Sebelumnya
                        </span>
                    </a>
                    
                    <a href="{{ url('/') }}"
                       class="w-full py-3.5 rounded-2xl font-medium text-white/70 text-sm flex items-center justify-center hover:text-white hover:bg-white/5 transition-all duration-300">
                        Ke Beranda
                    </a>
                </div>
            </div>
        </div>
        
        <div class="mt-8 text-center">
            <p class="text-[10px] tracking-widest text-white-800/20 uppercase font-medium">&copy; {{ date('Y') }} PLN UPT Karawang</p>
        </div>
    </div>

</body>
</html>