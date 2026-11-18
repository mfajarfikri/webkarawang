import DashboardLayout from "@/Layouts/DashboardLayout";
import PageHeader, { HeaderStat } from "@/Components/Dashboard/PageHeader";
import { usePage } from "@inertiajs/react";
import { FaShieldAlt, FaKey } from "react-icons/fa";

export default function Permission() {
    const { permissions } = usePage().props;

    return (
        <DashboardLayout title="Permission">
            <div className="min-h-full">
                <div className="max-w-full">
                    <PageHeader
                        icon={FaShieldAlt}
                        title="Daftar Permission Sistem"
                        description="Kontrol akses fitur aplikasi sesuai standar keamanan PLN."
                    >
                        <HeaderStat
                            icon={FaKey}
                            value={`${permissions ? permissions.length : 0} permission`}
                            label="Terintegrasi dengan role & akses menu"
                        />
                    </PageHeader>

                    <div className="surface overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
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
