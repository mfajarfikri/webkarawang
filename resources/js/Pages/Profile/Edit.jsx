import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import DeleteUserForm from "./Partials/DeleteUserForm";
import UpdatePasswordForm from "./Partials/UpdatePasswordForm";
import UpdateProfileInformationForm from "./Partials/UpdateProfileInformationForm";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { FaLock, FaSignature, FaTrashAlt, FaUserCog } from "react-icons/fa";
import TandaTanganForm from "./Partials/TandaTanganForm";
import PageHeader from "@/Components/Dashboard/PageHeader";
import { Card } from "@/Components/Dashboard/ui";

export default function Edit({
    mustVerifyEmail,
    status,
    foto_profil_url,
    tanda_tangan_url,
}) {
    return (
        <DashboardLayout title="Pengaturan">
            <Head title="Profile" />
            <PageHeader
                icon={FaUserCog}
                title="Pengaturan Akun"
                description="Kelola profil, foto, tanda tangan digital, dan keamanan akun Anda."
            />

            <div className="mx-auto max-w-5xl space-y-6">
                <Card
                    icon={FaUserCog}
                    title="Informasi Profil"
                    description="Atur data profil, foto, dan informasi akun Anda."
                >
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        fotoProfilUrl={foto_profil_url}
                        className="w-full"
                    />
                </Card>

                <Card
                    icon={FaSignature}
                    title="Tanda Tangan Digital"
                    description="Kelola tanda tangan digital untuk proses persetujuan."
                >
                    <TandaTanganForm existingSignatureUrl={tanda_tangan_url} />
                </Card>

                <Card
                    icon={FaLock}
                    title="Ubah Password"
                    description="Perbarui password untuk keamanan akun Anda."
                >
                    <UpdatePasswordForm className="w-full max-w-xl" />
                </Card>

                <section className="overflow-hidden rounded-2xl border border-rose-200 bg-white shadow-soft">
                    <header className="flex items-center gap-3 border-b border-rose-100 bg-rose-50/60 px-5 py-4 sm:px-6">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                            <FaTrashAlt className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                            <h2 className="text-base font-bold text-rose-700">
                                Hapus Akun
                            </h2>
                            <p className="mt-0.5 text-sm text-rose-600/80">
                                Hapus akun dan seluruh data terkait secara
                                permanen.
                            </p>
                        </div>
                    </header>
                    <div className="p-5 sm:p-6">
                        <DeleteUserForm className="w-full" />
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
}
