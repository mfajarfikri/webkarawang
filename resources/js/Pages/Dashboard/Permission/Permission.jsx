import DashboardLayout from "@/Layouts/DashboardLayout";
import { usePage } from "@inertiajs/react";

export default function Permission() {
    const { permissions } = usePage().props;

    console.log(permissions);

    return (
        <DashboardLayout title="Permission">
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Daftar Permission Sistem
                        </h1>
                        <p className="text-gray-600">
                            Berikut adalah daftar permission yang tersedia dalam
                            sistem
                        </p>
                    </div>

                    {/* Permissions Table Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                <h2 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0">
                                    Permission Sistem
                                </h2>
                                <div className="text-sm text-gray-500">
                                    Total:{" "}
                                    {permissions ? permissions.length : 0}{" "}
                                    permission
                                </div>
                            </div>
                        </div>

                        <div className="overflow-hidden">
                            {permissions && permissions.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    No
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Nama Permission
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Keterangan
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Guard Name
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {permissions.map(
                                                (permission, index) => (
                                                    <tr
                                                        key={permission.id}
                                                        className="hover:bg-gray-50 transition-colors duration-150"
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {index + 1}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {
                                                                    permission.name
                                                                }
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm text-gray-600 max-w-xs">
                                                                {permission.description ||
                                                                    "Tidak ada keterangan"}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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
                                <div className="text-center py-12">
                                    <svg
                                        className="mx-auto h-12 w-12 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                        />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                                        Belum ada permission
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Tidak ada permission yang tersedia dalam
                                        sistem.
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
