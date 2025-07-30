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
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-1">
                            <div className="border-2 border-gray-300 rounded-lg bg-gray-50 p-4">
                                <SignaturePad
                                    ref={sigRef}
                                    canvasProps={{
                                        width: 455,
                                        height: 300,
                                    }}
                                />
                            </div>
                        </div>
                        <div className="col-span-1">
                            {/* Display existing signature if available */}
                            {existingSignatureUrl && (
                                <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <svg
                                            className="w-5 h-5 text-green-600"
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
                                        <span className="text-sm font-medium text-green-800">
                                            Tanda tangan tersimpan
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={existingSignatureUrl}
                                            alt="Tanda tangan yang tersimpan"
                                            className="h-12 border border-gray-300 rounded bg-white"
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
                                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                        >
                                            Muat tanda tangan ini
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-start gap-2">
                                    <svg
                                        className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0"
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
                                    <div className="text-sm text-blue-700">
                                        <p className="font-medium">Tips:</p>
                                        <ul className="mt-1 space-y-1 text-blue-600">
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
                            <div className="flex mt-4 gap-3 justify-center">
                                <DangerButton
                                    type="button"
                                    className="w-full justify-center items-center"
                                    onClick={handleClear}
                                >
                                    Hapus
                                </DangerButton>
                                <PrimaryButton
                                    className={`w-full justify-center gap-1 ${
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
                                {/* <button
                                    type="submit"
                                    className={`w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors duration-200 flex items-center gap-2 ${
                                        loading
                                            ? "opacity-60 cursor-not-allowed"
                                            : ""
                                    }`}
                                    disabled={loading}
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
                                </button> */}
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
