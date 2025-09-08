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
    FaLevelDownAlt,
    FaNewspaper,
    FaImage,
    FaEdit,
} from "react-icons/fa";
import { useForm } from "@inertiajs/react";
import { useSnackbar } from "notistack";
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
import Modal from "react-modal";
import ApplicationLogo from "@/Components/ApplicationLogo";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";

export default function Create({ karyawans, flash, auth }) {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    React.useEffect(() => {
        Modal.setAppElement(document.body);
    }, []);

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
        excerpt: "",
        slug: generateSlug(),
        isi: "",
    });

    const initialDataRef = React.useRef({
        judul: "",
        excerpt: "",
        slug: generateSlug(""),
        isi: "",
        photos: [],
    });

    useEffect(() => {
        if (data.judul) {
            setData("slug", generateSlug(data.judul));
        }
    }, [data.judul]);

    const [photos, setPhotos] = useState([]); // will store File objects
    const [previewPhotos, setPreviewPhotos] = useState([]); // will store preview URLs
    const fileInputRef = useRef(null);
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState(null);

    useEffect(() => {
        // Set initial data snapshot on mount
        initialDataRef.current = {
            judul: data.judul,
            excerpt: data.excerpt,
            slug: data.slug,
            isi: data.isi,
            photos: photos,
        };
    }, []);

    useEffect(() => {
        console.log("Modal showLeaveModal state:", showLeaveModal);
    }, [showLeaveModal]);

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
                    console.error("Error processing file:", error);
                    enqueueSnackbar(
                        `Gagal Memproses gambar "${file.name}": ${error.message}`,
                        { variant: "error" }
                    );
                }
            }
            if (processedFiles.length === 0) {
                enqueueSnackbar("Tidak ada gambar valid untuk diunggah", {
                    variant: "error",
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
            enqueueSnackbar(
                `${processedFiles.length} foto berhasil diproses!`,
                { variant: "success" }
            );
        } catch (error) {
            console.error("Error in handleFileUpload:", error);
            enqueueSnackbar("Terjadi kesalahan saat memproses foto", {
                variant: "error",
            });
        }
    };

    const removePhoto = (index) => {
        setPhotos((prevPhotos) => prevPhotos.filter((_, i) => i !== index));
        setPreviewPhotos((prevPreview) =>
            prevPreview.filter((_, i) => i !== index)
        );
    };

    useEffect(() => {
        if (flash?.success) {
            enqueueSnackbar(flash.success, { variant: "success" });
        }
        if (flash?.error) {
            enqueueSnackbar(flash.error, { variant: "error" });
        }
    }, [flash]);

    const [isSubmitting, setIsSubmitting] = useState(false);

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

        const formData = new FormData();
        formData.append("judul", data.judul);
        formData.append("slug", data.slug);
        formData.append("excerpt", data.excerpt);
        const processedContent = data.isi
            .replace(/<p><br><\/p>/g, '<p class="mb-4"></p>')
            .replace(/<p>/g, '<p class="mb-4">');
        formData.append("isi", processedContent);
        photos.forEach((file) => {
            formData.append("gambar[]", file);
        });

        try {
            const response = await axios.post(
                route("dashboard.berita.store"),
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        "X-Requested-With": "XMLHttpRequest",
                        Accept: "application/json",
                    },
                }
            );

            enqueueSnackbar(`Berita ${data.judul} berhasil dibuat`, {
                variant: "success",
            });
            reset();
            setPhotos([]);
            setPreviewPhotos([]);

            setTimeout(() => {
                router.visit(route("dashboard.berita.index"));
            }, 2000);
        } catch (error) {
            console.error(
                "Error details:",
                error.response?.data || error.message || error
            );
            let errorMsg = "Gagal Membuat Berita: ";
            if (error.response?.data?.message) {
                errorMsg += error.response.data.message;
            } else if (error.response?.data) {
                errorMsg += JSON.stringify(error.response.data);
            } else if (error.message) {
                errorMsg += error.message;
            } else {
                errorMsg += "Terjadi Kesalahan";
            }
            enqueueSnackbar(errorMsg, { variant: "error" });
        } finally {
            setIsSubmitting(false);
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
                        <button
                            onClick={() =>
                                editor.chain().focus().setHardBreak().run()
                            }
                            title="Hard Break"
                        >
                            <FaLevelDownAlt className="w-4 h-4" />
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
        StarterKit.configure({
            paragraph: {
                HTMLAttributes: {
                    class: "mb-4",
                },
            },
            hardBreak: {
                HTMLAttributes: {
                    class: "my-4",
                },
            },
        }),
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
            <Head title="Buat Berita" />
            <DashboardLayout>
                <div className="max-w-full bg-white mx-auto border rounded-lg shadow-md">
                    <div className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-700 via-blue-500 to-indigo-500 rounded-t-lg">
                        <div className="flex items-center gap-2">
                            <ApplicationLogo className="h-8 w-8" />
                            <span className="text-white font-bold text-lg tracking-wide uppercase">
                                UPT Karawang
                            </span>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                            <FaNewspaper className="text-white h-6 w-6" />
                            <span className="text-white font-semibold text-lg">
                                Buat Berita Baru
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="border rounded-lg p-6 bg-white space-y-6">
                            <div className="flex flex-col gap-1">
                                <InputLabel
                                    htmlFor="judul"
                                    value="Judul Berita"
                                    className="text-sm font-bold tracking-wide text-gray-700"
                                />
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <FaNewspaper className="text-blue-400 h-4 w-4" />
                                    </span>
                                    <TextInput
                                        id="judul"
                                        value={data.judul}
                                        onChange={(e) =>
                                            setData("judul", e.target.value)
                                        }
                                        className="pl-10 block w-full rounded-lg border border-blue-200 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-md px-4 py-2 shadow-sm transition-all uppercase"
                                        placeholder="Masukkan judul berita"
                                        required
                                        autoComplete="off"
                                    />
                                </div>
                                <InputError message={errors.judul} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <InputLabel
                                    htmlFor="slug"
                                    value="Slug (URL)"
                                    className="text-sm font-bold tracking-wide text-gray-700"
                                />
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <FaEdit className="text-gray-400 h-4 w-4" />
                                    </span>
                                    <TextInput
                                        id="slug"
                                        value={data.slug}
                                        onChange={(e) =>
                                            setData("slug", e.target.value)
                                        }
                                        className="pl-10 block w-full rounded-lg border border-gray-200 bg-gray-100 text-md px-4 py-2 shadow-sm cursor-not-allowed"
                                        placeholder="Slug otomatis dari judul"
                                        required
                                        disabled
                                    />
                                </div>
                                <InputError message={errors.slug} />
                            </div>
                            {showLeaveModal && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                    <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
                                        <h2 className="text-lg font-semibold mb-4">
                                            Perubahan belum disimpan
                                        </h2>
                                        <p className="mb-6">
                                            Anda memiliki perubahan yang belum
                                            disimpan. Apakah Anda yakin ingin
                                            meninggalkan halaman ini?
                                        </p>
                                        <p className="text-red-600 font-bold">
                                            Modal is visible
                                        </p>
                                        <div className="flex justify-end space-x-4">
                                            <button
                                                onClick={cancelLeave}
                                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                type="button"
                                                onClick={confirmLeave}
                                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                            >
                                                Tinggalkan
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="flex flex-col gap-1">
                                <InputLabel
                                    htmlFor="excerpt"
                                    value="Ringkasan Berita"
                                    className="text-sm font-bold tracking-wide text-gray-700"
                                />
                                <textarea
                                    id="excerpt"
                                    name="excerpt"
                                    rows={3}
                                    className="block w-full rounded-lg border border-blue-200 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-sm px-4 py-2 shadow-sm transition-all italic"
                                    placeholder="Masukkan ringkasan singkat berita..."
                                    value={data.excerpt}
                                    onChange={(e) =>
                                        setData("excerpt", e.target.value)
                                    }
                                />
                                <InputError message={errors.excerpt} />
                            </div>

                            <div className="flex flex-col gap-1">
                                <InputLabel
                                    htmlFor="foto_berita"
                                    value="Foto Berita"
                                    className="text-sm font-bold tracking-wide text-gray-700"
                                />
                                <div className="border-2 border-dashed border-blue-200 rounded-lg p-4 bg-blue-50/30 hover:border-blue-300 transition-colors">
                                    {previewPhotos.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center space-y-4 py-8">
                                            <div className="p-4 bg-blue-100 rounded-full">
                                                <FaImage className="h-8 w-8 text-blue-500" />
                                            </div>
                                            <div className="text-center">
                                                <label
                                                    htmlFor="file-upload"
                                                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                                >
                                                    <FaPlus className="h-4 w-4" />
                                                    <span>Pilih Foto</span>
                                                    <input
                                                        id="file-upload"
                                                        name="gambar[]"
                                                        type="file"
                                                        className="sr-only"
                                                        accept="image/*"
                                                        multiple
                                                        onChange={
                                                            handleFileUpload
                                                        }
                                                        ref={fileInputRef}
                                                    />
                                                </label>
                                            </div>
                                            <p className="text-sm text-gray-600 text-center">
                                                Pilih hingga 5 foto (maksimal
                                                5MB per foto)
                                                <br />
                                                <span className="text-xs text-gray-500">
                                                    Format: JPG, PNG, GIF
                                                </span>
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {previewPhotos.map(
                                                (preview, index) => (
                                                    <div
                                                        key={index}
                                                        className="relative group"
                                                    >
                                                        <img
                                                            src={preview}
                                                            alt={`Preview ${
                                                                index + 1
                                                            }`}
                                                            className="w-full h-auto object-cover rounded-lg hover:shadow-lg hover:border border-solid transition hover:scale-105 duration-300 border-gray-300"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removePhoto(
                                                                    index
                                                                )
                                                            }
                                                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                                        >
                                                            <FaTimes className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )
                                            )}
                                            {previewPhotos.length < 5 && (
                                                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors bg-blue-50/50">
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        multiple
                                                        onChange={
                                                            handleFileUpload
                                                        }
                                                        ref={fileInputRef}
                                                    />
                                                    <div className="p-2 bg-blue-100 rounded-full mb-2">
                                                        <FaPlus className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    <span className="text-sm font-medium text-blue-700">
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
                                                    fileInputRef.current.value =
                                                        "";
                                                }
                                            }}
                                            className="text-sm text-red-600 hover:text-red-800 "
                                        >
                                            Hapus Semua
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col gap-1">
                                <InputLabel
                                    value="Isi Berita"
                                    className="text-sm font-bold tracking-wide text-gray-700"
                                />
                                <div className="border border-blue-200 rounded-lg overflow-hidden">
                                    <EditorProvider
                                        slotBefore={<MenuBar />}
                                        extensions={extensions}
                                        content={data.isi}
                                        onUpdate={({ editor }) => {
                                            setData("isi", editor.getHTML());
                                        }}
                                    />
                                </div>
                                <InputError message={errors.isi} />
                            </div>
                            <div className="flex justify-end pt-4">
                                <PrimaryButton
                                    type="submit"
                                    disabled={processing || isSubmitting}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150 disabled:opacity-50"
                                >
                                    {processing || isSubmitting ? (
                                        <>
                                            <FaSpinner className="animate-spin w-4 h-4" />
                                            <span>Menyimpan...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FaSave className="w-4 h-4" />
                                            <span>Simpan Berita</span>
                                        </>
                                    )}
                                </PrimaryButton>
                            </div>
                        </div>
                    </form>
                </div>
            </DashboardLayout>
        </>
    );
}
