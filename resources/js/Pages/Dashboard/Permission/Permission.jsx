import DashboardLayout from '@/Layouts/DashboardLayout';
import { usePage, router } from '@inertiajs/react'
import { useState } from 'react';

export default function Permission() {
    const { permissions, errors } = usePage().props;
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        router.post("/dashboard/permissions", { name }, {
            onFinish: () => {
                setLoading(false);
                setName("");
            },
        });
    };

    const handleDelete = (id) => {
        if (confirm("Yakin hapus permission ini?")) {
            router.delete(`/dashboard/permissions/${id}`);
        }
    };

    return (
        <DashboardLayout title="Permission">
            <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Manajemen Permission</h1>
            <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
                <input
                    type="text"
                    className="border rounded px-3 py-2 flex-1"
                    placeholder="Nama Permission"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    disabled={loading}
                >
                    Tambah
                </button>
            </form>
            {errors && errors.name && (
                <div className="text-red-500 mb-2">{errors.name}</div>
            )}
            <table className="min-w-full bg-white border rounded shadow">
                <thead>
                    <tr>
                        <th className="border px-4 py-2 text-left">Nama Permission</th>
                        <th className="border px-4 py-2">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {permissions && permissions.length > 0 ? (
                        permissions.map((permission) => (
                            <tr key={permission.id}>
                                <td className="border px-4 py-2">{permission.name}</td>
                                <td className="border px-4 py-2 text-center">
                                    <button
                                        onClick={() => handleDelete(permission.id)}
                                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                    >
                                        Hapus
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="2" className="text-center py-4 text-gray-500">
                                Tidak ada permission.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
        </DashboardLayout>
    );
}
