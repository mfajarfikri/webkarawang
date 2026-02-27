import { Head, usePage } from "@inertiajs/react";
import DashboardLayout from "../../../Layouts/DashboardLayout";
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
} from "react-icons/fa";
import { GiSecurityGate } from "react-icons/gi";
import { useState, Fragment } from "react";
import { router } from "@inertiajs/react";
import React from "react";
import ErrorBoundary from "@/Components/ErrorBoundary";
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
const Spinner = ({ size = 20, color = "text-blue-600" }) => (
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
                                className="bg-sky-50 text-sky-700 px-2.5 py-1 transition-all ease-in-out rounded-lg text-xs font-medium border border-sky-100"
                            >
                                {opt ? opt.name : id}
                            </span>
                        );
                    })}
                </div>
                <Combobox.Input
                    className="w-full rounded-xl border-gray-200 focus:border-sky-500 focus:ring-sky-500 text-sm py-2.5"
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
                    <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm border border-gray-100">
                        {filtered.length === 0 && query !== "" ? (
                            <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                                Tidak ada data.
                            </div>
                        ) : (
                            filtered.map((o) => (
                                <Combobox.Option
                                    key={o.id}
                                    value={o.id}
                                    className={({ active }) =>
                                        `relative cursor-default select-none py-2.5 pl-10 pr-4 ${
                                            active
                                                ? "bg-sky-50 text-sky-900"
                                                : "text-gray-900"
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
                                                <span className="text-xs text-gray-500 ml-1">
                                                    ({o.ultg})
                                                </span>
                                            </span>
                                            {selected ? (
                                                <span
                                                    className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                                        active
                                                            ? "text-sky-600"
                                                            : "text-sky-600"
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
            <DashboardLayout>
                <div className="w-full mx-auto bg-white p-4 md:p-8 rounded-2xl space-y-6">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-sky-500 via-sky-400 to-cyan-400 flex items-center justify-center text-white shadow-md">
                                <FaUsers className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                    Manajemen User
                                </h1>
                                <p className="text-sm md:text-base text-gray-600 mt-1">
                                    Kelola data user dan hak akses sistem.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={openCreateModal}
                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-sm transition-all active:scale-95"
                            >
                                <FaPlus className="w-4 h-4" />
                                <span>Tambah User</span>
                            </button>
                        </div>
                    </div>

                    {/* Main Card */}
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Toolbar */}
                        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50/80 via-white to-gray-50/80 flex flex-col sm:flex-row gap-4 justify-between items-center">
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <button
                                    onClick={() => setFilterOpen(true)}
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                                        filterName
                                            ? "bg-blue-50 text-blue-600 border-blue-200"
                                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                                    }`}
                                >
                                    <FaFilter
                                        className={
                                            filterName
                                                ? "text-blue-500"
                                                : "text-gray-400"
                                        }
                                    />
                                    <span>Filter</span>
                                    {filterName && (
                                        <span className="ml-1 bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full text-xs">
                                            Aktif
                                        </span>
                                    )}
                                </button>
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                <span className="text-sm text-gray-500">
                                    Show
                                </span>
                                <Listbox
                                    value={rowsPerPage}
                                    onChange={setRowsPerPage}
                                >
                                    <div className="relative">
                                        <Listbox.Button className="relative w-20 cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-opacity-75 sm:text-sm shadow-sm">
                                            <span className="block truncate">
                                                {rowsPerPage}
                                            </span>
                                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                <FaChevronRight
                                                    className="h-3 w-3 text-gray-400 rotate-90"
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
                                            <Listbox.Options className="absolute right-0 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-20">
                                                {[8, 16, 32, 50].map(
                                                    (option) => (
                                                        <Listbox.Option
                                                            key={option}
                                                            className={({
                                                                active,
                                                            }) =>
                                                                `relative cursor-default select-none py-2 pl-4 pr-4 ${
                                                                    active
                                                                        ? "bg-blue-50 text-blue-900"
                                                                        : "text-gray-900"
                                                                }`
                                                            }
                                                            value={option}
                                                        >
                                                            {({ selected }) => (
                                                                <span
                                                                    className={`block truncate ${
                                                                        selected
                                                                            ? "font-medium"
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

                        {/* Table */}
                        <ErrorBoundary>
                            {/* Mobile Card View */}
                            <div className="md:hidden space-y-4 p-4 bg-gray-50/50">
                                {paginatedRows.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <FaUsers className="mx-auto text-4xl text-gray-300 mb-3" />
                                        <p>Belum ada data user.</p>
                                    </div>
                                ) : (
                                    paginatedRows.map((row) => (
                                        <div
                                            key={row.id}
                                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-4"
                                        >
                                            {/* User Info */}
                                            <div className="flex items-center gap-3 pb-3 border-b border-gray-50">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    {row.foto_profil ? (
                                                        <img
                                                            className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm"
                                                            src={
                                                                row.foto_profil
                                                            }
                                                            alt=""
                                                        />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold border-2 border-white shadow-sm">
                                                            {row.name
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-900">
                                                        {row.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {row.email}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Details Grid */}
                                            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                                                <div>
                                                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block mb-1">
                                                        Role
                                                    </span>
                                                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                        {row.role || "No Role"}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block mb-1">
                                                        Bidang
                                                    </span>
                                                    {row.bidang ? (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                                                            {row.bidang}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">
                                                            -
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="col-span-2">
                                                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block mb-1">
                                                        Wilayah
                                                    </span>
                                                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-700 border border-gray-100">
                                                        {row.wilayah || "-"}
                                                    </span>
                                                </div>
                                                <div className="col-span-2">
                                                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block mb-1">
                                                        Gardu Induk
                                                    </span>
                                                    {row.gardu_induks?.length >
                                                    0 ? (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {row.gardu_induks
                                                                .slice(0, 5)
                                                                .map((gi) => (
                                                                    <span
                                                                        key={
                                                                            gi.id
                                                                        }
                                                                        className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-50 text-green-600 border border-green-100 whitespace-nowrap"
                                                                    >
                                                                        {gi.name.replace(
                                                                            /^(GI|GITET|GIS|GISTET)\s+(\d+KV\s+)?/i,
                                                                            "",
                                                                        )}
                                                                    </span>
                                                                ))}
                                                            {row.gardu_induks
                                                                .length > 5 && (
                                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-50 text-gray-600 border border-gray-100">
                                                                    +
                                                                    {row
                                                                        .gardu_induks
                                                                        .length -
                                                                        5}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs italic">
                                                            Tidak ada GI
                                                            terhubung
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="pt-3 border-t border-gray-100 flex gap-2">
                                                <button
                                                    onClick={() =>
                                                        openRoleModal(row)
                                                    }
                                                    className="flex-1 py-2 rounded-lg bg-sky-50 text-sky-600 font-medium text-xs flex items-center justify-center gap-2 hover:bg-sky-100 transition-colors"
                                                >
                                                    <FaUserShield className="w-3.5 h-3.5" />{" "}
                                                    Kelola Role
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        openDeleteModal(row)
                                                    }
                                                    className="flex-1 py-2 rounded-lg bg-red-50 text-red-600 font-medium text-xs flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                                                >
                                                    <FaTrash className="w-3.5 h-3.5" />{" "}
                                                    Hapus
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50/80 border-b border-gray-200">
                                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">
                                                No
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                User
                                            </th>
                                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Role & Bidang
                                            </th>
                                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Wilayah
                                            </th>
                                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {paginatedRows.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="px-6 py-12 text-center text-gray-400"
                                                >
                                                    <div className="flex flex-col items-center gap-2">
                                                        <FaUsers className="text-4xl text-gray-200" />
                                                        <span className="text-sm">
                                                            Belum ada data user.
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedRows.map((row, idx) => (
                                                <tr
                                                    key={row.id}
                                                    className="hover:bg-blue-50/50 transition-colors duration-150"
                                                >
                                                    <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500 font-medium">
                                                        {(page - 1) *
                                                            rowsPerPage +
                                                            idx +
                                                            1}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-10 w-10">
                                                                {row.foto_profil ? (
                                                                    <img
                                                                        className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm"
                                                                        src={
                                                                            row.foto_profil
                                                                        }
                                                                        alt=""
                                                                    />
                                                                ) : (
                                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold border-2 border-white shadow-sm">
                                                                        {row.name
                                                                            .charAt(
                                                                                0,
                                                                            )
                                                                            .toUpperCase()}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-semibold text-gray-900">
                                                                    {row.name}
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    {row.email}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <div className="flex flex-col items-center gap-1.5">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                {row.role ||
                                                                    "No Role"}
                                                            </span>
                                                            {row.bidang && (
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                                    {row.bidang}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <div className="text-sm text-gray-900">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                                {row.wilayah ||
                                                                    "-"}
                                                            </span>
                                                        </div>
                                                        {row.gardu_induks
                                                            ?.length > 0 && (
                                                            <div className="flex flex-wrap justify-center gap-1 mt-2 max-w-[200px] mx-auto">
                                                                {row.gardu_induks
                                                                    .slice(0, 3)
                                                                    .map(
                                                                        (
                                                                            gi,
                                                                        ) => (
                                                                            <span
                                                                                key={
                                                                                    gi.id
                                                                                }
                                                                                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-50 text-green-600 border border-green-100 whitespace-nowrap"
                                                                                title={
                                                                                    gi.name
                                                                                }
                                                                            >
                                                                                {gi.name.replace(
                                                                                    /^(GI|GITET|GIS|GISTET)\s+(\d+KV\s+)?/i,
                                                                                    "",
                                                                                )}
                                                                            </span>
                                                                        ),
                                                                    )}
                                                                {row
                                                                    .gardu_induks
                                                                    .length >
                                                                    3 && (
                                                                    <span
                                                                        className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-50 text-gray-600 border border-gray-100 cursor-help"
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
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                        <div className="flex justify-center">
                                                            <div className="inline-flex items-center gap-1.5 rounded-xl bg-gray-50/80 border border-gray-100 px-2 py-1 shadow-sm">
                                                                <button
                                                                    onClick={() =>
                                                                        openRoleModal(
                                                                            row,
                                                                        )
                                                                    }
                                                                    className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-sky-100 bg-sky-50 text-sky-600 hover:bg-sky-100 hover:text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-0 transition-all shadow-[0_1px_2px_rgba(15,23,42,0.06)]"
                                                                    title="Kelola Role"
                                                                >
                                                                    <FaUserShield className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        openDeleteModal(
                                                                            row,
                                                                        )
                                                                    }
                                                                    className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-red-100 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-0 transition-all shadow-[0_1px_2px_rgba(15,23,42,0.06)]"
                                                                    title="Hapus User"
                                                                >
                                                                    <FaTrash className="w-4 h-4" />
                                                                </button>
                                                            </div>
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
                            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-sm text-gray-500">
                                    Menampilkan{" "}
                                    <span className="font-medium text-gray-900">
                                        {(page - 1) * rowsPerPage + 1}
                                    </span>{" "}
                                    sampai{" "}
                                    <span className="font-medium text-gray-900">
                                        {Math.min(
                                            page * rowsPerPage,
                                            totalRows,
                                        )}
                                    </span>{" "}
                                    dari{" "}
                                    <span className="font-medium text-gray-900">
                                        {totalRows}
                                    </span>{" "}
                                    hasil
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setPage(page - 1)}
                                        disabled={page === 1}
                                        className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <FaChevronLeft className="w-4 h-4" />
                                    </button>
                                    <div className="flex items-center gap-1">
                                        {[...Array(totalPages)].map(
                                            (_, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() =>
                                                        setPage(idx + 1)
                                                    }
                                                    className={`min-w-[32px] h-8 rounded-lg text-sm font-medium transition-colors ${
                                                        page === idx + 1
                                                            ? "bg-blue-600 text-white shadow-sm"
                                                            : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                                                    }`}
                                                >
                                                    {idx + 1}
                                                </button>
                                            ),
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setPage(page + 1)}
                                        disabled={page === totalPages}
                                        className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <FaChevronRight className="w-4 h-4" />
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
                            <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
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
                                    <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white/95 backdrop-blur-sm text-left align-middle shadow-xl transition-all border border-gray-100">
                                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-500 via-sky-400 to-cyan-400 flex items-center justify-center text-white shadow-md">
                                                    <FaFilter className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <Dialog.Title className="text-lg font-bold text-gray-900">
                                                        Filter Data
                                                    </Dialog.Title>
                                                    <p className="text-sm text-gray-500 mt-0.5">
                                                        Filter data user sesuai
                                                        kebutuhan.
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() =>
                                                    setFilterOpen(false)
                                                }
                                                className="text-gray-400 hover:text-gray-500 transition-colors"
                                            >
                                                <FaTimes className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <div className="p-6">
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Nama User
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                                            <div className="mt-6 flex justify-end gap-3">
                                                <button
                                                    onClick={() => {
                                                        setFilterName("");
                                                        setFilterOpen(false);
                                                    }}
                                                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300"
                                                >
                                                    Reset
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setFilterOpen(false)
                                                    }
                                                    className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
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
                            <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
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
                                    <Dialog.Panel className="w-full max-w-lg transform overflow-visible rounded-2xl bg-white/95 backdrop-blur-sm text-left align-middle shadow-xl transition-all border border-gray-100">
                                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-500 via-sky-400 to-cyan-400 flex items-center justify-center text-white shadow-md">
                                                        <FaUserShield className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <Dialog.Title
                                                            as="h3"
                                                            className="text-base md:text-lg font-semibold text-gray-900"
                                                        >
                                                            Edit Role & Akses
                                                        </Dialog.Title>
                                                        <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                                                            Kelola role dan hak
                                                            akses user.
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() =>
                                                        setRoleModalOpen(false)
                                                    }
                                                    className="text-gray-400 hover:text-gray-500 transition-colors"
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
                                                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                        <div className="h-12 w-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-lg font-bold text-blue-600 shadow-sm">
                                                            <img
                                                                src={
                                                                    roleModalUser?.foto_profil
                                                                }
                                                                alt={
                                                                    roleModalUser?.name
                                                                }
                                                                className="h-full w-full object-cover rounded-full ring-2 ring-blue-800"
                                                            />
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-gray-900">
                                                                {
                                                                    roleModalUser?.name
                                                                }
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {
                                                                    roleModalUser?.email
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
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
                                                                    <Listbox.Button className="relative w-full cursor-default rounded-xl bg-white py-2.5 pl-3 pr-10 text-left border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 sm:text-sm">
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
                                                                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                                            <FaChevronRight className="h-4 w-4 text-gray-400 rotate-90" />
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
                                                                        <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm border border-gray-100">
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
                                                                                            `relative cursor-default select-none py-2.5 pl-10 pr-4 ${
                                                                                                active
                                                                                                    ? "bg-sky-50 text-sky-900"
                                                                                                    : "text-gray-900"
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
                                                                                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sky-600">
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
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
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
                                                                    <Listbox.Button className="relative w-full cursor-default rounded-xl bg-white py-2.5 pl-3 pr-10 text-left border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 sm:text-sm">
                                                                        <span className="block truncate">
                                                                            {roleModalBidang ||
                                                                                "Pilih Bidang"}
                                                                        </span>
                                                                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                                            <FaChevronRight className="h-4 w-4 text-gray-400 rotate-90" />
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
                                                                        <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm border border-gray-100">
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
                                                                                            `relative cursor-default select-none py-2.5 pl-10 pr-4 ${
                                                                                                active
                                                                                                    ? "bg-sky-50 text-sky-900"
                                                                                                    : "text-gray-900"
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
                                                                                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sky-600">
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
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
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
                                                                    <Listbox.Button className="relative w-full cursor-default rounded-xl bg-white py-2.5 pl-3 pr-10 text-left border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 sm:text-sm">
                                                                        <span className="block truncate">
                                                                            {roleModalWilayah ||
                                                                                "Pilih Wilayah"}
                                                                        </span>
                                                                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                                            <FaChevronRight className="h-4 w-4 text-gray-400 rotate-90" />
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
                                                                        <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm border border-gray-100">
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
                                                                                            `relative cursor-default select-none py-2.5 pl-10 pr-4 ${
                                                                                                active
                                                                                                    ? "bg-sky-50 text-sky-900"
                                                                                                    : "text-gray-900"
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
                                                                                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sky-600">
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
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
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
                                                        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">
                                                            {roleModalError}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
                                            <button
                                                type="button"
                                                className="inline-flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                                onClick={() =>
                                                    setRoleModalOpen(false)
                                                }
                                                disabled={roleModalSaving}
                                            >
                                                Batal
                                            </button>
                                            <button
                                                type="button"
                                                className="inline-flex justify-center rounded-lg border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50"
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
                            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
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
                                            <div className="flex h-full flex-col bg-white shadow-xl">
                                                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-500 via-sky-400 to-cyan-400 flex items-center justify-center text-white shadow-md">
                                                            <FaPlus className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <Dialog.Title className="text-lg font-bold text-gray-900">
                                                                Tambah User Baru
                                                            </Dialog.Title>
                                                            <p className="text-sm text-gray-500 mt-0.5">
                                                                Isi form berikut
                                                                untuk
                                                                menambahkan user
                                                                baru.
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="text-gray-400 hover:text-gray-500 transition-colors"
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

                                                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                                                    <form
                                                        onSubmit={(e) => {
                                                            e.preventDefault();
                                                            handleCreateUser();
                                                        }}
                                                        className="space-y-6"
                                                    >
                                                        {/* Informasi Pribadi */}
                                                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                                                            <h4 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
                                                                    1
                                                                </span>
                                                                Informasi
                                                                Pribadi
                                                            </h4>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                        Nama
                                                                        Lengkap
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        required
                                                                        className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                                                                        <p className="text-red-500 text-xs mt-1">
                                                                            {
                                                                                createError.name
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                        Email
                                                                    </label>
                                                                    <input
                                                                        type="email"
                                                                        required
                                                                        className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                                                                        <p className="text-red-500 text-xs mt-1">
                                                                            {
                                                                                createError.email
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Keamanan */}
                                                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                                                            <h4 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600 text-xs font-bold">
                                                                    2
                                                                </span>
                                                                Keamanan
                                                            </h4>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Password
                                                                </label>
                                                                <input
                                                                    type="password"
                                                                    required
                                                                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                                                                    <p className="text-red-500 text-xs mt-1">
                                                                        {
                                                                            createError.password
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Role & Akses */}
                                                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                                                            <h4 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-600 text-xs font-bold">
                                                                    3
                                                                </span>
                                                                Role & Akses
                                                            </h4>
                                                            <div className="grid grid-cols-1 gap-4">
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                                                                            <Listbox.Button className="relative w-full cursor-default rounded-xl bg-white py-2.5 pl-3 pr-10 text-left border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 sm:text-sm">
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
                                                                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                                                    <FaChevronRight className="h-4 w-4 text-gray-400 rotate-90" />
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
                                                                                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm border border-gray-100">
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
                                                                                                    `relative cursor-default select-none py-2.5 pl-10 pr-4 ${
                                                                                                        active
                                                                                                            ? "bg-sky-50 text-sky-900"
                                                                                                            : "text-gray-900"
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
                                                                                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sky-600">
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
                                                                        <p className="text-red-500 text-xs mt-1">
                                                                            {
                                                                                createError.role
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>

                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                                                                            <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm">
                                                                                <span className="block truncate">
                                                                                    {createBidang ||
                                                                                        "Pilih Bidang"}
                                                                                </span>
                                                                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                                                    <FaChevronRight className="h-4 w-4 text-gray-400 rotate-90" />
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
                                                                                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
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
                                                                                                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                                                                                        active
                                                                                                            ? "bg-blue-100 text-blue-900"
                                                                                                            : "text-gray-900"
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
                                                                                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
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
                                                                        <p className="text-red-500 text-xs mt-1">
                                                                            {
                                                                                createError.bidang
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>

                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                                                                            <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm">
                                                                                <span className="block truncate">
                                                                                    {createWilayah ||
                                                                                        "Pilih Wilayah"}
                                                                                </span>
                                                                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                                                    <FaChevronRight className="h-4 w-4 text-gray-400 rotate-90" />
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
                                                                                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
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
                                                                                                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                                                                                        active
                                                                                                            ? "bg-blue-100 text-blue-900"
                                                                                                            : "text-gray-900"
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
                                                                                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
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
                                                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                                                            <h4 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-bold">
                                                                    4
                                                                </span>
                                                                Gardu Induk
                                                            </h4>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
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

                                                <div className="bg-white px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
                                                    <button
                                                        type="button"
                                                        className="inline-flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
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
                                                        className="inline-flex justify-center rounded-lg border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50"
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
                            <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
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
                                    <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white/95 backdrop-blur-sm text-left align-middle shadow-xl transition-all border border-gray-100">
                                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 shadow-sm">
                                                    <FaTrash className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <Dialog.Title className="text-lg font-bold text-gray-900">
                                                        Hapus User
                                                    </Dialog.Title>
                                                    <p className="text-sm text-gray-500 mt-0.5">
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
                                                className="text-gray-400 hover:text-gray-500 transition-colors"
                                                disabled={deleteLoading}
                                            >
                                                <FaTimes className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="p-6">
                                            <p className="text-gray-600">
                                                Apakah Anda yakin ingin
                                                menghapus user{" "}
                                                <span className="font-bold text-gray-900">
                                                    {deleteUser?.name}
                                                </span>
                                                ? Data yang dihapus tidak dapat
                                                dikembalikan.
                                            </p>
                                        </div>

                                        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
                                            <button
                                                type="button"
                                                className="inline-flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                                onClick={() =>
                                                    setDeleteModalOpen(false)
                                                }
                                                disabled={deleteLoading}
                                            >
                                                Batal
                                            </button>
                                            <button
                                                type="button"
                                                className="inline-flex justify-center rounded-lg border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:opacity-50"
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
