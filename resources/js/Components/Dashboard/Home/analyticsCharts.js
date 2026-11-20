/**
 * Data dan opsi Chart.js untuk ringkasan dashboard.
 * Fungsi data murni: menerima daftar anomali, mengembalikan objek `data` Chart.js.
 */
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Filler,
    Tooltip,
    Legend,
} from "chart.js";
import { STAGES, deriveStage, isOverdue } from "@/Components/Anomali/anomaliWorkflow";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Filler,
    Tooltip,
    Legend,
);

ChartJS.defaults.font.family = "Inter, ui-sans-serif, system-ui, sans-serif";
ChartJS.defaults.color = "#64748b";

const TICK_COLOR = "#64748b";
const GRID_COLOR = "#eef2f6";
const TOOLTIP_BG = "#131c31";
const UNKNOWN = "Tidak diketahui";

const MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

/** Urutan dan warna seri tahap pada grafik kategori. */
export const STAGE_SERIES = [
    { key: "review", label: STAGES.review.label, color: "#f59e0b" },
    { key: "assigned", label: STAGES.assigned.label, color: "#0ba5ec" },
    { key: "scheduled", label: STAGES.scheduled.label, color: "#8b5cf6" },
    { key: "overdue", label: "Lewat jadwal", color: "#f43f5e" },
    { key: "closed", label: STAGES.closed.label, color: "#10b981" },
    { key: "rejected", label: STAGES.rejected.label, color: "#94a3b8" },
];

const TIPE_COLORS = { Major: "#f43f5e", Minor: "#10b981" };
const FALLBACK_COLORS = ["#0ba5ec", "#8b5cf6", "#f59e0b", "#94a3b8"];

/** Tahap untuk grafik: tahap terjadwal yang lewat jadwal dipisah jadi "overdue". */
function chartStage(anomali, today) {
    return isOverdue(anomali, today) ? "overdue" : deriveStage(anomali);
}

export function buildStageByCategoryData(anomalis, today = new Date()) {
    const grouped = {};
    for (const item of anomalis) {
        const category = item.kategori?.name || "Tidak dikategorikan";
        const stage = chartStage(item, today);
        grouped[category] ??= {};
        grouped[category][stage] = (grouped[category][stage] ?? 0) + 1;
    }
    const labels = Object.keys(grouped);
    return {
        labels,
        datasets: STAGE_SERIES.map((series) => ({
            label: series.label,
            data: labels.map((label) => grouped[label][series.key] ?? 0),
            backgroundColor: series.color,
            borderRadius: 4,
            borderSkipped: false,
            maxBarThickness: 36,
        })),
    };
}

export function buildDistributionData(anomalis) {
    const grouped = {};
    const tipes = new Set();
    for (const item of anomalis) {
        const bagian = item.bagian || UNKNOWN;
        const tipe = item.tipe || UNKNOWN;
        tipes.add(tipe);
        grouped[bagian] ??= {};
        grouped[bagian][tipe] = (grouped[bagian][tipe] ?? 0) + 1;
    }
    const labels = Object.keys(grouped);
    return {
        labels,
        datasets: [...tipes].map((tipe, index) => ({
            label: tipe,
            data: labels.map((label) => grouped[label][tipe] ?? 0),
            backgroundColor:
                TIPE_COLORS[tipe] ??
                FALLBACK_COLORS[index % FALLBACK_COLORS.length],
            borderRadius: 4,
            borderSkipped: false,
            maxBarThickness: 22,
        })),
    };
}

export function buildMonthlyTrendData(anomalis) {
    const monthly = {};
    for (const item of anomalis) {
        const date = new Date(item.tanggal_kejadian);
        if (Number.isNaN(date.getTime())) continue;
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        monthly[key] = (monthly[key] ?? 0) + 1;
    }
    const months = Object.keys(monthly).sort();
    return {
        labels: months.map((key) => {
            const [year, month] = key.split("-");
            return `${MONTHS[Number(month) - 1]} ${year}`;
        }),
        datasets: [
            {
                label: "Jumlah anomali",
                data: months.map((key) => monthly[key]),
                borderColor: "#0ba5ec",
                backgroundColor: "rgba(11, 165, 236, 0.08)",
                borderWidth: 2,
                fill: true,
                tension: 0.35,
                pointBackgroundColor: "#0ba5ec",
                pointBorderColor: "#ffffff",
                pointBorderWidth: 2,
                pointRadius: 3.5,
                pointHoverRadius: 6,
            },
        ],
    };
}

const tooltip = {
    backgroundColor: TOOLTIP_BG,
    titleColor: "#ffffff",
    bodyColor: "#e2e8f0",
    cornerRadius: 10,
    padding: 10,
    boxPadding: 4,
    usePointStyle: true,
    titleFont: { size: 12, weight: "600" },
    bodyFont: { size: 12 },
};

const legend = {
    position: "bottom",
    labels: {
        usePointStyle: true,
        pointStyle: "circle",
        boxWidth: 8,
        boxHeight: 8,
        padding: 14,
        color: TICK_COLOR,
        font: { size: 11, weight: "500" },
    },
};

const valueAxis = {
    beginAtZero: true,
    border: { display: false },
    grid: { color: GRID_COLOR },
    ticks: { color: TICK_COLOR, font: { size: 11 }, precision: 0 },
};

const categoryAxis = {
    border: { display: false },
    grid: { display: false },
    ticks: { color: TICK_COLOR, font: { size: 11 } },
};

const base = { responsive: true, maintainAspectRatio: false };

export const stageChartOptions = {
    ...base,
    interaction: { mode: "index", intersect: false },
    plugins: { legend, tooltip },
    scales: {
        x: { ...categoryAxis, stacked: true },
        y: { ...valueAxis, stacked: true },
    },
};

export const distributionChartOptions = {
    ...base,
    indexAxis: "y",
    interaction: { mode: "index", intersect: false },
    plugins: { legend, tooltip },
    scales: { x: valueAxis, y: categoryAxis },
};

export const trendChartOptions = {
    ...base,
    interaction: { mode: "index", intersect: false },
    plugins: { legend: { display: false }, tooltip },
    scales: {
        x: { ...categoryAxis, ticks: { ...categoryAxis.ticks, maxRotation: 0, autoSkip: true } },
        y: valueAxis,
    },
};
