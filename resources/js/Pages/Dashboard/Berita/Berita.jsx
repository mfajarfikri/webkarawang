import React, {
    useState,
    useEffect,
    useCallback,
    useMemo,
    useRef,
} from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import PageHeader from "@/Components/Dashboard/PageHeader";
import { Badge, Card } from "@/Components/Dashboard/ui";
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
        const common = "surface overflow-hidden";
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
            <div className="surface px-6 py-14 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                    <FaInbox className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-base font-bold text-ink-900">
                    {title}
                </h3>
                <p className="mt-1 text-sm text-slate-600 max-w-sm mx-auto">
                    {desc}
                </p>
                <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
                    {searchTerm ? (
                        <button
                            type="button"
                            onClick={resetSearch}
                            className="btn-ghost"
                        >
                            Reset Pencarian
                        </button>
                    ) : (
                        <Link
                            href={route("dashboard.berita.create")}
                            className="btn-brand"
                        >
                            <FaPlus className="h-3.5 w-3.5" aria-hidden="true" />
                            Buat Berita Pertama
                        </Link>
                    )}
                    <button
                        type="button"
                        onClick={() =>
                            fetchBerita(pagination.current_page || 1)
                        }
                        className="btn-ghost"
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
                className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-5 text-rose-900"
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
                                className="btn-danger btn-sm"
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
        <DashboardLayout title="Berita">
            <Head title="Berita" />

            <div className="w-full space-y-6">
                <PageHeader
                    icon={FaNewspaper}
                    title="Manajemen Berita"
                    description="Kelola publikasi dan artikel PLN UPT Karawang dengan tampilan yang konsisten."
                >
                    <div
                        id={statusId}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-soft"
                    >
                        <span
                            className="inline-flex h-2 w-2 rounded-full bg-emerald-500"
                            aria-hidden="true"
                        />
                        <span className="text-ink-900">
                            {pagination?.total || 0}
                        </span>
                        <span>Artikel</span>
                    </div>
                    <Link
                        href={route("dashboard.berita.create")}
                        className="btn-brand"
                    >
                        <FaPlus className="h-3.5 w-3.5" aria-hidden="true" />
                        Buat Berita Baru
                    </Link>
                </PageHeader>

                <div className="surface">
                    <div className="p-4 sm:p-5">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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
                                        className="field-input pl-11 pr-12"
                                        defaultValue={searchTerm}
                                        onChange={handleSearch}
                                        aria-describedby={statusId}
                                    />
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors">
                                        <FaSearch
                                            className="h-4 w-4"
                                            aria-hidden="true"
                                        />
                                    </div>
                                    {isLoading ? (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-600">
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
                                            className="btn-icon absolute right-1.5 top-1/2 h-8 w-8 -translate-y-1/2 hover:bg-rose-50 hover:text-rose-600"
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
                                        <span className="font-bold text-ink-900">
                                            “{searchTerm}”
                                        </span>
                                    </div>
                                ) : null}
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                                <div className="text-sm text-slate-600">
                                    <span className="font-bold text-ink-900">
                                        {filteredBerita.length}
                                    </span>{" "}
                                    artikel ditampilkan
                                </div>

                                <div
                                    ref={tablistRef}
                                    role="tablist"
                                    aria-label="Mode tampilan berita"
                                    onKeyDown={onTabKeyDown}
                                    className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 p-1"
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
                                                className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 ${
                                                    isActive
                                                        ? "bg-white text-ink-900 shadow-soft"
                                                        : "text-slate-500 hover:text-ink-900"
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

                <div>
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
                                <Card padded={false}>
                                    <div className="overflow-x-auto">
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th
                                                        scope="col"
                                                    >
                                                        Judul
                                                    </th>
                                                    <th
                                                        scope="col"
                                                    >
                                                        Tema
                                                    </th>
                                                    <th
                                                        scope="col"
                                                    >
                                                        Penulis
                                                    </th>
                                                    <th
                                                        scope="col"
                                                    >
                                                        Tanggal
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="text-right"
                                                    >
                                                        Aksi
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredBerita.map((item) => (
                                                    <tr key={item.id}>
                                                        <td className="min-w-[16rem]">
                                                            <Link
                                                                href={route(
                                                                    "dashboard.berita.show",
                                                                    item.slug,
                                                                )}
                                                                className="font-semibold text-ink-900 hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 rounded"
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
                                                        <td>
                                                            <Badge tone="brand">
                                                                {item.tema
                                                                    ?.nama ||
                                                                    "Umum"}
                                                            </Badge>
                                                        </td>
                                                        <td className="whitespace-nowrap">
                                                            {item.user?.name ||
                                                                "Admin"}
                                                        </td>
                                                        <td className="whitespace-nowrap text-slate-500">
                                                            {formatDateShort(
                                                                item.created_at,
                                                            )}
                                                        </td>
                                                        <td>
                                                            <div className="flex items-center justify-end gap-1">
                                                                <Link
                                                                    href={route(
                                                                        "dashboard.berita.edit",
                                                                        item.slug,
                                                                    )}
                                                                    className="btn-ghost btn-sm"
                                                                >
                                                                    <FaEdit
                                                                        className="h-3 w-3"
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
                                                                    className="btn btn-sm text-rose-600 hover:bg-rose-50"
                                                                >
                                                                    <FaTrash
                                                                        className="h-3 w-3"
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
                                </Card>
                            ) : viewMode === "list" ? (
                                <div className="space-y-3">
                                    {filteredBerita.map((item) => (
                                        <div
                                            key={item.id}
                                            className="surface overflow-hidden transition hover:shadow-lift"
                                        >
                                            <div className="p-5 flex flex-col sm:flex-row gap-5">
                                                <img
                                                    src={getThumbnailUrl(item)}
                                                    alt={item.judul}
                                                    loading="lazy"
                                                    className="h-36 w-full sm:w-52 rounded-xl object-cover bg-slate-100"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src =
                                                            "/img/heroBerita.jpg";
                                                    }}
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                                        <Badge tone="brand">
                                                            {item.tema?.nama ||
                                                                "Umum"}
                                                        </Badge>
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
                                                        className="mt-3 block font-display text-lg font-bold tracking-tight text-ink-900 hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 rounded"
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
                                                            className="inline-flex items-center text-sm font-semibold text-brand-700 hover:text-brand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 rounded"
                                                        >
                                                            Baca Selengkapnya
                                                        </Link>
                                                        <div className="flex items-center gap-2 justify-end">
                                                            <Link
                                                                href={route(
                                                                    "dashboard.berita.edit",
                                                                    item.slug,
                                                                )}
                                                                className="btn-ghost btn-sm"
                                                            >
                                                                <FaEdit
                                                                    className="h-3 w-3"
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
                                                                className="btn btn-sm text-rose-600 hover:bg-rose-50"
                                                            >
                                                                <FaTrash
                                                                    className="h-3 w-3"
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
                                            className="group surface overflow-hidden flex flex-col transition hover:-translate-y-0.5 hover:shadow-lift"
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
                                                <div className="absolute left-4 top-4 inline-flex items-center rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-ink-900 shadow-soft">
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
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink-900 shadow-soft hover:bg-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
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
                                                            className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-slate-200/80 bg-white shadow-lift overflow-hidden z-10"
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
                                                                    className="flex items-center rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-ink-900 transition"
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
                                                        className="mt-2 block font-display text-lg font-bold tracking-tight text-white hover:text-brand-100 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded"
                                                    >
                                                        <span className="line-clamp-2">
                                                            {item.judul}
                                                        </span>
                                                    </Link>
                                                </div>
                                            </div>
                                            <div className="p-5 flex flex-col flex-1">
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
                                                <div className="mt-auto pt-5 flex items-center justify-between">
                                                    <Link
                                                        href={route(
                                                            "dashboard.berita.show",
                                                            item.slug,
                                                        )}
                                                        className="text-sm font-semibold text-brand-700 hover:text-brand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 rounded inline-flex items-center"
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
                    <div className="surface flex flex-col md:flex-row items-center justify-between gap-4 px-5 py-4">
                        <div className="text-sm text-slate-500">
                            Menampilkan{" "}
                            <span className="text-ink-900 font-semibold tabular-nums">
                                {pagination.from}
                            </span>{" "}
                            sampai{" "}
                            <span className="text-ink-900 font-semibold tabular-nums">
                                {pagination.to}
                            </span>{" "}
                            dari{" "}
                            <span className="text-ink-900 font-semibold tabular-nums">
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
                                className="btn-ghost btn-sm"
                            >
                                <FaChevronLeft className="h-3 w-3" />
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
                                                className={`h-8 min-w-[2rem] px-2 flex items-center justify-center rounded-full text-xs font-semibold tabular-nums transition ${
                                                    pagination.current_page ===
                                                    pageNum
                                                        ? "bg-ink-900 text-white"
                                                        : "text-slate-600 hover:bg-slate-100 hover:text-ink-900"
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
                                className="btn-ghost btn-sm"
                            >
                                Selanjutnya
                                <FaChevronRight className="h-3 w-3" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && beritaToDelete && (
                    <div className="fixed inset-0 z-[100] overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                            <div
                                className="fixed inset-0 transition-opacity bg-ink-950/50 backdrop-blur-sm"
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

                            <div
                                role="dialog"
                                aria-modal="true"
                                aria-labelledby={deleteTitleId}
                                aria-describedby={deleteDescId}
                                className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-lift rounded-2xl border border-slate-200/80 sm:align-middle animate-in fade-in zoom-in-95 duration-300"
                            >
                                <div className="text-center">
                                    <div className="flex items-center justify-center w-12 h-12 mx-auto bg-rose-50 rounded-full mb-4">
                                        <FaTrash className="w-5 h-5 text-rose-600" />
                                    </div>
                                    <h3
                                        id={deleteTitleId}
                                        className="text-lg font-bold text-ink-900 mb-2"
                                    >
                                        Hapus Berita?
                                    </h3>
                                    <p
                                        id={deleteDescId}
                                        className="text-sm text-slate-600"
                                    >
                                        Apakah Anda yakin ingin menghapus berita{" "}
                                        <span className="font-semibold text-ink-900">
                                            "{beritaToDelete.judul}"
                                        </span>
                                        ? Tindakan ini tidak dapat dibatalkan.
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row-reverse sm:justify-center gap-3 mt-6">
                                    <button
                                        type="button"
                                        className="btn-danger w-full sm:w-auto"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleDelete(beritaToDelete);
                                        }}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <FaSpinner className="w-4 h-4 animate-spin" />

                                                Menghapus...
                                            </>
                                        ) : (
                                            "Ya, Hapus Berita"
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-ghost w-full sm:w-auto"
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
