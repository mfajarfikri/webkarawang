import React, { useState, useEffect } from "react";
import { Head, Link } from "@inertiajs/react";
import HomeLayout from "@/Layouts/HomeLayout";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function BeritaDetail({ berita }) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const images = berita.gambar ? JSON.parse(berita.gambar) : [];

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
                <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold mb-4">{berita.judul}</h1>
                    <div className="text-sm text-gray-500 mb-6">
                        <span>By {berita.user?.name || "Unknown"}</span> |{" "}
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
                        <div className="relative mb-6 overflow-hidden rounded">
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
                                        aria-label={`Go to slide ${index + 1}`}
                                    ></button>
                                ))}
                            </div>
                        </div>
                    )}
                    <div
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: berita.isi }}
                    />
                    <div className="mt-8">
                        <Link
                            href="/berita"
                            className="text-blue-600 hover:underline"
                        >
                            &larr; Back to Berita
                        </Link>
                    </div>
                </div>
            </HomeLayout>
        </>
    );
}
