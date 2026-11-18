/**
 * Header standar halaman dashboard: ikon, judul, deskripsi, dan slot aksi.
 * `children` dirender di sisi kanan (tombol, ringkasan, dsb).
 */
export default function PageHeader({
    icon: Icon,
    title,
    description,
    leading,
    children,
}) {
    return (
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-center gap-4">
                {leading}
                {Icon ? (
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-ink-900 text-volt shadow-soft">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                ) : null}
                <div className="min-w-0">
                    <h1 className="text-2xl font-extrabold text-ink-900">
                        {title}
                    </h1>
                    {description ? (
                        <p className="mt-1 max-w-2xl text-sm text-slate-600">
                            {description}
                        </p>
                    ) : null}
                </div>
            </div>
            {children ? (
                <div className="flex shrink-0 flex-wrap items-center gap-3">
                    {children}
                </div>
            ) : null}
        </div>
    );
}

/** Ringkasan kecil di sisi kanan header, mis. "12 role · Terdaftar". */
export function HeaderStat({ icon: Icon, value, label }) {
    return (
        <div className="hidden items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5 shadow-soft sm:flex">
            {Icon ? (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
            ) : null}
            <div className="leading-tight">
                <div className="text-sm font-bold text-ink-900">{value}</div>
                <div className="text-xs text-slate-500">{label}</div>
            </div>
        </div>
    );
}
