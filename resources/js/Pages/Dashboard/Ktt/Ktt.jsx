import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { useEffect, useState, useMemo } from "react";
import { FaBuilding, FaPlus, FaMapMarkerAlt, FaChevronLeft, FaChevronRight, FaSearch, FaCheck } from "react-icons/fa";
import { Listbox } from "@headlessui/react";
import Modal from "@/Components/Modal";
import SecondaryButton from "@/Components/SecondaryButton";
import PrimaryButton from "@/Components/PrimaryButton";
import { Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";

// Fungsi untuk membuat badge tipe, sama seperti di file Anomali.jsx
function TipeBadge({ tipe }) {
    let color = "bg-gray-200 text-gray-700";
    if (tipe === "Gold") color = "bg-yellow-100 text-yellow-800";
    else if (tipe === "Silver") color = "bg-gray-200 text-gray-700";
    else if (tipe === "Bronze") color = "bg-amber-100 text-amber-800";
    else if (tipe === "Khusus") color = "bg-gray-800 text-white";
    else if (tipe === "Reguler") color = "bg-blue-100 text-blue-800";
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
                    (ktt.kapasitas.toString() || "").toLowerCase().includes(searchLower)
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


    return (
        <>
            <Head title="Ktt" />
            <DashboardLayout>
                <ToastContainer />
                <div className="py-6 w-full mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg mb-6 overflow-hidden">
                        <div className="px-6 py-8 md:px-10 md:py-10">
                            <div className="flex flex-col md:flex-row md:items-center justify-between">
                                <div className="mb-6 md:mb-0">
                                    <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center">
                                        <div className="flex items-center justify-center bg-blue-500 rounded-full w-12 h-12 mr-3">
                                            <FaBuilding className="text-blue-200" />
                                        </div>
                                        Konsumen Tegangan Tinggi
                                    </h1>
                                    <p className="mt-2 text-blue-100 max-w-2xl">
                                        Data konsumen tegangan tinggi (KTT) yang terdaftar pada sistem
                                    </p>
                                </div>
                                <button
                                    onClick={handleOpen}
                                    className="inline-flex items-center px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 shadow-sm font-medium"
                                >
                                    <FaPlus className="mr-2" />
                                    Tambah KTT
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* Bagian card data KTT Karawang dan Purwakarta tetap sama */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="group relative overflow-hidden rounded-xl bg-white hover:shadow-xl transition-all duration-300 border">
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md">
                                            <FaBuilding className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-800">
                                                Karawang
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Wilayah Operasional
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-50">
                                        <p className="text-sm text-gray-500 mb-1">
                                            Total KTT
                                        </p>
                                        <p className="text-2xl font-bold text-blue-600">
                                            24 Unit
                                        </p>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-50">
                                        <p className="text-sm text-gray-500 mb-1">
                                            Kapasitas
                                        </p>
                                        <p className="text-2xl font-bold text-blue-600">
                                            150 MVA
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="group relative overflow-hidden rounded-xl bg-white hover:shadow-xl transition-all duration-300 border">
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md">
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
                                            <h3 className="text-2xl font-bold text-gray-800">
                                                Purwakarta
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Wilayah Operasional
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-50">
                                        <p className="text-sm text-gray-500 mb-1">
                                            Total KTT
                                        </p>
                                        <p className="text-2xl font-bold text-blue-600">
                                            24 Unit
                                        </p>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-50">
                                        <p className="text-sm text-gray-500 mb-1">
                                            Kapasitas
                                        </p>
                                        <p className="text-2xl font-bold text-blue-600">
                                            150 MVA
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mengganti DataGrid dengan tabel HTML manual */}
                    <div className="bg-white rounded-xl mt-6 shadow-sm border overflow-hidden">
                        <div className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="w-full">
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        Data KTT UPT Karawang
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Kelola data KTT di wilayah Karawang
                                    </p>
                                </div>
                                <div className="flex flex-row flex-wrap items-center gap-2">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Cari nama KTT..."
                                            className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                            value={searchTerm}
                                            onChange={(e) => handleSearch(e.target.value)}
                                        />
                                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="px-2 md:px-6 pb-6 pt-4">
                            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                                <div className="overflow-y-auto custom-scrollbar">
                                    <table className="min-w-full w-full table-auto">
                                        <thead className="bg-gray-100 text-gray-600 sticky top-0">
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
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {paginatedData.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="text-center py-10 text-gray-400 font-semibold text-base">
                                                        Tidak ada data KTT.
                                                    </td>
                                                </tr>
                                            ) : (
                                                paginatedData.map((ktt, idx) => (
                                                    <tr className="hover:bg-gray-50" key={ktt.id}>
                                                        <td className="px-3 py-3 text-left text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                                                            {(page - 1) * rowsPerPage + idx + 1}
                                                        </td>
                                                        <td className="px-3 py-3 text-left text-xs sm:text-sm text-gray-800 truncate max-w-[8rem] sm:max-w-[12rem]" title={ktt.name}>
                                                            {ktt.name}
                                                        </td>
                                                        <td className="px-3 py-3 text-left text-xs sm:text-sm text-gray-700">
                                                            {ktt.lokasi}
                                                        </td>
                                                        <td className="px-3 py-3 text-left text-xs sm:text-sm whitespace-nowrap">
                                                            <TipeBadge tipe={ktt.tipe} />
                                                        </td>
                                                        <td className="px-3 py-3 text-left text-xs sm:text-sm text-gray-700">
                                                            {ktt.kapasitas} MVA
                                                        </td>
                                                        <td className="px-3 py-3 text-left text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                                                            <div className="flex items-center gap-1">
                                                                <FaMapMarkerAlt className="text-red-500" />
                                                                <span>{ktt.latitude}, {ktt.longitude}</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 mt-4 px-2 w-full">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 w-full">
                                    <div className="flex items-center gap-2">
                                        <label className="text-gray-600 text-sm font-medium mr-1">
                                            Tampil
                                        </label>
                                        <div className="min-w-[4.5rem]">
                                            <Listbox
                                                value={rowsPerPage}
                                                onChange={handleRowsPerPageChange}
                                            >
                                                <div className="relative">
                                                    <Listbox.Button className="border border-gray-300 rounded-lg px-2 py-1 text-sm w-full text-left bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                                                        {rowsPerPage}
                                                    </Listbox.Button>
                                                    <Listbox.Options className="absolute left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                                                        {[10, 20, 50].map((option) => (
                                                            <Listbox.Option
                                                                key={option}
                                                                value={option}
                                                                className={({ active, selected }) =>
                                                                    `relative cursor-pointer select-none px-2 py-1 text-sm transition-colors ${
                                                                        active
                                                                            ? "bg-blue-50 text-blue-800"
                                                                            : selected
                                                                            ? "bg-gray-100 text-gray-900"
                                                                            : "text-gray-700"
                                                                    }`
                                                                }
                                                            >
                                                                {({ selected }) => (
                                                                    <div className="flex items-center">
                                                                        <span
                                                                            className={`block truncate ${
                                                                                selected
                                                                                    ? "font-semibold"
                                                                                    : "font-normal"
                                                                            }`}
                                                                        >
                                                                            {option}
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
                                                        ))}
                                                    </Listbox.Options>
                                                </div>
                                            </Listbox>
                                        </div>
                                        <span className="text-gray-500 text-xs ml-1">
                                            / halaman
                                        </span>
                                    </div>
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
                    <DialogTitle className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-700">
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
                                    <label className="text-sm font-medium text-gray-700 mb-1">
                                        Nama KTT
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                        placeholder="Masukkan nama KTT"
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-700 mb-1">
                                        Lokasi
                                    </label>
                                    <select
                                        name="lokasi"
                                        value={data.lokasi}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
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
                                    <label className="text-sm font-medium text-gray-700 mb-1">
                                        Tipe
                                    </label>
                                    <select
                                        name="tipe"
                                        value={data.tipe}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
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
                                    <label className="text-sm font-medium text-gray-700 mb-1">
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
                                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors pr-12"
                                            placeholder="Masukkan kapasitas"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                                            MVA
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-700 mb-1">
                                        Latitude
                                    </label>
                                    <input
                                        type="number"
                                        name="latitude"
                                        value={data.latitude}
                                        onChange={handleChange}
                                        required
                                        step="any"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                        placeholder="Masukkan latitude"
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-700 mb-1">
                                        Longitude
                                    </label>
                                    <input
                                        type="number"
                                        name="longitude"
                                        value={data.longitude}
                                        onChange={handleChange}
                                        required
                                        step="any"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                        placeholder="Masukkan longitude"
                                    />
                                </div>
                            </div>
                            <div className="flex pt-2 justify-end">
                                <button
                                    type="submit"
                                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
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