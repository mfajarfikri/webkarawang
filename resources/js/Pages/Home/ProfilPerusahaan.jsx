import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Head, Link } from "@inertiajs/react";
import HomeLayout from "@/Layouts/HomeLayout";
import Modal from "@/Components/Modal";
import { Listbox, Transition } from "@headlessui/react";
import { motion } from "framer-motion";
import { edjsParser } from "@/utils/editorParser";
import {
    FaArrowRight,
    FaBolt,
    FaBullseye,
    FaBuilding,
    FaCalendarAlt,
    FaCheck,
    FaChevronDown,
    FaChevronLeft,
    FaChevronRight,
    FaEnvelope,
    FaGlobe,
    FaHandshake,
    FaHistory,
    FaIndustry,
    FaLeaf,
    FaLightbulb,
    FaMapMarkerAlt,
    FaPhoneAlt,
    FaQuoteLeft,
    FaShieldAlt,
    FaSitemap,
    FaStar,
    FaUsers,
} from "react-icons/fa";

function buildImageUrl(prompt, imageSize) {
    const encoded = encodeURIComponent(prompt);
    return `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encoded}&image_size=${imageSize}`;
}

function useInViewport(options) {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver((entries) => {
            const entry = entries[0];
            if (entry?.isIntersecting) setInView(true);
        }, options);
        io.observe(el);
        return () => io.disconnect();
    }, [options]);

    return { ref, inView };
}

function useActiveSection(sectionIds) {
    const [active, setActive] = useState(sectionIds[0] || "profil");

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

function classNames(...v) {
    return v.filter(Boolean).join(" ");
}

function asString(value, fallback = "") {
    if (typeof value === "string") return value;
    if (value === null || value === undefined) return fallback;
    return String(value);
}

function extractPlainTextFromHtml(html) {
    if (!html) return "";
    if (typeof window === "undefined") return "";
    try {
        const doc = new DOMParser().parseFromString(html, "text/html");
        return asString(doc?.body?.textContent || "")
            .replace(/\s+/g, " ")
            .trim();
    } catch {
        return "";
    }
}

function safeArray(v) {
    return Array.isArray(v) ? v : [];
}

function Section({ id, eyebrow, title, subtitle, children }) {
    return (
        <section id={id} className="scroll-mt-28">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="p-6 sm:p-8 border-b border-slate-100">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            {eyebrow ? (
                                <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                                    {eyebrow}
                                </div>
                            ) : null}
                            <h2 className="mt-1 text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                                {title}
                            </h2>
                            {subtitle ? (
                                <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-3xl">
                                    {subtitle}
                                </p>
                            ) : null}
                        </div>
                    </div>
                </div>
                <div className="p-6 sm:p-8">{children}</div>
            </div>
        </section>
    );
}

function IconBadge({ icon: Icon, tone = "blue" }) {
    const toneCls =
        tone === "yellow"
            ? "bg-amber-50 text-amber-700 border-amber-100"
            : tone === "green"
              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
              : "bg-sky-50 text-sky-700 border-sky-100";

    return (
        <div
            className={classNames(
                "h-10 w-10 rounded-2xl border flex items-center justify-center shadow-sm",
                toneCls,
            )}
        >
            <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
    );
}

function InfoCard({ icon, title, children }) {
    return (
        <motion.div
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
            <div className="flex items-start gap-3">
                <IconBadge icon={icon} />
                <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900">
                        {title}
                    </div>
                    <div className="mt-1 text-sm text-slate-600">
                        {children}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function Pill({ children }) {
    return (
        <span className="inline-flex items-center rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
            {children}
        </span>
    );
}

function InternalNav({ sections, activeId, onJump }) {
    return (
        <nav aria-label="Navigasi halaman" className="space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                Navigasi Seksi
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-3">
                <ul className="space-y-1">
                    {sections.map((s) => {
                        const isActive = s.id === activeId;
                        return (
                            <li key={s.id}>
                                <button
                                    type="button"
                                    onClick={() => onJump(s.id)}
                                    className={classNames(
                                        "w-full text-left rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-sky-50 text-sky-700"
                                            : "text-slate-700 hover:bg-slate-50",
                                    )}
                                >
                                    <span className="flex items-center justify-between gap-3">
                                        <span className="truncate">
                                            {s.label}
                                        </span>
                                        <span
                                            className={classNames(
                                                "h-2 w-2 rounded-full",
                                                isActive
                                                    ? "bg-sky-500"
                                                    : "bg-slate-200",
                                            )}
                                            aria-hidden="true"
                                        />
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </nav>
    );
}

function MobileNavSelect({ sections, activeId, onChange }) {
    const selected = sections.find((s) => s.id === activeId) || sections[0];
    return (
        <div className="lg:hidden">
            <Listbox value={selected} onChange={(v) => onChange(v.id)}>
                <div className="relative">
                    <Listbox.Button className="relative w-full cursor-pointer rounded-2xl bg-white py-3 pl-4 pr-10 text-left border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20">
                        <span className="block truncate text-sm font-semibold text-slate-900">
                            {selected.label}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                            <FaChevronDown
                                className="h-4 w-4 text-slate-400"
                                aria-hidden="true"
                            />
                        </span>
                    </Listbox.Button>
                    <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Listbox.Options className="absolute z-50 mt-2 max-h-72 w-full overflow-auto rounded-2xl bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                            {sections.map((s) => (
                                <Listbox.Option
                                    key={s.id}
                                    className={({ active }) =>
                                        classNames(
                                            "relative cursor-default select-none py-2.5 pl-10 pr-4",
                                            active
                                                ? "bg-sky-50 text-sky-700"
                                                : "text-slate-900",
                                        )
                                    }
                                    value={s}
                                >
                                    {({ selected: isSelected }) => (
                                        <>
                                            <span
                                                className={classNames(
                                                    "block truncate",
                                                    isSelected
                                                        ? "font-semibold"
                                                        : "font-normal",
                                                )}
                                            >
                                                {s.label}
                                            </span>
                                            {isSelected ? (
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sky-600">
                                                    <FaCheck
                                                        className="h-4 w-4"
                                                        aria-hidden="true"
                                                    />
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
        </div>
    );
}

function Gallery({ items }) {
    const safeItems = safeArray(items);
    const [open, setOpen] = useState(false);
    const [index, setIndex] = useState(0);
    const { ref, inView } = useInViewport({ rootMargin: "300px" });

    const current = safeItems[index];

    const openAt = (i) => {
        setIndex(i);
        setOpen(true);
    };

    const prev = () =>
        setIndex((i) => (i - 1 + safeItems.length) % safeItems.length);
    const next = () => setIndex((i) => (i + 1) % safeItems.length);

    return (
        <div ref={ref} className="space-y-4">
            {safeItems.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                    Belum ada foto galeri yang dipublikasikan.
                </div>
            ) : null}
            {!inView ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div
                            key={i}
                            className="aspect-[4/3] rounded-2xl bg-slate-100 border border-slate-200 animate-pulse"
                        />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {safeItems.map((it, i) => (
                        <button
                            key={it.url}
                            type="button"
                            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                            onClick={() => openAt(i)}
                            aria-label={`Buka foto: ${it.caption || it.alt}`}
                        >
                            <img
                                src={it.url}
                                alt={it.alt}
                                loading="lazy"
                                decoding="async"
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-3">
                                <div className="text-xs font-semibold text-white line-clamp-2">
                                    {it.caption || it.alt}
                                </div>
                                {it.credit ? (
                                    <div className="mt-0.5 text-[11px] text-white/80 line-clamp-1">
                                        {it.credit}
                                    </div>
                                ) : null}
                            </div>
                        </button>
                    ))}
                </div>
            )}

            <Modal show={open} onClose={() => setOpen(false)} maxWidth="5xl">
                {open && current ? (
                    <div className="bg-white rounded-2xl overflow-hidden">
                        <div className="flex items-center justify-between p-5 border-b border-slate-100">
                            <div className="min-w-0">
                                <div className="text-sm font-semibold text-slate-900 truncate">
                                    {current.caption || "Foto"}
                                </div>
                                {current.credit ? (
                                    <div className="text-xs text-slate-500 truncate">
                                        {current.credit}
                                    </div>
                                ) : null}
                            </div>
                            <button
                                type="button"
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                                onClick={() => setOpen(false)}
                            >
                                Tutup
                            </button>
                        </div>
                        <div className="relative bg-slate-900">
                            <img
                                src={current.url}
                                alt={current.alt}
                                decoding="async"
                                className="w-full max-h-[70vh] object-contain"
                            />
                            <div className="absolute inset-y-0 left-0 flex items-center p-3">
                                <button
                                    type="button"
                                    onClick={prev}
                                    className="h-10 w-10 rounded-2xl bg-white/90 hover:bg-white text-slate-800 shadow-sm flex items-center justify-center transition-colors"
                                    aria-label="Foto sebelumnya"
                                >
                                    <FaChevronLeft className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="absolute inset-y-0 right-0 flex items-center p-3">
                                <button
                                    type="button"
                                    onClick={next}
                                    className="h-10 w-10 rounded-2xl bg-white/90 hover:bg-white text-slate-800 shadow-sm flex items-center justify-center transition-colors"
                                    aria-label="Foto berikutnya"
                                >
                                    <FaChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ) : null}
            </Modal>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, unit, sourceLabel, sourceUrl }) {
    return (
        <motion.div
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {label}
                    </div>
                    <div className="mt-2 flex items-end gap-2">
                        <div className="text-2xl font-bold text-slate-900 tracking-tight">
                            {value}
                        </div>
                        {unit ? (
                            <div className="text-sm font-semibold text-slate-500">
                                {unit}
                            </div>
                        ) : null}
                    </div>
                </div>
                <IconBadge icon={Icon} tone="yellow" />
            </div>
            <div className="mt-4 text-xs text-slate-500">
                <span className="font-semibold">Sumber:</span>{" "}
                {sourceUrl ? (
                    <a
                        href={sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sky-700 hover:text-sky-900 underline underline-offset-4"
                    >
                        {sourceLabel || sourceUrl}
                    </a>
                ) : (
                    <span>{sourceLabel || "[SUMBER_BELUM_DITETAPKAN]"}</span>
                )}
            </div>
        </motion.div>
    );
}

function Timeline({ items }) {
    return (
        <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200" />
            <div className="space-y-6">
                {items.map((it, idx) => (
                    <motion.div
                        key={`${it.periodLabel}-${idx}`}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.35 }}
                        className="relative pl-12"
                    >
                        <div className="absolute left-1.5 top-2 h-5 w-5 rounded-full border-2 border-white bg-sky-500 shadow-sm" />
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        {it.periodLabel}
                                    </div>
                                    <div className="mt-1 text-base font-bold text-slate-900">
                                        {it.title}
                                    </div>
                                </div>
                                <IconBadge icon={FaHistory} />
                            </div>
                            <div className="mt-3 text-sm text-slate-600 leading-relaxed">
                                {it.description}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

function TestimonialCarousel({ items }) {
    const safeItems = safeArray(items);
    const [i, setI] = useState(0);

    useEffect(() => {
        setI(0);
    }, [safeItems.length]);

    const current = safeItems[i];
    const prev = () =>
        setI((v) => (v - 1 + safeItems.length) % safeItems.length);
    const next = () => setI((v) => (v + 1) % safeItems.length);

    if (safeItems.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                Belum ada testimoni yang dipublikasikan.
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-slate-100 flex items-center justify-between gap-4">
                <div>
                    <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                        Testimoni
                    </div>
                    <div className="mt-1 text-lg font-bold text-slate-900">
                        Suara Pelanggan & Mitra
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={prev}
                        className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                        aria-label="Testimoni sebelumnya"
                    >
                        <FaChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={next}
                        className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                        aria-label="Testimoni berikutnya"
                    >
                        <FaChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
            <div className="p-6 sm:p-8">
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                >
                    <div className="lg:col-span-7">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                            <FaQuoteLeft className="h-5 w-5 text-sky-600" />
                            <div className="mt-3 text-sm sm:text-base text-slate-700 leading-relaxed">
                                {current.quote}
                            </div>
                            <div className="mt-5 flex items-center gap-3">
                                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-500 text-white flex items-center justify-center font-bold">
                                    {current.name
                                        .split(" ")
                                        .slice(0, 2)
                                        .map((w) => w[0])
                                        .join("")}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-sm font-semibold text-slate-900 truncate">
                                        {current.name}
                                    </div>
                                    <div className="text-xs text-slate-500 truncate">
                                        {[current.role, current.organization]
                                            .filter(Boolean)
                                            .join(" • ")}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-5">
                        <div className="grid grid-cols-1 gap-3">
                            {items.map((t, idx) => {
                                const active = idx === i;
                                return (
                                    <button
                                        key={`${t.name}-${idx}`}
                                        type="button"
                                        onClick={() => setI(idx)}
                                        className={classNames(
                                            "text-left rounded-2xl border p-4 transition-colors",
                                            active
                                                ? "border-sky-200 bg-sky-50"
                                                : "border-slate-200 bg-white hover:bg-slate-50",
                                        )}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="text-sm font-semibold text-slate-900 truncate">
                                                    {t.name}
                                                </div>
                                                <div className="mt-0.5 text-xs text-slate-500 truncate">
                                                    {[t.role, t.organization]
                                                        .filter(Boolean)
                                                        .join(" • ")}
                                                </div>
                                            </div>
                                            <div
                                                className={classNames(
                                                    "h-2.5 w-2.5 rounded-full",
                                                    active
                                                        ? "bg-sky-500"
                                                        : "bg-slate-200",
                                                )}
                                                aria-hidden="true"
                                            />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default function ProfilPerusahaan({ publishedProfile = null }) {
    const content = useMemo(() => {
        const heroPrompt =
            "professional corporate hero photo, Indonesian electric power transmission facility, Karawang area, clean modern look, blue and yellow accents, cinematic daylight, ultra sharp, realistic";
        const galleryPromptBase =
            "professional documentary photo, PLN UPT Karawang operations, electric substation and maintenance, safety equipment, teamwork, clean modern style, blue and yellow accents, realistic";

        const base = {
            hero: {
                headline: "Profil Perusahaan",
                unitName: "PLN UPT Karawang",
                tagline: "",
                summary:
                    "PLN Unit Pelaksana Transmisi (UPT) Karawang berperan menjaga keandalan penyaluran tenaga listrik melalui pengelolaan aset transmisi dan koordinasi operasional lintas fungsi. Halaman ini merangkum profil unit, arah strategis, serta perjalanan pengembangan layanan secara ringkas dan mudah dipindai.",
                chips: [
                    "Area kerja: [AREA_LAYANAN_PLACEHOLDER]",
                    "Fokus: keandalan, keselamatan, dan layanan prima",
                ],
                logoUrl: "",
                image: {
                    url: buildImageUrl(heroPrompt, "landscape_16_9"),
                    alt: "Gambar hero fasilitas transmisi (ilustrasi)",
                    caption: "Dokumentasi operasional (ilustrasi).",
                    credit: "Sumber gambar: [KREDIT/SUMBER_PLACEHOLDER]",
                },
            },
            profile: {
                overviewText:
                    "PLN UPT Karawang adalah unit pelaksana yang mendukung keberlangsungan penyaluran energi listrik melalui pengelolaan aset dan kegiatan operasi-pemeliharaan yang terencana. Fokus utama unit mencakup peningkatan keandalan sistem, penerapan keselamatan kerja, serta kolaborasi dengan pemangku kepentingan untuk memastikan layanan kelistrikan berjalan stabil.",
                overviewHtml: "",
                location: {
                    office: "[ALAMAT_KANTOR_PLACEHOLDER]",
                    serviceArea: "[WILAYAH_LAYANAN_PLACEHOLDER]",
                },
                mapEmbedUrl: "",
                orgSummary: [
                    "Pimpinan Unit: [JABATAN/PERAN_PLACEHOLDER]",
                    "Bidang Operasi & Pemeliharaan: [RINGKASAN_PLACEHOLDER]",
                    "Bidang Keandalan & K3L: [RINGKASAN_PLACEHOLDER]",
                    "Dukungan Administrasi & Layanan: [RINGKASAN_PLACEHOLDER]",
                ],
                teamPhotoUrl: "",
                customers:
                    "Dukungan penyaluran energi listrik untuk pelanggan dan jaringan di wilayah Karawang dan sekitarnya: [DATA_PELANGGAN_PLACEHOLDER].",
                contacts: {
                    phone: "[TELEPON_PLACEHOLDER]",
                    email: "[EMAIL_PLACEHOLDER]",
                    website: "[WEBSITE_PLACEHOLDER]",
                    hours: "[JAM_OPERASIONAL_PLACEHOLDER]",
                },
                social: {
                    facebook: "",
                    instagram: "",
                    linkedin: "",
                    twitter: "",
                },
            },
            visionMission: {
                vision: "Menjadi unit transmisi yang andal, aman, dan berorientasi layanan untuk mendukung sistem kelistrikan yang berkelanjutan.",
                visionHtml: "",
                missions: [
                    {
                        icon: FaBolt,
                        title: "Keandalan Operasi",
                        text: "Menjaga kesiapan aset dan kesiapan operasi melalui perencanaan, pemeliharaan, dan evaluasi berbasis data.",
                    },
                    {
                        icon: FaShieldAlt,
                        title: "Keselamatan & Kepatuhan",
                        text: "Menerapkan budaya K3L, kepatuhan prosedur, dan penguatan mitigasi risiko secara konsisten.",
                    },
                    {
                        icon: FaIndustry,
                        title: "Peningkatan Kapabilitas",
                        text: "Mengembangkan kompetensi SDM dan standardisasi proses kerja untuk mendukung layanan yang unggul.",
                    },
                    {
                        icon: FaLightbulb,
                        title: "Inovasi Berkelanjutan",
                        text: "Mendorong perbaikan berkesinambungan melalui inovasi proses, digitalisasi, dan pembelajaran organisasi.",
                    },
                    {
                        icon: FaUsers,
                        title: "Kolaborasi Stakeholder",
                        text: "Menguatkan koordinasi internal dan eksternal untuk mempercepat respons operasional dan mutu layanan.",
                    },
                    {
                        icon: FaLeaf,
                        title: "Tanggung Jawab Lingkungan",
                        text: "Menerapkan praktik ramah lingkungan serta pengelolaan dampak operasional secara bertanggung jawab.",
                    },
                ],
                values: [
                    {
                        icon: FaHandshake,
                        title: "Integritas",
                        text: "Mengutamakan transparansi, etika, dan tanggung jawab dalam setiap keputusan.",
                    },
                    {
                        icon: FaStar,
                        title: "Keunggulan Layanan",
                        text: "Memberikan layanan yang cepat, tepat, dan konsisten untuk kebutuhan pemangku kepentingan.",
                    },
                    {
                        icon: FaBullseye,
                        title: "Fokus Hasil",
                        text: "Bekerja dengan target jelas, terukur, dan berorientasi perbaikan.",
                    },
                ],
            },
            history: {
                timelineItems: [
                    {
                        periodLabel: "[PERIODE_1: Tahun YYYY]",
                        title: "Pembentukan & Penataan Operasional",
                        description:
                            "Pada fase awal, unit membangun fondasi proses operasional, tata kelola aset, serta pola koordinasi kerja. Fokus utama adalah memastikan kesiapan layanan dan standar keselamatan kerja terbentuk dengan baik.",
                    },
                    {
                        periodLabel: "[PERIODE_2: Tahun YYYY–YYYY]",
                        title: "Penguatan Keandalan & Pemeliharaan",
                        description:
                            "Unit memperkuat program pemeliharaan dan monitoring untuk meningkatkan ketersediaan aset. Penyelarasan prosedur kerja dan peningkatan kompetensi menjadi landasan untuk layanan yang lebih stabil.",
                    },
                    {
                        periodLabel: "[PERIODE_3: Tahun YYYY–YYYY]",
                        title: "Modernisasi & Digitalisasi",
                        description:
                            "Penerapan digitalisasi proses dan perbaikan berkelanjutan mendorong visibilitas data yang lebih baik. Upaya ini membantu percepatan pengambilan keputusan dan respons terhadap kebutuhan operasional.",
                    },
                    {
                        periodLabel: "[PERIODE_4: Tahun YYYY–Sekarang]",
                        title: "Kolaborasi Layanan & Transformasi",
                        description:
                            "Unit menguatkan kolaborasi lintas fungsi dan pemangku kepentingan untuk meningkatkan mutu layanan. Fokus bergerak pada penguatan budaya K3L, pengelolaan risiko, serta transformasi proses yang adaptif.",
                    },
                ],
                milestones: [
                    {
                        icon: FaCalendarAlt,
                        title: "Milestone Infrastruktur",
                        text: "[DESKRIPSI_MILESTONE_INFRASTRUKTUR_PLACEHOLDER]",
                    },
                    {
                        icon: FaSitemap,
                        title: "Penguatan Proses",
                        text: "[DESKRIPSI_MILESTONE_PROSES_PLACEHOLDER]",
                    },
                    {
                        icon: FaShieldAlt,
                        title: "Pencapaian K3L",
                        text: "[DESKRIPSI_PENGHARGAAN_K3L_PLACEHOLDER]",
                    },
                ],
            },
            gallery: {
                items: [
                    {
                        url: buildImageUrl(
                            `${galleryPromptBase}, high-voltage substation overview`,
                            "landscape_4_3",
                        ),
                        alt: "Ilustrasi fasilitas gardu induk",
                        caption:
                            "Fasilitas dan infrastruktur transmisi (ilustrasi)",
                        credit: "[KREDIT_FOTO_1]",
                    },
                    {
                        url: buildImageUrl(
                            `${galleryPromptBase}, technician inspection with safety gear`,
                            "landscape_4_3",
                        ),
                        alt: "Ilustrasi inspeksi peralatan",
                        caption: "Inspeksi rutin dan pemeliharaan (ilustrasi)",
                        credit: "[KREDIT_FOTO_2]",
                    },
                    {
                        url: buildImageUrl(
                            `${galleryPromptBase}, control room monitoring screens`,
                            "landscape_4_3",
                        ),
                        alt: "Ilustrasi ruang monitoring",
                        caption: "Monitoring operasi dan keandalan (ilustrasi)",
                        credit: "[KREDIT_FOTO_3]",
                    },
                    {
                        url: buildImageUrl(
                            `${galleryPromptBase}, teamwork briefing meeting`,
                            "landscape_4_3",
                        ),
                        alt: "Ilustrasi briefing keselamatan",
                        caption: "Briefing K3L sebelum pekerjaan (ilustrasi)",
                        credit: "[KREDIT_FOTO_4]",
                    },
                    {
                        url: buildImageUrl(
                            `${galleryPromptBase}, maintenance tools and PPE, close-up`,
                            "landscape_4_3",
                        ),
                        alt: "Ilustrasi peralatan dan APD",
                        caption: "Peralatan kerja dan APD (ilustrasi)",
                        credit: "[KREDIT_FOTO_5]",
                    },
                    {
                        url: buildImageUrl(
                            `${galleryPromptBase}, aerial view power lines`,
                            "landscape_4_3",
                        ),
                        alt: "Ilustrasi jaringan transmisi",
                        caption:
                            "Jaringan transmisi dan koridor pemeliharaan (ilustrasi)",
                        credit: "[KREDIT_FOTO_6]",
                    },
                    {
                        url: buildImageUrl(
                            `${galleryPromptBase}, training session, classroom`,
                            "landscape_4_3",
                        ),
                        alt: "Ilustrasi pelatihan",
                        caption: "Pengembangan kompetensi SDM (ilustrasi)",
                        credit: "[KREDIT_FOTO_7]",
                    },
                    {
                        url: buildImageUrl(
                            `${galleryPromptBase}, community stakeholder discussion`,
                            "landscape_4_3",
                        ),
                        alt: "Ilustrasi kolaborasi stakeholder",
                        caption:
                            "Koordinasi dan kolaborasi layanan (ilustrasi)",
                        credit: "[KREDIT_FOTO_8]",
                    },
                ],
            },
            stats: {
                note: "Catatan: Angka pada statistik di bawah adalah placeholder. Ganti dengan data resmi beserta tautan sumber yang tervalidasi.",
                items: [
                    {
                        icon: FaBolt,
                        label: "Aset Transmisi Dipelihara",
                        value: "[N]",
                        unit: "[UNIT]",
                        sourceLabel: "[DOKUMEN_RESMI_PLN]",
                        sourceUrl: "",
                    },
                    {
                        icon: FaShieldAlt,
                        label: "Kepatuhan K3L",
                        value: "[X%]",
                        unit: "",
                        sourceLabel: "[LAPORAN_K3L]",
                        sourceUrl: "",
                    },
                    {
                        icon: FaUsers,
                        label: "Dukungan Pelanggan / Stakeholder",
                        value: "[N]",
                        unit: "[ENTITAS]",
                        sourceLabel: "[LAPORAN_LAYANAN]",
                        sourceUrl: "",
                    },
                    {
                        icon: FaLightbulb,
                        label: "Inisiatif Perbaikan",
                        value: "[N]",
                        unit: "program",
                        sourceLabel: "[CATATAN_TRANSFORMASI]",
                        sourceUrl: "",
                    },
                ],
            },
            testimonials: {
                items: [
                    {
                        quote: "Koordinasi tim responsif dan komunikatif. Proses tindak lanjut dibuat jelas sehingga kami memahami langkah yang dilakukan di lapangan.",
                        name: "[NAMA_TESTIMONI_1]",
                        organization: "[INSTANSI/MITRA_1]",
                        role: "[PERAN_1]",
                    },
                    {
                        quote: "Komitmen terhadap keselamatan kerja dan kualitas layanan sangat terlihat. Informasi yang diberikan juga mudah dipahami.",
                        name: "[NAMA_TESTIMONI_2]",
                        organization: "[INSTANSI/MITRA_2]",
                        role: "[PERAN_2]",
                    },
                    {
                        quote: "Kolaborasi berjalan baik dan solusi yang ditawarkan relevan dengan kebutuhan operasional. Semoga peningkatan layanan terus berlanjut.",
                        name: "[NAMA_TESTIMONI_3]",
                        organization: "[INSTANSI/MITRA_3]",
                        role: "[PERAN_3]",
                    },
                ],
            },
            relatedLinks: [
                {
                    label: "Berita",
                    href: "/berita",
                    icon: FaArrowRight,
                },
                {
                    label: "Galeri",
                    href: route("gallery"),
                    icon: FaArrowRight,
                },
                {
                    label: "Kontak",
                    href: "/kontak",
                    icon: FaArrowRight,
                },
            ],
        };

        if (!publishedProfile) return base;

        const merged = {
            ...base,
            hero: {
                ...base.hero,
                unitName: publishedProfile.company_name || base.hero.unitName,
                tagline: publishedProfile.tagline || base.hero.tagline,
                image: {
                    ...base.hero.image,
                    url: publishedProfile.cover?.url || base.hero.image.url,
                },
                logoUrl: publishedProfile.logo?.url || base.hero.logoUrl,
            },
            profile: {
                ...base.profile,
                location: {
                    ...base.profile.location,
                    office:
                        publishedProfile.address ||
                        base.profile.location.office,
                },
                contacts: {
                    ...base.profile.contacts,
                    phone:
                        publishedProfile.phone || base.profile.contacts.phone,
                    email:
                        publishedProfile.email || base.profile.contacts.email,
                    website:
                        publishedProfile.website ||
                        base.profile.contacts.website,
                },
                social: {
                    ...base.profile.social,
                    ...(publishedProfile.social || {}),
                },
            },
            history: base.history,
            relatedLinks: base.relatedLinks,
        };

        if (publishedProfile.about_editor) {
            try {
                merged.profile.overviewHtml = edjsParser(
                    publishedProfile.about_editor,
                );
                const heroText = extractPlainTextFromHtml(
                    merged.profile.overviewHtml,
                );
                if (heroText) {
                    merged.hero.summary =
                        heroText.length > 260
                            ? `${heroText.slice(0, 257)}...`
                            : heroText;
                }
            } catch {
                merged.profile.overviewHtml = "";
            }
        }

        if (publishedProfile.map?.lat && publishedProfile.map?.lng) {
            merged.profile.mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(
                `${publishedProfile.map.lat},${publishedProfile.map.lng}`,
            )}&output=embed`;
        }

        if (publishedProfile.vision_editor) {
            try {
                merged.visionMission.visionHtml = edjsParser(
                    publishedProfile.vision_editor,
                );
            } catch {
                merged.visionMission.visionHtml = "";
            }
        }
        // Fallback ke teks visi biasa dari database jika tersedia
        if (asString(publishedProfile.vision).trim()) {
            merged.visionMission.vision = asString(
                publishedProfile.vision,
            ).trim();
        }

        if (
            Array.isArray(publishedProfile.missions) &&
            publishedProfile.missions.length
        ) {
            const icons = [
                FaBolt,
                FaShieldAlt,
                FaIndustry,
                FaLightbulb,
                FaUsers,
                FaLeaf,
            ];
            merged.visionMission.missions = publishedProfile.missions.map(
                (text, idx) => ({
                    icon: icons[idx % icons.length],
                    title: `Misi ${idx + 1}`,
                    text,
                }),
            );
        }

        if (Array.isArray(publishedProfile.gallery?.items)) {
            const galleryItems = publishedProfile.gallery.items
                .map((it) => {
                    const url = it?.image?.url || it?.url || "";
                    if (!url) return null;
                    return {
                        url,
                        alt: it?.caption || "Galeri",
                        caption: it?.caption || "",
                        credit: it?.credit || "",
                    };
                })
                .filter(Boolean);

            if (galleryItems.length) {
                merged.gallery = {
                    items: galleryItems,
                };
            }
        }

        if (
            Array.isArray(publishedProfile.stats) &&
            publishedProfile.stats.length
        ) {
            merged.stats = {
                ...base.stats,
                items: publishedProfile.stats.map((s) => ({
                    icon: FaBolt,
                    label: s.label,
                    value: s.value,
                    unit: s.unit,
                    sourceLabel: s.sourceLabel,
                    sourceUrl: s.sourceUrl,
                })),
            };
        }

        if (
            Array.isArray(publishedProfile.testimonials) &&
            publishedProfile.testimonials.length
        ) {
            merged.testimonials = {
                items: publishedProfile.testimonials,
            };
        }

        if (publishedProfile.team?.photo?.url) {
            merged.profile.teamPhotoUrl = publishedProfile.team.photo.url;
        }

        if (
            Array.isArray(publishedProfile.team?.members) &&
            publishedProfile.team.members.length
        ) {
            merged.profile.orgSummary = publishedProfile.team.members
                .filter((m) => m?.name || m?.position)
                .slice(0, 6)
                .map((m) => {
                    const name = asString(m?.name).trim();
                    const position = asString(m?.position).trim();
                    if (name && position) return `${name} • ${position}`;
                    return name || position;
                });
        }

        return merged;
    }, [publishedProfile]);

    const sections = useMemo(
        () => [
            { id: "profil", label: "Profil" },
            { id: "visi-misi", label: "Visi & Misi" },
            { id: "sejarah", label: "Sejarah" },
            { id: "galeri", label: "Galeri" },
            { id: "statistik", label: "Statistik" },
            { id: "testimoni", label: "Testimoni" },
        ],
        [],
    );

    const { active, setActive } = useActiveSection(sections.map((s) => s.id));

    const jumpTo = (id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        setActive(id);
    };

    return (
        <HomeLayout>
            <Head>
                <title>Profil Perusahaan | PLN UPT Karawang</title>
                <meta
                    name="description"
                    content="Profil, visi & misi, sejarah, galeri, statistik, dan testimoni PLN UPT Karawang."
                />
            </Head>

            <div className="bg-gradient-to-b from-sky-50 via-white to-white">
                <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-12">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35 }}
                                className="rounded-3xl border border-sky-100 bg-white/70 backdrop-blur shadow-sm overflow-hidden"
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                                    <div className="lg:col-span-6 p-6 sm:p-10">
                                        <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                                            Tentang Kami
                                        </div>
                                        <h1 className="mt-2 text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                                            {content.hero.headline}
                                        </h1>
                                        <div className="mt-2 text-lg sm:text-xl font-bold text-sky-700">
                                            <span className="inline-flex items-center gap-3">
                                                {content.hero.logoUrl ? (
                                                    <img
                                                        src={
                                                            content.hero.logoUrl
                                                        }
                                                        alt="Logo"
                                                        loading="eager"
                                                        decoding="async"
                                                        className="h-9 w-9 rounded-xl border border-slate-200 bg-white object-contain"
                                                    />
                                                ) : null}
                                                <span>
                                                    {content.hero.unitName}
                                                </span>
                                            </span>
                                        </div>
                                        {content.hero.tagline ? (
                                            <div className="mt-1 text-sm font-semibold text-slate-600">
                                                {content.hero.tagline}
                                            </div>
                                        ) : null}
                                        <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
                                            {content.hero.summary}
                                        </p>
                                        <div className="mt-5 flex flex-wrap gap-2">
                                            {content.hero.chips.map((c) => (
                                                <Pill key={c}>{c}</Pill>
                                            ))}
                                        </div>
                                        <div className="mt-6 flex flex-wrap gap-2">
                                            {sections.slice(0, 3).map((s) => (
                                                <button
                                                    key={s.id}
                                                    type="button"
                                                    onClick={() => jumpTo(s.id)}
                                                    className="inline-flex items-center rounded-2xl bg-sky-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-800 transition-colors"
                                                >
                                                    {s.label}
                                                    <FaArrowRight className="ml-2 h-3.5 w-3.5" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="lg:col-span-6">
                                        <div className="relative h-full min-h-[240px] sm:min-h-[320px] lg:min-h-[420px]">
                                            <img
                                                src={content.hero.image.url}
                                                alt={content.hero.image.alt}
                                                loading="eager"
                                                decoding="async"
                                                className="absolute inset-0 h-full w-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/35 via-slate-900/10 to-transparent" />
                                            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                                                <div className="rounded-2xl bg-white/85 backdrop-blur border border-white/60 p-4 shadow-sm">
                                                    <div className="text-sm font-semibold text-slate-900">
                                                        {
                                                            content.hero.image
                                                                .caption
                                                        }
                                                    </div>
                                                    <div className="mt-1 text-xs text-slate-500">
                                                        {
                                                            content.hero.image
                                                                .credit
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        <div className="lg:col-span-4 order-2 lg:order-1">
                            <div className="sticky top-28 space-y-4">
                                <MobileNavSelect
                                    sections={sections}
                                    activeId={active}
                                    onChange={jumpTo}
                                />
                                <div className="hidden lg:block">
                                    <InternalNav
                                        sections={sections}
                                        activeId={active}
                                        onJump={jumpTo}
                                    />
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
                                    <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                                        Tautan Terkait
                                    </div>
                                    <div className="mt-3 space-y-2">
                                        {content.relatedLinks.map((l) => (
                                            <Link
                                                key={l.label}
                                                href={l.href}
                                                className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                                            >
                                                <span>{l.label}</span>
                                                <l.icon className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600" />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-8 order-1 lg:order-2 space-y-6">
                            <Section
                                id="profil"
                                eyebrow="Profil"
                                title="Profil Perusahaan"
                                subtitle="Ringkasan unit, area layanan, struktur organisasi, dan informasi kontak."
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                    <div className="lg:col-span-7">
                                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                                            <div className="flex items-start gap-3">
                                                <IconBadge icon={FaBuilding} />
                                                <div>
                                                    <div className="text-sm font-semibold text-slate-900">
                                                        Gambaran Umum
                                                    </div>
                                                    {content.profile
                                                        .overviewHtml ? (
                                                        <div
                                                            className="mt-3 prose prose-slate max-w-none"
                                                            dangerouslySetInnerHTML={{
                                                                __html: content
                                                                    .profile
                                                                    .overviewHtml,
                                                            }}
                                                        />
                                                    ) : (
                                                        <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                                                            {
                                                                content.profile
                                                                    .overviewText
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <InfoCard
                                                icon={FaMapMarkerAlt}
                                                title="Lokasi & Wilayah Layanan"
                                            >
                                                <div className="space-y-2">
                                                    <div>
                                                        <div className="text-xs font-semibold text-slate-500">
                                                            Kantor
                                                        </div>
                                                        <div className="text-sm text-slate-700">
                                                            {
                                                                content.profile
                                                                    .location
                                                                    .office
                                                            }
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-semibold text-slate-500">
                                                            Wilayah layanan
                                                        </div>
                                                        <div className="text-sm text-slate-700">
                                                            {
                                                                content.profile
                                                                    .location
                                                                    .serviceArea
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </InfoCard>
                                            <InfoCard
                                                icon={FaUsers}
                                                title="Pelanggan & Stakeholder"
                                            >
                                                {content.profile.customers}
                                            </InfoCard>
                                        </div>

                                        {content.profile.mapEmbedUrl ? (
                                            <div className="mt-4 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                                                <div className="px-5 py-4 border-b border-slate-100">
                                                    <div className="text-sm font-semibold text-slate-900">
                                                        Peta Lokasi
                                                    </div>
                                                    <div className="mt-1 text-xs text-slate-500">
                                                        Berdasarkan koordinat
                                                        yang diinput pada
                                                        dashboard.
                                                    </div>
                                                </div>
                                                <iframe
                                                    title="Peta lokasi"
                                                    src={
                                                        content.profile
                                                            .mapEmbedUrl
                                                    }
                                                    className="w-full h-64"
                                                    loading="lazy"
                                                    referrerPolicy="no-referrer-when-downgrade"
                                                />
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="lg:col-span-5 space-y-4">
                                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                            <div className="flex items-start gap-3">
                                                <IconBadge icon={FaSitemap} />
                                                <div className="min-w-0">
                                                    <div className="text-sm font-semibold text-slate-900">
                                                        Struktur Organisasi
                                                        Singkat
                                                    </div>
                                                    {content.profile
                                                        .teamPhotoUrl ? (
                                                        <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                                                            <img
                                                                src={
                                                                    content
                                                                        .profile
                                                                        .teamPhotoUrl
                                                                }
                                                                alt="Foto tim"
                                                                loading="lazy"
                                                                decoding="async"
                                                                className="h-40 w-full object-cover"
                                                            />
                                                        </div>
                                                    ) : null}
                                                    <ul className="mt-3 space-y-2 text-sm text-slate-700">
                                                        {content.profile.orgSummary.map(
                                                            (it) => (
                                                                <li
                                                                    key={it}
                                                                    className="flex gap-2"
                                                                >
                                                                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-400" />
                                                                    <span className="min-w-0">
                                                                        {it}
                                                                    </span>
                                                                </li>
                                                            ),
                                                        )}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                            <div className="flex items-start gap-3">
                                                <IconBadge icon={FaPhoneAlt} />
                                                <div className="min-w-0">
                                                    <div className="text-sm font-semibold text-slate-900">
                                                        Kontak Kantor
                                                    </div>
                                                    <div className="mt-3 space-y-2 text-sm text-slate-700">
                                                        <div className="flex items-center gap-2">
                                                            <FaPhoneAlt className="h-4 w-4 text-slate-400" />
                                                            <span>
                                                                {
                                                                    content
                                                                        .profile
                                                                        .contacts
                                                                        .phone
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <FaEnvelope className="h-4 w-4 text-slate-400" />
                                                            <span>
                                                                {
                                                                    content
                                                                        .profile
                                                                        .contacts
                                                                        .email
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <FaGlobe className="h-4 w-4 text-slate-400" />
                                                            {asString(
                                                                content.profile
                                                                    .contacts
                                                                    .website,
                                                            ).startsWith(
                                                                "http",
                                                            ) ? (
                                                                <a
                                                                    href={
                                                                        content
                                                                            .profile
                                                                            .contacts
                                                                            .website
                                                                    }
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="font-semibold text-sky-700 hover:text-sky-900 underline underline-offset-4"
                                                                >
                                                                    {
                                                                        content
                                                                            .profile
                                                                            .contacts
                                                                            .website
                                                                    }
                                                                </a>
                                                            ) : (
                                                                <span>
                                                                    {
                                                                        content
                                                                            .profile
                                                                            .contacts
                                                                            .website
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-slate-500">
                                                            Jam layanan:{" "}
                                                            {
                                                                content.profile
                                                                    .contacts
                                                                    .hours
                                                            }
                                                        </div>
                                                    </div>
                                                    <div className="mt-4">
                                                        <Link
                                                            href="/kontak"
                                                            className="inline-flex items-center rounded-xl bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800 transition-colors"
                                                        >
                                                            Hubungi Kami
                                                            <FaArrowRight className="ml-2 h-3.5 w-3.5" />
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Section>

                            <Section
                                id="visi-misi"
                                eyebrow="Arah Strategis"
                                title="Visi & Misi"
                                subtitle="Komitmen unit terhadap keandalan sistem, keselamatan, dan layanan yang berkelanjutan."
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                    <div className="lg:col-span-5">
                                        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-amber-50 p-6 shadow-sm">
                                            <div className="flex items-start gap-3">
                                                <IconBadge icon={FaBullseye} />
                                                <div>
                                                    <div className="text-sm font-semibold text-slate-900">
                                                        Visi
                                                    </div>
                                                    {content.visionMission
                                                        .visionHtml ? (
                                                        <div
                                                            className="mt-3 prose prose-slate max-w-none"
                                                            dangerouslySetInnerHTML={{
                                                                __html: content
                                                                    .visionMission
                                                                    .visionHtml,
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="mt-2 text-sm sm:text-base font-semibold text-slate-800 leading-relaxed">
                                                            {
                                                                content
                                                                    .visionMission
                                                                    .vision
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                            <div className="text-sm font-semibold text-slate-900">
                                                Nilai-Nilai
                                            </div>
                                            <div className="mt-4 grid grid-cols-1 gap-3">
                                                {content.visionMission.values.map(
                                                    (v) => (
                                                        <div
                                                            key={v.title}
                                                            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                <IconBadge
                                                                    icon={
                                                                        v.icon
                                                                    }
                                                                    tone="yellow"
                                                                />
                                                                <div>
                                                                    <div className="text-sm font-semibold text-slate-900">
                                                                        {
                                                                            v.title
                                                                        }
                                                                    </div>
                                                                    <div className="mt-1 text-sm text-slate-600">
                                                                        {v.text}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-7">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {content.visionMission.missions.map(
                                                (m) => (
                                                    <motion.div
                                                        key={m.title}
                                                        initial={{
                                                            opacity: 0,
                                                            y: 10,
                                                        }}
                                                        whileInView={{
                                                            opacity: 1,
                                                            y: 0,
                                                        }}
                                                        viewport={{
                                                            once: true,
                                                            margin: "-100px",
                                                        }}
                                                        transition={{
                                                            duration: 0.3,
                                                        }}
                                                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <IconBadge
                                                                icon={m.icon}
                                                            />
                                                            <div>
                                                                <div className="text-sm font-semibold text-slate-900">
                                                                    {m.title}
                                                                </div>
                                                                <div className="mt-1 text-sm text-slate-600 leading-relaxed">
                                                                    {m.text}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Section>

                            <Section
                                id="sejarah"
                                eyebrow="Perjalanan"
                                title="Sejarah Perusahaan"
                                subtitle="Garis waktu perkembangan, milestone, serta penguatan layanan dan infrastruktur (placeholder)."
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                    <div className="lg:col-span-7">
                                        <Timeline
                                            items={
                                                content.history.timelineItems
                                            }
                                        />
                                    </div>
                                    <div className="lg:col-span-5 space-y-4">
                                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                                            <div className="flex items-center gap-3">
                                                <IconBadge icon={FaHistory} />
                                                <div>
                                                    <div className="text-sm font-semibold text-slate-900">
                                                        Pencapaian & Milestone
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        Gunakan data resmi saat
                                                        mengisi.
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-4 space-y-3">
                                                {content.history.milestones.map(
                                                    (m) => (
                                                        <div
                                                            key={m.title}
                                                            className="rounded-2xl border border-slate-200 bg-white p-4"
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                <IconBadge
                                                                    icon={
                                                                        m.icon
                                                                    }
                                                                />
                                                                <div>
                                                                    <div className="text-sm font-semibold text-slate-900">
                                                                        {
                                                                            m.title
                                                                        }
                                                                    </div>
                                                                    <div className="mt-1 text-sm text-slate-600">
                                                                        {m.text}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Section>

                            <Section
                                id="galeri"
                                eyebrow="Dokumentasi"
                                title="Galeri"
                                subtitle="Foto fasilitas dan aktivitas operasional (ilustrasi). Klik untuk melihat lebih besar."
                            >
                                <Gallery items={content.gallery.items} />
                            </Section>

                            <Section
                                id="statistik"
                                eyebrow="Ringkasan"
                                title="Statistik & Pencapaian"
                                subtitle="Infografis ringkas untuk membantu pemindaian cepat."
                            >
                                <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                                    {content.stats.note}
                                </div>
                                {safeArray(content.stats.items).length ? (
                                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {content.stats.items.map((s) => (
                                            <StatCard
                                                key={s.label}
                                                icon={s.icon}
                                                label={s.label}
                                                value={s.value}
                                                unit={s.unit}
                                                sourceLabel={s.sourceLabel}
                                                sourceUrl={s.sourceUrl}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                                        Belum ada statistik yang dipublikasikan.
                                    </div>
                                )}
                            </Section>

                            <div id="testimoni" className="scroll-mt-28">
                                <TestimonialCarousel
                                    items={content.testimonials.items}
                                />
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                                <div className="p-6 sm:p-8 border-b border-slate-100">
                                    <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                                        Integrasi
                                    </div>
                                    <div className="mt-1 text-lg font-bold text-slate-900">
                                        Lanjutkan Eksplorasi
                                    </div>
                                    <div className="mt-2 text-sm text-slate-600">
                                        Akses halaman terkait untuk informasi
                                        layanan dan pembaruan terbaru.
                                    </div>
                                </div>
                                <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <Link
                                        href="/berita"
                                        className="rounded-2xl border border-slate-200 bg-white p-4 hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="text-sm font-semibold text-slate-900">
                                                    Berita
                                                </div>
                                                <div className="mt-1 text-sm text-slate-600">
                                                    Informasi dan pembaruan
                                                    terkini.
                                                </div>
                                            </div>
                                            <FaArrowRight className="h-4 w-4 text-slate-400" />
                                        </div>
                                    </Link>
                                    <Link
                                        href={route("gallery")}
                                        className="rounded-2xl border border-slate-200 bg-white p-4 hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="text-sm font-semibold text-slate-900">
                                                    Galeri
                                                </div>
                                                <div className="mt-1 text-sm text-slate-600">
                                                    Dokumentasi kegiatan dan
                                                    fasilitas.
                                                </div>
                                            </div>
                                            <FaArrowRight className="h-4 w-4 text-slate-400" />
                                        </div>
                                    </Link>
                                    <Link
                                        href="/kontak"
                                        className="rounded-2xl border border-slate-200 bg-white p-4 hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="text-sm font-semibold text-slate-900">
                                                    Kontak
                                                </div>
                                                <div className="mt-1 text-sm text-slate-600">
                                                    Hubungi untuk kolaborasi dan
                                                    layanan.
                                                </div>
                                            </div>
                                            <FaArrowRight className="h-4 w-4 text-slate-400" />
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </HomeLayout>
    );
}
