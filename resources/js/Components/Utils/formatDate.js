// utils/formatDate.js
import { format } from "date-fns";
import { id } from "date-fns/locale";

/**
 * Format tanggal dalam format lokal Indonesia.
 * @param {string|Date} date - Tanggal dalam bentuk string ISO atau objek Date.
 * @param {string} formatStr - Format output (default: 'dd MMMM yyyy').
 * @returns {string} - Tanggal dalam format Indonesia atau '-' jika invalid.
 */
export function formatDate(date, formatStr = "EEEE, dd MMMM yyyy") {
    if (!date) return "-";

    try {
        if (typeof date === "string") {
            const parsedDateOnly = parseDateOnly(date);
            if (parsedDateOnly) {
                return format(parsedDateOnly, formatStr, { locale: id });
            }
        }
        return format(new Date(date), formatStr, { locale: id });
    } catch (error) {
        return "-";
    }
}

export function parseDateOnly(value) {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value !== "string") return null;
    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    const year = Number(m[1]);
    const month = Number(m[2]);
    const day = Number(m[3]);
    if (!year || month < 1 || month > 12 || day < 1 || day > 31) return null;
    const dt = new Date(year, month - 1, day);
    if (
        dt.getFullYear() !== year ||
        dt.getMonth() !== month - 1 ||
        dt.getDate() !== day
    ) {
        return null;
    }
    return dt;
}

export function formatDateDMY(date) {
    if (!date) return "-";
    try {
        const parsedDateOnly =
            typeof date === "string" ? parseDateOnly(date) : null;
        const dt = parsedDateOnly || new Date(date);
        if (Number.isNaN(dt.getTime())) return "-";
        return format(dt, "EEEE, d MMMM yyyy", { locale: id });
    } catch {
        return "-";
    }
}

export function formatMaybeDateRange(value) {
    if (!value) return "-";
    if (typeof value !== "string") return String(value);
    const trimmed = value.trim();

    const rangeMatch = trimmed.match(
        /^(\d{4}-\d{2}-\d{2})\s*-\s*(\d{4}-\d{2}-\d{2})$/,
    );
    if (rangeMatch) {
        const from = parseDateOnly(rangeMatch[1]);
        const to = parseDateOnly(rangeMatch[2]);
        if (!from || !to) return "Tanggal tidak valid";
        return `${format(from, "EEEE, d MMMM yyyy", { locale: id })} - ${format(
            to,
            "EEEE, d MMMM yyyy",
            { locale: id },
        )}`;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        return formatDateDMY(trimmed);
    }

    return trimmed;
}
