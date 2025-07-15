import DashboardLayout from "@/Layouts/DashboardLayout";
import { usePage, router } from "@inertiajs/react";
import { useState } from "react";

export default function Permission() {
    const { permissions, errors } = usePage().props;
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        router.post(
            "/dashboard/permissions",
            { name },
            {
                onFinish: () => {
                    setLoading(false);
                    setName("");
                },
            }
        );
    };

    const handleDelete = (id) => {
        if (confirm("Yakin hapus permission ini?")) {
            router.delete(`/dashboard/permissions/${id}`);
        }
    };

    return (
        <DashboardLayout title="Permission">
            <div className="max-w-md mx-auto p-4">
                <h1 className="text-xl font-semibold mb-4">
                    Manajemen Permission
                </h1>
                <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
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
                    <div className="text-red-500 mb-2 text-sm">
                        {errors.name}
                    </div>
                )}
                <div className="bg-white border rounded shadow">
                    <ul>
                        {permissions && permissions.length > 0 ? (
                            permissions.map((permission) => (
                                <li
                                    key={permission.id}
                                    className="border-b px-4 py-2 last:border-b-0"
                                >
                                    {permission.name}
                                </li>
                            ))
                        ) : (
                            <li className="text-center py-4 text-gray-500">
                                Tidak ada permission.
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </DashboardLayout>
    );
}
