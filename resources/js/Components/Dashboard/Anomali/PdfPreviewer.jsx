import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { useEffect, useMemo, useState } from "react";

function classNames(...v) {
    return v.filter(Boolean).join(" ");
}

function useObjectUrls(files) {
    const [urls, setUrls] = useState([]);

    useEffect(() => {
        const next = (files || []).map((f) => URL.createObjectURL(f));
        setUrls(next);
        return () => {
            next.forEach((u) => URL.revokeObjectURL(u));
        };
    }, [files]);

    return urls;
}

export default function PdfPreviewer({
    files,
    activeIndex,
    onActiveIndexChange,
}) {
    const safeFiles = Array.isArray(files) ? files : [];
    const urls = useObjectUrls(safeFiles);
    const currentUrl = urls[activeIndex] || "";

    const layoutPlugin = defaultLayoutPlugin({
        sidebarTabs: (defaultTabs) => defaultTabs,
    });

    const workerUrl = useMemo(() => {
        try {
            return new URL(
                "pdfjs-dist/build/pdf.worker.min.js",
                import.meta.url,
            ).toString();
        } catch {
            return "";
        }
    }, []);

    return (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                        Preview
                    </div>
                    <div className="mt-1 text-sm font-bold text-slate-900">
                        Dokumen PDF
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                        Klik nama file untuk berpindah dokumen.
                    </div>
                </div>
            </div>

            {safeFiles.length ? (
                <div className="border-b border-slate-100 bg-slate-50 px-3 py-2 overflow-x-auto">
                    <div className="flex items-center gap-2">
                        {safeFiles.map((f, idx) => {
                            const active = idx === activeIndex;
                            return (
                                <button
                                    key={`${f.name}-${idx}`}
                                    type="button"
                                    onClick={() => onActiveIndexChange(idx)}
                                    className={classNames(
                                        "shrink-0 rounded-xl border px-3 py-1.5 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30",
                                        active
                                            ? "border-sky-200 bg-white text-sky-800"
                                            : "border-slate-200 bg-white/70 text-slate-700 hover:bg-white",
                                    )}
                                    aria-current={active ? "true" : undefined}
                                >
                                    <span className="max-w-[220px] truncate block">
                                        {f.name}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            ) : null}

            <div className="h-[55vh] sm:h-[62vh] lg:h-[70vh] bg-slate-50">
                {currentUrl ? (
                    <Worker workerUrl={workerUrl}>
                        <Viewer
                            fileUrl={currentUrl}
                            plugins={[layoutPlugin]}
                            renderLoader={(percentages) => (
                                <div className="h-full w-full flex items-center justify-center">
                                    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                                        <div className="text-sm font-semibold text-slate-900">
                                            Memuat PDF
                                        </div>
                                        <div className="mt-2 h-2 w-64 rounded-full bg-slate-100 overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-sky-600 to-cyan-600 transition-all"
                                                style={{
                                                    width: `${Math.max(
                                                        0,
                                                        Math.min(
                                                            100,
                                                            percentages,
                                                        ),
                                                    )}%`,
                                                }}
                                            />
                                        </div>
                                        <div className="mt-2 text-xs text-slate-500">
                                            {Math.round(percentages)}%
                                        </div>
                                    </div>
                                </div>
                            )}
                        />
                    </Worker>
                ) : (
                    <div className="h-full w-full flex items-center justify-center">
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-6 text-sm text-slate-600">
                            Pilih PDF untuk menampilkan preview.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
