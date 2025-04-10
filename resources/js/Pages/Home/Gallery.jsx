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

export default function Gallery() {
    const { auth } = usePage().props;

    // State untuk filter dan lightbox
    const [activeCategory, setActiveCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState(null);
    const [loaded, setLoaded] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    // Data kategori
    const categories = [
        { id: "all", name: "Semua" },
        { id: "csr", name: "CSR" },
        { id: "training", name: "Pelatihan" },
        { id: "ceremony", name: "Seremonial" },
        { id: "visit", name: "Kunjungan" },
        { id: "meeting", name: "Rapat" },
    ];

    // Data gallery dengan gambar yang pasti muncul
    const galleryItems = [
        {
            id: 1,
            title: "Presentasi Program Kerja PLN",
            category: "meeting",
            date: "15 November 2023",
            location: "Aula Utama PLN",
            image: "https://images.unsplash.com/photo-1573167507387-6b4b98cb7c13?q=80&w=2069",
            description:
                "Presentasi program kerja tahunan oleh manajer divisi pengembangan.",
        },
        {
            id: 2,
            title: "Pelatihan Teknisi Listrik",
            category: "training",
            date: "10 November 2023",
            location: "Pusat Pelatihan PLN",
            image: "https://images.unsplash.com/photo-1581092921461-7d65ca45393a?q=80&w=2070",
            description:
                "Pelatihan keterampilan teknis kelistrikan untuk staf baru.",
        },
        {
            id: 3,
            title: "Peresmian PLTS Atap",
            category: "ceremony",
            date: "5 November 2023",
            location: "Gedung Utama PLN",
            image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=2072",
            description:
                "Peresmian instalasi panel surya di atap gedung perkantoran.",
        },
        {
            id: 4,
            title: "Diskusi Panel Energi Terbarukan",
            category: "meeting",
            date: "1 November 2023",
            location: "Ruang Konferensi PLN",
            image: "https://images.unsplash.com/photo-1558403194-611308249627?q=80&w=2070",
            description:
                "Diskusi panel tentang masa depan energi terbarukan di Indonesia.",
        },
        {
            id: 5,
            title: "Rapat Koordinasi Triwulan",
            category: "meeting",
            date: "28 Oktober 2023",
            location: "Ruang Rapat Utama",
            image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070",
            description: "Rapat koordinasi untuk evaluasi kinerja triwulan IV.",
        },
        {
            id: 6,
            title: "Bantuan Listrik untuk Sekolah",
            category: "csr",
            date: "25 Oktober 2023",
            location: "SDN Sukamaju",
            image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022",
            description:
                "Program elektrifikasi untuk sekolah di daerah terpencil.",
        },
        {
            id: 7,
            title: "Workshop Energi Terbarukan",
            category: "training",
            date: "20 Oktober 2023",
            location: "Aula Serbaguna PLN",
            image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2070",
            description:
                "Workshop tentang perkembangan teknologi energi terbarukan.",
        },
        {
            id: 8,
            title: "Penandatanganan MoU",
            category: "ceremony",
            date: "15 Oktober 2023",
            location: "Balai Kota",
            image: "https://images.unsplash.com/photo-1560439514-4e9645039924?q=80&w=2070",
            description:
                "Penandatanganan nota kesepahaman untuk program elektrifikasi.",
        },
        {
            id: 9,
            title: "Seminar Kelistrikan Nasional",
            category: "training",
            date: "10 Oktober 2023",
            location: "Hotel Grand Mercure",
            image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=2070",
            description:
                "Seminar nasional tentang perkembangan teknologi kelistrikan.",
        },
        {
            id: 10,
            title: "Kunjungan ke PLTA",
            category: "visit",
            date: "5 Oktober 2023",
            location: "PLTA Cirata",
            image: "https://images.unsplash.com/photo-1591448764624-d7973a442bff?q=80&w=2070",
            description: "Kunjungan inspeksi dan evaluasi operasional PLTA.",
        },
        {
            id: 11,
            title: "Penanaman Pohon",
            category: "csr",
            date: "1 Oktober 2023",
            location: "Taman Nasional",
            image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2013",
            description:
                "Program CSR penanaman pohon untuk pelestarian lingkungan.",
        },
        {
            id: 12,
            title: "Rapat Direksi",
            category: "meeting",
            date: "25 September 2023",
            location: "Ruang Rapat Eksekutif",
            image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070",
            description: "Rapat direksi untuk membahas strategi perusahaan.",
        },
    ];

    // Efek untuk menandai bahwa gallery sudah dimuat
    useEffect(() => {
        // Simulasi loading
        const timer = setTimeout(() => {
            setLoaded(true);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    // Filter gallery berdasarkan kategori dan pencarian
    const filteredGallery = galleryItems.filter((item) => {
        const matchCategory =
            activeCategory === "all" || item.category === activeCategory;
        const matchSearch =
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCategory && matchSearch;
    });

    // Fungsi untuk membuka lightbox
    const openLightbox = (item) => {
        setCurrentImage(item);
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
        const currentIndex = galleryItems.findIndex(
            (item) => item.id === currentImage.id
        );
        let newIndex;

        if (direction === "next") {
            newIndex = (currentIndex + 1) % galleryItems.length;
        } else {
            newIndex =
                (currentIndex - 1 + galleryItems.length) % galleryItems.length;
        }

        setCurrentImage(galleryItems[newIndex]);
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
                        {filteredGallery.length > 0 ? (
                            <div
                                className={`gallery-grid ${
                                    loaded ? "opacity-100" : "opacity-0"
                                } transition-opacity duration-500`}
                            >
                                {filteredGallery.map((item) => (
                                    <div key={item.id} className="gallery-item">
                                        <div
                                            className="rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group h-full relative cursor-pointer"
                                            onClick={() => openLightbox(item)}
                                        >
                                            <div className="aspect-w-1 aspect-h-1 w-full">
                                                <img
                                                    src={item.image}
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
                                                        {item.title}
                                                    </h3>
                                                    <div className="flex items-center text-xs text-gray-300 mb-3">
                                                        <FaCalendarAlt className="h-3 w-3 mr-1 text-blue-300" />
                                                        <span>{item.date}</span>
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
                {lightboxOpen && currentImage && (
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
                                        src={currentImage.image}
                                        alt={currentImage.title}
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
                                        {currentImage.title}
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        {currentImage.description}
                                    </p>
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                        <div className="flex items-center">
                                            <FaCalendarAlt className="h-4 w-4 mr-2 text-blue-500" />
                                            <span>{currentImage.date}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <FaMapMarkerAlt className="h-4 w-4 mr-2 text-blue-500" />
                                            <span>{currentImage.location}</span>
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
