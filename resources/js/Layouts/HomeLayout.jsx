import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, usePage, router } from "@inertiajs/react";
import {
    FaSearch,
    FaPhoneAlt,
    FaEnvelope,
    FaFacebookF,
    FaTwitter,
    FaInstagram,
    FaYoutube,
    FaLock,
    FaBars,
    FaChevronDown,
    FaMapMarkerAlt,
    FaBolt,
    FaChevronRight,
    FaSignOutAlt,
} from "react-icons/fa";
import ApplicationLogo from "@/Components/ApplicationLogo";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function HomeLayout({ children }) {
    const { auth } = usePage().props;
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [berita, setBerita] = useState([]);
    const [error, setError] = useState(null);
    const beritaTerbaru = berita.slice(0, 3);

    useEffect(() => {
        const fetchBerita = async () => {
            try {
                const response = await axios.get("/api/berita");
                setBerita(response.data.berita || []);
            } catch (error) {
                setError(error);
                console.error("Error Fetching berita:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBerita();
    }, []);

    // Deteksi scroll untuk mengubah navbar
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    // Toggle dropdown menu
    const toggleDropdown = (index) => {
        if (activeDropdown === index) {
            setActiveDropdown(null);
        } else {
            setActiveDropdown(index);
        }
    };

    // Data menu navbar
    const navMenus = [
        {
            title: "Beranda",
            url: route("home"),
        },
        {
            title: "Tentang Kami",
            url: "#",
            submenu: [
                { title: "Profil Perusahaan", url: "/profil" },
                { title: "Visi & Misi", url: "/visi-misi" },
                {
                    title: "Struktur Organisasi",
                    url: route("struktur-organisasi"),
                },
                { title: "Sejarah", url: "/sejarah" },
            ],
        },
        {
            title: "Layanan",
            url: "#",
            submenu: [
                { title: "Ruang Rapat", url: route("ruangRapat") },
                { title: "Pasang Baru", url: "/pasang-baru" },
                { title: "Tambah Daya", url: "/tambah-daya" },
                {
                    title: "Penyambungan Sementara",
                    url: "/penyambungan-sementara",
                },
            ],
        },
        {
            title: "Informasi",
            url: "#",
            submenu: [
                { title: "Berita", url: "/berita" },
                { title: "Gardu Induk", url: route("gardu-induk") },
                { title: "KTT", url: "/ktt" },
                { title: "Anomali", url: "/anomali" },
            ],
        },
        {
            title: "Galeri",
            url: route("gallery"),
        },
        {
            title: "Kontak",
            url: "/kontak",
        },
    ];

    // Fungsi handle logout
    const handleLogout = () => {
        router.post(
            route("logout"),
            {},
            {
                onSuccess: () => {
                    toast.success("👋 Anda berhasil logout!", {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "colored",
                    });
                },
                onError: () => {
                    toast.error("❌ Gagal melakukan logout!", {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "colored",
                    });
                },
            }
        );
        setShowLogoutModal(false);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Main Navbar - Lebih modern dan minimalis */}
            <header
                className={`sticky top-0 z-50 transition-all duration-300 ${
                    isScrolled
                        ? "bg-white/10 backdrop-blur-xl shadow-sm"
                        : "bg-white"
                }`}
            >
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="flex justify-between items-center h-16 md:h-20">
                        {/* Logo - Lebih simpel dan modern */}
                        <div className="flex-shrink-0">
                            <Link href="/">
                                <div className="flex items-center">
                                    <ApplicationLogo className="h-8 w-8 sm:h-10 sm:w-10" />
                                    <div className="ml-2">
                                        <h1 className="text-lg sm:text-xl font-bold text-blue-900">
                                            PLN
                                        </h1>
                                        <p className="text-[8px] sm:text-[10px] text-blue-700 font-medium tracking-wide">
                                            UPT KARAWANG
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        </div>

                        {/* Desktop Navigation - Lebih bersih dan modern */}
                        <nav className="hidden lg:flex items-center space-x-1">
                            {navMenus.map((menu, index) => (
                                <div key={index} className="relative group">
                                    <Link
                                        href={menu.url}
                                        className={`px-3 xl:px-4 py-2 text-sm font-medium ${
                                            isScrolled
                                                ? "text-black"
                                                : "text-gray-700"
                                        } hover:text-blue-700 transition-colors duration-200 ${
                                            menu.submenu
                                                ? "flex items-center"
                                                : ""
                                        }`}
                                    >
                                        {menu.title}
                                        {menu.submenu && (
                                            <FaChevronDown className="ml-1 h-2.5 w-2.5 opacity-70" />
                                        )}
                                    </Link>

                                    {menu.submenu && (
                                        <div className="absolute left-0 mt-1 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform origin-top scale-95 group-hover:scale-100">
                                            <div className="py-1">
                                                {menu.submenu.map(
                                                    (submenu, subIndex) => (
                                                        <Link
                                                            key={subIndex}
                                                            href={submenu.url}
                                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-700"
                                                        >
                                                            {submenu.title}
                                                        </Link>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </nav>

                        {/* Right Side Actions - Lebih modern */}
                        <div className="flex items-center">
                            {auth?.user ? (
                                <div className="relative">
                                    <button
                                        onClick={() =>
                                            setActiveDropdown(
                                                activeDropdown === "profile"
                                                    ? null
                                                    : "profile"
                                            )
                                        }
                                        className="flex items-center gap-2 px-2 sm:px-4 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-all duration-200"
                                    >
                                        <div className="flex items-center gap-1 sm:gap-2">
                                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                <span className="text-blue-600 font-medium text-xs sm:text-sm">
                                                    {auth.user.name.charAt(0)}
                                                </span>
                                            </div>
                                            <span className="font-medium text-sm sm:text-base hidden sm:block">
                                                {auth.user.name}
                                            </span>
                                        </div>
                                        <FaChevronDown
                                            className={`h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-200 text-gray-400 ${
                                                activeDropdown === "profile"
                                                    ? "rotate-180"
                                                    : ""
                                            }`}
                                        />
                                    </button>
                                    <div
                                        className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 ${
                                            activeDropdown === "profile"
                                                ? "block"
                                                : "hidden"
                                        }`}
                                    >
                                        <Link
                                            href={route("dashboard")}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Dashboard
                                        </Link>
                                        <Link
                                            href={route("profile.edit")}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Profil
                                        </Link>
                                        <button
                                            onClick={() =>
                                                setShowLogoutModal(true)
                                            }
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    <Link
                                        href={route("login")}
                                        className="text-gray-700 hover:text-blue-600"
                                    >
                                        <button className="flex items-center justify-center gap-1 sm:gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-3 sm:px-6 py-1.5 sm:py-2.5 rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md w-full text-xs sm:text-sm">
                                            <FaLock className="text-sm sm:text-lg" />
                                            <span>Login</span>
                                        </button>
                                    </Link>
                                </div>
                            )}

                            <button
                                className="lg:hidden ml-1 p-2 rounded-full text-gray-500 hover:text-blue-600 hover:bg-gray-100 transition-colors duration-200"
                                onClick={() =>
                                    setMobileMenuOpen(!mobileMenuOpen)
                                }
                            >
                                <FaBars className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation - Lebih modern dan smooth */}
                <div
                    className={`lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300 ${
                        mobileMenuOpen
                            ? "opacity-100"
                            : "opacity-0 pointer-events-none"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                >
                    <div
                        className={`absolute right-0 top-0 h-full w-64 sm:w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out overflow-y-auto ${
                            mobileMenuOpen
                                ? "translate-x-0"
                                : "translate-x-full"
                        }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-5 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">
                                Menu
                            </h3>
                            <button
                                className="text-gray-400 hover:text-gray-500"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <svg
                                    className="h-6 w-6"
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
                        <div className="p-4 space-y-3 overflow-y-auto max-h-screen pb-20">
                            {navMenus.map((menu, index) => (
                                <div
                                    key={index}
                                    className="border-b border-gray-100 pb-2"
                                >
                                    {menu.submenu ? (
                                        <>
                                            <button
                                                className="w-full flex items-center justify-between py-2 text-gray-700 font-medium hover:text-blue-700"
                                                onClick={() =>
                                                    toggleDropdown(index)
                                                }
                                            >
                                                <span>{menu.title}</span>
                                                <FaChevronDown
                                                    className={`h-3 w-3 transition-transform duration-200 ${
                                                        activeDropdown === index
                                                            ? "transform rotate-180"
                                                            : ""
                                                    }`}
                                                />
                                            </button>

                                            <div
                                                className={`mt-1 space-y-1 pl-4 ${
                                                    activeDropdown === index
                                                        ? "block"
                                                        : "hidden"
                                                }`}
                                            >
                                                {menu.submenu.map(
                                                    (submenu, subIndex) => (
                                                        <Link
                                                            key={subIndex}
                                                            href={submenu.url}
                                                            className="block py-2 text-sm text-gray-600 hover:text-blue-700"
                                                            onClick={() =>
                                                                setMobileMenuOpen(
                                                                    false
                                                                )
                                                            }
                                                        >
                                                            {submenu.title}
                                                        </Link>
                                                    )
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <Link
                                            href={menu.url}
                                            className="block py-2 text-gray-700 font-medium hover:text-blue-700"
                                            onClick={() =>
                                                setMobileMenuOpen(false)
                                            }
                                        >
                                            {menu.title}
                                        </Link>
                                    )}
                                </div>
                            ))}

                            {/* Login button in mobile menu */}
                            {!auth?.user && (
                                <div className="pt-4">
                                    <Link
                                        href={route("login")}
                                        className="block w-full text-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Login
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow">{children}</main>

            {/* Footer - Lebih modern dan simpel */}
            <footer className="bg-gray-900 text-white">
                <div className="container mx-auto px-4 py-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <div className="flex items-center mb-3">
                                <ApplicationLogo className="h-7 w-7" />
                                <div className="ml-2">
                                    <h1 className="text-base font-bold text-white">
                                        PLN
                                    </h1>
                                    <p className="text-[8px] text-blue-300 font-medium tracking-wide">
                                        UPT KARAWANG
                                    </p>
                                </div>
                            </div>
                            <p className="text-gray-400 text-xs mb-3 leading-relaxed">
                                Menjadi Perusahaan Global Top 500 dan #1 Pilihan
                                Pelanggan untuk Solusi Energi.
                            </p>
                            <div className="flex space-x-2">
                                <a
                                    href="#"
                                    className="bg-gray-800 hover:bg-blue-600 h-6 w-6 rounded-full flex items-center justify-center transition-colors duration-200"
                                >
                                    <FaFacebookF className="h-3 w-3" />
                                </a>
                                <a
                                    href="#"
                                    className="bg-gray-800 hover:bg-blue-600 h-6 w-6 rounded-full flex items-center justify-center transition-colors duration-200"
                                >
                                    <FaTwitter className="h-3 w-3" />
                                </a>
                                <a
                                    href="https://www.instagram.com/plnuptkarawang"
                                    target="_blank"
                                    className="bg-gray-800 hover:bg-blue-600 h-6 w-6 rounded-full flex items-center justify-center transition-colors duration-200"
                                >
                                    <FaInstagram className="h-3 w-3" />
                                </a>
                                <a
                                    href="#"
                                    className="bg-gray-800 hover:bg-blue-600 h-6 w-6 rounded-full flex items-center justify-center transition-colors duration-200"
                                >
                                    <FaYoutube className="h-3 w-3" />
                                </a>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold mb-2 text-white">
                                Tautan Cepat
                            </h3>
                            <ul className="space-y-1 text-xs">
                                <li>
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-white transition-colors duration-200"
                                    >
                                        Beranda
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-white transition-colors duration-200"
                                    >
                                        Tentang Kami
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-white transition-colors duration-200"
                                    >
                                        Layanan
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-white transition-colors duration-200"
                                    >
                                        Berita
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-white transition-colors duration-200"
                                    >
                                        Kontak
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold mb-2 text-white">
                                Berita
                            </h3>
                            <ul className="space-y-1 text-xs">
                                {beritaTerbaru.map((b, index) => (
                                    <li key={b.id ? b.id : index}>
                                        <Link
                                            href={route(
                                                "berita.detail",
                                                b.slug
                                            )}
                                            className="text-gray-400 hover:text-blue-600"
                                        >
                                            {b.judul}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold mb-2 text-white">
                                Kontak Kami
                            </h3>
                            <ul className="space-y-1 text-xs">
                                <li className="flex items-start">
                                    <FaMapMarkerAlt className="h-4 w-4 mr-2 mt-0.5 text-blue-400 flex-shrink-0" />
                                    <span className="text-gray-400">
                                        Jl. Raya Kosambi Klari No.1, RT.2/RW.7,
                                        Pancawati, Karawang, Jawa Barat 41371
                                    </span>
                                </li>
                                <li className="flex items-center">
                                    <FaPhoneAlt className="h-3 w-3 mr-2 text-blue-400 flex-shrink-0" />
                                    <span className="text-gray-400">
                                        123-456-789
                                    </span>
                                </li>
                                <li className="flex items-center">
                                    <FaEnvelope className="h-3 w-3 mr-2 text-blue-400 flex-shrink-0" />
                                    <span className="text-gray-400">
                                        galleryuptkrwg@gmail.com
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 py-3">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col sm:flex-row justify-between items-center">
                            <p className="text-gray-500 text-xs">
                                &copy; {new Date().getFullYear()} PLN. Hak Cipta
                                Dilindungi.
                            </p>
                            <div className="mt-2 sm:mt-0">
                                <ul className="flex space-x-4 text-[10px]">
                                    <li>
                                        <a
                                            href="#"
                                            className="text-gray-500 hover:text-white transition-colors duration-200"
                                        >
                                            Kebijakan Privasi
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-gray-500 hover:text-white transition-colors duration-200"
                                        >
                                            Syarat & Ketentuan
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-gray-500 hover:text-white transition-colors duration-200"
                                        >
                                            Peta Situs
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

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
                                                Apakah Anda yakin ingin keluar
                                                dari sistem? Anda perlu login
                                                kembali untuk mengakses
                                                dashboard.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={() => setShowLogoutModal(false)}
                                >
                                    Batal
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Container */}
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
        </div>
    );
}
