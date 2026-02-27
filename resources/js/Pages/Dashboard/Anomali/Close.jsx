import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, router } from "@inertiajs/react";
import axios from "axios";
import { Popover, Transition } from "@headlessui/react";
import { Fragment, Suspense, lazy, useState } from "react";
import { useSnackbar } from "notistack";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
    FaArrowLeft,
    FaCheck,
    FaCloudUploadAlt,
    FaFilePdf,
    FaTimes,
} from "react-icons/fa";
import {
    formatBytes,
    formatWorkDateDisplay,
    validateCloseForm,
} from "@/Pages/Dashboard/Anomali/closeAnomaliUtils";

const PdfPreviewer = lazy(
    () => import("@/Components/Dashboard/Anomali/PdfPreviewer"),
);

const MAX_PDF_BYTES = 5 * 1024 * 1024;

function StatusPill({ status }) {
    let cls = "bg-slate-100 text-slate-700 border-slate-200";
    if (status === "New") cls = "bg-blue-50 text-blue-700 border-blue-200";
    else if (status === "Open") cls = "bg-sky-50 text-sky-700 border-sky-200";
    else if (status === "In Progress")
        cls = "bg-amber-50 text-amber-700 border-amber-200";
    else if (status === "Pending")
        cls = "bg-orange-50 text-orange-700 border-orange-200";
    else if (status === "Close")
        cls = "bg-emerald-50 text-emerald-700 border-emerald-200";
    else if (status === "Rejected")
        cls = "bg-rose-50 text-rose-700 border-rose-200";

    return (
        <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}
        >
            {status || "-"}
        </span>
    );
}

export default function Close({ anomalis }) {
    const { enqueueSnackbar } = useSnackbar();
    const [tanggalPekerjaan, setTanggalPekerjaan] = useState("");
    const [lampiranFiles, setLampiranFiles] = useState([]);
    const [activePdfIndex, setActivePdfIndex] = useState(0);
    const [fieldErrors, setFieldErrors] = useState({
        tanggal_pekerjaan: "",
        lampiran_pdf: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(null);
    const [serverError, setServerError] = useState("");

    const activePdf = lampiranFiles[activePdfIndex] || null;
    const displayWorkDate = formatWorkDateDisplay(tanggalPekerjaan, id);

    const validate = () => {
        const { errors, valid } = validateCloseForm({
            tanggalPekerjaan,
            lampiranPdf: activePdf,
            maxPdfBytes: MAX_PDF_BYTES,
        });
        setFieldErrors(errors);
        return valid;
    };

    const onPickPdf = (e) => {
        const files = Array.from(e.target.files || []).filter(Boolean);
        e.target.value = "";
        if (!files.length) return;
        setLampiranFiles(files);
        setActivePdfIndex(0);
        setFieldErrors((prev) => ({ ...prev, lampiran_pdf: "" }));
        setServerError("");
    };

    const removePdfAt = (idx) => {
        const next = lampiranFiles.filter((_, i) => i !== idx);
        setLampiranFiles(next);
        setActivePdfIndex((prev) => {
            if (next.length === 0) return 0;
            if (idx < prev) return prev - 1;
            if (idx === prev)
                return Math.max(0, Math.min(prev, next.length - 1));
            return prev;
        });
        setFieldErrors((prev) => ({ ...prev, lampiran_pdf: "" }));
        setServerError("");
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setServerError("");
        if (!validate()) return;

        setIsSubmitting(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append("tanggal_pekerjaan", tanggalPekerjaan);
        formData.append("lampiran_pdf", activePdf);

        try {
            const res = await axios.post(
                route("dashboard.anomali.close.store", anomalis.slug),
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        "X-Requested-With": "XMLHttpRequest",
                        Accept: "application/json",
                    },
                    onUploadProgress: (evt) => {
                        if (!evt?.total) return;
                        setUploadProgress(
                            Math.round((evt.loaded / evt.total) * 100),
                        );
                    },
                },
            );

            enqueueSnackbar(res?.data?.message || "Anomali berhasil ditutup.", {
                variant: "success",
            });

            const redirect = res?.data?.redirect;
            if (redirect) {
                window.location.href = redirect;
                return;
            }
            router.get(route("dashboard.anomali.index"));
        } catch (err) {
            let msg = "Gagal menutup anomali.";
            if (err?.response?.status === 422) {
                const errors = err.response.data?.errors || {};
                setFieldErrors((prev) => ({
                    ...prev,
                    tanggal_pekerjaan:
                        errors.tanggal_pekerjaan?.[0] || prev.tanggal_pekerjaan,
                    lampiran_pdf: errors.lampiran_pdf?.[0] || prev.lampiran_pdf,
                }));
                msg = err.response.data?.message || "Validasi gagal.";
                setServerError(msg);
            } else {
                msg =
                    err?.response?.data?.message ||
                    "Terjadi kesalahan saat menutup anomali.";
                setServerError(msg);
            }

            enqueueSnackbar(msg, {
                variant: "error",
            });
        } finally {
            setIsSubmitting(false);
            setUploadProgress(null);
        }
    };

    return (
        <DashboardLayout title="Tutup Anomali">
            <Head title="Tutup Anomali" />

            <div className="min-h-screen bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-sky-600 to-cyan-600 p-1 shadow-sm">
                        <div className="rounded-[22px] bg-white/95 backdrop-blur-sm px-6 py-5">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="h-11 w-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shadow-sm">
                                        <FaCheck aria-hidden="true" />
                                    </div>
                                    <div className="min-w-0">
                                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                                            Tutup Anomali
                                        </h1>
                                        <p className="mt-1 text-sm text-slate-600">
                                            Unggah PDF penutupan dan isi tanggal
                                            pekerjaan.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <Link
                                        href={route("dashboard.anomali.index")}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30"
                                    >
                                        <FaArrowLeft
                                            className="text-xs"
                                            aria-hidden="true"
                                        />
                                        Kembali
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-5 space-y-6">
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                                            Ringkasan
                                        </div>
                                        <div className="mt-1 text-sm font-bold text-slate-900">
                                            Anomali
                                        </div>
                                    </div>
                                    <StatusPill status={anomalis?.status} />
                                </div>
                                <div className="p-6 grid grid-cols-1 gap-4">
                                    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                                        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                            Judul
                                        </div>
                                        <div className="mt-1 text-sm font-semibold text-slate-900">
                                            {anomalis?.judul || "-"}
                                        </div>
                                    </div>
                                    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                                        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                            Gardu Induk
                                        </div>
                                        <div className="mt-1 text-sm font-semibold text-slate-900">
                                            {anomalis?.gardu_induk?.name || "-"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <form
                                onSubmit={onSubmit}
                                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                            >
                                <div className="px-6 py-4 border-b border-slate-100">
                                    <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                                        Form
                                    </div>
                                    <div className="mt-1 text-sm font-bold text-slate-900">
                                        Penutupan
                                    </div>
                                </div>

                                <div className="p-6 space-y-6">
                                    {serverError ? (
                                        <div
                                            className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                                            role="alert"
                                        >
                                            {serverError}
                                        </div>
                                    ) : null}

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Tanggal Pekerjaan
                                        </label>

                                        <Popover className="relative mt-2">
                                            {({ open }) => (
                                                <>
                                                    <Popover.Button
                                                        type="button"
                                                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30"
                                                        disabled={isSubmitting}
                                                        aria-label="Pilih tanggal pekerjaan"
                                                    >
                                                        <div className="flex items-center justify-between gap-3">
                                                            <div className="min-w-0">
                                                                <div className="text-sm font-semibold text-slate-900">
                                                                    {displayWorkDate ||
                                                                        "Pilih tanggal"}
                                                                </div>
                                                                <div className="mt-0.5 text-xs text-slate-500">
                                                                    Format:
                                                                    YYYY-MM-DD
                                                                </div>
                                                            </div>
                                                            <div
                                                                className={
                                                                    open
                                                                        ? "text-sky-700"
                                                                        : "text-slate-400"
                                                                }
                                                            >
                                                                <span className="text-xs font-semibold">
                                                                    Kalender
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </Popover.Button>

                                                    <Transition
                                                        as={Fragment}
                                                        enter="transition ease-out duration-150"
                                                        enterFrom="opacity-0 translate-y-1"
                                                        enterTo="opacity-100 translate-y-0"
                                                        leave="transition ease-in duration-100"
                                                        leaveFrom="opacity-100 translate-y-0"
                                                        leaveTo="opacity-0 translate-y-1"
                                                    >
                                                        <Popover.Panel className="absolute z-20 mt-2 w-full rounded-2xl border border-slate-200 bg-white p-3 shadow-lg">
                                                            <DayPicker
                                                                mode="single"
                                                                selected={
                                                                    tanggalPekerjaan
                                                                        ? new Date(
                                                                              `${tanggalPekerjaan}T00:00:00`,
                                                                          )
                                                                        : undefined
                                                                }
                                                                onSelect={(
                                                                    d,
                                                                ) => {
                                                                    if (!d)
                                                                        return;
                                                                    setTanggalPekerjaan(
                                                                        format(
                                                                            d,
                                                                            "yyyy-MM-dd",
                                                                        ),
                                                                    );
                                                                    setFieldErrors(
                                                                        (
                                                                            prev,
                                                                        ) => ({
                                                                            ...prev,
                                                                            tanggal_pekerjaan:
                                                                                "",
                                                                        }),
                                                                    );
                                                                    setServerError(
                                                                        "",
                                                                    );
                                                                }}
                                                                locale={id}
                                                                disabled={{
                                                                    after: new Date(),
                                                                }}
                                                            />
                                                        </Popover.Panel>
                                                    </Transition>
                                                </>
                                            )}
                                        </Popover>

                                        <input
                                            type="date"
                                            value={tanggalPekerjaan}
                                            onChange={(e) => {
                                                setTanggalPekerjaan(
                                                    e.target.value,
                                                );
                                                setFieldErrors((prev) => ({
                                                    ...prev,
                                                    tanggal_pekerjaan: "",
                                                }));
                                                setServerError("");
                                            }}
                                            disabled={isSubmitting}
                                            className="mt-3 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:ring-sky-500/30"
                                            aria-label="Input tanggal pekerjaan"
                                        />

                                        {fieldErrors.tanggal_pekerjaan ? (
                                            <div className="mt-2 text-xs text-rose-600 font-semibold">
                                                {fieldErrors.tanggal_pekerjaan}
                                            </div>
                                        ) : null}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Upload PDF
                                        </label>

                                        <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                                        <FaFilePdf
                                                            className="text-rose-600"
                                                            aria-hidden="true"
                                                        />
                                                        Lampiran Penutupan
                                                    </div>
                                                    <div className="mt-1 text-xs text-slate-500">
                                                        Hanya PDF. Maks{" "}
                                                        {formatBytes(
                                                            MAX_PDF_BYTES,
                                                        )}
                                                        .
                                                    </div>
                                                    {activePdf ? (
                                                        <div className="mt-3 text-xs text-slate-700">
                                                            <div className="font-semibold truncate max-w-[420px]">
                                                                {activePdf.name}
                                                            </div>
                                                            <div className="mt-1 text-slate-500">
                                                                {formatBytes(
                                                                    activePdf.size,
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : null}
                                                </div>
                                                {lampiranFiles.length ? (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removePdfAt(
                                                                activePdfIndex,
                                                            )
                                                        }
                                                        disabled={isSubmitting}
                                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30"
                                                    >
                                                        <FaTimes aria-hidden="true" />
                                                        Hapus
                                                    </button>
                                                ) : null}
                                            </div>

                                            {lampiranFiles.length ? (
                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    {lampiranFiles.map(
                                                        (f, idx) => {
                                                            const active =
                                                                idx ===
                                                                activePdfIndex;
                                                            return (
                                                                <button
                                                                    key={`${f.name}-${idx}`}
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setActivePdfIndex(
                                                                            idx,
                                                                        )
                                                                    }
                                                                    className={
                                                                        active
                                                                            ? "rounded-xl border border-sky-200 bg-white px-3 py-1.5 text-xs font-semibold text-sky-800 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30"
                                                                            : "rounded-xl border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30"
                                                                    }
                                                                    aria-current={
                                                                        active
                                                                            ? "true"
                                                                            : undefined
                                                                    }
                                                                >
                                                                    <span className="max-w-[240px] truncate block">
                                                                        {f.name}
                                                                    </span>
                                                                </button>
                                                            );
                                                        },
                                                    )}
                                                </div>
                                            ) : null}

                                            <div className="mt-4 flex items-center gap-3">
                                                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-sky-700 text-white text-sm font-semibold hover:bg-sky-800 transition cursor-pointer focus-within:ring-2 focus-within:ring-sky-500/30">
                                                    <FaCloudUploadAlt aria-hidden="true" />
                                                    Pilih PDF
                                                    <input
                                                        type="file"
                                                        accept="application/pdf,.pdf"
                                                        className="hidden"
                                                        onChange={onPickPdf}
                                                        disabled={isSubmitting}
                                                        multiple
                                                        aria-label="Pilih file PDF"
                                                    />
                                                </label>

                                                {uploadProgress !== null &&
                                                isSubmitting ? (
                                                    <div className="flex-1">
                                                        <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-sky-600 to-cyan-600 transition-all"
                                                                style={{
                                                                    width: `${uploadProgress}%`,
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="mt-1 text-[11px] text-slate-500 font-semibold">
                                                            Uploading{" "}
                                                            {uploadProgress}%
                                                        </div>
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>

                                        {fieldErrors.lampiran_pdf ? (
                                            <div className="mt-2 text-xs text-rose-600 font-semibold">
                                                {fieldErrors.lampiran_pdf}
                                            </div>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div className="text-xs text-slate-500">
                                        PDF yang dikirim:{" "}
                                        <span className="font-semibold text-slate-700">
                                            {activePdf ? activePdf.name : "-"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-end gap-3">
                                        <Link
                                            href={route(
                                                "dashboard.anomali.index",
                                            )}
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30"
                                        >
                                            Batal
                                        </Link>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-sm font-semibold hover:from-emerald-700 hover:to-emerald-600 transition disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30"
                                        >
                                            {isSubmitting ? (
                                                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                            ) : (
                                                <FaCheck aria-hidden="true" />
                                            )}
                                            {isSubmitting
                                                ? "Memproses..."
                                                : "Submit Penutupan"}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="lg:col-span-7">
                            <Suspense
                                fallback={
                                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                                        <div className="px-5 py-4 border-b border-slate-100">
                                            <div className="text-sm font-bold text-slate-900">
                                                Preview PDF
                                            </div>
                                            <div className="mt-1 text-xs text-slate-500">
                                                Memuat komponen preview...
                                            </div>
                                        </div>
                                        <div className="h-[55vh] sm:h-[62vh] lg:h-[70vh] bg-slate-50 flex items-center justify-center">
                                            <div className="h-10 w-10 rounded-full border-4 border-slate-200 border-t-sky-600 animate-spin" />
                                        </div>
                                    </div>
                                }
                            >
                                <PdfPreviewer
                                    files={lampiranFiles}
                                    activeIndex={activePdfIndex}
                                    onActiveIndexChange={setActivePdfIndex}
                                />
                            </Suspense>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
