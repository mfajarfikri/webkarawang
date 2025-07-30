import { Head, usePage } from "@inertiajs/react";
import DashboardLayout from "../../../Layouts/DashboardLayout";
import {
    FaUsers,
    FaPlus,
    FaFilter,
    FaUserShield,
    FaCheck,
    FaTrash,
    FaSync,
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
import { Combobox } from "@headlessui/react";
import { useSnackbar } from "notistack";
import SecondaryButton from "@/Components/SecondaryButton";
import DangerButton from "@/Components/DangerButton";
import PrimaryButton from "@/Components/PrimaryButton";
import axios from "axios";

const JABATAN_OPTIONS = [
    "Master",
    "MULTG",
    "TL Hargi",
    "TL Harjar",
    "TL Harpro",
    "TL K3",
    "TL GI",
];
const WILAYAH_OPTIONS = ["UPT Karawang", "ULTG Karawang", "ULTG Purwakarta"];

export default function User() {
    const { enqueueSnackbar } = useSnackbar();
    const { users = [], garduInduks = [] } = usePage().props;
    const [roleModalOpen, setRoleModalOpen] = useState(false);
    const [roleModalUser, setRoleModalUser] = useState(null);
    const [roleModalRoles, setRoleModalRoles] = useState([]);
    const [roleModalJabatan, setRoleModalJabatan] = useState([]);
    const [roleModalCurrent, setRoleModalCurrent] = useState("");
    const [roleModalLoading, setRoleModalLoading] = useState(false);
    const [roleModalSaving, setRoleModalSaving] = useState(false);
    const [roleModalError, setRoleModalError] = useState("");
    const [roleModalWilayah, setRoleModalWilayah] = useState("");
    const [roleModalGarduIndukIds, setRoleModalGarduIndukIds] = useState([]);

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
            setRoleModalWilayah(user.wilayah || "");
            setRoleModalGarduIndukIds(user.gardu_induk_ids || []);
            setRoleModalJabatan(user.jabatan || "");
        } catch (e) {
            setRoleModalRoles([]);
            setRoleModalCurrent("");
            setRoleModalError("Gagal memuat data role.");
            setRoleModalWilayah("");
            setRoleModalGarduIndukIds([]);
            setRoleModalJabatan("");
            enqueueSnackbar(
                <span>
                    <b>Gagal memuat data!</b> Silakan coba lagi atau hubungi
                    administrator.
                </span>,
                {
                    variant: "error",
                    autoHideDuration: 5000,
                }
            );
        }
        setRoleModalLoading(false);
    };

    const handleRoleModalSave = async () => {
        setRoleModalSaving(true);
        setRoleModalError("");
        try {
            const axios = (await import("axios")).default;
            await axios.post(`/dashboard/user/${roleModalUser.id}/role`, {
                role: roleModalCurrent,
                wilayah: roleModalWilayah,
                gardu_induk_ids: roleModalGarduIndukIds,
                jabatan: roleModalJabatan,
            });
            setRoleModalSaving(false);
            setRoleModalOpen(false);

            enqueueSnackbar(
                <span>
                    <b>{roleModalUser.name} berhasil diubah!</b> Data telah
                    disimpan ke server.
                </span>,
                {
                    variant: "success",
                    autoHideDuration: 4000,
                }
            );
            router.reload({ only: ["users"] });
        } catch (error) {
            if (
                error.response &&
                error.response.data &&
                error.response.data.errors
            ) {
                const errors = error.response.data.errors;
                setRoleModalError(
                    errors.role?.[0] ||
                        errors.wilayah?.[0] ||
                        errors.gardu_induk_ids?.[0] ||
                        errors.jabatan?.[0] ||
                        ""
                );
            } else {
                console.error(error);
                setRoleModalError("Terjadi kesalahan saat menyimpan data.");
                enqueueSnackbar(
                    <span>
                        <b>Gagal mengubah user!</b> Silakan coba lagi atau
                        hubungi administrator.
                    </span>,
                    {
                        variant: "error",
                        autoHideDuration: 5000,
                    }
                );
            }
            setRoleModalSaving(false);
        }
    };

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [createName, setCreateName] = useState("");
    const [createEmail, setCreateEmail] = useState("");
    const [createPassword, setCreatePassword] = useState("");
    const [createRole, setCreateRole] = useState("");
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState({});
    const [allRoles, setAllRoles] = useState([]);
    const [createWilayah, setCreateWilayah] = useState("");
    const [createGarduIndukIds, setCreateGarduIndukIds] = useState([]);
    const [createJabatan, setCreateJabatan] = useState("");

    // Delete modal state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteUser, setDeleteUser] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Refresh state
    const [refreshLoading, setRefreshLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [dataLoading, setDataLoading] = useState(false);
    const [dataChangeCount, setDataChangeCount] = useState(0);

    const openCreateModal = async () => {
        setCreateModalOpen(true);
        setCreateName("");
        setCreateEmail("");
        setCreatePassword("");
        setCreateRole("");
        setCreateWilayah("");
        setCreateJabatan("");
        setCreateGarduIndukIds([]);
        setCreateError({});
        setCreateLoading(false);
        // Fetch all roles for dropdown
        try {
            const res = await fetch("/dashboard/role?modal=1");
            const data = await res.json();
            setAllRoles(data.roles || []);
        } catch {
            setAllRoles([]);
            enqueueSnackbar(
                <span>
                    <b>Gagal memuat roles!</b> Silakan coba lagi atau hubungi
                    administrator.
                </span>,
                {
                    variant: "error",
                    autoHideDuration: 5000,
                }
            );
        }
    };

    const openDeleteModal = (user) => {
        setDeleteUser(user);
        setDeleteModalOpen(true);
    };

    const handleDeleteUser = () => {
        setDeleteLoading(true);
        router.delete(`/dashboard/user/${deleteUser.id}`, {
            onSuccess: () => {
                setDeleteModalOpen(false);
                setDeleteUser(null);
                enqueueSnackbar(
                    <span>
                        <b>{deleteUser.name} berhasil dihapus!</b> Data telah
                        dihapus dari server.
                    </span>,
                    {
                        variant: "success",
                        autoHideDuration: 4000,
                    }
                );
                router.reload({ only: ["user"] });
            },
            onError: () => {
                enqueueSnackbar(
                    <span>
                        <b>Gagal menghapus user!</b> Silakan coba lagi atau
                        hubungi administrator.
                    </span>,
                    {
                        variant: "error",
                        autoHideDuration: 5000,
                    }
                );
            },
            onFinish: () => {
                setDeleteLoading(false);
            },
        });
    };

    const handleCreateUser = async () => {
        setCreateLoading(true);
        setCreateError({});
        try {
            await axios.post("/dashboard/user", {
                name: createName,
                email: createEmail,
                password: createPassword,
                role: createRole,
                wilayah: createWilayah,
                jabatan: createJabatan,
                gardu_induk_ids: createGarduIndukIds,
            });
            setCreateModalOpen(false);
            enqueueSnackbar(
                <span>
                    <b>User berhasil dibuat!</b> Data telah disimpan ke server.
                </span>,
                {
                    variant: "success",
                    autoHideDuration: 4000,
                }
            );
            router.reload({ only: ["users"] });
        } catch (error) {
            if (
                error.response &&
                error.response.data &&
                error.response.data.errors
            ) {
                setCreateError(error.response.data.errors);
            } else {
                setCreateError({});
            }
            // Tampilkan error detail jika ada, jika tidak tampilkan pesan umum
            enqueueSnackbar(
                <span>
                    <b>Gagal membuat user!</b>{" "}
                    {error.response &&
                    error.response.data &&
                    error.response.data.message
                        ? error.response.data.message
                        : "Silakan periksa data yang dimasukkan."}
                    {error.response &&
                        error.response.data &&
                        error.response.data.errors && (
                            <ul className="mt-1 ml-2 list-disc text-xs text-red-700">
                                {Object.entries(error.response.data.errors).map(
                                    ([field, messages]) =>
                                        messages.map((msg, idx) => (
                                            <li key={field + idx}>{msg}</li>
                                        ))
                                )}
                            </ul>
                        )}
                </span>,
                {
                    variant: "error",
                    autoHideDuration: 5000,
                }
            );
        } finally {
            setCreateLoading(false);
        }
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

    return (
        <>
            <Head title="User" />
            <DashboardLayout>
                <div className="w-full mx-auto">
                    <div className="rounded-lg shadow-xl border border-gray-200 p-0 md:p-0 overflow-hidden">
                        <div className="px-4 bg-white sm:px-6 pt-6 pb-4 border-b border-gray-200 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="w-full md:w-2/3">
                                <h2 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
                                    <FaUsers className="text-blue-500 text-2xl" />
                                    <span>Manajemen User</span>
                                </h2>
                                <p className="text-gray-600 text-sm mb-2">
                                    Kelola data user aplikasi dengan mudah dan
                                    efisien. Pada halaman ini, Anda dapat
                                    menambah, mengedit, menghapus, serta
                                    mengelola peran (role) dan akses setiap user
                                    yang terdaftar di dalam sistem. Pastikan
                                    data user selalu terupdate agar pengelolaan
                                    aplikasi berjalan optimal dan sesuai
                                    kebutuhan organisasi Anda.
                                </p>
                            </div>
                            <div className="w-full md:w-auto flex justify-start md:justify-end">
                                <PrimaryButton
                                    onClick={openCreateModal}
                                    className="gap-2"
                                >
                                    <FaPlus /> Tambah User
                                </PrimaryButton>
                            </div>
                        </div>
                        <div className="px-2 md:px-6 pb-6 pt-4 bg-white/70">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                                <div className="flex items-center gap-2">
                                    <button
                                        className=" bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md shadow-sm hover:bg-gray-50 font-semibold flex items-center gap-2 transition-colors"
                                        onClick={() => setFilterOpen(true)}
                                        type="button"
                                    >
                                        <FaFilter />
                                        Filter
                                    </button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-gray-600 text-sm">
                                        Tampil
                                    </label>
                                    <Listbox
                                        value={rowsPerPage}
                                        onChange={setRowsPerPage}
                                    >
                                        <div className="relative">
                                            <Listbox.Button className="border rounded px-2 py-1 text-sm focus:outline-none w-20 text-left bg-white">
                                                {rowsPerPage}
                                            </Listbox.Button>
                                            <Listbox.Options className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-auto focus:outline-none">
                                                {[8, 16, 32].map((option) => (
                                                    <Listbox.Option
                                                        key={option}
                                                        value={option}
                                                        className={({
                                                            active,
                                                            selected,
                                                        }) =>
                                                            `cursor-pointer select-none relative px-4 py-2 ${
                                                                active
                                                                    ? "bg-blue-50 text-blue-700"
                                                                    : selected
                                                                    ? "bg-gray-100 text-gray-900"
                                                                    : "text-gray-800"
                                                            }`
                                                        }
                                                    >
                                                        {({ selected }) => (
                                                            <span
                                                                className={
                                                                    selected
                                                                        ? "font-semibold"
                                                                        : "font-normal"
                                                                }
                                                            >
                                                                {option}
                                                            </span>
                                                        )}
                                                    </Listbox.Option>
                                                ))}
                                            </Listbox.Options>
                                        </div>
                                    </Listbox>
                                    <span className="text-gray-500 text-xs">
                                        / halaman
                                    </span>
                                </div>
                            </div>
                            <ErrorBoundary>
                                <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                                    {dataLoading && (
                                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                                            <div className="flex items-center gap-2 text-blue-600">
                                                <CircularProgress size={20} />
                                                <span className="text-sm font-medium">
                                                    Memperbarui data...
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    <div className="max-h-[500px] min-h-[320px] overflow-y-auto custom-scrollbar">
                                        <table className="min-w-[900px] w-full">
                                            <thead className="bg-gray-100 text-gray-600 sticky top-0 z-10">
                                                <tr>
                                                    <th className="px-3 py-3 text-center text-xs sm:text-sm font-semibold whitespace-nowrap">
                                                        No
                                                    </th>
                                                    <th className="px-3 py-3 text-center text-xs sm:text-sm font-semibold">
                                                        Foto
                                                    </th>
                                                    <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold">
                                                        Nama
                                                    </th>
                                                    <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold">
                                                        Email
                                                    </th>
                                                    <th className="px-3 py-3 text-center text-xs sm:text-sm font-semibold">
                                                        Role
                                                    </th>
                                                    <th className="px-3 py-3 text-center text-xs sm:text-sm font-semibold">
                                                        Jabatan
                                                    </th>
                                                    <th className="px-3 py-3 text-center text-xs sm:text-sm font-semibold">
                                                        Wilayah
                                                    </th>
                                                    <th className="px-3 py-3 text-center text-xs sm:text-sm font-semibold">
                                                        Gardu Induk
                                                    </th>
                                                    <th className="px-3 py-3 text-center text-xs sm:text-sm font-semibold">
                                                        Aksi
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {paginatedRows.length === 0 ? (
                                                    <tr>
                                                        <td
                                                            colSpan={9}
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
                                                                    {(page -
                                                                        1) *
                                                                        rowsPerPage +
                                                                        idx +
                                                                        1}
                                                                </td>
                                                                <td className="px-3 py-3 text-center">
                                                                    {row.foto_profil ? (
                                                                        <img
                                                                            src={
                                                                                row.foto_profil
                                                                            }
                                                                            alt={
                                                                                row.name
                                                                            }
                                                                            className="h-10 w-10 rounded-full object-cover border border-blue-200 shadow-sm mx-auto"
                                                                        />
                                                                    ) : (
                                                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-200 to-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg border border-blue-100 shadow-sm mx-auto">
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
                                                                        {
                                                                            row.name
                                                                        }
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
                                                                    {row.jabatan ? (
                                                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold shadow border border-blue-200">
                                                                            <FaUsers className="text-blue-400 text-sm" />
                                                                            <span className="tracking-wide">
                                                                                {
                                                                                    row.jabatan
                                                                                }
                                                                            </span>
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-block px-2 py-1 rounded-full bg-gray-100 text-gray-400 text-xs font-medium shadow">
                                                                            Tidak
                                                                            ada
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="px-3 py-3 text-center">
                                                                    <span className="inline-block px-2 py-1 rounded-full bg-gray-200 text-gray-700 text-xs font-medium">
                                                                        {row.wilayah ||
                                                                            "-"}
                                                                    </span>
                                                                </td>
                                                                <td className="px-3 py-3 text-center">
                                                                    {row.gardu_induks &&
                                                                    row
                                                                        .gardu_induks
                                                                        .length >
                                                                        0 ? (
                                                                        <div className="flex flex-col gap-1 items-center">
                                                                            {row.gardu_induks.map(
                                                                                (
                                                                                    gi
                                                                                ) => (
                                                                                    <div
                                                                                        key={
                                                                                            gi.id
                                                                                        }
                                                                                        className="inline-block px-2 py-1 rounded-full bg-green-100 text-green-700 font-semibold text-xs shadow-sm"
                                                                                    >
                                                                                        {
                                                                                            gi.name
                                                                                        }
                                                                                    </div>
                                                                                )
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <span className="inline-block px-2 py-1 rounded-full bg-gray-100 text-gray-400 text-xs shadow-sm">
                                                                            -
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="px-3 py-3 text-center rounded-r-lg">
                                                                    <div className="flex items-center justify-center gap-2">
                                                                        <PrimaryButton
                                                                            type="button"
                                                                            onClick={() =>
                                                                                openRoleModal(
                                                                                    row
                                                                                )
                                                                            }
                                                                            className="gap-2"
                                                                            title="Kelola Role"
                                                                        >
                                                                            <FaUserShield />
                                                                        </PrimaryButton>
                                                                        <DangerButton
                                                                            type="button"
                                                                            onClick={() =>
                                                                                openDeleteModal(
                                                                                    row
                                                                                )
                                                                            }
                                                                            className="gap-2"
                                                                            title="Hapus User"
                                                                        >
                                                                            <FaTrash />
                                                                        </DangerButton>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </ErrorBoundary>
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
                        minHeight: 600,
                        maxHeight: "90vh",
                        background:
                            "linear-gradient(135deg, #f8fafc 0%, #fff 100%)",
                        boxShadow: "0 8px 32px 0 rgba(0,0,0,0.10)",
                        padding: 0,
                    },
                }}
            >
                <DialogTitle
                    className="font-bold text-xl text-gray-800 border-b px-6 py-4"
                    style={{
                        background:
                            "linear-gradient(90deg, #e0e7ff 0%, #f8fafc 100%)",
                    }}
                >
                    <div className="flex items-center justify-between">
                        <span>Edit User</span>
                        <button
                            onClick={() => setRoleModalOpen(false)}
                            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                        >
                            ×
                        </button>
                    </div>
                </DialogTitle>
                <DialogContent
                    className="py-6 px-6"
                    style={{
                        minHeight: 600,
                        maxHeight: 800,
                        overflowY: "auto",
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
                            <div className="mb-6 pt-4">
                                {/* User Info Header */}
                                <div className="flex items-center gap-4 mb-6 p-4 bg-gray-100 rounded-xl border border-gray-200">
                                    {roleModalUser?.foto_profil ? (
                                        <img
                                            src={roleModalUser.foto_profil}
                                            alt={roleModalUser?.name}
                                            className="w-16 h-16 rounded-full object-cover border-2 border-blue-200 shadow-lg"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-200 to-blue-100 flex items-center justify-center text-blue-700 font-bold text-2xl border-2 border-blue-200 shadow-lg">
                                            {roleModalUser?.name
                                                ?.split(" ")
                                                .map((n) => n[0])
                                                .join("")
                                                .substring(0, 2)
                                                .toUpperCase() || "U"}
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-800 mb-1">
                                            {roleModalUser?.name}
                                        </h3>
                                        <p className="text-gray-600 text-sm mb-1">
                                            {roleModalUser?.email}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-200 text-red-800">
                                                {roleModalUser?.role ||
                                                    "No Role"}
                                            </span>
                                            {roleModalUser?.wilayah && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-800">
                                                    {roleModalUser.wilayah}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Role Selection */}
                                    <div className="md:col-span-2">
                                        <label className="block text-gray-700 font-semibold mb-3 text-sm">
                                            Role User
                                        </label>
                                        <div className="relative">
                                            <Listbox
                                                value={roleModalCurrent}
                                                onChange={setRoleModalCurrent}
                                            >
                                                <div className="relative">
                                                    <Listbox.Button className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg px-4 py-2 w-full bg-white transition-all shadow text-gray-800 flex justify-between items-center">
                                                        <span className="flex items-center gap-2">
                                                            <FaUserShield className="text-blue-500" />
                                                            {roleModalCurrent
                                                                ? roleModalRoles.find(
                                                                      (r) =>
                                                                          r.name ===
                                                                          roleModalCurrent
                                                                  )?.name
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
                                                            className={({
                                                                active,
                                                            }) =>
                                                                `cursor-pointer select-none relative px-4 py-2 ${
                                                                    active
                                                                        ? "bg-blue-50 text-blue-700"
                                                                        : "text-gray-800"
                                                                }`
                                                            }
                                                        >
                                                            Pilih Role
                                                        </Listbox.Option>
                                                        {roleModalRoles.map(
                                                            (r) => (
                                                                <Listbox.Option
                                                                    key={r.id}
                                                                    value={
                                                                        r.name
                                                                    }
                                                                    className={({
                                                                        active,
                                                                        selected,
                                                                    }) =>
                                                                        [
                                                                            "cursor-pointer select-none relative px-4 py-2",
                                                                            active
                                                                                ? "bg-blue-50 text-blue-700"
                                                                                : selected
                                                                                ? "bg-blue-100 text-blue-800"
                                                                                : "text-gray-800",
                                                                            selected
                                                                                ? "font-semibold"
                                                                                : "",
                                                                        ].join(
                                                                            " "
                                                                        )
                                                                    }
                                                                >
                                                                    {({
                                                                        selected,
                                                                    }) => (
                                                                        <div className="flex items-center">
                                                                            {selected && (
                                                                                <span className="mr-2 text-blue-600">
                                                                                    <FaCheck
                                                                                        className="h-4 w-4"
                                                                                        aria-hidden="true"
                                                                                    />
                                                                                </span>
                                                                            )}
                                                                            <span>
                                                                                {
                                                                                    r.name
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </Listbox.Option>
                                                            )
                                                        )}
                                                    </Listbox.Options>
                                                </div>
                                            </Listbox>
                                        </div>
                                    </div>

                                    {/* Jabatan */}
                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-3 text-sm">
                                            Jabatan
                                        </label>
                                        <div className="relative">
                                            <Listbox
                                                value={roleModalJabatan}
                                                onChange={setRoleModalJabatan}
                                            >
                                                <div className="relative">
                                                    <Listbox.Button className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg px-4 py-2 w-full bg-white transition-all shadow text-gray-800 flex justify-between items-center">
                                                        <span>
                                                            {roleModalJabatan ||
                                                                "Pilih Jabatan"}
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
                                                            className={({
                                                                active,
                                                            }) =>
                                                                `cursor-pointer select-none relative px-4 py-2 ${
                                                                    active
                                                                        ? "bg-blue-50 text-blue-700"
                                                                        : "text-gray-800"
                                                                }`
                                                            }
                                                        >
                                                            Pilih Jabatan
                                                        </Listbox.Option>
                                                        {JABATAN_OPTIONS.map(
                                                            (jabatan) => (
                                                                <Listbox.Option
                                                                    key={
                                                                        jabatan
                                                                    }
                                                                    value={
                                                                        jabatan
                                                                    }
                                                                    className={({
                                                                        active,
                                                                        selected,
                                                                    }) =>
                                                                        [
                                                                            "cursor-pointer select-none relative px-4 py-2",
                                                                            active
                                                                                ? "bg-blue-50 text-blue-700"
                                                                                : selected
                                                                                ? "bg-blue-100 text-blue-800"
                                                                                : "text-gray-800",
                                                                            selected
                                                                                ? "font-semibold"
                                                                                : "",
                                                                        ].join(
                                                                            " "
                                                                        )
                                                                    }
                                                                >
                                                                    {({
                                                                        selected,
                                                                    }) => (
                                                                        <div className="flex items-center">
                                                                            {selected && (
                                                                                <span className="mr-2 text-blue-600">
                                                                                    <FaCheck
                                                                                        className="h-4 w-4"
                                                                                        aria-hidden="true"
                                                                                    />
                                                                                </span>
                                                                            )}
                                                                            <span>
                                                                                {
                                                                                    jabatan
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </Listbox.Option>
                                                            )
                                                        )}
                                                    </Listbox.Options>
                                                </div>
                                            </Listbox>
                                        </div>
                                    </div>

                                    {/* Wilayah */}
                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-3 text-sm">
                                            Wilayah
                                        </label>
                                        <div className="relative">
                                            <Listbox
                                                value={roleModalWilayah}
                                                onChange={setRoleModalWilayah}
                                            >
                                                <div className="relative">
                                                    <Listbox.Button className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg px-4 py-2 w-full bg-white transition-all shadow text-gray-800 flex justify-between items-center">
                                                        <span>
                                                            {roleModalWilayah ||
                                                                "Pilih Wilayah"}
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
                                                            className={({
                                                                active,
                                                            }) =>
                                                                `cursor-pointer select-none relative px-4 py-2 ${
                                                                    active
                                                                        ? "bg-blue-50 text-blue-700"
                                                                        : "text-gray-800"
                                                                }`
                                                            }
                                                        >
                                                            Pilih Wilayah
                                                        </Listbox.Option>
                                                        {WILAYAH_OPTIONS.map(
                                                            (ultg) => (
                                                                <Listbox.Option
                                                                    key={ultg}
                                                                    value={ultg}
                                                                    className={({
                                                                        active,
                                                                        selected,
                                                                    }) =>
                                                                        [
                                                                            "cursor-pointer select-none relative px-4 py-2",
                                                                            active
                                                                                ? "bg-blue-50 text-blue-700"
                                                                                : selected
                                                                                ? "bg-blue-100 text-blue-800"
                                                                                : "text-gray-800",
                                                                            selected
                                                                                ? "font-semibold"
                                                                                : "",
                                                                        ].join(
                                                                            " "
                                                                        )
                                                                    }
                                                                >
                                                                    {({
                                                                        selected,
                                                                    }) => (
                                                                        <div className="flex items-center">
                                                                            {selected && (
                                                                                <span className="mr-2 text-blue-600">
                                                                                    <FaCheck
                                                                                        className="h-4 w-4"
                                                                                        aria-hidden="true"
                                                                                    />
                                                                                </span>
                                                                            )}
                                                                            <span>
                                                                                {
                                                                                    ultg
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </Listbox.Option>
                                                            )
                                                        )}
                                                    </Listbox.Options>
                                                </div>
                                            </Listbox>
                                        </div>
                                    </div>

                                    {/* Gardu Induk */}
                                    <div className="md:col-span-2">
                                        <label className="block text-gray-700 font-semibold mb-3 text-sm">
                                            Gardu Induk
                                        </label>
                                        <ComboboxMultiple
                                            className="absolute shadow-md"
                                            options={garduInduks}
                                            value={roleModalGarduIndukIds}
                                            onChange={setRoleModalGarduIndukIds}
                                        />
                                    </div>
                                </div>

                                {roleModalError && (
                                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <svg
                                                className="w-5 h-5 text-red-500"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                                                />
                                            </svg>
                                            <span className="text-red-700 text-sm font-medium">
                                                {roleModalError}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </form>
                    )}
                </DialogContent>
                <DialogActions className="border-t px-6 py-4 flex justify-between bg-slate-50">
                    <SecondaryButton
                        onClick={() => setRoleModalOpen(false)}
                        disabled={roleModalSaving}
                    >
                        Batal
                    </SecondaryButton>
                    <PrimaryButton
                        onClick={handleRoleModalSave}
                        disabled={
                            roleModalSaving ||
                            roleModalLoading ||
                            !roleModalCurrent ||
                            !roleModalJabatan
                        }
                    >
                        {roleModalSaving ? (
                            <CircularProgress size={20} color="inherit" />
                        ) : (
                            "Simpan Perubahan"
                        )}
                    </PrimaryButton>
                </DialogActions>
            </Dialog>
            {/* Modal Tambah User - custom slide-in from right */}
            {createModalOpen && (
                <>
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 animate-fadein"
                        onClick={() =>
                            !createLoading && setCreateModalOpen(false)
                        }
                    />
                    {/* Panel */}
                    <div
                        className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 animate-slidein rounded-l-2xl"
                        style={{ boxShadow: "0 0 40px 0 rgba(0,0,0,0.15)" }}
                    >
                        <div className="flex items-center justify-between px-8 py-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <FaPlus className="text-blue-600 text-lg" />
                                </div>
                                <div>
                                    <div className="font-bold text-2xl text-gray-800">
                                        Tambah User Baru
                                    </div>
                                    <div className="text-gray-600 text-sm">
                                        Isi data user yang akan ditambahkan
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() =>
                                    !createLoading && setCreateModalOpen(false)
                                }
                                className="text-gray-400 hover:text-blue-600 text-3xl font-bold px-2 transition-colors"
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
                                <div className="space-y-6">
                                    {/* Personal Information */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                                                <span className="text-blue-600 text-xs font-bold">
                                                    1
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-800">
                                                Informasi Pribadi
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                                                    Nama Lengkap
                                                </label>
                                                <input
                                                    type="text"
                                                    className="border border-gray-200 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition text-base"
                                                    value={createName}
                                                    onChange={(e) =>
                                                        setCreateName(
                                                            e.target.value
                                                        )
                                                    }
                                                    required
                                                    placeholder="Masukkan nama lengkap"
                                                />
                                                {createError.name && (
                                                    <div className="text-red-500 mt-1 text-xs">
                                                        {createError.name}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                                                    Email
                                                </label>
                                                <input
                                                    type="email"
                                                    className="border border-gray-200 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition text-base"
                                                    value={createEmail}
                                                    onChange={(e) =>
                                                        setCreateEmail(
                                                            e.target.value
                                                        )
                                                    }
                                                    required
                                                    placeholder="Masukkan alamat email"
                                                />
                                                {createError.email && (
                                                    <div className="text-red-500 mt-1 text-xs">
                                                        {createError.email}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Security Information */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                                                <span className="text-green-600 text-xs font-bold">
                                                    2
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-800">
                                                Keamanan
                                            </h3>
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 font-semibold mb-2 text-sm">
                                                Password
                                            </label>
                                            <input
                                                type="password"
                                                className="border border-gray-200 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition text-base"
                                                value={createPassword}
                                                onChange={(e) =>
                                                    setCreatePassword(
                                                        e.target.value
                                                    )
                                                }
                                                required
                                                placeholder="Masukkan password"
                                            />
                                            {createError.password && (
                                                <div className="text-red-500 mt-1 text-xs">
                                                    {createError.password}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Role and Access */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                                                <span className="text-purple-600 text-xs font-bold">
                                                    3
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-800">
                                                Role & Akses
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                                                    Role
                                                </label>
                                                <Listbox
                                                    value={createRole}
                                                    onChange={setCreateRole}
                                                >
                                                    <div className="relative">
                                                        <Listbox.Button className="border border-gray-200 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition text-base bg-white text-left flex justify-between items-center">
                                                            <span className="flex items-center gap-2">
                                                                <FaUserShield className="text-blue-500" />
                                                                {createRole
                                                                    ? allRoles.find(
                                                                          (r) =>
                                                                              r.name ===
                                                                              createRole
                                                                      )?.name
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
                                                        <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
                                                            {allRoles.map(
                                                                (r) => (
                                                                    <Listbox.Option
                                                                        key={
                                                                            r.id
                                                                        }
                                                                        value={
                                                                            r.name
                                                                        }
                                                                        className={({
                                                                            active,
                                                                        }) =>
                                                                            `cursor-pointer select-none relative px-4 py-2 ${
                                                                                active
                                                                                    ? "bg-blue-100 text-blue-900"
                                                                                    : "text-gray-900"
                                                                            }}`
                                                                        }
                                                                    >
                                                                        {({
                                                                            selected,
                                                                        }) => (
                                                                            <>
                                                                                <span
                                                                                    className={`block pl-10 truncate ${
                                                                                        selected
                                                                                            ? "font-semibold"
                                                                                            : "font-normal"
                                                                                    }`}
                                                                                >
                                                                                    {
                                                                                        r.name
                                                                                    }
                                                                                </span>
                                                                                {selected ? (
                                                                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                                                                        <FaCheck
                                                                                            className="h-4 w-4"
                                                                                            aria-hidden="true"
                                                                                        />
                                                                                    </span>
                                                                                ) : null}
                                                                            </>
                                                                        )}
                                                                    </Listbox.Option>
                                                                )
                                                            )}
                                                        </Listbox.Options>
                                                    </div>
                                                </Listbox>
                                                {createError.role && (
                                                    <div className="text-red-500 mt-1 text-xs">
                                                        {createError.role}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                                                    Jabatan
                                                </label>
                                                <Listbox
                                                    value={createJabatan}
                                                    onChange={setCreateJabatan}
                                                >
                                                    <div className="relative">
                                                        <Listbox.Button className="border border-gray-200 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition text-base bg-white text-left flex justify-between items-center">
                                                            <span>
                                                                {createJabatan ||
                                                                    "Pilih Jabatan"}
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
                                                        <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
                                                            {JABATAN_OPTIONS.map(
                                                                (jabatan) => (
                                                                    <Listbox.Option
                                                                        key={
                                                                            jabatan
                                                                        }
                                                                        value={
                                                                            jabatan
                                                                        }
                                                                        className={({
                                                                            active,
                                                                        }) =>
                                                                            `cursor-pointer select-none relative px-4 py-2 ${
                                                                                active
                                                                                    ? "bg-blue-100 text-blue-900"
                                                                                    : "text-gray-900"
                                                                            }`
                                                                        }
                                                                    >
                                                                        {
                                                                            jabatan
                                                                        }
                                                                    </Listbox.Option>
                                                                )
                                                            )}
                                                        </Listbox.Options>
                                                    </div>
                                                </Listbox>
                                                {createError.jabatan && (
                                                    <div className="text-red-500 mt-1 text-xs">
                                                        {createError.jabatan}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                                                    Wilayah
                                                </label>
                                                <Listbox
                                                    value={createWilayah}
                                                    onChange={setCreateWilayah}
                                                >
                                                    <div className="relative">
                                                        <Listbox.Button className="border border-gray-200 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition text-base bg-white text-left flex justify-between items-center">
                                                            <span>
                                                                {createWilayah ||
                                                                    "Pilih Wilayah"}
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
                                                        <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
                                                            {[
                                                                "UPT Karawang",
                                                                "ULTG Karawang",
                                                                "ULTG Purwakarta",
                                                            ].map((ultg) => (
                                                                <Listbox.Option
                                                                    key={ultg}
                                                                    value={ultg}
                                                                    className={({
                                                                        active,
                                                                    }) =>
                                                                        `cursor-pointer select-none relative px-4 py-2 ${
                                                                            active
                                                                                ? "bg-blue-100 text-blue-900"
                                                                                : "text-gray-900"
                                                                        }`
                                                                    }
                                                                >
                                                                    {ultg}
                                                                </Listbox.Option>
                                                            ))}
                                                        </Listbox.Options>
                                                    </div>
                                                </Listbox>
                                                {createError.ultg && (
                                                    <div className="text-red-500 mt-1 text-xs">
                                                        {createError.ultg}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Gardu Induk Assignment */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                                                <span className="text-orange-600 text-xs font-bold">
                                                    4
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-800">
                                                Gardu Induk
                                            </h3>
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 font-semibold mb-2 text-sm">
                                                Pilih Gardu Induk
                                            </label>
                                            <ComboboxMultiple
                                                options={garduInduks}
                                                value={createGarduIndukIds}
                                                onChange={
                                                    setCreateGarduIndukIds
                                                }
                                            />
                                            {createError.gardu_induk_ids && (
                                                <div className="text-red-500 mt-1 text-xs">
                                                    {
                                                        createError.gardu_induk_ids
                                                    }
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="border-t px-8 py-6 flex justify-end gap-3 bg-white rounded-b-2xl">
                            <SecondaryButton
                                type="button"
                                onClick={() => setCreateModalOpen(false)}
                                className="px-5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-semibold transition disabled:opacity-50"
                                disabled={createLoading}
                            >
                                Batal
                            </SecondaryButton>
                            <PrimaryButton
                                onClick={handleCreateUser}
                                disabled={
                                    createLoading ||
                                    !createName ||
                                    !createEmail ||
                                    !createRole ||
                                    !createJabatan
                                }
                            >
                                {createLoading ? (
                                    <CircularProgress
                                        size={20}
                                        color="inherit"
                                    />
                                ) : (
                                    "Buat User"
                                )}
                            </PrimaryButton>
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
            {/* Delete Confirmation Modal */}
            <Dialog
                open={deleteModalOpen}
                onClose={() => !deleteLoading && setDeleteModalOpen(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle className="font-bold text-lg text-gray-800 border-b">
                    Konfirmasi Hapus User
                </DialogTitle>
                <DialogContent className="py-6">
                    <div className="flex items-center pt-4 gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                            <FaTrash className="text-red-600 text-xl" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">
                                Hapus User
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Apakah Anda yakin ingin menghapus user ini?
                            </p>
                        </div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            {deleteUser?.foto_profil ? (
                                <img
                                    src={deleteUser.foto_profil}
                                    alt={deleteUser.name}
                                    className="h-10 w-10 rounded-full object-cover border border-red-200"
                                />
                            ) : (
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-200 to-red-100 flex items-center justify-center text-red-700 font-bold text-lg border border-red-100">
                                    <span>
                                        {deleteUser?.name
                                            ?.split(" ")
                                            .map((n) => n[0])
                                            .join("")
                                            .substring(0, 2)
                                            .toUpperCase()}
                                    </span>
                                </div>
                            )}
                            <div>
                                <div className="font-semibold text-gray-800">
                                    {deleteUser?.name}
                                </div>
                                <div className="text-sm text-gray-600">
                                    {deleteUser?.email}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start gap-2">
                            <svg
                                className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                                />
                            </svg>
                            <div className="text-sm text-yellow-700">
                                <p className="font-medium">Peringatan:</p>
                                <p className="mt-1">
                                    Tindakan ini tidak dapat dibatalkan. Semua
                                    data user akan dihapus secara permanen.
                                </p>
                            </div>
                        </div>
                    </div>
                </DialogContent>
                <DialogActions className="border-t px-6 py-4 flex justify-between bg-slate-50">
                    <SecondaryButton
                        type="button"
                        onClick={() => setDeleteModalOpen(false)}
                        disabled={deleteLoading}
                    >
                        Batal
                    </SecondaryButton>
                    <DangerButton
                        type="button"
                        onClick={handleDeleteUser}
                        disabled={deleteLoading}
                    >
                        {deleteLoading ? (
                            <CircularProgress size={20} color="inherit" />
                        ) : (
                            "Hapus User"
                        )}
                    </DangerButton>
                </DialogActions>
            </Dialog>
        </>
    );
}

function ComboboxMultiple({ options, value, onChange }) {
    const [query, setQuery] = useState("");
    const filtered =
        query === ""
            ? options
            : options.filter((o) =>
                  o.name.toLowerCase().includes(query.toLowerCase())
              );
    return (
        <Combobox value={value} onChange={onChange} multiple>
            <div className="relative">
                <div className="flex flex-wrap gap-1 mb-1">
                    {value.map((id) => {
                        const opt = options.find((o) => o.id === id);
                        return (
                            <span
                                key={id}
                                className="bg-blue-100 text-blue-700 px-2 py-1 mb-2 transition-all ease-in-out rounded text-xs font-medium"
                            >
                                {opt ? opt.name : id}
                            </span>
                        );
                    })}
                </div>
                <Combobox.Input
                    className="border shadow-md border-gray-200 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition text-base bg-white"
                    onChange={(e) => setQuery(e.target.value)}
                    displayValue={() => ""}
                    placeholder="Cari Gardu Induk..."
                />
                <Combobox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
                    {filtered.length === 0 ? (
                        <div className="px-4 py-2 text-gray-400">
                            Tidak ada data
                        </div>
                    ) : (
                        filtered.map((o) => (
                            <Combobox.Option
                                key={o.id}
                                value={o.id}
                                className={({ active, selected }) =>
                                    `cursor-pointer text-sm select-none relative px-4 py-2 ${
                                        active
                                            ? "bg-blue-100 text-blue-900"
                                            : "text-gray-900"
                                    } ${
                                        selected
                                            ? "font-semibold bg-blue-50"
                                            : ""
                                    }`
                                }
                            >
                                {({ selected }) => (
                                    <span className="flex items-center">
                                        {o.name}{" "}
                                        <span className="text-xs text-gray-400 ml-2">
                                            ({o.ultg})
                                        </span>
                                        {selected && (
                                            <span className="ml-auto flex items-center text-blue-600">
                                                <FaCheck
                                                    className="h-4 w-4"
                                                    aria-hidden="true"
                                                />
                                            </span>
                                        )}
                                    </span>
                                )}
                            </Combobox.Option>
                        ))
                    )}
                </Combobox.Options>
            </div>
        </Combobox>
    );
}
