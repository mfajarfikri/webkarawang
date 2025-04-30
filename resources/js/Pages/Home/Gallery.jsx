import React, { useState, useEffect } from "react";
import HomeLayout from "@/Layouts/HomeLayout";
import { Head, usePage } from "@inertiajs/react";
import {
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaSearch,
    FaTimes,
    FaChevronLeft,
    FaChevronRight,
    FaDownload,
    FaShare,
    FaEye,
} from "react-icons/fa";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function Gallery() {
    const { auth } = usePage().props;

    // State untuk filter dan lightbox
    const [activeCategory, setActiveCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [error, setError] = useState(null);
    const [berita, setBerita] = useState([]);
    const [allImages, setAllImages] = useState([]);

    useEffect(() => {
        const fetchBerita = async () => {
            try {
                const response = await axios.get("/api/berita");
                const beritaData = response.data.berita || [];
                setBerita(beritaData);

                // Flatten all images from all berita items into a single array with metadata
                const images = [];
                beritaData.forEach((item) => {
                    const gambarArray = JSON.parse(item.gambar);
                    gambarArray.forEach((img) => {
                        images.push({
                            ...item,
                            image: img,
                        });
                    });
                });
                setAllImages(images);
            } catch (error) {
                setError(error);
                console.error("Error Fetching berita:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBerita();
    }, []);

    // Data kategori
    const categories = [
        { id: "all", name: "Semua" },
        { id: "csr", name: "CSR" },
        { id: "training", name: "Pelatihan" },
        { id: "ceremony", name: "Seremonial" },
        { id: "visit", name: "Kunjungan" },
        { id: "meeting", name: "Rapat" },
    ];

    // Efek untuk menandai bahwa gallery sudah dimuat
    useEffect(() => {
        // Simulasi loading
        const timer = setTimeout(() => {
            setLoading(true);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    // Filter gallery berdasarkan kategori dan pencarian
    const filteredImages = allImages.filter((item) => {
        const matchCategory =
            activeCategory === "all" || item.category === activeCategory;
        const matchSearch =
            item.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.isi.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCategory && matchSearch;
    });

    // Fungsi untuk membuka lightbox
    const openLightbox = (index) => {
        setCurrentImageIndex(index);
        setLightboxOpen(true);
        // Disable scroll saat lightbox terbuka
        document.body.style.overflow = "hidden";
    };

    // Fungsi untuk menutup lightbox
    const closeLightbox = () => {
        setLightboxOpen(false);
        // Enable scroll kembali
        document.body.style.overflow = "auto";
    };

    // Navigasi lightbox
    const navigateLightbox = (direction) => {
        if (direction === "next") {
            setCurrentImageIndex(
                (currentImageIndex + 1) % filteredImages.length
            );
        } else {
            setCurrentImageIndex(
                (currentImageIndex - 1 + filteredImages.length) %
                    filteredImages.length
            );
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <>
            <Head title="Gallery" />

            <HomeLayout auth={auth}>
                {/* Hero Section */}
                <div className="relative overflow-hidden bg-slate-900 text-white">
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div
                            className="absolute inset-0 bg-grid-white/[0.2]"
                            style={{
                                backgroundImage:
                                    "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFF' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                            }}
                        ></div>
                    </div>

                    {/* Content */}
                    <div className="container relative z-10 mx-auto px-6 py-32">
                        <div className="flex flex-col items-center">
                            <div className="mb-6 rounded-full bg-blue-600/20 px-4 py-1 text-sm font-medium text-blue-200">
                                Dokumentasi Perusahaan
                            </div>

                            <h1 className="mb-6 text-center font-sans text-5xl font-bold tracking-tight text-white md:text-6xl">
                                Galeri{" "}
                                <span className="text-blue-400">Kegiatan</span>
                            </h1>
                            <p className="max-w-2xl text-center text-lg text-slate-300 md:text-xl">
                                Dokumentasi visual dari berbagai kegiatan dan
                                program yang telah kami laksanakan di
                                <span className="font-semibold text-blue-300">
                                    {" "}
                                    PLN UPT Karawang
                                </span>
                            </p>
                            <div className="mt-10 flex items-center gap-4">
                                <div className="h-px w-12 bg-gradient-to-r from-transparent to-blue-500"></div>
                                <div className="h-1 w-1 rounded-full bg-blue-400"></div>
                                <div className="h-px w-12 bg-gradient-to-l from-transparent to-blue-500"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter dan Search */}
                <div
                    className={`${
                        isScrolled
                            ? "bg-white/10 backdrop-blur-xl py-6 sticky top-[5rem] z-10 shadow-md"
                            : "bg-white py-6 sticky top-[5rem] z-10 shadow-md"
                    }`}
                >
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            {/* Filter Kategori */}
                            <div className="flex flex-wrap gap-2">
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() =>
                                            setActiveCategory(category.id)
                                        }
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                                            activeCategory === category.id
                                                ? "bg-gradient-to-r from-blue-700 to-blue-500 text-white shadow-md"
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }`}
                                    >
                                        {category.name}
                                    </button>
                                ))}
                            </div>

                            {/* Search */}
                            <div className="relative w-full md:w-64">
                                <input
                                    type="text"
                                    placeholder="Cari galeri..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className={`w-full pl-10 pr-4 py-2 rounded-lg outline-none transition-all duration-300 ${
                                        isScrolled
                                            ? "border border-gray-400/30 bg-white/80 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            : "border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    }`}
                                />
                                <FaSearch
                                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                                        isScrolled
                                            ? "text-gray-600"
                                            : "text-gray-400"
                                    }`}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Gallery Grid */}
                <div className="bg-gray-50 py-12">
                    <div className="container mx-auto px-4">
                        {filteredImages.length > 0 ? (
                            <div
                                className={`gallery-grid ${
                                    loading ? "opacity-100" : "opacity-0"
                                } transition-opacity duration-500`}
                            >
                                {filteredImages.map((item, index) => (
                                    <div
                                        key={`${item.id}-${index}`}
                                        className="gallery-item"
                                    >
                                        <div
                                            className="rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group h-full relative cursor-pointer"
                                            onClick={() => openLightbox(index)}
                                        >
                                            <div className="aspect-w-1 aspect-h-1 w-full">
                                                <img
                                                    loading="lazy"
                                                    src={`/storage/berita/${item.image}`}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            </div>

                                            {/* Overlay yang muncul saat hover */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6">
                                                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                                    <div className="flex items-center mb-2">
                                                        <span
                                                            className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                                                                item.category ===
                                                                "csr"
                                                                    ? "bg-green-500 text-white"
                                                                    : item.category ===
                                                                      "training"
                                                                    ? "bg-blue-500 text-white"
                                                                    : item.category ===
                                                                      "ceremony"
                                                                    ? "bg-purple-500 text-white"
                                                                    : item.category ===
                                                                      "visit"
                                                                    ? "bg-amber-500 text-white"
                                                                    : "bg-gray-500 text-white"
                                                            }`}
                                                        >
                                                            {
                                                                categories.find(
                                                                    (cat) =>
                                                                        cat.id ===
                                                                        item.category
                                                                )?.name
                                                            }
                                                        </span>
                                                    </div>
                                                    <h3 className="text-lg font-semibold text-white mb-2">
                                                        {item.judul}
                                                    </h3>
                                                    <div className="flex items-center text-xs text-gray-300 mb-3">
                                                        <FaCalendarAlt className="h-3 w-3 mr-1 text-blue-300" />
                                                        <span>
                                                            {format(
                                                                new Date(
                                                                    item.created_at
                                                                ),
                                                                "dd MMMM yyyy",
                                                                {
                                                                    locale: id,
                                                                }
                                                            )}
                                                        </span>
                                                    </div>
                                                    <button className="inline-flex items-center text-sm text-white bg-blue-600/80 hover:bg-blue-600 px-3 py-1.5 rounded-md transition-colors duration-200">
                                                        <FaEye className="mr-1.5 h-3.5 w-3.5" />
                                                        Lihat Detail
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="bg-gray-100 inline-block p-4 rounded-full mb-4">
                                    <FaSearch className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-medium text-gray-900 mb-2">
                                    Tidak ada hasil yang ditemukan
                                </h3>
                                <p className="text-gray-600">
                                    Coba ubah filter atau kata kunci pencarian
                                    Anda
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Lightbox dengan tampilan modern */}
                {lightboxOpen && currentImageIndex !== null && (
                    <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center p-4">
                        <div className="relative w-full max-w-5xl mx-auto">
                            {/* Close button */}
                            <button
                                onClick={closeLightbox}
                                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
                            >
                                <FaTimes className="h-6 w-6" />
                            </button>

                            {/* Navigation buttons */}
                            <button
                                onClick={() => navigateLightbox("prev")}
                                className="absolute left-0 top-1/2 -translate-y-1/2 -ml-12 text-white hover:text-gray-300 transition-colors"
                            >
                                <FaChevronLeft className="h-8 w-8" />
                            </button>
                            <button
                                onClick={() => navigateLightbox("next")}
                                className="absolute right-0 top-1/2 -translate-y-1/2 -mr-12 text-white hover:text-gray-300 transition-colors"
                            >
                                <FaChevronRight className="h-8 w-8" />
                            </button>

                            {/* Image */}
                            <div className="bg-white rounded-lg overflow-hidden shadow-2xl">
                                <div className="relative">
                                    <img
                                        loading="lazy"
                                        src={`/storage/berita/${filteredImages[currentImageIndex].image}`}
                                        alt={
                                            filteredImages[currentImageIndex]
                                                .title
                                        }
                                        className="w-full h-auto max-h-[70vh] object-contain"
                                    />
                                    <div className="absolute bottom-4 right-4 flex space-x-2">
                                        <button className="bg-white/20 backdrop-blur-sm p-2 rounded-full text-white hover:bg-white/30 transition-colors">
                                            <FaDownload className="h-5 w-5" />
                                        </button>
                                        <button className="bg-white/20 backdrop-blur-sm p-2 rounded-full text-white hover:bg-white/30 transition-colors">
                                            <FaShare className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                        {
                                            filteredImages[currentImageIndex]
                                                .title
                                        }
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        {
                                            filteredImages[currentImageIndex]
                                                .description
                                        }
                                    </p>
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                        <div className="flex items-center">
                                            <FaCalendarAlt className="h-4 w-4 mr-2 text-blue-500" />
                                            <span>
                                                {
                                                    filteredImages[
                                                        currentImageIndex
                                                    ].date
                                                }
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <FaMapMarkerAlt className="h-4 w-4 mr-2 text-blue-500" />
                                            <span>
                                                {
                                                    filteredImages[
                                                        currentImageIndex
                                                    ].location
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </HomeLayout>

            {/* CSS untuk Gallery Grid */}
            <style jsx global>{`
                .gallery-grid {
                    display: grid;
                    grid-template-columns: repeat(1, 1fr);
                    gap: 1rem;
                }

                @media (min-width: 640px) {
                    .gallery-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (min-width: 768px) {
                    .gallery-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }

                @media (min-width: 1024px) {
                    .gallery-grid {
                        grid-template-columns: repeat(4, 1fr);
                    }
                }

                .gallery-item {
                    break-inside: avoid;
                    position: relative;
                }

                /* Aspect ratio polyfill */
                .aspect-w-1 {
                    position: relative;
                    padding-bottom: 100%;
                }

                .aspect-w-1 > img {
                    position: absolute;
                    height: 100%;
                    width: 100%;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    left: 0;
                    object-fit: cover;
                    object-position: center;
                }
            `}</style>
        </>
    );
}
