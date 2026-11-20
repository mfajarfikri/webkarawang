import { Head, usePage } from "@inertiajs/react";
import DashboardLayout from "../../../Layouts/DashboardLayout";
import PageHeader, { HeaderStat } from "@/Components/Dashboard/PageHeader";
import {
    FaUsers,
    FaPlus,
    FaFilter,
    FaUserShield,
    FaCheck,
    FaTrash,
    FaTimes,
    FaChevronLeft,
    FaChevronRight,
    FaSync,
    FaClock,
} from "react-icons/fa";
import { GiSecurityGate } from "react-icons/gi";
import { useState, Fragment, useEffect, useCallback } from "react";
import { router } from "@inertiajs/react";
import React from "react";
import ErrorBoundary from "@/Components/ErrorBoundary";
import { Badge, EmptyState } from "@/Components/Dashboard/ui";
import { Listbox, Combobox, Dialog, Transition } from "@headlessui/react";
import { useSnackbar } from "notistack";
import axios from "axios";

const BIDANG_OPTIONS = [
    "Master",
    "Renev",
    "MULTG",
    "Hargi",
    "Harjar",
    "Harpro",
    "K3",
    "GI",
];
const WILAYAH_OPTIONS = ["UPT Karawang", "ULTG Karawang", "ULTG Purwakarta"];

// Helper Spinner Component
const Spinner = ({ size = 20, color = "text-brand-600" }) => (
    <svg
        className={`animate-spin ${color}`}
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
    >
        <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
        ></circle>
        <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
    </svg>
);

// Avatar user: foto profil atau inisial nama
function UserAvatar({ row }) {
    return (
        <div className="h-10 w-10 flex-shrink-0">
            {row.foto_profil ? (
                <img
                    className="h-10 w-10 rounded-full object-cover ring-1 ring-slate-200"
                    src={row.foto_profil}
                    alt=""
                />
            ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 font-display text-sm font-bold text-slate-600 ring-1 ring-slate-200">
                    {row.name.charAt(0).toUpperCase()}
                </div>
            )}
        </div>
    );
}

// Chip kecil untuk daftar gardu induk milik user
function GiChip({ muted = false, className = "", children, ...rest }) {
    return (
        <span
            {...rest}
            className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${
                muted
                    ? "bg-slate-50 text-slate-600 ring-slate-200"
                    : "bg-emerald-50 text-emerald-700 ring-emerald-200"
            } ${className}`}
        >
            {children}
        </span>
    );
}

function ComboboxMultiple({ options, value, onChange }) {
    const [query, setQuery] = useState("");
    const filtered =
        query === ""
            ? options
            : options.filter((o) =>
                  o.name.toLowerCase().includes(query.toLowerCase()),
              );
    return (
        <Combobox value={value} onChange={onChange} multiple>
            <div className="relative">
                <div className="flex flex-wrap gap-1 mb-2">
                    {value.map((id) => {
                        const opt = options.find((o) => o.id === id);
                        return (
                            <span
                                key={id}
                                className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-800 ring-1 ring-inset ring-brand-200"
                            >
                                {opt ? opt.name : id}
                            </span>
                        );
                    })}
                </div>
                <Combobox.Input
                    className="field-input"
                    onChange={(e) => setQuery(e.target.value)}
                    displayValue={() => ""}
                    placeholder="Cari Gardu Induk..."
                />
                <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    afterLeave={() => setQuery("")}
                >
                    <Combobox.Options className="absolute z-10 mt-1.5 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 text-sm shadow-lift focus:outline-none">
                        {filtered.length === 0 && query !== "" ? (
                            <div className="relative cursor-default select-none px-4 py-2 text-slate-500">
                                Tidak ada data.
                            </div>
                        ) : (
                            filtered.map((o) => (
                                <Combobox.Option
                                    key={o.id}
                                    value={o.id}
                                    className={({ active }) =>
                                        `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                            active
                                                ? "bg-slate-50 text-ink-900"
                                                : "text-slate-700"
                                        }`
                                    }
                                >
                                    {({ selected, active }) => (
                                        <>
                                            <span
                                                className={`block truncate ${
                                                    selected
                                                        ? "font-medium"
                                                        : "font-normal"
                                                }`}
                                            >
                                                {o.name}{" "}
                                                <span className="ml-1 text-xs text-slate-500">
                                                    ({o.ultg})
                                                </span>
                                            </span>
                                            {selected ? (
                                                <span
                                                    className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                                        active
                                                            ? "text-brand-600"
                                                            : "text-brand-600"
                                                    }`}
                                                >
                                                    <FaCheck
                                                        className="h-4 w-4"
                                                        aria-hidden="true"
                                                    />
                                                </span>
                                            ) : null}
                                        </>
                                    )}
                                </Combobox.Option>
                            ))
                        )}
                    </Combobox.Options>
                </Transition>
            </div>
        </Combobox>
    );
}

export default function User() {
    const { enqueueSnackbar } = useSnackbar();
    const { users = [], garduInduks = [] } = usePage().props;
    const [roleModalOpen, setRoleModalOpen] = useState(false);
    const [roleModalUser, setRoleModalUser] = useState(null);
    const [roleModalRoles, setRoleModalRoles] = useState([]);
    const [roleModalBidang, setRoleModalBidang] = useState([]);
    const [roleModalCurrent, setRoleModalCurrent] = useState("");
    const [roleModalLoading, setRoleModalLoading] = useState(false);
    const [roleModalSaving, setRoleModalSaving] = useState(false);
    const [roleModalError, setRoleModalError] = useState("");
    const [roleModalWilayah, setRoleModalWilayah] = useState("");
    const [roleModalGarduIndukIds, setRoleModalGarduIndukIds] = useState([]);

    // Real-time sync state
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const fetchUsers = useCallback(() => {
        setIsSyncing(true);
        router.reload({
            only: ["users"],
            preserveScroll: true,
            preserveState: true,
            onFinish: () => {
                setIsSyncing(false);
                setLastUpdated(new Date());
            },
        });
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            fetchUsers();
        }, 30000); // Sinkronisasi setiap 30 detik

        return () => clearInterval(interval);
    }, [fetchUsers]);

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
            setRoleModalBidang(user.bidang || "");
        } catch (e) {
            setRoleModalRoles([]);
            setRoleModalCurrent("");
            setRoleModalError("Gagal memuat data role.");
            setRoleModalWilayah("");
            setRoleModalGarduIndukIds([]);
            setRoleModalBidang("");
            enqueueSnackbar(
                <span>
                    <b>Gagal memuat data!</b> Silakan coba lagi atau hubungi
                    administrator.
                </span>,
                {
                    variant: "error",
                    autoHideDuration: 5000,
                },
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
                bidang: roleModalBidang,
            });
            setRoleModalSaving(false);
            setRoleModalOpen(false);

            enqueueSnackbar(
                <span>
                    <b>{roleModalUser.name} berhasil diubah!</b> Data role telah
                    disimpan ke server.
                </span>,
                {
                    variant: "success",
                    autoHideDuration: 4000,
                },
            );
            fetchUsers();
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
                        errors.bidang?.[0] ||
                        "",
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
                    },
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
    const [createBidang, setCreateBidang] = useState("");

    // Delete modal state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteUser, setDeleteUser] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Refresh state
    const [dataLoading, setDataLoading] = useState(false);

    const openCreateModal = async () => {
        setCreateModalOpen(true);
        setCreateName("");
        setCreateEmail("");
        setCreatePassword("");
        setCreateRole("");
        setCreateWilayah("");
        setCreateBidang("");
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
                },
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
                    },
                );
                fetchUsers();
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
                    },
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
                bidang: createBidang,
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
                },
            );
            fetchUsers();
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
            // Tampilkan error detail jika ada
            enqueueSnackbar(
                <span>
                    <b>Gagal membuat user!</b>{" "}
                    {error.response &&
                    error.response.data &&
                    error.response.data.message
                        ? error.response.data.message
                        : "Silakan periksa data yang dimasukkan."}
                </span>,
                {
                    variant: "error",
                    autoHideDuration: 5000,
                },
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
            user.name.toLowerCase().includes(filterName.toLowerCase()),
    );
    const totalRows = filteredRows.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);
    const paginatedRows = filteredRows.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage,
    );

    return (
        <>
            <Head title="User" />
            <DashboardLayout title="Manajemen User">
                <div className="pointer-events-none fixed right-4 top-20 z-40 sm:right-8">
                    <div
                        className={`flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/95 px-3 py-1.5 shadow-lift backdrop-blur transition-all duration-500 ${
                            isSyncing
                                ? "translate-y-0 opacity-100"
                                : "-translate-y-4 opacity-0"
                        }`}
                    >
                        <div className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75"></span>
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500"></span>
                        </div>
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-700">
                            Sinkronisasi...
                        </span>
                    </div>
                </div>

                <div className="space-y-6">
                    <PageHeader
                        icon={FaUsers}
                        title="Manajemen User"
                        description="Kelola data user dan hak akses sistem."
                    >
                        <button onClick={openCreateModal} className="btn-brand">
                            <FaPlus className="h-3.5 w-3.5" />
                            <span>Tambah User</span>
                        </button>
                    </PageHeader>

                    {/* Main Card */}
                    <div className="surface overflow-hidden">
                        {/* Toolbar */}
                        <div className="flex flex-col items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:px-6">
                            <div className="flex w-full items-center gap-3 sm:w-auto">
                                <button
                                    type="button"
                                    onClick={() => setFilterOpen(true)}
                                    className={`btn-ghost btn-sm ${
                                        filterName
                                            ? "!border-brand-200 !bg-brand-50 !text-brand-800"
                                            : ""
                                    }`}
                                >
                                    <FaFilter
                                        className={`h-3 w-3 ${
                                            filterName
                                                ? "text-brand-600"
                                                : "text-slate-400"
                                        }`}
                                    />
                                    <span>Filter</span>
                                    {filterName && (
                                        <Badge tone="brand" className="ml-0.5 !px-2 !py-0">
                                            Aktif
                                        </Badge>
                                    )}
                                </button>
                                <span className="hidden items-center gap-1.5 text-xs text-slate-500 sm:inline-flex">
                                    <FaClock className="h-3 w-3 text-slate-400" />
                                    Terakhir diperbarui:{" "}
                                    <span className="font-semibold tabular-nums text-slate-700">
                                        {lastUpdated.toLocaleTimeString("id-ID")}
                                    </span>
                                </span>
                            </div>

                            <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
                                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 sm:hidden">
                                    <FaClock className="h-3 w-3 text-slate-400" />
                                    {lastUpdated.toLocaleTimeString("id-ID")}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-slate-500">
                                        Tampilkan
                                    </span>
                                    <Listbox
                                        value={rowsPerPage}
                                        onChange={setRowsPerPage}
                                    >
                                        <div className="relative">
                                            <Listbox.Button className="relative w-20 cursor-pointer rounded-full border border-slate-200 bg-white py-1.5 pl-3.5 pr-8 text-left text-sm font-semibold tabular-nums text-ink-900 transition hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40">
                                                <span className="block truncate">
                                                    {rowsPerPage}
                                                </span>
                                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                    <FaChevronRight
                                                        className="h-2.5 w-2.5 rotate-90 text-slate-400"
                                                        aria-hidden="true"
                                                    />
                                                </span>
                                            </Listbox.Button>
                                            <Transition
                                                as={Fragment}
                                                leave="transition ease-in duration-100"
                                                leaveFrom="opacity-100"
                                                leaveTo="opacity-0"
                                            >
                                                <Listbox.Options className="absolute right-0 z-20 mt-1.5 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 text-sm shadow-lift focus:outline-none">
                                                    {[8, 16, 32, 50].map(
                                                        (option) => (
                                                            <Listbox.Option
                                                                key={option}
                                                                className={({
                                                                    active,
                                                                }) =>
                                                                    `relative cursor-pointer select-none px-3.5 py-2 tabular-nums ${
                                                                        active
                                                                            ? "bg-slate-50 text-ink-900"
                                                                            : "text-slate-700"
                                                                    }`
                                                                }
                                                                value={option}
                                                            >
                                                                {({ selected }) => (
                                                                    <span
                                                                        className={`block truncate ${
                                                                            selected
                                                                                ? "font-semibold text-brand-700"
                                                                                : "font-normal"
                                                                        }`}
                                                                    >
                                                                        {option}
                                                                    </span>
                                                                )}
                                                            </Listbox.Option>
                                                        ),
                                                    )}
                                                </Listbox.Options>
                                            </Transition>
                                        </div>
                                    </Listbox>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <ErrorBoundary>
                            {/* Mobile Card View */}
                            <div className="divide-y divide-slate-100 md:hidden">
                                {paginatedRows.length === 0 ? (
                                    <EmptyState
                                        icon={FaUsers}
                                        title="Belum ada data user."
                                        description="Tambahkan user baru atau ubah filter pencarian."
                                    />
                                ) : (
                                    paginatedRows.map((row) => (
                                        <div
                                            key={row.id}
                                            className="space-y-4 p-4"
                                        >
                                            {/* User Info */}
                                            <div className="flex items-center gap-3">
                                                <UserAvatar row={row} />
                                                <div className="min-w-0">
                                                    <div className="truncate text-sm font-semibold text-ink-900">
                                                        {row.name}
                                                    </div>
                                                    <div className="truncate text-xs text-slate-500">
                                                        {row.email}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Details Grid */}
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                                                <div>
                                                    <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                                        Role
                                                    </span>
                                                    <Badge tone="brand">
                                                        {row.role || "No Role"}
                                                    </Badge>
                                                </div>
                                                <div>
                                                    <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                                        Bidang
                                                    </span>
                                                    {row.bidang ? (
                                                        <Badge tone="violet">
                                                            {row.bidang}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">
                                                            -
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="col-span-2">
                                                    <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                                        Wilayah
                                                    </span>
                                                    <Badge tone="slate">
                                                        {row.wilayah || "-"}
                                                    </Badge>
                                                </div>
                                                <div className="col-span-2">
                                                    <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                                        Gardu Induk
                                                    </span>
                                                    {row.gardu_induks?.length >
                                                    0 ? (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {row.gardu_induks
                                                                .slice(0, 5)
                                                                .map((gi) => (
                                                                    <GiChip
                                                                        key={
                                                                            gi.id
                                                                        }
                                                                    >
                                                                        {gi.name.replace(
                                                                            /^(GI|GITET|GIS|GISTET)\s+(\d+KV\s+)?/i,
                                                                            "",
                                                                        )}
                                                                    </GiChip>
                                                                ))}
                                                            {row.gardu_induks
                                                                .length > 5 && (
                                                                <GiChip muted>
                                                                    +
                                                                    {row
                                                                        .gardu_induks
                                                                        .length -
                                                                        5}
                                                                </GiChip>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">
                                                            Tidak ada GI
                                                            terhubung
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() =>
                                                        openRoleModal(row)
                                                    }
                                                    className="btn-ghost btn-sm flex-1"
                                                >
                                                    <FaUserShield className="h-3 w-3" />{" "}
                                                    Kelola Role
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        openDeleteModal(row)
                                                    }
                                                    className="btn-ghost btn-sm flex-1 !text-rose-600 hover:!border-rose-200 hover:!bg-rose-50"
                                                >
                                                    <FaTrash className="h-3 w-3" />{" "}
                                                    Hapus
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="hidden overflow-x-auto md:block">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th className="w-16 text-center">
                                                No
                                            </th>
                                            <th>User</th>
                                            <th>Role &amp; Bidang</th>
                                            <th>Wilayah</th>
                                            <th className="text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedRows.length === 0 ? (
                                            <tr>
                                                <td colSpan={5}>
                                                    <EmptyState
                                                        icon={FaUsers}
                                                        title="Belum ada data user."
                                                        description="Tambahkan user baru atau ubah filter pencarian."
                                                    />
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedRows.map((row, idx) => (
                                                <tr key={row.id}>
                                                    <td className="whitespace-nowrap text-center tabular-nums text-slate-500">
                                                        {(page - 1) *
                                                            rowsPerPage +
                                                            idx +
                                                            1}
                                                    </td>
                                                    <td className="whitespace-nowrap">
                                                        <div className="flex items-center gap-3">
                                                            <UserAvatar
                                                                row={row}
                                                            />
                                                            <div>
                                                                <div className="font-semibold text-ink-900">
                                                                    {row.name}
                                                                </div>
                                                                <div className="text-xs text-slate-500">
                                                                    {row.email}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap">
                                                        <div className="flex flex-wrap items-center gap-1.5">
                                                            <Badge tone="brand">
                                                                {row.role ||
                                                                    "No Role"}
                                                            </Badge>
                                                            {row.bidang && (
                                                                <Badge tone="violet">
                                                                    {row.bidang}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <Badge tone="slate">
                                                            {row.wilayah ||
                                                                "-"}
                                                        </Badge>
                                                        {row.gardu_induks
                                                            ?.length > 0 && (
                                                            <div className="mt-2 flex max-w-[240px] flex-wrap gap-1">
                                                                {row.gardu_induks
                                                                    .slice(0, 3)
                                                                    .map(
                                                                        (
                                                                            gi,
                                                                        ) => (
                                                                            <GiChip
                                                                                key={
                                                                                    gi.id
                                                                                }
                                                                                title={
                                                                                    gi.name
                                                                                }
                                                                            >
                                                                                {gi.name.replace(
                                                                                    /^(GI|GITET|GIS|GISTET)\s+(\d+KV\s+)?/i,
                                                                                    "",
                                                                                )}
                                                                            </GiChip>
                                                                        ),
                                                                    )}
                                                                {row
                                                                    .gardu_induks
                                                                    .length >
                                                                    3 && (
                                                                    <GiChip
                                                                        muted
                                                                        className="cursor-help"
                                                                        title={row.gardu_induks
                                                                            .slice(
                                                                                3,
                                                                            )
                                                                            .map(
                                                                                (
                                                                                    g,
                                                                                ) =>
                                                                                    g.name,
                                                                            )
                                                                            .join(
                                                                                "\n",
                                                                            )}
                                                                    >
                                                                        +
                                                                        {row
                                                                            .gardu_induks
                                                                            .length -
                                                                            3}
                                                                    </GiChip>
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="whitespace-nowrap text-right">
                                                        <div className="inline-flex items-center gap-0.5">
                                                            <button
                                                                onClick={() =>
                                                                    openRoleModal(
                                                                        row,
                                                                    )
                                                                }
                                                                className="btn-icon hover:!bg-brand-50 hover:!text-brand-700"
                                                                title="Kelola Role"
                                                                aria-label="Kelola Role"
                                                            >
                                                                <FaUserShield className="h-3.5 w-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    openDeleteModal(
                                                                        row,
                                                                    )
                                                                }
                                                                className="btn-icon hover:!bg-rose-50 hover:!text-rose-600"
                                                                title="Hapus User"
                                                                aria-label="Hapus User"
                                                            >
                                                                <FaTrash className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </ErrorBoundary>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-500 sm:flex-row sm:px-6">
                                <div>
                                    Menampilkan{" "}
                                    <span className="font-semibold tabular-nums text-ink-900">
                                        {(page - 1) * rowsPerPage + 1}–
                                        {Math.min(
                                            page * rowsPerPage,
                                            totalRows,
                                        )}
                                    </span>{" "}
                                    dari{" "}
                                    <span className="font-semibold tabular-nums text-ink-900">
                                        {totalRows}
                                    </span>{" "}
                                    hasil
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setPage(page - 1)}
                                        disabled={page === 1}
                                        aria-label="Halaman sebelumnya"
                                        className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <FaChevronLeft className="h-3 w-3" />
                                    </button>
                                    {[...Array(totalPages)].map((_, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setPage(idx + 1)}
                                            aria-current={
                                                page === idx + 1
                                                    ? "page"
                                                    : undefined
                                            }
                                            className={`flex h-8 min-w-[2rem] items-center justify-center rounded-full px-2 text-sm font-semibold tabular-nums transition ${
                                                page === idx + 1
                                                    ? "bg-ink-900 text-white"
                                                    : "text-slate-600 hover:bg-slate-100"
                                            }`}
                                        >
                                            {idx + 1}
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => setPage(page + 1)}
                                        disabled={page === totalPages}
                                        aria-label="Halaman berikutnya"
                                        className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <FaChevronRight className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Filter Dialog */}
                <Transition appear show={filterOpen} as={Fragment}>
                    <Dialog
                        as="div"
                        className="relative z-50"
                        onClose={() => setFilterOpen(false)}
                    >
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-ink-950/50 backdrop-blur-sm" />
                        </Transition.Child>

                        <div className="fixed inset-0 overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center p-4 text-center">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 scale-95"
                                    enterTo="opacity-100 scale-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100 scale-100"
                                    leaveTo="opacity-0 scale-95"
                                >
                                    <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl border border-slate-200/80 bg-white text-left align-middle shadow-lift transition-all">
                                        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                                                    <FaFilter className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <Dialog.Title className="text-base font-bold text-ink-900">
                                                        Filter Data
                                                    </Dialog.Title>
                                                    <p className="mt-0.5 text-sm text-slate-500">
                                                        Filter data user sesuai
                                                        kebutuhan.
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() =>
                                                    setFilterOpen(false)
                                                }
                                                className="btn-icon"
                                                aria-label="Tutup"
                                            >
                                                <FaTimes className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <div className="p-6">
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="field-label">
                                                        Nama User
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="field-input"
                                                        value={filterName}
                                                        onChange={(e) =>
                                                            setFilterName(
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Cari nama..."
                                                    />
                                                </div>
                                            </div>
                                            <div className="mt-6 flex justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setFilterName("");
                                                        setFilterOpen(false);
                                                    }}
                                                    className="btn-ghost"
                                                >
                                                    Reset
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setFilterOpen(false)
                                                    }
                                                    className="btn-brand"
                                                >
                                                    Terapkan
                                                </button>
                                            </div>
                                        </div>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition>

                {/* Role Modal */}
                <Transition appear show={roleModalOpen} as={Fragment}>
                    <Dialog
                        as="div"
                        className="relative z-50"
                        onClose={() => setRoleModalOpen(false)}
                    >
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-ink-950/50 backdrop-blur-sm" />
                        </Transition.Child>

                        <div className="fixed inset-0 overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center p-4 text-center">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 scale-95"
                                    enterTo="opacity-100 scale-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100 scale-100"
                                    leaveTo="opacity-0 scale-95"
                                >
                                    <Dialog.Panel className="w-full max-w-lg transform overflow-visible rounded-2xl border border-slate-200/80 bg-white text-left align-middle shadow-lift transition-all">
                                        <div className="border-b border-slate-100 px-6 py-4">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                                                        <FaUserShield className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <Dialog.Title
                                                            as="h3"
                                                            className="text-base font-bold text-ink-900"
                                                        >
                                                            Edit Role & Akses
                                                        </Dialog.Title>
                                                        <p className="mt-0.5 text-sm text-slate-500">
                                                            Kelola role dan hak
                                                            akses user.
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() =>
                                                        setRoleModalOpen(false)
                                                    }
                                                    className="btn-icon"
                                                aria-label="Tutup"
                                                >
                                                    <FaTimes />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="p-6">
                                            {roleModalLoading ? (
                                                <div className="flex justify-center items-center py-12">
                                                    <Spinner size={32} />
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    {/* User Info */}
                                                    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-lg font-bold text-slate-600 ring-1 ring-slate-200">
                                                            <img
                                                                src={
                                                                    roleModalUser?.foto_profil
                                                                }
                                                                alt={
                                                                    roleModalUser?.name
                                                                }
                                                                className="h-full w-full rounded-full object-cover"
                                                            />
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-ink-900">
                                                                {
                                                                    roleModalUser?.name
                                                                }
                                                            </div>
                                                            <div className="text-sm text-slate-500">
                                                                {
                                                                    roleModalUser?.email
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="field-label">
                                                                Role User
                                                            </label>
                                                            <Listbox
                                                                value={
                                                                    roleModalCurrent
                                                                }
                                                                onChange={
                                                                    setRoleModalCurrent
                                                                }
                                                            >
                                                                <div className="relative">
                                                                    <Listbox.Button className="field-input relative cursor-pointer pr-10 text-left">
                                                                        <span className="block truncate">
                                                                            {roleModalCurrent
                                                                                ? roleModalRoles.find(
                                                                                      (
                                                                                          r,
                                                                                      ) =>
                                                                                          r.name ===
                                                                                          roleModalCurrent,
                                                                                  )
                                                                                      ?.name
                                                                                : "Pilih Role"}
                                                                        </span>
                                                                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                                            <FaChevronRight className="h-3 w-3 rotate-90 text-slate-400" />
                                                                        </span>
                                                                    </Listbox.Button>
                                                                    <Transition
                                                                        as={
                                                                            Fragment
                                                                        }
                                                                        leave="transition ease-in duration-100"
                                                                        leaveFrom="opacity-100"
                                                                        leaveTo="opacity-0"
                                                                    >
                                                                        <Listbox.Options className="absolute z-50 mt-1.5 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 text-sm shadow-lift focus:outline-none">
                                                                            {roleModalRoles.map(
                                                                                (
                                                                                    role,
                                                                                ) => (
                                                                                    <Listbox.Option
                                                                                        key={
                                                                                            role.id
                                                                                        }
                                                                                        className={({
                                                                                            active,
                                                                                        }) =>
                                                                                            `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                                                                                active
                                                                                                    ? "bg-slate-50 text-ink-900"
                                                                                                    : "text-slate-700"
                                                                                            }`
                                                                                        }
                                                                                        value={
                                                                                            role.name
                                                                                        }
                                                                                    >
                                                                                        {({
                                                                                            selected,
                                                                                        }) => (
                                                                                            <>
                                                                                                <span
                                                                                                    className={`block truncate ${
                                                                                                        selected
                                                                                                            ? "font-medium"
                                                                                                            : "font-normal"
                                                                                                    }`}
                                                                                                >
                                                                                                    {
                                                                                                        role.name
                                                                                                    }
                                                                                                </span>
                                                                                                {selected && (
                                                                                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-brand-600">
                                                                                                        <FaCheck
                                                                                                            className="h-4 w-4"
                                                                                                            aria-hidden="true"
                                                                                                        />
                                                                                                    </span>
                                                                                                )}
                                                                                            </>
                                                                                        )}
                                                                                    </Listbox.Option>
                                                                                ),
                                                                            )}
                                                                        </Listbox.Options>
                                                                    </Transition>
                                                                </div>
                                                            </Listbox>
                                                        </div>

                                                        <div>
                                                            <label className="field-label">
                                                                Bidang
                                                            </label>
                                                            <Listbox
                                                                value={
                                                                    roleModalBidang
                                                                }
                                                                onChange={
                                                                    setRoleModalBidang
                                                                }
                                                            >
                                                                <div className="relative">
                                                                    <Listbox.Button className="field-input relative cursor-pointer pr-10 text-left">
                                                                        <span className="block truncate">
                                                                            {roleModalBidang ||
                                                                                "Pilih Bidang"}
                                                                        </span>
                                                                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                                            <FaChevronRight className="h-3 w-3 rotate-90 text-slate-400" />
                                                                        </span>
                                                                    </Listbox.Button>
                                                                    <Transition
                                                                        as={
                                                                            Fragment
                                                                        }
                                                                        leave="transition ease-in duration-100"
                                                                        leaveFrom="opacity-100"
                                                                        leaveTo="opacity-0"
                                                                    >
                                                                        <Listbox.Options className="absolute z-50 mt-1.5 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 text-sm shadow-lift focus:outline-none">
                                                                            {BIDANG_OPTIONS.map(
                                                                                (
                                                                                    bidang,
                                                                                ) => (
                                                                                    <Listbox.Option
                                                                                        key={
                                                                                            bidang
                                                                                        }
                                                                                        className={({
                                                                                            active,
                                                                                        }) =>
                                                                                            `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                                                                                active
                                                                                                    ? "bg-slate-50 text-ink-900"
                                                                                                    : "text-slate-700"
                                                                                            }`
                                                                                        }
                                                                                        value={
                                                                                            bidang
                                                                                        }
                                                                                    >
                                                                                        {({
                                                                                            selected,
                                                                                        }) => (
                                                                                            <>
                                                                                                <span
                                                                                                    className={`block truncate ${
                                                                                                        selected
                                                                                                            ? "font-medium"
                                                                                                            : "font-normal"
                                                                                                    }`}
                                                                                                >
                                                                                                    {
                                                                                                        bidang
                                                                                                    }
                                                                                                </span>
                                                                                                {selected && (
                                                                                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-brand-600">
                                                                                                        <FaCheck
                                                                                                            className="h-4 w-4"
                                                                                                            aria-hidden="true"
                                                                                                        />
                                                                                                    </span>
                                                                                                )}
                                                                                            </>
                                                                                        )}
                                                                                    </Listbox.Option>
                                                                                ),
                                                                            )}
                                                                        </Listbox.Options>
                                                                    </Transition>
                                                                </div>
                                                            </Listbox>
                                                        </div>

                                                        <div>
                                                            <label className="field-label">
                                                                Wilayah
                                                            </label>
                                                            <Listbox
                                                                value={
                                                                    roleModalWilayah
                                                                }
                                                                onChange={
                                                                    setRoleModalWilayah
                                                                }
                                                            >
                                                                <div className="relative">
                                                                    <Listbox.Button className="field-input relative cursor-pointer pr-10 text-left">
                                                                        <span className="block truncate">
                                                                            {roleModalWilayah ||
                                                                                "Pilih Wilayah"}
                                                                        </span>
                                                                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                                            <FaChevronRight className="h-3 w-3 rotate-90 text-slate-400" />
                                                                        </span>
                                                                    </Listbox.Button>
                                                                    <Transition
                                                                        as={
                                                                            Fragment
                                                                        }
                                                                        leave="transition ease-in duration-100"
                                                                        leaveFrom="opacity-100"
                                                                        leaveTo="opacity-0"
                                                                    >
                                                                        <Listbox.Options className="absolute z-50 mt-1.5 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 text-sm shadow-lift focus:outline-none">
                                                                            {WILAYAH_OPTIONS.map(
                                                                                (
                                                                                    wilayah,
                                                                                ) => (
                                                                                    <Listbox.Option
                                                                                        key={
                                                                                            wilayah
                                                                                        }
                                                                                        className={({
                                                                                            active,
                                                                                        }) =>
                                                                                            `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                                                                                active
                                                                                                    ? "bg-slate-50 text-ink-900"
                                                                                                    : "text-slate-700"
                                                                                            }`
                                                                                        }
                                                                                        value={
                                                                                            wilayah
                                                                                        }
                                                                                    >
                                                                                        {({
                                                                                            selected,
                                                                                        }) => (
                                                                                            <>
                                                                                                <span
                                                                                                    className={`block truncate ${
                                                                                                        selected
                                                                                                            ? "font-medium"
                                                                                                            : "font-normal"
                                                                                                    }`}
                                                                                                >
                                                                                                    {
                                                                                                        wilayah
                                                                                                    }
                                                                                                </span>
                                                                                                {selected && (
                                                                                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-brand-600">
                                                                                                        <FaCheck
                                                                                                            className="h-4 w-4"
                                                                                                            aria-hidden="true"
                                                                                                        />
                                                                                                    </span>
                                                                                                )}
                                                                                            </>
                                                                                        )}
                                                                                    </Listbox.Option>
                                                                                ),
                                                                            )}
                                                                        </Listbox.Options>
                                                                    </Transition>
                                                                </div>
                                                            </Listbox>
                                                        </div>

                                                        <div>
                                                            <label className="field-label">
                                                                Gardu Induk
                                                            </label>
                                                            <ComboboxMultiple
                                                                options={
                                                                    garduInduks
                                                                }
                                                                value={
                                                                    roleModalGarduIndukIds
                                                                }
                                                                onChange={
                                                                    setRoleModalGarduIndukIds
                                                                }
                                                            />
                                                        </div>
                                                    </div>

                                                    {roleModalError && (
                                                        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                                                            {roleModalError}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-3">
                                            <button
                                                type="button"
                                                className="btn-ghost"
                                                onClick={() =>
                                                    setRoleModalOpen(false)
                                                }
                                                disabled={roleModalSaving}
                                            >
                                                Batal
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-brand"
                                                onClick={handleRoleModalSave}
                                                disabled={
                                                    roleModalSaving ||
                                                    roleModalLoading
                                                }
                                            >
                                                {roleModalSaving ? (
                                                    <>
                                                        <Spinner
                                                            size={16}
                                                            color="text-white"
                                                        />
                                                        <span className="ml-2">
                                                            Menyimpan...
                                                        </span>
                                                    </>
                                                ) : (
                                                    "Simpan Perubahan"
                                                )}
                                            </button>
                                        </div>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition>

                {/* Create Modal - Slide Over */}
                <Transition appear show={createModalOpen} as={Fragment}>
                    <Dialog
                        as="div"
                        className="relative z-50"
                        onClose={() =>
                            !createLoading && setCreateModalOpen(false)
                        }
                    >
                        <Transition.Child
                            as={Fragment}
                            enter="ease-in-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in-out duration-300"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-ink-950/50 backdrop-blur-sm" />
                        </Transition.Child>

                        <div className="fixed inset-0 overflow-hidden">
                            <div className="absolute inset-0 overflow-hidden">
                                <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                                    <Transition.Child
                                        as={Fragment}
                                        enter="transform transition ease-in-out duration-300 sm:duration-300"
                                        enterFrom="translate-x-full"
                                        enterTo="translate-x-0"
                                        leave="transform transition ease-in-out duration-300 sm:duration-300"
                                        leaveFrom="translate-x-0"
                                        leaveTo="translate-x-full"
                                    >
                                        <Dialog.Panel className="pointer-events-auto w-screen max-w-2xl">
                                            <div className="flex h-full flex-col bg-white shadow-lift">
                                                <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                                                            <FaPlus className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <Dialog.Title className="text-base font-bold text-ink-900">
                                                                Tambah User Baru
                                                            </Dialog.Title>
                                                            <p className="mt-0.5 text-sm text-slate-500">
                                                                Isi form berikut
                                                                untuk
                                                                menambahkan user
                                                                baru.
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="btn-icon"
                                                aria-label="Tutup"
                                                        onClick={() =>
                                                            setCreateModalOpen(
                                                                false,
                                                            )
                                                        }
                                                        disabled={createLoading}
                                                    >
                                                        <FaTimes className="w-5 h-5" />
                                                    </button>
                                                </div>

                                                <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
                                                    <form
                                                        onSubmit={(e) => {
                                                            e.preventDefault();
                                                            handleCreateUser();
                                                        }}
                                                        className="space-y-6"
                                                    >
                                                        {/* Informasi Pribadi */}
                                                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
                                                            <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-ink-900">
                                                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink-900 text-[11px] font-bold text-white">
                                                                    1
                                                                </span>
                                                                Informasi
                                                                Pribadi
                                                            </h4>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div>
                                                                    <label className="field-label">
                                                                        Nama
                                                                        Lengkap
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        required
                                                                        className="field-input"
                                                                        value={
                                                                            createName
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setCreateName(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                        placeholder="Nama Lengkap"
                                                                    />
                                                                    {createError.name && (
                                                                        <p className="field-error">
                                                                            {
                                                                                createError.name
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <label className="field-label">
                                                                        Email
                                                                    </label>
                                                                    <input
                                                                        type="email"
                                                                        required
                                                                        className="field-input"
                                                                        value={
                                                                            createEmail
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setCreateEmail(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                        placeholder="email@example.com"
                                                                    />
                                                                    {createError.email && (
                                                                        <p className="field-error">
                                                                            {
                                                                                createError.email
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Keamanan */}
                                                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
                                                            <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-ink-900">
                                                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink-900 text-[11px] font-bold text-white">
                                                                    2
                                                                </span>
                                                                Keamanan
                                                            </h4>
                                                            <div>
                                                                <label className="field-label">
                                                                    Password
                                                                </label>
                                                                <input
                                                                    type="password"
                                                                    required
                                                                    className="field-input"
                                                                    value={
                                                                        createPassword
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setCreatePassword(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    placeholder="••••••••"
                                                                />
                                                                {createError.password && (
                                                                    <p className="field-error">
                                                                        {
                                                                            createError.password
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Role & Akses */}
                                                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
                                                            <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-ink-900">
                                                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink-900 text-[11px] font-bold text-white">
                                                                    3
                                                                </span>
                                                                Role & Akses
                                                            </h4>
                                                            <div className="grid grid-cols-1 gap-4">
                                                                <div>
                                                                    <label className="field-label">
                                                                        Role
                                                                    </label>
                                                                    <Listbox
                                                                        value={
                                                                            createRole
                                                                        }
                                                                        onChange={
                                                                            setCreateRole
                                                                        }
                                                                    >
                                                                        <div className="relative">
                                                                            <Listbox.Button className="field-input relative cursor-pointer pr-10 text-left">
                                                                                <span className="block truncate">
                                                                                    {createRole
                                                                                        ? allRoles.find(
                                                                                              (
                                                                                                  r,
                                                                                              ) =>
                                                                                                  r.name ===
                                                                                                  createRole,
                                                                                          )
                                                                                              ?.name
                                                                                        : "Pilih Role"}
                                                                                </span>
                                                                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                                                    <FaChevronRight className="h-3 w-3 rotate-90 text-slate-400" />
                                                                                </span>
                                                                            </Listbox.Button>
                                                                            <Transition
                                                                                as={
                                                                                    Fragment
                                                                                }
                                                                                leave="transition ease-in duration-100"
                                                                                leaveFrom="opacity-100"
                                                                                leaveTo="opacity-0"
                                                                            >
                                                                                <Listbox.Options className="absolute z-10 mt-1.5 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 text-sm shadow-lift focus:outline-none">
                                                                                    {allRoles.map(
                                                                                        (
                                                                                            role,
                                                                                        ) => (
                                                                                            <Listbox.Option
                                                                                                key={
                                                                                                    role.id
                                                                                                }
                                                                                                className={({
                                                                                                    active,
                                                                                                }) =>
                                                                                                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                                                                                        active
                                                                                                            ? "bg-slate-50 text-ink-900"
                                                                                                            : "text-slate-700"
                                                                                                    }`
                                                                                                }
                                                                                                value={
                                                                                                    role.name
                                                                                                }
                                                                                            >
                                                                                                {({
                                                                                                    selected,
                                                                                                }) => (
                                                                                                    <>
                                                                                                        <span
                                                                                                            className={`block truncate ${
                                                                                                                selected
                                                                                                                    ? "font-medium"
                                                                                                                    : "font-normal"
                                                                                                            }`}
                                                                                                        >
                                                                                                            {
                                                                                                                role.name
                                                                                                            }
                                                                                                        </span>
                                                                                                        {selected && (
                                                                                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-brand-600">
                                                                                                                <FaCheck
                                                                                                                    className="h-4 w-4"
                                                                                                                    aria-hidden="true"
                                                                                                                />
                                                                                                            </span>
                                                                                                        )}
                                                                                                    </>
                                                                                                )}
                                                                                            </Listbox.Option>
                                                                                        ),
                                                                                    )}
                                                                                </Listbox.Options>
                                                                            </Transition>
                                                                        </div>
                                                                    </Listbox>
                                                                    {createError.role && (
                                                                        <p className="field-error">
                                                                            {
                                                                                createError.role
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>

                                                                <div>
                                                                    <label className="field-label">
                                                                        Bidang
                                                                    </label>
                                                                    <Listbox
                                                                        value={
                                                                            createBidang
                                                                        }
                                                                        onChange={
                                                                            setCreateBidang
                                                                        }
                                                                    >
                                                                        <div className="relative">
                                                                            <Listbox.Button className="field-input relative cursor-pointer pr-10 text-left">
                                                                                <span className="block truncate">
                                                                                    {createBidang ||
                                                                                        "Pilih Bidang"}
                                                                                </span>
                                                                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                                                    <FaChevronRight className="h-3 w-3 rotate-90 text-slate-400" />
                                                                                </span>
                                                                            </Listbox.Button>
                                                                            <Transition
                                                                                as={
                                                                                    Fragment
                                                                                }
                                                                                leave="transition ease-in duration-100"
                                                                                leaveFrom="opacity-100"
                                                                                leaveTo="opacity-0"
                                                                            >
                                                                                <Listbox.Options className="absolute z-10 mt-1.5 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 text-sm shadow-lift focus:outline-none">
                                                                                    {BIDANG_OPTIONS.map(
                                                                                        (
                                                                                            bidang,
                                                                                        ) => (
                                                                                            <Listbox.Option
                                                                                                key={
                                                                                                    bidang
                                                                                                }
                                                                                                className={({
                                                                                                    active,
                                                                                                }) =>
                                                                                                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                                                                                        active
                                                                                                            ? "bg-slate-50 text-ink-900"
                                                                                                            : "text-slate-700"
                                                                                                    }`
                                                                                                }
                                                                                                value={
                                                                                                    bidang
                                                                                                }
                                                                                            >
                                                                                                {({
                                                                                                    selected,
                                                                                                }) => (
                                                                                                    <>
                                                                                                        <span
                                                                                                            className={`block truncate ${
                                                                                                                selected
                                                                                                                    ? "font-medium"
                                                                                                                    : "font-normal"
                                                                                                            }`}
                                                                                                        >
                                                                                                            {
                                                                                                                bidang
                                                                                                            }
                                                                                                        </span>
                                                                                                        {selected && (
                                                                                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-brand-600">
                                                                                                                <FaCheck
                                                                                                                    className="h-5 w-5"
                                                                                                                    aria-hidden="true"
                                                                                                                />
                                                                                                            </span>
                                                                                                        )}
                                                                                                    </>
                                                                                                )}
                                                                                            </Listbox.Option>
                                                                                        ),
                                                                                    )}
                                                                                </Listbox.Options>
                                                                            </Transition>
                                                                        </div>
                                                                    </Listbox>
                                                                    {createError.bidang && (
                                                                        <p className="field-error">
                                                                            {
                                                                                createError.bidang
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>

                                                                <div>
                                                                    <label className="field-label">
                                                                        Wilayah
                                                                    </label>
                                                                    <Listbox
                                                                        value={
                                                                            createWilayah
                                                                        }
                                                                        onChange={
                                                                            setCreateWilayah
                                                                        }
                                                                    >
                                                                        <div className="relative">
                                                                            <Listbox.Button className="field-input relative cursor-pointer pr-10 text-left">
                                                                                <span className="block truncate">
                                                                                    {createWilayah ||
                                                                                        "Pilih Wilayah"}
                                                                                </span>
                                                                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                                                    <FaChevronRight className="h-3 w-3 rotate-90 text-slate-400" />
                                                                                </span>
                                                                            </Listbox.Button>
                                                                            <Transition
                                                                                as={
                                                                                    Fragment
                                                                                }
                                                                                leave="transition ease-in duration-100"
                                                                                leaveFrom="opacity-100"
                                                                                leaveTo="opacity-0"
                                                                            >
                                                                                <Listbox.Options className="absolute z-10 mt-1.5 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 text-sm shadow-lift focus:outline-none">
                                                                                    {WILAYAH_OPTIONS.map(
                                                                                        (
                                                                                            wilayah,
                                                                                        ) => (
                                                                                            <Listbox.Option
                                                                                                key={
                                                                                                    wilayah
                                                                                                }
                                                                                                className={({
                                                                                                    active,
                                                                                                }) =>
                                                                                                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                                                                                        active
                                                                                                            ? "bg-slate-50 text-ink-900"
                                                                                                            : "text-slate-700"
                                                                                                    }`
                                                                                                }
                                                                                                value={
                                                                                                    wilayah
                                                                                                }
                                                                                            >
                                                                                                {({
                                                                                                    selected,
                                                                                                }) => (
                                                                                                    <>
                                                                                                        <span
                                                                                                            className={`block truncate ${
                                                                                                                selected
                                                                                                                    ? "font-medium"
                                                                                                                    : "font-normal"
                                                                                                            }`}
                                                                                                        >
                                                                                                            {
                                                                                                                wilayah
                                                                                                            }
                                                                                                        </span>
                                                                                                        {selected && (
                                                                                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-brand-600">
                                                                                                                <FaCheck
                                                                                                                    className="h-5 w-5"
                                                                                                                    aria-hidden="true"
                                                                                                                />
                                                                                                            </span>
                                                                                                        )}
                                                                                                    </>
                                                                                                )}
                                                                                            </Listbox.Option>
                                                                                        ),
                                                                                    )}
                                                                                </Listbox.Options>
                                                                            </Transition>
                                                                        </div>
                                                                    </Listbox>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Gardu Induk */}
                                                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
                                                            <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-ink-900">
                                                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink-900 text-[11px] font-bold text-white">
                                                                    4
                                                                </span>
                                                                Gardu Induk
                                                            </h4>
                                                            <div>
                                                                <label className="field-label">
                                                                    Pilih Gardu
                                                                    Induk
                                                                </label>
                                                                <ComboboxMultiple
                                                                    options={
                                                                        garduInduks
                                                                    }
                                                                    value={
                                                                        createGarduIndukIds
                                                                    }
                                                                    onChange={
                                                                        setCreateGarduIndukIds
                                                                    }
                                                                />
                                                            </div>
                                                        </div>
                                                    </form>
                                                </div>

                                                <div className="flex justify-end gap-2 border-t border-slate-100 bg-white px-6 py-3">
                                                    <button
                                                        type="button"
                                                        className="btn-ghost"
                                                        onClick={() =>
                                                            setCreateModalOpen(
                                                                false,
                                                            )
                                                        }
                                                        disabled={createLoading}
                                                    >
                                                        Batal
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn-brand"
                                                        onClick={
                                                            handleCreateUser
                                                        }
                                                        disabled={createLoading}
                                                    >
                                                        {createLoading ? (
                                                            <>
                                                                <Spinner
                                                                    size={16}
                                                                    color="text-white"
                                                                />
                                                                <span className="ml-2">
                                                                    Memproses...
                                                                </span>
                                                            </>
                                                        ) : (
                                                            "Buat User"
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </Dialog.Panel>
                                    </Transition.Child>
                                </div>
                            </div>
                        </div>
                    </Dialog>
                </Transition>

                {/* Delete Modal */}
                <Transition appear show={deleteModalOpen} as={Fragment}>
                    <Dialog
                        as="div"
                        className="relative z-50"
                        onClose={() =>
                            !deleteLoading && setDeleteModalOpen(false)
                        }
                    >
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-ink-950/50 backdrop-blur-sm" />
                        </Transition.Child>

                        <div className="fixed inset-0 overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center p-4 text-center">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 scale-95"
                                    enterTo="opacity-100 scale-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100 scale-100"
                                    leaveTo="opacity-0 scale-95"
                                >
                                    <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl border border-slate-200/80 bg-white text-left align-middle shadow-lift transition-all">
                                        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                                                    <FaTrash className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <Dialog.Title className="text-base font-bold text-ink-900">
                                                        Hapus User
                                                    </Dialog.Title>
                                                    <p className="mt-0.5 text-sm text-slate-500">
                                                        Konfirmasi penghapusan
                                                        data.
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    !deleteLoading &&
                                                    setDeleteModalOpen(false)
                                                }
                                                className="btn-icon"
                                                aria-label="Tutup"
                                                disabled={deleteLoading}
                                            >
                                                <FaTimes className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="p-6">
                                            <p className="text-sm leading-relaxed text-slate-600">
                                                Apakah Anda yakin ingin
                                                menghapus user{" "}
                                                <span className="font-semibold text-ink-900">
                                                    {deleteUser?.name}
                                                </span>
                                                ? Data yang dihapus tidak dapat
                                                dikembalikan.
                                            </p>
                                        </div>

                                        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-3">
                                            <button
                                                type="button"
                                                className="btn-ghost"
                                                onClick={() =>
                                                    setDeleteModalOpen(false)
                                                }
                                                disabled={deleteLoading}
                                            >
                                                Batal
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-danger"
                                                onClick={handleDeleteUser}
                                                disabled={deleteLoading}
                                            >
                                                {deleteLoading ? (
                                                    <>
                                                        <Spinner
                                                            size={16}
                                                            color="text-white"
                                                        />
                                                        <span className="ml-2">
                                                            Menghapus...
                                                        </span>
                                                    </>
                                                ) : (
                                                    "Hapus User"
                                                )}
                                            </button>
                                        </div>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition>
            </DashboardLayout>
        </>
    );
}
