import { Head, usePage } from "@inertiajs/react";
import DashboardLayout from "../../../Layouts/DashboardLayout";
import { FaUser, FaUsers, FaEnvelope, FaUserTie, FaKey } from "react-icons/fa";
import { DataGrid } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button as MuiButton, CircularProgress } from '@mui/material';
import { useState } from 'react';
import { router } from '@inertiajs/react';

function NoRowsOverlay() {
    return (
        <Box className="flex flex-col items-center justify-center h-full py-10 text-gray-400">
            <FaUser className="text-4xl mb-2 text-blue-200" />
            <div className="text-lg font-semibold">Belum ada data user.</div>
        </Box>
    );
}

export default function User() {
    const { users = [] } = usePage().props;

    // DataGrid columns
    const columns = [
        {
            field: "no",
            headerName: "No",
            width: 70,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <div className="flex h-full justify-center items-center">
                    {params.api.getRowIndexRelativeToVisibleRows(
                        params.row.id
                    ) + 1}
                </div>
            ),
            headerClassName: 'datagrid-header',
        },
        {
            field: "foto_profil",
            headerName: "Foto",
            width: 80,
            sortable: false,
            filterable: false,
            renderCell: (params) =>
                params.row.foto_profil ? (
                    <img
                        src={params.row.foto_profil}
                        alt={params.row.name}
                        className="h-10 w-10 rounded-full object-cover border border-gray-200 shadow-sm"
                    />
                ) : (
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg border border-gray-200 shadow-sm">
                        <span className="w-full text-center flex items-center justify-center">
                            {params.row.name.split(' ').map(n => n[0]).join('').substring(0,2)}
                        </span>
                    </div>
                ),
            headerClassName: 'datagrid-header',
        },
        {
            field: "name",
            headerName: "Nama",
            flex: 1,
            minWidth: 150,
            renderCell: (params) => (
                <span className="flex items-center gap-2 font-medium text-gray-900">
                    <FaUserTie className="text-blue-400" /> {params.row.name}
                </span>
            ),
            headerClassName: 'datagrid-header',
        },
        {
            field: "email",
            headerName: "Email",
            flex: 1,
            minWidth: 180,
            renderCell: (params) => (
                <span className="flex items-center gap-2 text-gray-700">
                    <FaEnvelope className="text-gray-300" /> {params.row.email}
                </span>
            ),
            headerClassName: 'datagrid-header',
        },
        {
            field: "role",
            headerName: "Role",
            flex: 1,
            minWidth: 100,
            headerClassName: 'datagrid-header',
        },
        {
            field: "jabatan",
            headerName: "Jabatan",
            flex: 1,
            minWidth: 120,
            headerClassName: 'datagrid-header',
        },
        {
            field: "kedudukan",
            headerName: "Kedudukan",
            flex: 1,
            minWidth: 120,
            headerClassName: 'datagrid-header',
        },
        {
            field: 'kelola_role',
            headerName: '',
            width: 120,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <button
                    type="button"
                    onClick={() => openRoleModal(params.row)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 transition text-xs font-semibold shadow-sm"
                    title="Kelola Role"
                >
                    <FaKey className="text-white text-sm" />
                    Kelola Role
                </button>
            ),
            headerClassName: 'datagrid-header',
        },
    ];

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
        router.post(`/dashboard/user/${roleModalUser.id}/role`, { role: roleModalCurrent }, {
            onError: (errors) => {
                setRoleModalError(errors.role || "");
            },
            onFinish: () => {
                setRoleModalSaving(false);
                setRoleModalOpen(false);
            },
        });
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
            const res = await fetch('/dashboard/role?modal=1');
            const data = await res.json();
            setAllRoles(data.roles || []);
        } catch {
            setAllRoles([]);
        }
    };

    const handleCreateUser = () => {
        setCreateLoading(true);
        setCreateError({});
        router.post('/dashboard/user', {
            name: createName,
            email: createEmail,
            password: createPassword,
            role: createRole,
        }, {
            onError: (errors) => {
                setCreateError(errors || {});
            },
            onFinish: () => {
                setCreateLoading(false);
            },
            onSuccess: () => {
                setCreateModalOpen(false);
            },
        });
    };

    return (
        <>
            <Head title="User" />
            <DashboardLayout>
                {/* Header */}
                <div className="py-6 w-full mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Manajemen User</h1>
                        <button
                            onClick={openCreateModal}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow-sm transition"
                        >
                            + Tambah User
                        </button>
                    </div>
                    <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-xl shadow-lg mb-6 overflow-hidden">
                        <div className="px-6 py-8 md:px-10 md:py-10 flex flex-col md:flex-row md:items-center justify-between">
                            <div className="mb-6 md:mb-0">
                                <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center">
                                    <div className="flex items-center justify-center bg-blue-600 rounded-full w-12 h-12 mr-3">
                                        <FaUsers className="text-blue-200" />
                                    </div>
                                    Manajemen User
                                </h1>
                                <p className="mt-2 text-blue-100 max-w-2xl">
                                    Kelola data user aplikasi dengan tampilan profesional dan modern.
                                </p>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
                                    <div className="bg-blue-100 rounded-full p-3">
                                        <FaUser className="text-blue-600 text-2xl" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 font-medium">Total User</div>
                                        <div className="text-2xl font-bold text-gray-900">{users.length}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* DataGrid Table */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-0 md:p-6">
                        <div className="w-full overflow-x-auto">
                            <style>{`
                                .datagrid-header {
                                    background: #f8fafc;
                                    color: #64748b;
                                    font-weight: 600;
                                    font-size: 0.75rem;
                                    text-transform: uppercase;
                                }
                                .MuiDataGrid-root {
                                    border-radius: 1rem;
                                    border: none;
                                    font-family: inherit;
                                    background: white;
                                }
                                .MuiDataGrid-columnHeaders {
                                    border-radius: 1rem 1rem 0 0;
                                }
                                .MuiDataGrid-cell {
                                    border-bottom: 1px solid #f1f5f9;
                                }
                                .MuiDataGrid-row:hover {
                                    background: #eff6ff;
                                }
                            `}</style>
                            <DataGrid
                                autoHeight
                                rows={users}
                                columns={columns}
                                getRowId={(row) => row.id}
                                pageSize={8}
                                rowsPerPageOptions={[8, 16, 32]}
                                disableSelectionOnClick
                                slots={{ noRowsOverlay: NoRowsOverlay }}
                                sx={{
                                    fontSize: '0.97rem',
                                    background: 'white',
                                    borderRadius: '1rem',
                                    boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
                                }}
                            />
                        </div>
                    </div>
                </div>
            </DashboardLayout>
            <Dialog open={roleModalOpen} onClose={() => setRoleModalOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle className="font-bold text-lg text-gray-800 border-b">Kelola Role User</DialogTitle>
                <DialogContent className="py-4">
                    {roleModalLoading ? (
                        <div className="flex justify-center items-center h-24">
                            <CircularProgress size={32} />
                        </div>
                    ) : (
                        <form onSubmit={e => { e.preventDefault(); handleRoleModalSave(); }}>
                            <div className="mb-4">
                                <div className="text-gray-700 font-semibold mb-2">User: <span className="text-blue-700">{roleModalUser?.name}</span></div>
                                <label className="block text-gray-700 font-semibold mb-2 mt-4">Role</label>
                                <select
                                    className="border rounded px-3 py-2 w-full"
                                    value={roleModalCurrent}
                                    onChange={e => setRoleModalCurrent(e.target.value)}
                                    required
                                >
                                    <option value="">Pilih Role</option>
                                    {roleModalRoles.map((r) => (
                                        <option key={r.id} value={r.name}>{r.name}</option>
                                    ))}
                                </select>
                                {roleModalError && (
                                    <div className="text-red-500 mt-1 text-sm">{roleModalError}</div>
                                )}
                            </div>
                        </form>
                    )}
                </DialogContent>
                <DialogActions className="border-t px-4 py-3 flex justify-between">
                    <MuiButton onClick={() => setRoleModalOpen(false)} color="inherit" variant="outlined" disabled={roleModalSaving}>
                        Batal
                    </MuiButton>
                    <MuiButton onClick={handleRoleModalSave} color="primary" variant="contained" disabled={roleModalSaving || roleModalLoading || !roleModalCurrent}>
                        {roleModalSaving ? <CircularProgress size={20} color="inherit" /> : 'Simpan'}
                    </MuiButton>
                </DialogActions>
            </Dialog>
            <Dialog open={createModalOpen} onClose={() => setCreateModalOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle className="font-bold text-lg text-gray-800 border-b">Tambah User</DialogTitle>
                <DialogContent className="py-4">
                    <form onSubmit={e => { e.preventDefault(); handleCreateUser(); }}>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-2">Nama</label>
                            <input
                                type="text"
                                className="border rounded px-3 py-2 w-full"
                                value={createName}
                                onChange={e => setCreateName(e.target.value)}
                                required
                            />
                            {createError.name && <div className="text-red-500 mt-1 text-sm">{createError.name}</div>}
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-2">Email</label>
                            <input
                                type="email"
                                className="border rounded px-3 py-2 w-full"
                                value={createEmail}
                                onChange={e => setCreateEmail(e.target.value)}
                                required
                            />
                            {createError.email && <div className="text-red-500 mt-1 text-sm">{createError.email}</div>}
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-2">Password</label>
                            <input
                                type="password"
                                className="border rounded px-3 py-2 w-full"
                                value={createPassword}
                                onChange={e => setCreatePassword(e.target.value)}
                                required
                            />
                            {createError.password && <div className="text-red-500 mt-1 text-sm">{createError.password}</div>}
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-2">Role</label>
                            <select
                                className="border rounded px-3 py-2 w-full"
                                value={createRole}
                                onChange={e => setCreateRole(e.target.value)}
                                required
                            >
                                <option value="">Pilih Role</option>
                                {allRoles.map((r) => (
                                    <option key={r.id} value={r.name}>{r.name}</option>
                                ))}
                            </select>
                            {createError.role && <div className="text-red-500 mt-1 text-sm">{createError.role}</div>}
                        </div>
                    </form>
                </DialogContent>
                <DialogActions className="border-t px-4 py-3 flex justify-between">
                    <MuiButton onClick={() => setCreateModalOpen(false)} color="inherit" variant="outlined" disabled={createLoading}>
                        Batal
                    </MuiButton>
                    <MuiButton onClick={handleCreateUser} color="primary" variant="contained" disabled={createLoading || !createName || !createEmail || !createPassword || !createRole}>
                        {createLoading ? <CircularProgress size={20} color="inherit" /> : 'Simpan'}
                    </MuiButton>
                </DialogActions>
            </Dialog>
        </>
    )
}