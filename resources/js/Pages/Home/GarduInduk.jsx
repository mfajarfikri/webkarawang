import HomeLayout from "@/Layouts/HomeLayout";
import { Head } from "@inertiajs/react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";
import { Listbox } from "@headlessui/react";

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
                    <div className="flex flex-wrap justify-center gap-4 mb-8 z-[1100] relative">
                        {/* ULTG Filter */}
                        <div className="flex flex-col items-start min-w-[180px]">
                            <label className="mb-1 font-medium text-gray-700 text-sm">
                                ULTG
                            </label>
                            <Listbox
                                value={ultgFilter}
                                onChange={setUltgFilter}
                            >
                                <div className="relative w-full">
                                    <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white border border-gray-300 py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
                                        <span className="block truncate">
                                            {ultgFilter === "all"
                                                ? "Semua"
                                                : ultgFilter}
                                        </span>
                                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                            <svg
                                                className="h-4 w-4 text-gray-400"
                                                viewBox="0 0 20 20"
                                                fill="none"
                                            >
                                                <path
                                                    d="M7 7l3-3 3 3M7 13l3 3 3-3"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </span>
                                    </Listbox.Button>
                                    <Listbox.Options className="absolute mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-[1200] max-h-60 overflow-auto focus:outline-none">
                                        <Listbox.Option
                                            key="all"
                                            value="all"
                                            className={({ active, selected }) =>
                                                `cursor-pointer select-none px-4 py-2 text-sm transition-colors ${
                                                    active
                                                        ? "bg-blue-50 text-blue-800"
                                                        : selected
                                                        ? "bg-gray-100 text-gray-900"
                                                        : "text-gray-700"
                                                }`
                                            }
                                        >
                                            {({ selected }) => (
                                                <span
                                                    className={
                                                        selected
                                                            ? "font-semibold"
                                                            : "font-normal"
                                                    }
                                                >
                                                    Semua
                                                </span>
                                            )}
                                        </Listbox.Option>
                                        {ultgList.map((u) => (
                                            <Listbox.Option
                                                key={u}
                                                value={u}
                                                className={({
                                                    active,
                                                    selected,
                                                }) =>
                                                    `cursor-pointer select-none px-4 py-2 text-sm transition-colors ${
                                                        active
                                                            ? "bg-blue-50 text-blue-800"
                                                            : selected
                                                            ? "bg-gray-100 text-gray-900"
                                                            : "text-gray-700"
                                                    }`
                                                }
                                            >
                                                {({ selected }) => (
                                                    <span
                                                        className={
                                                            selected
                                                                ? "font-semibold"
                                                                : "font-normal"
                                                        }
                                                    >
                                                        {u}
                                                    </span>
                                                )}
                                            </Listbox.Option>
                                        ))}
                                    </Listbox.Options>
                                </div>
                            </Listbox>
                        </div>
                        {/* Kondisi Filter */}
                        <div className="flex flex-col items-start min-w-[180px]">
                            <label className="mb-1 font-medium text-gray-700 text-sm">
                                Kondisi
                            </label>
                            <Listbox
                                value={kondisiFilter}
                                onChange={setKondisiFilter}
                            >
                                <div className="relative w-full">
                                    <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white border border-gray-300 py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
                                        <span className="block truncate">
                                            {kondisiFilter === "all"
                                                ? "Semua"
                                                : kondisiFilter}
                                        </span>
                                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                            <svg
                                                className="h-4 w-4 text-gray-400"
                                                viewBox="0 0 20 20"
                                                fill="none"
                                            >
                                                <path
                                                    d="M7 7l3-3 3 3M7 13l3 3 3-3"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </span>
                                    </Listbox.Button>
                                    <Listbox.Options className="absolute mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-[1200] max-h-60 overflow-auto focus:outline-none">
                                        <Listbox.Option
                                            key="all"
                                            value="all"
                                            className={({ active, selected }) =>
                                                `cursor-pointer select-none px-4 py-2 text-sm transition-colors ${
                                                    active
                                                        ? "bg-blue-50 text-blue-800"
                                                        : selected
                                                        ? "bg-gray-100 text-gray-900"
                                                        : "text-gray-700"
                                                }`
                                            }
                                        >
                                            {({ selected }) => (
                                                <span
                                                    className={
                                                        selected
                                                            ? "font-semibold"
                                                            : "font-normal"
                                                    }
                                                >
                                                    Semua
                                                </span>
                                            )}
                                        </Listbox.Option>
                                        {kondisiList.map((k) => (
                                            <Listbox.Option
                                                key={k}
                                                value={k}
                                                className={({
                                                    active,
                                                    selected,
                                                }) =>
                                                    `cursor-pointer select-none px-4 py-2 text-sm transition-colors ${
                                                        active
                                                            ? "bg-blue-50 text-blue-800"
                                                            : selected
                                                            ? "bg-gray-100 text-gray-900"
                                                            : "text-gray-700"
                                                    }`
                                                }
                                            >
                                                {({ selected }) => (
                                                    <span
                                                        className={
                                                            selected
                                                                ? "font-semibold"
                                                                : "font-normal"
                                                        }
                                                    >
                                                        {k}
                                                    </span>
                                                )}
                                            </Listbox.Option>
                                        ))}
                                    </Listbox.Options>
                                </div>
                            </Listbox>
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
                                {filteredGardu && filteredGardu.length > 0
                                    ? filteredGardu.map((gardu) =>
                                          gardu.latitude && gardu.longitude ? (
                                              <Marker
                                                  key={gardu.id}
                                                  position={[
                                                      parseFloat(
                                                          gardu.latitude
                                                      ),
                                                      parseFloat(
                                                          gardu.longitude
                                                      ),
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
                                    : null}
                            </MapContainer>
                            {(!filteredGardu || filteredGardu.length === 0) && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-[2000]">
                                    <div className="text-center py-10 text-gray-600 font-semibold">
                                        Tidak ada data gardu induk.
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </HomeLayout>
        </>
    );
}
