import { useEffect, useId, useState } from "react";
import {
    Popover,
    PopoverBackdrop,
    PopoverButton,
    PopoverPanel,
} from "@headlessui/react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { isSameMonth, subMonths } from "date-fns";
import { id } from "date-fns/locale";
import { FaCalendarAlt, FaChevronDown, FaTimes } from "react-icons/fa";
import {
    datePresets,
    formatRangeLabel,
    fromISODate,
    matchPreset,
    toISODate,
} from "./dateRange";

const TWO_MONTHS_QUERY = "(min-width: 768px)";

// react-day-picker v9 membaca variabel ini dari elemen root DayPicker.
const DAY_PICKER_THEME = {
    "--rdp-accent-color": "#0086c9",
    "--rdp-accent-background-color": "#e0f2fe",
    "--rdp-today-color": "#0086c9",
    "--rdp-range_middle-background-color": "#e0f2fe",
    "--rdp-range_middle-color": "#075985",
    "--rdp-day-height": "2rem",
    "--rdp-day-width": "2.125rem",
    "--rdp-day_button-height": "1.875rem",
    "--rdp-day_button-width": "1.875rem",
    "--rdp-nav-height": "2rem",
};

function useMediaQuery(query) {
    const get = () =>
        typeof window !== "undefined" && typeof window.matchMedia === "function"
            ? window.matchMedia(query).matches
            : false;
    const [matches, setMatches] = useState(get);
    useEffect(() => {
        if (typeof window.matchMedia !== "function") return undefined;
        const mql = window.matchMedia(query);
        const onChange = () => setMatches(mql.matches);
        mql.addEventListener?.("change", onChange);
        return () => mql.removeEventListener?.("change", onChange);
    }, [query]);
    return matches;
}

/**
 * Bulan pertama yang ditampilkan. Dengan dua bulan, bulan berjalan (atau bulan
 * akhir rentang) diletakkan di kanan supaya tidak ada bulan masa depan yang kosong.
 */
function firstVisibleMonth(draft, today, isWide) {
    if (!isWide) return draft?.from ?? today;
    const end = draft?.to ?? draft?.from ?? today;
    const spansMonths = draft?.from && !isSameMonth(draft.from, end);
    return spansMonths ? draft.from : subMonths(end, 1);
}

function toRange(startDate, endDate) {
    const from = fromISODate(startDate);
    const to = fromISODate(endDate);
    return from || to ? { from, to } : undefined;
}

function PresetList({ today, activeId, onPick }) {
    return (
        <ul
            aria-label="Pilihan cepat"
            className="flex gap-1.5 overflow-x-auto pb-1 md:flex-col md:gap-0.5 md:overflow-visible md:pb-0"
        >
            {datePresets(today).map((preset) => {
                const isActive = preset.id === activeId;
                return (
                    <li key={preset.id} className="shrink-0">
                        <button
                            type="button"
                            onClick={() => onPick(preset)}
                            aria-pressed={isActive}
                            className={`w-full whitespace-nowrap rounded-lg px-3 py-2 text-left text-xs font-semibold transition md:text-sm ${
                                isActive
                                    ? "bg-brand-50 text-brand-800 ring-1 ring-brand-200"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-ink-900"
                            }`}
                        >
                            {preset.label}
                        </button>
                    </li>
                );
            })}
        </ul>
    );
}

function RangePanel({ startDate, endDate, today, isWide, onApply, close }) {
    const [draft, setDraft] = useState(() => toRange(startDate, endDate));
    const draftStart = toISODate(draft?.from);
    const draftEnd = toISODate(draft?.to ?? draft?.from);
    const activePreset = matchPreset(draftStart, draftEnd, today);
    const hasDraft = Boolean(draft?.from);

    const apply = (from, to) => {
        onApply({ startDate: toISODate(from), endDate: toISODate(to ?? from) });
        close();
    };

    return (
        <div className="flex flex-col gap-3 md:flex-row md:gap-4">
            <div className="md:w-40 md:shrink-0 md:border-r md:border-slate-100 md:pr-3">
                <p className="mb-1.5 hidden px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 md:block">
                    Pilihan cepat
                </p>
                <PresetList
                    today={today}
                    activeId={activePreset}
                    onPick={(preset) => apply(preset.from, preset.to)}
                />
            </div>

            <div className="min-w-0">
                <DayPicker
                    mode="range"
                    locale={id}
                    numberOfMonths={isWide ? 2 : 1}
                    defaultMonth={firstVisibleMonth(draft, today, isWide)}
                    endMonth={today}
                    selected={draft}
                    onSelect={setDraft}
                    disabled={{ after: today }}
                    style={DAY_PICKER_THEME}
                    className="text-sm"
                />

                <div className="mt-2 flex flex-col gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-slate-500" aria-live="polite">
                        {hasDraft ? (
                            <>
                                Dipilih:{" "}
                                <span className="font-semibold text-ink-900">
                                    {formatRangeLabel(draftStart, draftEnd)}
                                </span>
                            </>
                        ) : (
                            "Klik tanggal awal, lalu tanggal akhir."
                        )}
                    </p>
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                            type="button"
                            className="btn-ghost btn-sm"
                            onClick={() => {
                                onApply({ startDate: "", endDate: "" });
                                close();
                            }}
                        >
                            Semua tanggal
                        </button>
                        <button
                            type="button"
                            className="btn-brand btn-sm"
                            disabled={!hasDraft}
                            onClick={() => apply(draft.from, draft.to)}
                        >
                            Terapkan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Pemilih rentang tanggal untuk filter: pilihan cepat + kalender rentang.
 * Nilai keluar/masuk berupa string "yyyy-MM-dd" (kosong = tidak dibatasi).
 */
export default function DateRangeField({
    label = "Periode",
    startDate,
    endDate,
    today = new Date(),
    onChange,
}) {
    const labelId = useId();
    const isWide = useMediaQuery(TWO_MONTHS_QUERY);
    const hasRange = Boolean(startDate || endDate);
    const summary = formatRangeLabel(startDate, endDate);

    return (
        <div className="min-w-0">
            <span id={labelId} className="field-label">
                {label}
            </span>
            <Popover className="relative">
                {({ open, close: closePopover }) => (
                    <>
                        <div className="relative">
                            <PopoverButton
                                aria-labelledby={labelId}
                                aria-describedby={`${labelId}-value`}
                                className={`field-input flex items-center gap-2.5 text-left ${
                                    hasRange ? "pr-16" : "pr-10"
                                } ${open ? "border-brand-500 ring-2 ring-brand-500/20" : ""}`}
                            >
                                <FaCalendarAlt
                                    className={`h-3.5 w-3.5 shrink-0 ${
                                        hasRange ? "text-brand-600" : "text-slate-400"
                                    }`}
                                    aria-hidden="true"
                                />
                                <span
                                    id={`${labelId}-value`}
                                    className={`block truncate ${
                                        hasRange ? "font-semibold text-ink-900" : "text-slate-500"
                                    }`}
                                >
                                    {summary}
                                </span>
                                <FaChevronDown
                                    className={`pointer-events-none absolute right-3 h-3 w-3 text-slate-400 transition-transform ${
                                        open ? "rotate-180" : ""
                                    }`}
                                    aria-hidden="true"
                                />
                            </PopoverButton>
                            {hasRange ? (
                                <button
                                    type="button"
                                    onClick={() => onChange({ startDate: "", endDate: "" })}
                                    className="absolute right-8 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                                    aria-label="Hapus filter periode"
                                >
                                    <FaTimes className="h-3 w-3" aria-hidden="true" />
                                </button>
                            ) : null}
                        </div>

                        {isWide ? null : (
                            <PopoverBackdrop
                                transition
                                onClick={() => closePopover()}
                                className="fixed inset-0 z-40 bg-ink-950/40 backdrop-blur-[1px] transition duration-150 data-[closed]:opacity-0"
                            />
                        )}
                        <PopoverPanel
                            // Desktop: melayang di bawah tombol. Ponsel: bottom sheet
                            // supaya kalender dan tombol Terapkan selalu terlihat utuh.
                            anchor={
                                isWide
                                    ? { to: "bottom start", gap: 8, padding: 16 }
                                    : undefined
                            }
                            portal
                            transition
                            className={
                                isWide
                                    ? "z-50 w-max max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white p-4 shadow-lift transition duration-150 ease-out data-[closed]:translate-y-1 data-[closed]:opacity-0"
                                    : "fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-slate-200 bg-white px-4 pb-6 pt-3 shadow-lift transition duration-200 ease-out data-[closed]:translate-y-full"
                            }
                        >
                            {({ close }) => (
                                <>
                                    {isWide ? null : (
                                        <div className="mb-3">
                                            <span
                                                className="mx-auto block h-1.5 w-10 rounded-full bg-slate-200"
                                                aria-hidden="true"
                                            />
                                            <div className="mt-3 flex items-center justify-between">
                                                <span className="text-base font-bold text-ink-900">
                                                    {label}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => close()}
                                                    className="btn-icon"
                                                    aria-label="Tutup"
                                                >
                                                    <FaTimes
                                                        className="h-3.5 w-3.5"
                                                        aria-hidden="true"
                                                    />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    <RangePanel
                                        startDate={startDate}
                                        endDate={endDate}
                                        today={today}
                                        isWide={isWide}
                                        onApply={onChange}
                                        close={close}
                                    />
                                </>
                            )}
                        </PopoverPanel>
                    </>
                )}
            </Popover>
        </div>
    );
}
