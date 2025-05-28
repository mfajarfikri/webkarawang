import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { FaBuilding, FaPlus, FaMapMarkerAlt } from "react-icons/fa";
import { DataGrid } from "@mui/x-data-grid";
import { Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";

export default function Ktt({ ktts }) {
    const [open, setOpen] = useState(false);
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
            const formattedData = ktts.map((ktt, index) => ({
                id: ktt.id || index + 1,
                ...ktt,
            }));
            setRows(formattedData);
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
            .post(route("ktt.store"), data, {
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
                    .get(route("ktt.index"))
                    .then((response) => {
                        const formattedData = response.data.map(
                            (ktt, index) => ({
                                id: ktt.id || index + 1,
                                ...ktt,
                            })
                        );
                        setRows(formattedData);
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
                        // If there's no specific validation errors object
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

    const columns = [
        {
            field: "no",
            headerName: "No",
            flex: 0.2,
            renderCell: (params) => (
                <div className="flex h-full justify-center items-center">
                    {params.api.getRowIndexRelativeToVisibleRows(
                        params.row.id
                    ) + 1}
                </div>
            ),
        },
        {
            field: "name",
            headerName: "Nama KTT",
            flex: 1,
            renderCell: (params) => (
                <div className="flex items-center h-full">
                    <div className="text-sm font-medium text-gray-900">
                        {params.row.name}
                    </div>
                </div>
            ),
        },
        {
            field: "lokasi",
            headerName: "Lokasi",
            flex: 1,
            // renderCell: (params) => <div className="">{params.lokasi}</div>,
        },
        {
            field: "tipe",
            headerName: "tipe",
            flex: 1,
            renderCell: (params) => (
                <div className="flex h-full items-center">
                    <div
                        className={`rounded-full w-4 h-4 mr-2 animate-pulse ${
                            params.row.tipe === "Khusus"
                                ? "bg-black"
                                : params.row.tipe === "Gold"
                                ? "bg-[#FFD700]"
                                : params.row.tipe === "Silver"
                                ? "bg-[#c0c0c0]"
                                : params.row.tipe === "Bronze"
                                ? "bg-[#CD7F32]"
                                : "bg-blue-700"
                        }`}
                    />
                    <span className="text-sm font-medium">
                        {params.row?.tipe || "-"}
                    </span>
                </div>
            ),
        },
        {
            field: "kapasitas",
            headerName: "Kapasitas",
            flex: 1,
            renderCell: (params) => (
                <div className="flex items-center h-full">
                    <span className="text-sm font-medium">
                        {params.row?.kapasitas || "-"} MVA
                    </span>
                </div>
            ),
        },
        {
            field: "coordinates",
            headerName: "Koordinat",
            flex: 2,
            renderCell: (params) => (
                <div className="flex items-center h-full text-sm text-gray-500">
                    <FaMapMarkerAlt className="mr-2 text-red-500" />
                    {`${params.row?.latitude || "-"}, ${
                        params.row?.longitude || "-"
                    }`}
                </div>
            ),
        },
    ];

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
                                        Data konsumen tegangan tinggi (KTT) yang
                                        terdaftar pada sistem
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

                    {/* KTT DataGrid */}
                    <div className="bg-white rounded-xl mt-6 shadow-sm border overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        Data KTT UPT Karawang
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Kelola data KTT di wilayah Karawang
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="h-[25vh] w-full">
                            {rows.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                                    <div className="w-16 h-16 mb-4 text-gray-400">
                                        <FaBuilding className="w-full h-full" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                                        Tidak ada data KTT
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Belum ada data KTT yang tersedia.
                                        Silakan tambahkan data baru.
                                    </p>
                                    <button
                                        onClick={handleOpen}
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-all duration-200 shadow-sm font-medium"
                                    >
                                        <FaPlus className="mr-2" />
                                        Tambah KTT
                                    </button>
                                </div>
                            ) : (
                                <DataGrid
                                    rows={rows}
                                    columns={columns}
                                    pageSize={5}
                                    rowsPerPageOptions={[5, 10, 20]}
                                    disableSelectionOnClick
                                    className="border-0"
                                    sx={{
                                        "& .MuiDataGrid-cell:focus": {
                                            outline: "none",
                                        },
                                        "& .MuiDataGrid-columnHeaders": {
                                            backgroundColor: "#f8fafc",
                                            borderBottom: "1px solid #e2e8f0",
                                            color: "#1e293b",
                                            fontWeight: 600,
                                        },
                                        "& .MuiDataGrid-cell": {
                                            borderBottom: "1px solid #e2e8f0",
                                            color: "#475569",
                                        },
                                        "& .MuiDataGrid-footerContainer": {
                                            borderTop: "1px solid #e2e8f0",
                                            backgroundColor: "#f8fafc",
                                        },
                                        "& .MuiTablePagination-root": {
                                            color: "#475569",
                                        },
                                        "& .MuiDataGrid-row:hover": {
                                            backgroundColor: "#f1f5f9",
                                        },
                                    }}
                                />
                            )}
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
