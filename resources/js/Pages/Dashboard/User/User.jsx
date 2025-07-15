import { Head, usePage } from "@inertiajs/react";
import DashboardLayout from "../../../Layouts/DashboardLayout";
import {
    FaUser,
    FaUsers,
    FaEnvelope,
    FaUserTie,
    FaKey,
    FaPlus,
    FaFilter,
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
                                                <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
                                                    No
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
                                                    Foto
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
                                                    Nama
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
                                                    email
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
                                                    Role
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
                                                    Penempatan
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
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
                                                            <td className=" text-center text-blue-700 font-bold rounded-l-lg">
                                                                {(page - 1) *
                                                                    rowsPerPage +
                                                                    idx +
                                                                    1}
                                                            </td>
                                                            <td className="px-3 py-3">
                                                                {row.foto_profil ? (
                                                                    <img
                                                                        src={
                                                                            row.foto_profil
                                                                        }
                                                                        alt={
                                                                            row.name
                                                                        }
                                                                        className="h-10 w-10 rounded-full object-cover border border-blue-200 shadow-sm"
                                                                    />
                                                                ) : (
                                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-200 to-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg border border-blue-100 shadow-sm">
                                                                        <span>
                                                                            {row.name
                                                                                ?.split(
                                                                                    " "
                                                                                )
                                                                                .map(
                                                                                    (
                                                                                        n
                                                                                    ) =>
                                                                                        n[0]
                                                                                )
                                                                                .join(
                                                                                    ""
                                                                                )
                                                                                .substring(
                                                                                    0,
                                                                                    2
                                                                                )
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
                                                                    onClick={() =>
                                                                        openRoleModal(
                                                                            row
                                                                        )
                                                                    }
                                                                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 text-white hover:from-blue-700 hover:to-blue-500 transition text-xs font-semibold shadow"
                                                                    title="Kelola Role"
                                                                >
                                                                    <FaKey className="text-white text-base" />
                                                                    <span>
                                                                        Role
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
                        <MuiButton
                            onClick={() => {
                                setFilterName("");
                                setFilterOpen(false);
                            }}
                            color="inherit"
                            variant="outlined"
                        >
                            Reset
                        </MuiButton>
                        <MuiButton
                            onClick={() => setFilterOpen(false)}
                            color="primary"
                            variant="contained"
                        >
                            Terapkan
                        </MuiButton>
                    </DialogActions>
                </Dialog>
            </DashboardLayout>
            <Dialog
                open={roleModalOpen}
                onClose={() => setRoleModalOpen(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle className="font-bold text-lg text-gray-800 border-b">
                    Kelola Role User
                </DialogTitle>
                <DialogContent className="py-6 bg-gradient-to-br from-slate-50 to-white">
                    {roleModalLoading ? (
                        <div className="flex justify-center items-center h-24">
                            <CircularProgress size={32} />
                        </div>
                    ) : (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleRoleModalSave();
                            }}
                        >
                            <div className="mb-6 mt-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold text-lg shadow-sm">
                                        {roleModalUser?.name?.[0]?.toUpperCase() ||
                                            "U"}
                                    </span>
                                    <div>
                                        <div className="text-xs text-gray-500 font-medium">
                                            User
                                        </div>
                                        <div className="text-base font-semibold text-gray-800">
                                            {roleModalUser?.name}
                                        </div>
                                    </div>
                                </div>
                                <label className="block text-gray-700 font-semibold mb-2 mt-2">
                                    Role
                                </label>
                                <div className="relative">
                                    <select
                                        className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg px-4 py-2 w-full bg-white transition-all shadow-sm text-gray-800"
                                        value={roleModalCurrent}
                                        onChange={(e) =>
                                            setRoleModalCurrent(e.target.value)
                                        }
                                        required
                                    >
                                        <option value="">Pilih Role</option>
                                        {roleModalRoles.map((r) => (
                                            <option key={r.id} value={r.name}>
                                                {r.name}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
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
                <DialogActions className="border-t px-4 py-3 flex justify-between">
                    <MuiButton
                        onClick={() => setRoleModalOpen(false)}
                        color="inherit"
                        variant="outlined"
                        disabled={roleModalSaving}
                    >
                        Batal
                    </MuiButton>
                    <MuiButton
                        onClick={handleRoleModalSave}
                        color="primary"
                        variant="contained"
                        disabled={
                            roleModalSaving ||
                            roleModalLoading ||
                            !roleModalCurrent
                        }
                    >
                        {roleModalSaving ? (
                            <CircularProgress size={20} color="inherit" />
                        ) : (
                            "Simpan"
                        )}
                    </MuiButton>
                </DialogActions>
            </Dialog>
            <Dialog
                open={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle className="font-bold text-lg text-gray-800 border-b">
                    Tambah User
                </DialogTitle>
                <DialogContent className="py-4">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleCreateUser();
                        }}
                    >
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-2">
                                Nama
                            </label>
                            <input
                                type="text"
                                className="border rounded px-3 py-2 w-full"
                                value={createName}
                                onChange={(e) => setCreateName(e.target.value)}
                                required
                            />
                            {createError.name && (
                                <div className="text-red-500 mt-1 text-sm">
                                    {createError.name}
                                </div>
                            )}
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                className="border rounded px-3 py-2 w-full"
                                value={createEmail}
                                onChange={(e) => setCreateEmail(e.target.value)}
                                required
                            />
                            {createError.email && (
                                <div className="text-red-500 mt-1 text-sm">
                                    {createError.email}
                                </div>
                            )}
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                className="border rounded px-3 py-2 w-full"
                                value={createPassword}
                                onChange={(e) =>
                                    setCreatePassword(e.target.value)
                                }
                                required
                            />
                            {createError.password && (
                                <div className="text-red-500 mt-1 text-sm">
                                    {createError.password}
                                </div>
                            )}
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-2">
                                Role
                            </label>
                            <select
                                className="border rounded px-3 py-2 w-full"
                                value={createRole}
                                onChange={(e) => setCreateRole(e.target.value)}
                                required
                            >
                                <option value="">Pilih Role</option>
                                {allRoles.map((r) => (
                                    <option key={r.id} value={r.name}>
                                        {r.name}
                                    </option>
                                ))}
                            </select>
                            {createError.role && (
                                <div className="text-red-500 mt-1 text-sm">
                                    {createError.role}
                                </div>
                            )}
                        </div>
                    </form>
                </DialogContent>
                <DialogActions className="border-t px-4 py-3 flex justify-between">
                    <MuiButton
                        onClick={() => setCreateModalOpen(false)}
                        color="inherit"
                        variant="outlined"
                        disabled={createLoading}
                    >
                        Batal
                    </MuiButton>
                    <MuiButton
                        onClick={handleCreateUser}
                        color="primary"
                        variant="contained"
                        disabled={
                            createLoading ||
                            !createName ||
                            !createEmail ||
                            !createPassword ||
                            !createRole
                        }
                    >
                        {createLoading ? (
                            <CircularProgress size={20} color="inherit" />
                        ) : (
                            "Simpan"
                        )}
                    </MuiButton>
                </DialogActions>
            </Dialog>
        </>
    );
}
