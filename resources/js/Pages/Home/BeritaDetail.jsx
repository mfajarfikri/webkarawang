import React, { useState, useEffect, useRef, useMemo } from "react";
import { Head, Link } from "@inertiajs/react";
import HomeLayout from "@/Layouts/HomeLayout";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { FaRegCalendarAlt } from "react-icons/fa";
import axios from "axios";

// Editor.js & Plugins
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Quote from "@editorjs/quote";
import CodeTool from "@editorjs/code";
import InlineCode from "@editorjs/inline-code";
import Table from "@editorjs/table";
import Marker from "@editorjs/marker";
import Underline from "@editorjs/underline";
import Checklist from "@editorjs/checklist";
import Delimiter from "@editorjs/delimiter";
import Embed from "@editorjs/embed";
import Warning from "@editorjs/warning";
import Raw from "@editorjs/raw";
import LinkTool from "@editorjs/link";

export default function BeritaDetail({ berita }) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [relatedNews, setRelatedNews] = useState([]);

    // Helper to parse images
    const parseImages = (imageData) => {
        if (!imageData) return [];
        if (Array.isArray(imageData)) return imageData;
        try {
            return JSON.parse(imageData);
        } catch (e) {
            return [];
        }
    };

    // Safely parse images for main berita
    const images = useMemo(() => parseImages(berita.gambar), [berita.gambar]);

    useEffect(() => {
        const fetchRelatedNews = async () => {
            try {
                const response = await axios.get(`/api/berita`);
                const sortedByViews = (response.data.berita || []).sort(
                    (a, b) => b.read_count - a.read_count,
                );
                setRelatedNews(sortedByViews);
            } catch (error) {
                console.error("Error fetching related news:", error);
            }
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

    // EditorJS Instance
    const editorInstance = useRef(null);

    // Initialize EditorJS in Read-Only mode
    useEffect(() => {
        if (!berita.content_json) return;

        // Parse content_json if it's a string
        let contentData;
        try {
            contentData =
                typeof berita.content_json === "string"
                    ? JSON.parse(berita.content_json)
                    : berita.content_json;
        } catch (e) {
            console.error("Error parsing content_json:", e);
            return;
        }

        if (!editorInstance.current) {
            const editor = new EditorJS({
                holder: "editorjs",
                readOnly: true,
                data: contentData,
                tools: {
                    header: Header,
                    list: List,
                    quote: Quote,
                    code: CodeTool,
                    inlineCode: InlineCode,
                    table: Table,
                    marker: Marker,
                    underline: Underline,
                    checklist: Checklist,
                    delimiter: Delimiter,
                    embed: Embed,
                    warning: Warning,
                    raw: Raw,
                    linkTool: LinkTool,
                },
                minHeight: 0,
            });
            editorInstance.current = editor;
        }

        return () => {
            if (
                editorInstance.current &&
                typeof editorInstance.current.destroy === "function"
            ) {
                editorInstance.current.destroy();
                editorInstance.current = null;
            }
        };
    }, [berita.content_json]);

    return (
        <>
            <Head title={berita.judul} />
            <HomeLayout>
                <div className="max-w-full px-4 sm:px-6 lg:px-8 py-12">
                    <div className="container mx-auto">
                        <div className="grid justify-between lg:grid-cols-9 gap-10">
                            {/* Main Content */}
                            <div className="lg:col-span-4 lg:col-start-3">
                                {/* Header Section */}
                                <div className="mb-8">
                                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-4">
                                        {berita.judul}
                                    </h1>
                                    <div className="flex flex-wrap items-center text-xs text-slate-500 gap-3">
                                        <span className="text-blue-700 font-medium">
                                            By {berita.user?.name || "Redaksi"}
                                        </span>
                                        <span className="flex items-center">
                                            <FaRegCalendarAlt className="w-3 h-3 mr-1 text-slate-400" />
                                            {format(
                                                new Date(berita.created_at),
                                                "dd MMMM yyyy",
                                                { locale: id },
                                            )}
                                        </span>
                                    </div>
                                </div>

                                {/* Image Slider */}
                                {images.length > 0 && (
                                    <div className="relative mb-0 overflow-hidden rounded-2xl shadow-xl aspect-video bg-slate-100 group">
                                        {images.map((img, index) => (
                                            <img
                                                key={index}
                                                src={`/storage/berita/${img}`}
                                                alt={`Slide ${index + 1}`}
                                                className={`w-full h-full absolute inset-0 object-cover transition-opacity duration-700 ease-in-out ${
                                                    index === currentSlide
                                                        ? "opacity-100 z-10"
                                                        : "opacity-0 z-0"
                                                }`}
                                            />
                                        ))}

                                        {images.length > 1 && (
                                            <>
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-none" />
                                                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-30">
                                                    {images.map((_, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() =>
                                                                goToSlide(index)
                                                            }
                                                            className={`h-2 rounded-full transition-all duration-300 shadow-sm ${
                                                                index ===
                                                                currentSlide
                                                                    ? "bg-white w-8"
                                                                    : "bg-white/50 w-2 hover:bg-white/80"
                                                            }`}
                                                            aria-label={`Go to slide ${index + 1}`}
                                                        />
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* Excerpt */}
                                {berita.excerpt && (
                                    <div className="mb-8 italic text-gray-500 text-xs leading-relaxed">
                                        {berita.excerpt}
                                    </div>
                                )}

                                {/* Content */}
                                <div className="w-full max-w-none  prose-xl prose-slate prose-img:rounded-xl prose-headings:font-bold prose-a:text-blue-600 hover:prose-a:text-blue-700">
                                    {berita.content_json ? (
                                        <div id="editorjs" />
                                    ) : (
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: berita.isi,
                                            }}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Sidebar */}
                            <div className="lg:col-span-3 lg:col-start-8">
                                <div className="sticky top-24">
                                    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                                        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                            <h3 className="text-xl font-bold text-slate-800 flex items-center">
                                                <span className="w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
                                                Berita Terpopuler
                                            </h3>
                                        </div>
                                        <div className="divide-y divide-slate-100">
                                            {filteredRelatedNews.map(
                                                (news, idx) => {
                                                    const newsImages =
                                                        parseImages(
                                                            news.gambar,
                                                        );
                                                    const thumbnail =
                                                        newsImages.length > 0
                                                            ? `/storage/berita/${newsImages[0]}`
                                                            : null;

                                                    return (
                                                        <Link
                                                            key={news.id}
                                                            href={`/berita/${news.slug}`}
                                                            className="group flex gap-4 p-5 hover:bg-blue-50/30 transition-colors duration-200"
                                                        >
                                                            <div className="flex-none w-20 h-20 bg-slate-200 rounded-lg overflow-hidden relative shadow-sm">
                                                                {thumbnail ? (
                                                                    <img
                                                                        src={
                                                                            thumbnail
                                                                        }
                                                                        alt={
                                                                            news.judul
                                                                        }
                                                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                                                                        <svg
                                                                            className="w-8 h-8"
                                                                            fill="none"
                                                                            viewBox="0 0 24 24"
                                                                            stroke="currentColor"
                                                                        >
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                strokeWidth={
                                                                                    1.5
                                                                                }
                                                                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                                            />
                                                                        </svg>
                                                                    </div>
                                                                )}
                                                                <div className="absolute top-0 left-0 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-br-md">
                                                                    #{idx + 1}
                                                                </div>
                                                            </div>
                                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                                <h4 className="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors line-clamp-2 leading-snug mb-2">
                                                                    {news.judul}
                                                                </h4>
                                                                <div className="flex items-center text-xs text-slate-500">
                                                                    <FaRegCalendarAlt className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                                                                    {format(
                                                                        new Date(
                                                                            news.created_at,
                                                                        ),
                                                                        "dd MMM yyyy",
                                                                        {
                                                                            locale: id,
                                                                        },
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    );
                                                },
                                            )}
                                        </div>
                                        <div className="p-4 bg-slate-50/50 text-center border-t border-slate-100">
                                            <Link
                                                href="/berita"
                                                className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                                            >
                                                Lihat Semua Berita &rarr;
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </HomeLayout>
        </>
    );
}
