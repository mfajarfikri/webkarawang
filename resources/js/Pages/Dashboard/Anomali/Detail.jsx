import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link } from "@inertiajs/react";
import { PERMISSIONS, useCan } from "@/utils/permissions";
import { useState } from "react";
import {
    FaArrowLeft,
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
    FaClipboardList,
    FaExclamationCircle,
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
import PageHeader from "@/Components/Dashboard/PageHeader";
import { Badge, Card, EmptyState } from "@/Components/Dashboard/ui";
import StageBadge from "@/Components/Anomali/StageBadge";

const TABS = [
    { id: "informasi", icon: FaInfoCircle, label: "Informasi Umum" },
    { id: "detail", icon: FaTools, label: "Detail Peralatan" },
    { id: "analisis", icon: FaChartLine, label: "Analisis Anomali" },
    { id: "lampiran", icon: FaClipboardList, label: "Lampiran" },
    { id: "approval", icon: FaCalendarCheck, label: "Status Approval" },
    { id: "timeline", icon: FaHistory, label: "Timeline" },
];

/** Warna & ikon titik timeline berdasarkan makna peristiwa. */
const TIMELINE_EVENTS = {
    created: { icon: FaCheckCircle, cls: "bg-amber-50 text-amber-600 ring-amber-200" },
    status_changed: { icon: FaExclamationCircle, cls: "bg-brand-50 text-brand-600 ring-brand-200" },
    assigned: { icon: FaUserCheck, cls: "bg-brand-50 text-brand-600 ring-brand-200" },
    approved: { icon: FaCheckCircle, cls: "bg-emerald-50 text-emerald-600 ring-emerald-200" },
    rejected: { icon: FaTimesCircle, cls: "bg-rose-50 text-rose-600 ring-rose-200" },
    completed: { icon: FaCheckCircle, cls: "bg-emerald-50 text-emerald-600 ring-emerald-200" },
    scheduled: { icon: FaCalendarAlt, cls: "bg-violet-50 text-violet-600 ring-violet-200" },
};
const TIMELINE_DEFAULT = {
    icon: FaInfoCircle,
    cls: "bg-slate-100 text-slate-500 ring-slate-200",
};

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

function TipeBadge({ tipe }) {
    let tone = "slate";
    if (tipe === "Major") tone = "rose";
    else if (tipe === "Minor") tone = "emerald";

    return <Badge tone={tone}>{tipe}</Badge>;
}

function UltgBadge({ ultg }) {
    return <Badge tone="slate">{ultg}</Badge>;
}

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

function SectionTitle({ icon: Icon, title, description }) {
    return (
        <div className="mb-6 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
                <h3 className="text-base font-bold text-ink-900">{title}</h3>
                {description ? (
                    <p className="mt-0.5 text-sm text-slate-500">
                        {description}
                    </p>
                ) : null}
            </div>
        </div>
    );
}

// Komponen untuk menampilkan status approval
const ApprovalStatus = ({ approve, rejectReason }) => {
    if (approve === null) {
        return (
            <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-5">
                <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60"></span>
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                </span>
                <span className="text-sm font-semibold text-amber-800">
                    Menunggu Direview
                </span>
            </div>
        );
    }

    if (approve === "Yes") {
        return (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                <div className="flex items-center gap-3">
                    <FaCheckCircle className="h-6 w-6 shrink-0 text-emerald-600" />
                    <div>
                        <p className="text-sm font-bold text-emerald-800">
                            Disetujui
                        </p>
                        <p className="mt-0.5 text-sm text-emerald-700">
                            Anomali telah disetujui dan diverifikasi
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-5">
            <div className="flex items-center gap-3">
                <FaTimesCircle className="h-6 w-6 shrink-0 text-rose-600" />
                <div>
                    <p className="text-sm font-bold text-rose-800">Ditolak</p>
                    <p className="mt-0.5 text-sm text-rose-700">
                        Anomali tidak disetujui
                    </p>
                </div>
            </div>
            {rejectReason && (
                <div className="mt-4 rounded-xl border border-rose-100 bg-white p-4">
                    <p className="text-sm text-slate-700">
                        <span className="mb-1 block font-semibold text-rose-700">
                            Alasan Penolakan:
                        </span>
                        {rejectReason}
                    </p>
                </div>
            )}
        </div>
    );
};

function SummaryItem({ label, children }) {
    return (
        <div className="min-w-0">
            <dt className="text-xs font-medium text-slate-500">{label}</dt>
            <dd className="mt-1 truncate text-sm font-semibold text-ink-900">
                {children}
            </dd>
        </div>
    );
}

export default function Detail({ anomalis }) {
    const can = useCan();
    const [activeTab, setActiveTab] = useState("informasi");
    const [selectedImage, setSelectedImage] = useState(null);

    if (!anomalis) {
        return (
            <DashboardLayout title="Detail Anomali">
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
            <DashboardLayout title="Detail Anomali">
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
                    {can(PERMISSIONS.ANOMALI_EXPORT) ? (
                        <PdfDownloadButton
                            url={`/dashboard/anomali/${anomalis.slug}/pdf`}
                            fileName={`anomali_${anomalis.slug}.pdf`}
                        />
                    ) : null}
                </PageHeader>

                {/* Ringkasan */}
                <Card className="mb-6">
                    <dl className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-3 xl:grid-cols-6">
                        <SummaryItem label="Gardu Induk">
                            {anomalis.gardu_induk?.name || "-"}
                        </SummaryItem>
                        <SummaryItem label="Bay">
                            {anomalis.bay || "-"}
                        </SummaryItem>
                        <SummaryItem label="Peralatan">
                            {anomalis.peralatan || "-"}
                        </SummaryItem>
                        <SummaryItem label="Tipe">
                            {anomalis.tipe ? (
                                <TipeBadge tipe={anomalis.tipe} />
                            ) : (
                                "-"
                            )}
                        </SummaryItem>
                        <SummaryItem label="Status">
                            {anomalis.status || "-"}
                        </SummaryItem>
                        <SummaryItem label="Ditugaskan ke">
                            {anomalis.assigned_user?.name || "-"}
                        </SummaryItem>
                    </dl>
                </Card>

                {/* Tabs */}
                <section className="surface overflow-hidden">
                    <div className="overflow-x-auto border-b border-slate-100 px-3 sm:px-4">
                        <div className="flex gap-1">
                            {TABS.map((tab) => {
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
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
                                            className={`h-3.5 w-3.5 ${
                                                isActive
                                                    ? "text-brand-600"
                                                    : "text-slate-400"
                                            }`}
                                        />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="min-h-[400px] p-5 sm:p-6">
                        {/* Tab Informasi Umum */}
                        {activeTab === "informasi" && (
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                                <DataItem
                                    icon={FaBuilding}
                                    label="ULTG"
                                    value={<UltgBadge ultg={anomalis.ultg} />}
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
                                    value={<TipeBadge tipe={anomalis.tipe} />}
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
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
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
                                    {anomalis.penyebab ||
                                        "Tidak ada data penyebab."}
                                </AnalysisBlock>
                                <AnalysisBlock
                                    icon={FaBolt}
                                    tone="bg-rose-50 text-rose-700"
                                    label="Akibat yang Ditimbulkan"
                                >
                                    {anomalis.akibat || "Tidak ada data akibat."}
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
                                <SectionTitle
                                    icon={FaClipboardList}
                                    title="Lampiran Foto"
                                />

                                {lampiranFoto && lampiranFoto.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
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
                                                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-all duration-300 group-hover:opacity-100">
                                                    <FaSearch className="text-xl text-white" />
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
                                        className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/90 p-4 backdrop-blur-sm"
                                        onClick={() => setSelectedImage(null)}
                                    >
                                        <div className="relative flex max-h-[90vh] w-full max-w-5xl flex-col items-center">
                                            <img
                                                src={selectedImage}
                                                alt="Preview"
                                                className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-lift"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            />
                                            <button
                                                className="absolute -top-12 right-0 rounded-full bg-white/10 p-2 text-white/80 backdrop-blur-md transition-colors hover:bg-white/20 hover:text-white md:-right-12"
                                                onClick={() =>
                                                    setSelectedImage(null)
                                                }
                                            >
                                                <FaTimesCircle className="h-8 w-8" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab Status Approval */}
                        {activeTab === "approval" && (
                            <div>
                                <SectionTitle
                                    icon={FaCalendarCheck}
                                    title="Status Persetujuan"
                                    description="Informasi detail mengenai status persetujuan anomali"
                                />

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="col-span-2">
                                        <div className="field-label">
                                            Status Saat Ini
                                        </div>
                                        <ApprovalStatus
                                            approve={anomalis.approve}
                                            rejectReason={anomalis.reject_reason}
                                        />
                                    </div>

                                    {anomalis.approved_by && (
                                        <DataItem
                                            icon={FaUser}
                                            label={
                                                anomalis.status === "Rejected"
                                                    ? "Ditolak Oleh"
                                                    : "Disetujui Oleh"
                                            }
                                            value={
                                                anomalis.approved_by?.name || "-"
                                            }
                                        />
                                    )}

                                    {anomalis.tanggal_approve && (
                                        <DataItem
                                            icon={FaCalendarAlt}
                                            label="Tanggal Persetujuan"
                                            value={formatDate(
                                                anomalis.tanggal_approve,
                                            )}
                                        />
                                    )}

                                    {anomalis.assigned_user && (
                                        <DataItem
                                            icon={FaUserClock}
                                            label="Ditugaskan Kepada"
                                            value={
                                                anomalis.assigned_user?.name ||
                                                "-"
                                            }
                                        />
                                    )}

                                    {anomalis.tanggal_mulai && (
                                        <DataItem
                                            icon={FaClock}
                                            label="Tanggal Mulai"
                                            value={formatDate(
                                                anomalis.tanggal_mulai,
                                            )}
                                        />
                                    )}

                                    {anomalis.tanggal_selesai && (
                                        <DataItem
                                            icon={FaCheckCircle}
                                            label="Tanggal Selesai"
                                            value={formatDate(
                                                anomalis.tanggal_selesai,
                                            )}
                                        />
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Tab Timeline */}
                        {activeTab === "timeline" && (
                            <div>
                                <SectionTitle
                                    icon={FaHistory}
                                    title="Riwayat Aktivitas"
                                    description="Jejak audit perubahan status anomali"
                                />

                                {anomalis.timelines &&
                                anomalis.timelines.length > 0 ? (
                                    <ol className="relative">
                                        {anomalis.timelines.map(
                                            (timeline, index) => {
                                                const event =
                                                    TIMELINE_EVENTS[
                                                        timeline.event_type
                                                    ] ?? TIMELINE_DEFAULT;
                                                const EventIcon = event.icon;
                                                const isLast =
                                                    index ===
                                                    anomalis.timelines.length -
                                                        1;
                                                return (
                                                    <li
                                                        key={timeline.id}
                                                        className="relative flex gap-4 pb-6 last:pb-0"
                                                    >
                                                        {!isLast ? (
                                                            <span
                                                                className="absolute left-4 top-9 bottom-0 w-px -translate-x-1/2 bg-slate-200"
                                                                aria-hidden="true"
                                                            />
                                                        ) : null}
                                                        <span
                                                            className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-1 ring-inset ${event.cls}`}
                                                        >
                                                            <EventIcon className="h-3.5 w-3.5" />
                                                        </span>

                                                        <div className="min-w-0 flex-1 pt-1">
                                                            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                                                                <h4 className="text-sm font-semibold text-ink-900">
                                                                    {
                                                                        timeline.description
                                                                    }
                                                                </h4>
                                                                <span className="shrink-0 text-xs text-slate-500">
                                                                    {formatDate(
                                                                        timeline.created_at,
                                                                    )}
                                                                </span>
                                                            </div>

                                                            {timeline.old_value &&
                                                                timeline.new_value && (
                                                                    <div className="mt-1.5 text-sm text-slate-600">
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
                                                                                timeline.old_value,
                                                                            )}
                                                                        </span>
                                                                        <span className="mx-2 text-slate-400">
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
                                                                                timeline.new_value,
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                )}

                                                            {timeline.comment && (
                                                                <div className="mt-1.5 text-sm text-slate-600">
                                                                    <span className="font-medium">
                                                                        Keterangan
                                                                        :
                                                                    </span>{" "}
                                                                    {
                                                                        timeline.comment
                                                                    }
                                                                </div>
                                                            )}

                                                            <div className="mt-1.5 flex items-center text-xs text-slate-500">
                                                                <FaUser className="mr-1" />
                                                                <span>
                                                                    {timeline
                                                                        .user
                                                                        ?.name ||
                                                                        "Sistem"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </li>
                                                );
                                            },
                                        )}
                                    </ol>
                                ) : (
                                    <EmptyState
                                        icon={FaHistory}
                                        title="Belum ada riwayat aktivitas"
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </section>
            </DashboardLayout>
        </>
    );
}
