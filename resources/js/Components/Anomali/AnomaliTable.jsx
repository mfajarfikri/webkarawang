import { Link } from "@inertiajs/react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
    FaArrowRight,
    FaChevronLeft,
    FaChevronRight,
    FaRegCalendarAlt,
} from "react-icons/fa";
import StageBadge from "./StageBadge";
import {
    isOverdue,
    nextAction,
    scheduleProgress,
    secondaryActions,
    waitingDays,
} from "./anomaliWorkflow";

const STALE_AFTER_DAYS = 14;

const TIPE_CLASSES = {
    major: "bg-rose-50 text-rose-700 ring-rose-200",
    minor: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

function formatDay(value, pattern = "d MMM yyyy") {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return format(date, pattern, { locale: localeId });
}

function TipeBadge({ tipe }) {
    if (!tipe) return <span className="text-slate-400">—</span>;
    const cls =
        TIPE_CLASSES[tipe.toLowerCase()] ??
        "bg-slate-100 text-slate-700 ring-slate-200";
    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${cls}`}
        >
            {tipe}
        </span>
    );
}

function scheduleText({ kind, days }) {
    if (kind === "upcoming") {
        return days === 1 ? "Mulai besok" : `Mulai ${days} hari lagi`;
    }
    if (kind === "ongoing") {
        return days === 0
            ? "Dikerjakan · selesai hari ini"
            : `Dikerjakan · ${days} hari lagi`;
    }
    return `Lewat ${days} hari dari jadwal`;
}

function Waiting({ anomali, today }) {
    const progress = scheduleProgress(anomali, today);
    if (progress) {
        return (
            <span
                className={`mt-1 block text-[11px] ${
                    progress.kind === "overdue"
                        ? "font-semibold text-rose-600"
                        : "text-slate-500"
                }`}
            >
                {scheduleText(progress)}
            </span>
        );
    }

    const days = waitingDays(anomali, today);
    if (days === null) return null;
    const isStale = days >= STALE_AFTER_DAYS;
    return (
        <span
            className={`mt-1 block text-[11px] ${
                isStale ? "font-semibold text-rose-600" : "text-slate-500"
            }`}
        >
            {days === 0 ? "Sejak hari ini" : `${days} hari di tahap ini`}
        </span>
    );
}

function AssignedTo({ anomali }) {
    if (!anomali.bidang_assigned) return null;
    return (
        <span className="mt-1 block text-[11px] text-slate-600">
            Ditugaskan ke{" "}
            <span className="font-semibold text-ink-900">
                {anomali.bidang_assigned}
            </span>
        </span>
    );
}

function Schedule({ anomali, today }) {
    const start = formatDay(anomali.tanggal_mulai, "d MMM");
    const end = formatDay(anomali.tanggal_selesai);
    if (!start) {
        return <span className="text-slate-400">Belum dijadwalkan</span>;
    }
    return (
        <span
            className={`inline-flex items-center gap-1.5 whitespace-nowrap ${
                isOverdue(anomali, today)
                    ? "font-semibold text-rose-700"
                    : "text-slate-700"
            }`}
        >
            <FaRegCalendarAlt className="h-3 w-3 shrink-0 opacity-60" />
            {start}
            {end ? ` – ${end}` : ""}
        </span>
    );
}

function RowAction({ anomali, user }) {
    const action = nextAction(anomali, user);
    const detailHref = route("dashboard.anomali.show", anomali.slug);

    if (!action.isMine) {
        return (
            <Link
                href={detailHref}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-ink-900"
            >
                Detail
                <FaChevronRight className="h-2.5 w-2.5" />
            </Link>
        );
    }

    const extras = secondaryActions(anomali, user);

    return (
        <span className="inline-flex flex-col items-end gap-1">
            <span className="inline-flex items-center gap-1">
                <Link
                    href={route(action.routeName, anomali.slug)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-3.5 py-1.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700"
                >
                    {action.label}
                    <FaArrowRight className="h-2.5 w-2.5" />
                </Link>
                <Link
                    href={detailHref}
                    className="rounded-full px-2.5 py-1.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-ink-900"
                >
                    Detail
                </Link>
            </span>
            {extras.map((extra) => (
                <Link
                    key={extra.kind}
                    href={route(extra.routeName, anomali.slug)}
                    className="px-2 text-xs font-semibold text-brand-700 underline-offset-4 hover:underline"
                >
                    {extra.kind === "close"
                        ? "Tutup tanpa jadwal"
                        : extra.label}
                </Link>
            ))}
        </span>
    );
}

function TitleCell({ anomali }) {
    const meta = [anomali.gardu_induk?.name, anomali.bay, anomali.peralatan]
        .filter(Boolean)
        .join(" · ");
    return (
        <div className="min-w-0">
            <Link
                href={route("dashboard.anomali.show", anomali.slug)}
                className="line-clamp-1 font-semibold text-ink-900 hover:text-brand-700"
            >
                {anomali.judul}
            </Link>
            <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                {meta || "—"}
            </p>
        </div>
    );
}

function Pagination({ page, rowsPerPage, totalRows, onPageChange }) {
    const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
    const first = totalRows === 0 ? 0 : (page - 1) * rowsPerPage + 1;
    const last = Math.min(page * rowsPerPage, totalRows);

    return (
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-500 sm:px-6">
            <span>
                <span className="font-semibold text-ink-900">
                    {first}–{last}
                </span>{" "}
                dari {totalRows}
            </span>
            <span className="flex items-center gap-1">
                <button
                    type="button"
                    onClick={() => onPageChange(page - 1)}
                    disabled={page <= 1}
                    aria-label="Halaman sebelumnya"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <FaChevronLeft className="h-3 w-3" />
                </button>
                <span className="px-2 tabular-nums">
                    {page} / {totalPages}
                </span>
                <button
                    type="button"
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= totalPages}
                    aria-label="Halaman berikutnya"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <FaChevronRight className="h-3 w-3" />
                </button>
            </span>
        </div>
    );
}

/**
 * Daftar anomali tunggal untuk semua tampilan. Setiap baris menampilkan
 * tahap proses dan satu aksi berikutnya yang relevan bagi pengguna.
 */
export default function AnomaliTable({
    rows,
    user,
    today,
    page,
    rowsPerPage,
    totalRows,
    onPageChange,
    emptyState,
}) {
    if (totalRows === 0) {
        return (
            <div className="surface flex flex-col items-center px-6 py-14 text-center">
                {emptyState}
            </div>
        );
    }

    return (
        <div className="surface overflow-hidden">
            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[900px] text-sm">
                    <thead>
                        <tr className="border-b border-slate-100 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                            <th className="px-6 py-3">Anomali</th>
                            <th className="px-4 py-3">Lokasi</th>
                            <th className="px-4 py-3">Tipe</th>
                            <th className="px-4 py-3">Tahap</th>
                            <th className="px-4 py-3">Jadwal</th>
                            <th className="px-6 py-3 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {rows.map((anomali) => (
                            <tr
                                key={anomali.id}
                                className="align-top transition-colors hover:bg-slate-50/70"
                            >
                                <td className="max-w-[22rem] px-6 py-4">
                                    <TitleCell anomali={anomali} />
                                    <p className="mt-1 text-[11px] text-slate-400">
                                        Kejadian{" "}
                                        {formatDay(anomali.tanggal_kejadian) ??
                                            "—"}
                                    </p>
                                </td>
                                <td className="px-4 py-4">
                                    <span className="block whitespace-nowrap text-slate-700">
                                        {anomali.ultg || "—"}
                                    </span>
                                    {anomali.bagian ? (
                                        <span className="text-xs text-slate-500">
                                            Pelapor: {anomali.bagian}
                                        </span>
                                    ) : null}
                                </td>
                                <td className="px-4 py-4">
                                    <TipeBadge tipe={anomali.tipe} />
                                </td>
                                <td className="px-4 py-4">
                                    <StageBadge
                                        anomali={anomali}
                                        today={today}
                                    />
                                    <AssignedTo anomali={anomali} />
                                    <Waiting anomali={anomali} today={today} />
                                </td>
                                <td className="px-4 py-4">
                                    <Schedule anomali={anomali} today={today} />
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-right">
                                    <RowAction anomali={anomali} user={user} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile */}
            <ul className="divide-y divide-slate-100 md:hidden">
                {rows.map((anomali) => (
                    <li key={anomali.id} className="space-y-3 p-4">
                        <div className="flex items-start justify-between gap-3">
                            <TitleCell anomali={anomali} />
                            <TipeBadge tipe={anomali.tipe} />
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                            <StageBadge anomali={anomali} today={today} />
                            <span className="text-slate-500">
                                {anomali.ultg}
                                {anomali.bidang_assigned
                                    ? ` · ${anomali.bidang_assigned}`
                                    : ""}
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-3 text-xs">
                            <Schedule anomali={anomali} today={today} />
                            <RowAction anomali={anomali} user={user} />
                        </div>
                    </li>
                ))}
            </ul>

            <Pagination
                page={page}
                rowsPerPage={rowsPerPage}
                totalRows={totalRows}
                onPageChange={onPageChange}
            />
        </div>
    );
}
