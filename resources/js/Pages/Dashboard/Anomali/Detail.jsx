import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link } from "@inertiajs/react";
import { useForm } from "@inertiajs/react";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import { useState } from "react";
import {
    FaFileAlt,
    FaPlus,
    FaTrash,
    FaCalendarAlt,
    FaBuilding,
    FaList,
    FaThLarge,
    FaLayerGroup,
    FaMapMarkerAlt,
    FaMapPin,
    FaTools,
    FaExclamationTriangle,
    FaBolt,
    FaLightbulb,
    FaSearch,
    FaTag,
} from "react-icons/fa";
import { FaCheck } from "react-icons/fa6";
import ApplicationLogo from "@/Components/ApplicationLogo";
import { Switch, Dialog, Transition, Listbox } from "@headlessui/react";
import { Fragment } from "react";
import { ChevronUpDownIcon } from "@heroicons/react/24/solid";
import React from "react";

export default function Detail({ anomalis }) {
    if (!anomalis) {
        return (
            <DashboardLayout>
                <div className="p-8 text-center text-gray-500">
                    Data anomali tidak ditemukan.
                </div>
            </DashboardLayout>
        );
    }

    return (
        <>
            <Head title={`Detail Anomali - ${anomalis.judul || ""}`} />
            <DashboardLayout>
                <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
                    <h2 className="text-2xl font-bold mb-4 text-blue-700 flex items-center gap-2">
                        <FaFileAlt className="text-blue-400" />
                        Detail Anomali
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div className="mb-2 text-gray-600 text-sm">
                                Judul
                            </div>
                            <div className="font-semibold text-lg">
                                {anomalis.judul}
                            </div>
                        </div>
                        <div>
                            <div className="mb-2 text-gray-600 text-sm">
                                ULTG
                            </div>
                            <div>{anomalis.ultg}</div>
                        </div>
                        <div>
                            <div className="mb-2 text-gray-600 text-sm">
                                Gardu Induk
                            </div>
                            <div>{anomalis.gardu_induk?.name || "-"}</div>
                        </div>
                        <div>
                            <div className="mb-2 text-gray-600 text-sm">
                                Bagian
                            </div>
                            <div>{anomalis.bagian}</div>
                        </div>
                        <div>
                            <div className="mb-2 text-gray-600 text-sm">
                                Tipe
                            </div>
                            <div>{anomalis.tipe}</div>
                        </div>
                        <div>
                            <div className="mb-2 text-gray-600 text-sm">
                                Kategori
                            </div>
                            <div>{anomalis.kategori?.name || "-"}</div>
                        </div>
                        <div>
                            <div className="mb-2 text-gray-600 text-sm">
                                Peralatan
                            </div>
                            <div>{anomalis.peralatan}</div>
                        </div>
                        <div>
                            <div className="mb-2 text-gray-600 text-sm">
                                Merek
                            </div>
                            <div>{anomalis.merek || "-"}</div>
                        </div>
                        <div>
                            <div className="mb-2 text-gray-600 text-sm">
                                Tipe Alat
                            </div>
                            <div>{anomalis.tipe_alat || "-"}</div>
                        </div>
                        <div>
                            <div className="mb-2 text-gray-600 text-sm">
                                No Seri
                            </div>
                            <div>{anomalis.no_seri || "-"}</div>
                        </div>
                        <div>
                            <div className="mb-2 text-gray-600 text-sm">
                                Harga
                            </div>
                            <div>{anomalis.harga || "-"}</div>
                        </div>
                        <div>
                            <div className="mb-2 text-gray-600 text-sm">
                                Kode Asset
                            </div>
                            <div>{anomalis.kode_asset || "-"}</div>
                        </div>
                        <div>
                            <div className="mb-2 text-gray-600 text-sm">
                                Tahun Operasi
                            </div>
                            <div>{anomalis.tahun_operasi || "-"}</div>
                        </div>
                        <div>
                            <div className="mb-2 text-gray-600 text-sm">
                                Tahun Buat
                            </div>
                            <div>{anomalis.tahun_buat || "-"}</div>
                        </div>
                        <div>
                            <div className="mb-2 text-gray-600 text-sm">
                                Penempatan Alat
                            </div>
                            <div>{anomalis.penempatan_alat}</div>
                        </div>
                        <div>
                            <div className="mb-2 text-gray-600 text-sm">
                                Tanggal Kejadian
                            </div>
                            <div>{anomalis.tanggal_kejadian}</div>
                        </div>
                        <div>
                            <div className="mb-2 text-gray-600 text-sm">
                                Penyebab
                            </div>
                            <div>{anomalis.penyebab}</div>
                        </div>
                        <div>
                            <div className="mb-2 text-gray-600 text-sm">
                                Akibat
                            </div>
                            <div>{anomalis.akibat}</div>
                        </div>
                        <div>
                            <div className="mb-2 text-gray-600 text-sm">
                                Usul/Saran
                            </div>
                            <div>{anomalis.usul_saran}</div>
                        </div>
                        <div>
                            <div className="mb-2 text-gray-600 text-sm">
                                Status
                            </div>
                            <div>{anomalis.status}</div>
                        </div>
                        <div>
                            <div className="mb-2 text-gray-600 text-sm">
                                Dibuat oleh
                            </div>
                            <div>{anomalis.user?.name || "-"}</div>
                        </div>
                    </div>
                    {/* Lampiran Foto */}
                    <div className="mt-8">
                        <div className="mb-2 text-gray-600 text-sm">
                            Lampiran Foto
                        </div>
                        <div className="flex flex-wrap gap-4">
                            {anomalis.lampiran_foto &&
                            Array.isArray(JSON.parse(anomalis.lampiran_foto)) &&
                            JSON.parse(anomalis.lampiran_foto).length > 0 ? (
                                JSON.parse(anomalis.lampiran_foto).map(
                                    (foto, idx) => (
                                        <img
                                            key={idx}
                                            src={`/storage/${foto}`}
                                            alt={`Lampiran Foto ${idx + 1}`}
                                            className="w-40 h-32 object-cover rounded border"
                                        />
                                    )
                                )
                            ) : (
                                <div className="text-gray-400 italic">
                                    Tidak ada lampiran foto
                                </div>
                            )}
                        </div>
                    </div>
                    <a
                        href={`/dashboard/anomali/${encodeURIComponent(
                            anomalis.judul
                        )}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-6 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold shadow"
                    >
                        Download PDF
                    </a>
                </div>
            </DashboardLayout>
        </>
    );
}
