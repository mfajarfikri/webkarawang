import DashboardLayout from '@/Layouts/DashboardLayout';
import { usePage, router as Inertia } from '@inertiajs/react';
import { useState } from 'react';

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
            <div className="p-4 sm:p-6 md:p-8 max-w-xl mx-auto">
                <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">Edit Role</h1>
                {success && (
                    <div className="mb-4 text-green-600 bg-green-100 rounded p-2 border border-green-200">{success}</div>
                )}
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 flex flex-col gap-4">
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">Nama Role</label>
                        <input
                            type="text"
                            className="border rounded px-3 py-2 w-full"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        {errors && errors.name && (
                            <div className="text-red-500 mt-1 text-sm">{errors.name}</div>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                            disabled={loading}
                        >
                            Simpan
                        </button>
                        <a
                            href="/dashboard/role"
                            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                        >
                            Kembali
                        </a>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
} 