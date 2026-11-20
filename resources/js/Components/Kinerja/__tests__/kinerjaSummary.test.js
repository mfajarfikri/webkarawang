import {
    MONTHS_ID,
    summarizeCumulative,
    sortedComparison,
    yearColor,
} from "../kinerjaSummary";

const cumulative = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
        { label: "2024", data: [2, 3, 5, 11, 12, 14] },
        { label: "2025", data: [1, 3, 6, 9, 12, 16] },
        { label: "2026", data: [1, 3, 8, 12, 15, null] },
    ],
};

describe("summarizeCumulative", () => {
    it("reads the latest year up to its last reported month", () => {
        expect(summarizeCumulative(cumulative)).toMatchObject({
            year: "2026",
            monthIndex: 4,
            monthLabel: "Mei",
            value: 15,
        });
    });

    it("compares with the same month of the previous year", () => {
        expect(summarizeCumulative(cumulative)).toMatchObject({
            previousYear: "2025",
            previousValue: 12,
            delta: 3,
            previousYearTotal: 16,
        });
    });

    it("returns null when there is no data", () => {
        expect(summarizeCumulative({ labels: [], datasets: [] })).toBeNull();
        expect(summarizeCumulative(undefined)).toBeNull();
        expect(
            summarizeCumulative({
                labels: ["Jan"],
                datasets: [{ label: "2026", data: [null] }],
            }),
        ).toBeNull();
    });

    it("handles a single year without a comparison", () => {
        const single = {
            labels: ["Jan", "Feb"],
            datasets: [{ label: "2026", data: [2, 4] }],
        };
        expect(summarizeCumulative(single)).toMatchObject({
            value: 4,
            previousYear: null,
            previousValue: null,
            delta: null,
        });
    });
});

describe("sortedComparison", () => {
    const causes = {
        labels: ["APPL", "ALAM", "ALAT", "BINATANG"],
        datasets: [
            { label: "2024", data: [4, 18, 0, 2] },
            { label: "2025", data: [4, 24, 3, 1] },
            { label: "2026", data: [0, 15, 0, 0] },
        ],
    };

    it("keeps the latest two years, sorted by latest then previous value", () => {
        expect(sortedComparison(causes)).toEqual({
            labels: ["ALAM", "APPL", "ALAT", "BINATANG"],
            latest: { label: "2026", data: [15, 0, 0, 0] },
            previous: { label: "2025", data: [24, 4, 3, 1] },
        });
    });

    it("drops categories that are zero in both years", () => {
        const sparse = {
            labels: ["A", "B"],
            datasets: [
                { label: "2025", data: [0, 2] },
                { label: "2026", data: [0, 1] },
            ],
        };
        expect(sortedComparison(sparse).labels).toEqual(["B"]);
    });
});

describe("yearColor", () => {
    it("highlights the latest year and fades older ones", () => {
        expect(yearColor(3, 4).emphasis).toBe("current");
        expect(yearColor(2, 4).emphasis).toBe("previous");
        expect(yearColor(0, 4).emphasis).toBe("older");
    });

    it("gives each older year its own, lighter shade", () => {
        expect(yearColor(1, 4).solid).not.toBe(yearColor(0, 4).solid);
    });
});

describe("MONTHS_ID", () => {
    it("has twelve Indonesian month labels", () => {
        expect(MONTHS_ID).toHaveLength(12);
        expect(MONTHS_ID[4]).toBe("Mei");
        expect(MONTHS_ID[7]).toBe("Agu");
    });
});
