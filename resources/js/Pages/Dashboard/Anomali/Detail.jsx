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
                                <div className="space-y-4">
                                    <div className="flex items-center mb-6">
                                        <FaHistory className="text-blue-600 text-xl mr-3" />
                                        <h3 className="text-lg font-semibold text-gray-800">
                                            Riwayat Aktivitas
                                        </h3>
                                    </div>

                                    {anomalis.timelines &&
                                    anomalis.timelines.length > 0 ? (
                                        <div className="space-y-4">
                                            {anomalis.timelines.map(
                                                (timeline, index) => (
                                                    <div
                                                        key={timeline.id}
                                                        className="relative"
                                                    >
                                                        {/* Timeline Line */}
                                                        {index !==
                                                            anomalis.timelines
                                                                .length -
                                                                1 && (
                                                            <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                                                        )}

                                                        {/* Timeline Item */}
                                                        <div className="flex items-start space-x-4">
                                                            {/* Timeline Icon */}
                                                            <div className="flex-shrink-0">
                                                                <div
                                                                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
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
                                                                            ? "bg-green-100 text-green-600"
                                                                            : timeline.event_type ===
                                                                              "rejected"
                                                                            ? "bg-red-100 text-red-600"
                                                                            : timeline.event_type ===
                                                                              "completed"
                                                                            ? "bg-purple-100 text-purple-600"
                                                                            : timeline.event_type ===
                                                                              "scheduled"
                                                                            ? "bg-indigo-100 text-indigo-600"
                                                                            : "bg-gray-100 text-gray-600"
                                                                    }`}
                                                                >
                                                                    {timeline.event_type ===
                                                                        "created" && (
                                                                        <FaCheckCircle />
                                                                    )}
                                                                    {timeline.event_type ===
                                                                        "status_changed" && (
                                                                        <FaExclamationCircle />
                                                                    )}
                                                                    {timeline.event_type ===
                                                                        "assigned" && (
                                                                        <FaUserCheck />
                                                                    )}
                                                                    {timeline.event_type ===
                                                                        "approved" && (
                                                                        <FaCheckCircle />
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
                                                                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <h4 className="text-sm font-semibold text-gray-900">
                                                                            {
                                                                                timeline.description
                                                                            }
                                                                        </h4>
                                                                        <span className="text-xs text-gray-500">
                                                                            {formatDate(
                                                                                timeline.created_at
                                                                            )}
                                                                        </span>
                                                                    </div>

                                                                    {timeline.old_value &&
                                                                        timeline.new_value && (
                                                                            <div className="text-sm text-gray-600 mb-2">
                                                                                <span className="font-medium">
                                                                                    Dari:
                                                                                </span>{" "}
                                                                                {
                                                                                    timeline.old_value
                                                                                }
                                                                                <span className="mx-2">
                                                                                    →
                                                                                </span>
                                                                                <span className="font-medium">
                                                                                    Ke:
                                                                                </span>{" "}
                                                                                {formatDate(
                                                                                    timeline.new_value
                                                                                )}
                                                                            </div>
                                                                        )}

                                                                    {timeline.comment && (
                                                                        <div className="text-sm text-gray-600 mb-2">
                                                                            <span className="font-medium">
                                                                                Keterangan
                                                                                :
                                                                            </span>{" "}
                                                                            {
                                                                                timeline.comment
                                                                            }
                                                                        </div>
                                                                    )}

                                                                    <div className="flex items-center text-xs text-gray-500">
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
                                        <div className="text-center py-8 text-gray-500">
                                            <FaHistory className="mx-auto text-4xl text-gray-300 mb-4" />
                                            <p>Belum ada riwayat aktivitas</p>
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
