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
} from "react-icons/fa";
import React from "react";
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

// Komponen untuk menampilkan status approval
const ApprovalStatus = ({ approve, rejectReason }) => {
    if (approve === null) {
        return (
            <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
                    <span className="text-gray-600 font-medium">
                        Menunggu Direview
                    </span>
                </div>
            </div>
        );
    }

    if (approve === "Yes") {
        return (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200 shadow-sm">
                <div className="flex items-center space-x-2">
                    <div className="flex-shrink-0">
                        <FaCheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                        <p className="font-semibold text-green-800 uppercase">
                            Disetujui
                        </p>
                        <p className="text-sm text-green-600">
                            Anomali telah disetujui dan diverifikasi
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 bg-red-50 rounded-lg border border-red-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-3">
                <div className="flex-shrink-0">
                    <FaTimesCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                    <p className="font-semibold text-red-800 uppercase">
                        Ditolak
                    </p>
                    <p className="text-sm text-red-600">
                        Anomali tidak disetujui
                    </p>
                </div>
            </div>
            {rejectReason && (
                <div className="mt-3 p-3 bg-white rounded border border-red-100">
                    <p className="text-sm text-gray-700">
                        <span className="font-medium text-red-600">
                            Alasan Penolakan:{" "}
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
    const lampiranFoto = anomalis.lampiran_foto
        ? typeof anomalis.lampiran_foto === "string"
            ? JSON.parse(anomalis.lampiran_foto)
            : anomalis.lampiran_foto
        : [];

    return (
        <>
            <Head title={`Detail Anomali - ${anomalis.judul || ""}`} />
            <DashboardLayout>
                <div className="container mx-auto px-4 py-6">
                    {/* Header */}
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between">
                            <div>
                                <div className="flex items-center">
                                    <div className="bg-blue-100 p-3 rounded-lg mr-4">
                                        <FaFileAlt className="text-blue-600 text-2xl" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-800">
                                            {anomalis.judul}
                                        </h1>
                                        <div className="flex items-center mt-2 text-sm text-gray-600">
                                            <FaCalendarAlt className="mr-1" />
                                            <span className="mr-4">
                                                {formatDate(
                                                    anomalis.tanggal_kejadian
                                                )}
                                            </span>
                                            <FaUser className="mr-1" />
                                            <span>
                                                {anomalis.user?.name || "-"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 md:mt-0 flex flex-col md:flex-row items-start md:items-center gap-3">
                                <StatusBadge status={anomalis.status} />
                                <a
                                    href={`/dashboard/anomali/${anomalis.slug}/pdf`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors shadow-sm"
                                >
                                    <FaFileDownload className="mr-2" />
                                    Download PDF
                                </a>
                            </div>
                        </div>
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
                            <button
                                onClick={() => setActiveTab("approval")}
                                className={`px-6 py-3 font-medium text-sm flex items-center ${
                                    activeTab === "approval"
                                        ? "text-blue-600 border-b-2 border-blue-600"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                <FaCalendarCheck className="mr-2" />
                                Status Approval
                            </button>
                            <button
                                onClick={() => setActiveTab("timeline")}
                                className={`px-6 py-3 font-medium text-sm flex items-center ${
                                    activeTab === "timeline"
                                        ? "text-blue-600 border-b-2 border-blue-600"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                <FaHistory className="mr-2" />
                                Timeline
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

                            {/* Tab Status Approval */}
                            {activeTab === "approval" && (
                                <div className="space-y-6">
                                    <div className="">
                                        <div className="flex items-center mb-6">
                                            <div className="bg-blue-100 p-3 rounded-full">
                                                <FaCalendarCheck className="text-blue-600 text-xl" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-800 ml-3">
                                                Status Persetujuan
                                            </h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="col-span-2">
                                                <div className="mb-2 text-sm font-medium text-gray-600">
                                                    Status Persetujuan
                                                </div>
                                                <ApprovalStatus
                                                    approve={anomalis.approve}
                                                    rejectReason={
                                                        anomalis.reject_reason
                                                    }
                                                />
                                            </div>

                                            {anomalis.approved_by && (
                                                <div className="bg-white p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
                                                    <div className="flex items-center mb-2">
                                                        <FaUser className="text-blue-500 mr-2" />
                                                        <span className="text-sm font-medium text-gray-600">
                                                            {anomalis.status ===
                                                            "Rejected"
                                                                ? "Ditolak Oleh"
                                                                : "Disetujui Oleh"}
                                                        </span>
                                                    </div>
                                                    <div className="font-semibold text-gray-800">
                                                        {anomalis.approved_by
                                                            ?.name || "-"}
                                                    </div>
                                                </div>
                                            )}

                                            {anomalis.tanggal_approve && (
                                                <div className="bg-white p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
                                                    <div className="flex items-center mb-2">
                                                        <FaCalendarAlt className="text-blue-500 mr-2" />
                                                        <span className="text-sm font-medium text-gray-600">
                                                            Tanggal Persetujuan
                                                        </span>
                                                    </div>
                                                    <div className="font-semibold text-gray-800">
                                                        {formatDate(
                                                            anomalis.tanggal_approve
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {anomalis.assigned_user && (
                                                <div className="bg-white p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
                                                    <div className="flex items-center mb-2">
                                                        <FaUserClock className="text-blue-500 mr-2" />
                                                        <span className="text-sm font-medium text-gray-600">
                                                            Ditugaskan Kepada
                                                        </span>
                                                    </div>
                                                    <div className="font-semibold text-gray-800">
                                                        {anomalis.assigned_user
                                                            ?.name || "-"}
                                                    </div>
                                                </div>
                                            )}

                                            {anomalis.tanggal_mulai && (
                                                <div className="bg-white p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
                                                    <div className="flex items-center mb-2">
                                                        <FaClock className="text-blue-500 mr-2" />
                                                        <span className="text-sm font-medium text-gray-600">
                                                            Tanggal Mulai
                                                        </span>
                                                    </div>
                                                    <div className="font-semibold text-gray-800">
                                                        {formatDate(
                                                            anomalis.tanggal_mulai
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {anomalis.tanggal_selesai && (
                                                <div className="bg-white p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
                                                    <div className="flex items-center mb-2">
                                                        <FaCheckCircle className="text-blue-500 mr-2" />
                                                        <span className="text-sm font-medium text-gray-600">
                                                            Tanggal Selesai
                                                        </span>
                                                    </div>
                                                    <div className="font-semibold text-gray-800">
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
                                <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-8">
                                    {/* Header Section */}
                                    <div className="mb-8">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg">
                                                    <FaHistory className="text-white text-xl" />
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-bold text-gray-900">
                                                        Timeline Aktivitas
                                                    </h3>
                                                    <p className="text-gray-600 mt-1">
                                                        Riwayat perubahan dan aktivitas anomali
                                                    </p>
                                                </div>
                                            </div>
                                            {anomalis.timelines && anomalis.timelines.length > 0 && (
                                                <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
                                                    <span className="text-sm font-medium text-gray-600">
                                                        {anomalis.timelines.length} Aktivitas
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {anomalis.timelines && anomalis.timelines.length > 0 ? (
                                        <div className="relative">
                                            {/* Modern Timeline Line */}
                                            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-blue-200 via-gray-200 to-transparent"></div>

                                            <div className="space-y-8">
                                                {anomalis.timelines.map((timeline, index) => {
                                                    // Enhanced icon and color mapping
                                                    let icon = FaInfoCircle;
                                                    let iconBg = "from-blue-500 to-blue-600";
                                                    let accentColor = "border-blue-200";
                                                    let statusBadge = "bg-blue-50 text-blue-700";

                                                    switch (timeline.event_type) {
                                                        case "created":
                                                            icon = FaFileAlt;
                                                            iconBg = "from-emerald-500 to-green-600";
                                                            accentColor = "border-emerald-200";
                                                            statusBadge = "bg-emerald-50 text-emerald-700";
                                                            break;
                                                        case "status_changed":
                                                            icon = FaExclamationCircle;
                                                            iconBg = "from-amber-500 to-orange-600";
                                                            accentColor = "border-amber-200";
                                                            statusBadge = "bg-amber-50 text-amber-700";
                                                            break;
                                                        case "assigned":
                                                            icon = FaUserClock;
                                                            iconBg = "from-purple-500 to-violet-600";
                                                            accentColor = "border-purple-200";
                                                            statusBadge = "bg-purple-50 text-purple-700";
                                                            break;
                                                        case "approved":
                                                            icon = FaCheckCircle;
                                                            iconBg = "from-emerald-500 to-green-600";
                                                            accentColor = "border-emerald-200";
                                                            statusBadge = "bg-emerald-50 text-emerald-700";
                                                            break;
                                                        case "rejected":
                                                            icon = FaTimesCircle;
                                                            iconBg = "from-red-500 to-rose-600";
                                                            accentColor = "border-red-200";
                                                            statusBadge = "bg-red-50 text-red-700";
                                                            break;
                                                        case "completed":
                                                            icon = FaCheckCircle;
                                                            iconBg = "from-emerald-600 to-green-700";
                                                            accentColor = "border-emerald-200";
                                                            statusBadge = "bg-emerald-50 text-emerald-700";
                                                            break;
                                                        case "comment_added":
                                                            icon = FaClipboardList;
                                                            iconBg = "from-blue-500 to-indigo-600";
                                                            accentColor = "border-blue-200";
                                                            statusBadge = "bg-blue-50 text-blue-700";
                                                            break;
                                                    }

                                                    const Icon = icon;
                                                    const isLast = index === anomalis.timelines.length - 1;

                                                    return (
                                                        <div key={timeline.id} className="relative group">
                                                            {/* Timeline Icon */}
                                                            <div className={`relative z-10 flex items-center justify-center w-12 h-12 bg-gradient-to-r ${iconBg} rounded-xl shadow-lg border-4 border-white group-hover:scale-110 transition-transform duration-200`}>
                                                                <Icon className="text-white text-lg" />
                                                            </div>

                                                            {/* Timeline Card */}
                                                            <div className="ml-8 -mt-12 pt-12">
                                                                <div className={`bg-white rounded-xl shadow-sm border-l-4 ${accentColor} hover:shadow-md transition-all duration-200 group-hover:translate-x-1`}>
                                                                    <div className="p-6">
                                                                        {/* Header */}
                                                                        <div className="flex items-start justify-between mb-4">
                                                                            <div className="flex-1">
                                                                                <div className="flex items-center space-x-3 mb-2">
                                                                                    <h4 className="text-lg font-semibold text-gray-900">
                                                                                        {timeline.description}
                                                                                    </h4>
                                                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge}`}>
                                                                                        {timeline.event_type.replace('_', ' ').toUpperCase()}
                                                                                    </span>
                                                                                </div>
                                                                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                                                    <div className="flex items-center space-x-1">
                                                                                        <FaUser className="text-xs" />
                                                                                        <span className="font-medium">{timeline.user?.name || "System"}</span>
                                                                                    </div>
                                                                                    <div className="flex items-center space-x-1">
                                                                                        <FaClock className="text-xs" />
                                                                                        <span>{format(new Date(timeline.created_at), "dd MMM yyyy, HH:mm", { locale: id })}</span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Changes Section */}
                                                                        {timeline.old_value && timeline.new_value && (
                                                                            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                                                                <div className="text-sm">
                                                                                    <span className="font-medium text-gray-700 block mb-2">Perubahan Data:</span>
                                                                                    <div className="flex items-center space-x-3">
                                                                                        <div className="flex-1">
                                                                                            <span className="text-xs text-gray-500 block mb-1">Sebelum</span>
                                                                                            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm font-medium">
                                                                                                {timeline.old_value}
                                                                                            </span>
                                                                                        </div>
                                                                                        <div className="text-gray-400">
                                                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                                                            </svg>
                                                                                        </div>
                                                                                        <div className="flex-1">
                                                                                            <span className="text-xs text-gray-500 block mb-1">Sesudah</span>
                                                                                            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-md text-sm font-medium">
                                                                                                {timeline.new_value}
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {/* Comment Section */}
                                                                        {timeline.comment && (
                                                                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                                                                <div className="flex items-start space-x-2">
                                                                                    <FaClipboardList className="text-blue-600 mt-0.5 flex-shrink-0" />
                                                                                    <div>
                                                                                        <span className="font-medium text-blue-900 block mb-1">Catatan:</span>
                                                                                        <p className="text-blue-800 text-sm leading-relaxed whitespace-pre-line">
                                                                                            {timeline.comment}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-16">
                                            <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 max-w-md mx-auto">
                                                <div className="bg-gradient-to-r from-gray-100 to-gray-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                                    <FaHistory className="text-3xl text-gray-400" />
                                                </div>
                                                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                                    Belum Ada Aktivitas
                                                </h3>
                                                <p className="text-gray-600 leading-relaxed">
                                                    Timeline akan menampilkan riwayat aktivitas dan perubahan pada anomali ini.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}
