import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head } from "@inertiajs/react";
import { GiElectric } from "react-icons/gi";
import { FaPlus, FaFilter } from "react-icons/fa";
import ErrorBoundary from "@/Components/ErrorBoundary";
import { useState } from "react";
import Modal from "@/Components/Modal";

export default function GarduInduk({ garduInduks = [] }) {
    const [rowsPerPage, setRowsPerPage] = useState(8)
    const [showTambahGardu, setShowTambahGardu] = useState(true)
    return(
        <>
        <Head title="Gardu Induk"/>
        <DashboardLayout>
            <div className="py-6 w-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl shadow-xl border border-blue-100 p-0 md:p-0 overflow-hidden">
                    <div className="px-4 sm:px-6 pt-6 pb-2 border-b border-blue-100 bg-white/80 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="w-full md:w-2/3">
                            <h2 className="text-lg sm:text-xl font-bold text-blue-800 mb-1 flex items-center gap-2">
                                <GiElectric className="text-blue-400 text-2xl" />
                                <span>Manajemen Gardu Induk</span>
                            </h2>
                            <p className="text-blue-700/80 text-xs sm:text-sm mb-2">
                                Sistem manajemen Gardu Induk memungkinkan Anda untuk mengelola data gardu induk secara efisien, mulai dari penambahan, pengeditan, hingga penghapusan data. Dengan tampilan yang modern dan fitur yang mudah digunakan, Anda dapat memantau dan memperbarui informasi gardu induk untuk mendukung operasional kelistrikan secara optimal.
                            </p>
                        </div>
                        <div className="w-full md:w-auto flex justify-start md:justify-end">
                            <button onClick=""
                                className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-400 text-white px-4 sm:px-5 py-2 rounded-lg shadow hover:from-blue-700 hover:to-blue-500 font-semibold flex items-center justify-center gap-2 transition text-sm sm:text-base"
                            >
                                <FaPlus className="text-base sm:text-lg" /> 
                                <span>Tambah Gardu Induk</span>
                            </button>
                        </div>
                    </div>
                    <div className="px-2 md:px-6 pb-6 pt-4 bg-white/70">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                            <button
                                className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-4 py-2 rounded-lg shadow hover:from-blue-700 hover:to-blue-500 font-semibold flex items-center gap-2"
                                onClick={() => setFilterOpen(true)}
                                type="button"
                            >
                                <FaFilter />
                                Filter
                            </button>
                            <div className="flex items-center gap-2">
                                <label className="text-gray-600 text-sm">
                                    Tampil
                                </label>
                                <select
                                    className="border rounded px-2 py-1 text-sm focus:outline-none"
                                    value={rowsPerPage}
                                    onChange={(e) =>
                                        setRowsPerPage(
                                            Number(e.target.value)
                                        )
                                    }
                                >
                                    <option value={8}>8</option>
                                    <option value={16}>16</option>
                                    <option value={32}>32</option>
                                </select>
                                <span className="text-gray-500 text-xs">
                                    / halaman
                                </span>
                            </div>
                        </div>
                        <div className="overflow-x-auto rounded-lg border border-blue-100 bg-white/90 shadow-sm">
                            <ErrorBoundary>
                                <table className="min-w-full divide-y divide-blue-100">
                                    <thead className="bg-gradient-to-r from-blue-100 to-blue-50">
                                        <tr>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-blue-700 uppercase tracking-wider">
                                                No
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-blue-700 uppercase tracking-wider">
                                                Wilayah
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
                                                Nama
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-blue-700 uppercase tracking-wider">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-blue-50">
                                        {garduInduks.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="text-center py-4 text-gray-400">Tidak ada data</td>
                                            </tr>
                                        ) : (
                                            garduInduks.slice(0, rowsPerPage).map((gardu, idx) => (
                                                <tr key={gardu.id}>
                                                    <td className="px-4 py-2 text-center">{idx + 1}</td>
                                                    <td className="px-4 py-2 text-center">{gardu.name_ultg}</td>
                                                    <td className="px-4 py-2">{gardu.name}</td>
                                                    <td className="px-4 py-2 text-center">-</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </ErrorBoundary>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={showTambahGardu} onClose={()=> setShowTambahGardu(false)} title="Tambah Gardu Induk" maxWidth="xl">
                <div className="max-h-screen w-1/3 bg-white">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Autem, dolore.
                </div>
            </Modal>
        </DashboardLayout>
        </>
    )
}