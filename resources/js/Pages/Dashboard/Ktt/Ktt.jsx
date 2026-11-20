import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { useEffect, useState, useMemo } from "react";
import {
    FaBuilding,
    FaPlus,
    FaMapMarkerAlt,
    FaChevronLeft,
    FaChevronRight,
    FaSearch,
    FaCheck,
} from "react-icons/fa";
import { Listbox } from "@headlessui/react";
import Modal from "@/Components/Modal";
import SecondaryButton from "@/Components/SecondaryButton";
import PrimaryButton from "@/Components/PrimaryButton";
import { Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import PageHeader from "@/Components/Dashboard/PageHeader";
import { Badge, Card, EmptyState } from "@/Components/Dashboard/ui";

const TIPE_TONES = {
    Khusus: "violet",
    Gold: "amber",
    Silver: "slate",
    Bronze: "amber",
    Reguler: "brand",
};

// Badge tipe KTT, selaras dengan badge tipe di halaman Anomali
function TipeBadge({ tipe }) {
    return <Badge tone={TIPE_TONES[tipe] ?? "slate"}>{tipe}</Badge>;
}

export default function Ktt({ ktts }) {
    const [open, setOpen] = useState(false);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");

    const { data, setData, reset, errors, processing } = useForm({
        name: "",
        lokasi: "",
        tipe: "",
        kapasitas: "",
        latitude: "",
        longitude: "",
    });
    const [rows, setRows] = useState([]);

    useEffect(() => {
        if (ktts) {
            setRows(ktts);
        }
    }, [ktts]);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const toastConfig = {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        axios
            .post(route("dashboard.ktt.store"), data, {
                headers: {
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    Accept: "application/json",
                },
            })
            .then((response) => {
                toast.success(
                    `KTT ${data.name} berhasil ditambahkan`,
                    toastConfig
                );
                handleClose();
                reset();

                // Fetch updated data
                axios
                    .get(route("dashboard.ktt.index"))
                    .then((response) => {
                        setRows(response.data);
                    })
                    .catch((error) => {
                        console.error("Error refreshing data:", error);
                        toast.error("Gagal memperbarui data KTT", toastConfig);
                    });
            })
            .catch((error) => {
                if (error.response?.status === 422) {
                    const validationErrors = error.response.data.errors;
                    if (validationErrors) {
                        Object.keys(validationErrors).forEach((key) => {
                            toast.error(
                                `${key}: ${validationErrors[key][0]}`,
                                toastConfig
                            );
                        });
                    } else {
                        toast.error(
                            error.response.data.message ||
                                "Validation error occurred",
                            toastConfig
                        );
                    }
                } else {
                    console.error("Full error:", error);
                    toast.error(
                        error.response?.data?.message ||
                            "Gagal menambahkan KTT",
                        toastConfig
                    );
                }
            });
    };

    const handleRowsPerPageChange = (val) => {
        setRowsPerPage(val);
        setPage(1);
    };

    const handleSearch = (val) => {
        setSearchTerm(val);
        setPage(1);
    };

    const filteredKtts = useMemo(() => {
        if (!Array.isArray(rows)) return [];

        let filtered = rows;

        if (searchTerm && searchTerm.trim() !== "") {
            const searchLower = searchTerm.toLowerCase().trim();
            filtered = filtered.filter((ktt) => {
                return (
                    (ktt.name || "").toLowerCase().includes(searchLower) ||
                    (ktt.lokasi || "").toLowerCase().includes(searchLower) ||
                    (ktt.tipe || "").toLowerCase().includes(searchLower) ||
                    (ktt.kapasitas.toString() || "")
                        .toLowerCase()
                        .includes(searchLower)
                );
            });
        }

        return filtered;
    }, [rows, searchTerm]);

    const totalRows = filteredKtts.length;
    const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));

    const paginatedData = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        return filteredKtts.slice(start, start + rowsPerPage);
    }, [filteredKtts, page, rowsPerPage]);

    const handlePrev = () => setPage((p) => Math.max(1, p - 1));
    const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

    const stats = useMemo(() => {
        const karawang = rows.filter((ktt) => ktt.lokasi === "Karawang");
        const purwakarta = rows.filter((ktt) => ktt.lokasi === "Purwakarta");

        return {
            karawang: {
                total: karawang.length,
                kapasitas: karawang.reduce(
                    (acc, curr) => acc + parseFloat(curr.kapasitas || 0),
                    0
                ),
            },
            purwakarta: {
                total: purwakarta.length,
                kapasitas: purwakarta.reduce(
                    (acc, curr) => acc + parseFloat(curr.kapasitas || 0),
                    0
                ),
            },
        };
    }, [rows]);

    const regions = [
        { key: "karawang", name: "Karawang", stat: stats.karawang },
        { key: "purwakarta", name: "Purwakarta", stat: stats.purwakarta },
    ];

    return (
        <>
            <Head title="Ktt" />
            <DashboardLayout title="KTT">
                <ToastContainer />
                <div className="space-y-6">
                    <PageHeader
                        icon={FaBuilding}
                        title="Konsumen Tegangan Tinggi"
                        description="Data konsumen tegangan tinggi (KTT) yang terdaftar dan dimonitor pada sistem UPT Karawang."
                    >
                        <button
                            onClick={handleOpen}
                            className="btn-brand"
                            aria-label="Tambah data KTT"
                        >
                            <FaPlus className="h-3.5 w-3.5" />
                            <span>Tambah KTT</span>
                        </button>
                    </PageHeader>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {regions.map((region) => (
                            <section
                                key={region.key}
                                className="surface p-5 sm:p-6"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                                            <FaMapMarkerAlt className="h-4 w-4" />
                                        </span>
                                        <div>
                                            <p className="eyebrow">
                                                Wilayah Operasional
                                            </p>
                                            <h3 className="mt-1 font-display text-lg font-bold text-ink-900">
                                                {region.name}
                                            </h3>
                                        </div>
                                    </div>
                                    <Badge
                                        tone="slate"
                                        className="hidden md:inline-flex"
                                    >
                                        ULTG {region.name}
                                    </Badge>
                                </div>
                                <dl className="mt-5 grid grid-cols-2 divide-x divide-slate-100 rounded-xl border border-slate-100 bg-slate-50/60">
                                    <div className="px-4 py-3">
                                        <dt className="text-xs font-medium text-slate-500">
                                            Total KTT
                                        </dt>
                                        <dd className="mt-1 font-display text-2xl font-extrabold tabular-nums text-ink-900">
                                            {region.stat.total}{" "}
                                            <span className="text-sm font-semibold text-slate-500">
                                                Unit
                                            </span>
                                        </dd>
                                    </div>
                                    <div className="px-4 py-3">
                                        <dt className="text-xs font-medium text-slate-500">
                                            Kapasitas
                                        </dt>
                                        <dd className="mt-1 font-display text-2xl font-extrabold tabular-nums text-ink-900">
                                            {region.stat.kapasitas}{" "}
                                            <span className="text-sm font-semibold text-slate-500">
                                                MVA
                                            </span>
                                        </dd>
                                    </div>
                                </dl>
                            </section>
                        ))}
                    </div>

                    <Card
                        padded={false}
                        clip={false}
                        title="Data KTT UPT Karawang"
                        description="Kelola data KTT di wilayah Karawang"
                        actions={
                            <div className="relative w-full sm:w-64">
                                <FaSearch className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Cari nama KTT..."
                                    className="field-input pl-10"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        handleSearch(e.target.value)
                                    }
                                    aria-label="Cari nama KTT"
                                />
                            </div>
                        }
                    >
                        <div className="overflow-x-auto">
                            <table className="data-table table-auto">
                                <thead>
                                    <tr>
                                        <th className="w-[5%]">No</th>
                                        <th className="w-[20%]">Nama KTT</th>
                                        <th className="w-[15%]">Lokasi</th>
                                        <th className="w-[15%]">Tipe</th>
                                        <th className="w-[15%]">Kapasitas</th>
                                        <th className="w-[20%]">Koordinat</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedData.length === 0 ? (
                                        <tr>
                                            <td colSpan={6}>
                                                <EmptyState
                                                    icon={FaBuilding}
                                                    title="Tidak ada data KTT."
                                                    description="Ubah kata kunci pencarian atau tambahkan KTT baru."
                                                />
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedData.map((ktt, idx) => (
                                            <tr key={ktt.id}>
                                                <td className="whitespace-nowrap tabular-nums text-slate-500">
                                                    {(page - 1) * rowsPerPage +
                                                        idx +
                                                        1}
                                                </td>
                                                <td
                                                    className="max-w-[8rem] truncate font-semibold text-ink-900 sm:max-w-[12rem]"
                                                    title={ktt.name}
                                                >
                                                    {ktt.name}
                                                </td>
                                                <td>{ktt.lokasi}</td>
                                                <td className="whitespace-nowrap">
                                                    <TipeBadge tipe={ktt.tipe} />
                                                </td>
                                                <td className="whitespace-nowrap tabular-nums">
                                                    {ktt.kapasitas}{" "}
                                                    <span className="text-slate-500">
                                                        MVA
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5 font-mono text-xs tabular-nums text-slate-600">
                                                        <FaMapMarkerAlt className="h-3 w-3 text-slate-400" />
                                                        <span>
                                                            {ktt.latitude},{" "}
                                                            {ktt.longitude}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">Tampil</span>
                                <div className="min-w-[4.5rem]">
                                    <Listbox
                                        value={rowsPerPage}
                                        onChange={handleRowsPerPageChange}
                                    >
                                        <div className="relative">
                                            <Listbox.Button className="w-full rounded-full border border-slate-200 bg-white px-3 py-1 text-left text-sm font-semibold tabular-nums text-ink-900 transition hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40">
                                                {rowsPerPage}
                                            </Listbox.Button>
                                            <Listbox.Options className="absolute bottom-full left-0 z-50 mb-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lift focus:outline-none">
                                                {[10, 20, 50].map((option) => (
                                                    <Listbox.Option
                                                        key={option}
                                                        value={option}
                                                        className={({
                                                            active,
                                                            selected,
                                                        }) =>
                                                            `relative cursor-pointer select-none px-3 py-1.5 text-sm tabular-nums transition-colors ${
                                                                active
                                                                    ? "bg-slate-50 text-ink-900"
                                                                    : selected
                                                                    ? "text-brand-700"
                                                                    : "text-slate-700"
                                                            }`
                                                        }
                                                    >
                                                        {({ selected }) => (
                                                            <div className="flex items-center">
                                                                <span
                                                                    className={`block truncate ${
                                                                        selected
                                                                            ? "font-semibold"
                                                                            : "font-normal"
                                                                    }`}
                                                                >
                                                                    {option}
                                                                </span>
                                                                {selected && (
                                                                    <span className="ml-auto flex items-center text-brand-600">
                                                                        <FaCheck
                                                                            className="h-3 w-3"
                                                                            aria-hidden="true"
                                                                        />
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </Listbox.Option>
                                                ))}
                                            </Listbox.Options>
                                        </div>
                                    </Listbox>
                                </div>
                                <span className="text-xs">/ halaman</span>
                            </div>
                            <div className="flex items-center justify-between gap-3 sm:justify-end">
                                <span>
                                    Total{" "}
                                    <span className="font-semibold tabular-nums text-ink-900">
                                        {totalRows}
                                    </span>{" "}
                                    data
                                </span>
                                <span className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={handlePrev}
                                        disabled={page === 1}
                                        className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                                        aria-label="Halaman sebelumnya"
                                    >
                                        <FaChevronLeft className="h-3 w-3" />
                                    </button>
                                    <span
                                        className="px-2 tabular-nums"
                                        aria-live="polite"
                                    >
                                        <span className="font-semibold text-ink-900">
                                            {page}
                                        </span>{" "}
                                        / {totalPages}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        disabled={page === totalPages}
                                        className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                                        aria-label="Halaman berikutnya"
                                    >
                                        <FaChevronRight className="h-3 w-3" />
                                    </button>
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>

                <Dialog
                    open={open}
                    onClose={handleClose}
                    maxWidth="md"
                    fullWidth
                    disableEnforceFocus
                    disableAutoFocus
                    PaperProps={{
                        sx: {
                            borderRadius: "1rem",
                            border: "1px solid rgb(226 232 240)",
                            boxShadow:
                                "0 24px 48px -16px rgb(15 23 42 / 0.25)",
                        },
                    }}
                >
                    <DialogTitle
                        component="div"
                        className="flex items-center justify-between gap-3 border-b border-slate-100"
                        sx={{ px: 3, py: 2 }}
                    >
                        <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                                <FaBuilding className="h-4 w-4" />
                            </span>
                            <h2 className="text-base font-bold text-ink-900">
                                Tambah Data KTT
                            </h2>
                        </div>
                        <IconButton
                            onClick={handleClose}
                            size="small"
                            sx={{
                                width: 36,
                                height: 36,
                                color: "rgb(100 116 139)",
                                "&:hover": {
                                    backgroundColor: "rgb(241 245 249)",
                                    color: "rgb(15 23 42)",
                                },
                            }}
                            aria-label="close"
                        >
                            <FaPlus className="h-3.5 w-3.5 rotate-45 transform" />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent sx={{ p: 0 }}>
                        <form
                            onSubmit={handleSubmit}
                            role="form"
                            aria-label="Form tambah data KTT"
                        >
                            <div className="grid grid-cols-1 gap-4 px-6 py-5 md:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="ktt-name"
                                        className="field-label"
                                    >
                                        Nama KTT
                                    </label>
                                    <input
                                        id="ktt-name"
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        onChange={handleChange}
                                        required
                                        className="field-input"
                                        placeholder="Masukkan nama KTT"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="ktt-lokasi"
                                        className="field-label"
                                    >
                                        Lokasi
                                    </label>
                                    <select
                                        id="ktt-lokasi"
                                        name="lokasi"
                                        value={data.lokasi}
                                        onChange={handleChange}
                                        required
                                        className="field-input"
                                    >
                                        <option value="">Pilih Lokasi</option>
                                        <option value="Karawang">
                                            Karawang
                                        </option>
                                        <option value="Purwakarta">
                                            Purwakarta
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="ktt-tipe"
                                        className="field-label"
                                    >
                                        Tipe
                                    </label>
                                    <select
                                        id="ktt-tipe"
                                        name="tipe"
                                        value={data.tipe}
                                        onChange={handleChange}
                                        required
                                        className="field-input"
                                    >
                                        <option value="">Pilih Tipe</option>
                                        <option value="Khusus">Khusus</option>
                                        <option value="Gold">Gold</option>
                                        <option value="Silver">Silver</option>
                                        <option value="Bronze">Bronze</option>
                                        <option value="Reguler">Reguler</option>
                                        <option value="<30">&lt;30</option>
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="ktt-kapasitas"
                                        className="field-label"
                                    >
                                        Kapasitas
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="ktt-kapasitas"
                                            type="number"
                                            name="kapasitas"
                                            value={data.kapasitas}
                                            onChange={handleChange}
                                            required
                                            min="0"
                                            className="field-input pr-14"
                                            placeholder="Masukkan kapasitas"
                                        />
                                        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">
                                            MVA
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="ktt-latitude"
                                        className="field-label"
                                    >
                                        Latitude
                                    </label>
                                    <input
                                        id="ktt-latitude"
                                        type="number"
                                        name="latitude"
                                        value={data.latitude}
                                        onChange={handleChange}
                                        required
                                        step="any"
                                        className="field-input"
                                        placeholder="Masukkan latitude"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="ktt-longitude"
                                        className="field-label"
                                    >
                                        Longitude
                                    </label>
                                    <input
                                        id="ktt-longitude"
                                        type="number"
                                        name="longitude"
                                        value={data.longitude}
                                        onChange={handleChange}
                                        required
                                        step="any"
                                        className="field-input"
                                        placeholder="Masukkan longitude"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-3">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="btn-ghost"
                                >
                                    Batal
                                </button>
                                <button type="submit" className="btn-brand">
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </DashboardLayout>
        </>
    );
}
