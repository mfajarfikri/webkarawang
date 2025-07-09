import DashboardLayout from '@/Layouts/DashboardLayout';
import { usePage } from '@inertiajs/react'
import { router as Inertia } from '@inertiajs/react'
import { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Box } from '@mui/material';
import { FaEdit, FaEllipsisV } from 'react-icons/fa';
import { Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, FormControlLabel, Button as MuiButton, CircularProgress } from '@mui/material';
import { useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { useRef } from 'react';

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

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        Inertia.post("/dashboard/roles", { name }, {
            onFinish: () => {
                setLoading(false);
                setName("");
            },
        });
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
            const res = await fetch(`/dashboard/role/${role.id}/permissions?modal=1`);
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
        Inertia.post(`/dashboard/role/${modalRole.id}/permissions`, { permissions: rolePermissions }, {
            onFinish: () => {
                setModalSaving(false);
                setModalOpen(false);
            },
        });
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
        Inertia.put(`/dashboard/roles/${editRole.id}`, { name: editName }, {
            onError: (errors) => {
                setEditError(errors.name || "");
            },
            onFinish: () => {
                setEditLoading(false);
                setEditModalOpen(false);
            },
        });
    };

    const handleMenuOpen = (id, event) => {
        setAnchorEls((prev) => ({ ...prev, [id]: event.currentTarget }));
    };
    const handleMenuClose = (id) => {
        setAnchorEls((prev) => ({ ...prev, [id]: null }));
    };

    // Prepare rows with permissions
    const rows = roles && roles.length > 0 ? roles.map((role) => ({
        id: role.id,
        name: role.name,
        permissions: role.permissions ? role.permissions.map(p => p.name).join(', ') : '',
    })) : [];

    const columns = [
        {
            field: 'name',
            headerName: 'Nama Role',
            flex: 1,
            minWidth: 120,
            renderCell: (params) => (
                <span className="text-gray-800 text-base md:text-sm font-semibold truncate w-full block" title={params.value}>
                    {params.value}
                </span>
            ),
        },
        {
            field: 'permissions',
            headerName: 'Permission',
            flex: 2,
            minWidth: 180,
            renderCell: (params) => (
                <span className="text-gray-600 text-sm block truncate" title={params.value}>
                    {params.value && params.value.length > 0 ? params.value : '-'}
                </span>
            ),
        },
        {
            field: 'actions',
            headerName: '',
            minWidth: 60,
            flex: 0,
            sortable: false,
            filterable: false,
            align: 'center',
            renderCell: (params) => (
                <>
                    <div className="flex justify-center items-center">
                    <IconButton
                        aria-label="actions"
                        onClick={(e) => handleMenuOpen(params.row.id, e)}
                        size="small"
                        sx={{
                            p: 0.5,
                            '&:hover': { backgroundColor: '#e5e7eb' },
                        }}
                    >
                        <FaEllipsisV
                            className="text-gray-500"
                            style={{
                                width: '1rem',
                                height: '1rem',
                                minWidth: '1rem',
                                minHeight: '1rem',
                                maxWidth: '1.25rem',
                                maxHeight: '1.25rem',
                            }}
                        />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEls[params.row.id]}
                        open={Boolean(anchorEls[params.row.id])}
                        onClose={() => handleMenuClose(params.row.id)}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        PaperProps={{ style: { minWidth: 180 } }}
                    >
                        <MenuItem onClick={() => { handleMenuClose(params.row.id); openEditModal(params.row); }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                                {/* Modern simple pencil icon */}
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500" viewBox="0 0 24 24">
                                    <path d="M12 20h9" />
                                    <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                                </svg>
                            </ListItemIcon>
                            <ListItemText>Edit</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={() => { handleMenuClose(params.row.id); openPermissionModal(params.row); }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                                {/* Modern simple key icon */}
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500" viewBox="0 0 24 24">
                                    <circle cx="15" cy="9" r="3" />
                                    <path d="M2 15.5V17a2 2 0 0 0 2 2h1.5a2 2 0 0 0 2-2V15.5a6.5 6.5 0 1 1 13 0V17a2 2 0 0 1-2 2H17" />
                                </svg>
                            </ListItemIcon>
                            <ListItemText>Kelola Permission</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={() => { handleMenuClose(params.row.id); handleDelete(params.row.id); }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                                {/* Modern simple trash icon */}
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="text-red-500" viewBox="0 0 24 24">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                                    <line x1="10" y1="11" x2="10" y2="17" />
                                    <line x1="14" y1="11" x2="14" y2="17" />
                                </svg>
                            </ListItemIcon>
                            <ListItemText className="text-red-600">Hapus</ListItemText>
                        </MenuItem>
                    </Menu>
                    </div>
                </>
            ),
        },
    ];

    return (
        <DashboardLayout title="Manajemen Role">
            <div className="p-4 sm:p-6 md:p-8">
                <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">Manajemen Role</h1>
                <div className="bg-white rounded-lg shadow p-4 mb-8">
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 items-start sm:items-end">
                        <div className="flex-1 w-full">
                            <input
                                type="text"
                                className="border rounded px-3 py-2 w-full"
                                placeholder="Nama Role"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                            {errors && errors.name && (
                                <div className="text-red-500 mt-1 text-sm">{errors.name}</div>
                            )}
                        </div>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 w-full sm:w-auto"
                            disabled={loading}
                        >
                            Tambah
                        </button>
                    </form>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="overflow-x-auto">
                        <div style={{ minWidth: 400, width: '100%' }}>
                            <DataGrid
                                rows={rows}
                                columns={columns}
                                pageSize={10}
                                rowsPerPageOptions={[10, 25, 50]}
                                disableSelectionOnClick
                                autoHeight
                                sx={{
                                    border: 0,
                                    fontFamily: 'inherit',
                                    fontSize: { xs: '0.95rem', sm: '1rem' },
                                    '& .MuiDataGrid-columnHeaders': {
                                        backgroundColor: '#f3f4f6',
                                        color: '#374151',
                                        fontWeight: 'bold',
                                    },
                                    '& .MuiDataGrid-row:hover': {
                                        backgroundColor: '#f9fafb',
                                    },
                                    '& .MuiDataGrid-cell': {
                                        py: { xs: 1, sm: 1.5 },
                                    },
                                    '& .MuiDataGrid-footerContainer': {
                                        backgroundColor: '#f9fafb',
                                    },
                                }}
                                localeText={{
                                    noRowsLabel: 'Tidak ada role.',
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle className="font-bold text-lg text-gray-800 border-b">Kelola Permission</DialogTitle>
                <DialogContent className="py-4">
                    {modalLoading ? (
                        <div className="flex justify-center items-center h-32">
                            <CircularProgress size={32} />
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <div className="mb-2 text-gray-700 font-semibold">Role: <span className="text-blue-700">{modalRole?.name}</span></div>
                            {allPermissions.length === 0 ? (
                                <div className="text-gray-500">Tidak ada permission.</div>
                            ) : (
                                allPermissions.map((perm) => (
                                    <FormControlLabel
                                        key={perm.id}
                                        control={
                                            <Checkbox
                                                checked={rolePermissions.includes(perm.id)}
                                                onChange={() => handlePermissionToggle(perm.id)}
                                                color="primary"
                                            />
                                        }
                                        label={<span className="text-gray-800 text-base">{perm.name}</span>}
                                        className="m-0"
                                    />
                                ))
                            )}
                        </div>
                    )}
                </DialogContent>
                <DialogActions className="border-t px-4 py-3 flex justify-between">
                    <MuiButton onClick={() => setModalOpen(false)} color="inherit" variant="outlined" disabled={modalSaving}>
                        Batal
                    </MuiButton>
                    <MuiButton onClick={handleSavePermissions} color="primary" variant="contained" disabled={modalSaving || modalLoading}>
                        {modalSaving ? <CircularProgress size={20} color="inherit" /> : 'Simpan'}
                    </MuiButton>
                </DialogActions>
            </Dialog>
            <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle className="font-bold text-lg text-gray-800 border-b">Edit Role</DialogTitle>
                <DialogContent className="py-4">
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-2">Nama Role</label>
                        <input
                            type="text"
                            className="border rounded px-3 py-2 w-full"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            required
                            autoFocus
                        />
                        {editError && (
                            <div className="text-red-500 mt-1 text-sm">{editError}</div>
                        )}
                    </div>
                </DialogContent>
                <DialogActions className="border-t px-4 py-3 flex justify-between">
                    <MuiButton onClick={() => setEditModalOpen(false)} color="inherit" variant="outlined" disabled={editLoading}>
                        Batal
                    </MuiButton>
                    <MuiButton onClick={handleEditSave} color="primary" variant="contained" disabled={editLoading || !editName.trim()}>
                        {editLoading ? <CircularProgress size={20} color="inherit" /> : 'Simpan'}
                    </MuiButton>
                </DialogActions>
            </Dialog>
        </DashboardLayout>
    );
} 