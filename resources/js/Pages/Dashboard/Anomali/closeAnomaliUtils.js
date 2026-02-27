import { format, isAfter, isValid, parseISO } from "date-fns";
import { id } from "date-fns/locale";

export const MAX_PDF_BYTES_DEFAULT = 5 * 1024 * 1024;

export function formatBytes(bytes) {
    const units = ["B", "KB", "MB", "GB"];
    let val = bytes;
    let unitIndex = 0;
    while (val >= 1024 && unitIndex < units.length - 1) {
        val /= 1024;
        unitIndex += 1;
    }
    const precision = unitIndex <= 1 ? 0 : 2;
    return `${val.toFixed(precision)} ${units[unitIndex]}`;
}

export function isPdfFile(file) {
    if (!file) return false;
    const nameOk = (file.name || "").toLowerCase().endsWith(".pdf");
    const typeOk = (file.type || "").toLowerCase() === "application/pdf";
    return nameOk || typeOk;
}

export function isValidWorkDate(value) {
    if (!value) return false;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const parsed = parseISO(value);
    if (!isValid(parsed)) return false;
    const today = new Date();
    const todayDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
    );
    return !isAfter(parsed, todayDate);
}

export function formatWorkDateDisplay(value, locale = id) {
    if (!value) return "";
    try {
        const parsed = parseISO(value);
        if (!isValid(parsed)) return "";
        return format(parsed, "dd MMMM yyyy", { locale });
    } catch {
        return "";
    }
}

export function validateCloseForm({
    tanggalPekerjaan,
    lampiranPdf,
    maxPdfBytes = MAX_PDF_BYTES_DEFAULT,
}) {
    const errors = { tanggal_pekerjaan: "", lampiran_pdf: "" };

    if (!isValidWorkDate(tanggalPekerjaan)) {
        errors.tanggal_pekerjaan =
            "Tanggal pekerjaan wajib diisi, valid, dan tidak melebihi hari ini.";
    }

    if (!lampiranPdf) {
        errors.lampiran_pdf = "File PDF wajib diunggah.";
    } else if (!isPdfFile(lampiranPdf)) {
        errors.lampiran_pdf = "File harus berformat PDF.";
    } else if (lampiranPdf.size > maxPdfBytes) {
        errors.lampiran_pdf = `Ukuran file maksimal ${formatBytes(maxPdfBytes)}.`;
    }

    return {
        errors,
        valid: !errors.tanggal_pekerjaan && !errors.lampiran_pdf,
    };
}
