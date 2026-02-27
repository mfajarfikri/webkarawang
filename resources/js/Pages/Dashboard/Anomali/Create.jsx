import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, router } from "@inertiajs/react";
import { useForm } from "@inertiajs/react";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import { useState } from "react";
import {
    FaFileAlt,
    FaPlus,
    FaTrash,
    FaCalendarAlt,
    FaTools,
    FaSearch,
    FaTag,
    FaCheckCircle,
    FaClipboard,
} from "react-icons/fa";
import { FaCheck, FaCheckToSlot } from "react-icons/fa6";
import ApplicationLogo from "@/Components/ApplicationLogo";
import { Switch, Dialog, Transition, Listbox } from "@headlessui/react";
import { Fragment } from "react";
import { ChevronUpDownIcon } from "@heroicons/react/24/solid";
import React from "react";
import axios from "axios";
import { useSnackbar } from "notistack";
import Compressor from "compressorjs";
import { formatDate } from "@/Components/Utils/formatDate";
import { format, isValid, parseISO } from "date-fns";
import { id } from "date-fns/locale";

export default function Create({
    gardus = [],
    kategoris = [],
    users = [],
    defaultGarduId = null,
    userWilayah = null,
}) {
    const { enqueueSnackbar } = useSnackbar();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [compressionState, setCompressionState] = useState({
        running: false,
        current: 0,
        total: 0,
        fileName: "",
    });
    const [uploadProgress, setUploadProgress] = useState(null);
    const { data, setData, errors, processing, reset } = useForm({
        judul: "",
        ultg: userWilayah || "",
        gardu_id: defaultGarduId || "",
        bagian: "",
        tipe: "",
        kategori_id: "",
        user_id: users.id,
        peralatan: "",
        merek: "",
        tipe_alat: "",
        no_seri: "",
        harga: "",
        kode_asset: "",
        tahun_operasi: "",
        tahun_buat: "",
        penempatan_alat: "",
        penyebab: "",
        akibat: "",
        tanggal_kejadian: "",
        deskripsi: "",
        lampiran_foto: [],
        usul_saran: "",
    });

    const filteredGarduOptions = React.useMemo(() => {
        if (userWilayah === "UPT Karawang") {
            return gardus;
        }
        return gardus.filter((g) => g.ultg === userWilayah);
    }, [gardus, userWilayah]);

    // Jika userWilayah berubah, update data.ultg
    React.useEffect(() => {
        if (userWilayah) {
            setData("ultg", userWilayah);
        }
    }, [userWilayah]);

    // Jika defaultGarduId berubah (misal user switch), update data.gardu_id
    React.useEffect(() => {
        if (defaultGarduId) {
            setData("gardu_id", defaultGarduId);
        }
    }, [defaultGarduId]);

    function findById(arr, id) {
        return arr.find((item) => String(item.id) === String(id)) || null;
    }
    const ultgOptions = [
        { id: "ULTG Karawang", name: "ULTG Karawang" },
        { id: "ULTG Purwakarta", name: "ULTG Purwakarta" },
    ];
    const bagianOptions = [
        { id: "Banghal", name: "Banghal" },
        { id: "Hargi", name: "Hargi" },
        { id: "Harjar", name: "Harjar" },
        { id: "Harpro", name: "Harpro" },
        { id: "K3L", name: "K3L" },
    ];
    const tipeOptions = [
        { id: "Major", name: "Major" },
        { id: "Minor", name: "Minor" },
    ];

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const [preview, setPreview] = useState([]);
    const [previewModal, setPreviewModal] = useState(false);
    const [previewIndex, setPreviewIndex] = useState(0);
    const MAX_FILES = 4;

    const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
    const IMAGE_QUALITY_START = 0.9;
    const IMAGE_QUALITY_MIN = 0.75;
    const IMAGE_MAX_DIMENSION = 1920;

    const formatBytes = (bytes) => {
        if (!bytes && bytes !== 0) return "";
        const units = ["B", "KB", "MB", "GB"];
        let val = bytes;
        let unitIndex = 0;
        while (val >= 1024 && unitIndex < units.length - 1) {
            val /= 1024;
            unitIndex += 1;
        }
        const precision = unitIndex === 0 ? 0 : unitIndex === 1 ? 0 : 2;
        return `${val.toFixed(precision)} ${units[unitIndex]}`;
    };

    const extensionForMime = (mime) => {
        if (mime === "image/png") return "png";
        if (mime === "image/webp") return "webp";
        return "jpg";
    };

    const replaceFileExtension = (name, ext) => {
        const base = name?.includes(".")
            ? name.slice(0, name.lastIndexOf("."))
            : name;
        return `${base}.${ext}`;
    };

    const compressWithCompressor = (file, { quality, mimeType }) => {
        return new Promise((resolve, reject) => {
            new Compressor(file, {
                quality,
                mimeType,
                maxWidth: IMAGE_MAX_DIMENSION,
                maxHeight: IMAGE_MAX_DIMENSION,
                convertSize: Infinity,
                success(result) {
                    resolve(result);
                },
                error(err) {
                    reject(err);
                },
            });
        });
    };

    const compressToMaxBytes = async (file) => {
        if (!file || !(file instanceof File)) return null;
        if (file.size <= MAX_IMAGE_BYTES) return file;

        const originalType = file.type;
        const targetMimeType =
            originalType === "image/png" || originalType === "image/jpeg"
                ? originalType
                : "image/jpeg";

        const tryCompress = async ({ quality, mimeType }) => {
            const blob = await compressWithCompressor(file, {
                quality,
                mimeType,
            });
            const ext = extensionForMime(mimeType);
            const name = replaceFileExtension(file.name || "image", ext);
            return new File([blob], name, {
                type: mimeType,
                lastModified: Date.now(),
            });
        };

        let quality = IMAGE_QUALITY_START;
        let last = null;

        while (quality >= IMAGE_QUALITY_MIN) {
            const attempt = await tryCompress({
                quality,
                mimeType: targetMimeType,
            });
            last = attempt;
            if (attempt.size <= MAX_IMAGE_BYTES) return attempt;
            quality = Math.round((quality - 0.05) * 100) / 100;
        }

        if (originalType === "image/png") {
            quality = IMAGE_QUALITY_START;
            while (quality >= IMAGE_QUALITY_MIN) {
                const attempt = await tryCompress({
                    quality,
                    mimeType: "image/jpeg",
                });
                last = attempt;
                if (attempt.size <= MAX_IMAGE_BYTES) return attempt;
                quality = Math.round((quality - 0.05) * 100) / 100;
            }
        }

        return last;
    };
    const handleFileChange = async (e) => {
        const inputFiles = Array.from(e.target.files || []);
        e.target.value = "";

        const imageFiles = inputFiles.filter((file) =>
            file?.type?.startsWith("image/"),
        );

        const remainingSlots = Math.max(0, MAX_FILES - preview.length);
        const candidates = imageFiles.slice(0, remainingSlots);

        if (candidates.length === 0) {
            if (inputFiles.length > 0 && preview.length >= MAX_FILES) {
                enqueueSnackbar(`Maksimal ${MAX_FILES} file gambar.`, {
                    variant: "error",
                });
            }
            return;
        }

        const needsCompression = candidates.some(
            (f) => f.size > MAX_IMAGE_BYTES,
        );
        if (needsCompression) {
            setCompressionState({
                running: true,
                current: 0,
                total: candidates.length,
                fileName: "",
            });
        }

        const acceptedFiles = [];
        const acceptedPreviews = [];
        let skippedCount = 0;

        for (let i = 0; i < candidates.length; i += 1) {
            const file = candidates[i];
            if (needsCompression) {
                setCompressionState({
                    running: true,
                    current: i + 1,
                    total: candidates.length,
                    fileName: file?.name || "",
                });
            }

            try {
                const processed =
                    file.size > MAX_IMAGE_BYTES
                        ? await compressToMaxBytes(file)
                        : file;

                if (!processed) {
                    skippedCount += 1;
                    continue;
                }

                if (processed.size > MAX_IMAGE_BYTES) {
                    skippedCount += 1;
                    enqueueSnackbar(
                        `Gagal mengompres "${file.name}" ke <= 2MB (hasil: ${formatBytes(processed.size)}).`,
                        { variant: "error" },
                    );
                    continue;
                }

                acceptedFiles.push(processed);
                acceptedPreviews.push(URL.createObjectURL(processed));
            } catch (err) {
                skippedCount += 1;
                enqueueSnackbar(`Gagal mengompres "${file.name}".`, {
                    variant: "error",
                });
            }
        }

        if (needsCompression) {
            setCompressionState({
                running: false,
                current: 0,
                total: 0,
                fileName: "",
            });
        }

        if (skippedCount > 0) {
            enqueueSnackbar(
                `${skippedCount} file tidak ditambahkan karena gagal kompres/validasi.`,
                { variant: "warning" },
            );
        }

        if (acceptedFiles.length) {
            setData("lampiran_foto", [...data.lampiran_foto, ...acceptedFiles]);
            setPreview([...preview, ...acceptedPreviews]);
        }
    };
    const handleRemoveImage = (idx) => {
        const newPreview = preview.filter((_, i) => i !== idx);
        const newFiles = data.lampiran_foto.filter((_, i) => i !== idx);
        setPreview(newPreview);
        setData("lampiran_foto", newFiles);
        // Jika sedang preview gambar yang dihapus
        if (previewModal) {
            if (idx === previewIndex) {
                // Jika masih ada gambar lain, pindah ke gambar berikutnya/awal, jika tidak tutup modal
                if (newPreview.length === 0) {
                    setPreviewModal(false);
                } else if (idx >= newPreview.length) {
                    setPreviewIndex(newPreview.length - 1);
                }
            } else if (idx < previewIndex) {
                setPreviewIndex(previewIndex - 1);
            }
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (compressionState.running) {
            enqueueSnackbar("Tunggu proses kompresi selesai.", {
                variant: "warning",
            });
            return;
        }

        const oversized = (data.lampiran_foto || []).find(
            (f) => f?.size > MAX_IMAGE_BYTES,
        );
        if (oversized) {
            enqueueSnackbar(
                `Ukuran file "${oversized.name}" melebihi 2MB. Hapus lalu upload ulang.`,
                { variant: "error" },
            );
            return;
        }

        setIsSubmitting(true);
        setUploadProgress(0);
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (key === "lampiran_foto") {
                value.forEach((file) =>
                    formData.append("lampiran_foto[]", file),
                );
            } else {
                formData.append(key, value);
            }
        });
        try {
            const response = await axios.post(
                route("dashboard.anomali.store"),
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        "X-Requested-With": "XMLHttpRequest",
                        Accept: "application/json",
                    },
                    onUploadProgress: (evt) => {
                        if (!evt?.total) return;
                        const pct = Math.round((evt.loaded / evt.total) * 100);
                        setUploadProgress(pct);
                    },
                },
            );
            enqueueSnackbar("Anomali berhasil dibuat!", { variant: "success" });
            reset();
            setPreview([]);
            router.get(route("dashboard.anomali.index"));
        } catch (error) {
            let errorMsg = "Error |";
            if (
                error.response &&
                error.response.data &&
                error.response.data.message
            ) {
                errorMsg += " " + error.response.data.message;
            }
            enqueueSnackbar(errorMsg, { variant: "error" });
        } finally {
            setIsSubmitting(false);
            setUploadProgress(null);
        }
    };

    const isUltgDisabled = userWilayah && userWilayah !== "UPT Karawang";

    // Date picker state and functions
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(() => {
        // Initialize with current date if no date is selected
        return data.tanggal_kejadian
            ? parseISO(data.tanggal_kejadian)
            : new Date();
    });

    // Format date for display
    const formatDisplayDate = (dateString) => {
        if (!dateString) return "";
        try {
            const date = parseISO(dateString);
            if (isValid(date)) {
                return format(date, "dd MMMM yyyy", { locale: id });
            }
        } catch (error) {
            console.error("Error parsing date:", error);
        }
        return dateString;
    };

    // Handle date selection
    const handleDateSelect = (date) => {
        const formattedDate = format(date, "yyyy-MM-dd");
        setData("tanggal_kejadian", formattedDate);
        setSelectedDate(date);
        setShowDatePicker(false);
    };

    // Validate date (cannot be in the future)
    const isDateValid = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date <= today;
    };

    // Generate calendar days
    const generateCalendarDays = () => {
        const today = new Date();
        const currentMonth = selectedDate
            ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
            : new Date(today.getFullYear(), today.getMonth(), 1);
        const firstDay = new Date(currentMonth);
        const lastDay = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth() + 1,
            0,
        );

        const days = [];
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            days.push(date);
        }

        return days;
    };

    // Navigate months
    const navigateMonth = (direction) => {
        if (!selectedDate) return;
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() + direction);
        setSelectedDate(newDate);
    };

    // Handle click outside to close date picker and keyboard navigation
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                showDatePicker &&
                !event.target.closest(".date-picker-container")
            ) {
                setShowDatePicker(false);
            }
        };

        const handleKeyDown = (event) => {
            if (showDatePicker) {
                if (event.key === "Escape") {
                    setShowDatePicker(false);
                } else if (
                    event.key === "Enter" &&
                    event.target.closest(".date-picker-container")
                ) {
                    event.preventDefault();
                }
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [showDatePicker]);

    return (
        <>
            <Head title="Anomali" />
            <DashboardLayout>
                <div className="max-w-full bg-white mx-auto border rounded-xl shadow-md">
                    <div className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-600 to-sky-600 rounded-t-xl">
                        <div className="flex items-center gap-2">
                            <ApplicationLogo className="h-8 w-8" />
                            <span className="text-white font-bold text-lg tracking-wide uppercase">
                                UPT Karawang
                            </span>
                        </div>
                    </div>

                    {/* Stepper */}
                    <div className="px-4 sm:px-8 py-6">
                        <div className="flex items-center justify-center">
                            <div className="flex items-center w-full max-w-4xl">
                                {[
                                    { id: 1, label: "Informasi Anomali" },
                                    { id: 2, label: "Detail Peralatan" },
                                    { id: 3, label: "Analisa" },
                                    { id: 4, label: "Lampiran" },
                                    { id: 5, label: "Review" },
                                ].map((item, idx, arr) => (
                                    <React.Fragment key={item.id}>
                                        <div className="relative flex flex-col items-center group">
                                            <div
                                                className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl border-2 transition-all duration-300 z-10 ${
                                                    step === item.id
                                                        ? "bg-cyan-600 border-cyan-600 text-white shadow-lg shadow-cyan-500/30 scale-110"
                                                        : step > item.id
                                                          ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20"
                                                          : "bg-white border-slate-200 text-slate-400 group-hover:border-slate-300"
                                                }`}
                                            >
                                                {step > item.id ? (
                                                    <FaCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                                                ) : (
                                                    <span className="font-bold text-xs sm:text-sm">
                                                        {item.id}
                                                    </span>
                                                )}
                                            </div>
                                            <span
                                                className={`absolute -bottom-8 text-[10px] sm:text-xs font-bold whitespace-nowrap transition-colors duration-300 ${
                                                    step === item.id
                                                        ? "text-sky-700"
                                                        : step > item.id
                                                          ? "text-emerald-600"
                                                          : "text-slate-400"
                                                }`}
                                            >
                                                {item.label}
                                            </span>
                                        </div>
                                        {idx < arr.length - 1 && (
                                            <div className="flex-1 h-0.5 mx-2 sm:mx-4 bg-slate-200 relative rounded-full overflow-hidden">
                                                <div
                                                    className={`absolute inset-y-0 left-0 transition-all duration-500 ease-out ${
                                                        step > item.id
                                                            ? "w-full bg-emerald-500"
                                                            : "w-0 bg-emerald-500"
                                                    }`}
                                                />
                                            </div>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="p-4">
                            {step === 1 && (
                                <>
                                    <div className="border border-slate-200 rounded-xl p-6 bg-white shadow-sm">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                            {/* Judul */}
                                            <div className="flex flex-col gap-1">
                                                <InputLabel
                                                    htmlFor="judul"
                                                    value="Judul"
                                                    className="text-sm font-bold tracking-wide text-slate-700"
                                                />
                                                <div className="relative">
                                                    <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                                        <FaTag className="text-slate-400 h-4 w-4" />
                                                    </span>
                                                    <TextInput
                                                        id="judul"
                                                        value={data.judul}
                                                        onChange={(e) =>
                                                            setData(
                                                                "judul",
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="pl-10 block w-full rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm px-4 py-2.5 shadow-sm transition-all placeholder:text-slate-400"
                                                        placeholder="Masukkan judul anomali"
                                                        required
                                                        autoComplete="off"
                                                    />
                                                </div>
                                                <InputError
                                                    message={errors.judul}
                                                />
                                            </div>
                                            {/* ULTG */}
                                            <div className="flex flex-col gap-1">
                                                <InputLabel
                                                    value="ULTG"
                                                    className="text-sm font-bold tracking-wide text-slate-700"
                                                />
                                                <div className="relative">
                                                    <Listbox
                                                        value={data.ultg}
                                                        onChange={(val) =>
                                                            setData("ultg", val)
                                                        }
                                                        disabled={
                                                            isUltgDisabled
                                                        }
                                                    >
                                                        <Listbox.Button
                                                            className={`${
                                                                isUltgDisabled
                                                                    ? "bg-slate-100 cursor-not-allowed text-slate-500"
                                                                    : "bg-white text-slate-900"
                                                            } pl-4 pr-10 py-2.5 w-full rounded-xl border border-slate-200 text-sm text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500`}
                                                            placeholder="Pilih ULTG"
                                                        >
                                                            {ultgOptions.find(
                                                                (opt) =>
                                                                    opt.id ===
                                                                    data.ultg,
                                                            )?.name ||
                                                                "Pilih ULTG"}
                                                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                                <ChevronUpDownIcon
                                                                    className="h-5 w-5 text-slate-400"
                                                                    aria-hidden="true"
                                                                />
                                                            </span>
                                                        </Listbox.Button>
                                                        <Transition
                                                            as={Fragment}
                                                            leave="transition ease-in duration-100"
                                                            leaveFrom="opacity-100"
                                                            leaveTo="opacity-0"
                                                        >
                                                            <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none custom-scrollbar">
                                                                {ultgOptions.map(
                                                                    (opt) => (
                                                                        <Listbox.Option
                                                                            key={
                                                                                opt.id
                                                                            }
                                                                            value={
                                                                                opt.id
                                                                            }
                                                                            className={({
                                                                                active,
                                                                            }) =>
                                                                                `relative cursor-pointer select-none py-2.5 pl-10 pr-4 ${
                                                                                    active
                                                                                        ? "bg-sky-50 text-cyan-900"
                                                                                        : "text-slate-900"
                                                                                }`
                                                                            }
                                                                        >
                                                                            {({
                                                                                selected,
                                                                            }) => (
                                                                                <>
                                                                                    <span
                                                                                        className={`block truncate ${
                                                                                            selected
                                                                                                ? "font-semibold"
                                                                                                : "font-normal"
                                                                                        }`}
                                                                                    >
                                                                                        {
                                                                                            opt.name
                                                                                        }
                                                                                    </span>
                                                                                    {selected ? (
                                                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-cyan-600">
                                                                                            <FaCheck
                                                                                                className="h-4 w-4"
                                                                                                aria-hidden="true"
                                                                                            />
                                                                                        </span>
                                                                                    ) : null}
                                                                                </>
                                                                            )}
                                                                        </Listbox.Option>
                                                                    ),
                                                                )}
                                                            </Listbox.Options>
                                                        </Transition>
                                                    </Listbox>
                                                </div>
                                                <InputError
                                                    message={errors.ultg}
                                                />
                                            </div>
                                            {/* Gardu Induk */}
                                            <div className="flex flex-col gap-1">
                                                <InputLabel
                                                    value="Gardu Induk"
                                                    className="text-sm font-bold tracking-wide text-slate-700"
                                                />
                                                <div className="relative">
                                                    <Listbox
                                                        value={data.gardu_id}
                                                        onChange={(val) =>
                                                            setData(
                                                                "gardu_id",
                                                                val,
                                                            )
                                                        }
                                                    >
                                                        <Listbox.Button
                                                            className="pl-4 pr-10 py-2.5 w-full rounded-xl border border-slate-200 bg-white text-sm text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                                                            placeholder="Pilih Gardu Induk"
                                                        >
                                                            {findById(
                                                                gardus,
                                                                data.gardu_id,
                                                            )?.name ||
                                                                "Pilih Gardu Induk"}
                                                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                                <ChevronUpDownIcon
                                                                    className="h-5 w-5 text-slate-400"
                                                                    aria-hidden="true"
                                                                />
                                                            </span>
                                                        </Listbox.Button>
                                                        <Transition
                                                            as={Fragment}
                                                            leave="transition ease-in duration-100"
                                                            leaveFrom="opacity-100"
                                                            leaveTo="opacity-0"
                                                        >
                                                            <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none custom-scrollbar">
                                                                {(
                                                                    filteredGarduOptions ||
                                                                    []
                                                                ).map((opt) => (
                                                                    <Listbox.Option
                                                                        key={
                                                                            opt.id
                                                                        }
                                                                        value={
                                                                            opt.id
                                                                        }
                                                                        className={({
                                                                            active,
                                                                        }) =>
                                                                            `relative cursor-pointer select-none py-2.5 pl-10 pr-4 ${
                                                                                active
                                                                                    ? "bg-sky-50 text-cyan-900"
                                                                                    : "text-slate-900"
                                                                            }`
                                                                        }
                                                                    >
                                                                        {({
                                                                            selected,
                                                                        }) => (
                                                                            <>
                                                                                <span
                                                                                    className={`block truncate ${
                                                                                        selected
                                                                                            ? "font-semibold"
                                                                                            : "font-normal"
                                                                                    }`}
                                                                                >
                                                                                    {
                                                                                        opt.name
                                                                                    }
                                                                                </span>
                                                                                {selected ? (
                                                                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-cyan-600">
                                                                                        <FaCheck
                                                                                            className="h-4 w-4"
                                                                                            aria-hidden="true"
                                                                                        />
                                                                                    </span>
                                                                                ) : null}
                                                                            </>
                                                                        )}
                                                                    </Listbox.Option>
                                                                ))}
                                                            </Listbox.Options>
                                                        </Transition>
                                                    </Listbox>
                                                </div>
                                                <InputError
                                                    message={errors.gardu_id}
                                                />
                                            </div>
                                            {/* Bagian */}
                                            <div className="flex flex-col gap-1">
                                                <InputLabel
                                                    value="Bagian"
                                                    className="text-sm font-bold tracking-wide text-slate-700"
                                                />
                                                <div className="relative">
                                                    <Listbox
                                                        value={data.bagian}
                                                        onChange={(val) =>
                                                            setData(
                                                                "bagian",
                                                                val,
                                                            )
                                                        }
                                                    >
                                                        <Listbox.Button
                                                            className="pl-4 pr-10 py-2.5 w-full rounded-xl border border-slate-200 bg-white text-sm text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                                                            placeholder="Pilih Bagian"
                                                        >
                                                            {bagianOptions.find(
                                                                (opt) =>
                                                                    opt.id ===
                                                                    data.bagian,
                                                            )?.name ||
                                                                "Pilih Bagian"}
                                                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                                <ChevronUpDownIcon
                                                                    className="h-5 w-5 text-slate-400"
                                                                    aria-hidden="true"
                                                                />
                                                            </span>
                                                        </Listbox.Button>
                                                        <Transition
                                                            as={Fragment}
                                                            leave="transition ease-in duration-100"
                                                            leaveFrom="opacity-100"
                                                            leaveTo="opacity-0"
                                                        >
                                                            <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none custom-scrollbar">
                                                                {bagianOptions.map(
                                                                    (opt) => (
                                                                        <Listbox.Option
                                                                            key={
                                                                                opt.id
                                                                            }
                                                                            value={
                                                                                opt.id
                                                                            }
                                                                            className={({
                                                                                active,
                                                                            }) =>
                                                                                `relative cursor-pointer select-none py-2.5 pl-10 pr-4 ${
                                                                                    active
                                                                                        ? "bg-sky-50 text-cyan-900"
                                                                                        : "text-slate-900"
                                                                                }`
                                                                            }
                                                                        >
                                                                            {({
                                                                                selected,
                                                                            }) => (
                                                                                <>
                                                                                    <span
                                                                                        className={`block truncate ${
                                                                                            selected
                                                                                                ? "font-semibold"
                                                                                                : "font-normal"
                                                                                        }`}
                                                                                    >
                                                                                        {
                                                                                            opt.name
                                                                                        }
                                                                                    </span>
                                                                                    {selected ? (
                                                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-cyan-600">
                                                                                            <FaCheck
                                                                                                className="h-4 w-4"
                                                                                                aria-hidden="true"
                                                                                            />
                                                                                        </span>
                                                                                    ) : null}
                                                                                </>
                                                                            )}
                                                                        </Listbox.Option>
                                                                    ),
                                                                )}
                                                            </Listbox.Options>
                                                        </Transition>
                                                    </Listbox>
                                                </div>
                                                <InputError
                                                    message={errors.bagian}
                                                />
                                            </div>
                                            {/* Tipe */}
                                            <div className="flex flex-col gap-1">
                                                <InputLabel
                                                    value="Tipe"
                                                    className="text-sm font-bold tracking-wide text-slate-700"
                                                />
                                                <div className="relative">
                                                    <Listbox
                                                        value={data.tipe}
                                                        onChange={(val) =>
                                                            setData("tipe", val)
                                                        }
                                                    >
                                                        <Listbox.Button
                                                            className="pl-4 pr-10 py-2.5 w-full rounded-xl border border-slate-200 bg-white text-sm text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                                                            placeholder="Pilih Tipe"
                                                        >
                                                            {tipeOptions.find(
                                                                (opt) =>
                                                                    opt.id ===
                                                                    data.tipe,
                                                            )?.name ||
                                                                "Pilih Tipe"}
                                                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                                <ChevronUpDownIcon
                                                                    className="h-5 w-5 text-slate-400"
                                                                    aria-hidden="true"
                                                                />
                                                            </span>
                                                        </Listbox.Button>
                                                        <Transition
                                                            as={Fragment}
                                                            leave="transition ease-in duration-100"
                                                            leaveFrom="opacity-100"
                                                            leaveTo="opacity-0"
                                                        >
                                                            <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none custom-scrollbar">
                                                                {(
                                                                    tipeOptions ||
                                                                    []
                                                                ).map((opt) => (
                                                                    <Listbox.Option
                                                                        key={
                                                                            opt.id
                                                                        }
                                                                        value={
                                                                            opt.id
                                                                        }
                                                                        className={({
                                                                            active,
                                                                        }) =>
                                                                            `relative cursor-pointer select-none py-2.5 pl-10 pr-4 ${
                                                                                active
                                                                                    ? "bg-sky-50 text-cyan-900"
                                                                                    : "text-slate-900"
                                                                            }`
                                                                        }
                                                                    >
                                                                        {({
                                                                            selected,
                                                                        }) => (
                                                                            <>
                                                                                <span
                                                                                    className={`block truncate ${
                                                                                        selected
                                                                                            ? "font-semibold"
                                                                                            : "font-normal"
                                                                                    }`}
                                                                                >
                                                                                    {
                                                                                        opt.name
                                                                                    }
                                                                                </span>
                                                                                {selected ? (
                                                                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-cyan-600">
                                                                                        <FaCheck
                                                                                            className="h-4 w-4"
                                                                                            aria-hidden="true"
                                                                                        />
                                                                                    </span>
                                                                                ) : null}
                                                                            </>
                                                                        )}
                                                                    </Listbox.Option>
                                                                ))}
                                                            </Listbox.Options>
                                                        </Transition>
                                                    </Listbox>
                                                </div>
                                                <InputError
                                                    message={errors.tipe}
                                                />
                                            </div>
                                            {/* Kategori */}
                                            <div className="flex flex-col gap-1">
                                                <InputLabel
                                                    value="Kategori"
                                                    className="text-sm font-bold tracking-wide text-slate-700"
                                                />
                                                <div className="relative">
                                                    <Listbox
                                                        value={data.kategori_id}
                                                        onChange={(val) =>
                                                            setData(
                                                                "kategori_id",
                                                                val,
                                                            )
                                                        }
                                                    >
                                                        <Listbox.Button
                                                            className="pl-4 pr-10 py-2.5 w-full rounded-xl border border-slate-200 bg-white text-sm text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                                                            placeholder="Pilih Kategori"
                                                        >
                                                            {findById(
                                                                kategoris,
                                                                data.kategori_id,
                                                            )?.name ||
                                                                "Pilih Kategori"}
                                                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                                <ChevronUpDownIcon
                                                                    className="h-5 w-5 text-slate-400"
                                                                    aria-hidden="true"
                                                                />
                                                            </span>
                                                        </Listbox.Button>
                                                        <Transition
                                                            as={Fragment}
                                                            leave="transition ease-in duration-100"
                                                            leaveFrom="opacity-100"
                                                            leaveTo="opacity-0"
                                                        >
                                                            <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full flex-wrap rounded-xl bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none custom-scrollbar">
                                                                {(
                                                                    kategoris ||
                                                                    []
                                                                ).map((opt) => (
                                                                    <Listbox.Option
                                                                        key={
                                                                            opt.id
                                                                        }
                                                                        value={
                                                                            opt.id
                                                                        }
                                                                        className={({
                                                                            active,
                                                                        }) =>
                                                                            `relative cursor-pointer select-none py-2.5 pl-10 pr-4 ${
                                                                                active
                                                                                    ? "bg-sky-50 text-cyan-900"
                                                                                    : "text-slate-900"
                                                                            }`
                                                                        }
                                                                    >
                                                                        {({
                                                                            selected,
                                                                        }) => (
                                                                            <>
                                                                                <span
                                                                                    className={`block truncate ${
                                                                                        selected
                                                                                            ? "font-semibold"
                                                                                            : "font-normal"
                                                                                    }`}
                                                                                >
                                                                                    {
                                                                                        opt.name
                                                                                    }
                                                                                </span>
                                                                                {selected ? (
                                                                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-cyan-600">
                                                                                        <FaCheck
                                                                                            className="h-4 w-4"
                                                                                            aria-hidden="true"
                                                                                        />
                                                                                    </span>
                                                                                ) : null}
                                                                            </>
                                                                        )}
                                                                    </Listbox.Option>
                                                                ))}
                                                            </Listbox.Options>
                                                        </Transition>
                                                    </Listbox>
                                                </div>
                                                <InputError
                                                    message={errors.kategori_id}
                                                />
                                            </div>
                                            {/* Penempatan Alat */}
                                            <div className="flex flex-col gap-1">
                                                <InputLabel
                                                    htmlFor="penempatan_alat"
                                                    value="Penempatan Alat"
                                                    className="text-sm font-bold tracking-wide text-slate-700"
                                                />
                                                <div className="relative">
                                                    <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                                        <FaSearch className="text-slate-400 h-4 w-4" />
                                                    </span>
                                                    <TextInput
                                                        id="penempatan_alat"
                                                        value={
                                                            data.penempatan_alat
                                                        }
                                                        onChange={(e) =>
                                                            setData(
                                                                "penempatan_alat",
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="pl-10 block w-full rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm px-4 py-2.5 shadow-sm transition-all placeholder:text-slate-400"
                                                        placeholder="Di mana alat ini dipasang?"
                                                        required
                                                        autoComplete="off"
                                                    />
                                                </div>
                                                <InputError
                                                    message={
                                                        errors.penempatan_alat
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 2 && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 pt-4 border border-slate-200 rounded-xl p-6 bg-white gap-8">
                                        {/* Peralatan */}
                                        <div className="relative flex flex-col justify-end">
                                            <InputLabel
                                                htmlFor="peralatan"
                                                value="Nama Peralatan"
                                                className="text-sm font-bold mb-1 tracking-wide text-slate-700"
                                            />
                                            <div className="relative">
                                                <span className="absolute mt-0.5 inset-y-0 left-4 flex items-center pointer-events-none">
                                                    <FaTools className="text-slate-400 h-3 w-3" />
                                                </span>
                                                <TextInput
                                                    id="peralatan"
                                                    value={data.peralatan}
                                                    onChange={(e) =>
                                                        setData(
                                                            "peralatan",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="pl-10 mt-1 block w-full rounded-xl border-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-md px-4 py-2 shadow-sm transition-all"
                                                    placeholder="Masukkan nama peralatan"
                                                    required
                                                />
                                            </div>
                                            <InputError
                                                message={errors.peralatan}
                                            />
                                        </div>
                                        {/* Tanggal Kejadian */}
                                        <div className="relative flex flex-col justify-end">
                                            <InputLabel
                                                htmlFor="tanggal_kejadian"
                                                value="Tanggal Kejadian"
                                                className="text-sm font-bold mb-1 tracking-wide text-slate-700"
                                            />
                                            <div className="relative date-picker-container">
                                                <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                                    <FaCalendarAlt className="text-slate-400 text-lg" />
                                                </span>
                                                <div
                                                    onClick={() =>
                                                        setShowDatePicker(
                                                            !showDatePicker,
                                                        )
                                                    }
                                                    className={`pl-10 mt-1 block w-full rounded-xl border cursor-pointer ${
                                                        errors.tanggal_kejadian
                                                            ? "border-red-400 focus:ring-red-400 focus:border-red-400"
                                                            : data.tanggal_kejadian
                                                              ? "border-green-400 focus:ring-green-400 focus:border-green-400"
                                                              : "border-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                                                    } text-md px-4 py-2 shadow-sm transition-all bg-white hover:bg-slate-50`}
                                                >
                                                    {data.tanggal_kejadian ? (
                                                        <span className="text-slate-900 flex items-center justify-between">
                                                            <span>
                                                                {formatDisplayDate(
                                                                    data.tanggal_kejadian,
                                                                )}
                                                            </span>
                                                            <span className="text-green-600 text-xs">
                                                                ✓
                                                            </span>
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-500">
                                                            Pilih tanggal
                                                            kejadian *
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Custom Date Picker */}
                                                {showDatePicker && (
                                                    <div className="date-picker-container absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg p-4">
                                                        {/* Calendar Header */}
                                                        <div className="flex items-center justify-between mb-4">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    navigateMonth(
                                                                        -1,
                                                                    )
                                                                }
                                                                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                                                            >
                                                                <svg
                                                                    className="w-4 h-4"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={
                                                                            2
                                                                        }
                                                                        d="M15 19l-7-7 7-7"
                                                                    />
                                                                </svg>
                                                            </button>
                                                            <h3 className="text-sm font-semibold text-slate-900">
                                                                {selectedDate
                                                                    ? format(
                                                                          selectedDate,
                                                                          "MMMM yyyy",
                                                                          {
                                                                              locale: id,
                                                                          },
                                                                      )
                                                                    : format(
                                                                          new Date(),
                                                                          "MMMM yyyy",
                                                                          {
                                                                              locale: id,
                                                                          },
                                                                      )}
                                                            </h3>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    navigateMonth(
                                                                        1,
                                                                    )
                                                                }
                                                                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                                                            >
                                                                <svg
                                                                    className="w-4 h-4"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={
                                                                            2
                                                                        }
                                                                        d="M9 5l7 7-7 7"
                                                                    />
                                                                </svg>
                                                            </button>
                                                        </div>

                                                        {/* Calendar Grid */}
                                                        <div className="grid grid-cols-7 gap-1 mb-2">
                                                            {[
                                                                "Min",
                                                                "Sen",
                                                                "Sel",
                                                                "Rab",
                                                                "Kam",
                                                                "Jum",
                                                                "Sab",
                                                            ].map((day) => (
                                                                <div
                                                                    key={day}
                                                                    className="text-xs font-medium text-slate-500 text-center py-1"
                                                                >
                                                                    {day}
                                                                </div>
                                                            ))}
                                                        </div>

                                                        <div className="grid grid-cols-7 gap-1">
                                                            {generateCalendarDays().map(
                                                                (
                                                                    date,
                                                                    index,
                                                                ) => {
                                                                    const isCurrentMonth =
                                                                        date.getMonth() ===
                                                                        (selectedDate
                                                                            ? selectedDate.getMonth()
                                                                            : new Date().getMonth());
                                                                    const isToday =
                                                                        format(
                                                                            date,
                                                                            "yyyy-MM-dd",
                                                                        ) ===
                                                                        format(
                                                                            new Date(),
                                                                            "yyyy-MM-dd",
                                                                        );
                                                                    const isSelected =
                                                                        data.tanggal_kejadian &&
                                                                        format(
                                                                            date,
                                                                            "yyyy-MM-dd",
                                                                        ) ===
                                                                            data.tanggal_kejadian;
                                                                    const isValidDate =
                                                                        isDateValid(
                                                                            date,
                                                                        );

                                                                    return (
                                                                        <button
                                                                            key={
                                                                                index
                                                                            }
                                                                            type="button"
                                                                            onClick={() =>
                                                                                isValidDate &&
                                                                                handleDateSelect(
                                                                                    date,
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                !isValidDate
                                                                            }
                                                                            className={`p-2 text-xs rounded-xl transition-colors ${
                                                                                isSelected
                                                                                    ? "bg-cyan-600 text-white font-semibold"
                                                                                    : isToday
                                                                                      ? "bg-cyan-100 text-cyan-900 font-semibold"
                                                                                      : isCurrentMonth &&
                                                                                          isValidDate
                                                                                        ? "text-slate-900 hover:bg-slate-100"
                                                                                        : "text-slate-400"
                                                                            } ${
                                                                                !isValidDate
                                                                                    ? "cursor-not-allowed opacity-50"
                                                                                    : ""
                                                                            }`}
                                                                        >
                                                                            {date.getDate()}
                                                                        </button>
                                                                    );
                                                                },
                                                            )}
                                                        </div>

                                                        {/* Quick Actions */}
                                                        <div className="flex justify-between mt-4 pt-3 border-t border-slate-200">
                                                            <div className="flex gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const today =
                                                                            new Date();
                                                                        handleDateSelect(
                                                                            today,
                                                                        );
                                                                    }}
                                                                    className="text-xs text-cyan-600 hover:text-cyan-800 font-medium"
                                                                >
                                                                    Hari Ini
                                                                </button>
                                                                {data.tanggal_kejadian && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setData(
                                                                                "tanggal_kejadian",
                                                                                "",
                                                                            );
                                                                            setSelectedDate(
                                                                                null,
                                                                            );
                                                                        }}
                                                                        className="text-xs text-red-600 hover:text-red-800 font-medium"
                                                                    >
                                                                        Hapus
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setShowDatePicker(
                                                                        false,
                                                                    )
                                                                }
                                                                className="text-xs text-slate-500 hover:text-slate-700"
                                                            >
                                                                Tutup
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <InputError
                                                message={
                                                    errors.tanggal_kejadian
                                                }
                                            />
                                        </div>
                                        <div className="relative flex flex-col justify-end">
                                            <InputLabel
                                                htmlFor="merek"
                                                value="Merek (optional)"
                                                className="text-sm font-bold mb-1 tracking-wide text-slate-700"
                                            />
                                            <div className="relative">
                                                <TextInput
                                                    id="merek"
                                                    value={data.merek}
                                                    onChange={(e) =>
                                                        setData(
                                                            "merek",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="mt-1 block w-full rounded-xl border-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-md px-4 py-2 shadow-sm transition-all"
                                                />
                                                <InputError
                                                    message={errors.merek}
                                                />
                                            </div>
                                        </div>
                                        <div className="relative flex flex-col justify-end">
                                            <InputLabel
                                                htmlFor="tipe_alat"
                                                value="Tipe (optional)"
                                                className="text-sm font-bold mb-1 tracking-wide text-slate-700"
                                            />
                                            <div className="relative">
                                                <TextInput
                                                    id="tipe_alat"
                                                    value={data.tipe_alat}
                                                    onChange={(e) =>
                                                        setData(
                                                            "tipe_alat",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="mt-1 block w-full rounded-xl border-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-md px-4 py-2 shadow-sm transition-all"
                                                />
                                                <InputError
                                                    message={errors.tipe_alat}
                                                />
                                            </div>
                                        </div>
                                        <div className="relative flex flex-col justify-end">
                                            <InputLabel
                                                htmlFor="no_seri"
                                                value="No Seri (optional)"
                                                className="text-sm font-bold mb-1 tracking-wide text-slate-700"
                                            />
                                            <div className="relative">
                                                <TextInput
                                                    id="no_seri"
                                                    value={data.no_seri}
                                                    onChange={(e) =>
                                                        setData(
                                                            "no_seri",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="mt-1 block w-full rounded-xl border-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-md px-4 py-2 shadow-sm transition-all"
                                                />
                                                <InputError
                                                    message={errors.no_seri}
                                                />
                                            </div>
                                        </div>
                                        <div className="relative flex flex-col justify-end">
                                            <InputLabel
                                                htmlFor="harga"
                                                value="Harga (optional)"
                                                className="text-sm font-bold mb-1 tracking-wide text-slate-700"
                                            />
                                            <div className="relative">
                                                <TextInput
                                                    id="harga"
                                                    value={data.harga}
                                                    onChange={(e) =>
                                                        setData(
                                                            "harga",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="mt-1 block w-full rounded-xl border-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-md px-4 py-2 shadow-sm transition-all"
                                                />
                                                <InputError
                                                    message={errors.harga}
                                                />
                                            </div>
                                        </div>
                                        <div className="relative flex flex-col justify-end">
                                            <InputLabel
                                                htmlFor="kode_asset"
                                                value="Kode Asset (optional)"
                                                className="text-sm font-bold mb-1 tracking-wide text-slate-700"
                                            />
                                            <div className="relative">
                                                <TextInput
                                                    id="kode_asset"
                                                    value={data.kode_asset}
                                                    onChange={(e) =>
                                                        setData(
                                                            "kode_asset",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="mt-1 block w-full rounded-xl border-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-md px-4 py-2 shadow-sm transition-all"
                                                />
                                                <InputError
                                                    message={errors.kode_asset}
                                                />
                                            </div>
                                        </div>
                                        <div className="relative flex flex-col justify-end">
                                            <InputLabel
                                                htmlFor="tahun_operasi"
                                                value="Tahun Operasi (optional)"
                                                className="text-sm font-bold mb-1 tracking-wide text-slate-700"
                                            />
                                            <div className="relative">
                                                <TextInput
                                                    id="tahun_operasi"
                                                    value={data.tahun_operasi}
                                                    onChange={(e) =>
                                                        setData(
                                                            "tahun_operasi",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="mt-1 block w-full rounded-xl border-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-md px-4 py-2 shadow-sm transition-all"
                                                />
                                                <InputError
                                                    message={
                                                        errors.tahun_operasi
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div className="relative flex flex-col justify-end">
                                            <InputLabel
                                                htmlFor="tahun_buat"
                                                value="Tahun Buat (optional)"
                                                className="text-sm font-bold mb-1 tracking-wide text-slate-700"
                                            />
                                            <div className="relative">
                                                <TextInput
                                                    id="tahun_buat"
                                                    value={data.tahun_buat}
                                                    onChange={(e) =>
                                                        setData(
                                                            "tahun_buat",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="mt-1 block w-full rounded-xl border-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-md px-4 py-2 shadow-sm transition-all"
                                                />
                                                <InputError
                                                    message={errors.tahun_buat}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 3 && (
                                <>
                                    <div className="grid grid-cols-1 border border-slate-200 rounded-xl p-6 bg-white md:grid-cols-2 pt-4 gap-8">
                                        {/* Penyebab */}
                                        <div className="relative flex flex-col justify-end">
                                            <InputLabel
                                                htmlFor="penyebab"
                                                value="Penyebab"
                                                className="text-sm font-bold mb-1 tracking-wide text-slate-700"
                                            />
                                            <div className="relative flex items-center">
                                                <textarea
                                                    id="penyebab"
                                                    value={data.penyebab}
                                                    onChange={(e) =>
                                                        setData(
                                                            "penyebab",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className=" mt-1 block w-full rounded-xl border-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-md px-4 py-2 shadow-sm transition-all min-h-[60px]"
                                                    placeholder="Jelaskan penyebab anomali"
                                                    required
                                                />
                                            </div>
                                            <InputError
                                                message={errors.penyebab}
                                            />
                                        </div>
                                        {/* Akibat */}
                                        <div className="relative flex flex-col justify-end">
                                            <InputLabel
                                                htmlFor="akibat"
                                                value="Akibat"
                                                className="text-sm font-bold mb-1 tracking-wide text-slate-700"
                                            />
                                            <div className="relative flex items-center">
                                                <textarea
                                                    id="akibat"
                                                    value={data.akibat}
                                                    onChange={(e) =>
                                                        setData(
                                                            "akibat",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className=" mt-1 block w-full rounded-xl border-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-md px-4 py-2 shadow-sm transition-all min-h-[60px]"
                                                    placeholder="Jelaskan akibat anomali"
                                                    required
                                                />
                                            </div>
                                            <InputError
                                                message={errors.akibat}
                                            />
                                        </div>
                                        {/* Usul/Saran */}
                                        <div className="relative flex flex-col justify-end">
                                            <InputLabel
                                                htmlFor="usul_saran"
                                                value="Usul/Saran"
                                                className="text-sm font-bold mb-1 tracking-wide text-slate-700"
                                            />
                                            <div className="relative flex items-center">
                                                <textarea
                                                    id="usul_saran"
                                                    value={data.usul_saran}
                                                    onChange={(e) =>
                                                        setData(
                                                            "usul_saran",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className=" mt-1 block w-full rounded-xl border-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-md px-4 py-2 shadow-sm transition-all min-h-[60px]"
                                                    placeholder="Tulis usul atau saran (opsional)"
                                                />
                                            </div>
                                            <InputError
                                                message={errors.usul_saran}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 4 && (
                                <>
                                    <div className="flex justify-center pt-4">
                                        {/* Lampiran Foto */}
                                        <div className="rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col w-full max-w-4xl">
                                            <div className="flex items-center border-b border-slate-200 gap-3 px-6 py-4 justify-center">
                                                <span className="text-slate-600 text-2xl">
                                                    <FaFileAlt />
                                                </span>
                                                <h2 className="text-xl font-bold text-slate-600 tracking-tight">
                                                    Lampiran Foto
                                                </h2>
                                            </div>
                                            <div className="p-6 flex-1 flex flex-col">
                                                <div className="flex flex-col items-center justify-center mb-4 gap-1">
                                                    <span className="text-xs text-cyan-500 font-medium">
                                                        Maksimal {MAX_FILES}{" "}
                                                        gambar
                                                    </span>
                                                    {compressionState.running ? (
                                                        <div className="mt-2 w-full max-w-md rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                                                            <div className="flex items-center justify-between gap-3">
                                                                <div className="text-xs font-semibold text-slate-700">
                                                                    Mengompres{" "}
                                                                    {
                                                                        compressionState.current
                                                                    }
                                                                    /
                                                                    {
                                                                        compressionState.total
                                                                    }
                                                                </div>
                                                                <div className="text-[11px] text-slate-500 truncate max-w-[220px]">
                                                                    {
                                                                        compressionState.fileName
                                                                    }
                                                                </div>
                                                            </div>
                                                            <div className="mt-2 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                                                                <div
                                                                    className="h-full bg-gradient-to-r from-cyan-600 to-sky-600 transition-all"
                                                                    style={{
                                                                        width: `${Math.round(
                                                                            (compressionState.current /
                                                                                Math.max(
                                                                                    1,
                                                                                    compressionState.total,
                                                                                )) *
                                                                                100,
                                                                        )}%`,
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ) : null}
                                                </div>
                                                <div className="flex flex-wrap gap-3 mb-6 justify-center">
                                                    <label
                                                        htmlFor="lampiran_foto"
                                                        className={`flex items-center gap-2 cursor-pointer px-4 py-2 bg-cyan-600 hover:bg-cyan-700 transition text-white rounded-xl shadow font-medium text-sm ${
                                                            preview.length >=
                                                                MAX_FILES ||
                                                            compressionState.running ||
                                                            isSubmitting
                                                                ? "opacity-50 cursor-not-allowed"
                                                                : ""
                                                        }`}
                                                    >
                                                        <FaPlus className="text-white" />
                                                        Tambah Foto
                                                        <input
                                                            id="lampiran_foto"
                                                            type="file"
                                                            accept="image/*"
                                                            multiple
                                                            onChange={
                                                                handleFileChange
                                                            }
                                                            className="hidden"
                                                            disabled={
                                                                preview.length >=
                                                                    MAX_FILES ||
                                                                compressionState.running ||
                                                                isSubmitting
                                                            }
                                                        />
                                                    </label>
                                                    {preview.length >=
                                                        MAX_FILES && (
                                                        <span className="text-xs text-red-500 font-semibold ml-2">
                                                            Maksimal {MAX_FILES}{" "}
                                                            gambar tercapai
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                                                    {preview.length === 0 && (
                                                        <div className="col-span-full flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-200 rounded-xl bg-white/60">
                                                            <FaFileAlt className="text-slate-300 text-4xl mb-2" />
                                                            <span className="text-slate-400 text-sm font-medium">
                                                                Belum ada foto
                                                                yang diunggah
                                                            </span>
                                                        </div>
                                                    )}
                                                    {preview.map((src, i) => (
                                                        <div
                                                            key={i}
                                                            className="relative group border border-slate-200 rounded-xl overflow-hidden shadow bg-white hover:shadow-xl transition"
                                                        >
                                                            <img
                                                                src={src}
                                                                alt={`preview-${i}`}
                                                                className="w-full h-40 object-cover object-center transition group-hover:scale-105 duration-200"
                                                            />
                                                            <div className="absolute top-2 right-2 flex flex-col gap-2 z-10">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleRemoveImage(
                                                                            i,
                                                                        )
                                                                    }
                                                                    className="bg-white/90 hover:bg-red-600 text-red-600 hover:text-white rounded-full p-1 shadow transition"
                                                                    title="Hapus Foto"
                                                                >
                                                                    <FaTrash className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 rounded-xl transition-all duration-200 flex items-center justify-center text-base text-white font-semibold tracking-wide backdrop-blur-sm"
                                                                onClick={(
                                                                    e,
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    setPreviewIndex(
                                                                        i,
                                                                    );
                                                                    setPreviewModal(
                                                                        true,
                                                                    );
                                                                }}
                                                            >
                                                                <span className="px-4 py-1 bg-slate-700/80 rounded-xl shadow text-white font-medium">
                                                                    Preview
                                                                </span>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                                <InputError
                                                    message={
                                                        errors.lampiran_foto
                                                    }
                                                    className="mt-4"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 5 && (
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
                                    {/* Header */}
                                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                            <FaClipboard className="text-sky-600" />
                                            Review Data Anomali
                                        </h2>
                                        <div className="px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-bold uppercase tracking-wider">
                                            Draft
                                        </div>
                                    </div>

                                    <div className="p-6 space-y-8">
                                        {/* 1. Data Peralatan */}
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                                                <span className="w-6 h-6 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center text-xs">
                                                    1
                                                </span>
                                                Data Peralatan
                                            </h3>
                                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                    <dt className="text-xs font-medium text-slate-500 mb-1">
                                                        Nama Peralatan
                                                    </dt>
                                                    <dd className="text-sm font-semibold text-slate-900">
                                                        {data.peralatan || "-"}
                                                    </dd>
                                                </div>
                                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                    <dt className="text-xs font-medium text-slate-500 mb-1">
                                                        Merek
                                                    </dt>
                                                    <dd className="text-sm font-semibold text-slate-900">
                                                        {data.merek || "-"}
                                                    </dd>
                                                </div>
                                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                    <dt className="text-xs font-medium text-slate-500 mb-1">
                                                        Tipe
                                                    </dt>
                                                    <dd className="text-sm font-semibold text-slate-900">
                                                        {data.tipe_alat || "-"}
                                                    </dd>
                                                </div>
                                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                    <dt className="text-xs font-medium text-slate-500 mb-1">
                                                        No Seri
                                                    </dt>
                                                    <dd className="text-sm font-semibold text-slate-900">
                                                        {data.no_seri || "-"}
                                                    </dd>
                                                </div>
                                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                    <dt className="text-xs font-medium text-slate-500 mb-1">
                                                        Harga
                                                    </dt>
                                                    <dd className="text-sm font-semibold text-slate-900">
                                                        {data.harga || "-"}
                                                    </dd>
                                                </div>
                                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                    <dt className="text-xs font-medium text-slate-500 mb-1">
                                                        Kode Asset
                                                    </dt>
                                                    <dd className="text-sm font-semibold text-slate-900">
                                                        {data.kode_asset || "-"}
                                                    </dd>
                                                </div>
                                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                    <dt className="text-xs font-medium text-slate-500 mb-1">
                                                        Tahun Operasi
                                                    </dt>
                                                    <dd className="text-sm font-semibold text-slate-900">
                                                        {data.tahun_operasi ||
                                                            "-"}
                                                    </dd>
                                                </div>
                                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                    <dt className="text-xs font-medium text-slate-500 mb-1">
                                                        Tahun Buat
                                                    </dt>
                                                    <dd className="text-sm font-semibold text-slate-900">
                                                        {data.tahun_buat || "-"}
                                                    </dd>
                                                </div>
                                            </dl>
                                        </div>

                                        {/* 2. Detail Kejadian */}
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                                                <span className="w-6 h-6 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center text-xs">
                                                    2
                                                </span>
                                                Detail Kejadian
                                            </h3>
                                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 col-span-1 md:col-span-2">
                                                    <dt className="text-xs font-medium text-slate-500 mb-1">
                                                        Penempatan Peralatan
                                                    </dt>
                                                    <dd className="text-sm font-semibold text-slate-900">
                                                        {data.penempatan_alat ||
                                                            "-"}
                                                    </dd>
                                                </div>
                                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                    <dt className="text-xs font-medium text-slate-500 mb-1">
                                                        Tanggal Kejadian
                                                    </dt>
                                                    <dd className="text-sm font-semibold text-slate-900">
                                                        {data.tanggal_kejadian
                                                            ? formatDate(
                                                                  data.tanggal_kejadian,
                                                              )
                                                            : "-"}
                                                    </dd>
                                                </div>
                                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                    <dt className="text-xs font-medium text-slate-500 mb-1">
                                                        Jenis Kerusakan
                                                    </dt>
                                                    <dd className="text-sm font-semibold text-slate-900">
                                                        {kategoris?.find(
                                                            (k) =>
                                                                k.id ==
                                                                data.kategori_id,
                                                        )?.name || "-"}
                                                    </dd>
                                                </div>
                                            </dl>
                                        </div>

                                        {/* 3. Analisa */}
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                                                <span className="w-6 h-6 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center text-xs">
                                                    3
                                                </span>
                                                Analisa & Tindak Lanjut
                                            </h3>
                                            <dl className="grid grid-cols-1 gap-4">
                                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                    <dt className="text-xs font-medium text-slate-500 mb-1">
                                                        Penyebab Kerusakan
                                                    </dt>
                                                    <dd className="text-sm font-semibold text-slate-900 whitespace-pre-wrap">
                                                        {data.penyebab || "-"}
                                                    </dd>
                                                </div>
                                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                    <dt className="text-xs font-medium text-slate-500 mb-1">
                                                        Akibat Kerusakan
                                                    </dt>
                                                    <dd className="text-sm font-semibold text-slate-900 whitespace-pre-wrap">
                                                        {data.akibat || "-"}
                                                    </dd>
                                                </div>
                                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                    <dt className="text-xs font-medium text-slate-500 mb-1">
                                                        Usul dan Saran
                                                    </dt>
                                                    <dd className="text-sm font-semibold text-slate-900 whitespace-pre-wrap">
                                                        {data.usul_saran || "-"}
                                                    </dd>
                                                </div>
                                            </dl>
                                        </div>

                                        {/* 4. Lampiran */}
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                                                <span className="w-6 h-6 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center text-xs">
                                                    4
                                                </span>
                                                Lampiran
                                            </h3>
                                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                {preview &&
                                                preview.length > 0 ? (
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                                        {preview.map(
                                                            (src, i) => (
                                                                <div
                                                                    key={i}
                                                                    className="relative group rounded-lg overflow-hidden shadow-sm border border-slate-200"
                                                                >
                                                                    <img
                                                                        src={
                                                                            src
                                                                        }
                                                                        alt={`Lampiran ${i + 1}`}
                                                                        className="w-full h-24 object-cover hover:scale-105 transition-transform duration-300"
                                                                    />
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-slate-400 italic text-sm">
                                                        <FaFileAlt />
                                                        Tidak ada lampiran foto
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between gap-6 mt-6 pt-4">
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className={`w-full md:w-auto border border-slate-300 text-slate-800 hover:bg-slate-50 px-4 sm:px-5 py-2 rounded-xl shadow  font-semibold flex items-center justify-center gap-2 transition text-sm sm:text-base ${
                                        step === 1
                                            ? "cursor-not-allowed opacity-50"
                                            : "hover:from-slate-700 hover:to-slate-800"
                                    }`}
                                    disabled={step === 1}
                                >
                                    Back
                                </button>
                                {step < 5 && (
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        className="w-full md:w-auto bg-gradient-to-r from-cyan-600 to-sky-600 text-white px-4 sm:px-5 py-2 rounded-xl shadow hover:from-cyan-800 hover:to-sky-800 font-semibold flex transition-all duration-300 ease-in-out items-center justify-center gap-2 text-sm sm:text-base"
                                    >
                                        Next
                                    </button>
                                )}
                                {step === 5 && (
                                    <button
                                        type="submit"
                                        disabled={
                                            processing ||
                                            isSubmitting ||
                                            compressionState.running
                                        }
                                        className="w-full md:w-auto bg-gradient-to-r from-green-600 to-green-500 text-white px-4 sm:px-5 py-2 rounded-xl shadow hover:from-green-700 hover:to-green-800 font-semibold flex items-center justify-center gap-2 transition text-sm sm:text-base"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                                <span>
                                                    Uploading
                                                    {typeof uploadProgress ===
                                                    "number"
                                                        ? ` ${uploadProgress}%`
                                                        : ""}
                                                </span>
                                            </>
                                        ) : compressionState.running ? (
                                            <>
                                                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                                <span>Mengompres...</span>
                                            </>
                                        ) : (
                                            "Submit"
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </DashboardLayout>
        </>
    );
}
