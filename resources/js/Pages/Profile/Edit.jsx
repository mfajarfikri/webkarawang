import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import DeleteUserForm from "./Partials/DeleteUserForm";
import UpdatePasswordForm from "./Partials/UpdatePasswordForm";
import UpdateProfileInformationForm from "./Partials/UpdateProfileInformationForm";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { FaSignature } from "react-icons/fa";
import TandaTanganForm from "./Partials/TandaTanganForm";

export default function Edit({
    mustVerifyEmail,
    status,
    foto_profil_url,
    tanda_tangan_url,
}) {
    return (
        <DashboardLayout>
            <Head title="Profile" />
            <div className="min-h-screen bg-white rounded-2xl py-10">
                <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 overflow-hidden w-full">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50/80 via-white to-gray-50/80">
                            <div className="flex items-center gap-3">
                                <div className="h-11 w-11 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100">
                                    <svg
                                        width="24"
                                        height="24"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.418 0-8 2.239-8 5v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1c0-2.761-3.582-5-8-5Z"
                                            fill="#2563eb"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-base md:text-lg font-semibold text-gray-900">
                                        Informasi Profil
                                    </h2>
                                    <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                                        Atur data profil dan informasi akun
                                        Anda.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                                fotoProfilUrl={foto_profil_url}
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 overflow-hidden w-full">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50/80 via-white to-gray-50/80">
                            <div className="flex items-center gap-3">
                                <div className="h-11 w-11 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100">
                                    <FaSignature className="text-blue-500 text-xl" />
                                </div>
                                <div>
                                    <h2 className="text-base md:text-lg font-semibold text-gray-900">
                                        Tanda Tangan Digital
                                    </h2>
                                    <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                                        Kelola tanda tangan digital untuk proses
                                        persetujuan.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="w-full max-w-5xl">
                                <TandaTanganForm
                                    existingSignatureUrl={tanda_tangan_url}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 overflow-hidden w-full">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50/80 via-white to-gray-50/80">
                            <div className="flex items-center gap-3">
                                <div className="h-11 w-11 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100">
                                    <svg
                                        width="24"
                                        height="24"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            d="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm6-7V7a6 6 0 1 0-12 0v3a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2Zm-8-3a4 4 0 1 1 8 0v3H6V7Z"
                                            fill="#2563eb"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-base md:text-lg font-semibold text-gray-900">
                                        Ubah Password
                                    </h2>
                                    <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                                        Perbarui password untuk keamanan akun
                                        Anda.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <UpdatePasswordForm className="w-full" />
                        </div>
                    </div>

                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 overflow-hidden w-full">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-red-50 via-white to-red-50">
                            <div className="flex items-center gap-3">
                                <div className="h-11 w-11 rounded-2xl bg-red-50 flex items-center justify-center border border-red-100">
                                    <svg
                                        width="24"
                                        height="24"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            d="M6 7V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1m-1 0v12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V7h10Zm-7 4v6m4-6v6"
                                            stroke="#ef4444"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-base md:text-lg font-semibold text-red-700">
                                        Hapus Akun
                                    </h2>
                                    <p className="text-xs md:text-sm text-red-500 mt-0.5">
                                        Hapus akun dan seluruh data terkait
                                        secara permanen.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <DeleteUserForm className="w-full" />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
