import { FaLock } from "react-icons/fa";

/** Pengganti konten saat pengguna tidak memiliki permission yang dibutuhkan. */
export default function LockedState({ title, permission }) {
    return (
        <section className="surface flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <FaLock className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-600">
                    Akses terbatas
                </p>
                <h2 className="mt-1 text-base font-bold text-ink-900">
                    {title}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                    Anda belum memiliki izin untuk melihat bagian ini. Hubungi
                    administrator untuk mengaktifkan akses
                    <span className="mx-1 inline-flex items-center rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-800 ring-1 ring-inset ring-brand-200">
                        {permission}
                    </span>
                    pada akun Anda.
                </p>
            </div>
        </section>
    );
}
