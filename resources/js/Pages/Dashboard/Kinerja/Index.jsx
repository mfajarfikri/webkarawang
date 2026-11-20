import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head } from "@inertiajs/react";
import axios from "axios";
import {
    FaArrowDown,
    FaArrowUp,
    FaBolt,
    FaChartBar,
    FaExclamationTriangle,
    FaIndustry,
    FaShieldAlt,
} from "react-icons/fa";
import PageHeader from "@/Components/Dashboard/PageHeader";
import { Card } from "@/Components/Dashboard/ui";
import {
    MONTHS_ID,
    sortedComparison,
    summarizeCumulative,
    yearColor,
} from "@/Components/Kinerja/kinerjaSummary";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
);

const POLL_INTERVAL_MS = 10000;

const CATEGORIES = [
    {
        id: "transmisi",
        title: "Gangguan Transmisi",
        unit: "gangguan",
        icon: FaBolt,
    },
    {
        id: "trafo",
        title: "Gangguan Trafo",
        unit: "gangguan",
        icon: FaIndustry,
    },
    {
        id: "security",
        title: "Security Index",
        unit: "kejadian",
        icon: FaShieldAlt,
    },
];

const EMPTY_SECTION = { labels: [], datasets: [] };
const FONT = { family: "'Inter', sans-serif", size: 11 };
const TICK = { font: FONT, color: "#64748b" };

const BASE_OPTIONS = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
        legend: {
            position: "bottom",
            align: "start",
            labels: {
                boxWidth: 8,
                boxHeight: 8,
                usePointStyle: true,
                padding: 14,
                font: FONT,
                color: "#475569",
            },
        },
        tooltip: {
            backgroundColor: "#131c31",
            titleFont: FONT,
            bodyFont: FONT,
            padding: 10,
            cornerRadius: 10,
            boxPadding: 4,
        },
    },
};

const VALUE_AXIS = {
    beginAtZero: true,
    ticks: { ...TICK, precision: 0 },
    grid: { color: "#eef2f6" },
    border: { display: false },
};

function lineChart(section) {
    const count = section.datasets.length;
    return {
        data: {
            // Label bulan dari spreadsheet tidak seragam (May/Mei, feb, Ags).
            labels: section.labels.length === 12 ? MONTHS_ID : section.labels,
            datasets: section.datasets.map((ds, i) => {
                const color = yearColor(i, count);
                const isCurrent = color.emphasis === "current";
                return {
                    label: ds.label,
                    data: ds.data,
                    borderColor: color.solid,
                    backgroundColor: isCurrent ? color.soft : "transparent",
                    fill: isCurrent,
                    borderWidth: isCurrent ? 3 : 1.5,
                    borderDash: color.emphasis === "older" ? [4, 4] : [],
                    tension: 0.3,
                    pointRadius: isCurrent ? 3 : 0,
                    pointHoverRadius: 5,
                    pointBackgroundColor: "#ffffff",
                    pointBorderColor: color.solid,
                    pointBorderWidth: 2,
                    order: isCurrent ? 0 : 1,
                };
            }),
        },
        options: {
            ...BASE_OPTIONS,
            scales: {
                x: { ticks: TICK, grid: { display: false } },
                y: VALUE_AXIS,
            },
        },
    };
}

function groupedBarChart(section) {
    const count = section.datasets.length;
    return {
        data: {
            labels: section.labels,
            datasets: section.datasets.map((ds, i) => ({
                label: ds.label,
                data: ds.data,
                backgroundColor: yearColor(i, count).solid,
                borderRadius: 6,
                maxBarThickness: 26,
            })),
        },
        options: {
            ...BASE_OPTIONS,
            scales: {
                x: { ticks: TICK, grid: { display: false } },
                y: VALUE_AXIS,
            },
        },
    };
}

function causesChart(comparison) {
    const datasets = [
        {
            label: comparison.latest.label,
            data: comparison.latest.data,
            backgroundColor: "#0086c9",
            borderRadius: 6,
            maxBarThickness: 16,
        },
    ];
    if (comparison.previous) {
        datasets.push({
            label: comparison.previous.label,
            data: comparison.previous.data,
            backgroundColor: "#cbd5e1",
            borderRadius: 6,
            maxBarThickness: 16,
        });
    }
    return {
        data: { labels: comparison.labels, datasets },
        options: {
            ...BASE_OPTIONS,
            indexAxis: "y",
            interaction: { mode: "index", intersect: false, axis: "y" },
            scales: {
                x: VALUE_AXIS,
                y: { ticks: TICK, grid: { display: false } },
            },
        },
    };
}

function DeltaChip({ summary }) {
    if (!summary || summary.delta === null) return null;
    const { delta, monthLabel, previousYear } = summary;
    // Untuk gangguan, naik berarti memburuk.
    const tone =
        delta > 0
            ? "bg-rose-50 text-rose-700 ring-rose-200"
            : delta < 0
              ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
              : "bg-slate-100 text-slate-600 ring-slate-200";
    const Icon = delta > 0 ? FaArrowUp : delta < 0 ? FaArrowDown : null;
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${tone}`}
        >
            {Icon ? <Icon className="h-2.5 w-2.5" aria-hidden="true" /> : null}
            {delta === 0 ? "Sama" : Math.abs(delta)} vs {monthLabel}{" "}
            {previousYear}
        </span>
    );
}

function CategoryCard({ category, summary, isActive, isLoading, onSelect }) {
    const Icon = category.icon;
    return (
        <button
            type="button"
            onClick={onSelect}
            aria-pressed={isActive}
            className={`surface flex h-full flex-col gap-4 p-5 text-left transition duration-200 ${
                isActive
                    ? "ring-2 ring-ink-900"
                    : "hover:-translate-y-0.5 hover:shadow-lift"
            }`}
        >
            <span className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-slate-600">
                    {category.title}
                </span>
                <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                        isActive
                            ? "bg-ink-900 text-volt"
                            : "bg-slate-100 text-slate-500"
                    }`}
                >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
            </span>
            {isLoading ? (
                <span className="space-y-2">
                    <span className="block h-9 w-20 animate-pulse rounded-lg bg-slate-100" />
                    <span className="block h-4 w-40 animate-pulse rounded bg-slate-100" />
                </span>
            ) : summary ? (
                <span className="space-y-2">
                    <span className="flex items-baseline gap-2">
                        <span className="font-display text-4xl font-extrabold tabular-nums text-ink-900">
                            {summary.value}
                        </span>
                        <span className="text-sm text-slate-500">
                            {category.unit} s.d. {summary.monthLabel}{" "}
                            {summary.year}
                        </span>
                    </span>
                    <span className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <DeltaChip summary={summary} />
                        {summary.previousYearTotal !== null ? (
                            <span>
                                Total {summary.previousYear}:{" "}
                                <span className="font-semibold text-slate-700">
                                    {summary.previousYearTotal}
                                </span>
                            </span>
                        ) : null}
                    </span>
                </span>
            ) : (
                <span className="text-sm text-slate-400">
                    Data belum tersedia
                </span>
            )}
        </button>
    );
}

function ChartBox({ height = "h-72", isLoading, isEmpty, children }) {
    if (isLoading) {
        return (
            <div
                className={`${height || "h-40"} animate-pulse rounded-xl bg-slate-50`}
            />
        );
    }
    if (isEmpty) {
        return (
            <div
                className={`${height || "h-40"} flex items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-400`}
            >
                Data tidak tersedia
            </div>
        );
    }
    return <div className={height}>{children}</div>;
}

function hasData(section) {
    return Boolean(section?.labels?.length && section?.datasets?.length);
}

export default function Kinerja() {
    const [chartData, setChartData] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [error, setError] = useState(null);
    const [activeId, setActiveId] = useState("transmisi");

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await axios.get(
                    route("dashboard.kinerja.data"),
                );
                if (response.data) {
                    setChartData(response.data);
                    setLastUpdated(new Date());
                    setError(null);
                }
            } catch (err) {
                setError(
                    err?.response?.data?.error ||
                        "Gagal mengambil data dari server.",
                );
            }
        };

        loadData();
        const interval = setInterval(loadData, POLL_INTERVAL_MS);
        return () => clearInterval(interval);
    }, []);

    const isLoading = chartData === null && !error;
    const section = (key) => chartData?.[key] ?? EMPTY_SECTION;

    const summaries = useMemo(
        () =>
            Object.fromEntries(
                CATEGORIES.map((c) => [
                    c.id,
                    summarizeCumulative(chartData?.[`${c.id}_kumulatif`]),
                ]),
            ),
        [chartData],
    );

    const active = CATEGORIES.find((c) => c.id === activeId);
    const cumulative = section(`${activeId}_kumulatif`);
    const perUltg = section(`${activeId}_ultg`);
    const causes = sortedComparison(section(`${activeId}_penyebab`));
    const causesHeight = causes
        ? `${Math.max(160, causes.labels.length * 44 + 70)}px`
        : "160px";

    return (
        <DashboardLayout title="Dashboard Kinerja">
            <Head title="Dashboard Kinerja" />

            <PageHeader
                icon={FaChartBar}
                title="Dashboard Kinerja"
                description="Gangguan transmisi, gangguan trafo, dan security index dibandingkan antar tahun."
            >
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-3.5 py-2 text-xs text-slate-600 shadow-soft">
                    <span
                        className={`h-2 w-2 rounded-full ${
                            error ? "bg-rose-500" : "bg-emerald-500"
                        }`}
                    />
                    {lastUpdated
                        ? `Diperbarui ${lastUpdated.toLocaleTimeString(
                              "id-ID",
                              {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                              },
                          )}`
                        : "Memuat data..."}
                    <span className="text-slate-400">· Google Sheets</span>
                </span>
            </PageHeader>

            {error ? (
                <div
                    role="alert"
                    className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3"
                >
                    <FaExclamationTriangle
                        className="mt-0.5 h-4 w-4 shrink-0 text-rose-600"
                        aria-hidden="true"
                    />
                    <div className="text-sm">
                        <p className="font-semibold text-rose-900">
                            Data tidak bisa diperbarui
                        </p>
                        <p className="mt-0.5 text-rose-800">{error}</p>
                    </div>
                </div>
            ) : null}

            <div
                role="group"
                aria-label="Pilih kategori kinerja"
                className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3"
            >
                {CATEGORIES.map((category) => (
                    <CategoryCard
                        key={category.id}
                        category={category}
                        summary={summaries[category.id]}
                        isActive={category.id === activeId}
                        isLoading={isLoading}
                        onSelect={() => setActiveId(category.id)}
                    />
                ))}
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <Card
                        className="xl:col-span-2"
                        title={`${active.title} kumulatif`}
                        description="Akumulasi per bulan. Garis biru tebal adalah tahun berjalan."
                    >
                        <ChartBox
                            isLoading={isLoading}
                            isEmpty={!hasData(cumulative)}
                        >
                            {hasData(cumulative) ? (
                                <Line {...lineChart(cumulative)} />
                            ) : null}
                        </ChartBox>
                    </Card>

                    <Card
                        title="Per ULTG"
                        description={
                            summaries[activeId]
                                ? `Jumlah per wilayah, per tahun. Tahun ${summaries[activeId].year} baru sampai ${summaries[activeId].monthLabel}.`
                                : "Jumlah per wilayah, per tahun."
                        }
                    >
                        <ChartBox
                            isLoading={isLoading}
                            isEmpty={!hasData(perUltg)}
                        >
                            {hasData(perUltg) ? (
                                <Bar {...groupedBarChart(perUltg)} />
                            ) : null}
                        </ChartBox>
                    </Card>
                </div>

                <Card
                    title="Per penyebab"
                    description={
                        causes?.previous
                            ? `Tahun ${causes.latest.label} dibanding ${causes.previous.label}, diurutkan dari penyebab terbanyak.`
                            : "Diurutkan dari penyebab terbanyak."
                    }
                >
                    <ChartBox
                        height=""
                        isLoading={isLoading}
                        isEmpty={!causes || causes.labels.length === 0}
                    >
                        {causes && causes.labels.length > 0 ? (
                            <div style={{ height: causesHeight }}>
                                <Bar {...causesChart(causes)} />
                            </div>
                        ) : null}
                    </ChartBox>
                </Card>
            </div>
        </DashboardLayout>
    );
}
