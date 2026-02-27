import React from "react";
import { Head, Link, usePage, router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import ApplicationLogo from "@/Components/ApplicationLogo";
import { GiElectric } from "react-icons/gi";
import { MdOutlineReportProblem } from "react-icons/md";
import {
    FaHome,
    FaNewspaper,
    FaCog,
    FaBars,
    FaGlobe,
    FaBuilding,
    FaFileAlt,
    FaUsers,
    FaUserShield,
    FaKey,
    FaSignOutAlt,
} from "react-icons/fa";
import { useSnackbar } from "notistack";

export default function DashboardLayout({ children, title = "Dashboard" }) {
    const { auth } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [collapsedSidebar, setCollapsedSidebar] = useState(() => {
        return localStorage.getItem("collapsedSidebar") === "true";
    });
    const [showWelcomeBanner, setShowWelcomeBanner] = useState(() => {
        return localStorage.getItem("showWelcomeBanner") !== "false";
    });
    const userName = auth?.user?.name || "Admin";
    const userFotoProfil = auth?.user?.foto_profil || null;

    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    // Handle sidebar close with animation
    const closeSidebar = () => {
        setIsClosing(true);
        setTimeout(() => {
            setSidebarOpen(false);
            setIsClosing(false);
        }, 280);
    };

    // Toggle collapsed sidebar for desktop and save to localStorage
    const toggleSidebar = () => {
        const newValue = !collapsedSidebar;
        setCollapsedSidebar(newValue);
        localStorage.setItem("collapsedSidebar", newValue.toString());
    };

    // Handler untuk menutup banner
    const handleCloseBanner = () => {
        setShowWelcomeBanner(false);
        localStorage.setItem("showWelcomeBanner", "false");
    };

    const handleLogout = () => {
        router.post(
            route("logout"),
            {},
            {
                onSuccess: () => {
                    enqueueSnackbar("👋 Anda berhasil logout!", {
                        variant: "success",
                    });
                },
                onError: () => {
                    enqueueSnackbar("❌ Gagal melakukan logout!", {
                        variant: "error",
                    });
                },
            },
        );
        setShowLogoutModal(false);
    };

    return (
        <>
            <Head title={title} />
            <div className="min-h-screen bg-gray-100">
                {/* Fixed Header */}
                <header className="fixed top-0 left-0 right-0 z-30 bg-white shadow-sm border-b border-gray-200">
                    <div
                        className={`transition-all duration-300 w-full ${
                            collapsedSidebar ? "pl-0 md:pl-20" : "pl-0 md:pl-72"
                        }`}
                    >
                        <div className="flex justify-between h-16 px-4 sm:px-6 lg:px-8">
                            <div className="flex items-center gap-2 sm:gap-4">
                                {/* Mobile menu button */}
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    className="md:hidden p-2 -ml-2 rounded-md text-cyan-600 hover:bg-sky-50 focus:outline-none transition-colors duration-200"
                                >
                                    <FaBars className="h-6 w-6" />
                                </button>

                                {/* Desktop sidebar toggle button */}
                                <button
                                    onClick={toggleSidebar}
                                    className="hidden md:flex p-2 rounded-md text-cyan-600 hover:text-cyan-700 hover:bg-sky-50 focus:outline-none transition-colors duration-200"
                                >
                                    {collapsedSidebar ? (
                                        <svg
                                            className="h-6 w-6"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M13 5l7 7-7 7M5 5l7 7-7 7"
                                            />
                                        </svg>
                                    ) : (
                                        <svg
                                            className="h-6 w-6"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </div>

                            {/* Right side elements */}
                            <div className="flex items-center space-x-2 sm:space-x-4">
                                {/* Time display */}
                                <div className="hidden md:flex items-center text-sm text-gray-500">
                                    <svg
                                        className="h-4 w-4 mr-1"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    {currentTime.toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </div>

                                {/* Notifications */}
                                <button className="p-1 rounded-full text-cyan-600 hover:text-cyan-700 hover:bg-sky-50 focus:outline-none transition-colors duration-200">
                                    <span className="sr-only">
                                        View notifications
                                    </span>
                                    <div className="relative">
                                        <svg
                                            className="h-6 w-6"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                            />
                                        </svg>
                                        <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                                    </div>
                                </button>

                                {/* User profile dropdown - Simple & Clean Design */}
                                <div className="ml-3 relative">
                                    <div className="flex items-center gap-3">
                                        <div className="hidden md:block text-right">
                                            <div className="text-sm font-semibold text-gray-700 leading-tight">
                                                {userName}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-0.5">
                                                {auth.user.role}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() =>
                                                setActiveDropdown(
                                                    activeDropdown === "profile"
                                                        ? null
                                                        : "profile",
                                                )
                                            }
                                            className="relative flex rounded-full text-sm outline-none ring-sky-500 ring-offset-2 p-[2px] bg-gradient-to-r from-cyan-600 to-sky-600 transition-all duration-300 hover:shadow-[0_0_15px_-3px_rgba(8,145,178,0.4)]"
                                        >
                                            <span className="sr-only">
                                                Open user menu
                                            </span>
                                            <div className="rounded-full border-[2px] border-white bg-white overflow-hidden">
                                                {userFotoProfil ? (
                                                    <img
                                                        className="h-9 w-9 object-cover transition-all duration-300 hover:blur-[2px]"
                                                        src={`/storage/${userFotoProfil}`}
                                                        alt=""
                                                    />
                                                ) : (
                                                    <div className="h-9 w-9 bg-cyan-50 flex items-center justify-center text-cyan-600">
                                                        <FaUserShield className="h-4 w-4" />
                                                    </div>
                                                )}
                                            </div>
                                        </button>

                                        {/* Dropdown Menu */}
                                        <div
                                            className={`absolute right-0 mt-2 w-56 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none transition-all duration-200 z-50 ${
                                                activeDropdown === "profile"
                                                    ? "opacity-100 scale-100 translate-y-0"
                                                    : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                                            }`}
                                            style={{ top: "100%" }}
                                        >
                                            <div className="px-4 py-3 border-b border-gray-100">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {auth?.user?.email}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {auth.user.wilayah}
                                                </p>
                                            </div>

                                            <div className="py-1">
                                                <Link
                                                    href={route(
                                                        "dashboard.index",
                                                    )}
                                                    className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-cyan-600 transition-colors"
                                                >
                                                    <FaHome className="mr-3 h-4 w-4 text-gray-400 group-hover:text-cyan-500 transition-colors" />
                                                    Dashboard
                                                </Link>
                                                <Link
                                                    href={route(
                                                        "dashboard.profile.edit",
                                                    )}
                                                    className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-cyan-600 transition-colors"
                                                >
                                                    <FaCog className="mr-3 h-4 w-4 text-gray-400 group-hover:text-cyan-500 transition-colors" />
                                                    Settings
                                                </Link>
                                            </div>

                                            <div className="py-1 border-t border-gray-100">
                                                <button
                                                    onClick={() =>
                                                        setShowLogoutModal(true)
                                                    }
                                                    className="group flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    <FaSignOutAlt className="mr-3 h-4 w-4 text-red-400 group-hover:text-red-500 transition-colors" />
                                                    Sign out
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex pt-16 min-h-screen bg-slate-50">
                    {(sidebarOpen || isClosing) && (
                        <div className="md:hidden fixed inset-0 z-50">
                            <div
                                className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${
                                    isClosing ? "opacity-0" : "opacity-100"
                                }`}
                                onClick={closeSidebar}
                            ></div>
                            <div
                                className={`fixed inset-y-0 left-0 flex flex-col w-72 bg-white/95 backdrop-blur-xl shadow-2xl rounded-r-2xl border-r border-white/20 ${
                                    isClosing
                                        ? "sidebar-slide-out"
                                        : "sidebar-slide-in"
                                }`}
                            >
                                <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <ApplicationLogo className="h-8 w-auto" />
                                        <h2 className="text-lg font-bold text-gray-800 tracking-tight">
                                            UPT KARAWANG
                                        </h2>
                                    </div>
                                    <button
                                        onClick={closeSidebar}
                                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                                    >
                                        <svg
                                            className="h-6 w-6"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </div>
                                <nav className="flex-1 px-4 py-6 bg-white/50 space-y-1 overflow-y-auto custom-scrollbar">
                                    <SidebarMenu onLinkClick={closeSidebar} />
                                </nav>
                            </div>
                        </div>
                    )}
                    {/* Fixed sidebar for desktop with collapsible animation */}
                    <div
                        className={`hidden md:block fixed inset-y-0 left-0 z-30 bg-white border-r border-gray-100 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] transition-all duration-300 ease-in-out ${
                            collapsedSidebar ? "w-20" : "w-72"
                        }`}
                    >
                        <div className="flex flex-col h-full">
                            {/* Logo area in sidebar */}
                            <div className="h-20 flex items-center px-6 border-b border-gray-100/80 bg-white">
                                {collapsedSidebar ? (
                                    <div className="flex justify-center w-full">
                                        <ApplicationLogo className="h-10 w-10 fill-current" />
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <ApplicationLogo className="h-10 w-10 fill-current" />
                                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-800 tracking-tight whitespace-nowrap">
                                            UPT KARAWANG
                                        </h1>
                                    </div>
                                )}
                            </div>

                            {/* Sidebar content */}
                            <div className="flex flex-col h-full bg-white">
                                <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto custom-scrollbar">
                                    {!collapsedSidebar && showWelcomeBanner && (
                                        <div className="px-5 mb-8">
                                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 relative border border-amber-100 shadow-sm group">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-shrink-0 bg-white rounded-xl p-2 shadow-sm text-amber-500">
                                                        <FaUserShield className="text-lg" />
                                                    </div>
                                                    <div className="flex-1 min-w-0 pt-0.5">
                                                        <p className="text-sm font-bold text-amber-900 tracking-tight">
                                                            Selamat Datang!
                                                        </p>
                                                        <p className="text-xs text-amber-700 font-medium truncate mt-0.5">
                                                            {auth.user.name}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={handleCloseBanner}
                                                    className="absolute top-2 right-2 p-1.5 text-amber-400 hover:text-amber-600 hover:bg-amber-100 rounded-lg transition-colors duration-200"
                                                    title="Tutup"
                                                >
                                                    <svg
                                                        className="h-3.5 w-3.5"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M6 18L18 6M6 6l12 12"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    <nav
                                        className={`flex-1 ${
                                            collapsedSidebar ? "px-3" : "px-5"
                                        } space-y-2`}
                                    >
                                        <SidebarMenu
                                            collapsed={collapsedSidebar}
                                        />
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Main content */}
                    <div
                        className={`flex-1 transition-all duration-300 w-full min-h-screen ${
                            collapsedSidebar ? "md:pl-20" : "md:pl-72"
                        }`}
                    >
                        <main className="relative focus:outline-none w-full h-full">
                            <div className="py-8 w-full">
                                <div className="px-4 sm:px-6 md:px-8 w-full">
                                    {children}
                                </div>
                            </div>
                        </main>
                    </div>
                </div>

                {/* Modal Konfirmasi Logout */}
                {showLogoutModal && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div
                                className="fixed inset-0 transition-opacity"
                                aria-hidden="true"
                                onClick={() => setShowLogoutModal(false)}
                            >
                                <div className="absolute inset-0 bg-gray-800 opacity-75 "></div>
                            </div>

                            <span
                                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                                aria-hidden="true"
                            >
                                &#8203;
                            </span>

                            <div
                                className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                            <FaSignOutAlt
                                                className="h-6 w-6 text-red-600"
                                                aria-hidden="true"
                                            />
                                        </div>
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                            <h3
                                                className="text-lg leading-6 font-medium text-gray-900"
                                                id="modal-title"
                                            >
                                                Konfirmasi Logout
                                            </h3>
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-500">
                                                    Apakah Anda yakin ingin
                                                    keluar dari sistem? Anda
                                                    perlu login kembali untuk
                                                    mengakses dashboard.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-100 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="button"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={() =>
                                            setShowLogoutModal(false)
                                        }
                                    >
                                        Batal
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

function SidebarMenu({ collapsed = false, onLinkClick }) {
    const { url } = usePage();

    // Fungsi untuk memeriksa apakah rute saat ini aktif
    const isActive = (path) => {
        return url.startsWith(path);
    };

    // Helper agar Link menutup sidebar di mobile
    const handleClick = (e) => {
        if (onLinkClick) onLinkClick(e);
    };

    // Helper untuk styling link
    const getLinkClasses = (path) => {
        const active = isActive(path);
        const baseClasses = `group flex items-center relative px-3 py-2.5 my-1 text-sm font-medium rounded-xl transition-all duration-200 ease-in-out ${
            collapsed ? "justify-center" : ""
        }`;
        const activeClasses =
            "bg-gradient-to-r from-cyan-600 to-sky-600 text-white shadow-lg shadow-cyan-500/30";
        const inactiveClasses =
            "text-gray-600 hover:bg-sky-50 hover:text-sky-700";

        return `${baseClasses} ${active ? activeClasses : inactiveClasses}`;
    };

    const getIconClasses = (path) => {
        const active = isActive(path);
        return `${collapsed ? "mx-auto" : "mr-3"} text-lg transition-colors duration-200 ${
            active ? "text-white" : "text-gray-400 group-hover:text-cyan-600"
        }`;
    };

    const SectionHeader = ({ title }) =>
        !collapsed && (
            <div className="px-4 mb-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {title}
                </p>
            </div>
        );

    return (
        <>
            <Link
                href="/dashboard"
                onClick={handleClick}
                className={getLinkClasses("/dashboard")}
            >
                <FaHome
                    className={getIconClasses("/dashboard")}
                    aria-label="Dashboard"
                    title="Dashboard"
                />
                {!collapsed && (
                    <span className="font-semibold tracking-tight">
                        Dashboard
                    </span>
                )}
            </Link>

            <SectionHeader title="Konten" />

            <Link
                href={route("dashboard.berita.index")}
                onClick={handleClick}
                className={getLinkClasses("/dashboard/berita")}
            >
                <FaNewspaper
                    className={getIconClasses("/dashboard/berita")}
                    aria-label="Berita"
                    title="Berita"
                />
                {!collapsed && (
                    <span className="font-semibold tracking-tight">Berita</span>
                )}
            </Link>

            <Link
                href={route("dashboard.company-profile.edit")}
                onClick={handleClick}
                className={getLinkClasses("/dashboard/company-profile")}
            >
                <FaFileAlt
                    className={getIconClasses("/dashboard/company-profile")}
                    aria-label="Profil Perusahaan"
                    title="Profil Perusahaan"
                />
                {!collapsed && (
                    <span className="font-semibold tracking-tight">
                        Profil Perusahaan
                    </span>
                )}
            </Link>

            <Link
                href={route("dashboard.ktt.index")}
                onClick={handleClick}
                className={getLinkClasses("/dashboard/ktt")}
            >
                <FaBuilding
                    className={getIconClasses("/dashboard/ktt")}
                    aria-label="KTT"
                    title="KTT"
                />
                {!collapsed && (
                    <span className="font-semibold tracking-tight">KTT</span>
                )}
            </Link>

            <Link
                href={route("dashboard.anomali.index")}
                onClick={handleClick}
                className={getLinkClasses("/dashboard/anomali")}
            >
                <MdOutlineReportProblem
                    className={getIconClasses("/dashboard/anomali")}
                    aria-label="Anomali"
                    title="Anomali"
                />
                {!collapsed && (
                    <span className="font-semibold tracking-tight">
                        Anomali
                    </span>
                )}
            </Link>

            <SectionHeader title="Data" />

            <Link
                href={route("dashboard.user.index")}
                onClick={handleClick}
                className={getLinkClasses("/dashboard/user")}
            >
                <FaUsers
                    className={getIconClasses("/dashboard/user")}
                    aria-label="User"
                    title="User"
                />
                {!collapsed && (
                    <span className="font-semibold tracking-tight">User</span>
                )}
            </Link>

            <Link
                href={route("dashboard.gardu.index")}
                onClick={handleClick}
                className={getLinkClasses("/dashboard/garduinduk")}
            >
                <GiElectric
                    className={getIconClasses("/dashboard/garduinduk")}
                    aria-label="Gardu Induk"
                    title="Gardu Induk"
                />
                {!collapsed && (
                    <span className="font-semibold tracking-tight">
                        Gardu Induk
                    </span>
                )}
            </Link>

            <SectionHeader title="Pengaturan" />

            <Link
                href={route("dashboard.profile.edit")}
                onClick={handleClick}
                className={getLinkClasses("/dashboard/profile")}
            >
                <FaCog
                    className={getIconClasses("/dashboard/profile")}
                    aria-label="Pengaturan"
                    title="Pengaturan"
                />
                {!collapsed && (
                    <span className="font-semibold tracking-tight">
                        Pengaturan
                    </span>
                )}
            </Link>

            <Link
                href={route("dashboard.role.index")}
                onClick={handleClick}
                className={getLinkClasses("/dashboard/role")}
            >
                <FaUserShield
                    className={getIconClasses("/dashboard/role")}
                    aria-label="Role"
                    title="Role"
                />
                {!collapsed && (
                    <span className="font-semibold tracking-tight">Role</span>
                )}
            </Link>
            <Link
                href={"/dashboard/permission"}
                onClick={handleClick}
                className={getLinkClasses("/dashboard/permission")}
            >
                <FaKey
                    className={getIconClasses("/dashboard/permission")}
                    aria-label="Permission"
                    title="Permission"
                />
                {!collapsed && (
                    <span className="font-semibold tracking-tight">
                        Permission
                    </span>
                )}
            </Link>

            <SectionHeader title="Website" />

            <Link
                href={route("home")}
                onClick={handleClick}
                className={getLinkClasses("/website")}
            >
                <FaGlobe
                    className={getIconClasses("/website")}
                    aria-label="Website"
                    title="Website"
                />
                {!collapsed && (
                    <span className="font-semibold tracking-tight">
                        Website
                    </span>
                )}
            </Link>
        </>
    );
}
