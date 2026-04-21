import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link } from "@inertiajs/react";
import { useState } from "react";
import {
    FaFileAlt,
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
    FaMapMarkedAlt,
    FaClipboardList,
    FaExclamationCircle,
    FaFileDownload,
    FaChartLine,
    FaCheckCircle,
    FaTimesCircle,
    FaUserClock,
    FaCalendarCheck,
    FaSearch,
    FaUserCheck,
} from "react-icons/fa";
import React from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
    formatDate,
    formatDateDMY,
    formatMaybeDateRange,
} from "@/Components/Utils/formatDate";
import { formatRupiah } from "@/utils/formatter";
import PdfDownloadButton from "@/Components/Dashboard/Anomali/PdfDownloadButton";
import { GiElectric } from "react-icons/gi";

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
function StatusBadge({ status }) {
    let styles = "bg-slate-50 text-slate-700 ring-slate-600/20";
    let icon = FaInfoCircle;

    if (status === "New") {
        styles = "bg-blue-50 text-blue-700 ring-blue-700/10";
        icon = FaInfoCircle;
    } else if (status === "In Progress") {
        styles = "bg-amber-50 text-amber-700 ring-amber-600/20";
        icon = FaTools;
    } else if (status === "Open") {
        styles = "bg-sky-50 text-sky-700 ring-sky-600/20";
        icon = FaExclamationCircle;
    } else if (status === "Pending") {
        styles = "bg-orange-50 text-orange-800 ring-orange-600/20";
        icon = FaUserClock;
    } else if (status === "Close") {
        styles = "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
        icon = FaCheckCircle;
    } else if (status === "Rejected") {
        styles = "bg-rose-50 text-rose-700 ring-rose-600/20";
        icon = FaTimesCircle;
    }

    const Icon = icon;

    return (
        <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ring-1 ring-inset shadow-sm ${styles}`}
        >
            <Icon className="mr-1.5" />
            {status}
        </span>
    );
}

function TipeBadge({ tipe }) {
    let styles = "bg-slate-50 text-slate-700 ring-slate-600/20";
    if (tipe === "Major") styles = "bg-rose-50 text-rose-700 ring-rose-600/20";
    else if (tipe === "Minor")
        styles = "bg-emerald-50 text-emerald-700 ring-emerald-600/20";

    return (
        <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ring-1 ring-inset shadow-sm ${styles}`}
        >
            {tipe}
        </span>
    );
}

function UltgBadge({ ultg }) {
    let styles = "bg-slate-50 text-slate-700 ring-slate-600/20";
    if (ultg === "ULTG Karawang")
        styles = "bg-indigo-50 text-indigo-700 ring-indigo-600/20";
    else if (ultg === "ULTG Purwakarta")
        styles = "bg-violet-50 text-violet-700 ring-violet-600/20";

    return (
        <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ring-1 ring-inset shadow-sm ${styles}`}
        >
            {ultg}
        </span>
    );
}

// Komponen untuk menampilkan status approval
const ApprovalStatus = ({ approve, rejectReason }) => {
    if (approve === null) {
        return (
            <div className="flex items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-200 shadow-inner">
                <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-500"></div>
                    <span className="text-slate-600 font-medium">
                        Menunggu Direview
                    </span>
                </div>
            </div>
        );
    }

    if (approve === "Yes") {
        return (
            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-sm">
                <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 bg-green-100 p-2 rounded-full">
                        <FaCheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                        <p className="font-bold text-green-800 uppercase tracking-wide text-sm">
                            Disetujui
                        </p>
                        <p className="text-sm text-green-700 mt-1">
                            Anomali telah disetujui dan diverifikasi
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-200 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
                <div className="flex-shrink-0 bg-red-100 p-2 rounded-full">
                    <FaTimesCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                    <p className="font-bold text-red-800 uppercase tracking-wide text-sm">
                        Ditolak
                    </p>
                    <p className="text-sm text-red-700 mt-1">
                        Anomali tidak disetujui
                    </p>
                </div>
            </div>
            {rejectReason && (
                <div className="mt-3 p-4 bg-white rounded-xl border border-red-100 shadow-sm">
                    <p className="text-sm text-slate-700">
                        <span className="font-semibold text-red-600 block mb-1">
                            Alasan Penolakan:
                        </span>
                        {rejectReason}
                    </p>
                </div>
            )}
        </div>
    );
};

export default function Detail({ anomalis }) {
    const [activeTab, setActiveTab] = useState("informasi");
    const [selectedImage, setSelectedImage] = useState(null);

    if (!anomalis) {
        return (
            <DashboardLayout>
                <div className="p-8 text-center text-slate-500 bg-white rounded-xl shadow-sm border border-slate-200">
                    <FaExclamationCircle className="mx-auto text-4xl text-slate-400 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
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

    // Format tanggal
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        try {
            return format(new Date(dateString), "eeee, d MMMM yyyy", {
                locale: id,
            });
        } catch (e) {
            return dateString;
        }
    };

    // Parse lampiran foto
    const lampiranFoto = anomalis.lampiran_foto
        ? typeof anomalis.lampiran_foto === "string"
            ? JSON.parse(anomalis.lampiran_foto)
            : anomalis.lampiran_foto
        : [];

    return (
        <>
            <Head title={`Detail Anomali - ${anomalis.judul || ""}`} />
            <DashboardLayout>
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="relative bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-100 p-8 mb-8 overflow-hidden">
                        {/* Decorative Background Elements */}
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-blue-50 blur-3xl opacity-60 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-indigo-50 blur-3xl opacity-60 pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div className="flex items-start gap-5">
                                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl shadow-lg shadow-blue-500/30 text-white shrink-0">
                                    <FaFileAlt className="text-2xl" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider border border-blue-100">
                                            Detail Anomali
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
                                                anomalis.tanggal_kejadian
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

                    {/* Tabs */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 mb-8 overflow-hidden">
                        <div className="p-8">
                            <div className="flex p-1.5 bg-slate-100/80 backdrop-blur-sm rounded-2xl overflow-x-auto gap-1 border border-slate-200 mb-8">
                                {[
                                    {
                                        id: "informasi",
                                        icon: FaInfoCircle,
                                        label: "Informasi Umum",
                                    },
                                    {
                                        id: "detail",
                                        icon: FaTools,
                                        label: "Detail Peralatan",
                                    },
                                    {
                                        id: "analisis",
                                        icon: FaChartLine,
                                        label: "Analisis Anomali",
                                    },
                                    {
                                        id: "lampiran",
                                        icon: FaClipboardList,
                                        label: "Lampiran",
                                    },
                                    {
                                        id: "approval",
                                        icon: FaCalendarCheck,
                                        label: "Status Approval",
                                    },
                                    {
                                        id: "timeline",
                                        icon: FaHistory,
                                        label: "Timeline",
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
                                            className={`mr-2.5 ${
                                                activeTab === tab.id
                                                    ? "text-blue-500"
                                                    : "text-slate-400"
                                            }`}
                                        />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <div className="min-h-[400px]">
                                {/* Tab Informasi Umum */}
                                {activeTab === "informasi" && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in-up">
                                        <DataItem
                                            icon={FaBuilding}
                                            label="ULTG"
                                            value={
                                                <UltgBadge
                                                    ultg={anomalis.ultg}
                                                />
                                            }
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
                                            value={
                                                <TipeBadge
                                                    tipe={anomalis.tipe}
                                                />
                                            }
                                        />
                                        <DataItem
                                            icon={FaList}
                                            label="Kategori"
                                            value={anomalis.kategori?.name}
                                        />
                                        <DataItem
                                            icon={GiElectric}
                                            label="Bay"
                                            value={anomalis.bay}
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in-up">
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
                                                    ? formatRupiah(
                                                          anomalis.harga
                                                      )
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
                                    <div className="grid grid-cols-1 gap-6 animate-fade-in-up">
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
                                                {anomalis.penyebab ||
                                                    "Tidak ada data penyebab."}
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
                                                {anomalis.akibat ||
                                                    "Tidak ada data akibat."}
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
                                    <div className="animate-fade-in-up">
                                        <div className="flex items-center mb-6">
                                            <div className="bg-blue-50 p-2 rounded-lg text-blue-600 mr-3">
                                                <FaClipboardList className="text-xl" />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900">
                                                Lampiran Foto
                                            </h3>
                                        </div>

                                        {lampiranFoto &&
                                        lampiranFoto.length > 0 ? (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                                {lampiranFoto.map(
                                                    (foto, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="relative group cursor-pointer"
                                                            onClick={() =>
                                                                setSelectedImage(
                                                                    `/storage/${foto}`
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
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 rounded-2xl">
                                                                <FaSearch className="text-white text-2xl transform scale-50 group-hover:scale-100 transition-all duration-300" />
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                                                <div className="bg-white p-4 rounded-full inline-block shadow-sm mb-4">
                                                    <FaClipboardList className="text-4xl text-slate-300" />
                                                </div>
                                                <p className="text-slate-500 font-medium">
                                                    Tidak ada lampiran foto
                                                    tersedia
                                                </p>
                                            </div>
                                        )}

                                        {/* Modal untuk preview gambar */}
                                        {selectedImage && (
                                            <div
                                                className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                                                onClick={() =>
                                                    setSelectedImage(null)
                                                }
                                            >
                                                <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center">
                                                    <img
                                                        src={selectedImage}
                                                        alt="Preview"
                                                        className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                                                        onClick={(e) =>
                                                            e.stopPropagation()
                                                        }
                                                    />
                                                    <button
                                                        className="absolute -top-12 right-0 md:-right-12 text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-md"
                                                        onClick={() =>
                                                            setSelectedImage(
                                                                null
                                                            )
                                                        }
                                                    >
                                                        <FaTimesCircle className="w-8 h-8" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Tab Status Approval */}
                                {activeTab === "approval" && (
                                    <div className="space-y-8 animate-fade-in-up">
                                        <div className="">
                                            <div className="flex items-center mb-8">
                                                <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600 mr-3 ring-1 ring-blue-100">
                                                    <FaCalendarCheck className="text-2xl" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-slate-800">
                                                        Status Persetujuan
                                                    </h3>
                                                    <p className="text-slate-500 text-sm mt-1">
                                                        Informasi detail
                                                        mengenai status
                                                        persetujuan anomali
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="col-span-2">
                                                    <div className="mb-3 text-sm font-bold text-slate-700 uppercase tracking-wider">
                                                        Status Saat Ini
                                                    </div>
                                                    <ApprovalStatus
                                                        approve={
                                                            anomalis.approve
                                                        }
                                                        rejectReason={
                                                            anomalis.reject_reason
                                                        }
                                                    />
                                                </div>

                                                {anomalis.approved_by && (
                                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 group">
                                                        <div className="flex items-center mb-4">
                                                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300 shadow-sm ring-1 ring-blue-100 mr-3">
                                                                <FaUser className="text-lg" />
                                                            </div>
                                                            <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                                                                {anomalis.status ===
                                                                "Rejected"
                                                                    ? "Ditolak Oleh"
                                                                    : "Disetujui Oleh"}
                                                            </span>
                                                        </div>
                                                        <div className="font-bold text-slate-800 text-lg pl-1">
                                                            {anomalis
                                                                .approved_by
                                                                ?.name || "-"}
                                                        </div>
                                                    </div>
                                                )}

                                                {anomalis.tanggal_approve && (
                                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 group">
                                                        <div className="flex items-center mb-4">
                                                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300 shadow-sm ring-1 ring-blue-100 mr-3">
                                                                <FaCalendarAlt className="text-lg" />
                                                            </div>
                                                            <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                                                                Tanggal
                                                                Persetujuan
                                                            </span>
                                                        </div>
                                                        <div className="font-bold text-slate-800 text-lg pl-1">
                                                            {formatDate(
                                                                anomalis.tanggal_approve
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {anomalis.assigned_user && (
                                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 group">
                                                        <div className="flex items-center mb-4">
                                                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300 shadow-sm ring-1 ring-blue-100 mr-3">
                                                                <FaUserClock className="text-lg" />
                                                            </div>
                                                            <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                                                                Ditugaskan
                                                                Kepada
                                                            </span>
                                                        </div>
                                                        <div className="font-bold text-slate-800 text-lg pl-1">
                                                            {anomalis
                                                                .assigned_user
                                                                ?.name || "-"}
                                                        </div>
                                                    </div>
                                                )}

                                                {anomalis.tanggal_mulai && (
                                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 group">
                                                        <div className="flex items-center mb-4">
                                                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300 shadow-sm ring-1 ring-blue-100 mr-3">
                                                                <FaClock className="text-lg" />
                                                            </div>
                                                            <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                                                                Tanggal Mulai
                                                            </span>
                                                        </div>
                                                        <div className="font-bold text-slate-800 text-lg pl-1">
                                                            {formatDate(
                                                                anomalis.tanggal_mulai
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {anomalis.tanggal_selesai && (
                                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 group">
                                                        <div className="flex items-center mb-4">
                                                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300 shadow-sm ring-1 ring-blue-100 mr-3">
                                                                <FaCheckCircle className="text-lg" />
                                                            </div>
                                                            <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                                                                Tanggal Selesai
                                                            </span>
                                                        </div>
                                                        <div className="font-bold text-slate-800 text-lg pl-1">
                                                            {formatDate(
                                                                anomalis.tanggal_selesai
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Tab Timeline */}
                                {activeTab === "timeline" && (
                                    <div className="space-y-6 animate-fade-in-up">
                                        <div className="flex items-center mb-8">
                                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl mr-3 ring-1 ring-blue-100">
                                                <FaHistory className="text-2xl" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-800">
                                                    Riwayat Aktivitas
                                                </h3>
                                                <p className="text-slate-500 text-sm mt-1">
                                                    Jejak audit perubahan status
                                                    anomali
                                                </p>
                                            </div>
                                        </div>

                                        {anomalis.timelines &&
                                        anomalis.timelines.length > 0 ? (
                                            <div className="space-y-0 relative pl-4">
                                                <div className="absolute left-[39px] top-6 bottom-6 w-0.5 bg-slate-200"></div>
                                                {anomalis.timelines.map(
                                                    (timeline, index) => (
                                                        <div
                                                            key={timeline.id}
                                                            className="relative pl-12 py-4 group"
                                                        >
                                                            {/* Timeline Item */}
                                                            <div className="flex items-start">
                                                                {/* Timeline Icon */}
                                                                <div className="absolute left-0 top-4">
                                                                    <div
                                                                        className={`w-14 h-14 rounded-full flex items-center justify-center border-4 border-white shadow-md z-10 relative transition-transform duration-300 group-hover:scale-110 ${
                                                                            timeline.event_type ===
                                                                            "created"
                                                                                ? "bg-green-100 text-green-600"
                                                                                : timeline.event_type ===
                                                                                  "status_changed"
                                                                                ? "bg-blue-100 text-blue-600"
                                                                                : timeline.event_type ===
                                                                                  "assigned"
                                                                                ? "bg-yellow-100 text-yellow-600"
                                                                                : timeline.event_type ===
                                                                                  "approved"
                                                                                ? "bg-emerald-100 text-emerald-600"
                                                                                : timeline.event_type ===
                                                                                  "rejected"
                                                                                ? "bg-red-100 text-red-600"
                                                                                : timeline.event_type ===
                                                                                  "completed"
                                                                                ? "bg-purple-100 text-purple-600"
                                                                                : timeline.event_type ===
                                                                                  "scheduled"
                                                                                ? "bg-indigo-100 text-indigo-600"
                                                                                : "bg-slate-100 text-slate-600"
                                                                        }`}
                                                                    >
                                                                        {timeline.event_type ===
                                                                            "created" && (
                                                                            <FaCheckCircle className="text-xl" />
                                                                        )}
                                                                        {timeline.event_type ===
                                                                            "status_changed" && (
                                                                            <FaExclamationCircle className="text-xl" />
                                                                        )}
                                                                        {timeline.event_type ===
                                                                            "assigned" && (
                                                                            <FaUserCheck className="text-xl" />
                                                                        )}
                                                                        {timeline.event_type ===
                                                                            "approved" && (
                                                                            <FaCheckCircle className="text-xl" />
                                                                        )}
                                                                        {timeline.event_type ===
                                                                            "rejected" && (
                                                                            <FaTimesCircle />
                                                                        )}
                                                                        {timeline.event_type ===
                                                                            "completed" && (
                                                                            <FaCheckCircle />
                                                                        )}
                                                                        {timeline.event_type ===
                                                                            "scheduled" && (
                                                                            <FaCalendarAlt />
                                                                        )}
                                                                        {![
                                                                            "created",
                                                                            "status_changed",
                                                                            "assigned",
                                                                            "approved",
                                                                            "rejected",
                                                                            "completed",
                                                                            "scheduled",
                                                                        ].includes(
                                                                            timeline.event_type
                                                                        ) && (
                                                                            <FaInfoCircle />
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Timeline Content */}
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                                                                        <div className="flex items-center justify-between mb-2">
                                                                            <h4 className="text-sm font-semibold text-slate-900">
                                                                                {
                                                                                    timeline.description
                                                                                }
                                                                            </h4>
                                                                            <span className="text-xs text-slate-500">
                                                                                {formatDate(
                                                                                    timeline.created_at
                                                                                )}
                                                                            </span>
                                                                        </div>

                                                                        {timeline.old_value &&
                                                                            timeline.new_value && (
                                                                                <div className="text-sm text-slate-600 mb-2">
                                                                                    <span className="font-medium">
                                                                                        Dari:
                                                                                    </span>{" "}
                                                                                    <span
                                                                                        title={
                                                                                            timeline.old_value ||
                                                                                            ""
                                                                                        }
                                                                                    >
                                                                                        {formatMaybeDateRange(
                                                                                            timeline.old_value
                                                                                        )}
                                                                                    </span>
                                                                                    <span className="mx-2">
                                                                                        →
                                                                                    </span>
                                                                                    <span className="font-medium">
                                                                                        Ke:
                                                                                    </span>{" "}
                                                                                    <span
                                                                                        title={
                                                                                            timeline.new_value ||
                                                                                            ""
                                                                                        }
                                                                                    >
                                                                                        {formatMaybeDateRange(
                                                                                            timeline.new_value
                                                                                        )}
                                                                                    </span>
                                                                                </div>
                                                                            )}

                                                                        {timeline.comment && (
                                                                            <div className="text-sm text-slate-600 mb-2">
                                                                                <span className="font-medium">
                                                                                    Keterangan
                                                                                    :
                                                                                </span>{" "}
                                                                                {
                                                                                    timeline.comment
                                                                                }
                                                                            </div>
                                                                        )}

                                                                        <div className="flex items-center text-xs text-slate-500">
                                                                            <FaUser className="mr-1" />
                                                                            <span>
                                                                                {timeline
                                                                                    .user
                                                                                    ?.name ||
                                                                                    "Sistem"}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-slate-500">
                                                <FaHistory className="mx-auto text-4xl text-slate-300 mb-4" />
                                                <p>
                                                    Belum ada riwayat aktivitas
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}
