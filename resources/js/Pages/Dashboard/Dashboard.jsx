import { useCallback, useEffect, useMemo, useState } from "react";
import { Head, usePage } from "@inertiajs/react";
import { debounce } from "lodash";
import { Line } from "react-chartjs-2";
import { FaChartLine, FaSpinner } from "react-icons/fa";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Card } from "@/Components/Dashboard/ui";
import {
    buildMyQueue,
    countByStage,
} from "@/Components/Anomali/anomaliWorkflow";
import OverviewHeader from "@/Components/Dashboard/Home/OverviewHeader";
import StageSummary from "@/Components/Dashboard/Home/StageSummary";
import MyQueueCard from "@/Components/Dashboard/Home/MyQueueCard";
import AnalyticsCard from "@/Components/Dashboard/Home/AnalyticsCard";
import BeritaHomepageCard from "@/Components/Dashboard/Home/BeritaHomepageCard";
import LockedState from "@/Components/Dashboard/Home/LockedState";
import {
    buildMonthlyTrendData,
    trendChartOptions,
} from "@/Components/Dashboard/Home/analyticsCharts";

const POLL_INTERVAL_MS = 30000;
const SEARCH_DEBOUNCE_MS = 300;
const ITEMS_PER_PAGE = 5;

const PERMISSION_BERITA = "Berita Home";
const PERMISSION_ANOMALI = "Anomali Dashboard";
const PERMISSION_CREATE_ANOMALI = "View Anomali Create";

const ULTG_KARAWANG = "ULTG Karawang";
const ULTG_PURWAKARTA = "ULTG Purwakarta";
const SPECIFIC_ULTGS = [ULTG_KARAWANG, ULTG_PURWAKARTA];

/** Pilihan filter ULTG sesuai wilayah pengguna. */
function ultgOptionsFor(wilayah) {
    if (wilayah === "UPT Karawang") {
        return [
            { value: "all", label: "Semua ULTG" },
            { value: ULTG_KARAWANG, label: ULTG_KARAWANG },
            { value: ULTG_PURWAKARTA, label: ULTG_PURWAKARTA },
        ];
    }
    if (SPECIFIC_ULTGS.includes(wilayah)) {
        return [{ value: wilayah, label: wilayah }];
    }
    return [{ value: "all", label: "Semua ULTG" }];
}

/** Nilai awal filter ULTG: ULTG pengguna bila spesifik, selain itu semua. */
function defaultUltgFor(wilayah) {
    return SPECIFIC_ULTGS.includes(wilayah) ? wilayah : "all";
}

function emptyFilters(wilayah) {
    return {
        startDate: "",
        endDate: "",
        status: "all",
        category: "all",
        ultg: defaultUltgFor(wilayah),
    };
}

function applyFilters(anomalis, filters) {
    return anomalis.filter((item) => {
        if (filters.startDate && filters.endDate) {
            const date = new Date(item.tanggal_kejadian);
            if (
                date < new Date(filters.startDate) ||
                date > new Date(filters.endDate)
            ) {
                return false;
            }
        }
        if (filters.status !== "all" && item.status !== filters.status) {
            return false;
        }
        if (
            filters.category !== "all" &&
            item.kategori?.name !== filters.category
        ) {
            return false;
        }
        if (filters.ultg !== "all" && item.ultg !== filters.ultg) {
            return false;
        }
        return true;
    });
}

export default function Dashboard() {
    const { auth } = usePage().props;
    const user = auth?.user;
    const wilayah = user?.wilayah;
    const permissions = Array.isArray(user?.permissions)
        ? user.permissions
        : [];
    const canSeeBerita = permissions.includes(PERMISSION_BERITA);
    const canSeeAnomali = permissions.includes(PERMISSION_ANOMALI);

    const [beritaData, setBeritaData] = useState([]);
    const [anomaliData, setAnomaliData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingBerita, setLoadingBerita] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState(() => emptyFilters(wilayah));
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // Ambil berita dan anomali secara paralel; dipakai saat awal dan polling.
    const fetchAllData = useCallback(async (isInitial = false) => {
        try {
            if (isInitial) {
                setLoading(true);
                setLoadingBerita(true);
            } else {
                setIsSyncing(true);
            }

            const [beritaRes, anomaliRes] = await Promise.all([
                fetch("/api/berita"),
                fetch("/api/anomali"),
            ]);

            if (!beritaRes.ok || !anomaliRes.ok) {
                throw new Error("Gagal mengambil data terbaru");
            }

            const [beritaJson, anomaliJson] = await Promise.all([
                beritaRes.json(),
                anomaliRes.json(),
            ]);

            setBeritaData(
                (beritaJson.berita || []).map((b) => ({
                    ...b,
                    enabled: !!b.enabled,
                })),
            );
            setAnomaliData(anomaliJson.anomalis || []);
            setLastUpdated(new Date());
            setError(null);
        } catch (err) {
            console.error("Sync error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
            setLoadingBerita(false);
            setIsSyncing(false);
        }
    }, []);

    useEffect(() => {
        fetchAllData(true);
        const intervalId = setInterval(
            () => fetchAllData(false),
            POLL_INTERVAL_MS,
        );
        return () => clearInterval(intervalId);
    }, [fetchAllData]);

    const handleToggleHomepage = async (id, currentEnabled) => {
        const nextEnabled = !currentEnabled;
        setBeritaData((prev) =>
            prev.map((b) => (b.id === id ? { ...b, enabled: nextEnabled } : b)),
        );
        try {
            const resp = await fetch(`/api/berita/${id}/homepage`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ enabled: nextEnabled }),
            });
            if (!resp.ok) {
                throw new Error("failed");
            }
            fetchAllData(false);
        } catch (e) {
            setBeritaData((prev) =>
                prev.map((b) =>
                    b.id === id ? { ...b, enabled: currentEnabled } : b,
                ),
            );
        }
    };

    // Pencarian berita (debounce 300 ms) dan paginasi 5 per halaman.
    const debouncedSearch = useMemo(
        () => debounce((query) => setDebouncedSearchQuery(query), SEARCH_DEBOUNCE_MS),
        [],
    );
    useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch]);
    useEffect(() => setCurrentPage(1), [debouncedSearchQuery]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        debouncedSearch(e.target.value);
    };

    const filteredBerita = useMemo(() => {
        const query = debouncedSearchQuery.toLowerCase();
        if (!query) return beritaData;
        return beritaData.filter((item) =>
            (item.judul ?? "").toLowerCase().includes(query),
        );
    }, [beritaData, debouncedSearchQuery]);

    const totalPages = Math.ceil(filteredBerita.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedBerita = filteredBerita.slice(
        startIndex,
        startIndex + ITEMS_PER_PAGE,
    );
    const enabledBeritaCount = beritaData.filter((b) => b.enabled).length;

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Filter analisis anomali; ULTG pengguna dipilih otomatis bila spesifik.
    const ultgOptions = useMemo(() => ultgOptionsFor(wilayah), [wilayah]);

    useEffect(() => {
        if (SPECIFIC_ULTGS.includes(wilayah)) {
            setFilters((prev) => ({ ...prev, ultg: wilayah }));
        }
    }, [wilayah]);

    const handleFilterChange = (key, value) =>
        setFilters((prev) => ({ ...prev, [key]: value }));
    const handleResetFilters = () => setFilters(emptyFilters(wilayah));

    const today = useMemo(() => new Date(), [lastUpdated]);

    const anomaliScoped = useMemo(
        () =>
            SPECIFIC_ULTGS.includes(wilayah)
                ? anomaliData.filter((item) => item.ultg === wilayah)
                : anomaliData,
        [anomaliData, wilayah],
    );
    const stageCounts = useMemo(
        () => countByStage(anomaliScoped, today),
        [anomaliScoped, today],
    );
    const myQueue = useMemo(
        () => buildMyQueue(anomaliScoped, user, today),
        [anomaliScoped, user, today],
    );

    const filteredAnomali = useMemo(
        () => applyFilters(anomaliData, filters),
        [anomaliData, filters],
    );
    const categoryOptions = useMemo(() => {
        const names = [
            ...new Set(
                anomaliData.map((item) => item.kategori?.name).filter(Boolean),
            ),
        ];
        return [
            { value: "all", label: "Semua kategori" },
            ...names.map((name) => ({ value: name, label: name })),
        ];
    }, [anomaliData]);

    if (loading || loadingBerita) {
        return (
            <DashboardLayout title="Dashboard">
                <Head title="Dashboard" />
                <div className="flex min-h-[60vh] items-center justify-center">
                    <div className="text-center">
                        <FaSpinner className="mx-auto mb-4 animate-spin text-3xl text-brand-600" />
                        <p className="text-sm font-medium text-slate-600">
                            Memuat data dashboard...
                        </p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Dashboard">
            <Head title="Dashboard" />

            <OverviewHeader
                name={user?.name || "Admin"}
                isSyncing={isSyncing}
                lastUpdated={lastUpdated}
                error={error}
                canCreateAnomali={permissions.includes(
                    PERMISSION_CREATE_ANOMALI,
                )}
            />

            <div className="space-y-6">
                {canSeeAnomali ? (
                    <>
                        <StageSummary counts={stageCounts} />

                        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                            <MyQueueCard
                                queue={myQueue}
                                user={user}
                                today={today}
                                className="xl:col-span-1"
                            />
                            <Card
                                title="Tren anomali bulanan"
                                description="Jumlah anomali per bulan kejadian, mengikuti filter analisis."
                                icon={FaChartLine}
                                className="min-w-0 xl:col-span-2"
                            >
                                <div className="relative h-72 w-full sm:h-80">
                                    <Line
                                        data={buildMonthlyTrendData(
                                            filteredAnomali,
                                        )}
                                        options={trendChartOptions}
                                    />
                                </div>
                            </Card>
                        </div>

                        <AnalyticsCard
                            data={filteredAnomali}
                            today={today}
                            filters={filters}
                            categoryOptions={categoryOptions}
                            ultgOptions={ultgOptions}
                            onFilterChange={handleFilterChange}
                            onReset={handleResetFilters}
                        />
                    </>
                ) : (
                    <LockedState
                        title="Ringkasan anomali"
                        permission={PERMISSION_ANOMALI}
                    />
                )}

                {canSeeBerita ? (
                    <BeritaHomepageCard
                        items={paginatedBerita}
                        enabledCount={enabledBeritaCount}
                        totalCount={beritaData.length}
                        searchQuery={searchQuery}
                        onSearchChange={handleSearchChange}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        onToggle={handleToggleHomepage}
                    />
                ) : (
                    <LockedState
                        title="Berita di beranda"
                        permission={PERMISSION_BERITA}
                    />
                )}
            </div>
        </DashboardLayout>
    );
}
