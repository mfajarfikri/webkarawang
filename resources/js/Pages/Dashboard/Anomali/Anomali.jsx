import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link } from "@inertiajs/react";
import {
    FaPlus,
    FaFilter,
    FaFileAlt,
    FaChevronLeft,
    FaChevronRight,
    FaCheck,
} from "react-icons/fa";
import ErrorBoundary from "@/Components/ErrorBoundary";
import { useState, useMemo } from "react";
import { MdOutlineReportProblem } from "react-icons/md";
import { Listbox } from "@headlessui/react";
import dateFormat, { masks } from "dateformat";

function StatusBadge({ status }) {
    let color = "bg-gray-300 text-gray-700";
    if (status === "New") color = "bg-blue-100 text-blue-700";
    else if (status === "Open") color = "bg-yellow-100 text-yellow-700";
    else if (status === "Pending") color = "bg-orange-100 text-orange-700";
    return (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${color}`}>
            {status}
        </span>
    );
}

export default function Anomali({ anomalis = [] }) {
    const [rowsPerPage, setRowsPerPage] = useState(8);
    const [page, setPage] = useState(1);

    // Reset page to 1 if rowsPerPage changes
    const handleRowsPerPageChange = (val) => {
        setRowsPerPage(val);
        setPage(1);
    };

    // Pagination logic
    const totalRows = anomalis.length;
    const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
    const paginatedData = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        return anomalis.slice(start, start + rowsPerPage);
    }, [anomalis, page, rowsPerPage]);

    const handlePrev = () => setPage((p) => Math.max(1, p - 1));
    const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

    return (
        <>
            <Head title="Anomali" />
            <DashboardLayout>
                <div className="py-6 w-full mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl shadow-xl border border-blue-100 p-0 md:p-0 overflow-hidden">
                        <div className="px-4 sm:px-6 pt-6 pb-2 border-b border-blue-100 bg-white/80 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="w-full md:w-2/3">
                                <h2 className="text-lg sm:text-xl font-bold text-blue-800 mb-1 flex items-center gap-2">
                                    <MdOutlineReportProblem className="text-blue-400 text-2xl" />
                                    <span>Manajemen Anomali</span>
                                </h2>
                                <p className="text-blue-700/80 text-xs sm:text-sm mb-2">
                                    Sistem manajemen Anomali memungkinkan Anda
                                    untuk mencatat, memantau, dan mengelola
                                    berbagai anomali atau gangguan yang terjadi
                                    pada sistem kelistrikan. Dengan fitur ini,
                                    Anda dapat mendeteksi anomali lebih cepat,
                                    melakukan analisis penyebab, serta mengambil
                                    tindakan korektif secara efisien untuk
                                    menjaga keandalan dan keamanan operasional.
                                </p>
                            </div>
                            <div className="w-full md:w-auto flex justify-start md:justify-end">
                                <Link
                                    href={route("dashboard.anomali.create")}
                                    className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-400 text-white px-4 sm:px-5 py-2 rounded-lg shadow hover:from-blue-700 hover:to-blue-500 font-semibold flex items-center justify-center gap-2 transition text-sm sm:text-base"
                                >
                                    <FaPlus className="text-base sm:text-lg" />
                                    <span>Tambah Anomali</span>
                                </Link>
                            </div>
                        </div>
                        <div className="px-2 md:px-6 pb-6 pt-4 bg-white/70">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                                <button
                                    className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-4 py-2 rounded-lg shadow hover:from-blue-700 hover:to-blue-500 font-semibold flex items-center gap-2"
                                    onClick={() =>
                                        setFilterOpen && setFilterOpen(true)
                                    }
                                    type="button"
                                >
                                    <FaFilter />
                                    Filter
                                </button>
                                <div className="flex items-center gap-2">
                                    <label className="text-gray-600 text-sm">
                                        Tampil
                                    </label>
                                    <Listbox
                                        value={rowsPerPage}
                                        onChange={handleRowsPerPageChange}
                                    >
                                        <div className="relative">
                                            <Listbox.Button className="border rounded px-2 py-1 text-sm focus:outline-none w-20 text-left">
                                                {rowsPerPage}
                                            </Listbox.Button>
                                            <Listbox.Options className="absolute left-0 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg z-20 overflow-hidden">
                                                {[8, 16, 32].map((option) => (
                                                    <Listbox.Option
                                                        key={option}
                                                        value={option}
                                                        className={({
                                                            active,
                                                            selected,
                                                        }) =>
                                                            `relative cursor-pointer select-none px-2 py-1 text-sm transition-colors ${
                                                                active
                                                                    ? "bg-blue-100 text-blue-700"
                                                                    : selected
                                                                    ? "bg-blue-50 text-blue-700"
                                                                    : "text-gray-700"
                                                            }`
                                                        }
                                                    >
                                                        {({ selected }) => (
                                                            <div className="flex items-center">
                                                                <span
                                                                    className={`block truncate ${
                                                                        selected
                                                                            ? "font-semibold"
                                                                            : "font-normal"
                                                                    }`}
                                                                >
                                                                    {option}
                                                                </span>
                                                                {selected && (
                                                                    <span className="ml-auto flex items-center text-blue-600">
                                                                        <FaCheck
                                                                            className="h-4 w-4"
                                                                            aria-hidden="true"
                                                                        />
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
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
                                <div className="overflow-x-auto rounded-lg border border-blue-100 bg-white/90 shadow-sm">
                                    <div className="overflow-hidden shadow-sm bg-white">
                                        <table className="min-w-[900px] w-full divide-y divide-blue-100">
                                            <thead className="bg-gradient-to-r from-blue-100 to-blue-50">
                                                <tr>
                                                    <th className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-xs font-bold text-blue-700 uppercase tracking-wider w-8 border-b border-blue-100">
                                                        No
                                                    </th>
                                                    <th className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-xs font-bold text-blue-700 uppercase tracking-wider min-w-[120px] border-b border-blue-100">
                                                        Judul
                                                    </th>
                                                    <th className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-xs font-bold text-blue-700 uppercase tracking-wider w-28 border-b border-blue-100">
                                                        ULTG
                                                    </th>
                                                    <th className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-xs font-bold text-blue-700 uppercase tracking-wider min-w-[120px] border-b border-blue-100">
                                                        Gardu Induk
                                                    </th>
                                                    <th className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-xs font-bold text-blue-700 uppercase tracking-wider w-20 border-b border-blue-100">
                                                        Bagian
                                                    </th>
                                                    <th className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-xs font-bold text-blue-700 uppercase tracking-wider w-16 border-b border-blue-100">
                                                        Tipe
                                                    </th>
                                                    <th className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-xs font-bold text-blue-700 uppercase tracking-wider min-w-[100px] border-b border-blue-100">
                                                        Kategori
                                                    </th>
                                                    <th className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-xs font-bold text-blue-700 uppercase tracking-wider min-w-[120px] border-b border-blue-100">
                                                        Peralatan
                                                    </th>
                                                    <th className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-xs font-bold text-blue-700 uppercase tracking-wider min-w-[120px] border-b border-blue-100">
                                                        Penempatan Alat
                                                    </th>
                                                    <th className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-xs font-bold text-blue-700 uppercase tracking-wider w-28 border-b border-blue-100">
                                                        Tanggal Kejadian
                                                    </th>
                                                    <th className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-xs font-bold text-blue-700 uppercase tracking-wider w-20 border-b border-blue-100">
                                                        Status
                                                    </th>
                                                    <th className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-xs font-bold text-blue-700 uppercase tracking-wider w-20 border-b border-blue-100">
                                                        Lampiran
                                                    </th>
                                                    <th className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-xs font-bold text-blue-700 uppercase tracking-wider min-w-[100px] border-b border-blue-100">
                                                        User
                                                    </th>
                                                    <th className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-xs font-bold text-blue-700 uppercase tracking-wider w-16 border-b border-blue-100">
                                                        Aksi
                                                    </th>
                                                </tr>
                                            </thead>
                                        </table>
                                        <div className="max-h-[500px] min-h-[320px] overflow-y-auto">
                                            <table className="min-w-[900px] w-full divide-y divide-x divide-blue-100">
                                                <colgroup>
                                                    <col
                                                        style={{ width: "3%" }}
                                                    />
                                                    <col
                                                        style={{ width: "12%" }}
                                                    />
                                                    <col
                                                        style={{ width: "7%" }}
                                                    />
                                                    <col
                                                        style={{ width: "12%" }}
                                                    />
                                                    <col
                                                        style={{ width: "7%" }}
                                                    />
                                                    <col
                                                        style={{ width: "5%" }}
                                                    />
                                                    <col
                                                        style={{ width: "8%" }}
                                                    />
                                                    <col
                                                        style={{ width: "12%" }}
                                                    />
                                                    <col
                                                        style={{ width: "12%" }}
                                                    />
                                                    <col
                                                        style={{ width: "8%" }}
                                                    />
                                                    <col
                                                        style={{ width: "7%" }}
                                                    />
                                                    <col
                                                        style={{ width: "7%" }}
                                                    />
                                                    <col
                                                        style={{ width: "8%" }}
                                                    />
                                                    <col
                                                        style={{ width: "5%" }}
                                                    />
                                                </colgroup>
                                                <tbody className="bg-white divide-y divide-blue-50">
                                                    {paginatedData.length ===
                                                    0 ? (
                                                        <tr>
                                                            <td
                                                                colSpan={14}
                                                                className="text-center py-8 text-blue-300 font-semibold text-lg bg-gradient-to-r from-blue-50 to-blue-50"
                                                            >
                                                                Tidak ada data
                                                                anomali.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        paginatedData.map(
                                                            (anomali, idx) => {
                                                                let lampiran =
                                                                    "-";
                                                                let lampiranCount = 0;
                                                                try {
                                                                    if (
                                                                        anomali.lampiran_foto
                                                                    ) {
                                                                        const arr =
                                                                            typeof anomali.lampiran_foto ===
                                                                            "string"
                                                                                ? JSON.parse(
                                                                                      anomali.lampiran_foto
                                                                                  )
                                                                                : anomali.lampiran_foto;
                                                                        lampiranCount =
                                                                            Array.isArray(
                                                                                arr
                                                                            )
                                                                                ? arr.length
                                                                                : 0;
                                                                        lampiran =
                                                                            lampiranCount >
                                                                            0 ? (
                                                                                <span className="flex items-center gap-1 justify-center text-blue-700 font-semibold">
                                                                                    <FaFileAlt className="text-blue-500" />
                                                                                    <span>
                                                                                        {
                                                                                            lampiranCount
                                                                                        }{" "}
                                                                                        file
                                                                                    </span>
                                                                                </span>
                                                                            ) : (
                                                                                "-"
                                                                            );
                                                                    }
                                                                } catch {
                                                                    lampiran =
                                                                        "-";
                                                                }
                                                                return (
                                                                    <tr
                                                                        key={
                                                                            anomali.id
                                                                        }
                                                                    >
                                                                        <td className="text-center text-xs font-bold text-blue-700 py-3 px-2 border-b border-blue-50">
                                                                            {(page -
                                                                                1) *
                                                                                rowsPerPage +
                                                                                idx +
                                                                                1}
                                                                        </td>
                                                                        <td
                                                                            className="text-center max-w-[140px] truncate font-semibold text-blue-900 py-3 px-2 border-b border-blue-50"
                                                                            title={
                                                                                anomali.judul
                                                                            }
                                                                        >
                                                                            {
                                                                                anomali.judul
                                                                            }
                                                                        </td>
                                                                        <td className="text-center font-xs py-3 px-2 border-b border-blue-50">
                                                                            {anomali.ultg ===
                                                                            "ULTG Karawang"
                                                                                ? "Karawang"
                                                                                : "Purwakarta"}
                                                                        </td>
                                                                        <td
                                                                            className="text-center max-w-[120px] truncate font-xs py-3 px-2 border-b border-blue-50"
                                                                            title={
                                                                                anomali
                                                                                    .gardu_induk
                                                                                    ?.name ??
                                                                                "-"
                                                                            }
                                                                        >
                                                                            {anomali
                                                                                .gardu_induk
                                                                                ?.name ??
                                                                                "-"}
                                                                        </td>
                                                                        <td className="text-center font-xs py-3 px-2 border-b border-blue-50">
                                                                            {
                                                                                anomali.bagian
                                                                            }
                                                                        </td>
                                                                        <td className="text-center font-xs py-3 px-2 border-b border-blue-50">
                                                                            {
                                                                                anomali.tipe
                                                                            }
                                                                        </td>
                                                                        <td
                                                                            className="text-center max-w-[100px] truncate font-xs py-3 px-2 border-b border-blue-50"
                                                                            title={
                                                                                anomali
                                                                                    .kategori
                                                                                    ?.name ??
                                                                                "-"
                                                                            }
                                                                        >
                                                                            {anomali
                                                                                .kategori
                                                                                ?.name ??
                                                                                "-"}
                                                                        </td>
                                                                        <td
                                                                            className="text-center max-w-[120px] truncate font-xs py-3 px-2 border-b border-blue-50"
                                                                            title={
                                                                                anomali.peralatan
                                                                            }
                                                                        >
                                                                            {
                                                                                anomali.peralatan
                                                                            }
                                                                        </td>
                                                                        <td
                                                                            className="text-center max-w-[120px] truncate font-xs py-3 px-2 border-b border-blue-50"
                                                                            title={
                                                                                anomali.penempatan_alat
                                                                            }
                                                                        >
                                                                            {
                                                                                anomali.penempatan_alat
                                                                            }
                                                                        </td>
                                                                        <td className="text-center font-xs py-3 px-2 border-b border-blue-50">
                                                                            {dateFormat(
                                                                                anomali.tanggal_kejadian,
                                                                                "dd mmm yyyy"
                                                                            )}
                                                                        </td>
                                                                        <td className="text-center py-3 px-2 border-b border-blue-50">
                                                                            <StatusBadge
                                                                                status={
                                                                                    anomali.status
                                                                                }
                                                                            />
                                                                        </td>
                                                                        <td className="text-center py-3 px-2 border-b border-blue-50">
                                                                            {
                                                                                lampiran
                                                                            }
                                                                        </td>
                                                                        <td
                                                                            className="text-center max-w-[100px] truncate font-xs py-3 px-2 border-b border-blue-50"
                                                                            title={
                                                                                anomali
                                                                                    .user
                                                                                    ?.name ??
                                                                                "-"
                                                                            }
                                                                        >
                                                                            {anomali
                                                                                .user
                                                                                ?.name ??
                                                                                "-"}
                                                                        </td>
                                                                        <td className="text-center py-3 px-2 border-b border-blue-50">
                                                                            <button className="bg-gradient-to-r from-blue-200 to-blue-100 hover:from-blue-300 hover:to-blue-200 text-blue-800 px-3 py-1 rounded-lg shadow text-xs font-bold transition-all duration-150">
                                                                                Detail
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            }
                                                        )
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </ErrorBoundary>
                            {/* Pagination controls */}
                            <div className="flex flex-col sm:flex-row items-center justify-between mt-4 px-2 gap-2">
                                <div className="text-xs text-blue-700 mb-1 sm:mb-0 font-medium">
                                    Halaman{" "}
                                    <span className="font-bold text-blue-800">
                                        {page}
                                    </span>{" "}
                                    dari{" "}
                                    <span className="font-bold text-blue-800">
                                        {totalPages}
                                    </span>
                                    <span className="mx-2">|</span>
                                    Total{" "}
                                    <span className="font-bold text-blue-800">
                                        {totalRows}
                                    </span>{" "}
                                    data
                                </div>
                                <div className="flex items-center gap-0.5">
                                    <button
                                        onClick={handlePrev}
                                        disabled={page === 1}
                                        className={`px-3 py-2 rounded-l-lg border border-r-0 text-xs flex items-center gap-1 font-semibold transition-all duration-150
                                        ${
                                            page === 1
                                                ? "bg-blue-100 text-blue-300 border-blue-100 cursor-not-allowed"
                                                : "bg-gradient-to-r from-blue-600 to-indigo-500 text-white border-blue-600 hover:from-blue-700 hover:to-indigo-600"
                                        }
                                    `}
                                        aria-label="Halaman sebelumnya"
                                    >
                                        <FaChevronLeft />
                                    </button>
                                    <span className="px-4 py-2 text-xs bg-blue-50 text-blue-700 select-none font-bold tracking-wide border-blue-100">
                                        {page}
                                    </span>
                                    <button
                                        onClick={handleNext}
                                        disabled={page === totalPages}
                                        className={`px-3 py-2 rounded-r-lg border border-l-0 text-xs flex items-center gap-1 font-semibold transition-all duration-150
                                        ${
                                            page === totalPages
                                                ? "bg-blue-100 text-blue-300 border-blue-100 cursor-not-allowed"
                                                : "bg-gradient-to-l from-blue-600 to-indigo-500 text-white border-blue-600 hover:from-blue-700 hover:to-indigo-600"
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
            </DashboardLayout>
        </>
    );
}
