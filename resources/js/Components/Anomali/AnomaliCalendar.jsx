import { useMemo, useRef, useState } from "react";
import { Link } from "@inertiajs/react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import idLocale from "@fullcalendar/core/locales/id";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import {
    deriveStage,
    isOverdue,
    nextAction,
    scheduleProgress,
    waitingDays,
} from "./anomaliWorkflow";

const UPCOMING_WINDOW_DAYS = 14;
const PANEL_LIMIT = 5;

const VIEWS = [
    { id: "dayGridMonth", label: "Bulan" },
    { id: "dayGridWeek", label: "Minggu" },
];

const LEGEND = [
    { tone: "violet", label: "Terjadwal" },
    { tone: "rose", label: "Lewat jadwal" },
    { tone: "emerald", label: "Selesai" },
];

const DOT = {
    violet: "bg-violet-500",
    rose: "bg-rose-500",
    emerald: "bg-emerald-500",
    brand: "bg-brand-500",
};

/** Tanggal akhir eksklusif untuk event sehari-penuh FullCalendar. */
function exclusiveEnd(value) {
    const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
    date.setDate(date.getDate() + 1);
    return date;
}

function eventTone(anomali, today) {
    if (isOverdue(anomali, today)) return "rose";
    return deriveStage(anomali) === "closed" ? "emerald" : "violet";
}

function PanelItemAction({ anomali, user }) {
    const action = nextAction(anomali, user);
    if (!action.isMine) {
        return (
            <Link
                href={route("dashboard.anomali.show", anomali.slug)}
                className="text-xs font-semibold text-slate-500 hover:text-ink-900"
            >
                Detail
            </Link>
        );
    }
    return (
        <Link
            href={route(action.routeName, anomali.slug)}
            className="rounded-full bg-ink-900 px-3 py-1 text-xs font-semibold text-white transition hover:bg-brand-700"
        >
            {action.label}
        </Link>
    );
}

function PanelSection({ title, tone, items, emptyText, describe, user }) {
    return (
        <section>
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                <span className={`h-2 w-2 rounded-full ${DOT[tone]}`} />
                {title}
                <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[11px] tabular-nums text-slate-600">
                    {items.length}
                </span>
            </h3>
            {items.length === 0 ? (
                <p className="mt-2 text-xs text-slate-400">{emptyText}</p>
            ) : (
                <ul className="mt-2 space-y-1.5">
                    {items.slice(0, PANEL_LIMIT).map((anomali) => (
                        <li
                            key={anomali.id}
                            className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2"
                        >
                            <div className="min-w-0">
                                <Link
                                    href={route(
                                        "dashboard.anomali.show",
                                        anomali.slug,
                                    )}
                                    className="block truncate text-sm font-semibold text-ink-900 hover:text-brand-700"
                                >
                                    {anomali.judul}
                                </Link>
                                <p className="truncate text-[11px] text-slate-500">
                                    {describe(anomali)}
                                </p>
                            </div>
                            <PanelItemAction anomali={anomali} user={user} />
                        </li>
                    ))}
                    {items.length > PANEL_LIMIT ? (
                        <li className="px-1 text-[11px] text-slate-500">
                            +{items.length - PANEL_LIMIT} lainnya di daftar
                            anomali
                        </li>
                    ) : null}
                </ul>
            )}
        </section>
    );
}

function progressText(anomali, today) {
    const progress = scheduleProgress(anomali, today);
    if (!progress) return "";
    if (progress.kind === "overdue") return `Lewat ${progress.days} hari`;
    if (progress.kind === "upcoming") {
        return progress.days === 1
            ? "Mulai besok"
            : `Mulai ${progress.days} hari lagi`;
    }
    return "Sedang dikerjakan";
}

/**
 * Kalender jadwal anomali dengan warna per tahap proses, plus panel tindak
 * lanjut (lewat jadwal, perlu dijadwalkan, akan dimulai).
 * `anomalis` sudah tersaring oleh pencarian, filter, dan tahap di halaman.
 */
export default function AnomaliCalendar({ anomalis, user, today, onEventClick }) {
    const calendarRef = useRef(null);
    const [view, setView] = useState("dayGridMonth");
    const [title, setTitle] = useState("");

    const groups = useMemo(() => {
        const scheduled = [];
        const overdue = [];
        const unscheduled = [];
        const upcoming = [];
        for (const a of anomalis) {
            const stage = deriveStage(a);
            if (stage === "assigned") unscheduled.push(a);
            if (
                a.tanggal_mulai &&
                (stage === "scheduled" || stage === "closed")
            ) {
                scheduled.push(a);
            }
            if (isOverdue(a, today)) overdue.push(a);
            const progress = scheduleProgress(a, today);
            if (
                progress &&
                progress.kind === "upcoming" &&
                progress.days <= UPCOMING_WINDOW_DAYS
            ) {
                upcoming.push(a);
            }
        }
        const byWaiting = (x, y) =>
            (waitingDays(y, today) ?? 0) - (waitingDays(x, today) ?? 0);
        const byStart = (x, y) =>
            String(x.tanggal_mulai).localeCompare(String(y.tanggal_mulai));
        return {
            scheduled,
            overdue: overdue.sort(byWaiting),
            unscheduled: unscheduled.sort(byWaiting),
            upcoming: upcoming.sort(byStart),
        };
    }, [anomalis, today]);

    const legendCounts = useMemo(() => {
        const counts = { violet: 0, rose: 0, emerald: 0 };
        groups.scheduled.forEach((a) => {
            counts[eventTone(a, today)] += 1;
        });
        return counts;
    }, [groups.scheduled, today]);

    const events = useMemo(
        () =>
            groups.scheduled.map((a) => ({
                id: String(a.id),
                title: a.judul,
                start: String(a.tanggal_mulai).slice(0, 10),
                end: exclusiveEnd(a.tanggal_selesai || a.tanggal_mulai),
                allDay: true,
                classNames: [`ev-${eventTone(a, today)}`],
                extendedProps: { anomali: a },
            })),
        [groups.scheduled, today],
    );

    const api = () => calendarRef.current?.getApi();
    const changeView = (next) => {
        setView(next);
        api()?.changeView(next);
    };

    return (
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
            <section className="surface anomali-calendar overflow-hidden">
                <header className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => api()?.today()}
                            className="btn-ghost btn-sm"
                        >
                            Hari ini
                        </button>
                        <button
                            type="button"
                            onClick={() => api()?.prev()}
                            className="btn-icon"
                            aria-label="Sebelumnya"
                        >
                            <FaChevronLeft className="h-3 w-3" />
                        </button>
                        <button
                            type="button"
                            onClick={() => api()?.next()}
                            className="btn-icon"
                            aria-label="Berikutnya"
                        >
                            <FaChevronRight className="h-3 w-3" />
                        </button>
                        <h2 className="ml-1 font-display text-lg font-bold capitalize text-ink-900">
                            {title}
                        </h2>
                    </div>
                    <div
                        role="group"
                        aria-label="Tampilan kalender"
                        className="inline-flex self-start rounded-full border border-slate-200 bg-white p-1 sm:self-auto"
                    >
                        {VIEWS.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                aria-pressed={view === item.id}
                                onClick={() => changeView(item.id)}
                                className={`rounded-full px-3.5 py-1 text-xs font-semibold transition ${
                                    view === item.id
                                        ? "bg-ink-900 text-white"
                                        : "text-slate-600 hover:bg-slate-100"
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </header>

                <div className="p-3 sm:p-4">
                    <FullCalendar
                        ref={calendarRef}
                        plugins={[dayGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        locale={idLocale}
                        firstDay={1}
                        headerToolbar={false}
                        height="auto"
                        fixedWeekCount={false}
                        dayMaxEvents={3}
                        events={events}
                        eventDisplay="block"
                        datesSet={(arg) => setTitle(arg.view.title)}
                        eventClick={(info) => {
                            info.jsEvent.preventDefault();
                            onEventClick?.(info.event.extendedProps.anomali);
                        }}
                    />
                </div>

                <footer className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-100 px-5 py-3 text-xs text-slate-600">
                    {LEGEND.map((item) => (
                        <span
                            key={item.tone}
                            className="inline-flex items-center gap-1.5"
                        >
                            <span
                                className={`h-2 w-2 rounded-full ${DOT[item.tone]}`}
                            />
                            {item.label}
                            <span className="font-semibold tabular-nums text-ink-900">
                                {legendCounts[item.tone]}
                            </span>
                        </span>
                    ))}
                    <span className="ml-auto text-slate-400">
                        Klik jadwal untuk melihat detail
                    </span>
                </footer>
            </section>

            <aside
                aria-label="Perlu ditindaklanjuti"
                className="surface space-y-5 p-4 xl:sticky xl:top-24"
            >
                <div>
                    <h2 className="text-base font-bold text-ink-900">
                        Perlu ditindaklanjuti
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                        Pekerjaan yang terlambat, belum dijadwalkan, atau segera
                        dimulai.
                    </p>
                </div>
                <PanelSection
                    title="Lewat jadwal"
                    tone="rose"
                    items={groups.overdue}
                    emptyText="Tidak ada pekerjaan yang terlambat."
                    describe={(a) => progressText(a, today)}
                    user={user}
                />
                <PanelSection
                    title="Perlu dijadwalkan"
                    tone="brand"
                    items={groups.unscheduled}
                    emptyText="Semua anomali yang disetujui sudah dijadwalkan."
                    describe={(a) =>
                        [
                            a.bidang_assigned
                                ? `Ditugaskan ke ${a.bidang_assigned}`
                                : null,
                            `${waitingDays(a, today) ?? 0} hari menunggu`,
                        ]
                            .filter(Boolean)
                            .join(" · ")
                    }
                    user={user}
                />
                <PanelSection
                    title={`Mulai ${UPCOMING_WINDOW_DAYS} hari ke depan`}
                    tone="violet"
                    items={groups.upcoming}
                    emptyText="Belum ada jadwal dalam dua minggu ke depan."
                    describe={(a) => progressText(a, today)}
                    user={user}
                />
            </aside>
        </div>
    );
}
