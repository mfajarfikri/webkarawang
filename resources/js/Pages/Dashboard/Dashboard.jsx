import React, { useState, useEffect, useMemo, Fragment } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, usePage } from "@inertiajs/react";
import { Switch, Dialog, Transition, Listbox } from "@headlessui/react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    LineElement,
    PointElement,
} from "chart.js";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
    FaChartBar,
    FaExclamationTriangle,
    FaCheckCircle,
    FaClock,
    FaSpinner,
    FaFilter,
    FaCalendar,
    FaInfoCircle,
    FaFolder,
    FaChevronDown,
    FaCheck,
    FaChartLine,
    FaCog,
    FaBuilding,
} from "react-icons/fa";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    LineElement,
    PointElement
);

export default function Dashboard({ apiUrl }) {
    const { auth } = usePage().props;
    const [anomaliData, setAnomaliData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dateFilter, setDateFilter] = useState({
        startDate: "",
        endDate: "",
    });
    const [statusFilter, setStatusFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [ultgFilter, setUltgFilter] = useState("all");

    // Fetch anomaly data from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch("/api/anomali");
                if (!response.ok) {
                    throw new Error("Failed to fetch data");
                }
                const data = await response.json();
                setAnomaliData(data.anomalis || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Determine available ULTG options based on user's wilayah
    const availableUltgOptions = useMemo(() => {
        const userWilayah = auth?.user?.wilayah;
        if (userWilayah === "UPT Karawang") {
            return [
                { value: "all", label: "Semua ULTG" },
                { value: "ULTG Karawang", label: "ULTG Karawang" },
                { value: "ULTG Purwakarta", label: "ULTG Purwakarta" },
            ];
        } else if (userWilayah === "ULTG Karawang") {
            return [{ value: "ULTG Karawang", label: "ULTG Karawang" }];
        } else if (userWilayah === "ULTG Purwakarta") {
            return [{ value: "ULTG Purwakarta", label: "ULTG Purwakarta" }];
        }
        return [{ value: "all", label: "Semua ULTG" }];
    }, [auth?.user?.wilayah]);

    // Set initial ULTG filter based on user's wilayah
    useEffect(() => {
        const userWilayah = auth?.user?.wilayah;
        if (userWilayah === "ULTG Karawang") {
            setUltgFilter("ULTG Karawang");
        } else if (userWilayah === "ULTG Purwakarta") {
            setUltgFilter("ULTG Purwakarta");
        }
    }, [auth?.user?.wilayah]);

    // Filter data based on selected filters
    const filteredData = useMemo(() => {
        let filtered = anomaliData;

        // Date filter
        if (dateFilter.startDate && dateFilter.endDate) {
            filtered = filtered.filter((item) => {
                const itemDate = new Date(item.tanggal_kejadian);
                const startDate = new Date(dateFilter.startDate);
                const endDate = new Date(dateFilter.endDate);
                return itemDate >= startDate && itemDate <= endDate;
            });
        }

        // Status filter
        if (statusFilter !== "all") {
            filtered = filtered.filter((item) => item.status === statusFilter);
        }

        // Category filter
        if (categoryFilter !== "all") {
            filtered = filtered.filter(
                (item) => item.kategori?.name === categoryFilter
            );
        }

        // ULTG filter
        if (ultgFilter !== "all") {
            filtered = filtered.filter((item) => item.ultg === ultgFilter);
        }

        return filtered;
    }, [anomaliData, dateFilter, statusFilter, categoryFilter, ultgFilter]);

    // Get unique categories for filter dropdown
    const categories = useMemo(() => {
        const uniqueCategories = [
            ...new Set(
                anomaliData.map((item) => item.kategori?.name).filter(Boolean)
            ),
        ];
        return uniqueCategories;
    }, [anomaliData]);
    // Prepare data for Combined Status and Category Chart (Grouped by Category with Status breakdown)
    const prepareCombinedData = () => {
        // Group data by category and status
        const categoryStatusData = filteredData.reduce((acc, item) => {
            const category = item.kategori?.name || "Tidak Dikategorikan";
            const status = item.status || "Unknown";

            if (!acc[category]) {
                acc[category] = {};
            }

            acc[category][status] = (acc[category][status] || 0) + 1;
            return acc;
        }, {});

        // Get all unique categories and statuses
        const categories = Object.keys(categoryStatusData);
        const allStatuses = ["New", "Open", "In Progress", "Pending", "Close"];

        // Define colorful palette for each status
        const statusColors = {
            New: {
                background: "#DC2626",
                border: "#DC2626",
            },
            Open: {
                background: "#2563EB",
                border: "#2563EB",
            },
            "In Progress": {
                background: "#CA8A04",
                border: "#CA8A04",
            },
            Pending: {
                background: "#EA580C",
                border: "#EA580C",
            },
            Close: {
                background: "#059669",
                border: "#059669",
            },
        };

        // Create datasets for each status with clean styling
        const datasets = allStatuses.map((status) => ({
            label: `${status}`,
            data: categories.map(
                (category) => categoryStatusData[category][status] || 0
            ),
            backgroundColor: statusColors[status].background,
            borderColor: statusColors[status].border,
            borderWidth: 1,
            borderRadius: 4,
            hoverBackgroundColor: statusColors[status].border,
            hoverBorderWidth: 2,
        }));

        return {
            labels: categories,
            datasets: datasets,
        };
    };

    // Prepare data for Monthly Trend Chart
    const prepareMonthlyTrendData = () => {
        const monthlyData = filteredData.reduce((acc, item) => {
            const date = new Date(item.tanggal_kejadian);
            const monthYear = `${date.getFullYear()}-${String(
                date.getMonth() + 1
            ).padStart(2, "0")}`;
            acc[monthYear] = (acc[monthYear] || 0) + 1;
            return acc;
        }, {});

        const sortedMonths = Object.keys(monthlyData).sort();

        return {
            labels: sortedMonths.map((month) => {
                const [year, monthNum] = month.split("-");
                const monthNames = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ];
                return `${monthNames[parseInt(monthNum) - 1]} ${year}`;
            }),
            datasets: [
                {
                    label: "Jumlah Anomali",
                    data: sortedMonths.map((month) => monthlyData[month]),
                    borderColor: "#10B981", // Emerald Green
                    backgroundColor: "rgba(16, 185, 129, 0.2)", // Light emerald fill
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: "#059669", // Darker emerald for points
                    pointBorderColor: "#ffffff",
                    pointBorderWidth: 3,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    pointHoverBackgroundColor: "#047857", // Even darker on hover
                    pointHoverBorderColor: "#ffffff",
                    pointHoverBorderWidth: 3,
                },
            ],
        };
    };

    // Prepare data for Multi-Series Anomali Horizontal Bar Chart (Bagian and Tipe)
    const prepareHorizontalBarData = () => {
        // Group data by bagian first
        const bagianData = filteredData.reduce((acc, item) => {
            const bagian = item.bagian || "Tidak Diketahui";
            if (!acc[bagian]) {
                acc[bagian] = {};
            }
            const tipe = item.tipe || "Tidak Diketahui";
            acc[bagian][tipe] = (acc[bagian][tipe] || 0) + 1;
            return acc;
        }, {});

        // Create labels by combining bagian and tipe for better readability
        const labels = [];
        const datasets = [];

        // Enhanced color schemes for different tipe with gradients and hover effects
        const tipeColors = {
            Major: {
                background: "rgba(239, 68, 68, 0.8)", // Red with transparency
                border: "#DC2626",
                hover: "rgba(220, 38, 38, 0.9)",
            },
            Minor: {
                background: "rgba(16, 185, 129, 0.8)", // Emerald Green
                border: "#059669",
                hover: "rgba(5, 150, 105, 0.9)",
            },
        };

        // Get all unique tipe values
        const allTipes = [
            ...new Set(
                filteredData.map((item) => item.tipe || "Tidak Diketahui")
            ),
        ];

        // Create datasets for each tipe
        allTipes.forEach((tipe) => {
            const data = [];
            const bagianLabels = [];

            Object.keys(bagianData).forEach((bagian) => {
                const count = bagianData[bagian][tipe] || 0;
                if (count > 0 || bagianLabels.length === 0) {
                    bagianLabels.push(bagian);
                    data.push(count);
                }
            });

            if (bagianLabels.length > 0) {
                // Update labels only once
                if (labels.length === 0) {
                    labels.push(...bagianLabels);
                }

                const colorConfig =
                    tipeColors[tipe] || tipeColors["Tidak Diketahui"];
                datasets.push({
                    label: tipe,
                    data: Object.keys(bagianData).map(
                        (bagian) => bagianData[bagian][tipe] || 0
                    ),
                    backgroundColor: colorConfig.background,
                    borderColor: colorConfig.border,
                    borderWidth: 2,
                    borderRadius: 4,
                    borderSkipped: false,
                    hoverBackgroundColor: colorConfig.hover,
                    hoverBorderColor: colorConfig.border,
                    hoverBorderWidth: 3,
                    tension: 0.1,
                });
            }
        });

        return {
            labels: Object.keys(bagianData),
            datasets: datasets,
        };
    };

    // Horizontal Bar chart options
    const horizontalBarOptions = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "y", // This makes the bar chart horizontal
        plugins: {
            legend: {
                position: "top",
                labels: {
                    font: {
                        size: 12,
                        weight: "500",
                    },
                    padding: 15,
                    usePointStyle: true,
                    pointStyle: "rect",
                    color: "#6B7280",
                    boxWidth: 12,
                },
            },
            tooltip: {
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                titleColor: "#374151",
                bodyColor: "#6B7280",
                borderColor: "#E5E7EB",
                borderWidth: 1,
                cornerRadius: 8,
                titleFont: {
                    size: 13,
                    weight: "600",
                },
                bodyFont: {
                    size: 12,
                },
                callbacks: {
                    label: function (context) {
                        const tipe = context.dataset.label || "";
                        const bagian = context.label || "";
                        const value = context.parsed.x;
                        return `${bagian} - ${tipe}: ${value} anomali`;
                    },
                    title: function (context) {
                        return "Distribusi Anomali";
                    },
                },
            },
        },
        scales: {
            x: {
                beginAtZero: true,
                grid: {
                    color: "rgba(229, 231, 235, 0.8)",
                    drawBorder: false,
                },
                ticks: {
                    font: {
                        size: 11,
                    },
                    color: "#6B7280",
                    stepSize: 1,
                },
                title: {
                    display: true,
                    text: "Jumlah Anomali",
                    font: {
                        size: 12,
                        weight: "500",
                    },
                    color: "#6B7280",
                },
            },
            y: {
                grid: {
                    display: false,
                },
                ticks: {
                    font: {
                        size: 11,
                    },
                    color: "#6B7280",
                },
                title: {
                    display: true,
                    text: "Bagian",
                    font: {
                        size: 12,
                        weight: "500",
                    },
                    color: "#6B7280",
                },
            },
        },
        animation: {
            duration: 800,
            easing: "easeOutQuart",
        },
        hover: {
            animationDuration: 150,
        },
    };

    // Calculate statistics
    const stats = useMemo(() => {
        const total = filteredData.length;
        const statusCounts = filteredData.reduce((acc, item) => {
            const status = item.status || "Unknown";
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        return {
            total,
            new: statusCounts["New"] || 0,
            open: statusCounts["Open"] || 0,
            inProgress: statusCounts["In Progress"] || 0,
            pending: statusCounts["Pending"] || 0,
            close: statusCounts["Close"] || 0,
        };
    }, [filteredData]);

    // Chart options with clean and simple styling
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        resizeDelay: 0,
        devicePixelRatio: window.devicePixelRatio || 1,
        interaction: {
            mode: "index",
            intersect: false,
        },
        plugins: {
            legend: {
                position: "top",
                labels: {
                    font: {
                        size: 12,
                        weight: "500",
                    },
                    padding: 15,
                    usePointStyle: true,
                    pointStyle: "rect",
                    color: "#6B7280",
                },
            },
            tooltip: {
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                titleColor: "#374151",
                bodyColor: "#6B7280",
                borderColor: "#E5E7EB",
                borderWidth: 1,
                cornerRadius: 8,
                titleFont: {
                    size: 13,
                    weight: "600",
                },
                bodyFont: {
                    size: 12,
                },
                padding: 12,
                callbacks: {
                    title: function (context) {
                        return `Kategori: ${context[0].label}`;
                    },
                    label: function (context) {
                        return `${context.dataset.label}: ${context.parsed.y}`;
                    },
                },
                animation: {
                    duration: 200,
                    easing: "easeOutCubic",
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                stacked: true,
                grid: {
                    color: "rgba(229, 231, 235, 0.8)",
                    drawBorder: false,
                },
                ticks: {
                    font: {
                        size: 11,
                    },
                    color: "#9CA3AF",
                    stepSize: 1,
                },
                title: {
                    display: true,
                    text: "Jumlah",
                    font: {
                        size: 12,
                        weight: "500",
                    },
                    color: "#6B7280",
                    align: "center",
                },
            },
            x: {
                stacked: true,
                grid: {
                    display: false,
                },
                ticks: {
                    font: {
                        size: 11,
                    },
                    color: "#6B7280",
                    maxRotation: 0,
                    maxTicksLimit: false,
                    autoSkip: false,
                },
                title: {
                    display: true,
                    text: "Kategori",
                    font: {
                        size: 12,
                        weight: "500",
                    },
                    color: "#6B7280",
                    align: "center",
                },
            },
        },
        animation: {
            duration: 800,
            easing: "easeOutQuart",
        },
        hover: {
            animationDuration: 350,
        },
    };

    const lineOptions = {
        ...chartOptions,
        plugins: {
            ...chartOptions.plugins,
            tooltip: {
                ...chartOptions.plugins.tooltip,
                callbacks: {
                    title: function (context) {
                        return `Periode: ${context[0].label}`;
                    },
                    label: function (context) {
                        return `${context.dataset.label}: ${context.parsed.y}`;
                    },
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: "rgba(229, 231, 235, 0.8)",
                    drawBorder: false,
                },
                ticks: {
                    font: {
                        size: 11,
                    },
                    color: "#9CA3AF",
                    stepSize: 1,
                },
                title: {
                    display: true,
                    text: "Jumlah",
                    font: {
                        size: 12,
                        weight: "500",
                    },
                    color: "#6B7280",
                    align: "center",
                },
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    font: {
                        size: 11,
                    },
                    color: "#6B7280",
                    maxRotation: 45,
                    maxTicksLimit: false,
                    autoSkip: false,
                },
                title: {
                    display: true,
                    text: "Periode",
                    font: {
                        size: 12,
                        weight: "500",
                    },
                    color: "#6B7280",
                    align: "center",
                },
            },
        },
        animation: {
            duration: 800,
            easing: "easeInOutCubic",
            delay: (context) => {
                let delay = 0;
                if (context.type === "data" && context.mode === "default") {
                    delay = context.dataIndex * 150;
                }
                return delay;
            },
        },
    };

    if (loading) {
        return (
            <DashboardLayout>
                <Head title="Dashboard Anomali" />
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg">
                            Memuat data dashboard...
                        </p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout>
                <Head title="Dashboard Anomali" />
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <FaExclamationTriangle className="text-4xl text-red-600 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg">Error: {error}</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <Head title="Dashboard Anomali" />

            {/* Corporate Background */}
            <div className="min-h-screen bg-gray-50">
                {/* Corporate Header Section */}
                <div className="bg-white border-b border-gray-200 shadow-sm">
                    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="bg-blue-600 p-3 rounded-lg shadow-sm">
                                    <FaChartBar className="text-2xl text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">
                                        Dashboard Anomali
                                    </h1>
                                    <p className="text-gray-600 mt-1 text-base">
                                        Monitoring dan analisis data anomali
                                        sistem
                                    </p>
                                </div>
                            </div>

                            {/* Quick Stats in Header */}
                            <div className="hidden lg:flex items-center space-x-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-900">
                                        {stats.total}
                                    </div>
                                    <div className="text-sm text-gray-500 font-medium">
                                        Total Anomali
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">
                                        {stats.new}
                                    </div>
                                    <div className="text-sm text-gray-500 font-medium">
                                        Baru
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Corporate Filters Section */}
                <div className="bg-white border-b border-gray-200">
                    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center space-x-3 mb-6">
                                <FaFilter className="text-gray-600 text-lg" />
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Filter Data
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Date Range Filter */}
                                <div className="space-y-2">
                                    <label className=" text-sm font-medium text-gray-700 flex items-center space-x-2">
                                        <FaCalendar className="text-gray-500 text-sm" />
                                        <span>Tanggal Mulai</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={dateFilter.startDate}
                                        onChange={(e) =>
                                            setDateFilter((prev) => ({
                                                ...prev,
                                                startDate: e.target.value,
                                            }))
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors duration-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className=" text-sm font-medium text-gray-700 flex items-center space-x-2">
                                        <FaCalendar className="text-gray-500 text-sm" />
                                        <span>Tanggal Akhir</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={dateFilter.endDate}
                                        onChange={(e) =>
                                            setDateFilter((prev) => ({
                                                ...prev,
                                                endDate: e.target.value,
                                            }))
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors duration-200"
                                    />
                                </div>
                                {/* Status Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                                        <FaInfoCircle className="text-gray-500 text-sm" />
                                        <span>Status</span>
                                    </label>
                                    <Listbox
                                        value={statusFilter}
                                        onChange={setStatusFilter}
                                    >
                                        <div className="relative">
                                            <Listbox.Button className="relative w-full cursor-pointer rounded-md bg-white py-2 pl-3 pr-10 text-left shadow-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200">
                                                <span className="block truncate">
                                                    {statusFilter === "all"
                                                        ? "Semua Status"
                                                        : statusFilter}
                                                </span>
                                                <span className="absolute inset-y-0 right-0 flex items-center pr-2">
                                                    <FaChevronDown
                                                        className="h-4 w-4 text-gray-400"
                                                        aria-hidden="true"
                                                    />
                                                </span>
                                            </Listbox.Button>
                                            <Transition
                                                as={Fragment}
                                                leave="transition ease-in duration-100"
                                                leaveFrom="opacity-100"
                                                leaveTo="opacity-0"
                                            >
                                                <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 overflow-auto focus:outline-none sm:text-sm">
                                                    <Listbox.Option
                                                        className={({
                                                            active,
                                                        }) =>
                                                            `${
                                                                active
                                                                    ? "text-white bg-blue-600"
                                                                    : "text-gray-900"
                                                            }
                                                            cursor-pointer select-none relative py-2 pl-3 pr-9`
                                                        }
                                                        value="all"
                                                    >
                                                        {({
                                                            selected,
                                                            active,
                                                        }) => (
                                                            <>
                                                                <span
                                                                    className={`block truncate ${
                                                                        selected
                                                                            ? "font-semibold"
                                                                            : "font-normal"
                                                                    }`}
                                                                >
                                                                    Semua Status
                                                                </span>
                                                                {selected && (
                                                                    <span
                                                                        className={`absolute inset-y-0 right-0 hover:bg-blue-600 flex items-center pr-4 ${
                                                                            active
                                                                                ? "text-white"
                                                                                : "text-blue-600"
                                                                        }`}
                                                                    >
                                                                        <FaCheck
                                                                            className="h-4 w-4"
                                                                            aria-hidden="true"
                                                                        />
                                                                    </span>
                                                                )}
                                                            </>
                                                        )}
                                                    </Listbox.Option>
                                                    {[
                                                        "New",
                                                        "Open",
                                                        "In Progress",
                                                        "Pending",
                                                        "Close",
                                                    ].map((status) => (
                                                        <Listbox.Option
                                                            key={status}
                                                            className={({
                                                                active,
                                                            }) =>
                                                                `${
                                                                    active
                                                                        ? "text-white bg-blue-600"
                                                                        : "text-gray-900"
                                                                }
                                                                cursor-pointer select-none relative py-2 pl-3 pr-9`
                                                            }
                                                            value={status}
                                                        >
                                                            {({
                                                                selected,
                                                                active,
                                                            }) => (
                                                                <>
                                                                    <span
                                                                        className={`block truncate ${
                                                                            selected
                                                                                ? "font-semibold"
                                                                                : "font-normal"
                                                                        }`}
                                                                    >
                                                                        {status}
                                                                    </span>
                                                                    {selected && (
                                                                        <span
                                                                            className={`absolute inset-y-0 right-0 flex items-center pr-4 ${
                                                                                active
                                                                                    ? "text-white"
                                                                                    : "text-blue-600"
                                                                            }`}
                                                                        >
                                                                            <FaCheck
                                                                                className="h-4 w-4"
                                                                                aria-hidden="true"
                                                                            />
                                                                        </span>
                                                                    )}
                                                                </>
                                                            )}
                                                        </Listbox.Option>
                                                    ))}
                                                </Listbox.Options>
                                            </Transition>
                                        </div>
                                    </Listbox>
                                </div>
                                {/* Category Filter */}
                                <div className="space-y-2">
                                    <Listbox
                                        value={categoryFilter}
                                        onChange={setCategoryFilter}
                                    >
                                        <div className="relative">
                                            <Listbox.Label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                                                <FaFolder className="text-gray-500 text-sm" />
                                                <span>Kategori</span>
                                            </Listbox.Label>
                                            <Listbox.Button className="relative mt-2 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors duration-200 text-left">
                                                <span className="block truncate">
                                                    {categoryFilter === "all"
                                                        ? "Semua Kategori"
                                                        : categoryFilter}
                                                </span>
                                                <span className="absolute inset-y-0 right-0 flex items-center pr-2">
                                                    <FaChevronDown
                                                        className="h-4 w-4 text-gray-400"
                                                        aria-hidden="true"
                                                    />
                                                </span>
                                            </Listbox.Button>
                                            <Transition
                                                as={Fragment}
                                                leave="transition ease-in duration-100"
                                                leaveFrom="opacity-100"
                                                leaveTo="opacity-0"
                                            >
                                                <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 overflow-auto focus:outline-none sm:text-sm">
                                                    <Listbox.Option
                                                        className={({
                                                            active,
                                                        }) =>
                                                            `${
                                                                active
                                                                    ? "text-white bg-blue-600"
                                                                    : "text-gray-900"
                                                            }
                                                            cursor-pointer select-none relative py-2 pl-3 pr-9`
                                                        }
                                                        value="all"
                                                    >
                                                        {({
                                                            selected,
                                                            active,
                                                        }) => (
                                                            <>
                                                                <span
                                                                    className={`block truncate ${
                                                                        selected
                                                                            ? "font-semibold"
                                                                            : "font-normal"
                                                                    }`}
                                                                >
                                                                    Semua
                                                                    Kategori
                                                                </span>
                                                                {selected && (
                                                                    <span
                                                                        className={`absolute inset-y-0 right-0 hover:bg-blue-600 flex items-center pr-4 ${
                                                                            active
                                                                                ? "text-white"
                                                                                : "text-blue-600"
                                                                        }`}
                                                                    >
                                                                        <FaCheck
                                                                            className="h-4 w-4"
                                                                            aria-hidden="true"
                                                                        />
                                                                    </span>
                                                                )}
                                                            </>
                                                        )}
                                                    </Listbox.Option>
                                                    {categories.map(
                                                        (category) => (
                                                            <Listbox.Option
                                                                key={category}
                                                                className={({
                                                                    active,
                                                                }) =>
                                                                    `${
                                                                        active
                                                                            ? "text-white bg-blue-600"
                                                                            : "text-gray-900"
                                                                    }
                                                                cursor-pointer select-none relative py-2 pl-3 pr-9`
                                                                }
                                                                value={category}
                                                            >
                                                                {({
                                                                    selected,
                                                                    active,
                                                                }) => (
                                                                    <>
                                                                        <span
                                                                            className={`block truncate ${
                                                                                selected
                                                                                    ? "font-semibold"
                                                                                    : "font-normal"
                                                                            }`}
                                                                        >
                                                                            {
                                                                                category
                                                                            }
                                                                        </span>
                                                                        {selected && (
                                                                            <span
                                                                                className={`absolute inset-y-0 right-0 flex items-center pr-4 ${
                                                                                    active
                                                                                        ? "text-white"
                                                                                        : "text-blue-600"
                                                                                }`}
                                                                            >
                                                                                <FaCheck
                                                                                    className="h-4 w-4"
                                                                                    aria-hidden="true"
                                                                                />
                                                                            </span>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </Listbox.Option>
                                                        )
                                                    )}
                                                </Listbox.Options>
                                            </Transition>
                                        </div>
                                    </Listbox>
                                </div>
                                {/* ULTG Filter */}
                                {availableUltgOptions.length > 1 && (
                                    <div className="space-y-2">
                                        <Listbox
                                            value={ultgFilter}
                                            onChange={setUltgFilter}
                                        >
                                            <div className="relative">
                                                <Listbox.Label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                                                    <FaBuilding className="text-gray-500 text-sm" />
                                                    <span>ULTG</span>
                                                </Listbox.Label>
                                                <Listbox.Button className="relative mt-2 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors duration-200 text-left">
                                                    <span className="block truncate">
                                                        {availableUltgOptions.find(
                                                            (option) =>
                                                                option.value ===
                                                                ultgFilter
                                                        )?.label ||
                                                            "Pilih ULTG"}
                                                    </span>
                                                    <span className="absolute inset-y-0 right-0 flex items-center pr-2">
                                                        <FaChevronDown
                                                            className="h-4 w-4 text-gray-400"
                                                            aria-hidden="true"
                                                        />
                                                    </span>
                                                </Listbox.Button>
                                                <Transition
                                                    as={Fragment}
                                                    leave="transition ease-in duration-100"
                                                    leaveFrom="opacity-100"
                                                    leaveTo="opacity-0"
                                                >
                                                    <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                                                        {availableUltgOptions.map(
                                                            (option) => (
                                                                <Listbox.Option
                                                                    key={
                                                                        option.value
                                                                    }
                                                                    className={({
                                                                        active,
                                                                    }) =>
                                                                        `${
                                                                            active
                                                                                ? "text-white bg-blue-600"
                                                                                : "text-gray-900"
                                                                        }
                                                                cursor-pointer select-none relative py-2 pl-3 pr-9`
                                                                    }
                                                                    value={
                                                                        option.value
                                                                    }
                                                                >
                                                                    {({
                                                                        selected,
                                                                        active,
                                                                    }) => (
                                                                        <>
                                                                            <span
                                                                                className={`block truncate ${
                                                                                    selected
                                                                                        ? "font-semibold"
                                                                                        : "font-normal"
                                                                                }`}
                                                                            >
                                                                                {
                                                                                    option.label
                                                                                }
                                                                            </span>
                                                                            {selected && (
                                                                                <span
                                                                                    className={`absolute inset-y-0 right-0 flex items-center pr-4 ${
                                                                                        active
                                                                                            ? "text-white"
                                                                                            : "text-blue-600"
                                                                                    }`}
                                                                                >
                                                                                    <FaCheck
                                                                                        className="h-4 w-4"
                                                                                        aria-hidden="true"
                                                                                    />
                                                                                </span>
                                                                            )}
                                                                        </>
                                                                    )}
                                                                </Listbox.Option>
                                                            )
                                                        )}
                                                    </Listbox.Options>
                                                </Transition>
                                            </div>
                                        </Listbox>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Corporate Statistics Cards */}
                <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
                        {/* Total Card - Corporate Simple */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="bg-gray-100 p-3 rounded-lg">
                                    <FaChartBar className="text-lg text-cyan-700" />
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                                        Total
                                    </div>
                                </div>
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm font-medium mb-1">
                                    Total Anomali
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.total}
                                </p>
                            </div>
                        </div>

                        {/* New Card - Corporate Simple */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="bg-gray-100 p-3 rounded-lg">
                                    <FaExclamationTriangle className="text-lg text-red-700" />
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                                        New
                                    </div>
                                </div>
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm font-medium mb-1">
                                    Status New
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.new}
                                </p>
                            </div>
                        </div>

                        {/* Open Card - Corporate Simple */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="bg-gray-100 p-3 rounded-lg">
                                    <FaClock className="text-lg text-blue-700" />
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                                        Open
                                    </div>
                                </div>
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm font-medium mb-1">
                                    Status Open
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.open}
                                </p>
                            </div>
                        </div>

                        {/* In Progress Card - Corporate Simple */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="bg-gray-100 p-3 rounded-lg">
                                    <FaCog className="text-lg text-yellow-800" />
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                                        In Progress
                                    </div>
                                </div>
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm font-medium mb-1">
                                    Status In Progress
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.inProgress}
                                </p>
                            </div>
                        </div>

                        {/* Pending Card - Corporate Simple */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="bg-gray-100 p-3 rounded-lg">
                                    <FaSpinner className="text-lg text-orange-700" />
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                                        Pending
                                    </div>
                                </div>
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm font-medium mb-1">
                                    Status Pending
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.pending}
                                </p>
                            </div>
                        </div>

                        {/* Close Card - Corporate Simple */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="bg-gray-100 p-3 rounded-lg">
                                    <FaCheckCircle className="text-lg text-green-700" />
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                                        Close
                                    </div>
                                </div>
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm font-medium mb-1">
                                    Status Close
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.close}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Corporate Chart Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Combined Status and Category Chart - Corporate */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="bg-gray-100 p-2 rounded-lg">
                                        <FaChartBar className="text-gray-700 text-lg" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Distribusi Status & Kategori
                                        </h3>
                                        <p className="text-gray-600 text-sm">
                                            Analisis breakdown anomali
                                            berdasarkan status dan kategori
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="h-80 w-full relative">
                                    <Bar
                                        data={prepareCombinedData()}
                                        options={{
                                            ...chartOptions,
                                            plugins: {
                                                ...chartOptions.plugins,
                                                title: {
                                                    display: false,
                                                },
                                            },
                                        }}
                                        style={{
                                            maxWidth: "100%",
                                            maxHeight: "100%",
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Anomali Distribution Horizontal Bar Chart - Corporate */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="bg-gray-100 p-2 rounded-lg">
                                        <FaChartBar className="text-gray-700 text-lg" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Distribusi Anomali Horizontal
                                        </h3>
                                        <p className="text-gray-600 text-sm">
                                            Distribusi anomali berdasarkan
                                            bagian dan tipe dalam format
                                            horizontal bar untuk kemudahan
                                            pembacaan
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="h-96 w-full relative">
                                    <Bar
                                        data={prepareHorizontalBarData()}
                                        options={horizontalBarOptions}
                                        style={{
                                            maxWidth: "100%",
                                            maxHeight: "100%",
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-6">
                        {/* Monthly Trend Chart - Corporate */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="bg-gray-100 p-2 rounded-lg">
                                        <FaChartBar className="text-gray-700 text-lg" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Tren Anomali Bulanan
                                        </h3>
                                        <p className="text-gray-600 text-sm">
                                            Perkembangan jumlah anomali dari
                                            waktu ke waktu
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="h-80 w-full relative">
                                    <Line
                                        data={prepareMonthlyTrendData()}
                                        options={{
                                            ...lineOptions,
                                            plugins: {
                                                ...lineOptions.plugins,
                                                title: {
                                                    display: false,
                                                },
                                            },
                                        }}
                                        style={{
                                            maxWidth: "100%",
                                            maxHeight: "100%",
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Corporate Insights Section */}
                    <div className="mt-8 bg-white border border-gray-200 rounded-lg shadow-sm p-8">
                        <div className="text-center mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Insight & Rekomendasi
                            </h3>
                            <p className="text-gray-600">
                                Analisis otomatis berdasarkan data anomali
                                terkini
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="bg-gray-200 p-2 rounded-lg">
                                        <FaChartBar className="text-gray-700 text-lg" />
                                    </div>
                                    <h4 className="font-semibold text-gray-900">
                                        Status Terbanyak
                                    </h4>
                                </div>
                                <p className="text-gray-600 text-sm">
                                    Status dengan jumlah anomali tertinggi saat
                                    ini memerlukan perhatian khusus untuk
                                    penanganan prioritas.
                                </p>
                            </div>

                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="bg-gray-200 p-2 rounded-lg">
                                        <FaChartLine className="text-gray-700 text-lg" />
                                    </div>
                                    <h4 className="font-semibold text-gray-900">
                                        Tren Analisis
                                    </h4>
                                </div>
                                <p className="text-gray-600 text-sm">
                                    Monitoring tren bulanan menunjukkan pola
                                    yang dapat digunakan untuk prediksi dan
                                    pencegahan anomali.
                                </p>
                            </div>

                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="bg-gray-200 p-2 rounded-lg">
                                        <FaCog className="text-gray-700 text-lg" />
                                    </div>
                                    <h4 className="font-semibold text-gray-900">
                                        Aksi Rekomendasi
                                    </h4>
                                </div>
                                <p className="text-gray-600 text-sm">
                                    Fokus pada kategori dengan anomali terbanyak
                                    dan implementasi tindakan preventif untuk
                                    mengurangi kejadian.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
