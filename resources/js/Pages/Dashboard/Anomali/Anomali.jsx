import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link } from "@inertiajs/react";
import {
    FaPlus,
    FaFilter,
    FaChevronLeft,
    FaChevronRight,
    FaCheck,
    FaFileExcel,
    FaClipboard,
    FaSearch,
} from "react-icons/fa";
import ErrorBoundary from "@/Components/ErrorBoundary";
import { useState, useMemo, useEffect } from "react";
import { MdOutlineReportProblem } from "react-icons/md";
import { Listbox } from "@headlessui/react";
import dateFormat, { masks } from "dateformat";
import { Combobox } from "@headlessui/react";

function StatusBadge({ status }) {
    let color = "bg-gray-300 text-gray-700";
    if (status === "New") color = "bg-red-100 text-red-700";
    else if (status === "Open") color = "bg-blue-100 text-blue-800";
    else if (status === "Pending") color = "bg-orange-100 text-orange-800";
    else if (status === "Close") color = "bg-emerald-100 text-emerald-700";
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

export default function Anomali({ anomalis = [], auth = [] }) {
    const [rowsPerPage, setRowsPerPage] = useState(8);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [exportMonth, setExportMonth] = useState("all");
    const [monthQuery, setMonthQuery] = useState("");
    const [exportUltg, setExportUltg] = useState("all");
    const [exportGardu, setExportGardu] = useState("all");
    const [activeTab, setActiveTab] = useState("tabel");

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
        return ["all", ...Array.from(set)];
    }, [anomalis]);

    const garduOptions = useMemo(() => {
        if (exportUltg === "all") {
            const set = new Set(
                anomalis.map((a) => a.gardu_induk?.name).filter(Boolean)
            );
            return ["all", ...Array.from(set)];
        }
        const set = new Set(
            anomalis
                .filter((a) => a.ultg === exportUltg)
                .map((a) => a.gardu_induk?.name)
                .filter(Boolean)
        );
        return ["all", ...Array.from(set)];
    }, [anomalis, exportUltg]);

    useEffect(() => {
        setMonthQuery("");
    }, [exportMonth]);

    const handleExport = () => {
        let url = route("dashboard.anomali.export", {
            month: exportMonth,
            ultg: exportUltg,
            gardu: exportGardu,
        });
        window.location.href = url;
    };

    const handleRowsPerPageChange = (val) => {
        setRowsPerPage(val);
        setPage(1);
    };

    // Filter data berdasarkan wilayah user login
    const filteredAnomalis = useMemo(() => {
        if (!Array.isArray(anomalis)) return [];
        if (!auth?.user?.wilayah) return anomalis;

        const wilayah = auth.user.wilayah.trim().toLowerCase();

        let filtered = anomalis;

        // Filter by wilayah
        if (wilayah === "upt karawang") {
            // Tidak filter berdasarkan ultg, hanya search
            filtered = anomalis;
        } else if (wilayah === "ultg karawang") {
            filtered = anomalis.filter(
                (a) => (a.ultg || "").toLowerCase() === "ultg karawang"
            );
        } else if (wilayah === "ultg purwakarta") {
            filtered = anomalis.filter(
                (a) => (a.ultg || "").toLowerCase() === "ultg purwakarta"
            );
        }

        // Filter by search term
        if (searchTerm && searchTerm.trim() !== "") {
            const lowerSearch = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (a) =>
                    (a.judul && a.judul.toLowerCase().includes(lowerSearch)) ||
                    (a.gardu_induk?.name &&
                        a.gardu_induk.name.toLowerCase().includes(lowerSearch))
            );
        }

        return filtered;
    }, [anomalis, auth, searchTerm]);

    const totalRows = filteredAnomalis.length;
    const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
    const paginatedData = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        return filteredAnomalis.slice(start, start + rowsPerPage);
    }, [filteredAnomalis, page, rowsPerPage]);

    console.log(auth);

    const handlePrev = () => setPage((p) => Math.max(1, p - 1));
    const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

    return (
        <>
            <Head title="Anomali" />
            <DashboardLayout>
                <div className="py-6 w-full mx-auto px-4 sm:px-6 lg:px-8 bg-gray-50">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-0 overflow-hidden">
                        {/* Tabs */}
                        <div className="flex border-b border-gray-200 bg-gray-50">
                            <button
                                className={`px-6 py-3 text-sm font-semibold focus:outline-none transition-colors border-b-2 ${
                                    activeTab === "tabel"
                                        ? "border-blue-600 text-blue-700 bg-white"
                                        : "border-transparent text-gray-500 hover:text-blue-600 hover:bg-gray-100"
                                }`}
                                onClick={() => setActiveTab("tabel")}
                                type="button"
                            >
                                Tabel Anomali
                            </button>
                            <button
                                className={`px-6 py-3 text-sm font-semibold focus:outline-none transition-colors border-b-2 ${
                                    activeTab === "approval"
                                        ? "border-blue-600 text-blue-700 bg-white"
                                        : "border-transparent text-gray-500 hover:text-blue-600 hover:bg-gray-100"
                                }`}
                                onClick={() => setActiveTab("approval")}
                                type="button"
                            >
                                Approval Anomali
                            </button>
                        </div>
                        {/* Tab Content */}
                        {activeTab === "tabel" ? (
                            <>
                                <div className="px-4 sm:px-6 pt-6 pb-4 border-b border-gray-200 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="w-full md:w-2/3">
                                        <h2 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
                                            <MdOutlineReportProblem className="text-blue-500 text-2xl" />
                                            <span>Manajemen Anomali</span>
                                        </h2>
                                        <p className="text-gray-600 text-sm mb-2">
                                            Sistem manajemen Anomali
                                            memungkinkan Anda untuk mencatat,
                                            memantau, dan mengelola berbagai
                                            anomali atau gangguan yang terjadi
                                            pada sistem kelistrikan. Dengan
                                            fitur ini, Anda dapat mendeteksi
                                            anomali lebih cepat, melakukan
                                            analisis penyebab, serta mengambil
                                            tindakan korektif secara efisien
                                            untuk menjaga keandalan dan keamanan
                                            operasional.
                                        </p>
                                    </div>
                                    <div className="w-full md:w-auto flex justify-start md:justify-end">
                                        <Link
                                            href={route(
                                                "dashboard.anomali.create"
                                            )}
                                            className="w-full md:w-auto bg-blue-600 text-white px-4 sm:px-5 py-2 rounded-md shadow-sm hover:bg-blue-700 font-semibold flex items-center justify-center gap-2 transition-colors text-sm sm:text-base"
                                        >
                                            <FaPlus className="text-base sm:text-lg" />
                                            <span>Tambah Anomali</span>
                                        </Link>
                                    </div>
                                </div>
                                <div className="px-2 md:px-6 pb-6 pt-4">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                                        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                                            <div className="flex items-center bg-white border border-gray-200 rounded-md px-3 py-2 shadow-sm gap-2">
                                                <span className="text-gray-700 font-medium text-sm hidden sm:inline">
                                                    Export:
                                                </span>
                                                <Combobox
                                                    value={exportUltg}
                                                    onChange={(val) => {
                                                        setExportUltg(val);
                                                        setExportGardu("all");
                                                    }}
                                                >
                                                    <div className="relative w-40">
                                                        <Combobox.Input
                                                            className="border-gray-300 rounded px-2 py-1 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            displayValue={(
                                                                val
                                                            ) => {
                                                                if (
                                                                    !val ||
                                                                    val ===
                                                                        "all"
                                                                )
                                                                    return "Semua ULTG";
                                                                return val;
                                                            }}
                                                            onChange={() => {}}
                                                            placeholder="Pilih ULTG..."
                                                        />
                                                        <Combobox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                                                            <Combobox.Option
                                                                value="all"
                                                                className={({
                                                                    active,
                                                                }) =>
                                                                    `cursor-pointer select-none py-2 px-4 ${
                                                                        active
                                                                            ? "bg-blue-50 text-blue-900"
                                                                            : "text-gray-900"
                                                                    }`
                                                                }
                                                            >
                                                                Semua ULTG
                                                            </Combobox.Option>
                                                            {ultgOptions
                                                                .filter(
                                                                    (u) =>
                                                                        u !==
                                                                        "all"
                                                                )
                                                                .map((u) => (
                                                                    <Combobox.Option
                                                                        key={u}
                                                                        value={
                                                                            u
                                                                        }
                                                                        className={({
                                                                            active,
                                                                        }) =>
                                                                            `cursor-pointer select-none py-2 px-4 ${
                                                                                active
                                                                                    ? "bg-blue-50 text-blue-900"
                                                                                    : "text-gray-900"
                                                                            }`
                                                                        }
                                                                    >
                                                                        {u}
                                                                    </Combobox.Option>
                                                                ))}
                                                        </Combobox.Options>
                                                    </div>
                                                </Combobox>
                                                <Combobox
                                                    value={exportGardu}
                                                    onChange={setExportGardu}
                                                >
                                                    <div className="relative w-48">
                                                        <Combobox.Input
                                                            className="border-gray-300 rounded px-2 py-1 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            displayValue={(
                                                                val
                                                            ) => {
                                                                if (
                                                                    !val ||
                                                                    val ===
                                                                        "all"
                                                                )
                                                                    return "Semua Gardu Induk";
                                                                return val;
                                                            }}
                                                            onChange={() => {}}
                                                            placeholder="Pilih Gardu Induk..."
                                                        />
                                                        <Combobox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                                                            <Combobox.Option
                                                                value="all"
                                                                className={({
                                                                    active,
                                                                }) =>
                                                                    `cursor-pointer select-none py-2 px-4 ${
                                                                        active
                                                                            ? "bg-blue-50 text-blue-900"
                                                                            : "text-gray-900"
                                                                    }`
                                                                }
                                                            >
                                                                Semua Gardu
                                                                Induk
                                                            </Combobox.Option>
                                                            {garduOptions
                                                                .filter(
                                                                    (g) =>
                                                                        g !==
                                                                        "all"
                                                                )
                                                                .map((g) => (
                                                                    <Combobox.Option
                                                                        key={g}
                                                                        value={
                                                                            g
                                                                        }
                                                                        className={({
                                                                            active,
                                                                        }) =>
                                                                            `cursor-pointer select-none py-2 px-4 ${
                                                                                active
                                                                                    ? "bg-blue-50 text-blue-900"
                                                                                    : "text-gray-900"
                                                                            }`
                                                                        }
                                                                    >
                                                                        {g}
                                                                    </Combobox.Option>
                                                                ))}
                                                        </Combobox.Options>
                                                    </div>
                                                </Combobox>
                                                <Combobox
                                                    value={exportMonth}
                                                    onChange={setExportMonth}
                                                >
                                                    <div className="relative w-40">
                                                        <Combobox.Input
                                                            className="border-gray-300 rounded px-2 py-1 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            displayValue={(
                                                                val
                                                            ) => {
                                                                if (
                                                                    !val ||
                                                                    val ===
                                                                        "all"
                                                                )
                                                                    return "Semua Data";
                                                                const [y, m] =
                                                                    val.split(
                                                                        "-"
                                                                    );
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
                                                                ][
                                                                    parseInt(
                                                                        m,
                                                                        10
                                                                    ) - 1
                                                                ];
                                                                return `${bulan} ${y}`;
                                                            }}
                                                            onChange={(e) =>
                                                                setMonthQuery(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="Pilih bulan..."
                                                        />
                                                        <Combobox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                                                            <Combobox.Option
                                                                value="all"
                                                                className={({
                                                                    active,
                                                                }) =>
                                                                    `cursor-pointer select-none py-2 px-4 ${
                                                                        active
                                                                            ? "bg-blue-50 text-blue-900"
                                                                            : "text-gray-900"
                                                                    }`
                                                                }
                                                            >
                                                                Semua Data
                                                            </Combobox.Option>
                                                            {filteredMonthOptions.length ===
                                                                0 && (
                                                                <div className="py-2 px-4 text-gray-400">
                                                                    Tidak ada
                                                                    data bulan
                                                                </div>
                                                            )}
                                                            {filteredMonthOptions.map(
                                                                (m) => {
                                                                    const [
                                                                        y,
                                                                        mo,
                                                                    ] =
                                                                        m.split(
                                                                            "-"
                                                                        );
                                                                    const bulan =
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
                                                                        ][
                                                                            parseInt(
                                                                                mo,
                                                                                10
                                                                            ) -
                                                                                1
                                                                        ];
                                                                    return (
                                                                        <Combobox.Option
                                                                            key={
                                                                                m
                                                                            }
                                                                            value={
                                                                                m
                                                                            }
                                                                            className={({
                                                                                active,
                                                                            }) =>
                                                                                `cursor-pointer select-none py-2 px-4 ${
                                                                                    active
                                                                                        ? "bg-blue-50 text-blue-900"
                                                                                        : "text-gray-900"
                                                                                }`
                                                                            }
                                                                        >
                                                                            {`${bulan} ${y}`}
                                                                        </Combobox.Option>
                                                                    );
                                                                }
                                                            )}
                                                        </Combobox.Options>
                                                    </div>
                                                </Combobox>
                                                <button
                                                    onClick={handleExport}
                                                    type="button"
                                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md font-semibold text-sm flex items-center gap-2 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                                                    title="Export ke Excel"
                                                >
                                                    <FaFileExcel className="text-lg" />
                                                    <span className="sm:inline hidden">
                                                        Export ke Excel
                                                    </span>
                                                    <span className="inline sm:hidden">
                                                        Export
                                                    </span>
                                                </button>
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder="Cari judul..."
                                                    className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                                    value={searchTerm}
                                                    onChange={(e) =>
                                                        setSearchTerm(
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                                            </div>
                                            <button
                                                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md shadow-sm hover:bg-gray-50 font-semibold flex items-center gap-2 transition-colors"
                                                onClick={() =>
                                                    setFilterOpen &&
                                                    setFilterOpen(true)
                                                }
                                                type="button"
                                            >
                                                <FaFilter className="text-gray-400" />
                                                <span className="inline">
                                                    Filter
                                                </span>
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-md px-3 py-2 shadow-sm">
                                            <label className="text-gray-600 text-sm font-medium">
                                                Tampil
                                            </label>
                                            <Listbox
                                                value={rowsPerPage}
                                                onChange={
                                                    handleRowsPerPageChange
                                                }
                                            >
                                                <div className="relative w-20">
                                                    <Listbox.Button className="border-gray-300 rounded px-2 py-1 text-sm w-full text-left bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                                        {rowsPerPage}
                                                    </Listbox.Button>
                                                    <Listbox.Options className="absolute left-0 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg z-20 overflow-hidden">
                                                        {[8, 16, 32].map(
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
                                            <span className="text-gray-500 text-xs">
                                                / halaman
                                            </span>
                                        </div>
                                    </div>
                                    <ErrorBoundary>
                                        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                                            <div className="h-[470px] overflow-y-auto custom-scrollbar">
                                                <table className="min-w-[900px] w-full">
                                                    <thead className="bg-gray-100 text-gray-600 sticky top-0 z-10">
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
                                                                Peralatan
                                                            </th>
                                                            <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold">
                                                                Penempatan Alat
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
                                                        {paginatedData.length ===
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
                                                                            className="px-3 py-3 text-left text-xs sm:text-sm text-gray-800"
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
                                                                            className="px-3 py-3 text-left text-xs sm:text-sm text-gray-700"
                                                                            title={
                                                                                anomali.peralatan
                                                                            }
                                                                        >
                                                                            {
                                                                                anomali.peralatan
                                                                            }
                                                                        </td>
                                                                        <td
                                                                            className="px-3 py-3 text-left text-xs sm:text-sm text-gray-700"
                                                                            title={
                                                                                anomali.penempatan_alat
                                                                            }
                                                                        >
                                                                            {
                                                                                anomali.penempatan_alat
                                                                            }
                                                                        </td>
                                                                        <td className="px-3 py-3 text-left text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                                                                            {dateFormat(
                                                                                anomali.tanggal_kejadian,
                                                                                "dd mmm yyyy"
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
                                                                            <button className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 px-3 py-1 rounded-md shadow-sm text-xs font-bold transition-colors">
                                                                                Detail
                                                                            </button>
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
                                                {totalPages}
                                            </span>
                                            <span className="mx-2">|</span>
                                            Total{" "}
                                            <span className="font-semibold text-gray-800">
                                                {totalRows}
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
                                                disabled={page === totalPages}
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
                            </>
                        ) : (
                            <>
                                <div className="px-4 sm:px-6 pt-6 pb-4 border-b border-gray-200 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="w-full md:w-2/3">
                                        <h2 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
                                            <FaClipboard className="text-amber-500 text-xl" />
                                            <span>
                                                Halaman Approval Anomali
                                            </span>
                                        </h2>
                                        <p className="text-gray-600 text-sm mb-2">
                                            Halaman ini memungkinkan Anda untuk
                                            melihat dan mengelola data anomali
                                            yang menunggu persetujuan. Anda
                                            dapat melihat detail anomali,
                                            menyetujui atau menolak anomali,
                                            serta mengelola proses approval
                                            secara efisien.
                                        </p>
                                    </div>
                                </div>
                                <div className="px-2 md:px-6 pb-6 pt-4">
                                    <ErrorBoundary>
                                        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                                            <div className="max-h-[500px] min-h-[320px] overflow-y-auto custom-scrollbar">
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
                                                        {paginatedData.length ===
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
                                                                            {dateFormat(
                                                                                anomali.tanggal_kejadian,
                                                                                "dd mmm yyyy"
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
                                                                            <button className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 px-3 py-1 rounded-md shadow-sm text-xs font-bold transition-colors">
                                                                                Detail
                                                                            </button>
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
                                                {totalPages}
                                            </span>
                                            <span className="mx-2">|</span>
                                            Total{" "}
                                            <span className="font-semibold text-gray-800">
                                                {totalRows}
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
                                                disabled={page === totalPages}
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
                            </>
                        )}
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}
