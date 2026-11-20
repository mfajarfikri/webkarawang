import DashboardLayout from '@/Layouts/DashboardLayout';
import PageHeader from '@/Components/Dashboard/PageHeader';
import { Card, Field } from '@/Components/Dashboard/ui';
import { usePage, router as Inertia } from '@inertiajs/react';
import { useState } from 'react';
import { FaUserShield } from 'react-icons/fa';

export default function EditRole() {
    const { role, errors, success } = usePage().props;
    const [name, setName] = useState(role.name || "");
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        Inertia.put(`/dashboard/roles/${role.id}`, { name }, {
            onFinish: () => setLoading(false),
        });
    };

    return (
        <DashboardLayout title="Edit Role">
            <div className="mx-auto max-w-xl space-y-6">
                <PageHeader
                    icon={FaUserShield}
                    title="Edit Role"
                    description="Ubah nama role yang dipakai untuk mengatur hak akses."
                />
                {success && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                        {success}
                    </div>
                )}
                <Card padded={false}>
                    <form onSubmit={handleSubmit}>
                        <div className="p-5 sm:p-6">
                            <Field
                                label="Nama Role"
                                htmlFor="edit-role-name"
                                error={errors && errors.name}
                                required
                            >
                                <input
                                    id="edit-role-name"
                                    type="text"
                                    className="field-input"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </Field>
                        </div>
                        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3 sm:px-6">
                            <a href="/dashboard/role" className="btn-ghost">
                                Kembali
                            </a>
                            <button
                                type="submit"
                                className="btn-brand"
                                disabled={loading}
                            >
                                Simpan
                            </button>
                        </div>
                    </form>
                </Card>
            </div>
        </DashboardLayout>
    );
}
