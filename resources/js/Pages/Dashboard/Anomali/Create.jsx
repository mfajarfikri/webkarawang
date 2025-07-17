import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head } from "@inertiajs/react";
import { useForm } from "@inertiajs/react";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import { useState } from "react";
import { FaFileAlt, FaPlus, FaTrash, FaCalendarAlt, FaBuilding, FaList, FaThLarge, FaLayerGroup, FaMapMarkerAlt, FaMapPin, FaTools, FaExclamationTriangle, FaBolt, FaLightbulb, FaSearch, FaTag } from "react-icons/fa";
import { FaCheck } from "react-icons/fa6";
import ApplicationLogo from "@/Components/ApplicationLogo";
import { Switch, Dialog, Transition, Listbox } from "@headlessui/react";
import { Fragment } from "react";
import { ChevronUpDownIcon } from "@heroicons/react/24/solid";
import React from "react";

export default function Create({ gardus = [], kategoris = [], bays = [], users = [], peralatans = [] }){
    const { data, setData, post, processing, errors, reset } = useForm({
        judul: "",
        ultg: users.penempatan || "",
        gardu_id: "",
        bagian: "Banghal",
        tipe: "Major",
        kategori_id: "",
        bay_id: "",
        user_id: "",
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
        assign_to: "",
        prioritas: false,
    });
    const [preview, setPreview] = useState([]);
    const [previewModal, setPreviewModal] = useState(false);
    const [previewIndex, setPreviewIndex] = useState(0);
    const [step, setStep] = useState(1);
    const totalSteps = 5;

    // Helper for Listbox
    function findById(arr, id) {
        return arr.find((item) => String(item.id) === String(id)) || null;
    }

    const MAX_FILES = 5;
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        // Filter hanya gambar dan max 5 file
        const validFiles = files.filter(file => file.type.startsWith("image/"));
        if (validFiles.length + preview.length > MAX_FILES) {
            alert(`Maksimal ${MAX_FILES} file gambar!`);
            return;
        }
        setData("lampiran_foto", [...data.lampiran_foto, ...validFiles]);
        setPreview([...preview, ...validFiles.map(file => URL.createObjectURL(file))]);
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

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (key === "lampiran_foto") {
                value.forEach((file) => formData.append("lampiran_foto[]", file));
            } else {
                formData.append(key, value);
            }
        });
        post(route("dashboard.anomali.store"), {
            data: formData,
            forceFormData: true,
            onSuccess: () => {
                reset();
                setPreview([]);
            },
        });
    };

    // Listbox options
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

    // Helper for Stepper
    const stepLabels = [
        "Data Anomali",
        "Detail Peralatan",
        "Penyebab & Akibat",
        "Lampiran & Usul/Saran",
        "Review & Submit"
    ];

    // Stepper Component
    function Stepper() {
        return (
            <div className="flex items-center justify-center px-2 pt-8 pb-4">
                <div className="flex items-center w-full max-w-2xl mx-auto">
                    {stepLabels.map((label, idx) => (
                        <React.Fragment key={label}>
                            <div className="flex flex-col items-center flex-1 min-w-0">
                                <div
                                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm ${
                                        step === idx + 1
                                            ? "bg-indigo-600 text-white"
                                            : idx + 1 < step
                                            ? "bg-blue-400 text-white"
                                            : "bg-gray-200 text-gray-400"
                                    }`}
                                >
                                    {idx + 1}
                                </div>
                                <span
                                    className={`text-[10px] font-semibold mt-0.5 text-center truncate ${
                                        step === idx + 1
                                            ? "text-indigo-700"
                                            : idx + 1 < step
                                            ? "text-blue-400"
                                            : "text-gray-400"
                                    }`}
                                >
                                    {label}
                                </span>
                            </div>
                            {idx < stepLabels.length - 1 && (
                                <div
                                    className={`h-1 rounded-lg ${
                                        step > idx + 1 ? "bg-blue-400" : "bg-indigo-100"
                                    } mx-1 w-4 md:w-8`}
                                />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        );
    }

    // Step 1: Data Anomali
    function Step1() {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Judul */}
                <div className="relative flex flex-col justify-end">
                    <InputLabel htmlFor="judul" value="Judul" className="text-xs font-bold mb-1 uppercase tracking-wide text-gray-700" />
                    <div className="relative">
                        <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <FaTag className="text-blue-400 h-3 w-3" />
                        </span>
                        <TextInput
                            id="judul"
                            value={data.judul}
                            onChange={e => setData("judul", e.target.value)}
                            className={`pl-9 mt-0 block w-full rounded-xl border border-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-md px-4 py-2 shadow-sm transition-all`}
                            placeholder="Masukkan judul anomali"
                            required
                        />
                    </div>
                    <InputError message={errors.judul} />
                </div>
                {/* ULTG */}
                <div className="relative flex flex-col justify-end">
                    <InputLabel value="ULTG" className="text-xs font-bold mb-1 uppercase tracking-wide text-gray-700" />
                    <div className="relative mt-1">
                        <Listbox value={data.ultg} onChange={val => setData("ultg", val)}>
                            <Listbox.Button className="pl-4 relative w-full cursor-pointer rounded-xl border border-blue-200 bg-white py-2 pr-10 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-md" placeholder="Pilih ULTG">
                                {ultgOptions.find(opt => opt.id === data.ultg)?.name || "Pilih ULTG"}
                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                    <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </span>
                            </Listbox.Button>
                            <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                    {ultgOptions.map(opt => (
                                        <Listbox.Option
                                            key={opt.id}
                                            value={opt.id}
                                            className={({ active }) => `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'}` }>
                                            {({ selected }) => (
                                                <>
                                                    <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>{opt.name}</span>
                                                    {selected ? (
                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                                            <FaCheck className="h-4 w-4" aria-hidden="true" />
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
                    <InputError message={errors.ultg} />
                </div>
                {/* Gardu Induk */}
                <div className="relative flex flex-col justify-end">
                    <InputLabel value="Gardu Induk" className="text-xs font-bold mb-1 uppercase tracking-wide text-gray-700" />
                    <div className="relative mt-1">
                        <Listbox value={data.gardu_id} onChange={val => setData("gardu_id", val)}>
                            <Listbox.Button className="pl-4 relative w-full cursor-pointer rounded-xl border border-blue-200 bg-white py-2 pr-10 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-md" placeholder="Pilih Gardu Induk">
                                {findById(gardus, data.gardu_id)?.name || "Pilih Gardu Induk"}
                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                    <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </span>
                            </Listbox.Button>
                            <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                    {gardus.map(opt => (
                                        <Listbox.Option key={opt.id} value={opt.id} className={({ active }) => `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'}` }>
                                            {({ selected }) => (
                                                <>
                                                    <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>{opt.name}</span>
                                                    {selected ? (
                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                                            <FaCheck className="h-5 w-5" aria-hidden="true" />
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
                    <InputError message={errors.gardu_id} />
                </div>
                {/* Bagian */}
                <div className="relative flex flex-col justify-end">
                    <InputLabel value="Bagian" className="text-xs font-bold mb-1 uppercase tracking-wide text-gray-700" />
                    <div className="relative mt-1">
                        <Listbox value={data.bagian} onChange={val => setData("bagian", val)}>
                            <Listbox.Button className="pl-4 relative w-full cursor-pointer rounded-xl border border-blue-200 bg-white py-2 pr-10 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-md" placeholder="Pilih Bagian">
                                {bagianOptions.find(opt => opt.id === data.bagian)?.name || "Pilih Bagian"}
                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                    <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </span>
                            </Listbox.Button>
                            <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                    {bagianOptions.map(opt => (
                                        <Listbox.Option key={opt.id} value={opt.id} className={({ active }) => `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'}` }>
                                            {({ selected }) => (
                                                <>
                                                    <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>{opt.name}</span>
                                                    {selected ? (
                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                                            <FaCheck className="h-5 w-5" aria-hidden="true" />
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
                    <InputError message={errors.bagian} />
                </div>
                {/* Tipe */}
                <div className="relative flex flex-col justify-end">
                    <InputLabel value="Tipe" className="text-xs font-bold mb-1 uppercase tracking-wide text-gray-700" />
                    <div className="relative mt-1">
                        <Listbox value={data.tipe} onChange={val => setData("tipe", val)}>
                            <Listbox.Button className="pl-4 relative w-full cursor-pointer rounded-xl border border-blue-200 bg-white py-2 pr-10 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-md" placeholder="Pilih Tipe">
                                {tipeOptions.find(opt => opt.id === data.tipe)?.name || "Pilih Tipe"}
                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                    <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </span>
                            </Listbox.Button>
                            <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                    {tipeOptions.map(opt => (
                                        <Listbox.Option key={opt.id} value={opt.id} className={({ active }) => `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'}` }>
                                            {({ selected }) => (
                                                <>
                                                    <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>{opt.name}</span>
                                                    {selected ? (
                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                                            <FaCheck className="h-5 w-5" aria-hidden="true" />
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
                    <InputError message={errors.tipe} />
                </div>
                {/* Kategori */}
                <div className="relative flex flex-col justify-end">
                    <InputLabel value="Kategori" className="text-xs font-bold mb-1 uppercase tracking-wide text-gray-700" />
                    <div className="relative mt-1">
                        <Listbox value={data.kategori_id} onChange={val => setData("kategori_id", val)}>
                            <Listbox.Button className="pl-4 relative w-full cursor-pointer rounded-xl border border-blue-200 bg-white py-2 pr-10 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-md" placeholder="Pilih Kategori">
                                {findById(kategoris, data.kategori_id)?.nama || "Pilih Kategori"}
                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                    <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </span>
                            </Listbox.Button>
                            <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                    {kategoris.map(opt => (
                                        <Listbox.Option key={opt.id} value={opt.id} className={({ active }) => `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'}` }>
                                            {({ selected }) => (
                                                <>
                                                    <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>{opt.nama}</span>
                                                    {selected ? (
                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                                            <FaCheck className="h-5 w-5" aria-hidden="true" />
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
                    <InputError message={errors.kategori_id} />
                </div>
                {/* Penempatan Alat */}
                <div className="relative flex flex-col justify-end">
                    <InputLabel htmlFor="penempatan_alat" value="Penempatan Alat" className="text-xs font-bold mb-1 uppercase tracking-wide text-gray-700" />
                    <div className="relative">
                        <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <FaSearch className="text-blue-400 h-3 w-3" />
                        </span>
                        <TextInput
                            id="penempatan_alat"
                            value={data.penempatan_alat}
                            onChange={e => setData("penempatan_alat", e.target.value)}
                            className="pl-9 mt-1 block w-full rounded-xl border-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-md px-4 py-2 shadow-sm transition-all"
                            placeholder="Di mana alat ini dipasang?"
                            required
                        />
                    </div>
                    <InputError message={errors.penempatan_alat} />
                </div>
            </div>
        );
    }

    // Step 2: Detail Peralatan
    function Step2() {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Peralatan */}
                <div className="relative flex flex-col justify-end">
                    <InputLabel htmlFor="peralatan" value="Nama Peralatan" className="text-xs font-bold mb-1 uppercase tracking-wide text-gray-700" />
                    <div className="relative">
                        <span className="absolute mt-0.5 inset-y-0 left-4 flex items-center pointer-events-none">
                            <FaTools className="text-blue-400 h-3 w-3" />
                        </span>
                        <TextInput
                            id="peralatan"
                            value={data.peralatan}
                            onChange={e => setData("peralatan", e.target.value)}
                            className="pl-10 mt-1 block w-full rounded-xl border-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-md px-4 py-2 shadow-sm transition-all"
                            placeholder="Masukkan nama peralatan"
                            required
                        />
                    </div>
                    <InputError message={errors.peralatan} />
                </div>
                {/* Tanggal Kejadian */}
                <div className="relative flex flex-col justify-end">
                    <InputLabel htmlFor="tanggal_kejadian" value="Tanggal Kejadian" className="text-xs font-bold mb-1 uppercase tracking-wide text-gray-700" />
                    <div className="relative">
                        <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <FaCalendarAlt className="text-blue-400 text-lg" />
                        </span>
                        <TextInput
                            id="tanggal_kejadian"
                            type="date"
                            value={data.tanggal_kejadian}
                            onChange={e => setData("tanggal_kejadian", e.target.value)}
                            className={`pl-10 mt-1 block w-full rounded-xl border ${errors.tanggal_kejadian ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : 'border-blue-200 focus:ring-blue-400 focus:border-blue-400'} text-md px-4 py-2 shadow-sm transition-all`}
                            placeholder="Pilih tanggal kejadian"
                            required
                        />
                    </div>
                    <InputError message={errors.tanggal_kejadian} />
                </div>
                <div className="relative flex flex-col justify-end">
                    <InputLabel htmlFor="merek" value="Merek (optional)" className="text-xs font-bold mb-1 uppercase tracking-wide text-gray-700" />
                    <div className="relative">
                        <TextInput id="merek" value={data.merek} onChange={e => setData("merek", e.target.value)} className="mt-1 block w-full rounded-xl border-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-md px-4 py-2 shadow-sm transition-all" />
                        <InputError message={errors.merek} />
                    </div>
                </div>
                <div className="relative flex flex-col justify-end">
                    <InputLabel htmlFor="tipe_alat" value="Tipe (optional)" className="text-xs font-bold mb-1 uppercase tracking-wide text-gray-700" />
                    <div className="relative">
                        <TextInput id="tipe_alat" value={data.tipe_alat} onChange={e => setData("tipe_alat", e.target.value)} className="mt-1 block w-full rounded-xl border-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-md px-4 py-2 shadow-sm transition-all" />
                        <InputError message={errors.tipe_alat} />
                    </div>
                </div>
                <div className="relative flex flex-col justify-end">
                    <InputLabel htmlFor="no_seri" value="No Seri (optional)" className="text-xs font-bold mb-1 uppercase tracking-wide text-gray-700" />
                    <div className="relative">
                        <TextInput id="no_seri" value={data.no_seri} onChange={e => setData("no_seri", e.target.value)} className="mt-1 block w-full rounded-xl border-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-md px-4 py-2 shadow-sm transition-all" />
                        <InputError message={errors.no_seri} />
                    </div>
                </div>
                <div className="relative flex flex-col justify-end">
                    <InputLabel htmlFor="harga" value="Harga (optional)" className="text-xs font-bold mb-1 uppercase tracking-wide text-gray-700" />
                    <div className="relative">
                        <TextInput id="harga" value={data.harga} onChange={e => setData("harga", e.target.value)} className="mt-1 block w-full rounded-xl border-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-md px-4 py-2 shadow-sm transition-all" />
                        <InputError message={errors.harga} />
                    </div>
                </div>
                <div className="relative flex flex-col justify-end">
                    <InputLabel htmlFor="kode_asset" value="Kode Asset (optional)" className="text-xs font-bold mb-1 uppercase tracking-wide text-gray-700" />
                    <div className="relative">
                        <TextInput id="kode_asset" value={data.kode_asset} onChange={e => setData("kode_asset", e.target.value)} className="mt-1 block w-full rounded-xl border-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-md px-4 py-2 shadow-sm transition-all" />
                        <InputError message={errors.kode_asset} />
                    </div>
                </div>
                <div className="relative flex flex-col justify-end">
                    <InputLabel htmlFor="tahun_operasi" value="Tahun Operasi (optional)" className="text-xs font-bold mb-1 uppercase tracking-wide text-gray-700" />
                    <div className="relative">
                        <TextInput id="tahun_operasi" value={data.tahun_operasi} onChange={e => setData("tahun_operasi", e.target.value)} className="mt-1 block w-full rounded-xl border-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-md px-4 py-2 shadow-sm transition-all" />
                        <InputError message={errors.tahun_operasi} />
                    </div>
                </div>
                <div className="relative flex flex-col justify-end">
                    <InputLabel htmlFor="tahun_buat" value="Tahun Buat (optional)" className="text-xs font-bold mb-1 uppercase tracking-wide text-gray-700" />
                    <div className="relative">
                        <TextInput id="tahun_buat" value={data.tahun_buat} onChange={e => setData("tahun_buat", e.target.value)} className="mt-1 block w-full rounded-xl border-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-md px-4 py-2 shadow-sm transition-all" />
                        <InputError message={errors.tahun_buat} />
                    </div>
                </div>
            </div>
        );
    }

    // Step 3: Penyebab & Akibat
    function Step3() {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Penyebab */}
                <div className="relative flex flex-col justify-end">
                    <InputLabel htmlFor="penyebab" value="Penyebab" className="text-xs font-bold mb-1 uppercase tracking-wide text-gray-700" />
                    <div className="relative">
                        <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <FaExclamationTriangle className="text-yellow-500" />
                        </span>
                        <textarea id="penyebab" value={data.penyebab} onChange={e => setData("penyebab", e.target.value)} className="pl-10 mt-1 block w-full rounded-xl border-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-md px-4 py-2 shadow-sm transition-all min-h-[60px]" placeholder="Jelaskan penyebab anomali" required />
                        <InputError message={errors.penyebab} />
                    </div>
                </div>
                {/* Akibat */}
                <div className="relative flex flex-col justify-end">
                    <InputLabel htmlFor="akibat" value="Akibat" className="text-xs font-bold mb-1 uppercase tracking-wide text-gray-700" />
                    <div className="relative">
                        <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <FaBolt className="text-red-400" />
                        </span>
                        <textarea id="akibat" value={data.akibat} onChange={e => setData("akibat", e.target.value)} className="pl-10 mt-1 block w-full rounded-xl border-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-md px-4 py-2 shadow-sm transition-all min-h-[60px]" placeholder="Jelaskan akibat anomali" required />
                        <InputError message={errors.akibat} />
                    </div>
                </div>
                {/* Usul/Saran */}
                <div className="relative flex flex-col justify-end">
                    <InputLabel htmlFor="usul_saran" value="Usul/Saran" className="text-xs font-bold mb-1 uppercase tracking-wide text-gray-700" />
                    <div className="relative">
                        <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <FaLightbulb className="text-green-400" />
                        </span>
                        <textarea id="usul_saran" value={data.usul_saran} onChange={e => setData("usul_saran", e.target.value)} className="pl-10 mt-1 block w-full rounded-xl border-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-md px-4 py-2 shadow-sm transition-all min-h-[60px]" placeholder="Tulis usul atau saran (opsional)" />
                        <InputError message={errors.usul_saran} />
                    </div>
                </div>
            </div>
        );
    }

    // Step 4: Lampiran & Usul/Saran
    function Step4() {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Lampiran Foto */}
                <div className="bg-white/90 rounded-2xl shadow-md border border-blue-100 overflow-hidden flex flex-col">
                    <div className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-100 to-blue-50 border-b border-blue-100">
                        <span className="text-blue-600 font-bold">📎</span>
                        <h2 className="text-md font-bold text-blue-800 tracking-tight">Lampiran Foto</h2>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                        <InputLabel htmlFor="lampiran_foto" value="Lampiran Foto (max 5 gambar)" className="text-sm font-semibold mb-1" />
                        <label htmlFor="lampiran_foto" className="flex items-center gap-2 cursor-pointer px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl shadow hover:bg-blue-100 w-fit mb-3">
                            <FaPlus className="text-blue-600" />
                            <span className="font-semibold text-blue-700 text-sm">Tambah Foto</span>
                        </label>
                        <input id="lampiran_foto" type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" disabled={preview.length >= MAX_FILES} />
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                            {preview.map((src, i) => (
                                <div key={i} className="relative group border rounded-xl overflow-hidden shadow bg-white">
                                    <img src={src} alt="preview" className="w-full h-32 object-cover" />
                                    <button type="button" onClick={() => handleRemoveImage(i)} className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700 transition" title="Hapus Foto">
                                        <FaTrash className="h-4 w-4" />
                                    </button>
                                    <button type="button" className="absolute inset-0 bg-blue-900/10 opacity-0 group-hover:opacity-100 rounded-xl transition-all duration-200 flex items-center justify-center text-xs text-white font-semibold" onClick={e => { e.stopPropagation(); setPreviewIndex(i); setPreviewModal(true); }}>Preview</button>
                                </div>
                            ))}
                        </div>
                        {preview.length >= MAX_FILES && (
                            <div className="text-xs text-red-500 mt-2">Maksimal {MAX_FILES} gambar.</div>
                        )}
                        <InputError message={errors.lampiran_foto} />
                    </div>
                </div>
            </div>
        );
    }

    // Step 5: Review & Submit
    function Step5() {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Review Data */}
                <div className="bg-white/90 rounded-2xl shadow-md border border-blue-100 overflow-hidden flex flex-col">
                    <div className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-100 to-blue-50 border-b border-blue-100">
                        <span className="text-blue-600 font-bold">📋</span>
                        <h2 className="text-md font-bold text-blue-800 tracking-tight">Review Data</h2>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-semibold text-gray-700">Judul Anomali:</p>
                                <p className="text-md font-bold text-blue-800">{data.judul}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-700">ULTG:</p>
                                <p className="text-md font-bold text-blue-800">{ultgOptions.find(opt => opt.id === data.ultg)?.name || "Pilih ULTG"}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-700">Gardu Induk:</p>
                                <p className="text-md font-bold text-blue-800">{findById(gardus, data.gardu_id)?.name || "Pilih Gardu Induk"}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-700">Bagian:</p>
                                <p className="text-md font-bold text-blue-800">{bagianOptions.find(opt => opt.id === data.bagian)?.name || "Pilih Bagian"}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-700">Tipe:</p>
                                <p className="text-md font-bold text-blue-800">{tipeOptions.find(opt => opt.id === data.tipe)?.name || "Pilih Tipe"}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-700">Kategori:</p>
                                <p className="text-md font-bold text-blue-800">{findById(kategoris, data.kategori_id)?.nama || "Pilih Kategori"}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-700">Penempatan Alat:</p>
                                <p className="text-md font-bold text-blue-800">{data.penempatan_alat}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-700">Nama Peralatan:</p>
                                <p className="text-md font-bold text-blue-800">{data.peralatan}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-700">Tanggal Kejadian:</p>
                                <p className="text-md font-bold text-blue-800">{data.tanggal_kejadian}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-700">Penyebab:</p>
                                <p className="text-md font-bold text-blue-800">{data.penyebab}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-700">Akibat:</p>
                                <p className="text-md font-bold text-blue-800">{data.akibat}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-700">Usul/Saran:</p>
                                <p className="text-md font-bold text-blue-800">{data.usul_saran}</p>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-4">
                            <PrimaryButton type="button" onClick={() => setStep(step - 1)} disabled={step === 1} className="text-md px-10 py-3 rounded-2xl shadow-lg bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:ring-gray-300 font-bold tracking-wide uppercase transition-all duration-200 w-full md:w-auto">
                                Back
                            </PrimaryButton>
                            <PrimaryButton type="submit" disabled={processing} className="text-md px-10 py-3 rounded-2xl shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-300 font-bold tracking-wide uppercase transition-all duration-200 w-full md:w-auto">
                                {processing ? "Menyimpan..." : "Simpan"}
                            </PrimaryButton>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <Head title="Buat Anomali"/>
            <DashboardLayout>
            <div className="flex items-center justify-center animate-fadein">
                <form onSubmit={handleSubmit} className="relative w-full mx-auto rounded-3xl shadow-lg border border-blue-100  p-0 overflow-hidden animate-cardpop">
                    {/* Accent bar and logo */}
                    <div className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-700 via-blue-500 to-indigo-500">
                        <div className="flex items-center gap-2">
                            <ApplicationLogo className="h-8 w-8" />
                            <span className="text-white font-bold text-md tracking-wide">UPT KARAWANG</span>
                        </div>
                    </div>
                    
                    <div className="px-0 py-0 md:px-8 md:py-4">
                        {/* Stepper */}
                        <Stepper />

                        {/* Step Content */}
                        {step === 1 && <Step1 />}
                        {step === 2 && <Step2 />}
                        {step === 3 && <Step3 />}
                        {step === 4 && <Step4 />}
                        {step === 5 && <Step5 />}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-10 px-2 md:px-0">
                            <PrimaryButton type="button" onClick={() => setStep(step - 1)} disabled={step === 1} className="text-sm px-10 py-2 rounded-2xl shadow-lg bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:ring-gray-300 font-bold tracking-wide uppercase transition-all duration-200 w-full md:w-auto">
                                Back
                            </PrimaryButton>
                            <PrimaryButton type="button" onClick={() => setStep(step + 1)} disabled={step === totalSteps} className="text-sm px-10 py-2 rounded-2xl shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-300 font-bold tracking-wide uppercase transition-all duration-200 w-full md:w-auto">
                                Next
                            </PrimaryButton>
                        </div>
                    </div>
                </form>
            </div>
            {/* Modal Preview Gambar */}
            <Transition appear show={previewModal} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setPreviewModal(false)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black bg-opacity-40" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title as="h3" className="text-md font-bold leading-6 text-gray-900 mb-4">
                                        Preview Gambar
                                    </Dialog.Title>
                                    {preview[previewIndex] && (
                                        <img src={preview[previewIndex]} alt="Preview" className="w-full h-96 object-contain rounded-xl border" />
                                    )}
                                    <div className="mt-4 flex justify-between items-center">
                                        <button type="button" className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 font-semibold" onClick={() => setPreviewModal(false)}>
                                            Tutup
                                        </button>
                                        <div className="flex gap-2">
                                            <button type="button" className="px-3 py-1 rounded bg-blue-100 hover:bg-blue-200 font-semibold" disabled={previewIndex === 0} onClick={() => setPreviewIndex(i => Math.max(0, i-1))}>
                                                Sebelumnya
                                            </button>
                                            <button type="button" className="px-3 py-1 rounded bg-blue-100 hover:bg-blue-200 font-semibold" disabled={previewIndex === preview.length-1} onClick={() => setPreviewIndex(i => Math.min(preview.length-1, i+1))}>
                                                Berikutnya
                                            </button>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
            </DashboardLayout>
        </>
    )
}