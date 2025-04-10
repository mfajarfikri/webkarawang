import React, { useState, useEffect } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import {
    FaUserPlus,
    FaSearch,
    FaFilter,
    FaEllipsisV,
    FaEdit,
    FaTrash,
    FaEye,
    FaFileExport,
    FaFileImport,
    FaSortAmountDown,
    FaSortAmountUp,
    FaChevronLeft,
    FaChevronRight,
    FaUserTie,
    FaBuilding,
    FaPhone,
    FaEnvelope,
    FaIdCard,
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaUserCog,
    FaCheckCircle,
    FaTimesCircle,
    FaPlus,
    FaDownload,
    FaUpload,
    FaFilter as FaFilterSolid,
} from "react-icons/fa";

export default function EmployeeManagement() {
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

    // Data dummy untuk departemen
    const departments = [
        { id: "all", name: "Semua Departemen" },
        { id: "engineering", name: "Teknik" },
        { id: "operations", name: "Operasional" },
        { id: "finance", name: "Keuangan" },
        { id: "hr", name: "SDM" },
        { id: "marketing", name: "Pemasaran" },
        { id: "customer_service", name: "Layanan Pelanggan" },
    ];

    // Data dummy untuk karyawan (menggunakan data yang sudah ada)
    const employeesData = [
        {
            id: 1,
            name: "Budi Santoso",
            position: "Senior Engineer",
            department: "engineering",
            employeeId: "EMP-001",
            email: "budi.santoso@pln.co.id",
            phone: "081234567890",
            joinDate: "2018-05-15",
            status: "active",
            address: "Jl. Merdeka No. 123, Karawang",
            photo: "https://randomuser.me/api/portraits/men/1.jpg",
        },
        // ... existing employee data
    ];

    // Filter dan sort karyawan (menggunakan kode yang sudah ada)
    const filteredEmployees = employeesData
        .filter((employee) => {
            const matchDepartment =
                filterDepartment === "all" ||
                employee.department === filterDepartment;
            const matchStatus =
                filterStatus === "all" || employee.status === filterStatus;
            const matchSearch =
                employee.name
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                employee.position
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                employee.employeeId
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
        });

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
                                <button className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-lg transition-all duration-200 shadow-sm">
                                    <FaDownload className="mr-2" />
                                    Export
                                </button>
                                <button className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-lg transition-all duration-200 shadow-sm">
                                    <FaUpload className="mr-2" />
                                    Import
                                </button>
                                <button className="inline-flex items-center px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 shadow-sm font-medium">
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
                                    {departments.map((dept) => (
                                        <option key={dept.id} value={dept.id}>
                                            {dept.name}
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
                                    <option value="active">Aktif</option>
                                    <option value="inactive">
                                        Tidak Aktif
                                    </option>
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
                                    {employeesData.length}
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
                                        employeesData.filter(
                                            (e) => e.status === "active"
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
                                        employeesData.filter(
                                            (e) => e.status === "inactive"
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
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th
                                        scope="col"
                                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        <div className="flex items-center">
                                            <span>Karyawan</span>
                                            <button
                                                onClick={() =>
                                                    toggleSort("name")
                                                }
                                                className="ml-1 text-gray-400 hover:text-gray-500"
                                            >
                                                {sortField === "name" &&
                                                sortDirection === "asc" ? (
                                                    <FaSortAmountUp className="h-3 w-3" />
                                                ) : (
                                                    <FaSortAmountDown className="h-3 w-3" />
                                                )}
                                            </button>
                                        </div>
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        <div className="flex items-center">
                                            <span>Departemen</span>
                                            <button
                                                onClick={() =>
                                                    toggleSort("department")
                                                }
                                                className="ml-1 text-gray-400 hover:text-gray-500"
                                            >
                                                {sortField === "department" &&
                                                sortDirection === "asc" ? (
                                                    <FaSortAmountUp className="h-3 w-3" />
                                                ) : (
                                                    <FaSortAmountDown className="h-3 w-3" />
                                                )}
                                            </button>
                                        </div>
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell"
                                    >
                                        Kontak
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell"
                                    >
                                        <div className="flex items-center">
                                            <span>Tanggal Bergabung</span>
                                            <button
                                                onClick={() =>
                                                    toggleSort("joinDate")
                                                }
                                                className="ml-1 text-gray-400 hover:text-gray-500"
                                            >
                                                {sortField === "joinDate" &&
                                                sortDirection === "asc" ? (
                                                    <FaSortAmountUp className="h-3 w-3" />
                                                ) : (
                                                    <FaSortAmountDown className="h-3 w-3" />
                                                )}
                                            </button>
                                        </div>
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Status
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedEmployees.length > 0 ? (
                                    paginatedEmployees.map((employee) => (
                                        <tr
                                            key={employee.id}
                                            className="hover:bg-blue-50 transition-colors duration-150 cursor-pointer"
                                            onClick={() =>
                                                viewEmployee(employee)
                                            }
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <img
                                                            className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-100"
                                                            src={employee.photo}
                                                            alt={employee.name}
                                                        />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {employee.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500 flex items-center">
                                                            <FaIdCard className="mr-1 text-gray-400 h-3 w-3" />
                                                            {
                                                                employee.employeeId
                                                            }
                                                        </div>
                                                        <div className="text-sm text-gray-500 md:hidden">
                                                            {employee.position}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 font-medium">
                                                    {
                                                        departments.find(
                                                            (d) =>
                                                                d.id ===
                                                                employee.department
                                                        )?.name
                                                    }
                                                </div>
                                                <div className="text-sm text-gray-500 hidden md:block">
                                                    {employee.position}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                                                <div className="text-sm text-gray-900 flex items-center">
                                                    <FaEnvelope className="mr-1 text-gray-400 h-3 w-3" />
                                                    {employee.email}
                                                </div>
                                                <div className="text-sm text-gray-500 flex items-center">
                                                    <FaPhone className="mr-1 text-gray-400 h-3 w-3" />
                                                    {employee.phone}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                                                <div className="flex items-center">
                                                    <FaCalendarAlt className="mr-1 text-gray-400 h-3 w-3" />
                                                    {new Date(
                                                        employee.joinDate
                                                    ).toLocaleDateString(
                                                        "id-ID",
                                                        {
                                                            day: "numeric",
                                                            month: "long",
                                                            year: "numeric",
                                                        }
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        employee.status ===
                                                        "active"
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-red-100 text-red-800"
                                                    }`}
                                                >
                                                    {employee.status ===
                                                    "active" ? (
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
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div
                                                    className="relative inline-block text-left"
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                >
                                                    <button
                                                        onClick={(e) =>
                                                            toggleActionDropdown(
                                                                employee.id,
                                                                e
                                                            )
                                                        }
                                                        className="text-gray-400 hover:text-gray-500 focus:outline-none p-1 rounded-full hover:bg-gray-100"
                                                    >
                                                        <FaEllipsisV />
                                                    </button>
                                                    {actionDropdown ===
                                                        employee.id && (
                                                        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                                            <div
                                                                className="py-1 rounded-md bg-white shadow-xs"
                                                                role="menu"
                                                                aria-orientation="vertical"
                                                            >
                                                                <button
                                                                    onClick={() =>
                                                                        viewEmployee(
                                                                            employee
                                                                        )
                                                                    }
                                                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                                                    role="menuitem"
                                                                >
                                                                    <FaEye className="mr-3 h-4 w-4 text-gray-500" />
                                                                    Lihat Detail
                                                                </button>
                                                                <button
                                                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                                                    role="menuitem"
                                                                >
                                                                    <FaEdit className="mr-3 h-4 w-4 text-gray-500" />
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        confirmDelete(
                                                                            employee
                                                                        )
                                                                    }
                                                                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                                    role="menuitem"
                                                                >
                                                                    <FaTrash className="mr-3 h-4 w-4 text-red-500" />
                                                                    Hapus
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="px-6 py-10 text-center text-gray-500"
                                        >
                                            <div className="flex flex-col items-center justify-center">
                                                <FaSearch className="h-10 w-10 text-gray-300 mb-2" />
                                                <p>
                                                    Tidak ada data karyawan yang
                                                    ditemukan
                                                </p>
                                                <p className="text-sm">
                                                    Coba ubah filter atau kata
                                                    kunci pencarian
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination - Modern Style */}
                    {filteredEmployees.length > 0 && (
                        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Menampilkan{" "}
                                        <span className="font-medium">
                                            {(currentPage - 1) * itemsPerPage +
                                                1}
                                        </span>{" "}
                                        sampai{" "}
                                        <span className="font-medium">
                                            {Math.min(
                                                currentPage * itemsPerPage,
                                                filteredEmployees.length
                                            )}
                                        </span>{" "}
                                        dari{" "}
                                        <span className="font-medium">
                                            {filteredEmployees.length}
                                        </span>{" "}
                                        hasil
                                    </p>
                                </div>
                                <div>
                                    <nav
                                        className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                                        aria-label="Pagination"
                                    >
                                        <button
                                            onClick={() =>
                                                setCurrentPage((prev) =>
                                                    prev > 1 ? prev - 1 : prev
                                                )
                                            }
                                            disabled={currentPage === 1}
                                            className={`relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                                                currentPage === 1
                                                    ? "text-gray-300 cursor-not-allowed"
                                                    : "text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                                            }`}
                                        >
                                            <span className="sr-only">
                                                Previous
                                            </span>
                                            <FaChevronLeft className="h-4 w-4" />
                                        </button>

                                        {Array.from({ length: totalPages }).map(
                                            (_, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() =>
                                                        setCurrentPage(
                                                            index + 1
                                                        )
                                                    }
                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                        currentPage ===
                                                        index + 1
                                                            ? "z-10 bg-blue-600 border-blue-600 text-white"
                                                            : "bg-white border-gray-300 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                                                    }`}
                                                >
                                                    {index + 1}
                                                </button>
                                            )
                                        )}

                                        <button
                                            onClick={() =>
                                                setCurrentPage((prev) =>
                                                    prev < totalPages
                                                        ? prev + 1
                                                        : prev
                                                )
                                            }
                                            disabled={
                                                currentPage === totalPages
                                            }
                                            className={`relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                                                currentPage === totalPages
                                                    ? "text-gray-300 cursor-not-allowed"
                                                    : "text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                                            }`}
                                        >
                                            <span className="sr-only">
                                                Next
                                            </span>
                                            <FaChevronRight className="h-4 w-4" />
                                        </button>
                                    </nav>
                                </div>
                            </div>
                            <div className="flex sm:hidden justify-between w-full">
                                <button
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                            prev > 1 ? prev - 1 : prev
                                        )
                                    }
                                    disabled={currentPage === 1}
                                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                                        currentPage === 1
                                            ? "text-gray-300 bg-gray-50 cursor-not-allowed"
                                            : "text-gray-700 bg-white hover:bg-blue-50 hover:text-blue-600"
                                    }`}
                                >
                                    Sebelumnya
                                </button>
                                <span className="text-sm text-gray-700">
                                    {currentPage} dari {totalPages}
                                </span>
                                <button
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                            prev < totalPages ? prev + 1 : prev
                                        )
                                    }
                                    disabled={currentPage === totalPages}
                                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                                        currentPage === totalPages
                                            ? "text-gray-300 bg-gray-50 cursor-not-allowed"
                                            : "text-gray-700 bg-white hover:bg-blue-50 hover:text-blue-600"
                                    }`}
                                >
                                    Selanjutnya
                                </button>
                            </div>
                        </div>
                    )}
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
                                            src={currentEmployee.photo}
                                            alt={currentEmployee.name}
                                            className="h-full w-full object-cover"
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
                                            currentEmployee.status === "active"
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                        }`}
                                    >
                                        {currentEmployee.status === "active" ? (
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
                                                {currentEmployee.employeeId}
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <div className="text-xs font-medium text-gray-500 uppercase">
                                                Departemen
                                            </div>
                                            <div className="mt-1 flex items-center text-sm text-gray-900">
                                                <FaBuilding className="mr-2 text-blue-500 h-4 w-4" />
                                                {
                                                    departments.find(
                                                        (d) =>
                                                            d.id ===
                                                            currentEmployee.department
                                                    )?.name
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
        </DashboardLayout>
    );
}
