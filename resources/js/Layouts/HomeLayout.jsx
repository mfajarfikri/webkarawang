import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link, usePage, router } from "@inertiajs/react";
import {
    FaPhoneAlt,
    FaEnvelope,
    FaFacebookF,
    FaTwitter,
    FaInstagram,
    FaYoutube,
    FaBars,
    FaTimes,
    FaChevronDown,
    FaMapMarkerAlt,
    FaSignOutAlt,
    FaUserShield,
    FaArrowRight,
    FaThLarge,
    FaCog,
} from "react-icons/fa";
import BrandMark from "@/Components/BrandMark";
import LogoutModal from "@/Components/LogoutModal";
import { SnackbarProvider, useSnackbar } from "notistack";

const SYNC_INTERVAL_MS = 60000;
const SCROLL_THRESHOLD_PX = 12;
const FOOTER_NEWS_LIMIT = 3;

const SOCIAL_LINKS = [
    { label: "Facebook", icon: FaFacebookF, href: "#" },
    { label: "Twitter", icon: FaTwitter, href: "#" },
    {
        label: "Instagram",
        icon: FaInstagram,
        href: "https://www.instagram.com/plnuptkarawang",
    },
    { label: "YouTube", icon: FaYoutube, href: "#" },
];

function isExternalUrl(url) {
    if (!url) return false;
    const trimmed = url.trim();
    return (
        trimmed.startsWith("http://") ||
        trimmed.startsWith("https://") ||
        trimmed.startsWith("//")
    );
}

function hasSubmenus(menu) {
    return Array.isArray(menu.submenus) && menu.submenus.length > 0;
}

function MenuLink({ menu, className, children, onClick }) {
    const url = menu.url ? menu.url.trim() : "";

    if (isExternalUrl(url)) {
        return (
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
                onClick={onClick}
            >
                {children}
            </a>
        );
    }
    return (
        <Link href={url} className={className} onClick={onClick}>
            {children}
        </Link>
    );
}

function UserAvatar({ user, size = "h-8 w-8" }) {
    if (user.foto_profil) {
        return (
            <img
                src={`/storage/${user.foto_profil}`}
                alt=""
                className={`${size} rounded-full object-cover`}
            />
        );
    }
    return (
        <span
            className={`${size} flex items-center justify-center rounded-full bg-brand-50 text-brand-700`}
        >
            <FaUserShield className="h-4 w-4" aria-hidden="true" />
        </span>
    );
}

function DesktopNav({ menus }) {
    return (
        <nav
            aria-label="Navigasi utama"
            className="hidden items-center gap-0.5 lg:flex"
        >
            {menus.map((menu, index) => (
                <div key={menu.id ?? index} className="group relative">
                    <MenuLink
                        menu={menu}
                        className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-ink-900"
                    >
                        {menu.title}
                        {hasSubmenus(menu) && (
                            <FaChevronDown className="h-2.5 w-2.5 text-slate-400 transition-transform duration-200 group-hover:rotate-180" />
                        )}
                    </MenuLink>

                    {hasSubmenus(menu) && (
                        <div className="invisible absolute left-0 top-full z-50 w-64 translate-y-1 pt-2 opacity-0 transition duration-200 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                            <div className="rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-lift">
                                {menu.submenus.map((submenu, subIndex) => (
                                    <MenuLink
                                        key={submenu.id ?? subIndex}
                                        menu={submenu}
                                        className="group/item flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-brand-50 hover:text-brand-800"
                                    >
                                        {submenu.title}
                                        <FaArrowRight className="h-3 w-3 -translate-x-1 text-brand-600 opacity-0 transition group-hover/item:translate-x-0 group-hover/item:opacity-100" />
                                    </MenuLink>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </nav>
    );
}

function ProfileMenu({ user, isOpen, onToggle, onLogout }) {
    return (
        <div className="relative">
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={isOpen}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
                <UserAvatar user={user} />
                <span className="hidden max-w-[9rem] truncate sm:block">
                    {user.name}
                </span>
                <FaChevronDown
                    className={`h-2.5 w-2.5 text-slate-400 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                    }`}
                />
            </button>
            <div
                className={`absolute right-0 top-full z-50 mt-2 w-64 origin-top-right rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-lift transition-[opacity,transform,visibility] duration-200 ${
                    isOpen
                        ? "scale-100 opacity-100"
                        : "pointer-events-none invisible scale-95 opacity-0"
                }`}
            >
                <div className="px-3 py-2.5">
                    <div className="truncate text-sm font-semibold text-ink-900">
                        {user.name}
                    </div>
                    <div className="truncate text-xs text-slate-500">
                        {user.email}
                    </div>
                </div>
                <div className="my-1 h-px bg-slate-100" />
                <Link
                    href={route("dashboard.index")}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
                >
                    <FaThLarge className="h-3.5 w-3.5 text-slate-400" />
                    Dashboard
                </Link>
                <Link
                    href={route("dashboard.profile.edit")}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
                >
                    <FaCog className="h-3.5 w-3.5 text-slate-400" />
                    Pengaturan profil
                </Link>
                <button
                    type="button"
                    onClick={onLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
                >
                    <FaSignOutAlt className="h-3.5 w-3.5" />
                    Keluar
                </button>
            </div>
        </div>
    );
}

function MobileDrawer({ isOpen, onClose, menus, isGuest }) {
    const [openIndex, setOpenIndex] = useState(null);

    return (
        <div
            className={`fixed inset-0 z-[70] bg-ink-950/60 backdrop-blur-sm transition-[opacity,visibility] duration-300 lg:hidden ${
                isOpen
                    ? "opacity-100"
                    : "pointer-events-none invisible opacity-0"
            }`}
            onClick={onClose}
        >
            <div
                className={`absolute right-0 top-0 flex h-full w-[85%] max-w-sm flex-col bg-white shadow-lift transition-transform duration-300 ease-out ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <BrandMark />
                    <button
                        type="button"
                        aria-label="Tutup menu"
                        className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
                        onClick={onClose}
                    >
                        <FaTimes className="h-4 w-4" />
                    </button>
                </div>
                <nav
                    aria-label="Navigasi mobile"
                    className="flex-1 space-y-1 overflow-y-auto px-3 py-4"
                >
                    {menus.map((menu, index) =>
                        hasSubmenus(menu) ? (
                            <div key={menu.id ?? index}>
                                <button
                                    type="button"
                                    aria-expanded={openIndex === index}
                                    className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-[15px] font-semibold text-ink-900 transition hover:bg-slate-100"
                                    onClick={() =>
                                        setOpenIndex(
                                            openIndex === index ? null : index,
                                        )
                                    }
                                >
                                    {menu.title}
                                    <FaChevronDown
                                        className={`h-3 w-3 text-slate-400 transition-transform duration-200 ${
                                            openIndex === index
                                                ? "rotate-180"
                                                : ""
                                        }`}
                                    />
                                </button>
                                {openIndex === index && (
                                    <div className="ml-3 space-y-0.5 border-l border-slate-200 pl-3">
                                        {menu.submenus.map(
                                            (submenu, subIndex) => (
                                                <MenuLink
                                                    key={submenu.id ?? subIndex}
                                                    menu={submenu}
                                                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-brand-50 hover:text-brand-800"
                                                    onClick={onClose}
                                                >
                                                    {submenu.title}
                                                </MenuLink>
                                            ),
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <MenuLink
                                key={menu.id ?? index}
                                menu={menu}
                                className="block rounded-xl px-3 py-3 text-[15px] font-semibold text-ink-900 transition hover:bg-slate-100"
                                onClick={onClose}
                            >
                                {menu.title}
                            </MenuLink>
                        ),
                    )}
                </nav>
                {isGuest && (
                    <div className="border-t border-slate-100 p-4">
                        <Link
                            href={route("login")}
                            className="btn-primary w-full"
                            onClick={onClose}
                        >
                            Masuk ke dashboard
                            <FaArrowRight className="h-3 w-3" />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

function SiteFooter({ menus, news }) {
    return (
        <footer className="bg-grid-ink text-slate-300">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
                    <div className="lg:col-span-4">
                        <BrandMark tone="dark" />
                        <p className="mt-5 max-w-xs text-sm leading-relaxed text-slate-400">
                            Menjadi Perusahaan Global Top 500 dan #1 Pilihan
                            Pelanggan untuk Solusi Energi.
                        </p>
                        <div className="mt-6 flex gap-2">
                            {SOCIAL_LINKS.map(({ label, icon: Icon, href }) => (
                                <a
                                    key={label}
                                    href={href}
                                    aria-label={label}
                                    {...(isExternalUrl(href)
                                        ? {
                                              target: "_blank",
                                              rel: "noopener noreferrer",
                                          }
                                        : {})}
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:border-brand-400 hover:bg-brand-500 hover:text-white"
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-white">
                            Jelajahi
                        </h3>
                        <ul className="mt-4 space-y-2.5 text-sm">
                            {menus.map((menu, index) => (
                                <li key={menu.id ?? index}>
                                    <MenuLink
                                        menu={menu}
                                        className="text-slate-400 transition-colors hover:text-white"
                                    >
                                        {menu.title}
                                    </MenuLink>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="lg:col-span-3">
                        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-white">
                            Berita terbaru
                        </h3>
                        <ul className="mt-4 space-y-3 text-sm">
                            {news.map((item, index) => (
                                <li key={item.id ?? index}>
                                    <Link
                                        href={route("berita.detail", item.slug)}
                                        className="line-clamp-2 text-slate-400 transition-colors hover:text-white"
                                    >
                                        {item.judul}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="lg:col-span-3">
                        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-white">
                            Kontak
                        </h3>
                        <ul className="mt-4 space-y-3 text-sm text-slate-400">
                            <li className="flex items-start gap-3">
                                <FaMapMarkerAlt className="mt-1 h-3.5 w-3.5 shrink-0 text-brand-400" />
                                <span>
                                    Jl. Raya Kosambi Klari No.1, RT.2/RW.7,
                                    Pancawati, Karawang, Jawa Barat 41371
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <FaPhoneAlt className="h-3.5 w-3.5 shrink-0 text-brand-400" />
                                <span>123-456-789</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <FaEnvelope className="h-3.5 w-3.5 shrink-0 text-brand-400" />
                                <a
                                    href="mailto:galleryuptkrwg@gmail.com"
                                    className="transition-colors hover:text-white"
                                >
                                    galleryuptkrwg@gmail.com
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 py-6 text-xs text-slate-500 sm:flex-row">
                    <p>
                        &copy; {new Date().getFullYear()} PLN UPT Karawang. Hak
                        Cipta Dilindungi.
                    </p>
                    <ul className="flex gap-5">
                        <li>
                            <a href="#" className="hover:text-white">
                                Kebijakan Privasi
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-white">
                                Syarat &amp; Ketentuan
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </footer>
    );
}

function HomeLayoutContent({ children }) {
    const { auth, navMenus } = usePage().props;
    const menus = navMenus || [];
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [berita, setBerita] = useState([]);
    const [isSyncing, setIsSyncing] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    const fetchBerita = useCallback(async () => {
        try {
            const response = await axios.get("/api/berita");
            setBerita(response.data.berita || []);
        } catch {
            // Berita di footer hanya pelengkap: bila gagal dimuat, daftar
            // terakhir dipertahankan tanpa mengganggu halaman.
        }
    }, []);

    useEffect(() => {
        fetchBerita();

        const interval = setInterval(() => {
            setIsSyncing(true);
            fetchBerita();
            router.reload({
                only: ["navMenus"],
                onFinish: () => setIsSyncing(false),
            });
        }, SYNC_INTERVAL_MS);

        return () => clearInterval(interval);
    }, [fetchBerita]);

    useEffect(() => {
        const handleScroll = () =>
            setIsScrolled(window.scrollY > SCROLL_THRESHOLD_PX);

        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLogout = () => {
        router.post(
            route("logout"),
            {},
            {
                onSuccess: () =>
                    enqueueSnackbar("Anda berhasil logout.", {
                        variant: "success",
                    }),
                onError: () =>
                    enqueueSnackbar("Gagal melakukan logout.", {
                        variant: "error",
                    }),
            },
        );
        setIsLogoutModalOpen(false);
    };

    return (
        <div className="flex min-h-screen flex-col bg-slate-50">
            <div
                aria-live="polite"
                className={`pointer-events-none fixed bottom-5 right-5 z-[60] flex items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-3 py-1.5 shadow-soft backdrop-blur transition duration-500 ${
                    isSyncing
                        ? "translate-y-0 opacity-100"
                        : "translate-y-3 opacity-0"
                }`}
            >
                <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
                </span>
                <span className="text-[11px] font-semibold text-slate-600">
                    Menyinkronkan
                </span>
            </div>

            <header
                className={`sticky top-0 z-50 border-b transition duration-300 ${
                    isScrolled
                        ? "border-slate-200/80 bg-white/80 shadow-soft backdrop-blur-xl"
                        : "border-transparent bg-white"
                }`}
            >
                <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:h-[72px]">
                    <Link href="/" aria-label="Beranda PLN UPT Karawang">
                        <BrandMark />
                    </Link>

                    <DesktopNav menus={menus} />

                    <div className="flex items-center gap-2">
                        {auth?.user ? (
                            <ProfileMenu
                                user={auth.user}
                                isOpen={isProfileOpen}
                                onToggle={() => setIsProfileOpen((v) => !v)}
                                onLogout={() => {
                                    setIsProfileOpen(false);
                                    setIsLogoutModalOpen(true);
                                }}
                            />
                        ) : (
                            <Link
                                href={route("login")}
                                className="btn-primary hidden sm:inline-flex"
                            >
                                Masuk
                                <FaArrowRight className="h-3 w-3" />
                            </Link>
                        )}

                        <button
                            type="button"
                            aria-label="Buka menu"
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-slate-100 lg:hidden"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <FaBars className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </header>

            <MobileDrawer
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                menus={menus}
                isGuest={!auth?.user}
            />

            <main className="flex-grow">{children}</main>

            <SiteFooter
                menus={menus}
                news={berita.slice(0, FOOTER_NEWS_LIMIT)}
            />

            <LogoutModal
                show={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleLogout}
            />
        </div>
    );
}

export default function HomeLayout({ children }) {
    return (
        <SnackbarProvider
            maxSnack={10}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            autoHideDuration={3000}
        >
            <HomeLayoutContent>{children}</HomeLayoutContent>
        </SnackbarProvider>
    );
}
