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
    FaGlobe,
    FaBuilding,
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
            }
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
                        className={`transition-all duration-300 ${
                            collapsedSidebar ? "pl-0 md:pl-20" : "pl-0 md:pl-72"
                        }`}
                    >
                        <div className="flex justify-between h-16 px-4 sm:px-6 lg:px-2">
                            <div className="flex items-center">
                                {/* Mobile menu button */}
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    className="md:hidden p-2 rounded-md text-blue-600 hover:bg-blue-700 focus:outline-none transition-colors duration-200"
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
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                    </svg>
                                </button>

                                {/* Desktop sidebar toggle button */}
                                <button
                                    onClick={toggleSidebar}
                                    className="hidden md:flex p-2 rounded-md text-blue-600 hover:text-blue-700 hover:bg-blue-50 focus:outline-none transition-colors duration-200"
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

                                {/* Logo for mobile only */}
                                <Link href={route("home")}>
                                    <div className="flex-shrink-0 flex items-center">
                                        <div className="flex items-center">
                                            <ApplicationLogo className="h-8 w-8 mr-2" />
                                            <h1 className="text-xl font-bold text-blue-800 tracking-wide">
                                                UPT KARAWANG
                                            </h1>
                                        </div>
                                    </div>
                                </Link>
                            </div>

                            {/* Right side elements */}
                            <div className="flex items-center space-x-4">
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
                                <button className="p-1 rounded-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 focus:outline-none transition-colors duration-200">
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

                                {/* User profile dropdown */}
                                <div className="ml-3 relative">
                                    <div className="flex items-center">
                                        <div className="flex flex-col mx-2">
                                            <span className="hidden md:inline-block text-sm font-medium text-gray-700">
                                                {userName}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {auth.user.wilayah} -{" "}
                                                {auth.user.role}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() =>
                                                setActiveDropdown(
                                                    activeDropdown === "profile"
                                                        ? null
                                                        : "profile"
                                                )
                                            }
                                            className="bg-blue-600 rounded-full p-0.5 flex items-center justify-center border-2 border-blue-100"
                                        >
                                            <div className="bg-white rounded-full p-0.5">
                                                {userFotoProfil ? (
                                                    <img
                                                        src={
                                                            userFotoProfil
                                                                ? `/storage/${userFotoProfil}`
                                                                : ""
                                                        }
                                                        alt="Foto Profil"
                                                        className="h-8 w-8 rounded-full object-cover transition-all duration-300 ease-in-out hover:blur-sm"
                                                    />
                                                ) : (
                                                    <svg
                                                        className="h-8 w-8 text-blue-700"
                                                        fill="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                                    </svg>
                                                )}
                                            </div>
                                        </button>
                                        <div
                                            className={`absolute right-0 mt-2 min-w-[180px] bg-white rounded-xl shadow-2xl py-2 z-50 border border-gray-100 transition-all duration-200 ${
                                                activeDropdown === "profile"
                                                    ? "opacity-100 scale-100 pointer-events-auto"
                                                    : "opacity-0 scale-95 pointer-events-none"
                                            }`}
                                            style={{ top: "110%" }}
                                        >
                                            <div className="px-4 py-2 border-b border-gray-100 flex items-center gap-2">
                                                {userFotoProfil ? (
                                                    <img
                                                        src={`/storage/${userFotoProfil}`}
                                                        alt="Foto Profil"
                                                        className="h-8 w-8 rounded-full object-cover border border-blue-200 aspect-square"
                                                    />
                                                ) : (
                                                    <svg
                                                        className="h-8 w-8 text-blue-700"
                                                        fill="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                                    </svg>
                                                )}
                                                <div>
                                                    <div className="font-semibold text-gray-800 text-sm">
                                                        {userName}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {auth?.user?.email}
                                                    </div>
                                                </div>
                                            </div>
                                            <Link
                                                href={route("dashboard.index")}
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition rounded-md"
                                            >
                                                <FaHome className="text-blue-500" />{" "}
                                                Dashboard
                                            </Link>
                                            <Link
                                                href={route(
                                                    "dashboard.profile.edit"
                                                )}
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition rounded-md"
                                            >
                                                <FaCog className="text-blue-500" />{" "}
                                                Profile
                                            </Link>
                                            <button
                                                onClick={() =>
                                                    setShowLogoutModal(true)
                                                }
                                                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition rounded-md"
                                            >
                                                <svg
                                                    className="h-4 w-4 text-red-500"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth={2}
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1"
                                                    />
                                                </svg>
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex pt-16">
                    {(sidebarOpen || isClosing) && (
                        <div className="md:hidden fixed inset-0 z-40">
                            <div
                                className={`fixed inset-0 bg-blue-900 bg-opacity-40 backdrop-blur-sm ${
                                    isClosing
                                        ? "backdrop-fade-out"
                                        : "backdrop-fade-in"
                                }`}
                                onClick={closeSidebar}
                            ></div>
                            <div
                                className={`fixed inset-y-0 left-0 flex flex-col w-72 bg-white shadow-xl rounded-r-xl ${
                                    isClosing
                                        ? "sidebar-slide-out"
                                        : "sidebar-slide-in"
                                }`}
                            >
                                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
                                    <h2 className="text-lg font-medium text-blue-800">
                                        Menu
                                    </h2>
                                    <button
                                        onClick={closeSidebar}
                                        className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
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
                                <nav className="flex-1 px-3 py-4 bg-white space-y-1 overflow-y-auto custom-scrollbar">
                                    <SidebarMenu onLinkClick={closeSidebar} />
                                </nav>
                            </div>
                        </div>
                    )}
                    {/* Fixed sidebar for desktop with collapsible animation */}
                    <div
                        className={`hidden md:block fixed inset-y-0 left-0 z-20 transition-all duration-300 ${
                            collapsedSidebar ? "w-20" : "w-72"
                        }`}
                    >
                        <div className="flex flex-col h-full">
                            {/* Logo area in sidebar */}
                            <div className="h-16 flex items-center px-6 bg-white border-b border-blue-100 shadow-sm overflow-hidden">
                                {collapsedSidebar ? (
                                    <div className="flex justify-center w-full">
                                        <div className="bg-blue-600 text-white p-2 rounded-lg border-2 border-blue-200">
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
                                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center">
                                        <div className="bg-blue-600 text-white p-2 rounded-lg mr-2 border-2 border-blue-200">
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
                                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                                />
                                            </svg>
                                        </div>
                                        <h1 className="text-xl font-bold text-blue-800 tracking-wide whitespace-nowrap">
                                            Nama Perusahaan
                                        </h1>
                                    </div>
                                )}
                            </div>

                            {/* Sidebar content */}
                            <div className="flex flex-col h-full bg-white">
                                <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto custom-scrollbar">
                                    {!collapsedSidebar && showWelcomeBanner && (
                                        <div className="px-4 mb-6">
                                            <div className="bg-yellow-50 rounded-lg p-3 flex items-center justify-between relative border-l-4 border-yellow-400">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 bg-yellow-100 rounded-md p-2">
                                                        <svg
                                                            className="h-6 w-6 text-yellow-600"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                            />
                                                        </svg>
                                                    </div>
                                                    <div className="ml-3">
                                                        <p className="text-sm font-medium text-yellow-800">
                                                            Selamat Datang!
                                                        </p>
                                                        <p className="text-xs text-yellow-600">
                                                            {auth.user.name}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={handleCloseBanner}
                                                    className="absolute top-1 right-1 p-1 hover:bg-yellow-100 rounded-full transition-colors duration-200"
                                                    title="Tutup"
                                                >
                                                    <svg
                                                        className="h-4 w-4 text-yellow-600"
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
                                        className={`mt-2 flex-1 ${
                                            collapsedSidebar ? "px-2" : "px-3"
                                        } bg-white space-y-2`}
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
                        className={`flex-1 transition-all duration-300 ${
                            collapsedSidebar ? "md:pl-0" : "md:pl-72"
                        }`}
                    >
                        <main className="relative overflow-y-auto focus:outline-none">
                            <div className="py-6">
                                <div
                                    className={`transition-all duration-300 ${
                                        collapsedSidebar ? "ml-24" : "ml-2"
                                    }
                                    } mr-2 px-2 sm:px-6 md:px-0`}
                                >
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

    return (
        <>
            <Link
                href="/dashboard"
                onClick={handleClick}
                className={`group flex items-center ${
                    collapsed ? "justify-center" : ""
                } px-3 py-2.5 text-sm font-medium rounded-lg ${
                    isActive("/dashboard")
                        ? "bg-gray-100 text-gray-700"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-700"
                } transition-colors duration-200 menu-item-hover`}
            >
                <FaHome
                    className={`${collapsed ? "mx-auto" : "mr-3"} h-5 w-5 ${
                        isActive("/dashboard")
                            ? "text-blue-600"
                            : "text-gray-400 group-hover:text-gray-600"
                    }`}
                    aria-label="Dashboard"
                    title="Dashboard"
                />
                {!collapsed && <span>Dashboard</span>}
            </Link>

            {!collapsed && (
                <div className="pt-2 pb-1">
                    <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Konten
                    </p>
                </div>
            )}

            <Link
                href={route("dashboard.berita.index")}
                onClick={handleClick}
                className={`group flex items-center ${
                    collapsed ? "justify-center" : ""
                } px-3 py-2.5 text-sm font-medium rounded-lg ${
                    isActive("/dashboard/berita")
                        ? "bg-gray-100 text-gray-700"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-700"
                } transition-colors duration-200 menu-item-hover`}
            >
                <FaNewspaper
                    className={`${collapsed ? "mx-auto" : "mr-3"} h-5 w-5 ${
                        isActive("/dashboard/berita")
                            ? "text-blue-600"
                            : "text-gray-400 group-hover:text-gray-600"
                    }`}
                    aria-label="Berita"
                    title="Berita"
                />
                {!collapsed && <span>Berita</span>}
            </Link>

            <Link
                href={route("dashboard.ktt.index")}
                onClick={handleClick}
                className={`group flex items-center ${
                    collapsed ? "justify-center" : ""
                } px-3 py-2.5 text-sm font-medium rounded-lg ${
                    isActive("/dashboard/ktt")
                        ? "bg-gray-100 text-gray-700"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-700"
                } transition-colors duration-200 menu-item-hover`}
            >
                <FaBuilding
                    className={`${collapsed ? "mx-auto" : "mr-3"} h-5 w-5 ${
                        isActive("/dashboard/ktt")
                            ? "text-blue-600"
                            : "text-gray-400 group-hover:text-gray-600"
                    }`}
                    aria-label="ktt"
                    title="ktt"
                />
                {!collapsed && <span>KTT</span>}
            </Link>

            <Link
                href={route("dashboard.anomali.index")}
                onClick={handleClick}
                className={`group flex items-center ${
                    collapsed ? "justify-center" : ""
                } px-3 py-2.5 text-sm font-medium rounded-lg ${
                    isActive("/dashboard/anomali")
                        ? "bg-gray-100 text-gray-700"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-700"
                } transition-colors duration-200 menu-item-hover`}
            >
                <MdOutlineReportProblem
                    className={`${collapsed ? "mx-auto" : "mr-3"} h-5 w-5 ${
                        isActive("/dashboard/anomali")
                            ? "text-blue-600"
                            : "text-gray-400 group-hover:text-gray-600"
                    }`}
                    aria-label="ktt"
                    title="ktt"
                />
                {!collapsed && <span>Anomali</span>}
            </Link>

            {!collapsed && (
                <div className="pt-2 pb-1">
                    <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Data
                    </p>
                </div>
            )}

            <Link
                href={route("dashboard.user.index")}
                onClick={handleClick}
                className={`group flex items-center ${
                    collapsed ? "justify-center" : ""
                } px-3 py-2.5 text-sm font-medium rounded-lg ${
                    isActive("/dashboard/user")
                        ? "bg-gray-100 text-gray-700"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-700"
                } transition-colors duration-200 menu-item-hover`}
            >
                <FaUsers
                    className={`${collapsed ? "mx-auto" : "mr-3"} h-5 w-5 ${
                        isActive("/dashboard/user")
                            ? "text-blue-600"
                            : "text-gray-400 group-hover:text-gray-600"
                    }`}
                    aria-label="User"
                    title="User"
                />
                {!collapsed && <span>User</span>}
            </Link>

            <Link
                href={route("dashboard.gardu.index")}
                onClick={handleClick}
                className={`group flex items-center ${
                    collapsed ? "justify-center" : ""
                } px-3 py-2.5 text-sm font-medium rounded-lg ${
                    isActive("/dashboard/garduinduk")
                        ? "bg-gray-100 text-gray-700"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-700"
                } transition-colors duration-200 menu-item-hover`}
            >
                <GiElectric
                    className={`${collapsed ? "mx-auto" : "mr-3"} h-5 w-5 ${
                        isActive("/dashboard/garduinduk")
                            ? "text-blue-600"
                            : "text-gray-400 group-hover:text-gray-600"
                    }`}
                    aria-label="User"
                    title="User"
                />
                {!collapsed && <span>Gardu Induk</span>}
            </Link>

            {!collapsed && (
                <div className="pt-2 pb-1">
                    <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Pengaturan
                    </p>
                </div>
            )}

            <Link
                href={route("dashboard.profile.edit")}
                onClick={handleClick}
                className={`group flex items-center ${
                    collapsed ? "justify-center" : ""
                } px-3 py-2.5 text-sm font-medium rounded-lg ${
                    isActive("/dashboard/profile")
                        ? "bg-gray-100 text-gray-700"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-700"
                } transition-colors duration-200 menu-item-hover`}
            >
                <FaCog
                    className={`${collapsed ? "mx-auto" : "mr-3"} h-5 w-5 ${
                        isActive("/dashboard/profile")
                            ? "text-blue-600"
                            : "text-gray-400 group-hover:text-gray-600"
                    }`}
                    aria-label="Pengaturan"
                    title="Pengaturan"
                />
                {!collapsed && <span>Pengaturan</span>}
            </Link>

            <Link
                href={route("dashboard.role.index")}
                onClick={handleClick}
                className={`group flex items-center ${
                    collapsed ? "justify-center" : ""
                } px-3 py-2.5 text-sm font-medium rounded-lg ${
                    isActive("/dashboard/role")
                        ? "bg-gray-100 text-gray-700"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-700"
                } transition-colors duration-200 menu-item-hover`}
            >
                <FaUserShield
                    className={`${collapsed ? "mx-auto" : "mr-3"} h-5 w-5 ${
                        isActive("/dashboard/role")
                            ? "text-blue-600"
                            : "text-gray-400 group-hover:text-gray-600"
                    }`}
                    aria-label="Role"
                    title="Role"
                />
                {!collapsed && <span>Role</span>}
            </Link>
            <Link
                href={"/dashboard/permission"}
                onClick={handleClick}
                className={`group flex items-center ${
                    collapsed ? "justify-center" : ""
                } px-3 py-2.5 text-sm font-medium rounded-lg ${
                    isActive("/dashboard/permission")
                        ? "bg-gray-100 text-gray-700"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-700"
                } transition-colors duration-200 menu-item-hover`}
            >
                <FaKey
                    className={`${collapsed ? "mx-auto" : "mr-3"} h-5 w-5 ${
                        isActive("/dashboard/permission")
                            ? "text-blue-600"
                            : "text-gray-400 group-hover:text-gray-600"
                    }`}
                    aria-label="Permission"
                    title="Permission"
                />
                {!collapsed && <span>Permission</span>}
            </Link>

            {!collapsed && (
                <div className="pt-2 pb-1">
                    <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Website
                    </p>
                </div>
            )}

            <Link
                href={route("home")}
                onClick={handleClick}
                className={`group flex items-center ${
                    collapsed ? "justify-center" : ""
                } px-3 py-2.5 text-sm font-medium rounded-lg ${
                    isActive("/website")
                        ? "bg-gray-100 text-gray-700"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-700"
                } transition-colors duration-200 menu-item-hover`}
            >
                <FaGlobe
                    className={`${collapsed ? "mx-auto" : "mr-3"} h-5 w-5 ${
                        isActive("/dashboard.website")
                            ? "text-blue-600"
                            : "text-gray-400 group-hover:text-gray-600"
                    }`}
                    aria-label="Website"
                    title="Website"
                />
                {!collapsed && <span>Website</span>}
            </Link>
        </>
    );
}
