import React, { useState, useEffect } from "react";
import { Head, Link } from "@inertiajs/react";
import HomeLayout from "@/Layouts/HomeLayout";
import { Section, classNames } from "@/Components/Home/HomeUi";
import {
    FaArrowRight,
    FaUsers,
    FaBolt,
    FaIndustry,
    FaBuilding,
    FaChevronLeft,
    FaChevronRight,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const SLIDE_INTERVAL_MS = 6000;
const LATEST_NEWS_LIMIT = 3;
const FALLBACK_IMAGE = "/img/news-default.jpeg";

function parseGambarFirst(gambar) {
    if (!gambar) return "";
    if (Array.isArray(gambar) && gambar.length) return gambar[0];
    if (typeof gambar === "string") {
        try {
            const parsed = JSON.parse(gambar);
            if (Array.isArray(parsed) && parsed.length) return parsed[0];
            if (typeof parsed === "string") return parsed;
        } catch {
            return gambar;
        }
    }
    return "";
}

function beritaImageUrl(news) {
    const fileName = parseGambarFirst(news?.gambar);
    if (!fileName) return FALLBACK_IMAGE;
    if (fileName.startsWith("http://") || fileName.startsWith("https://")) {
        return fileName;
    }
    return `${window.location.origin}/storage/berita/${fileName}`;
}

function handleImageError(e) {
    e.currentTarget.src = FALLBACK_IMAGE;
}

function formatDate(value) {
    return value ? format(new Date(value), "dd MMM yyyy", { locale: id }) : "";
}

function FeaturedCarousel({ items }) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const count = items.length;
    const activeIndex = count ? currentSlide % count : 0;
    const active = items[activeIndex];

    useEffect(() => {
        if (isPaused || count < 2) return undefined;
        const interval = setInterval(
            () => setCurrentSlide((prev) => (prev + 1) % count),
            SLIDE_INTERVAL_MS,
        );
        return () => clearInterval(interval);
    }, [count, isPaused]);

    const goTo = (offset) =>
        setCurrentSlide((prev) => (prev + offset + count) % count);

    if (!active) {
        return (
            <div className="flex aspect-[4/3] items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-sm text-slate-400">
                Belum ada berita pilihan.
            </div>
        );
    }

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocus={() => setIsPaused(true)}
            onBlur={() => setIsPaused(false)}
        >
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 bg-ink-800 shadow-lift">
                <AnimatePresence initial={false} mode="wait">
                    <motion.div
                        key={active.id}
                        className="absolute inset-0"
                        initial={{ opacity: 0, scale: 1.03 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <img
                            src={beritaImageUrl(active)}
                            alt={active.judul}
                            className="h-full w-full object-cover"
                            loading="eager"
                            decoding="async"
                            onError={handleImageError}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
                            <span className="inline-flex items-center gap-2 rounded-full bg-volt px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-ink-950">
                                Berita pilihan
                            </span>
                            <h2 className="mt-3 line-clamp-2 text-xl font-bold text-white sm:text-2xl">
                                <Link
                                    href={`/berita/${active.slug}`}
                                    className="after:absolute after:inset-0"
                                >
                                    {active.judul}
                                </Link>
                            </h2>
                            {active.excerpt ? (
                                <p className="mt-2 line-clamp-2 text-sm text-slate-300">
                                    {active.excerpt}
                                </p>
                            ) : null}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {count > 1 && (
                <div className="mt-4 flex items-center justify-between">
                    <div className="flex gap-1.5">
                        {items.map((item, index) => (
                            <button
                                type="button"
                                key={item.id}
                                onClick={() => setCurrentSlide(index)}
                                aria-label={`Ke berita ${index + 1}`}
                                aria-current={index === activeIndex}
                                className={classNames(
                                    "h-1.5 rounded-full transition-all duration-300",
                                    index === activeIndex
                                        ? "w-8 bg-brand-400"
                                        : "w-1.5 bg-white/25 hover:bg-white/50",
                                )}
                            />
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => goTo(-1)}
                            aria-label="Berita sebelumnya"
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white transition hover:bg-white/10"
                        >
                            <FaChevronLeft className="h-3 w-3" />
                        </button>
                        <button
                            type="button"
                            onClick={() => goTo(1)}
                            aria-label="Berita berikutnya"
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white transition hover:bg-white/10"
                        >
                            <FaChevronRight className="h-3 w-3" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ icon: Icon, title, value, unit, href, isLoading }) {
    return (
        <Link
            href={href}
            className="group relative flex flex-col justify-between gap-8 bg-white p-6 transition-colors duration-200 hover:bg-brand-50/60 sm:p-7"
        >
            <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-900 text-volt">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <FaArrowRight className="h-3.5 w-3.5 -translate-x-1 text-slate-300 transition duration-200 group-hover:translate-x-0 group-hover:text-brand-600" />
            </div>
            <div>
                <div className="flex items-baseline gap-2">
                    {isLoading ? (
                        <span className="h-10 w-20 animate-pulse rounded-lg bg-slate-100" />
                    ) : (
                        <span className="font-display text-4xl font-extrabold tracking-tight text-ink-900 tabular-nums sm:text-5xl">
                            {value}
                        </span>
                    )}
                    <span className="text-sm font-semibold text-slate-500">
                        {unit}
                    </span>
                </div>
                <div className="mt-2 text-sm font-medium text-slate-600">
                    {title}
                </div>
            </div>
        </Link>
    );
}

function NewsMeta({ news }) {
    return (
        <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-brand-700">
                {news?.tema?.nama || "Berita"}
            </span>
            <span aria-hidden="true">·</span>
            <span>{formatDate(news?.created_at)}</span>
        </div>
    );
}

function NewsCard({ news, isFeatured = false, isWide = false }) {
    return (
        <article
            className={classNames(
                "group relative flex overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-soft transition duration-300 hover:-translate-y-0.5 hover:shadow-lift",
                isWide
                    ? "flex-col lg:flex-row"
                    : isFeatured
                      ? "flex-col"
                      : "flex-col sm:flex-row",
            )}
        >
            <div
                className={classNames(
                    "relative shrink-0 overflow-hidden bg-slate-100",
                    isWide
                        ? "aspect-[16/10] lg:aspect-auto lg:min-h-[22rem] lg:w-1/2"
                        : isFeatured
                          ? "aspect-[16/10]"
                          : "aspect-[16/10] sm:aspect-auto sm:w-2/5",
                )}
            >
                <img
                    src={beritaImageUrl(news)}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                    onError={handleImageError}
                />
            </div>
            <div
                className={classNames(
                    "flex flex-1 flex-col p-5 sm:p-6",
                    isWide ? "lg:justify-center lg:p-10" : "",
                )}
            >
                <NewsMeta news={news} />
                <h3
                    className={classNames(
                        "mt-2 font-bold text-ink-900 transition-colors group-hover:text-brand-700",
                        isFeatured
                            ? "line-clamp-3 text-xl sm:text-2xl"
                            : "line-clamp-2 text-base",
                    )}
                >
                    <Link
                        href={route("berita.detail", news.slug)}
                        className="after:absolute after:inset-0"
                    >
                        {news?.judul}
                    </Link>
                </h3>
                <p
                    className={classNames(
                        "mt-2 text-sm leading-relaxed text-slate-600",
                        isFeatured ? "line-clamp-3" : "line-clamp-2",
                    )}
                >
                    {news?.excerpt}
                </p>
                <div
                    className={classNames(
                        "flex items-center justify-between pt-5 text-xs text-slate-500",
                        isWide ? "" : "mt-auto",
                    )}
                >
                    <span className="truncate">
                        Oleh {news?.user?.name || "Admin"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-semibold text-ink-900">
                        Baca
                        <FaArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                </div>
            </div>
        </article>
    );
}

function NewsSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:grid-rows-2">
            {Array.from({ length: LATEST_NEWS_LIMIT }).map((_, i) => (
                <div
                    key={i}
                    className={classNames(
                        "overflow-hidden rounded-2xl border border-slate-200/80 bg-white",
                        i === 0 ? "lg:row-span-2" : "",
                    )}
                >
                    <div className="aspect-[16/10] animate-pulse bg-slate-100" />
                    <div className="space-y-3 p-6">
                        <div className="h-3 w-32 animate-pulse rounded bg-slate-100" />
                        <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function Home() {
    const [featured, setFeatured] = useState([]);
    const [latest, setLatest] = useState([]);
    const [stats, setStats] = useState(null);
    const [isNewsLoading, setIsNewsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        let isActive = true;

        axios
            .get("/api/stats")
            .then((res) => isActive && setStats(res.data))
            .catch(() => isActive && setHasError(true));

        axios
            .get("/api/showberita")
            .then((res) => isActive && setFeatured(res.data.berita || []))
            .catch(() => isActive && setHasError(true));

        axios
            .get("/api/berita")
            .then((res) => isActive && setLatest(res.data.berita || []))
            .catch(() => isActive && setHasError(true))
            .finally(() => isActive && setIsNewsLoading(false));

        return () => {
            isActive = false;
        };
    }, []);

    const latestNews = latest.slice(0, LATEST_NEWS_LIMIT);
    const hasFullNewsGrid = latestNews.length >= LATEST_NEWS_LIMIT;
    const isStatsLoading = stats === null && !hasError;

    const statItems = [
        {
            icon: FaBolt,
            title: "Gardu Induk dikelola",
            value: stats?.gardu_induk ?? "—",
            unit: "Unit",
            href: route("gardu-induk"),
        },
        {
            icon: FaIndustry,
            title: "Kapasitas Trafo Tenaga",
            value: stats?.trafo_tenaga ?? "—",
            unit: "MVA",
            href: "/asset/trafo-tenaga",
        },
        {
            icon: FaBuilding,
            title: "Konsumen Tegangan Tinggi",
            value: stats?.ktt ?? "—",
            unit: "Pelanggan",
            href: route("ktt.index"),
        },
        {
            icon: FaUsers,
            title: "SDM PLN UPT Karawang",
            value: stats?.sdm ?? "—",
            unit: "Pegawai",
            href: "/asset/sdm",
        },
    ];

    return (
        <HomeLayout>
            <Head title="Beranda" />

            {/* Hero */}
            <section className="bg-grid-ink">
                <div className="container mx-auto grid grid-cols-1 items-center gap-12 px-4 pb-32 pt-14 sm:px-6 sm:pt-20 lg:grid-cols-12 lg:gap-10 lg:pb-40">
                    <motion.div
                        className="lg:col-span-6"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                            </span>
                            Unit Pelaksana Transmisi Karawang
                        </span>
                        <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] text-white sm:text-5xl lg:text-6xl">
                            Menjaga listrik tetap{" "}
                            <span className="text-volt">andal</span>, setiap
                            saat.
                        </h1>
                        <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
                            Portal informasi PLN UPT Karawang: aset transmisi,
                            gardu induk, pelanggan tegangan tinggi, dan kabar
                            terbaru dari lapangan — dalam satu tempat.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                href={route("gardu-induk")}
                                className="btn bg-white text-ink-900 hover:bg-volt"
                            >
                                Jelajahi Gardu Induk
                                <FaArrowRight className="h-3 w-3" />
                            </Link>
                            <a
                                href="#berita"
                                className="btn border border-white/20 text-white hover:bg-white/10"
                            >
                                Berita terbaru
                            </a>
                        </div>
                    </motion.div>

                    <motion.div
                        className="lg:col-span-6"
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <FeaturedCarousel items={featured} />
                    </motion.div>
                </div>
            </section>

            {/* Statistik: menumpang di atas batas hero */}
            <section
                id="asset"
                aria-label="Ringkasan aset"
                className="container relative z-10 mx-auto -mt-20 scroll-mt-28 px-4 sm:px-6 lg:-mt-24"
            >
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.45 }}
                    className="grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-200/80 shadow-lift sm:grid-cols-2 lg:grid-cols-4"
                >
                    {statItems.map((item) => (
                        <StatCard
                            key={item.title}
                            {...item}
                            isLoading={isStatsLoading}
                        />
                    ))}
                </motion.div>
                {hasError ? (
                    <p
                        role="alert"
                        className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
                    >
                        Sebagian data gagal dimuat. Silakan muat ulang halaman.
                    </p>
                ) : null}
            </section>

            {/* Berita */}
            <div className="container mx-auto px-4 py-16 sm:px-6 sm:py-24">
                <Section
                    id="berita"
                    variant="plain"
                    eyebrow="Kabar terbaru"
                    title="Berita dari PLN UPT Karawang"
                    subtitle="Informasi dan pembaruan terkini seputar kegiatan operasi, pemeliharaan, dan lingkungan kerja."
                    action={
                        <Link href="/berita" className="btn-ghost">
                            Lihat semua
                            <FaArrowRight className="h-3 w-3 text-slate-400" />
                        </Link>
                    }
                >
                    {isNewsLoading ? (
                        <NewsSkeleton />
                    ) : latestNews.length ? (
                        <div
                            className={classNames(
                                "grid grid-cols-1 gap-5",
                                latestNews.length > 1 ? "lg:grid-cols-2" : "",
                                hasFullNewsGrid
                                    ? "lg:grid-rows-2 lg:[&>*:first-child]:row-span-2"
                                    : "",
                            )}
                        >
                            {latestNews.map((news, index) => (
                                <NewsCard
                                    key={news.id}
                                    news={news}
                                    isFeatured={
                                        index === 0 || !hasFullNewsGrid
                                    }
                                    isWide={latestNews.length === 1}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-600">
                            Belum ada berita untuk ditampilkan.
                        </div>
                    )}
                </Section>
            </div>
        </HomeLayout>
    );
}
