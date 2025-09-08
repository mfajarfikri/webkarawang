import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useState, useEffect, forwardRef } from "react";
import axios from "axios";
import { SnackbarProvider, useSnackbar } from "notistack";
import { Listbox, Transition } from "@headlessui/react";
import {
    FaCalendarAlt,
    FaBuilding,
    FaList,
    FaThLarge,
    FaLayerGroup,
    FaMapMarkerAlt,
    FaMapPin,
    FaTools,
    FaExclamationTriangle,
    FaBolt,
    FaLightbulb,
    FaTag,
    FaUser,
    FaInfoCircle,
    FaMoneyBillAlt,
    FaBarcode,
    FaClock,
    FaHistory,
    FaClipboardList,
    FaExclamationCircle,
    FaFileDownload,
    FaChartLine,
    FaCheckCircle,
    FaTimesCircle,
    FaUserClock,
    FaSearch,
    FaShieldAlt,
    FaUserCheck,
} from "react-icons/fa";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { formatRupiah } from "@/utils/formatter";

// Komponen untuk menampilkan item data dengan ikon
const DataItem = ({ icon, label, value, className = "" }) => {
    const Icon = icon;
    return (
        <div
            className={`bg-white p-4 rounded-lg shadow-sm border border-gray-100 ${className}`}
        >
            <div className="flex items-center mb-2">
                <Icon className="text-blue-500 mr-2" />
                <span className="text-sm font-medium text-gray-500">
                    {label}
                </span>
            </div>
            <div className="font-semibold text-gray-800">{value || "-"}</div>
        </div>
    );
};

// Komponen untuk menampilkan status anomali
const StatusBadge = ({ status }) => {
    let bgColor = "bg-gray-100 text-gray-800";
    let icon = FaInfoCircle;

    switch (status) {
        case "New":
            bgColor = "bg-blue-100 text-blue-800";
            icon = FaInfoCircle;
            break;
        case "Open":
            bgColor = "bg-yellow-100 text-yellow-800";
            icon = FaExclamationCircle;
            break;
        case "Pending":
            bgColor = "bg-orange-100 text-orange-800";
            icon = FaUserClock;
            break;
        case "Close":
            bgColor = "bg-green-100 text-green-800";
            icon = FaCheckCircle;
            break;
        default:
            break;
    }

    const Icon = icon;

    return (
        <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${bgColor}`}
        >
            <Icon className="mr-1" />
            {status}
        </div>
    );
};

// Snackbar custom styles
const StyledSnackbar = forwardRef(({ id, message, variant, ...props }, ref) => {
    const icon =
        variant === "success" ? (
            <FaCheckCircle className="text-white" />
        ) : (
            <FaTimesCircle className="text-white" />
        );

    return (
        <div
            ref={ref}
            className={`${
                variant === "success" ? "bg-green-600" : "bg-red-600"
            } text-white px-4 py-3 rounded-md shadow-lg flex items-center max-w-md`}
            {...props}
        >
            <div className="mr-3">{icon}</div>
            <div className="flex-1">
                <p className="font-medium">{message}</p>
            </div>
        </div>
    );
});

// Main component with notistack
function ReviewContent({ anomalis, users }) {
    const { csrf_token } = usePage().props;
    const { enqueueSnackbar } = useSnackbar();
    const [activeTab, setActiveTab] = useState("informasi");
    const [selectedImage, setSelectedImage] = useState(null);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [assignTo, setAssignTo] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Mapping bidang berdasarkan wilayah
    const getBidangByWilayah = (ultg) => {
        // Daftar bidang yang tersedia untuk semua wilayah
        return ["Renev", "Hargi", "Harjar", "Harpro", "K3"];
    };

    const availableBidang = getBidangByWilayah(anomalis.ultg);

    // Set CSRF token for axios
    useEffect(() => {
        axios.defaults.headers.common["X-CSRF-TOKEN"] = csrf_token;
    }, [csrf_token]);

    // Format tanggal
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        try {
            return format(new Date(dateString), "dd MMMM yyyy", { locale: id });
        } catch (error) {
            return dateString;
        }
    };

    // Parse lampiran foto
    const lampiranFoto = anomalis?.lampiran_foto
        ? typeof anomalis.lampiran_foto === "string"
            ? JSON.parse(anomalis.lampiran_foto)
            : anomalis.lampiran_foto
        : [];

    if (!anomalis) {
        return (
            <DashboardLayout>
                <div className="p-8 text-center text-gray-500 bg-white rounded-lg shadow-sm border border-gray-200">
                    <FaExclamationCircle className="mx-auto text-4xl text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                        Data Anomali Tidak Ditemukan
                    </h3>
                    <p>
                        Maaf, data anomali yang Anda cari tidak tersedia atau
                        telah dihapus.
                    </p>
                    <Link
                        href="/dashboard/anomali"
                        className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Kembali ke Daftar Anomali
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    // Handle approve anomali
    const handleApprove = () => {
        setIsSubmitting(true);

        const data = {
            approve: "Yes",
            bidang: assignTo,
        };

        axios
            .post(`/dashboard/anomali/${anomalis.slug}/approve`, data)
            .then((response) => {
                setShowApproveModal(false);
                setIsSubmitting(false);

                // Show success notification
                enqueueSnackbar("Anomali berhasil disetujui", {
                    variant: "success",
                    content: (key, message) => (
                        <StyledSnackbar
                            id={key}
                            message={message}
                            variant="success"
                        />
                    ),
                });

                // Redirect setelah 2 detik
                setTimeout(() => {
                    if (response.data.redirect) {
                        window.location.href = response.data.redirect;
                    } else {
                        window.location.reload();
                    }
                }, 2000);
            })
            .catch((error) => {
                console.error("Error approving anomali:", error);
                setIsSubmitting(false);

                // Show error notification
                enqueueSnackbar(
                    error.response?.data?.message ||
                        "Terjadi kesalahan saat menyetujui anomali",
                    {
                        variant: "error",
                        content: (key, message) => (
                            <StyledSnackbar
                                id={key}
                                message={message}
                                variant="error"
                            />
                        ),
                    }
                );
            });
    };

    // Handle reject anomali
    const handleReject = () => {
        setIsSubmitting(true);

        const data = {
            approve: "No",
            reject_reason: rejectReason,
        };

        axios
            .post(`/dashboard/anomali/${anomalis.slug}/approve`, data)
            .then((response) => {
                setShowRejectModal(false);
                setIsSubmitting(false);

                // Show success notification
                enqueueSnackbar("Anomali berhasil ditolak", {
                    variant: "success",
                    content: (key, message) => (
                        <StyledSnackbar
                            id={key}
                            message={message}
                            variant="success"
                        />
                    ),
                });

                // Redirect setelah 2 detik
                setTimeout(() => {
                    if (response.data.redirect) {
                        window.location.href = response.data.redirect;
                    } else {
                        window.location.reload();
                    }
                }, 2000);
            })
            .catch((error) => {
                console.error("Error rejecting anomali:", error);
                setIsSubmitting(false);

                // Show error notification
                enqueueSnackbar(
                    error.response?.data?.message ||
                        "Terjadi kesalahan saat menolak anomali",
                    {
                        variant: "error",
                        anchorOrigin: { vertical: "top", horizontal: "right" },
                        autoHideDuration: 4000,
                        content: (key, message) => (
                            <StyledSnackbar
                                id={key}
                                message={message}
                                variant="error"
                            />
                        ),
                    }
                );
            });
    };

    return (
        <>
            <Head title={`Review Anomali - ${anomalis.judul || ""}`} />
            <DashboardLayout>
                <div className="container mx-auto px-4 py-6">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 mb-6 text-white">
                        <div className="flex flex-col md:flex-row md:items-center justify-between">
                            <div>
                                <div className="flex items-center">
                                    <div className="bg-white p-3 rounded-full mr-4 shadow-md">
                                        <FaShieldAlt className="text-blue-600 text-2xl" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold">
                                            Review Anomali
                                        </h1>
                                        <h2 className="text-xl font-semibold text-blue-100 mt-1">
                                            {anomalis.judul}
                                        </h2>
                                        <div className="flex items-center mt-3 text-sm text-blue-100">
                                            <div className="bg-blue-500 bg-opacity-30 px-3 py-1 rounded-full mr-3 flex items-center">
                                                <FaCalendarAlt className="mr-2" />
                                                {formatDate(
                                                    anomalis.tanggal_kejadian
                                                )}
                                            </div>
                                            <div className="bg-blue-500 bg-opacity-30 px-3 py-1 rounded-full flex items-center">
                                                <FaUser className="mr-2" />
                                                {anomalis.user?.name || "-"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 md:mt-0 flex flex-col md:flex-row items-start md:items-center gap-3">
                                <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                                    <StatusBadge status={anomalis.status} />
                                </div>
                                <a
                                    href={`/dashboard/anomali/${anomalis.slug}/pdf`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-4 py-2 bg-white text-blue-700 rounded-md transition-colors shadow-md hover:bg-blue-50"
                                >
                                    <FaFileDownload className="mr-2" />
                                    Download PDF
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Action Card */}
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-l-4 border-blue-600">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <div className="bg-blue-100 p-2 rounded-full mr-3">
                                <FaUserCheck className="text-blue-600" />
                            </div>
                            Tindakan Persetujuan
                        </h2>
                        <div className="flex flex-col md:flex-row gap-4">
                            <button
                                onClick={() => setShowApproveModal(true)}
                                className={`${
                                    anomalis.approve !== null
                                        ? "cursor-not-allowed bg-opacity-50 bg-gray-500"
                                        : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                                } flex-1  text-white py-3 px-6 rounded-lg transition-all shadow-md flex items-center justify-center font-medium `}
                                disabled={anomalis.approve !== null}
                            >
                                <FaCheckCircle className="mr-2 text-lg" />
                                Setujui Anomali
                            </button>
                            <button
                                onClick={() => setShowRejectModal(true)}
                                className={`${
                                    anomalis.approve !== null
                                        ? "cursor-not-allowed bg-opacity-50 bg-gray-500"
                                        : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                                } flex-1  text-white py-3 px-6 rounded-lg transition-all shadow-md flex items-center justify-center font-medium `}
                                disabled={anomalis.approve !== null}
                            >
                                <FaTimesCircle className="mr-2 text-lg" />
                                Tolak Anomali
                            </button>
                        </div>

                        {anomalis.approve !== null && (
                            <div className="mt-6 p-5 bg-gray-50 rounded-lg border border-gray-200 shadow-inner">
                                <div className="flex items-center">
                                    {anomalis.approve === "Yes" ? (
                                        <div className="bg-green-100 p-2 rounded-full mr-3">
                                            <FaCheckCircle className="text-green-600" />
                                        </div>
                                    ) : (
                                        <div className="bg-red-100 p-2 rounded-full mr-3">
                                            <FaTimesCircle className="text-red-600" />
                                        </div>
                                    )}
                                    <span className="font-medium text-lg">
                                        Anomali ini telah{" "}
                                        {anomalis.approve === "Yes"
                                            ? "disetujui"
                                            : "ditolak"}
                                    </span>
                                </div>
                                {anomalis.reject_reason && (
                                    <div className="mt-3 ml-11 text-gray-700 bg-red-100 p-3 rounded-md border border-red-200">
                                        <span className="font-medium">
                                            Alasan Penolakan:{" "}
                                        </span>
                                        {anomalis.reject_reason}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6 overflow-hidden">
                        <div className="flex border-b border-gray-200 overflow-x-auto">
                            <button
                                onClick={() => setActiveTab("informasi")}
                                className={`px-6 py-3 font-medium text-sm flex items-center ${
                                    activeTab === "informasi"
                                        ? "text-blue-600 border-b-2 border-blue-600"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                <FaInfoCircle className="mr-2" />
                                Informasi Umum
                            </button>
                            <button
                                onClick={() => setActiveTab("detail")}
                                className={`px-6 py-3 font-medium text-sm flex items-center ${
                                    activeTab === "detail"
                                        ? "text-blue-600 border-b-2 border-blue-600"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                <FaTools className="mr-2" />
                                Detail Peralatan
                            </button>
                            <button
                                onClick={() => setActiveTab("analisis")}
                                className={`px-6 py-3 font-medium text-sm flex items-center ${
                                    activeTab === "analisis"
                                        ? "text-blue-600 border-b-2 border-blue-600"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                <FaChartLine className="mr-2" />
                                Analisis Anomali
                            </button>
                            <button
                                onClick={() => setActiveTab("lampiran")}
                                className={`px-6 py-3 font-medium text-sm flex items-center ${
                                    activeTab === "lampiran"
                                        ? "text-blue-600 border-b-2 border-blue-600"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                <FaClipboardList className="mr-2" />
                                Lampiran
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Tab Informasi Umum */}
                            {activeTab === "informasi" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <DataItem
                                        icon={FaBuilding}
                                        label="ULTG"
                                        value={anomalis.ultg}
                                    />
                                    <DataItem
                                        icon={FaMapMarkerAlt}
                                        label="Gardu Induk"
                                        value={anomalis.gardu_induk?.name}
                                    />
                                    <DataItem
                                        icon={FaLayerGroup}
                                        label="Bagian"
                                        value={anomalis.bagian}
                                    />
                                    <DataItem
                                        icon={FaThLarge}
                                        label="Tipe"
                                        value={anomalis.tipe}
                                    />
                                    <DataItem
                                        icon={FaList}
                                        label="Kategori"
                                        value={anomalis.kategori?.name}
                                    />
                                    <DataItem
                                        icon={FaMapPin}
                                        label="Penempatan Alat"
                                        value={anomalis.penempatan_alat}
                                    />
                                </div>
                            )}

                            {/* Tab Detail Peralatan */}
                            {activeTab === "detail" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <DataItem
                                        icon={FaTools}
                                        label="Peralatan"
                                        value={anomalis.peralatan}
                                    />
                                    <DataItem
                                        icon={FaTag}
                                        label="Merek"
                                        value={anomalis.merek}
                                    />
                                    <DataItem
                                        icon={FaLightbulb}
                                        label="Tipe Alat"
                                        value={anomalis.tipe_alat}
                                    />
                                    <DataItem
                                        icon={FaBarcode}
                                        label="No Seri"
                                        value={anomalis.no_seri}
                                    />
                                    <DataItem
                                        icon={FaMoneyBillAlt}
                                        label="Harga"
                                        value={
                                            anomalis.harga
                                                ? formatRupiah(anomalis.harga)
                                                : "-"
                                        }
                                    />
                                    <DataItem
                                        icon={FaBarcode}
                                        label="Kode Asset"
                                        value={anomalis.kode_asset}
                                    />
                                    <DataItem
                                        icon={FaClock}
                                        label="Tahun Operasi"
                                        value={anomalis.tahun_operasi}
                                    />
                                    <DataItem
                                        icon={FaHistory}
                                        label="Tahun Buat"
                                        value={anomalis.tahun_buat}
                                    />
                                </div>
                            )}

                            {/* Tab Analisis Anomali */}
                            {activeTab === "analisis" && (
                                <div className="space-y-6">
                                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                        <div className="flex items-center mb-2">
                                            <FaExclamationTriangle className="text-yellow-500 mr-2" />
                                            <span className="text-sm font-medium text-gray-500">
                                                Penyebab
                                            </span>
                                        </div>
                                        <div className="text-gray-800 whitespace-pre-line">
                                            {anomalis.penyebab}
                                        </div>
                                    </div>

                                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                        <div className="flex items-center mb-2">
                                            <FaBolt className="text-red-500 mr-2" />
                                            <span className="text-sm font-medium text-gray-500">
                                                Akibat
                                            </span>
                                        </div>
                                        <div className="text-gray-800 whitespace-pre-line">
                                            {anomalis.akibat}
                                        </div>
                                    </div>

                                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                        <div className="flex items-center mb-2">
                                            <FaLightbulb className="text-blue-500 mr-2" />
                                            <span className="text-sm font-medium text-gray-500">
                                                Usul/Saran
                                            </span>
                                        </div>
                                        <div className="text-gray-800 whitespace-pre-line">
                                            {anomalis.usul_saran || "-"}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab Lampiran */}
                            {activeTab === "lampiran" && (
                                <div>
                                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                                        <FaClipboardList className="mr-2 text-blue-500" />
                                        Lampiran Foto
                                    </h3>

                                    {lampiranFoto && lampiranFoto.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                            {lampiranFoto.map((foto, idx) => (
                                                <div
                                                    key={idx}
                                                    className="relative group cursor-pointer"
                                                    onClick={() =>
                                                        setSelectedImage(
                                                            `/storage/${foto}`
                                                        )
                                                    }
                                                >
                                                    <div className="aspect-w-1 aspect-h-1 overflow-hidden rounded-lg shadow-sm border border-gray-200">
                                                        <img
                                                            src={`/storage/${foto}`}
                                                            alt={`Lampiran Foto ${
                                                                idx + 1
                                                            }`}
                                                            className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                                                        />
                                                    </div>
                                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center transition-all rounded-lg">
                                                        <FaSearch className="text-white opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100 transition-all" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                                            <FaClipboardList className="mx-auto text-4xl text-gray-300 mb-2" />
                                            <p className="text-gray-500">
                                                Tidak ada lampiran foto
                                            </p>
                                        </div>
                                    )}

                                    {/* Modal untuk preview gambar */}
                                    {selectedImage && (
                                        <div
                                            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
                                            onClick={() =>
                                                setSelectedImage(null)
                                            }
                                        >
                                            <div className="max-w-4xl max-h-[90vh] overflow-auto p-2">
                                                <img
                                                    src={selectedImage}
                                                    alt="Preview"
                                                    className="max-w-full max-h-[80vh] object-contain"
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                />
                                                <button
                                                    className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70"
                                                    onClick={() =>
                                                        setSelectedImage(null)
                                                    }
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-6 w-6"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M6 18L18 6M6 6l12 12"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Modal Approve */}
                {showApproveModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh]">
                            <div className="bg-green-50 -mt-6 -mx-6 px-6 py-4 mb-6 border-b border-green-100 flex items-center">
                                <div className="bg-green-100 p-2 rounded-full mr-3">
                                    <FaCheckCircle className="text-green-600 text-xl" />
                                </div>
                                <h3 className="text-xl font-bold text-green-800">
                                    Setujui Anomali
                                </h3>
                            </div>

                            <div className="space-y-4 max-h-[60vh] overflow-y-visible">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ditugaskan Kepada Bidang
                                    </label>
                                    <div className="relative">
                                        <Listbox
                                            value={assignTo}
                                            onChange={setAssignTo}
                                        >
                                            <div className="relative mt-1">
                                                <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left border border-gray-300 shadow-sm focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                                                    <span className="block truncate">
                                                        {assignTo
                                                            ? assignTo
                                                            : "Pilih Bidang"}
                                                    </span>
                                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-5 w-5 text-gray-400"
                                                            viewBox="0 0 20 20"
                                                            fill="currentColor"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </span>
                                                </Listbox.Button>
                                                <Transition
                                                    enter="transition duration-100 ease-out"
                                                    enterFrom="transform scale-95 opacity-0"
                                                    enterTo="transform scale-100 opacity-100"
                                                    leave="transition duration-75 ease-out"
                                                    leaveFrom="transform scale-100 opacity-100"
                                                    leaveTo="transform scale-95 opacity-0"
                                                >
                                                    <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-visible rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                        {availableBidang &&
                                                            availableBidang.map(
                                                                (bidang) => (
                                                                    <Listbox.Option
                                                                        key={
                                                                            bidang
                                                                        }
                                                                        value={
                                                                            bidang
                                                                        }
                                                                        className={({
                                                                            active,
                                                                        }) =>
                                                                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                                                                active
                                                                                    ? "bg-blue-100 text-blue-900"
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
                                                                                        bidang
                                                                                    }
                                                                                </span>
                                                                                {selected ? (
                                                                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                                                                        <svg
                                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                                            className="h-5 w-5"
                                                                                            viewBox="0 0 20 20"
                                                                                            fill="currentColor"
                                                                                        >
                                                                                            <path
                                                                                                fillRule="evenodd"
                                                                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                                                clipRule="evenodd"
                                                                                            />
                                                                                        </svg>
                                                                                    </span>
                                                                                ) : null}
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
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowApproveModal(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                                    disabled={isSubmitting}
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={handleApprove}
                                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-md hover:from-green-600 hover:to-green-700 transition-colors flex items-center shadow-md"
                                    disabled={isSubmitting || !assignTo}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg
                                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            Memproses...
                                        </>
                                    ) : (
                                        <>
                                            <FaCheckCircle className="mr-2" />
                                            Setujui
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Reject */}
                {showRejectModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh]">
                            <div className="bg-red-50 -mt-6 -mx-6 px-6 py-4 mb-6 border-b border-red-100 flex items-center">
                                <div className="bg-red-100 p-2 rounded-full mr-3">
                                    <FaTimesCircle className="text-red-600 text-xl" />
                                </div>
                                <h3 className="text-xl font-bold text-red-800">
                                    Tolak Anomali
                                </h3>
                            </div>

                            <div className="max-h-[60vh] overflow-y-auto">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Alasan Penolakan
                                </label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) =>
                                        setRejectReason(e.target.value)
                                    }
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring focus:ring-red-200 focus:ring-opacity-50"
                                    rows="4"
                                    placeholder="Masukkan alasan penolakan..."
                                    required
                                ></textarea>
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowRejectModal(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                                    disabled={isSubmitting}
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={handleReject}
                                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-md hover:from-red-600 hover:to-red-700 transition-colors flex items-center shadow-md"
                                    disabled={isSubmitting || !rejectReason}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg
                                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            Memproses...
                                        </>
                                    ) : (
                                        <>
                                            <FaTimesCircle className="mr-2" />
                                            Tolak
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </DashboardLayout>
        </>
    );
}

// Wrapper component with SnackbarProvider
export default function Review(props) {
    return (
        <SnackbarProvider maxSnack={3} autoHideDuration={3000} preventDuplicate>
            <ReviewContent {...props} />
        </SnackbarProvider>
    );
}
