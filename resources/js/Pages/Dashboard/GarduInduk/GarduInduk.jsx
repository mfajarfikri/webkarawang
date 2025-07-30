import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head } from "@inertiajs/react";
import { GiElectric } from "react-icons/gi";
import {
    FaPlus,
    FaFilter,
    FaChevronLeft,
    FaChevronRight,
    FaSearch,
} from "react-icons/fa";
import ErrorBoundary from "@/Components/ErrorBoundary";
import { useState, useEffect } from "react";
import { Listbox } from "@headlessui/react";
import { Transition, Dialog } from "@headlessui/react";
import React from "react";

export default function GarduInduk({ garduInduks = [] }) {
    const [rowsPerPage, setRowsPerPage] = useState(8);
    const [page, setPage] = useState(1);
    const [showTambahGardu, setShowTambahGardu] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

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
        <>
            <Head title="Gardu Induk" />
            <DashboardLayout>
                <div className=" w-full mx-auto">
                    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-lg shadow-xl border border-blue-100 p-0 md:p-0 overflow-hidden">
                        <div className="px-4 sm:px-6 pt-6 pb-2 border-b border-blue-100 bg-white/80 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="w-full md:w-2/3">
                                <h2 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
                                    <GiElectric className="text-blue-400 text-2xl" />
                                    <span>Manajemen Gardu Induk</span>
                                </h2>
                                <p className="text-gray-600 text-sm mb-2">
                                    Sistem manajemen Gardu Induk memungkinkan
                                    Anda untuk mengelola data gardu induk secara
                                    efisien, mulai dari penambahan, pengeditan,
                                    hingga penghapusan data. Dengan tampilan
                                    yang modern dan fitur yang mudah digunakan,
                                    Anda dapat memantau dan memperbarui
                                    informasi gardu induk untuk mendukung
                                    operasional kelistrikan secara optimal.
                                </p>
                            </div>
                            <div className="w-full md:w-auto flex justify-start md:justify-end">
                                <button
                                    onClick={() => setShowTambahGardu(true)}
                                    className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-400 text-white px-4 sm:px-5 py-2 rounded-lg shadow hover:from-blue-700 hover:to-blue-500 font-semibold flex items-center justify-center gap-2 transition text-sm sm:text-base"
                                >
                                    <FaPlus className="text-base sm:text-lg" />
                                    <span>Tambah Gardu Induk</span>
                                </button>
                            </div>
                        </div>
                        <div className="px-2 md:px-6 pb-6 pt-4 bg-white/70">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="relative w-full">
                                        <input
                                            type="text"
                                            placeholder="Cari Nama Gardu Induk..."
                                            className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                        />
                                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                                    </div>
                                    <button
                                        className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md shadow-sm hover:bg-gray-50 font-semibold flex items-center gap-2 transition-colors"
                                        onClick={() => setFilterOpen(true)}
                                        type="button"
                                    >
                                        <FaFilter />
                                        Filter
                                    </button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <label className="text-gray-600 text-sm">
                                        Tampil
                                    </label>
                                    <Listbox
                                        value={rowsPerPage}
                                        onChange={setRowsPerPage}
                                    >
                                        <div className="relative">
                                            <Listbox.Button className="border rounded px-2 py-1 text-sm focus:outline-none w-20 text-left">
                                                {rowsPerPage}
                                            </Listbox.Button>
                                            <Listbox.Options className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg text-sm">
                                                {[8, 16, 32].map((option) => (
                                                    <Listbox.Option
                                                        key={option}
                                                        value={option}
                                                        className={({
                                                            active,
                                                        }) =>
                                                            `cursor-pointer select-none px-3 py-2 ${
                                                                active
                                                                    ? "bg-blue-50 text-blue-700"
                                                                    : "text-gray-900"
                                                            }`
                                                        }
                                                    >
                                                        {option}
                                                    </Listbox.Option>
                                                ))}
                                            </Listbox.Options>
                                        </div>
                                    </Listbox>
                                    <span className="text-gray-500 text-xs">
                                        / halaman
                                    </span>
                                </div>
                            </div>
                            <ErrorBoundary>
                                <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                                    <div className="max-h-[500px] min-h-[320px] overflow-y-auto custom-scrollbar">
                                        <table className="min-w-[900px] w-full">
                                            <thead className="bg-gray-100 text-gray-600 sticky top-0 z-10">
                                                <tr>
                                                    <th className="px-3 py-3 text-center text-xs sm:text-sm font-semibold whitespace-nowrap">
                                                        No
                                                    </th>
                                                    <th className="px-3 py-3 text-center text-xs sm:text-sm font-semibold">
                                                        Wilayah
                                                    </th>
                                                    <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold">
                                                        Nama
                                                    </th>
                                                    <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold">
                                                        Koordinat
                                                    </th>
                                                    <th className="px-3 py-3 text-center text-xs sm:text-sm font-semibold">
                                                        Aksi
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {paginatedRows.length === 0 ? (
                                                    <tr>
                                                        <td
                                                            colSpan={4}
                                                            className="text-center py-4 text-gray-400"
                                                        >
                                                            Tidak ada data
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    paginatedRows.map(
                                                        (gardu, idx) => (
                                                            <tr key={gardu.id}>
                                                                <td className="px-4 py-2 text-center">
                                                                    {(page -
                                                                        1) *
                                                                        rowsPerPage +
                                                                        idx +
                                                                        1}
                                                                </td>
                                                                <td className="px-4 py-2 text-center text-sm">
                                                                    {gardu.ultg}
                                                                </td>
                                                                <td className="px-4 py-2 text-sm">
                                                                    {gardu.name}
                                                                </td>
                                                                <td className="px-4 py-2 text-left text-xs">
                                                                    <span className="inline-flex items-center gap-1">
                                                                        <span className="font-semibold text-blue-700">
                                                                            {parseFloat(
                                                                                gardu.latitude
                                                                            ).toFixed(
                                                                                6
                                                                            )}
                                                                        </span>
                                                                        <span className="text-gray-400">
                                                                            ,
                                                                        </span>
                                                                        <span className="font-semibold text-green-700">
                                                                            {parseFloat(
                                                                                gardu.longitude
                                                                            ).toFixed(
                                                                                6
                                                                            )}
                                                                        </span>
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-2 text-center">
                                                                    <a
                                                                        href={`https://www.google.com/maps/search/?api=1&query=${gardu.latitude},${gardu.longitude}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="ml-3 inline-flex items-center px-2 py-1 border border-blue-600 rounded-md text-xs font-medium text-blue-700 bg-white hover:bg-blue-50 hover:text-blue-800 transition-colors shadow-sm"
                                                                        title="Lihat lokasi di Google Maps"
                                                                    >
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            className="h-4 w-4 mr-1 text-blue-600"
                                                                            fill="none"
                                                                            viewBox="0 0 24 24"
                                                                            stroke="currentColor"
                                                                        >
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                strokeWidth={
                                                                                    2
                                                                                }
                                                                                d="M12 11c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zm0 0c-3.866 0-7 3.134-7 7 0 1.657 1.343 3 3 3h8c1.657 0 3-1.343 3-3 0-3.866-3.134-7-7-7z"
                                                                            />
                                                                        </svg>
                                                                        <span>
                                                                            Lihat
                                                                            Maps
                                                                        </span>
                                                                    </a>
                                                                </td>
                                                            </tr>
                                                        )
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </ErrorBoundary>
                            {/* Pagination controls */}
                            <div className="flex flex-col sm:flex-row items-center justify-between mt-4 px-2 gap-2">
                                <div className="text-sm text-gray-600 mb-1 sm:mb-0">
                                    Halaman{" "}
                                    <span className="font-semibold text-gray-800">
                                        {page}
                                    </span>{" "}
                                    dari{" "}
                                    <span className="font-semibold text-gray-800">
                                        {totalPages}
                                    </span>
                                    <span className="mx-2">|</span>
                                    Total{" "}
                                    <span className="font-semibold text-gray-800">
                                        {totalRows}
                                    </span>{" "}
                                    data
                                </div>
                                <div className="flex items-center gap-0.5">
                                    <button
                                        onClick={handlePrev}
                                        disabled={page === 1}
                                        className={`px-3 py-2 rounded-l-md border border-r-0 text-sm flex items-center gap-1 font-semibold transition-colors
                                        ${
                                            page === 1
                                                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                        }
                                    `}
                                        aria-label="Halaman sebelumnya"
                                    >
                                        <FaChevronLeft />
                                    </button>
                                    <span className="px-4 py-2 text-sm bg-gray-50 text-gray-800 select-none font-bold tracking-wide border-t border-b border-gray-200">
                                        {page}
                                    </span>
                                    <button
                                        onClick={handleNext}
                                        disabled={page === totalPages}
                                        className={`px-3 py-2 rounded-r-md border border-l-0 text-sm flex items-center gap-1 font-semibold transition-colors
                                        ${
                                            page === totalPages
                                                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                        }
                                    `}
                                        aria-label="Halaman berikutnya"
                                    >
                                        <FaChevronRight />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Headless UI Dialog for a more luxurious, corporate modal */}
                <Transition.Root show={showTambahGardu} as={React.Fragment}>
                    <Dialog
                        as="div"
                        className="relative z-50"
                        onClose={setShowTambahGardu}
                    >
                        <Transition.Child
                            as={React.Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />
                        </Transition.Child>

                        <div className="fixed inset-0 z-50 overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center p-4 text-center">
                                <Transition.Child
                                    as={React.Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 scale-95"
                                    enterTo="opacity-100 scale-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100 scale-100"
                                    leaveTo="opacity-0 scale-95"
                                >
                                    <Dialog.Panel className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-gradient-to-br from-white via-blue-50 to-blue-100 shadow-2xl border border-blue-200 p-0 transition-all">
                                        {/* Modal Header */}
                                        <div className="flex items-center justify-between px-8 py-6 border-b border-blue-100 bg-gradient-to-r from-blue-700/90 to-blue-500/80">
                                            <Dialog.Title className="text-2xl font-bold text-white tracking-wide flex items-center gap-3">
                                                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/20 border border-white/30 shadow-lg">
                                                    <svg
                                                        width="28"
                                                        height="28"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        className="text-blue-200"
                                                    >
                                                        <path
                                                            d="M12 2v20M2 12h20"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                        />
                                                    </svg>
                                                </span>
                                                Tambah Gardu Induk
                                            </Dialog.Title>
                                            <button
                                                type="button"
                                                className="rounded-full p-2 hover:bg-blue-100/60 transition"
                                                onClick={() =>
                                                    setShowTambahGardu(false)
                                                }
                                            >
                                                <span className="sr-only">
                                                    Tutup
                                                </span>
                                                <svg
                                                    className="h-6 w-6 text-white"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeWidth="2"
                                                        d="M6 18L18 6M6 6l12 12"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                        {/* Modal Body */}
                                        <form
                                            className="w-full px-8 py-8 bg-white"
                                            // onSubmit={handleSubmitTambahGardu}
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                <div className="col-span-2">
                                                    <label className="block text-blue-900 font-semibold mb-2 tracking-wide">
                                                        Nama Gardu Induk
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        className="w-full border border-blue-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-blue-50/40 text-blue-900 font-medium placeholder:text-blue-400 transition"
                                                        placeholder="Contoh: GI 150KV DELTAMAS"
                                                        // value={form.name}
                                                        // onChange={handleChange}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-blue-900 font-semibold mb-2 tracking-wide">
                                                        Latitude
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        name="latitude"
                                                        className="w-full border border-blue-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-blue-50/40 text-blue-900 font-medium placeholder:text-blue-400 transition"
                                                        placeholder="Contoh: -6.405008876673348"
                                                        // value={form.latitude}
                                                        // onChange={handleChange}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-blue-900 font-semibold mb-2 tracking-wide">
                                                        Longitude
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        name="longitude"
                                                        className="w-full border border-blue-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-blue-50/40 text-blue-900 font-medium placeholder:text-blue-400 transition"
                                                        placeholder="Contoh: 107.175800484976"
                                                        // value={form.longitude}
                                                        // onChange={handleChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="block text-blue-900 font-semibold mb-2 tracking-wide">
                                                        ULTG
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="ultg"
                                                        className="w-full border border-blue-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-blue-50/40 text-blue-900 font-medium placeholder:text-blue-400 transition"
                                                        placeholder="Contoh: ULTG Karawang"
                                                        // value={form.ultg}
                                                        // onChange={handleChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="block text-blue-900 font-semibold mb-2 tracking-wide">
                                                        Kondisi
                                                    </label>
                                                    <Listbox
                                                        // value={form.kondisi}
                                                        // onChange={value => handleChange({ target: { name: 'kondisi', value } })}
                                                        name="kondisi"
                                                        as="div"
                                                    >
                                                        {({ open }) => (
                                                            <div className="relative">
                                                                <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-blue-50/40 border border-blue-200 py-3 pl-4 pr-10 text-left text-blue-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition">
                                                                    {/* {form.kondisi || "Pilih Kondisi"} */}
                                                                    Pilih
                                                                    Kondisi
                                                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                                        <svg
                                                                            className="h-5 w-5 text-blue-400"
                                                                            fill="none"
                                                                            viewBox="0 0 20 20"
                                                                            stroke="currentColor"
                                                                        >
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                strokeWidth="2"
                                                                                d="M7 7l3-3 3 3m0 6l-3 3-3-3"
                                                                            />
                                                                        </svg>
                                                                    </span>
                                                                </Listbox.Button>
                                                                <Transition
                                                                    show={open}
                                                                    as={
                                                                        React.Fragment
                                                                    }
                                                                    leave="transition ease-in duration-100"
                                                                    leaveFrom="opacity-100"
                                                                    leaveTo="opacity-0"
                                                                >
                                                                    <Listbox.Options className="absolute z-10 mt-2 w-full rounded-lg bg-white shadow-lg ring-1 ring-black/10 focus:outline-none">
                                                                        <Listbox.Option
                                                                            value=""
                                                                            className={({
                                                                                active,
                                                                            }) =>
                                                                                `cursor-pointer select-none relative px-4 py-3 text-blue-700 font-medium ${
                                                                                    active
                                                                                        ? "bg-blue-50"
                                                                                        : ""
                                                                                }`
                                                                            }
                                                                        >
                                                                            Pilih
                                                                            Kondisi
                                                                        </Listbox.Option>
                                                                        <Listbox.Option
                                                                            value="Operasi"
                                                                            className={({
                                                                                active,
                                                                            }) =>
                                                                                `cursor-pointer select-none relative px-4 py-3 text-green-700 font-semibold ${
                                                                                    active
                                                                                        ? "bg-green-50"
                                                                                        : ""
                                                                                }`
                                                                            }
                                                                        >
                                                                            Operasi
                                                                        </Listbox.Option>
                                                                        <Listbox.Option
                                                                            value="Tidak Operasi"
                                                                            className={({
                                                                                active,
                                                                            }) =>
                                                                                `cursor-pointer select-none relative px-4 py-3 text-red-700 font-semibold ${
                                                                                    active
                                                                                        ? "bg-red-50"
                                                                                        : ""
                                                                                }`
                                                                            }
                                                                        >
                                                                            Tidak
                                                                            Operasi
                                                                        </Listbox.Option>
                                                                    </Listbox.Options>
                                                                </Transition>
                                                            </div>
                                                        )}
                                                    </Listbox>
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-3 mt-8">
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-100 transition shadow-sm"
                                                    onClick={() =>
                                                        setShowTambahGardu(
                                                            false
                                                        )
                                                    }
                                                >
                                                    <svg
                                                        className="h-5 w-5 mr-2 text-gray-400"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeWidth="2"
                                                            d="M6 18L18 6M6 6l12 12"
                                                        />
                                                    </svg>
                                                    Batal
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="inline-flex items-center px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-700 to-blue-500 text-white font-bold shadow-lg hover:from-blue-800 hover:to-blue-600 transition"
                                                >
                                                    <svg
                                                        className="h-5 w-5 mr-2 text-white/80"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeWidth="2"
                                                            d="M5 13l4 4L19 7"
                                                        />
                                                    </svg>
                                                    Simpan
                                                </button>
                                            </div>
                                        </form>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition.Root>
            </DashboardLayout>
        </>
    );
}
