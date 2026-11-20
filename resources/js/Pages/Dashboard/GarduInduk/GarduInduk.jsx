import DashboardLayout from "@/Layouts/DashboardLayout";
import PageHeader, { HeaderStat } from "@/Components/Dashboard/PageHeader";
import { Head, useForm } from "@inertiajs/react";
import { GiElectric } from "react-icons/gi";
import {
    FaPlus,
    FaFilter,
    FaChevronLeft,
    FaChevronRight,
    FaSearch,
    FaMapMarkerAlt,
    FaBolt,
    FaTimes,
} from "react-icons/fa";
import ErrorBoundary from "@/Components/ErrorBoundary";
import { Badge, Card, EmptyState } from "@/Components/Dashboard/ui";
import { useState, useEffect, Fragment } from "react";
import { Listbox, Transition, Dialog } from "@headlessui/react";
import React from "react";

export default function GarduInduk({ garduInduks = [] }) {
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(1);
    const [showTambahGardu, setShowTambahGardu] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterOpen, setFilterOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        latitude: "",
        longitude: "",
        ultg: "",
        kondisi: "Operasi",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post("/dashboard/garduinduk", {
            onSuccess: () => {
                setShowTambahGardu(false);
                reset();
            },
        });
    };

    // Filter rows based on search term (case-insensitive, by name)
    const filteredRows = garduInduks.filter((gardu) =>
        gardu.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const totalRows = filteredRows.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);
    const paginatedRows = filteredRows.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    const handlePrev = () => setPage((p) => Math.max(1, p - 1));
    const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

    useEffect(() => {
        setPage(1);
    }, [rowsPerPage, searchTerm]);

    return (
        <DashboardLayout title="Manajemen Gardu Induk">
            <Head title="Gardu Induk" />
            <div className="space-y-6">
                <PageHeader
                    icon={GiElectric}
                    title="Manajemen Gardu Induk"
                    description="Kelola data gardu induk dan lokasi operasional kelistrikan."
                >
                    <button
                        onClick={() => setShowTambahGardu(true)}
                        className="btn-brand"
                    >
                        <FaPlus className="h-3.5 w-3.5" />
                        <span>Tambah Gardu</span>
                    </button>
                </PageHeader>

                {/* Table Card */}
                <Card
                    padded={false}
                    icon={FaBolt}
                    title="Daftar Gardu Induk"
                    description={`Total ${totalRows} gardu induk terdaftar.`}
                    actions={
                        <>
                            {/* Filter Button */}
                            <button
                                type="button"
                                className={`btn-ghost btn-sm ${
                                    filterOpen
                                        ? "!border-brand-200 !bg-brand-50 !text-brand-800"
                                        : ""
                                }`}
                                onClick={() => setFilterOpen(!filterOpen)}
                                aria-expanded={filterOpen}
                            >
                                <FaFilter
                                    className={`h-3 w-3 ${
                                        filterOpen
                                            ? "text-brand-600"
                                            : "text-slate-400"
                                    }`}
                                />
                                Filter
                            </button>

                            {/* Rows Per Page */}
                            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1.5 pl-3.5 pr-3 text-xs">
                                <span className="font-medium text-slate-500">
                                    Tampilkan
                                </span>
                                <Listbox
                                    value={rowsPerPage}
                                    onChange={setRowsPerPage}
                                >
                                    <div className="relative">
                                        <Listbox.Button className="flex cursor-pointer items-center gap-1 rounded text-sm font-semibold tabular-nums text-ink-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40">
                                            {rowsPerPage}
                                            <span className="text-[10px] text-slate-400">
                                                ▼
                                            </span>
                                        </Listbox.Button>
                                        <Listbox.Options className="absolute right-0 z-10 mt-2 w-20 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-sm shadow-lift focus:outline-none">
                                            {[8, 10, 16, 32].map((option) => (
                                                <Listbox.Option
                                                    key={option}
                                                    value={option}
                                                    className={({
                                                        active,
                                                        selected,
                                                    }) =>
                                                        `cursor-pointer select-none px-3 py-2 tabular-nums ${
                                                            active
                                                                ? "bg-slate-50 text-ink-900"
                                                                : "text-slate-700"
                                                        } ${
                                                            selected
                                                                ? "font-semibold text-brand-700"
                                                                : ""
                                                        }`
                                                    }
                                                >
                                                    {option}
                                                </Listbox.Option>
                                            ))}
                                        </Listbox.Options>
                                    </div>
                                </Listbox>
                            </div>
                        </>
                    }
                >
                    {/* Filter Section */}
                    {filterOpen && (
                        <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-6">
                            <div className="relative max-w-md">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                                    <FaSearch className="h-3.5 w-3.5 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    className="field-input pl-10"
                                    placeholder="Cari nama gardu induk..."
                                    aria-label="Cari nama gardu induk"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                />
                            </div>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <ErrorBoundary>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th className="w-16 text-center">No</th>
                                        <th>Wilayah (ULTG)</th>
                                        <th>Nama Gardu</th>
                                        <th>Koordinat</th>
                                        <th className="text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedRows.length === 0 ? (
                                        <tr>
                                            <td colSpan={5}>
                                                <EmptyState
                                                    icon={GiElectric}
                                                    title="Tidak ada data gardu induk ditemukan."
                                                    description="Ubah kata kunci pencarian atau tambahkan gardu induk baru."
                                                />
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedRows.map((gardu, idx) => (
                                            <tr key={gardu.id}>
                                                <td className="whitespace-nowrap text-center tabular-nums text-slate-500">
                                                    {(page - 1) * rowsPerPage +
                                                        idx +
                                                        1}
                                                </td>
                                                <td className="whitespace-nowrap">
                                                    <Badge tone="slate">
                                                        {gardu.ultg}
                                                    </Badge>
                                                </td>
                                                <td className="whitespace-nowrap font-semibold text-ink-900">
                                                    {gardu.name}
                                                </td>
                                                <td className="whitespace-nowrap">
                                                    <div className="flex flex-col gap-0.5 font-mono text-xs tabular-nums text-slate-600">
                                                        <span>
                                                            <span className="mr-1.5 font-sans font-semibold text-slate-400">
                                                                Lat:
                                                            </span>
                                                            {parseFloat(
                                                                gardu.latitude
                                                            ).toFixed(6)}
                                                        </span>
                                                        <span>
                                                            <span className="mr-1.5 font-sans font-semibold text-slate-400">
                                                                Long:
                                                            </span>
                                                            {parseFloat(
                                                                gardu.longitude
                                                            ).toFixed(6)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap text-right">
                                                    <a
                                                        href={`https://www.google.com/maps/search/?api=1&query=${gardu.latitude},${gardu.longitude}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn-ghost btn-sm"
                                                        title="Lihat lokasi di Google Maps"
                                                    >
                                                        <FaMapMarkerAlt className="h-3 w-3 text-brand-600" />
                                                        Maps
                                                    </a>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </ErrorBoundary>
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-500 sm:flex-row sm:px-6">
                        <div>
                            Menampilkan{" "}
                            <span className="font-semibold tabular-nums text-ink-900">
                                {(page - 1) * rowsPerPage + 1}–
                                {Math.min(page * rowsPerPage, totalRows)}
                            </span>{" "}
                            dari{" "}
                            <span className="font-semibold tabular-nums text-ink-900">
                                {totalRows}
                            </span>{" "}
                            data
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={handlePrev}
                                disabled={page === 1}
                                aria-label="Halaman sebelumnya"
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <FaChevronLeft className="h-3 w-3" />
                            </button>
                            <span className="px-2 tabular-nums">
                                <span className="font-semibold text-ink-900">
                                    {page}
                                </span>{" "}
                                / {totalPages}
                            </span>
                            <button
                                type="button"
                                onClick={handleNext}
                                disabled={page === totalPages}
                                aria-label="Halaman berikutnya"
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <FaChevronRight className="h-3 w-3" />
                            </button>
                        </div>
                    </div>
                </Card>

                {/* Tambah Gardu Modal */}
                <Transition appear show={showTambahGardu} as={Fragment}>
                    <Dialog
                        as="div"
                        className="relative z-50"
                        onClose={() => setShowTambahGardu(false)}
                    >
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-ink-950/50 backdrop-blur-sm" />
                        </Transition.Child>

                        <div className="fixed inset-0 overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center p-4 text-center">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 scale-95"
                                    enterTo="opacity-100 scale-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100 scale-100"
                                    leaveTo="opacity-0 scale-95"
                                >
                                    <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl border border-slate-200/80 bg-white text-left align-middle shadow-lift transition-all">
                                        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                                                    <FaPlus className="h-3.5 w-3.5" />
                                                </span>
                                                <Dialog.Title
                                                    as="h3"
                                                    className="text-base font-bold text-ink-900"
                                                >
                                                    Tambah Gardu Induk Baru
                                                </Dialog.Title>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowTambahGardu(false)
                                                }
                                                className="btn-icon"
                                                aria-label="Tutup"
                                            >
                                                <FaTimes className="h-4 w-4" />
                                            </button>
                                        </div>

                                        <form onSubmit={handleSubmit}>
                                            <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
                                                <div className="md:col-span-2">
                                                    <label
                                                        htmlFor="gi-name"
                                                        className="field-label"
                                                    >
                                                        Nama Gardu Induk
                                                    </label>
                                                    <input
                                                        id="gi-name"
                                                        type="text"
                                                        className="field-input"
                                                        placeholder="Contoh: GI 150KV DELTAMAS"
                                                        value={data.name}
                                                        onChange={(e) =>
                                                            setData(
                                                                "name",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                    {errors.name && (
                                                        <p className="field-error">
                                                            {errors.name}
                                                        </p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label
                                                        htmlFor="gi-latitude"
                                                        className="field-label"
                                                    >
                                                        Latitude
                                                    </label>
                                                    <input
                                                        id="gi-latitude"
                                                        type="number"
                                                        step="any"
                                                        className="field-input tabular-nums"
                                                        placeholder="-6.405..."
                                                        value={data.latitude}
                                                        onChange={(e) =>
                                                            setData(
                                                                "latitude",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                    {errors.latitude && (
                                                        <p className="field-error">
                                                            {errors.latitude}
                                                        </p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label
                                                        htmlFor="gi-longitude"
                                                        className="field-label"
                                                    >
                                                        Longitude
                                                    </label>
                                                    <input
                                                        id="gi-longitude"
                                                        type="number"
                                                        step="any"
                                                        className="field-input tabular-nums"
                                                        placeholder="107.175..."
                                                        value={data.longitude}
                                                        onChange={(e) =>
                                                            setData(
                                                                "longitude",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                    {errors.longitude && (
                                                        <p className="field-error">
                                                            {errors.longitude}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label
                                                        htmlFor="gi-ultg"
                                                        className="field-label"
                                                    >
                                                        ULTG
                                                    </label>
                                                    <input
                                                        id="gi-ultg"
                                                        type="text"
                                                        className="field-input"
                                                        placeholder="Contoh: ULTG Karawang"
                                                        value={data.ultg}
                                                        onChange={(e) =>
                                                            setData(
                                                                "ultg",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                    {errors.ultg && (
                                                        <p className="field-error">
                                                            {errors.ultg}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="md:col-span-2">
                                                    <span className="field-label">
                                                        Kondisi
                                                    </span>
                                                    <Listbox
                                                        value={data.kondisi}
                                                        onChange={(val) =>
                                                            setData(
                                                                "kondisi",
                                                                val
                                                            )
                                                        }
                                                    >
                                                        <div className="relative">
                                                            <Listbox.Button className="field-input relative cursor-pointer pr-10 text-left">
                                                                <span className="flex items-center gap-2 truncate font-semibold">
                                                                    <span
                                                                        className={`h-2 w-2 shrink-0 rounded-full ${
                                                                            data.kondisi ===
                                                                            "Operasi"
                                                                                ? "bg-emerald-500"
                                                                                : "bg-rose-500"
                                                                        }`}
                                                                    />
                                                                    <span
                                                                        className={
                                                                            data.kondisi ===
                                                                            "Operasi"
                                                                                ? "text-emerald-700"
                                                                                : "text-rose-700"
                                                                        }
                                                                    >
                                                                        {
                                                                            data.kondisi
                                                                        }
                                                                    </span>
                                                                </span>
                                                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                                    <FaChevronLeft
                                                                        className="h-3 w-3 -rotate-90 text-slate-400"
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
                                                                <Listbox.Options className="absolute z-10 mt-1.5 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 text-sm shadow-lift focus:outline-none">
                                                                    <Listbox.Option
                                                                        value="Operasi"
                                                                        className={({
                                                                            active,
                                                                        }) =>
                                                                            `relative flex cursor-pointer select-none items-center gap-2 px-3.5 py-2 ${
                                                                                active
                                                                                    ? "bg-slate-50"
                                                                                    : ""
                                                                            }`
                                                                        }
                                                                    >
                                                                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                                                        <span className="block truncate font-semibold text-emerald-700">
                                                                            Operasi
                                                                        </span>
                                                                    </Listbox.Option>
                                                                    <Listbox.Option
                                                                        value="Tidak Operasi"
                                                                        className={({
                                                                            active,
                                                                        }) =>
                                                                            `relative flex cursor-pointer select-none items-center gap-2 px-3.5 py-2 ${
                                                                                active
                                                                                    ? "bg-slate-50"
                                                                                    : ""
                                                                            }`
                                                                        }
                                                                    >
                                                                        <span className="h-2 w-2 rounded-full bg-rose-500" />
                                                                        <span className="block truncate font-semibold text-rose-700">
                                                                            Tidak
                                                                            Operasi
                                                                        </span>
                                                                    </Listbox.Option>
                                                                </Listbox.Options>
                                                            </Transition>
                                                        </div>
                                                    </Listbox>
                                                    {errors.kondisi && (
                                                        <p className="field-error">
                                                            {errors.kondisi}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-3">
                                                <button
                                                    type="button"
                                                    className="btn-ghost"
                                                    onClick={() =>
                                                        setShowTambahGardu(
                                                            false
                                                        )
                                                    }
                                                    disabled={processing}
                                                >
                                                    Batal
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="btn-brand"
                                                    disabled={processing}
                                                >
                                                    {processing
                                                        ? "Menyimpan..."
                                                        : "Simpan"}
                                                </button>
                                            </div>
                                        </form>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition>
            </div>
        </DashboardLayout>
    );
}
