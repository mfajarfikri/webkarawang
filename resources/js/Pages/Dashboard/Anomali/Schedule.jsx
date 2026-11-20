import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useState, useEffect, forwardRef } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { id } from "date-fns/locale";
import {
    formatDateDMY,
    formatMaybeDateRange,
} from "@/Components/Utils/formatDate";
import axios from "axios";
import { SnackbarProvider, useSnackbar } from "notistack";
import PdfDownloadButton from "@/Components/Dashboard/Anomali/PdfDownloadButton";
import {
    FaArrowLeft,
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
    FaTrash,
    FaArrowRight,
} from "react-icons/fa";
import PageHeader from "@/Components/Dashboard/PageHeader";
import { Card, EmptyState } from "@/Components/Dashboard/ui";
import StageBadge from "@/Components/Anomali/StageBadge";

const locales = {
    id: id,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

// Warna mengikuti token: slate netral, brand untuk pilihan/hari ini, ink untuk teks.
const calendarStyles = `
  .rbc-calendar {
    min-height: 600px;
    font-family: inherit;
  }
  .rbc-toolbar {
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  .rbc-toolbar .rbc-toolbar-label {
    font-family: "Plus Jakarta Sans", Inter, sans-serif;
    font-weight: 800;
    font-size: 1rem;
    color: #0c1424;
    text-transform: capitalize;
  }
  .rbc-header {
    padding: 0.75rem 0;
    font-weight: 600;
    color: #64748b;
    font-size: 0.6875rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    border-bottom: 1px solid #f1f5f9;
  }
  .rbc-month-view {
    border: 1px solid #e2e8f0;
    border-radius: 1rem;
    overflow: hidden;
  }
  .rbc-day-bg + .rbc-day-bg,
  .rbc-header + .rbc-header {
    border-left: 1px solid #f1f5f9;
  }
  .rbc-month-row + .rbc-month-row {
    border-top: 1px solid #f1f5f9;
  }
  .rbc-off-range-bg {
    background-color: #f8fafc;
  }
  .rbc-today {
    background-color: #f0f9ff;
  }
  .rbc-date-cell {
    padding: 0.5rem 0.75rem;
    font-weight: 500;
    font-size: 0.8125rem;
    color: #334155;
    text-align: right;
  }
  .rbc-event {
    background-color: #0086c9;
    border-radius: 9999px;
    padding: 2px 8px;
    font-size: 0.75rem;
    font-weight: 600;
  }
  .rbc-toolbar button {
    color: #334155;
    font-weight: 600;
    font-size: 0.8125rem;
    padding: 0.4rem 0.9rem;
    border-radius: 9999px;
    border: 1px solid #e2e8f0;
    background: #fff;
  }
  .rbc-btn-group > button + button {
    margin-left: 0.25rem;
  }
  .rbc-btn-group > button:first-child:not(:last-child),
  .rbc-btn-group > button:last-child:not(:first-child),
  .rbc-btn-group > button:not(:first-child):not(:last-child) {
    border-radius: 9999px;
  }
  .rbc-toolbar button.rbc-active,
  .rbc-toolbar button:active {
    background-color: #0c1424;
    color: #fff;
    border-color: #0c1424;
    box-shadow: none;
  }
  .rbc-toolbar button:hover,
  .rbc-toolbar button:focus {
    background-color: #f8fafc;
    color: #0c1424;
    border-color: #cbd5e1;
  }
  .rbc-toolbar button.rbc-active:hover {
    background-color: #0c1424;
    color: #fff;
  }
`;

import { formatRupiah } from "@/utils/formatter";

const TABS = [
    { id: "informasi", label: "Informasi Umum", icon: FaInfoCircle },
    { id: "detail", label: "Detail Peralatan", icon: FaTools },
    { id: "analisis", label: "Analisis Anomali", icon: FaChartLine },
    { id: "lampiran", label: "Lampiran", icon: FaClipboardList },
    { id: "timeline", label: "Timeline", icon: FaHistory },
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
        return formatDateDMY(dateString);
    };

    // Parse lampiran foto
    const lampiranFoto = anomalis?.lampiran_foto
        ? typeof anomalis.lampiran_foto === "string"
            ? JSON.parse(anomalis.lampiran_foto)
            : anomalis.lampiran_foto
        : [];

    if (!anomalis) {
        return (
            <DashboardLayout title="Jadwal Anomali">
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

    // Handle schedule work
    const handleScheduleWork = () => {
        if (!dateRange.from || !dateRange.to) {
            enqueueSnackbar("Rentang tanggal pekerjaan harus dipilih", {
                variant: "error",
                autoHideDuration: 3000,
            });
            return;
        }

        setIsSubmitting(true);

        // Gunakan format lokal YYYY-MM-DD tanpa konversi ISO yang menggeser timezone
        const formatDateForBackend = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        };

        const data = {
            tanggal_mulai: formatDateForBackend(dateRange.from),
            tanggal_selesai: formatDateForBackend(dateRange.to),
            notes: notes,
        };

        axios
            .post(`/dashboard/anomali/${anomalis.slug}/schedule`, data)
            .then((response) => {
                setIsSubmitting(false);

                // Show success notification
                enqueueSnackbar("Jadwal pekerjaan berhasil disimpan", {
                    variant: "success",
                    autoHideDuration: 3000,
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
                        autoHideDuration: 5000,
                    },
                );
            });
    };

    // Handle date selection from FullCalendar
    const handleDateSelect = (selectInfo) => {
        const startDate = selectInfo.start;
        // Subtract 1 day from end date because FullCalendar returns exclusive end date
        const endDate = new Date(selectInfo.end);
        endDate.setDate(endDate.getDate() - 1);

        // Prevent selecting past dates
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Buat salinan startDate tanpa waktu untuk perbandingan yang tepat
        const startDay = new Date(startDate);
        startDay.setHours(0, 0, 0, 0);

        if (startDay < today) {
            enqueueSnackbar("Tidak dapat memilih tanggal di masa lalu", {
                variant: "error",
                autoHideDuration: 3000,
            });
            return;
        }

        // Check if single day selected (start date == end date)
        const isSingleDay = startDate.getTime() === endDate.getTime();

        if (isSingleDay) {
            // Logic for single click (range building)
            if (!dateRange.from || (dateRange.from && dateRange.to)) {
                // Start new range
                setDateRange({ from: startDate, to: undefined });
            } else if (dateRange.from && !dateRange.to) {
                // Complete the range
                if (startDate < dateRange.from) {
                    // Reset start if clicked before current start
                    setDateRange({ from: startDate, to: undefined });
                } else {
                    // Set end date
                    setDateRange({ ...dateRange, to: startDate });
                }
            }
        } else {
            // Logic for drag (explicit range)
            setDateRange({
                from: startDate,
                to: endDate,
            });
        }
    };

    const handleClearDate = () => {
        setDateRange({ from: undefined, to: undefined });
    };

    const canSave = !(isSubmitting || !dateRange?.from || !dateRange?.to);

    return (
        <>
            <style>{calendarStyles}</style>
            <Head title={`Jadwal Pekerjaan - ${anomalis.judul || ""}`} />
            <DashboardLayout title="Jadwal Anomali">
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
                            <span className="inline-flex items-center gap-1.5">
                                <FaMapMarkerAlt
                                    className="h-3 w-3 text-slate-400"
                                    aria-hidden="true"
                                />
                                {anomalis.gardu_induk?.name || "-"}
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

                {/* Schedule Work Card - Only show if start and end dates are empty */}
                {(!anomalis.tanggal_mulai || !anomalis.tanggal_selesai) && (
                    <div className="mb-8">
                        <div className="mb-4">
                            <p className="eyebrow">Langkah berikutnya</p>
                            <h2 className="mt-2 text-lg font-bold text-ink-900">
                                Penjadwalan Pekerjaan
                            </h2>
                            <p className="mt-1 text-sm text-slate-600">
                                Silakan pilih rentang tanggal pada kalender dan
                                lengkapi detail pekerjaan.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
                            {/* Calendar Section (Left) */}
                            <div className="surface p-4 sm:p-6 lg:col-span-8">
                                <Calendar
                                    localizer={localizer}
                                    events={[
                                        ...(dateRange.from
                                            ? [
                                                  {
                                                      title: dateRange.to
                                                          ? "Jadwal Terpilih"
                                                          : "Mulai",
                                                      start: dateRange.from,
                                                      end: dateRange.to
                                                          ? new Date(
                                                                dateRange.to.getTime() +
                                                                    86400000,
                                                            )
                                                          : new Date(
                                                                dateRange.from.getTime() +
                                                                    86400000,
                                                            ), // Add 1 day for exclusive end
                                                      allDay: true,
                                                  },
                                              ]
                                            : []),
                                    ]}
                                    startAccessor="start"
                                    endAccessor="end"
                                    style={{ height: 600 }}
                                    views={["month"]}
                                    selectable
                                    onSelectSlot={handleDateSelect}
                                    messages={{
                                        today: "Hari Ini",
                                        previous: "Sebelumnya",
                                        next: "Selanjutnya",
                                        month: "Bulan",
                                        week: "Minggu",
                                        day: "Hari",
                                    }}
                                    eventPropGetter={(event) => ({
                                        style: {
                                            backgroundColor: "#e0f2fe",
                                            color: "#0c1424",
                                            border: "1px solid #b9e6fe",
                                            borderRadius: "9999px",
                                            display: "block",
                                        },
                                    })}
                                    dayPropGetter={(date) => {
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        if (date < today) {
                                            return {
                                                style: {
                                                    backgroundColor: "#f8fafc",
                                                    color: "#cbd5e1",
                                                    cursor: "not-allowed",
                                                },
                                            };
                                        }
                                        return {};
                                    }}
                                />
                            </div>

                            {/* Form Section (Right) */}
                            <div className="space-y-4 lg:sticky lg:top-24 lg:col-span-4">
                                {/* Selected Date Info Card */}
                                <Card
                                    title="Detail Jadwal"
                                    icon={FaCalendarAlt}
                                    actions={
                                        (dateRange.from || dateRange.to) && (
                                            <button
                                                onClick={handleClearDate}
                                                className="btn-ghost btn-sm text-rose-700 hover:border-rose-200 hover:bg-rose-50"
                                            >
                                                <FaTrash className="text-[10px]" />{" "}
                                                Reset
                                            </button>
                                        )
                                    }
                                >
                                    {dateRange?.from ? (
                                        <div className="space-y-3">
                                            <div className="rounded-xl border border-slate-200/80 px-4 py-3">
                                                <label className="block text-xs font-medium text-slate-500">
                                                    Mulai
                                                </label>
                                                <div className="mt-0.5 text-sm font-semibold text-ink-900">
                                                    {formatDate(dateRange.from)}
                                                </div>
                                            </div>

                                            <div className="flex justify-center text-slate-300">
                                                <FaArrowRight className="rotate-90 text-xs" />
                                            </div>

                                            <div
                                                className={`rounded-xl border px-4 py-3 ${dateRange.to ? "border-slate-200/80" : "border-dashed border-slate-300"}`}
                                            >
                                                <label className="block text-xs font-medium text-slate-500">
                                                    Selesai
                                                </label>
                                                <div
                                                    className={`mt-0.5 text-sm font-semibold ${dateRange.to ? "text-ink-900" : "italic text-slate-400"}`}
                                                >
                                                    {dateRange.to
                                                        ? formatDate(
                                                              dateRange.to,
                                                          )
                                                        : "Pilih tanggal selesai"}
                                                </div>
                                            </div>

                                            {dateRange.to && (
                                                <div className="flex items-center justify-between rounded-xl bg-brand-50 px-4 py-3">
                                                    <span className="text-sm font-medium text-brand-800">
                                                        Durasi Pekerjaan
                                                    </span>
                                                    <span className="font-display text-lg font-extrabold text-ink-900">
                                                        {Math.ceil(
                                                            (dateRange.to -
                                                                dateRange.from) /
                                                                (1000 *
                                                                    60 *
                                                                    60 *
                                                                    24),
                                                        ) + 1}{" "}
                                                        Hari
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="py-6 text-center">
                                            <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                                <FaCalendarAlt className="h-5 w-5" />
                                            </span>
                                            <p className="text-sm font-semibold text-ink-900">
                                                Belum ada tanggal dipilih.
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                Klik tanggal pada kalender untuk
                                                memulai.
                                            </p>
                                        </div>
                                    )}
                                </Card>

                                {/* Notes Input */}
                                <Card>
                                    <label
                                        htmlFor="schedule_notes"
                                        className="field-label"
                                    >
                                        Catatan Pekerjaan{" "}
                                        <span className="font-normal text-slate-400">
                                            (Opsional)
                                        </span>
                                    </label>
                                    <textarea
                                        id="schedule_notes"
                                        value={notes}
                                        onChange={(e) =>
                                            setNotes(e.target.value)
                                        }
                                        rows={4}
                                        className="field-input resize-none"
                                        placeholder="Instruksi khusus untuk tim..."
                                    />
                                </Card>

                                {/* Submit Button */}
                                <button
                                    onClick={handleScheduleWork}
                                    disabled={
                                        isSubmitting ||
                                        !dateRange?.from ||
                                        !dateRange?.to
                                    }
                                    className="btn-brand w-full py-3"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <FaSave />
                                            Simpan Jadwal
                                        </>
                                    )}
                                </button>
                                {!canSave && !isSubmitting ? (
                                    <p className="text-center text-xs text-slate-500">
                                        Pilih tanggal mulai dan selesai untuk
                                        menyimpan jadwal.
                                    </p>
                                ) : null}
                            </div>
                        </div>
                    </div>
                )}

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
                                            className={`h-3.5 w-3.5 ${isActive ? "text-brand-600" : "text-slate-400"}`}
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
                                <DataItem
                                    icon={FaCalendarAlt}
                                    label="Tanggal Kejadian"
                                    value={formatDate(
                                        anomalis.tanggal_kejadian,
                                    )}
                                />
                                <DataItem
                                    icon={FaCalendarAlt}
                                    label="Tanggal Mulai"
                                    value={formatDate(anomalis.tanggal_mulai)}
                                />
                                <DataItem
                                    icon={FaCalendarAlt}
                                    label="Tanggal Selesai"
                                    value={formatDate(anomalis.tanggal_selesai)}
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
                                                        alt={`Lampiran Foto ${idx + 1}`}
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
                                        onClick={() => setSelectedImage(null)}
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
                                                <FaTimesCircle className="h-6 w-6" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab Timeline */}
                        {activeTab === "timeline" && (
                            <div>
                                <div className="mb-6">
                                    <h3 className="text-base font-bold text-ink-900">
                                        Riwayat Aktivitas
                                    </h3>
                                    <p className="mt-0.5 text-sm text-slate-500">
                                        Jejak rekam status dan perubahan pada
                                        laporan ini
                                    </p>
                                </div>

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
                                                                className="absolute bottom-0 left-4 top-9 w-px -translate-x-1/2 bg-slate-200"
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
                                                                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                                                                        <span className="font-medium text-slate-500">
                                                                            Dari:
                                                                        </span>
                                                                        <span
                                                                            className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-slate-700"
                                                                            title={
                                                                                timeline.old_value ||
                                                                                ""
                                                                            }
                                                                        >
                                                                            {formatMaybeDateRange(
                                                                                timeline.old_value,
                                                                            )}
                                                                        </span>
                                                                        <span className="text-slate-400">
                                                                            →
                                                                        </span>
                                                                        <span className="font-medium text-slate-500">
                                                                            Ke:
                                                                        </span>
                                                                        <span
                                                                            className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-slate-700"
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
                                                                <div className="mt-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                                                                    <span className="mb-1 block font-semibold text-slate-700">
                                                                        Keterangan:
                                                                    </span>
                                                                    {
                                                                        timeline.comment
                                                                    }
                                                                </div>
                                                            )}

                                                            <div className="mt-2 flex items-center text-xs text-slate-500">
                                                                <FaUser className="mr-1.5" />
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
                                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70">
                                        <EmptyState
                                            icon={FaHistory}
                                            title="Belum ada riwayat aktivitas"
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>
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
