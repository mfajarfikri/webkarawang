import { FaCheck, FaExclamation } from "react-icons/fa";

const MARKER_CLASSES = {
    current: "bg-ink-900 text-white ring-4 ring-brand-100",
    done: "bg-emerald-500 text-white",
    attention: "bg-amber-400 text-ink-950",
    upcoming: "bg-white text-slate-400 ring-1 ring-inset ring-slate-200",
};

const STATUS_TEXT = {
    done: "Lengkap",
    attention: "Ada isian wajib kosong",
};

function Marker({ status, index }) {
    return (
        <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${MARKER_CLASSES[status]}`}
        >
            {status === "done" ? (
                <FaCheck className="h-3 w-3" aria-hidden="true" />
            ) : status === "attention" ? (
                <FaExclamation className="h-3 w-3" aria-hidden="true" />
            ) : (
                index
            )}
        </span>
    );
}

/**
 * Navigasi langkah form Lapor Anomali.
 * Desktop: daftar vertikal yang menempel; HP: ringkasan + bilah progres.
 * Klik langkah untuk berpindah (maju tetap divalidasi oleh pemanggil).
 */
export default function ReportStepNav({ steps, currentStep, statusOf, onSelect }) {
    const current = steps.find((s) => s.id === currentStep);
    const progress = Math.round((currentStep / steps.length) * 100);

    return (
        <nav aria-label="Langkah laporan" className="lg:sticky lg:top-24">
            {/* HP & tablet */}
            <div className="surface p-4 lg:hidden">
                <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-ink-900">
                        {current?.title}
                    </span>
                    <span className="shrink-0 text-xs font-semibold text-slate-500">
                        Langkah {currentStep} dari {steps.length}
                    </span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                        className="h-full rounded-full bg-brand-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Desktop */}
            <ol className="surface hidden p-3 lg:block">
                {steps.map((s, idx) => {
                    const status = statusOf(s.id);
                    const isCurrent = status === "current";
                    return (
                        <li key={s.id} className="relative">
                            {idx < steps.length - 1 ? (
                                <span
                                    aria-hidden="true"
                                    className={`absolute left-[1.65rem] top-12 h-[calc(100%-2.5rem)] w-px ${
                                        status === "done"
                                            ? "bg-emerald-300"
                                            : "bg-slate-200"
                                    }`}
                                />
                            ) : null}
                            <button
                                type="button"
                                onClick={() => onSelect(s.id)}
                                aria-current={isCurrent ? "step" : undefined}
                                className={`flex w-full items-start gap-3 rounded-xl p-2.5 text-left transition ${
                                    isCurrent
                                        ? "bg-slate-50"
                                        : "hover:bg-slate-50"
                                }`}
                            >
                                <Marker status={status} index={s.id} />
                                <span className="min-w-0 pt-0.5">
                                    <span
                                        className={`block text-sm font-semibold ${
                                            status === "upcoming"
                                                ? "text-slate-500"
                                                : "text-ink-900"
                                        }`}
                                    >
                                        {s.title}
                                    </span>
                                    <span
                                        className={`mt-0.5 block text-xs ${
                                            status === "attention"
                                                ? "font-semibold text-amber-700"
                                                : "text-slate-500"
                                        }`}
                                    >
                                        {STATUS_TEXT[status] ?? s.hint}
                                    </span>
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
