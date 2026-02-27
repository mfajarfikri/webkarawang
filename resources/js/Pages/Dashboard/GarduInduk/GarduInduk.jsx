import DashboardLayout from "@/Layouts/DashboardLayout";
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
            <div className="min-h-screen bg-white rounded-2xl py-10">
                <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-400 to-indigo-400 flex items-center justify-center text-white shadow-md">
                                <GiElectric className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                    Manajemen Gardu Induk
                                </h1>
                                <p className="text-sm md:text-base text-gray-600 mt-1">
                                    Kelola data gardu induk dan lokasi
                                    operasional kelistrikan.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowTambahGardu(true)}
                                className="bg-blue-600 text-white px-5 py-2.5 rounded-xl shadow-sm hover:bg-blue-700 font-medium transition-all duration-200 flex items-center gap-2"
                            >
                                <FaPlus className="w-4 h-4" />
                                <span>Tambah Gardu</span>
                            </button>
                        </div>
                    </div>

                    {/* Table Card */}
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50/80 via-white to-gray-50/80">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h2 className="text-base md:text-lg font-semibold text-gray-900">
                                        Daftar Gardu Induk
                                    </h2>
                                    <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                                        Total {totalRows} gardu induk terdaftar.
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                    {/* Filter Button */}
                                    <button
                                        className={`px-4 py-2 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                                            filterOpen
                                                ? "bg-blue-50 border-blue-200 text-blue-700"
                                                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                                        }`}
                                        onClick={() =>
                                            setFilterOpen(!filterOpen)
                                        }
                                    >
                                        <FaFilter
                                            className={
                                                filterOpen
                                                    ? "text-blue-600"
                                                    : "text-gray-400"
                                            }
                                        />
                                        Filter
                                    </button>

                                    {/* Rows Per Page */}
                                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
                                        <span className="text-gray-500 text-xs font-medium">
                                            Show
                                        </span>
                                        <Listbox
                                            value={rowsPerPage}
                                            onChange={setRowsPerPage}
                                        >
                                            <div className="relative">
                                                <Listbox.Button className="text-sm font-semibold text-gray-800 focus:outline-none cursor-pointer flex items-center gap-1">
                                                    {rowsPerPage}
                                                    <span className="text-gray-400 text-xs">
                                                        ▼
                                                    </span>
                                                </Listbox.Button>
                                                <Listbox.Options className="absolute right-0 z-10 mt-2 w-20 bg-white border border-gray-100 rounded-lg shadow-lg text-sm overflow-hidden py-1">
                                                    {[8, 10, 16, 32].map(
                                                        (option) => (
                                                            <Listbox.Option
                                                                key={option}
                                                                value={option}
                                                                className={({
                                                                    active,
                                                                    selected,
                                                                }) =>
                                                                    `cursor-pointer select-none px-3 py-2 ${
                                                                        active
                                                                            ? "bg-blue-50 text-blue-900"
                                                                            : "text-gray-700"
                                                                    } ${
                                                                        selected
                                                                            ? "font-semibold bg-blue-50"
                                                                            : ""
                                                                    }`
                                                                }
                                                            >
                                                                {option}
                                                            </Listbox.Option>
                                                        )
                                                    )}
                                                </Listbox.Options>
                                            </div>
                                        </Listbox>
                                    </div>
                                </div>
                            </div>

                            {/* Filter Section */}
                            {filterOpen && (
                                <div className="mt-4 pt-4 border-t border-gray-100 animate-fadeIn">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaSearch className="text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow"
                                            placeholder="Cari nama gardu induk..."
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="overflow-x-auto">
                            <ErrorBoundary>
                                <table className="min-w-full divide-y divide-gray-100">
                                    <thead className="bg-gray-50/80">
                                        <tr>
                                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide w-16">
                                                No
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                                Wilayah (ULTG)
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                                Nama Gardu
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                                Koordinat
                                            </th>
                                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {paginatedRows.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="px-6 py-12 text-center"
                                                >
                                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-3">
                                                        <GiElectric className="w-6 h-6" />
                                                    </div>
                                                    <p className="text-gray-500 font-medium">
                                                        Tidak ada data gardu
                                                        induk ditemukan.
                                                    </p>
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedRows.map((gardu, idx) => (
                                                <tr
                                                    key={gardu.id}
                                                    className="hover:bg-blue-50/50 transition-colors duration-150"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                                                        {(page - 1) *
                                                            rowsPerPage +
                                                            idx +
                                                            1}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {gardu.ultg}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                        {gardu.name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="inline-flex items-center gap-1 text-gray-600 text-xs bg-gray-100 px-2 py-1 rounded border border-gray-200 w-fit">
                                                                <span className="font-semibold text-blue-700">
                                                                    Lat:
                                                                </span>
                                                                {parseFloat(
                                                                    gardu.latitude
                                                                ).toFixed(6)}
                                                            </span>
                                                            <span className="inline-flex items-center gap-1 text-gray-600 text-xs bg-gray-100 px-2 py-1 rounded border border-gray-200 w-fit">
                                                                <span className="font-semibold text-green-700">
                                                                    Long:
                                                                </span>
                                                                {parseFloat(
                                                                    gardu.longitude
                                                                ).toFixed(6)}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <a
                                                            href={`https://www.google.com/maps/search/?api=1&query=${gardu.latitude},${gardu.longitude}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center px-3 py-1.5 border border-blue-200 rounded-lg text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 transition-all shadow-sm"
                                                            title="Lihat lokasi di Google Maps"
                                                        >
                                                            <FaMapMarkerAlt className="mr-1.5" />
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
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-sm text-gray-500">
                                Menampilkan{" "}
                                <span className="font-medium text-gray-900">
                                    {(page - 1) * rowsPerPage + 1}
                                </span>{" "}
                                sampai{" "}
                                <span className="font-medium text-gray-900">
                                    {Math.min(page * rowsPerPage, totalRows)}
                                </span>{" "}
                                dari{" "}
                                <span className="font-medium text-gray-900">
                                    {totalRows}
                                </span>{" "}
                                data
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handlePrev}
                                    disabled={page === 1}
                                    className={`p-2 rounded-lg border transition-colors ${
                                        page === 1
                                            ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                                            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                                    }`}
                                >
                                    <FaChevronLeft className="w-4 h-4" />
                                </button>
                                <div className="flex items-center gap-1">
                                    <span className="px-3 py-1 rounded-md bg-blue-50 text-blue-700 text-sm font-semibold border border-blue-100">
                                        {page}
                                    </span>
                                    <span className="text-gray-400 text-sm">
                                        /
                                    </span>
                                    <span className="px-2 text-gray-600 text-sm">
                                        {totalPages}
                                    </span>
                                </div>
                                <button
                                    onClick={handleNext}
                                    disabled={page === totalPages}
                                    className={`p-2 rounded-lg border transition-colors ${
                                        page === totalPages
                                            ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                                            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                                    }`}
                                >
                                    <FaChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

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
                            <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
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
                                    <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all border border-gray-100">
                                        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4 flex justify-between items-center">
                                            <Dialog.Title
                                                as="h3"
                                                className="text-lg font-semibold leading-6 text-white flex items-center gap-2"
                                            >
                                                <FaPlus className="w-4 h-4" />
                                                Tambah Gardu Induk Baru
                                            </Dialog.Title>
                                            <button
                                                onClick={() =>
                                                    setShowTambahGardu(false)
                                                }
                                                className="text-white/80 hover:text-white transition-colors"
                                            >
                                                <FaTimes className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="p-6">
                                            <form
                                                onSubmit={handleSubmit}
                                                className="space-y-4"
                                            >
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Nama Gardu Induk
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                                            placeholder="Contoh: GI 150KV DELTAMAS"
                                                            value={data.name}
                                                            onChange={(e) =>
                                                                setData(
                                                                    "name",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                        {errors.name && (
                                                            <div className="text-red-500 text-xs mt-1">
                                                                {errors.name}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Latitude
                                                        </label>
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                                            placeholder="-6.405..."
                                                            value={
                                                                data.latitude
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    "latitude",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                        {errors.latitude && (
                                                            <div className="text-red-500 text-xs mt-1">
                                                                {
                                                                    errors.latitude
                                                                }
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Longitude
                                                        </label>
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                                            placeholder="107.175..."
                                                            value={
                                                                data.longitude
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    "longitude",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                        {errors.longitude && (
                                                            <div className="text-red-500 text-xs mt-1">
                                                                {
                                                                    errors.longitude
                                                                }
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            ULTG
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                                            placeholder="Contoh: ULTG Karawang"
                                                            value={data.ultg}
                                                            onChange={(e) =>
                                                                setData(
                                                                    "ultg",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                        {errors.ultg && (
                                                            <div className="text-red-500 text-xs mt-1">
                                                                {errors.ultg}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Kondisi
                                                        </label>
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
                                                                <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm">
                                                                    <span
                                                                        className={`block truncate ${
                                                                            data.kondisi ===
                                                                            "Operasi"
                                                                                ? "text-green-600 font-medium"
                                                                                : "text-red-600 font-medium"
                                                                        }`}
                                                                    >
                                                                        {
                                                                            data.kondisi
                                                                        }
                                                                    </span>
                                                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                                        <FaChevronLeft
                                                                            className="h-4 w-4 text-gray-400 rotate-270 -rotate-90"
                                                                            aria-hidden="true"
                                                                        />
                                                                    </span>
                                                                </Listbox.Button>
                                                                <Transition
                                                                    as={
                                                                        Fragment
                                                                    }
                                                                    leave="transition ease-in duration-100"
                                                                    leaveFrom="opacity-100"
                                                                    leaveTo="opacity-0"
                                                                >
                                                                    <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-10">
                                                                        <Listbox.Option
                                                                            value="Operasi"
                                                                            className={({
                                                                                active,
                                                                            }) =>
                                                                                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                                                                    active
                                                                                        ? "bg-blue-100 text-blue-900"
                                                                                        : "text-gray-900"
                                                                                }`
                                                                            }
                                                                        >
                                                                            <span className="block truncate font-medium text-green-600">
                                                                                Operasi
                                                                            </span>
                                                                        </Listbox.Option>
                                                                        <Listbox.Option
                                                                            value="Tidak Operasi"
                                                                            className={({
                                                                                active,
                                                                            }) =>
                                                                                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                                                                    active
                                                                                        ? "bg-blue-100 text-blue-900"
                                                                                        : "text-gray-900"
                                                                                }`
                                                                            }
                                                                        >
                                                                            <span className="block truncate font-medium text-red-600">
                                                                                Tidak
                                                                                Operasi
                                                                            </span>
                                                                        </Listbox.Option>
                                                                    </Listbox.Options>
                                                                </Transition>
                                                            </div>
                                                        </Listbox>
                                                        {errors.kondisi && (
                                                            <div className="text-red-500 text-xs mt-1">
                                                                {errors.kondisi}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mt-6 flex justify-end gap-3">
                                                    <button
                                                        type="button"
                                                        className="inline-flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
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
                                                        className="inline-flex justify-center rounded-lg border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50"
                                                        disabled={processing}
                                                    >
                                                        {processing
                                                            ? "Menyimpan..."
                                                            : "Simpan"}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
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
