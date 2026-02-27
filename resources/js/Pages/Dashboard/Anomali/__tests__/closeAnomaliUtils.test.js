import {
    formatWorkDateDisplay,
    isValidWorkDate,
    validateCloseForm,
} from "../closeAnomaliUtils";

describe("closeAnomaliUtils", () => {
    it("validasi tanggal menolak format salah", () => {
        expect(isValidWorkDate("2026-2-1")).toBe(false);
        expect(isValidWorkDate("2026-02-35")).toBe(false);
    });

    it("validasi menolak tanggal masa depan", () => {
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const iso = tomorrow.toISOString().slice(0, 10);
        expect(isValidWorkDate(iso)).toBe(false);
    });

    it("format tanggal menghasilkan string lokal", () => {
        expect(formatWorkDateDisplay("2026-02-10")).toContain("2026");
    });

    it("validasi menolak non-pdf", () => {
        const fake = new File(["x"], "a.txt", { type: "text/plain" });
        const { valid, errors } = validateCloseForm({
            tanggalPekerjaan: "2026-02-10",
            lampiranPdf: fake,
        });
        expect(valid).toBe(false);
        expect(errors.lampiran_pdf).toMatch(/PDF/i);
    });
});

