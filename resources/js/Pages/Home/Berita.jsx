import HomeLayout from "@/Layouts/HomeLayout";
import { Head } from "@inertiajs/react";
import { useState } from "react";
import {
    FaCalendarAlt,
    FaUser,
    FaSearch,
    FaFilter,
    FaChevronRight,
} from "react-icons/fa";

export default function Berita() {
    const [activeCategory, setActiveCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Data kategori berita
    const categories = [
        { id: "all", name: "Semua" },
        { id: "company", name: "Perusahaan" },
        { id: "technology", name: "Teknologi" },
        { id: "innovation", name: "Inovasi" },
        { id: "community", name: "Komunitas" },
    ];

    // Data dummy berita (nanti bisa diganti dengan data dari backend)
    const newsItems = [
        {
            id: 1,
            title: "PLN UPT Karawang Berhasil Tingkatkan Keandalan Sistem Transmisi",
            excerpt:
                "PLN UPT Karawang mencatat prestasi gemilang dalam peningkatan keandalan sistem transmisi listrik melalui program pemeliharaan preventif.",
            category: "technology",
            image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=2070",
            date: "20 Maret 2024",
            author: "Tim Redaksi",
        },
        // ... tambahkan berita lainnya
    ];

    return (
        <>
            <Head title="Berita" />
            <HomeLayout>
                {/* Hero Section */}
                <div className="relative bg-blue-900 overflow-hidden">
                    <div className="absolute inset-0">
                        <img
                            src="https://images.unsplash.com/photo-1558403194-611308249627?q=80&w=2070"
                            alt="Hero Background"
                            className="w-full h-full object-cover opacity-20"
                        />
                    </div>
                    <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                                Berita Terkini
                            </h1>
                            <p className="mt-6 max-w-2xl mx-auto text-xl text-blue-100">
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
                                />
                            </div>
                            <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0">
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() =>
                                            setActiveCategory(category.id)
                                        }
                                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                                            activeCategory === category.id
                                                ? "bg-blue-600 text-white"
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        } transition-colors duration-200`}
                                    >
                                        {category.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* News Grid */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {newsItems.map((news) => (
                            <article
                                key={news.id}
                                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
                            >
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={news.image}
                                        alt={news.title}
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-600 text-white">
                                            {
                                                categories.find(
                                                    (c) =>
                                                        c.id === news.category
                                                )?.name
                                            }
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center text-sm text-gray-500 mb-4">
                                        <FaCalendarAlt className="h-4 w-4 mr-2" />
                                        <span>{news.date}</span>
                                        <span className="mx-2">•</span>
                                        <FaUser className="h-4 w-4 mr-2" />
                                        <span>{news.author}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-200">
                                        {news.title}
                                    </h3>
                                    <p className="text-gray-600 mb-4 line-clamp-2">
                                        {news.excerpt}
                                    </p>
                                    <a
                                        href="#"
                                        className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors duration-200"
                                    >
                                        Baca Selengkapnya
                                        <FaChevronRight className="ml-2 h-4 w-4" />
                                    </a>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </HomeLayout>
        </>
    );
}
