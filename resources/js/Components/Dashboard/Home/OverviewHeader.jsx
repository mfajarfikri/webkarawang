import { Link } from "@inertiajs/react";
import { FaExclamationTriangle, FaPen, FaPlus } from "react-icons/fa";

function formatTime(date) {
    return date
        .toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
        .replace(":", ".");
}

function SyncPill({ isSyncing, lastUpdated, hasError }) {
    let dot = "bg-emerald-500";
    let text = `Diperbarui ${formatTime(lastUpdated)}`;
    if (isSyncing) {
        text = "Menyinkronkan...";
    } else if (hasError) {
        dot = "bg-rose-500";
    }

    return (
        <span
            role="status"
            aria-live="polite"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-soft"
        >
            {isSyncing ? (
                <span
                    aria-hidden="true"
                    className="h-3 w-3 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600"
                />
            ) : (
                <span aria-hidden="true" className={`h-2 w-2 rounded-full ${dot}`} />
            )}
            {text}
        </span>
    );
}

/** Sapaan, status sinkronisasi, aksi cepat, dan pesan galat sinkronisasi. */
export default function OverviewHeader({
    name,
    isSyncing,
    lastUpdated,
    error,
    canCreateAnomali,
    canWriteBerita,
}) {
    return (
        <header className="mb-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0">
                    <div className="eyebrow">Ringkasan operasional</div>
                    <h1 className="mt-3 text-2xl font-extrabold text-ink-900 sm:text-3xl">
                        Selamat datang, {name}
                    </h1>
                    <p className="mt-1 text-sm text-slate-600">
                        Pantau alur anomali, tindakan yang menunggu Anda, dan
                        berita di beranda dalam satu layar.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <SyncPill
                        isSyncing={isSyncing}
                        lastUpdated={lastUpdated}
                        hasError={Boolean(error)}
                    />
                    {canCreateAnomali ? (
                        <Link
                            href={route("dashboard.anomali.create")}
                            className="btn-brand"
                        >
                            <FaPlus className="h-3 w-3" aria-hidden="true" />
                            Laporkan anomali
                        </Link>
                    ) : null}
                    {canWriteBerita ? (
                        <Link
                            href={route("dashboard.berita.create")}
                            className="btn-ghost"
                        >
                            <FaPen className="h-3 w-3" aria-hidden="true" />
                            Tulis berita
                        </Link>
                    ) : null}
                </div>
            </div>
            {error ? (
                <div
                    role="alert"
                    className="mt-4 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                >
                    <FaExclamationTriangle
                        className="mt-0.5 h-4 w-4 shrink-0"
                        aria-hidden="true"
                    />
                    <span>
                        <span className="font-semibold">
                            Sinkronisasi gagal:
                        </span>{" "}
                        {error}. Data yang tampil mungkin belum terbaru; sistem
                        akan mencoba lagi otomatis.
                    </span>
                </div>
            ) : null}
        </header>
    );
}
