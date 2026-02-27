import {
    formatDateDMY,
    formatMaybeDateRange,
    parseDateOnly,
} from "../formatDate";

describe("formatDate utils", () => {
    it("parseDateOnly menerima tanggal valid dan menolak invalid", () => {
        expect(parseDateOnly("2024-02-29")).toBeInstanceOf(Date);
        expect(parseDateOnly("2023-02-29")).toBe(null);
        expect(parseDateOnly("2026-13-01")).toBe(null);
    });

    it("formatDateDMY konsisten dd/MM/yyyy", () => {
        expect(formatDateDMY("2026-02-10")).toBe("10/02/2026");
    });

    it("formatMaybeDateRange memformat range YYYY-MM-DD - YYYY-MM-DD", () => {
        expect(formatMaybeDateRange("2026-02-10 - 2026-02-20")).toBe(
            "10/02/2026 - 20/02/2026",
        );
    });

    it("formatMaybeDateRange menangani string kosong atau format tidak dikenal", () => {
        expect(formatMaybeDateRange("")).toBe("-");
        expect(formatMaybeDateRange("abc")).toBe("abc");
    });
});

