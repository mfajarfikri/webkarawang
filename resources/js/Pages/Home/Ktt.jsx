import HomeLayout from "@/Layouts/HomeLayout";
import { Head } from "@inertiajs/react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { IconBadge, Section, classNames } from "@/Components/Home/HomeUi";
import {
    FaMapMarkerAlt,
    FaLocationArrow,
    FaCircle,
    FaBolt,
} from "react-icons/fa";

function Badge({ children, tone = "sky" }) {
    const toneCls =
        tone === "emerald"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : tone === "amber"
              ? "border-amber-200 bg-amber-50 text-amber-700"
              : tone === "slate"
                ? "border-slate-200 bg-slate-50 text-slate-700"
                : "border-sky-200 bg-sky-50 text-sky-700";
    return (
        <span
            className={classNames(
                "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
                toneCls,
            )}
        >
            {children}
        </span>
    );
}

function tipeTone(tipe) {
    if (tipe === "Khusus") return "slate";
    if (tipe === "Gold") return "amber";
    if (tipe === "Silver") return "slate";
    if (tipe === "Bronze") return "amber";
    return "sky";
}

function parseLatLng(lat, lng) {
    const a = typeof lat === "string" ? parseFloat(lat) : lat;
    const b = typeof lng === "string" ? parseFloat(lng) : lng;
    if (typeof a !== "number" || typeof b !== "number") return null;
    if (Number.isNaN(a) || Number.isNaN(b)) return null;
    return [a, b];
}

export default function Ktt() {
    const [ktts, setKtts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null);
    const [position] = useState({
        Karawang: {
            lat: -6.3728076648453,
            lng: 107.37769880297574,
        },
    });

    const kttWithCoords = useMemo(() => {
        return (Array.isArray(ktts) ? ktts : []).filter(
            (ktt) => parseLatLng(ktt?.latitude, ktt?.longitude) !== null,
        );
    }, [ktts]);

    const getUserLocation = () => {
        if (navigator.geolocation) {
            const options = {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
            };

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => {
                    console.error("Error getting location:", error);
                    alert(
                        "Tidak dapat mendapatkan lokasi Anda. Pastikan GPS aktif dan izin lokasi diizinkan.",
                    );
                },
                options,
            );
        }
    };

    useEffect(() => {
        axios
            .get(route("dashboard.ktt.index"))
            .then((response) => {
                setKtts(Array.isArray(response.data) ? response.data : []);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching KTT data:", error);
                setKtts([]); // fallback ke array kosong jika error
                setLoading(false);
            });
    }, []);

    return (
        <>
            <Head title="KTT" />
            <HomeLayout>
                <div className="min-h-screen bg-white">
                    <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-12 space-y-6">
                        <Section
                            id="ktt-header"
                            eyebrow="Peta"
                            title="KTT"
                            subtitle="Peta lokasi KTT serta informasi ringkas tiap titik."
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <IconBadge icon={FaBolt} tone="sky" />
                                    <div className="min-w-0">
                                        <div className="text-sm font-semibold text-slate-900">
                                            {kttWithCoords.length} lokasi KTT
                                        </div>
                                        <div className="mt-1 text-sm text-slate-600">
                                            {userLocation
                                                ? "Lokasi kamu sudah terdeteksi."
                                                : "Kamu bisa tampilkan lokasi untuk navigasi cepat."}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={getUserLocation}
                                        className="inline-flex items-center gap-2 rounded-2xl bg-sky-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30"
                                        title="Tampilkan lokasi saya"
                                    >
                                        <FaLocationArrow className="h-4 w-4" />
                                        Lokasi saya
                                    </button>
                                    {userLocation ? (
                                        <Badge tone="emerald">
                                            Lokasi aktif
                                        </Badge>
                                    ) : (
                                        <Badge tone="slate">
                                            Lokasi nonaktif
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </Section>

                        <section id="ktt-map" className="scroll-mt-28">
                            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                                <div className="p-6 sm:p-8 border-b border-slate-100">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                                                Visualisasi
                                            </div>
                                            <div className="mt-1 text-lg font-bold text-slate-900 tracking-tight">
                                                Peta Lokasi KTT
                                            </div>
                                            <div className="mt-2 text-sm text-slate-600">
                                                Klik marker untuk melihat
                                                detail. Tooltip menampilkan nama
                                                titik.
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Badge tone="sky">
                                                <FaCircle className="h-2 w-2 mr-2" />
                                                KTT
                                            </Badge>
                                            <Badge tone="emerald">
                                                <FaCircle className="h-2 w-2 mr-2" />
                                                Lokasi kamu
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 sm:p-8">
                                    <div className="relative">
                                        <div className="w-full h-[56vh] sm:h-[66vh] lg:h-[70vh] rounded-2xl border border-sky-100 overflow-hidden">
                                            {loading ? (
                                                <div className="flex items-center justify-center h-full bg-white">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full border-2 border-slate-200 border-t-sky-700 animate-spin" />
                                                        <div className="text-sm font-semibold text-slate-700">
                                                            Memuat peta & data
                                                            KTT...
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <MapContainer
                                                    center={[
                                                        position.Karawang.lat,
                                                        position.Karawang.lng,
                                                    ]}
                                                    zoom={13}
                                                    style={{
                                                        height: "100%",
                                                        width: "100%",
                                                        zIndex: 10,
                                                    }}
                                                >
                                                    <TileLayer
                                                        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                    />
                                                    {userLocation ? (
                                                        <Marker
                                                            position={[
                                                                userLocation.lat,
                                                                userLocation.lng,
                                                            ]}
                                                        >
                                                            <Tooltip
                                                                permanent
                                                                direction="top"
                                                                offset={[
                                                                    0, -10,
                                                                ]}
                                                            >
                                                                Lokasi Anda
                                                            </Tooltip>
                                                            <Popup>
                                                                <div className="min-w-[200px]">
                                                                    <div className="text-sm font-bold text-slate-900">
                                                                        Lokasi
                                                                        Anda
                                                                    </div>
                                                                    <div className="mt-2">
                                                                        <Badge tone="emerald">
                                                                            Lokasi
                                                                            aktif
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                            </Popup>
                                                        </Marker>
                                                    ) : null}

                                                    {kttWithCoords.length ? (
                                                        kttWithCoords.map(
                                                            (ktt) => {
                                                                const pos =
                                                                    parseLatLng(
                                                                        ktt.latitude,
                                                                        ktt.longitude,
                                                                    );
                                                                if (!pos)
                                                                    return null;
                                                                return (
                                                                    <Marker
                                                                        key={
                                                                            ktt.id
                                                                        }
                                                                        position={
                                                                            pos
                                                                        }
                                                                    >
                                                                        <Tooltip
                                                                            permanent
                                                                            direction="top"
                                                                            offset={[
                                                                                0,
                                                                                -10,
                                                                            ]}
                                                                        >
                                                                            {
                                                                                ktt.name
                                                                            }
                                                                        </Tooltip>
                                                                        <Popup>
                                                                            <div className="min-w-[260px]">
                                                                                <div className="border-b border-slate-200 pb-3 mb-3">
                                                                                    <div className="text-sm font-bold text-slate-900">
                                                                                        {
                                                                                            ktt.name
                                                                                        }
                                                                                    </div>
                                                                                    <div className="flex items-center mt-1 text-sm text-slate-600">
                                                                                        <FaMapMarkerAlt className="mr-2 text-slate-400" />
                                                                                        <span className="truncate">
                                                                                            {
                                                                                                ktt.lokasi
                                                                                            }
                                                                                        </span>
                                                                                    </div>
                                                                                </div>

                                                                                <div className="space-y-2">
                                                                                    <div className="flex items-center justify-between gap-3">
                                                                                        <span className="text-sm font-semibold text-slate-600">
                                                                                            Tipe
                                                                                        </span>
                                                                                        <Badge
                                                                                            tone={tipeTone(
                                                                                                ktt.tipe,
                                                                                            )}
                                                                                        >
                                                                                            {
                                                                                                ktt.tipe
                                                                                            }
                                                                                        </Badge>
                                                                                    </div>
                                                                                    <div className="flex items-center justify-between gap-3">
                                                                                        <span className="text-sm font-semibold text-slate-600">
                                                                                            Kapasitas
                                                                                        </span>
                                                                                        <span className="text-sm font-semibold text-slate-900">
                                                                                            {
                                                                                                ktt.kapasitas
                                                                                            }{" "}
                                                                                            MVA
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </Popup>
                                                                    </Marker>
                                                                );
                                                            },
                                                        )
                                                    ) : (
                                                        <></>
                                                    )}
                                                </MapContainer>
                                            )}

                                            {!loading &&
                                            !kttWithCoords.length ? (
                                                <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-[2000]">
                                                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-700">
                                                        Tidak ada data KTT.
                                                    </div>
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </HomeLayout>
        </>
    );
}
