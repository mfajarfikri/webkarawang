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
} from "react-icons/fa";
import { useForm } from "@inertiajs/react";
import { useSnackbar } from "notistack";
import axios from "axios";
import Modal from "react-modal";
import ApplicationLogo from "@/Components/ApplicationLogo";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
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
import Marker from "@editorjs/marker";
import Underline from "@editorjs/underline";
import Checklist from "@editorjs/checklist";
import Delimiter from "@editorjs/delimiter";
import Embed from "@editorjs/embed";
import Warning from "@editorjs/warning";
import Raw from "@editorjs/raw";
import LinkTool from "@editorjs/link";
import { edjsParser, sanitizeEditorData } from "@/utils/editorParser";
import Undo from "editorjs-undo";
import DragDrop from "editorjs-drag-drop";

export default function Create({ temas = [], flash }) {
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
        judul: "",
        excerpt: "",
        slug: "",
        isi: "",
        tema: "",
    });

    // Theme Selection Logic
    const [selectedTema, setSelectedTema] = useState(null);
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
        if (data.judul) {
            setData("slug", generateSlug(data.judul));
        }
    }, [data.judul]);

    // Image Upload Logic
    const [photos, setPhotos] = useState([]);
    const [previewPhotos, setPreviewPhotos] = useState([]);
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

        if (photos.length + files.length > 5) {
            enqueueSnackbar("Maksimal 5 Foto yang dapat diupload", {
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

    // Editor.js Integration
    const editorInstance = useRef(null);

    useEffect(() => {
        if (!editorInstance.current) {
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
                            endpoint: "/dashboard/berita/fetch-url",
                        },
                    },
                },
                onReady: () => {
                    new Undo({ editor });
                    new DragDrop(editor);
                },
                data: sanitizeEditorData({}), // Initial empty data safeguarded
                minHeight: 0,
            });
            editorInstance.current = editor;
        }

        return () => {
            if (editorInstance.current && editorInstance.current.destroy) {
                // Check if destroy is a function before calling, just in case
                if (typeof editorInstance.current.destroy === "function") {
                    editorInstance.current.destroy();
                }
                editorInstance.current = null;
            }
        };
    }, []);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [localErrors, setLocalErrors] = useState({});

    // Client-side Validation Logic
    useEffect(() => {
        const validate = () => {
            const newErrors = {};

            // Judul Validation
            if (data.judul.trim()) {
                if (data.judul.length < 5) {
                    newErrors.judul = "Judul minimal 5 karakter";
                } else if (data.judul.length > 255) {
                    newErrors.judul = "Judul maksimal 255 karakter";
                }
            }

            // Excerpt Validation
            if (data.excerpt.trim()) {
                if (data.excerpt.length < 20) {
                    newErrors.excerpt = "Ringkasan minimal 20 karakter";
                } else if (data.excerpt.length > 500) {
                    newErrors.excerpt = "Ringkasan maksimal 500 karakter";
                }
            }

            // Tema Validation (if typed but not selected from list)
            if (query && !selectedTema) {
                if (query.length < 2) {
                    newErrors.tema = "Nama tema minimal 2 karakter";
                }
            }

            setLocalErrors(newErrors);
        };

        const timer = setTimeout(validate, 300);
        return () => clearTimeout(timer);
    }, [data.judul, data.excerpt, query, selectedTema]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (photos.length === 0) {
            enqueueSnackbar("Harap Tambahkan minimal 1 foto", {
                variant: "error",
            });
            setIsSubmitting(false);
            return;
        }

        // Process Editor Content
        let contentHtml = "";
        let contentJson = "";
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

        if (!contentHtml.trim()) {
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

        photos.forEach((file) => formData.append("gambar[]", file));

        try {
            await axios.post(route("dashboard.berita.store"), formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "X-Requested-With": "XMLHttpRequest",
                    Accept: "application/json",
                },
            });

            enqueueSnackbar(`Berita ${data.judul} berhasil dibuat`, {
                variant: "success",
            });
            reset();
            setPhotos([]);
            setPreviewPhotos([]);
            // Clear editor content
            if (editorInstance.current) {
                editorInstance.current.clear();
            }
            setTimeout(
                () => router.visit(route("dashboard.berita.index")),
                2000,
            );
        } catch (error) {
            let errorMsg = "Gagal Membuat Berita: ";
            if (error.response?.data?.message)
                errorMsg += error.response.data.message;
            else errorMsg += "Terjadi Kesalahan";
            enqueueSnackbar(errorMsg, { variant: "error" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <Head title="Buat Berita" />

            <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Simple Clean Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
                                Tulis Berita
                            </h1>
                            <p className="text-slate-500 mt-1">
                                Bagikan informasi terkini kepada semua orang
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                            <ApplicationLogo className="h-8 w-8 opacity-50" />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Main Grid: Content (Left) & Meta (Right) */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Left Column: Editor Area (Focus Mode) - Takes up more space */}
                            <div className="lg:col-span-8 space-y-6">
                                {/* Title Input - Seamless with Editor */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                                    <div className="space-y-6">
                                        <input
                                            type="text"
                                            value={data.judul}
                                            onChange={(e) =>
                                                setData("judul", e.target.value)
                                            }
                                            placeholder="Judul Berita..."
                                            className={`w-full text-4xl font-bold border-none focus:ring-0 p-0 bg-transparent ${
                                                errors.judul
                                                    ? "text-red-900 placeholder-red-300"
                                                    : "text-slate-900 placeholder-slate-300"
                                            }`}
                                            required
                                        />
                                        <InputError message={errors.judul} />

                                        {/* Editor.js Container */}
                                        <div className="prose prose-lg prose-slate max-w-none">
                                            <div
                                                id="editorjs"
                                                className={`min-h-[400px] outline-none ${
                                                    errors.isi
                                                        ? "border border-red-300 rounded-lg p-4 bg-red-50/10"
                                                        : ""
                                                }`}
                                            ></div>
                                        </div>
                                        <InputError message={errors.isi} />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Settings & Meta - Sticky */}
                            <div className="lg:col-span-4 space-y-6">
                                <div className="sticky top-8 space-y-6">
                                    {/* Publish Card */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                        <h3 className="text-lg font-semibold text-slate-800 mb-4">
                                            Publikasi
                                        </h3>

                                        <div className="space-y-4">
                                            {/* Slug Preview */}
                                            <div>
                                                <InputLabel
                                                    value="Permalink (Slug)"
                                                    className="text-xs uppercase tracking-wider text-slate-400 mb-1"
                                                />
                                                <div className="flex items-center text-sm text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 truncate">
                                                    <span className="mr-1 opacity-50">
                                                        /berita/
                                                    </span>
                                                    <span className="font-medium text-slate-700 truncate">
                                                        {data.slug || "..."}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            <PrimaryButton
                                                type="submit"
                                                disabled={
                                                    processing || isSubmitting
                                                }
                                                className="w-full justify-center py-3 bg-blue-600 hover:bg-blue-700 rounded-xl"
                                            >
                                                {processing || isSubmitting ? (
                                                    <>
                                                        <FaSpinner className="animate-spin mr-2" />{" "}
                                                        Menyimpan...
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaSave className="mr-2" />{" "}
                                                        Terbitkan Berita
                                                    </>
                                                )}
                                            </PrimaryButton>
                                        </div>
                                    </div>

                                    {/* Settings Card */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
                                        <h3 className="text-lg font-semibold text-slate-800">
                                            Pengaturan Berita
                                        </h3>

                                        {/* Tema */}
                                        <div className="relative">
                                            <InputLabel
                                                value="Kategori / Tema"
                                                className="text-slate-700 font-medium mb-2"
                                            />
                                            <Combobox
                                                value={selectedTema}
                                                onChange={setSelectedTema}
                                                nullable
                                            >
                                                <div className="relative mt-1">
                                                    <div className="relative w-full cursor-default overflow-hidden rounded-xl bg-slate-50 text-left border border-slate-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 sm:text-sm">
                                                        <Combobox.Input
                                                            className="w-full border-none py-2.5 pl-4 pr-10 text-sm leading-5 text-slate-900 bg-transparent focus:ring-0"
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
                                                        <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-50">
                                                            {filteredTemas.length ===
                                                                0 &&
                                                            query !== "" ? (
                                                                <Combobox.Option
                                                                    value={{
                                                                        id: null,
                                                                        nama: query,
                                                                    }}
                                                                    className={({
                                                                        active,
                                                                    }) =>
                                                                        `relative cursor-default select-none py-2 pl-4 pr-4 ${
                                                                            active
                                                                                ? "bg-blue-50 text-blue-700"
                                                                                : "text-slate-900"
                                                                        }`
                                                                    }
                                                                >
                                                                    Buat tema
                                                                    baru "
                                                                    {query}"
                                                                </Combobox.Option>
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
                                                                                `relative cursor-default select-none py-2 pl-4 pr-4 ${
                                                                                    active
                                                                                        ? "bg-blue-50 text-blue-700"
                                                                                        : "text-slate-900"
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
                                                                                        className={`block truncate ${selected ? "font-medium" : "font-normal"}`}
                                                                                    >
                                                                                        {
                                                                                            tema.nama
                                                                                        }
                                                                                    </span>
                                                                                    {selected ? (
                                                                                        <span
                                                                                            className={`absolute inset-y-0 right-0 flex items-center pr-3 ${active ? "text-blue-600" : "text-blue-600"}`}
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
                                            <InputError
                                                message={errors.tema}
                                                className="mt-2"
                                            />
                                        </div>

                                        {/* Excerpt */}
                                        <div>
                                            <InputLabel
                                                htmlFor="excerpt"
                                                value="Ringkasan Singkat"
                                                className="text-slate-700 font-medium mb-2"
                                            />
                                            <textarea
                                                id="excerpt"
                                                rows={4}
                                                className={`w-full rounded-xl transition-all text-sm ${
                                                    errors.excerpt ||
                                                    localErrors.excerpt
                                                        ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500"
                                                        : "border-slate-200 bg-slate-50 focus:border-blue-500 focus:ring-blue-500"
                                                }`}
                                                placeholder="Tulis ringkasan untuk kartu berita..."
                                                value={data.excerpt}
                                                onChange={(e) =>
                                                    setData(
                                                        "excerpt",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={
                                                    errors.excerpt ||
                                                    localErrors.excerpt
                                                }
                                                className="mt-2"
                                            />
                                        </div>

                                        {/* Image Upload */}
                                        <div>
                                            <InputLabel
                                                value="Foto Berita"
                                                className="text-slate-700 font-medium mb-2"
                                            />
                                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 hover:bg-slate-50 transition-colors text-center group cursor-pointer relative">
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={handleFileUpload}
                                                    ref={fileInputRef}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                    id="file-upload"
                                                />
                                                <div className="py-4">
                                                    <FaImage className="w-8 h-8 text-slate-300 mx-auto mb-2 group-hover:text-blue-500 transition-colors" />
                                                    <span className="text-sm font-medium text-slate-600">
                                                        Upload Foto
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Image Previews */}
                                            {previewPhotos.length > 0 && (
                                                <div className="grid grid-cols-3 gap-2 mt-4">
                                                    {previewPhotos.map(
                                                        (url, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="relative aspect-square rounded-lg overflow-hidden group border border-slate-200"
                                                            >
                                                                <img
                                                                    src={url}
                                                                    alt={`Preview ${idx}`}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        removePhoto(
                                                                            idx,
                                                                        )
                                                                    }
                                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600 z-20"
                                                                >
                                                                    <FaTimes className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            )}
                                            <InputError
                                                message={errors.gambar}
                                                className="mt-2"
                                            />
                                            {Object.keys(errors)
                                                .filter((key) =>
                                                    key.startsWith("gambar."),
                                                )
                                                .map((key) => (
                                                    <InputError
                                                        key={key}
                                                        message={errors[key]}
                                                        className="mt-1"
                                                    />
                                                ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
