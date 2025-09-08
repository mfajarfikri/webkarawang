import React, { useState, useEffect, useRef } from "react";
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
    FaFilter,
    FaHeart,
    FaRegHeart,
    FaUndo,
    FaChevronUp,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function Gallery() {
    const { auth } = usePage().props;
    const filterRef = useRef(null);

    // State untuk filter dan lightbox
    const [activeCategory, setActiveCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isScrolled, setIsScrolled] = useState(false);
    const [error, setError] = useState(null);
    const [berita, setBerita] = useState([]);
    const [allImages, setAllImages] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState("grid"); // grid, masonry, list

    // Load saved favorites from localStorage on component mount
    useEffect(() => {
        const savedFavorites = localStorage.getItem("gallery_favorites");
        if (savedFavorites) {
            setFavorites(JSON.parse(savedFavorites));
        }
    }, []);

    // Save favorites to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem("gallery_favorites", JSON.stringify(favorites));
    }, [favorites]);

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
                            id: `${item.id}-${img}`, // Create unique ID for each image
                        });
                    });
                });
                setAllImages(images);

                // Simulate loading for smoother transitions
                setTimeout(() => {
                    setLoading(false);
                }, 800);
            } catch (error) {
                setError(error);
                console.error("Error Fetching berita:", error);
                setLoading(false);
            }
        };

        fetchBerita();

        // Load saved view mode preference from localStorage
        const savedViewMode = localStorage.getItem("gallery_view_mode");
        if (
            savedViewMode &&
            ["grid", "masonry", "list"].includes(savedViewMode)
        ) {
            setViewMode(savedViewMode);
        }
    }, []);

    // Data kategori dengan ikon dan warna
    const categories = [
        { id: "all", name: "Semua", color: "blue" },
        { id: "csr", name: "CSR", color: "green" },
        { id: "training", name: "Pelatihan", color: "blue" },
        { id: "ceremony", name: "Seremonial", color: "purple" },
        { id: "visit", name: "Kunjungan", color: "amber" },
        { id: "meeting", name: "Rapat", color: "gray" },
    ];

    // Toggle favorite status for an image
    const toggleFavorite = (imageId) => {
        setFavorites((prev) => {
            if (prev.includes(imageId)) {
                return prev.filter((id) => id !== imageId);
            } else {
                return [...prev, imageId];
            }
        });
    };

    // Check if an image is favorited
    const isFavorited = (imageId) => {
        return favorites.includes(imageId);
    };

    // Toggle filter visibility on mobile
    const toggleFilters = () => {
        setShowFilters((prev) => !prev);
    };

    // Change view mode (grid, masonry, list)
    const changeViewMode = (mode) => {
        setViewMode(mode);
        // Save view mode preference to localStorage
        localStorage.setItem("gallery_view_mode", mode);
    };

    // Filter gallery berdasarkan kategori, pencarian, dan favorit
    const filteredImages = allImages.filter((item) => {
        // Filter by category
        const matchCategory =
            activeCategory === "all" || activeCategory === "favorites"
                ? true
                : item.category === activeCategory;

        // Filter by search query
        const matchSearch =
            searchQuery === "" ||
            item.judul?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.isi?.toLowerCase().includes(searchQuery.toLowerCase());

        // Filter by favorites if favorites category is selected
        const matchFavorites =
            activeCategory !== "favorites" || isFavorited(item.id);

        return matchCategory && matchSearch && matchFavorites;
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

    // Fungsi untuk scroll ke atas halaman
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <>
            <Head title="Gallery" />

            <HomeLayout auth={auth}>
                {/* Hero Section dengan animasi modern */}
                <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white">
                    {/* Background pattern dengan animasi */}
                    <div className="absolute inset-0 opacity-10">
                        <div
                            className="absolute inset-0 bg-grid-white/[0.2] animate-pulse-slow"
                            style={{
                                backgroundImage:
                                    "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFF' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                            }}
                        ></div>
                    </div>

                    {/* Floating elements for modern look */}
                    <div className="absolute inset-0 overflow-hidden">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className={`absolute rounded-full bg-blue-${
                                    300 + i * 100
                                } opacity-${10 + i * 5} animate-float-${i + 1}`}
                                style={{
                                    width: `${20 + i * 15}px`,
                                    height: `${20 + i * 15}px`,
                                    top: `${10 + i * 15}%`,
                                    left: `${5 + i * 15}%`,
                                    animationDelay: `${i * 0.5}s`,
                                    animationDuration: `${8 + i * 2}s`,
                                }}
                            ></div>
                        ))}
                    </div>

                    {/* Content with animations */}
                    <div className="container relative z-10 mx-auto px-6 py-32">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="flex flex-col items-center"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                className="mb-6 rounded-full bg-blue-600/30 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-blue-100 border border-blue-500/20 shadow-glow-blue"
                            >
                                Dokumentasi Perusahaan
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                                className="mb-6 text-center font-sans text-5xl font-bold tracking-tight text-white md:text-6xl"
                            >
                                Galeri{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                                    Kegiatan
                                </span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7, duration: 0.8 }}
                                className="max-w-2xl text-center text-lg text-slate-300 md:text-xl"
                            >
                                Dokumentasi visual dari berbagai kegiatan dan
                                program yang telah kami laksanakan di
                                <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-200">
                                    {" "}
                                    PLN UPT Karawang
                                </span>
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.9, duration: 0.8 }}
                                className="mt-10 flex items-center gap-4"
                            >
                                <div className="h-px w-16 bg-gradient-to-r from-transparent to-blue-500"></div>
                                <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse"></div>
                                <div className="h-px w-16 bg-gradient-to-l from-transparent to-blue-500"></div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>

                {/* Filter dan Search dengan animasi dan tampilan modern */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1, duration: 0.5 }}
                    className={`${
                        isScrolled
                            ? "bg-white/10 backdrop-blur-xl py-6 sticky top-[5rem] z-10 shadow-lg border-b border-white/10"
                            : "bg-white py-6 sticky top-[5rem] z-10 shadow-lg"
                    }`}
                >
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            {/* Mobile filter toggle */}
                            <div className="md:hidden w-full flex justify-between items-center mb-4">
                                <button
                                    onClick={toggleFilters}
                                    className="flex items-center space-x-2 bg-blue-500/10 text-blue-600 px-4 py-2 rounded-lg border border-blue-200/30"
                                >
                                    <FaFilter className="h-4 w-4" />
                                    <span>Filter</span>
                                    {showFilters ? (
                                        <FaChevronLeft className="h-3 w-3 ml-2" />
                                    ) : (
                                        <FaChevronRight className="h-3 w-3 ml-2" />
                                    )}
                                </button>

                                {/* View mode toggles */}
                                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                                    <button
                                        onClick={() => changeViewMode("grid")}
                                        className={`p-2 rounded ${
                                            viewMode === "grid"
                                                ? "bg-white shadow-sm"
                                                : "text-gray-500"
                                        }`}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                                            />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() =>
                                            changeViewMode("masonry")
                                        }
                                        className={`p-2 rounded ${
                                            viewMode === "masonry"
                                                ? "bg-white shadow-sm"
                                                : "text-gray-500"
                                        }`}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 8a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zm10 0a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Filter Kategori */}
                            <AnimatePresence>
                                <motion.div
                                    ref={filterRef}
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{
                                        height:
                                            showFilters ||
                                            !window.matchMedia(
                                                "(max-width: 768px)"
                                            ).matches
                                                ? "auto"
                                                : 0,
                                        opacity:
                                            showFilters ||
                                            !window.matchMedia(
                                                "(max-width: 768px)"
                                            ).matches
                                                ? 1
                                                : 0,
                                    }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex flex-wrap gap-2 w-full md:w-auto overflow-hidden"
                                >
                                    {/* Favorites filter */}
                                    <button
                                        onClick={() =>
                                            setActiveCategory("favorites")
                                        }
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                                            activeCategory === "favorites"
                                                ? "bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-md"
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }`}
                                    >
                                        {activeCategory === "favorites" ? (
                                            <FaHeart className="h-3.5 w-3.5" />
                                        ) : (
                                            <FaRegHeart className="h-3.5 w-3.5" />
                                        )}
                                        <span>Favorit</span>
                                    </button>

                                    {/* Regular categories */}
                                    {categories.map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() =>
                                                setActiveCategory(category.id)
                                            }
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                                                activeCategory === category.id
                                                    ? `bg-gradient-to-r from-${category.color}-700 to-${category.color}-500 text-white shadow-md`
                                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            }`}
                                        >
                                            {category.name}
                                        </button>
                                    ))}
                                </motion.div>
                            </AnimatePresence>

                            {/* Search and View Mode (Desktop) */}
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                {/* Search */}
                                <div className="relative flex-grow">
                                    <input
                                        type="text"
                                        placeholder="Cari galeri..."
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        className={`w-full pl-10 pr-4 py-2.5 rounded-lg outline-none transition-all duration-300 ${
                                            isScrolled
                                                ? "border border-gray-400/30 bg-white/80 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                                : "border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                        }`}
                                    />
                                    <FaSearch
                                        className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                                            isScrolled
                                                ? "text-blue-500"
                                                : "text-blue-400"
                                        }`}
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery("")}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <FaTimes className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>

                                {/* View mode toggles - Desktop */}
                                <div className="hidden md:flex space-x-1 bg-gray-100 p-1 rounded-lg">
                                    <button
                                        onClick={() => changeViewMode("grid")}
                                        className={`p-2 rounded ${
                                            viewMode === "grid"
                                                ? "bg-white shadow-sm"
                                                : "text-gray-500"
                                        }`}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                                            />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() =>
                                            changeViewMode("masonry")
                                        }
                                        className={`p-2 rounded ${
                                            viewMode === "masonry"
                                                ? "bg-white shadow-sm"
                                                : "text-gray-500"
                                        }`}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 8a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zm10 0a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Gallery Grid dengan animasi dan tampilan modern */}
                <div className="bg-gray-50 py-12">
                    <div className="container mx-auto px-4">
                        {loading ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : filteredImages.length > 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                                className={`${
                                    viewMode === "grid"
                                        ? "gallery-grid"
                                        : "masonry-grid"
                                }`}
                            >
                                {filteredImages.map((item, index) => (
                                    <motion.div
                                        key={`${item.id}-${index}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            delay: index * 0.05,
                                            duration: 0.3,
                                        }}
                                        whileHover={{ y: -5 }}
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

                                            {/* Favorite button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleFavorite(item.id);
                                                }}
                                                className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 transition-all duration-300"
                                            >
                                                {isFavorited(item.id) ? (
                                                    <FaHeart className="h-4 w-4 text-rose-500" />
                                                ) : (
                                                    <FaRegHeart className="h-4 w-4" />
                                                )}
                                            </button>

                                            {/* Overlay yang muncul saat hover dengan animasi */}
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
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="text-center py-16 px-4 bg-white rounded-xl shadow-sm"
                            >
                                <div className="bg-gray-100 inline-block p-4 rounded-full mb-4">
                                    <FaSearch className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-medium text-gray-900 mb-2">
                                    Tidak ada hasil yang ditemukan
                                </h3>
                                <p className="text-gray-600 max-w-md mx-auto mb-6">
                                    Coba ubah filter atau kata kunci pencarian
                                    Anda untuk menemukan galeri yang Anda cari
                                </p>
                                <button
                                    onClick={() => {
                                        setActiveCategory("all");
                                        setSearchQuery("");
                                    }}
                                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <FaChevronLeft className="mr-2 h-3.5 w-3.5" />
                                    Reset Filter
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Lightbox dengan animasi dan tampilan modern */}
                <AnimatePresence>
                    {lightboxOpen && currentImageIndex !== null && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center p-4"
                            onClick={closeLightbox}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                                className="relative w-full max-w-5xl mx-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Close button */}
                                <button
                                    onClick={closeLightbox}
                                    className="absolute -top-12 right-0 text-white/80 hover:text-white bg-black/30 hover:bg-black/50 p-2.5 rounded-full transition-all duration-300"
                                    aria-label="Close lightbox"
                                >
                                    <FaTimes className="h-6 w-6" />
                                </button>

                                {/* Navigation buttons */}
                                <button
                                    onClick={() => navigateLightbox("prev")}
                                    className="absolute left-0 top-1/2 -translate-y-1/2 -ml-12 text-white/80 hover:text-white bg-black/30 hover:bg-black/50 p-3 rounded-full transition-all duration-300 group"
                                    aria-label="Previous image"
                                >
                                    <FaChevronLeft className="h-8 w-8 group-hover:-translate-x-0.5 transition-transform" />
                                </button>
                                <button
                                    onClick={() => navigateLightbox("next")}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 -mr-12 text-white/80 hover:text-white bg-black/30 hover:bg-black/50 p-3 rounded-full transition-all duration-300 group"
                                    aria-label="Next image"
                                >
                                    <FaChevronRight className="h-8 w-8 group-hover:translate-x-0.5 transition-transform" />
                                </button>

                                {/* Image and content container */}
                                <div className="bg-white rounded-xl overflow-hidden shadow-2xl">
                                    {/* Image container with loading state */}
                                    <div className="relative">
                                        <motion.img
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.5 }}
                                            loading="eager"
                                            src={`/storage/berita/${filteredImages[currentImageIndex].image}`}
                                            alt={
                                                filteredImages[
                                                    currentImageIndex
                                                ].title
                                            }
                                            className="w-full h-auto max-h-[70vh] object-contain"
                                        />

                                        {/* Category badge */}
                                        <div className="absolute top-4 left-4">
                                            <span
                                                className={`inline-block px-3 py-1.5 rounded-lg text-sm font-medium ${
                                                    filteredImages[
                                                        currentImageIndex
                                                    ].category === "csr"
                                                        ? "bg-green-500/90"
                                                        : filteredImages[
                                                              currentImageIndex
                                                          ].category ===
                                                          "training"
                                                        ? "bg-blue-500/90"
                                                        : filteredImages[
                                                              currentImageIndex
                                                          ].category ===
                                                          "ceremony"
                                                        ? "bg-purple-500/90"
                                                        : filteredImages[
                                                              currentImageIndex
                                                          ].category === "visit"
                                                        ? "bg-amber-500/90"
                                                        : "bg-gray-500/90"
                                                } text-white backdrop-blur-sm`}
                                            >
                                                {categories.find(
                                                    (c) =>
                                                        c.id ===
                                                        filteredImages[
                                                            currentImageIndex
                                                        ].category
                                                )?.name || "Lainnya"}
                                            </span>
                                        </div>

                                        {/* Favorite button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFavorite(
                                                    filteredImages[
                                                        currentImageIndex
                                                    ].id
                                                );
                                            }}
                                            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 transition-all duration-300"
                                        >
                                            {isFavorited(
                                                filteredImages[
                                                    currentImageIndex
                                                ].id
                                            ) ? (
                                                <FaHeart className="h-5 w-5 text-rose-500" />
                                            ) : (
                                                <FaRegHeart className="h-5 w-5" />
                                            )}
                                        </button>

                                        {/* Image counter */}
                                        <div className="absolute bottom-4 left-4 bg-black/50 text-white text-sm px-3 py-1.5 rounded-lg backdrop-blur-sm">
                                            {currentImageIndex + 1} /{" "}
                                            {filteredImages.length}
                                        </div>

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
                                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                    {
                                                        filteredImages[
                                                            currentImageIndex
                                                        ].judul
                                                    }
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                                                    <span className="inline-flex items-center">
                                                        <FaCalendarAlt className="mr-1.5 h-3.5 w-3.5 text-blue-500" />
                                                        {format(
                                                            new Date(
                                                                filteredImages[
                                                                    currentImageIndex
                                                                ].created_at
                                                            ),
                                                            "dd MMMM yyyy",
                                                            { locale: id }
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex space-x-2 self-end md:self-start">
                                                <button
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 border border-gray-200"
                                                    aria-label="Download image"
                                                >
                                                    <FaDownload className="h-4 w-4" />
                                                    <span className="text-sm font-medium">
                                                        Download
                                                    </span>
                                                </button>
                                                <button
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 border border-gray-200"
                                                    aria-label="Share image"
                                                >
                                                    <FaShare className="h-4 w-4" />
                                                    <span className="text-sm font-medium">
                                                        Bagikan
                                                    </span>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                            <p className="text-gray-600">
                                                {filteredImages[
                                                    currentImageIndex
                                                ].isi ||
                                                    "Tidak ada deskripsi untuk gambar ini."}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <div className="text-gray-500 mb-1">
                                                    Kategori
                                                </div>
                                                <div className="font-medium">
                                                    {categories.find(
                                                        (c) =>
                                                            c.id ===
                                                            filteredImages[
                                                                currentImageIndex
                                                            ].category
                                                    )?.name || "Lainnya"}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-gray-500 mb-1">
                                                    Tanggal
                                                </div>
                                                <div className="font-medium">
                                                    {format(
                                                        new Date(
                                                            filteredImages[
                                                                currentImageIndex
                                                            ].created_at
                                                        ),
                                                        "dd MMMM yyyy",
                                                        { locale: id }
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-gray-500 mb-1">
                                                    ID Berita
                                                </div>
                                                <div className="font-medium">
                                                    {
                                                        filteredImages[
                                                            currentImageIndex
                                                        ].id.split("-")[0]
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Scroll to Top Button */}
                <AnimatePresence>
                    {isScrolled && (
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            onClick={scrollToTop}
                            className="scroll-to-top"
                            aria-label="Scroll to top"
                        >
                            <FaChevronUp />
                        </motion.button>
                    )}
                </AnimatePresence>
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

                /* CSS untuk masonry grid */
                .masonry-grid {
                    column-count: 1;
                    column-gap: 1.5rem;
                }

                @media (min-width: 640px) {
                    .masonry-grid {
                        column-count: 2;
                    }
                }

                @media (min-width: 768px) {
                    .masonry-grid {
                        column-count: 3;
                    }
                }

                @media (min-width: 1024px) {
                    .masonry-grid {
                        column-count: 4;
                    }
                }

                .masonry-grid .gallery-item {
                    break-inside: avoid;
                    margin-bottom: 1.5rem;
                }

                .gallery-item {
                    break-inside: avoid;
                    position: relative;
                    transform: translateZ(
                        0
                    ); /* Untuk performa animasi yang lebih baik */
                    will-change: transform; /* Untuk performa animasi yang lebih baik */
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

                /* Tombol scroll to top */
                .scroll-to-top {
                    position: fixed;
                    bottom: 2rem;
                    right: 2rem;
                    background-color: rgba(59, 130, 246, 0.8);
                    color: white;
                    width: 3rem;
                    height: 3rem;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    z-index: 40;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
                    backdrop-filter: blur(4px);
                }

                .scroll-to-top:hover {
                    background-color: rgba(37, 99, 235, 1);
                    transform: translateY(-3px);
                }
            `}</style>
        </>
    );
}
