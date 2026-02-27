import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useState, useEffect, forwardRef } from "react";
import axios from "axios";
import { SnackbarProvider, useSnackbar } from "notistack";
import { Listbox, Transition } from "@headlessui/react";
import PdfDownloadButton from "@/Components/Dashboard/Anomali/PdfDownloadButton";
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
            className={`group bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${className}`}
        >
            <div className="flex items-center mb-3">
                <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                    <Icon className="text-sm" />
                </div>
                <span className="ml-3 text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-blue-600 transition-colors">
                    {label}
                </span>
            </div>
            <div className="font-semibold text-slate-800 text-lg tracking-tight pl-1">
                {value || "-"}
            </div>
        </div>
    );
};

// Komponen untuk menampilkan status anomali
const StatusBadge = ({ status }) => {
    let styles = "bg-slate-50 text-slate-700 ring-slate-600/20";
    let icon = FaInfoCircle;

    switch (status) {
        case "New":
            styles = "bg-blue-50 text-blue-700 ring-blue-700/10";
            icon = FaInfoCircle;
            break;
        case "Open":
            styles = "bg-yellow-50 text-yellow-800 ring-yellow-600/20";
            icon = FaExclamationCircle;
            break;
        case "Pending":
            styles = "bg-orange-50 text-orange-800 ring-orange-600/20";
            icon = FaUserClock;
            break;
        case "Close":
            styles = "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
            icon = FaCheckCircle;
            break;
        default:
            break;
    }

    const Icon = icon;

    return (
        <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ring-1 ring-inset shadow-sm ${styles}`}
        >
            <Icon className="mr-1.5" />
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
            } text-white px-4 py-3 rounded-xl shadow-lg flex items-center max-w-md`}
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
                <div className="p-8 text-center text-slate-500 bg-white rounded-xl shadow-sm border border-slate-200">
                    <FaExclamationCircle className="mx-auto text-4xl text-slate-400 mb-4" />
                    <h3 className="text-xl font-semibold mb-2 text-slate-900">
                        Data Anomali Tidak Ditemukan
                    </h3>
                    <p>
                        Maaf, data anomali yang Anda cari tidak tersedia atau
                        telah dihapus.
                    </p>
                    <Link
                        href="/dashboard/anomali"
                        className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
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
                    },
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
                    },
                );
            });
    };

    return (
        <>
            <Head title={`Review Anomali - ${anomalis.judul || ""}`} />
            <DashboardLayout>
                <div className="container bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    {/* Header */}
                    <div className="relative bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-100 p-8 mb-8 overflow-hidden">
                        {/* Decorative Background Elements */}
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-blue-50 blur-3xl opacity-60 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-indigo-50 blur-3xl opacity-60 pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div className="flex items-start gap-5">
                                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl shadow-lg shadow-blue-500/30 text-white shrink-0">
                                    <FaShieldAlt className="text-2xl" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider border border-blue-100">
                                            Review Anomali
                                        </span>
                                        <StatusBadge status={anomalis.status} />
                                    </div>
                                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3 leading-tight">
                                        {anomalis.judul}
                                    </h2>
                                    <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500">
                                        <div className="flex items-center gap-2">
                                            <FaCalendarAlt className="text-blue-400" />
                                            {formatDate(
                                                anomalis.tanggal_kejadian,
                                            )}
                                        </div>
                                        <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                                        <div className="flex items-center gap-2">
                                            <FaUser className="text-blue-400" />
                                            {anomalis.user?.name || "-"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                <PdfDownloadButton
                                    url={`/dashboard/anomali/${anomalis.slug}/pdf`}
                                    fileName={`anomali_${anomalis.slug}.pdf`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Card */}
                    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 mb-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="bg-blue-50 p-3 rounded-xl text-blue-600 ring-1 ring-blue-100">
                                <FaUserCheck className="text-xl" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">
                                    Tindakan Persetujuan
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">
                                    Silakan tinjau laporan ini dan berikan
                                    keputusan persetujuan.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row gap-5">
                            <button
                                onClick={() => setShowApproveModal(true)}
                                className={`${
                                    anomalis.approve !== null
                                        ? "cursor-not-allowed bg-slate-100 text-slate-400 border border-slate-200"
                                        : "bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:-translate-y-0.5"
                                } flex-1 py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center font-bold text-lg group`}
                                disabled={anomalis.approve !== null}
                            >
                                <div
                                    className={`p-1 rounded-full mr-3 ${anomalis.approve !== null ? "bg-slate-200" : "bg-white/20"}`}
                                >
                                    <FaCheckCircle className="text-xl" />
                                </div>
                                Setujui Anomali
                            </button>
                            <button
                                onClick={() => setShowRejectModal(true)}
                                className={`${
                                    anomalis.approve !== null
                                        ? "cursor-not-allowed bg-slate-100 text-slate-400 border border-slate-200"
                                        : "bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/40 hover:-translate-y-0.5"
                                } flex-1 py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center font-bold text-lg group`}
                                disabled={anomalis.approve !== null}
                            >
                                <div
                                    className={`p-1 rounded-full mr-3 ${anomalis.approve !== null ? "bg-slate-200" : "bg-white/20"}`}
                                >
                                    <FaTimesCircle className="text-xl" />
                                </div>
                                Tolak Anomali
                            </button>
                        </div>

                        {anomalis.approve !== null && (
                            <div
                                className={`mt-8 p-6 rounded-2xl border ${anomalis.approve === "Yes" ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"} animate-fade-in`}
                            >
                                <div className="flex items-center">
                                    {anomalis.approve === "Yes" ? (
                                        <div className="bg-emerald-100 p-2 rounded-full mr-4 ring-4 ring-emerald-50">
                                            <FaCheckCircle className="text-emerald-600 text-xl" />
                                        </div>
                                    ) : (
                                        <div className="bg-red-100 p-2 rounded-full mr-4 ring-4 ring-red-50">
                                            <FaTimesCircle className="text-red-600 text-xl" />
                                        </div>
                                    )}
                                    <div>
                                        <span
                                            className={`font-bold text-lg ${anomalis.approve === "Yes" ? "text-emerald-900" : "text-red-900"}`}
                                        >
                                            Anomali ini telah{" "}
                                            {anomalis.approve === "Yes"
                                                ? "disetujui"
                                                : "ditolak"}
                                        </span>
                                        <p
                                            className={`text-sm ${anomalis.approve === "Yes" ? "text-emerald-700" : "text-red-700"}`}
                                        >
                                            Keputusan telah direkam dalam
                                            sistem.
                                        </p>
                                    </div>
                                </div>
                                {anomalis.reject_reason && (
                                    <div className="mt-4 ml-14 bg-white p-4 rounded-xl border border-red-100 shadow-sm">
                                        <span className="block text-xs font-bold text-red-500 uppercase tracking-wide mb-1">
                                            Alasan Penolakan
                                        </span>
                                        <p className="text-slate-700 font-medium">
                                            {anomalis.reject_reason}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="mb-8 p-8">
                        <div className="flex p-1.5 bg-slate-100/80 backdrop-blur-sm rounded-2xl overflow-x-auto gap-1 border border-slate-200">
                            {[
                                {
                                    id: "informasi",
                                    label: "Informasi Umum",
                                    icon: FaInfoCircle,
                                },
                                {
                                    id: "detail",
                                    label: "Detail Peralatan",
                                    icon: FaTools,
                                },
                                {
                                    id: "analisis",
                                    label: "Analisis Anomali",
                                    icon: FaChartLine,
                                },
                                {
                                    id: "lampiran",
                                    label: "Lampiran",
                                    icon: FaClipboardList,
                                },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-5 py-3 rounded-xl font-bold text-sm flex items-center transition-all duration-300 whitespace-nowrap ${
                                        activeTab === tab.id
                                            ? "bg-white text-blue-600 shadow-md shadow-slate-200/50 ring-1 ring-slate-100"
                                            : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                                    }`}
                                >
                                    <tab.icon
                                        className={`mr-2.5 ${activeTab === tab.id ? "text-blue-500" : "text-slate-400"}`}
                                    />
                                    {tab.label}
                                </button>
                            ))}
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
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="bg-white p-6 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 hover:shadow-xl transition-all duration-300 group">
                                        <div className="flex items-center mb-4">
                                            <div className="p-2.5 bg-yellow-50 text-yellow-600 rounded-xl group-hover:bg-yellow-500 group-hover:text-white transition-colors duration-300 shadow-sm ring-1 ring-yellow-100">
                                                <FaExclamationTriangle className="text-lg" />
                                            </div>
                                            <span className="ml-3 text-sm font-bold text-slate-500 uppercase tracking-wider">
                                                Penyebab Anomali
                                            </span>
                                        </div>
                                        <div className="text-slate-800 whitespace-pre-line text-lg leading-relaxed font-medium pl-1">
                                            {anomalis.penyebab}
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 hover:shadow-xl transition-all duration-300 group">
                                        <div className="flex items-center mb-4">
                                            <div className="p-2.5 bg-red-50 text-red-600 rounded-xl group-hover:bg-red-500 group-hover:text-white transition-colors duration-300 shadow-sm ring-1 ring-red-100">
                                                <FaBolt className="text-lg" />
                                            </div>
                                            <span className="ml-3 text-sm font-bold text-slate-500 uppercase tracking-wider">
                                                Akibat yang Ditimbulkan
                                            </span>
                                        </div>
                                        <div className="text-slate-800 whitespace-pre-line text-lg leading-relaxed font-medium pl-1">
                                            {anomalis.akibat}
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 hover:shadow-xl transition-all duration-300 group">
                                        <div className="flex items-center mb-4">
                                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300 shadow-sm ring-1 ring-blue-100">
                                                <FaLightbulb className="text-lg" />
                                            </div>
                                            <span className="ml-3 text-sm font-bold text-slate-500 uppercase tracking-wider">
                                                Usulan & Saran Perbaikan
                                            </span>
                                        </div>
                                        <div className="text-slate-800 whitespace-pre-line text-lg leading-relaxed font-medium pl-1">
                                            {anomalis.usul_saran || "-"}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab Lampiran */}
                            {activeTab === "lampiran" && (
                                <div>
                                    <div className="flex items-center mb-6">
                                        <div className="bg-blue-50 p-2 rounded-lg text-blue-600 mr-3">
                                            <FaClipboardList className="text-xl" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900">
                                            Lampiran Foto
                                        </h3>
                                    </div>

                                    {lampiranFoto && lampiranFoto.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                            {lampiranFoto.map((foto, idx) => (
                                                <div
                                                    key={idx}
                                                    className="relative group cursor-pointer"
                                                    onClick={() =>
                                                        setSelectedImage(
                                                            `/storage/${foto}`,
                                                        )
                                                    }
                                                >
                                                    <div className="aspect-w-1 aspect-h-1 overflow-hidden rounded-2xl shadow-sm border border-slate-200 group-hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                                                        <img
                                                            src={`/storage/${foto}`}
                                                            alt={`Lampiran Foto ${
                                                                idx + 1
                                                            }`}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                    </div>
                                                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 flex items-center justify-center transition-all duration-300 rounded-2xl">
                                                        <div className="bg-white/90 backdrop-blur-sm p-3 rounded-full opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg">
                                                            <FaSearch className="text-blue-600 text-lg" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                            <div className="bg-white p-4 rounded-full shadow-sm inline-block mb-4">
                                                <FaClipboardList className="text-4xl text-slate-300" />
                                            </div>
                                            <p className="text-slate-500 font-medium">
                                                Tidak ada lampiran foto tersedia
                                            </p>
                                        </div>
                                    )}

                                    {/* Modal untuk preview gambar */}
                                    {selectedImage && (
                                        <div
                                            className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4 transition-all duration-300"
                                            onClick={() =>
                                                setSelectedImage(null)
                                            }
                                        >
                                            <div className="relative max-w-5xl max-h-[90vh] w-full flex justify-center">
                                                <img
                                                    src={selectedImage}
                                                    alt="Preview"
                                                    className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl ring-1 ring-white/20"
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                />
                                                <button
                                                    className="absolute -top-12 right-0 text-white hover:text-red-400 transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-md"
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
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 transition-all duration-300">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden ring-1 ring-slate-900/5 transform transition-all scale-100">
                            <div className="bg-emerald-50 px-6 py-5 border-b border-emerald-100 flex items-center shrink-0">
                                <div className="bg-emerald-100 p-2.5 rounded-xl mr-4 shadow-sm ring-1 ring-emerald-200">
                                    <FaCheckCircle className="text-emerald-600 text-xl" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">
                                        Setujui Anomali
                                    </h3>
                                    <p className="text-sm text-emerald-700 font-medium">
                                        Konfirmasi persetujuan laporan
                                    </p>
                                </div>
                            </div>

                            <div className="p-6 overflow-y-auto">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Ditugaskan Kepada Bidang
                                    </label>
                                    <div className="relative">
                                        <Listbox
                                            value={assignTo}
                                            onChange={setAssignTo}
                                        >
                                            <div className="relative mt-1">
                                                <Listbox.Button className="relative w-full cursor-default rounded-xl bg-slate-50 py-3 pl-4 pr-10 text-left border border-slate-200 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:ring-opacity-50 transition-all hover:bg-white hover:border-emerald-300">
                                                    <span className="block truncate font-medium text-slate-700">
                                                        {assignTo
                                                            ? assignTo
                                                            : "Pilih Bidang..."}
                                                    </span>
                                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-5 w-5 text-slate-400"
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
                                                <Listbox.Options
                                                    anchor="bottom"
                                                    transition
                                                    className="z-[100] w-[var(--button-width)] max-h-60 overflow-auto rounded-xl bg-white py-1 text-base shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
                                                >
                                                    {availableBidang &&
                                                        availableBidang.map(
                                                            (bidang) => (
                                                                <Listbox.Option
                                                                    key={bidang}
                                                                    value={
                                                                        bidang
                                                                    }
                                                                    className={({
                                                                        active,
                                                                    }) =>
                                                                        `relative cursor-pointer select-none py-3 pl-10 pr-4 transition-colors ${
                                                                            active
                                                                                ? "bg-emerald-50 text-emerald-900"
                                                                                : "text-slate-700"
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
                                                                                        ? "font-bold"
                                                                                        : "font-medium"
                                                                                }`}
                                                                            >
                                                                                {
                                                                                    bidang
                                                                                }
                                                                            </span>
                                                                            {selected ? (
                                                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-emerald-600">
                                                                                    <FaCheckCircle className="h-5 w-5" />
                                                                                </span>
                                                                            ) : null}
                                                                        </>
                                                                    )}
                                                                </Listbox.Option>
                                                            ),
                                                        )}
                                                </Listbox.Options>
                                            </div>
                                        </Listbox>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0 rounded-b-2xl">
                                <button
                                    type="button"
                                    onClick={() => setShowApproveModal(false)}
                                    className="px-5 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all font-bold text-sm shadow-sm"
                                    disabled={isSubmitting}
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={handleApprove}
                                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all flex items-center shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:-translate-y-0.5 font-bold text-sm disabled:opacity-70 disabled:cursor-not-allowed"
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
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 transition-all duration-300">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden ring-1 ring-slate-900/5 transform transition-all scale-100">
                            <div className="bg-red-50 px-6 py-5 border-b border-red-100 flex items-center shrink-0">
                                <div className="bg-red-100 p-2.5 rounded-xl mr-4 shadow-sm ring-1 ring-red-200">
                                    <FaTimesCircle className="text-red-600 text-xl" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">
                                        Tolak Anomali
                                    </h3>
                                    <p className="text-sm text-red-700 font-medium">
                                        Konfirmasi penolakan laporan
                                    </p>
                                </div>
                            </div>

                            <div className="p-6 overflow-y-auto">
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Alasan Penolakan
                                </label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) =>
                                        setRejectReason(e.target.value)
                                    }
                                    className="w-full bg-slate-50 border-slate-200 rounded-xl shadow-sm focus:border-red-500 focus:ring focus:ring-red-200 focus:ring-opacity-50 min-h-[120px] p-4 font-medium text-slate-700 placeholder:text-slate-400"
                                    placeholder="Jelaskan alasan penolakan secara rinci..."
                                    required
                                ></textarea>
                            </div>

                            <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0 rounded-b-2xl">
                                <button
                                    type="button"
                                    onClick={() => setShowRejectModal(false)}
                                    className="px-5 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all font-bold text-sm shadow-sm"
                                    disabled={isSubmitting}
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={handleReject}
                                    className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all flex items-center shadow-lg shadow-red-500/30 hover:shadow-red-500/40 hover:-translate-y-0.5 font-bold text-sm disabled:opacity-70 disabled:cursor-not-allowed"
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
