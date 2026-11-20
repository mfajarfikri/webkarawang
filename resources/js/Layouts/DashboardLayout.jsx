import React, { useState, useEffect } from "react";
import { Head, Link, usePage, router } from "@inertiajs/react";
import { GiElectric } from "react-icons/gi";
import { MdOutlineReportProblem } from "react-icons/md";
import {
    FaHome,
    FaNewspaper,
    FaCog,
    FaBars,
    FaTimes,
    FaGlobe,
    FaBuilding,
    FaFileAlt,
    FaUsers,
    FaUserShield,
    FaKey,
    FaSignOutAlt,
    FaChartBar,
    FaChevronDown,
    FaAngleDoubleLeft,
    FaAngleDoubleRight,
    FaExternalLinkAlt,
} from "react-icons/fa";
import { useSnackbar } from "notistack";
import BrandMark from "@/Components/BrandMark";
import LogoutModal from "@/Components/LogoutModal";
import { PERMISSIONS, hasPermission } from "@/utils/permissions";

const SIDEBAR_STORAGE_KEY = "collapsedSidebar";
const CLOCK_TICK_MS = 60000;

// Sumber tunggal navigasi dashboard. `path` dipakai untuk status aktif.
const NAV_GROUPS = [
    {
        items: [
            {
                label: "Dashboard",
                icon: FaHome,
                routeName: "dashboard.index",
                path: "/dashboard",
                isExact: true,
            },
        ],
    },
    {
        title: "Konten",
        items: [
            {
                label: "Berita",
                icon: FaNewspaper,
                routeName: "dashboard.berita.index",
                permission: PERMISSIONS.BERITA_VIEW,
                path: "/dashboard/berita",
            },
            {
                label: "Profil Perusahaan",
                icon: FaFileAlt,
                routeName: "dashboard.company-profile.edit",
                permission: PERMISSIONS.COMPANY_PROFILE_MANAGE,
                path: "/dashboard/company-profile",
            },
            {
                label: "KTT",
                icon: FaBuilding,
                routeName: "dashboard.ktt.index",
                permission: PERMISSIONS.KTT_VIEW,
                path: "/dashboard/ktt",
            },
            {
                label: "Anomali",
                icon: MdOutlineReportProblem,
                routeName: "dashboard.anomali.index",
                permission: PERMISSIONS.ANOMALI_VIEW,
                path: "/dashboard/anomali",
            },
        ],
    },
    {
        title: "Data",
        items: [
            {
                label: "User",
                icon: FaUsers,
                routeName: "dashboard.user.index",
                permission: PERMISSIONS.USER_VIEW,
                path: "/dashboard/user",
            },
            {
                label: "Gardu Induk",
                icon: GiElectric,
                routeName: "dashboard.gardu.index",
                permission: PERMISSIONS.GARDU_VIEW,
                path: "/dashboard/garduinduk",
            },
        ],
    },
    {
        title: "Sistem",
        items: [
            {
                label: "Dashboard Kinerja",
                icon: FaChartBar,
                routeName: "dashboard.kinerja.index",
                permission: PERMISSIONS.KINERJA_VIEW,
                path: "/dashboard/kinerja",
            },
            {
                label: "Role",
                icon: FaUserShield,
                routeName: "dashboard.role.index",
                permission: PERMISSIONS.ROLE_VIEW,
                path: "/dashboard/role",
            },
            {
                label: "Permission",
                icon: FaKey,
                routeName: "permission.index",
                permission: PERMISSIONS.PERMISSION_VIEW,
                path: "/dashboard/permission",
            },
            {
                label: "Manajemen Menu",
                icon: FaBars,
                routeName: "dashboard.menu.index",
                permission: PERMISSIONS.MENU_VIEW,
                path: "/dashboard/menu",
            },
            {
                label: "Pengaturan",
                icon: FaCog,
                routeName: "dashboard.profile.edit",
                path: "/dashboard/profile",
            },
        ],
    },
];

function isItemActive(item, url) {
    const pathname = url.split("?")[0].replace(/\/$/, "") || "/";
    if (item.isExact) return pathname === item.path;
    return pathname.startsWith(item.path);
}

function readCollapsedPreference() {
    try {
        return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
    } catch {
        return false;
    }
}

/** Grup navigasi yang boleh dilihat user; grup tanpa item disembunyikan. */
export function visibleNavGroups(groups, user) {
    return groups
        .map((group) => ({
            ...group,
            items: group.items.filter((item) =>
                hasPermission(user, item.permission),
            ),
        }))
        .filter((group) => group.items.length > 0);
}

function SidebarNav({ isCollapsed = false, onNavigate }) {
    const { url, props } = usePage();
    const groups = visibleNavGroups(NAV_GROUPS, props?.auth?.user);

    return (
        <nav aria-label="Navigasi dashboard" className="space-y-6">
            {groups.map((group, groupIndex) => (
                <div key={group.title ?? groupIndex}>
                    {group.title &&
                        (isCollapsed ? (
                            <div className="mx-auto mb-3 h-px w-6 bg-white/10" />
                        ) : (
                            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                {group.title}
                            </p>
                        ))}
                    <ul className="space-y-0.5">
                        {group.items.map((item) => {
                            const isActive = isItemActive(item, url);
                            const Icon = item.icon;
                            return (
                                <li key={item.routeName}>
                                    <Link
                                        href={route(item.routeName)}
                                        onClick={onNavigate}
                                        title={
                                            isCollapsed ? item.label : undefined
                                        }
                                        aria-current={
                                            isActive ? "page" : undefined
                                        }
                                        className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                                            isCollapsed ? "justify-center" : ""
                                        } ${
                                            isActive
                                                ? "bg-white/10 text-white"
                                                : "text-slate-400 hover:bg-white/5 hover:text-white"
                                        }`}
                                    >
                                        {isActive && (
                                            <span className="absolute -left-3 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-volt" />
                                        )}
                                        <Icon
                                            className={`h-4 w-4 shrink-0 ${
                                                isActive
                                                    ? "text-volt"
                                                    : "text-slate-500 group-hover:text-slate-300"
                                            }`}
                                            aria-hidden="true"
                                        />
                                        {!isCollapsed && (
                                            <span className="truncate">
                                                {item.label}
                                            </span>
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            ))}
        </nav>
    );
}

function SidebarFooter({ isCollapsed, onNavigate }) {
    return (
        <Link
            href={route("home")}
            onClick={onNavigate}
            title={isCollapsed ? "Lihat website" : undefined}
            className={`flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white ${
                isCollapsed ? "justify-center" : "justify-between"
            }`}
        >
            <span className="flex items-center gap-3">
                <FaGlobe className="h-4 w-4 shrink-0 text-brand-300" />
                {!isCollapsed && "Lihat website"}
            </span>
            {!isCollapsed && (
                <FaExternalLinkAlt className="h-3 w-3 text-slate-500" />
            )}
        </Link>
    );
}

function UserMenu({ user, isOpen, onToggle, onLogout }) {
    return (
        <div className="relative">
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={isOpen}
                className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 transition hover:border-slate-300 hover:bg-slate-50"
            >
                {user.foto_profil ? (
                    <img
                        className="h-8 w-8 rounded-full object-cover"
                        src={`/storage/${user.foto_profil}`}
                        alt=""
                    />
                ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                        <FaUserShield className="h-4 w-4" />
                    </span>
                )}
                <span className="hidden text-left leading-tight md:block">
                    <span className="block max-w-[10rem] truncate text-sm font-semibold text-ink-900">
                        {user.name}
                    </span>
                    <span className="block text-[11px] text-slate-500">
                        {user.role}
                    </span>
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
                    <p className="truncate text-sm font-semibold text-ink-900">
                        {user.email}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                        {user.wilayah}
                    </p>
                </div>
                <div className="my-1 h-px bg-slate-100" />
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

export default function DashboardLayout({ children, title = "Dashboard" }) {
    const { auth } = usePage().props;
    const user = auth?.user || {};
    const { enqueueSnackbar } = useSnackbar();

    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(readCollapsedPreference);
    const [currentTime, setCurrentTime] = useState(() => new Date());

    useEffect(() => {
        const timer = setInterval(
            () => setCurrentTime(new Date()),
            CLOCK_TICK_MS,
        );
        return () => clearInterval(timer);
    }, []);

    const toggleCollapsed = () => {
        const nextValue = !isCollapsed;
        setIsCollapsed(nextValue);
        try {
            localStorage.setItem(SIDEBAR_STORAGE_KEY, String(nextValue));
        } catch {
            // Preferensi tidak tersimpan (mis. mode privat); abaikan.
        }
    };

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

    const dateLabel = currentTime.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });
    const timeLabel = currentTime.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <>
            <Head title={title} />
            <div className="min-h-screen bg-slate-50">
                {/* Sidebar desktop */}
                <aside
                    className={`fixed inset-y-0 left-0 z-30 hidden flex-col bg-ink-900 transition-[width] duration-300 ease-out md:flex ${
                        isCollapsed ? "w-20" : "w-72"
                    }`}
                >
                    <div
                        className={`flex h-16 shrink-0 items-center border-b border-white/5 ${
                            isCollapsed ? "justify-center px-3" : "px-5"
                        }`}
                    >
                        <Link href={route("dashboard.index")}>
                            <BrandMark tone="dark" compact={isCollapsed} />
                        </Link>
                    </div>
                    <div className="custom-scrollbar flex-1 overflow-y-auto px-3 py-5">
                        <SidebarNav isCollapsed={isCollapsed} />
                    </div>
                    <div className="shrink-0 border-t border-white/5 p-3">
                        <SidebarFooter isCollapsed={isCollapsed} />
                    </div>
                </aside>

                {/* Sidebar mobile */}
                <div
                    className={`fixed inset-0 z-50 transition-[visibility] duration-300 md:hidden ${
                        isMobileNavOpen
                            ? ""
                            : "pointer-events-none invisible"
                    }`}
                >
                    <div
                        className={`absolute inset-0 bg-ink-950/60 backdrop-blur-sm transition-opacity duration-300 ${
                            isMobileNavOpen ? "opacity-100" : "opacity-0"
                        }`}
                        onClick={() => setIsMobileNavOpen(false)}
                    />
                    <aside
                        className={`absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-ink-900 shadow-lift transition-transform duration-300 ease-out ${
                            isMobileNavOpen
                                ? "translate-x-0"
                                : "-translate-x-full"
                        }`}
                    >
                        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/5 px-5">
                            <BrandMark tone="dark" />
                            <button
                                type="button"
                                aria-label="Tutup menu"
                                onClick={() => setIsMobileNavOpen(false)}
                                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-white/10 hover:text-white"
                            >
                                <FaTimes className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto px-3 py-5">
                            <SidebarNav
                                onNavigate={() => setIsMobileNavOpen(false)}
                            />
                        </div>
                        <div className="shrink-0 border-t border-white/5 p-3">
                            <SidebarFooter
                                onNavigate={() => setIsMobileNavOpen(false)}
                            />
                        </div>
                    </aside>
                </div>

                {/* Kolom konten */}
                <div
                    className={`transition-[padding] duration-300 ease-out ${
                        isCollapsed ? "md:pl-20" : "md:pl-72"
                    }`}
                >
                    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
                        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                            <div className="flex min-w-0 items-center gap-3">
                                <button
                                    type="button"
                                    aria-label="Buka menu"
                                    onClick={() => setIsMobileNavOpen(true)}
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-100 md:hidden"
                                >
                                    <FaBars className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    aria-label={
                                        isCollapsed
                                            ? "Perluas sidebar"
                                            : "Ciutkan sidebar"
                                    }
                                    onClick={toggleCollapsed}
                                    className="hidden h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-ink-900 md:flex"
                                >
                                    {isCollapsed ? (
                                        <FaAngleDoubleRight className="h-3.5 w-3.5" />
                                    ) : (
                                        <FaAngleDoubleLeft className="h-3.5 w-3.5" />
                                    )}
                                </button>
                                <div className="min-w-0">
                                    <p className="truncate font-display text-base font-bold tracking-tight text-ink-900">
                                        {title}
                                    </p>
                                    <p className="hidden text-xs text-slate-500 sm:block">
                                        {dateLabel} · {timeLabel}
                                    </p>
                                </div>
                            </div>

                            <UserMenu
                                user={user}
                                isOpen={isUserMenuOpen}
                                onToggle={() => setIsUserMenuOpen((v) => !v)}
                                onLogout={() => {
                                    setIsUserMenuOpen(false);
                                    setIsLogoutModalOpen(true);
                                }}
                            />
                        </div>
                    </header>

                    <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                        {children}
                    </main>
                </div>

                <LogoutModal
                    show={isLogoutModalOpen}
                    onClose={() => setIsLogoutModalOpen(false)}
                    onConfirm={handleLogout}
                />
            </div>
        </>
    );
}
