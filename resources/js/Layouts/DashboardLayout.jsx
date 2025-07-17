import React from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";
import ApplicationLogo from "@/Components/ApplicationLogo";
import { GiElectric } from "react-icons/gi";
import { MdOutlineReportProblem } from "react-icons/md";
import { AiOutlineNodeIndex } from "react-icons/ai";
import {
    FaHome,
    FaNewspaper,
    FaCog,
    FaGlobe,
    FaBuilding,
    FaUser,
    FaUserShield, // Role management
    FaKey,        // Permission management
} from "react-icons/fa";
import { Transition } from "@headlessui/react";

export default function DashboardLayout({ children, title = "Dashboard" }) {
    const { auth } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [collapsedSidebar, setCollapsedSidebar] = useState(false);
    const [showWelcomeBanner, setShowWelcomeBanner] = useState(() => {
        return localStorage.getItem("showWelcomeBanner") !== "false";
    });
    const userName = auth?.user?.name || "Admin";
    const userRole = auth?.user?.role || "User";

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

    // Toggle collapsed sidebar for desktop
    const toggleSidebar = () => {
        setCollapsedSidebar(!collapsedSidebar);
    };

    // Handler untuk menutup banner
    const handleCloseBanner = () => {
        setShowWelcomeBanner(false);
        localStorage.setItem("showWelcomeBanner", "false");
    };

    return (
        <>
            <Head title={title} />
            <div className="min-h-screen bg-gray-50">
                {/* Fixed Header */}
                <header className="fixed top-0 left-0 right-0 z-30 bg-white shadow-md">
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
                                    className="md:hidden p-2 rounded-md text-gray-400 hover:text-blue-600 hover:bg-gray-100 focus:outline-none transition-colors duration-200"
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
                                    className="hidden md:flex p-2 rounded-md text-gray-400 hover:text-blue-600 hover:bg-gray-100 focus:outline-none transition-colors duration-200"
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
                                <div className="flex-shrink-0 flex items-center">
                                    <div className="flex items-center">
                                        <ApplicationLogo className="h-8 w-8 mr-2" />
                                        <h1 className="text-xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                            UPT KARAWANG
                                        </h1>
                                    </div>
                                </div>
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
                                <button className="p-1 rounded-full text-gray-400 hover:text-blue-600 hover:bg-gray-100 focus:outline-none transition-colors duration-200">
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
                                        <span className="hidden md:inline-block mr-2 text-sm font-medium text-gray-700">
                                            {userName}
                                        </span>
                                        <button className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full p-0.5 flex items-center justify-center">
                                            <div className="bg-white rounded-full p-0.5">
                                                <svg
                                                    className="h-8 w-8 text-gray-700"
                                                    fill="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                                </svg>
                                            </div>
                                        </button>
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
                                className={`fixed inset-0 bg-gray-600 bg-opacity-75 backdrop-blur-sm ${isClosing ? "backdrop-fade-out" : "backdrop-fade-in"}`}
                                onClick={closeSidebar}
                            ></div>
                            <div
                                className={`fixed inset-y-0 left-0 flex flex-col w-72 bg-white shadow-xl rounded-r-xl ${isClosing ? "sidebar-slide-out" : "sidebar-slide-in"}`}
                            >
                                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
                                    <h2 className="text-lg font-medium text-gray-900">Menu</h2>
                                    <button
                                        onClick={closeSidebar}
                                        className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
                                    >
                                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <nav className="flex-1 px-3 py-4 bg-white space-y-1 overflow-y-auto scrollbar-hide">
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
                            <div className="h-16 flex items-center px-6 bg-white border-b border-gray-200 shadow-sm overflow-hidden">
                                {collapsedSidebar ? (
                                    <div className="flex justify-center w-full">
                                        <div className="bg-blue-600 text-white p-2 rounded-lg">
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
                                        <div className="bg-blue-600 text-white p-2 rounded-lg mr-2">
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
                                        <h1 className="text-xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent whitespace-nowrap">
                                            Nama Perusahaan
                                        </h1>
                                    </div>
                                )}
                            </div>

                            {/* Sidebar content */}
                            <div className="flex flex-col h-full border-r border-gray-200 bg-white">
                                <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto scrollbar-hide">
                                    {!collapsedSidebar && showWelcomeBanner && (
                                        <div className="px-4 mb-6">
                                            <div className="bg-amber-50 rounded-lg p-3 flex items-center justify-between relative">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 bg-amber-100 rounded-md p-2">
                                                        <svg
                                                            className="h-6 w-6 text-amber-600"
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
                                                        <p className="text-sm font-medium text-amber-800">
                                                            Selamat Datang!
                                                        </p>
                                                        <p className="text-xs text-amber-600">
                                                            {auth.user.name}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={handleCloseBanner}
                                                    className="absolute top-1 right-1 p-1 hover:bg-amber-100 rounded-full transition-colors duration-200"
                                                    title="Tutup"
                                                >
                                                    <svg
                                                        className="h-4 w-4 text-amber-600"
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
        
        
            <Link href="/dashboard" onClick={handleClick} className={`group flex items-center ${collapsed ? "justify-center" : ""} px-3 py-2.5 text-sm font-medium rounded-lg ${isActive("/dashboard") ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"} transition-colors duration-200 menu-item-hover`}>
                <FaHome className={`${collapsed ? "" : "mr-3"} h-5 w-5 ${isActive("/dashboard") ? "text-blue-600" : "text-gray-500 group-hover:text-blue-600"}`} aria-label="Dashboard" title="Dashboard" />
                {!collapsed && <span>Dashboard</span>}
            </Link>

            
            {!collapsed && (
                <div className="pt-2 pb-1">
                    <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Konten
                    </p>
                </div>
            )}

            <Link href={route("dashboard.berita.index")} onClick={handleClick} className={`group flex items-center ${collapsed ? "justify-center" : ""} px-3 py-2.5 text-sm font-medium rounded-lg ${isActive("/dashboard/berita") ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"} transition-colors duration-200 menu-item-hover`}>
                <FaNewspaper className={`${collapsed ? "" : "mr-3"} h-5 w-5 ${isActive("/dashboard/berita") ? "text-blue-600" : "text-gray-500 group-hover:text-blue-600"}`} aria-label="Berita" title="Berita" />
                {!collapsed && <span>Berita</span>}
            </Link>

            <Link href={route("dashboard.ktt.index")} onClick={handleClick} className={`group flex items-center ${collapsed ? "justify-center" : ""} px-3 py-2.5 text-sm font-medium rounded-lg ${isActive("/ktt") ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"} transition-colors duration-200 menu-item-hover`}>
                <FaBuilding className={`${collapsed ? "" : "mr-3"} h-5 w-5 ${isActive("/ktt") ? "text-blue-600" : "text-gray-500 group-hover:text-blue-600"}`} aria-label="ktt" title="ktt" />
                {!collapsed && <span>KTT</span>}
            </Link>

            <Link href={route("dashboard.anomali.index")} onClick={handleClick} className={`group flex items-center ${collapsed ? "justify-center" : ""} px-3 py-2.5 text-sm font-medium rounded-lg ${isActive("/dashboard/anomali") ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"} transition-colors duration-200 menu-item-hover`}>
                <MdOutlineReportProblem className={`${collapsed ? "" : "mr-3"} h-5 w-5 ${isActive("/dashboard/anomali") ? "text-blue-600" : "text-gray-500 group-hover:text-blue-600"}`} aria-label="ktt" title="ktt" />
                {!collapsed && <span>Anomali</span>}
            </Link>

            {!collapsed && (
                <div className="pt-2 pb-1">
                    <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Data
                    </p>
                </div>
            )}

            <Link href={route("dashboard.user.index")} onClick={handleClick} className={`group flex items-center ${collapsed ? "justify-center" : ""} px-3 py-2.5 text-sm font-medium rounded-lg ${isActive("/dashboard/user") ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"} transition-colors duration-200 menu-item-hover`}>
                <FaUser className={`${collapsed ? "" : "mr-3"} h-5 w-5 ${isActive("/dashboard/user") ? "text-blue-600" : "text-gray-500 group-hover:text-blue-600"}`} aria-label="User" title="User" />
                {!collapsed && <span>User</span>}
            </Link>

            <Link href={route("dashboard.gardu.index")} onClick={handleClick} className={`group flex items-center ${collapsed ? "justify-center" : ""} px-3 py-2.5 text-sm font-medium rounded-lg ${isActive("/dashboard/garduinduk") ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"} transition-colors duration-200 menu-item-hover`}>
                <GiElectric className={`${collapsed ? "" : "mr-3"} h-5 w-5 ${isActive("/dashboard/garduinduk") ? "text-blue-600" : "text-gray-500 group-hover:text-blue-600"}`} aria-label="User" title="User" />
                {!collapsed && <span>Gardu Induk</span>}
            </Link>

            

            {!collapsed && (
                <div className="pt-2 pb-1">
                    <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Pengaturan
                    </p>
                </div>
            )}

            <Link href={route("dashboard.profile.edit")} onClick={handleClick} className={`group flex items-center ${collapsed ? "justify-center" : ""} px-3 py-2.5 text-sm font-medium rounded-lg ${isActive("/dashboard/profile") ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"} transition-colors duration-200 menu-item-hover`}>
                <FaCog className={`${collapsed ? "" : "mr-3"} h-5 w-5 ${isActive("/dashboard/profile") ? "text-blue-600" : "text-gray-500 group-hover:text-blue-600"}`} aria-label="Pengaturan" title="Pengaturan" />
                {!collapsed && <span>Pengaturan</span>}
            </Link>

            <Link href={route("dashboard.role.index")} onClick={handleClick} className={`group flex items-center ${collapsed ? "justify-center" : ""} px-3 py-2.5 text-sm font-medium rounded-lg ${isActive("/dashboard/role") ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"} transition-colors duration-200 menu-item-hover`}>
                <FaUserShield className={`${collapsed ? "" : "mr-3"} h-5 w-5 ${isActive("/dashboard/role") ? "text-blue-600" : "text-gray-500 group-hover:text-blue-600"}`} aria-label="Role" title="Role" />
                {!collapsed && <span>Role</span>}
            </Link>
            <Link href={"/dashboard/permission"} onClick={handleClick} className={`group flex items-center ${collapsed ? "justify-center" : ""} px-3 py-2.5 text-sm font-medium rounded-lg ${isActive("/dashboard/permission") ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"} transition-colors duration-200 menu-item-hover`}>
                <FaKey className={`${collapsed ? "" : "mr-3"} h-5 w-5 ${isActive("/dashboard/permission") ? "text-blue-600" : "text-gray-500 group-hover:text-blue-600"}`} aria-label="Permission" title="Permission" />
                {!collapsed && <span>Permission</span>}
            </Link>

            {!collapsed && (
                <div className="pt-2 pb-1">
                    <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Website
                    </p>
                </div>
            )}

            <Link href={route("home")} onClick={handleClick} className={`group flex items-center ${collapsed ? "justify-center" : ""} px-3 py-2.5 text-sm font-medium rounded-lg ${isActive("/website") ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"} transition-colors duration-200 menu-item-hover`}>
                <FaGlobe className={`${collapsed ? "" : "mr-3"} h-5 w-5 ${isActive("/dashboard.website") ? "text-blue-600" : "text-gray-500 group-hover:text-blue-600"}`} aria-label="Website" title="Website" />
                {!collapsed && <span>Website</span>}
            </Link>
            </>

    );
}
