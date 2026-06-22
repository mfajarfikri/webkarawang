import axios from "axios";
window.axios = axios;

window.axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

// Hanya inisialisasi Echo jika VITE_REVERB_APP_KEY tersedia (mencegah crash di production jika reverb tidak digunakan/dikonfigurasi)
if (import.meta.env.VITE_REVERB_APP_KEY) {
    window.Echo = new Echo({
        broadcaster: "reverb",
        key: import.meta.env.VITE_REVERB_APP_KEY,
        wsHost: import.meta.env.VITE_REVERB_HOST,
        wsPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
        wssPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
        forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? "https") === "https",
        enabledTransports: ["ws", "wss"],
    });
} else {
    window.Echo = null;
    console.warn(
        "Laravel Echo/Pusher tidak diinisialisasi karena VITE_REVERB_APP_KEY tidak ditemukan di environment (.env). Fitur real-time websocket mungkin tidak berjalan.",
    );
}
