import DashboardLayout from "@/Layouts/DashboardLayout";
import { usePage } from "@inertiajs/react";
import { router as Inertia } from "@inertiajs/react";
import { useState, Fragment } from "react";
import { Switch, Listbox, Dialog, Transition } from "@headlessui/react";
import {
    FaEdit,
    FaEllipsisV,
    FaFilter,
    FaInfo,
    FaUserShield,
    FaUsers,
    FaPlus,
    FaSearch,
    FaChevronLeft,
    FaChevronRight,
    FaTrash,
    FaShieldAlt,
} from "react-icons/fa";
import { CircularProgress } from "@mui/material";
import { useEffect } from "react";
import { Link } from "@inertiajs/react";
import {
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
} from "@mui/material";
import { useRef } from "react";
import ErrorBoundary from "@/Components/ErrorBoundary";

export default function Role() {
    const { roles, errors } = usePage().props;
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalRole, setModalRole] = useState(null);
    const [allPermissions, setAllPermissions] = useState([]);
    const [rolePermissions, setRolePermissions] = useState([]);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalSaving, setModalSaving] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editRole, setEditRole] = useState(null);
    const [editName, setEditName] = useState("");
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState("");
    const [anchorEls, setAnchorEls] = useState({});
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filterOpen, setFilterOpen] = useState(false);
    const [filterName, setFilterName] = useState("");

    // Filtered rows
    const filteredRows = roles.filter(
        (role) =>
            filterName.trim() === "" ||
            role.name.toLowerCase().includes(filterName.toLowerCase())
    );
    const totalRows = filteredRows.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);
    const paginatedRows = filteredRows.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    // Reset page if filter changes
    useEffect(() => {
        setPage(1);
    }, [filterName, rowsPerPage]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        Inertia.post(
            "/dashboard/roles",
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
        if (confirm("Yakin hapus role ini?")) {
            Inertia.delete(`/dashboard/roles/${id}`);
        }
    };

    // Fetch permissions for modal
    const openPermissionModal = async (role) => {
        setModalRole(role);
        setModalOpen(true);
        setModalLoading(true);
        // Fetch permissions and rolePermissions from backend
        try {
            const res = await fetch(
                `/dashboard/role/${role.id}/permissions?modal=1`
            );
            const data = await res.json();
            setAllPermissions(data.permissions);
            setRolePermissions(data.rolePermissions);
        } catch (e) {
            setAllPermissions([]);
            setRolePermissions([]);
        }
        setModalLoading(false);
    };

    const handlePermissionToggle = (id) => {
        setRolePermissions((prev) =>
            prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
        );
    };

    const handleSavePermissions = () => {
        setModalSaving(true);
        Inertia.post(
            `/dashboard/role/${modalRole.id}/permissions`,
            { permissions: rolePermissions },
            {
                onFinish: () => {
                    setModalSaving(false);
                    setModalOpen(false);
                },
            }
        );
    };

    const openEditModal = (role) => {
        setEditRole(role);
        setEditName(role.name);
        setEditError("");
        setEditModalOpen(true);
    };

    const handleEditSave = () => {
        setEditLoading(true);
        setEditError("");
        Inertia.put(
            `/dashboard/roles/${editRole.id}`,
            { name: editName },
            {
                onError: (errors) => {
                    setEditError(errors.name || "");
                },
                onFinish: () => {
                    setEditLoading(false);
                    setEditModalOpen(false);
                },
            }
        );
    };

    const handleMenuOpen = (id, event) => {
        setAnchorEls((prev) => ({ ...prev, [id]: event.currentTarget }));
    };
    const handleMenuClose = (id) => {
        setAnchorEls((prev) => ({ ...prev, [id]: null }));
    };

    return (
        <DashboardLayout title="Manajemen Role">
            <div className="min-h-screen bg-white rounded-2xl py-10">
                <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-sky-500 via-sky-400 to-cyan-400 flex items-center justify-center text-white shadow-md">
                                <FaUserShield className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                    Manajemen Role
                                </h1>
                                <p className="text-sm md:text-base text-gray-600 mt-1">
                                    Kelola peran dan hak akses pengguna dalam
                                    sistem.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/80 backdrop-blur border border-blue-100 shadow-sm">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                    <FaUsers className="w-3.5 h-3.5" />
                                </div>
                                <div className="text-xs text-gray-600">
                                    <div className="font-semibold text-gray-800">
                                        {roles ? roles.length : 0} roles
                                    </div>
                                    <div>Terdaftar dalam sistem</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Add Role Card */}
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50/80 via-white to-gray-50/80">
                            <h2 className="text-base md:text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <FaPlus className="text-blue-600 w-4 h-4" />
                                Tambah Role Baru
                            </h2>
                        </div>
                        <div className="p-6">
                            <form
                                onSubmit={handleSubmit}
                                className="flex flex-col sm:flex-row gap-4 items-end"
                            >
                                <div className="flex-1 w-full">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nama Role
                                    </label>
                                    <input
                                        type="text"
                                        className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                                        placeholder="Contoh: Administrator"
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                        required
                                    />
                                    {errors && errors.name && (
                                        <div className="text-red-500 mt-1 text-sm">
                                            {errors.name}
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-6 py-2.5 rounded-lg shadow-sm hover:bg-blue-700 font-medium disabled:opacity-50 w-full sm:w-auto transition-all duration-200 flex items-center justify-center gap-2"
                                    disabled={loading}
                                >
                                    <FaPlus className="w-4 h-4" />
                                    Tambah
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Roles Table Card */}
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50/80 via-white to-gray-50/80">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h2 className="text-base md:text-lg font-semibold text-gray-900">
                                        Daftar Role
                                    </h2>
                                    <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                                        Daftar semua role yang tersedia.
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                    {/* Filter Button */}
                                    <button
                                        className={`px-4 py-2 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                                            filterOpen
                                                ? "bg-blue-50 border-blue-200 text-blue-700"
                                                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                                        }`}
                                        onClick={() =>
                                            setFilterOpen(!filterOpen)
                                        }
                                    >
                                        <FaFilter
                                            className={
                                                filterOpen
                                                    ? "text-blue-600"
                                                    : "text-gray-400"
                                            }
                                        />
                                        Filter
                                    </button>

                                    {/* Rows Per Page */}
                                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
                                        <span className="text-gray-500 text-xs font-medium">
                                            Show
                                        </span>
                                        <Listbox
                                            value={rowsPerPage}
                                            onChange={setRowsPerPage}
                                        >
                                            <div className="relative">
                                                <Listbox.Button className="text-sm font-semibold text-gray-800 focus:outline-none cursor-pointer flex items-center gap-1">
                                                    {rowsPerPage}
                                                    <span className="text-gray-400 text-xs">
                                                        ▼
                                                    </span>
                                                </Listbox.Button>
                                                <Listbox.Options className="absolute right-0 z-10 mt-2 w-20 bg-white border border-gray-100 rounded-lg shadow-lg text-sm overflow-hidden py-1">
                                                    {[10, 25, 50].map(
                                                        (option) => (
                                                            <Listbox.Option
                                                                key={option}
                                                                value={option}
                                                                className={({
                                                                    active,
                                                                    selected,
                                                                }) =>
                                                                    `cursor-pointer select-none px-3 py-2 ${
                                                                        active
                                                                            ? "bg-blue-50 text-blue-900"
                                                                            : "text-gray-700"
                                                                    } ${
                                                                        selected
                                                                            ? "font-semibold bg-blue-50"
                                                                            : ""
                                                                    }`
                                                                }
                                                            >
                                                                {option}
                                                            </Listbox.Option>
                                                        )
                                                    )}
                                                </Listbox.Options>
                                            </div>
                                        </Listbox>
                                    </div>
                                </div>
                            </div>

                            {/* Filter Section */}
                            {filterOpen && (
                                <div className="mt-4 pt-4 border-t border-gray-100 animate-fadeIn">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaSearch className="text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow"
                                            placeholder="Cari nama role..."
                                            value={filterName}
                                            onChange={(e) =>
                                                setFilterName(e.target.value)
                                            }
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="overflow-x-auto">
                            <ErrorBoundary>
                                <table className="min-w-full divide-y divide-gray-100">
                                    <thead className="bg-gray-50/80">
                                        <tr>
                                            <th
                                                scope="col"
                                                className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide"
                                            >
                                                Nama Role
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide"
                                            >
                                                Permission
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide"
                                            >
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {paginatedRows.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={3}
                                                    className="px-6 py-12 text-center"
                                                >
                                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-3">
                                                        <FaUserShield className="w-6 h-6" />
                                                    </div>
                                                    <p className="text-gray-500 font-medium">
                                                        Tidak ada role
                                                        ditemukan.
                                                    </p>
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedRows.map((row) => (
                                                <tr
                                                    key={row.id}
                                                    className="hover:bg-blue-50/50 transition-colors duration-150"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-semibold text-gray-900">
                                                            {row.name}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-wrap gap-1 max-w-xl">
                                                            {Array.isArray(
                                                                row.permissions
                                                            ) &&
                                                            row.permissions
                                                                .length > 0 ? (
                                                                row.permissions
                                                                    .slice(0, 5)
                                                                    .map(
                                                                        (p) => (
                                                                            <span
                                                                                key={
                                                                                    p.id
                                                                                }
                                                                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                                                                            >
                                                                                {
                                                                                    p.name
                                                                                }
                                                                            </span>
                                                                        )
                                                                    )
                                                            ) : (
                                                                <span className="text-gray-400 text-sm italic">
                                                                    - Tidak ada
                                                                    permission -
                                                                </span>
                                                            )}
                                                            {row.permissions
                                                                .length > 5 && (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                                                    +
                                                                    {row
                                                                        .permissions
                                                                        .length -
                                                                        5}{" "}
                                                                    lainnya
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <IconButton
                                                            aria-label="actions"
                                                            onClick={(e) =>
                                                                handleMenuOpen(
                                                                    row.id,
                                                                    e
                                                                )
                                                            }
                                                            size="small"
                                                            className="hover:bg-gray-100 text-gray-500"
                                                        >
                                                            <FaEllipsisV className="w-4 h-4" />
                                                        </IconButton>
                                                        <Menu
                                                            anchorEl={
                                                                anchorEls[
                                                                    row.id
                                                                ]
                                                            }
                                                            open={Boolean(
                                                                anchorEls[
                                                                    row.id
                                                                ]
                                                            )}
                                                            onClose={() =>
                                                                handleMenuClose(
                                                                    row.id
                                                                )
                                                            }
                                                            anchorOrigin={{
                                                                vertical:
                                                                    "bottom",
                                                                horizontal:
                                                                    "right",
                                                            }}
                                                            transformOrigin={{
                                                                vertical: "top",
                                                                horizontal:
                                                                    "right",
                                                            }}
                                                            PaperProps={{
                                                                elevation: 2,
                                                                sx: {
                                                                    mt: 1,
                                                                    minWidth: 160,
                                                                    borderRadius: 2,
                                                                    overflow:
                                                                        "hidden",
                                                                    boxShadow:
                                                                        "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                                                                    border: "1px solid #f3f4f6",
                                                                },
                                                            }}
                                                        >
                                                            <MenuItem
                                                                onClick={() => {
                                                                    handleMenuClose(
                                                                        row.id
                                                                    );
                                                                    openEditModal(
                                                                        row
                                                                    );
                                                                }}
                                                                className="hover:bg-gray-50 text-gray-700"
                                                            >
                                                                <ListItemIcon
                                                                    sx={{
                                                                        minWidth: 32,
                                                                    }}
                                                                >
                                                                    <FaEdit className="w-4 h-4 text-blue-600" />
                                                                </ListItemIcon>
                                                                <ListItemText
                                                                    primaryTypographyProps={{
                                                                        fontSize:
                                                                            "0.875rem",
                                                                        fontWeight: 500,
                                                                    }}
                                                                >
                                                                    Edit Role
                                                                </ListItemText>
                                                            </MenuItem>
                                                            <MenuItem
                                                                onClick={() => {
                                                                    handleMenuClose(
                                                                        row.id
                                                                    );
                                                                    openPermissionModal(
                                                                        row
                                                                    );
                                                                }}
                                                                className="hover:bg-gray-50 text-gray-700"
                                                            >
                                                                <ListItemIcon
                                                                    sx={{
                                                                        minWidth: 32,
                                                                    }}
                                                                >
                                                                    <FaUserShield className="w-4 h-4 text-indigo-600" />
                                                                </ListItemIcon>
                                                                <ListItemText
                                                                    primaryTypographyProps={{
                                                                        fontSize:
                                                                            "0.875rem",
                                                                        fontWeight: 500,
                                                                    }}
                                                                >
                                                                    Permissions
                                                                </ListItemText>
                                                            </MenuItem>
                                                            <MenuItem
                                                                onClick={() => {
                                                                    handleMenuClose(
                                                                        row.id
                                                                    );
                                                                    handleDelete(
                                                                        row.id
                                                                    );
                                                                }}
                                                                className="hover:bg-red-50 text-red-600"
                                                            >
                                                                <ListItemIcon
                                                                    sx={{
                                                                        minWidth: 32,
                                                                    }}
                                                                >
                                                                    <FaTrash className="w-4 h-4 text-red-500" />
                                                                </ListItemIcon>
                                                                <ListItemText
                                                                    primaryTypographyProps={{
                                                                        fontSize:
                                                                            "0.875rem",
                                                                        fontWeight: 500,
                                                                        color: "rgb(220 38 38)",
                                                                    }}
                                                                >
                                                                    Hapus Role
                                                                </ListItemText>
                                                            </MenuItem>
                                                        </Menu>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </ErrorBoundary>
                        </div>
                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                                <div className="text-gray-500 text-sm mb-4 sm:mb-0">
                                    Menampilkan{" "}
                                    <span className="font-semibold text-gray-900">
                                        {(page - 1) * rowsPerPage + 1}
                                    </span>{" "}
                                    sampai{" "}
                                    <span className="font-semibold text-gray-900">
                                        {Math.min(
                                            page * rowsPerPage,
                                            totalRows
                                        )}
                                    </span>{" "}
                                    dari{" "}
                                    <span className="font-semibold text-gray-900">
                                        {totalRows}
                                    </span>{" "}
                                    data
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        onClick={() => setPage(page - 1)}
                                        disabled={page === 1}
                                    >
                                        <FaChevronLeft className="w-4 h-4" />
                                    </button>
                                    <div className="flex items-center gap-1">
                                        {[...Array(totalPages)].map(
                                            (_, idx) => (
                                                <button
                                                    key={idx}
                                                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                                                        page === idx + 1
                                                            ? "bg-blue-600 text-white shadow-sm"
                                                            : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                                                    }`}
                                                    onClick={() =>
                                                        setPage(idx + 1)
                                                    }
                                                >
                                                    {idx + 1}
                                                </button>
                                            )
                                        )}
                                    </div>
                                    <button
                                        className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        onClick={() => setPage(page + 1)}
                                        disabled={page === totalPages}
                                    >
                                        <FaChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Transition appear show={modalOpen} as={Fragment}>
                <Dialog
                    as="div"
                    className="relative z-50"
                    onClose={() => setModalOpen(false)}
                >
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-200"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-150"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-200"
                                enterFrom="opacity-0 translate-y-2 scale-95"
                                enterTo="opacity-100 translate-y-0 scale-100"
                                leave="ease-in duration-150"
                                leaveFrom="opacity-100 translate-y-0 scale-100"
                                leaveTo="opacity-0 translate-y-2 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-white/95 backdrop-blur-sm text-left align-middle shadow-xl border border-gray-100">
                                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-500 via-sky-400 to-cyan-400 flex items-center justify-center text-white shadow-md">
                                                    <FaShieldAlt className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <Dialog.Title className="text-base md:text-lg font-semibold">
                                                        Kelola Permission
                                                    </Dialog.Title>
                                                    <p className="text-xs md:text-sm mt-0.5">
                                                        Atur hak akses
                                                        permission untuk role
                                                        terpilih.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-6 py-5 bg-white">
                                        {modalLoading ? (
                                            <div className="flex justify-center items-center h-40">
                                                <CircularProgress size={32} />
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                    <div className="text-sm text-gray-700">
                                                        <span className="font-medium text-gray-500">
                                                            Role:
                                                        </span>{" "}
                                                        <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-100">
                                                            {modalRole?.name}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Pilih permission yang
                                                        diizinkan untuk role
                                                        ini.
                                                    </div>
                                                </div>
                                                {allPermissions.length === 0 ? (
                                                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/60 px-6 py-10 text-center">
                                                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                                                            <FaUserShield className="w-6 h-6" />
                                                        </div>
                                                        <p className="text-sm font-medium text-gray-700">
                                                            Tidak ada permission
                                                            tersedia
                                                        </p>
                                                        <p className="mt-1 text-xs text-gray-500 max-w-xs">
                                                            Tambahkan permission
                                                            terlebih dahulu pada
                                                            modul permission.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[420px] overflow-y-auto pr-1">
                                                        {allPermissions.map(
                                                            (perm) => {
                                                                const isActive =
                                                                    rolePermissions.includes(
                                                                        perm.id
                                                                    );
                                                                return (
                                                                    <div
                                                                        key={
                                                                            perm.id
                                                                        }
                                                                        className={`group transition-all duration-200 rounded-lg border flex items-center px-3 py-2 bg-white/95 hover:shadow cursor-pointer ${
                                                                            isActive
                                                                                ? "border-cyan-500 bg-cyan-50/80"
                                                                                : "border-gray-200"
                                                                        }`}
                                                                        onClick={() =>
                                                                            handlePermissionToggle(
                                                                                perm.id
                                                                            )
                                                                        }
                                                                    >
                                                                        <Switch
                                                                            checked={
                                                                                isActive
                                                                            }
                                                                            onChange={() =>
                                                                                handlePermissionToggle(
                                                                                    perm.id
                                                                                )
                                                                            }
                                                                            className={`${
                                                                                isActive
                                                                                    ? "bg-cyan-600"
                                                                                    : "bg-gray-200"
                                                                            } relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none`}
                                                                            onClick={(
                                                                                e
                                                                            ) =>
                                                                                e.stopPropagation()
                                                                            }
                                                                        >
                                                                            <span
                                                                                className={`${
                                                                                    isActive
                                                                                        ? "translate-x-5"
                                                                                        : "translate-x-1"
                                                                                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                                                            />
                                                                        </Switch>
                                                                        <div className="ml-2 flex-1 min-w-0">
                                                                            <div className="flex items-center gap-1">
                                                                                <span
                                                                                    className={`font-semibold text-sm truncate ${
                                                                                        isActive
                                                                                            ? "text-cyan-700"
                                                                                            : "text-gray-800 group-hover:text-cyan-600"
                                                                                    }`}
                                                                                >
                                                                                    {
                                                                                        perm.name
                                                                                    }
                                                                                </span>
                                                                                {isActive && (
                                                                                    <span className="ml-1 px-1 py-0.5 rounded text-xs bg-cyan-100 text-cyan-700 font-semibold">
                                                                                        Aktif
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            <div className="mt-0.5">
                                                                                <span className="text-gray-400 text-xs italic truncate block">
                                                                                    {perm.description ||
                                                                                        "Tidak ada deskripsi."}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            }
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="border-t border-gray-100 px-6 py-4 bg-gray-50/80 flex justify-between">
                                        <button
                                            type="button"
                                            onClick={() => setModalOpen(false)}
                                            disabled={modalSaving}
                                            className="rounded-lg px-4 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSavePermissions}
                                            disabled={
                                                modalSaving || modalLoading
                                            }
                                            className="inline-flex items-center justify-center rounded-lg px-5 py-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {modalSaving ? (
                                                <CircularProgress
                                                    size={20}
                                                    color="inherit"
                                                />
                                            ) : (
                                                "Simpan"
                                            )}
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            <Transition appear show={editModalOpen} as={Fragment}>
                <Dialog
                    as="div"
                    className="relative z-50"
                    onClose={() => setEditModalOpen(false)}
                >
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-200"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-150"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-200"
                                enterFrom="opacity-0 translate-y-2 scale-95"
                                enterTo="opacity-100 translate-y-0 scale-100"
                                leave="ease-in duration-150"
                                leaveFrom="opacity-100 translate-y-0 scale-100"
                                leaveTo="opacity-0 translate-y-2 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white/95 backdrop-blur-sm text-left align-middle shadow-xl border border-gray-100">
                                    <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 via-white to-gray-50">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                                <FaEdit className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <Dialog.Title className="text-base font-semibold text-gray-900">
                                                    Edit Role
                                                </Dialog.Title>
                                                <p className="mt-0.5 text-xs text-gray-500">
                                                    Perbarui nama role sesuai
                                                    kebutuhan akses.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-6 py-5 bg-white">
                                        <div className="mb-4">
                                            <label className="block text-sm text-gray-700 font-medium mb-1.5">
                                                Nama Role
                                            </label>
                                            <input
                                                type="text"
                                                className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                                                value={editName}
                                                onChange={(e) =>
                                                    setEditName(e.target.value)
                                                }
                                                required
                                                autoFocus
                                            />
                                            {editError && (
                                                <div className="text-red-500 mt-1 text-sm">
                                                    {editError}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-100 px-6 py-4 bg-gray-50/80 flex justify-between">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setEditModalOpen(false)
                                            }
                                            disabled={editLoading}
                                            className="rounded-lg px-4 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleEditSave}
                                            disabled={
                                                editLoading || !editName.trim()
                                            }
                                            className="inline-flex items-center justify-center rounded-lg px-5 py-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {editLoading ? (
                                                <CircularProgress
                                                    size={20}
                                                    color="inherit"
                                                />
                                            ) : (
                                                "Simpan"
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
    );
}
