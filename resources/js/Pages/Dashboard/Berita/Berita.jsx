import React, {
    useState,
    useEffect,
    useCallback,
    useMemo,
    useRef,
} from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, usePage } from "@inertiajs/react";
import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaUser,
    FaSearch,
    FaSpinner,
    FaNewspaper,
    FaEllipsisV,
    FaTimes,
    FaCalendar,
    FaChevronLeft,
    FaChevronRight,
    FaThLarge,
    FaList,
    FaTable,
    FaExclamationTriangle,
    FaInbox,
} from "react-icons/fa";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useSnackbar } from "notistack";
import { generateExcerpt } from "@/utils/editorParser";
import axios from "axios";

export default function Berita({ berita: initialBerita }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [berita, setBerita] = useState(initialBerita || "");
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [beritaToDelete, setBeritaToDelete] = useState(null);
    const { enqueueSnackbar } = useSnackbar();
    const { csrf_token } = usePage().props;
    const [actionDropdown, setActionDropdown] = useState(null);
    const [viewMode, setViewMode] = useState("grid");
    const [pagination, setPagination] = useState({
        current_page: initialBerita?.current_page || 1,
        last_page: initialBerita?.last_page || 1,
        per_page: initialBerita?.per_page || 10,
        total: initialBerita?.total || 0,
        from: initialBerita?.from || 0,
        to: initialBerita?.to || 0,
    });

    const deleteTitleId = useMemo(() => "delete-berita-title", []);
    const deleteDescId = useMemo(() => "delete-berita-desc", []);
    const statusId = useMemo(() => "berita-status", []);
    const tablistRef = useRef(null);

    // Fungsi debounce untuk menunda eksekusi fungsi
    const debounce = (func, delay) => {
        let debounceTimer;
        return function () {
            const context = this;
            const args = arguments;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(context, args), delay);
        };
    };
    // Fungsi pencarian dengan debounce
    const handleSearch = debounce((e) => {
        setSearchTerm(e.target.value);
    }, 300);

    // Fungsi untuk reset pencarian
    const resetSearch = () => {
        const inputElement = document.getElementById("search-input");
        if (inputElement) inputElement.value = "";
        setSearchTerm("");
    };

    // Fetch berita with pagination
    const fetchBerita = useCallback(
        async (page = 1) => {
            setIsLoading(true);
            setLoadError("");
            try {
                const response = await axios.get(
                    route("api.berita.index", { page }),
                );
                setBerita(response.data.data);
                setPagination({
                    current_page: response.data.data.current_page,
                    last_page: response.data.data.last_page,
                    per_page: response.data.data.per_page,
                    total: response.data.data.total,
                    from: response.data.data.from,
                    to: response.data.data.to,
                });
            } catch (error) {
                console.error("Error fetching berita:", error);
                setLoadError(
                    error.response?.data?.message || "Gagal memuat data berita",
                );
                enqueueSnackbar("Gagal memuat data berita", {
                    variant: "error",
                    anchorOrigin: {
                        vertical: "bottom",
                        horizontal: "left",
                    },
                });
            } finally {
                setIsLoading(false);
            }
        },
        [enqueueSnackbar],
    );

    // Handle page change
    const handlePageChange = (page) => {
        fetchBerita(page);
    };

    // Load initial data
    useEffect(() => {
        if (!initialBerita) {
            fetchBerita(1);
        }
    }, [fetchBerita, initialBerita]);

    const filteredBerita = searchTerm
        ? berita?.data?.filter(
              (item) =>
                  item.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  item.user.name
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                  item.tema?.nama
                      ?.toLowerCase()
                      .includes(searchTerm.toLowerCase()),
          ) || []
        : berita?.data || [];

    const hasData = filteredBerita.length > 0;

    // Perubahan signifikan: helper aman untuk thumbnail (mencegah JSON.parse error).
    const getThumbnailUrl = (item) => {
        try {
            if (!item?.gambar) return "/img/heroBerita.jpg";
            if (typeof item.gambar === "string") {
                const arr = JSON.parse(item.gambar);
                if (Array.isArray(arr) && arr.length > 0)
                    return `/storage/berita/${arr[0]}`;
                return "/img/heroBerita.jpg";
            }
            if (Array.isArray(item.gambar) && item.gambar.length > 0)
                return `/storage/berita/${item.gambar[0]}`;
            return "/img/heroBerita.jpg";
        } catch {
            return "/img/heroBerita.jpg";
        }
    };

    const formatDateShort = (value) => {
        try {
            return format(new Date(value), "d MMM yyyy", { locale: id });
        } catch {
            return "-";
        }
    };

    // Perubahan signifikan: view switcher (list/grid/table) + keyboard navigation.
    const viewTabs = useMemo(
        () => [
            { id: "list", label: "List", icon: FaList },
            { id: "grid", label: "Grid", icon: FaThLarge },
            { id: "table", label: "Table", icon: FaTable },
        ],
        [],
    );

    const onTabKeyDown = (e) => {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
        e.preventDefault();
        const idx = viewTabs.findIndex((t) => t.id === viewMode);
        const nextIdx =
            e.key === "ArrowLeft"
                ? (idx - 1 + viewTabs.length) % viewTabs.length
                : (idx + 1) % viewTabs.length;
        const next = viewTabs[nextIdx];
        setViewMode(next.id);
        const btn = tablistRef.current?.querySelector(
            `[data-view-tab="${next.id}"]`,
        );
        btn?.focus();
    };

    const renderLoading = () => {
        const common =
            "rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden";
        if (viewMode === "table") {
            return (
                <div className={`${common} animate-pulse`} aria-hidden="true">
                    <div className="border-b border-slate-100 px-6 py-4">
                        <div className="h-4 w-44 rounded bg-slate-200" />
                    </div>
                    <div className="p-6 space-y-3">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-10 rounded-xl bg-slate-100"
                            />
                        ))}
                    </div>
                </div>
            );
        }

        if (viewMode === "list") {
            return (
                <div className="space-y-3" aria-hidden="true">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div
                            key={i}
                            className={`${common} px-6 py-5 animate-pulse`}
                        >
                            <div className="flex items-start gap-4">
                                <div className="h-16 w-24 rounded-xl bg-slate-100" />
                                <div className="flex-1">
                                    <div className="h-4 w-2/3 rounded bg-slate-200" />
                                    <div className="mt-3 h-3 w-1/2 rounded bg-slate-100" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        return (
            <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                aria-hidden="true"
            >
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className={`${common} animate-pulse`}>
                        <div className="h-40 bg-slate-100" />
                        <div className="p-6">
                            <div className="h-4 w-3/4 rounded bg-slate-200" />
                            <div className="mt-3 h-3 w-full rounded bg-slate-100" />
                            <div className="mt-2 h-3 w-5/6 rounded bg-slate-100" />
                            <div className="mt-6 h-9 w-32 rounded-xl bg-slate-100" />
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderEmpty = () => {
        const title = searchTerm ? "Tidak ada hasil" : "Belum ada berita";
        const desc = searchTerm
            ? `Tidak ditemukan berita untuk pencarian "${searchTerm}".`
            : "Belum ada artikel yang tersedia saat ini.";

        return (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-8 sm:p-10 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 text-slate-500">
                    <FaInbox className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-900">
                    {title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 max-w-lg mx-auto">
                    {desc}
                </p>
                <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
                    {searchTerm ? (
                        <button
                            type="button"
                            onClick={resetSearch}
                            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-sky-700 hover:bg-sky-50 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30"
                        >
                            Reset Pencarian
                        </button>
                    ) : (
                        <Link
                            href={route("dashboard.berita.create")}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:from-sky-700 hover:to-cyan-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30"
                        >
                            <FaPlus className="h-4 w-4" aria-hidden="true" />
                            Buat Berita Pertama
                        </Link>
                    )}
                    <button
                        type="button"
                        onClick={() =>
                            fetchBerita(pagination.current_page || 1)
                        }
                        className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30"
                    >
                        Muat ulang
                    </button>
                </div>
            </div>
        );
    };

    const renderError = () => {
        return (
            <div
                className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-5 text-rose-900 shadow-sm"
                role="alert"
                aria-live="polite"
            >
                <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-rose-600">
                        <FaExclamationTriangle
                            className="h-5 w-5"
                            aria-hidden="true"
                        />
                    </div>
                    <div className="min-w-0">
                        <div className="text-sm font-bold">
                            Gagal memuat berita
                        </div>
                        <div className="mt-1 text-sm text-rose-800">
                            {loadError}
                        </div>
                        <div className="mt-4">
                            <button
                                type="button"
                                onClick={() =>
                                    fetchBerita(pagination.current_page || 1)
                                }
                                className="inline-flex items-center justify-center rounded-2xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/30"
                            >
                                Coba lagi
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const handleDelete = (berita) => {
        try {
            setIsLoading(true);

            // Gunakan axios.delete sebagai pengganti router.delete
            axios
                .delete(route("dashboard.berita.destroy", berita), {
                    headers: {
                        "X-CSRF-TOKEN": csrf_token,
                    },
                })
                .then((response) => {
                    // Update local state after successful deletion
                    setBerita((prevBerita) => ({
                        ...prevBerita,
                        data: prevBerita.data.filter(
                            (item) => item.id !== berita.id,
                        ),
                    }));

                    // Tampilkan notifikasi sukses
                    enqueueSnackbar("Berita berhasil dihapus", {
                        variant: "success",
                        anchorOrigin: {
                            vertical: "bottom",
                            horizontal: "left",
                        },
                    });
                    setShowDeleteModal(false);
                    setBeritaToDelete(null);
                })
                .catch((error) => {
                    console.error("Error deleting news:", error);
                    // Tampilkan notifikasi error
                    enqueueSnackbar(
                        "Gagal menghapus berita: " +
                            (error.response?.data?.message || "Unknown error"),
                        {
                            variant: "error",
                            anchorOrigin: {
                                vertical: "bottom",
                                horizontal: "left",
                            },
                        },
                    );
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } catch (error) {
            console.error("Error deleting news:", error);
            // Tampilkan notifikasi error jika terjadi exception
            enqueueSnackbar(
                "Gagal menghapus berita: " + (error.message || "Unknown error"),
                {
                    variant: "error",
                    anchorOrigin: {
                        vertical: "bottom",
                        horizontal: "left",
                    },
                },
            );
            setIsLoading(false);
        }
    };

    const toggleActionDropdown = (id, e) => {
        e?.stopPropagation();
        setActionDropdown(actionDropdown === id ? null : id);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActionDropdown(null);
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    return (
        <DashboardLayout>
            <Head title="Berita" />

            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="p-6 sm:p-8 border-b border-slate-100">
                        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-600 to-cyan-600 text-white shadow-sm">
                                    <FaNewspaper
                                        className="text-lg"
                                        aria-hidden="true"
                                    />
                                </div>
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                                        Manajemen Berita
                                    </h1>
                                    <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl">
                                        Kelola publikasi dan artikel PLN UPT
                                        Karawang dengan tampilan yang konsisten.
                                    </p>
                                    <div
                                        id={statusId}
                                        className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200"
                                    >
                                        <span
                                            className="inline-flex h-2 w-2 rounded-full bg-emerald-500"
                                            aria-hidden="true"
                                        />
                                        <span className="text-slate-900">
                                            {pagination?.total || 0}
                                        </span>
                                        <span>Artikel</span>
                                    </div>
                                </div>
                            </div>

                            <Link
                                href={route("dashboard.berita.create")}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:from-sky-700 hover:to-cyan-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30"
                            >
                                <FaPlus
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                />
                                Buat Berita Baru
                            </Link>
                        </div>
                    </div>

                    <div className="p-6 sm:p-8">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                            <div className="w-full lg:max-w-md">
                                <label
                                    htmlFor="search-input"
                                    className="sr-only"
                                >
                                    Cari berita
                                </label>
                                <div className="relative group">
                                    <input
                                        id="search-input"
                                        type="text"
                                        placeholder="Cari berita..."
                                        className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-3 text-[15px] text-slate-900 shadow-sm placeholder:text-slate-400 transition hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/20 focus:border-sky-500"
                                        defaultValue={searchTerm}
                                        onChange={handleSearch}
                                        aria-describedby={statusId}
                                    />
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-600 transition-colors">
                                        <FaSearch
                                            className="h-4 w-4"
                                            aria-hidden="true"
                                        />
                                    </div>
                                    {isLoading ? (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sky-600">
                                            <FaSpinner
                                                className="h-4 w-4 animate-spin"
                                                aria-hidden="true"
                                            />
                                        </div>
                                    ) : null}
                                    {searchTerm ? (
                                        <button
                                            type="button"
                                            onClick={resetSearch}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/30"
                                            aria-label="Hapus pencarian"
                                        >
                                            <FaTimes
                                                className="h-3.5 w-3.5"
                                                aria-hidden="true"
                                            />
                                        </button>
                                    ) : null}
                                </div>
                                {searchTerm ? (
                                    <div className="mt-3 text-sm text-slate-600">
                                        Menampilkan hasil pencarian untuk{" "}
                                        <span className="font-bold text-slate-900">
                                            “{searchTerm}”
                                        </span>
                                    </div>
                                ) : null}
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                                <div className="text-sm text-slate-600">
                                    <span className="font-bold text-slate-900">
                                        {filteredBerita.length}
                                    </span>{" "}
                                    artikel ditampilkan
                                </div>

                                <div
                                    ref={tablistRef}
                                    role="tablist"
                                    aria-label="Mode tampilan berita"
                                    onKeyDown={onTabKeyDown}
                                    className="inline-flex items-center rounded-2xl border border-slate-200 bg-slate-50 p-1"
                                >
                                    {viewTabs.map((t) => {
                                        const isActive = t.id === viewMode;
                                        const Icon = t.icon;
                                        return (
                                            <button
                                                key={t.id}
                                                type="button"
                                                role="tab"
                                                aria-selected={isActive}
                                                tabIndex={isActive ? 0 : -1}
                                                data-view-tab={t.id}
                                                onClick={() =>
                                                    setViewMode(t.id)
                                                }
                                                className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30 ${
                                                    isActive
                                                        ? "bg-white text-sky-700 shadow-sm"
                                                        : "text-slate-600 hover:text-slate-800 hover:bg-white/60"
                                                }`}
                                            >
                                                <Icon
                                                    className="h-3.5 w-3.5"
                                                    aria-hidden="true"
                                                />
                                                {t.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    {loadError && !hasData ? (
                        renderError()
                    ) : isLoading && !hasData ? (
                        <div>
                            <div className="sr-only" aria-live="polite">
                                Memuat daftar berita
                            </div>
                            {renderLoading()}
                        </div>
                    ) : hasData ? (
                        <>
                            {viewMode === "table" ? (
                                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full text-sm">
                                            <thead className="bg-slate-50 border-b border-slate-200">
                                                <tr>
                                                    <th
                                                        scope="col"
                                                        className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-slate-500"
                                                    >
                                                        Judul
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-slate-500"
                                                    >
                                                        Tema
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-slate-500"
                                                    >
                                                        Penulis
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-slate-500"
                                                    >
                                                        Tanggal
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-slate-500"
                                                    >
                                                        Aksi
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {filteredBerita.map((item) => (
                                                    <tr
                                                        key={item.id}
                                                        className="hover:bg-slate-50/60 transition"
                                                    >
                                                        <td className="px-6 py-4">
                                                            <Link
                                                                href={route(
                                                                    "dashboard.berita.show",
                                                                    item.slug,
                                                                )}
                                                                className="font-bold text-slate-900 hover:text-sky-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30 rounded"
                                                            >
                                                                {item.judul}
                                                            </Link>
                                                            <div className="mt-1 text-xs text-slate-500 line-clamp-1">
                                                                {(item.content_json
                                                                    ? generateExcerpt(
                                                                          item.content_json,
                                                                          120,
                                                                      )
                                                                    : item.isi
                                                                          .replace(
                                                                              /<[^>]*>/g,
                                                                              " ",
                                                                          )
                                                                          .substring(
                                                                              0,
                                                                              120,
                                                                          )
                                                                ).replace(
                                                                    /<[^>]*>/g,
                                                                    " ",
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-600">
                                                            {item.tema?.nama ||
                                                                "Umum"}
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-600">
                                                            {item.user?.name ||
                                                                "Admin"}
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-600">
                                                            {formatDateShort(
                                                                item.created_at,
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Link
                                                                    href={route(
                                                                        "dashboard.berita.edit",
                                                                        item.slug,
                                                                    )}
                                                                    className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30"
                                                                >
                                                                    <FaEdit
                                                                        className="mr-2 h-3.5 w-3.5"
                                                                        aria-hidden="true"
                                                                    />
                                                                    Edit
                                                                </Link>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setBeritaToDelete(
                                                                            item,
                                                                        );
                                                                        setShowDeleteModal(
                                                                            true,
                                                                        );
                                                                    }}
                                                                    className="inline-flex h-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-3 text-xs font-bold text-rose-700 hover:bg-rose-100 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/30"
                                                                >
                                                                    <FaTrash
                                                                        className="mr-2 h-3.5 w-3.5"
                                                                        aria-hidden="true"
                                                                    />
                                                                    Hapus
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : viewMode === "list" ? (
                                <div className="space-y-3">
                                    {filteredBerita.map((item) => (
                                        <div
                                            key={item.id}
                                            className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
                                        >
                                            <div className="p-6 flex flex-col sm:flex-row gap-5">
                                                <img
                                                    src={getThumbnailUrl(item)}
                                                    alt={item.judul}
                                                    loading="lazy"
                                                    className="h-36 w-full sm:w-52 rounded-2xl object-cover border border-slate-100"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src =
                                                            "/img/heroBerita.jpg";
                                                    }}
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                                        <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 font-semibold ring-1 ring-slate-200">
                                                            {item.tema?.nama ||
                                                                "Umum"}
                                                        </span>
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <FaUser
                                                                className="h-3 w-3"
                                                                aria-hidden="true"
                                                            />
                                                            {item.user?.name ||
                                                                "Admin"}
                                                        </span>
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <FaCalendar
                                                                className="h-3 w-3"
                                                                aria-hidden="true"
                                                            />
                                                            {formatDateShort(
                                                                item.created_at,
                                                            )}
                                                        </span>
                                                    </div>
                                                    <Link
                                                        href={route(
                                                            "dashboard.berita.show",
                                                            item.slug,
                                                        )}
                                                        className="mt-3 block text-lg font-extrabold tracking-tight text-slate-900 hover:text-sky-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30 rounded"
                                                    >
                                                        {item.judul}
                                                    </Link>
                                                    <div
                                                        className="mt-2 text-sm text-slate-600 leading-relaxed line-clamp-3"
                                                        dangerouslySetInnerHTML={{
                                                            __html: item.content_json
                                                                ? generateExcerpt(
                                                                      item.content_json,
                                                                      170,
                                                                  )
                                                                : item.isi
                                                                      .replace(
                                                                          /<[^>]*>/g,
                                                                          " ",
                                                                      )
                                                                      .substring(
                                                                          0,
                                                                          170,
                                                                      ) + "...",
                                                        }}
                                                    />
                                                    <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                                                        <Link
                                                            href={route(
                                                                "dashboard.berita.show",
                                                                item.slug,
                                                            )}
                                                            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-sky-700 hover:bg-sky-50 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30"
                                                        >
                                                            Baca Selengkapnya
                                                        </Link>
                                                        <div className="flex items-center gap-2 justify-end">
                                                            <Link
                                                                href={route(
                                                                    "dashboard.berita.edit",
                                                                    item.slug,
                                                                )}
                                                                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30"
                                                            >
                                                                <FaEdit
                                                                    className="mr-2 h-4 w-4"
                                                                    aria-hidden="true"
                                                                />
                                                                Edit
                                                            </Link>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setBeritaToDelete(
                                                                        item,
                                                                    );
                                                                    setShowDeleteModal(
                                                                        true,
                                                                    );
                                                                }}
                                                                className="inline-flex items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-700 hover:bg-rose-100 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/30"
                                                            >
                                                                <FaTrash
                                                                    className="mr-2 h-4 w-4"
                                                                    aria-hidden="true"
                                                                />
                                                                Hapus
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredBerita.map((item) => (
                                        <div
                                            key={item.id}
                                            className="group rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition overflow-hidden flex flex-col"
                                        >
                                            <div className="relative h-44 overflow-hidden">
                                                <img
                                                    src={getThumbnailUrl(item)}
                                                    alt={item.judul}
                                                    loading="lazy"
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src =
                                                            "/img/heroBerita.jpg";
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
                                                <div className="absolute left-4 top-4 inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white ring-1 ring-white/20 backdrop-blur">
                                                    {item.tema?.nama || "Umum"}
                                                </div>
                                                <div className="absolute right-4 top-4">
                                                    <button
                                                        type="button"
                                                        onClick={(e) =>
                                                            toggleActionDropdown(
                                                                item.id,
                                                                e,
                                                            )
                                                        }
                                                        aria-haspopup="menu"
                                                        aria-expanded={
                                                            actionDropdown ===
                                                            item.id
                                                        }
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-black/20 text-white ring-1 ring-white/10 backdrop-blur hover:bg-black/35 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                                                        aria-label="Buka menu aksi"
                                                    >
                                                        <FaEllipsisV
                                                            className="text-xs"
                                                            aria-hidden="true"
                                                        />
                                                    </button>
                                                    {actionDropdown ===
                                                    item.id ? (
                                                        <div
                                                            role="menu"
                                                            className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden z-10"
                                                            onClick={(e) =>
                                                                e.stopPropagation()
                                                            }
                                                        >
                                                            <div className="p-2">
                                                                <Link
                                                                    role="menuitem"
                                                                    href={route(
                                                                        "dashboard.berita.edit",
                                                                        item.slug,
                                                                    )}
                                                                    className="flex items-center rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-800 transition"
                                                                >
                                                                    <FaEdit
                                                                        className="mr-3 h-3.5 w-3.5"
                                                                        aria-hidden="true"
                                                                    />
                                                                    Edit Artikel
                                                                </Link>
                                                                <button
                                                                    role="menuitem"
                                                                    type="button"
                                                                    onClick={(
                                                                        e,
                                                                    ) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        setBeritaToDelete(
                                                                            item,
                                                                        );
                                                                        setShowDeleteModal(
                                                                            true,
                                                                        );
                                                                        setActionDropdown(
                                                                            null,
                                                                        );
                                                                    }}
                                                                    className="flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-50 transition"
                                                                >
                                                                    <FaTrash
                                                                        className="mr-3 h-3.5 w-3.5"
                                                                        aria-hidden="true"
                                                                    />
                                                                    Hapus
                                                                    Artikel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : null}
                                                </div>
                                                <div className="absolute bottom-0 left-0 right-0 p-5">
                                                    <div className="flex items-center gap-3 text-white/90 text-xs font-semibold">
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <FaUser
                                                                className="h-3 w-3 opacity-80"
                                                                aria-hidden="true"
                                                            />
                                                            <span className="truncate max-w-[140px]">
                                                                {item.user
                                                                    ?.name ||
                                                                    "Admin"}
                                                            </span>
                                                        </span>
                                                        <span
                                                            className="h-1 w-1 rounded-full bg-white/50"
                                                            aria-hidden="true"
                                                        />
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <FaCalendar
                                                                className="h-3 w-3 opacity-80"
                                                                aria-hidden="true"
                                                            />
                                                            {formatDateShort(
                                                                item.created_at,
                                                            )}
                                                        </span>
                                                    </div>
                                                    <Link
                                                        href={route(
                                                            "dashboard.berita.show",
                                                            item.slug,
                                                        )}
                                                        className="mt-2 block text-lg font-extrabold tracking-tight text-white hover:text-sky-200 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded"
                                                    >
                                                        <span className="line-clamp-2">
                                                            {item.judul}
                                                        </span>
                                                    </Link>
                                                </div>
                                            </div>
                                            <div className="p-6 flex flex-col flex-1">
                                                <div
                                                    className="text-sm text-slate-600 leading-relaxed line-clamp-3"
                                                    dangerouslySetInnerHTML={{
                                                        __html: item.content_json
                                                            ? generateExcerpt(
                                                                  item.content_json,
                                                                  150,
                                                              )
                                                            : item.isi
                                                                  .replace(
                                                                      /<[^>]*>/g,
                                                                      " ",
                                                                  )
                                                                  .substring(
                                                                      0,
                                                                      150,
                                                                  ) + "...",
                                                    }}
                                                />
                                                <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                                                    <Link
                                                        href={route(
                                                            "dashboard.berita.show",
                                                            item.slug,
                                                        )}
                                                        className="text-sm font-bold text-sky-700 hover:text-sky-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30 rounded inline-flex items-center"
                                                    >
                                                        Baca Selengkapnya
                                                        <FaChevronRight
                                                            className="ml-1.5 text-xs"
                                                            aria-hidden="true"
                                                        />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : loadError ? (
                        renderError()
                    ) : (
                        renderEmpty()
                    )}
                </div>

                {/* Pagination */}
                {!isLoading && filteredBerita.length > 0 && (
                    <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-gray-200 pt-8">
                        <div className="text-sm text-gray-500 font-medium">
                            Menampilkan{" "}
                            <span className="text-gray-900 font-bold">
                                {pagination.from}
                            </span>{" "}
                            sampai{" "}
                            <span className="text-gray-900 font-bold">
                                {pagination.to}
                            </span>{" "}
                            dari{" "}
                            <span className="text-gray-900 font-bold">
                                {pagination.total}
                            </span>{" "}
                            data
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() =>
                                    handlePageChange(
                                        pagination.current_page - 1,
                                    )
                                }
                                disabled={pagination.current_page <= 1}
                                className={`h-10 px-4 flex items-center justify-center rounded-xl border text-sm font-semibold transition-all duration-200 ${
                                    pagination.current_page <= 1
                                        ? "border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50"
                                        : "border-gray-200 text-gray-700 hover:bg-white hover:border-sky-300 hover:text-sky-600 hover:shadow-sm"
                                }`}
                            >
                                <FaChevronLeft className="mr-1.5 h-3 w-3" />
                                Sebelumnya
                            </button>

                            <div className="hidden md:flex items-center gap-1">
                                {Array.from(
                                    {
                                        length: Math.min(
                                            5,
                                            pagination.last_page,
                                        ),
                                    },
                                    (_, i) => {
                                        // Simple pagination logic for display
                                        let pageNum = i + 1;
                                        if (
                                            pagination.last_page > 5 &&
                                            pagination.current_page > 3
                                        ) {
                                            pageNum =
                                                pagination.current_page - 3 + i;
                                            if (pageNum > pagination.last_page)
                                                pageNum =
                                                    pagination.last_page -
                                                    (4 - i);
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() =>
                                                    handlePageChange(pageNum)
                                                }
                                                className={`h-10 w-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all duration-200 ${
                                                    pagination.current_page ===
                                                    pageNum
                                                        ? "bg-sky-700 text-white shadow-lg shadow-sky-700/20 scale-105"
                                                        : "text-gray-600 hover:bg-sky-50 hover:text-sky-700"
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    },
                                )}
                            </div>

                            <button
                                onClick={() =>
                                    handlePageChange(
                                        pagination.current_page + 1,
                                    )
                                }
                                disabled={
                                    pagination.current_page >=
                                    pagination.last_page
                                }
                                className={`h-10 px-4 flex items-center justify-center rounded-xl border text-sm font-semibold transition-all duration-200 ${
                                    pagination.current_page >=
                                    pagination.last_page
                                        ? "border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50"
                                        : "border-gray-200 text-gray-700 hover:bg-white hover:border-sky-300 hover:text-sky-600 hover:shadow-sm"
                                }`}
                            >
                                Selanjutnya
                                <FaChevronRight className="ml-1.5 h-3 w-3" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && beritaToDelete && (
                    <div className="fixed inset-0 z-[100] overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                            <div
                                className="fixed inset-0 transition-opacity bg-gray-900/60 backdrop-blur-sm"
                                aria-hidden="true"
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setBeritaToDelete(null);
                                }}
                            ></div>

                            <span
                                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                                aria-hidden="true"
                            >
                                &#8203;
                            </span>

                            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-3xl sm:align-middle animate-in fade-in zoom-in-95 duration-300">
                                <div className="text-center">
                                    <div className="flex items-center justify-center w-20 h-20 mx-auto bg-red-50 rounded-full ring-8 ring-red-50/50 mb-6">
                                        <FaTrash className="w-8 h-8 text-red-500" />
                                    </div>
                                    <h3 className="text-2xl font-bold leading-6 text-gray-900 mb-2">
                                        Hapus Berita?
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-6">
                                        Apakah Anda yakin ingin menghapus berita{" "}
                                        <span className="font-semibold text-gray-900">
                                            "{beritaToDelete.judul}"
                                        </span>
                                        ? Tindakan ini tidak dapat dibatalkan.
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row-reverse gap-3 mt-6">
                                    <button
                                        type="button"
                                        className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-sm font-bold rounded-xl text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-lg shadow-red-600/20 transition-all duration-200"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleDelete(beritaToDelete);
                                        }}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
                                                Menghapus...
                                            </>
                                        ) : (
                                            "Ya, Hapus Berita"
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        className="w-full inline-flex justify-center items-center px-6 py-3 border border-gray-200 text-sm font-bold rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all duration-200"
                                        onClick={() => {
                                            setShowDeleteModal(false);
                                            setBeritaToDelete(null);
                                        }}
                                    >
                                        Batal
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
