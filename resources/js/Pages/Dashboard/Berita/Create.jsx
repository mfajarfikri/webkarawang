import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, router } from "@inertiajs/react";
import { Color } from "@tiptap/extension-color";
import ListItem from "@tiptap/extension-list-item";
import TextStyle from "@tiptap/extension-text-style";
import { EditorProvider, useCurrentEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React, { useEffect, useRef, useState, usePage } from "react";
import {
    FaBold,
    FaCode,
    FaItalic,
    FaQuoteLeft,
    FaRedo,
    FaStrikethrough,
    FaUndo,
    FaTimes,
    FaPlus,
    FaMinus,
    FaAlignLeft,
    FaAlignCenter,
    FaAlignRight,
    FaAlignJustify,
    FaSave,
    FaSpinner,
} from "react-icons/fa";
import { useForm } from "@inertiajs/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TextAlign from "@tiptap/extension-text-align";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import { AiOutlineMergeCells, AiOutlineSplitCells } from "react-icons/ai";
import {
    TbBrush,
    TbColumnInsertLeft,
    TbColumnInsertRight,
    TbColumnRemove,
    TbRowInsertBottom,
    TbRowInsertTop,
    TbRowRemove,
    TbTableMinus,
    TbTablePlus,
} from "react-icons/tb";
import axios from "axios";

export default function Create({ karyawans, flash, auth }) {
    const generateSlug = (text) => {
        if (!text) return ""; // jika kosong, kembalikan string kosong
        return text
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");
    };

    const { data, setData, post, processing, errors, reset } = useForm({
        judul: "",
        slug: generateSlug(),
        isi: "",
    });

    useEffect(() => {
        if (data.judul) {
            setData("slug", generateSlug(data.judul));
        }
    }, [data.judul]);

    const formData = new FormData();
    const [photos, setPhotos] = useState([]); // will store File objects
    const [previewPhotos, setPreviewPhotos] = useState([]); // will store preview URLs
    const fileInputRef = useRef(null);

    const toastConfig = {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    };

    const compressAndConvertImage = (file) => {
        return new Promise((resolve, reject) => {
            // Cek apakah file adalah gambar
            if (!file.type.startsWith("image/")) {
                reject(new Error("File bukan gambar"));
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    // Hitung dimensi baru (maksimal 1200px)
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

                    // Buat canvas untuk kompresi
                    const canvas = document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = height;

                    // Gambar ke canvas
                    const ctx = canvas.getContext("2d");
                    ctx.fillStyle = "#FFFFFF"; // Tambahkan background putih untuk gambar transparan
                    ctx.fillRect(0, 0, width, height);
                    ctx.drawImage(img, 0, 0, width, height);

                    // Konversi ke JPEG dengan kualitas 75% (lebih rendah untuk mengurangi ukuran)
                    canvas.toBlob(
                        (blob) => {
                            // Buat file baru dengan tipe JPEG
                            const newFile = new File([blob], `${file.name}`, {
                                type: "image/jpeg",
                                lastModified: Date.now(),
                            });
                            resolve(newFile);
                        },
                        "image/jpeg",
                        0.75
                    );
                };

                img.onerror = () => {
                    reject(new Error("Gagal memuat gambar"));
                };

                img.src = event.target.result;
            };

            reader.onerror = () => {
                reject(new Error("Gagal membaca file"));
            };

            reader.readAsDataURL(file);
        });
    };

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files || []);

        if (files.length === 0) return;

        if (photos.length + files.length > 5) {
            toast.error("Maksimal 5 Foto yang dapat diupload", toastConfig);
            return;
        }
        const loadingToastId = toast.loading("Memproses Foto...", toastConfig);

        try {
            const processedFiles = [];
            for (const file of files) {
                try {
                    const processedFile = await compressAndConvertImage(file);
                    processedFiles.push(processedFile);
                } catch (error) {
                    console.error("Error processing file:", error);
                    toast.error(
                        `Gagal Memproses gambar "${file.name}": ${error.message}`,
                        toastConfig
                    );
                }
            }
            if (processedFiles.length === 0) {
                toast.update(loadingToastId, {
                    render: "Tidak ada gambar valid untuk diunggah",
                    type: "error",
                    isLoading: false,
                    autoClose: 3000,
                });
                return;
            }
            setPhotos((prevPhotos) => [...prevPhotos, ...processedFiles]);

            processedFiles.forEach((file) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setPreviewPhotos((prevPreviews) => [
                        ...prevPreviews,
                        e.target.result,
                    ]);
                };
                reader.readAsDataURL(file);
            });

            // Reset input file
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
                fileInputRef.current.removeAttribute("capture");
            }

            // Update loading toast
            toast.update(loadingToastId, {
                render: `${processedFiles.length} foto berhasil diproses!`,
                type: "success",
                isLoading: false,
                autoClose: 3000,
            });
        } catch (error) {
            console.error("Error in handleFileUpload:", error);
            toast.update(loadingToastId, {
                render: "Terjadi kesalahan saat memproses foto",
                type: "error",
                isLoading: false,
                autoClose: 3000,
            });
        }

        // const newPreviews = files.map((file) => URL.createObjectURL(file));
        // setPhotos((prevPhotos) => [...prevPhotos, ...files]);
        // setPreviewPhotos((prevPreview) => [...prevPreview, ...newPreviews]);
    };

    const removePhoto = (index) => {
        setPhotos((prevPhotos) => prevPhotos.filter((_, i) => i !== index));
        setPreviewPhotos((prevPreview) =>
            prevPreview.filter((_, i) => i !== index)
        );
    };

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success, toastConfig);
        }
        if (flash?.error) {
            toast.error(flash.error, toastConfig);
        }
    }, [flash]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setIsSubmitting(true); // Mengatur status pengiriman

        // Validasi untuk foto (jika belum ada foto yang dipilih)
        if (photos.length === 0) {
            toast.error("Harap Tambahkan minimal 1 foto", toastConfig);
            setIsSubmitting(false);
            return;
        }

        const formData = new FormData();
        formData.append("judul", data.judul);
        formData.append("slug", data.slug);
        formData.append("isi", data.isi);
        formData.append("karyawan_id", data.karyawan_id);
        photos.forEach((file) => {
            formData.append("gambar[]", file);
        });

        try {
            const response = await axios.post(route("berita.store"), formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "X-Requested-With": "XMLHttpRequest",
                    Accept: "application/json",
                },
            });

            // Menampilkan notifikasi sukses setelah data berhasil dikirim
            toast.success(`Berita ${data.judul} berhasil dibuat`, toastConfig);

            // Reset form dan gambar
            reset();
            setPhotos([]);
            setPreviewPhotos([]);

            // Mengarahkan pengguna ke halaman berita
            setTimeout(() => {
                router.visit(route("berita.index"));
            }, 2000);
        } catch (error) {
            console.error("Error details:", error.response?.data);
            toast.error(
                error.response?.data?.message ||
                    "Gagal Membuat Berita: " +
                        (error.response?.data?.gambar || "Terjadi Kesalahan"),
                toastConfig
            );
        } finally {
            setIsSubmitting(false); // Mengatur status pengiriman kembali ke false
        }
    };

    const MenuBar = () => {
        const { editor } = useCurrentEditor();

        if (!editor) {
            return null;
        }

        return (
            <div className="bg-white border border-gray-200 rounded-t-lg shadow-sm">
                <div className="flex flex-wrap items-center p-2 gap-1">
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() =>
                                editor.chain().focus().toggleBold().run()
                            }
                            disabled={
                                !editor.can().chain().focus().toggleBold().run()
                            }
                            className={`p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors ${
                                editor.isActive("bold")
                                    ? "bg-blue-50 text-blue-600"
                                    : ""
                            }`}
                            title="Bold"
                        >
                            <FaBold className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() =>
                                editor.chain().focus().toggleItalic().run()
                            }
                            disabled={
                                !editor
                                    .can()
                                    .chain()
                                    .focus()
                                    .toggleItalic()
                                    .run()
                            }
                            className={`p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors ${
                                editor.isActive("italic")
                                    ? "bg-blue-50 text-blue-600"
                                    : ""
                            }`}
                            title="Italic"
                        >
                            <FaItalic className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() =>
                                editor.chain().focus().toggleStrike().run()
                            }
                            disabled={
                                !editor
                                    .can()
                                    .chain()
                                    .focus()
                                    .toggleStrike()
                                    .run()
                            }
                            className={`p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors ${
                                editor.isActive("strike")
                                    ? "bg-blue-50 text-blue-600"
                                    : ""
                            }`}
                            title="Strikethrough"
                        >
                            <FaStrikethrough className="w-4 h-4" />
                        </button>
                        <div className="w-px h-6 bg-gray-200 mx-1"></div>
                        <button
                            onClick={() =>
                                editor
                                    .chain()
                                    .focus()
                                    .toggleHeading({ level: 1 })
                                    .run()
                            }
                            className={`p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors ${
                                editor.isActive("heading", { level: 1 })
                                    ? "bg-blue-50 text-blue-600"
                                    : ""
                            }`}
                            title="Heading 1"
                        >
                            H1
                        </button>
                        <button
                            onClick={() =>
                                editor
                                    .chain()
                                    .focus()
                                    .toggleHeading({ level: 2 })
                                    .run()
                            }
                            className={`p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors ${
                                editor.isActive("heading", { level: 2 })
                                    ? "bg-blue-50 text-blue-600"
                                    : ""
                            }`}
                            title="Heading 2"
                        >
                            H2
                        </button>
                        <button
                            onClick={() =>
                                editor
                                    .chain()
                                    .focus()
                                    .toggleHeading({ level: 3 })
                                    .run()
                            }
                            className={`p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors ${
                                editor.isActive("heading", { level: 3 })
                                    ? "bg-blue-50 text-blue-600"
                                    : ""
                            }`}
                            title="Heading 3"
                        >
                            H3
                        </button>
                        <div className="w-px h-6 bg-gray-200 mx-1"></div>
                        <button
                            onClick={() =>
                                editor
                                    .chain()
                                    .focus()
                                    .setTextAlign("left")
                                    .run()
                            }
                            className={`p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors
                               ${
                                   editor.isActive({ textAlign: "left" })
                                       ? "is-active"
                                       : ""
                               }
                            `}
                            title="Align Left"
                        >
                            <FaAlignLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() =>
                                editor
                                    .chain()
                                    .focus()
                                    .setTextAlign("center")
                                    .run()
                            }
                            className={`p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors
                                ${
                                    editor.isActive({ textAlign: "center" })
                                        ? "is-active"
                                        : ""
                                }
                            `}
                            title="Align Center"
                        >
                            <FaAlignCenter className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() =>
                                editor
                                    .chain()
                                    .focus()
                                    .setTextAlign("right")
                                    .run()
                            }
                            className={`p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors
                                ${
                                    editor.isActive({ textAlign: "right" })
                                        ? "is-active"
                                        : ""
                                }
                            `}
                            title="Align Right"
                        >
                            <FaAlignRight className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() =>
                                editor
                                    .chain()
                                    .focus()
                                    .setTextAlign("justify")
                                    .run()
                            }
                            className={`p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors
                                ${
                                    editor.isActive({ textAlign: "justify" })
                                        ? "is-active"
                                        : ""
                                }
                            `}
                            title="Align Justify"
                        >
                            <FaAlignJustify className="w-4 h-4" />
                        </button>
                        <div className="w-px h-6 bg-gray-200 mx-1"></div>
                        <button
                            onClick={() =>
                                editor.chain().focus().toggleBlockquote().run()
                            }
                            className={`p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors ${
                                editor.isActive("blockquote")
                                    ? "bg-blue-50 text-blue-600"
                                    : ""
                            }`}
                            title="Quote"
                        >
                            <FaQuoteLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() =>
                                editor.chain().focus().toggleCodeBlock().run()
                            }
                            className={`p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors ${
                                editor.isActive("codeBlock")
                                    ? "bg-blue-50 text-blue-600"
                                    : ""
                            }`}
                            title="Code Block"
                        >
                            <FaCode className="w-4 h-4" />
                        </button>

                        <div className="w-px h-6 bg-gray-200 mx-1"></div>
                        <button
                            onClick={() => editor.chain().focus().undo().run()}
                            disabled={
                                !editor.can().chain().focus().undo().run()
                            }
                            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Undo"
                        >
                            <FaUndo className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().redo().run()}
                            disabled={
                                !editor.can().chain().focus().redo().run()
                            }
                            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Redo"
                        >
                            <FaRedo className="w-4 h-4" />
                        </button>

                        <button
                            onClick={() =>
                                editor.chain().focus().setHorizontalRule().run()
                            }
                            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
                            title="Horizontal Rule"
                        >
                            <FaMinus className="w-4 h-4" />
                        </button>
                        <div className="w-px h-6 bg-gray-200 mx-1"></div>
                        <button
                            onClick={() =>
                                editor
                                    .chain()
                                    .focus()
                                    .insertTable({
                                        rows: 3,
                                        cols: 3,
                                        withHeaderRow: true,
                                    })
                                    .run()
                            }
                            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Insert Table"
                        >
                            <TbTablePlus className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() =>
                                editor.chain().focus().deleteTable().run()
                            }
                            disabled={!editor.can().deleteTable()}
                            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete Table"
                        >
                            <TbTableMinus className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() =>
                                editor.chain().focus().addColumnBefore().run()
                            }
                            disabled={!editor.can().addColumnBefore()}
                            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Add Column Before"
                        >
                            <TbColumnInsertLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() =>
                                editor.chain().focus().addColumnAfter().run()
                            }
                            disabled={!editor.can().addColumnAfter()}
                            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Add Column After"
                        >
                            <TbColumnInsertRight className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() =>
                                editor.chain().focus().deleteColumn().run()
                            }
                            disabled={!editor.can().deleteColumn()}
                            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <TbColumnRemove className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() =>
                                editor.chain().focus().addRowBefore().run()
                            }
                            disabled={!editor.can().addRowBefore()}
                            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Add Row Before"
                        >
                            <TbRowInsertTop className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() =>
                                editor.chain().focus().addRowAfter().run()
                            }
                            disabled={!editor.can().addRowAfter()}
                            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Add Row After"
                        >
                            <TbRowInsertBottom className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() =>
                                editor.chain().focus().deleteRow().run()
                            }
                            disabled={!editor.can().deleteRow()}
                            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete Row"
                        >
                            <TbRowRemove className="w-5 h-5" />
                        </button>

                        <button
                            onClick={() =>
                                editor.chain().focus().mergeCells().run()
                            }
                            disabled={!editor.can().mergeCells()}
                            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Merge Cell"
                        >
                            <AiOutlineMergeCells className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() =>
                                editor.chain().focus().splitCell().run()
                            }
                            disabled={!editor.can().splitCell()}
                            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Split Cell"
                        >
                            <AiOutlineSplitCells className="w-5 h-5" />
                        </button>

                        <button
                            onClick={() =>
                                editor.chain().focus().toggleHeaderCell().run()
                            }
                            disabled={!editor.can().toggleHeaderCell()}
                            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Toggle Cell"
                        >
                            <TbBrush className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const extensions = [
        StarterKit,
        Table.configure({
            resizable: true,
        }),
        TableCell,
        TableRow,
        TableHeader,
        Color.configure({ types: [TextStyle.name, ListItem.name] }),
        TextStyle.configure({ types: [ListItem.name] }),
        TextAlign.configure({ types: ["heading", "paragraph"] }),
    ];

    return (
        <>
            <Head title="Create Berita" />
            <DashboardLayout>
                <ToastContainer />
                <div className="w-full mx-auto p-6">
                    <h1 className="text-2xl font-bold mb-6">Create Berita</h1>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label
                                htmlFor="judul"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Judul
                            </label>
                            <input
                                type="text"
                                id="judul"
                                value={data.judul}
                                onChange={(e) =>
                                    setData("judul", e.target.value)
                                }
                                className="mt-1 block w-full rounded-md uppercase border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                                autoComplete="off"
                            />
                            {errors.judul && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.judul}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="slug"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Slug
                            </label>
                            <input
                                type="text"
                                id="slug"
                                value={data.slug}
                                onChange={(e) =>
                                    setData("slug", e.target.value)
                                }
                                className="mt-1 block w-full rounded-md disabled:cursor-not-allowed bg-gray-200 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                                disabled
                            />
                            {errors.slug && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.slug}
                                </p>
                            )}
                        </div>
                        <div>
                            <label
                                htmlFor="foto_berita"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Foto Berita
                            </label>
                            <div className="mt-1 border-2 border-gray-300 border-solid rounded-lg p-4 bg-white">
                                {previewPhotos.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center space-y-3 py-5">
                                        <svg
                                            className="mx-auto h-12 w-12 text-gray-400"
                                            stroke="currentColor"
                                            fill="none"
                                            viewBox="0 0 48 48"
                                            aria-hidden="true"
                                        >
                                            <path
                                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                strokeWidth={2}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                        <div className="flex text-sm text-gray-600">
                                            <label
                                                htmlFor="file-upload"
                                                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                                            >
                                                <span className="px-2">
                                                    Upload file
                                                </span>
                                                <input
                                                    id="file-upload"
                                                    name="gambar[]"
                                                    type="file"
                                                    className="sr-only"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={handleFileUpload}
                                                    ref={fileInputRef}
                                                />
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            Image hingga 5MB (Maksimal 5 foto)
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {previewPhotos.map((preview, index) => (
                                            <div
                                                key={index}
                                                className="relative group"
                                            >
                                                <img
                                                    src={preview}
                                                    alt={`Preview ${index + 1}`}
                                                    className="w-full h-auto object-cover rounded-lg hover:shadow-lg hover:border border-solid transition hover:scale-105 duration-300 border-gray-300"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removePhoto(index)
                                                    }
                                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                                >
                                                    <FaTimes className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                        {previewPhotos.length < 5 && (
                                            <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500  transition-colors bg-gray-50">
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={handleFileUpload}
                                                    ref={fileInputRef}
                                                />
                                                <FaPlus className="w-6 h-6 text-gray-400" />
                                                <span className="mt-2 text-sm text-gray-500">
                                                    Tambah Foto
                                                </span>
                                            </label>
                                        )}
                                    </div>
                                )}
                            </div>
                            {photos.length > 0 && (
                                <div className="mt-2 flex items-center justify-between">
                                    <p className="text-sm text-gray-600">
                                        {photos.length} foto terpilih (
                                        {photos.length}/5)
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPhotos([]);
                                            setPreviewPhotos([]);
                                            if (fileInputRef.current) {
                                                fileInputRef.current.value = "";
                                            }
                                        }}
                                        className="text-sm text-red-600 hover:text-red-800 "
                                    >
                                        Hapus Semua
                                    </button>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Isi Berita
                            </label>
                            <div className="mt-1">
                                <EditorProvider
                                    slotBefore={<MenuBar />}
                                    extensions={extensions}
                                    content={data.isi}
                                    onUpdate={({ editor }) => {
                                        setData("isi", editor.getHTML());
                                    }}
                                />
                            </div>
                            {errors.isi && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.isi}
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={processing || isSubmitting}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {processing || isSubmitting ? (
                                    <>
                                        <FaSpinner className="animate-spin w-4 h-4" />
                                        <span>Menyimpan...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaSave className="w-4 h-4 mr-1" />
                                        <span>Simpan</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </DashboardLayout>
        </>
    );
}
