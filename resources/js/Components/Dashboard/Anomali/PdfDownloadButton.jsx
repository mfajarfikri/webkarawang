import axios from "axios";
import { useSnackbar } from "notistack";
import { useMemo, useState } from "react";
import { FaFileDownload } from "react-icons/fa";

function classNames(...v) {
    return v.filter(Boolean).join(" ");
}

function getFilenameFromContentDisposition(value) {
    if (!value) return "";

    const filenameStar = value.match(/filename\*=(?:UTF-8''|)([^;]+)/i);
    if (filenameStar?.[1]) {
        try {
            return decodeURIComponent(filenameStar[1].trim().replace(/^"|"$/g, ""));
        } catch {
            return filenameStar[1].trim().replace(/^"|"$/g, "");
        }
    }

    const filename = value.match(/filename=([^;]+)/i);
    if (filename?.[1]) {
        return filename[1].trim().replace(/^"|"$/g, "");
    }

    return "";
}

export default function PdfDownloadButton({
    url,
    fileName,
    label = "Download PDF",
    className,
}) {
    const { enqueueSnackbar } = useSnackbar();
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(null);

    const computedLabel = useMemo(() => {
        if (!isLoading) return label;
        if (typeof progress === "number") return `Mengunduh... ${progress}%`;
        return "Mengunduh...";
    }, [isLoading, progress, label]);

    const onDownload = async () => {
        if (!url) {
            enqueueSnackbar("Link PDF tidak tersedia.", { variant: "error" });
            return;
        }
        if (isLoading) return;

        setIsLoading(true);
        setProgress(null);
        try {
            const res = await axios.get(url, {
                responseType: "blob",
                headers: {
                    Accept: "application/pdf",
                },
                timeout: 60000,
                onDownloadProgress: (evt) => {
                    const total = evt.total;
                    if (!total) return;
                    const pct = Math.round((evt.loaded / total) * 100);
                    setProgress(Math.max(0, Math.min(100, pct)));
                },
            });

            const blob = new Blob([res.data], { type: "application/pdf" });
            const objectUrl = URL.createObjectURL(blob);
            const disposition =
                res.headers?.["content-disposition"] ||
                res.headers?.["Content-Disposition"] ||
                "";
            const headerFilename = getFilenameFromContentDisposition(disposition);
            const downloadName = headerFilename || fileName || "download.pdf";

            const a = document.createElement("a");
            a.href = objectUrl;
            a.download = downloadName;
            a.style.display = "none";
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(objectUrl);
        } catch (err) {
            const status = err?.response?.status;
            if (status === 404) {
                enqueueSnackbar("File PDF tidak ditemukan.", { variant: "error" });
            } else if (status === 403) {
                enqueueSnackbar("Anda tidak punya akses untuk mengunduh PDF ini.", {
                    variant: "error",
                });
            } else {
                enqueueSnackbar("Gagal mengunduh PDF. Coba lagi.", {
                    variant: "error",
                });
            }
        } finally {
            setIsLoading(false);
            setProgress(null);
        }
    };

    return (
        <button
            type="button"
            onClick={onDownload}
            disabled={isLoading}
            aria-busy={isLoading ? "true" : "false"}
            className={classNames(
                "group relative inline-flex w-full sm:w-auto items-center justify-center px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm hover:shadow-md overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 disabled:opacity-60 disabled:cursor-not-allowed",
                className,
            )}
        >
            <span className="relative z-10 flex items-center font-semibold">
                {isLoading ? (
                    <span
                        className="mr-2 h-4 w-4 rounded-full border-2 border-slate-300 border-t-blue-600 animate-spin"
                        role="status"
                        aria-label="Mengunduh"
                    />
                ) : (
                    <FaFileDownload className="mr-2 text-slate-400 group-hover:text-blue-500 transition-colors" />
                )}
                {computedLabel}
            </span>
            <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
    );
}

export { getFilenameFromContentDisposition };

