import DashboardLayout from "@/Layouts/DashboardLayout";
import PageHeader from "@/Components/Dashboard/PageHeader";
import ProcessPipeline from "@/Components/Anomali/ProcessPipeline";
import AnomaliTable from "@/Components/Anomali/AnomaliTable";
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
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

function StatusBadge({ status }) {
    let color = "bg-slate-100 text-slate-700 border-slate-200";
    if (status === "New") color = "bg-blue-50 text-blue-700 border-blue-200";
    else if (status === "In Progress")
        color = "bg-amber-50 text-amber-700 border-amber-200";
    else if (status === "Open") color = "bg-sky-50 text-sky-700 border-sky-200";
    else if (status === "Pending")
        color = "bg-orange-50 text-orange-700 border-orange-200";
    else if (status === "Close")
        color = "bg-emerald-50 text-emerald-700 border-emerald-200";
    else if (status === "Rejected")
        color = "bg-rose-50 text-rose-700 border-rose-200";
    return (
        <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${color}`}
        >
            {status}
        </span>
    );
}

function TipeBadge({ tipe }) {
    let color = "bg-slate-100 text-slate-700 border-slate-200";
    if (tipe === "Major") color = "bg-rose-50 text-rose-700 border-rose-200";
    else if (tipe === "Minor")
        color = "bg-emerald-50 text-emerald-700 border-emerald-200";
    return (
        <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${color}`}
        >
            {tipe}
        </span>
    );
}

function UltgBadge({ ultg }) {
    let color = "bg-slate-100 text-slate-700 border-slate-200";
    if (ultg === "ULTG Karawang")
        color = "bg-indigo-50 text-indigo-700 border-indigo-200";
    else if (ultg === "ULTG Purwakarta")
        color = "bg-violet-50 text-violet-700 border-violet-200";
    return (
        <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${color}`}
        >
            {ultg}
        </span>
    );
}

function AnomaliCalendar({ filteredAnomalis, onEventClick }) {
    const calendarRef = useRef(null);
    const [windowWidth, setWindowWidth] = useState(
        typeof window !== "undefined" ? window.innerWidth : 1024,
    );
    const [currentView, setCurrentView] = useState("dayGridMonth");
    const [viewTitle, setViewTitle] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [filterKategori, setFilterKategori] = useState("All");
    const [filterUltg, setFilterUltg] = useState("All");
    const [filterDateFrom, setFilterDateFrom] = useState("");
    const [filterDateTo, setFilterDateTo] = useState("");
    const [scheduleSearch, setScheduleSearch] = useState("");
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [sortKey, setSortKey] = useState("tanggal_mulai");
    const [sortDir, setSortDir] = useState("asc");
    const [listPage, setListPage] = useState(1);
    const [listPerPage, setListPerPage] = useState(10);

    const statusCounts = useMemo(() => {
        const initial = {
            total: 0,
            Open: 0,
            "In Progress": 0,
            Pending: 0,
            Close: 0,
        };

        return filteredAnomalis.reduce((acc, anomali) => {
            acc.total += 1;
            if (acc[anomali.status] !== undefined) {
                acc[anomali.status] += 1;
            }
            return acc;
        }, initial);
    }, [filteredAnomalis]);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const kategoriOptions = useMemo(() => {
        const set = new Set(
            filteredAnomalis
                .map((a) => a.kategori?.name)
                .filter((name) => typeof name === "string" && name.trim()),
        );
        return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
    }, [filteredAnomalis]);

    const ultgOptions = useMemo(() => {
        const set = new Set(
            filteredAnomalis
                .map((a) => a.ultg)
                .filter((ultg) => typeof ultg === "string" && ultg.trim()),
        );
        return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
    }, [filteredAnomalis]);

    const calendarFilteredAnomalis = useMemo(() => {
        return filteredAnomalis.filter((anomali) => {
            const matchStatus =
                filterStatus === "All" ? true : anomali.status === filterStatus;
            const matchKategori =
                filterKategori === "All"
                    ? true
                    : anomali.kategori?.name === filterKategori;
            const matchUltg =
                filterUltg === "All" ? true : anomali.ultg === filterUltg;

            return matchStatus && matchKategori && matchUltg;
        });
    }, [filteredAnomalis, filterKategori, filterStatus, filterUltg]);

    const getStatusColor = (status) => {
        if (status === "Open")
            return { bg: "#3b82f6", border: "#2563eb", name: "Open" };
        if (status === "Close")
            return { bg: "#10b981", border: "#059669", name: "Close" };
        if (status === "In Progress")
            return {
                bg: "#f59e0b",
                border: "#d97706",
                name: "In Progress",
            };
        if (status === "Pending")
            return { bg: "#ef4444", border: "#dc2626", name: "Pending" };

        return { bg: "#6b7280", border: "#4b5563", name: status };
    };

    const formatEventTitle = (anomali, isMobile) => {
        if (isMobile) {
            return anomali.kategori?.name || "Anomali";
        }
        return `${anomali.ultg || "UPT Karawang"} - ${anomali.judul || "N/A"}`;
    };

    const events = useMemo(() => {
        return calendarFilteredAnomalis
            .filter((anomali) => Boolean(anomali.tanggal_mulai))
            .map((anomali) => {
                const startDate = anomali.tanggal_mulai;
                const endDate =
                    anomali.tanggal_selesai || anomali.tanggal_mulai;
                const statusColor = getStatusColor(anomali.status);
                const isMobile = windowWidth < 768;

                return {
                    id: anomali.id,
                    title: formatEventTitle(anomali, isMobile),
                    start: startDate,
                    end:
                        endDate !== startDate
                            ? new Date(
                                  new Date(endDate).getTime() +
                                      24 * 60 * 60 * 1000,
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
    }, [calendarFilteredAnomalis, windowWidth]);

    const handleEventClick = (info) => {
        const anomali = info.event.extendedProps.anomali;
        if (onEventClick) {
            onEventClick(anomali);
        }
    };

    const resetScheduleFilters = () => {
        setFilterStatus("All");
        setFilterKategori("All");
        setFilterUltg("All");
        setFilterDateFrom("");
        setFilterDateTo("");
        setScheduleSearch("");
        setSortKey("tanggal_mulai");
        setSortDir("asc");
        setListPage(1);
        setListPerPage(10);
        setFiltersOpen(false);
    };

    const toggleSort = (nextKey) => {
        setListPage(1);
        setSortKey((prev) => {
            if (prev === nextKey) {
                setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                return prev;
            }
            setSortDir("asc");
            return nextKey;
        });
    };

    const scheduleRows = useMemo(() => {
        const search = scheduleSearch.trim().toLowerCase();
        const from = filterDateFrom ? new Date(filterDateFrom) : null;
        const to = filterDateTo ? new Date(filterDateTo) : null;

        const filtered = calendarFilteredAnomalis
            .filter((a) => Boolean(a.tanggal_mulai))
            .filter((a) => {
                if (!search) return true;
                const haystack = [
                    a.judul,
                    a.ultg,
                    a.kategori?.name,
                    a.gardu_induk?.name,
                    a.peralatan,
                    a.penempatan_alat,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();
                return haystack.includes(search);
            })
            .filter((a) => {
                if (!from && !to) return true;
                if (!a.tanggal_mulai) return false;
                const start = new Date(a.tanggal_mulai);
                const end = new Date(a.tanggal_selesai || a.tanggal_mulai);
                if (from && end < from) return false;
                if (to && start > to) return false;
                return true;
            });

        const getSortValue = (a) => {
            if (sortKey === "tanggal_mulai") return a.tanggal_mulai || "";
            if (sortKey === "tanggal_selesai") return a.tanggal_selesai || "";
            if (sortKey === "judul") return a.judul || "";
            if (sortKey === "ultg") return a.ultg || "";
            if (sortKey === "kategori") return a.kategori?.name || "";
            if (sortKey === "status") return a.status || "";
            return "";
        };

        const sorted = [...filtered].sort((a, b) => {
            const av = getSortValue(a);
            const bv = getSortValue(b);
            const cmp = typeof av === "string" ? av.localeCompare(bv) : 0;
            return sortDir === "asc" ? cmp : -cmp;
        });

        return sorted;
    }, [
        calendarFilteredAnomalis,
        filterDateFrom,
        filterDateTo,
        scheduleSearch,
        sortDir,
        sortKey,
    ]);

    const listTotalPages = useMemo(() => {
        return Math.max(1, Math.ceil(scheduleRows.length / listPerPage));
    }, [listPerPage, scheduleRows.length]);

    useEffect(() => {
        setListPage(1);
    }, [
        filterStatus,
        filterKategori,
        filterUltg,
        filterDateFrom,
        filterDateTo,
        scheduleSearch,
        listPerPage,
    ]);

    useEffect(() => {
        setListPage((p) => Math.min(p, listTotalPages));
    }, [listTotalPages]);

    const pagedScheduleRows = useMemo(() => {
        const start = (listPage - 1) * listPerPage;
        return scheduleRows.slice(start, start + listPerPage);
    }, [listPage, listPerPage, scheduleRows]);

    const sortIndicator = (key) => {
        if (sortKey !== key) return "";
        return sortDir === "asc" ? "▲" : "▼";
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 via-white to-indigo-50 border-b border-slate-100">
                <div className="px-4 sm:px-6 py-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center shadow-sm">
                                    <FaCalendarAlt className="w-5 h-5 text-cyan-600" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">
                                    Kalender Anomali
                                </h2>
                                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                                    Jadwal anomali dalam tampilan kalender yang
                                    rapi dan interaktif
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 justify-start sm:justify-end">
                            <div className="inline-flex items-center gap-2 rounded-2xl bg-white/70 backdrop-blur px-3 py-2 border border-white/60 shadow-sm">
                                <span className="text-xs uppercase tracking-wide text-slate-500">
                                    Total Anomali
                                </span>
                                <span className="text-base font-semibold text-slate-900">
                                    {statusCounts.total}
                                </span>
                            </div>
                            <div className="hidden md:flex items-center gap-2">
                                {[
                                    "Open",
                                    "In Progress",
                                    "Pending",
                                    "Close",
                                ].map((status) => {
                                    const color = getStatusColor(status);
                                    return (
                                        <div
                                            key={status}
                                            className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 border border-slate-200 shadow-sm"
                                        >
                                            <span
                                                className="w-2 h-2 rounded-full"
                                                style={{
                                                    backgroundColor: color.bg,
                                                }}
                                            ></span>
                                            <span className="text-[11px] font-medium text-slate-600">
                                                {color.name}
                                            </span>
                                            <span className="text-[11px] font-semibold text-slate-900">
                                                {statusCounts[status]}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 sm:p-6">
                <div className="calendar-container bg-slate-50/80 rounded-2xl p-3 sm:p-4 lg:p-5 border border-slate-100">
                    <div className="flex flex-col gap-4 mb-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-center gap-3">
                                <div className="inline-flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-3 py-2 shadow-sm">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 text-white font-bold">
                                        {new Date().getDate()}
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                            {new Date().toLocaleString(
                                                "id-ID",
                                                { month: "short" },
                                            )}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {new Date().getFullYear()}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center mt-1 sm:mt-0">
                                    <button
                                        onClick={() => {
                                            const api =
                                                calendarRef.current?.getApi();
                                            api && api.prev();
                                        }}
                                        className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                        aria-label="Sebelumnya"
                                        type="button"
                                    >
                                        <FaChevronLeft className="h-4 w-4" />
                                    </button>
                                    <div className="mx-3">
                                        <div className="text-base sm:text-lg font-semibold text-slate-900">
                                            {viewTitle || "Kalender"}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {`${events.length} jadwal ditampilkan`}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const api =
                                                calendarRef.current?.getApi();
                                            api && api.next();
                                        }}
                                        className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                        aria-label="Berikutnya"
                                        type="button"
                                    >
                                        <FaChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 justify-start lg:justify-end">
                                <button
                                    onClick={() => {
                                        const api =
                                            calendarRef.current?.getApi();
                                        api && api.today();
                                    }}
                                    className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                    aria-label="Kembali ke hari ini"
                                    type="button"
                                >
                                    <FaCalendarAlt className="h-4 w-4" />
                                </button>
                                <div className="flex items-center gap-1 bg-white rounded-2xl p-1 border border-slate-200">
                                    {[
                                        { key: "dayGridMonth", label: "Month" },
                                        { key: "timeGridWeek", label: "Week" },
                                        { key: "timeGridDay", label: "Day" },
                                    ].map((v) => (
                                        <button
                                            key={v.key}
                                            onClick={() => {
                                                const api =
                                                    calendarRef.current?.getApi();
                                                if (api) {
                                                    api.changeView(v.key);
                                                    setCurrentView(v.key);
                                                }
                                            }}
                                            className={`px-3 py-1.5 text-xs sm:text-sm rounded-xl transition-colors ${
                                                currentView === v.key
                                                    ? "bg-slate-900 text-white shadow-sm"
                                                    : "text-slate-700 hover:bg-slate-50"
                                            }`}
                                            type="button"
                                        >
                                            {v.label}
                                        </button>
                                    ))}
                                </div>
                                <Listbox
                                    value={filterStatus}
                                    onChange={setFilterStatus}
                                >
                                    <div className="relative">
                                        <Listbox.Button
                                            className={`inline-flex items-center justify-center rounded-xl px-3 py-2 text-xs sm:text-sm font-medium transition-all border ${
                                                filterStatus === "All"
                                                    ? "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                                                    : "border-slate-900 bg-slate-900 text-white shadow-sm"
                                            }`}
                                        >
                                            <span>
                                                {filterStatus === "All"
                                                    ? "Semua Status"
                                                    : filterStatus}
                                            </span>
                                            <FaChevronDown
                                                className={`ml-2 h-3 w-3 transition-transform duration-200 ${
                                                    filterStatus === "All"
                                                        ? "text-slate-400"
                                                        : "text-white/80"
                                                }`}
                                                aria-hidden="true"
                                            />
                                        </Listbox.Button>
                                        <Transition
                                            as={Fragment}
                                            leave="transition ease-in duration-100"
                                            leaveFrom="opacity-100"
                                            leaveTo="opacity-0"
                                        >
                                            <Listbox.Options className="absolute right-0 z-50 mt-1 max-h-60 w-40 overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                {[
                                                    "All",
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
                                                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                                                active
                                                                    ? "bg-sky-50 text-cyan-700"
                                                                    : "text-slate-900"
                                                            }`
                                                        }
                                                        value={status}
                                                    >
                                                        {({ selected }) => (
                                                            <>
                                                                <span
                                                                    className={`block truncate ${
                                                                        selected
                                                                            ? "font-medium"
                                                                            : "font-normal"
                                                                    }`}
                                                                >
                                                                    {status ===
                                                                    "All"
                                                                        ? "Semua Status"
                                                                        : status}
                                                                </span>
                                                                {selected ? (
                                                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-cyan-600">
                                                                        <FaCheck
                                                                            className="h-3 w-3"
                                                                            aria-hidden="true"
                                                                        />
                                                                    </span>
                                                                ) : null}
                                                            </>
                                                        )}
                                                    </Listbox.Option>
                                                ))}
                                            </Listbox.Options>
                                        </Transition>
                                    </div>
                                </Listbox>
                                <button
                                    type="button"
                                    onClick={() => setFiltersOpen((o) => !o)}
                                    className={`inline-flex items-center justify-center rounded-xl px-3 py-2 text-xs sm:text-sm font-medium transition-all border ${
                                        filtersOpen
                                            ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                                            : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                                    }`}
                                    aria-label="Buka filter jadwal"
                                >
                                    <FaFilter className="h-3.5 w-3.5" />
                                    <span className="ml-2">Filter</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={resetScheduleFilters}
                                    className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                                    aria-label="Reset filter jadwal"
                                >
                                    <FaTimes className="h-3.5 w-3.5" />
                                    <span className="ml-2">Reset</span>
                                </button>
                            </div>
                        </div>
                        <Transition
                            as={Fragment}
                            show={filtersOpen}
                            enter="transition ease-out duration-150"
                            enterFrom="opacity-0 -translate-y-1"
                            enterTo="opacity-100 translate-y-0"
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100 translate-y-0"
                            leaveTo="opacity-0 -translate-y-1"
                        >
                            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                    <div>
                                        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1">
                                            Tanggal Dari
                                        </div>
                                        <input
                                            type="date"
                                            value={filterDateFrom}
                                            onChange={(e) =>
                                                setFilterDateFrom(
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
                                        />
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1">
                                            Tanggal Sampai
                                        </div>
                                        <input
                                            type="date"
                                            value={filterDateTo}
                                            onChange={(e) =>
                                                setFilterDateTo(e.target.value)
                                            }
                                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
                                        />
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1">
                                            Kategori
                                        </div>
                                        <Listbox
                                            value={filterKategori}
                                            onChange={setFilterKategori}
                                        >
                                            <div className="relative">
                                                <Listbox.Button className="relative w-full cursor-pointer rounded-xl bg-white py-2 pl-3 pr-9 text-left border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20">
                                                    <span className="block truncate text-sm text-slate-700 font-medium">
                                                        {filterKategori ===
                                                        "All"
                                                            ? "Semua Kategori"
                                                            : filterKategori}
                                                    </span>
                                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                        <FaChevronDown className="h-4 w-4 text-slate-400" />
                                                    </span>
                                                </Listbox.Button>
                                                <Transition
                                                    as={Fragment}
                                                    leave="transition ease-in duration-100"
                                                    leaveFrom="opacity-100"
                                                    leaveTo="opacity-0"
                                                >
                                                    <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                        {kategoriOptions.map(
                                                            (k) => (
                                                                <Listbox.Option
                                                                    key={k}
                                                                    className={({
                                                                        active,
                                                                    }) =>
                                                                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                                                            active
                                                                                ? "bg-sky-50 text-cyan-700"
                                                                                : "text-slate-900"
                                                                        }`
                                                                    }
                                                                    value={k}
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
                                                                                {k ===
                                                                                "All"
                                                                                    ? "Semua Kategori"
                                                                                    : k}
                                                                            </span>
                                                                            {selected ? (
                                                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-cyan-600">
                                                                                    <FaCheck className="h-3 w-3" />
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
                                    <div>
                                        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1">
                                            ULTG
                                        </div>
                                        <Listbox
                                            value={filterUltg}
                                            onChange={setFilterUltg}
                                        >
                                            <div className="relative">
                                                <Listbox.Button className="relative w-full cursor-pointer rounded-xl bg-white py-2 pl-3 pr-9 text-left border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20">
                                                    <span className="block truncate text-sm text-slate-700 font-medium">
                                                        {filterUltg === "All"
                                                            ? "Semua ULTG"
                                                            : filterUltg}
                                                    </span>
                                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                        <FaChevronDown className="h-4 w-4 text-slate-400" />
                                                    </span>
                                                </Listbox.Button>
                                                <Transition
                                                    as={Fragment}
                                                    leave="transition ease-in duration-100"
                                                    leaveFrom="opacity-100"
                                                    leaveTo="opacity-0"
                                                >
                                                    <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                        {ultgOptions.map(
                                                            (u) => (
                                                                <Listbox.Option
                                                                    key={u}
                                                                    className={({
                                                                        active,
                                                                    }) =>
                                                                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                                                            active
                                                                                ? "bg-sky-50 text-cyan-700"
                                                                                : "text-slate-900"
                                                                        }`
                                                                    }
                                                                    value={u}
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
                                                                                {u ===
                                                                                "All"
                                                                                    ? "Semua ULTG"
                                                                                    : u}
                                                                            </span>
                                                                            {selected ? (
                                                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-cyan-600">
                                                                                    <FaCheck className="h-3 w-3" />
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
                                <div className="mt-3">
                                    <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1">
                                        Pencarian
                                    </div>
                                    <div className="relative">
                                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <input
                                            value={scheduleSearch}
                                            onChange={(e) =>
                                                setScheduleSearch(
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm text-slate-700 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
                                            placeholder="Cari judul, gardu, kategori, peralatan…"
                                        />
                                    </div>
                                </div>
                            </div>
                        </Transition>
                    </div>
                    <FullCalendar
                        ref={calendarRef}
                        plugins={[
                            dayGridPlugin,
                            timeGridPlugin,
                            interactionPlugin,
                        ]}
                        initialView="dayGridMonth"
                        headerToolbar={false}
                        events={events}
                        eventClick={handleEventClick}
                        height="auto"
                        locale="id"
                        dayMaxEvents={windowWidth < 768 ? 2 : 3}
                        moreLinkClick="popover"
                        eventDisplay="block"
                        displayEventTime={false}
                        aspectRatio={windowWidth < 768 ? 1.0 : 1.35}
                        eventClassNames="cursor-pointer hover:opacity-90 transition-all duration-200 hover:scale-[1.02]"
                        dayHeaderClassNames="bg-slate-100/80 text-slate-700 font-semibold text-sm"
                        viewClassNames="bg-white rounded-lg shadow-sm"
                        buttonText={{
                            today: "Hari Ini",
                            month: "Bulan",
                            week: "Minggu",
                            day: "Hari",
                        }}
                        datesSet={(arg) => {
                            setViewTitle(arg.view?.title || "");
                        }}
                    />

                    <div className="mt-4 rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <div className="text-base font-semibold text-slate-900">
                                    Daftar Jadwal
                                </div>
                                <div className="text-xs text-slate-500">
                                    {scheduleRows.length} jadwal ditemukan
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Listbox
                                    value={listPerPage}
                                    onChange={setListPerPage}
                                >
                                    <div className="relative">
                                        <Listbox.Button className="relative cursor-pointer rounded-xl bg-slate-50 py-2 pl-3 pr-9 text-left border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 whitespace-nowrap">
                                            <span className="block truncate">
                                                {listPerPage} / halaman
                                            </span>
                                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                <FaChevronDown className="h-4 w-4 text-slate-400" />
                                            </span>
                                        </Listbox.Button>
                                        <Transition
                                            as={Fragment}
                                            leave="transition ease-in duration-100"
                                            leaveFrom="opacity-100"
                                            leaveTo="opacity-0"
                                        >
                                            <Listbox.Options className="absolute right-0 z-50 mt-1 max-h-60 w-44 overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                {[10, 20, 50].map((n) => (
                                                    <Listbox.Option
                                                        key={n}
                                                        className={({
                                                            active,
                                                        }) =>
                                                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                                                active
                                                                    ? "bg-sky-50 text-cyan-700"
                                                                    : "text-slate-900"
                                                            }`
                                                        }
                                                        value={n}
                                                    >
                                                        {({ selected }) => (
                                                            <>
                                                                <span
                                                                    className={`block truncate ${
                                                                        selected
                                                                            ? "font-medium"
                                                                            : "font-normal"
                                                                    }`}
                                                                >
                                                                    {n} /
                                                                    halaman
                                                                </span>
                                                                {selected ? (
                                                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-cyan-600">
                                                                        <FaCheck className="h-3 w-3" />
                                                                    </span>
                                                                ) : null}
                                                            </>
                                                        )}
                                                    </Listbox.Option>
                                                ))}
                                            </Listbox.Options>
                                        </Transition>
                                    </div>
                                </Listbox>
                            </div>
                        </div>

                        <div className="hidden md:block overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggleSort("tanggal_mulai")
                                                }
                                                className="inline-flex items-center gap-2"
                                            >
                                                Mulai{" "}
                                                {sortIndicator("tanggal_mulai")}
                                            </button>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggleSort(
                                                        "tanggal_selesai",
                                                    )
                                                }
                                                className="inline-flex items-center gap-2"
                                            >
                                                Selesai{" "}
                                                {sortIndicator(
                                                    "tanggal_selesai",
                                                )}
                                            </button>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggleSort("judul")
                                                }
                                                className="inline-flex items-center gap-2"
                                            >
                                                Anomali {sortIndicator("judul")}
                                            </button>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggleSort("ultg")
                                                }
                                                className="inline-flex items-center gap-2"
                                            >
                                                ULTG {sortIndicator("ultg")}
                                            </button>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggleSort("kategori")
                                                }
                                                className="inline-flex items-center gap-2"
                                            >
                                                Kategori{" "}
                                                {sortIndicator("kategori")}
                                            </button>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggleSort("status")
                                                }
                                                className="inline-flex items-center gap-2"
                                            >
                                                Status {sortIndicator("status")}
                                            </button>
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-100">
                                    {pagedScheduleRows.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-6 py-10 text-center text-sm text-slate-500"
                                            >
                                                Tidak ada jadwal yang cocok
                                                dengan filter.
                                            </td>
                                        </tr>
                                    ) : (
                                        pagedScheduleRows.map((anomali) => (
                                            <tr
                                                key={anomali.id}
                                                className="hover:bg-slate-50/60 transition-colors"
                                            >
                                                <td className="px-6 py-4 text-sm text-slate-700 whitespace-nowrap">
                                                    {formatDate(
                                                        anomali.tanggal_mulai,
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-700 whitespace-nowrap">
                                                    {anomali.tanggal_selesai
                                                        ? formatDate(
                                                              anomali.tanggal_selesai,
                                                          )
                                                        : "-"}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-semibold text-slate-900 truncate max-w-[340px]">
                                                        {anomali.judul || "-"}
                                                    </div>
                                                    <div className="text-xs text-slate-500 mt-0.5 truncate max-w-[340px]">
                                                        {anomali.gardu_induk
                                                            ?.name
                                                            ? `${
                                                                  anomali
                                                                      .gardu_induk
                                                                      .name
                                                              } • ${
                                                                  anomali.peralatan ||
                                                                  "-"
                                                              }`
                                                            : anomali.peralatan ||
                                                              "-"}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-700 whitespace-nowrap">
                                                    {anomali.ultg || "-"}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-700 whitespace-nowrap">
                                                    {anomali.kategori?.name ||
                                                        "-"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <StatusBadge
                                                        status={anomali.status}
                                                    />
                                                </td>
                                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                                    <Link
                                                        href={route(
                                                            "dashboard.anomali.show",
                                                            anomali.slug,
                                                        )}
                                                        className="text-cyan-700 hover:text-cyan-900 font-medium text-sm inline-flex items-center gap-1 transition-colors"
                                                    >
                                                        Detail{" "}
                                                        <FaChevronRight className="text-xs" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="md:hidden divide-y divide-slate-100">
                            {pagedScheduleRows.length === 0 ? (
                                <div className="p-6 text-sm text-slate-500 text-center">
                                    Tidak ada jadwal yang cocok dengan filter.
                                </div>
                            ) : (
                                pagedScheduleRows.map((anomali) => (
                                    <div
                                        key={anomali.id}
                                        className="p-4 hover:bg-slate-50/60 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="text-sm font-semibold text-slate-900 truncate">
                                                    {anomali.judul || "-"}
                                                </div>
                                                <div className="text-xs text-slate-500 mt-0.5">
                                                    {anomali.ultg || "-"} •{" "}
                                                    {anomali.kategori?.name ||
                                                        "-"}
                                                </div>
                                            </div>
                                            <StatusBadge
                                                status={anomali.status}
                                            />
                                        </div>
                                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                                            <div className="rounded-xl bg-slate-50 border border-slate-100 p-2">
                                                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                                    Mulai
                                                </div>
                                                <div className="mt-0.5 text-slate-800 font-medium">
                                                    {formatDate(
                                                        anomali.tanggal_mulai,
                                                    )}
                                                </div>
                                            </div>
                                            <div className="rounded-xl bg-slate-50 border border-slate-100 p-2">
                                                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                                    Selesai
                                                </div>
                                                <div className="mt-0.5 text-slate-800 font-medium">
                                                    {anomali.tanggal_selesai
                                                        ? formatDate(
                                                              anomali.tanggal_selesai,
                                                          )
                                                        : "-"}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex items-center justify-end">
                                            <Link
                                                href={route(
                                                    "dashboard.anomali.show",
                                                    anomali.slug,
                                                )}
                                                className="text-cyan-700 hover:text-cyan-900 font-medium text-sm inline-flex items-center gap-1 transition-colors"
                                            >
                                                Detail{" "}
                                                <FaChevronRight className="text-xs" />
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="px-4 sm:px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                            <div className="text-sm text-slate-500">
                                Halaman{" "}
                                <span className="font-medium text-slate-900">
                                    {listPage}
                                </span>{" "}
                                dari{" "}
                                <span className="font-medium text-slate-900">
                                    {listTotalPages}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setListPage((p) => Math.max(1, p - 1))
                                    }
                                    disabled={listPage === 1}
                                    className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <FaChevronLeft className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setListPage((p) =>
                                            Math.min(listTotalPages, p + 1),
                                        )
                                    }
                                    disabled={listPage === listTotalPages}
                                    className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <FaChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

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
    const canCreate = (user?.permissions ?? []).includes("View Anomali Create");

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
                            <div className="surface p-4 sm:p-6">
                                <AnomaliCalendar
                                    filteredAnomalis={stageFilteredAnomalis}
                                    onEventClick={handleCalendarEventClick}
                                />
                            </div>
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
            {showEventModal && selectedEventAnomali && (
                <Modal
                    show={showEventModal}
                    onClose={() => setShowEventModal(false)}
                >
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-2xl">
                        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-md">
                                    <FaCalendarAlt className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                                        {selectedEventAnomali.judul ||
                                            "Detail Anomali"}
                                    </h3>
                                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] sm:text-xs text-slate-500">
                                        {selectedEventAnomali.kategori
                                            ?.name && (
                                            <span className="inline-flex items-center gap-1">
                                                <FaClipboardList className="w-3 h-3" />
                                                <span>
                                                    {
                                                        selectedEventAnomali
                                                            .kategori.name
                                                    }
                                                </span>
                                            </span>
                                        )}
                                        {selectedEventAnomali.ultg && (
                                            <span className="inline-flex items-center gap-1">
                                                <FaBuilding className="w-3 h-3" />
                                                <span>
                                                    {selectedEventAnomali.ultg}
                                                </span>
                                            </span>
                                        )}
                                        {selectedEventAnomali.gardu_induk
                                            ?.name && (
                                            <span className="inline-flex items-center gap-1">
                                                <FaMapMarkerAlt className="w-3 h-3" />
                                                <span>
                                                    {
                                                        selectedEventAnomali
                                                            .gardu_induk.name
                                                    }
                                                </span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowEventModal(false)}
                                className="text-slate-400 hover:text-slate-600 transition-colors rounded-full p-1.5 hover:bg-slate-100"
                            >
                                <FaTimes className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-5 sm:p-6 space-y-5">
                            <div className="flex flex-wrap items-center gap-2">
                                {selectedEventAnomali.status && (
                                    <StatusBadge
                                        status={selectedEventAnomali.status}
                                    />
                                )}
                                {selectedEventAnomali.tipe && (
                                    <TipeBadge
                                        tipe={selectedEventAnomali.tipe}
                                    />
                                )}
                                {selectedEventAnomali.ultg && (
                                    <UltgBadge
                                        ultg={selectedEventAnomali.ultg}
                                    />
                                )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                        Tanggal Kejadian
                                    </p>
                                    <p className="text-sm font-medium text-slate-800">
                                        {selectedEventAnomali.tanggal_kejadian
                                            ? formatDate(
                                                  selectedEventAnomali.tanggal_kejadian,
                                              )
                                            : "-"}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                        Tanggal Mulai
                                    </p>
                                    <p className="text-sm font-medium text-slate-800">
                                        {selectedEventAnomali.tanggal_mulai
                                            ? formatDate(
                                                  selectedEventAnomali.tanggal_mulai,
                                              )
                                            : "-"}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                        Tanggal Selesai
                                    </p>
                                    <p className="text-sm font-medium text-slate-800">
                                        {selectedEventAnomali.tanggal_selesai
                                            ? formatDate(
                                                  selectedEventAnomali.tanggal_selesai,
                                              )
                                            : "Belum dijadwalkan"}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                        Jenis Pekerjaan
                                    </p>
                                    <p className="text-sm font-medium text-slate-800">
                                        {selectedEventAnomali.job_type || "-"}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                        Dibuat Oleh
                                    </p>
                                    <p className="text-sm font-medium text-slate-800">
                                        {selectedEventAnomali.user?.name || "-"}
                                    </p>
                                </div>
                            </div>
                            {selectedEventAnomali.penyebab && (
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                        Penyebab Anomali
                                    </p>
                                    <p className="text-sm text-slate-700 whitespace-pre-line">
                                        {selectedEventAnomali.penyebab}
                                    </p>
                                </div>
                            )}
                            {selectedEventAnomali.usul_saran && (
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                        Usulan dan Saran
                                    </p>
                                    <p className="text-sm text-slate-700 whitespace-pre-line">
                                        {selectedEventAnomali.usul_saran}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
}
