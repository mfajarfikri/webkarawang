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
    FaCalendarAlt,
    FaCheck,
    FaCloudUploadAlt,
    FaFilePdf,
    FaTimes,
} from "react-icons/fa";
import PageHeader from "@/Components/Dashboard/PageHeader";
import { Card } from "@/Components/Dashboard/ui";
import StageBadge from "@/Components/Anomali/StageBadge";
import {
    formatBytes,
    formatWorkDateDisplay,
    validateCloseForm,
} from "@/Pages/Dashboard/Anomali/closeAnomaliUtils";

const PdfPreviewer = lazy(
    () => import("@/Components/Dashboard/Anomali/PdfPreviewer"),
);

const MAX_PDF_BYTES = 5 * 1024 * 1024;

function SummaryItem({ label, children }) {
    return (
        <div className="min-w-0">
            <dt className="text-xs font-medium text-slate-500">{label}</dt>
            <dd className="mt-1 text-sm font-semibold text-ink-900">
                {children}
            </dd>
        </div>
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

    const onSelectDay = (d) => {
        if (!d) return;
        setTanggalPekerjaan(format(d, "yyyy-MM-dd"));
        setFieldErrors((prev) => ({ ...prev, tanggal_pekerjaan: "" }));
        setServerError("");
    };

    return (
        <DashboardLayout title="Tutup Anomali">
            <Head title="Tutup Anomali" />

            <PageHeader
                title="Tutup Anomali"
                description="Langkah terakhir: unggah PDF penutupan dan isi tanggal pekerjaan selesai."
                leading={
                    <Link
                        href={route("dashboard.anomali.index")}
                        className="btn-icon shrink-0 border border-slate-200 bg-white"
                        aria-label="Kembali"
                        title="Kembali ke daftar anomali"
                    >
                        <FaArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                }
            >
                <StageBadge anomali={anomalis} />
            </PageHeader>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="space-y-6 lg:col-span-5">
                    <Card title="Ringkasan anomali">
                        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <SummaryItem label="Judul">
                                    {anomalis?.judul || "-"}
                                </SummaryItem>
                            </div>
                            <SummaryItem label="Gardu Induk">
                                {anomalis?.gardu_induk?.name || "-"}
                            </SummaryItem>
                            <SummaryItem label="Status">
                                {anomalis?.status || "-"}
                            </SummaryItem>
                        </dl>
                    </Card>

                    <form onSubmit={onSubmit} className="surface">
                        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                            <h2 className="text-base font-bold text-ink-900">
                                Form penutupan
                            </h2>
                            <p className="mt-0.5 text-sm text-slate-500">
                                Semua isian wajib diisi sebelum anomali ditutup.
                            </p>
                        </div>

                        <div className="space-y-6 p-5 sm:p-6">
                            {serverError ? (
                                <div
                                    className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                                    role="alert"
                                >
                                    {serverError}
                                </div>
                            ) : null}

                            <div>
                                <label
                                    htmlFor="tanggal-pekerjaan"
                                    className="field-label"
                                >
                                    Tanggal Pekerjaan
                                </label>

                                <Popover className="relative">
                                    {({ open }) => (
                                        <>
                                            <Popover.Button
                                                id="tanggal-pekerjaan"
                                                type="button"
                                                className="field-input text-left"
                                                disabled={isSubmitting}
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <div
                                                            className={`text-sm font-semibold ${
                                                                displayWorkDate
                                                                    ? "text-ink-900"
                                                                    : "text-slate-400"
                                                            }`}
                                                        >
                                                            {displayWorkDate ||
                                                                "Pilih tanggal"}
                                                        </div>
                                                        <div className="mt-0.5 text-xs text-slate-500">
                                                            Tanggal pekerjaan
                                                            selesai, paling
                                                            lambat hari ini
                                                        </div>
                                                    </div>
                                                    <div
                                                        className={
                                                            open
                                                                ? "flex items-center gap-1.5 text-brand-700"
                                                                : "flex items-center gap-1.5 text-slate-400"
                                                        }
                                                    >
                                                        <FaCalendarAlt
                                                            className="h-3.5 w-3.5"
                                                            aria-hidden="true"
                                                        />
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
                                                <Popover.Panel
                                                    className="absolute left-0 z-30 mt-2 w-max max-w-full rounded-2xl border border-slate-200 bg-white p-3 shadow-lift"
                                                >
                                                    {({ close }) => (
                                                        <DayPicker
                                                            mode="single"
                                                            selected={
                                                                tanggalPekerjaan
                                                                    ? new Date(
                                                                          `${tanggalPekerjaan}T00:00:00`,
                                                                      )
                                                                    : undefined
                                                            }
                                                            onSelect={(d) => {
                                                                onSelectDay(d);
                                                                if (d) close();
                                                            }}
                                                            locale={id}
                                                            disabled={{
                                                                after: new Date(),
                                                            }}
                                                            style={{
                                                                "--rdp-accent-color":
                                                                    "#0086c9",
                                                                "--rdp-accent-background-color":
                                                                    "#e0f2fe",
                                                                "--rdp-today-color":
                                                                    "#0086c9",
                                                            }}
                                                        />
                                                    )}
                                                </Popover.Panel>
                                            </Transition>
                                        </>
                                    )}
                                </Popover>

                                {fieldErrors.tanggal_pekerjaan ? (
                                    <p className="field-error">
                                        {fieldErrors.tanggal_pekerjaan}
                                    </p>
                                ) : null}
                            </div>

                            <div>
                                <label className="field-label">Upload PDF</label>

                                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                                                <FaFilePdf
                                                    className="text-rose-600"
                                                    aria-hidden="true"
                                                />
                                                Lampiran Penutupan
                                            </div>
                                            <div className="mt-1 text-xs text-slate-500">
                                                Hanya PDF. Maks{" "}
                                                {formatBytes(MAX_PDF_BYTES)}.
                                            </div>
                                            {activePdf ? (
                                                <div className="mt-3 text-xs text-slate-700">
                                                    <div className="max-w-[420px] truncate font-semibold">
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
                                                    removePdfAt(activePdfIndex)
                                                }
                                                disabled={isSubmitting}
                                                className="btn-ghost btn-sm text-rose-700 hover:border-rose-200 hover:bg-rose-50"
                                            >
                                                <FaTimes aria-hidden="true" />
                                                Hapus
                                            </button>
                                        ) : null}
                                    </div>

                                    {lampiranFiles.length ? (
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {lampiranFiles.map((f, idx) => {
                                                const active =
                                                    idx === activePdfIndex;
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
                                                                ? "rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30"
                                                                : "rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30"
                                                        }
                                                        aria-current={
                                                            active
                                                                ? "true"
                                                                : undefined
                                                        }
                                                    >
                                                        <span className="block max-w-[240px] truncate">
                                                            {f.name}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : null}

                                    <div className="mt-4 flex items-center gap-3">
                                        <label className="btn-ghost btn-sm cursor-pointer focus-within:ring-2 focus-within:ring-brand-500/30">
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
                                                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                                                    <div
                                                        className="h-full bg-brand-600 transition-all"
                                                        style={{
                                                            width: `${uploadProgress}%`,
                                                        }}
                                                    />
                                                </div>
                                                <div className="mt-1 text-[11px] font-semibold text-slate-500">
                                                    Uploading {uploadProgress}%
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>

                                {fieldErrors.lampiran_pdf ? (
                                    <p className="field-error">
                                        {fieldErrors.lampiran_pdf}
                                    </p>
                                ) : null}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 rounded-b-2xl border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <div className="min-w-0 text-xs text-slate-500">
                                PDF yang dikirim:{" "}
                                <span className="font-semibold text-slate-700">
                                    {activePdf ? activePdf.name : "-"}
                                </span>
                            </div>
                            <div className="flex items-center justify-end gap-3">
                                <Link
                                    href={route("dashboard.anomali.index")}
                                    className="btn-ghost"
                                >
                                    Batal
                                </Link>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn-brand"
                                >
                                    {isSubmitting ? (
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
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
                            <div className="surface overflow-hidden">
                                <div className="border-b border-slate-100 px-5 py-4">
                                    <div className="text-sm font-bold text-ink-900">
                                        Preview PDF
                                    </div>
                                    <div className="mt-1 text-xs text-slate-500">
                                        Memuat komponen preview...
                                    </div>
                                </div>
                                <div className="flex h-[55vh] items-center justify-center bg-slate-50 sm:h-[62vh] lg:h-[70vh]">
                                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600" />
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
        </DashboardLayout>
    );
}
