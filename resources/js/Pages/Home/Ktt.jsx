import HomeLayout from "@/Layouts/HomeLayout";
import { Head } from "@inertiajs/react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { useEffect, useState } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";

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
                        "Tidak dapat mendapatkan lokasi Anda. Pastikan GPS aktif dan izin lokasi diizinkan."
                    );
                },
                options
            );
        }
    };

    useEffect(() => {
        axios
            .get(route("ktt.index"))
            .then((response) => {
                setKtts(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching KTT data:", error);
                setLoading(false);
            });
    }, []);

    return (
        <>
            <Head title="KTT" />
            <HomeLayout>
                <div className="relative w-full h-[300px] md:h-[400px] lg:h-[670px]">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                            {userLocation && (
                                <Marker
                                    position={[
                                        userLocation.lat,
                                        userLocation.lng,
                                    ]}
                                >
                                    <Tooltip
                                        permanent
                                        direction="top"
                                        offset={[0, -10]}
                                    >
                                        Lokasi Anda
                                    </Tooltip>
                                    <Popup>
                                        <div className="text-sm">
                                            Lokasi Anda
                                        </div>
                                    </Popup>
                                </Marker>
                            )}
                            {ktts.map((ktt) => (
                                <Marker
                                    key={ktt.id}
                                    position={[ktt.latitude, ktt.longitude]}
                                >
                                    <Tooltip
                                        permanent
                                        direction="top"
                                        offset={[0, -10]}
                                    >
                                        {ktt.name}
                                    </Tooltip>
                                    <Popup>
                                        <div className="min-w-[250px] rounded-lg ">
                                            <div className="border-b border-gray-200 pb-3 mb-3">
                                                <h3 className="text-lg font-bold text-gray-800">
                                                    {ktt.name}
                                                </h3>
                                                <div className="flex items-center mt-1 text-sm text-gray-600">
                                                    <FaMapMarkerAlt className="mr-1" />
                                                    {ktt.lokasi}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-medium text-gray-600">
                                                        Tipe
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={`rounded-full w-4 h-4 animate-pulse ${
                                                                ktt.tipe ===
                                                                "Khusus"
                                                                    ? "bg-black"
                                                                    : ktt.tipe ===
                                                                      "Gold"
                                                                    ? "bg-[#FFD700]"
                                                                    : ktt.tipe ===
                                                                      "Silver"
                                                                    ? "bg-[#c0c0c0]"
                                                                    : ktt.tipe ===
                                                                      "Bronze"
                                                                    ? "bg-[#CD7F32]"
                                                                    : "bg-blue-700"
                                                            }`}
                                                        />
                                                        <span className="text-sm text-gray-800">
                                                            {ktt.tipe}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-medium text-gray-600">
                                                        Kapasitas
                                                    </span>
                                                    <span className="text-sm text-gray-800">
                                                        {ktt.kapasitas} MVA
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    )}
                    <button
                        onClick={getUserLocation}
                        className="absolute bottom-4 right-4 bg-white p-2 rounded-full shadow-lg z-20 hover:bg-gray-100"
                        title="Tampilkan lokasi saya"
                    >
                        <FaMapMarkerAlt className="text-blue-600 text-xl" />
                    </button>
                    <div className="absolute inset-0 pointer-events-none" />
                </div>
            </HomeLayout>
        </>
    );
}
