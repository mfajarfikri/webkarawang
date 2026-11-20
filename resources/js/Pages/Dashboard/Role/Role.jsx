import DashboardLayout from "@/Layouts/DashboardLayout";
import PageHeader, { HeaderStat } from "@/Components/Dashboard/PageHeader";
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
import { Badge, Card, EmptyState } from "@/Components/Dashboard/ui";

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
            <div className="space-y-6">
                <PageHeader
                    icon={FaUserShield}
                    title="Manajemen Role"
                    description="Kelola peran dan hak akses pengguna dalam sistem."
                >
                    <HeaderStat
                        icon={FaUsers}
                        value={`${roles ? roles.length : 0} role`}
                        label="Terdaftar dalam sistem"
                    />
                </PageHeader>

                {/* Add Role Card */}
                <Card
                    icon={FaPlus}
                    title="Tambah Role Baru"
                    description="Role baru dapat langsung diberi permission dari daftar di bawah."
                >
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col items-end gap-3 sm:flex-row"
                    >
                        <div className="w-full flex-1">
                            <label
                                htmlFor="role-name"
                                className="field-label"
                            >
                                Nama Role
                            </label>
                            <input
                                id="role-name"
                                type="text"
                                className="field-input"
                                placeholder="Contoh: Administrator"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                            {errors && errors.name && (
                                <p className="field-error">{errors.name}</p>
                            )}
                        </div>
                        <button
                            type="submit"
                            className="btn-brand w-full sm:w-auto"
                            disabled={loading}
                        >
                            <FaPlus className="h-3.5 w-3.5" />
                            Tambah
                        </button>
                    </form>
                </Card>

                {/* Roles Table Card */}
                <Card
                    padded={false}
                    title="Daftar Role"
                    description="Daftar semua role yang tersedia."
                    actions={
                        <>
                            {/* Filter Button */}
                            <button
                                type="button"
                                className={`btn-ghost btn-sm ${
                                    filterOpen
                                        ? "!border-brand-200 !bg-brand-50 !text-brand-800"
                                        : ""
                                }`}
                                onClick={() => setFilterOpen(!filterOpen)}
                                aria-expanded={filterOpen}
                            >
                                <FaFilter
                                    className={`h-3 w-3 ${
                                        filterOpen
                                            ? "text-brand-600"
                                            : "text-slate-400"
                                    }`}
                                />
                                Filter
                            </button>

                            {/* Rows Per Page */}
                            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1.5 pl-3.5 pr-3 text-xs">
                                <span className="font-medium text-slate-500">
                                    Tampilkan
                                </span>
                                <Listbox
                                    value={rowsPerPage}
                                    onChange={setRowsPerPage}
                                >
                                    <div className="relative">
                                        <Listbox.Button className="flex cursor-pointer items-center gap-1 rounded text-sm font-semibold tabular-nums text-ink-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40">
                                            {rowsPerPage}
                                            <span className="text-[10px] text-slate-400">
                                                ▼
                                            </span>
                                        </Listbox.Button>
                                        <Listbox.Options className="absolute right-0 z-10 mt-2 w-20 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-sm shadow-lift focus:outline-none">
                                            {[10, 25, 50].map((option) => (
                                                <Listbox.Option
                                                    key={option}
                                                    value={option}
                                                    className={({
                                                        active,
                                                        selected,
                                                    }) =>
                                                        `cursor-pointer select-none px-3 py-2 tabular-nums ${
                                                            active
                                                                ? "bg-slate-50 text-ink-900"
                                                                : "text-slate-700"
                                                        } ${
                                                            selected
                                                                ? "font-semibold text-brand-700"
                                                                : ""
                                                        }`
                                                    }
                                                >
                                                    {option}
                                                </Listbox.Option>
                                            ))}
                                        </Listbox.Options>
                                    </div>
                                </Listbox>
                            </div>
                        </>
                    }
                >
                    {/* Filter Section */}
                    {filterOpen && (
                        <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-6">
                            <div className="relative max-w-md">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                                    <FaSearch className="h-3.5 w-3.5 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    className="field-input pl-10"
                                    placeholder="Cari nama role..."
                                    aria-label="Cari nama role"
                                    value={filterName}
                                    onChange={(e) =>
                                        setFilterName(e.target.value)
                                    }
                                />
                            </div>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <ErrorBoundary>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th scope="col">Nama Role</th>
                                        <th scope="col">Permission</th>
                                        <th scope="col" className="text-right">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedRows.length === 0 ? (
                                        <tr>
                                            <td colSpan={3}>
                                                <EmptyState
                                                    icon={FaUserShield}
                                                    title="Tidak ada role ditemukan."
                                                    description="Ubah kata kunci filter atau tambahkan role baru."
                                                />
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedRows.map((row) => (
                                            <tr key={row.id}>
                                                <td className="whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                                                            <FaUserShield className="h-3.5 w-3.5" />
                                                        </span>
                                                        <span className="font-semibold text-ink-900">
                                                            {row.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="flex max-w-xl flex-wrap gap-1.5">
                                                        {Array.isArray(
                                                            row.permissions
                                                        ) &&
                                                        row.permissions.length >
                                                            0 ? (
                                                            row.permissions
                                                                .slice(0, 5)
                                                                .map((p) => (
                                                                    <Badge
                                                                        key={
                                                                            p.id
                                                                        }
                                                                        tone="brand"
                                                                    >
                                                                        {p.name}
                                                                    </Badge>
                                                                ))
                                                        ) : (
                                                            <span className="text-sm text-slate-400">
                                                                - Tidak ada
                                                                permission -
                                                            </span>
                                                        )}
                                                        {row.permissions
                                                            .length > 5 && (
                                                            <Badge tone="slate">
                                                                +
                                                                {row.permissions
                                                                    .length -
                                                                    5}{" "}
                                                                lainnya
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap text-right">
                                                    <IconButton
                                                        aria-label="actions"
                                                        onClick={(e) =>
                                                            handleMenuOpen(
                                                                row.id,
                                                                e
                                                            )
                                                        }
                                                        size="small"
                                                        sx={{
                                                            width: 36,
                                                            height: 36,
                                                            color: "rgb(100 116 139)",
                                                            "&:hover": {
                                                                backgroundColor:
                                                                    "rgb(241 245 249)",
                                                                color: "rgb(15 23 42)",
                                                            },
                                                        }}
                                                    >
                                                        <FaEllipsisV className="h-3.5 w-3.5" />
                                                    </IconButton>
                                                    <Menu
                                                        anchorEl={
                                                            anchorEls[row.id]
                                                        }
                                                        open={Boolean(
                                                            anchorEls[row.id]
                                                        )}
                                                        onClose={() =>
                                                            handleMenuClose(
                                                                row.id
                                                            )
                                                        }
                                                        anchorOrigin={{
                                                            vertical: "bottom",
                                                            horizontal: "right",
                                                        }}
                                                        transformOrigin={{
                                                            vertical: "top",
                                                            horizontal: "right",
                                                        }}
                                                        PaperProps={{
                                                            elevation: 0,
                                                            sx: {
                                                                mt: 1,
                                                                minWidth: 184,
                                                                borderRadius:
                                                                    "14px",
                                                                overflow:
                                                                    "hidden",
                                                                border: "1px solid rgb(226 232 240)",
                                                                boxShadow:
                                                                    "0 12px 32px -12px rgb(15 23 42 / 0.18)",
                                                                "& .MuiMenuItem-root":
                                                                    {
                                                                        py: 1,
                                                                        mx: 0.5,
                                                                        borderRadius:
                                                                            "8px",
                                                                    },
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
                                                            className="text-slate-700"
                                                        >
                                                            <ListItemIcon
                                                                sx={{
                                                                    minWidth: 32,
                                                                }}
                                                            >
                                                                <FaEdit className="h-3.5 w-3.5 text-slate-500" />
                                                            </ListItemIcon>
                                                            <ListItemText
                                                                primaryTypographyProps={{
                                                                    fontSize:
                                                                        "0.875rem",
                                                                    fontWeight: 600,
                                                                    color: "rgb(51 65 85)",
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
                                                            className="text-slate-700"
                                                        >
                                                            <ListItemIcon
                                                                sx={{
                                                                    minWidth: 32,
                                                                }}
                                                            >
                                                                <FaShieldAlt className="h-3.5 w-3.5 text-brand-600" />
                                                            </ListItemIcon>
                                                            <ListItemText
                                                                primaryTypographyProps={{
                                                                    fontSize:
                                                                        "0.875rem",
                                                                    fontWeight: 600,
                                                                    color: "rgb(51 65 85)",
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
                                                            sx={{
                                                                "&:hover": {
                                                                    backgroundColor:
                                                                        "rgb(255 241 242)",
                                                                },
                                                            }}
                                                        >
                                                            <ListItemIcon
                                                                sx={{
                                                                    minWidth: 32,
                                                                }}
                                                            >
                                                                <FaTrash className="h-3.5 w-3.5 text-rose-600" />
                                                            </ListItemIcon>
                                                            <ListItemText
                                                                primaryTypographyProps={{
                                                                    fontSize:
                                                                        "0.875rem",
                                                                    fontWeight: 600,
                                                                    color: "rgb(225 29 72)",
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
                        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-500 sm:flex-row sm:px-6">
                            <div>
                                Menampilkan{" "}
                                <span className="font-semibold tabular-nums text-ink-900">
                                    {(page - 1) * rowsPerPage + 1}–
                                    {Math.min(page * rowsPerPage, totalRows)}
                                </span>{" "}
                                dari{" "}
                                <span className="font-semibold tabular-nums text-ink-900">
                                    {totalRows}
                                </span>{" "}
                                data
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    aria-label="Halaman sebelumnya"
                                    className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                                    onClick={() => setPage(page - 1)}
                                    disabled={page === 1}
                                >
                                    <FaChevronLeft className="h-3 w-3" />
                                </button>
                                {[...Array(totalPages)].map((_, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
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
                                        onClick={() => setPage(idx + 1)}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    aria-label="Halaman berikutnya"
                                    className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                                    onClick={() => setPage(page + 1)}
                                    disabled={page === totalPages}
                                >
                                    <FaChevronRight className="h-3 w-3" />
                                </button>
                            </div>
                        </div>
                    )}
                </Card>
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
                        <div className="fixed inset-0 bg-ink-950/50 backdrop-blur-sm" />
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
                                <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-2xl border border-slate-200/80 bg-white text-left align-middle shadow-lift">
                                    <div className="border-b border-slate-100 px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                                                <FaShieldAlt className="h-4 w-4" />
                                            </span>
                                            <div>
                                                <Dialog.Title className="text-base font-bold text-ink-900">
                                                    Kelola Permission
                                                </Dialog.Title>
                                                <p className="mt-0.5 text-sm text-slate-500">
                                                    Atur hak akses permission
                                                    untuk role terpilih.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-6 py-5">
                                        {modalLoading ? (
                                            <div className="flex h-40 items-center justify-center">
                                                <CircularProgress size={32} />
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <span className="font-medium text-slate-500">
                                                            Role:
                                                        </span>
                                                        <Badge tone="brand">
                                                            {modalRole?.name}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        Pilih permission yang
                                                        diizinkan untuk role
                                                        ini.
                                                    </div>
                                                </div>
                                                {allPermissions.length === 0 ? (
                                                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60">
                                                        <EmptyState
                                                            icon={FaUserShield}
                                                            title="Tidak ada permission tersedia"
                                                            description="Tambahkan permission terlebih dahulu pada modul permission."
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="grid max-h-[420px] grid-cols-1 gap-2.5 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                                                                        className={`group flex cursor-pointer items-center rounded-xl border px-3 py-2.5 transition ${
                                                                            isActive
                                                                                ? "border-brand-300 bg-brand-50/70"
                                                                                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
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
                                                                                    ? "bg-brand-600"
                                                                                    : "bg-slate-200"
                                                                            } relative inline-flex h-5 w-10 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40`}
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
                                                                                } inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform`}
                                                                            />
                                                                        </Switch>
                                                                        <div className="ml-3 min-w-0 flex-1">
                                                                            <div className="flex items-center gap-1.5">
                                                                                <span
                                                                                    className={`truncate text-sm font-semibold ${
                                                                                        isActive
                                                                                            ? "text-brand-800"
                                                                                            : "text-ink-900"
                                                                                    }`}
                                                                                >
                                                                                    {
                                                                                        perm.name
                                                                                    }
                                                                                </span>
                                                                                {isActive && (
                                                                                    <Badge tone="emerald">
                                                                                        Aktif
                                                                                    </Badge>
                                                                                )}
                                                                            </div>
                                                                            <div className="mt-0.5">
                                                                                <span className="block truncate text-xs text-slate-500">
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

                                    <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-3">
                                        <button
                                            type="button"
                                            onClick={() => setModalOpen(false)}
                                            disabled={modalSaving}
                                            className="btn-ghost"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSavePermissions}
                                            disabled={
                                                modalSaving || modalLoading
                                            }
                                            className="btn-brand min-w-[96px]"
                                        >
                                            {modalSaving ? (
                                                <CircularProgress
                                                    size={18}
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
                        <div className="fixed inset-0 bg-ink-950/50 backdrop-blur-sm" />
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
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl border border-slate-200/80 bg-white text-left align-middle shadow-lift">
                                    <div className="border-b border-slate-100 px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                                                <FaEdit className="h-4 w-4" />
                                            </span>
                                            <div>
                                                <Dialog.Title className="text-base font-bold text-ink-900">
                                                    Edit Role
                                                </Dialog.Title>
                                                <p className="mt-0.5 text-sm text-slate-500">
                                                    Perbarui nama role sesuai
                                                    kebutuhan akses.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-6 py-5">
                                        <label
                                            htmlFor="edit-role-modal-name"
                                            className="field-label"
                                        >
                                            Nama Role
                                        </label>
                                        <input
                                            id="edit-role-modal-name"
                                            type="text"
                                            className="field-input"
                                            value={editName}
                                            onChange={(e) =>
                                                setEditName(e.target.value)
                                            }
                                            required
                                            autoFocus
                                        />
                                        {editError && (
                                            <p className="field-error">
                                                {editError}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-3">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setEditModalOpen(false)
                                            }
                                            disabled={editLoading}
                                            className="btn-ghost"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleEditSave}
                                            disabled={
                                                editLoading || !editName.trim()
                                            }
                                            className="btn-brand min-w-[96px]"
                                        >
                                            {editLoading ? (
                                                <CircularProgress
                                                    size={18}
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
