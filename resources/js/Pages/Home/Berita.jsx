import HomeLayout from "@/Layouts/HomeLayout";
import { Head, Link } from "@inertiajs/react";
import {
    FaCalendarAlt,
    FaUser,
    FaSearch,
    FaChevronRight,
    FaEye,
} from "react-icons/fa";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { generateExcerpt } from "@/utils/editorParser";
import React, { useEffect, useState } from "react";
import axios from "axios";

const NewsImage = ({ src, alt, className }) => {
    const [hasError, setHasError] = useState(false);

    const handleError = () => {
        console.error(`[Image Error] Failed to load image from: ${src}`);
        setHasError(true);
    };

    if (hasError || !src) {
        return (
            <div
                className={`w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center ${className ? className.replace(/object-\w+/g, "") : ""}`}
            >
                <div className="text-center p-4">
                    <span className="block text-blue-400 font-semibold tracking-wider text-sm">
                        PLN UPT
                    </span>
                    <span className="block text-blue-600 font-bold tracking-widest text-lg">
                        KARAWANG
                    </span>
                </div>
            </div>
        );
    }

    return (
        <img
            loading="lazy"
            src={src}
            alt={alt}
            className={className}
            onError={handleError}
        />
    );
};

export default function Berita() {
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [berita, setBerita] = useState([]);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedNews, setSelectedNews] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        lastPage: 1,
        perPage: 9,
        total: 0,
        from: 0,
        to: 0,
    });

    const fetchBerita = async (page = 1) => {
        setLoading(true);
        try {
            const response = await axios.get("/api/berita", {
                params: {
                    per_page: pagination.perPage,
                    page: page,
                },
            });
            setBerita(response.data.berita || []);
            setPagination(response.data.pagination);
        } catch (error) {
            setError(error);
            console.error("Error Fetching berita:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBerita(1);
    }, []);

    // Function to increment read count for a berita by slug
    const incrementReadCount = async (slug) => {
        try {
            await axios.post(`/api/berita/${slug}/increment-read`);
            // Optionally update local state to reflect increment
            setBerita((prevBerita) =>
                prevBerita.map((news) =>
                    news.slug === slug
                        ? { ...news, read_count: (news.read_count || 0) + 1 }
                        : news,
                ),
            );
        } catch (error) {
            console.error("Failed to increment read count:", error);
        }
    };

    // Filter berita based on searchQuery
    const filteredBerita = berita.filter((news) => {
        if (!searchQuery) return true; // If no search query, return all news

        const contentText = news.content_json
            ? generateExcerpt(news.content_json, 1000)
            : news.isi || "";

        const matchesSearch =
            news.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contentText.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    const openModal = (news) => {
        setSelectedNews(news);
        setModalOpen(true);
    };
    const closeModal = () => {
        setModalOpen(false);
        setSelectedNews(null);
    };

    if (loading) {
        return (
            <HomeLayout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-gray-700">
                    Memuat berita...
                </div>
            </HomeLayout>
        );
    }

    if (error) {
        return (
            <HomeLayout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-red-600">
                    Terjadi kesalahan saat memuat berita.
                </div>
            </HomeLayout>
        );
    }

    return (
        <>
            <Head title="Berita" />
            <HomeLayout>
                {/* Hero Section */}
                <section className="bg-grid-ink">
                    <div className="container mx-auto px-4 pb-28 pt-16 sm:px-6 sm:pt-20">
                        <div className="eyebrow !text-brand-300">
                            PLN UPT Karawang
                        </div>
                        <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-[1.1] text-white sm:text-5xl lg:text-6xl">
                            Berita <span className="text-volt">terkini</span>
                        </h1>
                        <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                            Informasi terbaru seputar PLN UPT Karawang dan
                            perkembangan industri kelistrikan.
                        </p>
                    </div>
                </section>

                {/* Search and Filter Section */}
                <div className="container relative z-20 mx-auto -mt-9 px-4 sm:px-6">
                    <div className="relative max-w-3xl rounded-2xl border border-slate-200/80 bg-white p-2 shadow-lift">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-6">
                            <FaSearch className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full rounded-xl border-0 bg-transparent py-3.5 pl-12 pr-4 text-[15px] text-ink-900 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500/30"
                            placeholder="Cari berita atau informasi..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                // Reset to page 1 when searching
                                if (pagination.current_page !== 1) {
                                    fetchBerita(1);
                                }
                            }}
                            aria-label="Cari berita"
                        />
                    </div>
                </div>

                {/* News Grid */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="mb-12">
                        <div className="eyebrow">Arsip</div>
                        <h2 className="mt-3 text-2xl font-extrabold text-ink-900 sm:text-3xl">
                            Informasi terbaru
                        </h2>
                    </div>

                    {filteredBerita.length === 0 ? (
                        <div className="text-center py-16 bg-gray-50 rounded-2xl">
                            <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-gray-100 rounded-full">
                                <FaSearch className="h-6 w-6 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                Tidak ada berita yang sesuai
                            </h3>
                            <p className="text-gray-500">
                                Coba gunakan kata kunci pencarian yang berbeda
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredBerita.map((news) => (
                                <article
                                    key={news.id}
                                    className="group bg-white rounded-2xl shadow-soft hover:shadow-lift transition duration-300 overflow-hidden border border-slate-200/80 flex flex-col h-full hover:-translate-y-0.5"
                                >
                                    {/* Image Container */}
                                    <div className="relative h-64 overflow-hidden">
                                        <div
                                            className="absolute inset-0 bg-gray-200 animate-pulse"
                                            style={{ display: "none" }}
                                        />
                                        <NewsImage
                                            src={(() => {
                                                try {
                                                    if (news.gambar) {
                                                        const parsed =
                                                            JSON.parse(
                                                                news.gambar,
                                                            );
                                                        return parsed.length > 0
                                                            ? `/storage/berita/${parsed[0]}`
                                                            : null;
                                                    }
                                                    return null;
                                                } catch {
                                                    // `gambar` bisa berupa nama file polos (bukan JSON).
                                                    return `/storage/berita/${news.gambar}`;
                                                }
                                            })()}
                                            alt={news.judul}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                                        />

                                        {/* Overlay Gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                        {/* Date Badge */}
                                        <div className="absolute top-4 left-4">
                                            <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg flex flex-col items-center border border-blue-50">
                                                <span className="text-2xl font-bold text-blue-600 leading-none">
                                                    {format(
                                                        new Date(
                                                            news.created_at,
                                                        ),
                                                        "d",
                                                    )}
                                                </span>
                                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                                    {format(
                                                        new Date(
                                                            news.created_at,
                                                        ),
                                                        "MMM",
                                                        { locale: id },
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Read Button Overlay */}
                                        <button
                                            onClick={() => {
                                                incrementReadCount(news.slug);
                                                window.location.href = route(
                                                    "berita.detail",
                                                    news.slug,
                                                );
                                            }}
                                            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer focus:outline-none"
                                        >
                                            <span className="bg-white/20 backdrop-blur-md border border-white/50 text-white px-6 py-2 rounded-full font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 hover:bg-white hover:text-blue-600">
                                                Baca Selengkapnya
                                            </span>
                                        </button>
                                    </div>

                                    {/* Content Container */}
                                    <div className="p-6 flex flex-col flex-grow relative">
                                        {/* Decorative Element */}
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-12 -mt-12 opacity-50 transition-opacity group-hover:opacity-100" />

                                        <div className="mb-4 relative z-10">
                                            <div className="flex items-center space-x-2 text-xs text-gray-500 mb-3">
                                                <span className="flex items-center bg-blue-50 text-blue-600 px-2 py-1 rounded-md font-medium">
                                                    <FaUser className="mr-1.5 h-3 w-3" />
                                                    {news.user.name}
                                                </span>
                                                <span className="flex items-center bg-gray-50 text-gray-500 px-2 py-1 rounded-md">
                                                    <FaEye className="mr-1.5 h-3 w-3" />
                                                    {news.read_count || 0}
                                                </span>
                                            </div>

                                            <h3 className="text-xl font-bold text-gray-900 mb-1 leading-snug group-hover:text-blue-600 transition-colors duration-300">
                                                <button
                                                    type="button"
                                                    className="text-left w-full focus:outline-none"
                                                    onClick={() => {
                                                        incrementReadCount(
                                                            news.slug,
                                                        );
                                                        window.location.href =
                                                            route(
                                                                "berita.detail",
                                                                news.slug,
                                                            );
                                                    }}
                                                >
                                                    <span className="line-clamp-2">
                                                        {news.judul}
                                                    </span>
                                                </button>
                                            </h3>
                                            <p className="text-gray-600 text-sm mb-5 line-clamp-3">
                                                {news.excerpt}
                                            </p>

                                            <div
                                                className="text-gray-500 text-sm line-clamp-3 leading-relaxed"
                                                dangerouslySetInnerHTML={{
                                                    __html: news.content_json
                                                        ? generateExcerpt(
                                                              news.content_json,
                                                              150,
                                                          )
                                                        : news.excerpt ||
                                                          news.isi,
                                                }}
                                            />
                                        </div>

                                        {/* Footer / Action */}
                                        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                                            <span className="text-xs text-gray-400 font-medium">
                                                {format(
                                                    new Date(news.created_at),
                                                    "EEEE, d MMMM yyyy",
                                                    { locale: id },
                                                )}
                                            </span>
                                            <button
                                                onClick={() => {
                                                    incrementReadCount(
                                                        news.slug,
                                                    );
                                                    window.location.href =
                                                        route(
                                                            "berita.detail",
                                                            news.slug,
                                                        );
                                                }}
                                                className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center group/btn"
                                            >
                                                Lihat Detail
                                                <FaChevronRight className="ml-1 h-3 w-3 transform group-hover/btn:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {filteredBerita.length > 0 && (
                        <div className="flex flex-col items-center mt-16 space-y-4">
                            <div className="text-sm text-gray-500">
                                Menampilkan halaman {pagination.current_page}{" "}
                                dari {pagination.last_page}
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() =>
                                        fetchBerita(pagination.current_page - 1)
                                    }
                                    disabled={pagination.current_page <= 1}
                                    className={`flex items-center px-4 py-2 rounded-full border ${pagination.current_page <= 1 ? "border-gray-200 text-gray-300 cursor-not-allowed" : "border-blue-500 text-blue-600 hover:bg-blue-50"}`}
                                >
                                    <FaChevronRight className="mr-1 h-3 w-3 transform rotate-180" />
                                    <span>Sebelumnya</span>
                                </button>

                                <div className="hidden md:flex space-x-1">
                                    {[
                                        ...Array(pagination.last_page).keys(),
                                    ].map((page) => (
                                        <button
                                            key={page + 1}
                                            onClick={() =>
                                                fetchBerita(page + 1)
                                            }
                                            className={`w-10 h-10 flex items-center justify-center rounded-full ${pagination.current_page === page + 1 ? "bg-blue-600 text-white font-medium" : "text-gray-700 hover:bg-gray-100"}`}
                                        >
                                            {page + 1}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() =>
                                        fetchBerita(pagination.current_page + 1)
                                    }
                                    disabled={
                                        pagination.current_page >=
                                        pagination.last_page
                                    }
                                    className={`flex items-center px-4 py-2 rounded-full border ${pagination.current_page >= pagination.last_page ? "border-gray-200 text-gray-300 cursor-not-allowed" : "border-blue-500 text-blue-600 hover:bg-blue-50"}`}
                                >
                                    <span>Selanjutnya</span>
                                    <FaChevronRight className="ml-1 h-3 w-3" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </HomeLayout>
        </>
    );
}
