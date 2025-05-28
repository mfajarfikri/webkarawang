import React, { useState, useEffect } from "react";
import { Head, Link } from "@inertiajs/react";
import HomeLayout from "@/Layouts/HomeLayout";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { FaRegCalendarAlt } from "react-icons/fa";

export default function BeritaDetail({ berita }) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const images = berita.gambar ? JSON.parse(berita.gambar) : [];
    const [relatedNews, setRelatedNews] = useState([]);

    useEffect(() => {
        const fetchRelatedNews = async () => {
            const response = await axios.get(`/api/berita`);
            setRelatedNews(response.data.berita || []);
        };
        fetchRelatedNews();
    }, []);

    const filteredRelatedNews = relatedNews
        .filter((news) => news.slug !== berita.slug)
        .slice(0, 5);

    useEffect(() => {
        if (images.length === 0) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % images.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [images.length]);

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    return (
        <>
            <Head title={berita.judul} />
            <HomeLayout>
                <div className="grid lg:grid-cols-5 md:grid-cols-1">
                    <div className="lg:col-span-4 md:col-span-1">
                        <div className="max-w-4xl mx-auto py-12 pl-4 sm:px-6 lg:pl-8">
                            <h1 className="text-3xl font-bold mb-4">
                                {berita.judul}
                            </h1>
                            <div className="text-sm text-gray-500 mb-6">
                                <span>By {berita.user?.name || "Unknown"}</span>{" "}
                                |{" "}
                                <span>
                                    {format(
                                        new Date(berita.created_at),
                                        "dd MMM yyyy",
                                        {
                                            locale: id,
                                        }
                                    )}
                                </span>
                            </div>
                            {images.length > 0 && (
                                <div className="relative mb-1 overflow-hidden rounded">
                                    {images.map((img, index) => (
                                        <img
                                            key={index}
                                            src={`/storage/berita/${img}`}
                                            alt={`Image ${index + 1}`}
                                            className={`w-full rounded transition-opacity duration-1000 absolute inset-0 object-cover ${
                                                index === currentSlide
                                                    ? "opacity-100 relative"
                                                    : "opacity-0 pointer-events-none"
                                            }`}
                                            style={{ height: "400px" }}
                                        />
                                    ))}
                                    <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2 z-10">
                                        {images.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => goToSlide(index)}
                                                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                                    index === currentSlide
                                                        ? "bg-blue-600 w-8"
                                                        : "bg-blue-300"
                                                }`}
                                                aria-label={`Go to slide ${
                                                    index + 1
                                                }`}
                                            ></button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mb-6 text-xs italic">
                                {berita.excerpt}
                            </div>

                            <div
                                className="prose prose-lg max-w-none"
                                dangerouslySetInnerHTML={{
                                    __html: berita.isi
                                        .replace(
                                            /<p class="mb-4">/g,
                                            '<p class="mb-4">'
                                        )
                                        .replace(
                                            /<p><br><\/p>/g,
                                            '<p class="mb-4"></p>'
                                        ),
                                }}
                            />
                        </div>
                    </div>
                    <div className="col-span-1 pr-8 py-4">
                        <div className="sticky top-4">
                            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-t-lg p-4 transform transition-all duration-500 animate-fadeIn">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6 animate-bounce-slow"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                                        />
                                    </svg>
                                    Berita Terkait
                                </h2>
                            </div>
                            <div className="bg-white rounded-b-lg shadow-lg border border-gray-100 transform transition-all duration-500 animate-slideIn">
                                <div className="divide-y divide-gray-100">
                                    {filteredRelatedNews.map((news, index) => (
                                        <div
                                            key={news.id}
                                            className="group hover:bg-blue-50/50 transition-all duration-300 animate-fadeInUp"
                                            style={{
                                                animationDelay: `${
                                                    index * 100
                                                }ms`,
                                            }}
                                        >
                                            <Link
                                                href={route(
                                                    "berita.detail",
                                                    news.slug
                                                )}
                                                className="block p-4"
                                            >
                                                <div className="flex flex-col gap-3">
                                                    <div className="aspect-video w-full overflow-hidden rounded-lg shadow-sm transform transition-all duration-300 group-hover:shadow-md">
                                                        {news.gambar &&
                                                        JSON.parse(news.gambar)
                                                            .length > 0 ? (
                                                            <img
                                                                src={`/storage/berita/${
                                                                    JSON.parse(
                                                                        news.gambar
                                                                    )[0]
                                                                }`}
                                                                alt={news.judul}
                                                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-200 transition-all duration-300">
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    className="h-8 w-8 text-blue-300 group-hover:text-blue-400 transition-colors duration-300"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={
                                                                            2
                                                                        }
                                                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                                    />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="transform transition-all duration-300 group-hover:translate-x-1">
                                                        <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-2 transition-colors duration-300">
                                                            {news.judul}
                                                        </h3>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <FaRegCalendarAlt className="w-3 h-3" />
                                                            <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
                                                                {format(
                                                                    new Date(
                                                                        news.created_at
                                                                    ),
                                                                    "d MMM yyyy",
                                                                    {
                                                                        locale: id,
                                                                    }
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </HomeLayout>
        </>
    );
}
