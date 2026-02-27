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
    FaImage,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
    generateExcerpt,
    edjsParser,
    sanitizeEditorData,
} from "@/utils/editorParser";

export default function Gallery() {
    const { auth } = usePage().props;
    const filterRef = useRef(null);
    const gridRef = useRef(null);
    const closeBtnRef = useRef(null);

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
    const [viewMode, setViewMode] = useState("masonry"); // grid, masonry, list
    const [themes, setThemes] = useState([]);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
    });
    const [loadingMore, setLoadingMore] = useState(false);
    const [isImageError, setIsImageError] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(0);

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

    const fetchThemes = async () => {
        try {
            const response = await axios.get("/api/themes");
            setThemes(response.data.themes || []);
        } catch (error) {
            console.error("Error fetching themes:", error);
        }
    };

    const fetchBerita = async (page = 1, append = false) => {
        try {
            if (append) setLoadingMore(true);
            else setLoading(true);

            const response = await axios.get(
                `/api/berita?page=${page}&per_page=12`,
            );
            const newData = response.data.berita || [];
            const meta = response.data.pagination;

            setPagination({
                current_page: meta.current_page,
                last_page: meta.last_page,
            });

            if (append) {
                setBerita((prev) => [...prev, ...newData]);
            } else {
                setBerita(newData);
            }

            // Process images
            const newImages = [];
            newData.forEach((item) => {
                let gambarArray = [];
                try {
                    if (item.gambar) {
                        const parsed = JSON.parse(item.gambar);
                        gambarArray = Array.isArray(parsed) ? parsed : [parsed];
                    }
                } catch (e) {
                    // Fallback if not valid JSON (e.g. raw string)
                    if (typeof item.gambar === "string") {
                        gambarArray = [item.gambar];
                    }
                }

                if (Array.isArray(gambarArray)) {
                    gambarArray.forEach((img) => {
                        if (img && typeof img === "string") {
                            newImages.push({
                                ...item,
                                image: img,
                                id: `${item.id}-${img}`, // Create unique ID for each image
                            });
                        }
                    });
                }
            });

            if (append) {
                setAllImages((prev) => [...prev, ...newImages]);
                setLoadingMore(false);
            } else {
                setAllImages(newImages);
                // Simulate loading for smoother transitions
                setTimeout(() => {
                    setLoading(false);
                }, 800);
            }
        } catch (error) {
            setError(error);
            console.error("Error Fetching berita:", error);
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchThemes();
        fetchBerita(1);

        // Load saved view mode preference from localStorage
        const savedViewMode = localStorage.getItem("gallery_view_mode");
        if (
            savedViewMode &&
            ["grid", "masonry", "list"].includes(savedViewMode)
        ) {
            setViewMode(savedViewMode);
        }
    }, []);

    const handleLoadMore = () => {
        if (pagination.current_page < pagination.last_page) {
            fetchBerita(pagination.current_page + 1, true);
        }
    };

    // Helper to get color for theme
    const getThemeColor = (index) => {
        const colors = [
            "blue",
            "green",
            "purple",
            "amber",
            "rose",
            "indigo",
            "cyan",
            "teal",
        ];
        return colors[index % colors.length];
    };

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

    // Navigasi keyboard pada grid galeri (roving tabindex sederhana)
    const onItemKeyDown = (index, e) => {
        const max = filteredImages.length;
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openLightbox(index);
            return;
        }
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
            e.preventDefault();
            const next = Math.min(max - 1, index + 1);
            setFocusedIndex(next);
            const buttons = gridRef.current?.querySelectorAll(
                "[data-gallery-item='true']",
            );
            buttons?.[next]?.focus();
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
            e.preventDefault();
            const prev = Math.max(0, index - 1);
            setFocusedIndex(prev);
            const buttons = gridRef.current?.querySelectorAll(
                "[data-gallery-item='true']",
            );
            buttons?.[prev]?.focus();
        }
    };

    // Filter gallery berdasarkan kategori, pencarian, dan favorit
    const filteredImages = allImages.filter((item) => {
        // Filter by category
        const matchCategory =
            activeCategory === "all" || activeCategory === "favorites"
                ? true
                : item.tema?.id === activeCategory;

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
        setIsImageError(false);
        // Disable scroll saat lightbox terbuka
        document.body.style.overflow = "hidden";
    };

    // Fungsi untuk menutup lightbox
    const closeLightbox = () => {
        setLightboxOpen(false);
        setIsImageError(false);
        // Enable scroll kembali
        document.body.style.overflow = "auto";
    };

    // Navigasi lightbox
    const navigateLightbox = (direction) => {
        setIsImageError(false);
        if (direction === "next") {
            setCurrentImageIndex(
                (currentImageIndex + 1) % filteredImages.length,
            );
        } else {
            setCurrentImageIndex(
                (currentImageIndex - 1 + filteredImages.length) %
                    filteredImages.length,
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

    // Keyboard support saat lightbox terbuka
    useEffect(() => {
        if (!lightboxOpen) return;
        closeBtnRef.current?.focus();
        const onKey = (e) => {
            if (e.key === "Escape") {
                e.preventDefault();
                closeLightbox();
            } else if (e.key === "ArrowRight") {
                e.preventDefault();
                navigateLightbox("next");
            } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                navigateLightbox("prev");
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lightboxOpen, currentImageIndex, filteredImages.length]);

    // Helper untuk merender konten berita (support EditorJS & HTML biasa)
    const renderNewsContent = (item) => {
        if (!item) return "Tidak ada deskripsi tersedia.";

        // Coba render dari content_json (EditorJS)
        if (item.content_json && item.content_json !== "null") {
            try {
                let parsed =
                    typeof item.content_json === "string"
                        ? JSON.parse(item.content_json)
                        : item.content_json;

                // Sanitize data
                parsed = sanitizeEditorData(parsed);

                if (parsed && parsed.blocks && Array.isArray(parsed.blocks)) {
                    const htmlArray = edjsParser.parse(parsed);
                    if (Array.isArray(htmlArray)) {
                        return htmlArray.join("");
                    }
                }
            } catch (error) {
                console.error("Error parsing content:", error);
            }
        }

        // Fallback ke isi (HTML) atau excerpt
        return item.isi || item.excerpt || "Tidak ada deskripsi tersedia.";
    };

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
                                                "(max-width: 768px)",
                                            ).matches
                                                ? "auto"
                                                : 0,
                                        opacity:
                                            showFilters ||
                                            !window.matchMedia(
                                                "(max-width: 768px)",
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

                                    {/* All Categories */}
                                    <button
                                        onClick={() => setActiveCategory("all")}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                                            activeCategory === "all"
                                                ? "bg-blue-600 text-white shadow-md"
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }`}
                                    >
                                        Semua
                                    </button>

                                    {themes.map((theme, index) => {
                                        const colorClasses = [
                                            "bg-blue-600",
                                            "bg-green-600",
                                            "bg-purple-600",
                                            "bg-amber-600",
                                            "bg-rose-600",
                                            "bg-indigo-600",
                                            "bg-cyan-600",
                                            "bg-teal-600",
                                        ];
                                        const activeClass =
                                            colorClasses[
                                                index % colorClasses.length
                                            ];

                                        return (
                                            <button
                                                key={theme.id}
                                                onClick={() =>
                                                    setActiveCategory(theme.id)
                                                }
                                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                                                    activeCategory === theme.id
                                                        ? `${activeClass} text-white shadow-md`
                                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                }`}
                                            >
                                                {theme.nama}
                                            </button>
                                        );
                                    })}
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
                            <div
                                className="flex justify-center items-center py-20"
                                role="status"
                                aria-live="polite"
                                aria-busy="true"
                            >
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                                <span className="sr-only">
                                    Memuat galeri...
                                </span>
                            </div>
                        ) : filteredImages.length > 0 ? (
                            <>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                    className={`${
                                        viewMode === "grid"
                                            ? "gallery-grid"
                                            : "masonry-grid"
                                    }`}
                                    role="grid"
                                    aria-label="Galeri foto"
                                    ref={gridRef}
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
                                                className="rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group h-full relative cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                                onClick={() =>
                                                    openLightbox(index)
                                                }
                                                onKeyDown={(e) =>
                                                    onItemKeyDown(index, e)
                                                }
                                                aria-label={`Buka foto ${item.judul || "tanpa judul"}`}
                                                tabIndex={
                                                    index === focusedIndex
                                                        ? 0
                                                        : -1
                                                }
                                                data-gallery-item="true"
                                                role="gridcell"
                                            >
                                                <div className="aspect-w-1 aspect-h-1 w-full">
                                                    <img
                                                        loading="lazy"
                                                        decoding="async"
                                                        src={`/storage/berita/${item.image}`}
                                                        alt={item.title}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                        onError={(e) => {
                                                            e.currentTarget.src =
                                                                "/img/heroBerita.jpg";
                                                            e.currentTarget.alt =
                                                                "Gambar tidak tersedia";
                                                        }}
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
                                                                className={`text-xs font-medium px-2.5 py-0.5 rounded-full text-white ${(() => {
                                                                    const index =
                                                                        themes.findIndex(
                                                                            (
                                                                                t,
                                                                            ) =>
                                                                                t.id ===
                                                                                item
                                                                                    .tema
                                                                                    ?.id,
                                                                        );
                                                                    const classes =
                                                                        [
                                                                            "bg-blue-500",
                                                                            "bg-green-500",
                                                                            "bg-purple-500",
                                                                            "bg-amber-500",
                                                                            "bg-rose-500",
                                                                            "bg-indigo-500",
                                                                            "bg-cyan-500",
                                                                            "bg-teal-500",
                                                                        ];
                                                                    return index >=
                                                                        0
                                                                        ? classes[
                                                                              index %
                                                                                  classes.length
                                                                          ]
                                                                        : "bg-gray-500";
                                                                })()}`}
                                                            >
                                                                {item.tema
                                                                    ?.nama ||
                                                                    "Berita"}
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
                                                                        item.created_at,
                                                                    ),
                                                                    "dd MMMM yyyy",
                                                                    {
                                                                        locale: id,
                                                                    },
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

                                {pagination.current_page <
                                    pagination.last_page && (
                                    <div className="flex justify-center mt-12">
                                        <button
                                            onClick={handleLoadMore}
                                            disabled={loadingMore}
                                            className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-full shadow-sm hover:bg-gray-50 hover:shadow-md transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loadingMore ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent"></div>
                                                    <span>Memuat...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FaDownload className="h-4 w-4" />
                                                    <span>
                                                        Muat Lebih Banyak
                                                    </span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </>
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
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-0 md:p-4"
                            onClick={closeLightbox}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="lightbox-title"
                            aria-describedby="lightbox-desc"
                        >
                            {/* Close button - Fixed top right */}
                            <button
                                onClick={closeLightbox}
                                className="absolute top-4 right-4 z-50 p-2 text-white/70 hover:text-white bg-black/20 hover:bg-white/10 rounded-full transition-all duration-200"
                                ref={closeBtnRef}
                                aria-label="Tutup galeri"
                            >
                                <FaTimes className="w-6 h-6" />
                            </button>

                            {/* Navigation Buttons - Fixed sides for desktop */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigateLightbox("prev");
                                }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 text-white/70 hover:text-white bg-black/20 hover:bg-white/10 rounded-full transition-all duration-200 hidden md:flex"
                            >
                                <FaChevronLeft className="w-8 h-8" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigateLightbox("next");
                                }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 text-white/70 hover:text-white bg-black/20 hover:bg-white/10 rounded-full transition-all duration-200 hidden md:flex"
                            >
                                <FaChevronRight className="w-8 h-8" />
                            </button>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                transition={{
                                    duration: 0.3,
                                    type: "spring",
                                    damping: 25,
                                    stiffness: 300,
                                }}
                                className="bg-white/50 backdrop-blur-xl w-full max-w-7xl max-h-[100vh] md:max-h-[90vh] md:rounded-2xl overflow-hidden shadow-2xl flex flex-col lg:flex-row"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Image Section */}
                                <div className="relative flex-1 bg-black flex items-center justify-center min-h-[40vh] lg:min-h-full overflow-hidden group">
                                    {isImageError ? (
                                        <motion.div
                                            key={`error-${filteredImages[currentImageIndex].id}`}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex flex-col items-center justify-center text-white/50 p-12 text-center"
                                        >
                                            <FaImage className="w-24 h-24 mb-4 opacity-50" />
                                            <p className="text-lg font-medium">
                                                Gambar tidak tersedia
                                            </p>
                                        </motion.div>
                                    ) : (
                                        <motion.img
                                            key={
                                                filteredImages[
                                                    currentImageIndex
                                                ].id
                                            }
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.3 }}
                                            src={`/storage/berita/${filteredImages[currentImageIndex].image}`}
                                            alt={
                                                filteredImages[
                                                    currentImageIndex
                                                ].judul
                                            }
                                            className="max-w-full max-h-[85vh] lg:max-h-full object-contain"
                                            onError={() =>
                                                setIsImageError(true)
                                            }
                                        />
                                    )}

                                    {/* Mobile Navigation Overlay */}
                                    <div className="absolute inset-0 flex justify-between items-center md:hidden px-2 pointer-events-none">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigateLightbox("prev");
                                            }}
                                            className="p-2 text-white/70 bg-black/20 rounded-full pointer-events-auto"
                                        >
                                            <FaChevronLeft className="w-6 h-6" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigateLightbox("next");
                                            }}
                                            className="p-2 text-white/70 bg-black/20 rounded-full pointer-events-auto"
                                        >
                                            <FaChevronRight className="w-6 h-6" />
                                        </button>
                                    </div>

                                    {/* Image Overlay Controls (Top Left) */}
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium text-white shadow-lg backdrop-blur-xl ${(() => {
                                                const index = themes.findIndex(
                                                    (t) =>
                                                        t.id ===
                                                        filteredImages[
                                                            currentImageIndex
                                                        ].tema?.id,
                                                );
                                                const classes = [
                                                    "bg-blue-600/90",
                                                    "bg-green-600/90",
                                                    "bg-purple-600/90",
                                                    "bg-amber-600/90",
                                                    "bg-rose-600/90",
                                                    "bg-indigo-600/90",
                                                    "bg-cyan-600/90",
                                                    "bg-teal-600/90",
                                                ];
                                                return index >= 0
                                                    ? classes[
                                                          index % classes.length
                                                      ]
                                                    : "bg-gray-600/90";
                                            })()}`}
                                        >
                                            {filteredImages[currentImageIndex]
                                                .tema?.nama || "Berita"}
                                        </span>
                                    </div>
                                </div>

                                {/* Details Section */}
                                <div className="w-full lg:w-[400px] bg-white/80 backdrop-blur-2xl flex flex-col border-l border-white/20 shadow-[-10px_0_30px_rgba(0,0,0,0.05)]">
                                    <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
                                        {/* Header */}
                                        <div className="flex items-start justify-between gap-4 mb-8">
                                            <div>
                                                <h3
                                                    id="lightbox-title"
                                                    className="text-2xl font-bold text-slate-900 leading-snug mb-3"
                                                >
                                                    {
                                                        filteredImages[
                                                            currentImageIndex
                                                        ].judul
                                                    }
                                                </h3>
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/80 text-xs text-slate-500 font-medium">
                                                        <FaCalendarAlt className="text-slate-400 w-3.5 h-3.5" />
                                                        {format(
                                                            new Date(
                                                                filteredImages[
                                                                    currentImageIndex
                                                                ].created_at,
                                                            ),
                                                            "d MMM yyyy",
                                                            { locale: id },
                                                        )}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-xs text-blue-600 font-medium border border-blue-100">
                                                        {filteredImages[
                                                            currentImageIndex
                                                        ].tema?.nama || "Umum"}
                                                    </span>
                                                </div>
                                            </div>

                                            <motion.button
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() =>
                                                    toggleFavorite(
                                                        filteredImages[
                                                            currentImageIndex
                                                        ].id,
                                                    )
                                                }
                                                className={`p-3 rounded-2xl transition-all duration-300 shadow-sm flex-shrink-0 ${
                                                    isFavorited(
                                                        filteredImages[
                                                            currentImageIndex
                                                        ].id,
                                                    )
                                                        ? "bg-rose-50 text-rose-500 shadow-rose-100 ring-1 ring-rose-100"
                                                        : "bg-white text-slate-400 hover:bg-slate-50 ring-1 ring-slate-100"
                                                }`}
                                            >
                                                {isFavorited(
                                                    filteredImages[
                                                        currentImageIndex
                                                    ].id,
                                                ) ? (
                                                    <FaHeart className="w-5 h-5" />
                                                ) : (
                                                    <FaRegHeart className="w-5 h-5" />
                                                )}
                                            </motion.button>
                                        </div>

                                        {/* Content */}
                                        <div
                                            id="lightbox-desc"
                                            className="mb-8"
                                        >
                                            <div
                                                className="text-slate-600 leading-relaxed text-[15px] space-y-4 font-normal"
                                                dangerouslySetInnerHTML={{
                                                    __html: renderNewsContent(
                                                        filteredImages[
                                                            currentImageIndex
                                                        ],
                                                    ),
                                                }}
                                            />
                                        </div>

                                        {/* Metadata Cards */}
                                        <div className="grid grid-cols-2 gap-3 mb-6">
                                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100/50">
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">
                                                    ID Referensi
                                                </p>
                                                <p className="font-mono text-xs text-slate-600 truncate">
                                                    #
                                                    {
                                                        filteredImages[
                                                            currentImageIndex
                                                        ].id.split("-")[0]
                                                    }
                                                </p>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100/50">
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">
                                                    Fotografer
                                                </p>
                                                <p className="font-medium text-xs text-slate-700 truncate">
                                                    Admin Web
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="p-6 bg-white/80 backdrop-blur-md border-t border-slate-100 flex gap-4">
                                        <button className="flex-1 group flex items-center justify-center gap-2.5 px-4 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-medium transition-all shadow-lg shadow-slate-200 active:scale-[0.98]">
                                            <FaDownload className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                                            <span>Download</span>
                                        </button>
                                        <button className="flex-none flex items-center justify-center p-3.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 rounded-2xl transition-all shadow-sm active:scale-[0.98]">
                                            <FaShare className="w-5 h-5" />
                                        </button>
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
            <style>{`
                
            `}</style>
        </>
    );
}
