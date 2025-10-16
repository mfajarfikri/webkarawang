import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link } from "@inertiajs/react";
import { VscPreview } from "react-icons/vsc";
import {
    FaFilter,
    FaChevronLeft,
    FaChevronRight,
    FaCheck,
    FaFileExcel,
    FaClipboard,
    FaSearch,
    FaPlusCircle,
    FaTable,
    FaChevronDown,
    FaTimes,
    FaCalendarAlt,
} from "react-icons/fa";
import ErrorBoundary from "@/Components/ErrorBoundary";
import { useState, useMemo, useEffect, useCallback, Fragment } from "react";
import { MdOutlineReportProblem } from "react-icons/md";
import { Listbox, Combobox, Transition } from "@headlessui/react";
import { formatDate } from "@/Components/Utils/formatDate";
import SecondaryButton from "@/Components/SecondaryButton";
import PrimaryButton from "@/Components/PrimaryButton";
import Modal from "@/Components/Modal";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

function StatusBadge({ status }) {
    let color = "bg-gray-300 text-gray-700";
    if (status === "New") color = "bg-rose-200 text-rose-800";
    else if (status === "In Progress") color = "bg-yellow-100 text-yellow-800";
    else if (status === "Open") color = "bg-blue-100 text-blue-800";
    else if (status === "Pending") color = "bg-orange-100 text-orange-800";
    else if (status === "Close") color = "bg-emerald-100 text-emerald-700";
    else if (status === "Rejected") color = "bg-red-100 text-red-800";
    return (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${color}`}>
            {status}
        </span>
    );
}

function TipeBadge({ tipe }) {
    let color = "bg-gray-200 text-gray-700";
    if (tipe === "Major") color = "bg-rose-200 text-rose-900";
    else if (tipe === "Minor") color = "bg-emerald-100 text-emerald-800";
    return (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${color}`}>
            {tipe}
        </span>
    );
}

function UltgBadge({ ultg }) {
    let color = "bg-gray-300 text-gray-700";
    if (ultg === "ULTG Karawang") color = "bg-blue-100 text-blue-700";
    else if (ultg === "ULTG Purwakarta") color = "bg-green-100 text-green-700";
    return (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${color}`}>
            {ultg}
        </span>
    );
}

// Status color mapping for better organization
const STATUS_COLORS = {
    Open: { bg: "#3b82f6", border: "#2563eb", name: "Open" },
    Close: { bg: "#10b981", border: "#059669", name: "Close" },
    "In Progress": { bg: "#f59e0b", border: "#d97706", name: "In Progress" },
    Pending: { bg: "#ef4444", border: "#dc2626", name: "Pending" },
};

// AnomaliCalendar Component
function AnomaliCalendar({ filteredAnomalis, onEventClick }) {
    const [windowWidth, setWindowWidth] = useState(
        typeof window !== "undefined" ? window.innerWidth : 1024
    );

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const getStatusColor = (status) => {
        return (
            STATUS_COLORS[status] || {
                bg: "#6b7280",
                border: "#4b5563",
                name: status,
            }
        );
    };

    const formatEventTitle = (anomali, isMobile) => {
        if (isMobile) {
            return anomali.kategori?.name || "Anomali";
        }
        return `${anomali.ultg || "UPT Karawang"} - ${anomali.judul || "N/A"}`;
    };

    const processEvents = () => {
        return filteredAnomalis.map((anomali) => {
            const startDate = anomali.tanggal_mulai;
            const endDate = anomali.tanggal_selesai || anomali.tanggal_mulai;
            const statusColor = getStatusColor(anomali.status);
            const isMobile = windowWidth < 768;

            return {
                id: anomali.id,
                title: formatEventTitle(anomali, isMobile),
                start: startDate,
                end:
                    endDate !== startDate
                        ? new Date(
                              new Date(endDate).getTime() + 24 * 60 * 60 * 1000
                          )
                              .toISOString()
                              .split("T")[0]
                        : undefined,
                backgroundColor: statusColor.bg,
                borderColor: statusColor.border,
                textColor: "#ffffff",
                extendedProps: { anomali },
            };
        });
    };

    const handleEventClick = (info) => {
        const anomali = info.event.extendedProps.anomali;
        if (onEventClick) {
            onEventClick(anomali);
        } else {
            // Default alert behavior
            const message =
                `📋 Detail Anomali\n\n` +
                `🏷️ Kategori: ${anomali.kategori?.nama || "N/A"}\n` +
                `🏢 ULTG: ${anomali.ultg?.nama || "N/A"}\n` +
                `📊 Status: ${anomali.status}\n` +
                `📅 Tanggal Mulai: ${anomali.tanggal_mulai}\n` +
                `📅 Tanggal Selesai: ${
                    anomali.tanggal_selesai || "Belum selesai"
                }`;
            alert(message);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <FaCalendarAlt className="w-5 h-5 text-blue-600" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Kalender Anomali
                                </h2>
                                <p className="text-sm text-gray-600 mt-0.5">
                                    Tampilan kalender untuk monitoring anomali
                                </p>
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center">
                            <div className="bg-white/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
                                <span className="text-sm font-medium text-gray-700">
                                    Dashboard
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendar Container */}
            <div className="p-6">
                <div className="calendar-container bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                    <FullCalendar
                        plugins={[
                            dayGridPlugin,
                            timeGridPlugin,
                            interactionPlugin,
                        ]}
                        initialView="dayGridMonth"
                        headerToolbar={{
                            left: "prev,next today",
                            center: "title",
                            right:
                                windowWidth > 768
                                    ? "dayGridMonth,timeGridWeek,timeGridDay"
                                    : "dayGridMonth",
                        }}
                        events={processEvents()}
                        eventClick={handleEventClick}
                        height="auto"
                        locale="id"
                        dayMaxEvents={windowWidth < 768 ? 2 : 3}
                        moreLinkClick="popover"
                        eventDisplay="block"
                        displayEventTime={false}
                        aspectRatio={windowWidth < 768 ? 1.0 : 1.35}
                        eventClassNames="cursor-pointer hover:opacity-90 transition-all duration-200 hover:scale-[1.02]"
                        dayHeaderClassNames="bg-gray-100/80 text-gray-700 font-semibold text-sm"
                        viewClassNames="bg-white rounded-lg shadow-sm"
                        buttonText={{
                            today: "Hari Ini",
                            month: "Bulan",
                            week: "Minggu",
                            day: "Hari",
                        }}
                    />
                </div>

                {/* Enhanced Status Legend */}
                <div className="mt-6 border-t border-gray-100 pt-6">
                    <div className="flex items-center mb-4">
                        <h4 className="text-sm font-semibold text-gray-700">
                            Status Indikator
                        </h4>
                        <div className="h-px bg-gradient-to-r from-gray-200 to-transparent flex-1 ml-4"></div>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {Object.entries(STATUS_COLORS).map(
                            ([status, colors]) => (
                                <div
                                    key={status}
                                    className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all duration-200 hover:border-gray-300"
                                >
                                    <div
                                        className="w-3 h-3 rounded-full shadow-sm"
                                        style={{ backgroundColor: colors.bg }}
                                    ></div>
                                    <span className="text-sm font-medium text-gray-700">
                                        {colors.name}
                                    </span>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Anomali({ anomalis = [], auth = [], kategoris = [] }) {
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [exportMonths, setExportMonths] = useState([]);
    const [monthQuery, setMonthQuery] = useState("");
    const [exportUltgs, setExportUltgs] = useState([]);
    const [exportGardus, setExportGardus] = useState([]);
    const [activeTab, setActiveTab] = useState(() => {
        // Mengambil nilai activeTab dari localStorage jika ada
        const savedTab = localStorage.getItem("anomaliActiveTab");
        return savedTab || "tabel";
    });

    // Update localStorage when activeTab changes
    useEffect(() => {
        localStorage.setItem("anomaliActiveTab", activeTab);
    }, [activeTab]);
    const [garduQuery, setGarduQuery] = useState("");
    const [ultgQuery, setUltgQuery] = useState("");
    const [forceUpdate, setForceUpdate] = useState(0);

    // Query states for filter comboboxes
    const [bagianQuery, setBagianQuery] = useState("");
    const [kategoriQuery, setKategoriQuery] = useState("");
    const [statusQuery, setStatusQuery] = useState("");

    // Filter states
    const [filterOpen, setFilterOpen] = useState(false);
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [selectedGarduInduk, setSelectedGarduInduk] = useState("");
    const [selectedBagian, setSelectedBagian] = useState("");
    const [selectedKategori, setSelectedKategori] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");

    // Modal export state
    const [showExportModal, setShowExportModal] = useState(false);

    const monthOptions = useMemo(() => {
        const months = new Set();
        anomalis.forEach((a) => {
            if (a.tanggal_kejadian) {
                const d = new Date(a.tanggal_kejadian);
                const y = d.getFullYear();
                const m = (d.getMonth() + 1).toString().padStart(2, "0");
                months.add(`${y}-${m}`);
            }
        });
        return Array.from(months).sort((a, b) => b.localeCompare(a));
    }, [anomalis]);

    const filteredMonthOptions = useMemo(() => {
        if (!monthQuery) return monthOptions;
        return monthOptions.filter((m) => {
            if (m === "all") return true;
            const [y, mo] = m.split("-");
            const bulan = [
                "Januari",
                "Februari",
                "Maret",
                "April",
                "Mei",
                "Juni",
                "Juli",
                "Agustus",
                "September",
                "Oktober",
                "November",
                "Desember",
            ][parseInt(mo, 10) - 1];
            const label = `${bulan} ${y}`.toLowerCase();
            return label.includes(monthQuery.toLowerCase());
        });
    }, [monthOptions, monthQuery]);

    const ultgOptions = useMemo(() => {
        const set = new Set(anomalis.map((a) => a.ultg).filter(Boolean));
        return Array.from(set).sort();
    }, [anomalis]);

    const filteredUltgOptions =
        ultgQuery === ""
            ? ultgOptions
            : ultgOptions.filter((u) =>
                  u.toLowerCase().includes(ultgQuery.toLowerCase())
              );

    const garduOptions = useMemo(() => {
        let filteredAnomalies = anomalis;

        // Filter berdasarkan wilayah user, kecuali jika wilayah = 'upt karawang'
        if (auth?.user?.wilayah) {
            const wilayah = auth.user.wilayah.trim().toLowerCase();

            if (wilayah === "ultg karawang") {
                filteredAnomalies = anomalis.filter(
                    (a) => (a.ultg || "").toLowerCase() === "ultg karawang"
                );
            } else if (wilayah === "ultg purwakarta") {
                filteredAnomalies = anomalis.filter(
                    (a) => (a.ultg || "").toLowerCase() === "ultg purwakarta"
                );
            }
            // Untuk 'upt karawang', tampilkan semua gardu induk (tidak ada filter)
        }

        const set = new Set(
            filteredAnomalies.map((a) => a.gardu_induk?.name).filter(Boolean)
        );
        return Array.from(set).sort();
    }, [anomalis, auth]);

    // Filter garduOptions sesuai query pencarian
    const filteredGarduOptions = useMemo(() => {
        if (!garduQuery) return garduOptions;
        return garduOptions.filter((g) =>
            g.toLowerCase().includes(garduQuery.toLowerCase())
        );
    }, [garduOptions, garduQuery]);

    // Options for filters - generate from actual data
    const bagianOptions = useMemo(() => {
        const set = new Set(anomalis.map((a) => a.bagian).filter(Boolean));
        return Array.from(set).sort();
    }, [anomalis]);

    const kategoriOptions = useMemo(() => {
        const set = new Set(
            anomalis.map((a) => a.kategori?.name).filter(Boolean)
        );
        return Array.from(set).sort();
    }, [anomalis]);

    const statusOptions = useMemo(() => {
        const set = new Set(anomalis.map((a) => a.status).filter(Boolean));
        return Array.from(set).sort();
    }, [anomalis]);

    // Filtered options for comboboxes
    const filteredBagianOptions = useMemo(() => {
        if (!bagianQuery) return bagianOptions;
        return bagianOptions.filter((bagian) =>
            bagian.toLowerCase().includes(bagianQuery.toLowerCase())
        );
    }, [bagianOptions, bagianQuery]);

    const filteredKategoriOptions = useMemo(() => {
        if (!kategoriQuery) return kategoriOptions;
        return kategoriOptions.filter((kategori) =>
            kategori.toLowerCase().includes(kategoriQuery.toLowerCase())
        );
    }, [kategoriOptions, kategoriQuery]);

    const filteredStatusOptions = useMemo(() => {
        if (!statusQuery) return statusOptions;
        return statusOptions.filter((status) =>
            status.toLowerCase().includes(statusQuery.toLowerCase())
        );
    }, [statusOptions, statusQuery]);

    useEffect(() => {
        setMonthQuery("");
    }, [exportMonths]);

    // Menyimpan activeTab ke localStorage setiap kali berubah
    useEffect(() => {
        localStorage.setItem("anomaliActiveTab", activeTab);
    }, [activeTab]);

    const handleExport = () => {
        const params = new URLSearchParams();

        if (exportMonths.length > 0) {
            params.append("months", exportMonths.join(","));
        }

        if (exportUltgs.length > 0) {
            params.append("ultgs", exportUltgs.join(","));
        }

        if (exportGardus.length > 0) {
            params.append("gardus", exportGardus.join(","));
        }

        let url = route("dashboard.anomali.export") + "?" + params.toString();
        window.location.href = url;
    };

    const handleRowsPerPageChange = (val) => {
        setRowsPerPage(val);
        setPage(1);
    };

    const handleSearch = (val) => {
        setSearchTerm(val);
        setPage(1);
    };

    // Filter functions
    const handleClearFilters = () => {
        setDateFrom("");
        setDateTo("");
        setSelectedGarduInduk("");
        setSelectedBagian("");
        setSelectedKategori("");
        setSelectedStatus("");
        setGarduQuery("");
        setBagianQuery("");
        setKategoriQuery("");
        setStatusQuery("");
        setPage(1);
    };

    const handleApplyFilters = () => {
        setPage(1);
        setFilterOpen(false);
    };

    // Filter data berdasarkan wilayah user login dan search term
    const filteredAnomalis = useMemo(() => {
        if (!Array.isArray(anomalis)) return [];

        let filtered = anomalis;

        // Filter by wilayah if user has wilayah
        if (auth?.user?.wilayah) {
            const wilayah = auth.user.wilayah.trim().toLowerCase();

            if (wilayah === "ultg karawang") {
                filtered = filtered.filter(
                    (a) => (a.ultg || "").toLowerCase() === "ultg karawang"
                );
            } else if (wilayah === "ultg purwakarta") {
                filtered = filtered.filter(
                    (a) => (a.ultg || "").toLowerCase() === "ultg purwakarta"
                );
            }
            // For "upt karawang", show all data (no additional filtering)
        }

        // Filter by search term
        if (searchTerm && searchTerm.trim() !== "") {
            const searchLower = searchTerm.toLowerCase().trim();
            filtered = filtered.filter((a) => {
                return (
                    (a.judul || "").toLowerCase().includes(searchLower) ||
                    (a.gardu_induk?.name || "")
                        .toLowerCase()
                        .includes(searchLower) ||
                    (a.bagian || "").toLowerCase().includes(searchLower) ||
                    (a.kategori?.name || "")
                        .toLowerCase()
                        .includes(searchLower) ||
                    (a.peralatan?.name || "")
                        .toLowerCase()
                        .includes(searchLower) ||
                    (a.ultg || "").toLowerCase().includes(searchLower)
                );
            });
        }

        // Filter by date range
        if (dateFrom) {
            filtered = filtered.filter((a) => {
                if (!a.tanggal_kejadian) return false;
                const itemDate = new Date(a.tanggal_kejadian);
                const fromDate = new Date(dateFrom);
                return itemDate >= fromDate;
            });
        }

        if (dateTo) {
            filtered = filtered.filter((a) => {
                if (!a.tanggal_kejadian) return false;
                const itemDate = new Date(a.tanggal_kejadian);
                const toDate = new Date(dateTo);
                return itemDate <= toDate;
            });
        }

        // Filter by gardu induk
        if (selectedGarduInduk) {
            filtered = filtered.filter(
                (a) => (a.gardu_induk?.name || "") === selectedGarduInduk
            );
        }

        // Filter by bagian
        if (selectedBagian) {
            filtered = filtered.filter(
                (a) => (a.bagian || "") === selectedBagian
            );
        }

        // Filter by kategori
        if (selectedKategori) {
            filtered = filtered.filter(
                (a) => (a.kategori?.name || "") === selectedKategori
            );
        }

        // Filter by status
        if (selectedStatus) {
            filtered = filtered.filter(
                (a) => (a.status || "") === selectedStatus
            );
        }

        return filtered;
    }, [
        anomalis,
        auth,
        searchTerm,
        dateFrom,
        dateTo,
        selectedGarduInduk,
        selectedBagian,
        selectedKategori,
        selectedStatus,
    ]);

    const totalRows = filteredAnomalis.length;
    const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));

    const paginatedData = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        return filteredAnomalis.slice(start, start + rowsPerPage);
    }, [filteredAnomalis, page, rowsPerPage]);

    const paginatedDataReview = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        return filteredAnomalis
            .filter(
                (a) =>
                    a.status &&
                    a.status.toLowerCase() === "new" &&
                    a.ultg &&
                    a.ultg.trim().toLowerCase() ===
                        (auth.user.wilayah || "").trim().toLowerCase()
            )
            .slice(start, start + rowsPerPage);
    }, [filteredAnomalis, page, rowsPerPage]);
    const totalRowsReview = filteredAnomalis.filter(
        (a) => a.status && a.status.toLowerCase() === "new"
    ).length;
    const totalPagesReview = Math.max(
        1,
        Math.ceil(totalRowsReview / rowsPerPage)
    );

    const paginateDataAssign = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        return filteredAnomalis
            .filter(
                (a) =>
                    a.ultg &&
                    a.ultg.trim().toLowerCase() ===
                        (auth.user.wilayah || "").trim().toLowerCase() &&
                    auth.user.bidang &&
                    a.bidang_assigned === auth.user.bidang
            )
            .slice(start, start + rowsPerPage);
    }, [filteredAnomalis, page, rowsPerPage]);

    const totalRowsAssign = filteredAnomalis.filter(
        (a) =>
            a.ultg &&
            a.ultg.trim().toLowerCase() ===
                (auth.user.wilayah || "").trim().toLowerCase() &&
            auth.user.bidang &&
            a.bidang_assigned === auth.user.bidang
    ).length;
    const totalPagesAssign = Math.max(
        1,
        Math.ceil(totalRowsAssign / rowsPerPage)
    );

    const paginateDataRenev = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        return filteredAnomalis
            .filter(
                (a) =>
                    a.status &&
                    a.status.toLowerCase() === "open" &&
                    a.bidang_assigned &&
                    a.bidang_assigned.toLowerCase() === "renev"
            )
            .slice(start, start + rowsPerPage);
    }, [filteredAnomalis, page, rowsPerPage]);
    const totalRowsRenev = filteredAnomalis.filter(
        (a) =>
            a.status &&
            a.status.toLowerCase() === "open" &&
            a.bidang_assigned &&
            a.bidang_assigned.toLowerCase() === "renev"
    ).length;
    const totalPagesRenev = Math.max(
        1,
        Math.ceil(totalRowsRenev / rowsPerPage)
    );

    const handlePrev = () => setPage((p) => Math.max(1, p - 1));
    const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

    return (
        <>
            <Head title="Anomali">
                <link
                    href="https://cdn.jsdelivr.net/npm/@fullcalendar/core@6.1.10/main.min.css"
                    rel="stylesheet"
                />
                <link
                    href="https://cdn.jsdelivr.net/npm/@fullcalendar/daygrid@6.1.10/main.min.css"
                    rel="stylesheet"
                />
                <link
                    href="https://cdn.jsdelivr.net/npm/@fullcalendar/timegrid@6.1.10/main.min.css"
                    rel="stylesheet"
                />
            </Head>
            <DashboardLayout>
                <div className="w-full mx-auto">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-0 overflow-hidden">
                        {/* Tabs */}
                        <div className="flex border-b border-gray-200 bg-gray-50">
                            <button
                                className={`
                                            px-6 py-3
                                            text-sm font-semibold
                                            focus:outline-none
                                            transition-colors duration-200
                                            border-b-2
                                            flex items-center gap-2
                                            ${
                                                activeTab === "tabel"
                                                    ? "border-blue-600 text-blue-700 bg-white shadow-sm"
                                                    : "border-transparent text-gray-500 hover:text-blue-600 hover:bg-gray-50"
                                            }
                                        `}
                                onClick={() => setActiveTab("tabel")}
                                type="button"
                            >
                                <FaTable className="text-lg" />
                                <span>Anomali</span>
                            </button>
                            <button
                                className={`
                                            px-6 py-3
                                            text-sm font-semibold
                                            focus:outline-none
                                            transition-colors duration-200
                                            border-b-2
                                            flex items-center gap-2
                                            ${
                                                activeTab === "kalender"
                                                    ? "border-blue-600 text-blue-700 bg-white shadow-sm"
                                                    : "border-transparent text-gray-500 hover:text-blue-600 hover:bg-gray-50"
                                            }
                                        `}
                                onClick={() => setActiveTab("kalender")}
                                type="button"
                            >
                                <FaCalendarAlt className="text-lg" />
                                <span>Jadwal Anomali</span>
                            </button>

                            {auth.user.bidang &&
                            auth.user.bidang.toLowerCase() === "multg" ? (
                                <button
                                    className={`
                                            px-6 py-3
                                            text-sm font-semibold 
                                            focus:outline-none
                                            transition-colors duration-200
                                            border-b-2
                                            flex items-center gap-2
                                            relative
                                            ${
                                                activeTab === "approval"
                                                    ? "border-blue-600 text-blue-700 bg-white shadow-sm"
                                                    : "border-transparent text-gray-500 hover:text-blue-600 hover:bg-gray-50"
                                            }
                                        `}
                                    onClick={() => setActiveTab("approval")}
                                    type="button"
                                >
                                    <VscPreview className="text-lg" />
                                    <span>Review Anomali</span>
                                    {totalRowsReview > 0 && (
                                        <span className="absolute top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px] px-1">
                                            {totalRowsReview > 99
                                                ? "99+"
                                                : totalRowsReview}
                                        </span>
                                    )}
                                </button>
                            ) : auth.user.bidang &&
                              (auth.user.bidang.toLowerCase() === "hargi" ||
                                  auth.user.bidang.toLowerCase() === "harjar" ||
                                  auth.user.bidang.toLowerCase() === "harpro" ||
                                  auth.user.bidang.toLowerCase() === "K3") ? (
                                <button
                                    className={`
                                            px-6 py-3
                                            text-sm font-semibold
                                            focus:outline-none
                                            transition-colors duration-200
                                            border-b-2
                                            flex items-center gap-2
                                            ${
                                                activeTab === "assign"
                                                    ? "border-blue-600 text-blue-700 bg-white shadow-sm"
                                                    : "border-transparent text-gray-500 hover:text-blue-600 hover:bg-gray-50"
                                            }
                                        `}
                                    onClick={() => setActiveTab("assign")}
                                    type="button"
                                >
                                    <MdOutlineReportProblem className="text-lg" />
                                    <span>Assign Anomali</span>
                                </button>
                            ) : auth.user.bidang &&
                              auth.user.bidang.toLowerCase() === "renev" ? (
                                <button
                                    className={`
                                            px-6 py-3
                                            text-sm font-semibold
                                            focus:outline-none
                                            transition-colors duration-200
                                            border-b-2
                                            flex items-center gap-2
                                            ${
                                                activeTab === "renev"
                                                    ? "border-blue-600 text-blue-700 bg-white shadow-sm"
                                                    : "border-transparent text-gray-500 hover:text-blue-600 hover:bg-gray-50"
                                            }
                                        `}
                                    onClick={() => setActiveTab("renev")}
                                    type="button"
                                >
                                    <FaClipboard className="text-lg" />
                                    <span>Assign ke Renev</span>
                                </button>
                            ) : (
                                ""
                            )}
                        </div>

                        {/* Tab Content */}

                        {activeTab === "tabel" ? (
                            <>
                                <div className="px-4 sm:px-6 pt-8 pb-6 border-b border-gray-100 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                                    <div className="w-full md:w-2/3">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                                            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                                                Manajemen Anomali
                                            </h1>
                                        </div>
                                        <p className="text-gray-600 text-base leading-relaxed max-w-2xl">
                                            Kelola dan pantau anomali sistem
                                            kelistrikan dengan efisien. Deteksi
                                            dini, analisis mendalam, dan
                                            tindakan korektif terintegrasi.
                                        </p>
                                    </div>
                                    <div className="w-full md:w-auto flex justify-start md:justify-end">
                                        <Link
                                            href={route(
                                                "dashboard.anomali.create"
                                            )}
                                        >
                                            <PrimaryButton className="flex gap-2">
                                                <FaPlusCircle />
                                                Buat Anomali
                                            </PrimaryButton>
                                        </Link>
                                    </div>
                                </div>
                                <div className="px-2 md:px-6 pb-6 pt-4">
                                    <div className="flex flex-col gap-4 mb-6">
                                        {/* Toolbar Container */}
                                        <div className="mb-6 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                                            {/* Main Toolbar Section */}
                                            <div className="p-4 border-b border-gray-100">
                                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                                    {/* Left Section - Search and Actions */}
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
                                                        {/* Search Input */}
                                                        <div className="relative flex-shrink-0 w-full sm:w-80">
                                                            <input
                                                                type="text"
                                                                placeholder="Cari judul anomali..."
                                                                className="w-full h-11 pl-12 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-sm"
                                                                value={
                                                                    searchTerm
                                                                }
                                                                onChange={(e) =>
                                                                    handleSearch(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                            />
                                                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                                                        </div>

                                                        {/* Action Buttons */}
                                                        <div className="flex items-center gap-2 flex-shrink-0">
                                                            <button
                                                                className="bg-white border border-gray-300 text-gray-700 px-4 py-2.5 h-11 rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-400 font-medium flex items-center gap-2 transition-all duration-200 whitespace-nowrap"
                                                                onClick={() =>
                                                                    setFilterOpen &&
                                                                    setFilterOpen(
                                                                        true
                                                                    )
                                                                }
                                                                type="button"
                                                            >
                                                                <FaFilter className="text-gray-500 text-sm" />
                                                                <span>
                                                                    Filter
                                                                </span>
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    setShowExportModal(
                                                                        true
                                                                    )
                                                                }
                                                                type="button"
                                                                className="px-4 py-2.5 h-11 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all duration-200 whitespace-nowrap shadow-sm"
                                                            >
                                                                <FaFileExcel className="text-sm" />
                                                                <span>
                                                                    Export Excel
                                                                </span>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Right Section - Pagination Controls */}
                                                    <div className="flex items-center gap-3 flex-shrink-0">
                                                        <label className="text-gray-600 text-sm font-medium">
                                                            Tampil
                                                        </label>
                                                        <div className="min-w-[4.5rem]">
                                                            <Listbox
                                                                value={
                                                                    rowsPerPage
                                                                }
                                                                onChange={
                                                                    handleRowsPerPageChange
                                                                }
                                                            >
                                                                <div className="relative">
                                                                    <Listbox.Button className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full text-left bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 h-9">
                                                                        {
                                                                            rowsPerPage
                                                                        }
                                                                    </Listbox.Button>
                                                                    <Listbox.Options className="absolute right-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                                                                        {[
                                                                            10,
                                                                            20,
                                                                            50,
                                                                        ].map(
                                                                            (
                                                                                option
                                                                            ) => (
                                                                                <Listbox.Option
                                                                                    key={
                                                                                        option
                                                                                    }
                                                                                    value={
                                                                                        option
                                                                                    }
                                                                                    className={({
                                                                                        active,
                                                                                        selected,
                                                                                    }) =>
                                                                                        `relative cursor-pointer select-none px-3 py-2 text-sm transition-colors ${
                                                                                            active
                                                                                                ? "bg-blue-50 text-blue-800"
                                                                                                : selected
                                                                                                ? "bg-gray-100 text-gray-900"
                                                                                                : "text-gray-700 hover:bg-gray-50"
                                                                                        }`
                                                                                    }
                                                                                >
                                                                                    {({
                                                                                        selected,
                                                                                    }) => (
                                                                                        <div className="flex items-center justify-between">
                                                                                            <span
                                                                                                className={`block truncate ${
                                                                                                    selected
                                                                                                        ? "font-semibold"
                                                                                                        : "font-normal"
                                                                                                }`}
                                                                                            >
                                                                                                {
                                                                                                    option
                                                                                                }
                                                                                            </span>
                                                                                            {selected && (
                                                                                                <FaCheck
                                                                                                    className="h-3 w-3 text-blue-600"
                                                                                                    aria-hidden="true"
                                                                                                />
                                                                                            )}
                                                                                        </div>
                                                                                    )}
                                                                                </Listbox.Option>
                                                                            )
                                                                        )}
                                                                    </Listbox.Options>
                                                                </div>
                                                            </Listbox>
                                                        </div>
                                                        <span className="text-gray-500 text-sm">
                                                            / halaman
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Filter Modal */}
                                        {filterOpen && (
                                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                                <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                                                    <div className="px-6 py-4 border-b border-gray-200">
                                                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                                            <FaFilter className="text-blue-500" />
                                                            Filter Data Anomali
                                                        </h3>
                                                    </div>
                                                    <div className="px-6 py-4">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            {/* Date Range Filter */}
                                                            <div className="space-y-2">
                                                                <label className="block text-sm font-medium text-gray-700">
                                                                    Tanggal Dari
                                                                </label>
                                                                <input
                                                                    type="date"
                                                                    value={
                                                                        dateFrom
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        setDateFrom(
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="block text-sm font-medium text-gray-700">
                                                                    Tanggal
                                                                    Sampai
                                                                </label>
                                                                <input
                                                                    type="date"
                                                                    value={
                                                                        dateTo
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        setDateTo(
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                />
                                                            </div>

                                                            {/* Gardu Induk Filter */}
                                                            <div className="space-y-2">
                                                                <label className="block text-sm font-medium text-gray-700">
                                                                    Gardu Induk
                                                                </label>
                                                                <Combobox
                                                                    value={
                                                                        selectedGarduInduk
                                                                    }
                                                                    onChange={
                                                                        setSelectedGarduInduk
                                                                    }
                                                                >
                                                                    <div className="relative">
                                                                        <Combobox.Input
                                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                            displayValue={(
                                                                                gardu
                                                                            ) =>
                                                                                gardu ||
                                                                                "Semua Gardu Induk"
                                                                            }
                                                                            onChange={(
                                                                                event
                                                                            ) =>
                                                                                setGarduQuery(
                                                                                    event
                                                                                        .target
                                                                                        .value
                                                                                )
                                                                            }
                                                                            placeholder="Pilih atau ketik gardu induk..."
                                                                        />
                                                                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                                                                            <FaChevronDown className="h-4 w-4 text-gray-400" />
                                                                        </Combobox.Button>
                                                                        <Combobox.Options className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                                            <Combobox.Option
                                                                                value=""
                                                                                className={({
                                                                                    active,
                                                                                }) =>
                                                                                    `relative cursor-default select-none py-1 pl-8 pr-3 ${
                                                                                        active
                                                                                            ? "bg-blue-200 text-blue-900"
                                                                                            : "text-gray-900"
                                                                                    }`
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
                                                                                                    ? "font-medium"
                                                                                                    : "font-normal"
                                                                                            }`}
                                                                                        >
                                                                                            Semua
                                                                                            Gardu
                                                                                            Induk
                                                                                        </span>
                                                                                        {selected && (
                                                                                            <span
                                                                                                className={`absolute inset-y-0 left-0 flex items-center pl-2 ${
                                                                                                    active
                                                                                                        ? "text-white"
                                                                                                        : "text-blue-600"
                                                                                                }`}
                                                                                            >
                                                                                                <FaCheck className="h-3 w-3" />
                                                                                            </span>
                                                                                        )}
                                                                                    </>
                                                                                )}
                                                                            </Combobox.Option>
                                                                            {filteredGarduOptions.map(
                                                                                (
                                                                                    gardu
                                                                                ) => (
                                                                                    <Combobox.Option
                                                                                        key={
                                                                                            gardu
                                                                                        }
                                                                                        value={
                                                                                            gardu
                                                                                        }
                                                                                        className={({
                                                                                            active,
                                                                                        }) =>
                                                                                            `relative cursor-default select-none py-1 pl-8 pr-3 ${
                                                                                                active
                                                                                                    ? "bg-blue-200 text-blue-900"
                                                                                                    : "text-gray-900"
                                                                                            }`
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
                                                                                                            ? "font-medium"
                                                                                                            : "font-normal"
                                                                                                    }`}
                                                                                                >
                                                                                                    {
                                                                                                        gardu
                                                                                                    }
                                                                                                </span>
                                                                                                {selected && (
                                                                                                    <span
                                                                                                        className={`absolute inset-y-0 left-0 flex items-center pl-2 ${
                                                                                                            active
                                                                                                                ? "text-blue-900"
                                                                                                                : "text-blue-600"
                                                                                                        }`}
                                                                                                    >
                                                                                                        <FaCheck className="h-3 w-3" />
                                                                                                    </span>
                                                                                                )}
                                                                                            </>
                                                                                        )}
                                                                                    </Combobox.Option>
                                                                                )
                                                                            )}
                                                                        </Combobox.Options>
                                                                    </div>
                                                                </Combobox>
                                                            </div>

                                                            {/* Bagian Filter */}
                                                            <div className="space-y-2">
                                                                <label className="block text-sm font-medium text-gray-700">
                                                                    Bagian
                                                                </label>
                                                                <Combobox
                                                                    value={
                                                                        selectedBagian
                                                                    }
                                                                    onChange={
                                                                        setSelectedBagian
                                                                    }
                                                                >
                                                                    <div className="relative">
                                                                        <Combobox.Input
                                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                            displayValue={(
                                                                                bagian
                                                                            ) =>
                                                                                bagian ||
                                                                                "Semua Bagian"
                                                                            }
                                                                            onChange={(
                                                                                event
                                                                            ) =>
                                                                                setBagianQuery(
                                                                                    event
                                                                                        .target
                                                                                        .value
                                                                                )
                                                                            }
                                                                            placeholder="Pilih atau ketik bagian..."
                                                                        />
                                                                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                                                                            <FaChevronDown className="h-4 w-4 text-gray-400" />
                                                                        </Combobox.Button>
                                                                        <Combobox.Options className="absolute  z-10 mt-1 max-h-48 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                                            <Combobox.Option
                                                                                value=""
                                                                                className={({
                                                                                    active,
                                                                                }) =>
                                                                                    `relative cursor-default select-none py-1 pl-8 pr-3 ${
                                                                                        active
                                                                                            ? "bg-blue-200 text-blue-900"
                                                                                            : "text-gray-900"
                                                                                    }`
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
                                                                                                    ? "font-medium"
                                                                                                    : "font-normal"
                                                                                            }`}
                                                                                        >
                                                                                            Semua
                                                                                            Bagian
                                                                                        </span>
                                                                                        {selected && (
                                                                                            <span
                                                                                                className={`absolute inset-y-0 left-0 flex items-center pl-2 ${
                                                                                                    active
                                                                                                        ? "text-blue-900"
                                                                                                        : "text-blue-600"
                                                                                                }`}
                                                                                            >
                                                                                                <FaCheck className="h-3 w-3" />
                                                                                            </span>
                                                                                        )}
                                                                                    </>
                                                                                )}
                                                                            </Combobox.Option>
                                                                            {filteredBagianOptions.map(
                                                                                (
                                                                                    bagian
                                                                                ) => (
                                                                                    <Combobox.Option
                                                                                        key={
                                                                                            bagian
                                                                                        }
                                                                                        value={
                                                                                            bagian
                                                                                        }
                                                                                        className={({
                                                                                            active,
                                                                                        }) =>
                                                                                            `relative cursor-default select-none py-1 pl-8 pr-3 ${
                                                                                                active
                                                                                                    ? "bg-blue-200 text-blue-900"
                                                                                                    : "text-gray-900"
                                                                                            }`
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
                                                                                                            ? "font-medium"
                                                                                                            : "font-normal"
                                                                                                    }`}
                                                                                                >
                                                                                                    {
                                                                                                        bagian
                                                                                                    }
                                                                                                </span>
                                                                                                {selected && (
                                                                                                    <span
                                                                                                        className={`absolute inset-y-0 left-0 flex items-center pl-2 ${
                                                                                                            active
                                                                                                                ? "text-blue-900"
                                                                                                                : "text-blue-600"
                                                                                                        }`}
                                                                                                    >
                                                                                                        <FaCheck className="h-3 w-3" />
                                                                                                    </span>
                                                                                                )}
                                                                                            </>
                                                                                        )}
                                                                                    </Combobox.Option>
                                                                                )
                                                                            )}
                                                                        </Combobox.Options>
                                                                    </div>
                                                                </Combobox>
                                                            </div>

                                                            {/* Kategori Filter */}
                                                            <div className="space-y-2">
                                                                <label className="block text-sm font-medium text-gray-700">
                                                                    Kategori
                                                                </label>
                                                                <Combobox
                                                                    value={
                                                                        selectedKategori
                                                                    }
                                                                    onChange={
                                                                        setSelectedKategori
                                                                    }
                                                                >
                                                                    <div className="relative">
                                                                        <Combobox.Input
                                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                            displayValue={(
                                                                                kategori
                                                                            ) =>
                                                                                kategori ||
                                                                                "Semua Kategori"
                                                                            }
                                                                            onChange={(
                                                                                event
                                                                            ) =>
                                                                                setKategoriQuery(
                                                                                    event
                                                                                        .target
                                                                                        .value
                                                                                )
                                                                            }
                                                                            placeholder="Pilih atau ketik kategori..."
                                                                        />
                                                                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                                                                            <FaChevronDown className="h-4 w-4 text-gray-400" />
                                                                        </Combobox.Button>
                                                                        <Combobox.Options className="absolute z-10 mt-1 max-h-48 w-full overflow-y-visible rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                                            <Combobox.Option
                                                                                value=""
                                                                                className={({
                                                                                    active,
                                                                                }) =>
                                                                                    `relative cursor-default select-none py-1 pl-8 pr-3 ${
                                                                                        active
                                                                                            ? "bg-blue-200 text-blue-900"
                                                                                            : "text-gray-900"
                                                                                    }`
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
                                                                                                    ? "font-medium"
                                                                                                    : "font-normal"
                                                                                            }`}
                                                                                        >
                                                                                            Semua
                                                                                            Kategori
                                                                                        </span>
                                                                                        {selected && (
                                                                                            <span
                                                                                                className={`absolute inset-y-0 left-0 flex items-center pl-2 ${
                                                                                                    active
                                                                                                        ? "text-blue-900"
                                                                                                        : "text-blue-600"
                                                                                                }`}
                                                                                            >
                                                                                                <FaCheck className="h-3 w-3" />
                                                                                            </span>
                                                                                        )}
                                                                                    </>
                                                                                )}
                                                                            </Combobox.Option>
                                                                            {filteredKategoriOptions.map(
                                                                                (
                                                                                    kategori
                                                                                ) => (
                                                                                    <Combobox.Option
                                                                                        key={
                                                                                            kategori
                                                                                        }
                                                                                        value={
                                                                                            kategori
                                                                                        }
                                                                                        className={({
                                                                                            active,
                                                                                        }) =>
                                                                                            `relative cursor-default select-none py-1 pl-8 pr-3 ${
                                                                                                active
                                                                                                    ? "bg-blue-200 text-blue-900"
                                                                                                    : "text-gray-900"
                                                                                            }`
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
                                                                                                            ? "font-medium"
                                                                                                            : "font-normal"
                                                                                                    }`}
                                                                                                >
                                                                                                    {
                                                                                                        kategori
                                                                                                    }
                                                                                                </span>
                                                                                                {selected && (
                                                                                                    <span
                                                                                                        className={`absolute inset-y-0 left-0 flex items-center pl-2 ${
                                                                                                            active
                                                                                                                ? "text-white"
                                                                                                                : "text-blue-600"
                                                                                                        }`}
                                                                                                    >
                                                                                                        <FaCheck className="h-3 w-3" />
                                                                                                    </span>
                                                                                                )}
                                                                                            </>
                                                                                        )}
                                                                                    </Combobox.Option>
                                                                                )
                                                                            )}
                                                                        </Combobox.Options>
                                                                    </div>
                                                                </Combobox>
                                                            </div>

                                                            {/* Status Filter */}
                                                            <div className="space-y-2">
                                                                <label className="block text-sm font-medium text-gray-700">
                                                                    Status
                                                                </label>
                                                                <Combobox
                                                                    value={
                                                                        selectedStatus
                                                                    }
                                                                    onChange={
                                                                        setSelectedStatus
                                                                    }
                                                                >
                                                                    <div className="relative">
                                                                        <Combobox.Input
                                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                            displayValue={(
                                                                                status
                                                                            ) =>
                                                                                status ||
                                                                                "Semua Status"
                                                                            }
                                                                            onChange={(
                                                                                event
                                                                            ) =>
                                                                                setStatusQuery(
                                                                                    event
                                                                                        .target
                                                                                        .value
                                                                                )
                                                                            }
                                                                            placeholder="Pilih atau ketik status..."
                                                                        />
                                                                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                                                                            <FaChevronDown className="h-4 w-4 text-gray-400" />
                                                                        </Combobox.Button>
                                                                        <Combobox.Options className="absolute z-[999] mt-1 max-h-48 w-full overflow-visible rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                                            <Combobox.Option
                                                                                value=""
                                                                                className={({
                                                                                    active,
                                                                                }) =>
                                                                                    `relative cursor-default select-none py-1 pl-8 pr-3 ${
                                                                                        active
                                                                                            ? "bg-blue-200 text-blue-900"
                                                                                            : "text-gray-900"
                                                                                    }`
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
                                                                                                    ? "font-medium"
                                                                                                    : "font-normal"
                                                                                            }`}
                                                                                        >
                                                                                            Semua
                                                                                            Status
                                                                                        </span>
                                                                                        {selected && (
                                                                                            <span
                                                                                                className={`absolute inset-y-0 left-0 flex items-center pl-2 ${
                                                                                                    active
                                                                                                        ? "text-white"
                                                                                                        : "text-blue-600"
                                                                                                }`}
                                                                                            >
                                                                                                <FaCheck className="h-3 w-3" />
                                                                                            </span>
                                                                                        )}
                                                                                    </>
                                                                                )}
                                                                            </Combobox.Option>
                                                                            {filteredStatusOptions.map(
                                                                                (
                                                                                    status
                                                                                ) => (
                                                                                    <Combobox.Option
                                                                                        key={
                                                                                            status
                                                                                        }
                                                                                        value={
                                                                                            status
                                                                                        }
                                                                                        className={({
                                                                                            active,
                                                                                        }) =>
                                                                                            `relative cursor-default select-none py-1 pl-8 pr-3 ${
                                                                                                active
                                                                                                    ? "bg-blue-200 text-blue-900"
                                                                                                    : "text-gray-900"
                                                                                            }`
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
                                                                                                            ? "font-medium"
                                                                                                            : "font-normal"
                                                                                                    }`}
                                                                                                >
                                                                                                    {
                                                                                                        status
                                                                                                    }
                                                                                                </span>
                                                                                                {selected && (
                                                                                                    <span
                                                                                                        className={`absolute inset-y-0 left-0 flex items-center pl-2 ${
                                                                                                            active
                                                                                                                ? "text-white"
                                                                                                                : "text-blue-600"
                                                                                                        }`}
                                                                                                    >
                                                                                                        <FaCheck className="h-3 w-3" />
                                                                                                    </span>
                                                                                                )}
                                                                                            </>
                                                                                        )}
                                                                                    </Combobox.Option>
                                                                                )
                                                                            )}
                                                                        </Combobox.Options>
                                                                    </div>
                                                                </Combobox>
                                                            </div>
                                                        </div>

                                                        {/* Active Filters Display */}
                                                        {(dateFrom ||
                                                            dateTo ||
                                                            selectedGarduInduk ||
                                                            selectedBagian ||
                                                            selectedKategori ||
                                                            selectedStatus) && (
                                                            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                                                <h4 className="text-sm font-medium text-blue-900 mb-2">
                                                                    Filter
                                                                    Aktif:
                                                                </h4>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {dateFrom && (
                                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                            Dari:{" "}
                                                                            {
                                                                                dateFrom
                                                                            }
                                                                        </span>
                                                                    )}
                                                                    {dateTo && (
                                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                            Sampai:{" "}
                                                                            {
                                                                                dateTo
                                                                            }
                                                                        </span>
                                                                    )}
                                                                    {selectedGarduInduk && (
                                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                            Gardu:{" "}
                                                                            {
                                                                                selectedGarduInduk
                                                                            }
                                                                        </span>
                                                                    )}
                                                                    {selectedBagian && (
                                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                            Bagian:{" "}
                                                                            {
                                                                                selectedBagian
                                                                            }
                                                                        </span>
                                                                    )}
                                                                    {selectedKategori && (
                                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                            Kategori:{" "}
                                                                            {
                                                                                selectedKategori
                                                                            }
                                                                        </span>
                                                                    )}
                                                                    {selectedStatus && (
                                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                            Status:{" "}
                                                                            {
                                                                                selectedStatus
                                                                            }
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                                                        <SecondaryButton
                                                            onClick={() =>
                                                                setFilterOpen(
                                                                    false
                                                                )
                                                            }
                                                        >
                                                            Batal
                                                        </SecondaryButton>
                                                        <SecondaryButton
                                                            onClick={
                                                                handleClearFilters
                                                            }
                                                        >
                                                            Reset Filter
                                                        </SecondaryButton>
                                                        <PrimaryButton
                                                            onClick={
                                                                handleApplyFilters
                                                            }
                                                        >
                                                            Terapkan Filter
                                                        </PrimaryButton>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <ErrorBoundary>
                                            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                                                <div className="h-[500px] overflow-y-auto custom-scrollbar">
                                                    <table
                                                        key={`table-${forceUpdate}`}
                                                        className="min-w-[900px] w-full"
                                                    >
                                                        <thead className="bg-gray-100 text-gray-600 sticky top-0">
                                                            <tr>
                                                                <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">
                                                                    No
                                                                </th>
                                                                <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold">
                                                                    Judul
                                                                </th>
                                                                {auth.user
                                                                    .wilayah ===
                                                                "UPT Karawang" ? (
                                                                    <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">
                                                                        ULTG
                                                                    </th>
                                                                ) : (
                                                                    ""
                                                                )}
                                                                <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold">
                                                                    Gardu Induk
                                                                </th>
                                                                <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold">
                                                                    Bagian
                                                                </th>
                                                                <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">
                                                                    Tipe
                                                                </th>

                                                                <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold">
                                                                    Kategori
                                                                </th>
                                                                <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold">
                                                                    Nama Alat
                                                                </th>
                                                                <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold">
                                                                    Penempatan
                                                                    Alat
                                                                </th>
                                                                <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">
                                                                    Tanggal
                                                                    Kejadian
                                                                </th>
                                                                <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">
                                                                    Status
                                                                </th>
                                                                <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">
                                                                    Aksi
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody
                                                            key={`tbody-${forceUpdate}-${page}`}
                                                            className="bg-white divide-y divide-gray-200"
                                                        >
                                                            {paginatedData.length ===
                                                            0 ? (
                                                                <tr>
                                                                    <td
                                                                        colSpan={
                                                                            12
                                                                        }
                                                                        className="text-center py-10 text-gray-400 font-semibold text-base"
                                                                    >
                                                                        Tidak
                                                                        ada data
                                                                        anomali.
                                                                    </td>
                                                                </tr>
                                                            ) : (
                                                                paginatedData.map(
                                                                    (
                                                                        anomali,
                                                                        idx
                                                                    ) => (
                                                                        <tr
                                                                            className="hover:bg-gray-50"
                                                                            key={
                                                                                anomali.id
                                                                            }
                                                                        >
                                                                            <td className="px-3 py-3 text-left text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                                                                                {(page -
                                                                                    1) *
                                                                                    rowsPerPage +
                                                                                    idx +
                                                                                    1}
                                                                            </td>
                                                                            <td
                                                                                className="px-3 py-3 text-left text-xs sm:text-sm text-gray-800 truncate max-w-[8rem] sm:max-w-[12rem]"
                                                                                title={
                                                                                    anomali.judul
                                                                                }
                                                                            >
                                                                                {
                                                                                    anomali.judul
                                                                                }
                                                                            </td>
                                                                            {auth
                                                                                .user
                                                                                .wilayah ===
                                                                            "UPT Karawang" ? (
                                                                                <td className="px-3 py-3 text-left text-xs sm:text-sm whitespace-nowrap">
                                                                                    <UltgBadge
                                                                                        ultg={
                                                                                            anomali.ultg ===
                                                                                            "ULTG Karawang"
                                                                                                ? "Karawang"
                                                                                                : "Purwakarta"
                                                                                        }
                                                                                    />
                                                                                </td>
                                                                            ) : (
                                                                                ""
                                                                            )}
                                                                            <td
                                                                                className="px-3 py-3 text-left text-xs sm:text-sm text-gray-700"
                                                                                title={
                                                                                    anomali
                                                                                        .gardu_induk
                                                                                        ?.name ??
                                                                                    "-"
                                                                                }
                                                                            >
                                                                                {anomali
                                                                                    .gardu_induk
                                                                                    ?.name ??
                                                                                    "-"}
                                                                            </td>
                                                                            <td className="px-3 py-3 text-left text-xs sm:text-sm text-gray-700">
                                                                                {
                                                                                    anomali.bagian
                                                                                }
                                                                            </td>
                                                                            <td className="px-3 py-3 text-left text-xs sm:text-sm whitespace-nowrap">
                                                                                <TipeBadge
                                                                                    tipe={
                                                                                        anomali.tipe
                                                                                    }
                                                                                />
                                                                            </td>
                                                                            <td
                                                                                className="px-3 py-3 text-left text-xs sm:text-sm text-gray-700"
                                                                                title={
                                                                                    anomali
                                                                                        .kategori
                                                                                        ?.name ??
                                                                                    "-"
                                                                                }
                                                                            >
                                                                                {anomali
                                                                                    .kategori
                                                                                    ?.name ??
                                                                                    "-"}
                                                                            </td>
                                                                            <td
                                                                                className="px-3 py-3 text-left text-xs sm:text-sm text-gray-700 truncate max-w-[8rem] sm:max-w-[12rem]"
                                                                                title={
                                                                                    anomali.peralatan
                                                                                }
                                                                            >
                                                                                {
                                                                                    anomali.peralatan
                                                                                }
                                                                            </td>
                                                                            <td
                                                                                className="px-3 py-3 text-left text-xs sm:text-sm text-gray-700 truncate max-w-[8rem] sm:max-w-[12rem]"
                                                                                title={
                                                                                    anomali.penempatan_alat
                                                                                }
                                                                            >
                                                                                {
                                                                                    anomali.penempatan_alat
                                                                                }
                                                                            </td>
                                                                            <td className="px-3 py-3 text-left text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                                                                                {formatDate(
                                                                                    anomali.tanggal_kejadian
                                                                                )}
                                                                            </td>
                                                                            <td className="px-3 py-3 text-left text-xs sm:text-sm whitespace-nowrap">
                                                                                <StatusBadge
                                                                                    status={
                                                                                        anomali.status
                                                                                    }
                                                                                />
                                                                            </td>
                                                                            <td className="px-3 py-3 text-left text-xs sm:text-sm whitespace-nowrap">
                                                                                <Link
                                                                                    href={route(
                                                                                        "dashboard.anomali.show",
                                                                                        anomali.slug
                                                                                    )}
                                                                                >
                                                                                    <SecondaryButton>
                                                                                        Detail
                                                                                    </SecondaryButton>
                                                                                </Link>
                                                                            </td>
                                                                        </tr>
                                                                    )
                                                                )
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </ErrorBoundary>
                                        <div className="flex flex-col gap-2 mt-4 px-2 w-full">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 w-full">
                                                <div className="text-sm text-gray-600 mb-1 sm:mb-0 text-center sm:text-left">
                                                    Halaman{" "}
                                                    <span className="font-semibold text-gray-800">
                                                        {page}
                                                    </span>{" "}
                                                    dari{" "}
                                                    <span className="font-semibold text-gray-800">
                                                        {totalPages}
                                                    </span>
                                                    <span className="mx-2">
                                                        |
                                                    </span>
                                                    Total{" "}
                                                    <span className="font-semibold text-gray-800">
                                                        {totalRows}
                                                    </span>{" "}
                                                    data
                                                </div>

                                                <div className="flex items-center gap-0.5 justify-center sm:justify-end w-full sm:w-auto">
                                                    <button
                                                        onClick={handlePrev}
                                                        disabled={page === 1}
                                                        className={`px-3 py-2 rounded-l-md border border-r-0 text-sm flex items-center gap-1 font-semibold transition-colors
                                                    ${
                                                        page === 1
                                                            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                                    }
                                                `}
                                                        aria-label="Halaman sebelumnya"
                                                    >
                                                        <FaChevronLeft />
                                                    </button>
                                                    <span className="px-4 py-2 text-sm bg-gray-50 text-gray-800 select-none font-bold tracking-wide border-t border-b border-gray-200">
                                                        {page}
                                                    </span>
                                                    <button
                                                        onClick={handleNext}
                                                        disabled={
                                                            page === totalPages
                                                        }
                                                        className={`px-3 py-2 rounded-r-md border border-l-0 text-sm flex items-center gap-1 font-semibold transition-colors
                                                    ${
                                                        page === totalPages
                                                            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                                    }
                                                `}
                                                        aria-label="Halaman berikutnya"
                                                    >
                                                        <FaChevronRight />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : activeTab === "approval" &&
                          auth.user.bidang &&
                          auth.user.bidang.toLowerCase() === "multg" ? (
                            <>
                                <div className="px-4 sm:px-6 pt-6 pb-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="w-full md:w-2/3">
                                        <h2 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
                                            <FaClipboard className="text-amber-500 text-2xl" />
                                            <span>
                                                Halaman Approval Anomali
                                            </span>
                                        </h2>
                                        <p className="text-gray-600 text-sm mb-0">
                                            Halaman ini memungkinkan Anda untuk
                                            melihat dan mengelola data anomali
                                            yang menunggu persetujuan. Anda
                                            dapat melihat detail anomali,
                                            menyetujui atau menolak anomali,
                                            serta mengelola proses approval
                                            secara efisien.
                                        </p>
                                    </div>
                                    <div className="w-full md:w-auto flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm mt-2 md:mt-0">
                                        <label className="text-gray-600 text-sm font-medium mr-2 whitespace-nowrap">
                                            Tampil
                                        </label>
                                        <div className="z-20 min-w-[90px] w-20 sm:w-24 md:w-28">
                                            <Listbox
                                                value={rowsPerPage}
                                                onChange={
                                                    handleRowsPerPageChange
                                                }
                                            >
                                                <div className="relative w-full">
                                                    <Listbox.Button className="border border-gray-300 rounded px-2 py-1 text-sm w-full text-left bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                                                        {rowsPerPage}
                                                    </Listbox.Button>
                                                    <Listbox.Options className="absolute left-0 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg z-50 overflow-hidden">
                                                        {[10, 20, 50].map(
                                                            (option) => (
                                                                <Listbox.Option
                                                                    key={option}
                                                                    value={
                                                                        option
                                                                    }
                                                                    className={({
                                                                        active,
                                                                        selected,
                                                                    }) =>
                                                                        `relative cursor-pointer select-none px-2 py-1 text-sm transition-colors ${
                                                                            active
                                                                                ? "bg-blue-50 text-blue-800"
                                                                                : selected
                                                                                ? "bg-gray-100 text-gray-900"
                                                                                : "text-gray-700"
                                                                        }`
                                                                    }
                                                                >
                                                                    {({
                                                                        selected,
                                                                    }) => (
                                                                        <div className="flex items-center">
                                                                            <span
                                                                                className={`block truncate ${
                                                                                    selected
                                                                                        ? "font-semibold"
                                                                                        : "font-normal"
                                                                                }`}
                                                                            >
                                                                                {
                                                                                    option
                                                                                }
                                                                            </span>
                                                                            {selected && (
                                                                                <span className="ml-auto flex items-center text-blue-600">
                                                                                    <FaCheck
                                                                                        className="h-4 w-4"
                                                                                        aria-hidden="true"
                                                                                    />
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </Listbox.Option>
                                                            )
                                                        )}
                                                    </Listbox.Options>
                                                </div>
                                            </Listbox>
                                        </div>
                                        <span className="text-gray-500 text-xs ml-2 whitespace-nowrap">
                                            / halaman
                                        </span>
                                    </div>
                                </div>
                                <div className="px-2 md:px-6 pb-6 pt-4">
                                    <ErrorBoundary>
                                        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                                            <div className="max-h-[500px] min-h-[340px] overflow-y-auto custom-scrollbar">
                                                <table className="min-w-[900px] w-full">
                                                    <thead className="bg-gray-100 text-gray-600 sticky top-0 z-10">
                                                        <tr>
                                                            <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">
                                                                No
                                                            </th>
                                                            <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold">
                                                                Judul
                                                            </th>
                                                            <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold">
                                                                Gardu Induk
                                                            </th>
                                                            <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold">
                                                                Bagian
                                                            </th>
                                                            <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">
                                                                Tipe
                                                            </th>
                                                            <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold">
                                                                Kategori
                                                            </th>
                                                            <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold">
                                                                Peralatan
                                                            </th>
                                                            <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">
                                                                Tanggal Kejadian
                                                            </th>
                                                            <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">
                                                                Status
                                                            </th>
                                                            <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">
                                                                Aksi
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {paginatedDataReview.length ===
                                                        0 ? (
                                                            <tr>
                                                                <td
                                                                    colSpan={12}
                                                                    className="text-center py-10 text-gray-400 font-semibold text-base"
                                                                >
                                                                    Tidak ada
                                                                    data
                                                                    anomali.
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            paginatedDataReview.map(
                                                                (
                                                                    anomali,
                                                                    idx
                                                                ) => (
                                                                    <tr
                                                                        className="hover:bg-gray-50"
                                                                        key={
                                                                            anomali.id
                                                                        }
                                                                    >
                                                                        <td className="px-3 py-3 text-left text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                                                                            {(page -
                                                                                1) *
                                                                                rowsPerPage +
                                                                                idx +
                                                                                1}
                                                                        </td>
                                                                        <td
                                                                            className="px-3 py-3 text-left text-xs sm:text-sm text-gray-800"
                                                                            title={
                                                                                anomali.judul
                                                                            }
                                                                        >
                                                                            {
                                                                                anomali.judul
                                                                            }
                                                                        </td>
                                                                        <td
                                                                            className="px-3 py-3 text-left text-xs sm:text-sm text-gray-700"
                                                                            title={
                                                                                anomali
                                                                                    .gardu_induk
                                                                                    ?.name ??
                                                                                "-"
                                                                            }
                                                                        >
                                                                            {anomali
                                                                                .gardu_induk
                                                                                ?.name ??
                                                                                "-"}
                                                                        </td>
                                                                        <td className="px-3 py-3 text-left text-xs sm:text-sm text-gray-700">
                                                                            {
                                                                                anomali.bagian
                                                                            }
                                                                        </td>
                                                                        <td className="px-3 py-3 text-left text-xs sm:text-sm whitespace-nowrap">
                                                                            <TipeBadge
                                                                                tipe={
                                                                                    anomali.tipe
                                                                                }
                                                                            />
                                                                        </td>
                                                                        <td
                                                                            className="px-3 py-3 text-left text-xs sm:text-sm text-gray-700"
                                                                            title={
                                                                                anomali
                                                                                    .kategori
                                                                                    ?.name ??
                                                                                "-"
                                                                            }
                                                                        >
                                                                            {anomali
                                                                                .kategori
                                                                                ?.name ??
                                                                                "-"}
                                                                        </td>
                                                                        <td
                                                                            className="px-3 py-3 text-left text-xs sm:text-sm text-gray-700"
                                                                            title={
                                                                                anomali.peralatan
                                                                            }
                                                                        >
                                                                            {
                                                                                anomali.peralatan
                                                                            }
                                                                        </td>
                                                                        <td className="px-3 py-3 text-left text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                                                                            {formatDate(
                                                                                anomali.tanggal_kejadian
                                                                            )}
                                                                        </td>
                                                                        <td className="px-3 py-3 text-left text-xs sm:text-sm whitespace-nowrap">
                                                                            <StatusBadge
                                                                                status={
                                                                                    anomali.status
                                                                                }
                                                                            />
                                                                        </td>
                                                                        <td className="px-3 py-3 text-left text-xs sm:text-sm whitespace-nowrap">
                                                                            <Link
                                                                                href={route(
                                                                                    "dashboard.anomali.review",
                                                                                    anomali.slug
                                                                                )}
                                                                            >
                                                                                <SecondaryButton>
                                                                                    Review
                                                                                </SecondaryButton>
                                                                            </Link>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            )
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </ErrorBoundary>
                                    <div className="flex flex-col sm:flex-row items-center justify-between mt-4 px-2 gap-2">
                                        <div className="text-sm text-gray-600 mb-1 sm:mb-0">
                                            Halaman{" "}
                                            <span className="font-semibold text-gray-800">
                                                {page}
                                            </span>{" "}
                                            dari{" "}
                                            <span className="font-semibold text-gray-800">
                                                {totalPagesReview}
                                            </span>
                                            <span className="mx-2">|</span>
                                            Total{" "}
                                            <span className="font-semibold text-gray-800">
                                                {totalRowsReview}
                                            </span>{" "}
                                            data
                                        </div>
                                        <div className="flex items-center gap-0.5">
                                            <button
                                                onClick={handlePrev}
                                                disabled={page === 1}
                                                className={`px-3 py-2 rounded-l-md border border-r-0 text-sm flex items-center gap-1 font-semibold transition-colors
                                                ${
                                                    page === 1
                                                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                                }
                                            `}
                                                aria-label="Halaman sebelumnya"
                                            >
                                                <FaChevronLeft />
                                            </button>
                                            <span className="px-4 py-2 text-sm bg-gray-50 text-gray-800 select-none font-bold tracking-wide border-t border-b border-gray-200">
                                                {page}
                                            </span>
                                            <button
                                                onClick={handleNext}
                                                disabled={
                                                    page === totalPagesReview
                                                }
                                                className={`px-3 py-2 rounded-r-md border border-l-0 text-sm flex items-center gap-1 font-semibold transition-colors
                                                ${
                                                    page === totalPagesReview
                                                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                                }
                                            `}
                                                aria-label="Halaman berikutnya"
                                            >
                                                <FaChevronRight />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : activeTab === "assign" &&
                          auth.user.bidang &&
                          (auth.user.bidang.toLowerCase() === "hargi" ||
                              auth.user.bidang.toLowerCase() === "harjar" ||
                              auth.user.bidang.toLowerCase() === "harpro" ||
                              auth.user.bidang.toLowerCase() === "K3") ? (
                            <>
                                <div className="px-4 sm:px-6 pt-6 pb-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="w-full md:w-2/3">
                                        <h2 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
                                            <FaClipboard className="text-amber-500 text-2xl" />
                                            <span>Anomali Yang Ditugaskan</span>
                                        </h2>
                                        <p className="text-gray-600 text-sm mb-0">
                                            Halaman ini menampilkan daftar
                                            anomali yang telah ditugaskan kepada
                                            Anda. Di sini Anda dapat melihat dan
                                            mengelola anomali yang menjadi
                                            tanggung jawab Anda, melakukan
                                            review detail permasalahan, serta
                                            memperbarui status penanganan secara
                                            efisien.
                                        </p>
                                    </div>
                                    <div className="w-full md:w-auto flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm mt-2 md:mt-0">
                                        <label className="text-gray-600 text-sm font-medium mr-2 whitespace-nowrap">
                                            Tampil
                                        </label>
                                        <div className="z-20 min-w-[90px] w-20 sm:w-24 md:w-28">
                                            <Listbox
                                                value={rowsPerPage}
                                                onChange={
                                                    handleRowsPerPageChange
                                                }
                                            >
                                                <div className="relative w-full">
                                                    <Listbox.Button className="border border-gray-300 rounded px-2 py-1 text-sm w-full text-left bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                                                        {rowsPerPage}
                                                    </Listbox.Button>
                                                    <Listbox.Options className="absolute left-0 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg z-50 overflow-hidden">
                                                        {[10, 20, 50].map(
                                                            (option) => (
                                                                <Listbox.Option
                                                                    key={option}
                                                                    value={
                                                                        option
                                                                    }
                                                                    className={({
                                                                        active,
                                                                        selected,
                                                                    }) =>
                                                                        `relative cursor-pointer select-none px-2 py-1 text-sm transition-colors ${
                                                                            active
                                                                                ? "bg-blue-50 text-blue-800"
                                                                                : selected
                                                                                ? "bg-gray-100 text-gray-900"
                                                                                : "text-gray-700"
                                                                        }`
                                                                    }
                                                                >
                                                                    {({
                                                                        selected,
                                                                    }) => (
                                                                        <div className="flex items-center">
                                                                            <span
                                                                                className={`block truncate ${
                                                                                    selected
                                                                                        ? "font-semibold"
                                                                                        : "font-normal"
                                                                                }`}
                                                                            >
                                                                                {
                                                                                    option
                                                                                }
                                                                            </span>
                                                                            {selected && (
                                                                                <span className="ml-auto flex items-center text-blue-600">
                                                                                    <FaCheck
                                                                                        className="h-4 w-4"
                                                                                        aria-hidden="true"
                                                                                    />
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </Listbox.Option>
                                                            )
                                                        )}
                                                    </Listbox.Options>
                                                </div>
                                            </Listbox>
                                        </div>
                                        <span className="text-gray-500 text-xs ml-2 whitespace-nowrap">
                                            / halaman
                                        </span>
                                    </div>
                                </div>
                                <div className="px-2 md:px-6 pb-6 pt-4">
                                    <ErrorBoundary>
                                        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                                            <div className="max-h-[500px] min-h-[340px] overflow-y-auto custom-scrollbar">
                                                <table className="min-w-[900px] w-full">
                                                    <thead className="bg-gray-100 text-gray-600 sticky top-0 z-10">
                                                        <tr>
                                                            <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">
                                                                No
                                                            </th>
                                                            <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold">
                                                                Judul
                                                            </th>
                                                            <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold">
                                                                Gardu Induk
                                                            </th>
                                                            <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold">
                                                                Bagian
                                                            </th>
                                                            <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">
                                                                Tipe
                                                            </th>
                                                            <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold">
                                                                Kategori
                                                            </th>
                                                            <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold">
                                                                Peralatan
                                                            </th>
                                                            <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">
                                                                Tanggal Kejadian
                                                            </th>
                                                            <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">
                                                                Status
                                                            </th>
                                                            <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">
                                                                Aksi
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {paginateDataAssign.length ===
                                                        0 ? (
                                                            <tr>
                                                                <td
                                                                    colSpan={12}
                                                                    className="text-center py-10 text-gray-400 font-semibold text-base"
                                                                >
                                                                    Tidak ada
                                                                    data
                                                                    anomali.
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            paginateDataAssign.map(
                                                                (
                                                                    anomali,
                                                                    idx
                                                                ) => (
                                                                    <tr
                                                                        className="hover:bg-gray-50"
                                                                        key={
                                                                            anomali.id
                                                                        }
                                                                    >
                                                                        <td className="px-3 py-3 text-left text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                                                                            {(page -
                                                                                1) *
                                                                                rowsPerPage +
                                                                                idx +
                                                                                1}
                                                                        </td>
                                                                        <td
                                                                            className="px-3 py-3 text-left text-xs sm:text-sm text-gray-800"
                                                                            title={
                                                                                anomali.judul
                                                                            }
                                                                        >
                                                                            {
                                                                                anomali.judul
                                                                            }
                                                                        </td>
                                                                        <td
                                                                            className="px-3 py-3 text-left text-xs sm:text-sm text-gray-700"
                                                                            title={
                                                                                anomali
                                                                                    .gardu_induk
                                                                                    ?.name ??
                                                                                "-"
                                                                            }
                                                                        >
                                                                            {anomali
                                                                                .gardu_induk
                                                                                ?.name ??
                                                                                "-"}
                                                                        </td>
                                                                        <td className="px-3 py-3 text-left text-xs sm:text-sm text-gray-700">
                                                                            {
                                                                                anomali.bagian
                                                                            }
                                                                        </td>
                                                                        <td className="px-3 py-3 text-left text-xs sm:text-sm whitespace-nowrap">
                                                                            <TipeBadge
                                                                                tipe={
                                                                                    anomali.tipe
                                                                                }
                                                                            />
                                                                        </td>
                                                                        <td
                                                                            className="px-3 py-3 text-left text-xs sm:text-sm text-gray-700"
                                                                            title={
                                                                                anomali
                                                                                    .kategori
                                                                                    ?.name ??
                                                                                "-"
                                                                            }
                                                                        >
                                                                            {anomali
                                                                                .kategori
                                                                                ?.name ??
                                                                                "-"}
                                                                        </td>
                                                                        <td
                                                                            className="px-3 py-3 text-left text-xs sm:text-sm text-gray-700"
                                                                            title={
                                                                                anomali.peralatan
                                                                            }
                                                                        >
                                                                            {
                                                                                anomali.peralatan
                                                                            }
                                                                        </td>
                                                                        <td className="px-3 py-3 text-left text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                                                                            {formatDate(
                                                                                anomali.tanggal_kejadian
                                                                            )}
                                                                        </td>
                                                                        <td className="px-3 py-3 text-left text-xs sm:text-sm whitespace-nowrap">
                                                                            <StatusBadge
                                                                                status={
                                                                                    anomali.status
                                                                                }
                                                                            />
                                                                        </td>
                                                                        <td className="px-3 py-3 text-left text-xs sm:text-sm whitespace-nowrap">
                                                                            <div className="flex gap-2">
                                                                                {!anomali.tanggal_mulai &&
                                                                                !anomali.tanggal_selesai ? (
                                                                                    <Link
                                                                                        href={route(
                                                                                            "dashboard.anomali.schedule",
                                                                                            anomali.slug
                                                                                        )}
                                                                                    >
                                                                                        <SecondaryButton>
                                                                                            Review
                                                                                        </SecondaryButton>
                                                                                    </Link>
                                                                                ) : (
                                                                                    // Sudah selesai atau kondisi lain - tampilkan tombol Edit
                                                                                    <Link
                                                                                        href={route(
                                                                                            "dashboard.anomali.schedule",
                                                                                            anomali.slug
                                                                                        )}
                                                                                    >
                                                                                        <SecondaryButton>
                                                                                            Review
                                                                                        </SecondaryButton>
                                                                                    </Link>
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            )
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </ErrorBoundary>
                                    <div className="flex flex-col sm:flex-row items-center justify-between mt-4 px-2 gap-2">
                                        <div className="text-sm text-gray-600 mb-1 sm:mb-0">
                                            Halaman{" "}
                                            <span className="font-semibold text-gray-800">
                                                {page}
                                            </span>{" "}
                                            dari{" "}
                                            <span className="font-semibold text-gray-800">
                                                {totalPagesAssign}
                                            </span>
                                            <span className="mx-2">|</span>
                                            Total{" "}
                                            <span className="font-semibold text-gray-800">
                                                {totalRowsAssign}
                                            </span>{" "}
                                            data
                                        </div>
                                        <div className="flex items-center gap-0.5">
                                            <button
                                                onClick={handlePrev}
                                                disabled={page === 1}
                                                className={`px-3 py-2 rounded-l-md border border-r-0 text-sm flex items-center gap-1 font-semibold transition-colors
                                                ${
                                                    page === 1
                                                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                                }
                                            `}
                                                aria-label="Halaman sebelumnya"
                                            >
                                                <FaChevronLeft />
                                            </button>
                                            <span className="px-4 py-2 text-sm bg-gray-50 text-gray-800 select-none font-bold tracking-wide border-t border-b border-gray-200">
                                                {page}
                                            </span>
                                            <button
                                                onClick={handleNext}
                                                disabled={
                                                    page === totalPagesAssign
                                                }
                                                className={`px-3 py-2 rounded-r-md border border-l-0 text-sm flex items-center gap-1 font-semibold transition-colors
                                                ${
                                                    page === totalPagesAssign
                                                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                                }
                                            `}
                                                aria-label="Halaman berikutnya"
                                            >
                                                <FaChevronRight />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : activeTab === "renev" &&
                          auth.user.bidang &&
                          auth.user.bidang.toLowerCase() === "renev" ? (
                            <>
                                <div className="px-4 sm:px-6 pt-6 pb-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="w-full md:w-2/3">
                                        <h2 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
                                            <FaClipboard className="text-amber-500 text-2xl" />
                                            <span>Anomali Yang Ditugaskan</span>
                                        </h2>
                                        <p className="text-gray-600 text-sm mb-0">
                                            Halaman ini menampilkan daftar
                                            anomali yang telah ditugaskan kepada
                                            Anda. Di sini Anda dapat melihat dan
                                            mengelola anomali yang menjadi
                                            tanggung jawab Anda, melakukan
                                            review detail permasalahan, serta
                                            memperbarui status penanganan secara
                                            efisien.
                                        </p>
                                    </div>
                                    <div className="w-full md:w-auto flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm mt-2 md:mt-0">
                                        <label className="text-gray-600 text-sm font-medium mr-2 whitespace-nowrap">
                                            Tampil
                                        </label>
                                        <div className="z-20 min-w-[90px] w-20 sm:w-24 md:w-28">
                                            <Listbox
                                                value={rowsPerPage}
                                                onChange={
                                                    handleRowsPerPageChange
                                                }
                                            >
                                                <div className="relative w-full">
                                                    <Listbox.Button className="border border-gray-300 rounded px-2 py-1 text-sm w-full text-left bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                                                        {rowsPerPage}
                                                    </Listbox.Button>
                                                    <Listbox.Options className="absolute left-0 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg z-50 overflow-hidden">
                                                        {[10, 20, 50].map(
                                                            (option) => (
                                                                <Listbox.Option
                                                                    key={option}
                                                                    value={
                                                                        option
                                                                    }
                                                                    className={({
                                                                        active,
                                                                        selected,
                                                                    }) =>
                                                                        `relative cursor-pointer select-none px-2 py-1 text-sm transition-colors ${
                                                                            active
                                                                                ? "bg-blue-50 text-blue-800"
                                                                                : selected
                                                                                ? "bg-gray-100 text-gray-900"
                                                                                : "text-gray-700"
                                                                        }`
                                                                    }
                                                                >
                                                                    {({
                                                                        selected,
                                                                    }) => (
                                                                        <div className="flex items-center">
                                                                            <span
                                                                                className={`block truncate ${
                                                                                    selected
                                                                                        ? "font-semibold"
                                                                                        : "font-normal"
                                                                                }`}
                                                                            >
                                                                                {
                                                                                    option
                                                                                }
                                                                            </span>
                                                                            {selected && (
                                                                                <span className="ml-auto flex items-center text-blue-600">
                                                                                    <FaCheck
                                                                                        className="h-4 w-4"
                                                                                        aria-hidden="true"
                                                                                    />
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </Listbox.Option>
                                                            )
                                                        )}
                                                    </Listbox.Options>
                                                </div>
                                            </Listbox>
                                        </div>
                                        <span className="text-gray-500 text-xs ml-2 whitespace-nowrap">
                                            / halaman
                                        </span>
                                    </div>
                                </div>
                                <div className="px-2 md:px-6 pb-6 pt-4">
                                    <ErrorBoundary>
                                        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                                            <div className="max-h-[500px] min-h-[340px] overflow-y-auto custom-scrollbar">
                                                <table className="min-w-[900px] w-full">
                                                    <thead className="bg-gray-100 text-gray-600 sticky top-0 z-10">
                                                        <tr>
                                                            <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">
                                                                No
                                                            </th>
                                                            <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold">
                                                                Judul
                                                            </th>
                                                            <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold">
                                                                Gardu Induk
                                                            </th>
                                                            <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold">
                                                                Bagian
                                                            </th>
                                                            <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">
                                                                Tipe
                                                            </th>
                                                            <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold">
                                                                Kategori
                                                            </th>
                                                            <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold">
                                                                Peralatan
                                                            </th>
                                                            <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">
                                                                Tanggal Kejadian
                                                            </th>
                                                            <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">
                                                                Status
                                                            </th>
                                                            <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">
                                                                Aksi
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {paginateDataRenev.length ===
                                                        0 ? (
                                                            <tr>
                                                                <td
                                                                    colSpan={12}
                                                                    className="text-center py-10 text-gray-400 font-semibold text-base"
                                                                >
                                                                    Tidak ada
                                                                    data
                                                                    anomali.
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            paginateDataRenev.map(
                                                                (
                                                                    anomali,
                                                                    idx
                                                                ) => (
                                                                    <tr
                                                                        className="hover:bg-gray-50"
                                                                        key={
                                                                            anomali.id
                                                                        }
                                                                    >
                                                                        <td className="px-3 py-3 text-left text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                                                                            {(page -
                                                                                1) *
                                                                                rowsPerPage +
                                                                                idx +
                                                                                1}
                                                                        </td>
                                                                        <td
                                                                            className="px-3 py-3 text-left text-xs sm:text-sm text-gray-800"
                                                                            title={
                                                                                anomali.judul
                                                                            }
                                                                        >
                                                                            {
                                                                                anomali.judul
                                                                            }
                                                                        </td>
                                                                        <td
                                                                            className="px-3 py-3 text-left text-xs sm:text-sm text-gray-700"
                                                                            title={
                                                                                anomali
                                                                                    .gardu_induk
                                                                                    ?.name ??
                                                                                "-"
                                                                            }
                                                                        >
                                                                            {anomali
                                                                                .gardu_induk
                                                                                ?.name ??
                                                                                "-"}
                                                                        </td>
                                                                        <td className="px-3 py-3 text-left text-xs sm:text-sm text-gray-700">
                                                                            {
                                                                                anomali.bagian
                                                                            }
                                                                        </td>
                                                                        <td className="px-3 py-3 text-left text-xs sm:text-sm whitespace-nowrap">
                                                                            <TipeBadge
                                                                                tipe={
                                                                                    anomali.tipe
                                                                                }
                                                                            />
                                                                        </td>
                                                                        <td
                                                                            className="px-3 py-3 text-left text-xs sm:text-sm text-gray-700"
                                                                            title={
                                                                                anomali
                                                                                    .kategori
                                                                                    ?.name ??
                                                                                "-"
                                                                            }
                                                                        >
                                                                            {anomali
                                                                                .kategori
                                                                                ?.name ??
                                                                                "-"}
                                                                        </td>
                                                                        <td
                                                                            className="px-3 py-3 text-left text-xs sm:text-sm text-gray-700"
                                                                            title={
                                                                                anomali.peralatan
                                                                            }
                                                                        >
                                                                            {
                                                                                anomali.peralatan
                                                                            }
                                                                        </td>
                                                                        <td className="px-3 py-3 text-left text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                                                                            {formatDate(
                                                                                anomali.tanggal_kejadian
                                                                            )}
                                                                        </td>
                                                                        <td className="px-3 py-3 text-left text-xs sm:text-sm whitespace-nowrap">
                                                                            <StatusBadge
                                                                                status={
                                                                                    anomali.status
                                                                                }
                                                                            />
                                                                        </td>
                                                                        <td className="px-3 py-3 text-left text-xs sm:text-sm whitespace-nowrap">
                                                                            <Link
                                                                                href={route(
                                                                                    "dashboard.anomali.review",
                                                                                    anomali.slug
                                                                                )}
                                                                            >
                                                                                <SecondaryButton>
                                                                                    Review
                                                                                </SecondaryButton>
                                                                            </Link>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            )
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </ErrorBoundary>
                                    <div className="flex flex-col sm:flex-row items-center justify-between mt-4 px-2 gap-2">
                                        <div className="text-sm text-gray-600 mb-1 sm:mb-0">
                                            Halaman{" "}
                                            <span className="font-semibold text-gray-800">
                                                {page}
                                            </span>{" "}
                                            dari{" "}
                                            <span className="font-semibold text-gray-800">
                                                {totalPagesRenev}
                                            </span>
                                            <span className="mx-2">|</span>
                                            Total{" "}
                                            <span className="font-semibold text-gray-800">
                                                {totalRowsRenev}
                                            </span>{" "}
                                            data
                                        </div>
                                        <div className="flex items-center gap-0.5">
                                            <button
                                                onClick={handlePrev}
                                                disabled={page === 1}
                                                className={`px-3 py-2 rounded-l-md border border-r-0 text-sm flex items-center gap-1 font-semibold transition-colors
                                                ${
                                                    page === 1
                                                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                                }
                                            `}
                                                aria-label="Halaman sebelumnya"
                                            >
                                                <FaChevronLeft />
                                            </button>
                                            <span className="px-4 py-2 text-sm bg-gray-50 text-gray-800 select-none font-bold tracking-wide border-t border-b border-gray-200">
                                                {page}
                                            </span>
                                            <button
                                                onClick={handleNext}
                                                disabled={
                                                    page === totalPagesRenev
                                                }
                                                className={`px-3 py-2 rounded-r-md border border-l-0 text-sm flex items-center gap-1 font-semibold transition-colors
                                                ${
                                                    page === totalPagesRenev
                                                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                                }
                                            `}
                                                aria-label="Halaman berikutnya"
                                            >
                                                <FaChevronRight />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : activeTab === "kalender" ? (
                            <div className="px-2 pb-6 pt-4">
                                <AnomaliCalendar
                                    filteredAnomalis={filteredAnomalis}
                                />
                            </div>
                        ) : (
                            <></>
                        )}
                    </div>
                </div>
            </DashboardLayout>

            {/* Export Modal */}
            {showExportModal && (
                <Modal
                    show={showExportModal}
                    onClose={() => setShowExportModal(false)}
                >
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-800">
                                Export Data ke Excel
                            </h2>
                            <button
                                onClick={() => setShowExportModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* ULTG Selection */}
                            {auth.user.wilayah === "UPT Karawang" && (
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Pilih ULTG
                                    </label>
                                    <Combobox
                                        value={exportUltgs}
                                        onChange={setExportUltgs}
                                        multiple
                                    >
                                        <div className="relative">
                                            <Combobox.Input
                                                className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                                                displayValue={() =>
                                                    exportUltgs.length > 0
                                                        ? `${exportUltgs.length} ULTG dipilih`
                                                        : "Pilih ULTG"
                                                }
                                                readOnly
                                            />
                                            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                                                <FaChevronDown
                                                    className="h-5 w-5 text-gray-400"
                                                    aria-hidden="true"
                                                />
                                            </Combobox.Button>
                                        </div>
                                        <Transition
                                            as={Fragment}
                                            leave="transition ease-in duration-100"
                                            leaveFrom="opacity-100"
                                            leaveTo="opacity-0"
                                        >
                                            <Combobox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                {ultgOptions.map((ultg) => (
                                                    <Combobox.Option
                                                        key={ultg}
                                                        className={({
                                                            active,
                                                        }) =>
                                                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                                                active
                                                                    ? "bg-blue-600 text-white"
                                                                    : "text-gray-900"
                                                            }`
                                                        }
                                                        value={ultg}
                                                    >
                                                        {({
                                                            selected,
                                                            active,
                                                        }) => (
                                                            <>
                                                                <span
                                                                    className={`block truncate ${
                                                                        selected
                                                                            ? "font-medium"
                                                                            : "font-normal"
                                                                    }`}
                                                                >
                                                                    {ultg}
                                                                </span>
                                                                {selected ? (
                                                                    <span
                                                                        className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                                                            active
                                                                                ? "text-white"
                                                                                : "text-blue-600"
                                                                        }`}
                                                                    >
                                                                        <FaCheck
                                                                            className="h-5 w-5"
                                                                            aria-hidden="true"
                                                                        />
                                                                    </span>
                                                                ) : null}
                                                            </>
                                                        )}
                                                    </Combobox.Option>
                                                ))}
                                            </Combobox.Options>
                                        </Transition>
                                    </Combobox>
                                </div>
                            )}

                            {/* Gardu Induk Selection */}
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Pilih Gardu Induk
                                </label>
                                <Combobox
                                    value={exportGardus}
                                    onChange={setExportGardus}
                                    multiple
                                >
                                    <div className="relative">
                                        <Combobox.Input
                                            className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                                            displayValue={() =>
                                                exportGardus.length > 0
                                                    ? `${exportGardus.length} Gardu Induk dipilih`
                                                    : "Pilih Gardu Induk"
                                            }
                                            readOnly
                                        />
                                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                                            <FaChevronDown
                                                className="h-5 w-5 text-gray-400"
                                                aria-hidden="true"
                                            />
                                        </Combobox.Button>
                                    </div>
                                    <Transition
                                        as={Fragment}
                                        leave="transition ease-in duration-100"
                                        leaveFrom="opacity-100"
                                        leaveTo="opacity-0"
                                    >
                                        <Combobox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                            {garduOptions.map((gardu) => (
                                                <Combobox.Option
                                                    key={gardu}
                                                    className={({ active }) =>
                                                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                                            active
                                                                ? "bg-green-600 text-white"
                                                                : "text-gray-900"
                                                        }`
                                                    }
                                                    value={gardu}
                                                >
                                                    {({ selected, active }) => (
                                                        <>
                                                            <span
                                                                className={`block truncate ${
                                                                    selected
                                                                        ? "font-medium"
                                                                        : "font-normal"
                                                                }`}
                                                            >
                                                                {gardu}
                                                            </span>
                                                            {selected ? (
                                                                <span
                                                                    className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                                                        active
                                                                            ? "text-white"
                                                                            : "text-green-600"
                                                                    }`}
                                                                >
                                                                    <FaCheck
                                                                        className="h-5 w-5"
                                                                        aria-hidden="true"
                                                                    />
                                                                </span>
                                                            ) : null}
                                                        </>
                                                    )}
                                                </Combobox.Option>
                                            ))}
                                        </Combobox.Options>
                                    </Transition>
                                </Combobox>
                            </div>

                            {/* Month Selection */}
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Pilih Bulan
                                </label>
                                <Combobox
                                    value={exportMonths}
                                    onChange={setExportMonths}
                                    multiple
                                >
                                    <div className="relative">
                                        <Combobox.Input
                                            className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                                            displayValue={() =>
                                                exportMonths.length > 0
                                                    ? `${exportMonths.length} Bulan dipilih`
                                                    : "Ketik untuk mencari bulan..."
                                            }
                                            placeholder="Ketik untuk mencari bulan..."
                                            onChange={(event) =>
                                                setMonthQuery(
                                                    event.target.value
                                                )
                                            }
                                            value={monthQuery}
                                        />
                                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                                            <FaChevronDown
                                                className="h-5 w-5 text-gray-400"
                                                aria-hidden="true"
                                            />
                                        </Combobox.Button>
                                    </div>
                                    <Transition
                                        as={Fragment}
                                        leave="transition ease-in duration-100"
                                        leaveFrom="opacity-100"
                                        leaveTo="opacity-0"
                                    >
                                        <Combobox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                            {filteredMonthOptions.length ===
                                                0 && monthQuery !== "" ? (
                                                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                                                    Tidak ada bulan yang
                                                    ditemukan.
                                                </div>
                                            ) : (
                                                filteredMonthOptions.map(
                                                    (month) => (
                                                        <Combobox.Option
                                                            key={month}
                                                            className={({
                                                                active,
                                                            }) =>
                                                                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                                                    active
                                                                        ? "bg-purple-600 text-white"
                                                                        : "text-gray-900"
                                                                }`
                                                            }
                                                            value={month}
                                                        >
                                                            {({
                                                                selected,
                                                                active,
                                                            }) => (
                                                                <>
                                                                    <span
                                                                        className={`block truncate ${
                                                                            selected
                                                                                ? "font-medium"
                                                                                : "font-normal"
                                                                        }`}
                                                                    >
                                                                        {(() => {
                                                                            const [
                                                                                year,
                                                                                monthNum,
                                                                            ] =
                                                                                month.split(
                                                                                    "-"
                                                                                );
                                                                            const monthNames =
                                                                                [
                                                                                    "Januari",
                                                                                    "Februari",
                                                                                    "Maret",
                                                                                    "April",
                                                                                    "Mei",
                                                                                    "Juni",
                                                                                    "Juli",
                                                                                    "Agustus",
                                                                                    "September",
                                                                                    "Oktober",
                                                                                    "November",
                                                                                    "Desember",
                                                                                ];
                                                                            return `${
                                                                                monthNames[
                                                                                    parseInt(
                                                                                        monthNum
                                                                                    ) -
                                                                                        1
                                                                                ]
                                                                            } ${year}`;
                                                                        })()}
                                                                    </span>
                                                                    {selected ? (
                                                                        <span
                                                                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                                                                active
                                                                                    ? "text-white"
                                                                                    : "text-purple-600"
                                                                            }`}
                                                                        >
                                                                            <FaCheck
                                                                                className="h-5 w-5"
                                                                                aria-hidden="true"
                                                                            />
                                                                        </span>
                                                                    ) : null}
                                                                </>
                                                            )}
                                                        </Combobox.Option>
                                                    )
                                                )
                                            )}
                                        </Combobox.Options>
                                    </Transition>
                                </Combobox>
                            </div>

                            {/* Selected Items Display */}
                            {(exportUltgs.length > 0 ||
                                exportGardus.length > 0 ||
                                exportMonths.length > 0) && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                                        Parameter yang Dipilih:
                                    </h3>
                                    <div className="space-y-2">
                                        {exportUltgs.length > 0 && (
                                            <div>
                                                <span className="text-xs font-medium text-gray-600">
                                                    ULTG:
                                                </span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {exportUltgs.map((ultg) => (
                                                        <span
                                                            key={ultg}
                                                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                                        >
                                                            {ultg}
                                                            <button
                                                                type="button"
                                                                className="ml-1 text-blue-600 hover:text-blue-800"
                                                                onClick={() =>
                                                                    setExportUltgs(
                                                                        exportUltgs.filter(
                                                                            (
                                                                                item
                                                                            ) =>
                                                                                item !==
                                                                                ultg
                                                                        )
                                                                    )
                                                                }
                                                            >
                                                                <FaTimes
                                                                    size={10}
                                                                />
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {exportGardus.length > 0 && (
                                            <div>
                                                <span className="text-xs font-medium text-gray-600">
                                                    Gardu Induk:
                                                </span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {exportGardus.map(
                                                        (gardu) => (
                                                            <span
                                                                key={gardu}
                                                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                                                            >
                                                                {gardu}
                                                                <button
                                                                    type="button"
                                                                    className="ml-1 text-green-600 hover:text-green-800"
                                                                    onClick={() =>
                                                                        setExportGardus(
                                                                            exportGardus.filter(
                                                                                (
                                                                                    item
                                                                                ) =>
                                                                                    item !==
                                                                                    gardu
                                                                            )
                                                                        )
                                                                    }
                                                                >
                                                                    <FaTimes
                                                                        size={
                                                                            10
                                                                        }
                                                                    />
                                                                </button>
                                                            </span>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        {exportMonths.length > 0 && (
                                            <div>
                                                <span className="text-xs font-medium text-gray-600">
                                                    Bulan:
                                                </span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {exportMonths.map(
                                                        (month) => {
                                                            const [
                                                                year,
                                                                monthNum,
                                                            ] =
                                                                month.split(
                                                                    "-"
                                                                );
                                                            const monthNames = [
                                                                "Januari",
                                                                "Februari",
                                                                "Maret",
                                                                "April",
                                                                "Mei",
                                                                "Juni",
                                                                "Juli",
                                                                "Agustus",
                                                                "September",
                                                                "Oktober",
                                                                "November",
                                                                "Desember",
                                                            ];
                                                            const displayMonth = `${
                                                                monthNames[
                                                                    parseInt(
                                                                        monthNum
                                                                    ) - 1
                                                                ]
                                                            } ${year}`;

                                                            return (
                                                                <span
                                                                    key={month}
                                                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                                                                >
                                                                    {
                                                                        displayMonth
                                                                    }
                                                                    <button
                                                                        type="button"
                                                                        className="ml-1 text-purple-600 hover:text-purple-800"
                                                                        onClick={() =>
                                                                            setExportMonths(
                                                                                exportMonths.filter(
                                                                                    (
                                                                                        item
                                                                                    ) =>
                                                                                        item !==
                                                                                        month
                                                                                )
                                                                            )
                                                                        }
                                                                    >
                                                                        <FaTimes
                                                                            size={
                                                                                10
                                                                            }
                                                                        />
                                                                    </button>
                                                                </span>
                                                            );
                                                        }
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-3 pt-4 border-t">
                                <SecondaryButton
                                    onClick={() => setShowExportModal(false)}
                                >
                                    Batal
                                </SecondaryButton>
                                <PrimaryButton
                                    onClick={() => {
                                        handleExport();
                                        setShowExportModal(false);
                                    }}
                                    disabled={
                                        exportUltgs.length === 0 &&
                                        exportGardus.length === 0 &&
                                        exportMonths.length === 0
                                    }
                                >
                                    <FaFileExcel className="mr-2" />
                                    Export ke Excel
                                </PrimaryButton>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
}
