import { usePage, router as Inertia } from '@inertiajs/react';
import { useState } from 'react';

export default function AssignPermission() {
    const { role, permissions, rolePermissions, success } = usePage().props;
    const [selected, setSelected] = useState(rolePermissions || []);
    const [loading, setLoading] = useState(false);

    const handleToggle = (id) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        Inertia.post(`/dashboard/role/${role.id}/permissions`, { permissions: selected }, {
            onFinish: () => setLoading(false),
        });
    };

    return (
        <div className="flex justify-center items-center min-h-[60vh] bg-gray-50 py-8">
            <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8">
                <h1 className="text-2xl font-bold mb-2 text-gray-800">Kelola Permission</h1>
                <div className="mb-6 text-gray-500 text-sm">Role: <span className="font-semibold text-blue-700">{role.name}</span></div>
                {success && (
                    <div className="mb-4 text-green-600 bg-green-100 rounded p-2 border border-green-200 text-center">{success}</div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="mb-6 grid grid-cols-1 gap-3">
                        {permissions.map((perm) => (
                            <label key={perm.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 transition">
                                <input
                                    type="checkbox"
                                    checked={selected.includes(perm.id)}
                                    onChange={() => handleToggle(perm.id)}
                                    className="w-5 h-5 accent-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-400"
                                />
                                <span className="text-gray-800 text-base font-medium">{perm.name}</span>
                            </label>
                        ))}
                        {permissions.length === 0 && (
                            <div className="text-gray-400 text-center">Tidak ada permission.</div>
                        )}
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 