import {
    endOfDay,
    format,
    isSameDay,
    isSameYear,
    startOfDay,
    startOfMonth,
    startOfYear,
    subDays,
    subMonths,
    endOfMonth,
} from "date-fns";
import { id } from "date-fns/locale";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Date lokal → "yyyy-MM-dd" (format nilai filter). */
export function toISODate(date) {
    return date ? format(date, "yyyy-MM-dd") : "";
}

/** "yyyy-MM-dd" → Date lokal tengah malam; undefined bila kosong/tidak valid. */
export function fromISODate(value) {
    if (!value || !ISO_DATE.test(value)) return undefined;
    const [y, m, d] = value.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return Number.isNaN(date.getTime()) ? undefined : date;
}

/**
 * Apakah `value` (tanggal kejadian) masuk rentang [start, end], inklusif
 * sampai akhir hari `end`. Batas yang kosong berarti tidak dibatasi.
 */
export function isWithinRange(value, startDate, endDate) {
    if (!startDate && !endDate) return true;
    if (!value) return false;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return false;
    const start = fromISODate(startDate);
    const end = fromISODate(endDate);
    if (start && date < startOfDay(start)) return false;
    if (end && date > endOfDay(end)) return false;
    return true;
}

/** Pilihan cepat rentang tanggal, dihitung relatif terhadap `today`. */
export function datePresets(today = new Date()) {
    const lastMonth = subMonths(today, 1);
    return [
        { id: "7d", label: "7 hari terakhir", from: subDays(today, 6), to: today },
        { id: "30d", label: "30 hari terakhir", from: subDays(today, 29), to: today },
        { id: "month", label: "Bulan ini", from: startOfMonth(today), to: today },
        {
            id: "last-month",
            label: "Bulan lalu",
            from: startOfMonth(lastMonth),
            to: endOfMonth(lastMonth),
        },
        { id: "year", label: "Tahun ini", from: startOfYear(today), to: today },
    ];
}

/** Id preset yang persis sama dengan rentang terpilih, atau null. */
export function matchPreset(startDate, endDate, today = new Date()) {
    const start = fromISODate(startDate);
    const end = fromISODate(endDate);
    if (!start || !end) return null;
    const hit = datePresets(today).find(
        (p) => isSameDay(p.from, start) && isSameDay(p.to, end),
    );
    return hit ? hit.id : null;
}

function short(date, withYear) {
    return format(date, withYear ? "d MMM yyyy" : "d MMM", { locale: id });
}

/** Label ringkas rentang, mis. "1 – 20 Nov 2026" atau "Semua tanggal". */
export function formatRangeLabel(startDate, endDate) {
    const start = fromISODate(startDate);
    const end = fromISODate(endDate);
    if (!start && !end) return "Semua tanggal";
    if (start && !end) return `Sejak ${short(start, true)}`;
    if (!start && end) return `Sampai ${short(end, true)}`;
    if (isSameDay(start, end)) return short(start, true);
    if (isSameYear(start, end)) {
        const sameMonth = start.getMonth() === end.getMonth();
        const head = sameMonth ? format(start, "d") : short(start, false);
        return `${head} – ${short(end, true)}`;
    }
    return `${short(start, true)} – ${short(end, true)}`;
}
