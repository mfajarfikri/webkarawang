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
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Berita() {
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [berita, setBerita] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBerita = async () => {
            try {
                const response = await axios.get("/api/berita");
                setBerita(response.data.berita || []);
            } catch (error) {
                setError(error);
                console.error("Error Fetching berita:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBerita();
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
                        : news
                )
            );
        } catch (error) {
            console.error("Failed to increment read count:", error);
        }
    };

    // Filter berita based on activeCategory and searchQuery
    const filteredBerita = berita.filter((news) => {
        const matchesSearch =
            news.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
            news.isi.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

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
                <div className="relative bg-blue-900 overflow-hidden">
                    <div className="absolute inset-0">
                        <img
                            src={`/img/heroBerita.jpg`}
                            alt="Hero Background"
                            className="w-full h-full object-cover object-center"
                            loading="eager"
                            fetchpriority="high"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/50"></div>
                    </div>
                    <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl drop-shadow-lg">
                                Berita Terkini
                            </h1>
                            <p className="mt-6 max-w-3xl mx-auto text-2xl text-blue-200 drop-shadow-md">
                                Temukan informasi terbaru seputar PLN UPT
                                Karawang dan perkembangan industri kelistrikan
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search and Filter Section */}
                <div className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
                            <div className="relative flex-1 mb-4 md:mb-0">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaSearch className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Cari berita..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    aria-label="Cari berita"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* News Grid */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {filteredBerita.length === 0 ? (
                        <div className="text-center text-gray-500">
                            Tidak ada berita yang sesuai.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredBerita.map((news) => (
                                <article
                                    key={news.id}
                                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
                                >
                                    <div className="relative h-48 overflow-hidden">
                                        {news.gambar &&
                                        JSON.parse(news.gambar).length > 0 ? (
                                            <img
                                                loading="lazy"
                                                src={`/storage/berita/${
                                                    JSON.parse(news.gambar)[0]
                                                }`}
                                                alt={news.judul}
                                                className="w-full h-48 object-cover rounded hover:scale-110 transition-all duration-500"
                                            />
                                        ) : (
                                            ""
                                        )}
                                    </div>
                                    <div className="p-6">
                                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4 space-x-4">
                                            <div className="flex items-baseline space-x-1">
                                                <FaCalendarAlt className="h-2 w-2" />
                                                <span className="text-xs">
                                                    {format(
                                                        new Date(
                                                            news.created_at
                                                        ),
                                                        "d MMM yyyy",
                                                        {
                                                            locale: id,
                                                        }
                                                    )}
                                                </span>
                                            </div>{" "}
                                        </div>
                                        <h3 className="text-xl line-clamp-2 font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-200">
                                            <Link
                                                href={route(
                                                    "berita.detail",
                                                    news.slug
                                                )}
                                                onClick={() =>
                                                    incrementReadCount(
                                                        news.slug
                                                    )
                                                }
                                            >
                                                {news.judul}
                                            </Link>
                                        </h3>
                                        <p
                                            className="text-gray-600 mb-4 line-clamp-2"
                                            dangerouslySetInnerHTML={{
                                                __html: news.excerpt,
                                            }}
                                        />
                                        <div className="flex justify-between items-center text-sm text-gray-500 space-x-4">
                                            <div className="text-xs">
                                                {news.user.name}
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center space-x-1">
                                                    <FaEye className="text-gray-300" />
                                                    <span className="text-gray-400 text-xs">
                                                        dilihat{" "}
                                                        {news.read_count || 0}{" "}
                                                        kali
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </HomeLayout>
        </>
    );
}
