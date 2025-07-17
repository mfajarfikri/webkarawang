import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head } from "@inertiajs/react";
import { useForm } from "@inertiajs/react";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import { useState } from "react";
import { FaFileAlt } from "react-icons/fa";
import ApplicationLogo from "@/Components/ApplicationLogo";
import { Switch, Dialog, Transition, Listbox } from "@headlessui/react";
import { Fragment } from "react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/solid";

export default function Create({ gardus = [], kategoris = [], bays = [], users = [], peralatans = [] }){
    const { data, setData, post, processing, errors, reset } = useForm({
        judul: "",
        ultg: "ULTG Karawang",
        gardu_id: "",
        bagian: "Banghal",
        tipe: "Major",
        kategori_id: "",
        bay_id: "",
        user_id: "",
        peralatan_id: "",
        tanggal_temuan: "",
        deskripsi: "",
        lampiran_foto: [],
        usul_saran: "",
        assign_to: "",
        prioritas: false,
    });
    const [preview, setPreview] = useState([]);
    const [previewModal, setPreviewModal] = useState(false);
    const [previewIndex, setPreviewIndex] = useState(0);

    // Helper for Listbox
    function findById(arr, id) {
        return arr.find((item) => String(item.id) === String(id)) || null;
    }

    const handleFileChange = (e) => {
        setData("lampiran_foto", Array.from(e.target.files));
        setPreview(Array.from(e.target.files).map(file => URL.createObjectURL(file)));
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

    return (
        <>
            <Head title="Buat Anomali"/>
            <DashboardLayout>
            <div className="min-h-screen flex items-center justify-center py-8 px-2 animate-fadein">
                <form onSubmit={handleSubmit} className="relative w-full mx-auto rounded-3xl shadow-2xl border border-blue-100 bg-white/80 backdrop-blur-lg p-0 overflow-hidden animate-cardpop">
                    {/* Accent bar and logo */}
                    <div className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-700 via-blue-500 to-indigo-500">
                        <div className="flex items-center gap-2">
                            <ApplicationLogo className="h-8 w-8" />
                            <span className="text-white font-bold text-md tracking-wide">UPT KARAWANG</span>
                        </div>
                    </div>
                    <div className="px-0 py-0 md:px-8 md:py-8">
                        {/* Section 1: Data Anomali */}
                        <div className="bg-white/90 rounded-2xl shadow-md border border-blue-100 mb-8 overflow-hidden">
                            <div className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-100 to-blue-50 border-b border-blue-100">
                                <FaFileAlt className="text-blue-600 h-5 w-5" />
                                <h2 className="text-md font-bold text-blue-800 tracking-tight">Data Anomali</h2>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <InputLabel htmlFor="judul" value="Judul" className="text-sm font-semibold mb-1" />
                                    <TextInput id="judul" value={data.judul} onChange={e => setData("judul", e.target.value)} className="mt-1 block w-full rounded-xl border-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-md px-4 py-2 shadow-sm transition-all" required />
                                    <InputError message={errors.judul} />
                                </div>
                                <div>
                                    <InputLabel value="ULTG" className="text-sm font-semibold mb-1" />
                                    <Listbox value={data.ultg} onChange={val => setData("ultg", val)}>
                                        <div className="relative mt-1">
                                            <Listbox.Button className="relative w-full cursor-pointer rounded-xl border border-blue-200 bg-white py-2 pl-4 pr-10 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-md">
                                                {ultgOptions.find(opt => opt.id === data.ultg)?.name || "Pilih ULTG"}
                                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                    <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                                </span>
                                            </Listbox.Button>
                                            <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                    {ultgOptions.map(opt => (
                                                        <Listbox.Option key={opt.id} value={opt.id} className={({ active }) => `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'}` }>
                                                            {({ selected }) => (
                                                                <>
                                                                    <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>{opt.name}</span>
                                                                    {selected ? (
                                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                                                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                                        </span>
                                                                    ) : null}
                                                                </>
                                                            )}
                                                        </Listbox.Option>
                                                    ))}
                                                </Listbox.Options>
                                            </Transition>
                                        </div>
                                    </Listbox>
                                    <InputError message={errors.ultg} />
                                </div>
                                <div>
                                    <InputLabel value="Gardu Induk" className="text-sm font-semibold mb-1" />
                                    <Listbox value={data.gardu_id} onChange={val => setData("gardu_id", val)}>
                                        <div className="relative mt-1">
                                            <Listbox.Button className="relative w-full cursor-pointer rounded-xl border border-blue-200 bg-white py-2 pl-4 pr-10 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-md">
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
                                                                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                                        </span>
                                                                    ) : null}
                                                                </>
                                                            )}
                                                        </Listbox.Option>
                                                    ))}
                                                </Listbox.Options>
                                            </Transition>
                                        </div>
                                    </Listbox>
                                    <InputError message={errors.gardu_id} />
                                </div>
                                <div>
                                    <InputLabel value="Bagian" className="text-sm font-semibold mb-1" />
                                    <Listbox value={data.bagian} onChange={val => setData("bagian", val)}>
                                        <div className="relative mt-1">
                                            <Listbox.Button className="relative w-full cursor-pointer rounded-xl border border-blue-200 bg-white py-2 pl-4 pr-10 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-md">
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
                                                                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                                        </span>
                                                                    ) : null}
                                                                </>
                                                            )}
                                                        </Listbox.Option>
                                                    ))}
                                                </Listbox.Options>
                                            </Transition>
                                        </div>
                                    </Listbox>
                                    <InputError message={errors.bagian} />
                                </div>
                                <div>
                                    <InputLabel value="Tipe" className="text-sm font-semibold mb-1" />
                                    <Listbox value={data.tipe} onChange={val => setData("tipe", val)}>
                                        <div className="relative mt-1">
                                            <Listbox.Button className="relative w-full cursor-pointer rounded-xl border border-blue-200 bg-white py-2 pl-4 pr-10 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-md">
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
                                                                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                                        </span>
                                                                    ) : null}
                                                                </>
                                                            )}
                                                        </Listbox.Option>
                                                    ))}
                                                </Listbox.Options>
                                            </Transition>
                                        </div>
                                    </Listbox>
                                    <InputError message={errors.tipe} />
                                </div>
                                <div>
                                    <InputLabel value="Kategori" className="text-sm font-semibold mb-1" />
                                    <Listbox value={data.kategori_id} onChange={val => setData("kategori_id", val)}>
                                        <div className="relative mt-1">
                                            <Listbox.Button className="relative w-full cursor-pointer rounded-xl border border-blue-200 bg-white py-2 pl-4 pr-10 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-md">
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
                                                                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                                        </span>
                                                                    ) : null}
                                                                </>
                                                            )}
                                                        </Listbox.Option>
                                                    ))}
                                                </Listbox.Options>
                                            </Transition>
                                        </div>
                                    </Listbox>
                                    <InputError message={errors.kategori_id} />
                                </div>
                                <div>
                                    <InputLabel value="Bay" className="text-sm font-semibold mb-1" />
                                    <Listbox value={data.bay_id} onChange={val => setData("bay_id", val)}>
                                        <div className="relative mt-1">
                                            <Listbox.Button className="relative w-full cursor-pointer rounded-xl border border-blue-200 bg-white py-2 pl-4 pr-10 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-md">
                                                {findById(bays, data.bay_id)?.nama || "Pilih Bay"}
                                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                    <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                                </span>
                                            </Listbox.Button>
                                            <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                    {bays.map(opt => (
                                                        <Listbox.Option key={opt.id} value={opt.id} className={({ active }) => `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'}` }>
                                                            {({ selected }) => (
                                                                <>
                                                                    <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>{opt.nama}</span>
                                                                    {selected ? (
                                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                                                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                                        </span>
                                                                    ) : null}
                                                                </>
                                                            )}
                                                        </Listbox.Option>
                                                    ))}
                                                </Listbox.Options>
                                            </Transition>
                                        </div>
                                    </Listbox>
                                    <InputError message={errors.bay_id} />
                                </div>
                                <div>
                                    <InputLabel value="Pelapor" className="text-sm font-semibold mb-1" />
                                    <Listbox value={data.user_id} onChange={val => setData("user_id", val)}>
                                        <div className="relative mt-1">
                                            <Listbox.Button className="relative w-full cursor-pointer rounded-xl border border-blue-200 bg-white py-2 pl-4 pr-10 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-md">
                                                {findById(users, data.user_id)?.name || "Pilih User"}
                                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                    <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                                </span>
                                            </Listbox.Button>
                                            <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                    {users.map(opt => (
                                                        <Listbox.Option key={opt.id} value={opt.id} className={({ active }) => `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'}` }>
                                                            {({ selected }) => (
                                                                <>
                                                                    <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>{opt.name}</span>
                                                                    {selected ? (
                                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                                                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                                        </span>
                                                                    ) : null}
                                                                </>
                                                            )}
                                                        </Listbox.Option>
                                                    ))}
                                                </Listbox.Options>
                                            </Transition>
                                        </div>
                                    </Listbox>
                                    <InputError message={errors.user_id} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="tanggal_temuan" value="Tanggal Temuan" className="text-sm font-semibold mb-1" />
                                    <TextInput id="tanggal_temuan" type="date" value={data.tanggal_temuan} onChange={e => setData("tanggal_temuan", e.target.value)} className="mt-1 block w-full rounded-xl border-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-md px-4 py-2 shadow-sm transition-all" required />
                                    <InputError message={errors.tanggal_temuan} />
                                </div>
                            </div>
                        </div>
                        {/* Section 2: Detail & Lampiran */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div className="bg-white/90 rounded-2xl shadow-md border border-blue-100 overflow-hidden flex flex-col">
                                <div className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-100 to-blue-50 border-b border-blue-100">
                                    <span className="text-blue-600 font-bold">📝</span>
                                    <h2 className="text-md font-bold text-blue-800 tracking-tight">Detail Anomali</h2>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <InputLabel htmlFor="deskripsi" value="Deskripsi" className="text-sm font-semibold mb-1" />
                                    <textarea id="deskripsi" value={data.deskripsi} onChange={e => setData("deskripsi", e.target.value)} className="mt-1 block w-full rounded-xl border-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-md px-4 py-2 shadow-sm transition-all min-h-[80px]" required />
                                    <InputError message={errors.deskripsi} />
                                </div>
                            </div>
                            <div className="bg-white/90 rounded-2xl shadow-md border border-blue-100 overflow-hidden flex flex-col">
                                <div className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-100 to-blue-50 border-b border-blue-100">
                                    <span className="text-blue-600 font-bold">📎</span>
                                    <h2 className="text-md font-bold text-blue-800 tracking-tight">Lampiran Foto</h2>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <InputLabel htmlFor="lampiran_foto" value="Lampiran Foto (bisa lebih dari satu)" className="text-sm font-semibold mb-1" />
                                    <input id="lampiran_foto" type="file" accept="image/*" multiple onChange={handleFileChange} className="mt-1 block w-full rounded-xl border-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-md px-4 py-2 shadow-sm transition-all bg-white/70" />
                                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mt-3">
                                        {preview.map((src, i) => (
                                            <button type="button" key={i} className="relative group" onClick={() => { setPreviewIndex(i); setPreviewModal(true); }}>
                                                <img src={src} alt="preview" className="w-full h-24 object-cover rounded-xl shadow border-2 border-blue-100 group-hover:scale-105 group-hover:shadow-lg transition-all duration-200" />
                                                <div className="absolute inset-0 bg-blue-900/10 opacity-0 group-hover:opacity-100 rounded-xl transition-all duration-200 flex items-center justify-center text-xs text-white font-semibold">Preview</div>
                                            </button>
                                        ))}
                                    </div>
                                    <InputError message={errors.lampiran_foto} />
                                </div>
                            </div>
                        </div>
                        {/* Section 3: Usul/Saran & Penugasan */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div className="bg-white/90 rounded-2xl shadow-md border border-blue-100 overflow-hidden flex flex-col">
                                <div className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-100 to-blue-50 border-b border-blue-100">
                                    <span className="text-blue-600 font-bold">💡</span>
                                    <h2 className="text-md font-bold text-blue-800 tracking-tight">Usul / Saran</h2>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <InputLabel htmlFor="usul_saran" value="Usul/Saran" className="text-sm font-semibold mb-1" />
                                    <textarea id="usul_saran" value={data.usul_saran} onChange={e => setData("usul_saran", e.target.value)} className="mt-1 block w-full rounded-xl border-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-md px-4 py-2 shadow-sm transition-all min-h-[60px]" />
                                    <InputError message={errors.usul_saran} />
                                </div>
                            </div>
                            <div className="bg-white/90 rounded-2xl shadow-md border border-blue-100 overflow-hidden flex flex-col">
                                <div className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-100 to-blue-50 border-b border-blue-100">
                                    <span className="text-blue-600 font-bold">👤</span>
                                    <h2 className="text-md font-bold text-blue-800 tracking-tight">Penugasan</h2>
                                </div>
                                <div className="p-6 flex-1 flex flex-col gap-4">
                                    <div>
                                        <InputLabel value="Assign To (optional)" className="text-sm font-semibold mb-1" />
                                        <Listbox value={data.assign_to} onChange={val => setData("assign_to", val)}>
                                            <div className="relative mt-1">
                                                <Listbox.Button className="relative w-full cursor-pointer rounded-xl border border-blue-200 bg-white py-2 pl-4 pr-10 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-md">
                                                    {findById(users, data.assign_to)?.name || "Pilih User"}
                                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                        <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                                    </span>
                                                </Listbox.Button>
                                                <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                                    <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                        {users.map(opt => (
                                                            <Listbox.Option key={opt.id} value={opt.id} className={({ active }) => `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'}` }>
                                                                {({ selected }) => (
                                                                    <>
                                                                        <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>{opt.name}</span>
                                                                        {selected ? (
                                                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                                                                <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                                            </span>
                                                                        ) : null}
                                                                    </>
                                                                )}
                                                            </Listbox.Option>
                                                        ))}
                                                    </Listbox.Options>
                                                </Transition>
                                            </div>
                                        </Listbox>
                                        <InputError message={errors.assign_to} />
                                    </div>
                                    <div className="flex items-center gap-4 mt-2">
                                        <Switch
                                            checked={data.prioritas}
                                            onChange={val => setData("prioritas", val)}
                                            className={`${data.prioritas ? 'bg-red-600' : 'bg-gray-200'} relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2`}
                                        >
                                            <span className={`${data.prioritas ? 'translate-x-7' : 'translate-x-1'} inline-block h-5 w-5 transform rounded-full bg-white transition-transform`} />
                                        </Switch>
                                        <span className={`font-semibold text-sm ${data.prioritas ? 'text-red-700' : 'text-gray-700'}`}>Prioritas Anomali</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row justify-end mt-10 gap-4 px-2 md:px-0">
                            <PrimaryButton type="submit" disabled={processing} className="text-md px-10 py-3 rounded-2xl shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-300 font-bold tracking-wide uppercase transition-all duration-200 w-full md:w-auto">
                                {processing ? "Menyimpan..." : "Simpan"}
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