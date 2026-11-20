import DashboardLayout from "@/Layouts/DashboardLayout";
import PageHeader from "@/Components/Dashboard/PageHeader";
import ProcessPipeline from "@/Components/Anomali/ProcessPipeline";
import AnomaliTable from "@/Components/Anomali/AnomaliTable";
import AnomaliCalendar from "@/Components/Anomali/AnomaliCalendar";
import ScheduleDetailModal from "@/Components/Anomali/ScheduleDetailModal";
import { PERMISSIONS, hasPermission } from "@/utils/permissions";
import {
    buildMyQueue,
    countByStage,
    deriveStage,
} from "@/Components/Anomali/anomaliWorkflow";
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
    FaClipboardList,
    FaEdit,
    FaMapMarkerAlt,
    FaBuilding,
    FaInbox,
    FaCheckCircle,
} from "react-icons/fa";
import ErrorBoundary from "@/Components/ErrorBoundary";
import { useState, useMemo, useEffect, useRef, Fragment } from "react";
import { MdOutlineReportProblem } from "react-icons/md";
import { Listbox, Combobox, Tab, Transition } from "@headlessui/react";
import { formatDate } from "@/Components/Utils/formatDate";
import Modal from "@/Components/Modal";

const VIEW_STORAGE_KEY = "anomaliView";
const VIEWS = [
    { id: "mine", label: "Perlu tindakan saya", icon: FaInbox },
    { id: "all", label: "Semua anomali", icon: FaTable },
    { id: "calendar", label: "Kalender", icon: FaCalendarAlt },
];

function readStoredView() {
    try {
        const saved = localStorage.getItem(VIEW_STORAGE_KEY);
        return VIEWS.some((v) => v.id === saved) ? saved : null;
    } catch {
        return null;
    }
}

function writeStoredView(view) {
    try {
        if (view) localStorage.setItem(VIEW_STORAGE_KEY, view);
    } catch {
        // Preferensi tampilan tidak tersimpan (mis. mode privat); abaikan.
    }
}

function viewCountClass(id, isActive) {
    if (!isActive) return "bg-slate-100 text-slate-600";
    return id === "mine" ? "bg-volt text-ink-950" : "bg-white/15 text-white";
}

function ViewSwitch({ activeView, counts, onSelect }) {
    return (
        <div
            role="group"
            aria-label="Tampilan anomali"
            className="inline-flex flex-wrap gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-soft"
        >
            {VIEWS.map(({ id, label, icon: Icon }) => {
                const isActive = activeView === id;
                return (
                    <button
                        key={id}
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => onSelect(id)}
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                            isActive
                                ? "bg-ink-900 text-white shadow-soft"
                                : "text-slate-600 hover:bg-slate-100 hover:text-ink-900"
                        }`}
                    >
                        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                        {label}
                        {counts[id] !== undefined ? (
                            <span
                                className={`rounded-full px-2 py-0.5 text-[11px] tabular-nums ${viewCountClass(id, isActive)}`}
                            >
                                {counts[id]}
                            </span>
                        ) : null}
                    </button>
                );
            })}
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
    // Tampilan awal ditetapkan sekali dari antrean penuh, supaya tidak
    // berpindah sendiri saat pengguna mencari atau menyaring.
    const [view, setView] = useState(
        () =>
            readStoredView() ??
            (buildMyQueue(anomalis, auth?.user ?? null).length > 0
                ? "mine"
                : "all"),
    );
    const [stageFilter, setStageFilter] = useState(null);

    useEffect(() => {
        writeStoredView(view);
    }, [view]);
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
    const [showEventModal, setShowEventModal] = useState(false);
    const [selectedEventAnomali, setSelectedEventAnomali] = useState(null);

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
                  u.toLowerCase().includes(ultgQuery.toLowerCase()),
              );

    const garduOptions = useMemo(() => {
        let filteredAnomalies = anomalis;

        // Filter berdasarkan wilayah user, kecuali jika wilayah = 'upt karawang'
        if (auth?.user?.wilayah) {
            const wilayah = auth.user.wilayah.trim().toLowerCase();

            if (wilayah === "ultg karawang") {
                filteredAnomalies = anomalis.filter(
                    (a) => (a.ultg || "").toLowerCase() === "ultg karawang",
                );
            } else if (wilayah === "ultg purwakarta") {
                filteredAnomalies = anomalis.filter(
                    (a) => (a.ultg || "").toLowerCase() === "ultg purwakarta",
                );
            }
            // Untuk 'upt karawang', tampilkan semua gardu induk (tidak ada filter)
        }

        const set = new Set(
            filteredAnomalies.map((a) => a.gardu_induk?.name).filter(Boolean),
        );
        return Array.from(set).sort();
    }, [anomalis, auth]);

    // Filter garduOptions sesuai query pencarian
    const filteredGarduOptions = useMemo(() => {
        if (!garduQuery) return garduOptions;
        return garduOptions.filter((g) =>
            g.toLowerCase().includes(garduQuery.toLowerCase()),
        );
    }, [garduOptions, garduQuery]);

    // Options for filters - generate from actual data
    const bagianOptions = useMemo(() => {
        const set = new Set(anomalis.map((a) => a.bagian).filter(Boolean));
        return Array.from(set).sort();
    }, [anomalis]);

    const kategoriOptions = useMemo(() => {
        const set = new Set(
            anomalis.map((a) => a.kategori?.name).filter(Boolean),
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
            bagian.toLowerCase().includes(bagianQuery.toLowerCase()),
        );
    }, [bagianOptions, bagianQuery]);

    const filteredKategoriOptions = useMemo(() => {
        if (!kategoriQuery) return kategoriOptions;
        return kategoriOptions.filter((kategori) =>
            kategori.toLowerCase().includes(kategoriQuery.toLowerCase()),
        );
    }, [kategoriOptions, kategoriQuery]);

    const filteredStatusOptions = useMemo(() => {
        if (!statusQuery) return statusOptions;
        return statusOptions.filter((status) =>
            status.toLowerCase().includes(statusQuery.toLowerCase()),
        );
    }, [statusOptions, statusQuery]);

    useEffect(() => {
        setMonthQuery("");
    }, [exportMonths]);

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

    const handleCalendarEventClick = (anomali) => {
        setSelectedEventAnomali(anomali);
        setShowEventModal(true);
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
                    (a) => (a.ultg || "").toLowerCase() === "ultg karawang",
                );
            } else if (wilayah === "ultg purwakarta") {
                filtered = filtered.filter(
                    (a) => (a.ultg || "").toLowerCase() === "ultg purwakarta",
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
                (a) => (a.gardu_induk?.name || "") === selectedGarduInduk,
            );
        }

        // Filter by bagian
        if (selectedBagian) {
            filtered = filtered.filter(
                (a) => (a.bagian || "") === selectedBagian,
            );
        }

        // Filter by kategori
        if (selectedKategori) {
            filtered = filtered.filter(
                (a) => (a.kategori?.name || "") === selectedKategori,
            );
        }

        // Filter by status
        if (selectedStatus) {
            filtered = filtered.filter(
                (a) => (a.status || "") === selectedStatus,
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

    const user = auth?.user ?? null;
    const today = useMemo(() => new Date(), []);
    // Form dibuka dengan "View Anomali Create", tetapi simpan butuh "Buat Anomali".
    const canCreate = hasPermission(user, [
        PERMISSIONS.ANOMALI_CREATE_FORM,
        PERMISSIONS.ANOMALI_CREATE,
    ]);
    const canExport = hasPermission(user, PERMISSIONS.ANOMALI_EXPORT);

    const myQueue = useMemo(
        () => buildMyQueue(filteredAnomalis, user, today),
        [filteredAnomalis, user, today],
    );
    const stageCounts = useMemo(
        () => countByStage(filteredAnomalis, today),
        [filteredAnomalis, today],
    );
    const activeView = view;

    const stageFilteredAnomalis = useMemo(() => {
        if (!stageFilter) return filteredAnomalis;
        return filteredAnomalis.filter((a) => deriveStage(a) === stageFilter);
    }, [filteredAnomalis, stageFilter]);

    const visibleRows = useMemo(() => {
        if (activeView !== "mine") return stageFilteredAnomalis;
        if (!stageFilter) return myQueue;
        return myQueue.filter((a) => deriveStage(a) === stageFilter);
    }, [activeView, myQueue, stageFilteredAnomalis, stageFilter]);

    const totalRows = visibleRows.length;
    const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));

    const paginatedData = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        return visibleRows.slice(start, start + rowsPerPage);
    }, [visibleRows, page, rowsPerPage]);

    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [page, totalPages]);

    const handleSelectStage = (stage) => {
        setStageFilter(stage);
        setPage(1);
    };

    const handleSelectView = (next) => {
        setView(next);
        setPage(1);
    };

    const handlePageChange = (next) =>
        setPage(Math.min(Math.max(1, next), totalPages));

    const emptyState =
        activeView === "mine" ? (
            <>
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-100">
                    <FaCheckCircle className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-ink-900">
                    Tidak ada yang menunggu tindakan Anda
                </h3>
                <p className="mt-1 max-w-sm text-sm text-slate-600">
                    Anomali yang perlu Anda review, jadwalkan, atau tutup akan
                    muncul di sini.
                </p>
                <button
                    type="button"
                    onClick={() => handleSelectView("all")}
                    className="btn-ghost mt-5"
                >
                    Lihat semua anomali
                </button>
            </>
        ) : (
            <>
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                    <FaClipboardList className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-ink-900">
                    Tidak ada anomali yang cocok
                </h3>
                <p className="mt-1 max-w-sm text-sm text-slate-600">
                    Ubah pencarian, filter, atau tahap yang dipilih.
                </p>
            </>
        );

    return (
        <>
            <DashboardLayout title="Anomali">
                <Head title="Anomali" />

                <div className="min-h-full">
                    <PageHeader
                        icon={MdOutlineReportProblem}
                        title="Anomali Peralatan"
                        description="Laporkan, review, jadwalkan, dan tutup anomali dalam satu alur."
                    >
                        {canCreate ? (
                            <Link
                                href={route("dashboard.anomali.create")}
                                className="btn-brand"
                            >
                                <FaPlusCircle className="h-3.5 w-3.5" />
                                Laporkan anomali
                            </Link>
                        ) : null}
                    </PageHeader>

                    <ProcessPipeline
                        counts={stageCounts}
                        activeStage={stageFilter}
                        onSelect={handleSelectStage}
                    />

                    <div className="mb-4">
                        <ViewSwitch
                            activeView={activeView}
                            counts={{
                                mine: myQueue.length,
                                all: filteredAnomalis.length,
                            }}
                            onSelect={handleSelectView}
                        />
                    </div>

                    <div className="pb-6">
                                        {/* Modern Toolbar */}
                                        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm mb-6">
                                            <div className="flex flex-col lg:flex-row gap-3">
                                                {/* Search */}
                                                <div className="relative flex-1">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <FaSearch className="text-slate-400 text-sm" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        placeholder="Cari berdasarkan judul anomali..."
                                                        className="block w-full pl-10 pr-4 py-2.5 rounded-xl border-slate-200 bg-slate-50 text-sm focus:border-cyan-500 focus:ring-cyan-500 focus:ring-opacity-20 focus:bg-white placeholder:text-slate-400 transition-all"
                                                        value={searchTerm}
                                                        onChange={(e) =>
                                                            handleSearch(
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </div>

                                                {/* Actions Group */}
                                                <div className="flex items-center gap-2 flex-wrap pb-1 lg:pb-0">
                                                    <button
                                                        onClick={() =>
                                                            setFilterOpen &&
                                                            setFilterOpen(true)
                                                        }
                                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border whitespace-nowrap ${
                                                            dateFrom ||
                                                            dateTo ||
                                                            selectedGarduInduk ||
                                                            selectedBagian ||
                                                            selectedKategori ||
                                                            selectedStatus
                                                                ? "bg-cyan-50 border-cyan-200 text-cyan-700"
                                                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                                        }`}
                                                    >
                                                        <FaFilter
                                                            className={
                                                                dateFrom ||
                                                                dateTo ||
                                                                selectedGarduInduk ||
                                                                selectedBagian ||
                                                                selectedKategori ||
                                                                selectedStatus
                                                                    ? "text-cyan-500"
                                                                    : "text-slate-400"
                                                            }
                                                        />
                                                        <span>Filter</span>
                                                    </button>

                                                    {canExport ? (
                                                        <button
                                                            onClick={() =>
                                                                setShowExportModal(
                                                                    true,
                                                                )
                                                            }
                                                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm font-medium hover:bg-emerald-100 transition-all whitespace-nowrap"
                                                        >
                                                            <FaFileExcel className="text-emerald-600" />
                                                            <span>Export</span>
                                                        </button>
                                                    ) : null}

                                                    <div className="w-px h-8 bg-slate-200 mx-1 hidden lg:block"></div>

                                                    <Listbox
                                                        value={rowsPerPage}
                                                        onChange={
                                                            handleRowsPerPageChange
                                                        }
                                                    >
                                                        <div className="relative">
                                                            <Listbox.Button className="relative flex items-center gap-2 cursor-pointer rounded-xl bg-slate-50 py-2.5 pl-3 pr-8 border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/20 whitespace-nowrap">
                                                                <span className="block truncate">
                                                                    {
                                                                        rowsPerPage
                                                                    }{" "}
                                                                    <span className="hidden sm:inline">
                                                                        baris
                                                                    </span>
                                                                </span>
                                                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                                    <FaChevronDown
                                                                        className="h-3 w-3 text-slate-400"
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
                                                                <Listbox.Options className="absolute right-0 z-20 mt-1 max-h-60 w-32 overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                                    {[
                                                                        10, 20,
                                                                        50, 100,
                                                                    ].map(
                                                                        (
                                                                            option,
                                                                        ) => (
                                                                            <Listbox.Option
                                                                                key={
                                                                                    option
                                                                                }
                                                                                className={({
                                                                                    active,
                                                                                }) =>
                                                                                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                                                                        active
                                                                                            ? "bg-sky-50 text-cyan-900"
                                                                                            : "text-slate-900"
                                                                                    }`
                                                                                }
                                                                                value={
                                                                                    option
                                                                                }
                                                                            >
                                                                                {({
                                                                                    selected,
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
                                                                                                option
                                                                                            }{" "}
                                                                                            baris
                                                                                        </span>
                                                                                        {selected ? (
                                                                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-cyan-600">
                                                                                                <FaCheck
                                                                                                    className="h-4 w-4"
                                                                                                    aria-hidden="true"
                                                                                                />
                                                                                            </span>
                                                                                        ) : null}
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
                                            </div>
                                        </div>

                                        {/* Filter Modal */}
                                        <Modal
                                            show={filterOpen}
                                            onClose={() => setFilterOpen(false)}
                                            maxWidth="3xl"
                                        >
                                            <div className="bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                                        <FaFilter className="h-4 w-4" />
                                                    </div>
                                                    Filter Data Anomali
                                                </h3>
                                                <button
                                                    onClick={() =>
                                                        setFilterOpen(false)
                                                    }
                                                    className="text-slate-400 hover:text-slate-600 transition-colors"
                                                >
                                                    <FaTimes size={20} />
                                                </button>
                                            </div>

                                            <div className="px-6 py-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                                    {/* Date Range Filter */}
                                                    <div className="space-y-1.5">
                                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                            Tanggal Dari
                                                        </label>
                                                        <input
                                                            type="date"
                                                            value={dateFrom}
                                                            onChange={(e) =>
                                                                setDateFrom(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="block w-full rounded-xl border-slate-200 bg-slate-50 text-sm focus:border-cyan-500 focus:ring-cyan-500 focus:bg-white transition-all"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                            Tanggal Sampai
                                                        </label>
                                                        <input
                                                            type="date"
                                                            value={dateTo}
                                                            onChange={(e) =>
                                                                setDateTo(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="block w-full rounded-xl border-slate-200 bg-slate-50 text-sm focus:border-cyan-500 focus:ring-cyan-500 focus:bg-white transition-all"
                                                        />
                                                    </div>

                                                    {/* Gardu Induk Filter */}
                                                    <div className="space-y-1.5">
                                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
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
                                                                    className="block w-full rounded-xl border-slate-200 bg-slate-50 text-sm focus:border-cyan-500 focus:ring-cyan-500 focus:bg-white transition-all pl-3 pr-10"
                                                                    displayValue={(
                                                                        gardu,
                                                                    ) =>
                                                                        gardu ||
                                                                        "Semua Gardu Induk"
                                                                    }
                                                                    onChange={(
                                                                        event,
                                                                    ) =>
                                                                        setGarduQuery(
                                                                            event
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    placeholder="Cari gardu induk..."
                                                                />
                                                                <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                                                                    <FaChevronDown className="h-4 w-4 text-slate-400" />
                                                                </Combobox.Button>
                                                                <Combobox.Options
                                                                    anchor="bottom"
                                                                    transition
                                                                    className="z-[100] w-[var(--input-width)] max-h-60 overflow-auto rounded-xl bg-white py-1 text-sm shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
                                                                >
                                                                    <Combobox.Option
                                                                        value=""
                                                                        className={({
                                                                            active,
                                                                        }) =>
                                                                            `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                                                                active
                                                                                    ? "bg-sky-50 text-cyan-900"
                                                                                    : "text-slate-900"
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
                                                                                        className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                                                                            active
                                                                                                ? "text-cyan-600"
                                                                                                : "text-cyan-600"
                                                                                        }`}
                                                                                    >
                                                                                        <FaCheck className="h-4 w-4" />
                                                                                    </span>
                                                                                )}
                                                                            </>
                                                                        )}
                                                                    </Combobox.Option>
                                                                    {filteredGarduOptions.map(
                                                                        (
                                                                            gardu,
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
                                                                                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                                                                        active
                                                                                            ? "bg-blue-50 text-cyan-900"
                                                                                            : "text-slate-900"
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
                                                                                                className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                                                                                    active
                                                                                                        ? "text-cyan-600"
                                                                                                        : "text-cyan-600"
                                                                                                }`}
                                                                                            >
                                                                                                <FaCheck className="h-4 w-4" />
                                                                                            </span>
                                                                                        )}
                                                                                    </>
                                                                                )}
                                                                            </Combobox.Option>
                                                                        ),
                                                                    )}
                                                                </Combobox.Options>
                                                            </div>
                                                        </Combobox>
                                                    </div>

                                                    {/* Bagian Filter */}
                                                    <div className="space-y-1.5">
                                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
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
                                                                    className="block w-full rounded-xl border-slate-200 bg-slate-50 text-sm focus:border-cyan-500 focus:ring-cyan-500 focus:bg-white transition-all pl-3 pr-10"
                                                                    displayValue={(
                                                                        bagian,
                                                                    ) =>
                                                                        bagian ||
                                                                        "Semua Bagian"
                                                                    }
                                                                    onChange={(
                                                                        event,
                                                                    ) =>
                                                                        setBagianQuery(
                                                                            event
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    placeholder="Cari bagian..."
                                                                />
                                                                <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                                                                    <FaChevronDown className="h-4 w-4 text-slate-400" />
                                                                </Combobox.Button>
                                                                <Combobox.Options
                                                                    anchor="bottom"
                                                                    transition
                                                                    className="z-[100] w-[var(--input-width)] max-h-60 overflow-auto rounded-xl bg-white py-1 text-sm shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
                                                                >
                                                                    <Combobox.Option
                                                                        value=""
                                                                        className={({
                                                                            active,
                                                                        }) =>
                                                                            `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                                                                active
                                                                                    ? "bg-sky-50 text-cyan-900"
                                                                                    : "text-slate-900"
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
                                                                                        className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                                                                            active
                                                                                                ? "text-blue-600"
                                                                                                : "text-blue-600"
                                                                                        }`}
                                                                                    >
                                                                                        <FaCheck className="h-4 w-4" />
                                                                                    </span>
                                                                                )}
                                                                            </>
                                                                        )}
                                                                    </Combobox.Option>
                                                                    {filteredBagianOptions.map(
                                                                        (
                                                                            bagian,
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
                                                                                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                                                                        active
                                                                                            ? "bg-sky-50 text-cyan-900"
                                                                                            : "text-slate-900"
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
                                                                                                className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                                                                                    active
                                                                                                        ? "text-blue-600"
                                                                                                        : "text-blue-600"
                                                                                                }`}
                                                                                            >
                                                                                                <FaCheck className="h-4 w-4" />
                                                                                            </span>
                                                                                        )}
                                                                                    </>
                                                                                )}
                                                                            </Combobox.Option>
                                                                        ),
                                                                    )}
                                                                </Combobox.Options>
                                                            </div>
                                                        </Combobox>
                                                    </div>

                                                    {/* Kategori Filter */}
                                                    <div className="space-y-1.5">
                                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
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
                                                                    className="block w-full rounded-xl border-slate-200 bg-slate-50 text-sm focus:border-cyan-500 focus:ring-cyan-500 focus:bg-white transition-all pl-3 pr-10"
                                                                    displayValue={(
                                                                        kategori,
                                                                    ) =>
                                                                        kategori ||
                                                                        "Semua Kategori"
                                                                    }
                                                                    onChange={(
                                                                        event,
                                                                    ) =>
                                                                        setKategoriQuery(
                                                                            event
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    placeholder="Cari kategori..."
                                                                />
                                                                <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                                                                    <FaChevronDown className="h-4 w-4 text-slate-400" />
                                                                </Combobox.Button>
                                                                <Combobox.Options
                                                                    anchor="bottom"
                                                                    transition
                                                                    className="z-[100] w-[var(--input-width)] max-h-60 overflow-auto rounded-xl bg-white py-1 text-sm shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
                                                                >
                                                                    <Combobox.Option
                                                                        value=""
                                                                        className={({
                                                                            active,
                                                                        }) =>
                                                                            `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                                                                active
                                                                                    ? "bg-sky-50 text-cyan-900"
                                                                                    : "text-slate-900"
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
                                                                                        className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                                                                            active
                                                                                                ? "text-cyan-600"
                                                                                                : "text-cyan-600"
                                                                                        }`}
                                                                                    >
                                                                                        <FaCheck className="h-4 w-4" />
                                                                                    </span>
                                                                                )}
                                                                            </>
                                                                        )}
                                                                    </Combobox.Option>
                                                                    {filteredKategoriOptions.map(
                                                                        (
                                                                            kategori,
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
                                                                                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                                                                        active
                                                                                            ? "bg-sky-50 text-cyan-900"
                                                                                            : "text-slate-900"
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
                                                                                                className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                                                                                    active
                                                                                                        ? "text-cyan-600"
                                                                                                        : "text-cyan-600"
                                                                                                }`}
                                                                                            >
                                                                                                <FaCheck className="h-4 w-4" />
                                                                                            </span>
                                                                                        )}
                                                                                    </>
                                                                                )}
                                                                            </Combobox.Option>
                                                                        ),
                                                                    )}
                                                                </Combobox.Options>
                                                            </div>
                                                        </Combobox>
                                                    </div>

                                                    {/* Status Filter */}
                                                    <div className="space-y-1.5">
                                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
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
                                                                    className="block w-full rounded-xl border-slate-200 bg-slate-50 text-sm focus:border-cyan-500 focus:ring-cyan-500 focus:bg-white transition-all pl-3 pr-10"
                                                                    displayValue={(
                                                                        status,
                                                                    ) =>
                                                                        status ||
                                                                        "Semua Status"
                                                                    }
                                                                    onChange={(
                                                                        event,
                                                                    ) =>
                                                                        setStatusQuery(
                                                                            event
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    placeholder="Cari status..."
                                                                />
                                                                <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                                                                    <FaChevronDown className="h-4 w-4 text-slate-400" />
                                                                </Combobox.Button>
                                                                <Combobox.Options
                                                                    anchor="bottom"
                                                                    transition
                                                                    className="z-[100] w-[var(--input-width)] max-h-60 overflow-auto rounded-xl bg-white py-1 text-sm shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
                                                                >
                                                                    <Combobox.Option
                                                                        value=""
                                                                        className={({
                                                                            active,
                                                                        }) =>
                                                                            `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                                                                active
                                                                                    ? "bg-sky-50 text-cyan-900"
                                                                                    : "text-slate-900"
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
                                                                                        className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                                                                            active
                                                                                                ? "text-cyan-600"
                                                                                                : "text-cyan-600"
                                                                                        }`}
                                                                                    >
                                                                                        <FaCheck className="h-4 w-4" />
                                                                                    </span>
                                                                                )}
                                                                            </>
                                                                        )}
                                                                    </Combobox.Option>
                                                                    {filteredStatusOptions.map(
                                                                        (
                                                                            status,
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
                                                                                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                                                                        active
                                                                                            ? "bg-sky-50 text-cyan-900"
                                                                                            : "text-slate-900"
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
                                                                                                className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                                                                                    active
                                                                                                        ? "text-cyan-600"
                                                                                                        : "text-cyan-600"
                                                                                                }`}
                                                                                            >
                                                                                                <FaCheck className="h-4 w-4" />
                                                                                            </span>
                                                                                        )}
                                                                                    </>
                                                                                )}
                                                                            </Combobox.Option>
                                                                        ),
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
                                                    <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <h4 className="text-sm font-semibold text-slate-700">
                                                                Filter Aktif:
                                                            </h4>
                                                            <button
                                                                onClick={
                                                                    handleClearFilters
                                                                }
                                                                className="text-xs font-medium text-red-500 hover:text-red-600 transition-colors"
                                                            >
                                                                Hapus Semua
                                                            </button>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {dateFrom && (
                                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-700 shadow-sm">
                                                                    Dari:{" "}
                                                                    {dateFrom}
                                                                </span>
                                                            )}
                                                            {dateTo && (
                                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-700 shadow-sm">
                                                                    Sampai:{" "}
                                                                    {dateTo}
                                                                </span>
                                                            )}
                                                            {selectedGarduInduk && (
                                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-700 shadow-sm">
                                                                    Gardu:{" "}
                                                                    {
                                                                        selectedGarduInduk
                                                                    }
                                                                </span>
                                                            )}
                                                            {selectedBagian && (
                                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-700 shadow-sm">
                                                                    Bagian:{" "}
                                                                    {
                                                                        selectedBagian
                                                                    }
                                                                </span>
                                                            )}
                                                            {selectedKategori && (
                                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-700 shadow-sm">
                                                                    Kategori:{" "}
                                                                    {
                                                                        selectedKategori
                                                                    }
                                                                </span>
                                                            )}
                                                            {selectedStatus && (
                                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-700 shadow-sm">
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

                                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-row-reverse gap-3 rounded-b-2xl">
                                                <button
                                                    type="button"
                                                    onClick={handleApplyFilters}
                                                    className="w-full md:w-auto bg-brand-600 text-white px-4 sm:px-5 py-2 rounded-xl shadow hover:bg-brand-700 font-semibold flex transition-all duration-300 ease-in-out items-center justify-center gap-2 text-sm sm:text-base"
                                                >
                                                    Terapkan Filter
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleClearFilters}
                                                    className="w-full md:w-auto bg-gradient-to-r from-slate-600 to-gray-600 text-white px-4 sm:px-5 py-2 rounded-xl shadow hover:from-slate-800 hover:to-gray-800 font-semibold flex transition-all duration-300 ease-in-out items-center justify-center gap-2 text-sm sm:text-base"
                                                >
                                                    Reset
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setFilterOpen(false)
                                                    }
                                                    className="w-full sm:w-auto px-4 py-2 bg-white text-slate-700 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50 transition-colors"
                                                >
                                                    Batal
                                                </button>
                                            </div>
                                        </Modal>

                        {activeView === "calendar" ? (
                            <AnomaliCalendar
                                anomalis={stageFilteredAnomalis}
                                user={user}
                                today={today}
                                onEventClick={handleCalendarEventClick}
                            />
                        ) : (
                            <ErrorBoundary>
                                <AnomaliTable
                                    rows={paginatedData}
                                    user={user}
                                    today={today}
                                    page={page}
                                    rowsPerPage={rowsPerPage}
                                    totalRows={totalRows}
                                    onPageChange={handlePageChange}
                                    emptyState={emptyState}
                                />
                            </ErrorBoundary>
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
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h2 className="text-xl font-bold text-slate-800">
                                Export Data ke Excel
                            </h2>
                            <button
                                onClick={() => setShowExportModal(false)}
                                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-6">
                            {/* ULTG Selection */}
                            {auth.user.wilayah === "UPT Karawang" && (
                                <div className="relative">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Pilih ULTG
                                    </label>
                                    <Combobox
                                        value={exportUltgs}
                                        onChange={setExportUltgs}
                                        multiple
                                    >
                                        <div className="relative">
                                            <Combobox.Input
                                                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm text-slate-700 font-medium placeholder:text-slate-400"
                                                displayValue={() =>
                                                    exportUltgs.length > 0
                                                        ? `${exportUltgs.length} ULTG dipilih`
                                                        : "Pilih ULTG"
                                                }
                                                readOnly
                                            />
                                            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
                                                <FaChevronDown
                                                    className="h-4 w-4 text-slate-400"
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
                                            <Combobox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm custom-scrollbar">
                                                {ultgOptions.map((ultg) => (
                                                    <Combobox.Option
                                                        key={ultg}
                                                        className={({
                                                            active,
                                                        }) =>
                                                            `relative cursor-default select-none py-2.5 pl-10 pr-4 ${
                                                                active
                                                                    ? "bg-blue-50 text-blue-900"
                                                                    : "text-slate-700"
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
                                                                            ? "font-semibold"
                                                                            : "font-normal"
                                                                    }`}
                                                                >
                                                                    {ultg}
                                                                </span>
                                                                {selected ? (
                                                                    <span
                                                                        className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                                                            active
                                                                                ? "text-blue-600"
                                                                                : "text-blue-600"
                                                                        }`}
                                                                    >
                                                                        <FaCheck
                                                                            className="h-4 w-4"
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
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Pilih Gardu Induk
                                </label>
                                <Combobox
                                    value={exportGardus}
                                    onChange={setExportGardus}
                                    multiple
                                >
                                    <div className="relative">
                                        <Combobox.Input
                                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm text-slate-700 font-medium placeholder:text-slate-400"
                                            displayValue={() =>
                                                exportGardus.length > 0
                                                    ? `${exportGardus.length} Gardu Induk dipilih`
                                                    : "Pilih Gardu Induk"
                                            }
                                            readOnly
                                        />
                                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
                                            <FaChevronDown
                                                className="h-4 w-4 text-slate-400"
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
                                        <Combobox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm custom-scrollbar">
                                            {garduOptions.map((gardu) => (
                                                <Combobox.Option
                                                    key={gardu}
                                                    className={({ active }) =>
                                                        `relative cursor-default select-none py-2.5 pl-10 pr-4 ${
                                                            active
                                                                ? "bg-blue-50 text-blue-900"
                                                                : "text-slate-700"
                                                        }`
                                                    }
                                                    value={gardu}
                                                >
                                                    {({ selected, active }) => (
                                                        <>
                                                            <span
                                                                className={`block truncate ${
                                                                    selected
                                                                        ? "font-semibold"
                                                                        : "font-normal"
                                                                }`}
                                                            >
                                                                {gardu}
                                                            </span>
                                                            {selected ? (
                                                                <span
                                                                    className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                                                        active
                                                                            ? "text-blue-600"
                                                                            : "text-blue-600"
                                                                    }`}
                                                                >
                                                                    <FaCheck
                                                                        className="h-4 w-4"
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
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Pilih Bulan
                                </label>
                                <Combobox
                                    value={exportMonths}
                                    onChange={setExportMonths}
                                    multiple
                                >
                                    <div className="relative">
                                        <Combobox.Input
                                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm text-slate-700 font-medium placeholder:text-slate-400"
                                            displayValue={() =>
                                                exportMonths.length > 0
                                                    ? `${exportMonths.length} Bulan dipilih`
                                                    : "Ketik untuk mencari bulan..."
                                            }
                                            placeholder="Ketik untuk mencari bulan..."
                                            onChange={(event) =>
                                                setMonthQuery(
                                                    event.target.value,
                                                )
                                            }
                                            value={monthQuery}
                                        />
                                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
                                            <FaChevronDown
                                                className="h-4 w-4 text-slate-400"
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
                                        <Combobox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm custom-scrollbar">
                                            {filteredMonthOptions.length ===
                                                0 && monthQuery !== "" ? (
                                                <div className="relative cursor-default select-none py-2 px-4 text-slate-500">
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
                                                                `relative cursor-default select-none py-2.5 pl-10 pr-4 ${
                                                                    active
                                                                        ? "bg-blue-50 text-blue-900"
                                                                        : "text-slate-700"
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
                                                                                ? "font-semibold"
                                                                                : "font-normal"
                                                                        }`}
                                                                    >
                                                                        {(() => {
                                                                            const [
                                                                                year,
                                                                                monthNum,
                                                                            ] =
                                                                                month.split(
                                                                                    "-",
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
                                                                                        monthNum,
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
                                                                                    ? "text-blue-600"
                                                                                    : "text-blue-600"
                                                                            }`}
                                                                        >
                                                                            <FaCheck
                                                                                className="h-4 w-4"
                                                                                aria-hidden="true"
                                                                            />
                                                                        </span>
                                                                    ) : null}
                                                                </>
                                                            )}
                                                        </Combobox.Option>
                                                    ),
                                                )
                                            )}
                                        </Combobox.Options>
                                    </Transition>
                                </Combobox>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 p-6 bg-slate-50 border-t border-slate-100">
                            <button
                                onClick={() => setShowExportModal(false)}
                                className="px-4 py-2 rounded-xl text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 font-medium transition-all shadow-sm"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleExport}
                                className="px-4 py-2 rounded-xl text-white bg-blue-600 hover:bg-blue-700 font-medium transition-all shadow-sm shadow-blue-500/20 flex items-center gap-2"
                            >
                                <FaFileExcel />
                                Export
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
            {showEventModal && selectedEventAnomali ? (
                <ScheduleDetailModal
                    anomali={selectedEventAnomali}
                    user={user}
                    today={today}
                    onClose={() => setShowEventModal(false)}
                />
            ) : null}
        </>
    );
}
