import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head } from "@inertiajs/react";
import {
    FaUsers,
    FaNewspaper,
    FaImages,
    FaBell,
    FaCalendarAlt,
    FaChartLine,
    FaCheckCircle,
    FaExclamationTriangle,
} from "react-icons/fa";

export default function Dashboard() {
    // Data dummy untuk statistik
    const stats = [
        {
            id: 1,
            name: "Total Karyawan",
            value: "124",
            icon: <FaUsers className="h-6 w-6 text-blue-600" />,
            change: "+5%",
            changeType: "increase",
        },
        {
            id: 2,
            name: "Berita Terbaru",
            value: "28",
            icon: <FaNewspaper className="h-6 w-6 text-indigo-600" />,
            change: "+12%",
            changeType: "increase",
        },
        {
            id: 3,
            name: "Gallery Kegiatan",
            value: "56",
            icon: <FaImages className="h-6 w-6 text-purple-600" />,
            change: "+8%",
            changeType: "increase",
        },
        {
            id: 4,
            name: "Pengumuman Aktif",
            value: "7",
            icon: <FaBell className="h-6 w-6 text-red-600" />,
            change: "-2",
            changeType: "decrease",
        },
    ];

    // Data dummy untuk aktivitas terbaru
    const recentActivities = [
        {
            id: 1,
            title: "Penambahan karyawan baru",
            date: "Hari ini, 10:30",
            user: "Admin HR",
            type: "karyawan",
        },
        {
            id: 2,
            title: "Publikasi berita: Pencapaian Q3 2023",
            date: "Kemarin, 15:45",
            user: "Tim Marketing",
            type: "berita",
        },
        {
            id: 3,
            title: "Update gallery: Kegiatan CSR",
            date: "2 hari lalu",
            user: "Tim Media",
            type: "gallery",
        },
        {
            id: 4,
            title: "Pengumuman: Jadwal Libur Akhir Tahun",
            date: "3 hari lalu",
            user: "Direktur",
            type: "pengumuman",
        },
        {
            id: 5,
            title: "Update struktur organisasi",
            date: "1 minggu lalu",
            user: "Admin HR",
            type: "struktur",
        },
    ];

    // Data dummy untuk jadwal kegiatan
    const upcomingEvents = [
        {
            id: 1,
            title: "Rapat Direksi",
            date: "Hari ini, 14:00",
            location: "Ruang Rapat Utama",
        },
        {
            id: 2,
            title: "Training Karyawan Baru",
            date: "Besok, 09:00",
            location: "Ruang Training",
        },
        {
            id: 3,
            title: "Deadline Laporan Bulanan",
            date: "25 Nov 2023",
            location: "-",
        },
        {
            id: 4,
            title: "Gathering Karyawan",
            date: "30 Nov 2023",
            location: "Aula Utama",
        },
    ];

    // Data dummy untuk pengumuman penting
    const importantAnnouncements = [
        { id: 1, title: "Jadwal Libur Akhir Tahun 2023", priority: "high" },
        { id: 2, title: "Pembaruan Kebijakan Perusahaan", priority: "medium" },
        { id: 3, title: "Informasi Bonus Akhir Tahun", priority: "high" },
    ];

    return (
        <DashboardLayout title="Dashboard">
            <Head title="Dashboard" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => (
                    <div
                        key={stat.id}
                        className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    {stat.name}
                                </p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {stat.value}
                                </p>
                            </div>
                            <div className="bg-blue-50 rounded-full p-3">
                                {stat.icon}
                            </div>
                        </div>
                        <div className="mt-4">
                            <span
                                className={`inline-flex items-center text-xs font-medium ${
                                    stat.changeType === "increase"
                                        ? "text-green-600"
                                        : "text-red-600"
                                }`}
                            >
                                {stat.changeType === "increase" ? (
                                    <svg
                                        className="w-3 h-3 mr-1"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 10l7-7m0 0l7 7m-7-7v18"
                                        />
                                    </svg>
                                ) : (
                                    <svg
                                        className="w-3 h-3 mr-1"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 14l-7 7m0 0l-7-7m7 7V3"
                                        />
                                    </svg>
                                )}
                                {stat.change} dari bulan lalu
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Aktivitas Terbaru */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h3 className="text-lg font-medium text-gray-900">
                            Aktivitas Terbaru
                        </h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {recentActivities.map((activity) => (
                            <div
                                key={activity.id}
                                className="px-6 py-4 flex items-start"
                            >
                                <div
                                    className={`flex-shrink-0 rounded-full p-2 mr-4 ${
                                        activity.type === "karyawan"
                                            ? "bg-blue-100"
                                            : activity.type === "berita"
                                            ? "bg-indigo-100"
                                            : activity.type === "gallery"
                                            ? "bg-purple-100"
                                            : activity.type === "pengumuman"
                                            ? "bg-red-100"
                                            : "bg-gray-100"
                                    }`}
                                >
                                    {activity.type === "karyawan" && (
                                        <FaUsers className="h-5 w-5 text-blue-600" />
                                    )}
                                    {activity.type === "berita" && (
                                        <FaNewspaper className="h-5 w-5 text-indigo-600" />
                                    )}
                                    {activity.type === "gallery" && (
                                        <FaImages className="h-5 w-5 text-purple-600" />
                                    )}
                                    {activity.type === "pengumuman" && (
                                        <FaBell className="h-5 w-5 text-red-600" />
                                    )}
                                    {activity.type === "struktur" && (
                                        <FaUsers className="h-5 w-5 text-green-600" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900">
                                        {activity.title}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        <span>{activity.date}</span> •{" "}
                                        <span>{activity.user}</span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="px-6 py-3 bg-gray-50 text-center">
                        <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
                            Lihat semua aktivitas
                        </button>
                    </div>
                </div>

                {/* Sidebar Kanan */}
                <div className="space-y-6">
                    {/* Jadwal Kegiatan */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">
                                Jadwal Kegiatan
                            </h3>
                            <FaCalendarAlt className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="divide-y divide-gray-200">
                            {upcomingEvents.map((event) => (
                                <div key={event.id} className="px-6 py-4">
                                    <p className="text-sm font-medium text-gray-900">
                                        {event.title}
                                    </p>
                                    <div className="flex items-center mt-1">
                                        <svg
                                            className="h-4 w-4 text-gray-400 mr-1"
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
                                        <p className="text-xs text-gray-500">
                                            {event.date}
                                        </p>
                                    </div>
                                    {event.location !== "-" && (
                                        <div className="flex items-center mt-1">
                                            <svg
                                                className="h-4 w-4 text-gray-400 mr-1"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                            </svg>
                                            <p className="text-xs text-gray-500">
                                                {event.location}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="px-6 py-3 bg-gray-50 text-center">
                            <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
                                Lihat semua jadwal
                            </button>
                        </div>
                    </div>

                    {/* Pengumuman Penting */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">
                                Pengumuman Penting
                            </h3>
                            <FaBell className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="divide-y divide-gray-200">
                            {importantAnnouncements.map((announcement) => (
                                <div
                                    key={announcement.id}
                                    className="px-6 py-4 flex items-center"
                                >
                                    {announcement.priority === "high" ? (
                                        <FaExclamationTriangle className="h-5 w-5 text-red-500 mr-3" />
                                    ) : (
                                        <FaCheckCircle className="h-5 w-5 text-green-500 mr-3" />
                                    )}
                                    <p className="text-sm font-medium text-gray-900">
                                        {announcement.title}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="px-6 py-3 bg-gray-50 text-center">
                            <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
                                Lihat semua pengumuman
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grafik Statistik */}
            <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">
                        Statistik Perusahaan
                    </h3>
                    <FaChartLine className="h-5 w-5 text-gray-500" />
                </div>
                <div className="p-6">
                    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                        <p className="text-gray-500">
                            Grafik statistik perusahaan akan ditampilkan di sini
                        </p>
                        {/* Di sini Anda bisa mengintegrasikan library chart seperti Chart.js atau ApexCharts */}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
