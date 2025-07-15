import DashboardLayout from "@/Layouts/DashboardLayout";
import { usePage } from "@inertiajs/react";
import { router as Inertia } from "@inertiajs/react";
import { useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Button, Box } from "@mui/material";
import { FaEdit, FaEllipsisV, FaFilter } from "react-icons/fa";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Checkbox,
    FormControlLabel,
    Button as MuiButton,
    CircularProgress,
} from "@mui/material";
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
            <div className="p-4 sm:p-6 md:p-8">
                <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">
                    Manajemen Role
                </h1>
                <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl shadow-xl border border-blue-100 p-0 md:p-0 overflow-hidden">
                    <div className="px-6 pt-6 pb-2 border-b border-blue-100 bg-white/80">
                        <h2 className="text-xl font-bold text-blue-800 mb-2">
                            Tambah Role Baru
                        </h2>
                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-col sm:flex-row gap-2 mb-4 items-start sm:items-end"
                        >
                            <div className="flex-1 w-full">
                                <input
                                    type="text"
                                    className="border border-blue-200 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition"
                                    placeholder="Nama Role"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
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
                                className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-6 py-2 rounded-lg shadow hover:from-blue-700 hover:to-blue-500 font-semibold disabled:opacity-50 w-full sm:w-auto transition"
                                disabled={loading}
                            >
                                Tambah
                            </button>
                        </form>
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
                                        setRowsPerPage(Number(e.target.value))
                                    }
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
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
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider"
                                            >
                                                Nama Role
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider"
                                            >
                                                Permission
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-center text-xs font-bold text-blue-700 uppercase tracking-wider"
                                            >
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-blue-50">
                                        {paginatedRows.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={3}
                                                    className="px-6 py-8 text-center text-gray-400 text-lg font-semibold"
                                                >
                                                    Tidak ada role.
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedRows.map((row) => (
                                                <tr
                                                    key={row.id}
                                                    className="hover:bg-blue-50 transition"
                                                >
                                                    <td
                                                        className="px-6 py-4 whitespace-nowrap text-gray-900 font-semibold text-base md:text-sm max-w-xs truncate"
                                                        title={row.name}
                                                    >
                                                        {row.name}
                                                    </td>
                                                    <td
                                                        className="px-6 py-4 whitespace-nowrap text-gray-700 text-sm max-w-lg truncate"
                                                        title={
                                                            Array.isArray(
                                                                row.permissions
                                                            )
                                                                ? row.permissions
                                                                      .map(
                                                                          (p) =>
                                                                              p.name
                                                                      )
                                                                      .join(
                                                                          ", "
                                                                      )
                                                                : ""
                                                        }
                                                    >
                                                        {Array.isArray(
                                                            row.permissions
                                                        ) &&
                                                        row.permissions.length >
                                                            0
                                                            ? row.permissions
                                                                  .map(
                                                                      (p) =>
                                                                          p.name
                                                                  )
                                                                  .join(", ")
                                                            : "-"}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <div className="flex justify-center items-center gap-1">
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
                                                                    p: 0.5,
                                                                    "&:hover": {
                                                                        backgroundColor:
                                                                            "#e5e7eb",
                                                                    },
                                                                }}
                                                            >
                                                                <FaEllipsisV
                                                                    className="text-gray-500"
                                                                    style={{
                                                                        width: "1rem",
                                                                        height: "1rem",
                                                                    }}
                                                                />
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
                                                                    vertical:
                                                                        "top",
                                                                    horizontal:
                                                                        "right",
                                                                }}
                                                                PaperProps={{
                                                                    style: {
                                                                        minWidth: 180,
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
                                                                >
                                                                    <ListItemIcon
                                                                        sx={{
                                                                            minWidth: 32,
                                                                        }}
                                                                    >
                                                                        <svg
                                                                            width="20"
                                                                            height="20"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            strokeWidth="1.7"
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            className="text-gray-500"
                                                                            viewBox="0 0 24 24"
                                                                        >
                                                                            <path d="M12 20h9" />
                                                                            <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                                                                        </svg>
                                                                    </ListItemIcon>
                                                                    <ListItemText>
                                                                        Edit
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
                                                                >
                                                                    <ListItemIcon
                                                                        sx={{
                                                                            minWidth: 32,
                                                                        }}
                                                                    >
                                                                        <svg
                                                                            width="20"
                                                                            height="20"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            strokeWidth="1.7"
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            className="text-blue-500"
                                                                            viewBox="0 0 24 24"
                                                                        >
                                                                            <circle
                                                                                cx="15"
                                                                                cy="9"
                                                                                r="3"
                                                                            />
                                                                            <path d="M2 15.5V17a2 2 0 0 0 2 2h1.5a2 2 0 0 0 2-2V15.5a6.5 6.5 0 1 1 13 0V17a2 2 0 0 1-2 2H17" />
                                                                        </svg>
                                                                    </ListItemIcon>
                                                                    <ListItemText>
                                                                        Kelola
                                                                        Permission
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
                                                                >
                                                                    <ListItemIcon
                                                                        sx={{
                                                                            minWidth: 32,
                                                                        }}
                                                                    >
                                                                        <svg
                                                                            width="20"
                                                                            height="20"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            strokeWidth="1.7"
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            className="text-red-500"
                                                                            viewBox="0 0 24 24"
                                                                        >
                                                                            <polyline points="3 6 5 6 21 6" />
                                                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                                                                            <line
                                                                                x1="10"
                                                                                y1="11"
                                                                                x2="10"
                                                                                y2="17"
                                                                            />
                                                                            <line
                                                                                x1="14"
                                                                                y1="11"
                                                                                x2="14"
                                                                                y2="17"
                                                                            />
                                                                        </svg>
                                                                    </ListItemIcon>
                                                                    <ListItemText className="text-red-600">
                                                                        Hapus
                                                                    </ListItemText>
                                                                </MenuItem>
                                                            </Menu>
                                                        </div>
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
                                    {[...Array(totalPages)].map((_, idx) => (
                                        <button
                                            key={idx}
                                            className={`px-3 py-1 rounded border ${
                                                page === idx + 1
                                                    ? "bg-blue-600 text-white border-blue-600"
                                                    : "bg-white text-gray-700 hover:bg-blue-50"
                                            }`}
                                            onClick={() => setPage(idx + 1)}
                                        >
                                            {idx + 1}
                                        </button>
                                    ))}
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
                            Nama Role
                        </label>
                        <input
                            type="text"
                            className="border rounded px-3 py-2 w-full"
                            value={filterName}
                            onChange={(e) => setFilterName(e.target.value)}
                            placeholder="Cari nama role..."
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
            <Dialog
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle className="font-bold text-lg text-gray-800 border-b">
                    Kelola Permission
                </DialogTitle>
                <DialogContent className="py-4">
                    {modalLoading ? (
                        <div className="flex justify-center items-center h-32">
                            <CircularProgress size={32} />
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <div className="mb-2 text-gray-700 font-semibold">
                                Role:{" "}
                                <span className="text-blue-700">
                                    {modalRole?.name}
                                </span>
                            </div>
                            {allPermissions.length === 0 ? (
                                <div className="text-gray-500">
                                    Tidak ada permission.
                                </div>
                            ) : (
                                allPermissions.map((perm) => (
                                    <FormControlLabel
                                        key={perm.id}
                                        control={
                                            <Checkbox
                                                checked={rolePermissions.includes(
                                                    perm.id
                                                )}
                                                onChange={() =>
                                                    handlePermissionToggle(
                                                        perm.id
                                                    )
                                                }
                                                color="primary"
                                            />
                                        }
                                        label={
                                            <span className="text-gray-800 text-base">
                                                {perm.name}
                                            </span>
                                        }
                                        className="m-0"
                                    />
                                ))
                            )}
                        </div>
                    )}
                </DialogContent>
                <DialogActions className="border-t px-4 py-3 flex justify-between">
                    <MuiButton
                        onClick={() => setModalOpen(false)}
                        color="inherit"
                        variant="outlined"
                        disabled={modalSaving}
                    >
                        Batal
                    </MuiButton>
                    <MuiButton
                        onClick={handleSavePermissions}
                        color="primary"
                        variant="contained"
                        disabled={modalSaving || modalLoading}
                    >
                        {modalSaving ? (
                            <CircularProgress size={20} color="inherit" />
                        ) : (
                            "Simpan"
                        )}
                    </MuiButton>
                </DialogActions>
            </Dialog>
            <Dialog
                open={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle className="font-bold text-lg text-gray-800 border-b">
                    Edit Role
                </DialogTitle>
                <DialogContent className="py-4">
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-2">
                            Nama Role
                        </label>
                        <input
                            type="text"
                            className="border rounded px-3 py-2 w-full"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            required
                            autoFocus
                        />
                        {editError && (
                            <div className="text-red-500 mt-1 text-sm">
                                {editError}
                            </div>
                        )}
                    </div>
                </DialogContent>
                <DialogActions className="border-t px-4 py-3 flex justify-between">
                    <MuiButton
                        onClick={() => setEditModalOpen(false)}
                        color="inherit"
                        variant="outlined"
                        disabled={editLoading}
                    >
                        Batal
                    </MuiButton>
                    <MuiButton
                        onClick={handleEditSave}
                        color="primary"
                        variant="contained"
                        disabled={editLoading || !editName.trim()}
                    >
                        {editLoading ? (
                            <CircularProgress size={20} color="inherit" />
                        ) : (
                            "Simpan"
                        )}
                    </MuiButton>
                </DialogActions>
            </Dialog>
        </DashboardLayout>
    );
}
