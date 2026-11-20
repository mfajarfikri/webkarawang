/**
 * Kit UI bersama untuk halaman dashboard.
 * Pasangkan dengan kelas CSS di app.css: btn-*, field-*, data-table, surface.
 */

const TONES = {
    brand: "bg-brand-50 text-brand-800 ring-brand-200",
    emerald: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    amber: "bg-amber-50 text-amber-800 ring-amber-200",
    rose: "bg-rose-50 text-rose-700 ring-rose-200",
    violet: "bg-violet-50 text-violet-800 ring-violet-200",
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
};

const ICON_TONES = {
    brand: "bg-brand-50 text-brand-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
    violet: "bg-violet-50 text-violet-700",
    slate: "bg-slate-100 text-slate-600",
    ink: "bg-ink-900 text-volt",
};

function cx(...values) {
    return values.filter(Boolean).join(" ");
}

/** Kartu konten dengan header opsional (judul, deskripsi, ikon, aksi). */
export function Card({
    title,
    description,
    icon: Icon,
    actions,
    footer,
    padded = true,
    clip,
    className,
    bodyClassName,
    children,
}) {
    const hasHeader = title || description || actions;
    // Kartu sengaja tidak memotong isinya (overflow visible) supaya dropdown,
    // kalender, dan popover di dalamnya tidak terpangkas. Hanya badan tanpa
    // padding (biasanya tabel) yang dipotong agar sudutnya tetap membulat;
    // set clip={false} bila badan tabel berisi dropdown.
    const clipBody = clip ?? !padded;
    return (
        <section className={cx("surface", className)}>
            {hasHeader ? (
                <header className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div className="flex min-w-0 items-center gap-3">
                        {Icon ? (
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                                <Icon className="h-4 w-4" aria-hidden="true" />
                            </span>
                        ) : null}
                        <div className="min-w-0">
                            {title ? (
                                <h2 className="text-base font-bold text-ink-900">
                                    {title}
                                </h2>
                            ) : null}
                            {description ? (
                                <p className="mt-0.5 text-sm text-slate-500">
                                    {description}
                                </p>
                            ) : null}
                        </div>
                    </div>
                    {actions ? (
                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                            {actions}
                        </div>
                    ) : null}
                </header>
            ) : null}
            <div
                className={cx(
                    padded && "p-5 sm:p-6",
                    clipBody && "overflow-hidden",
                    clipBody && !hasHeader && "rounded-t-2xl",
                    clipBody && !footer && "rounded-b-2xl",
                    bodyClassName,
                )}
            >
                {children}
            </div>
            {footer ? (
                <footer className="rounded-b-2xl border-t border-slate-100 bg-slate-50/60 px-5 py-3 sm:px-6">
                    {footer}
                </footer>
            ) : null}
        </section>
    );
}

/** Angka ringkasan: label, nilai besar, keterangan opsional. */
export function StatCard({ label, value, hint, icon: Icon, tone = "slate" }) {
    return (
        <div className="surface flex items-start justify-between gap-4 p-5">
            <div className="min-w-0">
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="mt-2 font-display text-3xl font-extrabold tabular-nums text-ink-900">
                    {value}
                </p>
                {hint ? (
                    <p className="mt-1 text-xs text-slate-500">{hint}</p>
                ) : null}
            </div>
            {Icon ? (
                <span
                    className={cx(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                        ICON_TONES[tone] ?? ICON_TONES.slate,
                    )}
                >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
            ) : null}
        </div>
    );
}

/** Label status kecil berwarna. */
export function Badge({ tone = "slate", dot = false, className, children }) {
    return (
        <span
            className={cx(
                "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
                TONES[tone] ?? TONES.slate,
                className,
            )}
        >
            {dot ? (
                <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
            ) : null}
            {children}
        </span>
    );
}

/** Keadaan kosong untuk daftar atau tabel tanpa data. */
export function EmptyState({ icon: Icon, title, description, action }) {
    return (
        <div className="flex flex-col items-center px-6 py-14 text-center">
            {Icon ? (
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
            ) : null}
            <h3 className="mt-4 text-base font-bold text-ink-900">{title}</h3>
            {description ? (
                <p className="mt-1 max-w-sm text-sm text-slate-600">
                    {description}
                </p>
            ) : null}
            {action ? <div className="mt-5">{action}</div> : null}
        </div>
    );
}

/** Label + kontrol + pesan bantuan/galat untuk satu field form. */
export function Field({ label, htmlFor, hint, error, required, children }) {
    return (
        <div>
            {label ? (
                <label htmlFor={htmlFor} className="field-label">
                    {label}
                    {required ? (
                        <span className="ml-0.5 text-rose-600">*</span>
                    ) : null}
                </label>
            ) : null}
            {children}
            {error ? (
                <p className="field-error">{error}</p>
            ) : hint ? (
                <p className="field-hint">{hint}</p>
            ) : null}
        </div>
    );
}
