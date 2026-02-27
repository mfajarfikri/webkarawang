import HomeLayout from "@/Layouts/HomeLayout";
import { Head } from "@inertiajs/react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useMemo, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { IconBadge, Section, classNames } from "@/Components/Home/HomeUi";
import { FaFilter, FaMapMarkerAlt } from "react-icons/fa";

function BadgeStatus({ kondisi }) {
    const isOperasi = kondisi === "Operasi";
    return (
        <span
            className={classNames(
                "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
                isOperasi
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-700",
            )}
        >
            {isOperasi ? "Operasi" : "Tidak Operasi"}
        </span>
    );
}

function FilterSelect({ label, value, onChange, options, allLabel }) {
    const selected = value === "all" ? allLabel : value;

    return (
        <div className="flex flex-col gap-1.5">
            <div className="text-xs font-semibold text-slate-600">{label}</div>
            <Listbox value={value} onChange={onChange}>
                <div className="relative">
                    <Listbox.Button className="relative w-full cursor-pointer rounded-2xl bg-white py-2.5 pl-4 pr-10 text-left border border-slate-200 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/20">
                        <span className="block truncate text-sm font-semibold text-slate-900">
                            {selected}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                            <svg
                                className="h-4 w-4 text-slate-400"
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
                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in duration-75"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-1"
                    >
                        <Listbox.Options className="absolute z-[1200] mt-2 w-full max-h-64 overflow-auto rounded-2xl bg-white py-1 text-sm shadow-lg ring-1 ring-black/5 focus:outline-none">
                            <Listbox.Option
                                value="all"
                                className={({ active }) =>
                                    classNames(
                                        "cursor-pointer select-none px-4 py-2.5",
                                        active
                                            ? "bg-sky-50 text-sky-700"
                                            : "text-slate-900",
                                    )
                                }
                            >
                                {({ selected: isSelected }) => (
                                    <span
                                        className={classNames(
                                            "block truncate",
                                            isSelected
                                                ? "font-semibold"
                                                : "font-medium",
                                        )}
                                    >
                                        {allLabel}
                                    </span>
                                )}
                            </Listbox.Option>
                            {options.map((opt) => (
                                <Listbox.Option
                                    key={opt}
                                    value={opt}
                                    className={({ active }) =>
                                        classNames(
                                            "cursor-pointer select-none px-4 py-2.5",
                                            active
                                                ? "bg-sky-50 text-sky-700"
                                                : "text-slate-900",
                                        )
                                    }
                                >
                                    {({ selected: isSelected }) => (
                                        <span
                                            className={classNames(
                                                "block truncate",
                                                isSelected
                                                    ? "font-semibold"
                                                    : "font-medium",
                                            )}
                                        >
                                            {opt}
                                        </span>
                                    )}
                                </Listbox.Option>
                            ))}
                        </Listbox.Options>
                    </Transition>
                </div>
            </Listbox>
        </div>
    );
}

function LegendCard() {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white/90 backdrop-blur shadow-sm px-4 py-3 text-sm">
            <div className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Legend
            </div>
            <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2">
                    <span className="inline-block w-2.5 h-2.5 bg-sky-600 rounded-full" />
                    <span className="text-sm font-semibold text-slate-700">
                        Gardu Induk
                    </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <BadgeStatus kondisi="Operasi" />
                    <BadgeStatus kondisi="Tidak Operasi" />
                </div>
            </div>
        </div>
    );
}

export default function GarduInduk({ garduInduks = [] }) {
    // Default center Karawang
    const center = [-6.3728, 107.3777];
    const [ultgFilter, setUltgFilter] = useState("all");
    const [kondisiFilter, setKondisiFilter] = useState("all");

    const ultgList = useMemo(() => {
        const values = garduInduks
            .map((g) => g?.ultg)
            .filter((v) => typeof v === "string" && v.trim().length);
        return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
    }, [garduInduks]);

    const kondisiList = useMemo(() => {
        const values = garduInduks
            .map((g) => g?.kondisi)
            .filter((v) => typeof v === "string" && v.trim().length);
        return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
    }, [garduInduks]);

    const filteredGardu = useMemo(() => {
        return garduInduks.filter((g) => {
            const byUltg = ultgFilter === "all" || g?.ultg === ultgFilter;
            const byKondisi =
                kondisiFilter === "all" || g?.kondisi === kondisiFilter;
            return byUltg && byKondisi;
        });
    }, [garduInduks, ultgFilter, kondisiFilter]);

    const totalWithCoords = useMemo(() => {
        return garduInduks.filter((g) => g?.latitude && g?.longitude).length;
    }, [garduInduks]);

    const filteredWithCoords = useMemo(() => {
        return filteredGardu.filter((g) => g?.latitude && g?.longitude).length;
    }, [filteredGardu]);

    return (
        <>
            <Head title="Gardu Induk" />
            <HomeLayout>
                <div className="min-h-screen bg-white">
                    <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-12 space-y-6">
                        <Section
                            id="header"
                            eyebrow="Peta"
                            title="Peta Gardu Induk"
                            subtitle="Visualisasi lokasi Gardu Induk PLN ULTG Karawang & Purwakarta."
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <IconBadge
                                        icon={FaMapMarkerAlt}
                                        tone="sky"
                                    />
                                    <div className="min-w-0">
                                        <div className="text-sm font-semibold text-slate-900">
                                            {filteredWithCoords} lokasi tampil
                                        </div>
                                        <div className="mt-1 text-sm text-slate-600">
                                            Total {totalWithCoords} lokasi
                                            dengan koordinat.
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                                        <FaFilter className="h-4 w-4 text-slate-400" />
                                        Filter aktif
                                    </span>
                                    {ultgFilter !== "all" ? (
                                        <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                                            {ultgFilter}
                                        </span>
                                    ) : null}
                                    {kondisiFilter !== "all" ? (
                                        <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                                            {kondisiFilter}
                                        </span>
                                    ) : null}
                                </div>
                            </div>
                        </Section>

                        <Section
                            id="filter"
                            eyebrow="Kontrol"
                            title="Filter Gardu Induk"
                            subtitle="Gunakan filter untuk menampilkan lokasi yang relevan."
                            allowOverflow
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FilterSelect
                                    label="ULTG"
                                    value={ultgFilter}
                                    onChange={setUltgFilter}
                                    options={ultgList}
                                    allLabel="Semua"
                                />
                                <FilterSelect
                                    label="Kondisi"
                                    value={kondisiFilter}
                                    onChange={setKondisiFilter}
                                    options={kondisiList}
                                    allLabel="Semua"
                                />
                            </div>
                        </Section>

                        <section id="map" className="scroll-mt-28">
                            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                                <div className="p-6 sm:p-8 border-b border-slate-100">
                                    <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                                        Visualisasi
                                    </div>
                                    <div className="mt-1 text-lg font-bold text-slate-900 tracking-tight">
                                        Peta Lokasi
                                    </div>
                                    <div className="mt-2 text-sm text-slate-600">
                                        Klik marker untuk melihat detail
                                        ringkas.
                                    </div>
                                </div>
                                <div className="p-6 sm:p-8">
                                    <div className="lg:hidden mb-4">
                                        <LegendCard />
                                    </div>

                                    <div className="relative">
                                        <div className="hidden lg:block absolute z-[1000] top-4 right-4">
                                            <LegendCard />
                                        </div>

                                        <div className="w-full h-[60vh] sm:h-[68vh] lg:h-[70vh] rounded-2xl border border-sky-100 overflow-hidden">
                                            <MapContainer
                                                center={center}
                                                zoom={9}
                                                style={{
                                                    height: "100%",
                                                    width: "100%",
                                                }}
                                                scrollWheelZoom={true}
                                            >
                                                <TileLayer
                                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                />
                                                {filteredGardu &&
                                                filteredGardu.length > 0
                                                    ? filteredGardu.map(
                                                          (gardu) => {
                                                              if (
                                                                  !gardu?.latitude ||
                                                                  !gardu?.longitude
                                                              )
                                                                  return null;
                                                              const lat =
                                                                  parseFloat(
                                                                      gardu.latitude,
                                                                  );
                                                              const lng =
                                                                  parseFloat(
                                                                      gardu.longitude,
                                                                  );
                                                              if (
                                                                  Number.isNaN(
                                                                      lat,
                                                                  ) ||
                                                                  Number.isNaN(
                                                                      lng,
                                                                  )
                                                              )
                                                                  return null;

                                                              return (
                                                                  <Marker
                                                                      key={
                                                                          gardu.id
                                                                      }
                                                                      position={[
                                                                          lat,
                                                                          lng,
                                                                      ]}
                                                                  >
                                                                      <Popup>
                                                                          <div className="min-w-[200px]">
                                                                              <div className="text-sm font-bold text-slate-900">
                                                                                  {
                                                                                      gardu.name
                                                                                  }
                                                                              </div>
                                                                              <div className="mt-1 text-sm text-slate-600">
                                                                                  ULTG:{" "}
                                                                                  <span className="font-semibold text-sky-700">
                                                                                      {
                                                                                          gardu.ultg
                                                                                      }
                                                                                  </span>
                                                                              </div>
                                                                              <div className="mt-2">
                                                                                  <BadgeStatus
                                                                                      kondisi={
                                                                                          gardu.kondisi
                                                                                      }
                                                                                  />
                                                                              </div>
                                                                          </div>
                                                                      </Popup>
                                                                  </Marker>
                                                              );
                                                          },
                                                      )
                                                    : null}
                                            </MapContainer>

                                            {(!filteredGardu ||
                                                filteredGardu.length === 0) && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-[2000]">
                                                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-700">
                                                        Tidak ada data gardu
                                                        induk sesuai filter.
                                                    </div>
                                                </div>
                                            )}
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
