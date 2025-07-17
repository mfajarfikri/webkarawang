import { Head, usePage } from "@inertiajs/react";
import DashboardLayout from "../../../Layouts/DashboardLayout";
import {
    FaUsers,
    FaPlus,
    FaFilter,
    FaUserShield,
    FaCheck
} from "react-icons/fa";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button as MuiButton,
    CircularProgress,
} from "@mui/material";
import { useState } from "react";
import { router } from "@inertiajs/react";
import React from "react";
import ErrorBoundary from "@/Components/ErrorBoundary";
import { Listbox } from "@headlessui/react";

export default function User() {
    const { users = [] } = usePage().props;
    const [roleModalOpen, setRoleModalOpen] = useState(false);
    const [roleModalUser, setRoleModalUser] = useState(null);
    const [roleModalRoles, setRoleModalRoles] = useState([]);
    const [roleModalCurrent, setRoleModalCurrent] = useState("");
    const [roleModalLoading, setRoleModalLoading] = useState(false);
    const [roleModalSaving, setRoleModalSaving] = useState(false);
    const [roleModalError, setRoleModalError] = useState("");

    const openRoleModal = async (user) => {
        setRoleModalUser(user);
        setRoleModalOpen(true);
        setRoleModalLoading(true);
        setRoleModalError("");
        try {
            const res = await fetch(`/dashboard/user/${user.id}/role?modal=1`);
            const data = await res.json();
            setRoleModalRoles(data.roles);
            setRoleModalCurrent(data.userRoles[0] || "");
        } catch (e) {
            setRoleModalRoles([]);
            setRoleModalCurrent("");
            setRoleModalError("Gagal memuat data role.");
        }
        setRoleModalLoading(false);
    };

    const handleRoleModalSave = () => {
        setRoleModalSaving(true);
        setRoleModalError("");
        router.post(
            `/dashboard/user/${roleModalUser.id}/role`,
            { role: roleModalCurrent },
            {
                onError: (errors) => {
                    setRoleModalError(errors.role || "");
                },
                onFinish: () => {
                    setRoleModalSaving(false);
                    setRoleModalOpen(false);
                },
            }
        );
    };

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [createName, setCreateName] = useState("");
    const [createEmail, setCreateEmail] = useState("");
    const [createPassword, setCreatePassword] = useState("");
    const [createRole, setCreateRole] = useState("");
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState({});
    const [allRoles, setAllRoles] = useState([]);

    const openCreateModal = async () => {
        setCreateModalOpen(true);
        setCreateName("");
        setCreateEmail("");
        setCreatePassword("");
        setCreateRole("");
        setCreateError({});
        setCreateLoading(false);
        // Fetch all roles for dropdown
        try {
            const res = await fetch("/dashboard/role?modal=1");
            const data = await res.json();
            setAllRoles(data.roles || []);
        } catch {
            setAllRoles([]);
        }
    };

    const handleCreateUser = () => {
        setCreateLoading(true);
        setCreateError({});
        router.post(
            "/dashboard/user",
            {
                name: createName,
                email: createEmail,
                password: createPassword,
                role: createRole,
            },
            {
                onError: (errors) => {
                    setCreateError(errors || {});
                },
                onFinish: () => {
                    setCreateLoading(false);
                },
                onSuccess: () => {
                    setCreateModalOpen(false);
                },
            }
        );
    };

    // Pagination state
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(8);
    const [filterOpen, setFilterOpen] = useState(false);
    const [filterName, setFilterName] = useState("");

    // Filtered rows
    const filteredRows = users.filter(
        (user) =>
            filterName.trim() === "" ||
            user.name.toLowerCase().includes(filterName.toLowerCase())
    );
    const totalRows = filteredRows.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);
    const paginatedRows = filteredRows.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );
    // Reset page if filter changes
    React.useEffect(() => {
        setPage(1);
    }, [filterName, rowsPerPage]);

    return (
        <>
            <Head title="User" />
            <DashboardLayout>
                <div className="py-6 w-full mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl shadow-xl border border-blue-100 p-0 md:p-0 overflow-hidden">
                        <div className="px-6 pt-6 pb-2 border-b border-blue-100 bg-white/80 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-blue-800 mb-1 flex items-center gap-2">
                                    <FaUsers className="text-blue-400 text-2xl" />
                                    Manajemen User
                                </h2>
                                <p className="text-blue-700/80 text-sm mb-2">
                                    Kelola data user aplikasi dengan tampilan
                                    profesional dan modern.
                                </p>
                            </div>
                            <button
                                onClick={openCreateModal}
                                className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-5 py-2 rounded-lg shadow hover:from-blue-700 hover:to-blue-500 font-semibold flex items-center gap-2 transition"
                            >
                                <FaPlus /> Tambah User
                            </button>
                        </div>
                        <div className="px-2 md:px-6 pb-6 pt-4 bg-white/70">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                                <button
                                    className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-4 py-2 rounded shadow hover:from-blue-700 hover:to-blue-500 font-semibold flex items-center gap-2"
                                    onClick={() => setFilterOpen(true)}
                                    type="button"
                                >
                                    <FaFilter />
                                    Filter
                                </button>
                                <div className="flex items-center gap-2">
                                    <label className="text-gray-600 text-sm">
                                        Tampil
                                    </label>
                                    <select
                                        className="border rounded px-2 py-1 text-sm focus:outline-none"
                                        value={rowsPerPage}
                                        onChange={(e) =>
                                            setRowsPerPage(
                                                Number(e.target.value)
                                            )
                                        }
                                    >
                                        <option value={8}>8</option>
                                        <option value={16}>16</option>
                                        <option value={32}>32</option>
                                    </select>
                                    <span className="text-gray-500 text-xs">
                                        / halaman
                                    </span>
                                </div>
                            </div>
                            <div className="overflow-x-auto rounded-xl border border-blue-100 bg-white/90 shadow-sm">
                                <ErrorBoundary>
                                    <table className="min-w-full divide-y divide-blue-100">
                                        <thead className="bg-gradient-to-r from-blue-100 to-blue-50">
                                            <tr>
                                                <th className="px-4 py-3 text-center text-xs font-bold text-blue-700 uppercase tracking-wider">
                                                    No
                                                </th>
                                                <th className="px-4 py-3 text-center text-xs font-bold text-blue-700 uppercase tracking-wider">
                                                    Foto
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
                                                    Nama
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
                                                    email
                                                </th>
                                                <th className="px-4 py-3 text-center text-xs font-bold text-blue-700 uppercase tracking-wider">
                                                    Role
                                                </th>
                                                <th className="px-4 py-3 text-center text-xs font-bold text-blue-700 uppercase tracking-wider">
                                                    Wilayah
                                                </th>
                                                <th className="px-4 py-3 text-center text-xs font-bold text-blue-700 uppercase tracking-wider">
                                                    Tanda Tangan
                                                </th>
                                                <th className="px-4 py-3 text-center text-xs font-bold text-blue-700 uppercase tracking-wider">
                                                    Aksi
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-blue-50">
                                            {paginatedRows.length === 0 ? (
                                                <tr>
                                                    <td
                                                        colSpan={8}
                                                        className="px-6 py-8 text-center text-gray-400 text-lg font-semibold"
                                                    >
                                                        Belum ada data user.
                                                    </td>
                                                </tr>
                                            ) : (
                                                paginatedRows.map(
                                                    (row, idx) => (
                                                        <tr
                                                            key={row.id}
                                                            className="hover:bg-blue-50 transition-all duration-150"
                                                        >
                                                            <td className="px-6 py-3 text-center text-blue-700 font-bold rounded-l-lg">
                                                                {(page - 1) *
                                                                    rowsPerPage +
                                                                    idx +
                                                                    1}
                                                            </td>
                                                            <td className="px-3 py-3 text-center">
                                                                {row.foto_profil ? (
                                                                    <img
                                                                        src={row.foto_profil}
                                                                        alt={row.name}
                                                                        className="h-10 w-10 rounded-full object-cover border border-blue-200 shadow-sm mx-auto"
                                                                    />
                                                                ) : (
                                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-200 to-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg border border-blue-100 shadow-sm mx-auto">
                                                                        <span>
                                                                            {row.name
                                                                                ?.split(" ")
                                                                                .map((n) => n[0])
                                                                                .join("")
                                                                                .substring(0, 2)
                                                                                .toUpperCase()}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="px-3 py-3 font-semibold text-gray-900">
                                                                <span className="truncate max-w-[120px] block">
                                                                    {row.name}
                                                                </span>
                                                            </td>
                                                            <td className="px-3 py-3 text-gray-600 text-xs">
                                                                {row.email}
                                                            </td>
                                                            <td className="px-3 py-3 text-center">
                                                                <span className="inline-block px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold shadow-sm">
                                                                    {row.role ||
                                                                        "-"}
                                                                </span>
                                                            </td>
                                                            <td className="px-3 py-3 text-center">
                                                                <span className="inline-block px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                                                                    {row.penempatan ||
                                                                        "-"}
                                                                </span>
                                                            </td>
                                                            <td className="px-3 py-3 text-center">
                                                                {row.tanda_tangan ? (
                                                                    <span className="inline-block px-2 py-1 rounded-full bg-green-100 text-green-700 font-semibold text-xs shadow-sm">
                                                                        Ada
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-block px-2 py-1 rounded-full bg-gray-100 text-gray-400 text-xs shadow-sm">
                                                                        -
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-3 py-3 text-center rounded-r-lg">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openRoleModal(row)}
                                                                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-300 text-white hover:from-blue-700 hover:via-blue-600 hover:to-blue-500 transition-all ease-in-out duration-500 text-xs font-bold shadow-lg border border-blue-200 group relative overflow-hidden"
                                                                    title="Kelola Role"
                                                                >
                                                                    <FaUserShield className="text-white text-lg drop-shadow-sm group-hover:scale-110 transition-transform duration-200" />
                                                                    <span className="ml-1 tracking-wide drop-shadow-sm">
                                                                        Kelola Role
                                                                    </span>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    )
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </ErrorBoundary>
                            </div>
                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-2">
                                    <div className="text-gray-600 text-sm">
                                        Menampilkan{" "}
                                        <span className="font-semibold">
                                            {(page - 1) * rowsPerPage + 1}
                                        </span>{" "}
                                        -{" "}
                                        <span className="font-semibold">
                                            {Math.min(
                                                page * rowsPerPage,
                                                totalRows
                                            )}
                                        </span>{" "}
                                        dari{" "}
                                        <span className="font-semibold">
                                            {totalRows}
                                        </span>{" "}
                                        data
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            className="px-3 py-1 rounded border text-gray-600 bg-white hover:bg-blue-50 disabled:opacity-50"
                                            onClick={() => setPage(page - 1)}
                                            disabled={page === 1}
                                        >
                                            &lt;
                                        </button>
                                        {[...Array(totalPages)].map(
                                            (_, idx) => (
                                                <button
                                                    key={idx}
                                                    className={`px-3 py-1 rounded border ${
                                                        page === idx + 1
                                                            ? "bg-blue-600 text-white border-blue-600"
                                                            : "bg-white text-gray-700 hover:bg-blue-50"
                                                    }`}
                                                    onClick={() =>
                                                        setPage(idx + 1)
                                                    }
                                                >
                                                    {idx + 1}
                                                </button>
                                            )
                                        )}
                                        <button
                                            className="px-3 py-1 rounded border text-gray-600 bg-white hover:bg-blue-50 disabled:opacity-50"
                                            onClick={() => setPage(page + 1)}
                                            disabled={page === totalPages}
                                        >
                                            &gt;
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {/* Filter Dialog */}
                <Dialog
                    open={filterOpen}
                    onClose={() => setFilterOpen(false)}
                    maxWidth="xs"
                    fullWidth
                >
                    <DialogTitle className="font-bold text-lg text-gray-800 border-b">
                        Filter Data
                    </DialogTitle>
                    <DialogContent className="py-4">
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-2">
                                Nama User
                            </label>
                            <input
                                type="text"
                                className="border rounded px-3 py-2 w-full"
                                value={filterName}
                                onChange={(e) => setFilterName(e.target.value)}
                                placeholder="Cari nama user..."
                            />
                        </div>
                    </DialogContent>
                    <DialogActions className="border-t px-4 py-3 flex justify-between">
                        <button
                            type="button"
                            onClick={() => {
                                setFilterName("");
                                setFilterOpen(false);
                            }}
                            className="px-4 py-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-semibold transition"
                        >
                            Reset
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterOpen(false)}
                            className="px-4 py-2 rounded bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
                        >
                            Terapkan
                        </button>
                    </DialogActions>
                </Dialog>
            </DashboardLayout>
            <Dialog
                open={roleModalOpen}
                onClose={() => setRoleModalOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    style: {
                        borderRadius: 18,
                        minHeight: 380,
                        maxHeight: 520,
                        background: "linear-gradient(135deg, #f8fafc 0%, #fff 100%)",
                        boxShadow: "0 8px 32px 0 rgba(0,0,0,0.10)",
                        padding: 0,
                    },
                }}
            >
                <DialogTitle
                    className="font-bold text-lg text-gray-800 border-b px-6 py-4"
                    style={{ background: "linear-gradient(90deg, #e0e7ff 0%, #f8fafc 100%)" }}
                >
                    Kelola Role User
                </DialogTitle>
                <DialogContent
                    className="py-6 px-6"
                    style={{
                        minHeight: 220,
                        maxHeight: 340,
                        overflowY: "auto",
                        background: "linear-gradient(135deg, #f8fafc 0%, #fff 100%)",
                    }}
                >
                    {roleModalLoading ? (
                        <div className="flex justify-center items-center h-32">
                            <CircularProgress size={32} />
                        </div>
                    ) : (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleRoleModalSave();
                            }}
                        >
                            <div className="mb-6 mt-2">
                                <div className="flex items-center gap-3 mb-5">
                                    <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold text-xl shadow">
                                        {roleModalUser?.name?.[0]?.toUpperCase() || "U"}
                                    </span>
                                    <div>
                                        <div className="text-xs text-gray-500 font-medium mb-0.5">
                                            User
                                        </div>
                                        <div className="text-base font-semibold text-gray-800 leading-tight">
                                            {roleModalUser?.name}
                                        </div>
                                    </div>
                                </div>
                                <label className="block text-gray-700 font-semibold mb-2 mt-2">
                                    Role
                                </label>
                                <div className="relative">
                                    <Listbox value={roleModalCurrent} onChange={setRoleModalCurrent}>
                                        <div className="relative">
                                            <Listbox.Button className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg px-4 py-2 w-full bg-white transition-all shadow text-gray-800 flex justify-between items-center">
                                                <span>
                                                    {roleModalCurrent
                                                        ? roleModalRoles.find((r) => r.name === roleModalCurrent)?.name
                                                        : "Pilih Role"}
                                                </span>
                                                <span className="pointer-events-none text-gray-400 ml-2">
                                                    <svg
                                                        width="20"
                                                        height="20"
                                                        fill="none"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path
                                                            d="M6 8l4 4 4-4"
                                                            stroke="currentColor"
                                                            strokeWidth="1.5"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                </span>
                                            </Listbox.Button>
                                            <Listbox.Options className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-auto focus:outline-none">
                                                <Listbox.Option
                                                    key=""
                                                    value=""
                                                    className={({ active }) =>
                                                        `cursor-pointer select-none relative px-4 py-2 ${
                                                            active ? "bg-blue-50 text-blue-700" : "text-gray-800"
                                                        }`
                                                    }
                                                >
                                                    Pilih Role
                                                </Listbox.Option>
                                                {roleModalRoles.map((r) => (
                                                    <Listbox.Option
                                                        key={r.id}
                                                        value={r.name}
                                                        className={({ active, selected }) =>
                                                            [
                                                                "cursor-pointer select-none relative px-4 py-2",
                                                                active
                                                                    ? "bg-blue-50 text-blue-700"
                                                                    : selected
                                                                    ? "bg-blue-100 text-blue-800"
                                                                    : "text-gray-800",
                                                                selected ? "font-semibold" : ""
                                                            ].join(" ")
                                                        }
                                                    >
                                                        {({ selected }) => (
                                                            <div className="flex items-center">
                                                                {selected && (
                                                                    <span className="mr-2 text-blue-600">
                                                                        <FaCheck className="h-4 w-4" aria-hidden="true" />
                                                                    </span>
                                                                )}
                                                                <span>{r.name}</span>
                                                            </div>
                                                        )}
                                                    </Listbox.Option>
                                                ))}
                                            </Listbox.Options>
                                        </div>
                                    </Listbox>
                                </div>
                                {roleModalError && (
                                    <div className="text-red-500 mt-2 text-sm">
                                        {roleModalError}
                                    </div>
                                )}
                            </div>
                        </form>
                    )}
                </DialogContent>
                <DialogActions className="border-t px-6 py-4 flex justify-between bg-slate-50">
                    <button
                        type="button"
                        onClick={() => setRoleModalOpen(false)}
                        className="px-4 py-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-semibold transition disabled:opacity-50"
                        disabled={roleModalSaving}
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={handleRoleModalSave}
                        className="px-4 py-2 rounded bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition disabled:opacity-50"
                        disabled={roleModalSaving || roleModalLoading || !roleModalCurrent}
                    >
                        {roleModalSaving ? (
                            <CircularProgress size={20} color="inherit" />
                        ) : (
                            "Simpan"
                        )}
                    </button>
                </DialogActions>
            </Dialog>
            {/* Modal Tambah User - custom slide-in from right */}
            {createModalOpen && (
                <>
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 animate-fadein"
                        onClick={() => !createLoading && setCreateModalOpen(false)}
                    />
                    {/* Panel */}
                    <div
                        className="fixed top-0 right-0 h-full w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 animate-slidein rounded-l-2xl"
                        style={{ boxShadow: '0 0 40px 0 rgba(0,0,0,0.15)' }}
                    >
                        <div className="flex items-center justify-between px-8 py-6 border-b">
                            <div className="font-bold text-2xl text-gray-800">Tambah User</div>
                            <button
                                onClick={() => !createLoading && setCreateModalOpen(false)}
                                className="text-gray-400 hover:text-blue-600 text-3xl font-bold px-2"
                                disabled={createLoading}
                                aria-label="Tutup"
                            >
                                &times;
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto px-8 py-8 bg-gradient-to-br from-slate-50 to-white">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleCreateUser();
                                }}
                            >
                                <div className="space-y-5">
                                    <div className="bg-white rounded-xl shadow p-5 flex flex-col gap-1">
                                        <label className="block text-gray-600 text-sm font-semibold mb-1">Nama</label>
                                        <input
                                            type="text"
                                            className="border border-gray-200 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition text-base"
                                            value={createName}
                                            onChange={(e) => setCreateName(e.target.value)}
                                            required
                                            placeholder="Nama lengkap user"
                                        />
                                        {createError.name && (
                                            <div className="text-red-500 mt-1 text-xs">{createError.name}</div>
                                        )}
                                    </div>
                                    <div className="bg-white rounded-xl shadow p-5 flex flex-col gap-1">
                                        <label className="block text-gray-600 text-sm font-semibold mb-1">Email</label>
                                        <input
                                            type="email"
                                            className="border border-gray-200 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition text-base"
                                            value={createEmail}
                                            onChange={(e) => setCreateEmail(e.target.value)}
                                            required
                                            placeholder="Alamat email user"
                                        />
                                        {createError.email && (
                                            <div className="text-red-500 mt-1 text-xs">{createError.email}</div>
                                        )}
                                    </div>
                                    <div className="bg-white rounded-xl shadow p-5 flex flex-col gap-1">
                                        <label className="block text-gray-600 text-sm font-semibold mb-1">Password</label>
                                        <input
                                            type="password"
                                            className="border border-gray-200 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition text-base"
                                            value={createPassword}
                                            onChange={(e) => setCreatePassword(e.target.value)}
                                            required
                                            placeholder="Password user"
                                        />
                                        {createError.password && (
                                            <div className="text-red-500 mt-1 text-xs">{createError.password}</div>
                                        )}
                                    </div>
                                    <div className="bg-white rounded-xl shadow p-5 flex flex-col gap-1">
                                        <label className="block text-gray-600 text-sm font-semibold mb-1">Role</label>
                                        {/* Headless UI Listbox for Role Selection */}
                                        <Listbox value={createRole} onChange={setCreateRole}>
                                            <div className="relative">
                                                <Listbox.Button className="border border-gray-200 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition text-base bg-white text-left">
                                                    {createRole ? allRoles.find(r => r.name === createRole)?.name : "Pilih Role"}
                                                </Listbox.Button>
                                                <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
                                                    {allRoles.map((r) => (
                                                        <Listbox.Option
                                                            key={r.id}
                                                            value={r.name}
                                                            className={({ active }) => `cursor-pointer select-none relative px-4 py-2 ${
                                                                    active ? "bg-blue-100 text-blue-900" : "text-gray-900"
                                                                }}`}>
                                                                    {({selected}) => (
                                                                        <>
                                                                            <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                                                                                {r.name}
                                                                            </span>
                                                                        {selected ? (
                                                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                                                                <FaCheck className="h-4 w-4" aria-hidden="true" />
                                                                            </span>
                                                                        ): null }
                                                                        </>
                                                                    )}
                                                        </Listbox.Option>
                                                    ))}
                                                </Listbox.Options>
                                            </div>
                                        </Listbox>
                                        {createError.role && (
                                            <div className="text-red-500 mt-1 text-xs">{createError.role}</div>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="border-t px-8 py-6 flex justify-end gap-3 bg-white rounded-b-2xl">
                            <button
                                type="button"
                                onClick={() => setCreateModalOpen(false)}
                                className="px-5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-semibold transition disabled:opacity-50"
                                disabled={createLoading}
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleCreateUser}
                                className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition disabled:opacity-50"
                                disabled={createLoading || !createName || !createEmail || !createRole}
                            >
                                {createLoading ? (
                                    <CircularProgress size={20} color="inherit" />
                                ) : (
                                    "Simpan"
                                )}
                            </button>
                        </div>
                    </div>
                    {/* Animations */}
                    <style>{`
                        @keyframes slidein {
                            from { transform: translateX(100%); }
                            to { transform: translateX(0); }
                        }
                        .animate-slidein { animation: slidein 0.3s cubic-bezier(.4,0,.2,1); }
                        @keyframes fadein {
                            from { opacity: 0; }
                            to { opacity: 1; }
                        }
                        .animate-fadein { animation: fadein 0.2s cubic-bezier(.4,0,.2,1); }
                    `}</style>
                </>
            )}
        </>
    );
}
