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

const calendarStyles = `
  .rbc-calendar {
    min-height: 600px;
    font-family: inherit;
  }
  .rbc-header {
    padding: 1rem 0;
    font-weight: 700;
    color: #64748b;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid #f1f5f9;
  }
  .rbc-month-view {
    border: 1px solid #f1f5f9;
    border-radius: 1rem;
    overflow: hidden;
  }
  .rbc-day-bg {
    border-left: 1px solid #f1f5f9;
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
    color: #334155;
    text-align: right;
  }
  .rbc-event {
    background-color: #3b82f6;
    border-radius: 0.5rem;
    padding: 2px 5px;
    font-size: 0.85rem;
  }
  .rbc-toolbar button {
    color: #64748b;
    font-weight: 600;
    padding: 0.5rem 1rem;
    border-radius: 0.75rem;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }
  .rbc-toolbar button.rbc-active {
    background-color: #eff6ff;
    color: #2563eb;
    border-color: #bfdbfe;
    box-shadow: none;
  }
  .rbc-toolbar button:hover {
    background-color: #f8fafc;
    color: #1d4ed8;
    border-color: #bfdbfe;
  }
`;

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

    return (
        <>
            <style>{calendarStyles}</style>
            <Head title={`Jadwal Pekerjaan - ${anomalis.judul || ""}`} />
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
                                    <FaCalendarCheck className="text-2xl" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider border border-blue-100">
                                            Penjadwalan
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
                                        <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                                        <div className="flex items-center gap-2">
                                            <FaMapMarkerAlt className="text-blue-400" />
                                            {anomalis.gardu_induk?.name || "-"}
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

                    {/* Schedule Work Card - Only show if start and end dates are empty */}
                    {(!anomalis.tanggal_mulai || !anomalis.tanggal_selesai) && (
                        <div className="mb-10">
                            <div className="flex items-center gap-4 mb-6 px-4">
                                <div className="bg-blue-50 p-3 rounded-xl text-blue-600 ring-1 ring-blue-100">
                                    <FaCalendarCheck className="text-xl" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">
                                        Penjadwalan Pekerjaan
                                    </h2>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Silakan pilih rentang tanggal pada
                                        kalender dan lengkapi detail pekerjaan.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start px-4 pb-4">
                                {/* Calendar Section (Left) */}
                                <div className="lg:col-span-8 bg-white rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 p-6">
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
                                                backgroundColor: "#eff6ff",
                                                color: "#1e293b",
                                                border: "1px solid #bfdbfe",
                                                borderRadius: "0.5rem",
                                                display: "block",
                                            },
                                        })}
                                        dayPropGetter={(date) => {
                                            const today = new Date();
                                            today.setHours(0, 0, 0, 0);
                                            if (date < today) {
                                                return {
                                                    style: {
                                                        backgroundColor:
                                                            "#f8fafc",
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
                                <div className="lg:col-span-4 space-y-6 sticky top-24">
                                    {/* Selected Date Info Card */}
                                    <div className="bg-white rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
                                        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex justify-between items-center">
                                            <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                                <FaCalendarAlt className="text-blue-500" />
                                                Detail Jadwal
                                            </h3>
                                            {(dateRange.from ||
                                                dateRange.to) && (
                                                <button
                                                    onClick={handleClearDate}
                                                    className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1 bg-red-50 px-2 py-1 rounded-lg hover:bg-red-100 transition-colors"
                                                >
                                                    <FaTrash className="text-[10px]" />{" "}
                                                    Reset
                                                </button>
                                            )}
                                        </div>

                                        <div className="p-6">
                                            {dateRange?.from ? (
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                                            Mulai
                                                        </label>
                                                        <div className="text-slate-800 font-semibold text-lg border-b border-slate-100 pb-2">
                                                            {formatDate(
                                                                dateRange.from,
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-center text-slate-300">
                                                        <FaArrowRight className="rotate-90" />
                                                    </div>

                                                    <div>
                                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                                            Selesai
                                                        </label>
                                                        <div
                                                            className={`text-lg font-semibold border-b border-slate-100 pb-2 ${dateRange.to ? "text-slate-800" : "text-slate-300 italic"}`}
                                                        >
                                                            {dateRange.to
                                                                ? formatDate(
                                                                      dateRange.to,
                                                                  )
                                                                : "Pilih tanggal selesai"}
                                                        </div>
                                                    </div>

                                                    {dateRange.to && (
                                                        <div className="bg-blue-50 rounded-xl p-4 flex items-center justify-between border border-blue-100 mt-2">
                                                            <span className="text-sm font-medium text-blue-700">
                                                                Durasi Pekerjaan
                                                            </span>
                                                            <span className="text-lg font-bold text-blue-800">
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
                                                <div className="text-center py-8">
                                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                                                        <FaCalendarAlt className="text-2xl" />
                                                    </div>
                                                    <p className="text-slate-500 text-sm">
                                                        Belum ada tanggal
                                                        dipilih.
                                                    </p>
                                                    <p className="text-slate-400 text-xs mt-1">
                                                        Klik tanggal pada
                                                        kalender untuk memulai.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Notes Input */}
                                    <div className="bg-white rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 p-6">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            Catatan Pekerjaan{" "}
                                            <span className="font-normal text-slate-400">
                                                (Opsional)
                                            </span>
                                        </label>
                                        <textarea
                                            value={notes}
                                            onChange={(e) =>
                                                setNotes(e.target.value)
                                            }
                                            rows={4}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none text-slate-700 text-sm"
                                            placeholder="Instruksi khusus untuk tim..."
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        onClick={handleScheduleWork}
                                        disabled={
                                            isSubmitting ||
                                            !dateRange?.from ||
                                            !dateRange?.to
                                        }
                                        className={`${
                                            isSubmitting ||
                                            !dateRange?.from ||
                                            !dateRange?.to
                                                ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                                                : "bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5"
                                        } w-full py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center font-bold text-lg group`}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-3"></div>
                                                Menyimpan...
                                            </>
                                        ) : (
                                            <>
                                                <FaSave className="mr-3 text-xl" />
                                                Simpan Jadwal
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="border-b border-slate-100 bg-white sticky top-0 z-20">
                        <div className="flex overflow-x-auto no-scrollbar px-6 gap-6">
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
                                {
                                    id: "timeline",
                                    label: "Timeline",
                                    icon: FaHistory,
                                },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`group flex items-center py-5 border-b-2 transition-all duration-300 font-medium whitespace-nowrap px-1 ${
                                        activeTab === tab.id
                                            ? "border-blue-600 text-blue-600"
                                            : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                                    }`}
                                >
                                    <tab.icon
                                        className={`mr-2.5 text-lg transition-colors ${
                                            activeTab === tab.id
                                                ? "text-blue-600"
                                                : "text-slate-400 group-hover:text-slate-600"
                                        }`}
                                    />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-8 bg-slate-50/50 min-h-[400px]">
                        {/* Tab Informasi Umum */}
                        {activeTab === "informasi" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                                        alt={`Lampiran Foto ${idx + 1}`}
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
                                        onClick={() => setSelectedImage(null)}
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
                                                <FaTimesCircle className="h-6 w-6" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab Timeline */}
                        {activeTab === "timeline" && (
                            <div className="space-y-4">
                                <div className="flex items-center mb-6">
                                    <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600 mr-4 shadow-sm">
                                        <FaHistory className="text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">
                                            Riwayat Aktivitas
                                        </h3>
                                        <p className="text-slate-500 text-sm">
                                            Jejak rekam status dan perubahan
                                            pada laporan ini
                                        </p>
                                    </div>
                                </div>

                                {anomalis.timelines &&
                                anomalis.timelines.length > 0 ? (
                                    <div className="relative pl-4 space-y-8 before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-200 before:via-slate-200 before:to-transparent">
                                        {anomalis.timelines.map(
                                            (timeline, index) => (
                                                <div
                                                    key={timeline.id}
                                                    className="relative flex items-start group"
                                                >
                                                    <div
                                                        className={`absolute left-0 h-8 w-8 rounded-full border-4 border-white shadow-md flex items-center justify-center z-10 ${
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
                                                            <FaCheckCircle className="text-sm" />
                                                        )}
                                                        {timeline.event_type ===
                                                            "status_changed" && (
                                                            <FaExclamationCircle className="text-sm" />
                                                        )}
                                                        {timeline.event_type ===
                                                            "assigned" && (
                                                            <FaUserCheck className="text-sm" />
                                                        )}
                                                        {timeline.event_type ===
                                                            "approved" && (
                                                            <FaCheckCircle className="text-sm" />
                                                        )}
                                                        {timeline.event_type ===
                                                            "rejected" && (
                                                            <FaTimesCircle className="text-sm" />
                                                        )}
                                                        {timeline.event_type ===
                                                            "completed" && (
                                                            <FaCheckCircle className="text-sm" />
                                                        )}
                                                        {timeline.event_type ===
                                                            "scheduled" && (
                                                            <FaCalendarAlt className="text-sm" />
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
                                                            timeline.event_type,
                                                        ) && (
                                                            <FaInfoCircle className="text-sm" />
                                                        )}
                                                    </div>

                                                    <div className="ml-12 w-full bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] hover:shadow-md transition-shadow">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h4 className="text-base font-bold text-slate-800">
                                                                {
                                                                    timeline.description
                                                                }
                                                            </h4>
                                                            <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                                                                {formatDate(
                                                                    timeline.created_at,
                                                                )}
                                                            </span>
                                                        </div>

                                                        {timeline.old_value &&
                                                            timeline.new_value && (
                                                                <div className="mt-2 text-sm bg-slate-50 p-3 rounded-xl border border-slate-100 text-slate-600 mb-3">
                                                                    <div className="flex items-center flex-wrap gap-2">
                                                                        <span className="font-semibold text-slate-500">
                                                                            Dari:
                                                                        </span>
                                                                        <span
                                                                            className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700"
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
                                                                        <span className="font-semibold text-slate-500">
                                                                            Ke:
                                                                        </span>
                                                                        <span
                                                                            className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700"
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
                                                                </div>
                                                            )}

                                                        {timeline.comment && (
                                                            <div className="mt-2 text-sm text-slate-600 bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                                                                <span className="font-semibold text-blue-700 block mb-1">
                                                                    Keterangan:
                                                                </span>
                                                                {
                                                                    timeline.comment
                                                                }
                                                            </div>
                                                        )}

                                                        <div className="mt-3 flex items-center text-xs font-medium text-slate-400">
                                                            <FaUser className="mr-1.5" />
                                                            <span>
                                                                {timeline.user
                                                                    ?.name ||
                                                                    "Sistem"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                        <div className="bg-white p-4 rounded-full shadow-sm inline-block mb-4">
                                            <FaHistory className="text-4xl text-slate-300" />
                                        </div>
                                        <p className="text-slate-500 font-medium">
                                            Belum ada riwayat aktivitas
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
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
