import React, {
    useState,
    useEffect,
    useMemo,
    Fragment,
    useCallback,
} from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, usePage } from "@inertiajs/react";
import { debounce } from "lodash";
import {
    Switch,
    Dialog,
    Transition,
    Listbox,
    Checkbox,
    Disclosure,
} from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/16/solid";
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
    Filler,
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
    FaNewspaper,
    FaEye,
    FaChevronLeft,
    FaChevronRight,
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
    PointElement,
    Filler,
);

export default function Dashboard({ apiUrl }) {
    const { auth } = usePage().props;
    const [enabled, setEnabled] = useState(false);
    const [beritaData, setBeritaData] = useState([]);
    const [anomaliData, setAnomaliData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingBerita, setLoadingBerita] = useState(true);
    const [error, setError] = useState(null);
    const [dateFilter, setDateFilter] = useState({
        startDate: "",
        endDate: "",
    });
    const [statusFilter, setStatusFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [ultgFilter, setUltgFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchQuery]);

    const debouncedSearch = useCallback(
        debounce((query) => {
            setDebouncedSearchQuery(query);
        }, 300),
        [],
    );

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        debouncedSearch(query);
    };

    useEffect(() => {
        const fetchDataBerita = async () => {
            try {
                setLoadingBerita(true);
                const response = await fetch("/api/berita");
                if (!response.ok) {
                    throw new Error("Failed to fetch data");
                }
                const data = await response.json();
                const normalized = (data.berita || []).map((b) => ({
                    ...b,
                    enabled: !!b.enabled,
                }));
                setBeritaData(normalized);
                setLoadingBerita(false);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoadingBerita(false);
            }
        };

        fetchDataBerita();
    }, []);

    const handleToggleHomepage = async (id, currentEnabled) => {
        const nextEnabled = !currentEnabled;
        setBeritaData((prev) =>
            prev.map((b) => (b.id === id ? { ...b, enabled: nextEnabled } : b)),
        );
        try {
            const resp = await fetch(`/api/berita/${id}/homepage`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ enabled: nextEnabled }),
            });
            if (!resp.ok) {
                throw new Error("failed");
            }
        } catch (e) {
            setBeritaData((prev) =>
                prev.map((b) =>
                    b.id === id ? { ...b, enabled: currentEnabled } : b,
                ),
            );
        }
    };

    // Fetch anomali data from API
    useEffect(() => {
        const fetchDataAnomali = async () => {
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

        fetchDataAnomali();
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
                (item) => item.kategori?.name === categoryFilter,
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
                anomaliData.map((item) => item.kategori?.name).filter(Boolean),
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
                background: "rgba(239, 68, 68, 0.7)",
                border: "#DC2626",
            },
            Open: {
                background: "rgba(59, 130, 246, 0.7)",
                border: "#2563EB",
            },
            "In Progress": {
                background: "rgba(254, 240, 138, 0.7)",
                border: "#CA8A04",
            },
            Pending: {
                background: "rgba(254, 215, 170, 0.7)",
                border: "#EA580C",
            },
            Close: {
                background: "rgba(16, 185, 129, 0.7)",
                border: "#059669",
            },
        };

        // Create datasets for each status with clean styling
        const datasets = allStatuses.map((status) => ({
            label: `${status}`,
            data: categories.map(
                (category) => categoryStatusData[category][status] || 0,
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
                date.getMonth() + 1,
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
                filteredData.map((item) => item.tipe || "Tidak Diketahui"),
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
                        (bagian) => bagianData[bagian][tipe] || 0,
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

    // Filter berita based on search query
    const filteredBerita = useMemo(() => {
        if (!debouncedSearchQuery) return beritaData;
        return beritaData.filter((item) =>
            item.judul
                .toLowerCase()
                .includes(debouncedSearchQuery.toLowerCase()),
        );
    }, [beritaData, debouncedSearchQuery]);

    // Pagination logic
    const totalPages = Math.ceil(filteredBerita.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedBerita = filteredBerita.slice(
        startIndex,
        startIndex + itemsPerPage,
    );

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    if (loading || loadingBerita) {
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
                        <p className="text-gray-600 text-lg">
                            Error: {error || errorBerita}
                        </p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <Head title="Dashboard Anomali" />

            {/* Corporate Background */}
            <div className="min-h-auto bg-gray-50">
                {/* Corporate Header Section */}

                <div className="max-w-full bg-white rounded-xl shadow">
                    <Disclosure as="div" className="border-b">
                        {({ open }) => (
                            <>
                                <Disclosure.Button className="group w-full flex items-center justify-between px-5 py-4 text-left rounded-xl transition-colors duration-200 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-50 to-white border border-cyan-100 shadow-cyan-500/20 group-hover:shadow-md">
                                            <FaNewspaper className="text-2xl text-cyan-600" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xl font-semibold text-gray-900 tracking-tight">
                                                Berita
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                Kelola berita pada halaman awal
                                            </span>
                                        </div>
                                    </div>
                                    <div
                                        className={`h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300 ${open ? "bg-blue-50 text-blue-600 rotate-180" : "bg-gray-50 text-gray-400"}`}
                                    >
                                        <FaChevronDown className="h-4 w-4" />
                                    </div>
                                </Disclosure.Button>
                                <Disclosure.Panel className="px-4 pb-4 text-gray-600">
                                    <div className="relative">
                                        {!auth?.user?.permissions?.includes(
                                            "Berita Home",
                                        ) && (
                                            <div className="absolute inset-0 z-10 rounded-xl bg-gradient-to-br from-white/40 via-white/10 to-red-50/40 backdrop-blur-md border border-white/60 flex items-center justify-center px-4 pointer-events-auto">
                                                <div className="inline-flex flex-col items-center gap-3 rounded-2xl mt-4 bg-white/85 px-4 py-4 shadow-lg ring-1 ring-red-100 max-w-sm">
                                                    <div className="flex items-center gap-3 w-full">
                                                        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-400 text-white shadow-sm">
                                                            <FaEye className="h-4 w-4" />
                                                        </span>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-red-500">
                                                                akses terbatas
                                                            </span>
                                                            <span className="text-xs font-medium text-gray-700">
                                                                Menu ini
                                                                dilindungi
                                                                permission
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="w-full h-px bg-gradient-to-r from-transparent via-red-200/70 to-transparent" />
                                                    <div className="w-full text-left">
                                                        <p className="text-sm font-semibold text-gray-900">
                                                            Anda belum memiliki
                                                            izin untuk mengakses
                                                            menu ini.
                                                        </p>
                                                        <p className="mt-1 text-xs text-gray-600">
                                                            Hubungi
                                                            administrator untuk
                                                            mengaktifkan akses
                                                            <span className="mx-1 inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-600 border border-blue-100">
                                                                Berita Home
                                                            </span>
                                                            pada akun Anda.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div
                                            className={`overflow-x-auto ${
                                                !auth?.user?.permissions?.includes(
                                                    "Berita Home",
                                                )
                                                    ? "pointer-events-none"
                                                    : ""
                                            }`}
                                        >
                                            <div className="min-w-full inline-block align-middle">
                                                {/* Search Input */}
                                                <div className="px-6 py-4 bg-white border-b border-gray-100">
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <svg
                                                                className="h-5 w-5 text-gray-400"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 20 20"
                                                                fill="currentColor"
                                                                aria-hidden="true"
                                                            >
                                                                <path
                                                                    fillRule="evenodd"
                                                                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                                                    clipRule="evenodd"
                                                                />
                                                            </svg>
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={searchQuery}
                                                            onChange={
                                                                handleSearchChange
                                                            }
                                                            placeholder="Cari berita berdasarkan judul..."
                                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 rounded-t-lg">
                                                    <div className="col-span-1 text-sm font-semibold text-gray-700">
                                                        No
                                                    </div>
                                                    <div className="col-span-2 text-sm font-semibold text-gray-700 text-center">
                                                        Gambar
                                                    </div>
                                                    <div className="col-span-7 text-sm font-semibold text-gray-700">
                                                        Judul Berita
                                                    </div>
                                                    <div className="col-span-2 text-sm font-semibold text-gray-700 text-center">
                                                        Tampilkan
                                                    </div>
                                                </div>
                                                <div className="space-y-2 p-2">
                                                    {paginatedBerita.length >
                                                    0 ? (
                                                        <>
                                                            {paginatedBerita.map(
                                                                (
                                                                    item,
                                                                    index,
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            item.id
                                                                        }
                                                                        className="grid grid-cols-12 gap-4 items-center p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200 hover:bg-gray-50"
                                                                    >
                                                                        <div className="col-span-1">
                                                                            <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                                                                                {startIndex +
                                                                                    index +
                                                                                    1}
                                                                            </span>
                                                                        </div>
                                                                        <div className="col-span-2 flex justify-center">
                                                                            <div className="relative group">
                                                                                <img
                                                                                    src={
                                                                                        typeof item.gambar ===
                                                                                        "string"
                                                                                            ? `/storage/berita/${
                                                                                                  JSON.parse(
                                                                                                      item.gambar,
                                                                                                  )[0]
                                                                                              }`
                                                                                            : Array.isArray(
                                                                                                    item.gambar,
                                                                                                ) &&
                                                                                                item
                                                                                                    .gambar
                                                                                                    .length >
                                                                                                    0
                                                                                              ? `/storage/berita/${item.gambar[0]}`
                                                                                              : "/img/heroBerita.jpg"
                                                                                    }
                                                                                    alt={
                                                                                        item.judul
                                                                                    }
                                                                                    className="w-16 h-16 object-cover rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-200"
                                                                                />
                                                                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200"></div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-span-7">
                                                                            <div className="space-y-2">
                                                                                <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
                                                                                    {
                                                                                        item.judul
                                                                                    }
                                                                                </h3>
                                                                                <div
                                                                                    className="text-xs text-gray-600 line-clamp-2 leading-relaxed"
                                                                                    dangerouslySetInnerHTML={{
                                                                                        __html: item.isi,
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-span-2 flex justify-center">
                                                                            <div className="flex items-center space-x-3">
                                                                                <Switch
                                                                                    checked={
                                                                                        item.enabled
                                                                                    }
                                                                                    onChange={() =>
                                                                                        handleToggleHomepage(
                                                                                            item.id,
                                                                                            item.enabled,
                                                                                        )
                                                                                    }
                                                                                    className={`${
                                                                                        item.enabled
                                                                                            ? "bg-blue-600"
                                                                                            : "bg-gray-200"
                                                                                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-blue-300`}
                                                                                >
                                                                                    <span
                                                                                        className={`${
                                                                                            item.enabled
                                                                                                ? "translate-x-6"
                                                                                                : "translate-x-1"
                                                                                        } inline-block h-5 w-5 transform rounded-full bg-white border border-gray-300 transition-transform`}
                                                                                    />
                                                                                </Switch>
                                                                                <span className="text-sm font-medium text-gray-700">
                                                                                    {item.enabled
                                                                                        ? "Aktif"
                                                                                        : "Nonaktif"}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ),
                                                            )}

                                                            {filteredBerita.length >
                                                                itemsPerPage && (
                                                                <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-gray-200 pt-8">
                                                                    <div className="text-sm text-gray-500 font-medium">
                                                                        Menampilkan{" "}
                                                                        <span className="text-gray-900 font-bold">
                                                                            {startIndex +
                                                                                1}
                                                                        </span>{" "}
                                                                        sampai{" "}
                                                                        <span className="text-gray-900 font-bold">
                                                                            {Math.min(
                                                                                startIndex +
                                                                                    itemsPerPage,
                                                                                filteredBerita.length,
                                                                            )}
                                                                        </span>{" "}
                                                                        dari{" "}
                                                                        <span className="text-gray-900 font-bold">
                                                                            {
                                                                                filteredBerita.length
                                                                            }
                                                                        </span>{" "}
                                                                        hasil
                                                                    </div>

                                                                    <div className="flex items-center gap-2">
                                                                        <button
                                                                            onClick={() =>
                                                                                handlePageChange(
                                                                                    currentPage -
                                                                                        1,
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                currentPage ===
                                                                                1
                                                                            }
                                                                            className={`h-10 px-4 flex items-center justify-center rounded-xl border text-sm font-semibold transition-all duration-200 ${
                                                                                currentPage ===
                                                                                1
                                                                                    ? "border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50"
                                                                                    : "border-gray-200 text-gray-700 hover:bg-white hover:border-blue-300 hover:text-blue-600 hover:shadow-sm"
                                                                            }`}
                                                                        >
                                                                            <FaChevronLeft className="mr-1.5 h-3 w-3" />
                                                                            Sebelumnya
                                                                        </button>

                                                                        <div className="hidden md:flex items-center gap-1">
                                                                            {Array.from(
                                                                                {
                                                                                    length: totalPages,
                                                                                },
                                                                                (
                                                                                    _,
                                                                                    i,
                                                                                ) => {
                                                                                    const page =
                                                                                        i +
                                                                                        1;
                                                                                    // Logic to show limited page numbers if too many pages
                                                                                    if (
                                                                                        totalPages >
                                                                                            5 &&
                                                                                        Math.abs(
                                                                                            currentPage -
                                                                                                page,
                                                                                        ) >
                                                                                            2 &&
                                                                                        page !==
                                                                                            1 &&
                                                                                        page !==
                                                                                            totalPages
                                                                                    ) {
                                                                                        if (
                                                                                            page ===
                                                                                                currentPage -
                                                                                                    3 ||
                                                                                            page ===
                                                                                                currentPage +
                                                                                                    3
                                                                                        ) {
                                                                                            return (
                                                                                                <span
                                                                                                    key={
                                                                                                        page
                                                                                                    }
                                                                                                    className="h-10 w-10 flex items-center justify-center text-gray-400"
                                                                                                >
                                                                                                    ...
                                                                                                </span>
                                                                                            );
                                                                                        }
                                                                                        return null;
                                                                                    }

                                                                                    return (
                                                                                        <button
                                                                                            key={
                                                                                                page
                                                                                            }
                                                                                            onClick={() =>
                                                                                                handlePageChange(
                                                                                                    page,
                                                                                                )
                                                                                            }
                                                                                            className={`h-10 w-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all duration-200 ${
                                                                                                currentPage ===
                                                                                                page
                                                                                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105"
                                                                                                    : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                                                                                            }`}
                                                                                        >
                                                                                            {
                                                                                                page
                                                                                            }
                                                                                        </button>
                                                                                    );
                                                                                },
                                                                            )}
                                                                        </div>

                                                                        <button
                                                                            onClick={() =>
                                                                                handlePageChange(
                                                                                    currentPage +
                                                                                        1,
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                currentPage ===
                                                                                totalPages
                                                                            }
                                                                            className={`h-10 px-4 flex items-center justify-center rounded-xl border text-sm font-semibold transition-all duration-200 ${
                                                                                currentPage ===
                                                                                totalPages
                                                                                    ? "border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50"
                                                                                    : "border-gray-200 text-gray-700 hover:bg-white hover:border-blue-300 hover:text-blue-600 hover:shadow-sm"
                                                                            }`}
                                                                        >
                                                                            Selanjutnya
                                                                            <FaChevronRight className="ml-1.5 h-3 w-3" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-100 border-dashed">
                                                            <p className="font-medium">
                                                                Tidak ada berita
                                                                yang ditemukan
                                                            </p>
                                                            <p className="text-xs mt-1">
                                                                Coba kata kunci
                                                                lain
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Disclosure.Panel>
                            </>
                        )}
                    </Disclosure>

                    <Disclosure
                        as="div"
                        className="border-b border-gray-100/50"
                    >
                        {({ open }) => (
                            <>
                                <Disclosure.Button className="group w-full flex items-center justify-between px-6 py-5 text-left rounded-2xl transition-all duration-300 hover:bg-white hover:shadow-lg hover:shadow-blue-900/5 border border-transparent hover:border-blue-50 focus:outline-none">
                                    <div className="flex items-center gap-5">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-50 to-rose-100 border border-red-100 shadow-lg shadow-red-500/20 group-hover:scale-105 transition-transform duration-300">
                                            <FaChartBar className="text-2xl text-red-700" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xl font-bold text-gray-900 tracking-tight group-hover:text-blue-700 transition-colors">
                                                Anomali Dashboard
                                            </span>
                                            <span className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors">
                                                Monitoring dan analisis data
                                                anomali sistem secara real-time
                                            </span>
                                        </div>
                                    </div>
                                    <div className="hidden lg:flex items-end gap-8 mr-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-gray-900">
                                                {stats.total}
                                            </div>
                                            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                                                Total
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-red-600">
                                                {stats.new}
                                            </div>
                                            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                                                Baru
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        className={`h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300 ${open ? "bg-blue-50 text-blue-600 rotate-180" : "bg-gray-50 text-gray-400"}`}
                                    >
                                        <FaChevronDown className="h-4 w-4" />
                                    </div>
                                </Disclosure.Button>
                                <Disclosure.Panel className="px-2 pb-6 pt-2 text-gray-600">
                                    <div className="relative">
                                        {!auth?.user?.permissions?.includes(
                                            "Anomali Dashboard",
                                        ) && (
                                            <div className="absolute inset-0 z-10 rounded-xl bg-gradient-to-br from-white/40 via-white/10 to-red-50/40 backdrop-blur-md border border-white/60 flex items-center justify-center px-4 pointer-events-auto">
                                                <div className="inline-flex flex-col items-center gap-3 rounded-2xl bg-white/85 px-4 py-4 shadow-lg ring-1 ring-red-100 max-w-sm">
                                                    <div className="flex items-center gap-3 w-full">
                                                        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-400 text-white shadow-sm">
                                                            <FaEye className="h-4 w-4" />
                                                        </span>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-red-500">
                                                                akses terbatas
                                                            </span>
                                                            <span className="text-xs font-medium text-gray-700">
                                                                Menu ini
                                                                dilindungi
                                                                permission
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="w-full h-px bg-gradient-to-r from-transparent via-red-200/70 to-transparent" />
                                                    <div className="w-full text-left">
                                                        <p className="text-sm font-semibold text-gray-900">
                                                            Anda belum memiliki
                                                            izin untuk mengakses
                                                            menu ini.
                                                        </p>
                                                        <p className="mt-1 text-xs text-gray-600">
                                                            Hubungi
                                                            administrator untuk
                                                            mengaktifkan akses
                                                            <span className="mx-1 inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-600 border border-blue-100">
                                                                Anomali
                                                                Dashboard
                                                            </span>
                                                            pada akun Anda.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div
                                            className={`overflow-x-auto ${
                                                !auth?.user?.permissions?.includes(
                                                    "Anomali Dashboard",
                                                )
                                                    ? "pointer-events-none"
                                                    : ""
                                            }`}
                                        >
                                            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 transition-all hover:shadow-md">
                                                    <div className="flex items-center space-x-4 mb-8">
                                                        <div className="bg-blue-50 p-3 rounded-xl">
                                                            <FaFilter className="text-blue-600 text-xl" />
                                                        </div>
                                                        <div>
                                                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                                                                Filter Data
                                                            </h2>
                                                            <p className="text-sm text-gray-500 mt-1">
                                                                Sesuaikan
                                                                parameter untuk
                                                                menyaring data
                                                                anomali
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                                        {/* Date Range Filter */}
                                                        <div className="space-y-2">
                                                            <label className=" text-sm font-medium text-gray-700 flex items-center space-x-2">
                                                                <FaCalendar className="text-gray-500 text-sm" />
                                                                <span>
                                                                    Tanggal
                                                                    Mulai
                                                                </span>
                                                            </label>
                                                            <input
                                                                type="date"
                                                                value={
                                                                    dateFilter.startDate
                                                                }
                                                                onChange={(e) =>
                                                                    setDateFilter(
                                                                        (
                                                                            prev,
                                                                        ) => ({
                                                                            ...prev,
                                                                            startDate:
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                        }),
                                                                    )
                                                                }
                                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-gray-50/50 hover:bg-white transition-all duration-200 text-gray-700 text-sm"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className=" text-sm font-medium text-gray-700 flex items-center space-x-2">
                                                                <FaCalendar className="text-gray-500 text-sm" />
                                                                <span>
                                                                    Tanggal
                                                                    Akhir
                                                                </span>
                                                            </label>
                                                            <input
                                                                type="date"
                                                                value={
                                                                    dateFilter.endDate
                                                                }
                                                                onChange={(e) =>
                                                                    setDateFilter(
                                                                        (
                                                                            prev,
                                                                        ) => ({
                                                                            ...prev,
                                                                            endDate:
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                        }),
                                                                    )
                                                                }
                                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-gray-50/50 hover:bg-white transition-all duration-200 text-gray-700 text-sm"
                                                            />
                                                        </div>
                                                        {/* Status Filter */}
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                                                                <FaInfoCircle className="text-gray-500 text-sm" />
                                                                <span>
                                                                    Status
                                                                </span>
                                                            </label>
                                                            <Listbox
                                                                value={
                                                                    statusFilter
                                                                }
                                                                onChange={
                                                                    setStatusFilter
                                                                }
                                                            >
                                                                <div className="relative">
                                                                    <Listbox.Button className="relative w-full cursor-pointer rounded-xl bg-gray-50/50 hover:bg-white py-3 pl-4 pr-10 text-left shadow-sm border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200 sm:text-sm">
                                                                        <span className="block truncate">
                                                                            {statusFilter ===
                                                                            "all"
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
                                                                        as={
                                                                            Fragment
                                                                        }
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
                                                                                            Status
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
                                                                            ].map(
                                                                                (
                                                                                    status,
                                                                                ) => (
                                                                                    <Listbox.Option
                                                                                        key={
                                                                                            status
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
                                                                                            status
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
                                                                                                        status
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
                                                                                ),
                                                                            )}
                                                                        </Listbox.Options>
                                                                    </Transition>
                                                                </div>
                                                            </Listbox>
                                                        </div>
                                                        {/* Category Filter */}
                                                        <div className="space-y-2">
                                                            <Listbox
                                                                value={
                                                                    categoryFilter
                                                                }
                                                                onChange={
                                                                    setCategoryFilter
                                                                }
                                                            >
                                                                <div className="relative">
                                                                    <Listbox.Label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                                                                        <FaFolder className="text-gray-500 text-sm" />
                                                                        <span>
                                                                            Kategori
                                                                        </span>
                                                                    </Listbox.Label>
                                                                    <Listbox.Button className="relative w-full cursor-pointer rounded-xl bg-gray-50/50 hover:bg-white py-3 pl-4 pr-10 text-left shadow-sm border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200 sm:text-sm">
                                                                        <span className="block truncate">
                                                                            {categoryFilter ===
                                                                            "all"
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
                                                                        as={
                                                                            Fragment
                                                                        }
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
                                                                                (
                                                                                    category,
                                                                                ) => (
                                                                                    <Listbox.Option
                                                                                        key={
                                                                                            category
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
                                                                                            category
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
                                                                                ),
                                                                            )}
                                                                        </Listbox.Options>
                                                                    </Transition>
                                                                </div>
                                                            </Listbox>
                                                        </div>
                                                        {/* ULTG Filter */}
                                                        {availableUltgOptions.length >
                                                            1 && (
                                                            <div className="space-y-2">
                                                                <Listbox
                                                                    value={
                                                                        ultgFilter
                                                                    }
                                                                    onChange={
                                                                        setUltgFilter
                                                                    }
                                                                >
                                                                    <div className="relative">
                                                                        <Listbox.Label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                                                                            <FaBuilding className="text-gray-500 text-sm" />
                                                                            <span>
                                                                                ULTG
                                                                            </span>
                                                                        </Listbox.Label>
                                                                        <Listbox.Button className="relative w-full cursor-pointer rounded-xl bg-gray-50/50 hover:bg-white py-3 pl-4 pr-10 text-left shadow-sm border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200 sm:text-sm">
                                                                            <span className="block truncate">
                                                                                {availableUltgOptions.find(
                                                                                    (
                                                                                        option,
                                                                                    ) =>
                                                                                        option.value ===
                                                                                        ultgFilter,
                                                                                )
                                                                                    ?.label ||
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
                                                                            as={
                                                                                Fragment
                                                                            }
                                                                            leave="transition ease-in duration-100"
                                                                            leaveFrom="opacity-100"
                                                                            leaveTo="opacity-0"
                                                                        >
                                                                            <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                                                                                {availableUltgOptions.map(
                                                                                    (
                                                                                        option,
                                                                                    ) => (
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
                                                                                    ),
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
                                            {/* Corporate Statistics Cards */}
                                            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-10">
                                                    {/* Total Card */}
                                                    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 group relative overflow-hidden">
                                                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-50 to-transparent rounded-bl-full -mr-4 -mt-4 opacity-50"></div>
                                                        <div className="flex items-center justify-between mb-6 relative">
                                                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3.5 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-sm border border-gray-100">
                                                                <FaChartBar className="text-xl text-gray-700" />
                                                            </div>
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-50 text-gray-600 border border-gray-100 uppercase tracking-wide">
                                                                Total
                                                            </span>
                                                        </div>
                                                        <div className="relative">
                                                            <p className="text-gray-500 text-sm font-medium mb-1">
                                                                Total Anomali
                                                            </p>
                                                            <h3 className="text-3xl font-bold text-gray-900 tracking-tight">
                                                                {stats.total}
                                                            </h3>
                                                        </div>
                                                    </div>

                                                    {/* New Card */}
                                                    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 group relative overflow-hidden">
                                                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-50 to-transparent rounded-bl-full -mr-4 -mt-4 opacity-50"></div>
                                                        <div className="flex items-center justify-between mb-6 relative">
                                                            <div className="bg-gradient-to-br from-red-50 to-red-100 p-3.5 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-sm border border-red-100">
                                                                <FaExclamationTriangle className="text-xl text-red-600" />
                                                            </div>
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-100 uppercase tracking-wide">
                                                                New
                                                            </span>
                                                        </div>
                                                        <div className="relative">
                                                            <p className="text-gray-500 text-sm font-medium mb-1">
                                                                Status New
                                                            </p>
                                                            <h3 className="text-3xl font-bold text-gray-900 tracking-tight">
                                                                {stats.new}
                                                            </h3>
                                                        </div>
                                                    </div>

                                                    {/* Open Card */}
                                                    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 group relative overflow-hidden">
                                                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-full -mr-4 -mt-4 opacity-50"></div>
                                                        <div className="flex items-center justify-between mb-6 relative">
                                                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3.5 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-sm border border-blue-100">
                                                                <FaClock className="text-xl text-blue-600" />
                                                            </div>
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wide">
                                                                Open
                                                            </span>
                                                        </div>
                                                        <div className="relative">
                                                            <p className="text-gray-500 text-sm font-medium mb-1">
                                                                Status Open
                                                            </p>
                                                            <h3 className="text-3xl font-bold text-gray-900 tracking-tight">
                                                                {stats.open}
                                                            </h3>
                                                        </div>
                                                    </div>

                                                    {/* In Progress Card */}
                                                    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 group relative overflow-hidden">
                                                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-50 to-transparent rounded-bl-full -mr-4 -mt-4 opacity-50"></div>
                                                        <div className="flex items-center justify-between mb-6 relative">
                                                            <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-3.5 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-sm border border-amber-100">
                                                                <FaCog className="text-xl text-amber-600" />
                                                            </div>
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-wide">
                                                                Progress
                                                            </span>
                                                        </div>
                                                        <div className="relative">
                                                            <p className="text-gray-500 text-sm font-medium mb-1">
                                                                In Progress
                                                            </p>
                                                            <h3 className="text-3xl font-bold text-gray-900 tracking-tight">
                                                                {
                                                                    stats.inProgress
                                                                }
                                                            </h3>
                                                        </div>
                                                    </div>

                                                    {/* Pending Card */}
                                                    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 group relative overflow-hidden">
                                                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-50 to-transparent rounded-bl-full -mr-4 -mt-4 opacity-50"></div>
                                                        <div className="flex items-center justify-between mb-6 relative">
                                                            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3.5 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-sm border border-orange-100">
                                                                <FaSpinner className="text-xl text-orange-600" />
                                                            </div>
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-100 uppercase tracking-wide">
                                                                Pending
                                                            </span>
                                                        </div>
                                                        <div className="relative">
                                                            <p className="text-gray-500 text-sm font-medium mb-1">
                                                                Status Pending
                                                            </p>
                                                            <h3 className="text-3xl font-bold text-gray-900 tracking-tight">
                                                                {stats.pending}
                                                            </h3>
                                                        </div>
                                                    </div>

                                                    {/* Close Card */}
                                                    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 group relative overflow-hidden">
                                                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-50 to-transparent rounded-bl-full -mr-4 -mt-4 opacity-50"></div>
                                                        <div className="flex items-center justify-between mb-6 relative">
                                                            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-3.5 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-sm border border-emerald-100">
                                                                <FaCheckCircle className="text-xl text-emerald-600" />
                                                            </div>
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wide">
                                                                Close
                                                            </span>
                                                        </div>
                                                        <div className="relative">
                                                            <p className="text-gray-500 text-sm font-medium mb-1">
                                                                Status Close
                                                            </p>
                                                            <h3 className="text-3xl font-bold text-gray-900 tracking-tight">
                                                                {stats.close}
                                                            </h3>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Corporate Chart Grid */}
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                    {/* Combined Status and Category Chart */}
                                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 hover:shadow-lg transition-shadow duration-300">
                                                        <div className="flex items-center justify-between mb-8">
                                                            <div className="flex items-center gap-4">
                                                                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-3 rounded-xl">
                                                                    <FaChartBar className="text-indigo-600 text-xl" />
                                                                </div>
                                                                <div>
                                                                    <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                                                                        Distribusi
                                                                        Status &
                                                                        Kategori
                                                                    </h3>
                                                                    <p className="text-sm text-gray-500">
                                                                        Analisis
                                                                        breakdown
                                                                        anomali
                                                                        berdasarkan
                                                                        status
                                                                        dan
                                                                        kategori
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                                                            <div className="h-80 w-full relative">
                                                                <Bar
                                                                    data={prepareCombinedData()}
                                                                    options={{
                                                                        ...chartOptions,
                                                                        plugins:
                                                                            {
                                                                                ...chartOptions.plugins,
                                                                                title: {
                                                                                    display: false,
                                                                                },
                                                                            },
                                                                    }}
                                                                    style={{
                                                                        maxWidth:
                                                                            "100%",
                                                                        maxHeight:
                                                                            "100%",
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Anomali Distribution Horizontal Bar Chart */}
                                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 hover:shadow-lg transition-shadow duration-300">
                                                        <div className="flex items-center justify-between mb-8">
                                                            <div className="flex items-center gap-4">
                                                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-xl">
                                                                    <FaChartBar className="text-purple-600 text-xl" />
                                                                </div>
                                                                <div>
                                                                    <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                                                                        Distribusi
                                                                        Anomali
                                                                        Horizontal
                                                                    </h3>
                                                                    <p className="text-sm text-gray-500">
                                                                        Distribusi
                                                                        anomali
                                                                        berdasarkan
                                                                        bagian
                                                                        dan tipe
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                                                            <div className="h-80 w-full relative">
                                                                <Bar
                                                                    data={prepareHorizontalBarData()}
                                                                    options={
                                                                        horizontalBarOptions
                                                                    }
                                                                    style={{
                                                                        maxWidth:
                                                                            "100%",
                                                                        maxHeight:
                                                                            "100%",
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-8 grid grid-cols-1 gap-8">
                                                    {/* Monthly Trend Chart */}
                                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 hover:shadow-lg transition-shadow duration-300">
                                                        <div className="flex items-center justify-between mb-8">
                                                            <div className="flex items-center gap-4">
                                                                <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-3 rounded-xl">
                                                                    <FaChartLine className="text-cyan-600 text-xl" />
                                                                </div>
                                                                <div>
                                                                    <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                                                                        Tren
                                                                        Anomali
                                                                        Bulanan
                                                                    </h3>
                                                                    <p className="text-sm text-gray-500">
                                                                        Perkembangan
                                                                        jumlah
                                                                        anomali
                                                                        dari
                                                                        waktu ke
                                                                        waktu
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                                                            <div className="h-96 w-full relative">
                                                                <Line
                                                                    data={prepareMonthlyTrendData()}
                                                                    options={{
                                                                        ...lineOptions,
                                                                        plugins:
                                                                            {
                                                                                ...lineOptions.plugins,
                                                                                title: {
                                                                                    display: false,
                                                                                },
                                                                            },
                                                                    }}
                                                                    style={{
                                                                        maxWidth:
                                                                            "100%",
                                                                        maxHeight:
                                                                            "100%",
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Disclosure.Panel>
                            </>
                        )}
                    </Disclosure>
                </div>
            </div>
        </DashboardLayout>
    );
}
