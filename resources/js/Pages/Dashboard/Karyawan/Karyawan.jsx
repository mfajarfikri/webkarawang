import React, { useState, useEffect } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import { router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import {
    FaSearch,
    FaEdit,
    FaTrash,
    FaUserTie,
    FaBuilding,
    FaPhone,
    FaEnvelope,
    FaIdCard,
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaCheckCircle,
    FaTimesCircle,
    FaPlus,
    FaDownload,
    FaUpload,
    FaFilter as FaFilterSolid,
} from "react-icons/fa";
import { DataGrid } from "@mui/x-data-grid";
import { Chip } from "@mui/material";

export default function EmployeeManagement() {
    const { props } = usePage();
    const { karyawan, departments } = props;
    const { auth } = usePage().props;
    const [searchQuery, setSearchQuery] = useState("");
    const [filterDepartment, setFilterDepartment] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [sortField, setSortField] = useState("name");
    const [sortDirection, setSortDirection] = useState("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
    const [currentEmployee, setCurrentEmployee] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);
    const [actionDropdown, setActionDropdown] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [importError, setImportError] = useState(null);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [newEmployee, setNewEmployee] = useState({
        name: "",
        nip: "",
        email: "",
        phone: "",
        department_id: "",
        jenis_kelamin: "",
        joinDate: "",
        address: "",
        is_active: 1,
        foto_profil: null,
    });

    // Filter dan sort karyawan (menggunakan kode yang sudah ada)
    const filteredEmployees = Array.isArray(karyawan)
        ? karyawan
              .filter((employee) => {
                  const matchDepartment =
                      filterDepartment === "all" ||
                      employee.department.nama_department === filterDepartment;
                  const matchStatus =
                      filterStatus === "all" ||
                      employee.is_active === parseInt(filterStatus);
                  const matchSearch =
                      employee.name
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()) ||
                      employee.department.nama_department
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase());
                  return matchDepartment && matchStatus && matchSearch;
              })
              .sort((a, b) => {
                  if (sortField === "name") {
                      return sortDirection === "asc"
                          ? a.name.localeCompare(b.name)
                          : b.name.localeCompare(a.name);
                  } else if (sortField === "department") {
                      return sortDirection === "asc"
                          ? a.department.localeCompare(b.department)
                          : b.department.localeCompare(a.department);
                  } else if (sortField === "joinDate") {
                      return sortDirection === "asc"
                          ? new Date(a.joinDate) - new Date(b.joinDate)
                          : new Date(b.joinDate) - new Date(a.joinDate);
                  }
                  return 0;
              })
        : [];

    // Pagination (menggunakan kode yang sudah ada)
    const itemsPerPage = 5;
    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
    const paginatedEmployees = filteredEmployees.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Fungsi-fungsi yang sudah ada
    const toggleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const viewEmployee = (employee) => {
        setCurrentEmployee(employee);
        setEmployeeModalOpen(true);
    };

    const confirmDelete = (employee) => {
        setEmployeeToDelete(employee);
        setDeleteModalOpen(true);
    };

    const handleDelete = () => {
        console.log(`Deleting employee with ID: ${employeeToDelete.id}`);
        setDeleteModalOpen(false);
        setEmployeeToDelete(null);
    };

    const toggleActionDropdown = (employeeId, e) => {
        e?.stopPropagation();
        if (actionDropdown === employeeId) {
            setActionDropdown(null);
        } else {
            setActionDropdown(employeeId);
        }
    };

    const columns = [
        { field: "nip", headerName: "NIP", flex: 1 },
        { field: "name", headerName: "Nama", flex: 1 },
        { field: "email", headerName: "Email", flex: 1 },
        {
            field: "jenis_kelamin",
            headerName: "Jenis Kelamin",
            flex: 1,
            valueGetter: (params) => {
                if (!params || !params.row) return "-";
                return params.row.jenis_kelamin === "L"
                    ? "Laki-laki"
                    : "Perempuan";
            },
        },
        {
            field: "jabatan",
            headerName: "Jabatan",
            flex: 1,
            valueGetter: (params) => {
                if (!params || !params.row) return "-";
                return params.row.jabatan?.nama ?? "-";
            },
        },
        {
            field: "department",
            headerName: "Department",
            flex: 1,
            renderCell: (params) => (
                <span>{params.row.department?.nama ?? "-"}</span>
            ),
        },
        {
            field: "kedudukan",
            headerName: "Kedudukan",
            flex: 1,
        },
        {
            field: "is_active",
            headerName: "Status",
            flex: 1,
            renderCell: (params) => (
                <Chip
                    label={params.value ? "Aktif" : "Tidak Aktif"}
                    color={params.value ? "success" : "default"}
                    size="small"
                />
            ),
        },
    ];

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setActionDropdown(null);
        };

        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    const handleImport = (e) => {
        e.preventDefault();
        if (!selectedFile) {
            setImportError("Please select a file");
            return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);

        router.post(route("karyawan.import"), formData, {
            onSuccess: () => {
                setImportModalOpen(false);
                setSelectedFile(null);
                setImportError(null);
            },
            onError: (errors) => {
                setImportError(errors.file || "Failed to import file");
            },
        });
    };

    const downloadTemplate = () => {
        window.location.href = route("karyawan.download-template");
    };

    const handleAddEmployee = (e) => {
        e.preventDefault();

        const formData = new FormData();
        Object.keys(newEmployee).forEach((key) => {
            formData.append(key, newEmployee[key]);
        });

        router.post(route("karyawan.store"), formData, {
            onSuccess: () => {
                setAddModalOpen(false);
                setNewEmployee({
                    name: "",
                    nip: "",
                    email: "",
                    phone: "",
                    department_id: "",
                    jenis_kelamin: "",
                    joinDate: "",
                    address: "",
                    is_active: 1,
                    foto_profil: null,
                });
            },
        });
    };

    return (
        <DashboardLayout>
            <Head title="Manajemen Karyawan" />

            <div className="py-6 w-full mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header dengan gradient background */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg mb-6 overflow-hidden">
                    <div className="px-6 py-8 md:px-10 md:py-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between">
                            <div className="mb-6 md:mb-0">
                                <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center">
                                    <div className="flex items-center justify-center bg-blue-500 rounded-full w-12 h-12 mr-3">
                                        <FaUserTie className="text-blue-200" />
                                    </div>
                                    Manajemen Karyawan
                                </h1>
                                <p className="mt-2 text-blue-100 max-w-2xl">
                                    Kelola data karyawan PLN UPT Karawang dengan
                                    mudah dan efisien
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={downloadTemplate}
                                    className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-lg transition-all duration-200 shadow-sm"
                                >
                                    <FaDownload className="mr-2" />
                                    Download Template
                                </button>
                                <button
                                    onClick={() => setImportModalOpen(true)}
                                    className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-lg transition-all duration-200 shadow-sm"
                                >
                                    <FaUpload className="mr-2" />
                                    Import
                                </button>
                                <button
                                    onClick={() => setAddModalOpen(true)}
                                    className="inline-flex items-center px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 shadow-sm font-medium"
                                >
                                    <FaPlus className="mr-2" />
                                    Tambah Karyawan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search dan Filter */}
                <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaSearch className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Cari nama, posisi, atau ID karyawan..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="md:hidden flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700"
                        >
                            <FaFilterSolid className="mr-2 text-gray-500" />
                            Filter
                        </button>

                        <div
                            className={`flex flex-col sm:flex-row gap-4 w-full md:w-auto ${
                                showFilters ? "block" : "hidden md:flex"
                            }`}
                        >
                            <div className="w-full sm:w-48">
                                <select
                                    className="block w-full pl-3 pr-10 py-2.5 text-base border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg bg-gray-50"
                                    value={filterDepartment}
                                    onChange={(e) =>
                                        setFilterDepartment(e.target.value)
                                    }
                                >
                                    <option value="all">
                                        Semua Department
                                    </option>
                                    {departments.map((dept) => (
                                        <option
                                            key={dept.id}
                                            value={dept.nama_department}
                                        >
                                            {dept.nama_department}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-full sm:w-40">
                                <select
                                    className="block w-full pl-3 pr-10 py-2.5 text-base border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg bg-gray-50"
                                    value={filterStatus}
                                    onChange={(e) =>
                                        setFilterStatus(e.target.value)
                                    }
                                >
                                    <option value="all">Semua Status</option>
                                    <option value="1">Aktif</option>
                                    <option value="0">Tidak Aktif</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistik Karyawan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow-sm p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <FaUserTie className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-sm font-medium text-gray-500">
                                    Total Karyawan
                                </h3>
                                <p className="text-2xl font-bold text-gray-900">
                                    {karyawan.length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                <FaCheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-sm font-medium text-gray-500">
                                    Karyawan Aktif
                                </h3>
                                <p className="text-2xl font-bold text-gray-900">
                                    {
                                        karyawan.filter(
                                            (e) => e.is_active === 1
                                        ).length
                                    }
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                                <FaTimesCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-sm font-medium text-gray-500">
                                    Tidak Aktif
                                </h3>
                                <p className="text-2xl font-bold text-gray-900">
                                    {
                                        karyawan.filter(
                                            (e) => e.is_active === 0
                                        ).length
                                    }
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                                <FaBuilding className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-sm font-medium text-gray-500">
                                    Departemen
                                </h3>
                                <p className="text-2xl font-bold text-gray-900">
                                    {departments.length - 1}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabel Karyawan */}
                <div className="bg-white shadow-sm rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <DataGrid
                            className="text-wrap"
                            rows={filteredEmployees}
                            columns={columns}
                            getRowId={(row) => row.id}
                            rowsPerPageOptions={[10, 20, 50]}
                            autoHeight
                            pageSize={itemsPerPage}
                            onPageChange={(newPage) => setCurrentPage(newPage)}
                        />
                    </div>
                </div>
            </div>

            {/* Modal Detail Karyawan - Redesigned */}
            {employeeModalOpen && currentEmployee && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div
                            className="fixed inset-0 transition-opacity"
                            aria-hidden="true"
                            onClick={() => setEmployeeModalOpen(false)}
                        >
                            <div className="absolute inset-0 bg-gray-800 opacity-75"></div>
                        </div>

                        <span
                            className="hidden sm:inline-block sm:align-middle sm:h-screen"
                            aria-hidden="true"
                        >
                            &#8203;
                        </span>

                        <div
                            className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="modal-headline"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header with Employee Photo */}
                            <div className="relative">
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-32 rounded-t-xl"></div>
                                <button
                                    onClick={() => setEmployeeModalOpen(false)}
                                    className="absolute top-3 right-3 text-white hover:text-gray-200 bg-black/20 hover:bg-black/30 rounded-full p-2 transition-colors"
                                >
                                    <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                                <div className="absolute -bottom-12 left-6">
                                    <div className="h-24 w-24 rounded-full border-4 border-white overflow-hidden bg-white shadow-md">
                                        <img
                                            src={
                                                currentEmployee.foto_profil ===
                                                null
                                                    ? currentEmployee.jenis_kelamin ===
                                                      "L"
                                                        ? "/storage/img/default-l.jpg"
                                                        : "/storage/img/default-p.jpg"
                                                    : currentEmployee.foto_profil
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Employee Info */}
                            <div className="pt-14 px-6 pb-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {currentEmployee.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {currentEmployee.position}
                                        </p>
                                    </div>
                                    <span
                                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            currentEmployee.is_active === 1
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                        }`}
                                    >
                                        {currentEmployee.is_active === 1 ? (
                                            <>
                                                <FaCheckCircle className="mr-1 h-3 w-3 mt-0.5" />
                                                Aktif
                                            </>
                                        ) : (
                                            <>
                                                <FaTimesCircle className="mr-1 h-3 w-3 mt-0.5" />
                                                Tidak Aktif
                                            </>
                                        )}
                                    </span>
                                </div>

                                <div className="mt-6 space-y-4">
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <div className="text-xs font-medium text-gray-500 uppercase">
                                                ID Karyawan
                                            </div>
                                            <div className="mt-1 flex items-center text-sm text-gray-900">
                                                <FaIdCard className="mr-2 text-blue-500 h-4 w-4" />
                                                {currentEmployee.nip}
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <div className="text-xs font-medium text-gray-500 uppercase">
                                                Departemen
                                            </div>
                                            <div className="mt-1 flex items-center text-sm text-gray-900">
                                                <FaBuilding className="mr-2 text-blue-500 h-4 w-4" />
                                                {
                                                    currentEmployee.department
                                                        .nama_department
                                                }
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <div className="text-xs font-medium text-gray-500 uppercase">
                                                Email
                                            </div>
                                            <div className="mt-1 flex items-center text-sm text-gray-900">
                                                <FaEnvelope className="mr-2 text-blue-500 h-4 w-4" />
                                                {currentEmployee.email}
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <div className="text-xs font-medium text-gray-500 uppercase">
                                                Telepon
                                            </div>
                                            <div className="mt-1 flex items-center text-sm text-gray-900">
                                                <FaPhone className="mr-2 text-blue-500 h-4 w-4" />
                                                {currentEmployee.phone}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <div className="text-xs font-medium text-gray-500 uppercase">
                                                Tanggal Bergabung
                                            </div>
                                            <div className="mt-1 flex items-center text-sm text-gray-900">
                                                <FaCalendarAlt className="mr-2 text-blue-500 h-4 w-4" />
                                                {new Date(
                                                    currentEmployee.joinDate
                                                ).toLocaleDateString("id-ID", {
                                                    day: "numeric",
                                                    month: "long",
                                                    year: "numeric",
                                                })}
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 p-3 rounded-lg col-span-1 sm:col-span-2">
                                            <div className="text-xs font-medium text-gray-500 uppercase">
                                                Alamat
                                            </div>
                                            <div className="mt-1 flex items-start text-sm text-gray-900">
                                                <FaMapMarkerAlt className="mr-2 text-blue-500 h-4 w-4 mt-0.5 flex-shrink-0" />
                                                <span>
                                                    {currentEmployee.address}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row-reverse gap-2">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center items-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    <FaEdit className="mr-2 h-4 w-4" />
                                    Edit Karyawan
                                </button>
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center items-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                                    onClick={() => setEmployeeModalOpen(false)}
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Konfirmasi Hapus - Redesigned */}
            {deleteModalOpen && employeeToDelete && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div
                            className="fixed inset-0 transition-opacity"
                            aria-hidden="true"
                            onClick={() => setDeleteModalOpen(false)}
                        >
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <span
                            className="hidden sm:inline-block sm:align-middle sm:h-screen"
                            aria-hidden="true"
                        >
                            &#8203;
                        </span>

                        <div
                            className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="modal-headline"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-white px-6 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <FaTrash className="h-5 w-5 text-red-600" />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3
                                            className="text-lg leading-6 font-medium text-gray-900"
                                            id="modal-headline"
                                        >
                                            Hapus Karyawan
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                Apakah Anda yakin ingin
                                                menghapus data karyawan{" "}
                                                <span className="font-semibold text-gray-700">
                                                    {employeeToDelete.name}
                                                </span>
                                                ? Tindakan ini tidak dapat
                                                dibatalkan.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-6 py-4 flex flex-col-reverse sm:flex-row-reverse gap-2 sm:gap-0">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={handleDelete}
                                >
                                    Hapus
                                </button>
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                                    onClick={() => setDeleteModalOpen(false)}
                                >
                                    Batal
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Import Modal */}
            {importModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div
                            className="fixed inset-0 transition-opacity"
                            aria-hidden="true"
                        >
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <span
                            className="hidden sm:inline-block sm:align-middle sm:h-screen"
                            aria-hidden="true"
                        >
                            &#8203;
                        </span>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <form onSubmit={handleImport}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                                Import Data Karyawan
                                            </h3>
                                            <div className="mt-4">
                                                <p className="text-sm text-gray-500 mb-4">
                                                    Silakan download template
                                                    terlebih dahulu, isi data
                                                    sesuai format, kemudian
                                                    upload file Excel.
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={downloadTemplate}
                                                    className="mb-4 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                >
                                                    <FaDownload className="mr-1 h-3 w-3" />
                                                    Download Template
                                                </button>
                                                <input
                                                    type="file"
                                                    accept=".xlsx,.xls"
                                                    onChange={(e) =>
                                                        setSelectedFile(
                                                            e.target.files[0]
                                                        )
                                                    }
                                                    className="block w-full text-sm text-gray-500
                                                        file:mr-4 file:py-2 file:px-4
                                                        file:rounded-full file:border-0
                                                        file:text-sm file:font-semibold
                                                        file:bg-blue-50 file:text-blue-700
                                                        hover:file:bg-blue-100"
                                                />
                                                {importError && (
                                                    <p className="mt-2 text-sm text-red-600">
                                                        {importError}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Import
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImportModalOpen(false);
                                            setSelectedFile(null);
                                            setImportError(null);
                                        }}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Employee Modal */}
            {addModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div
                            className="fixed inset-0 transition-opacity"
                            aria-hidden="true"
                            onClick={() => setAddModalOpen(false)}
                        >
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <span
                            className="hidden sm:inline-block sm:align-middle sm:h-screen"
                            aria-hidden="true"
                        >
                            &#8203;
                        </span>

                        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <form onSubmit={handleAddEmployee}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                                        Tambah Karyawan Baru
                                    </h3>

                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Nama Lengkap
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                value={newEmployee.name}
                                                onChange={(e) =>
                                                    setNewEmployee({
                                                        ...newEmployee,
                                                        name: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                NIP
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                value={newEmployee.nip}
                                                onChange={(e) =>
                                                    setNewEmployee({
                                                        ...newEmployee,
                                                        nip: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Departemen
                                            </label>
                                            <select
                                                required
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                value={
                                                    newEmployee.department_id
                                                }
                                                onChange={(e) =>
                                                    setNewEmployee({
                                                        ...newEmployee,
                                                        department_id:
                                                            e.target.value,
                                                    })
                                                }
                                            >
                                                <option value="">
                                                    Pilih Departemen
                                                </option>
                                                {departments.map((dept) => (
                                                    <option
                                                        key={dept.id}
                                                        value={dept.id}
                                                    >
                                                        {dept.nama_department}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                value={newEmployee.email}
                                                onChange={(e) =>
                                                    setNewEmployee({
                                                        ...newEmployee,
                                                        email: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Nomor Telepon
                                            </label>
                                            <input
                                                type="tel"
                                                required
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                value={newEmployee.phone}
                                                onChange={(e) =>
                                                    setNewEmployee({
                                                        ...newEmployee,
                                                        phone: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Jenis Kelamin
                                            </label>
                                            <select
                                                required
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                value={
                                                    newEmployee.jenis_kelamin
                                                }
                                                onChange={(e) =>
                                                    setNewEmployee({
                                                        ...newEmployee,
                                                        jenis_kelamin:
                                                            e.target.value,
                                                    })
                                                }
                                            >
                                                <option value="">
                                                    Pilih Jenis Kelamin
                                                </option>
                                                <option value="L">
                                                    Laki-laki
                                                </option>
                                                <option value="P">
                                                    Perempuan
                                                </option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Tanggal Bergabung
                                            </label>
                                            <input
                                                type="date"
                                                required
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                value={newEmployee.joinDate}
                                                onChange={(e) =>
                                                    setNewEmployee({
                                                        ...newEmployee,
                                                        joinDate:
                                                            e.target.value,
                                                    })
                                                }
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Alamat
                                            </label>
                                            <textarea
                                                required
                                                rows={3}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                value={newEmployee.address}
                                                onChange={(e) =>
                                                    setNewEmployee({
                                                        ...newEmployee,
                                                        address: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Foto Profil
                                            </label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                onChange={(e) =>
                                                    setNewEmployee({
                                                        ...newEmployee,
                                                        foto_profil:
                                                            e.target.files[0],
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Simpan
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAddModalOpen(false)}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Batal
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
