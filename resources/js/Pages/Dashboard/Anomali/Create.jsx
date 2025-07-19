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
    FaSearch,
    FaTag,
} from "react-icons/fa";
import { FaCheck } from "react-icons/fa6";
import ApplicationLogo from "@/Components/ApplicationLogo";
import { Switch, Dialog, Transition, Listbox } from "@headlessui/react";
import { Fragment } from "react";
import { ChevronUpDownIcon } from "@heroicons/react/24/solid";
import React from "react";
import axios from "axios";

export default function Create({
    gardus = [],
    kategoris = [],
    users = [],
    peralatans = [],
}) {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { data, setData, errors, processing, reset } = useForm({
        judul: "",
        ultg: users.penempatan || "",
        gardu_id: "",
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

    console.log(data);

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
    const MAX_FILES = 5;
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        // Filter hanya gambar dan max 5 file
        const validFiles = files.filter((file) =>
            file.type.startsWith("image/")
        );
        if (validFiles.length + preview.length > MAX_FILES) {
            alert(`Maksimal ${MAX_FILES} file gambar!`);
            return;
        }
        setData("lampiran_foto", [...data.lampiran_foto, ...validFiles]);
        setPreview([
            ...preview,
            ...validFiles.map((file) => URL.createObjectURL(file)),
        ]);
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
        setIsSubmitting(true);
        console.log("SUBMIT: Mulai submit data", data); // Tambahkan log ini
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (key === "lampiran_foto") {
                value.forEach((file) =>
                    formData.append("lampiran_foto[]", file)
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
                }
            );
            console.log("SUBMIT: Sukses", response); // Tambahkan log ini
            reset();
            setPreview([]);
            router.visit("dashboard.anomali.index");
        } catch (error) {
            console.error("SUBMIT: Error", error); // Tambahkan log ini
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Head title="Anomali" />
            <DashboardLayout>
                <div className="max-w-full bg-white mx-auto border rounded-lg shadow-md">
                    <div className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-700 via-blue-500 to-indigo-500 rounded-t-lg">
                        <div className="flex items-center gap-2">
                            <ApplicationLogo className="h-8 w-8" />
                            <span className="text-white font-bold text-lg tracking-wide uppercase">
                                UPT Karawang
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center justify-center py-6">
                        <div className="flex items-center space-x-0">
                            {[
                                { step: 1, label: "Data Anomali" },
                                { step: 2, label: "Data Alat" },
                                { step: 3, label: "Sebab/Akibat" },
                                { step: 4, label: "Lampiran" },
                                { step: 5, label: "Review" },
                            ].map(({ step: s, label }, idx, arr) => (
                                <React.Fragment key={s}>
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${
                                                step === s
                                                    ? "bg-blue-600 border-blue-600 animate-pulse text-white"
                                                    : step > s
                                                    ? "bg-green-500 border-green-500 text-white"
                                                    : "bg-white border-blue-300 text-blue-400"
                                            } font-bold transition-all`}
                                        >
                                            {s}
                                        </div>
                                        <span
                                            className={`text-xs font-semibold mt-1 text-center truncate max-w-[80px] ${
                                                step === s
                                                    ? "text-blue-700"
                                                    : step > s
                                                    ? "text-green-600"
                                                    : "text-gray-400"
                                            }`}
                                        >
                                            {label}
                                        </span>
                                    </div>
                                    {idx < arr.length - 1 && (
                                        <div
                                            className={`h-1 rounded transition-all duration-200 ${
                                                step > s
                                                    ? "bg-green-500"
                                                    : step === s
                                                    ? "bg-blue-400"
                                                    : "bg-blue-200"
                                            }`}
                                            style={{
                                                minWidth: 32,
                                                width: 32,
                                                marginLeft: 16,
                                                marginRight: 16,
                                            }}
                                        />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="p-4">
                            {step === 1 && (
                                <>
                                    <div className="border rounded-lg p-6 bg-white">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                            {/* Judul */}
                                            <div className="flex flex-col gap-1">
                                                <InputLabel
                                                    htmlFor="judul"
                                                    value="Judul"
                                                    className="text-sm font-bold tracking-wide text-gray-700"
                                                />
                                                <div className="relative">
                                                    <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                                        <FaTag className="text-blue-400 h-4 w-4" />
                                                    </span>
                                                    <TextInput
                                                        id="judul"
                                                        value={data.judul}
                                                        onChange={(e) =>
                                                            setData(
                                                                "judul",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="pl-10 block w-full rounded-lg border border-blue-200 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-md px-4 py-2 shadow-sm transition-all"
                                                        placeholder="Masukkan judul anomali"
                                                        required
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
                                                    className="text-sm font-bold tracking-wide text-gray-700"
                                                />
                                                <div className="relative">
                                                    <Listbox
                                                        value={data.ultg}
                                                        onChange={(val) =>
                                                            setData("ultg", val)
                                                        }
                                                    >
                                                        <Listbox.Button
                                                            className="pl-4 pr-10 py-2 w-full rounded-lg border border-blue-200 bg-white text-md text-left shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                                                            placeholder="Pilih ULTG"
                                                        >
                                                            {ultgOptions.find(
                                                                (opt) =>
                                                                    opt.id ===
                                                                    data.ultg
                                                            )?.name ||
                                                                "Pilih ULTG"}
                                                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                                <ChevronUpDownIcon
                                                                    className="h-5 w-5 text-gray-400"
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
                                                            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
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
                                                                                `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                                                                    active
                                                                                        ? "bg-blue-100 text-blue-900"
                                                                                        : "text-gray-900"
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
                                                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                                                                            <FaCheck
                                                                                                className="h-4 w-4"
                                                                                                aria-hidden="true"
                                                                                            />
                                                                                        </span>
                                                                                    ) : null}
                                                                                </>
                                                                            )}
                                                                        </Listbox.Option>
                                                                    )
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
                                                    className="text-sm font-bold tracking-wide text-gray-700"
                                                />
                                                <div className="relative">
                                                    <Listbox
                                                        value={data.gardu_id}
                                                        onChange={(val) =>
                                                            setData(
                                                                "gardu_id",
                                                                val
                                                            )
                                                        }
                                                    >
                                                        <Listbox.Button
                                                            className="pl-4 pr-10 py-2 w-full rounded-lg border border-blue-200 bg-white text-md text-left shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                                                            placeholder="Pilih Gardu Induk"
                                                        >
                                                            {findById(
                                                                gardus,
                                                                data.gardu_id
                                                            )?.name ||
                                                                "Pilih Gardu Induk"}
                                                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                                <ChevronUpDownIcon
                                                                    className="h-5 w-5 text-gray-400"
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
                                                            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                                {gardus.map(
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
                                                                                `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                                                                    active
                                                                                        ? "bg-blue-100 text-blue-900"
                                                                                        : "text-gray-900"
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
                                                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                                                                            <FaCheck
                                                                                                className="h-4 w-4"
                                                                                                aria-hidden="true"
                                                                                            />
                                                                                        </span>
                                                                                    ) : null}
                                                                                </>
                                                                            )}
                                                                        </Listbox.Option>
                                                                    )
                                                                )}
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
                                                    className="text-sm font-bold tracking-wide text-gray-700"
                                                />
                                                <div className="relative">
                                                    <Listbox
                                                        value={data.bagian}
                                                        onChange={(val) =>
                                                            setData(
                                                                "bagian",
                                                                val
                                                            )
                                                        }
                                                    >
                                                        <Listbox.Button
                                                            className="pl-4 pr-10 py-2 w-full rounded-lg border border-blue-200 bg-white text-md text-left shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                                                            placeholder="Pilih Bagian"
                                                        >
                                                            {bagianOptions.find(
                                                                (opt) =>
                                                                    opt.id ===
                                                                    data.bagian
                                                            )?.name ||
                                                                "Pilih Bagian"}
                                                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                                <ChevronUpDownIcon
                                                                    className="h-5 w-5 text-gray-400"
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
                                                            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
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
                                                                                `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                                                                    active
                                                                                        ? "bg-blue-100 text-blue-900"
                                                                                        : "text-gray-900"
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
                                                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                                                                            <FaCheck
                                                                                                className="h-4 w-4"
                                                                                                aria-hidden="true"
                                                                                            />
                                                                                        </span>
                                                                                    ) : null}
                                                                                </>
                                                                            )}
                                                                        </Listbox.Option>
                                                                    )
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
                                                    className="text-sm font-bold tracking-wide text-gray-700"
                                                />
                                                <div className="relative">
                                                    <Listbox
                                                        value={data.tipe}
                                                        onChange={(val) =>
                                                            setData("tipe", val)
                                                        }
                                                    >
                                                        <Listbox.Button
                                                            className="pl-4 pr-10 py-2 w-full rounded-lg border border-blue-200 bg-white text-md text-left shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                                                            placeholder="Pilih Tipe"
                                                        >
                                                            {tipeOptions.find(
                                                                (opt) =>
                                                                    opt.id ===
                                                                    data.tipe
                                                            )?.name ||
                                                                "Pilih Tipe"}
                                                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                                <ChevronUpDownIcon
                                                                    className="h-5 w-5 text-gray-400"
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
                                                            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                                {tipeOptions.map(
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
                                                                                `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                                                                    active
                                                                                        ? "bg-blue-100 text-blue-900"
                                                                                        : "text-gray-900"
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
                                                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                                                                            <FaCheck
                                                                                                className="h-4 w-4"
                                                                                                aria-hidden="true"
                                                                                            />
                                                                                        </span>
                                                                                    ) : null}
                                                                                </>
                                                                            )}
                                                                        </Listbox.Option>
                                                                    )
                                                                )}
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
                                                    className="text-sm font-bold tracking-wide text-gray-700"
                                                />
                                                <div className="relative">
                                                    <Listbox
                                                        value={data.kategori_id}
                                                        onChange={(val) =>
                                                            setData(
                                                                "kategori_id",
                                                                val
                                                            )
                                                        }
                                                    >
                                                        <Listbox.Button
                                                            className="pl-4 pr-10 py-2 w-full rounded-lg border border-blue-200 bg-white text-md text-left shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                                                            placeholder="Pilih Kategori"
                                                        >
                                                            {findById(
                                                                kategoris,
                                                                data.kategori_id
                                                            )?.name ||
                                                                "Pilih Kategori"}
                                                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                                <ChevronUpDownIcon
                                                                    className="h-5 w-5 text-gray-400"
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
                                                            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                                {kategoris.map(
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
                                                                                `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                                                                    active
                                                                                        ? "bg-blue-100 text-blue-900"
                                                                                        : "text-gray-900"
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
                                                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                                                                            <FaCheck
                                                                                                className="h-4 w-4"
                                                                                                aria-hidden="true"
                                                                                            />
                                                                                        </span>
                                                                                    ) : null}
                                                                                </>
                                                                            )}
                                                                        </Listbox.Option>
                                                                    )
                                                                )}
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
                                                    className="text-sm font-bold tracking-wide text-gray-700"
                                                />
                                                <div className="relative">
                                                    <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                                        <FaSearch className="text-blue-400 h-4 w-4" />
                                                    </span>
                                                    <TextInput
                                                        id="penempatan_alat"
                                                        value={
                                                            data.penempatan_alat
                                                        }
                                                        onChange={(e) =>
                                                            setData(
                                                                "penempatan_alat",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="pl-10 block w-full rounded-lg border border-blue-200 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-md px-4 py-2 shadow-sm transition-all"
                                                        placeholder="Di mana alat ini dipasang?"
                                                        required
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 pt-4 gap-8">
                                        {/* Peralatan */}
                                        <div className="relative flex flex-col justify-end">
                                            <InputLabel
                                                htmlFor="peralatan"
                                                value="Nama Peralatan"
                                                className="text-sm font-bold mb-1 tracking-wide text-gray-700"
                                            />
                                            <div className="relative">
                                                <span className="absolute mt-0.5 inset-y-0 left-4 flex items-center pointer-events-none">
                                                    <FaTools className="text-blue-400 h-3 w-3" />
                                                </span>
                                                <TextInput
                                                    id="peralatan"
                                                    value={data.peralatan}
                                                    onChange={(e) =>
                                                        setData(
                                                            "peralatan",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="pl-10 mt-1 block w-full rounded-xl border-blue-200 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-md px-4 py-2 shadow-sm transition-all"
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
                                                className="text-sm font-bold mb-1 tracking-wide text-gray-700"
                                            />
                                            <div className="relative">
                                                <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                                    <FaCalendarAlt className="text-blue-400 text-lg" />
                                                </span>
                                                <TextInput
                                                    id="tanggal_kejadian"
                                                    type="date"
                                                    value={
                                                        data.tanggal_kejadian
                                                    }
                                                    onChange={(e) =>
                                                        setData(
                                                            "tanggal_kejadian",
                                                            e.target.value
                                                        )
                                                    }
                                                    className={`pl-10 mt-1 block w-full rounded-xl border ${
                                                        errors.tanggal_kejadian
                                                            ? "border-red-400 focus:ring-red-400 focus:border-red-400"
                                                            : "border-blue-200 focus:ring-blue-400 focus:border-blue-400"
                                                    } text-md px-4 py-2 shadow-sm transition-all`}
                                                    placeholder="Pilih tanggal kejadian"
                                                    required
                                                />
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
                                                className="text-sm font-bold mb-1 tracking-wide text-gray-700"
                                            />
                                            <div className="relative">
                                                <TextInput
                                                    id="merek"
                                                    value={data.merek}
                                                    onChange={(e) =>
                                                        setData(
                                                            "merek",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="mt-1 block w-full rounded-xl border-blue-200 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-md px-4 py-2 shadow-sm transition-all"
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
                                                className="text-sm font-bold mb-1 tracking-wide text-gray-700"
                                            />
                                            <div className="relative">
                                                <TextInput
                                                    id="tipe_alat"
                                                    value={data.tipe_alat}
                                                    onChange={(e) =>
                                                        setData(
                                                            "tipe_alat",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="mt-1 block w-full rounded-xl border-blue-200 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-md px-4 py-2 shadow-sm transition-all"
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
                                                className="text-sm font-bold mb-1 tracking-wide text-gray-700"
                                            />
                                            <div className="relative">
                                                <TextInput
                                                    id="no_seri"
                                                    value={data.no_seri}
                                                    onChange={(e) =>
                                                        setData(
                                                            "no_seri",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="mt-1 block w-full rounded-xl border-blue-200 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-md px-4 py-2 shadow-sm transition-all"
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
                                                className="text-sm font-bold mb-1 tracking-wide text-gray-700"
                                            />
                                            <div className="relative">
                                                <TextInput
                                                    id="harga"
                                                    value={data.harga}
                                                    onChange={(e) =>
                                                        setData(
                                                            "harga",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="mt-1 block w-full rounded-xl border-blue-200 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-md px-4 py-2 shadow-sm transition-all"
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
                                                className="text-sm font-bold mb-1 tracking-wide text-gray-700"
                                            />
                                            <div className="relative">
                                                <TextInput
                                                    id="kode_asset"
                                                    value={data.kode_asset}
                                                    onChange={(e) =>
                                                        setData(
                                                            "kode_asset",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="mt-1 block w-full rounded-xl border-blue-200 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-md px-4 py-2 shadow-sm transition-all"
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
                                                className="text-sm font-bold mb-1 tracking-wide text-gray-700"
                                            />
                                            <div className="relative">
                                                <TextInput
                                                    id="tahun_operasi"
                                                    value={data.tahun_operasi}
                                                    onChange={(e) =>
                                                        setData(
                                                            "tahun_operasi",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="mt-1 block w-full rounded-xl border-blue-200 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-md px-4 py-2 shadow-sm transition-all"
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
                                                className="text-sm font-bold mb-1 tracking-wide text-gray-700"
                                            />
                                            <div className="relative">
                                                <TextInput
                                                    id="tahun_buat"
                                                    value={data.tahun_buat}
                                                    onChange={(e) =>
                                                        setData(
                                                            "tahun_buat",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="mt-1 block w-full rounded-xl border-blue-200 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-md px-4 py-2 shadow-sm transition-all"
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 pt-4 gap-8">
                                        {/* Penyebab */}
                                        <div className="relative flex flex-col justify-end">
                                            <InputLabel
                                                htmlFor="penyebab"
                                                value="Penyebab"
                                                className="text-sm font-bold mb-1 tracking-wide text-gray-700"
                                            />
                                            <div className="relative flex items-center">
                                                <textarea
                                                    id="penyebab"
                                                    value={data.penyebab}
                                                    onChange={(e) =>
                                                        setData(
                                                            "penyebab",
                                                            e.target.value
                                                        )
                                                    }
                                                    className=" mt-1 block w-full rounded-xl border-blue-200 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-md px-4 py-2 shadow-sm transition-all min-h-[60px]"
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
                                                className="text-sm font-bold mb-1 tracking-wide text-gray-700"
                                            />
                                            <div className="relative flex items-center">
                                                <textarea
                                                    id="akibat"
                                                    value={data.akibat}
                                                    onChange={(e) =>
                                                        setData(
                                                            "akibat",
                                                            e.target.value
                                                        )
                                                    }
                                                    className=" mt-1 block w-full rounded-xl border-blue-200 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-md px-4 py-2 shadow-sm transition-all min-h-[60px]"
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
                                                className="text-sm font-bold mb-1 tracking-wide text-gray-700"
                                            />
                                            <div className="relative flex items-center">
                                                <textarea
                                                    id="usul_saran"
                                                    value={data.usul_saran}
                                                    onChange={(e) =>
                                                        setData(
                                                            "usul_saran",
                                                            e.target.value
                                                        )
                                                    }
                                                    className=" mt-1 block w-full rounded-xl border-blue-200 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-md px-4 py-2 shadow-sm transition-all min-h-[60px]"
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 pt-4 gap-8">
                                        {/* Lampiran Foto */}
                                        <div className="bg-white/90 rounded-2xl shadow-md border border-blue-100 overflow-hidden flex flex-col">
                                            <div className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-100 to-blue-50 border-b border-blue-100">
                                                <span className="text-blue-600 font-bold">
                                                    📎
                                                </span>
                                                <h2 className="text-md font-bold text-blue-800 tracking-tight">
                                                    Lampiran Foto
                                                </h2>
                                            </div>
                                            <div className="p-6 flex-1 flex flex-col">
                                                <InputLabel
                                                    htmlFor="lampiran_foto"
                                                    value="Lampiran Foto (max 5 gambar)"
                                                    className="text-sm font-semibold mb-1"
                                                />
                                                <label
                                                    htmlFor="lampiran_foto"
                                                    className="flex items-center gap-2 cursor-pointer px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl shadow hover:bg-blue-100 w-fit mb-3"
                                                >
                                                    <FaPlus className="text-blue-600" />
                                                    <span className="font-semibold text-blue-700 text-sm">
                                                        Tambah Foto
                                                    </span>
                                                </label>
                                                <input
                                                    id="lampiran_foto"
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                    disabled={
                                                        preview.length >=
                                                        MAX_FILES
                                                    }
                                                />
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                                                    {preview.map((src, i) => (
                                                        <div
                                                            key={i}
                                                            className="relative group border rounded-xl overflow-hidden shadow bg-white"
                                                        >
                                                            <img
                                                                src={src}
                                                                alt="preview"
                                                                className="w-full h-32 object-cover"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleRemoveImage(
                                                                        i
                                                                    )
                                                                }
                                                                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700 transition"
                                                                title="Hapus Foto"
                                                            >
                                                                <FaTrash className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="absolute inset-0 bg-blue-900/10 opacity-0 group-hover:opacity-100 rounded-xl transition-all duration-200 flex items-center justify-center text-sm text-white font-semibold"
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    setPreviewIndex(
                                                                        i
                                                                    );
                                                                    setPreviewModal(
                                                                        true
                                                                    );
                                                                }}
                                                            >
                                                                Preview
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                                {preview.length >=
                                                    MAX_FILES && (
                                                    <div className="text-sm text-red-500 mt-2">
                                                        Maksimal {MAX_FILES}{" "}
                                                        gambar.
                                                    </div>
                                                )}
                                                <InputError
                                                    message={
                                                        errors.lampiran_foto
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 5 && (
                                <div className="border rounded-lg p-6 bg-gray-50">
                                    <h2 className="text-lg font-bold mb-4 text-blue-700">
                                        Review {data.judul}
                                    </h2>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full text-gray-800">
                                            <tbody>
                                                {/* 1. DATA PERALATAN YANG RUSAK */}
                                                <tr>
                                                    <td
                                                        colSpan={3}
                                                        className="font-semibold uppercase py-2 pb-1"
                                                    >
                                                        1. DATA PERALATAN YANG
                                                        RUSAK
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="pl-6 py-1 w-56">
                                                        a. Nama Peralatan
                                                    </td>
                                                    <td className="w-6 text-right pr-2">
                                                        :
                                                    </td>
                                                    <td>
                                                        {data.peralatan || "-"}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="pl-6 py-1">
                                                        b. Merk
                                                    </td>
                                                    <td className="text-right pr-2">
                                                        :
                                                    </td>
                                                    <td>{data.merek || "-"}</td>
                                                </tr>
                                                <tr>
                                                    <td className="pl-6 py-1">
                                                        c. Tipe
                                                    </td>
                                                    <td className="text-right pr-2">
                                                        :
                                                    </td>
                                                    <td>
                                                        {data.tipe_alat || "-"}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="pl-6 py-1">
                                                        d. No Seri
                                                    </td>
                                                    <td className="text-right pr-2">
                                                        :
                                                    </td>
                                                    <td>
                                                        {data.no_seri || "-"}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="pl-6 py-1">
                                                        e. Harga
                                                    </td>
                                                    <td className="text-right pr-2">
                                                        :
                                                    </td>
                                                    <td>{data.harga || "-"}</td>
                                                </tr>
                                                <tr>
                                                    <td className="pl-6 py-1">
                                                        f. Kode Asset
                                                    </td>
                                                    <td className="text-right pr-2">
                                                        :
                                                    </td>
                                                    <td>
                                                        {data.kode_asset || "-"}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="pl-6 py-1">
                                                        g. Tahun Operasi
                                                    </td>
                                                    <td className="text-right pr-2">
                                                        :
                                                    </td>
                                                    <td>
                                                        {data.tahun_operasi ||
                                                            "-"}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="pl-6 py-1">
                                                        h. Tahun Buat
                                                    </td>
                                                    <td className="text-right pr-2">
                                                        :
                                                    </td>
                                                    <td>
                                                        {data.tahun_buat || "-"}
                                                    </td>
                                                </tr>
                                                {/* 2. PENEMPATAN PERALATAN */}
                                                <tr>
                                                    <td className="pt-4 font-semibold">
                                                        2. PENEMPATAN PERALATAN
                                                    </td>
                                                    <td className="pt-4 text-right pr-2">
                                                        :
                                                    </td>
                                                    <td className="pt-4">
                                                        {data.penempatan_alat ||
                                                            "-"}
                                                    </td>
                                                </tr>
                                                {/* 3. TANGGAL KEJADIAN */}
                                                <tr>
                                                    <td className="font-semibold">
                                                        3. TANGGAL KEJADIAN
                                                    </td>
                                                    <td className="text-right pr-2">
                                                        :
                                                    </td>
                                                    <td>
                                                        {data.tanggal_kejadian ||
                                                            "-"}
                                                    </td>
                                                </tr>
                                                {/* 4. JENIS KERUSAKAN */}
                                                <tr>
                                                    <td className="font-semibold">
                                                        4. JENIS KERUSAKAN
                                                    </td>
                                                    <td className="text-right pr-2">
                                                        :
                                                    </td>
                                                    <td>{data.judul || "-"}</td>
                                                </tr>
                                                {/* 5. PENYEBAB KERUSAKAN */}
                                                <tr>
                                                    <td className="font-semibold">
                                                        5. PENYEBAB KERUSAKAN
                                                    </td>
                                                    <td className="text-right pr-2">
                                                        :
                                                    </td>
                                                    <td>
                                                        {data.penyebab || "-"}
                                                    </td>
                                                </tr>
                                                {/* 6. AKIBAT KERUSAKAN */}
                                                <tr>
                                                    <td className="font-semibold">
                                                        6. AKIBAT KERUSAKAN
                                                    </td>
                                                    <td className="text-right pr-2">
                                                        :
                                                    </td>
                                                    <td>
                                                        {data.akibat || "-"}
                                                    </td>
                                                </tr>
                                                {/* 7. USUL DAN SARAN */}
                                                <tr>
                                                    <td className="font-semibold">
                                                        7. USUL DAN SARAN
                                                    </td>
                                                    <td className="text-right pr-2">
                                                        :
                                                    </td>
                                                    <td>
                                                        {data.usul_saran || "-"}
                                                    </td>
                                                </tr>
                                                {/* 8. LAMPIRAN */}
                                                <tr className="align-top">
                                                    <td className="font-semibold">
                                                        8. LAMPIRAN
                                                    </td>
                                                    <td className="text-right pr-2 pt-2">
                                                        :
                                                    </td>
                                                    <td className="pt-2">
                                                        {preview &&
                                                        preview.length > 0 ? (
                                                            <>
                                                                <span className="font-bold">
                                                                    Terlampir
                                                                    Foto
                                                                </span>
                                                                <div className="flex flex-wrap gap-2 mt-2">
                                                                    {preview.map(
                                                                        (
                                                                            src,
                                                                            i
                                                                        ) => (
                                                                            <img
                                                                                key={
                                                                                    i
                                                                                }
                                                                                src={
                                                                                    src
                                                                                }
                                                                                alt={`Lampiran ${
                                                                                    i +
                                                                                    1
                                                                                }`}
                                                                                className="w-20 h-20 object-cover rounded border"
                                                                            />
                                                                        )
                                                                    )}
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <span className="italic text-gray-400">
                                                                -
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between gap-6 mt-6 pt-4">
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className={`w-full md:w-auto bg-gradient-to-l from-slate-500 to-slate-400 text-white px-4 sm:px-5 py-2 rounded-lg shadow  font-semibold flex items-center justify-center gap-2 transition text-sm sm:text-base ${
                                        step === 1
                                            ? "cursor-not-allowed opacity-50"
                                            : "hover:from-slate-700 hover:to-gray-500"
                                    }`}
                                    disabled={step === 1}
                                >
                                    Back
                                </button>
                                {step < 5 && (
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-400 text-white px-4 sm:px-5 py-2 rounded-lg shadow hover:from-blue-700 hover:to-blue-500 font-semibold flex items-center justify-center gap-2 transition text-sm sm:text-base"
                                    >
                                        Next
                                    </button>
                                )}
                                {step === 5 && (
                                    <button
                                        type="submit"
                                        disabled={processing || isSubmitting}
                                        className="w-full md:w-auto bg-gradient-to-r from-green-600 to-green-400 text-white px-4 sm:px-5 py-2 rounded-lg shadow hover:from-green-700 hover:to-green-500 font-semibold flex items-center justify-center gap-2 transition text-sm sm:text-base"
                                    >
                                        Submit
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
