import { Link } from "@inertiajs/react";
import { FaArrowRight, FaCheck, FaTasks } from "react-icons/fa";
import { Card } from "@/Components/Dashboard/ui";
import StageBadge from "@/Components/Anomali/StageBadge";
import {
    nextAction,
    scheduleProgress,
    waitingDays,
} from "@/Components/Anomali/anomaliWorkflow";

const MAX_ROWS = 5;

function waitingText(anomali, today) {
    const progress = scheduleProgress(anomali, today);
    if (progress) {
        const { kind, days } = progress;
        if (kind === "upcoming") {
            return days === 1 ? "Mulai besok" : `Mulai ${days} hari lagi`;
        }
        if (kind === "ongoing") {
            return days === 0 ? "Selesai hari ini" : `Selesai ${days} hari lagi`;
        }
        return `Lewat ${days} hari dari jadwal`;
    }
    const days = waitingDays(anomali, today);
    if (days === null) return null;
    return days === 0 ? "Masuk hari ini" : `${days} hari menunggu`;
}

function QueueRow({ anomali, user, today }) {
    const action = nextAction(anomali, user);
    const meta = waitingText(anomali, today);

    return (
        <li className="flex items-start justify-between gap-3 px-5 py-3.5 sm:px-6">
            <div className="min-w-0">
                <Link
                    href={route("dashboard.anomali.show", anomali.slug)}
                    className="line-clamp-2 text-sm font-semibold text-ink-900 hover:text-brand-700"
                >
                    {anomali.judul}
                </Link>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <StageBadge anomali={anomali} today={today} />
                    {meta ? (
                        <span className="text-xs text-slate-500">{meta}</span>
                    ) : null}
                </div>
            </div>
            <Link
                href={route(action.routeName, anomali.slug)}
                className="btn-primary btn-sm shrink-0"
            >
                {action.label}
            </Link>
        </li>
    );
}

/** Antrian anomali yang menunggu tindakan pengguna yang sedang login. */
export default function MyQueueCard({ queue, user, today, className }) {
    const rows = queue.slice(0, MAX_ROWS);
    const rest = queue.length - rows.length;

    return (
        <Card
            title="Perlu tindakan saya"
            description={
                queue.length > 0
                    ? `${queue.length} anomali menunggu tindakan Anda`
                    : "Antrian tindakan Anda"
            }
            icon={FaTasks}
            padded={false}
            clip={false}
            className={className}
            footer={
                <Link
                    href={route("dashboard.anomali.index")}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
                >
                    Lihat semua di halaman Anomali
                    {rest > 0 ? ` (+${rest})` : ""}
                    <FaArrowRight className="h-3 w-3" aria-hidden="true" />
                </Link>
            }
        >
            {rows.length > 0 ? (
                <ul className="divide-y divide-slate-100">
                    {rows.map((anomali) => (
                        <QueueRow
                            key={anomali.id ?? anomali.slug}
                            anomali={anomali}
                            user={user}
                            today={today}
                        />
                    ))}
                </ul>
            ) : (
                <div className="flex flex-col items-center px-6 py-12 text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                        <FaCheck className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <p className="mt-4 text-sm font-semibold text-ink-900">
                        Tidak ada yang menunggu tindakan Anda
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                        Anomali baru yang perlu Anda tangani akan muncul di
                        sini.
                    </p>
                </div>
            )}
        </Card>
    );
}
