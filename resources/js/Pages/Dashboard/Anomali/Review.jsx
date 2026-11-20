import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useState, useEffect, forwardRef } from "react";
import axios from "axios";
import { SnackbarProvider, useSnackbar } from "notistack";
import { Listbox, Transition } from "@headlessui/react";
import PdfDownloadButton from "@/Components/Dashboard/Anomali/PdfDownloadButton";
import {
    FaArrowLeft,
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
import PageHeader from "@/Components/Dashboard/PageHeader";
import { Card, EmptyState } from "@/Components/Dashboard/ui";
import StageBadge from "@/Components/Anomali/StageBadge";

const TABS = [
    { id: "informasi", label: "Informasi Umum", icon: FaInfoCircle },
    { id: "detail", label: "Detail Peralatan", icon: FaTools },
    { id: "analisis", label: "Analisis Anomali", icon: FaChartLine },
    { id: "lampiran", label: "Lampiran", icon: FaClipboardList },
];

// Komponen untuk menampilkan item data dengan ikon
const DataItem = ({ icon, label, value, className = "" }) => {
    const Icon = icon;
    return (
        <div
            className={`rounded-xl border border-slate-200/80 bg-white p-4 transition hover:border-slate-300 ${className}`}
        >
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <Icon className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                <span>{label}</span>
            </div>
            <div className="mt-1.5 text-sm font-semibold text-ink-900">
                {value || "-"}
            </div>
        </div>
    );
};

function AnalysisBlock({ icon: Icon, tone, label, children }) {
    return (
        <div className="rounded-xl border border-slate-200/80 bg-white p-5">
            <div className="flex items-center gap-3">
                <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${tone}`}
                >
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <h3 className="text-sm font-bold text-ink-900">{label}</h3>
            </div>
            <div className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                {children}
            </div>
        </div>
    );
}

function SummaryItem({ label, children }) {
    return (
        <div className="flex items-start justify-between gap-4 py-2.5">
            <dt className="text-sm text-slate-500">{label}</dt>
            <dd className="min-w-0 text-right text-sm font-semibold text-ink-900">
                {children}
            </dd>
        </div>
    );
}

function Spinner() {
    return (
        <svg
            className="h-4 w-4 animate-spin text-white"
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
    );
}

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
                variant === "success" ? "bg-emerald-600" : "bg-rose-600"
            } flex max-w-md items-center rounded-xl px-4 py-3 text-white shadow-lift`}
            {...props}
        >
            <div className="mr-3">{icon}</div>
            <div className="flex-1">
                <p className="text-sm font-medium">{message}</p>
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
            <DashboardLayout title="Review Anomali">
                <Card>
                    <EmptyState
                        icon={FaExclamationCircle}
                        title="Data Anomali Tidak Ditemukan"
                        description="Maaf, data anomali yang Anda cari tidak tersedia atau telah dihapus."
                        action={
                            <Link href="/dashboard/anomali" className="btn-brand">
                                Kembali ke Daftar Anomali
                            </Link>
                        }
                    />
                </Card>
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

    const isDecided = anomalis.approve !== null;

    return (
        <>
            <Head title={`Review Anomali - ${anomalis.judul || ""}`} />
            <DashboardLayout title="Review Anomali">
                <PageHeader
                    title={anomalis.judul}
                    description={
                        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span className="inline-flex items-center gap-1.5">
                                <FaCalendarAlt
                                    className="h-3 w-3 text-slate-400"
                                    aria-hidden="true"
                                />
                                {formatDate(anomalis.tanggal_kejadian)}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <FaUser
                                    className="h-3 w-3 text-slate-400"
                                    aria-hidden="true"
                                />
                                {anomalis.user?.name || "-"}
                            </span>
                        </span>
                    }
                    leading={
                        <Link
                            href={route("dashboard.anomali.index")}
                            className="btn-icon shrink-0 border border-slate-200 bg-white"
                            aria-label="Kembali"
                            title="Kembali ke daftar anomali"
                        >
                            <FaArrowLeft
                                className="h-3.5 w-3.5"
                                aria-hidden="true"
                            />
                        </Link>
                    }
                >
                    <StageBadge anomali={anomalis} />
                    <PdfDownloadButton
                        url={`/dashboard/anomali/${anomalis.slug}/pdf`}
                        fileName={`anomali_${anomalis.slug}.pdf`}
                    />
                </PageHeader>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* Keputusan + ringkasan */}
                    <div className="space-y-6 lg:order-2 lg:col-span-4">
                        <section className="surface overflow-hidden lg:sticky lg:top-24">
                            <div className="border-b border-slate-100 px-5 py-4">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-900 text-volt">
                                        <FaShieldAlt
                                            className="h-4 w-4"
                                            aria-hidden="true"
                                        />
                                    </span>
                                    <div>
                                        <h2 className="text-base font-bold text-ink-900">
                                            Tindakan Persetujuan
                                        </h2>
                                        <p className="mt-0.5 text-sm text-slate-500">
                                            Silakan tinjau laporan ini dan
                                            berikan keputusan persetujuan.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 p-5">
                                <button
                                    onClick={() => setShowApproveModal(true)}
                                    className="btn-brand w-full py-3"
                                    disabled={isDecided}
                                >
                                    <FaCheckCircle aria-hidden="true" />
                                    Setujui Anomali
                                </button>
                                <button
                                    onClick={() => setShowRejectModal(true)}
                                    className="btn-ghost w-full border-rose-200 py-3 text-rose-700 hover:border-rose-300 hover:bg-rose-50"
                                    disabled={isDecided}
                                >
                                    <FaTimesCircle aria-hidden="true" />
                                    Tolak Anomali
                                </button>

                                {isDecided && (
                                    <div
                                        className={`mt-2 rounded-xl border p-4 ${anomalis.approve === "Yes" ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {anomalis.approve === "Yes" ? (
                                                <FaCheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                                            ) : (
                                                <FaTimesCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                                            )}
                                            <div>
                                                <span
                                                    className={`text-sm font-bold ${anomalis.approve === "Yes" ? "text-emerald-800" : "text-rose-800"}`}
                                                >
                                                    Anomali ini telah{" "}
                                                    {anomalis.approve === "Yes"
                                                        ? "disetujui"
                                                        : "ditolak"}
                                                </span>
                                                <p
                                                    className={`mt-0.5 text-sm ${anomalis.approve === "Yes" ? "text-emerald-700" : "text-rose-700"}`}
                                                >
                                                    Keputusan telah direkam
                                                    dalam sistem.
                                                </p>
                                            </div>
                                        </div>
                                        {anomalis.reject_reason && (
                                            <div className="mt-3 rounded-lg border border-rose-100 bg-white p-3">
                                                <span className="mb-1 block text-xs font-semibold text-rose-700">
                                                    Alasan Penolakan
                                                </span>
                                                <p className="text-sm text-slate-700">
                                                    {anomalis.reject_reason}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </section>

                        <Card title="Ringkasan">
                            <dl className="-my-2.5 divide-y divide-slate-100">
                                <SummaryItem label="Gardu Induk">
                                    {anomalis.gardu_induk?.name || "-"}
                                </SummaryItem>
                                <SummaryItem label="ULTG">
                                    {anomalis.ultg || "-"}
                                </SummaryItem>
                                <SummaryItem label="Peralatan">
                                    {anomalis.peralatan || "-"}
                                </SummaryItem>
                                <SummaryItem label="Tipe">
                                    {anomalis.tipe || "-"}
                                </SummaryItem>
                                <SummaryItem label="Kategori">
                                    {anomalis.kategori?.name || "-"}
                                </SummaryItem>
                            </dl>
                        </Card>
                    </div>

                    {/* Tabs */}
                    <section className="surface overflow-hidden lg:order-1 lg:col-span-8">
                        <div className="overflow-x-auto border-b border-slate-100 px-3 sm:px-4">
                            <div className="flex gap-1">
                                {TABS.map((tab) => {
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() =>
                                                setActiveTab(tab.id)
                                            }
                                            aria-current={
                                                isActive ? "page" : undefined
                                            }
                                            className={`-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3.5 text-sm font-semibold transition ${
                                                isActive
                                                    ? "border-brand-600 text-ink-900"
                                                    : "border-transparent text-slate-500 hover:text-ink-900"
                                            }`}
                                        >
                                            <tab.icon
                                                className={`h-3.5 w-3.5 ${isActive ? "text-brand-600" : "text-slate-400"}`}
                                            />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="p-5 sm:p-6">
                            {/* Tab Informasi Umum */}
                            {activeTab === "informasi" && (
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
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
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
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
                                <div className="grid grid-cols-1 gap-4">
                                    <AnalysisBlock
                                        icon={FaExclamationTriangle}
                                        tone="bg-amber-50 text-amber-700"
                                        label="Penyebab Anomali"
                                    >
                                        {anomalis.penyebab}
                                    </AnalysisBlock>
                                    <AnalysisBlock
                                        icon={FaBolt}
                                        tone="bg-rose-50 text-rose-700"
                                        label="Akibat yang Ditimbulkan"
                                    >
                                        {anomalis.akibat}
                                    </AnalysisBlock>
                                    <AnalysisBlock
                                        icon={FaLightbulb}
                                        tone="bg-brand-50 text-brand-700"
                                        label="Usulan & Saran Perbaikan"
                                    >
                                        {anomalis.usul_saran || "-"}
                                    </AnalysisBlock>
                                </div>
                            )}

                            {/* Tab Lampiran */}
                            {activeTab === "lampiran" && (
                                <div>
                                    <h3 className="mb-4 text-base font-bold text-ink-900">
                                        Lampiran Foto
                                    </h3>

                                    {lampiranFoto && lampiranFoto.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                                            {lampiranFoto.map((foto, idx) => (
                                                <div
                                                    key={idx}
                                                    className="group relative cursor-pointer"
                                                    onClick={() =>
                                                        setSelectedImage(
                                                            `/storage/${foto}`,
                                                        )
                                                    }
                                                >
                                                    <div className="aspect-w-1 aspect-h-1 overflow-hidden rounded-xl border border-slate-200">
                                                        <img
                                                            src={`/storage/${foto}`}
                                                            alt={`Lampiran Foto ${
                                                                idx + 1
                                                            }`}
                                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                        />
                                                    </div>
                                                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-ink-900/0 transition-all duration-300 group-hover:bg-ink-900/30">
                                                        <div className="rounded-full bg-white p-3 opacity-0 shadow-soft transition-all duration-300 group-hover:opacity-100">
                                                            <FaSearch className="text-brand-600" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70">
                                            <EmptyState
                                                icon={FaClipboardList}
                                                title="Tidak ada lampiran foto tersedia"
                                            />
                                        </div>
                                    )}

                                    {/* Modal untuk preview gambar */}
                                    {selectedImage && (
                                        <div
                                            className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/90 p-4 backdrop-blur-sm transition-all duration-300"
                                            onClick={() =>
                                                setSelectedImage(null)
                                            }
                                        >
                                            <div className="relative flex max-h-[90vh] w-full max-w-5xl justify-center">
                                                <img
                                                    src={selectedImage}
                                                    alt="Preview"
                                                    className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-lift ring-1 ring-white/20"
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                />
                                                <button
                                                    className="absolute -top-12 right-0 rounded-full bg-white/10 p-2 text-white backdrop-blur-md transition-colors hover:bg-white/20"
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
                    </section>
                </div>

                {/* Modal Approve */}
                {showApproveModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/50 p-4 backdrop-blur-sm transition-all duration-300">
                        <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-lift ring-1 ring-slate-900/5">
                            <div className="flex shrink-0 items-center gap-4 border-b border-slate-100 px-6 py-5">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                    <FaCheckCircle className="h-5 w-5" />
                                </span>
                                <div>
                                    <h3 className="text-lg font-bold text-ink-900">
                                        Setujui Anomali
                                    </h3>
                                    <p className="text-sm text-slate-500">
                                        Konfirmasi persetujuan laporan
                                    </p>
                                </div>
                            </div>

                            <div className="overflow-y-auto p-6">
                                <div>
                                    <label className="field-label">
                                        Ditugaskan Kepada Bidang
                                    </label>
                                    <div className="relative">
                                        <Listbox
                                            value={assignTo}
                                            onChange={setAssignTo}
                                        >
                                            <div className="relative">
                                                <Listbox.Button className="field-input relative cursor-default pr-10 text-left">
                                                    <span
                                                        className={`block truncate ${assignTo ? "text-ink-900" : "text-slate-400"}`}
                                                    >
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
                                                    className="z-[100] mt-1 max-h-60 w-[var(--button-width)] overflow-auto rounded-xl border border-slate-200 bg-white py-1 text-sm shadow-lift transition duration-100 ease-out focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
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
                                                                        `relative cursor-pointer select-none py-2.5 pl-10 pr-4 transition-colors ${
                                                                            active
                                                                                ? "bg-brand-50 text-brand-900"
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
                                                                                        ? "font-semibold text-ink-900"
                                                                                        : "font-medium"
                                                                                }`}
                                                                            >
                                                                                {
                                                                                    bidang
                                                                                }
                                                                            </span>
                                                                            {selected ? (
                                                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-brand-600">
                                                                                    <FaCheckCircle className="h-4 w-4" />
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

                            <div className="flex shrink-0 justify-end gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4">
                                <button
                                    type="button"
                                    onClick={() => setShowApproveModal(false)}
                                    className="btn-ghost"
                                    disabled={isSubmitting}
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={handleApprove}
                                    className="btn-brand"
                                    disabled={isSubmitting || !assignTo}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Spinner />
                                            Memproses...
                                        </>
                                    ) : (
                                        <>
                                            <FaCheckCircle />
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
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/50 p-4 backdrop-blur-sm transition-all duration-300">
                        <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-lift ring-1 ring-slate-900/5">
                            <div className="flex shrink-0 items-center gap-4 border-b border-slate-100 px-6 py-5">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                                    <FaTimesCircle className="h-5 w-5" />
                                </span>
                                <div>
                                    <h3 className="text-lg font-bold text-ink-900">
                                        Tolak Anomali
                                    </h3>
                                    <p className="text-sm text-slate-500">
                                        Konfirmasi penolakan laporan
                                    </p>
                                </div>
                            </div>

                            <div className="overflow-y-auto p-6">
                                <label
                                    htmlFor="reject_reason"
                                    className="field-label"
                                >
                                    Alasan Penolakan
                                </label>
                                <textarea
                                    id="reject_reason"
                                    value={rejectReason}
                                    onChange={(e) =>
                                        setRejectReason(e.target.value)
                                    }
                                    className="field-input min-h-[120px]"
                                    placeholder="Jelaskan alasan penolakan secara rinci..."
                                    required
                                ></textarea>
                            </div>

                            <div className="flex shrink-0 justify-end gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4">
                                <button
                                    type="button"
                                    onClick={() => setShowRejectModal(false)}
                                    className="btn-ghost"
                                    disabled={isSubmitting}
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={handleReject}
                                    className="btn-danger"
                                    disabled={isSubmitting || !rejectReason}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Spinner />
                                            Memproses...
                                        </>
                                    ) : (
                                        <>
                                            <FaTimesCircle />
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
