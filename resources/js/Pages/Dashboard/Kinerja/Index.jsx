import React, { useState, useEffect } from "react";
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
        new Date().toLocaleTimeString(),
    );
    const [error, setError] = useState(null);

    // Corporate Color Palette
    const colors = [
        { border: "#94a3b8", bg: "rgba(148, 163, 184, 0.2)" }, // 2023: Slate Gray
        { border: "#f59e0b", bg: "rgba(245, 158, 11, 0.2)" }, // 2024: Amber/Yellow
        { border: "#0ea5e9", bg: "rgba(14, 165, 233, 0.2)" }, // 2025: Sky Blue
        { border: "#1d4ed8", bg: "rgba(29, 78, 216, 0.2)" }, // 2026: Deep Corporate Blue
    ];

    const formatDatasets = (datasets, type = "line") => {
        if (!datasets) return [];
        return datasets.map((ds, index) => {
            const color = colors[index % colors.length];
            return {
                type: type,
                label: ds.label,
                data: ds.data,
                borderColor: color.border,
                backgroundColor: type === "line" ? color.bg : color.border,
                borderWidth: type === "line" ? 2 : 0,
                borderRadius: type === "bar" ? 4 : 0, // Rounded corners for bars
                fill: type === "line", // Fill under the line for corporate look
                tension: 0.3, // Smooth curves
                pointBackgroundColor: "#ffffff",
                pointBorderColor: color.border,
                pointBorderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5,
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
                    setLastUpdated(new Date().toLocaleTimeString());
                    setError(null);
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

    const renderChart = (title, dataSection, type = "line") => {
        if (
            !dataSection ||
            !dataSection.labels ||
            dataSection.labels.length === 0
        ) {
            return (
                <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm h-52 flex flex-col items-center justify-center">
                    <svg
                        className="w-8 h-8 text-gray-300 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        ></path>
                    </svg>
                    <p className="text-xs text-gray-400 font-medium">
                        Data tidak tersedia
                    </p>
                </div>
            );
        }

        const data = {
            labels: dataSection.labels,
            datasets: formatDatasets(dataSection.datasets, type),
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: "index",
                intersect: false,
            },
            plugins: {
                legend: {
                    position: "top",
                    align: "end",
                    labels: {
                        boxWidth: 8,
                        boxHeight: 8,
                        usePointStyle: true,
                        font: { size: 10, family: "'Inter', sans-serif" },
                        padding: 10,
                        color: "#475569",
                    },
                },
                title: {
                    display: true,
                    text: title,
                    align: "start",
                    color: "#1e293b",
                    font: {
                        size: 12,
                        weight: "600",
                        family: "'Inter', sans-serif",
                    },
                    padding: { top: 0, bottom: 10 },
                },
                tooltip: {
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    titleFont: { size: 11 },
                    bodyFont: { size: 11 },
                    padding: 8,
                    cornerRadius: 6,
                },
            },
            scales: {
                x: {
                    ticks: { font: { size: 9 }, color: "#64748b" },
                    grid: { display: false },
                },
                y: {
                    ticks: { font: { size: 9 }, color: "#64748b" },
                    grid: { color: "#f1f5f9", drawBorder: false },
                    border: { display: false },
                },
            },
        };

        return (
            <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm h-52 transition-all duration-300 hover:shadow-md relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {type === "line" ? (
                    <Line data={data} options={options} />
                ) : (
                    <Bar data={data} options={options} />
                )}
            </div>
        );
    };

    return (
        <DashboardLayout>
            <Head title="Dashboard Kinerja" />

            <div className="py-4 bg-slate-50 min-h-screen">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
                    {/* Corporate Header */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-blue-50 to-transparent opacity-50"></div>
                        <div className="relative z-10">
                            <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                                <svg
                                    className="w-6 h-6 text-blue-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M8 13v-1m4 1v-3m4 3V8M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                                    ></path>
                                </svg>
                                Dashboard Kinerja Operasional
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">
                                Pemantauan Real-time Transmisi, Trafo, dan
                                Security Index
                            </p>
                        </div>
                        <div className="mt-3 sm:mt-0 relative z-10 flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-xs font-medium text-slate-600">
                                Live Update:{" "}
                                <span className="text-blue-600 font-bold">
                                    {lastUpdated}
                                </span>
                            </span>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                            <svg
                                className="w-5 h-5 text-red-500 mt-0.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                ></path>
                            </svg>
                            <div>
                                <h4 className="text-sm font-semibold text-red-800">
                                    Koneksi Data Terputus
                                </h4>
                                <p className="text-xs text-red-600 mt-0.5">
                                    {error}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        {/* Transmisi Column */}
                        <div className="flex flex-col gap-4">
                            <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-xl p-3 shadow-md flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
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
                                </div>
                                <h3 className="text-sm font-bold text-white uppercase tracking-widest">
                                    Gangguan Transmisi
                                </h3>
                            </div>
                            {renderChart(
                                "Kumulatif Transmisi",
                                chartData.transmisi_kumulatif,
                                "line",
                            )}
                            {renderChart(
                                "Trend Per ULTG",
                                chartData.transmisi_ultg,
                                "bar",
                            )}
                            {renderChart(
                                "YoY Per Penyebab",
                                chartData.transmisi_penyebab,
                                "bar",
                            )}
                        </div>

                        {/* Trafo Column */}
                        <div className="flex flex-col gap-4">
                            <div className="bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-xl p-3 shadow-md flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
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
                                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                        ></path>
                                    </svg>
                                </div>
                                <h3 className="text-sm font-bold text-white uppercase tracking-widest">
                                    Gangguan Trafo
                                </h3>
                            </div>
                            {renderChart(
                                "Kumulatif Trafo",
                                chartData.trafo_kumulatif,
                                "line",
                            )}
                            {renderChart(
                                "Trend Per ULTG",
                                chartData.trafo_ultg,
                                "bar",
                            )}
                            {renderChart(
                                "YoY Per Penyebab",
                                chartData.trafo_penyebab,
                                "bar",
                            )}
                        </div>

                        {/* Security Index Column */}
                        <div className="flex flex-col gap-4">
                            <div className="bg-gradient-to-r from-slate-700 to-slate-500 rounded-xl p-3 shadow-md flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
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
                                </div>
                                <h3 className="text-sm font-bold text-white uppercase tracking-widest">
                                    Security Index
                                </h3>
                            </div>
                            {renderChart(
                                "Kumulatif Security Index",
                                chartData.security_kumulatif,
                                "line",
                            )}
                            {renderChart(
                                "Trafo Per ULTG",
                                chartData.security_ultg,
                                "bar",
                            )}
                            {renderChart(
                                "YoY Per Penyebab",
                                chartData.security_penyebab,
                                "bar",
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
