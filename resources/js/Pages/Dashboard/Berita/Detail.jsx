import React, { useEffect, useState, useRef, useMemo } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head } from "@inertiajs/react";

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

export default function Detail({ berita }) {
    // Safely parse images
    const gambarArray = useMemo(() => {
        if (!berita.gambar) return [];
        if (Array.isArray(berita.gambar)) return berita.gambar;
        try {
            return JSON.parse(berita.gambar);
        } catch (e) {
            console.error("Error parsing gambar:", e);
            return [];
        }
    }, [berita.gambar]);

    const [currentSlide, setCurrentSlide] = useState(0);
    const [loadedImages, setLoadedImages] = useState({});

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

    useEffect(() => {
        if (gambarArray.length === 0) return;
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
            `Failed to load image at index ${index}: /storage/berita/${gambarArray[index]}`,
        );
    };

    return (
        <>
            <Head title={`Berita - ${berita.judul}`} />
            <DashboardLayout title="Detail Berita">
                <div className="mx-auto max-w-4xl space-y-6">
                    {/* Title */}
                    <header>
                        <p className="eyebrow">Detail Berita</p>
                        <h1 className="mt-3 font-display text-2xl font-extrabold leading-tight text-ink-900 md:text-3xl">
                            {berita.judul}
                        </h1>
                    </header>

                    {/* Carousel */}
                    {gambarArray.length > 0 && (
                        <div className="surface relative w-full aspect-video overflow-hidden">
                            {gambarArray.map((item, index) => (
                                <div
                                    key={index}
                                    className={`absolute inset-0 transition-opacity duration-1000 ${
                                        index === currentSlide
                                            ? "opacity-100"
                                            : "opacity-0 pointer-events-none"
                                    } flex justify-center items-center bg-slate-100`}
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
                                        <div className="absolute inset-0 flex justify-center items-center bg-slate-100 text-sm text-slate-500">
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
                                        className={`h-2 w-2 rounded-full transition-all duration-300 ${
                                            index === currentSlide
                                                ? "bg-white w-6"
                                                : "bg-white/50"
                                        }`}
                                    ></button>
                                ))}
                            </div>
                        </div>
                    )}

                    <p className="border-l-2 border-brand-500 pl-4 text-sm leading-relaxed text-slate-600">
                        {berita.excerpt}
                    </p>

                    {/* Berita description - Using EditorJS ReadOnly or Fallback */}
                    <div className="surface p-6 md:p-8">
                        {berita.content_json ? (
                            <div
                                id="editorjs"
                                className="prose prose-lg max-w-none dark:prose-invert mx-auto"
                            ></div>
                        ) : (
                            berita.isi && (
                                <div className="prose prose-lg max-w-none dark:prose-invert mx-auto text-justify">
                                    <div
                                        className="blockquote"
                                        dangerouslySetInnerHTML={{
                                            __html: berita.isi,
                                        }}
                                    />
                                </div>
                            )
                        )}
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}
