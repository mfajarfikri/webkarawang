import DashboardLayout from '@/Layouts/DashboardLayout';
import PageHeader from '@/Components/Dashboard/PageHeader';
import { Card, Field } from '@/Components/Dashboard/ui';
import { usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import { FaUserTag } from 'react-icons/fa';

export default function AssignRole() {
    const { user, roles, userRoles, errors, success } = usePage().props;
    const [role, setRole] = useState(userRoles[0] || "");
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        router.post(`/dashboard/user/${user.id}/role`, { role }, {
            onFinish: () => setLoading(false),
        });
    };

    return (
        <DashboardLayout title="Assign Role ke User">
            <div className="mx-auto max-w-xl space-y-6">
                <PageHeader
                    icon={FaUserTag}
                    title="Assign Role ke User"
                    description="Tentukan role yang mengatur hak akses user ini."
                />
                {success && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                        {success}
                    </div>
                )}
                <Card padded={false}>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-5 p-5 sm:p-6">
                            <div>
                                <span className="field-label">Nama User</span>
                                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-ink-900">
                                    {user.name}
                                </div>
                            </div>
                            <Field
                                label="Role"
                                htmlFor="assign-role"
                                error={errors && errors.role}
                                required
                            >
                                <select
                                    id="assign-role"
                                    className="field-input"
                                    value={role}
                                    onChange={e => setRole(e.target.value)}
                                    required
                                >
                                    <option value="">Pilih Role</option>
                                    {roles.map((r) => (
                                        <option key={r.id} value={r.name}>{r.name}</option>
                                    ))}
                                </select>
                            </Field>
                        </div>
                        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3 sm:px-6">
                            <a href="/dashboard/user" className="btn-ghost">
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
