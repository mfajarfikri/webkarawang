import DashboardLayout from "@/Layouts/DashboardLayout";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";

import TextInput from "@/Components/TextInput";
import Modal from "@/Components/Modal";
import PageHeader from "@/Components/Dashboard/PageHeader";
import { Badge } from "@/Components/Dashboard/ui";
import {
    DesignConfigProvider,
    useDesignConfig,
} from "@/Components/DesignConfigProvider.jsx";
import DesignControl from "@/Components/DesignControl.jsx";
import { Head, Link, router, useForm } from "@inertiajs/react";
import { Listbox, Tab, Transition } from "@headlessui/react";
import axios from "axios";
import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useSnackbar } from "notistack";
import {
    FaCheck,
    FaChevronDown,
    FaChevronLeft,
    FaChevronRight,
    FaBuilding,
    FaCloudUploadAlt,
    FaEye,
    FaFileAlt,
    FaHistory,
    FaImage,
    FaPlus,
    FaSave,
    FaSpinner,
    FaTimes,
} from "react-icons/fa";

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
import Undo from "editorjs-undo";
import DragDrop from "editorjs-drag-drop";
import { edjsParser, sanitizeEditorData } from "@/utils/editorParser";

function classNames(...v) {
    return v.filter(Boolean).join(" ");
}

function compressAndConvertImage(file, maxSize) {
    return new Promise((resolve, reject) => {
        if (!file?.type?.startsWith("image/")) {
            reject(new Error("File bukan gambar"));
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                if (width > height && width > maxSize) {
                    height = Math.round((height * maxSize) / width);
                    width = maxSize;
                } else if (height > maxSize) {
                    width = Math.round((width * maxSize) / height);
                    height = maxSize;
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
                    0.78,
                );
            };
            img.onerror = () => reject(new Error("Gagal memuat gambar"));
            img.src = event.target.result;
        };
        reader.onerror = () => reject(new Error("Gagal membaca file"));
        reader.readAsDataURL(file);
    });
}

const activeEditors = new Set();

function RichTextEditor({ id, initialData, onChange, placeholder }) {
    const editorRef = useRef(null);
    const onChangeRef = useRef(onChange);
    const holderId = `editor-${id}`;
    const initOnceRef = useRef(false);
    const hasInitialBlocksRef = useRef(false);

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        if (initOnceRef.current || editorRef.current) return;
        if (activeEditors.has(holderId)) {
            console.warn("Duplicate editor prevented for", holderId);
            return;
        }

        let instance;
        try {
            const holderEl = document.getElementById(holderId);
            if (holderEl) holderEl.innerHTML = "";
            initOnceRef.current = true;
            let parsed =
                typeof initialData === "string"
                    ? (() => {
                          try {
                              return JSON.parse(initialData);
                          } catch {
                              return null;
                          }
                      })()
                    : initialData || null;
            const hasBlocks =
                !!parsed &&
                Array.isArray(parsed.blocks) &&
                parsed.blocks.length > 0;
            hasInitialBlocksRef.current = hasBlocks;
            const normalizedData = hasBlocks
                ? sanitizeEditorData(parsed)
                : {
                      time: Date.now(),
                      blocks: [{ type: "paragraph", data: { text: "" } }],
                  };
            instance = new EditorJS({
                holder: holderId,
                placeholder,
                data: normalizedData,
                tools: {
                    header: { class: Header, inlineToolbar: true },
                    list: { class: List, inlineToolbar: true },
                    quote: { class: Quote, inlineToolbar: true },
                    code: { class: CodeTool },
                    inlineCode: { class: InlineCode },
                    table: { class: Table, inlineToolbar: true },
                    marker: { class: Marker },
                    underline: { class: Underline },
                    checklist: { class: Checklist },
                    delimiter: { class: Delimiter },
                    embed: { class: Embed },
                    warning: { class: Warning },
                    raw: { class: Raw },
                    linkTool: { class: LinkTool },
                },
                onChange: async () => {
                    const nextData = await instance.save();
                    onChangeRef.current?.(sanitizeEditorData(nextData));
                },
            });
        } catch (e) {
            console.error("Editor init error", e);
            return;
        }

        editorRef.current = instance;
        activeEditors.add(holderId);

        instance.isReady
            .then(async () => {
                new Undo({ editor: instance });
                new DragDrop(instance);

                try {
                    const data = await instance.save();
                    const allEmpty = Array.isArray(data?.blocks)
                        ? data.blocks.every(
                              (b) =>
                                  b?.type === "paragraph" &&
                                  (!b?.data?.text ||
                                      String(b.data.text).trim() === ""),
                          )
                        : true;
                    if (
                        Array.isArray(data?.blocks) &&
                        data.blocks.length > 1 &&
                        allEmpty
                    ) {
                        await instance.clear();
                        await instance.render({
                            time: Date.now(),
                            blocks: [{ type: "paragraph", data: { text: "" } }],
                        });
                    }
                    // Defensive: if DOM somehow has multiple redactors, keep only the first
                    const holderEl = document.getElementById(holderId);
                    const redactors = holderEl?.querySelectorAll(
                        ".codex-editor__redactor",
                    );
                    if (redactors && redactors.length > 1) {
                        for (let i = 1; i < redactors.length; i++) {
                            redactors[i].parentElement?.removeChild(
                                redactors[i],
                            );
                        }
                    }
                    const ceBlocks = holderEl?.querySelectorAll(
                        ".codex-editor__redactor .ce-block",
                    );
                    if (ceBlocks && ceBlocks.length > 1) {
                        const allEmptyBlocks = Array.from(ceBlocks).every(
                            (blk) => {
                                const p = blk.querySelector(".ce-paragraph");
                                const txt = p?.textContent || "";
                                return txt.trim() === "";
                            },
                        );
                        if (allEmptyBlocks) {
                            for (let i = 1; i < ceBlocks.length; i++) {
                                ceBlocks[i].parentElement?.removeChild(
                                    ceBlocks[i],
                                );
                            }
                        }
                    }
                } catch {}
            })
            .catch(() => {});

        return () => {
            editorRef.current?.destroy?.();
            editorRef.current = null;
            activeEditors.delete(holderId);
        };
    }, [holderId]);

    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20">
            <div className="p-3 sm:p-4">
                <div id={holderId} className="prose max-w-none" />
            </div>
        </div>
    );
}

function ImageUploadCard({
    title,
    subtitle,
    value,
    onChange,
    uploadType,
    maxSize = 1200,
    multiple = false,
    hint,
}) {
    const { enqueueSnackbar } = useSnackbar();
    const [uploading, setUploading] = useState(false);
    const inputRef = useRef(null);

    const items = multiple ? value || [] : value ? [value] : [];

    const upload = async (file) => {
        setUploading(true);
        try {
            const processed = await compressAndConvertImage(file, maxSize);
            const form = new FormData();
            form.append("type", uploadType);
            form.append("file", processed);
            const res = await axios.post(
                route("dashboard.company-profile.upload"),
                form,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                },
            );
            return res.data;
        } catch (e) {
            enqueueSnackbar(e?.message || "Gagal upload gambar", {
                variant: "error",
            });
            return null;
        } finally {
            setUploading(false);
        }
    };

    const onSelect = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        if (!multiple) {
            const uploaded = await upload(files[0]);
            if (uploaded) onChange(uploaded);
            if (inputRef.current) inputRef.current.value = "";
            return;
        }

        const next = [...(value || [])];
        for (const f of files) {
            const uploaded = await upload(f);
            if (uploaded) {
                next.push({ image: uploaded, caption: "", credit: "" });
            }
        }
        onChange(next);
        if (inputRef.current) inputRef.current.value = "";
    };

    return (
        <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <div className="text-sm font-bold text-ink-900">
                            {title}
                        </div>
                        {subtitle ? (
                            <div className="mt-0.5 text-sm text-slate-500">
                                {subtitle}
                            </div>
                        ) : null}
                        {hint ? (
                            <div className="mt-2 text-xs text-slate-500">
                                {hint}
                            </div>
                        ) : null}
                    </div>
                    <label className="btn-ghost btn-sm shrink-0 cursor-pointer">
                        {uploading ? (
                            <FaSpinner className="h-4 w-4 animate-spin" />
                        ) : (
                            <FaCloudUploadAlt className="h-4 w-4" />
                        )}
                        <span>Upload</span>
                        <input
                            ref={inputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            multiple={multiple}
                            onChange={onSelect}
                        />
                    </label>
                </div>
            </div>

            <div className="p-5">
                {items.length === 0 ? (
                    <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-6 text-center text-sm text-slate-500">
                        Belum ada gambar.
                    </div>
                ) : (
                    <div
                        className={classNames(
                            "grid gap-3",
                            multiple
                                ? "grid-cols-2 sm:grid-cols-3"
                                : "grid-cols-1",
                        )}
                    >
                        {items.map((it, idx) => {
                            const url = multiple ? it?.image?.url : it?.url;
                            return (
                                <div
                                    key={url || idx}
                                    className="rounded-xl border border-slate-200 bg-white overflow-hidden"
                                >
                                    <div className="aspect-[4/3] bg-slate-100">
                                        {url ? (
                                            <img
                                                src={url}
                                                alt={title}
                                                loading="lazy"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : null}
                                    </div>
                                    {multiple ? (
                                        <div className="p-3 space-y-2">
                                            <input
                                                value={it.caption || ""}
                                                onChange={(e) => {
                                                    const next = [...items];
                                                    next[idx] = {
                                                        ...next[idx],
                                                        caption: e.target.value,
                                                    };
                                                    onChange(next);
                                                }}
                                                className="field-input py-2"
                                                placeholder="Caption"
                                            />
                                            <input
                                                value={it.credit || ""}
                                                onChange={(e) => {
                                                    const next = [...items];
                                                    next[idx] = {
                                                        ...next[idx],
                                                        credit: e.target.value,
                                                    };
                                                    onChange(next);
                                                }}
                                                className="field-input py-2"
                                                placeholder="Kredit"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const next = items.filter(
                                                        (_, i) => i !== idx,
                                                    );
                                                    onChange(next);
                                                }}
                                                className="btn btn-sm w-full text-rose-600 hover:bg-rose-50"
                                            >
                                                <FaTimes className="h-3 w-3" />
                                                <span>
                                                    Hapus
                                                </span>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="p-3">
                                            <button
                                                type="button"
                                                onClick={() => onChange(null)}
                                                className="btn btn-sm w-full text-rose-600 hover:bg-rose-50"
                                            >
                                                <FaTimes className="h-3 w-3" />
                                                <span>
                                                    Hapus
                                                </span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

function VersionDrawer({ open, onClose, versions, onRestore, onPublish }) {
    const [selected, setSelected] = useState(null);
    const [note, setNote] = useState("");

    useEffect(() => {
        if (!open) {
            setSelected(null);
            setNote("");
        }
    }, [open]);

    const selectedVersion =
        selected || (versions && versions.length ? versions[0] : null);

    return (
        <Modal show={open} onClose={onClose} maxWidth="5xl">
            <div className="bg-white">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
                    <div>
                        <div className="text-base font-bold text-ink-900">
                            Riwayat Versi
                        </div>
                        <div className="mt-0.5 text-sm text-slate-500">
                            Pulihkan draft atau terbitkan versi tertentu.
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-ghost btn-sm"
                    >
                        Tutup
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12">
                    <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-slate-100">
                        <div className="max-h-[70vh] overflow-auto p-4 space-y-2">
                            {(versions || []).map((v) => {
                                const active = selectedVersion?.id === v.id;
                                return (
                                    <button
                                        key={v.id}
                                        type="button"
                                        onClick={() => setSelected(v)}
                                        className={classNames(
                                            "w-full text-left rounded-xl border p-4 transition-colors",
                                            active
                                                ? "border-brand-200 bg-brand-50 ring-1 ring-brand-200"
                                                : "border-slate-200 bg-white hover:bg-slate-50",
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="text-sm font-bold text-ink-900 truncate tabular-nums">
                                                    v{v.version_number}
                                                </div>
                                                <div className="mt-0.5 text-xs text-slate-500 truncate">
                                                    {v.state === "published"
                                                        ? "Terbit"
                                                        : "Draft"}{" "}
                                                    •{" "}
                                                    {new Date(
                                                        v.created_at,
                                                    ).toLocaleString("id-ID")}
                                                </div>
                                                {v.change_note ? (
                                                    <div className="mt-2 text-xs text-slate-600 line-clamp-2">
                                                        {v.change_note}
                                                    </div>
                                                ) : null}
                                            </div>
                                            <span
                                                className={classNames(
                                                    "text-[11px] font-semibold px-2.5 py-0.5 rounded-full ring-1 ring-inset",
                                                    v.state === "published"
                                                        ? "ring-emerald-200 bg-emerald-50 text-emerald-800"
                                                        : "ring-amber-200 bg-amber-50 text-amber-800",
                                                )}
                                            >
                                                {v.state === "published"
                                                    ? "TERBIT"
                                                    : "DRAFT"}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="lg:col-span-7 p-5 bg-slate-50/60">
                        {!selectedVersion ? (
                            <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                                Belum ada versi.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="surface p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="text-base font-bold text-ink-900 tabular-nums">
                                                v
                                                {selectedVersion.version_number}
                                            </div>
                                            <div className="mt-1 text-sm text-slate-600">
                                                Status:{" "}
                                                <span className="font-semibold text-ink-900">
                                                    {selectedVersion.state ===
                                                    "published"
                                                        ? "Terbit"
                                                        : "Draft"}
                                                </span>
                                            </div>
                                            <div className="mt-1 text-xs text-slate-500">
                                                Dibuat:{" "}
                                                {new Date(
                                                    selectedVersion.created_at,
                                                ).toLocaleString("id-ID")}
                                            </div>
                                        </div>
                                        <FaHistory className="h-5 w-5 text-slate-400" />
                                    </div>
                                    {selectedVersion.change_note ? (
                                        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                                            {selectedVersion.change_note}
                                        </div>
                                    ) : null}
                                </div>

                                <div className="surface p-5">
                                    <div className="text-base font-bold text-ink-900">
                                        Aksi
                                    </div>
                                    <div className="mt-3">
                                        <InputLabel
                                            value="Catatan perubahan (opsional)"
                                            className="mb-1.5"
                                        />
                                        <textarea
                                            value={note}
                                            onChange={(e) =>
                                                setNote(e.target.value)
                                            }
                                            className="field-input"
                                            rows={3}
                                            placeholder="Contoh: Revisi kontak dan update logo"
                                        />
                                    </div>
                                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                onRestore(selectedVersion.id)
                                            }
                                            className="btn-ghost"
                                        >
                                            <FaFileAlt className="h-3.5 w-3.5" />
                                            <span>
                                                Pulihkan sebagai Draft
                                            </span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                onPublish(
                                                    selectedVersion.id,
                                                    note,
                                                )
                                            }
                                            className="btn-brand"
                                        >
                                            <FaCheck className="h-3.5 w-3.5" />
                                            <span>
                                                Terbitkan Versi Ini
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
}

function DeviceSelector({ value, onChange }) {
    const options = [
        { key: "desktop", label: "Desktop", w: 1024 },
        { key: "tablet", label: "Tablet", w: 768 },
        { key: "mobile", label: "Mobile", w: 390 },
    ];

    const selected = options.find((o) => o.key === value) || options[0];

    return (
        <Listbox value={selected} onChange={(v) => onChange(v.key)}>
            <div className="relative">
                <Listbox.Button className="relative cursor-pointer rounded-full bg-white py-2 pl-4 pr-9 text-left border border-slate-200 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500/20 whitespace-nowrap">
                    <span className="block truncate">{selected.label}</span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <FaChevronDown className="h-3 w-3 text-slate-400" />
                    </span>
                </Listbox.Button>
                <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <Listbox.Options className="absolute right-0 z-50 mt-2 max-h-60 w-44 overflow-auto rounded-xl border border-slate-200/80 bg-white p-1 text-base shadow-lift focus:outline-none sm:text-sm">
                        {options.map((o) => (
                            <Listbox.Option
                                key={o.key}
                                value={o}
                                className={({ active }) =>
                                    classNames(
                                        "relative cursor-default select-none rounded-lg py-2 pl-10 pr-4",
                                        active
                                            ? "bg-brand-50 text-brand-800"
                                            : "text-slate-700",
                                    )
                                }
                            >
                                {({ selected }) => (
                                    <>
                                        <span
                                            className={classNames(
                                                "block truncate",
                                                selected
                                                    ? "font-semibold"
                                                    : "font-normal",
                                            )}
                                        >
                                            {o.label}
                                        </span>
                                        {selected ? (
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-brand-600">

                                                <FaCheck className="h-4 w-4" />
                                            </span>
                                        ) : null}
                                    </>
                                )}
                            </Listbox.Option>
                        ))}
                    </Listbox.Options>
                </Transition>
            </div>
        </Listbox>
    );
}

function PreviewPanel({ draft, device }) {
    const deviceWidth =
        device === "mobile" ? 390 : device === "tablet" ? 768 : 1024;
    const aboutHtml = useMemo(() => {
        if (!draft?.about_editor) return "";
        try {
            return edjsParser(draft.about_editor);
        } catch {
            return "";
        }
    }, [draft?.about_editor]);

    const visionHtml = useMemo(() => {
        if (!draft?.vision_editor) return "";
        try {
            return edjsParser(draft.vision_editor);
        } catch {
            return "";
        }
    }, [draft?.vision_editor]);

    const mapSrc = useMemo(() => {
        const lat = draft?.map?.lat;
        const lng = draft?.map?.lng;
        if (!lat || !lng) return "";
        return `https://www.google.com/maps?q=${encodeURIComponent(
            `${lat},${lng}`,
        )}&output=embed`;
    }, [draft?.map?.lat, draft?.map?.lng]);

    return (
        <div className="flex justify-center">
            <div
                className="max-w-full rounded-2xl border border-slate-200/80 bg-white shadow-soft overflow-hidden"
                style={{ width: Math.min(deviceWidth, 1024) }}
            >
                <div className="p-6 border-b border-slate-100 bg-slate-50/70">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <div className="eyebrow">
                                Profil Perusahaan
                            </div>
                            <div className="mt-2 font-display text-xl font-extrabold text-ink-900 tracking-tight">
                                {draft?.company_name || "-"}
                            </div>
                            {draft?.tagline ? (
                                <div className="mt-1 text-sm font-semibold text-brand-700">
                                    {draft.tagline}
                                </div>
                            ) : null}
                        </div>
                        <div className="h-12 w-12 shrink-0 rounded-xl border border-slate-200 bg-white overflow-hidden">
                            {draft?.logo?.url ? (
                                <img
                                    src={draft.logo.url}
                                    alt="Logo"
                                    className="h-full w-full object-contain"
                                />
                            ) : null}
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                        <div className="text-sm font-bold text-ink-900">
                            Deskripsi Singkat
                        </div>
                        {aboutHtml ? (
                            <div
                                className="mt-3 prose prose-slate max-w-none"
                                dangerouslySetInnerHTML={{ __html: aboutHtml }}
                            />
                        ) : (
                            <div className="mt-2 text-sm text-slate-600">
                                [DESKRIPSI_PERUSAHAAN]
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="rounded-xl border border-slate-200 bg-white p-5">
                            <div className="text-sm font-bold text-ink-900">
                                Kontak
                            </div>
                            <div className="mt-2 text-sm text-slate-600 space-y-1">
                                <div>{draft?.phone || "-"}</div>
                                <div>{draft?.email || "-"}</div>
                                <div>{draft?.website || "-"}</div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-5">
                            <div className="text-sm font-bold text-ink-900">
                                Alamat
                            </div>
                            <div className="mt-2 text-sm text-slate-600 whitespace-pre-line">
                                {draft?.address || "-"}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5">
                        <div className="text-sm font-bold text-ink-900">
                            Visi
                        </div>
                        {visionHtml ? (
                            <div
                                className="mt-3 prose prose-slate max-w-none"
                                dangerouslySetInnerHTML={{ __html: visionHtml }}
                            />
                        ) : (
                            <div className="mt-2 text-sm text-slate-600">
                                [VISI_PERUSAHAAN]
                            </div>
                        )}
                        <div className="mt-4 text-sm font-bold text-ink-900">
                            Misi
                        </div>
                        <ul className="mt-2 space-y-2 text-sm text-slate-700">
                            {(draft?.missions || []).map((m, idx) => (
                                <li key={idx} className="flex gap-2">
                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                                    <span className="min-w-0">{m}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {mapSrc ? (
                        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-100">
                                <div className="text-sm font-bold text-ink-900">
                                    Lokasi (Peta)
                                </div>
                            </div>
                            <iframe
                                title="Peta"
                                src={mapSrc}
                                className="w-full h-64"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>
                    ) : null}

                    <div className="rounded-xl border border-slate-200 bg-white p-5">
                        <div className="text-sm font-bold text-ink-900">
                            Galeri
                        </div>
                        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {(draft?.gallery?.items || [])
                                .slice(0, 6)
                                .map((g, idx) => (
                                    <div
                                        key={g?.image?.url || idx}
                                        className="rounded-xl border border-slate-200 overflow-hidden"
                                    >
                                        <div className="aspect-[4/3] bg-slate-100">
                                            {g?.image?.url ? (
                                                <img
                                                    src={g.image.url}
                                                    alt={g.caption || "Galeri"}
                                                    loading="lazy"
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : null}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function EditContent({ profile, versions = [], flash }) {
    const { enqueueSnackbar } = useSnackbar();

    const initialDraft = useMemo(() => {
        return profile?.draft_data || {};
    }, [profile?.draft_data]);

    const { data, setData, post, processing, errors, isDirty } = useForm({
        draft_data: initialDraft,
        change_note: "",
    });

    useEffect(() => {
        if (flash?.success) {
            enqueueSnackbar(flash.success, { variant: "success" });
        }
    }, [enqueueSnackbar, flash?.success]);

    const setDraft = (key, value) => {
        setData("draft_data", {
            ...(data.draft_data || {}),
            [key]: value,
        });
    };

    const setDraftDeep = (path, value) => {
        const next = { ...(data.draft_data || {}) };
        let cur = next;
        for (let i = 0; i < path.length - 1; i++) {
            const k = path[i];
            cur[k] = Array.isArray(cur[k])
                ? [...cur[k]]
                : { ...(cur[k] || {}) };
            cur = cur[k];
        }
        cur[path[path.length - 1]] = value;
        setData("draft_data", next);
    };

    const [versionsOpen, setVersionsOpen] = useState(false);
    const [device, setDevice] = useState("desktop");
    const [publishConfirm, setPublishConfirm] = useState(false);
    const [ready, setReady] = useState(false);
    const [isLg, setIsLg] = useState(() => {
        if (typeof window === "undefined" || !window.matchMedia) return false;
        return window.matchMedia("(min-width: 1024px)").matches;
    });

    useEffect(() => {
        if (typeof window === "undefined" || !window.matchMedia) return;
        const mq = window.matchMedia("(min-width: 1024px)");
        const update = () => setIsLg(!!mq.matches);
        mq.addEventListener?.("change", update);
        return () => mq.removeEventListener?.("change", update);
    }, []);

    useEffect(() => {
        setReady(true);
    }, []);

    const firstErrorMessage = (bag) => {
        if (!bag) return "";
        const values = Object.values(bag);
        const first = values.length ? values[0] : "";
        if (Array.isArray(first)) return first[0] || "";
        return first || "";
    };

    const statusBadge =
        profile?.status === "published"
            ? {
                  label: "TERBIT",
                  cls: "ring-emerald-200 bg-emerald-50 text-emerald-800",
              }
            : {
                  label: "DRAFT",
                  cls: "ring-amber-200 bg-amber-50 text-amber-800",
              };

    const saveDraft = () => {
        post(route("dashboard.company-profile.draft"), {
            preserveScroll: true,
            preserveState: false,
            onSuccess: () => {
                enqueueSnackbar("Draft berhasil disimpan.", {
                    variant: "success",
                });
                setData("change_note", "");
            },
            onError: (bag) => {
                enqueueSnackbar(
                    firstErrorMessage(bag) || "Gagal menyimpan draft.",
                    {
                        variant: "error",
                    },
                );
            },
        });
    };

    const publish = () => {
        post(route("dashboard.company-profile.publish"), {
            preserveScroll: true,
            preserveState: false,
            onSuccess: () => {
                enqueueSnackbar("Profil berhasil diterbitkan.", {
                    variant: "success",
                });
                setPublishConfirm(false);
                setData("change_note", "");
            },
            onError: (bag) => {
                enqueueSnackbar(
                    firstErrorMessage(bag) || "Gagal menerbitkan.",
                    {
                        variant: "error",
                    },
                );
            },
        });
    };

    const restoreVersion = (id) => {
        router.post(
            route("dashboard.company-profile.restore", id),
            {},
            {
                preserveScroll: true,
                preserveState: false,
                onSuccess: () =>
                    enqueueSnackbar("Versi dipulihkan sebagai draft.", {
                        variant: "success",
                    }),
                onError: () =>
                    enqueueSnackbar("Gagal memulihkan versi.", {
                        variant: "error",
                    }),
            },
        );
    };

    const publishVersion = (id, note) => {
        router.post(
            route("dashboard.company-profile.publish-version", id),
            { change_note: note || undefined },
            {
                preserveScroll: true,
                preserveState: false,
                onSuccess: () =>
                    enqueueSnackbar("Versi berhasil diterbitkan.", {
                        variant: "success",
                    }),
                onError: () =>
                    enqueueSnackbar("Gagal menerbitkan versi.", {
                        variant: "error",
                    }),
            },
        );
    };

    const editorTab = (
        <div className="space-y-6">
            <div className="surface overflow-hidden">
                <div className="px-5 py-4 sm:px-6 border-b border-slate-100">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <div className="text-base font-bold text-ink-900">
                                Informasi Umum
                            </div>
                            <div className="mt-0.5 text-sm text-slate-500">
                                Identitas dan ringkasan perusahaan.
                            </div>
                        </div>
                        <span
                            className={classNames(
                                "text-[11px] font-semibold px-2.5 py-0.5 rounded-full ring-1 ring-inset",
                                statusBadge.cls,
                            )}
                        >
                            {statusBadge.label}
                        </span>
                    </div>
                </div>
                <div
                    className="p-5 sm:p-6 space-y-5"
                    style={{ borderRadius: "var(--ds-radius)" }}
                >
                    <div>
                        <InputLabel
                            value="Nama perusahaan"
                            className="mb-1.5"
                        />
                        <TextInput
                            className="block w-full"
                            value={data.draft_data?.company_name || ""}
                            onChange={(e) =>
                                setDraft("company_name", e.target.value)
                            }
                        />
                        <InputError
                            message={errors["draft_data.company_name"]}
                            className="mt-2"
                        />
                    </div>

                    <div>
                        <InputLabel value="Tagline" className="mb-1.5" />
                        <TextInput
                            className="block w-full"
                            value={data.draft_data?.tagline || ""}
                            onChange={(e) =>
                                setDraft("tagline", e.target.value)
                            }
                        />
                    </div>

                    <div>
                        <InputLabel
                            value="Deskripsi singkat (rich text)"
                            className="mb-1.5"
                        />
                        <div className="mt-2">
                            <RichTextEditor
                                id="about"
                                initialData={data.draft_data?.about_editor}
                                onChange={(val) =>
                                    setDraft("about_editor", val)
                                }
                                placeholder="Tulis ringkasan perusahaan..."
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ImageUploadCard
                    title="Logo Perusahaan"
                    subtitle="Unggah logo dan lihat pratinjau."
                    value={data.draft_data?.logo}
                    onChange={(v) => setDraft("logo", v)}
                    uploadType="logo"
                    maxSize={800}
                    hint="Format: JPG/PNG/WEBP. Disarankan latar transparan (PNG) atau putih."
                />
                <ImageUploadCard
                    title="Cover / Hero"
                    subtitle="Cover akan tampil pada hero halaman."
                    value={data.draft_data?.cover}
                    onChange={(v) => setDraft("cover", v)}
                    uploadType="cover"
                    maxSize={1600}
                    hint="Rasio disarankan 16:9."
                />
            </div>

            <div
                className="surface overflow-hidden"
                style={{ borderRadius: "var(--ds-radius)" }}
            >
                <div className="px-5 py-4 sm:px-6 border-b border-slate-100">
                    <div className="text-base font-bold text-ink-900">
                        Kontak & Lokasi
                    </div>
                    <div className="mt-0.5 text-sm text-slate-500">
                        Informasi alamat, kontak, media sosial, dan koordinat
                        peta.
                    </div>
                </div>
                <div
                    className="p-5 sm:p-6 space-y-5"
                    style={{ borderRadius: "var(--ds-radius)" }}
                >
                    <div>
                        <InputLabel value="Alamat" className="mb-1.5" />
                        <textarea
                            className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
                            rows={4}
                            value={data.draft_data?.address || ""}
                            onChange={(e) =>
                                setDraft("address", e.target.value)
                            }
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <InputLabel value="Telepon" className="mb-1.5" />
                            <TextInput
                                className="block w-full"
                                value={data.draft_data?.phone || ""}
                                onChange={(e) =>
                                    setDraft("phone", e.target.value)
                                }
                            />
                            <InputError
                                message={errors["draft_data.phone"]}
                                className="mt-2"
                            />
                        </div>
                        <div>
                            <InputLabel value="Email" className="mb-1.5" />
                            <TextInput
                                className="block w-full"
                                value={data.draft_data?.email || ""}
                                onChange={(e) =>
                                    setDraft("email", e.target.value)
                                }
                            />
                            <InputError
                                message={errors["draft_data.email"]}
                                className="mt-2"
                            />
                        </div>
                    </div>

                    <div>
                        <InputLabel value="Website" className="mb-1.5" />
                        <TextInput
                            className="block w-full"
                            value={data.draft_data?.website || ""}
                            onChange={(e) =>
                                setDraft("website", e.target.value)
                            }
                        />
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                        <div className="text-sm font-bold text-ink-900">
                            Media Sosial
                        </div>
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                                ["facebook", "Facebook"],
                                ["instagram", "Instagram"],
                                ["linkedin", "LinkedIn"],
                                ["twitter", "Twitter"],
                            ].map(([k, label]) => (
                                <div key={k}>
                                    <div className="mb-1 text-xs font-semibold text-slate-500">
                                        {label}
                                    </div>
                                    <TextInput
                                        className="block w-full"
                                        value={
                                            data.draft_data?.social?.[k] || ""
                                        }
                                        onChange={(e) =>
                                            setDraftDeep(
                                                ["social", k],
                                                e.target.value,
                                            )
                                        }
                                        placeholder="https://..."
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <InputLabel
                                value="Koordinat Latitude"
                                className="mb-1.5"
                            />
                            <TextInput
                                className="block w-full"
                                value={data.draft_data?.map?.lat ?? ""}
                                onChange={(e) =>
                                    setDraftDeep(["map", "lat"], e.target.value)
                                }
                                placeholder="-6.2"
                            />
                        </div>
                        <div>
                            <InputLabel
                                value="Koordinat Longitude"
                                className="mb-1.5"
                            />
                            <TextInput
                                className="block w-full"
                                value={data.draft_data?.map?.lng ?? ""}
                                onChange={(e) =>
                                    setDraftDeep(["map", "lng"], e.target.value)
                                }
                                placeholder="107.3"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div
                className="surface overflow-hidden"
                style={{ borderRadius: "var(--ds-radius)" }}
            >
                <div className="px-5 py-4 sm:px-6 border-b border-slate-100">
                    <div className="text-base font-bold text-ink-900">
                        Visi & Misi
                    </div>
                    <div className="mt-0.5 text-sm text-slate-500">
                        Visi (rich text) dan daftar misi yang bisa
                        ditambah/hapus.
                    </div>
                </div>
                <div className="p-5 sm:p-6 space-y-5">
                    <div>
                        <InputLabel value="Visi" className="mb-1.5" />
                        <div className="mt-2">
                            <RichTextEditor
                                id="vision"
                                initialData={data.draft_data?.vision_editor}
                                onChange={(val) =>
                                    setDraft("vision_editor", val)
                                }
                                placeholder="Tulis visi perusahaan..."
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between gap-3">
                            <InputLabel value="Misi" className="mb-1.5" />
                            <button
                                type="button"
                                onClick={() => {
                                    const next = [
                                        ...(data.draft_data?.missions || []),
                                        "[MISI_BARU]",
                                    ];
                                    setDraft("missions", next);
                                }}
                                className="btn-ghost btn-sm"
                            >
                                <FaPlus className="h-3 w-3" />
                                <span>Tambah</span>
                            </button>
                        </div>
                        <div className="mt-3 space-y-3">
                            {(data.draft_data?.missions || []).map((m, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-start gap-2"
                                >
                                    <TextInput
                                        className="flex-1"
                                        value={m}
                                        onChange={(e) => {
                                            const next = [
                                                ...(data.draft_data?.missions ||
                                                    []),
                                            ];
                                            next[idx] = e.target.value;
                                            setDraft("missions", next);
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const next = (
                                                data.draft_data?.missions || []
                                            ).filter((_, i) => i !== idx);
                                            setDraft("missions", next);
                                        }}
                                        className="btn-icon mt-0.5 shrink-0 hover:bg-rose-50 hover:text-rose-600"
                                        aria-label="Hapus misi"
                                    >
                                        <FaTimes className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ImageUploadCard
                    title="Foto Tim (banner)"
                    subtitle="Foto umum tim untuk seksi organisasi."
                    value={data.draft_data?.team?.photo}
                    onChange={(v) => setDraftDeep(["team", "photo"], v)}
                    uploadType="team"
                    maxSize={1600}
                    hint="Gunakan foto landscape agar tampil optimal."
                />

                <div className="surface overflow-hidden">
                    <div className="px-5 py-4 sm:px-6 border-b border-slate-100">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <div className="text-base font-bold text-ink-900">
                                    Anggota Tim
                                </div>
                                <div className="mt-0.5 text-sm text-slate-500">
                                    Tambah/hapus anggota dan unggah fotonya.
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    const members = [
                                        ...(data.draft_data?.team?.members ||
                                            []),
                                        {
                                            name: "",
                                            position: "",
                                            bio: "",
                                            photo: null,
                                        },
                                    ];
                                    setDraftDeep(["team", "members"], members);
                                }}
                                className="btn-ghost btn-sm"
                            >
                                <FaPlus className="h-3 w-3" />
                                <span>Tambah</span>
                            </button>
                        </div>
                    </div>

                    <div
                        className="p-5 sm:p-6 space-y-5"
                        style={{ borderRadius: "var(--ds-radius)" }}
                    >
                        {(data.draft_data?.team?.members || []).map(
                            (m, idx) => (
                                <div
                                    key={idx}
                                    className="rounded-xl border border-slate-200 bg-slate-50/60 p-4"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="text-sm font-bold text-ink-900">
                                            Anggota #{idx + 1}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const next = (
                                                    data.draft_data?.team
                                                        ?.members || []
                                                ).filter((_, i) => i !== idx);
                                                setDraftDeep(
                                                    ["team", "members"],
                                                    next,
                                                );
                                            }}
                                            className="btn-icon h-8 w-8 hover:bg-rose-50 hover:text-rose-600"
                                            aria-label="Hapus anggota"
                                        >
                                            <FaTimes className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <div className="mb-1 text-xs font-semibold text-slate-500">
                                                Nama
                                            </div>
                                            <TextInput
                                                className="block w-full"
                                                value={m.name || ""}
                                                onChange={(e) => {
                                                    const members = [
                                                        ...(data.draft_data
                                                            ?.team?.members ||
                                                            []),
                                                    ];
                                                    members[idx] = {
                                                        ...members[idx],
                                                        name: e.target.value,
                                                    };
                                                    setDraftDeep(
                                                        ["team", "members"],
                                                        members,
                                                    );
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <div className="mb-1 text-xs font-semibold text-slate-500">
                                                Jabatan
                                            </div>
                                            <TextInput
                                                className="block w-full"
                                                value={m.position || ""}
                                                onChange={(e) => {
                                                    const members = [
                                                        ...(data.draft_data
                                                            ?.team?.members ||
                                                            []),
                                                    ];
                                                    members[idx] = {
                                                        ...members[idx],
                                                        position:
                                                            e.target.value,
                                                    };
                                                    setDraftDeep(
                                                        ["team", "members"],
                                                        members,
                                                    );
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <div className="mb-1 text-xs font-semibold text-slate-500">
                                            Deskripsi
                                        </div>
                                        <textarea
                                            value={m.bio || ""}
                                            onChange={(e) => {
                                                const members = [
                                                    ...(data.draft_data?.team
                                                        ?.members || []),
                                                ];
                                                members[idx] = {
                                                    ...members[idx],
                                                    bio: e.target.value,
                                                };
                                                setDraftDeep(
                                                    ["team", "members"],
                                                    members,
                                                );
                                            }}
                                            className="field-input"
                                            rows={3}
                                        />
                                    </div>
                                    <div className="mt-3">
                                        <ImageUploadCard
                                            title="Foto anggota"
                                            subtitle=""
                                            value={m.photo}
                                            onChange={(v) => {
                                                const members = [
                                                    ...(data.draft_data?.team
                                                        ?.members || []),
                                                ];
                                                members[idx] = {
                                                    ...members[idx],
                                                    photo: v,
                                                };
                                                setDraftDeep(
                                                    ["team", "members"],
                                                    members,
                                                );
                                            }}
                                            uploadType="member"
                                            maxSize={1200}
                                            hint="Foto portrait/1:1 disarankan."
                                        />
                                    </div>
                                </div>
                            ),
                        )}
                    </div>
                </div>
            </div>

            <ImageUploadCard
                title="Galeri"
                subtitle="Upload beberapa gambar, lalu isi caption dan kredit."
                value={data.draft_data?.gallery?.items || []}
                onChange={(items) => setDraftDeep(["gallery", "items"], items)}
                uploadType="gallery"
                maxSize={1600}
                multiple
                hint="Maksimal 5MB per file."
            />

            <div className="surface overflow-hidden">
                <div className="px-5 py-4 sm:px-6 border-b border-slate-100">
                    <div className="text-base font-bold text-ink-900">
                        Catatan Perubahan (opsional)
                    </div>
                    <div className="mt-0.5 text-sm text-slate-500">
                        Catatan ini akan tercatat di riwayat versi saat
                        simpan/terbit.
                    </div>
                </div>
                <div className="p-5 sm:p-6">
                    <textarea
                        value={data.change_note}
                        onChange={(e) => setData("change_note", e.target.value)}
                        className="field-input"
                        rows={3}
                        placeholder="Contoh: Update logo & perbaikan kontak"
                    />
                    <InputError message={errors.change_note} className="mt-2" />
                </div>
            </div>
        </div>
    );

    const previewTab = (
        <div className="space-y-4 lg:sticky lg:top-24">
            <div className="surface overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                            <FaEye className="h-3.5 w-3.5" />
                        </span>
                        <div className="text-base font-bold text-ink-900">
                            Pratinjau Langsung
                        </div>
                    </div>
                    <DeviceSelector value={device} onChange={setDevice} />
                </div>
                <div className="p-4 bg-slate-100/70">
                    <PreviewPanel draft={data.draft_data} device={device} />
                </div>
            </div>
            <div className="surface p-5">
                <div className="text-sm text-slate-600">
                    Publik akan melihat versi yang sudah diterbitkan. Pratinjau
                    ini menampilkan draft saat ini.
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                        href={route("profil")}
                        className="btn-ghost btn-sm"
                    >
                        <FaEye className="h-3 w-3" />
                        <span>Buka halaman publik</span>
                    </Link>
                </div>
            </div>
        </div>
    );

    const { vars } = useDesignConfig();
    return (
        <DashboardLayout title="Kelola Profil Perusahaan">
            <Head title="Kelola Profil Perusahaan" />

            <div
                className="max-w-full pb-10"
                style={vars}
            >
                <PageHeader
                    icon={FaBuilding}
                    title="Profil Perusahaan"
                    description={
                        <span className="flex flex-wrap items-center gap-2">
                            <span
                                className={classNames(
                                    "text-[11px] font-semibold px-2.5 py-0.5 rounded-full ring-1 ring-inset",
                                    statusBadge.cls,
                                )}
                            >
                                {statusBadge.label}
                            </span>
                            <span className="text-slate-500">
                                Terakhir update:{" "}
                                {profile?.updated_at
                                    ? new Date(
                                          profile.updated_at,
                                      ).toLocaleString("id-ID")
                                    : "-"}
                            </span>
                            {isDirty ? (
                                <Badge tone="amber" dot>
                                    Belum disimpan
                                </Badge>
                            ) : null}
                        </span>
                    }
                >
                    <button
                        type="button"
                        onClick={() => setVersionsOpen(true)}
                        className="btn-ghost"
                    >
                        <FaHistory className="h-3.5 w-3.5" />
                        <span>Riwayat Versi</span>
                    </button>
                    <button
                        type="button"
                        onClick={saveDraft}
                        disabled={processing}
                        className="btn-ghost"
                    >
                        {processing ? (
                            <FaSpinner className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <FaSave className="h-3.5 w-3.5" />
                        )}
                        <span>Simpan Draft</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setPublishConfirm(true)}
                        disabled={processing}
                        className="btn-brand"
                    >
                        {processing ? (
                            <FaSpinner className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <FaCheck className="h-3.5 w-3.5" />
                        )}
                        <span>Terbitkan</span>
                    </button>
                </PageHeader>

                <div>
                    <DesignControl />
                </div>

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-7">
                        {ready &&
                            (isLg ? (
                                <div>{editorTab}</div>
                            ) : (
                                <Tab.Group>
                                    <Tab.List className="flex space-x-1 rounded-full border border-slate-200 bg-slate-50 p-1">
                                        {["Editor", "Pratinjau"].map((t) => (
                                            <Tab
                                                key={t}
                                                className={({ selected }) =>
                                                    classNames(
                                                        "w-full rounded-full py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30",
                                                        selected
                                                            ? "bg-white text-ink-900 shadow-soft"
                                                            : "text-slate-500 hover:text-ink-900",
                                                    )
                                                }
                                            >
                                                {t}
                                            </Tab>
                                        ))}
                                    </Tab.List>
                                    <Tab.Panels className="mt-4">
                                        <Tab.Panel unmount>
                                            {editorTab}
                                        </Tab.Panel>
                                        <Tab.Panel unmount>
                                            {previewTab}
                                        </Tab.Panel>
                                    </Tab.Panels>
                                </Tab.Group>
                            ))}
                    </div>

                    {isLg ? (
                        <div className="lg:col-span-5">{previewTab}</div>
                    ) : null}
                </div>
            </div>

            <VersionDrawer
                open={versionsOpen}
                onClose={() => setVersionsOpen(false)}
                versions={versions}
                onRestore={restoreVersion}
                onPublish={publishVersion}
            />

            <Modal
                show={publishConfirm}
                onClose={() => setPublishConfirm(false)}
                maxWidth="2xl"
            >
                <div className="bg-white">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <div className="text-base font-bold text-ink-900">
                            Konfirmasi Terbitkan
                        </div>
                        <div className="mt-0.5 text-sm text-slate-500">
                            Pastikan pratinjau sudah sesuai. Kamu tetap dapat
                            memulihkan versi sebelumnya melalui riwayat.
                        </div>
                    </div>
                    <div className="p-6">
                        <div>
                            <InputLabel
                                value="Catatan perubahan (opsional)"
                                className="mb-1.5"
                            />
                            <textarea
                                value={data.change_note}
                                onChange={(e) =>
                                    setData("change_note", e.target.value)
                                }
                                className="field-input"
                                rows={3}
                            />
                        </div>
                        <div className="mt-6 flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setPublishConfirm(false)}
                                className="btn-ghost"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={publish}
                                className="btn-brand"
                                disabled={processing}
                            >
                                {processing ? (
                                    <FaSpinner className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <FaCheck className="h-3.5 w-3.5" />
                                )}
                                <span>Terbitkan</span>
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
}

export default function Edit(props) {
    return (
        <DesignConfigProvider>
            <EditContent {...props} />
        </DesignConfigProvider>
    );
}
