import { useState, useEffect } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaCalendar,
    FaUser,
    FaSearch,
    FaSpinner,
    FaNewspaper,
    FaEllipsisV,
    FaArrowLeft,
    FaArrowRight,
} from "react-icons/fa";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "react-hot-toast";

export default function Berita({ berita: initialBerita, response }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [berita, setBerita] = useState(initialBerita || "");
    const [isLoading, setIsLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [beritaToDelete, setBeritaToDelete] = useState(null);
    const [actionDropdown, setActionDropdown] = useState(null);
    const { flash } = usePage().props;

    const filteredBerita =
        berita?.data?.filter(
            (item) =>
                item.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.user.name.toLowerCase().includes(searchTerm.toLowerCase())
        ) || [];

    const handleDelete = async (id) => {
        try {
            await router.delete(route("dashboard.berita.destroy", id));
            toast.success("Berita berhasil dihapus");
            setShowDeleteModal(false);
            setBeritaToDelete(null);
        } catch (error) {   
            toast.error("Gagal menghapus berita");
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
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg mb-6 overflow-hidden">
                    <div className="px-6 py-8 md:px-10 md:py-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between">
                            <div className="mb-6 md:mb-0">
                                <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center">
                                    <div className="flex items-center justify-center bg-blue-500 rounded-full w-12 h-12 mr-3">
                                        <FaNewspaper className="text-blue-200" />
                                    </div>
                                    Manajemen Berita
                                </h1>
                                <p className="mt-2 text-blue-100 max-w-2xl">
                                    Kelola berita dan informasi terkini PLN UPT
                                    Karawang
                                </p>
                            </div>
                            <Link
                                href={route("dashboard.berita.create")}
                                className="inline-flex items-center px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 shadow-sm font-medium"
                            >
                                <FaPlus className="mr-2" />
                                Tambah Berita
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
                    <div className="relative w-full md:w-1/3">
                        <input
                            type="text"
                            placeholder="Cari berita..."
                            className="w-full px-4 py-2.5 pl-11 pr-10 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <FaSearch className="absolute left-4 top-3.5 text-gray-400" />
                        {isLoading && (
                            <FaSpinner className="absolute right-4 top-3.5 text-blue-500 animate-spin" />
                        )}
                    </div>
                </div>

                {/* Berita Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBerita.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                        >
                            <div className="relative h-48 overflow-hidden rounded-t-xl">
                                {/* {item.gambar} */}
                                <img
                                    src={`/storage/berita/${
                                        JSON.parse(item.gambar)[0]
                                    }`}
                                    alt={item.judul}
                                    loading="lazy"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-white">
                                    <div className="flex items-center text-sm">
                                        <FaUser className="mr-2" />
                                        {item.user.name || "-"}
                                    </div>
                                    <div className="flex items-center text-sm">
                                        <FaCalendar className="mr-2" />
                                        {format(
                                            new Date(item.created_at),
                                            "dd MMM yyyy",
                                            { locale: id }
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-5">
                                <h2 className="text-xl font-semibold text-gray-800 line-clamp-2 mb-3">
                                    {item.judul}
                                </h2>
                                <p
                                    className="text-gray-600 line-clamp-3 mb-4"
                                    dangerouslySetInnerHTML={{
                                        __html: item.isi,
                                    }}
                                />

                                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                    <Link
                                        href={route("dashboard.berita.show", item.slug)}
                                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                    >
                                        Baca selengkapnya
                                    </Link>
                                    <div className="relative">
                                        <button
                                            onClick={(e) =>
                                                toggleActionDropdown(item.id, e)
                                            }
                                            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                                        >
                                            <FaEllipsisV />
                                        </button>
                                        {actionDropdown === item.id && (
                                            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                                <div className="py-1">
                                                    <Link
                                                        href={route(
                                                            "dashboard.berita.edit",
                                                            item.id
                                                        )}
                                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    >
                                                        <FaEdit className="mr-3 h-4 w-4" />
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => {
                                                            setBeritaToDelete(
                                                                item
                                                            );
                                                            setShowDeleteModal(
                                                                true
                                                            );
                                                        }}
                                                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
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

                {/* Empty State */}
                {(!initialBerita?.data ||
                    initialBerita?.data?.length === 0) && (
                    <div className="text-center py-12">
                        <FaNewspaper className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900">
                            Belum ada berita
                        </h3>
                        <p className="mt-1 text-gray-500">
                            Mulai dengan menambahkan berita baru.
                        </p>
                        <div className="mt-6">
                            <Link
                                href={route("dashboard.berita.create")}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                <FaPlus className="mr-2" />
                                Tambah Berita
                            </Link>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && beritaToDelete && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen px-4">
                            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                            <div className="relative bg-white rounded-lg max-w-md w-full">
                                <div className="p-6">
                                    <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                                        <FaTrash className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div className="mt-3 text-center">
                                        <h3 className="text-lg font-medium text-gray-900">
                                            Hapus Berita
                                        </h3>
                                        <p className="mt-2 text-sm text-gray-500">
                                            Apakah Anda yakin ingin menghapus
                                            berita "{beritaToDelete.judul}"?
                                            Tindakan ini tidak dapat dibatalkan.
                                        </p>
                                    </div>
                                    <div className="mt-6 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                            onClick={() => {
                                                setShowDeleteModal(false);
                                                setBeritaToDelete(null);
                                            }}
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="button"
                                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                                            onClick={() =>
                                                handleDelete(beritaToDelete.id)
                                            }
                                        >
                                            Hapus
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
