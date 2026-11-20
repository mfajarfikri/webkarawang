import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { Head, Link } from "@inertiajs/react";
import axios from "axios";
import HomeLayout from "@/Layouts/HomeLayout";
import { motion } from "framer-motion";
import { edjsParser, sanitizeEditorData } from "@/utils/editorParser";
import {
    FaArrowRight,
    FaBolt,
    FaBullseye,
    FaBuilding,
    FaCheck,
    FaChevronLeft,
    FaChevronRight,
    FaDownload,
    FaEnvelope,
    FaExclamationTriangle,
    FaExternalLinkAlt,
    FaFileAlt,
    FaFolderOpen,
    FaGlobe,
    FaHandshake,
    FaHistory,
    FaIndustry,
    FaLeaf,
    FaLightbulb,
    FaLinkedinIn,
    FaMapMarkerAlt,
    FaPhoneAlt,
    FaQuoteLeft,
    FaShieldAlt,
    FaSitemap,
    FaSyncAlt,
    FaTimes,
    FaUsers,
} from "react-icons/fa";

const SERVICE_ICONS = {
    bolt: FaBolt,
    shield: FaShieldAlt,
    industry: FaIndustry,
    lightbulb: FaLightbulb,
    users: FaUsers,
    leaf: FaLeaf,
    sitemap: FaSitemap,
    handshake: FaHandshake,
    globe: FaGlobe,
    building: FaBuilding,
};

const POLL_INTERVAL_MS = 60000;

function classNames(...v) {
    return v.filter(Boolean).join(" ");
}

function asString(value, fallback = "") {
    if (typeof value === "string") return value;
    if (value === null || value === undefined) return fallback;
    return String(value);
}

function safeArray(v) {
    return Array.isArray(v) ? v : [];
}

function resolveImageUrl(value) {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object" && typeof value.url === "string")
        return value.url;
    return "";
}

function parseEditorToHtml(editorData) {
    if (!editorData) return "";
    if (typeof editorData === "string") {
        try {
            const parsed = JSON.parse(editorData);
            if (
                parsed &&
                typeof parsed === "object" &&
                parsed.blocks &&
                Array.isArray(parsed.blocks)
            ) {
                return parseEditorToHtml(parsed);
            }
            return editorData
                .split(/\r?\n/)
                .map((line) =>
                    line.trim()
                        ? `<p class="mb-3 leading-relaxed text-slate-700">${line}</p>`
                        : "",
                )
                .join("");
        } catch {
            return editorData
                .split(/\r?\n/)
                .map((line) =>
                    line.trim()
                        ? `<p class="mb-3 leading-relaxed text-slate-700">${line}</p>`
                        : "",
                )
                .join("");
        }
    }
    if (typeof editorData === "object") {
        try {
            const parsed = sanitizeEditorData(editorData);
            if (parsed && parsed.blocks && Array.isArray(parsed.blocks)) {
                const htmlArray = edjsParser.parse(parsed);
                if (Array.isArray(htmlArray)) {
                    return htmlArray.join("");
                }
            }
        } catch (error) {
            console.error("Error parsing editor data:", error);
        }
    }
    if (typeof editorData === "string" && editorData.trim()) {
        return `<p class="leading-relaxed text-slate-700">${editorData}</p>`;
    }
    return "";
}

function extractPlainTextFromHtml(html) {
    if (!html || typeof window === "undefined") return "";
    try {
        const doc = new DOMParser().parseFromString(html, "text/html");
        return asString(doc?.body?.textContent || "")
            .replace(/\s+/g, " ")
            .trim();
    } catch {
        return "";
    }
}

function useActiveSection(sectionIds) {
    const [active, setActive] = useState(sectionIds[0] || "");
    useEffect(() => {
        const nodes = sectionIds
            .map((id) => document.getElementById(id))
            .filter(Boolean);
        if (nodes.length === 0) return;
        const io = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort(
                        (a, b) =>
                            (b.intersectionRatio || 0) -
                            (a.intersectionRatio || 0),
                    );
                const top = visible[0]?.target?.id;
                if (top) setActive(top);
            },
            {
                root: null,
                threshold: [0.15, 0.25, 0.35, 0.5],
                rootMargin: "-20% 0px -65% 0px",
            },
        );
        nodes.forEach((n) => io.observe(n));
        return () => io.disconnect();
    }, [sectionIds]);
    return { active, setActive };
}

function SectionHeader({ eyebrow, title, subtitle, align = "center" }) {
    return (
        <div
            className={classNames(
                "mb-8 sm:mb-10",
                align === "center"
                    ? "text-center mx-auto max-w-2xl"
                    : "max-w-2xl",
            )}
        >
            <div
                className={classNames(
                    "text-[11px] font-bold uppercase tracking-[0.2em] text-sky-700",
                    align === "center"
                        ? "flex items-center justify-center gap-2"
                        : "flex items-center gap-2",
                )}
            >
                <span className="inline-block h-[3px] w-10 rounded-full bg-gradient-to-r from-sky-600 to-amber-500" />
                {eyebrow}
                <span className="inline-block h-[3px] w-10 rounded-full bg-gradient-to-l from-sky-600 to-amber-500" />
            </div>
            <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                {title}
            </h2>
            {subtitle ? (
                <p className="mt-3 text-sm sm:text-base text-slate-500 leading-relaxed">
                    {subtitle}
                </p>
            ) : null}
        </div>
    );
}

function LiveSyncBadge({ lastSync, syncing, error, compact }) {
    if (compact) {
        const label = error
            ? "Gagal"
            : syncing
              ? "Sinkron..."
              : lastSync
                ? lastSync
                : "Live";
        const tone = error
            ? "border-rose-200 bg-rose-50 text-rose-600"
            : syncing
              ? "border-amber-200 bg-amber-50 text-amber-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700";
        const dot = error
            ? "bg-rose-500"
            : syncing
              ? "bg-amber-500"
              : "bg-emerald-500";
        const ping = error ? "" : syncing ? "bg-amber-400" : "bg-emerald-400";
        return (
            <div
                className={classNames(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold",
                    tone,
                )}
                title="Data profil disinkronkan otomatis dari database"
            >
                <span className="relative flex h-2 w-2">
                    {!error && ping ? (
                        <span
                            className={classNames(
                                "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                                ping,
                            )}
                        />
                    ) : null}
                    <span
                        className={classNames(
                            "relative inline-flex h-2 w-2 rounded-full",
                            dot,
                        )}
                    />
                </span>
                <span className="leading-none">{label}</span>
            </div>
        );
    }
    return (
        <div
            className={classNames(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold",
                error
                    ? "border-rose-200 bg-rose-50 text-rose-600"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700",
            )}
            title="Data profil disinkronkan otomatis dari database"
        >
            <span className="relative flex h-2 w-2">
                {!error && (
                    <span
                        className={classNames(
                            "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                            syncing ? "bg-amber-400" : "bg-emerald-400",
                        )}
                    />
                )}
                <span
                    className={classNames(
                        "relative inline-flex h-2 w-2 rounded-full",
                        error
                            ? "bg-rose-500"
                            : syncing
                              ? "bg-amber-500"
                              : "bg-emerald-500",
                    )}
                />
            </span>
            {error ? (
                "Gagal memperbarui data"
            ) : syncing ? (
                "Menyinkronkan..."
            ) : lastSync ? (
                <>Data real-time · diperbarui {lastSync}</>
            ) : (
                "Data real-time"
            )}
        </div>
    );
}

function Skeleton({ className }) {
    return (
        <div
            className={classNames(
                "animate-pulse rounded-xl bg-slate-200/70",
                className,
            )}
        />
    );
}

function EmptyState({ onRetry }) {
    return (
        <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white/70 p-10 text-center shadow-sm backdrop-blur">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                <FaBuilding className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-slate-900">
                Profil belum diterbitkan
            </h2>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                Data profil perusahaan belum dipublikasikan oleh admin. Silakan
                kembali lagi nanti.
            </p>
            <div className="mt-6 flex justify-center gap-3">
                <button
                    type="button"
                    onClick={onRetry}
                    className="inline-flex items-center gap-2 rounded-xl bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800 transition-colors"
                >
                    <FaSyncAlt className="h-3.5 w-3.5" /> Muat Ulang
                </button>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                    Kembali ke Beranda
                </Link>
            </div>
        </div>
    );
}

function ErrorBanner({ message, onRetry }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
            <div className="flex items-center gap-3">
                <FaExclamationTriangle className="h-5 w-5 shrink-0 text-rose-500" />
                <div className="text-sm text-rose-700">
                    <div className="font-semibold">
                        Gagal menghubungi server
                    </div>
                    <div className="text-xs text-rose-600">{message}</div>
                </div>
            </div>
            <button
                type="button"
                onClick={onRetry}
                className="ml-auto inline-flex items-center gap-2 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
            >
                <FaSyncAlt className="h-3 w-3" /> Coba Lagi
            </button>
        </div>
    );
}

function ProseContent({ html }) {
    if (!html) return null;
    return (
        <div
            className="prose-sm sm:prose-base prose-slate max-w-none leading-relaxed text-slate-600
                prose-headings:font-bold prose-headings:text-slate-900
                prose-a:text-sky-700 prose-strong:text-slate-800"
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}

function StatCard({ stat }) {
    const value = asString(stat?.value, "-");
    return (
        <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-12px_rgba(15,23,42,0.12)]">
            <div className="absolute top-0 right-0 h-16 w-16 rounded-full bg-gradient-to-br from-sky-100 via-sky-50 to-transparent opacity-80" />
            <div className="relative">
                <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-sky-800 to-sky-600">
                    {value}
                    {stat?.unit ? (
                        <span className="ml-1 text-base font-bold text-slate-400 bg-none bg-clip-text text-slate-400">
                            {stat.unit}
                        </span>
                    ) : null}
                </div>
                <div className="mt-1 text-sm font-bold text-slate-700">
                    {stat?.label || "Statistik"}
                </div>
                {stat?.sourceLabel ? (
                    <a
                        href={stat?.sourceUrl || "#"}
                        target={stat?.sourceUrl ? "_blank" : undefined}
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 hover:text-sky-900"
                    >
                        {stat.sourceLabel}{" "}
                        <FaExternalLinkAlt className="h-2.5 w-2.5" />
                    </a>
                ) : null}
            </div>
        </div>
    );
}

function InfoRow({ icon: Icon, label, value, href }) {
    if (!value) return null;
    const content = (
        <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-50 to-sky-100 text-sky-700 ring-1 ring-sky-200/60">
                <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
                <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    {label}
                </div>
                <div className="mt-0.5 text-sm font-semibold text-slate-800 leading-relaxed break-words">
                    {value}
                </div>
            </div>
        </div>
    );
    if (href) {
        return (
            <a
                href={href}
                className="block rounded-2xl border border-slate-100 bg-slate-50/70 p-3 transition-colors hover:bg-slate-50"
            >
                {content}
            </a>
        );
    }
    return (
        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
            {content}
        </div>
    );
}

function TimelineItem({ item, index }) {
    const isLast = index === null;
    return (
        <div className="relative flex gap-5">
            <div className="flex flex-col items-center">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-700 via-sky-800 to-slate-900 text-white shadow-sm ring-4 ring-sky-50">
                    <FaHistory className="h-4 w-4" />
                </span>
                {!isLast && (
                    <span className="mt-2 w-px flex-1 bg-gradient-to-b from-sky-200 via-sky-100 to-transparent" />
                )}
            </div>
            <div className="pb-10 flex-1">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 ring-1 ring-sky-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-sky-700">
                    {item?.periodLabel || "Periode"}
                </div>
                <h3 className="mt-2 text-base font-extrabold text-slate-900">
                    {item?.title || "Tahapan"}
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    {item?.description || ""}
                </p>
            </div>
        </div>
    );
}

function Gallery({ items }) {
    const [activeIndex, setActiveIndex] = useState(null);
    const photos = safeArray(items)
        .map((it) => ({
            url: resolveImageUrl(it?.url ?? it),
            alt: it?.alt || "Dokumentasi kegiatan",
        }))
        .filter((p) => p.url);

    if (photos.length === 0) return null;

    const open = (i) => setActiveIndex(i);
    const close = () => setActiveIndex(null);
    const step = (dir) =>
        setActiveIndex((cur) => (cur + dir + photos.length) % photos.length);

    return (
        <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {photos.map((p, i) => (
                    <button
                        key={p.url + i}
                        type="button"
                        onClick={() => open(i)}
                        className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-100 bg-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                        <img
                            src={p.url}
                            alt={p.alt}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <span className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    </button>
                ))}
            </div>

            {activeIndex !== null && photos[activeIndex] ? (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 p-4 backdrop-blur-sm"
                    role="dialog"
                    aria-modal="true"
                    onClick={close}
                >
                    <button
                        type="button"
                        aria-label="Tutup"
                        onClick={close}
                        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                    >
                        <FaTimes className="h-5 w-5" />
                    </button>
                    <button
                        type="button"
                        aria-label="Sebelumnya"
                        onClick={(e) => {
                            e.stopPropagation();
                            step(-1);
                        }}
                        className="absolute left-3 sm:left-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                    >
                        <FaChevronLeft className="h-5 w-5" />
                    </button>
                    <figure
                        className="max-h-[85vh] max-w-4xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={photos[activeIndex].url}
                            alt={photos[activeIndex].alt}
                            className="max-h-[80vh] w-auto rounded-2xl object-contain shadow-2xl"
                        />
                        <figcaption className="mt-3 text-center text-sm text-slate-300">
                            {photos[activeIndex].alt}{" "}
                            <span className="text-slate-500">
                                ({activeIndex + 1}/{photos.length})
                            </span>
                        </figcaption>
                    </figure>
                    <button
                        type="button"
                        aria-label="Berikutnya"
                        onClick={(e) => {
                            e.stopPropagation();
                            step(1);
                        }}
                        className="absolute right-3 sm:right-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                    >
                        <FaChevronRight className="h-5 w-5" />
                    </button>
                </div>
            ) : null}
        </div>
    );
}

function TestimonialCarousel({ items }) {
    const testimonials = safeArray(items);
    const [idx, setIdx] = useState(0);
    const count = testimonials.length;
    const auto = useRef(null);

    useEffect(() => {
        if (count <= 1) return;
        auto.current = setInterval(() => setIdx((c) => (c + 1) % count), 6000);
        return () => clearInterval(auto.current);
    }, [count]);

    if (count === 0) return null;
    const t = testimonials[Math.min(idx, count - 1)];

    return (
        <div className="relative mx-auto max-w-3xl">
            <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-10 shadow-sm">
                <FaQuoteLeft className="h-8 w-8 text-sky-100" />
                <p className="mt-4 text-base sm:text-lg text-slate-700 leading-relaxed">
                    {t?.quote || ""}
                </p>
                <div className="mt-6 flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-700">
                        {asString(t?.name, "?").charAt(0).toUpperCase()}
                    </span>
                    <div>
                        <div className="text-sm font-bold text-slate-900">
                            {t?.name || "—"}
                        </div>
                        <div className="text-xs text-slate-500">
                            {[t?.role, t?.organization]
                                .filter(Boolean)
                                .join(" · ")}
                        </div>
                    </div>
                </div>
            </div>
            {count > 1 ? (
                <div className="mt-4 flex items-center justify-center gap-2">
                    <button
                        type="button"
                        aria-label="Sebelumnya"
                        onClick={() => setIdx((c) => (c - 1 + count) % count)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"
                    >
                        <FaChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    {testimonials.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            aria-label={`Testimoni ${i + 1}`}
                            onClick={() => setIdx(i)}
                            className={classNames(
                                "h-2 rounded-full transition-all",
                                i === idx
                                    ? "w-6 bg-sky-600"
                                    : "w-2 bg-slate-300 hover:bg-slate-400",
                            )}
                        />
                    ))}
                    <button
                        type="button"
                        aria-label="Berikutnya"
                        onClick={() => setIdx((c) => (c + 1) % count)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"
                    >
                        <FaChevronRight className="h-3.5 w-3.5" />
                    </button>
                </div>
            ) : null}
        </div>
    );
}

export default function ProfilPerusahaan({ publishedProfile = null }) {
    const [data, setData] = useState(publishedProfile);
    const [initialLoading, setInitialLoading] = useState(!publishedProfile);
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState(null);
    const [lastSync, setLastSync] = useState(null);
    const [pageError, setPageError] = useState(null);

    const dataRef = useRef(publishedProfile);
    useEffect(() => {
        dataRef.current = data;
    }, [data]);

    const fetchData = useCallback(
        async (isInitial = false) => {
            if (isInitial) setInitialLoading(true);
            else setSyncing(true);
            try {
                const res = await axios.get("/profil/data", { timeout: 10000 });
                setData(res.data?.data ?? null);
                setPageError(null);
                setError(null);
                if (res.data?.updated_at) {
                    setLastSync(
                        new Date(res.data.updated_at).toLocaleTimeString(
                            "id-ID",
                            {
                                hour: "2-digit",
                                minute: "2-digit",
                            },
                        ),
                    );
                }
            } catch (err) {
                const msg =
                    err?.code === "ECONNABORTED"
                        ? "Server tidak merespons (timeout)."
                        : err?.response?.status === 500
                          ? "Terjadi kesalahan pada server."
                          : "Koneksi ke database gagal.";
                setError(msg);
                if (!dataRef.current && !publishedProfile) setPageError(msg);
            } finally {
                setInitialLoading(false);
                setSyncing(false);
            }
        },
        [publishedProfile],
    );

    useEffect(() => {
        fetchData(true);
        const id = setInterval(() => fetchData(false), POLL_INTERVAL_MS);
        return () => clearInterval(id);
    }, [fetchData]);

    const content = useMemo(() => {
        const aboutHtml =
            parseEditorToHtml(data?.about_editor) ||
            parseEditorToHtml(data?.about) ||
            parseEditorToHtml(data?.description) ||
            "";
        const visionHtml =
            parseEditorToHtml(data?.vision_editor) ||
            parseEditorToHtml(data?.vision) ||
            parseEditorToHtml(data?.visi) ||
            "";
        const rawMissions =
            data?.missions ??
            data?.mission ??
            data?.misi ??
            data?.mission_list ??
            [];
        const missions = safeArray(rawMissions).filter((m) => {
            if (!m) return false;
            const text = typeof m === "string" ? m : m?.text || m?.content;
            return Boolean(text && text.trim());
        });
        const history = safeArray(
            data?.history ?? data?.timeline ?? data?.sejarah ?? [],
        );
        const stats = safeArray(data?.stats ?? data?.statistics ?? []);
        const galleryItems = safeArray(
            data?.gallery?.items ??
                data?.gallery ??
                data?.photos ??
                data?.images ??
                [],
        );
        const testimonials = safeArray(
            data?.testimonials ?? data?.testimonies ?? data?.ulasan ?? [],
        );
        return {
            companyName:
                asString(data?.company_name, "PLN UPT Karawang") ||
                asString(data?.name, "PLN UPT Karawang"),
            tagline:
                asString(data?.tagline, "") || asString(data?.subtitle, ""),
            aboutHtml,
            aboutText: extractPlainTextFromHtml(aboutHtml),
            logoUrl:
                resolveImageUrl(data?.logo) ||
                resolveImageUrl(data?.logo_url) ||
                resolveImageUrl(data?.logoImage),
            coverUrl:
                resolveImageUrl(data?.cover) ||
                resolveImageUrl(data?.cover_url) ||
                resolveImageUrl(data?.banner) ||
                resolveImageUrl(data?.hero_image),
            contact: {
                address:
                    asString(data?.address, "") ||
                    asString(data?.location, "") ||
                    asString(data?.alamat, ""),
                phone:
                    asString(data?.phone, "") ||
                    asString(data?.telephone, "") ||
                    asString(data?.telp, "") ||
                    asString(data?.contact_phone, ""),
                email:
                    asString(data?.email, "") ||
                    asString(data?.contact_email, ""),
                website:
                    asString(data?.website, "") ||
                    asString(data?.web, "") ||
                    asString(data?.url, ""),
                social: data?.social || data?.social_media || {},
            },
            hasMap:
                Boolean(data?.map?.lat && data?.map?.lng) ||
                Boolean(
                    (data?.latitude || data?.lat) &&
                    (data?.longitude || data?.lng),
                ),
            mapEmbedUrl: (() => {
                const lat = data?.map?.lat || data?.latitude || data?.lat;
                const lng = data?.map?.lng || data?.longitude || data?.lng;
                if (lat && lng) {
                    return `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
                }
                return "";
            })(),
            visionHtml,
            visionText: extractPlainTextFromHtml(visionHtml),
            missions,
            history,
            stats,
            galleryItems,
            teamPhotoUrl:
                resolveImageUrl(data?.team?.photo) ||
                resolveImageUrl(data?.teamPhoto),
            teamMembers: safeArray(
                data?.team?.members ??
                    data?.team_members ??
                    data?.teams ??
                    data?.team ??
                    [],
            ).filter((t) => Boolean(t?.name || t?.nama)),
            testimonials,
            documents: safeArray(data?.documents ?? data?.files ?? []),
            services: safeArray(data?.services ?? data?.layanan ?? []),
            portfolio: safeArray(data?.portfolio ?? data?.portofolio ?? []),
        };
    }, [data]);

    const sections = useMemo(
        () => [
            { id: "profil", label: "Profil" },
            { id: "visi-misi", label: "Visi & Misi" },
            { id: "layanan", label: "Layanan" },
            { id: "sejarah", label: "Sejarah" },
            { id: "portofolio", label: "Portofolio" },
            { id: "galeri", label: "Galeri" },
            { id: "statistik", label: "Statistik" },
            { id: "testimoni", label: "Testimoni" },
            { id: "kontak", label: "Kontak" },
        ],
        [],
    );

    const visibleSections = useMemo(
        () =>
            sections.filter((s) => {
                switch (s.id) {
                    case "profil":
                        return true;
                    case "visi-misi":
                        return Boolean(
                            content.visionHtml || content.missions.length,
                        );
                    case "layanan":
                        return content.services.length > 0;
                    case "sejarah":
                        return content.history.length > 0;
                    case "portofolio":
                        return content.portfolio.length > 0;
                    case "galeri":
                        return content.galleryItems.length > 0;
                    case "statistik":
                        return content.stats.length > 0;
                    case "testimoni":
                        return content.testimonials.length > 0;
                    case "kontak":
                        return true;
                    default:
                        return true;
                }
            }),
        [sections, content],
    );

    const { active, setActive } = useActiveSection(
        visibleSections.map((s) => s.id),
    );

    const jumpTo = (id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        setActive(id);
    };

    const hasContent = Boolean(
        content.companyName ||
        content.aboutHtml ||
        content.visionHtml ||
        content.missions.length ||
        content.history.length ||
        content.teamMembers.length ||
        content.stats.length ||
        content.galleryItems.length ||
        content.testimonials.length ||
        content.services.length ||
        content.portfolio.length ||
        content.documents.length ||
        content.contact.address ||
        content.contact.phone ||
        content.contact.email ||
        content.contact.website,
    );

    if (initialLoading) {
        return (
            <HomeLayout>
                <Head>
                    <title>Profil Perusahaan | PLN UPT Karawang</title>
                </Head>
                <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
                    <Skeleton className="h-[340px] w-full rounded-3xl" />
                    <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <Skeleton className="h-64 w-full" />
                        <Skeleton className="h-64 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                    <Skeleton className="mt-10 h-40 w-full" />
                </div>
            </HomeLayout>
        );
    }

    return (
        <HomeLayout>
            <Head>
                <title>{`Profil Perusahaan | ${content.companyName}`}</title>
                <meta
                    name="description"
                    content={
                        content.aboutText
                            ? `${content.companyName} — ${content.aboutText.slice(0, 150)}`
                            : `Profil perusahaan ${content.companyName}.`
                    }
                />
            </Head>

            <div className="relative overflow-hidden bg-gradient-to-b from-sky-50/80 via-white to-white">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] opacity-60 [background-image:radial-gradient(ellipse_at_top,rgba(14,116,144,0.12)_0,transparent_55%),radial-gradient(ellipse_at_top_right,rgba(251,191,36,0.10)_0,transparent_50%)]" />

                <div className="mx-auto max-w-6xl px-4 sm:px-6 py-7 sm:py-10">
                    {pageError ? (
                        <div className="mb-5">
                            <ErrorBanner
                                message={pageError}
                                onRetry={() => fetchData(true)}
                            />
                        </div>
                    ) : null}

                    {!hasContent ? (
                        <div className="py-16">
                            <EmptyState onRetry={() => fetchData(true)} />
                        </div>
                    ) : (
                        <>
                            {/* Hero */}
                            <section id="profil" className="scroll-mt-20">
                                <motion.div
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="relative overflow-hidden rounded-3xl border border-slate-200 shadow-[0_12px_40px_-16px_rgba(15,23,42,0.18)]"
                                >
                                    {content.coverUrl ? (
                                        <div className="relative h-72 sm:h-80 lg:h-[26rem]">
                                            <img
                                                src={content.coverUrl}
                                                alt="Cover profil perusahaan"
                                                loading="eager"
                                                decoding="async"
                                                className="absolute inset-0 h-full w-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/55 to-slate-900/30" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                                        </div>
                                    ) : (
                                        <div className="relative h-72 sm:h-80 lg:h-[26rem] overflow-hidden bg-gradient-to-br from-sky-900 via-sky-800 to-slate-700">
                                            <div className="absolute inset-0 opacity-[0.22] [background-image:radial-gradient(circle_at_15%_25%,rgba(255,255,255,0.55)_0,transparent_35%),radial-gradient(circle_at_82%_72%,rgba(251,191,36,0.35)_0,transparent_40%)]" />
                                            <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:44px_44px]" />
                                        </div>
                                    )}

                                    <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10 lg:px-16">
                                        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 backdrop-blur-md">
                                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                                            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-100">
                                                Profil Perusahaan
                                            </span>
                                        </div>
                                        <h1 className="mt-4 max-w-3xl text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight drop-shadow-[0_2px_14px_rgba(0,0,0,0.35)]">
                                            {content.companyName}
                                        </h1>
                                        {content.tagline ? (
                                            <p className="mt-3 max-w-2xl text-sm sm:text-lg font-semibold text-sky-100/90 leading-relaxed">
                                                {content.tagline}
                                            </p>
                                        ) : null}
                                        {content.aboutText ? (
                                            <p className="mt-4 max-w-2xl line-clamp-2 text-sm text-white/75 leading-relaxed">
                                                {content.aboutText}
                                            </p>
                                        ) : null}
                                        <div className="mt-6 flex flex-wrap items-center gap-3">
                                            {visibleSections
                                                .slice(1, 5)
                                                .map((s) => (
                                                    <button
                                                        key={s.id}
                                                        type="button"
                                                        onClick={() =>
                                                            jumpTo(s.id)
                                                        }
                                                        className="group inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white hover:text-sky-900"
                                                    >
                                                        {s.label}
                                                        <FaArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                                                    </button>
                                                ))}
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Identity Card */}
                                <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
                                    <div className="lg:col-span-2 relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
                                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-700 via-sky-500 to-amber-500" />
                                        <div className="flex flex-col sm:flex-row gap-5">
                                            <div className="shrink-0">
                                                {content.logoUrl ? (
                                                    <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-slate-100 bg-white p-2 shadow-sm">
                                                        <img
                                                            src={
                                                                content.logoUrl
                                                            }
                                                            alt="Logo"
                                                            loading="eager"
                                                            decoding="async"
                                                            className="h-full w-full object-contain"
                                                        />
                                                    </div>
                                                ) : (
                                                    <span className="flex h-24 w-24 items-center justify-center rounded-2xl border border-slate-100 bg-gradient-to-br from-sky-700 to-sky-900 text-white shadow-sm">
                                                        <FaBuilding className="h-11 w-11" />
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-700">
                                                    Identitas Utama
                                                </div>
                                                <h2 className="mt-1 text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                                                    {content.companyName}
                                                </h2>
                                                {content.tagline ? (
                                                    <p className="mt-1 text-sm font-semibold text-slate-500">
                                                        {content.tagline}
                                                    </p>
                                                ) : null}
                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    {content.contact.address ? (
                                                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 border border-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                                                            <FaMapMarkerAlt className="h-3 w-3 text-sky-600" />
                                                            <span className="line-clamp-1 max-w-[280px]">
                                                                {
                                                                    content
                                                                        .contact
                                                                        .address
                                                                }
                                                            </span>
                                                        </span>
                                                    ) : null}
                                                    {content.contact.phone ? (
                                                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 border border-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                                                            <FaPhoneAlt className="h-3 w-3 text-sky-600" />
                                                            {
                                                                content.contact
                                                                    .phone
                                                            }
                                                        </span>
                                                    ) : null}
                                                    {content.contact.email ? (
                                                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 border border-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                                                            <FaEnvelope className="h-3 w-3 text-sky-600" />
                                                            {
                                                                content.contact
                                                                    .email
                                                            }
                                                        </span>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-sky-900 to-sky-800 p-5 sm:p-6 shadow-sm text-white">
                                        <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle_at_80%_10%,rgba(251,191,36,0.7)_0,transparent_45%)]" />
                                        <div className="relative">
                                            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-200">
                                                Navigasi Cepat
                                            </div>
                                            <div className="mt-3 grid grid-cols-2 gap-2">
                                                {visibleSections
                                                    .slice(1)
                                                    .map((s) => (
                                                        <button
                                                            key={s.id}
                                                            type="button"
                                                            onClick={() =>
                                                                jumpTo(s.id)
                                                            }
                                                            className="group inline-flex items-center justify-between rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/90 transition-colors hover:bg-white hover:text-sky-900"
                                                        >
                                                            <span>
                                                                {s.label}
                                                            </span>
                                                            <FaArrowRight className="h-3 w-3 opacity-70 group-hover:opacity-100" />
                                                        </button>
                                                    ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Sticky section navigation */}
                            <div className="sticky top-16 z-30 -mx-4 mt-8 sm:mt-10 sm:-mx-6 border-y border-slate-200/70 bg-white/90 backdrop-blur-xl shadow-[0_4px_18px_-14px_rgba(15,23,42,0.12)]">
                                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                                    {/* Desktop: Pill tabs + sync status */}
                                    <div className="hidden lg:flex items-center justify-between gap-4 py-2.5">
                                        <div className="flex min-w-0 items-center gap-1 overflow-x-auto">
                                            {visibleSections.map((s) => (
                                                <button
                                                    key={s.id}
                                                    type="button"
                                                    onClick={() => jumpTo(s.id)}
                                                    className={classNames(
                                                        "relative shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-bold transition-all duration-200",
                                                        active === s.id
                                                            ? "bg-sky-900 text-white shadow-[0_6px_18px_-10px_rgba(14,116,144,0.8)]"
                                                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                                                    )}
                                                >
                                                    <span className="relative inline-flex items-center gap-2">
                                                        {active === s.id ? (
                                                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_0_3px_rgba(251,191,36,0.18)]" />
                                                        ) : null}
                                                        {s.label}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex shrink-0 items-center gap-3">
                                            <div className="hidden xl:flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                                                <FaSyncAlt className="h-3 w-3 text-sky-500" />
                                                Database Profil
                                            </div>
                                            <LiveSyncBadge
                                                compact
                                                lastSync={lastSync}
                                                syncing={syncing}
                                                error={error}
                                            />
                                        </div>
                                    </div>
                                    {/* Mobile: Label + select + sync */}
                                    <div className="lg:hidden flex flex-col gap-2 py-2.5">
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                                                Bagian
                                            </span>
                                            <LiveSyncBadge
                                                compact
                                                lastSync={lastSync}
                                                syncing={syncing}
                                                error={error}
                                            />
                                        </div>
                                        <select
                                            value={active}
                                            onChange={(e) =>
                                                jumpTo(e.target.value)
                                            }
                                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                                        >
                                            {visibleSections.map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Profil / Tentang */}
                            {content.aboutHtml ? (
                                <section
                                    id="tentang"
                                    className="scroll-mt-36 mt-12 sm:mt-16"
                                >
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                        <div className="lg:col-span-7 relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-[0_4px_24px_-12px_rgba(15,23,42,0.08)]">
                                            <div className="absolute inset-x-6 top-0 h-1 rounded-full bg-gradient-to-r from-sky-700 via-sky-500 to-sky-300" />
                                            <SectionHeader
                                                align="left"
                                                eyebrow="Tentang Kami"
                                                title="Mengenal Lebih Dekat"
                                            />
                                            <ProseContent
                                                html={content.aboutHtml}
                                            />
                                        </div>
                                        <div className="lg:col-span-5 space-y-4">
                                            <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_4px_24px_-12px_rgba(15,23,42,0.08)]">
                                                <div className="absolute inset-x-6 top-0 h-1 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300" />
                                                <h3 className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-600">
                                                    Informasi Kontak
                                                </h3>
                                                <div className="mt-4 space-y-3">
                                                    <InfoRow
                                                        icon={FaMapMarkerAlt}
                                                        label="Alamat"
                                                        value={
                                                            content.contact
                                                                .address
                                                        }
                                                    />
                                                    <InfoRow
                                                        icon={FaPhoneAlt}
                                                        label="Telepon"
                                                        value={
                                                            content.contact
                                                                .phone
                                                        }
                                                        href={
                                                            content.contact
                                                                .phone
                                                                ? `tel:${content.contact.phone.replace(/[^+\d]/g, "")}`
                                                                : ""
                                                        }
                                                    />
                                                    <InfoRow
                                                        icon={FaEnvelope}
                                                        label="Email"
                                                        value={
                                                            content.contact
                                                                .email
                                                        }
                                                        href={
                                                            content.contact
                                                                .email
                                                                ? `mailto:${content.contact.email}`
                                                                : ""
                                                        }
                                                    />
                                                    <InfoRow
                                                        icon={FaGlobe}
                                                        label="Website"
                                                        value={
                                                            content.contact
                                                                .website
                                                        }
                                                        href={
                                                            content.contact.website?.startsWith(
                                                                "http",
                                                            )
                                                                ? content
                                                                      .contact
                                                                      .website
                                                                : `https://${content.contact.website}`
                                                        }
                                                    />
                                                    {content.contact.social
                                                        ?.linkedin ? (
                                                        <InfoRow
                                                            icon={FaLinkedinIn}
                                                            label="LinkedIn"
                                                            value={
                                                                content.contact
                                                                    .social
                                                                    .linkedin
                                                            }
                                                            href={
                                                                content.contact
                                                                    .social
                                                                    .linkedin
                                                            }
                                                        />
                                                    ) : null}
                                                </div>
                                            </div>
                                            {content.hasMap ? (
                                                <div className="overflow-hidden rounded-3xl border border-slate-100 shadow-[0_4px_24px_-12px_rgba(15,23,42,0.08)]">
                                                    <iframe
                                                        title="Lokasi perusahaan"
                                                        src={
                                                            content.mapEmbedUrl
                                                        }
                                                        className="h-56 w-full border-0"
                                                        loading="lazy"
                                                        referrerPolicy="no-referrer-when-downgrade"
                                                        allowFullScreen
                                                    />
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                </section>
                            ) : null}

                            {/* Visi & Misi */}
                            {content.visionHtml || content.missions.length ? (
                                <section
                                    id="visi-misi"
                                    className="scroll-mt-36 mt-12 sm:mt-16"
                                >
                                    <SectionHeader
                                        eyebrow="Arah Strategis"
                                        title="Visi & Misi"
                                        subtitle="Landasan arah dan tujuan organisasi dalam memberikan layanan terbaik."
                                    />
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                        {content.visionHtml ? (
                                            <div className="lg:col-span-5 relative overflow-hidden rounded-3xl border border-sky-100 bg-white p-6 sm:p-8 shadow-[0_4px_24px_-12px_rgba(15,23,42,0.08)]">
                                                <div className="absolute inset-x-6 top-0 h-1 rounded-full bg-gradient-to-r from-sky-700 to-sky-400" />
                                                <div className="mt-2 flex items-center gap-3">
                                                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-700 to-sky-900 text-white shadow-sm">
                                                        <FaBullseye className="h-5 w-5" />
                                                    </span>
                                                    <h3 className="text-lg font-extrabold text-slate-900">
                                                        Visi
                                                    </h3>
                                                </div>
                                                <div className="mt-5">
                                                    <ProseContent
                                                        html={
                                                            content.visionHtml
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        ) : null}
                                        <div
                                            className={classNames(
                                                content.visionHtml
                                                    ? "lg:col-span-7"
                                                    : "lg:col-span-12",
                                            )}
                                        >
                                            <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-white p-6 sm:p-8 shadow-[0_4px_24px_-12px_rgba(15,23,42,0.08)]">
                                                <div className="absolute inset-x-6 top-0 h-1 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-teal-300" />
                                                <div className="mt-2 flex items-center gap-3">
                                                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-sm">
                                                        <FaCheck className="h-5 w-5" />
                                                    </span>
                                                    <h3 className="text-lg font-extrabold text-slate-900">
                                                        Misi
                                                    </h3>
                                                </div>
                                                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {content.missions.map(
                                                        (m, i) => {
                                                            const text =
                                                                typeof m ===
                                                                "string"
                                                                    ? m
                                                                    : m?.text ||
                                                                      "";
                                                            return (
                                                                <div
                                                                    key={i}
                                                                    className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4"
                                                                >
                                                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
                                                                        <FaCheck className="h-4 w-4" />
                                                                    </span>
                                                                    <p className="pt-0.5 text-sm text-slate-700 leading-relaxed">
                                                                        {text}
                                                                    </p>
                                                                </div>
                                                            );
                                                        },
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            ) : null}

                            {/* Layanan */}
                            {content.services.length ? (
                                <section
                                    id="layanan"
                                    className="scroll-mt-36 mt-12 sm:mt-16"
                                >
                                    <SectionHeader
                                        eyebrow="Apa yang Kami Lakukan"
                                        title="Layanan Kami"
                                        subtitle="Layanan dan solusi yang kami tawarkan untuk memenuhi kebutuhan pemangku kepentingan."
                                    />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                        {content.services.map((s, i) => {
                                            const Icon =
                                                SERVICE_ICONS[s?.icon] ||
                                                FaBuilding;
                                            const features = safeArray(
                                                s?.features,
                                            ).filter(Boolean);
                                            return (
                                                <div
                                                    key={i}
                                                    className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_4px_24px_-12px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_32px_-14px_rgba(15,23,42,0.15)]"
                                                >
                                                    <div className="absolute inset-x-6 top-0 h-1 rounded-full bg-gradient-to-r from-sky-700 to-sky-400 opacity-80" />
                                                    <span className="mt-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-50 to-sky-100 text-sky-700 ring-1 ring-sky-200/60">
                                                        <Icon className="h-6 w-6" />
                                                    </span>
                                                    <h3 className="mt-4 text-base font-extrabold text-slate-900">
                                                        {s?.name || "Layanan"}
                                                    </h3>
                                                    {s?.description ? (
                                                        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                                                            {s.description}
                                                        </p>
                                                    ) : null}
                                                    {features.length ? (
                                                        <ul className="mt-4 space-y-2">
                                                            {features.map(
                                                                (f, fi) => (
                                                                    <li
                                                                        key={fi}
                                                                        className="flex items-start gap-2 text-sm text-slate-600"
                                                                    >
                                                                        <FaCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                                                                        <span>
                                                                            {f}
                                                                        </span>
                                                                    </li>
                                                                ),
                                                            )}
                                                        </ul>
                                                    ) : null}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            ) : null}

                            {/* Sejarah */}
                            {content.history.length ? (
                                <section
                                    id="sejarah"
                                    className="scroll-mt-36 mt-12 sm:mt-16"
                                >
                                    <SectionHeader
                                        eyebrow="Perjalanan"
                                        title="Sejarah & Perkembangan"
                                        subtitle="Tahapan penting dalam perjalanan organisasi hingga saat ini."
                                    />
                                    <div className="relative mx-auto max-w-2xl rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-[0_4px_24px_-12px_rgba(15,23,42,0.08)]">
                                        <div className="absolute inset-x-6 top-0 h-1 rounded-full bg-gradient-to-r from-violet-600 via-sky-500 to-cyan-400" />
                                        <div className="mt-2">
                                            {content.history.map((item, i) => (
                                                <TimelineItem
                                                    key={i}
                                                    item={item}
                                                    index={
                                                        i ===
                                                        content.history.length -
                                                            1
                                                            ? null
                                                            : i
                                                    }
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            ) : null}

                            {/* Portofolio */}
                            {content.portfolio.length ? (
                                <section
                                    id="portofolio"
                                    className="scroll-mt-36 mt-12 sm:mt-16"
                                >
                                    <SectionHeader
                                        eyebrow="Pencapaian & Proyek"
                                        title="Portofolio"
                                        subtitle="Proyek dan pencapaian yang telah kami selesaikan."
                                    />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                        {content.portfolio.map((p, i) => {
                                            const image = resolveImageUrl(
                                                p?.image,
                                            );
                                            return (
                                                <div
                                                    key={i}
                                                    className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_4px_24px_-12px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_32px_-14px_rgba(15,23,42,0.15)]"
                                                >
                                                    <div className="absolute inset-x-0 top-0 z-10 h-1 bg-gradient-to-r from-amber-500 via-sky-500 to-violet-500 opacity-80" />
                                                    {image ? (
                                                        <div className="relative">
                                                            <img
                                                                src={image}
                                                                alt={
                                                                    p?.title ||
                                                                    "Portofolio"
                                                                }
                                                                loading="lazy"
                                                                decoding="async"
                                                                className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                            />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                        </div>
                                                    ) : (
                                                        <div className="flex h-44 w-full items-center justify-center bg-gradient-to-br from-sky-50 via-sky-100 to-violet-50 text-sky-300">
                                                            <FaFolderOpen className="h-10 w-10" />
                                                        </div>
                                                    )}
                                                    <div className="p-5">
                                                        <div className="flex items-center gap-2">
                                                            {p?.category ? (
                                                                <span className="rounded-full bg-sky-50 ring-1 ring-sky-100 px-2.5 py-0.5 text-[11px] font-bold text-sky-700">
                                                                    {p.category}
                                                                </span>
                                                            ) : null}
                                                            {p?.year ? (
                                                                <span className="text-xs font-semibold text-slate-400">
                                                                    {p.year}
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                        <h3 className="mt-2.5 text-sm font-extrabold text-slate-900">
                                                            {p?.title ||
                                                                "Proyek"}
                                                        </h3>
                                                        {p?.description ? (
                                                            <p className="mt-2 text-xs text-slate-500 leading-relaxed line-clamp-3">
                                                                {p.description}
                                                            </p>
                                                        ) : null}
                                                        {p?.client ? (
                                                            <div className="mt-3 text-xs text-slate-500">
                                                                Klien:{" "}
                                                                <span className="font-bold text-slate-700">
                                                                    {p.client}
                                                                </span>
                                                            </div>
                                                        ) : null}
                                                        {p?.url ? (
                                                            <a
                                                                href={p.url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-sky-50 px-2.5 py-1 text-[11px] font-bold text-sky-700 ring-1 ring-sky-100 hover:bg-sky-100 transition-colors"
                                                            >
                                                                Lihat detail
                                                                <FaExternalLinkAlt className="h-3 w-3" />
                                                            </a>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            ) : null}

                            {/* Tim Pengelola */}
                            {content.teamMembers.length ? (
                                <section
                                    id="tim"
                                    className="scroll-mt-36 mt-12 sm:mt-16"
                                >
                                    <SectionHeader
                                        eyebrow="Tim Pengelola"
                                        title="Pimpinan & Anggota Tim"
                                        subtitle="Para pengelola yang menjalankan operasional dan layanan unit."
                                    />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                                        {content.teamMembers.map((m, i) => {
                                            const photo = resolveImageUrl(
                                                m?.photo,
                                            );
                                            return (
                                                <div
                                                    key={i}
                                                    className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_4px_24px_-12px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_32px_-14px_rgba(15,23,42,0.15)]"
                                                >
                                                    <div className="absolute inset-x-6 top-0 h-1 rounded-full bg-gradient-to-r from-amber-500 to-sky-500 opacity-80 z-10" />
                                                    {photo ? (
                                                        <div className="relative">
                                                            <img
                                                                src={photo}
                                                                alt={
                                                                    m?.name ||
                                                                    "Anggota tim"
                                                                }
                                                                loading="lazy"
                                                                decoding="async"
                                                                className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                            />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                        </div>
                                                    ) : (
                                                        <div className="flex h-48 w-full items-center justify-center bg-gradient-to-br from-sky-50 via-slate-50 to-amber-50 text-sky-300">
                                                            <FaUsers className="h-10 w-10" />
                                                        </div>
                                                    )}
                                                    <div className="p-5">
                                                        <div className="text-sm font-extrabold text-slate-900">
                                                            {m?.name || "—"}
                                                        </div>
                                                        <div className="mt-0.5 text-xs font-bold text-sky-700">
                                                            {m?.position || ""}
                                                        </div>
                                                        {m?.bio ? (
                                                            <p className="mt-2.5 text-xs text-slate-500 leading-relaxed line-clamp-3">
                                                                {m.bio}
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            ) : null}

                            {/* Statistik */}
                            {content.stats.length ? (
                                <section
                                    id="statistik"
                                    className="scroll-mt-36 mt-12 sm:mt-16"
                                >
                                    <SectionHeader
                                        eyebrow="Angka Kinerja"
                                        title="Statistik & Capaian"
                                        subtitle="Indikator kinerja utama yang mencerminkan capaian unit."
                                    />
                                    <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-[0_4px_24px_-12px_rgba(15,23,42,0.08)]">
                                        <div className="absolute inset-x-6 top-0 h-1 rounded-full bg-gradient-to-r from-amber-500 via-sky-500 to-emerald-500" />
                                        <div className="mt-2 grid grid-cols-2 lg:grid-cols-4 gap-5">
                                            {content.stats.map((s, i) => (
                                                <StatCard key={i} stat={s} />
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            ) : null}

                            {/* Galeri */}
                            {content.galleryItems.length ? (
                                <section
                                    id="galeri"
                                    className="scroll-mt-36 mt-12 sm:mt-16"
                                >
                                    <SectionHeader
                                        eyebrow="Dokumentasi"
                                        title="Galeri Kegiatan"
                                        subtitle="Dokumentasi kegiatan operasional dan momen penting unit."
                                    />
                                    <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-4 sm:p-6 shadow-[0_4px_24px_-12px_rgba(15,23,42,0.08)]">
                                        <div className="absolute inset-x-6 top-0 h-1 rounded-full bg-gradient-to-r from-rose-500 via-sky-500 to-violet-500 opacity-80" />
                                        <div className="mt-2">
                                            <Gallery
                                                items={content.galleryItems}
                                            />
                                        </div>
                                    </div>
                                </section>
                            ) : null}

                            {/* Dokumen Pendukung */}
                            {content.documents.length ? (
                                <section
                                    id="dokumen"
                                    className="scroll-mt-36 mt-12 sm:mt-16"
                                >
                                    <SectionHeader
                                        eyebrow="Referensi"
                                        title="Dokumen Pendukung"
                                        subtitle="Dokumen resmi yang dapat diunduh untuk referensi."
                                    />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                        {content.documents.map((d, i) => {
                                            const url = resolveImageUrl(
                                                d?.file ?? d?.url,
                                            );
                                            return (
                                                <a
                                                    key={i}
                                                    href={url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="group relative flex items-center gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_4px_24px_-12px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_32px_-14px_rgba(15,23,42,0.15)]"
                                                >
                                                    <div className="absolute inset-x-6 top-0 h-1 rounded-full bg-gradient-to-r from-sky-600 via-sky-400 to-cyan-400 opacity-80" />
                                                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-50 to-sky-100 text-sky-700 ring-1 ring-sky-200/60">
                                                        <FaFileAlt className="h-5 w-5" />
                                                    </span>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="truncate text-sm font-extrabold text-slate-900">
                                                            {d?.title ||
                                                                d?.name ||
                                                                "Dokumen"}
                                                        </div>
                                                        {d?.type ? (
                                                            <div className="mt-0.5 inline-block rounded-md bg-slate-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                                                                {d.type}
                                                            </div>
                                                        ) : null}
                                                        {d?.description ? (
                                                            <div className="mt-1 truncate text-xs text-slate-500">
                                                                {d.description}
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400 ring-1 ring-slate-100 transition-all group-hover:bg-sky-50 group-hover:text-sky-600 group-hover:ring-sky-200/60">
                                                        <FaDownload className="h-3.5 w-3.5" />
                                                    </span>
                                                </a>
                                            );
                                        })}
                                    </div>
                                </section>
                            ) : null}

                            {/* Testimoni */}
                            {content.testimonials.length ? (
                                <section
                                    id="testimoni"
                                    className="scroll-mt-36 mt-12 sm:mt-16"
                                >
                                    <SectionHeader
                                        eyebrow="Apa Kata Mereka"
                                        title="Testimoni & Ulasan"
                                        subtitle="Apresiasi dari mitra dan pemangku kepentingan."
                                    />
                                    <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-6 sm:p-8 shadow-[0_4px_24px_-12px_rgba(15,23,42,0.08)]">
                                        <div className="absolute inset-x-6 top-0 h-1 rounded-full bg-gradient-to-r from-violet-500 via-sky-500 to-cyan-400" />
                                        <div className="mt-2">
                                            <TestimonialCarousel
                                                items={content.testimonials}
                                            />
                                        </div>
                                    </div>
                                </section>
                            ) : null}

                            {/* Kontak */}
                            <section
                                id="kontak"
                                className="scroll-mt-36 mt-12 sm:mt-16"
                            >
                                <SectionHeader
                                    eyebrow="Hubungi Kami"
                                    title="Kontak & Lokasi"
                                    subtitle="Jangan ragu untuk menghubungi kami untuk informasi lebih lanjut."
                                />
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-[0_4px_24px_-12px_rgba(15,23,42,0.08)]">
                                        <div className="absolute inset-x-6 top-0 h-1 rounded-full bg-gradient-to-r from-sky-700 to-sky-400" />
                                        <h3 className="mt-2 text-lg font-extrabold text-slate-900">
                                            {content.companyName}
                                        </h3>
                                        <div className="mt-5 space-y-4">
                                            <InfoRow
                                                icon={FaMapMarkerAlt}
                                                label="Alamat"
                                                value={content.contact.address}
                                            />
                                            <InfoRow
                                                icon={FaPhoneAlt}
                                                label="Telepon"
                                                value={content.contact.phone}
                                                href={
                                                    content.contact.phone
                                                        ? `tel:${content.contact.phone.replace(/[^+\d]/g, "")}`
                                                        : ""
                                                }
                                            />
                                            <InfoRow
                                                icon={FaEnvelope}
                                                label="Email"
                                                value={content.contact.email}
                                                href={
                                                    content.contact.email
                                                        ? `mailto:${content.contact.email}`
                                                        : ""
                                                }
                                            />
                                            <InfoRow
                                                icon={FaGlobe}
                                                label="Website"
                                                value={content.contact.website}
                                                href={
                                                    content.contact.website?.startsWith(
                                                        "http",
                                                    )
                                                        ? content.contact
                                                              .website
                                                        : `https://${content.contact.website}`
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="relative overflow-hidden rounded-3xl border border-slate-100 shadow-[0_4px_24px_-12px_rgba(15,23,42,0.08)]">
                                        <div className="absolute inset-x-6 top-0 h-1 rounded-full bg-gradient-to-r from-emerald-500 via-sky-500 to-violet-500 opacity-80 z-10" />
                                        {content.hasMap ? (
                                            <iframe
                                                title="Peta lokasi perusahaan"
                                                src={content.mapEmbedUrl}
                                                className="h-full min-h-[280px] w-full border-0"
                                                loading="lazy"
                                                referrerPolicy="no-referrer-when-downgrade"
                                                allowFullScreen
                                            />
                                        ) : (
                                            <div className="flex h-full min-h-[280px] items-center justify-center bg-slate-50 text-slate-400">
                                                <div className="text-center">
                                                    <FaMapMarkerAlt className="mx-auto h-8 w-8" />
                                                    <p className="mt-2 text-sm">
                                                        Lokasi belum diatur
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>
                        </>
                    )}
                </div>
            </div>
        </HomeLayout>
    );
}
