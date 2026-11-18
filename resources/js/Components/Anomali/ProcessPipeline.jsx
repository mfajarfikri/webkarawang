import { FaArrowRight } from "react-icons/fa";
import { PIPELINE, STAGES } from "./anomaliWorkflow";
import { TONE_CLASSES } from "./StageBadge";

function StageCard({ stageKey, index, count, overdue, isActive, onSelect }) {
    const stage = STAGES[stageKey];
    const tone = TONE_CLASSES[stage.tone];
    const isLast = index === PIPELINE.length - 1;

    return (
        <li className="relative">
            <button
                type="button"
                onClick={() => onSelect(isActive ? null : stageKey)}
                aria-pressed={isActive}
                title={stage.hint}
                className={`group flex h-full w-full flex-col justify-between gap-4 rounded-2xl border bg-white p-4 text-left transition duration-200 sm:p-5 ${
                    isActive
                        ? "border-ink-900 shadow-lift ring-1 ring-ink-900"
                        : "border-slate-200/80 shadow-soft hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lift"
                }`}
            >
                <span className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white ${tone.dot}`}
                        >
                            {index + 1}
                        </span>
                        {stage.label}
                    </span>
                    {overdue > 0 ? (
                        <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 ring-1 ring-inset ring-rose-200">
                            {overdue} lewat jadwal
                        </span>
                    ) : null}
                </span>
                <span className="flex items-end justify-between gap-2">
                    <span className="font-display text-3xl font-extrabold tabular-nums text-ink-900">
                        {count}
                    </span>
                    <span className="hidden text-right text-[11px] leading-snug text-slate-500 xl:block xl:max-w-[11rem]">
                        {stage.hint}
                    </span>
                </span>
            </button>
            {!isLast ? (
                <span
                    aria-hidden="true"
                    className="absolute -right-3 top-1/2 z-10 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 lg:flex"
                >
                    <FaArrowRight className="h-2.5 w-2.5" />
                </span>
            ) : null}
        </li>
    );
}

/**
 * Ringkasan alur proses anomali. Klik sebuah tahap untuk menyaring tabel;
 * klik lagi untuk melepas saringan.
 */
export default function ProcessPipeline({ counts, activeStage, onSelect }) {
    const isRejectedActive = activeStage === "rejected";

    return (
        <section aria-label="Alur proses anomali" className="mb-6">
            <ol className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6">
                {PIPELINE.map((stageKey, index) => (
                    <StageCard
                        key={stageKey}
                        stageKey={stageKey}
                        index={index}
                        count={counts[stageKey]}
                        overdue={stageKey === "scheduled" ? counts.overdue : 0}
                        isActive={activeStage === stageKey}
                        onSelect={onSelect}
                    />
                ))}
            </ol>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <button
                    type="button"
                    onClick={() => onSelect(isRejectedActive ? null : "rejected")}
                    aria-pressed={isRejectedActive}
                    className={`rounded-full px-3 py-1 font-semibold ring-1 ring-inset transition ${
                        isRejectedActive
                            ? "bg-ink-900 text-white ring-ink-900"
                            : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"
                    }`}
                >
                    Ditolak · {counts.rejected}
                </button>
                {activeStage ? (
                    <button
                        type="button"
                        onClick={() => onSelect(null)}
                        className="font-semibold text-brand-700 underline-offset-4 hover:underline"
                    >
                        Tampilkan semua tahap
                    </button>
                ) : (
                    <span>Klik sebuah tahap untuk menyaring daftar.</span>
                )}
            </div>
        </section>
    );
}
