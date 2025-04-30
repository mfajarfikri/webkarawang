import React, { useEffect, useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head } from "@inertiajs/react";

export default function Detail({ berita }) {
    const gambarArray = berita.gambar ? JSON.parse(berita.gambar) : [];
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loadedImages, setLoadedImages] = useState({});

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % gambarArray.length);
        }, 5000); // Change image every 5 seconds
        return () => clearInterval(interval);
    }, [gambarArray.length]);

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    // Handler for image load success
    const handleImageLoad = (index) => {
        setLoadedImages((prev) => ({ ...prev, [index]: true }));
    };

    // Handler for image load error
    const handleImageError = (index) => {
        setLoadedImages((prev) => ({ ...prev, [index]: false }));
        console.error(
            `Failed to load image at index ${index}: /storage/berita/${gambarArray[index]}`
        );
    };

    return (
        <>
            <Head title={`Berita - ${berita.judul}`} />
            <DashboardLayout>
                <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-8">
                        {berita.judul}
                    </h1>

                    {/* Carousel */}
                    <div className="relative w-full aspect-video overflow-hidden rounded-2xl shadow-xl mb-8">
                        {gambarArray.map((item, index) => (
                            <div
                                key={index}
                                className={`absolute inset-0 transition-opacity duration-1000 ${
                                    index === currentSlide
                                        ? "opacity-100"
                                        : "opacity-0 pointer-events-none"
                                } flex justify-center items-center bg-gray-100`}
                            >
                                {/* Use img tag instead of background image for better loading control */}
                                <img
                                    src={`/storage/berita/${item}`}
                                    alt={`Berita image ${index + 1}`}
                                    className="object-cover w-full h-full scale-105 transition-transform duration-1000"
                                    style={{
                                        transform:
                                            index === currentSlide
                                                ? "scale(1)"
                                                : "scale(1.05)",
                                    }}
                                    onLoad={() => handleImageLoad(index)}
                                    onError={() => handleImageError(index)}
                                />
                                {/* Show placeholder if image failed to load */}
                                {loadedImages[index] === false && (
                                    <div className="absolute inset-0 flex justify-center items-center bg-gray-200 text-gray-500">
                                        Image not available
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Carousel Indicators */}
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                            {gambarArray.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToSlide(index)}
                                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                        index === currentSlide
                                            ? "bg-blue-500 w-6"
                                            : "bg-white/60"
                                    }`}
                                ></button>
                            ))}
                        </div>
                    </div>

                    {/* Berita description */}
                    {berita.isi && (
                        <div className="prose prose-lg max-w-none dark:prose-invert mx-auto text-justify">
                            <div
                                className="blockquote"
                                dangerouslySetInnerHTML={{
                                    __html: berita.isi,
                                }}
                            />
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </>
    );
}
