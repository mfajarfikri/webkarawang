/**
 * Perhitungan ringkasan untuk Dashboard Kinerja.
 * Data datang dari CSV Google Sheets (KinerjaController@fetchData) dengan
 * bentuk { labels: [...], datasets: [{ label: "2026", data: [n|null] }] },
 * dataset berurutan dari tahun terlama ke terbaru.
 */

export const MONTHS_ID = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
];

function lastReportedIndex(data = []) {
    for (let i = data.length - 1; i >= 0; i -= 1) {
        if (data[i] !== null && data[i] !== undefined) return i;
    }
    return -1;
}

function lastValue(data = []) {
    const index = lastReportedIndex(data);
    return index === -1 ? null : data[index];
}

/**
 * Nilai kumulatif tahun terbaru sampai bulan terakhir yang terisi,
 * dibandingkan dengan bulan yang sama tahun sebelumnya.
 */
export function summarizeCumulative(section) {
    const datasets = section?.datasets ?? [];
    if (datasets.length === 0) return null;

    const current = datasets[datasets.length - 1];
    const monthIndex = lastReportedIndex(current.data);
    if (monthIndex === -1) return null;

    const previous = datasets.length > 1 ? datasets[datasets.length - 2] : null;
    const value = current.data[monthIndex];
    const previousValue = previous ? (previous.data[monthIndex] ?? null) : null;

    return {
        year: current.label,
        monthIndex,
        monthLabel: MONTHS_ID[monthIndex] ?? section.labels?.[monthIndex] ?? "",
        value,
        previousYear: previous ? previous.label : null,
        previousValue,
        delta: previousValue === null ? null : value - previousValue,
        previousYearTotal: previous ? lastValue(previous.data) : null,
    };
}

/**
 * Dua tahun terakhir untuk grafik perbandingan, diurutkan dari nilai
 * tahun terbaru (lalu tahun sebelumnya); kategori yang nol di keduanya dibuang.
 */
export function sortedComparison(section) {
    const datasets = section?.datasets ?? [];
    const labels = section?.labels ?? [];
    if (datasets.length === 0 || labels.length === 0) return null;

    const latest = datasets[datasets.length - 1];
    const previous = datasets.length > 1 ? datasets[datasets.length - 2] : null;

    const rows = labels
        .map((label, i) => ({
            label,
            latest: latest.data[i] ?? 0,
            previous: previous ? (previous.data[i] ?? 0) : 0,
        }))
        .filter((row) => row.latest !== 0 || row.previous !== 0)
        .sort((a, b) => b.latest - a.latest || b.previous - a.previous);

    return {
        labels: rows.map((row) => row.label),
        latest: { label: latest.label, data: rows.map((row) => row.latest) },
        previous: previous
            ? { label: previous.label, data: rows.map((row) => row.previous) }
            : null,
    };
}

const PALETTE = {
    current: { solid: "#0086c9", soft: "rgba(11, 165, 236, 0.12)" },
    previous: { solid: "#475569", soft: "rgba(71, 85, 105, 0.08)" },
};

// Tahun-tahun lama makin pudar supaya tetap bisa dibedakan satu sama lain.
const OLDER_SHADES = ["#94a3b8", "#cbd5e1", "#e2e8f0"];

/** Warna per tahun: tahun terbaru menonjol, tahun lalu netral, sisanya pudar. */
export function yearColor(index, count) {
    const distance = count - 1 - index;
    if (distance === 0) return { emphasis: "current", ...PALETTE.current };
    if (distance === 1) return { emphasis: "previous", ...PALETTE.previous };
    const solid =
        OLDER_SHADES[Math.min(distance - 2, OLDER_SHADES.length - 1)];
    return { emphasis: "older", solid, soft: "transparent" };
}
