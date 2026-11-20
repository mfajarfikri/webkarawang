import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head } from "@inertiajs/react";
import axios from "axios";
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

const FONT_FAMILY =
    "Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif";
ChartJS.defaults.font.family = FONT_FAMILY;

const ACCENT_BLUE = {
    from: "#3b82f6",
    to: "#1d4ed8",
    text: "#1e3a8a",
    soft: "rgba(59, 130, 246, 0.12)",
};

const ACCENT_CYAN = {
    from: "#06b6d4",
    to: "#0e7490",
    text: "#164e63",
    soft: "rgba(6, 182, 212, 0.12)",
};

const ACCENT_VIOLET = {
    from: "#8b5cf6",
    to: "#5b21b6",
    text: "#4c1d95",
    soft: "rgba(139, 92, 246, 0.12)",
};

const YEAR_COLORS = [
    { hex: "#94a3b8", name: "slate" },
    { hex: "#f59e0b", name: "amber" },
    { hex: "#06b6d4", name: "cyan" },
    { hex: "#6366f1", name: "indigo" },
];

function getCanvasGradient(chart, fromColor, toColor) {
    const { ctx, chartArea } = chart;
    if (!chartArea) return fromColor;
    const gradient = ctx.createLinearGradient(
        chartArea.left,
        chartArea.top,
        chartArea.left,
        chartArea.bottom,
    );
    gradient.addColorStop(0, fromColor);
    gradient.addColorStop(1, toColor);
    return gradient;
}

function StatCard({ label, value, accent, sub, icon, delay = 0 }) {
    const [display, setDisplay] = useState(0);
    const target = typeof value === "number" ? value : 0;

    useEffect(() => {
        let start = null;
        const duration = 800;
        const startDelay = delay;
        let raf;
        const step = (ts) => {
            if (start === null) start = ts + startDelay;
            if (ts < start) {
                raf = requestAnimationFrame(step);
                return;
            }
            const elapsed = Math.min(duration, ts - start);
            const eased = 1 - Math.pow(1 - elapsed / duration, 3);
            setDisplay(Math.floor(target * eased));
            if (elapsed < duration) raf = requestAnimationFrame(step);
            else setDisplay(target);
        };
        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
    }, [target, delay]);

    return (
        <div
            className="relative overflow-hidden rounded-2xl p-4 bg-white border border-slate-100 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.08)] hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 transition-all duration-500 ease-out group"
            style={{
                background: `linear-gradient(135deg, #ffffff 0%, ${accent.soft} 100%)`,
            }}
        >
            <div
                className="absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"
                style={{ background: accent.from }}
            />
            <div className="relative flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                        {label}
                    </p>
                    <p
                        className="text-3xl font-extrabold tracking-tight"
                        style={{ color: accent.text }}
                    >
                        {display}
                        {typeof value === "number" ? "" : value}
                    </p>
                    {sub && <p className="text-[11px] text-slate-500">{sub}</p>}
                </div>
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg"
                    style={{
                        background: `linear-gradient(135deg, ${accent.from} 0%, ${accent.to} 100%)`,
                    }}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}

export default function Kinerja({ auth }) {
    const defaultData = {
        transmisi_kumulatif: { labels: [], datasets: [] },
        transmisi_ultg: { labels: [], datasets: [] },
        transmisi_penyebab: { labels: [], datasets: [] },
        trafo_kumulatif: { labels: [], datasets: [] },
        trafo_ultg: { labels: [], datasets: [] },
        trafo_penyebab: { labels: [], datasets: [] },
        security_kumulatif: { labels: [], datasets: [] },
        security_ultg: { labels: [], datasets: [] },
        security_penyebab: { labels: [], datasets: [] },
    };

    const [chartData, setChartData] = useState(defaultData);
    const [lastUpdated, setLastUpdated] = useState(
        new Date().toLocaleTimeString("id-ID"),
    );
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        transmisiTotal: 0,
        trafoTotal: 0,
        securityTotal: 0,
        tahunTerakhir: "-",
    });

    const sectionStyles = {
        transmisi: ACCENT_BLUE,
        trafo: ACCENT_CYAN,
        security: ACCENT_VIOLET,
    };

    const formatDatasets = (datasets, type, accentFrom, accentTo) => {
        if (!datasets) return [];
        return datasets.map((ds, index) => {
            const yearColor = YEAR_COLORS[index % YEAR_COLORS.length];
            const useGradient =
                index === datasets.length - 1 && type === "line";
            const solidFrom = useGradient ? accentFrom : yearColor.hex;
            const solidTo = useGradient ? accentTo : yearColor.hex;

            return {
                type: type,
                label: ds.label,
                data: ds.data,
                borderColor: useGradient
                    ? (ctx) => getCanvasGradient(ctx.chart, solidFrom, solidTo)
                    : solidFrom,
                backgroundColor:
                    type === "line"
                        ? (ctx) =>
                              getCanvasGradient(
                                  ctx.chart,
                                  `${solidFrom}55`,
                                  `${solidTo}05`,
                              )
                        : useGradient
                          ? (ctx) =>
                                getCanvasGradient(ctx.chart, solidFrom, solidTo)
                          : `${solidFrom}cc`,
                borderWidth: type === "line" ? 2.5 : 0,
                borderRadius: type === "bar" ? 8 : 0,
                borderSkipped: type === "bar" ? false : undefined,
                barPercentage: 0.65,
                categoryPercentage: 0.75,
                fill: type === "line",
                tension: 0.4,
                pointBackgroundColor: "#ffffff",
                pointBorderColor: solidFrom,
                pointBorderWidth: 2,
                pointRadius: type === "line" ? 3 : 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: solidFrom,
                pointHoverBorderColor: "#ffffff",
                pointHoverBorderWidth: 2,
            };
        });
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await axios.get(
                    route("dashboard.kinerja.data"),
                );
                if (response.data) {
                    setChartData(response.data);
                    setLastUpdated(new Date().toLocaleTimeString("id-ID"));
                    setError(null);

                    const sumLatest = (section) => {
                        const d =
                            response.data?.[`${section}_kumulatif`]?.datasets;
                        if (!d || d.length === 0) return 0;
                        const latest = d[d.length - 1]?.data || [];
                        return latest.reduce(
                            (a, b) => a + (typeof b === "number" ? b : 0),
                            0,
                        );
                    };
                    const latestYear =
                        response.data?.transmisi_kumulatif?.datasets?.[
                            response.data.transmisi_kumulatif.datasets.length -
                                1
                        ]?.label || "-";

                    setStats({
                        transmisiTotal: sumLatest("transmisi"),
                        trafoTotal: sumLatest("trafo"),
                        securityTotal: sumLatest("security"),
                        tahunTerakhir: latestYear,
                    });
                }
            } catch (err) {
                console.error("Gagal mengambil data dari server:", err);
                if (
                    err.response &&
                    err.response.data &&
                    err.response.data.error
                ) {
                    setError(err.response.data.error);
                }
            }
        };

        loadData();
        const interval = setInterval(loadData, 10000);
        return () => clearInterval(interval);
    }, []);

    const renderChart = (title, dataSection, type, sectionKey) => {
        const accent = sectionStyles[sectionKey] || ACCENT_BLUE;

        if (
            !dataSection ||
            !dataSection.labels ||
            dataSection.labels.length === 0
        ) {
            return (
                <div className="relative overflow-hidden rounded-2xl h-56 flex flex-col items-center justify-center bg-gradient-to-br from-white to-slate-50 border border-slate-100 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.06)]">
                    <div
                        className="absolute inset-0 opacity-30"
                        style={{
                            backgroundImage: `radial-gradient(circle at 1px 1px, ${accent.from}15 1px, transparent 0)`,
                            backgroundSize: "18px 18px",
                        }}
                    />
                    <svg
                        className="w-12 h-12 mb-3 text-slate-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        ></path>
                    </svg>
                    <p className="text-sm text-slate-400 font-medium">
                        Data tidak tersedia
                    </p>
                    <p className="text-[11px] text-slate-300 mt-1">
                        Periksa koneksi ke Google Sheets
                    </p>
                </div>
            );
        }

        const data = {
            labels: dataSection.labels,
            datasets: formatDatasets(
                dataSection.datasets,
                type,
                accent.from,
                accent.to,
            ),
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            resizeDelay: 200,
            animation: {
                duration: 1200,
                easing: "easeOutQuart",
                delay: 120,
            },
            hover: {
                mode: "index",
                intersect: false,
            },
            interaction: {
                mode: "index",
                intersect: false,
            },
            plugins: {
                legend: {
                    position: "top",
                    align: "end",
                    labels: {
                        boxWidth: 7,
                        boxHeight: 7,
                        usePointStyle: true,
                        pointStyle: "circle",
                        font: { size: 10, family: FONT_FAMILY },
                        padding: 12,
                        color: "#475569",
                    },
                },
                title: {
                    display: true,
                    text: title,
                    align: "start",
                    color: "#0f172a",
                    font: {
                        size: 13,
                        weight: "700",
                        family: FONT_FAMILY,
                    },
                    padding: { top: 0, bottom: 12 },
                },
                tooltip: {
                    backgroundColor: "rgba(15, 23, 42, 0.92)",
                    titleFont: { size: 12, weight: "600", family: FONT_FAMILY },
                    bodyFont: { size: 12, family: FONT_FAMILY },
                    padding: 10,
                    cornerRadius: 10,
                    borderColor: "rgba(255,255,255,0.08)",
                    borderWidth: 1,
                    boxPadding: 4,
                    usePointStyle: true,
                    callbacks: {
                        label: (c) =>
                            ` ${c.dataset.label}: ${c.parsed.y ?? "-"}`,
                    },
                },
            },
            scales: {
                x: {
                    ticks: {
                        font: { size: 10 },
                        color: "#64748b",
                        maxRotation: 0,
                    },
                    grid: { display: false },
                    border: { display: false },
                },
                y: {
                    ticks: { font: { size: 10 }, color: "#64748b" },
                    grid: {
                        color: "#f1f5f9",
                        drawBorder: false,
                        tickLength: 0,
                    },
                    border: { display: false },
                    beginAtZero: true,
                },
            },
        };

        return (
            <div className="relative overflow-hidden rounded-2xl h-56 p-3 bg-white border border-slate-100 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 transition-all duration-500 ease-out">
                <div
                    className="absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-15 pointer-events-none transition-opacity duration-500"
                    style={{ background: accent.from }}
                />
                <div
                    className="absolute left-0 top-0 w-[3px] h-full"
                    style={{
                        background: `linear-gradient(180deg, ${accent.from} 0%, ${accent.to} 100%)`,
                    }}
                />
                {type === "line" ? (
                    <Line data={data} options={options} />
                ) : (
                    <Bar data={data} options={options} />
                )}
            </div>
        );
    };

    const SectionHeader = ({ title, subtitle, accent, icon }) => (
        <div className="relative flex items-center gap-3 mb-4 pl-4 pr-3 py-2.5 rounded-2xl overflow-hidden">
            <div
                className="absolute inset-0"
                style={{
                    background: `linear-gradient(135deg, ${accent.from}ee 0%, ${accent.to}dd 100%)`,
                }}
            />
            <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10 blur-xl" />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white/15 rotate-12" />
            <div className="relative z-10 bg-white/20 backdrop-blur-sm rounded-xl p-2 border border-white/20">
                {icon}
            </div>
            <div className="relative z-10 flex-1">
                <h3 className="text-[13px] font-extrabold text-white uppercase tracking-[0.12em] leading-tight">
                    {title}
                </h3>
                <p className="text-[11px] text-white/75 leading-tight mt-0.5">
                    {subtitle}
                </p>
            </div>
        </div>
    );

    return (
        <DashboardLayout>
            <Head title="Dashboard Kinerja" />

            <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
                <div
                    className="absolute inset-0 opacity-60 pointer-events-none"
                    style={{
                        backgroundImage: `
                            radial-gradient(circle at 20% 10%, rgba(59, 130, 246, 0.08) 0%, transparent 40%),
                            radial-gradient(circle at 80% 80%, rgba(6, 182, 212, 0.08) 0%, transparent 40%),
                            radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.04) 0%, transparent 60%)
                        `,
                    }}
                />
                <div
                    className="absolute inset-0 opacity-[0.35] pointer-events-none"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle at 1px 1px, rgba(15, 23, 42, 0.04) 1px, transparent 0)",
                        backgroundSize: "22px 22px",
                    }}
                />

                <div className="relative max-w-[1500px] mx-auto px-4 sm:px-6 py-5">
                    <header className="relative overflow-hidden rounded-3xl mb-5 border border-white/60 bg-white/70 backdrop-blur-xl shadow-[0_10px_40px_-15px_rgba(15,23,42,0.1)]">
                        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-indigo-100/60 via-sky-100/40 to-transparent pointer-events-none" />
                        <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-gradient-to-br from-blue-400/40 to-indigo-500/30 blur-3xl" />
                        <div className="absolute right-10 bottom-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400/40 to-sky-500/30 blur-2xl rotate-12 translate-y-1/2" />

                        <div className="relative px-6 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl blur-md opacity-40 animate-pulse" />
                                    <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center shadow-xl text-white">
                                        <svg
                                            className="w-7 h-7"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M3 3v18h18M7 14l4-4 4 4 5-6"
                                            ></path>
                                        </svg>
                                    </div>
                                </div>
                                <div>
                                    <h1 className="text-[22px] font-black text-slate-900 tracking-tight leading-tight">
                                        Dashboard Kinerja Operasional
                                    </h1>
                                    <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1.5">
                                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        Pemantauan real-time Transmisi, Trafo,
                                        dan Security Index
                                        {stats.tahunTerakhir !== "-" && (
                                            <span className="text-slate-400">
                                                · Tahun data terakhir:{" "}
                                                <span className="text-indigo-600 font-semibold">
                                                    {stats.tahunTerakhir}
                                                </span>
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-emerald-100 shadow-sm">
                                    <span className="relative flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                                    </span>
                                    <div className="leading-tight">
                                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                                            Live Update
                                        </p>
                                        <p className="text-sm font-bold text-slate-800 tabular-nums">
                                            {lastUpdated}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>

                    {error && (
                        <div className="mb-5 relative overflow-hidden rounded-2xl p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 shadow-[0_6px_20px_-8px_rgba(239,68,68,0.25)]">
                            <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-red-400 to-red-600" />
                            <div className="flex items-start gap-3 pl-2">
                                <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0 text-red-600">
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                                        ></path>
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-red-900">
                                        Koneksi Data Terputus
                                    </h4>
                                    <p className="text-xs text-red-700 mt-0.5">
                                        {error}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <StatCard
                            label="Total Gangguan Transmisi"
                            value={stats.transmisiTotal}
                            accent={ACCENT_BLUE}
                            sub="Akumulasi tahun terakhir"
                            delay={0}
                            icon={
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M13 10V3L4 14h7v7l9-11h-7z"
                                    ></path>
                                </svg>
                            }
                        />
                        <StatCard
                            label="Total Gangguan Trafo"
                            value={stats.trafoTotal}
                            accent={ACCENT_CYAN}
                            sub="Akumulasi tahun terakhir"
                            delay={150}
                            icon={
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                                    ></path>
                                </svg>
                            }
                        />
                        <StatCard
                            label="Total Security Index"
                            value={stats.securityTotal}
                            accent={ACCENT_VIOLET}
                            sub="Akumulasi tahun terakhir"
                            delay={300}
                            icon={
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                    ></path>
                                </svg>
                            }
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        <div className="relative flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white/40 backdrop-blur-sm p-3 shadow-[0_4px_24px_-12px_rgba(15,23,42,0.08)]">
                            <div
                                className="absolute inset-x-3 top-0 h-1 rounded-full"
                                style={{
                                    background: `linear-gradient(90deg, ${ACCENT_BLUE.from} 0%, ${ACCENT_BLUE.to} 100%)`,
                                }}
                            />
                            <SectionHeader
                                title="Gangguan Transmisi"
                                subtitle="Kumulatif bulanan · Per ULTG · Per penyebab"
                                accent={ACCENT_BLUE}
                                icon={
                                    <svg
                                        className="w-5 h-5 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M13 10V3L4 14h7v7l9-11h-7z"
                                        ></path>
                                    </svg>
                                }
                            />
                            {renderChart(
                                "Kumulatif Transmisi",
                                chartData.transmisi_kumulatif,
                                "line",
                                "transmisi",
                            )}
                            {renderChart(
                                "Trend Per ULTG",
                                chartData.transmisi_ultg,
                                "bar",
                                "transmisi",
                            )}
                            {renderChart(
                                "YoY Per Penyebab",
                                chartData.transmisi_penyebab,
                                "bar",
                                "transmisi",
                            )}
                        </div>

                        <div className="relative flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white/40 backdrop-blur-sm p-3 shadow-[0_4px_24px_-12px_rgba(15,23,42,0.08)]">
                            <div
                                className="absolute inset-x-3 top-0 h-1 rounded-full"
                                style={{
                                    background: `linear-gradient(90deg, ${ACCENT_CYAN.from} 0%, ${ACCENT_CYAN.to} 100%)`,
                                }}
                            />
                            <SectionHeader
                                title="Gangguan Trafo"
                                subtitle="Kumulatif bulanan · Per ULTG · Per penyebab"
                                accent={ACCENT_CYAN}
                                icon={
                                    <svg
                                        className="w-5 h-5 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                                        ></path>
                                    </svg>
                                }
                            />
                            {renderChart(
                                "Kumulatif Trafo",
                                chartData.trafo_kumulatif,
                                "line",
                                "trafo",
                            )}
                            {renderChart(
                                "Trend Per ULTG",
                                chartData.trafo_ultg,
                                "bar",
                                "trafo",
                            )}
                            {renderChart(
                                "YoY Per Penyebab",
                                chartData.trafo_penyebab,
                                "bar",
                                "trafo",
                            )}
                        </div>

                        <div className="relative flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white/40 backdrop-blur-sm p-3 shadow-[0_4px_24px_-12px_rgba(15,23,42,0.08)]">
                            <div
                                className="absolute inset-x-3 top-0 h-1 rounded-full"
                                style={{
                                    background: `linear-gradient(90deg, ${ACCENT_VIOLET.from} 0%, ${ACCENT_VIOLET.to} 100%)`,
                                }}
                            />
                            <SectionHeader
                                title="Security Index"
                                subtitle="Kumulatif bulanan · Per ULTG · Per penyebab"
                                accent={ACCENT_VIOLET}
                                icon={
                                    <svg
                                        className="w-5 h-5 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                        ></path>
                                    </svg>
                                }
                            />
                            {renderChart(
                                "Kumulatif Security Index",
                                chartData.security_kumulatif,
                                "line",
                                "security",
                            )}
                            {renderChart(
                                "Trend Per ULTG",
                                chartData.security_ultg,
                                "bar",
                                "security",
                            )}
                            {renderChart(
                                "YoY Per Penyebab",
                                chartData.security_penyebab,
                                "bar",
                                "security",
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
