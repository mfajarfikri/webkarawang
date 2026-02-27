import React, { useState, useEffect, useRef } from "react";
import { Head, Link } from "@inertiajs/react";
import HomeLayout from "@/Layouts/HomeLayout";
import {
    ButtonLink,
    IconBadge,
    Section,
    classNames,
} from "@/Components/Home/HomeUi";
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
import { generateExcerpt } from "@/utils/editorParser";
import axios from "axios";
import { format } from "date-fns";
import { id } from "date-fns/locale";

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
    if (!fileName) return "/images/default-news.jpg";
    if (fileName.startsWith("http://") || fileName.startsWith("https://")) {
        return fileName;
    }
    return `${window.location.origin}/storage/berita/${fileName}`;
}

function StatCard({ icon, tone, title, value, unit, href }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900">
                        {title}
                    </div>
                    <div className="mt-3 flex items-end gap-2">
                        <div className="text-3xl font-extrabold tracking-tight text-slate-900">
                            {value}
                        </div>
                        {unit ? (
                            <div className="text-sm font-semibold text-slate-500">
                                {unit}
                            </div>
                        ) : null}
                    </div>
                </div>
                <IconBadge icon={icon} tone={tone} />
            </div>
            {href ? (
                <div className="mt-5">
                    <Link
                        href={href}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        Detail
                        <FaArrowRight className="h-3.5 w-3.5 text-slate-400" />
                    </Link>
                </div>
            ) : null}
        </div>
    );
}

function NewsCard({ news }) {
    const imageSrc = beritaImageUrl(news);
    return (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
            <div className="relative aspect-[16/9] bg-slate-100 overflow-hidden">
                <img
                    src={imageSrc}
                    alt={news?.judul || "Berita"}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                        e.currentTarget.src = "/images/default-news.jpg";
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
                <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                        {news?.tema?.nama || "Berita"}
                    </span>
                </div>
            </div>

            <div className="p-5">
                <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700">
                            <FaUsers className="h-3 w-3 text-slate-400" />
                            <span className="truncate">
                                {news?.user?.name || "Admin"}
                            </span>
                        </span>
                    </div>
                    {news?.created_at ? (
                        <div className="shrink-0">
                            {format(new Date(news.created_at), "dd MMM yyyy", {
                                locale: id,
                            })}
                        </div>
                    ) : null}
                </div>

                <h3 className="mt-3 text-base font-bold text-slate-900 tracking-tight line-clamp-2 group-hover:text-sky-700 transition-colors">
                    <Link href={route("berita.detail", news.slug)}>
                        {news?.judul}
                    </Link>
                </h3>
                <p className="mt-2 text-sm text-slate-600 line-clamp-3">
                    {news?.excerpt}
                </p>

                <div className="mt-4">
                    <Link
                        href={route("berita.detail", news.slug)}
                        className="inline-flex items-center gap-2 rounded-xl bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800 transition-colors"
                    >
                        Baca Selengkapnya
                        <FaArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function Home() {
    const carouselRef = useRef(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loading, setLoading] = useState(true);
    const [berita, setBerita] = useState([]);
    const [beritaTerbaru, setBeritaTerbaru] = useState([]);
    const [ktt, setKtt] = useState([]);
    const [garduInduk, setGarduInduk] = useState(0);
    const [isHovering, setIsHovering] = useState(false);
    const [animateStats, setAnimateStats] = useState(false);
    const [error, setError] = useState(null);
    const BeritaTerbaru = beritaTerbaru.slice(0, 3);

    useEffect(() => {
        axios
            .get(route("ktt.index"))
            .then((response) => {
                setKtt(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error Fetching Data Ktt", error);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        const fetchGardu = async () => {
            try {
                const response = await axios.get("/api/gardu");
                const list = Array.isArray(response.data?.gardu)
                    ? response.data.gardu
                    : [];
                setGarduInduk(list.length);
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchGardu();
    }, []);

    useEffect(() => {
        const fetchBerita = async () => {
            try {
                const response = await axios.get("/api/showberita");
                setBerita(response.data.berita || []);
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchBerita();
    }, []);

    useEffect(() => {
        const fetchBeritaTerbaru = async () => {
            try {
                const response = await axios.get("/api/berita");
                setBeritaTerbaru(response.data.berita || []);
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchBeritaTerbaru();
    }, []);
    const carouselItems =
        berita.length > 0
            ? berita.map((item) => ({
                  id: item.id,
                  image: beritaImageUrl(item),
                  title: item.judul,
                  description: item.content_json
                      ? generateExcerpt(item.content_json, 150)
                      : item.excerpt ||
                        (item.isi ? item.isi.substring(0, 150) + "..." : ""),
                  buttonText: "Baca Selengkapnya",
                  buttonLink: `/berita/${item.slug}`,
              }))
            : [];

    useEffect(() => {
        let interval;
        if (!isHovering && carouselItems.length > 0) {
            interval = setInterval(() => {
                setCurrentSlide(
                    (prevSlide) => (prevSlide + 1) % carouselItems.length,
                );
            }, 6000);
        }
        return () => clearInterval(interval);
    }, [carouselItems.length, isHovering]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setAnimateStats(true);
                }
            },
            { threshold: 0.3 },
        );

        const statsSection = document.querySelector(".stats-section");
        if (statsSection) {
            observer.observe(statsSection);
        }

        return () => {
            if (statsSection) {
                observer.unobserve(statsSection);
            }
        };
    }, []);

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    const goToNextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
    };

    const goToPrevSlide = () => {
        setCurrentSlide(
            (prev) => (prev - 1 + carouselItems.length) % carouselItems.length,
        );
    };

    return (
        <HomeLayout>
            <Head title="Beranda" />

            <div className="bg-white">
                <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-12 space-y-6">
                    <div
                        className="rounded-3xl border border-sky-100 bg-white/70 backdrop-blur shadow-sm overflow-hidden"
                        ref={carouselRef}
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => setIsHovering(false)}
                    >
                        <div className="relative min-h-[450px]">
                            <AnimatePresence initial={false} mode="wait">
                                {carouselItems.map(
                                    (item, index) =>
                                        index === currentSlide && (
                                            <motion.div
                                                key={item.id}
                                                className="absolute inset-0"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.45 }}
                                            >
                                                <img
                                                    src={item.image}
                                                    alt={item.title}
                                                    className="absolute inset-0 h-full w-full object-cover"
                                                    loading="eager"
                                                    decoding="async"
                                                    onError={(e) => {
                                                        e.currentTarget.src =
                                                            "/images/default-news.jpg";
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-slate-900/35 to-transparent" />

                                                <div className="relative z-10 h-full flex items-center">
                                                    <div className="container mx-auto px-6 sm:px-10">
                                                        <motion.div
                                                            className="max-w-2xl"
                                                            initial={{
                                                                opacity: 0,
                                                                y: 12,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                                y: 0,
                                                            }}
                                                            transition={{
                                                                duration: 0.35,
                                                                delay: 0.05,
                                                            }}
                                                        >
                                                            <div className="text-[11px] font-semibold uppercase tracking-widest text-white/70">
                                                                Berita Pilihan
                                                            </div>
                                                            <h1 className="mt-2 text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                                                                {item.title}
                                                            </h1>
                                                            <p className="mt-3 text-sm sm:text-base text-white/80 leading-relaxed max-w-xl line-clamp-3">
                                                                {
                                                                    item.description
                                                                }
                                                            </p>
                                                            <div className="mt-6 flex flex-wrap gap-3">
                                                                <ButtonLink
                                                                    as={Link}
                                                                    href={
                                                                        item.buttonLink
                                                                    }
                                                                    className="bg-sky-600 text-slate-900 hover:bg-sky-700/90"
                                                                >
                                                                    {
                                                                        item.buttonText
                                                                    }
                                                                    <FaArrowRight className="ml-2 h-3.5 w-3.5" />
                                                                </ButtonLink>
                                                                <Link
                                                                    href={route(
                                                                        "profil",
                                                                    )}
                                                                    className="inline-flex items-center justify-center rounded-2xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15 transition-colors"
                                                                >
                                                                    Profil
                                                                    Perusahaan
                                                                </Link>
                                                            </div>
                                                        </motion.div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ),
                                )}
                            </AnimatePresence>

                            <div className="absolute inset-y-0 left-0 z-20 flex items-center px-3">
                                <button
                                    type="button"
                                    onClick={goToPrevSlide}
                                    className="h-10 w-10 rounded-2xl border border-white/30 bg-white/10 text-white backdrop-blur hover:bg-white/15 transition-colors"
                                    aria-label="Slide sebelumnya"
                                >
                                    <FaChevronLeft className="mx-auto h-4 w-4" />
                                </button>
                            </div>
                            <div className="absolute inset-y-0 right-0 z-20 flex items-center px-3">
                                <button
                                    type="button"
                                    onClick={goToNextSlide}
                                    className="h-10 w-10 rounded-2xl border border-white/30 bg-white/10 text-white backdrop-blur hover:bg-white/15 transition-colors"
                                    aria-label="Slide berikutnya"
                                >
                                    <FaChevronRight className="mx-auto h-4 w-4" />
                                </button>
                            </div>

                            {carouselItems.length ? (
                                <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
                                    {carouselItems.map((_, index) => (
                                        <button
                                            type="button"
                                            key={index}
                                            onClick={() => goToSlide(index)}
                                            className={classNames(
                                                "h-2 rounded-full transition-all",
                                                index === currentSlide
                                                    ? "bg-white w-10"
                                                    : "bg-white/50 w-2 hover:bg-white/70",
                                            )}
                                            aria-label={`Ke slide ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <div className="stats-section">
                        <Section
                            id="asset"
                            eyebrow="Ringkasan"
                            title="Asset PLN UPT Karawang"
                            subtitle="Informasi ringkas terkait infrastruktur dan layanan."
                        >
                            {error ? (
                                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                                    Gagal memuat sebagian data. Silakan refresh.
                                </div>
                            ) : null}
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={
                                    animateStats
                                        ? { opacity: 1, y: 0 }
                                        : { opacity: 0, y: 12 }
                                }
                                transition={{ duration: 0.35 }}
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                            >
                                <StatCard
                                    icon={FaBolt}
                                    tone="sky"
                                    title="Gardu Induk"
                                    value={loading ? "—" : garduInduk}
                                    unit="Unit"
                                    href={route("gardu-induk")}
                                />
                                <StatCard
                                    icon={FaIndustry}
                                    tone="emerald"
                                    title="Trafo Tenaga"
                                    value="1240"
                                    unit="MVA"
                                    href="/asset/trafo-tenaga"
                                />
                                <StatCard
                                    icon={FaBuilding}
                                    tone="violet"
                                    title="Pelanggan KTT"
                                    value={loading ? "—" : ktt.length}
                                    unit="Pelanggan"
                                    href={route("ktt.index")}
                                />
                                <StatCard
                                    icon={FaUsers}
                                    tone="amber"
                                    title="SDM PLN UPT"
                                    value="128"
                                    unit="Pegawai"
                                    href="/asset/sdm"
                                />
                            </motion.div>
                        </Section>
                    </div>

                    <Section
                        id="berita"
                        eyebrow="Update"
                        title="Berita Terbaru"
                        subtitle="Informasi dan pembaruan terkini dari PLN UPT Karawang."
                        action={
                            <Link
                                href="/berita"
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                Lihat Semua
                                <FaArrowRight className="h-3.5 w-3.5 text-slate-400" />
                            </Link>
                        }
                    >
                        {loading && !BeritaTerbaru.length ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
                                    >
                                        <div className="aspect-[16/9] bg-slate-100 animate-pulse" />
                                        <div className="p-5 space-y-3">
                                            <div className="h-3 w-32 bg-slate-100 rounded animate-pulse" />
                                            <div className="h-4 w-5/6 bg-slate-100 rounded animate-pulse" />
                                            <div className="h-4 w-4/6 bg-slate-100 rounded animate-pulse" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : BeritaTerbaru.length ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {BeritaTerbaru.map((news) => (
                                    <NewsCard key={news.id} news={news} />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                                Belum ada berita untuk ditampilkan.
                            </div>
                        )}
                    </Section>
                </div>
            </div>
        </HomeLayout>
    );
}
