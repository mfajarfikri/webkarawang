import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useState, useEffect, forwardRef } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import axios from "axios";
import { SnackbarProvider, useSnackbar } from "notistack";
import { Listbox, Transition } from "@headlessui/react";
import {
    FaCalendarAlt,
    FaBuilding,
    FaList,
    FaThLarge,
    FaFileAlt,
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
    FaCalendarCheck,
    FaSave,
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
            <Icon className="mr-1 animate-pulse" />
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
function ScheduleContent({ anomalis, users }) {
    const { csrf_token } = usePage().props;
    const { enqueueSnackbar } = useSnackbar();
    const [activeTab, setActiveTab] = useState("informasi");
    const [selectedImage, setSelectedImage] = useState(null);
    const [dateRange, setDateRange] = useState({
        from: undefined,
        to: undefined,
    });
    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    // Handle schedule work
    const handleScheduleWork = () => {
        if (!dateRange.from || !dateRange.to) {
            enqueueSnackbar("Rentang tanggal pekerjaan harus dipilih", {
                variant: "error",
                content: (key, message) => (
                    <StyledSnackbar
                        id={key}
                        message={message}
                        variant="error"
                    />
                ),
            });
            return;
        }

        setIsSubmitting(true);

        const data = {
            tanggal_mulai: dateRange.from.toISOString().split("T")[0],
            tanggal_selesai: dateRange.to.toISOString().split("T")[0],
        };

        axios
            .post(`/dashboard/anomali/${anomalis.slug}/schedule`, data)
            .then((response) => {
                setIsSubmitting(false);

                // Show success notification
                enqueueSnackbar("Jadwal pekerjaan berhasil disimpan", {
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
                console.error("Error scheduling work:", error);
                setIsSubmitting(false);

                // Show error notification
                enqueueSnackbar(
                    error.response?.data?.message ||
                        "Terjadi kesalahan saat menyimpan jadwal pekerjaan",
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

    return (
        <>
            <Head title={`Jadwal Pekerjaan - ${anomalis.judul || ""}`} />
            <DashboardLayout>
                <div className="container mx-auto px-4 py-6">
                    {/* Header */}
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-6 text-white">
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
                                        <div className="flex items-center mt-2 text-sm text-gray-600 flex-wrap gap-x-4 gap-y-1">
                                            <div className="flex items-center">
                                                <FaCalendarAlt className="mr-1" />
                                                <span>
                                                    {formatDate(
                                                        anomalis.tanggal_kejadian
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex items-center">
                                                <FaUser className="mr-1" />
                                                <span>
                                                    {anomalis.user?.name || "-"}
                                                </span>
                                            </div>
                                            <div className="flex items-center">
                                                <FaMapMarkerAlt className="mr-1" />
                                                <span>
                                                    {anomalis.gardu_induk
                                                        .name || "-"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 md:mt-0 flex flex-col md:flex-row items-start md:items-center gap-3">
                                <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                                    <StatusBadge
                                        className="shadow-lg"
                                        status={anomalis.status}
                                    />
                                </div>
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

                    {/* Schedule Work Card - Only show if start and end dates are empty */}
                    {(!anomalis.tanggal_mulai || !anomalis.tanggal_selesai) && (
                        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-l-4 border-blue-600">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                <div className="bg-blue-100 p-2 rounded-full mr-3">
                                    <FaCalendarCheck className="text-blue-600" />
                                </div>
                                Penjadwalan Pekerjaan
                            </h2>

                            <div className="space-y-6">
                                {/* Rentang Tanggal Pekerjaan */}
                                <div className="space-y-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Rentang Tanggal Pekerjaan{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <div className="bg-white border border-gray-300 rounded-xl shadow-lg overflow-hidden">
                                        <div className="rdp-custom">
                                            <DayPicker
                                                mode="range"
                                                selected={dateRange}
                                                onSelect={setDateRange}
                                                disabled={{
                                                    before: new Date(),
                                                }}
                                                numberOfMonths={2}
                                                showOutsideDays
                                                fixedWeeks
                                                footer={
                                                    dateRange?.from ? (
                                                        dateRange.to ? (
                                                            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 shadow-sm">
                                                                <div className="flex items-center text-blue-700 mb-2">
                                                                    <FaCalendarAlt className="mr-2 text-blue-600" />
                                                                    <span className="font-semibold text-lg">
                                                                        Periode
                                                                        Terpilih
                                                                    </span>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <p className="text-blue-800 font-medium">
                                                                        {dateRange.from.toLocaleDateString(
                                                                            "id-ID",
                                                                            {
                                                                                weekday:
                                                                                    "long",
                                                                                year: "numeric",
                                                                                month: "long",
                                                                                day: "numeric",
                                                                            }
                                                                        )}{" "}
                                                                        -{" "}
                                                                        {dateRange.to.toLocaleDateString(
                                                                            "id-ID",
                                                                            {
                                                                                weekday:
                                                                                    "long",
                                                                                year: "numeric",
                                                                                month: "long",
                                                                                day: "numeric",
                                                                            }
                                                                        )}
                                                                    </p>
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                                                                            Durasi:{" "}
                                                                            {Math.ceil(
                                                                                (dateRange.to -
                                                                                    dateRange.from) /
                                                                                    (1000 *
                                                                                        60 *
                                                                                        60 *
                                                                                        24)
                                                                            ) +
                                                                                1}{" "}
                                                                            hari
                                                                        </span>
                                                                        <span className="text-xs text-blue-500">
                                                                            ✓
                                                                            Rentang
                                                                            tanggal
                                                                            valid
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                                                                <p className="text-amber-700 text-sm flex items-center">
                                                                    <span className="mr-2">
                                                                        ⏳
                                                                    </span>
                                                                    Pilih
                                                                    tanggal
                                                                    selesai
                                                                    untuk
                                                                    melengkapi
                                                                    rentang
                                                                </p>
                                                            </div>
                                                        )
                                                    ) : (
                                                        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                            <p className="text-gray-600 text-sm flex items-center">
                                                                <span className="mr-2">
                                                                    📅
                                                                </span>
                                                                Pilih tanggal
                                                                mulai dan
                                                                selesai
                                                                pekerjaan
                                                            </p>
                                                        </div>
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Pilih rentang tanggal untuk melaksanakan
                                        pekerjaan perbaikan anomali
                                    </p>
                                </div>
                            </div>

                            {/* Catatan */}
                            <div className="mt-6 space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Catatan Pekerjaan
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                                    placeholder="Masukkan catatan atau instruksi khusus untuk pekerjaan ini..."
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="mt-6">
                                <button
                                    onClick={handleScheduleWork}
                                    disabled={
                                        isSubmitting ||
                                        !dateRange?.from ||
                                        !dateRange?.to
                                    }
                                    className={`w-full md:w-auto px-8 py-3 rounded-lg font-medium transition-all shadow-md flex items-center justify-center ${
                                        isSubmitting ||
                                        !dateRange?.from ||
                                        !dateRange?.to
                                            ? "bg-gray-400 cursor-not-allowed"
                                            : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                                    }`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <FaSave className="mr-2" />
                                            Simpan Jadwal Pekerjaan
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Info Box */}
                            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-start">
                                    <FaInfoCircle className="text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                                    <div className="text-sm text-blue-700">
                                        <p className="font-medium mb-1">
                                            Informasi Penjadwalan:
                                        </p>
                                        <ul className="list-disc list-inside space-y-1 text-blue-600">
                                            <li>
                                                Pilih tanggal mulai dan selesai
                                                untuk periode pekerjaan
                                            </li>
                                            <li>
                                                Tanggal tidak boleh kurang dari
                                                hari ini
                                            </li>
                                            <li>
                                                Catatan dapat digunakan untuk
                                                memberikan instruksi khusus
                                            </li>
                                            <li>
                                                Jadwal yang telah disimpan akan
                                                dikirimkan ke tim terkait
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

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
                                        icon={FaList}
                                        label="Bagian"
                                        value={anomalis.bagian}
                                    />
                                    <DataItem
                                        icon={FaLayerGroup}
                                        label="Kategori"
                                        value={anomalis.kategori?.name}
                                    />
                                    <DataItem
                                        icon={FaTag}
                                        label="Tipe"
                                        value={anomalis.tipe?.name}
                                    />
                                    <DataItem
                                        icon={FaCalendarAlt}
                                        label="Tanggal Kejadian"
                                        value={formatDate(
                                            anomalis.tanggal_kejadian
                                        )}
                                    />
                                    <DataItem
                                        icon={FaCalendarAlt}
                                        label="Tanggal Mulai"
                                        value={formatDate(
                                            anomalis.tanggal_mulai
                                        )}
                                    />
                                    <DataItem
                                        icon={FaCalendarAlt}
                                        label="Tanggal Selesai"
                                        value={formatDate(
                                            anomalis.tanggal_selesai
                                        )}
                                    />
                                    <DataItem
                                        icon={FaUser}
                                        label="Dibuat Oleh"
                                        value={anomalis.user?.name}
                                    />
                                </div>
                            )}

                            {/* Tab Detail Peralatan */}
                            {activeTab === "detail" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <DataItem
                                        icon={FaTools}
                                        label="Nama Peralatan"
                                        value={anomalis.peralatan?.name}
                                    />
                                    <DataItem
                                        icon={FaMapPin}
                                        label="Penempatan Alat"
                                        value={anomalis.penempatan_alat}
                                    />
                                    <DataItem
                                        icon={FaBolt}
                                        label="Tegangan"
                                        value={anomalis.tegangan}
                                    />
                                    <DataItem
                                        icon={FaLightbulb}
                                        label="Kapasitas"
                                        value={anomalis.kapasitas}
                                    />
                                    <DataItem
                                        icon={FaMoneyBillAlt}
                                        label="Harga"
                                        value={formatRupiah(anomalis.harga)}
                                    />
                                    <DataItem
                                        icon={FaBarcode}
                                        label="Merk"
                                        value={anomalis.merk}
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
                                            <FaTools className="text-blue-500 mr-2" />
                                            <span className="text-sm font-medium text-gray-500">
                                                Tindakan
                                            </span>
                                        </div>
                                        <div className="text-gray-800 whitespace-pre-line">
                                            {anomalis.tindakan}
                                        </div>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                        <div className="flex items-center mb-2">
                                            <FaShieldAlt className="text-green-500 mr-2" />
                                            <span className="text-sm font-medium text-gray-500">
                                                Pencegahan
                                            </span>
                                        </div>
                                        <div className="text-gray-800 whitespace-pre-line">
                                            {anomalis.pencegahan}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab Lampiran */}
                            {activeTab === "lampiran" && (
                                <div className="space-y-6">
                                    {lampiranFoto && lampiranFoto.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {lampiranFoto.map((foto, index) => (
                                                <div
                                                    key={index}
                                                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                                                    onClick={() =>
                                                        setSelectedImage(foto)
                                                    }
                                                >
                                                    <img
                                                        src={`/storage/${foto}`}
                                                        alt={`Lampiran ${
                                                            index + 1
                                                        }`}
                                                        className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <FaClipboardList className="mx-auto text-4xl text-gray-300 mb-4" />
                                            <p>Tidak ada lampiran foto</p>
                                        </div>
                                    )}
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
                                                                                {
                                                                                    timeline.new_value
                                                                                }
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

                    {/* Image Modal */}
                    {selectedImage && (
                        <div
                            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
                            onClick={() => setSelectedImage(null)}
                        >
                            <div className="max-w-4xl max-h-full">
                                <img
                                    src={`/storage/${selectedImage}`}
                                    alt="Lampiran"
                                    className="max-w-full max-h-full object-contain rounded-lg"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </>
    );
}

// Wrapper component with SnackbarProvider
export default function Schedule({ anomalis, users }) {
    return (
        <SnackbarProvider
            maxSnack={3}
            anchorOrigin={{
                vertical: "top",
                horizontal: "right",
            }}
            autoHideDuration={4000}
        >
            <ScheduleContent anomalis={anomalis} users={users} />
        </SnackbarProvider>
    );
}
