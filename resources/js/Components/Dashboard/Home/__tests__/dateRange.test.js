import {
    datePresets,
    formatRangeLabel,
    fromISODate,
    isWithinRange,
    matchPreset,
    toISODate,
} from "../dateRange";

const TODAY = new Date(2026, 10, 20, 15, 30); // 20 Nov 2026, 15:30 lokal

describe("toISODate / fromISODate", () => {
    it("round-trips a local date without timezone drift", () => {
        expect(toISODate(fromISODate("2026-11-01"))).toBe("2026-11-01");
        expect(toISODate(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
    });

    it("rejects empty and malformed values", () => {
        expect(fromISODate("")).toBeUndefined();
        expect(fromISODate("20-11-2026")).toBeUndefined();
        expect(toISODate(undefined)).toBe("");
    });
});

describe("isWithinRange", () => {
    it("keeps everything when no bound is set", () => {
        expect(isWithinRange("2020-01-01", "", "")).toBe(true);
    });

    it("includes events that happen later on the end date", () => {
        expect(
            isWithinRange("2026-11-20 16:45:00", "2026-11-01", "2026-11-20"),
        ).toBe(true);
    });

    it("excludes events outside the range", () => {
        expect(isWithinRange("2026-10-31 23:00:00", "2026-11-01", "2026-11-20")).toBe(false);
        expect(isWithinRange("2026-11-21 00:00:01", "2026-11-01", "2026-11-20")).toBe(false);
    });

    it("supports a start-only or end-only range", () => {
        expect(isWithinRange("2026-11-05", "2026-11-01", "")).toBe(true);
        expect(isWithinRange("2026-10-05", "2026-11-01", "")).toBe(false);
        expect(isWithinRange("2026-10-05", "", "2026-11-01")).toBe(true);
    });

    it("drops anomalies without a valid date once a range is set", () => {
        expect(isWithinRange(null, "2026-11-01", "2026-11-20")).toBe(false);
        expect(isWithinRange("bukan tanggal", "2026-11-01", "")).toBe(false);
    });
});

describe("datePresets / matchPreset", () => {
    it("computes presets relative to today", () => {
        const byId = Object.fromEntries(
            datePresets(TODAY).map((p) => [p.id, [toISODate(p.from), toISODate(p.to)]]),
        );
        expect(byId["7d"]).toEqual(["2026-11-14", "2026-11-20"]);
        expect(byId.month).toEqual(["2026-11-01", "2026-11-20"]);
        expect(byId["last-month"]).toEqual(["2026-10-01", "2026-10-31"]);
        expect(byId.year).toEqual(["2026-01-01", "2026-11-20"]);
    });

    it("recognises a range that equals a preset", () => {
        expect(matchPreset("2026-11-01", "2026-11-20", TODAY)).toBe("month");
        expect(matchPreset("2026-11-02", "2026-11-20", TODAY)).toBeNull();
        expect(matchPreset("", "", TODAY)).toBeNull();
    });
});

describe("formatRangeLabel", () => {
    it("describes empty and open-ended ranges", () => {
        expect(formatRangeLabel("", "")).toBe("Semua tanggal");
        expect(formatRangeLabel("2026-11-01", "")).toBe("Sejak 1 Nov 2026");
        expect(formatRangeLabel("", "2026-11-20")).toBe("Sampai 20 Nov 2026");
    });

    it("compacts ranges within the same month or year", () => {
        expect(formatRangeLabel("2026-11-01", "2026-11-20")).toBe("1 – 20 Nov 2026");
        expect(formatRangeLabel("2026-10-15", "2026-11-20")).toBe("15 Okt – 20 Nov 2026");
        expect(formatRangeLabel("2026-11-20", "2026-11-20")).toBe("20 Nov 2026");
    });

    it("shows both years across a year boundary", () => {
        expect(formatRangeLabel("2025-12-15", "2026-01-10")).toBe(
            "15 Des 2025 – 10 Jan 2026",
        );
    });
});
