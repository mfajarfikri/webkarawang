import HomeLayout from "@/Layouts/HomeLayout";
import { Head } from "@inertiajs/react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";

export default function GarduInduk({ garduInduks = [] }) {
    // Default center Karawang
    const center = [-6.3728, 107.3777];
    const [ultgFilter, setUltgFilter] = useState("all");
    const [kondisiFilter, setKondisiFilter] = useState("all");
    const ultgList = [...new Set(garduInduks.map((g) => g.ultg))];
    const kondisiList = [...new Set(garduInduks.map((g) => g.kondisi))];
    const filteredGardu = garduInduks.filter((g) => {
        const byUltg = ultgFilter === "all" || g.ultg === ultgFilter;
        const byKondisi =
            kondisiFilter === "all" || g.kondisi === kondisiFilter;
        return byUltg && byKondisi;
    });
    return (
        <>
            <Head title="Gardu Induk" />
            <HomeLayout>
                <div className="w-full min-h-screen bg-white">
                    {/* Header Section */}
                    <div className="pt-10 pb-4 text-center">
                        <h1 className="text-4xl font-extrabold text-blue-800 tracking-tight mb-2">
                            Peta Gardu Induk
                        </h1>
                        <div className="text-lg text-gray-600 mb-2">
                            Visualisasi lokasi Gardu Induk PLN ULTG Karawang &
                            Purwakarta
                        </div>
                        <div className="w-24 h-1 mx-auto bg-blue-600 rounded-full mb-4"></div>
                    </div>
                    {/* Filter Section */}
                    <div className="flex flex-wrap justify-center gap-4 mb-4">
                        <div>
                            <label className="mr-2 font-medium text-gray-700">
                                ULTG:
                            </label>
                            <select
                                className="border rounded px-3 py-1 focus:ring-blue-500 focus:border-blue-500"
                                value={ultgFilter}
                                onChange={(e) => setUltgFilter(e.target.value)}
                            >
                                <option value="all">Semua</option>
                                {ultgList.map((u) => (
                                    <option key={u} value={u}>
                                        {u}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mr-2 font-medium text-gray-700">
                                Kondisi:
                            </label>
                            <select
                                className="border rounded px-3 py-1 focus:ring-blue-500 focus:border-blue-500"
                                value={kondisiFilter}
                                onChange={(e) =>
                                    setKondisiFilter(e.target.value)
                                }
                            >
                                <option value="all">Semua</option>
                                {kondisiList.map((k) => (
                                    <option key={k} value={k}>
                                        {k}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {/* Map Section */}
                    <div className="relative w-full h-[calc(100vh-180px)]">
                        {/* Legend */}
                        <div className="absolute z-[1000] top-4 right-4 bg-white/90 rounded-lg shadow-lg px-4 py-3 border border-blue-100 text-sm animate-fadeIn">
                            <div className="font-bold text-blue-800 mb-1">
                                Legend
                            </div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="inline-block animate-pulse w-3 h-3 bg-blue-700 rounded-full"></span>
                                <span>Gardu Induk</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="inline-block px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-semibold">
                                    Operasi
                                </span>
                                <span className="inline-block px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs font-semibold">
                                    Tidak Operasi
                                </span>
                            </div>
                        </div>
                        <div className="w-full h-full rounded-2xl shadow-2xl border-2 border-blue-100 overflow-hidden animate-fadeIn">
                            <MapContainer
                                center={center}
                                zoom={9}
                                style={{
                                    height: "100%",
                                    width: "100%",
                                    margin: 0,
                                    padding: 0,
                                    borderRadius: 0,
                                    boxShadow: "none",
                                }}
                                scrollWheelZoom={true}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                {filteredGardu && filteredGardu.length > 0 ? (
                                    filteredGardu.map((gardu) =>
                                        gardu.latitude && gardu.longitude ? (
                                            <Marker
                                                key={gardu.id}
                                                position={[
                                                    parseFloat(gardu.latitude),
                                                    parseFloat(gardu.longitude),
                                                ]}
                                            >
                                                <Popup>
                                                    <div className="min-w-[180px]">
                                                        <div className="font-bold text-blue-800 text-lg mb-1 flex items-center gap-2">
                                                            <span className="inline-block w-3 h-3 bg-blue-700 rounded-full animate-pulse"></span>
                                                            {gardu.name}
                                                        </div>
                                                        <div className="mb-1 text-gray-600 text-sm">
                                                            ULTG:{" "}
                                                            <span className="font-semibold text-blue-700">
                                                                {gardu.ultg}
                                                            </span>
                                                        </div>
                                                        <div className="mb-2 text-sm">
                                                            Kondisi:{" "}
                                                            {gardu.kondisi ===
                                                            "Operasi" ? (
                                                                <span className="inline-block px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-semibold">
                                                                    Operasi
                                                                </span>
                                                            ) : (
                                                                <span className="inline-block px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs font-semibold">
                                                                    Tidak
                                                                    Operasi
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Popup>
                                            </Marker>
                                        ) : null
                                    )
                                ) : (
                                    <div className="text-center py-10">
                                        Tidak ada data gardu induk.
                                    </div>
                                )}
                            </MapContainer>
                        </div>
                    </div>
                </div>
            </HomeLayout>
        </>
    );
}
