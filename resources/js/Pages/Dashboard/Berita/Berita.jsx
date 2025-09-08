import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaUser,
    FaSearch,
    FaSpinner,
    FaNewspaper,
    FaEllipsisV,
    FaArrowLeft,
    FaArrowRight,
    FaTimes,
    FaCalendar,
    FaClock,
    FaChevronLeft,
    FaChevronRight,
} from "react-icons/fa";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useSnackbar } from "notistack";
import axios from "axios";

export default function Berita({ berita: initialBerita, response }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [berita, setBerita] = useState(initialBerita || "");
    const [isLoading, setIsLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [beritaToDelete, setBeritaToDelete] = useState(null);
    const { enqueueSnackbar } = useSnackbar();
    const { csrf_token } = usePage().props;
    const [actionDropdown, setActionDropdown] = useState(null);
    const { flash } = usePage().props;
    const [pagination, setPagination] = useState({
        current_page: initialBerita?.current_page || 1,
        last_page: initialBerita?.last_page || 1,
        per_page: initialBerita?.per_page || 10,
        total: initialBerita?.total || 0,
        from: initialBerita?.from || 0,
        to: initialBerita?.to || 0,
    });

    // Fungsi debounce untuk menunda eksekusi fungsi
    const debounce = (func, delay) => {
        let debounceTimer;
        return function () {
            const context = this;
            const args = arguments;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(context, args), delay);
        };
    };
    // Fungsi pencarian dengan debounce
    const handleSearch = debounce((e) => {
        setSearchTerm(e.target.value);
    }, 300);

    // Fungsi untuk reset pencarian
    const resetSearch = () => {
        document.getElementById("search-input").value = "";
        setSearchTerm("");
    };

    // Fetch berita with pagination
    const fetchBerita = useCallback(
        async (page = 1) => {
            setIsLoading(true);
            try {
                const response = await axios.get(
                    route("api.berita.index", { page })
                );
                setBerita(response.data.data);
                setPagination({
                    current_page: response.data.data.current_page,
                    last_page: response.data.data.last_page,
                    per_page: response.data.data.per_page,
                    total: response.data.data.total,
                    from: response.data.data.from,
                    to: response.data.data.to,
                });
            } catch (error) {
                console.error("Error fetching berita:", error);
                enqueueSnackbar("Gagal memuat data berita", {
                    variant: "error",
                    anchorOrigin: {
                        vertical: "bottom",
                        horizontal: "left",
                    },
                });
            } finally {
                setIsLoading(false);
            }
        },
        [enqueueSnackbar]
    );

    // Handle page change
    const handlePageChange = (page) => {
        fetchBerita(page);
    };

    // Load initial data
    useEffect(() => {
        if (!initialBerita) {
            fetchBerita(1);
        }
    }, [fetchBerita, initialBerita]);

    const filteredBerita = searchTerm
        ? berita?.data?.filter(
              (item) =>
                  item.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  item.user.name
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
          ) || []
        : berita?.data || [];

    const handleDelete = (berita) => {
        try {
            setIsLoading(true);

            // Gunakan axios.delete sebagai pengganti router.delete
            axios
                .delete(route("dashboard.berita.destroy", berita), {
                    headers: {
                        "X-CSRF-TOKEN": csrf_token,
                    },
                })
                .then((response) => {
                    // Update local state after successful deletion
                    setBerita((prevBerita) => ({
                        ...prevBerita,
                        data: prevBerita.data.filter(
                            (item) => item.id !== berita.id
                        ),
                    }));

                    // Tampilkan notifikasi sukses
                    enqueueSnackbar("Berita berhasil dihapus", {
                        variant: "success",
                        anchorOrigin: {
                            vertical: "bottom",
                            horizontal: "left",
                        },
                    });
                    setShowDeleteModal(false);
                    setBeritaToDelete(null);
                })
                .catch((error) => {
                    console.error("Error deleting news:", error);
                    // Tampilkan notifikasi error
                    enqueueSnackbar(
                        "Gagal menghapus berita: " +
                            (error.response?.data?.message || "Unknown error"),
                        {
                            variant: "error",
                            anchorOrigin: {
                                vertical: "bottom",
                                horizontal: "left",
                            },
                        }
                    );
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } catch (error) {
            console.error("Error deleting news:", error);
            // Tampilkan notifikasi error jika terjadi exception
            enqueueSnackbar(
                "Gagal menghapus berita: " + (error.message || "Unknown error"),
                {
                    variant: "error",
                    anchorOrigin: {
                        vertical: "bottom",
                        horizontal: "left",
                    },
                }
            );
            setIsLoading(false);
        }
    };

    const toggleActionDropdown = (id, e) => {
        e?.stopPropagation();
        setActionDropdown(actionDropdown === id ? null : id);
    };

    return (
        <DashboardLayout>
            <Head title="Berita" />

            <div className="py-6 w-full mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl shadow-xl mb-8 overflow-visible relative">
                    <div className="absolute inset-0 bg-pattern opacity-10 rounded-2xl"></div>
                    <div className="px-6 py-10 md:px-12 md:py-12 relative z-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between">
                            <div className="mb-8 md:mb-0">
                                <div className="flex items-center mb-3">
                                    <div className="flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full w-14 h-14 mr-4 shadow-inner">
                                        <FaNewspaper className="text-white text-xl" />
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                                        Manajemen Berita
                                    </h1>
                                </div>
                                <p className="mt-3 text-blue-100 max-w-2xl text-lg opacity-90">
                                    Kelola berita dan informasi terkini PLN UPT
                                    Karawang
                                </p>
                                <div className="mt-4 flex items-center text-blue-100 text-sm">
                                    <div className="flex items-center mr-6">
                                        <div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div>
                                        <span>
                                            {pagination?.total || 0} Berita
                                            Aktif
                                        </span>
                                    </div>
                                    {berita?.data?.last_updated && (
                                        <div className="flex items-center">
                                            <FaCalendar className="mr-2 text-xs" />
                                            <span>
                                                Terakhir diperbarui:{" "}
                                                {format(
                                                    new Date(
                                                        initialBerita.last_updated
                                                    ),
                                                    "dd MMM yyyy",
                                                    { locale: id }
                                                )}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <Link
                                href={route("dashboard.berita.create")}
                                className="inline-flex items-center px-6 py-3 bg-white text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-200 shadow-md font-medium transform hover:scale-105 hover:shadow-lg"
                            >
                                <FaPlus className="mr-2" />
                                Tambah Berita
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Search and Filter Bar */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative w-full md:w-1/3">
                            <div className="relative group">
                                <input
                                    id="search-input"
                                    type="text"
                                    placeholder="Cari judul berita atau penulis..."
                                    className="w-full px-5 py-3 pl-12 pr-10 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-300 shadow-sm transition-all duration-200 bg-gray-50 focus:bg-white"
                                    defaultValue={searchTerm}
                                    onChange={handleSearch}
                                />
                                <div className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200">
                                    <FaSearch className="h-5 w-5" />
                                </div>
                                {isLoading && (
                                    <div className="absolute right-4 top-3.5 text-blue-500">
                                        <FaSpinner className="h-5 w-5 animate-spin" />
                                    </div>
                                )}
                                {searchTerm && (
                                    <button
                                        onClick={resetSearch}
                                        className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition-all duration-200"
                                        title="Reset pencarian"
                                    >
                                        <FaTimes className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                            {searchTerm && (
                                <div className="text-sm text-gray-500 mt-2 ml-1">
                                    Menampilkan {filteredBerita.length} hasil
                                    untuk "{searchTerm}"
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="text-sm text-gray-500 hidden md:block">
                                Total:{" "}
                                <span className="font-medium text-gray-700">
                                    {filteredBerita.length} berita
                                </span>
                            </div>
                            <div className="flex-grow md:flex-grow-0"></div>
                            <div className="flex items-center gap-2">
                                <button
                                    className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center text-sm font-medium transition-colors duration-200"
                                    title="Urutkan berdasarkan tanggal"
                                >
                                    <FaCalendar className="mr-2 text-gray-400" />
                                    Terbaru
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Berita Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredBerita.map((item) => (
                        <div
                            key={item.id}
                            className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-visible flex flex-col h-full border border-gray-100 hover:border-blue-200 relative"
                        >
                            <div className="relative h-52 overflow-hidden">
                                {item.gambar && (
                                    <img
                                        src={
                                            typeof item.gambar === "string"
                                                ? `/storage/berita/${
                                                      JSON.parse(item.gambar)[0]
                                                  }`
                                                : Array.isArray(item.gambar) &&
                                                  item.gambar.length > 0
                                                ? `/storage/berita/${item.gambar[0]}`
                                                : "/img/heroBerita.jpg"
                                        }
                                        alt={item.judul}
                                        loading="lazy"
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src =
                                                "/img/heroBerita.jpg";
                                        }}
                                    />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />

                                {/* Badge */}
                                <div className="absolute top-4 left-4 bg-blue-600/90 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm">
                                    Berita
                                </div>

                                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-white">
                                    <div className="flex items-center text-sm bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
                                        <FaUser className="mr-2 text-xs" />
                                        <span className="truncate max-w-[120px]">
                                            {item.user.name || "-"}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-sm bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
                                        <FaCalendar className="mr-2 text-xs" />
                                        {format(
                                            new Date(item.created_at),
                                            "dd MMM yyyy",
                                            { locale: id }
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 flex flex-col flex-grow">
                                <h2 className="text-xl font-bold text-gray-800 line-clamp-2 mb-3 group-hover:text-blue-700 transition-colors duration-200">
                                    {item.judul}
                                </h2>
                                <div
                                    className="text-gray-600 text-sm line-clamp-3 mb-4 flex-grow overflow-hidden"
                                    dangerouslySetInnerHTML={{
                                        __html: item.isi.replace(
                                            /<[^>]*>/g,
                                            " "
                                        ),
                                    }}
                                />

                                <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-auto">
                                    <Link
                                        href={route(
                                            "dashboard.berita.show",
                                            item.slug
                                        )}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center group-hover:underline"
                                    >
                                        Baca selengkapnya
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-200"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                    </Link>
                                    <div className="relative z-[10]">
                                        <button
                                            onClick={(e) =>
                                                toggleActionDropdown(item.id, e)
                                            }
                                            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors duration-200"
                                            aria-label="Menu aksi"
                                        >
                                            <FaEllipsisV />
                                        </button>
                                        {actionDropdown === item.id && (
                                            <div
                                                className="absolute right-0 top-full mt-1 w-48 rounded-xl shadow-xl bg-white ring-1 ring-black ring-opacity-5 z-[100] overflow-visible border border-gray-100"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                                style={{ minWidth: "200px" }}
                                            >
                                                <div className="py-1">
                                                    <Link
                                                        href={route(
                                                            "dashboard.berita.edit",
                                                            item.slug
                                                        )}
                                                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
                                                        onClick={(e) =>
                                                            e.stopPropagation()
                                                        }
                                                    >
                                                        <FaEdit className="mr-3 h-4 w-4" />
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setBeritaToDelete(
                                                                item
                                                            );
                                                            setShowDeleteModal(
                                                                true
                                                            );
                                                            toggleActionDropdown(
                                                                item.id
                                                            );
                                                        }}
                                                        className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 cursor-pointer transition-colors duration-200"
                                                        type="button"
                                                    >
                                                        <FaTrash className="mr-3 h-4 w-4" />
                                                        Hapus
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="col-span-full py-16">
                        <div className="flex flex-col items-center justify-center max-w-md mx-auto text-center bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
                                <div className="absolute top-0 w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mt-6 mb-2">
                                Memuat Berita
                            </h3>
                            <p className="text-gray-500">
                                Mohon tunggu sebentar, kami sedang memuat data
                                berita terbaru...
                            </p>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {filteredBerita.length === 0 && !isLoading && (
                    <div className="col-span-full py-16">
                        <div className="flex flex-col items-center justify-center max-w-md mx-auto text-center bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <div className="bg-blue-50 p-4 rounded-full mb-5">
                                <FaNewspaper className="h-10 w-10 text-blue-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {searchTerm
                                    ? "Pencarian Tidak Ditemukan"
                                    : "Belum Ada Berita"}
                            </h3>
                            <p className="text-gray-500 mb-6">
                                {searchTerm
                                    ? `Tidak ada berita yang cocok dengan pencarian "${searchTerm}"`
                                    : "Belum ada berita yang ditambahkan. Silakan tambahkan berita baru untuk ditampilkan di sini."}
                            </p>
                            {searchTerm ? (
                                <button
                                    onClick={resetSearch}
                                    className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors duration-200 shadow-sm flex items-center justify-center"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 mr-2"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                        />
                                    </svg>
                                    Reset Pencarian
                                </button>
                            ) : (
                                <Link
                                    href={route("dashboard.berita.create")}
                                    className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors duration-200 shadow-sm flex items-center justify-center"
                                >
                                    <FaPlus className="h-4 w-4 mr-2" />
                                    Tambah Berita Baru
                                </Link>
                            )}
                        </div>
                    </div>
                )}

                {/* Pagination */}
                {filteredBerita.length > 0 && (
                    <div className="col-span-full mt-12">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="text-sm text-gray-500">
                                Menampilkan halaman {pagination.current_page}{" "}
                                dari {pagination.last_page} ({pagination.total}{" "}
                                total berita)
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() =>
                                        handlePageChange(
                                            pagination.current_page - 1
                                        )
                                    }
                                    disabled={pagination.current_page <= 1}
                                    className={`flex items-center px-4 py-2 rounded-lg border ${
                                        pagination.current_page <= 1
                                            ? "border-gray-200 text-gray-300 cursor-not-allowed"
                                            : "border-blue-500 text-blue-600 hover:bg-blue-50"
                                    }`}
                                >
                                    <FaChevronLeft className="mr-1 h-3 w-3" />
                                    <span>Sebelumnya</span>
                                </button>

                                <div className="hidden md:flex space-x-1">
                                    {Array.from(
                                        { length: pagination.last_page },
                                        (_, i) => i + 1
                                    ).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() =>
                                                handlePageChange(page)
                                            }
                                            className={`w-10 h-10 flex items-center justify-center rounded-lg ${
                                                pagination.current_page === page
                                                    ? "bg-blue-600 text-white font-medium"
                                                    : "text-gray-700 hover:bg-gray-100 border border-gray-200"
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() =>
                                        handlePageChange(
                                            pagination.current_page + 1
                                        )
                                    }
                                    disabled={
                                        pagination.current_page >=
                                        pagination.last_page
                                    }
                                    className={`flex items-center px-4 py-2 rounded-lg border ${
                                        pagination.current_page >=
                                        pagination.last_page
                                            ? "border-gray-200 text-gray-300 cursor-not-allowed"
                                            : "border-blue-500 text-blue-600 hover:bg-blue-50"
                                    }`}
                                >
                                    <span>Selanjutnya</span>
                                    <FaChevronRight className="ml-1 h-3 w-3" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && beritaToDelete && (
                    <div className="fixed inset-0 z-[100] overflow-y-visible">
                        <div className="flex items-center justify-center min-h-screen px-4">
                            <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity" />
                            <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl transform transition-all">
                                <div className="absolute top-0 right-0 pt-4 pr-4">
                                    <button
                                        type="button"
                                        className="bg-white rounded-full p-1.5 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                                        onClick={() => {
                                            setShowDeleteModal(false);
                                            setBeritaToDelete(null);
                                        }}
                                    >
                                        <span className="sr-only">Tutup</span>
                                        <svg
                                            className="h-5 w-5"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            aria-hidden="true"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </div>
                                <div className="p-8">
                                    <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-6">
                                        <FaTrash className="h-7 w-7 text-red-600" />
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                                            Konfirmasi Hapus Berita
                                        </h3>
                                        <div className="mt-4 mb-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            <p className="font-medium text-gray-800 line-clamp-2">
                                                "{beritaToDelete.judul}"
                                            </p>
                                        </div>
                                        <p className="mt-3 text-sm text-gray-500">
                                            Apakah Anda yakin ingin menghapus
                                            berita ini?
                                            <span className="font-medium text-red-600">
                                                Tindakan ini tidak dapat
                                                dibatalkan.
                                            </span>
                                        </p>
                                    </div>
                                    <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                                        <button
                                            type="button"
                                            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200 shadow-sm"
                                            onClick={() => {
                                                setShowDeleteModal(false);
                                                setBeritaToDelete(null);
                                            }}
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="button"
                                            className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors duration-200 shadow-sm flex items-center justify-center"
                                            onClick={(e) => {
                                                e.preventDefault(); // Mencegah perilaku default form submission
                                                handleDelete(beritaToDelete);
                                            }}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <FaSpinner className="animate-spin mr-2 h-4 w-4" />
                                                    Menghapus...
                                                </>
                                            ) : (
                                                <>
                                                    <FaTrash className="mr-2 h-4 w-4" />
                                                    Hapus Berita
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
