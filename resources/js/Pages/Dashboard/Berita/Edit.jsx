import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, router } from "@inertiajs/react";
import React, { useEffect, useRef, useState, useMemo, Fragment } from "react";
import {
    FaNewspaper,
    FaImage,
    FaEdit,
    FaTag,
    FaTimes,
    FaSave,
    FaSpinner,
    FaTrash,
} from "react-icons/fa";
import { useForm } from "@inertiajs/react";
import { useSnackbar } from "notistack";
import axios from "axios";
import Modal from "react-modal";
import PageHeader from "@/Components/Dashboard/PageHeader";
import { Card } from "@/Components/Dashboard/ui";
import { Link } from "@inertiajs/react";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import { Combobox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

// Editor.js & Plugins
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Quote from "@editorjs/quote";
import CodeTool from "@editorjs/code";
import InlineCode from "@editorjs/inline-code";
import Table from "@editorjs/table";
// @ts-ignore
import Marker from "@editorjs/marker";
import Underline from "@editorjs/underline";
import Checklist from "@editorjs/checklist";
import Delimiter from "@editorjs/delimiter";
import Embed from "@editorjs/embed";
import Warning from "@editorjs/warning";
import Raw from "@editorjs/raw";
import LinkTool from "@editorjs/link";
import Undo from "editorjs-undo";
import DragDrop from "editorjs-drag-drop";
import { edjsParser, sanitizeEditorData } from "@/utils/editorParser";

export default function Edit({ berita, temas = [], flash }) {
    const { enqueueSnackbar } = useSnackbar();

    // Initial setup for Modal
    React.useEffect(() => {
        Modal.setAppElement(document.body);
    }, []);

    const generateSlug = (text) => {
        if (!text) return "";
        return text
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");
    };

    const { data, setData, post, processing, errors, reset } = useForm({
        judul: berita.judul || "",
        excerpt: berita.excerpt || "",
        slug: berita.slug || "",
        isi: berita.isi || "",
        content_json: berita.content_json || null,
        tema: berita.tema ? berita.tema.nama : "",
    });

    // Theme Selection Logic
    const [selectedTema, setSelectedTema] = useState(berita.tema || null);
    const [query, setQuery] = useState("");

    const filteredTemas = useMemo(() => {
        if (query === "") return temas;
        const lowerQuery = query.toLowerCase();
        return temas.filter((tema) =>
            tema.nama.toLowerCase().includes(lowerQuery),
        );
    }, [query, temas]);

    useEffect(() => {
        if (selectedTema) {
            setData("tema", selectedTema.nama || selectedTema);
        }
    }, [selectedTema]);

    useEffect(() => {
        if (data.judul && data.judul !== berita.judul) {
            setData("slug", generateSlug(data.judul));
        }
    }, [data.judul]);

    // Image Upload Logic
    const [photos, setPhotos] = useState([]); // New photos
    const [previewPhotos, setPreviewPhotos] = useState([]); // Previews for new photos
    const [existingPhotos, setExistingPhotos] = useState(
        berita.gambar
            ? Array.isArray(berita.gambar)
                ? berita.gambar
                : JSON.parse(berita.gambar)
            : [],
    );
    const fileInputRef = useRef(null);

    const compressAndConvertImage = (file) => {
        return new Promise((resolve, reject) => {
            if (!file.type.startsWith("image/")) {
                reject(new Error("File bukan gambar"));
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    let width = img.width;
                    let height = img.height;
                    const MAX_SIZE = 1200;

                    if (width > height && width > MAX_SIZE) {
                        height = Math.round((height * MAX_SIZE) / width);
                        width = MAX_SIZE;
                    } else if (height > MAX_SIZE) {
                        width = Math.round((width * MAX_SIZE) / height);
                        height = MAX_SIZE;
                    }

                    const canvas = document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext("2d");
                    ctx.fillStyle = "#FFFFFF";
                    ctx.fillRect(0, 0, width, height);
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(
                        (blob) => {
                            const newFile = new File([blob], `${file.name}`, {
                                type: "image/jpeg",
                                lastModified: Date.now(),
                            });
                            resolve(newFile);
                        },
                        "image/jpeg",
                        0.75,
                    );
                };
                img.onerror = () => reject(new Error("Gagal memuat gambar"));
                img.src = event.target.result;
            };
            reader.onerror = () => reject(new Error("Gagal membaca file"));
            reader.readAsDataURL(file);
        });
    };

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const totalImages =
            existingPhotos.length + photos.length + files.length;

        if (totalImages > 5) {
            enqueueSnackbar("Maksimal 5 Foto total (termasuk yang sudah ada)", {
                variant: "error",
            });
            return;
        }
        enqueueSnackbar("Memproses Foto...", { variant: "info" });

        try {
            const processedFiles = [];
            for (const file of files) {
                try {
                    const processedFile = await compressAndConvertImage(file);
                    processedFiles.push(processedFile);
                } catch (error) {
                    enqueueSnackbar(
                        `Gagal Memproses gambar "${file.name}": ${error.message}`,
                        { variant: "error" },
                    );
                }
            }
            if (processedFiles.length === 0) {
                enqueueSnackbar("Tidak ada gambar valid untuk diunggah", {
                    variant: "error",
                });
                return;
            }
            setPhotos((prev) => [...prev, ...processedFiles]);

            processedFiles.forEach((file) => {
                const reader = new FileReader();
                reader.onload = (e) =>
                    setPreviewPhotos((prev) => [...prev, e.target.result]);
                reader.readAsDataURL(file);
            });

            if (fileInputRef.current) fileInputRef.current.value = "";
            enqueueSnackbar(
                `${processedFiles.length} foto berhasil diproses!`,
                { variant: "success" },
            );
        } catch (error) {
            enqueueSnackbar("Terjadi kesalahan saat memproses foto", {
                variant: "error",
            });
        }
    };

    const removePhoto = (index) => {
        setPhotos((prev) => prev.filter((_, i) => i !== index));
        setPreviewPhotos((prev) => prev.filter((_, i) => i !== index));
    };

    const removeExistingPhoto = (index) => {
        setExistingPhotos((prev) => prev.filter((_, i) => i !== index));
    };

    // Editor.js Integration
    const editorInstance = useRef(null);

    useEffect(() => {
        if (!editorInstance.current) {
            // Check if we have valid content_json
            let initialData = {};
            if (berita.content_json) {
                try {
                    // It might be already an object or string
                    let parsedData =
                        typeof berita.content_json === "string"
                            ? JSON.parse(berita.content_json)
                            : berita.content_json;

                    initialData = sanitizeEditorData(parsedData);
                } catch (e) {
                    console.error("Failed to parse content_json", e);
                }
            }

            const editor = new EditorJS({
                holder: "editorjs",
                placeholder:
                    "Mulai menulis berita Anda di sini... Tekan Tab untuk melihat pilihan tools.",
                tools: {
                    header: {
                        class: Header,
                        config: {
                            placeholder: "Judul Bagian",
                            levels: [2, 3, 4],
                            defaultLevel: 2,
                        },
                    },
                    list: {
                        class: List,
                        inlineToolbar: true,
                    },
                    quote: Quote,
                    code: CodeTool,
                    inlineCode: InlineCode,
                    table: Table,
                    marker: Marker,
                    underline: Underline,
                    checklist: {
                        class: Checklist,
                        inlineToolbar: true,
                    },
                    delimiter: Delimiter,
                    embed: {
                        class: Embed,
                        config: {
                            services: {
                                youtube: true,
                                twitter: true,
                                facebook: true,
                            },
                        },
                    },
                    warning: {
                        class: Warning,
                        inlineToolbar: true,
                        shortcut: "CMD+SHIFT+W",
                        config: {
                            titlePlaceholder: "Judul Peringatan",
                            messagePlaceholder: "Pesan Peringatan",
                        },
                    },
                    raw: Raw,
                    linkTool: {
                        class: LinkTool,
                        config: {
                            endpoint: route("dashboard.berita.fetch-url"),
                        },
                    },
                },
                onReady: () => {
                    new Undo({ editor });
                    new DragDrop(editor);
                },
                data: initialData,
                minHeight: 0,
            });
            editorInstance.current = editor;
        }

        return () => {
            if (editorInstance.current && editorInstance.current.destroy) {
                if (typeof editorInstance.current.destroy === "function") {
                    editorInstance.current.destroy();
                }
                editorInstance.current = null;
            }
        };
    }, []);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (photos.length === 0 && existingPhotos.length === 0) {
            enqueueSnackbar("Harap Tambahkan minimal 1 foto", {
                variant: "error",
            });
            setIsSubmitting(false);
            return;
        }

        // Process Editor Content
        let contentHtml = "";
        let contentJson = null;
        if (editorInstance.current) {
            try {
                const savedData = await editorInstance.current.save();
                // Check if content is empty (no blocks or only empty paragraph)
                if (savedData.blocks.length === 0) {
                    // contentHtml remains empty
                } else {
                    contentJson = JSON.stringify(savedData);
                    const htmlArray = edjsParser.parse(savedData);
                    if (Array.isArray(htmlArray)) {
                        contentHtml = htmlArray.join("");
                    } else if (typeof htmlArray === "string") {
                        contentHtml = htmlArray;
                    } else {
                        console.error(
                            "EditorJS HTML Parser did not return an array or string",
                            htmlArray,
                        );
                        enqueueSnackbar(
                            "Gagal memproses format konten editor",
                            { variant: "error" },
                        );
                        setIsSubmitting(false);
                        return;
                    }
                }
            } catch (err) {
                console.error("Editor save failed", err);
                enqueueSnackbar("Gagal menyimpan konten editor", {
                    variant: "error",
                });
                setIsSubmitting(false);
                return;
            }
        }

        // Fallback for legacy content: if editor is empty but we have original isi, keep it?
        // Or if editor is empty, show error.
        // If contentHtml is empty, it means user cleared the editor.
        if (!contentHtml.trim()) {
            // Special case: if we had content_json but user cleared it.
            // Or if we didn't have content_json but had isi (legacy), and user didn't touch it?
            // But editor initializes with content_json. If it was null, editor is empty.
            // If user saves empty editor, we shouldn't allow it.
            enqueueSnackbar("Konten berita tidak boleh kosong", {
                variant: "error",
            });
            setIsSubmitting(false);
            return;
        }

        const formData = new FormData();
        formData.append("judul", data.judul);
        formData.append("slug", data.slug);
        formData.append("excerpt", data.excerpt);
        if (data.tema) formData.append("tema", data.tema);

        // Use the generated HTML from Editor.js
        formData.append("isi", contentHtml);
        if (contentJson) formData.append("content_json", contentJson);

        // Append new images
        photos.forEach((file) => formData.append("gambar[]", file));

        // Append existing images to keep
        existingPhotos.forEach((img) =>
            formData.append("existing_images[]", img),
        );

        try {
            await axios.post(
                route("dashboard.berita.update", berita.slug),
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        "X-Requested-With": "XMLHttpRequest",
                        Accept: "application/json",
                    },
                },
            );

            enqueueSnackbar(`Berita ${data.judul} berhasil diperbarui`, {
                variant: "success",
            });

            setTimeout(
                () => router.visit(route("dashboard.berita.index")),
                1000,
            );
        } catch (error) {
            let errorMsg = "Gagal Memperbarui Berita: ";
            if (error.response?.data?.message)
                errorMsg += error.response.data.message;
            else errorMsg += "Terjadi Kesalahan";
            enqueueSnackbar(errorMsg, { variant: "error" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout title="Edit Berita">
            <Head title={`Edit Berita - ${berita.judul}`} />

            <div className="w-full">
                <div>
                    <PageHeader
                        icon={FaEdit}
                        title="Edit Berita"
                        description="Perbarui informasi berita"
                    />

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Main Grid: Content (Left) & Meta (Right) */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            {/* Left Column: Editor Area */}
                            <div className="lg:col-span-8 space-y-6">
                                {/* Title Input - Seamless with Editor */}
                                <div className="surface p-6 sm:p-8">
                                    <div className="space-y-6">
                                        <label
                                            htmlFor="judul-berita"
                                            className="eyebrow"
                                        >
                                            Judul &amp; Konten
                                        </label>
                                        <input
                                            id="judul-berita"
                                            type="text"
                                            value={data.judul}
                                            onChange={(e) =>
                                                setData("judul", e.target.value)
                                            }
                                            placeholder="Judul Berita..."
                                            className="w-full border-0 border-b border-slate-100 bg-transparent px-0 pb-4 font-display text-3xl font-extrabold tracking-tight text-ink-900 placeholder-slate-300 focus:border-brand-500 focus:ring-0"
                                            required
                                        />
                                        <InputError message={errors.judul} />

                                        {/* Editor.js Container */}
                                        <div className="prose prose-lg prose-slate max-w-none">
                                            <div
                                                id="editorjs"
                                                className="min-h-[400px] outline-none"
                                            ></div>
                                        </div>
                                        <InputError message={errors.isi} />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Settings & Meta */}
                            <div className="lg:col-span-4 space-y-6">
                                <div className="sticky top-24 space-y-6">
                                    {/* Publish Card */}
                                    <Card
                                        title="Publikasi"
                                        description="Periksa permalink lalu simpan perubahan."
                                    >
                                        <div className="space-y-4">
                                            {/* Slug Preview */}
                                            <div>
                                                <InputLabel
                                                    value="Permalink (Slug)"
                                                    className="mb-1.5"
                                                />
                                                <div className="flex items-center text-sm text-slate-500 bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 truncate">
                                                    <span className="mr-1 opacity-50">
                                                        /berita/
                                                    </span>
                                                    <span className="font-semibold text-ink-900 truncate">
                                                        {data.slug || "..."}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            <div className="flex flex-col-reverse gap-2 sm:flex-row">
                                                <Link
                                                    href={route(
                                                        "dashboard.berita.index",
                                                    )}
                                                    className="btn-ghost sm:flex-1"
                                                >
                                                    Batal
                                                </Link>
                                                <button
                                                    type="submit"
                                                    disabled={
                                                        processing ||
                                                        isSubmitting
                                                    }
                                                    className="btn-brand sm:flex-[2]"
                                                >
                                                    {processing ||
                                                    isSubmitting ? (
                                                        <>
                                                            <FaSpinner className="animate-spin" />
                                                            Menyimpan...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FaSave />
                                                            Simpan Perubahan
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </Card>

                                    {/* Settings Card */}
                                    <Card
                                        title="Pengaturan Berita"
                                        description="Tema, ringkasan, dan foto berita."
                                        bodyClassName="space-y-6"
                                    >
                                        {/* Tema */}
                                        <div className="relative">
                                            <InputLabel
                                                value="Kategori / Tema"
                                                className="mb-1.5"
                                            />
                                            <Combobox
                                                value={selectedTema}
                                                onChange={setSelectedTema}
                                                nullable
                                            >
                                                <div className="relative mt-1">
                                                    <div className="relative w-full cursor-default overflow-hidden rounded-xl bg-white text-left border border-slate-200 shadow-sm transition hover:border-slate-300 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 sm:text-sm">
                                                        <Combobox.Input
                                                            className="w-full border-none py-2.5 pl-3.5 pr-10 text-sm leading-5 text-ink-900 placeholder:text-slate-400 bg-transparent focus:ring-0"
                                                            displayValue={(
                                                                tema,
                                                            ) =>
                                                                tema?.nama ??
                                                                query
                                                            }
                                                            onChange={(event) =>
                                                                setQuery(
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="Cari atau buat tema..."
                                                        />
                                                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                                                            <ChevronUpDownIcon
                                                                className="h-5 w-5 text-slate-400"
                                                                aria-hidden="true"
                                                            />
                                                        </Combobox.Button>
                                                    </div>
                                                    <Transition
                                                        as={Fragment}
                                                        leave="transition ease-in duration-100"
                                                        leaveFrom="opacity-100"
                                                        leaveTo="opacity-0"
                                                        afterLeave={() =>
                                                            setQuery("")
                                                        }
                                                    >
                                                        <Combobox.Options className="absolute mt-2 max-h-60 w-full overflow-auto rounded-xl border border-slate-200/80 bg-white p-1 text-base shadow-lift focus:outline-none sm:text-sm z-50">
                                                            {filteredTemas.length ===
                                                                0 &&
                                                            query !== "" ? (
                                                                <div className="relative cursor-default select-none py-2 px-3 text-slate-600">
                                                                    Buat tema
                                                                    baru:{" "}
                                                                    <span className="font-semibold">
                                                                        "{query}
                                                                        "
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                filteredTemas.map(
                                                                    (tema) => (
                                                                        <Combobox.Option
                                                                            key={
                                                                                tema.id
                                                                            }
                                                                            className={({
                                                                                active,
                                                                            }) =>
                                                                                `relative cursor-default select-none rounded-lg py-2 pl-10 pr-4 ${
                                                                                    active
                                                                                        ? "bg-brand-50 text-brand-800"
                                                                                        : "text-slate-700"
                                                                                }`
                                                                            }
                                                                            value={
                                                                                tema
                                                                            }
                                                                        >
                                                                            {({
                                                                                selected,
                                                                                active,
                                                                            }) => (
                                                                                <>
                                                                                    <span
                                                                                        className={`block truncate ${
                                                                                            selected
                                                                                                ? "font-medium"
                                                                                                : "font-normal"
                                                                                        }`}
                                                                                    >
                                                                                        {
                                                                                            tema.nama
                                                                                        }
                                                                                    </span>
                                                                                    {selected ? (
                                                                                        <span
                                                                                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                                                                                active
                                                                                                    ? "text-brand-600"
                                                                                                    : "text-brand-600"
                                                                                            }`}
                                                                                        >
                                                                                            <CheckIcon
                                                                                                className="h-5 w-5"
                                                                                                aria-hidden="true"
                                                                                            />
                                                                                        </span>
                                                                                    ) : null}
                                                                                </>
                                                                            )}
                                                                        </Combobox.Option>
                                                                    ),
                                                                )
                                                            )}
                                                        </Combobox.Options>
                                                    </Transition>
                                                </div>
                                            </Combobox>
                                        </div>

                                        {/* Excerpt */}
                                        <div>
                                            <InputLabel
                                                value="Ringkasan (Excerpt)"
                                                className="mb-1.5"
                                            />
                                            <textarea
                                                value={data.excerpt}
                                                onChange={(e) =>
                                                    setData(
                                                        "excerpt",
                                                        e.target.value,
                                                    )
                                                }
                                                className="field-input"
                                                rows="4"
                                                placeholder="Tulis ringkasan singkat berita..."
                                                required
                                            ></textarea>
                                            <InputError
                                                message={errors.excerpt}
                                            />
                                        </div>

                                        {/* Images */}
                                        <div>
                                            <InputLabel
                                                value="Foto Berita"
                                                className="mb-1.5"
                                            />
                                            <div className="space-y-4">
                                                {/* Existing Photos */}
                                                {existingPhotos.length > 0 && (
                                                    <div className="space-y-2">
                                                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.12em]">
                                                            Foto Saat Ini
                                                        </p>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {existingPhotos.map(
                                                                (
                                                                    photo,
                                                                    index,
                                                                ) => (
                                                                    <div
                                                                        key={`existing-${index}`}
                                                                        className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100"
                                                                    >
                                                                        <img
                                                                            src={`/storage/berita/${photo}`}
                                                                            alt={`Existing ${index}`}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                removeExistingPhoto(
                                                                                    index,
                                                                                )
                                                                            }
                                                                            className="absolute top-1.5 right-1.5 bg-rose-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity shadow-soft hover:bg-rose-700"
                                                                            aria-label={`Hapus foto ${index + 1}`}
                                                                        >
                                                                            <FaTrash
                                                                                size={
                                                                                    12
                                                                                }
                                                                            />
                                                                        </button>
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* New Photos */}
                                                {previewPhotos.length > 0 && (
                                                    <div className="space-y-2">
                                                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.12em]">
                                                            Foto Baru
                                                        </p>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {previewPhotos.map(
                                                                (
                                                                    src,
                                                                    index,
                                                                ) => (
                                                                    <div
                                                                        key={`new-${index}`}
                                                                        className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100"
                                                                    >
                                                                        <img
                                                                            src={
                                                                                src
                                                                            }
                                                                            alt={`New ${index}`}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                removePhoto(
                                                                                    index,
                                                                                )
                                                                            }
                                                                            className="absolute top-1.5 right-1.5 bg-rose-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity shadow-soft hover:bg-rose-700"
                                                                            aria-label={`Hapus foto baru ${index + 1}`}
                                                                        >
                                                                            <FaTrash
                                                                                size={
                                                                                    12
                                                                                }
                                                                            />
                                                                        </button>
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Upload Button */}
                                                <div
                                                    onClick={() =>
                                                        fileInputRef.current.click()
                                                    }
                                                    className="group border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-500 hover:border-brand-300 hover:bg-brand-50/40 transition-colors cursor-pointer"
                                                >
                                                    <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors group-hover:bg-brand-50 group-hover:text-brand-600">
                                                        <FaImage className="w-4 h-4" />
                                                    </span>
                                                    <span className="text-sm font-semibold text-ink-900">
                                                        Tambah Foto
                                                    </span>
                                                    <span className="text-xs mt-0.5 text-slate-500">
                                                        Maks. 5 foto total
                                                    </span>
                                                    <input
                                                        type="file"
                                                        ref={fileInputRef}
                                                        onChange={
                                                            handleFileUpload
                                                        }
                                                        className="hidden"
                                                        multiple
                                                        accept="image/*"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </form>

                </div>
            </div>
        </DashboardLayout>
    );
}
