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
        return format(new Date(date), formatStr, { locale: id });
    } catch (error) {
        console.error("Format date error:", error);
        return "-";
    }
}
