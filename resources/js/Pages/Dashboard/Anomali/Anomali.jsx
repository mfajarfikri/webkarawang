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
    FaPlusCircle,
} from "react-icons/fa";
import ErrorBoundary from "@/Components/ErrorBoundary";
import { useState, useMemo, useEffect } from "react";
import { MdOutlineReportProblem } from "react-icons/md";
import { Listbox } from "@headlessui/react";
import { Combobox } from "@headlessui/react";
import { formatDate } from "@/Components/Utils/formatDate";
import SecondaryButton from "@/Components/SecondaryButton";
import PrimaryButton from "@/Components/PrimaryButton";

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

export default function Anomali({ anomalis = [], auth = [] }) {
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [exportMonths, setExportMonths] = useState([]);
    const [monthQuery, setMonthQuery] = useState("");
    const [exportUltgs, setExportUltgs] = useState([]);
    const [exportGardus, setExportGardus] = useState([]);
    const [activeTab, setActiveTab] = useState("tabel");
    const [garduQuery, setGarduQuery] = useState("");
    const [ultgQuery, setUltgQuery] = useState("");

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
        const set = new Set(
            anomalis.map((a) => a.gardu_induk?.name).filter(Boolean)
        );
        return Array.from(set).sort();
    }, [anomalis]);

    // Filter garduOptions sesuai query pencarian
    const filteredGarduOptions = useMemo(() => {
        if (!garduQuery) return garduOptions;
        return garduOptions.filter((g) =>
            g.toLowerCase().includes(garduQuery.toLowerCase())
        );
    }, [garduOptions, garduQuery]);

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

    const handlePrev = () => setPage((p) => Math.max(1, p - 1));
    const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

    return (
        <>
            <Head title="Anomali" />
            <DashboardLayout>
                <div className="w-full mx-auto">
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
                            {auth.user.bidang &&
                            auth.user.bidang.toLowerCase() === "multg" ? (
                                <button
                                    className={`px-6 py-3 text-sm font-semibold focus:outline-none transition-colors border-b-2 ${
                                        activeTab === "approval"
                                            ? "border-blue-600 text-blue-700 bg-white"
                                            : "border-transparent text-gray-500 hover:text-blue-600 hover:bg-gray-100"
                                    }`}
                                    onClick={() => setActiveTab("approval")}
                                    type="button"
                                >
                                    Review Anomali
                                </button>
                            ) : (
                                ""
                            )}
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
                                        >
                                            <PrimaryButton className="flex gap-2">
                                                <FaPlusCircle />
                                                Buat Anomali
                                            </PrimaryButton>
                                        </Link>
                                    </div>
                                </div>
                                <div className="px-2 md:px-6 pb-6 pt-4">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                                        <div className="flex flex-col xl:flex-row gap-6 items-stretch xl:items-start">
                                            {/* Export Section */}
                                            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow flex-1">
                                                {/* Filter Grid */}
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
                                                    {/* Multiple ULTG Selection */}
                                                    <div className="relative w-full">
                                                        <Combobox
                                                            value={exportUltgs}
                                                            onChange={
                                                                setExportUltgs
                                                            }
                                                            multiple
                                                        >
                                                            <div className="relative">
                                                                <Combobox.Input
                                                                    className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        setUltgQuery(
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                    displayValue={() =>
                                                                        ""
                                                                    }
                                                                    placeholder="Pilih ULTG..."
                                                                    autoComplete="off"
                                                                />
                                                                <Combobox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow max-h-56 overflow-auto">
                                                                    {filteredUltgOptions.length ===
                                                                    0 ? (
                                                                        <div className="px-4 py-2 text-gray-400 text-sm">
                                                                            Tidak
                                                                            ada
                                                                            data
                                                                        </div>
                                                                    ) : (
                                                                        filteredUltgOptions.map(
                                                                            (
                                                                                o
                                                                            ) => (
                                                                                <Combobox.Option
                                                                                    key={
                                                                                        o
                                                                                    }
                                                                                    value={
                                                                                        o
                                                                                    }
                                                                                    className={({
                                                                                        active,
                                                                                        selected,
                                                                                    }) =>
                                                                                        `cursor-pointer text-sm select-none relative px-4 py-2 ${
                                                                                            active
                                                                                                ? "bg-blue-50 text-blue-800"
                                                                                                : "text-gray-900"
                                                                                        } ${
                                                                                            selected
                                                                                                ? "font-semibold bg-blue-100"
                                                                                                : ""
                                                                                        }`
                                                                                    }
                                                                                >
                                                                                    {({
                                                                                        selected,
                                                                                    }) => (
                                                                                        <span className="flex items-center">
                                                                                            {
                                                                                                o
                                                                                            }
                                                                                            {selected && (
                                                                                                <span className="ml-auto flex items-center text-blue-600">
                                                                                                    <FaCheck
                                                                                                        className="h-4 w-4"
                                                                                                        aria-hidden="true"
                                                                                                    />
                                                                                                </span>
                                                                                            )}
                                                                                        </span>
                                                                                    )}
                                                                                </Combobox.Option>
                                                                            )
                                                                        )
                                                                    )}
                                                                </Combobox.Options>
                                                            </div>
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {exportUltgs.map(
                                                                    (id) => (
                                                                        <span
                                                                            key={
                                                                                id
                                                                            }
                                                                            className="bg-blue-50 text-blue-700 px-2 py-1 mb-2 rounded-full text-xs font-medium border border-blue-200"
                                                                        >
                                                                            {id}
                                                                        </span>
                                                                    )
                                                                )}
                                                            </div>
                                                        </Combobox>
                                                    </div>

                                                    {/* Multiple Gardu Selection */}
                                                    <div className="relative w-full">
                                                        <Combobox
                                                            value={exportGardus}
                                                            onChange={
                                                                setExportGardus
                                                            }
                                                            multiple
                                                        >
                                                            <div className="relative">
                                                                <Combobox.Input
                                                                    className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        setGarduQuery(
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                    displayValue={() =>
                                                                        ""
                                                                    }
                                                                    placeholder="Pilih Gardu Induk..."
                                                                    autoComplete="off"
                                                                />
                                                                <Combobox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow max-h-56 overflow-auto">
                                                                    {filteredGarduOptions.length ===
                                                                    0 ? (
                                                                        <div className="px-4 py-2 text-gray-400 text-sm">
                                                                            Tidak
                                                                            ada
                                                                            data
                                                                        </div>
                                                                    ) : (
                                                                        filteredGarduOptions.map(
                                                                            (
                                                                                g
                                                                            ) => (
                                                                                <Combobox.Option
                                                                                    key={
                                                                                        g
                                                                                    }
                                                                                    value={
                                                                                        g
                                                                                    }
                                                                                    className={({
                                                                                        active,
                                                                                        selected,
                                                                                    }) =>
                                                                                        `cursor-pointer text-sm select-none relative px-4 py-2 ${
                                                                                            active
                                                                                                ? "bg-blue-50 text-blue-800"
                                                                                                : "text-gray-900"
                                                                                        } ${
                                                                                            selected
                                                                                                ? "font-semibold bg-blue-100"
                                                                                                : ""
                                                                                        }`
                                                                                    }
                                                                                >
                                                                                    {({
                                                                                        selected,
                                                                                    }) => (
                                                                                        <span className="flex items-center">
                                                                                            {
                                                                                                g
                                                                                            }
                                                                                            {selected && (
                                                                                                <span className="ml-auto flex items-center text-blue-600">
                                                                                                    <FaCheck
                                                                                                        className="h-4 w-4"
                                                                                                        aria-hidden="true"
                                                                                                    />
                                                                                                </span>
                                                                                            )}
                                                                                        </span>
                                                                                    )}
                                                                                </Combobox.Option>
                                                                            )
                                                                        )
                                                                    )}
                                                                </Combobox.Options>
                                                            </div>
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {exportGardus.map(
                                                                    (g) => (
                                                                        <span
                                                                            key={
                                                                                g
                                                                            }
                                                                            className="bg-blue-50 text-blue-700 px-2 py-1 mb-2 rounded-full text-xs font-medium border border-blue-200"
                                                                        >
                                                                            {g}
                                                                        </span>
                                                                    )
                                                                )}
                                                            </div>
                                                        </Combobox>
                                                    </div>

                                                    {/* Multiple Month Selection */}
                                                    <div className="relative w-full">
                                                        <Combobox
                                                            value={exportMonths}
                                                            onChange={
                                                                setExportMonths
                                                            }
                                                            multiple
                                                        >
                                                            <div className="relative">
                                                                <Combobox.Input
                                                                    className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        setMonthQuery(
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                    displayValue={() =>
                                                                        ""
                                                                    }
                                                                    placeholder="Pilih Bulan..."
                                                                    autoComplete="off"
                                                                />
                                                                <Combobox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow max-h-56 overflow-auto">
                                                                    {filteredMonthOptions.length ===
                                                                    0 ? (
                                                                        <div className="px-4 py-2 text-gray-400 text-sm">
                                                                            Tidak
                                                                            ada
                                                                            data
                                                                        </div>
                                                                    ) : (
                                                                        filteredMonthOptions.map(
                                                                            (
                                                                                m
                                                                            ) => (
                                                                                <Combobox.Option
                                                                                    key={
                                                                                        m
                                                                                    }
                                                                                    value={
                                                                                        m
                                                                                    }
                                                                                    className={({
                                                                                        active,
                                                                                        selected,
                                                                                    }) =>
                                                                                        `cursor-pointer text-sm select-none relative px-4 py-2 ${
                                                                                            active
                                                                                                ? "bg-blue-50 text-blue-800"
                                                                                                : "text-gray-900"
                                                                                        } ${
                                                                                            selected
                                                                                                ? "font-semibold bg-blue-100"
                                                                                                : ""
                                                                                        }`
                                                                                    }
                                                                                >
                                                                                    {({
                                                                                        selected,
                                                                                    }) => (
                                                                                        <span className="flex items-center">
                                                                                            {(() => {
                                                                                                if (
                                                                                                    m ===
                                                                                                    "all"
                                                                                                )
                                                                                                    return "Semua Bulan";
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
                                                                                                return `${bulan} ${y}`;
                                                                                            })()}
                                                                                            {selected && (
                                                                                                <span className="ml-auto flex items-center text-blue-600">
                                                                                                    <FaCheck
                                                                                                        className="h-4 w-4"
                                                                                                        aria-hidden="true"
                                                                                                    />
                                                                                                </span>
                                                                                            )}
                                                                                        </span>
                                                                                    )}
                                                                                </Combobox.Option>
                                                                            )
                                                                        )
                                                                    )}
                                                                </Combobox.Options>
                                                            </div>
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {exportMonths.map(
                                                                    (m) => (
                                                                        <span
                                                                            key={
                                                                                m
                                                                            }
                                                                            className="bg-green-50 text-green-700 px-2 py-1 mb-2 rounded-full text-xs font-medium border border-green-200"
                                                                        >
                                                                            {(() => {
                                                                                if (
                                                                                    m ===
                                                                                    "all"
                                                                                )
                                                                                    return "Semua Bulan";
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
                                                                                return `${bulan} ${y}`;
                                                                            })()}
                                                                        </span>
                                                                    )
                                                                )}
                                                            </div>
                                                        </Combobox>
                                                    </div>

                                                    <div className="flex flex-col gap-2">
                                                        <button
                                                            onClick={
                                                                handleExport
                                                            }
                                                            type="button"
                                                            disabled={
                                                                exportUltgs.length ===
                                                                    0 &&
                                                                exportGardus.length ===
                                                                    0 &&
                                                                exportMonths.length ===
                                                                    0
                                                            }
                                                            className={`px-5 py-2 rounded-md font-semibold text-sm flex items-center justify-center gap-2 shadow transition-all duration-150 focus:outline-none focus:ring-2 ${
                                                                exportUltgs.length ===
                                                                    0 &&
                                                                exportGardus.length ===
                                                                    0 &&
                                                                exportMonths.length ===
                                                                    0
                                                                    ? "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed"
                                                                    : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white focus:ring-green-500"
                                                            }`}
                                                            title="Export ke Excel"
                                                        >
                                                            <FaFileExcel className="text-lg" />
                                                            <span className="font-medium">
                                                                {exportUltgs.length ===
                                                                    0 &&
                                                                exportGardus.length ===
                                                                    0 &&
                                                                exportMonths.length ===
                                                                    0
                                                                    ? "Pilih Data"
                                                                    : "Export ke Excel"}
                                                            </span>
                                                        </button>

                                                        {(exportUltgs.length >
                                                            0 ||
                                                            exportGardus.length >
                                                                0 ||
                                                            exportMonths.length >
                                                                0) && (
                                                            <div className="flex flex-wrap gap-2 mt-1">
                                                                {exportUltgs.length >
                                                                    0 && (
                                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                                                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                                                        {
                                                                            exportUltgs.length
                                                                        }{" "}
                                                                        ULTG
                                                                    </span>
                                                                )}
                                                                {exportGardus.length >
                                                                    0 && (
                                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                                                        {
                                                                            exportGardus.length
                                                                        }{" "}
                                                                        Gardu
                                                                    </span>
                                                                )}
                                                                {exportMonths.length >
                                                                    0 && (
                                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                                                                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                                                                        {
                                                                            exportMonths.length
                                                                        }{" "}
                                                                        Bulan
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Export Button & Filter Summary */}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white border border-gray-200 rounded-lg gap-2 w-full">
                                        <div className="flex flex-row flex-wrap items-center gap-2 px-3 py-4 shadow-sm w-full sm:w-auto justify-center sm:justify-start">
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder="Cari judul..."
                                                    className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
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
                                                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 font-semibold flex items-center gap-2 transition-colors"
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
                                            {/* Move paginate to the end */}
                                        </div>
                                        <div className="flex items-center gap-2 mx-2 sm:mt-0">
                                            <label className="text-gray-600 text-sm font-medium mr-1">
                                                Tampil
                                            </label>
                                            <div className="min-w-[4.5rem]">
                                                <Listbox
                                                    value={rowsPerPage}
                                                    onChange={
                                                        handleRowsPerPageChange
                                                    }
                                                >
                                                    <div className="relative">
                                                        <Listbox.Button className="border border-gray-300 rounded-lg px-2 py-1 text-sm w-full text-left bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                                                            {rowsPerPage}
                                                        </Listbox.Button>
                                                        <Listbox.Options className="absolute left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                                                            {[10, 20, 50].map(
                                                                (option) => (
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
                                            <span className="text-gray-500 text-xs ml-1">
                                                / halaman
                                            </span>
                                        </div>
                                    </div>

                                    <ErrorBoundary>
                                        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                                            <div className="h-[500px] overflow-y-auto custom-scrollbar">
                                                <table className="min-w-[900px] w-full">
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
                                                <span className="mx-2">|</span>
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
                            </>
                        ) : auth.user.bidang &&
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
                        ) : (
                            <></>
                        )}
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}
