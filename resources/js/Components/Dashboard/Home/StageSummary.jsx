import { Link } from "@inertiajs/react";
import { PIPELINE, STAGES } from "@/Components/Anomali/anomaliWorkflow";
import { TONE_CLASSES } from "@/Components/Anomali/StageBadge";

/** Empat kartu tahap proses anomali; setiap kartu membuka halaman Anomali. */
export default function StageSummary({ counts }) {
    return (
        <section aria-label="Ringkasan alur proses anomali" className="mb-6">
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {PIPELINE.map((key) => {
                    const stage = STAGES[key];
                    const tone = TONE_CLASSES[stage.tone];
                    const overdue = key === "scheduled" ? counts.overdue : 0;
                    return (
                        <li key={key}>
                            <Link
                                href={route("dashboard.anomali.index")}
                                title={stage.hint}
                                className="group flex h-full flex-col justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lift focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                            >
                                <span className="flex items-center justify-between gap-2">
                                    <span className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                                        <span
                                            aria-hidden="true"
                                            className={`h-2 w-2 rounded-full ${tone.dot}`}
                                        />
                                        {stage.label}
                                    </span>
                                    {overdue > 0 ? (
                                        <span className="whitespace-nowrap rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 ring-1 ring-inset ring-rose-200">
                                            {overdue} lewat jadwal
                                        </span>
                                    ) : null}
                                </span>
                                <span>
                                    <span className="block font-display text-3xl font-extrabold tabular-nums text-ink-900">
                                        {counts[key]}
                                    </span>
                                    <span className="mt-1 block text-xs text-slate-500">
                                        {stage.hint}
                                    </span>
                                </span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
