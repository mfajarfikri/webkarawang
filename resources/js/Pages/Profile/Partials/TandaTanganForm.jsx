import React, { useRef, useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import axios from "axios";
import SignaturePad from "react-signature-canvas";
import DangerButton from "@/Components/DangerButton";
import PrimaryButton from "@/Components/PrimaryButton";
import { router } from "@inertiajs/react";

export default function TandaTanganForm({ existingSignatureUrl }) {
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);
    const [hasExistingSignature, setHasExistingSignature] = useState(false);
    const sigRef = useRef();

    // Load existing signature if available
    useEffect(() => {
        if (existingSignatureUrl && sigRef.current) {
            const img = new Image();
            img.onload = () => {
                const canvas = sigRef.current.getCanvas();
                const ctx = canvas.getContext("2d");

                // Clear the canvas first
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Draw the existing signature
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                setHasExistingSignature(true);
            };
            img.src = existingSignatureUrl;
        }
    }, [existingSignatureUrl]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (sigRef.current.isEmpty()) {
            enqueueSnackbar("Tanda Tangan Kosong!", { variant: "error" });
            return;
        }

        setLoading(true);
        const dataURL = sigRef.current.toDataURL();

        try {
            // Get CSRF token safely, handle if not found
            const csrfTokenMeta = document.querySelector(
                'meta[name="csrf-token"]'
            );
            const csrfToken = csrfTokenMeta ? csrfTokenMeta.content : "";

            const response = await axios.post(
                route("dashboard.profile.tanda-tangan"),
                {
                    signature: dataURL,
                },
                {
                    headers: {
                        "X-CSRF-TOKEN": csrfToken,
                    },
                }
            );

            enqueueSnackbar("Tanda Tangan Berhasil disimpan", {
                variant: "success",
            });
            setHasExistingSignature(true);
            router.reload({ only: ["existingSignatureUrl"] });
        } catch (error) {
            console.error(error);
            const errorMessage =
                error.response?.data?.message || "Gagal menyimpan tanda tangan";
            enqueueSnackbar(errorMessage, { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        sigRef.current.clear();
        enqueueSnackbar("Canvas dihapus", { variant: "info" });
        setHasExistingSignature(false);
    };

    return (
        <div className="w-full">
            <div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div>
                            <p className="field-label">Area tanda tangan</p>
                            <div className="inline-block max-w-full rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-3 transition hover:border-brand-300">
                                <SignaturePad
                                    ref={sigRef}
                                    canvasProps={{
                                        width: 455,
                                        height: 300,
                                    }}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-4">
                            {existingSignatureUrl && (
                                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
                                    <div className="mb-3 flex items-center gap-2">
                                        <svg
                                            className="h-5 w-5 text-emerald-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                        <span className="text-sm font-semibold text-emerald-800">
                                            Tanda tangan tersimpan
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={existingSignatureUrl}
                                            alt="Tanda tangan yang tersimpan"
                                            className="h-12 rounded-lg border border-slate-200 bg-white"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const img = new Image();
                                                img.onload = () => {
                                                    const canvas =
                                                        sigRef.current.getCanvas();
                                                    const ctx =
                                                        canvas.getContext("2d");
                                                    ctx.clearRect(
                                                        0,
                                                        0,
                                                        canvas.width,
                                                        canvas.height
                                                    );
                                                    ctx.drawImage(
                                                        img,
                                                        0,
                                                        0,
                                                        canvas.width,
                                                        canvas.height
                                                    );
                                                    setHasExistingSignature(
                                                        true
                                                    );
                                                };
                                                img.src = existingSignatureUrl;
                                            }}
                                            className="text-xs font-semibold text-brand-700 hover:text-ink-900"
                                        >
                                            Muat tanda tangan ini
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                                <div className="flex items-start gap-2">
                                    <svg
                                        className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <div className="text-sm text-slate-700">
                                        <p className="font-semibold text-ink-900">
                                            Tips:
                                        </p>
                                        <ul className="mt-1 space-y-1 text-slate-600">
                                            <li>
                                                • Gunakan mouse atau touch
                                                screen untuk menandatangani
                                            </li>
                                            <li>
                                                • Tanda tangan akan disimpan
                                                dalam format digital
                                            </li>
                                            <li>
                                                • Klik "Hapus" untuk
                                                membersihkan tanda tangan
                                            </li>
                                            {existingSignatureUrl && (
                                                <li>
                                                    • Klik "Muat tanda tangan
                                                    ini" untuk menggunakan tanda
                                                    tangan yang tersimpan
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto flex flex-col justify-end gap-3 pt-2 sm:flex-row">
                                <DangerButton
                                    type="button"
                                    className="w-full sm:w-auto justify-center items-center"
                                    onClick={handleClear}
                                >
                                    Hapus
                                </DangerButton>
                                <PrimaryButton
                                    className={`w-full sm:w-auto justify-center gap-1 ${
                                        loading
                                            ? "opacity-60 cursor-not-allowed"
                                            : ""
                                    }`}
                                >
                                    {loading ? (
                                        <svg
                                            className="animate-spin h-4 w-4"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8v8z"
                                            ></path>
                                        </svg>
                                    ) : (
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    )}
                                    {loading ? "Menyimpan..." : "Simpan"}
                                </PrimaryButton>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
