import { STAGES, deriveStage, isOverdue } from "./anomaliWorkflow";

export const TONE_CLASSES = {
    amber: { pill: "bg-amber-50 text-amber-800 ring-amber-200", dot: "bg-amber-500" },
    brand: { pill: "bg-brand-50 text-brand-800 ring-brand-200", dot: "bg-brand-500" },
    violet: { pill: "bg-violet-50 text-violet-800 ring-violet-200", dot: "bg-violet-500" },
    emerald: { pill: "bg-emerald-50 text-emerald-800 ring-emerald-200", dot: "bg-emerald-500" },
    slate: { pill: "bg-slate-100 text-slate-700 ring-slate-200", dot: "bg-slate-400" },
    rose: { pill: "bg-rose-50 text-rose-700 ring-rose-200", dot: "bg-rose-500" },
};

/** Label tahap proses sebuah anomali; berubah merah bila lewat jadwal. */
export default function StageBadge({ anomali, today }) {
    const overdue = isOverdue(anomali, today);
    const stage = STAGES[deriveStage(anomali)];
    const tone = TONE_CLASSES[overdue ? "rose" : stage.tone];
    const label = overdue ? "Lewat jadwal" : stage.label;

    return (
        <span
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${tone.pill}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
            {label}
        </span>
    );
}
