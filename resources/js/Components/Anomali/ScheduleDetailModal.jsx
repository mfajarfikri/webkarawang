import { Link } from "@inertiajs/react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { FaArrowRight, FaTimes } from "react-icons/fa";
import Modal from "@/Components/Modal";
import StageBadge from "./StageBadge";
import { nextAction, scheduleProgress } from "./anomaliWorkflow";

function formatDay(value) {
    if (!value) return null;
    const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
    return Number.isNaN(date.getTime())
        ? null
        : format(date, "d MMM yyyy", { locale: localeId });
}

function progressLabel(anomali, today) {
    const progress = scheduleProgress(anomali, today);
    if (!progress) return null;
    if (progress.kind === "overdue") {
        return {
            text: `Lewat ${progress.days} hari dari jadwal`,
            tone: "text-rose-700",
        };
    }
    if (progress.kind === "upcoming") {
        return {
            text:
                progress.days === 1
                    ? "Mulai besok"
                    : `Mulai ${progress.days} hari lagi`,
            tone: "text-slate-600",
        };
    }
    return {
        text:
            progress.days === 0
                ? "Sedang dikerjakan · selesai hari ini"
                : `Sedang dikerjakan · ${progress.days} hari lagi`,
        tone: "text-slate-600",
    };
}

function Fact({ label, children }) {
    return (
        <div>
            <dt className="text-xs font-medium text-slate-500">{label}</dt>
            <dd className="mt-0.5 text-sm font-semibold text-ink-900">
                {children || "-"}
            </dd>
        </div>
    );
}

/** Ringkasan satu jadwal anomali dari kalender, dengan aksi berikutnya. */
export default function ScheduleDetailModal({ anomali, user, today, onClose }) {
    if (!anomali) return null;

    const action = nextAction(anomali, user);
    const progress = progressLabel(anomali, today);
    const start = formatDay(anomali.tanggal_mulai);
    const end = formatDay(anomali.tanggal_selesai);
    const location = [anomali.gardu_induk?.name, anomali.ultg]
        .filter(Boolean)
        .join(" · ");
    const range = start
        ? `${start}${end && end !== start ? ` – ${end}` : ""}`
        : "Belum dijadwalkan";

    return (
        <Modal show onClose={onClose} maxWidth="lg">
            <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                    <StageBadge anomali={anomali} today={today} />
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-icon -mr-2 -mt-2"
                        aria-label="Tutup"
                    >
                        <FaTimes className="h-3.5 w-3.5" />
                    </button>
                </div>

                <h3 className="mt-3 text-lg font-bold text-ink-900">
                    {anomali.judul}
                </h3>
                {location ? (
                    <p className="mt-0.5 text-sm text-slate-500">{location}</p>
                ) : null}

                <div className="mt-5 rounded-xl border border-slate-200/80 bg-slate-50/60 p-4">
                    <p className="text-xs font-medium text-slate-500">
                        Jadwal pekerjaan
                    </p>
                    <p className="mt-0.5 text-base font-bold text-ink-900">
                        {range}
                    </p>
                    {progress ? (
                        <p
                            className={`mt-0.5 text-xs font-semibold ${progress.tone}`}
                        >
                            {progress.text}
                        </p>
                    ) : null}
                </div>

                <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4">
                    <Fact label="Ditugaskan ke">{anomali.bidang_assigned}</Fact>
                    <Fact label="Tipe">{anomali.tipe}</Fact>
                    <Fact label="Kategori">{anomali.kategori?.name}</Fact>
                    <Fact label="Pelapor">{anomali.user?.name}</Fact>
                </dl>

                {anomali.penyebab ? (
                    <div className="mt-5">
                        <p className="text-xs font-medium text-slate-500">
                            Penyebab
                        </p>
                        <p className="mt-0.5 line-clamp-3 text-sm text-slate-700">
                            {anomali.penyebab}
                        </p>
                    </div>
                ) : null}
            </div>

            <div className="flex flex-col-reverse gap-2 rounded-b-2xl border-t border-slate-100 bg-slate-50/60 px-6 py-4 sm:flex-row sm:justify-end">
                <Link
                    href={route("dashboard.anomali.show", anomali.slug)}
                    className="btn-ghost"
                >
                    Lihat detail
                </Link>
                {action.isMine ? (
                    <Link
                        href={route(action.routeName, anomali.slug)}
                        className="btn-brand"
                    >
                        {action.label}
                        <FaArrowRight className="h-3 w-3" />
                    </Link>
                ) : null}
            </div>
        </Modal>
    );
}
