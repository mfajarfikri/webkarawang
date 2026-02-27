import DashboardLayout from "@/Layouts/DashboardLayout";
import { usePage } from "@inertiajs/react";
import { FaShieldAlt, FaKey } from "react-icons/fa";

export default function Permission() {
    const { permissions } = usePage().props;

    console.log(permissions);

    return (
        <DashboardLayout title="Permission">
            <div className="min-h-screen bg-white rounded-2xl py-10">
                <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-sky-500 via-sky-400 to-cyan-400 flex items-center justify-center text-white shadow-md">
                                <FaShieldAlt className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                    Daftar Permission Sistem
                                </h1>
                                <p className="text-sm md:text-base text-gray-600 mt-1">
                                    Kontrol akses fitur aplikasi sesuai standar
                                    keamanan PLN.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/80 backdrop-blur border border-sky-100 shadow-sm">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-50 text-sky-600">
                                    <FaKey className="w-3.5 h-3.5" />
                                </div>
                                <div className="text-xs text-gray-600">
                                    <div className="font-semibold text-gray-800">
                                        {permissions ? permissions.length : 0}{" "}
                                        permission
                                    </div>
                                    <div>
                                        Terintegrasi dengan role & akses menu
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50/80 via-white to-gray-50/80">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div>
                                    <h2 className="text-base md:text-lg font-semibold text-gray-900">
                                        Permission Sistem
                                    </h2>
                                    <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                                        Monitoring hak akses modul dan fitur
                                        aplikasi.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 border border-sky-100">
                                        Total permission:{" "}
                                        <span className="ml-1 font-semibold">
                                            {permissions
                                                ? permissions.length
                                                : 0}
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-hidden">
                            {permissions && permissions.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50/80">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                                    No
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                                    Nama Permission
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                                    Keterangan
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                                    Guard Name
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-100">
                                            {permissions.map(
                                                (permission, index) => (
                                                    <tr
                                                        key={permission.id}
                                                        className="hover:bg-sky-50/70 transition-colors"
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-500">
                                                            {index + 1}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-semibold text-gray-900">
                                                                {
                                                                    permission.name
                                                                }
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-xs md:text-sm text-gray-600 max-w-xs">
                                                                {permission.description ||
                                                                    "Tidak ada keterangan"}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200">
                                                                {permission.guard_name ||
                                                                    "web"}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="px-6 py-12 text-center">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sky-50 text-sky-500">
                                        <FaShieldAlt className="w-8 h-8" />
                                    </div>
                                    <h3 className="mt-4 text-base font-semibold text-gray-900">
                                        Belum ada permission terdaftar
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                                        Tambahkan permission melalui modul
                                        manajemen akses untuk mengatur hak user
                                        terhadap fitur aplikasi.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
