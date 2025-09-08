import React, { useState, useEffect, useRef } from "react";
import { Head, Link } from "@inertiajs/react";
import HomeLayout from "@/Layouts/HomeLayout";
import {
    FaCalendarAlt,
    FaClock,
    FaMapMarkerAlt,
    FaArrowRight,
    FaUsers,
    FaBolt,
    FaIndustry,
    FaBuilding,
    FaChevronLeft,
    FaChevronRight,
    FaChartLine,
    FaLightbulb,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { format } from "date-fns";
import { id } from "date-fns/locale";

// CSS untuk animasi khusus
const styles = {
    animateBlob: `
        @keyframes blob-animation {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
            animation: blob-animation 7s infinite;
        }
        .animation-delay-2000 {
            animation-delay: 2s;
        }
        .animation-delay-4000 {
            animation-delay: 4s;
        }
    `,
    shimmerEffect: `
        @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
        .animate-shimmer {
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
        }
        .shimmer-effect {
            animation: shimmer 2s infinite;
        }
    `,
    pulseSlow: `
        .animate-pulse-slow {
            animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
    `,
};

export default function Home() {
    // Refs
    const carouselRef = useRef(null);

    // State untuk carousel
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loading, setLoading] = useState(true);
    const [berita, setBerita] = useState([]);
    const [ktt, setKtt] = useState([]);
    const [garduInduk, setGarduInduk] = useState(0);
    const [isHovering, setIsHovering] = useState(false);
    const [animateStats, setAnimateStats] = useState(false);
    const [error, setError] = useState(null);
    const BeritaTerbaru = berita.slice(0, 3);

    // Inject custom CSS
    useEffect(() => {
        // Create style element
        const styleElement = document.createElement("style");
        styleElement.textContent = `
            ${styles.animateBlob}
            ${styles.shimmerEffect}
            ${styles.pulseSlow}
        `;
        document.head.appendChild(styleElement);

        // Clean up
        return () => {
            document.head.removeChild(styleElement);
        };
    }, []);

    useEffect(() => {
        axios
            .get(route("ktt.index"))
            .then((response) => {
                setKtt(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error Fetching Data Ktt", error);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        const fetchGardu = async () => {
            try {
                const response = await axios.get("/api/gardu");
                setGarduInduk(response.data.gardu.length || []);
            } catch (error) {
                setError(error);
                console.error("Error Fetching Gardu :", error);
            } finally {
                setLoading(false);
            }
        };

        fetchGardu();
    }, []);

    // Data carousel dari API berita
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
    // Menggunakan 3 berita terbaru untuk carousel
    const carouselItems =
        berita.length > 0
            ? berita.map((item) => ({
                  id: item.id,
                  image: (() => {
                      try {
                          if (item.gambar) {
                              let gambarArray;

                              if (Array.isArray(item.gambar)) {
                                  gambarArray = item.gambar;
                              } else if (typeof item.gambar === "string") {
                                  try {
                                      gambarArray = JSON.parse(item.gambar);
                                  } catch (e) {
                                      // Jika string bukan JSON valid, mungkin itu path gambar tunggal
                                      gambarArray = [item.gambar];
                                  }
                              }

                              if (gambarArray && gambarArray.length > 0) {
                                  // Pastikan URL lengkap dengan domain dan path yang benar
                                  const fileName = gambarArray[0];
                                  return `${window.location.origin}/storage/berita/${fileName}`;
                              }
                          }
                      } catch (error) {
                          console.error("Error parsing gambar:", error);
                      }

                      return "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=2070";
                  })(),
                  title: item.judul,
                  description:
                      item.excerpt ||
                      (item.isi ? item.isi.substring(0, 150) + "..." : ""),
                  buttonText: "Baca Selengkapnya",
                  buttonLink: `/berita/${item.slug}`,
              }))
            : [];

    // Fungsi untuk carousel
    useEffect(() => {
        let interval;
        if (!isHovering && carouselItems.length > 0) {
            interval = setInterval(() => {
                setCurrentSlide(
                    (prevSlide) => (prevSlide + 1) % carouselItems.length
                );
            }, 6000);
        }
        return () => clearInterval(interval);
    }, [carouselItems.length, isHovering]);

    // Efek untuk animasi statistik
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setAnimateStats(true);
                }
            },
            { threshold: 0.3 }
        );

        const statsSection = document.querySelector(".stats-section");
        if (statsSection) {
            observer.observe(statsSection);
        }

        return () => {
            if (statsSection) {
                observer.unobserve(statsSection);
            }
        };
    }, []);

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    const goToNextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
    };

    const goToPrevSlide = () => {
        setCurrentSlide(
            (prev) => (prev - 1 + carouselItems.length) % carouselItems.length
        );
    };

    return (
        <HomeLayout>
            <Head title="Beranda" />

            {/* Hero Carousel */}
            <div
                className="relative h-[800px] md:h-[600px] overflow-hidden"
                ref={carouselRef}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
            >
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-10 pointer-events-none">
                    <div className="absolute top-20 left-[10%] w-24 h-24 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                    <div className="absolute top-40 right-[10%] w-32 h-32 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-20 left-[20%] w-36 h-36 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
                </div>

                <AnimatePresence initial={false} mode="wait">
                    {carouselItems.map(
                        (item, index) =>
                            index === currentSlide && (
                                <motion.div
                                    key={item.id}
                                    className="absolute inset-0"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 1 }}
                                >
                                    {/* Overlay gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent z-10"></div>

                                    {/* Background image with parallax effect */}
                                    <motion.div
                                        className="absolute inset-0 bg-cover bg-center"
                                        initial={{ scale: 1.2 }}
                                        animate={{ scale: 1.05 }}
                                        transition={{
                                            duration: 10,
                                            ease: "easeOut",
                                        }}
                                    >
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                console.error(
                                                    `Failed to load image: ${item.image}`
                                                );
                                                e.target.src =
                                                    "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=2070";
                                            }}
                                        />
                                    </motion.div>

                                    {/* Content */}
                                    <div className="relative z-20 h-full flex items-center">
                                        <div className="container mx-auto px-4">
                                            <motion.div
                                                className="max-w-xl"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{
                                                    duration: 0.8,
                                                    delay: 0.2,
                                                }}
                                            >
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: "100px" }}
                                                    transition={{
                                                        duration: 0.8,
                                                    }}
                                                    className="h-1 bg-blue-600 mb-6"
                                                />
                                                <motion.h1
                                                    className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
                                                    initial={{
                                                        opacity: 0,
                                                        y: 20,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                    }}
                                                    transition={{
                                                        duration: 0.8,
                                                        delay: 0.4,
                                                    }}
                                                >
                                                    {item.title}
                                                </motion.h1>
                                                <motion.p
                                                    className="text-lg text-gray-200 mb-8"
                                                    initial={{
                                                        opacity: 0,
                                                        y: 20,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                    }}
                                                    transition={{
                                                        duration: 0.8,
                                                        delay: 0.6,
                                                    }}
                                                >
                                                    {item.description}
                                                </motion.p>
                                                <motion.div
                                                    initial={{
                                                        opacity: 0,
                                                        y: 20,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                    }}
                                                    transition={{
                                                        duration: 0.8,
                                                        delay: 0.8,
                                                    }}
                                                >
                                                    <Link
                                                        href={item.buttonLink}
                                                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-md transition-all duration-300 shadow-lg hover:shadow-blue-500/30"
                                                    >
                                                        {item.buttonText}
                                                        <FaArrowRight className="ml-2 animate-pulse-slow" />
                                                    </Link>
                                                </motion.div>
                                            </motion.div>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                    )}
                </AnimatePresence>

                {/* Navigation arrows */}
                <div className="absolute inset-y-0 left-0 z-30 flex items-center">
                    <motion.button
                        onClick={goToPrevSlide}
                        className="bg-black/30 hover:bg-black/50 text-white p-2 rounded-r-md ml-2 backdrop-blur-sm transition-all duration-300 hover:ml-3"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <FaChevronLeft className="h-5 w-5" />
                    </motion.button>
                </div>
                <div className="absolute inset-y-0 right-0 z-30 flex items-center">
                    <motion.button
                        onClick={goToNextSlide}
                        className="bg-black/30 hover:bg-black/50 text-white p-2 rounded-l-md mr-2 backdrop-blur-sm transition-all duration-300 hover:mr-3"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <FaChevronRight className="h-5 w-5" />
                    </motion.button>
                </div>

                {/* Carousel indicators */}
                <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center space-x-3">
                    {carouselItems.map((_, index) => (
                        <motion.button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`h-3 rounded-full transition-all duration-300 ${
                                index === currentSlide
                                    ? "bg-blue-500 w-10"
                                    : "bg-white/60 w-3 hover:bg-white/80"
                            }`}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            aria-label={`Go to slide ${index + 1}`}
                        ></motion.button>
                    ))}
                </div>
            </div>

            {/* Asset PLN UPT Karawang */}
            <section className="py-16 bg-gradient-to-b from-gray-50 to-white stats-section">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={
                            animateStats
                                ? { opacity: 1, y: 0 }
                                : { opacity: 0, y: 20 }
                        }
                        transition={{ duration: 0.8 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-bold text-gray-900 mb-3 relative inline-block">
                            Asset PLN UPT Karawang
                            <motion.div
                                className="absolute -bottom-2 left-1/2 h-1 bg-blue-600"
                                initial={{ width: 0, x: "-50%" }}
                                animate={
                                    animateStats
                                        ? { width: "50%", x: "-50%" }
                                        : { width: 0, x: "-50%" }
                                }
                                transition={{ duration: 0.8, delay: 0.3 }}
                            />
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Informasi terkini mengenai infrastruktur dan sumber
                            daya PLN UPT Karawang
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <motion.div
                            className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border border-gray-100"
                            initial={{ opacity: 0, y: 30 }}
                            animate={
                                animateStats
                                    ? { opacity: 1, y: 0 }
                                    : { opacity: 0, y: 30 }
                            }
                            transition={{ duration: 0.5, delay: 0.1 }}
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="p-6">
                                <motion.div
                                    className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-5 shadow-md shadow-blue-200"
                                    whileHover={{ rotate: 5 }}
                                >
                                    <FaBolt className="text-white text-2xl" />
                                </motion.div>
                                <h3 className="text-xl font-bold mb-2 text-gray-800">
                                    Gardu Induk
                                </h3>
                                <div className="flex items-center mb-4">
                                    <motion.p
                                        className="text-3xl font-bold text-blue-600 mr-2"
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={
                                            animateStats
                                                ? { opacity: 1, scale: 1 }
                                                : { opacity: 0, scale: 0.5 }
                                        }
                                        transition={{
                                            duration: 0.5,
                                            delay: 0.3,
                                        }}
                                    >
                                        {garduInduk}
                                    </motion.p>
                                    <p className="text-gray-500">Unit</p>
                                </div>
                                <div className="mt-2">
                                    <Link
                                        href={route("gardu-induk")}
                                        className="group inline-flex items-center px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-all duration-300 font-medium text-sm"
                                    >
                                        <span>Detail</span>
                                        <FaArrowRight className="ml-2 text-sm transition-transform duration-300 group-hover:translate-x-1" />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border border-gray-100"
                            initial={{ opacity: 0, y: 30 }}
                            animate={
                                animateStats
                                    ? { opacity: 1, y: 0 }
                                    : { opacity: 0, y: 30 }
                            }
                            transition={{ duration: 0.5, delay: 0.2 }}
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="p-6">
                                <motion.div
                                    className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-5 shadow-md shadow-green-200"
                                    whileHover={{ rotate: 5 }}
                                >
                                    <FaIndustry className="text-white text-2xl" />
                                </motion.div>
                                <h3 className="text-xl font-bold mb-2 text-gray-800">
                                    Trafo Tenaga
                                </h3>
                                <div className="flex items-center mb-4">
                                    <motion.p
                                        className="text-3xl font-bold text-green-600 mr-2"
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={
                                            animateStats
                                                ? { opacity: 1, scale: 1 }
                                                : { opacity: 0, scale: 0.5 }
                                        }
                                        transition={{
                                            duration: 0.5,
                                            delay: 0.4,
                                        }}
                                    >
                                        1240
                                    </motion.p>
                                    <p className="text-gray-500">MVA</p>
                                </div>
                                <div className="mt-2">
                                    <Link
                                        href="/asset/trafo-tenaga"
                                        className="group inline-flex items-center px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-all duration-300 font-medium text-sm"
                                    >
                                        <span>Detail</span>
                                        <FaArrowRight className="ml-2 text-sm transition-transform duration-300 group-hover:translate-x-1" />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border border-gray-100"
                            initial={{ opacity: 0, y: 30 }}
                            animate={
                                animateStats
                                    ? { opacity: 1, y: 0 }
                                    : { opacity: 0, y: 30 }
                            }
                            transition={{ duration: 0.5, delay: 0.3 }}
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="p-6">
                                <motion.div
                                    className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-5 shadow-md shadow-purple-200"
                                    whileHover={{ rotate: 5 }}
                                >
                                    <FaBuilding className="text-white text-2xl" />
                                </motion.div>
                                <h3 className="text-xl font-bold mb-2 text-gray-800">
                                    Pelanggan KTT
                                </h3>
                                <div className="flex items-center mb-4">
                                    <motion.p
                                        className="text-3xl font-bold text-purple-600 mr-2"
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={
                                            animateStats
                                                ? { opacity: 1, scale: 1 }
                                                : { opacity: 0, scale: 0.5 }
                                        }
                                        transition={{
                                            duration: 0.5,
                                            delay: 0.5,
                                        }}
                                    >
                                        {ktt.length}
                                    </motion.p>
                                    <p className="text-gray-500">Pelanggan</p>
                                </div>
                                <div className="mt-2">
                                    <Link
                                        href={route("ktt.index")}
                                        className="group inline-flex items-center px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-all duration-300 font-medium text-sm"
                                    >
                                        <span>Detail</span>
                                        <FaArrowRight className="ml-2 text-sm transition-transform duration-300 group-hover:translate-x-1" />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border border-gray-100"
                            initial={{ opacity: 0, y: 30 }}
                            animate={
                                animateStats
                                    ? { opacity: 1, y: 0 }
                                    : { opacity: 0, y: 30 }
                            }
                            transition={{ duration: 0.5, delay: 0.4 }}
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="p-6">
                                <motion.div
                                    className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mb-5 shadow-md shadow-amber-200"
                                    whileHover={{ rotate: 5 }}
                                >
                                    <FaUsers className="text-white text-2xl" />
                                </motion.div>
                                <h3 className="text-xl font-bold mb-2 text-gray-800">
                                    SDM PLN UPT
                                </h3>
                                <div className="flex items-center mb-4">
                                    <motion.p
                                        className="text-3xl font-bold text-amber-600 mr-2"
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={
                                            animateStats
                                                ? { opacity: 1, scale: 1 }
                                                : { opacity: 0, scale: 0.5 }
                                        }
                                        transition={{
                                            duration: 0.5,
                                            delay: 0.6,
                                        }}
                                    >
                                        128
                                    </motion.p>
                                    <p className="text-gray-500">Pegawai</p>
                                </div>
                                <div className="mt-2">
                                    <Link
                                        href="/asset/sdm"
                                        className="group inline-flex items-center px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition-all duration-300 font-medium text-sm"
                                    >
                                        <span>Detail</span>
                                        <FaArrowRight className="ml-2 text-sm transition-transform duration-300 group-hover:translate-x-1" />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Berita Terbaru */}
            <section className="py-20 bg-gradient-to-b from-white to-gray-50">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="flex justify-between items-center mb-10"
                    >
                        <h2 className="text-3xl font-bold text-gray-900 relative inline-block">
                            Berita Terbaru
                            <motion.div
                                className="absolute -bottom-2 left-0 h-1 bg-blue-600"
                                initial={{ width: 0 }}
                                whileInView={{ width: "50%" }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                            />
                        </h2>
                        <Link
                            href="/berita"
                            className="group text-blue-600 font-medium hover:text-blue-800 inline-flex items-center"
                        >
                            Lihat Semua{" "}
                            <motion.span
                                className="ml-1"
                                initial={{ x: 0 }}
                                whileHover={{ x: 5 }}
                                transition={{ duration: 0.2 }}
                            >
                                <FaArrowRight className="h-3 w-3 group-hover:text-blue-700 transition-colors duration-300" />
                            </motion.span>
                        </Link>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {BeritaTerbaru.map((news, index) => (
                            <motion.div
                                key={news.id}
                                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group hover:-translate-y-2"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{
                                    duration: 0.5,
                                    delay: index * 0.1,
                                }}
                            >
                                <div className="h-56 overflow-hidden relative">
                                    <motion.img
                                        src={(() => {
                                            try {
                                                if (news.gambar) {
                                                    const parsedGambar =
                                                        JSON.parse(news.gambar);
                                                    return parsedGambar &&
                                                        parsedGambar.length > 0
                                                        ? `/storage/berita/${parsedGambar[0]}`
                                                        : "/images/default-news.jpg";
                                                }
                                                return "/images/default-news.jpg";
                                            } catch (error) {
                                                console.error(
                                                    "Error parsing gambar:",
                                                    error
                                                );
                                                return "/images/default-news.jpg";
                                            }
                                        })()}
                                        alt={news.judul}
                                        className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                                        initial={{ scale: 1.2 }}
                                        animate={{ scale: 1 }}
                                        transition={{ duration: 0.7 }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                        Berita
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center mb-3">
                                        <div className="inline-flex gap-2">
                                            <span className="flex justify-center items-center text-xs font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                                                <FaUsers />
                                            </span>
                                            <span className="text-xs text-gray-600">
                                                {news.user?.name},
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-500 ml-1">
                                            {format(
                                                new Date(news.created_at),
                                                "dd MMM yyyy",
                                                { locale: id }
                                            )}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">
                                        <Link
                                            href={route(
                                                "berita.detail",
                                                news.slug
                                            )}
                                        >
                                            {news.judul}
                                        </Link>
                                    </h3>
                                    <p className="text-gray-600 mb-5 line-clamp-3">
                                        {news.excerpt}
                                    </p>
                                    <Link
                                        href={route("berita.detail", news.slug)}
                                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-300 shadow-md hover:shadow-blue-500/30 text-sm"
                                    >
                                        Baca Selengkapnya
                                        <motion.span
                                            className="ml-2"
                                            initial={{ x: 0 }}
                                            whileHover={{ x: 3 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <FaArrowRight />
                                        </motion.span>
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </HomeLayout>
    );
}
