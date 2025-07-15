import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import DeleteUserForm from "./Partials/DeleteUserForm";
import UpdatePasswordForm from "./Partials/UpdatePasswordForm";
import UpdateProfileInformationForm from "./Partials/UpdateProfileInformationForm";
import DashboardLayout from "@/Layouts/DashboardLayout";

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <DashboardLayout>
            <Head title="Profile" />
            <div className="min-h-screen w-full py-12 px-2 sm:px-0 lg:px-8 flex flex-col items-center justify-center">
                <div className="w-full space-y-12">
                    {/* Card Profile */}
                    <div className="bg-white/95 rounded-2xl border border-blue-100 shadow-xl p-8 w-full">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="border-blue-100 border-2 rounded-full p-3 flex items-center justify-center">
                                <svg
                                    width="28"
                                    height="28"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.418 0-8 2.239-8 5v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1c0-2.761-3.582-5-8-5Z"
                                        fill="#2563eb"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-blue-900 tracking-tight">
                                Profil
                            </h2>
                        </div>
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="w-full"
                        />
                    </div>
                    <div className="border-t border-blue-100 my-2 w-full" />
                    {/* Card Password */}
                    <div className="bg-white/95 rounded-2xl border border-blue-100 shadow-xl p-8 w-full">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="border-blue-100 border-2 rounded-full p-3 flex items-center justify-center">
                                <svg
                                    width="28"
                                    height="28"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        d="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm6-7V7a6 6 0 1 0-12 0v3a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2Zm-8-3a4 4 0 1 1 8 0v3H6V7Z"
                                        fill="#2563eb"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-blue-900 tracking-tight">
                                Ubah Password
                            </h2>
                        </div>
                        <UpdatePasswordForm className="w-full" />
                    </div>
                    <div className="border-t border-blue-100 my-2 w-full" />
                    {/* Card Hapus Akun */}
                    <div className="bg-white/95 rounded-2xl border border-blue-100 shadow-xl p-8 w-full">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="border-red-100 border-2 rounded-full p-3 flex items-center justify-center">
                                <svg
                                    width="28"
                                    height="28"
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
                            <h2 className="text-2xl font-bold text-red-900 tracking-tight">
                                Hapus Akun
                            </h2>
                        </div>
                        <DeleteUserForm className="w-full" />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
