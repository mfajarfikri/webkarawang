import React, { useState, useEffect } from "react";
import { Head, Link } from "@inertiajs/react";
import HomeLayout from "@/Layouts/HomeLayout";
import {
    FaCalendarAlt,
    FaClock,
    FaMapMarkerAlt,
    FaArrowRight,
    FaLightbulb,
    FaTools,
    FaChartLine,
    FaUsers,
    FaBolt,
    FaIndustry,
    FaBuilding,
} from "react-icons/fa";

export default function Home() {
    // State untuk carousel
    const [currentSlide, setCurrentSlide] = useState(0);

    // Data carousel
    const carouselItems = [
        {
            id: 1,
            image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=2070",
            title: "Energi Terbarukan untuk Masa Depan",
            description:
                "Komitmen kami untuk mengembangkan sumber energi terbarukan demi Indonesia yang lebih baik",
            buttonText: "Pelajari Lebih Lanjut",
            buttonLink: "/energi-terbarukan",
        },
        {
            id: 2,
            image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=2072",
            title: "Layanan Prima untuk Pelanggan",
            description:
                "Memberikan pelayanan terbaik dan solusi energi yang handal untuk semua pelanggan",
            buttonText: "Lihat Layanan",
            buttonLink: "/layanan",
        },
        {
            id: 3,
            image: "https://images.unsplash.com/photo-1558403194-611308249627?q=80&w=2070",
            title: "Inovasi Teknologi Kelistrikan",
            description:
                "Mengembangkan teknologi terkini untuk sistem kelistrikan yang lebih efisien dan andal",
            buttonText: "Inovasi Kami",
            buttonLink: "/inovasi",
        },
    ];

    // Data berita terbaru
    const latestNews = [
        {
            id: 1,
            title: "PLN Resmikan PLTS Terapung 145 MW di Cirata",
            excerpt:
                "Pembangkit Listrik Tenaga Surya (PLTS) terapung terbesar di Asia Tenggara ini akan mendukung program energi terbarukan nasional.",
            date: "15 November 2023",
            image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=2072",
            category: "Energi Terbarukan",
            url: "/berita/plts-cirata",
        },
        {
            id: 2,
            title: "Program Elektrifikasi Desa Terpencil Capai 99.2%",
            excerpt:
                "PLN berhasil meningkatkan rasio elektrifikasi nasional hingga 99.2% termasuk di daerah-daerah terpencil Indonesia.",
            date: "10 November 2023",
            image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=2070",
            category: "Elektrifikasi",
            url: "/berita/elektrifikasi-desa",
        },
        {
            id: 3,
            title: "PLN Luncurkan Aplikasi Mobile Terbaru untuk Pelanggan",
            excerpt:
                "Aplikasi baru ini menawarkan fitur-fitur inovatif untuk memudahkan pelanggan dalam mengakses layanan kelistrikan.",
            date: "5 November 2023",
            image: "https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?q=80&w=2070",
            category: "Layanan Digital",
            url: "/berita/aplikasi-mobile",
        },
    ];

    // Data jadwal rapat
    const upcomingMeetings = [
        {
            id: 1,
            title: "Rapat Koordinasi Triwulan IV",
            date: "25 November 2023",
            time: "09:00 - 12:00 WIB",
            location: "Ruang Rapat Utama Lt. 3",
            participants: "Seluruh Kepala Divisi",
            status: "upcoming",
        },
        {
            id: 2,
            title: "Evaluasi Kinerja Tahunan",
            date: "10 Desember 2023",
            time: "13:00 - 16:00 WIB",
            location: "Aula Serbaguna",
            participants: "Direksi dan Manajer",
            status: "upcoming",
        },
        {
            id: 3,
            title: "Sosialisasi Program Kerja 2024",
            date: "20 Desember 2023",
            time: "10:00 - 12:00 WIB",
            location: "Auditorium",
            participants: "Seluruh Karyawan",
            status: "upcoming",
        },
    ];

    // Fungsi untuk carousel
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide(
                (prevSlide) => (prevSlide + 1) % carouselItems.length
            );
        }, 5000);
        return () => clearInterval(interval);
    }, [carouselItems.length]);

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    return (
        <HomeLayout>
            <Head title="Beranda" />

            {/* Hero Carousel */}
            <div className="relative h-[800px] md:h-[600px] overflow-hidden">
                {carouselItems.map((item, index) => (
                    <div
                        key={item.id}
                        className={`absolute inset-0 transition-opacity duration-1000 ${
                            index === currentSlide
                                ? "opacity-100"
                                : "opacity-0 pointer-events-none"
                        }`}
                    >
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent z-10"></div>

                        {/* Background image */}
                        <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-10000 ease-out scale-105"
                            style={{
                                backgroundImage: `url(${item.image})`,
                                transform:
                                    index === currentSlide
                                        ? "scale(1)"
                                        : "scale(1.05)",
                            }}
                        ></div>

                        {/* Content */}
                        <div className="relative z-20 h-full flex items-center">
                            <div className="container mx-auto px-4">
                                <div className="max-w-xl">
                                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                                        {item.title}
                                    </h1>
                                    <p className="text-lg text-gray-200 mb-8">
                                        {item.description}
                                    </p>
                                    <Link
                                        href={item.buttonLink}
                                        className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200"
                                    >
                                        {item.buttonText}
                                        <FaArrowRight className="ml-2" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Carousel indicators */}
                <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center space-x-2">
                    {carouselItems.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                index === currentSlide
                                    ? "bg-white w-8"
                                    : "bg-white/50"
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                        ></button>
                    ))}
                </div>
            </div>

            {/* Asset PLN UPT Karawang */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Asset PLN UPT Karawang
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Informasi terkini mengenai infrastruktur dan sumber
                            daya PLN UPT Karawang
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white rounded-lg p-6 border border-gray-100 hover:border-blue-200 hover:shadow-md hover:scale-105 ease-in-out duration-300 transition-all transform">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-blue-100 p-3 rounded-lg">
                                    <FaBolt className="h-6 w-6 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-semibold">
                                    Gardu Induk
                                </h3>
                            </div>
                            <div className="mb-4">
                                <div className="text-3xl font-bold text-blue-600 mb-2">
                                    8
                                </div>
                                <p className="text-gray-600">
                                    Unit Gardu Induk
                                </p>
                            </div>
                            <Link
                                href="/asset/gardu-induk"
                                className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
                            >
                                Detail <FaArrowRight className="ml-2 h-3 w-3" />
                            </Link>
                        </div>

                        <div className="bg-white rounded-lg p-6 border border-gray-100 hover:border-green-200 hover:shadow-md hover:scale-105 ease-in-out duration-300 transition-all transform">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-green-100 p-3 rounded-lg">
                                    <FaIndustry className="h-6 w-6 text-green-600" />
                                </div>
                                <h3 className="text-lg font-semibold">
                                    Trafo Tenaga
                                </h3>
                            </div>
                            <div className="mb-4">
                                <div className="text-3xl font-bold text-green-600 mb-2">
                                    1240
                                </div>
                                <p className="text-gray-600">
                                    MVA Total Kapasitas
                                </p>
                            </div>
                            <Link
                                href="/asset/trafo-tenaga"
                                className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
                            >
                                Detail <FaArrowRight className="ml-2 h-3 w-3" />
                            </Link>
                        </div>

                        <div className="bg-white rounded-lg p-6 border border-gray-100 hover:border-purple-200 hover:shadow-md hover:scale-105 ease-in-out duration-300 transition-all transform">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-purple-100 p-3 rounded-lg">
                                    <FaBuilding className="h-6 w-6 text-purple-600" />
                                </div>
                                <h3 className="text-lg font-semibold">
                                    Pelanggan KTT
                                </h3>
                            </div>
                            <div className="mb-4">
                                <div className="text-3xl font-bold text-purple-600 mb-2">
                                    76
                                </div>
                                <p className="text-gray-600">Total Pelanggan</p>
                            </div>
                            <Link
                                href="/asset/pelanggan-ktt"
                                className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
                            >
                                Detail <FaArrowRight className="ml-2 h-3 w-3" />
                            </Link>
                        </div>

                        <div className="bg-white rounded-lg p-6 border border-gray-100 hover:border-amber-200 hover:shadow-md hover:scale-105 ease-in-out duration-300 transition-all transform">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-amber-100 p-3 rounded-lg">
                                    <FaUsers className="h-6 w-6 text-amber-600" />
                                </div>
                                <h3 className="text-lg font-semibold">
                                    SDM PLN UPT
                                </h3>
                            </div>
                            <div className="mb-4">
                                <div className="text-3xl font-bold text-amber-600 mb-2">
                                    128
                                </div>
                                <p className="text-gray-600">Total Pegawai</p>
                            </div>
                            <Link
                                href="/asset/sdm"
                                className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
                            >
                                Detail <FaArrowRight className="ml-2 h-3 w-3" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Berita Terbaru */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-3xl font-bold text-gray-900">
                            Berita Terbaru
                        </h2>
                        <Link
                            href="/berita"
                            className="text-blue-600 font-medium hover:text-blue-800 inline-flex items-center"
                        >
                            Lihat Semua{" "}
                            <FaArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {latestNews.map((news) => (
                            <div
                                key={news.id}
                                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
                            >
                                <div className="h-48 overflow-hidden">
                                    <img
                                        src={news.image}
                                        alt={news.title}
                                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                    />
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center mb-3">
                                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                                            {news.category}
                                        </span>
                                        <span className="text-xs text-gray-500 ml-2">
                                            {news.date}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                                        <Link href={news.url}>
                                            {news.title}
                                        </Link>
                                    </h3>
                                    <p className="text-gray-600 mb-4 line-clamp-2">
                                        {news.excerpt}
                                    </p>
                                    <Link
                                        href={news.url}
                                        className="text-blue-600 font-medium hover:text-blue-800 inline-flex items-center"
                                    >
                                        Baca Selengkapnya{" "}
                                        <FaArrowRight className="ml-1 h-3 w-3" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Jadwal Rapat */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-3xl font-bold text-gray-900">
                            Jadwal Rapat
                        </h2>
                        <Link
                            href="/jadwal-rapat"
                            className="text-blue-600 font-medium hover:text-blue-800 inline-flex items-center"
                        >
                            Lihat Semua{" "}
                            <FaArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 md:p-8 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {upcomingMeetings.map((meeting) => (
                                <div
                                    key={meeting.id}
                                    className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300 border-l-4 border-blue-500"
                                >
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                        {meeting.title}
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-start">
                                            <FaCalendarAlt className="h-4 w-4 text-blue-500 mt-0.5 mr-2" />
                                            <span className="text-gray-700">
                                                {meeting.date}
                                            </span>
                                        </div>
                                        <div className="flex items-start">
                                            <FaClock className="h-4 w-4 text-blue-500 mt-0.5 mr-2" />
                                            <span className="text-gray-700">
                                                {meeting.time}
                                            </span>
                                        </div>
                                        <div className="flex items-start">
                                            <FaMapMarkerAlt className="h-4 w-4 text-blue-500 mt-0.5 mr-2" />
                                            <span className="text-gray-700">
                                                {meeting.location}
                                            </span>
                                        </div>
                                        <div className="flex items-start">
                                            <FaUsers className="h-4 w-4 text-blue-500 mt-0.5 mr-2" />
                                            <span className="text-gray-700">
                                                {meeting.participants}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full">
                                            Akan Datang
                                        </span>
                                        <button className="text-blue-600 font-medium hover:text-blue-800 text-sm">
                                            Detail
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </HomeLayout>
    );
}
