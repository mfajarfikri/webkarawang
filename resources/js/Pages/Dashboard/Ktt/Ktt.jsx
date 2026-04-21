import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { useEffect, useState, useMemo } from "react";
import {
    FaBuilding,
    FaPlus,
    FaMapMarkerAlt,
    FaChevronLeft,
    FaChevronRight,
    FaSearch,
    FaCheck,
} from "react-icons/fa";
import { Listbox } from "@headlessui/react";
import Modal from "@/Components/Modal";
import SecondaryButton from "@/Components/SecondaryButton";
import PrimaryButton from "@/Components/PrimaryButton";
import { Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";

// Fungsi untuk membuat badge tipe, sama seperti di file Anomali.jsx
function TipeBadge({ tipe }) {
    let color = "bg-slate-100 text-slate-700";
    if (tipe === "Gold") color = "bg-amber-100 text-amber-800";
    else if (tipe === "Silver") color = "bg-slate-200 text-slate-700";
    else if (tipe === "Bronze") color = "bg-amber-100 text-amber-800";
    else if (tipe === "Khusus") color = "bg-slate-800 text-white";
    else if (tipe === "Reguler") color = "bg-sky-100 text-sky-800";
    return (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${color}`}>
            {tipe}
        </span>
    );
}

export default function Ktt({ ktts }) {
    const [open, setOpen] = useState(false);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");

    const { data, setData, reset, errors, processing } = useForm({
        name: "",
        lokasi: "",
        tipe: "",
        kapasitas: "",
        latitude: "",
        longitude: "",
    });
    const [rows, setRows] = useState([]);

    useEffect(() => {
        if (ktts) {
            setRows(ktts);
        }
    }, [ktts]);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const toastConfig = {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        axios
            .post(route("dashboard.ktt.store"), data, {
                headers: {
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    Accept: "application/json",
                },
            })
            .then((response) => {
                toast.success(
                    `KTT ${data.name} berhasil ditambahkan`,
                    toastConfig
                );
                handleClose();
                reset();

                // Fetch updated data
                axios
                    .get(route("dashboard.ktt.index"))
                    .then((response) => {
                        setRows(response.data);
                    })
                    .catch((error) => {
                        console.error("Error refreshing data:", error);
                        toast.error("Gagal memperbarui data KTT", toastConfig);
                    });
            })
            .catch((error) => {
                if (error.response?.status === 422) {
                    const validationErrors = error.response.data.errors;
                    if (validationErrors) {
                        Object.keys(validationErrors).forEach((key) => {
                            toast.error(
                                `${key}: ${validationErrors[key][0]}`,
                                toastConfig
                            );
                        });
                    } else {
                        toast.error(
                            error.response.data.message ||
                                "Validation error occurred",
                            toastConfig
                        );
                    }
                } else {
                    console.error("Full error:", error);
                    toast.error(
                        error.response?.data?.message ||
                            "Gagal menambahkan KTT",
                        toastConfig
                    );
                }
            });
    };

    const handleRowsPerPageChange = (val) => {
        setRowsPerPage(val);
        setPage(1);
    };

    const handleSearch = (val) => {
        setSearchTerm(val);
        setPage(1);
    };

    const filteredKtts = useMemo(() => {
        if (!Array.isArray(rows)) return [];

        let filtered = rows;

        if (searchTerm && searchTerm.trim() !== "") {
            const searchLower = searchTerm.toLowerCase().trim();
            filtered = filtered.filter((ktt) => {
                return (
                    (ktt.name || "").toLowerCase().includes(searchLower) ||
                    (ktt.lokasi || "").toLowerCase().includes(searchLower) ||
                    (ktt.tipe || "").toLowerCase().includes(searchLower) ||
                    (ktt.kapasitas.toString() || "")
                        .toLowerCase()
                        .includes(searchLower)
                );
            });
        }

        return filtered;
    }, [rows, searchTerm]);

    const totalRows = filteredKtts.length;
    const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));

    const paginatedData = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        return filteredKtts.slice(start, start + rowsPerPage);
    }, [filteredKtts, page, rowsPerPage]);

    const handlePrev = () => setPage((p) => Math.max(1, p - 1));
    const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

    const stats = useMemo(() => {
        const karawang = rows.filter((ktt) => ktt.lokasi === "Karawang");
        const purwakarta = rows.filter((ktt) => ktt.lokasi === "Purwakarta");

        return {
            karawang: {
                total: karawang.length,
                kapasitas: karawang.reduce(
                    (acc, curr) => acc + parseFloat(curr.kapasitas || 0),
                    0
                ),
            },
            purwakarta: {
                total: purwakarta.length,
                kapasitas: purwakarta.reduce(
                    (acc, curr) => acc + parseFloat(curr.kapasitas || 0),
                    0
                ),
            },
        };
    }, [rows]);

    return (
        <>
            <Head title="Ktt" />
            <DashboardLayout>
                <ToastContainer />
                <div className="py-6 w-full mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="px-6 py-6 md:px-8 md:py-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600 mb-3">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                        Ringkasan KTT
                                    </div>
                                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center">
                                        <div className="flex items-center justify-center bg-slate-50 border border-slate-200 rounded-2xl w-11 h-11 mr-3 shadow-sm">
                                            <FaBuilding className="text-slate-600" />
                                        </div>
                                        Konsumen Tegangan Tinggi
                                    </h1>
                                    <p className="mt-2 text-sm md:text-base text-slate-600 max-w-2xl">
                                        Data konsumen tegangan tinggi (KTT) yang
                                        terdaftar dan dimonitor pada sistem UPT
                                        Karawang.
                                    </p>
                                </div>
                                <button
                                    onClick={handleOpen}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                                    aria-label="Tambah data KTT"
                                >
                                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-600 text-white">
                                        <FaPlus className="h-3.5 w-3.5" />
                                    </span>
                                    <span>Tambah KTT</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm transition-colors hover:bg-slate-50">
                            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 via-sky-400 to-cyan-400 opacity-80" />
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-600 text-white shadow-md">
                                            {/* <FaMapMarkerAlt className="w-7 h-7" /> */}
                                            <svg
                                                width="24"
                                                height="18"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 18"
                                            >
                                                {/* <!-- Background --> */}
                                                <rect
                                                    width="24"
                                                    height="18"
                                                    fill="#e0f7fa"
                                                />

                                                {/* <!-- Outline of Karawang region (simplified path based on general geography) --> */}
                                                <path
                                                    d="M3 4 L21 4 L21 14 L14 14 L11 11 L7 11 L3 8 Z"
                                                    fill="#4caf50"
                                                    stroke="#2e7d32"
                                                    strokeWidth="1"
                                                />

                                                {/* <!-- Rivers (simplified) --> */}
                                                <path
                                                    d="M6 7 L12 7 L15 10"
                                                    fill="none"
                                                    stroke="#2196f3"
                                                    strokeWidth="1.5"
                                                />

                                                {/* <!-- Coastline (northern part) --> */}
                                                <line
                                                    x1="3"
                                                    y1="4"
                                                    x2="21"
                                                    y2="4"
                                                    stroke="#0277bd"
                                                    strokeWidth="2"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900">
                                                Karawang
                                            </h3>
                                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 mt-1">
                                                Wilayah Operasional
                                            </p>
                                        </div>
                                    </div>
                                    <span className="hidden md:inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-[11px] font-semibold text-sky-700 border border-sky-100">
                                        ULTG Karawang
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="relative overflow-hidden rounded-xl bg-white p-4 shadow-sm border border-slate-200">
                                        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-sky-500 to-cyan-400" />
                                        <p className="text-xs font-medium text-slate-500 mb-1">
                                            Total KTT
                                        </p>
                                        <p className="text-2xl font-extrabold text-slate-900">
                                            {stats.karawang.total} Unit
                                        </p>
                                    </div>
                                    <div className="relative overflow-hidden rounded-xl bg-white p-4 shadow-sm border border-slate-200">
                                        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-cyan-400 to-sky-500" />
                                        <p className="text-xs font-medium text-slate-500 mb-1">
                                            Kapasitas
                                        </p>
                                        <p className="text-2xl font-extrabold text-slate-900">
                                            {stats.karawang.kapasitas} MVA
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm transition-colors hover:bg-slate-50">
                            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400 opacity-80" />
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-md">
                                            <svg
                                                className="w-7 h-7"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M12 2L2 7L12 12L22 7L12 2Z"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                <path
                                                    d="M2 17L12 22L22 17"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                <path
                                                    d="M2 12L12 17L22 12"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900">
                                                Purwakarta
                                            </h3>
                                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 mt-1">
                                                Wilayah Operasional
                                            </p>
                                        </div>
                                    </div>
                                    <span className="hidden md:inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-700 border border-indigo-100">
                                        ULTG Purwakarta
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="relative overflow-hidden rounded-xl bg-white p-4 shadow-sm border border-slate-200">
                                        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-indigo-500 to-sky-500" />
                                        <p className="text-xs font-medium text-slate-500 mb-1">
                                            Total KTT
                                        </p>
                                        <p className="text-2xl font-extrabold text-slate-900">
                                            {stats.purwakarta.total} Unit
                                        </p>
                                    </div>
                                    <div className="relative overflow-hidden rounded-xl bg-white p-4 shadow-sm border border-slate-200">
                                        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-sky-500 to-indigo-500" />
                                        <p className="text-xs font-medium text-slate-500 mb-1">
                                            Kapasitas
                                        </p>
                                        <p className="text-2xl font-extrabold text-slate-900">
                                            {stats.purwakarta.kapasitas} MVA
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mengganti DataGrid dengan tabel HTML manual */}
                    <div className="bg-white rounded-2xl mt-6 shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="w-full">
                                    <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                                        Data KTT UPT Karawang
                                    </h2>
                                    <p className="text-sm text-slate-600 mt-1">
                                        Kelola data KTT di wilayah Karawang
                                    </p>
                                </div>
                                <div className="flex flex-row flex-wrap items-center gap-2">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Cari nama KTT..."
                                            className="w-full pl-12 pr-4 py-2 border border-slate-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-500"
                                            value={searchTerm}
                                            onChange={(e) =>
                                                handleSearch(e.target.value)
                                            }
                                            aria-label="Cari nama KTT"
                                        />
                                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="px-2 md:px-6 pb-6 pt-4">
                            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                                <div className="overflow-y-auto custom-scrollbar">
                                    <table className="min-w-full w-full table-auto">
                                        <thead className="bg-slate-50 text-slate-700 sticky top-0">
                                            <tr>
                                                <th className="w-[5%] px-3 py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">
                                                    No
                                                </th>
                                                <th className="w-[20%] px-3 py-3 text-left text-xs sm:text-sm font-semibold">
                                                    Nama KTT
                                                </th>
                                                <th className="w-[15%] px-3 py-3 text-left text-xs sm:text-sm font-semibold">
                                                    Lokasi
                                                </th>
                                                <th className="w-[15%] px-3 py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">
                                                    Tipe
                                                </th>
                                                <th className="w-[15%] px-3 py-3 text-left text-xs sm:text-sm font-semibold">
                                                    Kapasitas
                                                </th>
                                                <th className="w-[20%] px-3 py-3 text-left text-xs sm:text-sm font-semibold">
                                                    Koordinat
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-slate-200">
                                            {paginatedData.length === 0 ? (
                                                <tr>
                                                    <td
                                                        colSpan={6}
                                                        className="text-center py-10 text-slate-400 font-semibold text-base"
                                                    >
                                                        Tidak ada data KTT.
                                                    </td>
                                                </tr>
                                            ) : (
                                                paginatedData.map(
                                                    (ktt, idx) => (
                                                        <tr
                                                            className="hover:bg-slate-50"
                                                            key={ktt.id}
                                                        >
                                                            <td className="px-3 py-3 text-left text-xs sm:text-sm text-slate-600 whitespace-nowrap">
                                                                {(page - 1) *
                                                                    rowsPerPage +
                                                                    idx +
                                                                    1}
                                                            </td>
                                                            <td
                                                                className="px-3 py-3 text-left text-xs sm:text-sm text-slate-800 truncate max-w-[8rem] sm:max-w-[12rem]"
                                                                title={ktt.name}
                                                            >
                                                                {ktt.name}
                                                            </td>
                                                            <td className="px-3 py-3 text-left text-xs sm:text-sm text-slate-700">
                                                                {ktt.lokasi}
                                                            </td>
                                                            <td className="px-3 py-3 text-left text-xs sm:text-sm whitespace-nowrap">
                                                                <TipeBadge
                                                                    tipe={
                                                                        ktt.tipe
                                                                    }
                                                                />
                                                            </td>
                                                            <td className="px-3 py-3 text-left text-xs sm:text-sm text-slate-700">
                                                                {ktt.kapasitas}{" "}
                                                                MVA
                                                            </td>
                                                            <td className="px-3 py-3 text-left text-xs sm:text-sm text-slate-600 whitespace-nowrap">
                                                                <div className="flex items-center gap-1">
                                                                    <FaMapMarkerAlt className="text-red-500" />
                                                                    <span>
                                                                        {
                                                                            ktt.latitude
                                                                        }
                                                                        ,{" "}
                                                                        {
                                                                            ktt.longitude
                                                                        }
                                                                    </span>
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
                            <div className="flex flex-col gap-2 mt-4 px-2 w-full">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 w-full">
                                    <div className="flex items-center gap-2">
                                        <label className="text-slate-600 text-sm font-medium mr-1">
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
                                                    <Listbox.Button className="border border-slate-300 rounded-lg px-2 py-1 text-sm w-full text-left bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition">
                                                        {rowsPerPage}
                                                    </Listbox.Button>
                                                    <Listbox.Options className="absolute left-0 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden">
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
                                                                                ? "bg-sky-50 text-sky-800"
                                                                                : selected
                                                                                ? "bg-slate-100 text-slate-900"
                                                                                : "text-slate-700"
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
                                                                                <span className="ml-auto flex items-center text-sky-600">
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
                                        <span className="text-slate-500 text-xs ml-1">
                                            / halaman
                                        </span>
                                    </div>
                                    <div className="text-sm text-slate-600 mb-1 sm:mb-0 text-center sm:text-left">
                                        Halaman{" "}
                                        <span className="font-semibold text-slate-800">
                                            {page}
                                        </span>{" "}
                                        dari{" "}
                                        <span className="font-semibold text-slate-800">
                                            {totalPages}
                                        </span>
                                        <span className="mx-2">|</span>
                                        Total{" "}
                                        <span className="font-semibold text-slate-800">
                                            {totalRows}
                                        </span>{" "}
                                        data
                                    </div>
                                    <div className="flex items-center gap-0.5 justify-center sm:justify-end w-full sm:w-auto">
                                        <button
                                            onClick={handlePrev}
                                            disabled={page === 1}
                                            className={`px-3 py-2 rounded-l-md border border-r-0 text-sm flex items-center gap-1 font-semibold transition-colors ${
                                                page === 1
                                                    ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                                            }`}
                                            aria-label="Halaman sebelumnya"
                                        >
                                            <FaChevronLeft />
                                        </button>
                                        <span
                                            className="px-4 py-2 text-sm bg-slate-50 text-slate-800 select-none font-bold tracking-wide border-t border-b border-slate-200"
                                            aria-live="polite"
                                        >
                                            {page}
                                        </span>
                                        <button
                                            onClick={handleNext}
                                            disabled={page === totalPages}
                                            className={`px-3 py-2 rounded-r-md border border-l-0 text-sm flex items-center gap-1 font-semibold transition-colors ${
                                                page === totalPages
                                                    ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                                            }`}
                                            aria-label="Halaman berikutnya"
                                        >
                                            <FaChevronRight />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Dialog
                    open={open}
                    onClose={handleClose}
                    maxWidth="md"
                    fullWidth
                    disableEnforceFocus
                    disableAutoFocus
                    PaperProps={{
                        sx: {
                            borderRadius: "1rem",
                            boxShadow:
                                "0 4px 4px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                        },
                    }}
                >
                    <DialogTitle className="flex items-center justify-between p-6 border-b border-slate-100 bg-gradient-to-r from-sky-600 to-sky-700">
                        <span className="text-xl font-semibold text-white">
                            Tambah Data KTT
                        </span>
                        <IconButton
                            onClick={handleClose}
                            size="small"
                            sx={{ color: "white" }}
                            aria-label="close"
                        >
                            <FaPlus className="transform rotate-45" />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent className="p-6 bg-white">
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-4"
                            role="form"
                            aria-label="Form tambah data KTT"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-slate-700 mb-1">
                                        Nama KTT
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors"
                                        placeholder="Masukkan nama KTT"
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-slate-700 mb-1">
                                        Lokasi
                                    </label>
                                    <select
                                        name="lokasi"
                                        value={data.lokasi}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors"
                                    >
                                        <option value="">Pilih Lokasi</option>
                                        <option value="Karawang">
                                            Karawang
                                        </option>
                                        <option value="Purwakarta">
                                            Purwakarta
                                        </option>
                                    </select>
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-slate-700 mb-1">
                                        Tipe
                                    </label>
                                    <select
                                        name="tipe"
                                        value={data.tipe}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors"
                                    >
                                        <option value="">Pilih Tipe</option>
                                        <option value="Khusus">Khusus</option>
                                        <option value="Gold">Gold</option>
                                        <option value="Silver">Silver</option>
                                        <option value="Bronze">Bronze</option>
                                        <option value="Reguler">Reguler</option>
                                        <option value="<30">&lt;30</option>
                                    </select>
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-slate-700 mb-1">
                                        Kapasitas
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="kapasitas"
                                            value={data.kapasitas}
                                            onChange={handleChange}
                                            required
                                            min="0"
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors pr-12"
                                            placeholder="Masukkan kapasitas"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                                            MVA
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-slate-700 mb-1">
                                        Latitude
                                    </label>
                                    <input
                                        type="number"
                                        name="latitude"
                                        value={data.latitude}
                                        onChange={handleChange}
                                        required
                                        step="any"
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors"
                                        placeholder="Masukkan latitude"
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-slate-700 mb-1">
                                        Longitude
                                    </label>
                                    <input
                                        type="number"
                                        name="longitude"
                                        value={data.longitude}
                                        onChange={handleChange}
                                        required
                                        step="any"
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors"
                                        placeholder="Masukkan longitude"
                                    />
                                </div>
                            </div>
                            <div className="flex pt-2 justify-end">
                                <button
                                    type="submit"
                                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-semibold rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50"
                                >
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </DashboardLayout>
        </>
    );
}
