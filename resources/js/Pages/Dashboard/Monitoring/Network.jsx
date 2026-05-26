import React, {
    useState,
    useEffect,
    useCallback,
    useRef,
    Fragment,
} from "react";
import { Head, usePage, useForm, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import {
    FaSync,
    FaExclamationTriangle,
    FaCheckCircle,
    FaClock,
    FaInfoCircle,
    FaSearch,
    FaNetworkWired,
    FaServer,
    FaMicrochip,
    FaArrowRight,
    FaTimes,
    FaPlus,
    FaLink,
    FaLaptop,
    FaGlobe,
    FaDatabase,
    FaShieldAlt,
    FaTrash,
    FaBuilding,
    FaEye,
    FaEyeSlash,
    FaEdit,
    FaChevronDown as FaChevronDownSolid,
} from "react-icons/fa";
import { Dialog, Transition, Listbox } from "@headlessui/react";
import ForceGraph2D from "react-force-graph-2d";
import * as d3 from "d3-force";
import axios from "axios";
import { useSnackbar } from "notistack";

const deviceTypes = [
    { label: "Router", value: "Router", icon: <FaNetworkWired /> },
    { label: "Switch", value: "Switch", icon: <FaLayerGroup /> },
    { label: "Server", value: "Server", icon: <FaServer /> },
    { label: "Laptop/PC", value: "Laptop", icon: <FaLaptop /> },
    { label: "Gateway", value: "Gateway", icon: <FaGlobe /> },
    { label: "Database", value: "Database", icon: <FaDatabase /> },
    { label: "Firewall", value: "Firewall", icon: <FaShieldAlt /> },
];

const connectionTypes = [
    { label: "Fiber Optic", value: "fiber" },
    { label: "Ethernet", value: "ethernet" },
    { label: "Wireless", value: "wireless" },
];

function FaLayerGroup(props) {
    return (
        <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 512 512"
            height="1em"
            width="1em"
            {...props}
        >
            <path d="M12.41 148.02l232.94 105.67c6.8 3.09 14.49 3.09 21.29 0l232.94-105.67c7.07-3.21 12.41-9.96 12.41-17.73 0-7.77-5.34-14.52-12.41-17.73L266.65 1.21c-6.8-3.09-14.49-3.09-21.29 0L12.41 112.55C5.34 115.76 0 122.51 0 130.28c0 7.77 5.34 14.52 12.41 17.74zM256 311.17l-93.91-42.59-74.47 33.76c-7.07 3.21-12.41 9.96-12.41 17.73 0 7.77 5.34 14.52 12.41 17.73l232.94 105.67c6.8 3.09 14.49 3.09 21.29 0l232.94-105.67c7.07-3.21 12.41-9.96 12.41-17.73 0-7.77-5.34-14.52-12.41-17.73l-74.47-33.76L256 311.17zm0 128.57l-93.91-42.59-74.47 33.76c-7.07 3.21-12.41 9.96-12.41 17.73 0 7.77 5.34 14.52 12.41 17.73l232.94 105.67c6.8 3.09 14.49 3.09 21.29 0l232.94-105.67c7.07-3.21 12.41-9.96 12.41-17.73 0-7.77-5.34-14.52-12.41-17.73l-74.47-33.76L256 439.74z"></path>
        </svg>
    );
}

const snmpVersions = [
    { label: "SNMP v1", value: "v1" },
    { label: "SNMP v2c", value: "v2c" },
    { label: "SNMP v3", value: "v3" },
];

const snmpSecurityLevels = [
    { label: "noAuthNoPriv", value: "noAuthNoPriv" },
    { label: "authNoPriv", value: "authNoPriv" },
    { label: "authPriv", value: "authPriv" },
];

const snmpAuthProtocols = [
    { label: "MD5", value: "MD5" },
    { label: "SHA", value: "SHA" },
];

const snmpPrivProtocols = [
    { label: "DES", value: "DES" },
    { label: "AES", value: "AES" },
];

const CustomDropdown = ({
    value,
    onChange,
    options,
    label,
    className = "",
}) => {
    const selectedOption = options.find((opt) => opt.value === value);

    return (
        <div className={`w-full ${className}`}>
            <Listbox value={value} onChange={onChange}>
                <div className="relative">
                    {label && (
                        <Listbox.Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">
                            {label}
                        </Listbox.Label>
                    )}
                    <Listbox.Button className="relative w-full cursor-default rounded-2xl bg-slate-50 border border-slate-100 py-3 pl-4 pr-10 text-left text-sm font-bold focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all">
                        <span className="block truncate text-slate-700">
                            {selectedOption?.label || "Pilih..."}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                            <FaChevronDownSolid
                                className="h-3 w-3 text-slate-400"
                                aria-hidden="true"
                            />
                        </span>
                    </Listbox.Button>
                    <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Listbox.Options className="absolute z-[60] mt-1 max-h-60 w-full overflow-auto rounded-2xl bg-white py-1 text-base shadow-2xl ring-1 ring-black/5 focus:outline-none sm:text-sm">
                            {options.map((option, idx) => (
                                <Listbox.Option
                                    key={idx}
                                    className={({ active }) =>
                                        `relative cursor-default select-none py-2.5 pl-10 pr-4 transition-colors ${
                                            active
                                                ? "bg-cyan-50 text-cyan-900"
                                                : "text-slate-900"
                                        }`
                                    }
                                    value={option.value}
                                >
                                    {({ selected }) => (
                                        <>
                                            <span
                                                className={`block truncate ${selected ? "font-black text-cyan-600" : "font-medium"}`}
                                            >
                                                {option.label}
                                            </span>
                                            {selected ? (
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-cyan-600">
                                                    <FaCheckCircle
                                                        className="h-4 w-4"
                                                        aria-hidden="true"
                                                    />
                                                </span>
                                            ) : null}
                                        </>
                                    )}
                                </Listbox.Option>
                            ))}
                        </Listbox.Options>
                    </Transition>
                </div>
            </Listbox>
        </div>
    );
};

export default function NetworkMonitoring() {
    const { garduInduks = [] } = usePage().props;
    const [topologyData, setTopologyData] = useState({ nodes: [], links: [] });
    const [loading, setLoading] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [selectedNode, setSelectedNode] = useState(null);
    const [lastScanTime, setLastScanTime] = useState(null);
    const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
    const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);
    const [showCommunity, setShowCommunity] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    const { enqueueSnackbar } = useSnackbar();
    const fgRef = useRef();

    const deviceForm = useForm({
        id: null,
        gardu_induk_id: garduInduks[0]?.id || "",
        name: "",
        ip_address: "",
        type: "Router",
        use_snmp: true,
        // SNMP Config
        snmp_version: "v2c",
        snmp_community: "public",
        snmp_port: 161,
        snmp_timeout: 5,
        // v3 Auth
        snmp_v3_user: "",
        snmp_v3_security_level: "noAuthNoPriv",
        snmp_v3_auth_protocol: "SHA",
        snmp_v3_auth_passphrase: "",
        snmp_v3_priv_protocol: "AES",
        snmp_v3_priv_passphrase: "",
    });

    const connectionForm = useForm({
        source_id: "",
        target_id: "",
        type: "fiber",
    });

    const fetchTopology = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                route("dashboard.monitoring.topology"),
            );
            const nodes = response.data.nodes.map((n) => ({
                ...n,
                id: n.id,
                label: n.name,
                color:
                    n.status === "online"
                        ? "#10b981"
                        : n.status === "offline"
                          ? "#ef4444"
                          : "#94a3b8",
            }));
            const links = response.data.links.map((l) => ({
                ...l,
                source: l.source_id,
                target: l.target_id,
                color: l.status === "active" ? "#10b981" : "#ef4444",
                curvature: 0.2,
            }));
            setTopologyData({ nodes, links });
        } catch (error) {
            console.error("Error fetching topology:", error);
            enqueueSnackbar("Gagal memuat topologi jaringan", {
                variant: "error",
            });
        } finally {
            setLoading(false);
        }
    }, [enqueueSnackbar]);

    const runScan = useCallback(async () => {
        setIsScanning(true);
        try {
            const response = await axios.get(
                route("dashboard.monitoring.scan"),
            );
            const updatedDevices = response.data;

            updatedDevices.forEach((device) => {
                const oldDevice = topologyData.nodes.find(
                    (n) => n.id === device.id,
                );
                if (
                    oldDevice &&
                    oldDevice.status === "online" &&
                    device.status === "offline"
                ) {
                    enqueueSnackbar(
                        `PERINGATAN: Perangkat ${device.name} terputus!`,
                        {
                            variant: "error",
                            autoHideDuration: 10000,
                        },
                    );
                }
            });

            setTopologyData((prev) => ({
                ...prev,
                nodes: prev.nodes.map((n) => {
                    const update = updatedDevices.find((d) => d.id === n.id);
                    if (update) {
                        return {
                            ...n,
                            status: update.status,
                            snmp_data: update.snmp_data,
                            last_seen: update.last_seen,
                            color:
                                update.status === "online"
                                    ? "#10b981"
                                    : update.status === "offline"
                                      ? "#ef4444"
                                      : "#94a3b8",
                        };
                    }
                    return n;
                }),
            }));
            setLastScanTime(new Date());
        } catch (error) {
            console.error("Error scanning status:", error);
        } finally {
            setIsScanning(false);
        }
    }, [topologyData, enqueueSnackbar]);

    useEffect(() => {
        fetchTopology();
    }, [fetchTopology]);

    useEffect(() => {
        const interval = setInterval(() => {
            runScan();
        }, 15000);
        return () => clearInterval(interval);
    }, [runScan]);

    const handleAddDevice = (e) => {
        e.preventDefault();
        deviceForm.post(route("dashboard.monitoring.device.store"), {
            onSuccess: () => {
                setIsDeviceModalOpen(false);
                setIsEditMode(false);
                deviceForm.reset();
                fetchTopology();
                enqueueSnackbar(
                    isEditMode
                        ? "Perangkat berhasil diperbarui"
                        : "Perangkat berhasil ditambahkan",
                    {
                        variant: "success",
                    },
                );
            },
        });
    };

    const handleEditDevice = (node) => {
        setIsEditMode(true);
        deviceForm.setData({
            id: node.id,
            gardu_induk_id: node.gardu_induk_id,
            name: node.name,
            ip_address: node.ip_address,
            type: node.type,
            use_snmp: node.use_snmp ?? true,
            snmp_version: node.snmp_version || "v2c",
            snmp_community: node.snmp_community || "public",
            snmp_port: node.snmp_port || 161,
            snmp_timeout: node.snmp_timeout || 5,
            snmp_v3_user: node.snmp_v3_user || "",
            snmp_v3_security_level:
                node.snmp_v3_security_level || "noAuthNoPriv",
            snmp_v3_auth_protocol: node.snmp_v3_auth_protocol || "SHA",
            snmp_v3_auth_passphrase: node.snmp_v3_auth_passphrase || "",
            snmp_v3_priv_protocol: node.snmp_v3_priv_protocol || "AES",
            snmp_v3_priv_passphrase: node.snmp_v3_priv_passphrase || "",
        });
        setIsDeviceModalOpen(true);
    };

    const handleAddConnection = (e) => {
        e.preventDefault();
        connectionForm.post(route("dashboard.monitoring.connection.store"), {
            onSuccess: () => {
                setIsConnectionModalOpen(false);
                connectionForm.reset();
                fetchTopology();
                enqueueSnackbar("Koneksi berhasil ditambahkan", {
                    variant: "success",
                });
            },
        });
    };

    const handleDeleteDevice = (id) => {
        if (confirm("Hapus perangkat ini dan semua koneksinya?")) {
            router.delete(route("dashboard.monitoring.device.destroy", id), {
                onSuccess: () => {
                    setSelectedNode(null);
                    fetchTopology();
                    enqueueSnackbar("Perangkat berhasil dihapus", {
                        variant: "success",
                    });
                },
            });
        }
    };

    const getDeviceIcon = (type) => {
        const found = deviceTypes.find((t) => t.value === type);
        return found ? found.icon : <FaNetworkWired />;
    };

    const garduOptions = garduInduks.map((gi) => ({
        label: gi.name,
        value: gi.id,
    }));

    const deviceOptions = topologyData.nodes.map((n) => ({
        label: `${n.name} (${n.ip_address})`,
        value: n.id,
    }));

    return (
        <DashboardLayout title="Monitoring Jaringan">
            <Head title="Monitoring Jaringan Real-time" />

            <div className="p-6 max-w-7xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-cyan-600 rounded-xl shadow-lg shadow-cyan-100">
                                <FaNetworkWired className="text-white text-lg" />
                            </div>
                            Monitoring Jaringan Global
                        </h1>
                        <p className="text-slate-500 text-sm font-medium mt-1">
                            Pantau seluruh infrastruktur jaringan secara
                            terpusat tanpa filter.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    setIsEditMode(false);
                                    deviceForm.reset();
                                    setIsDeviceModalOpen(true);
                                }}
                                className="p-3 bg-cyan-600 text-white rounded-2xl hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-100"
                                title="Tambah Perangkat"
                            >
                                <FaPlus />
                            </button>
                            <button
                                onClick={() => setIsConnectionModalOpen(true)}
                                className="p-3 bg-slate-800 text-white rounded-2xl hover:bg-slate-900 transition-all shadow-lg shadow-slate-200"
                                title="Tambah Koneksi"
                            >
                                <FaLink />
                            </button>
                            <button
                                onClick={() => runScan()}
                                disabled={isScanning}
                                className={`p-3 rounded-2xl transition-all active:scale-95 ${isScanning ? "bg-gray-100 text-gray-400" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}
                                title="Scan Ulang"
                            >
                                <FaSync
                                    className={`${isScanning ? "animate-spin" : ""}`}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Topology Map */}
                    <div className="lg:col-span-3 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative min-h-[600px]">
                        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                            <div className="bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                    <span className="text-[11px] font-bold text-slate-600 uppercase">
                                        Online
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                                    <span className="text-[11px] font-bold text-slate-600 uppercase">
                                        Offline
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                                    <span className="text-[11px] font-bold text-slate-600 uppercase">
                                        Aktif
                                    </span>
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50 backdrop-blur-sm z-20">
                                <div className="flex flex-col items-center gap-3">
                                    <FaSync className="animate-spin text-3xl text-cyan-600" />
                                    <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                                        Sinkronisasi...
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <ForceGraph2D
                                ref={fgRef}
                                graphData={topologyData}
                                nodeLabel={(node) => `
                                    Perangkat: ${node.name}
                                    Lokasi: ${node.gardu_induk?.name || "Global"}
                                    IP: ${node.ip_address}
                                `}
                                nodeColor={(node) => node.color}
                                linkColor={(link) => link.color}
                                linkWidth={2}
                                nodeRelSize={8}
                                onNodeClick={(node) => setSelectedNode(node)}
                                backgroundColor="#f8fafc"
                                linkDirectionalParticles={(link) => {
                                    const sourceNode = topologyData.nodes.find(
                                        (n) =>
                                            n.id ===
                                            (typeof link.source === "object"
                                                ? link.source.id
                                                : link.source),
                                    );
                                    return sourceNode?.status === "online"
                                        ? 4
                                        : 0;
                                }}
                                linkDirectionalParticleWidth={2}
                                linkDirectionalParticleSpeed={0.01}
                                nodeCanvasObject={(node, ctx, globalScale) => {
                                    const label = node.name;
                                    const fontSize = 12 / globalScale;
                                    ctx.font = `bold ${fontSize}px Inter, sans-serif`;
                                    ctx.textAlign = "center";
                                    ctx.textBaseline = "middle";

                                    // Node Circle with Glow
                                    const radius = 10;
                                    if (node.status === "online") {
                                        ctx.shadowBlur = 20 / globalScale;
                                        ctx.shadowColor = node.color;
                                    }

                                    // Draw Outer Ring
                                    ctx.beginPath();
                                    ctx.arc(
                                        node.x,
                                        node.y,
                                        radius + 2,
                                        0,
                                        2 * Math.PI,
                                        false,
                                    );
                                    ctx.fillStyle = "#ffffff";
                                    ctx.fill();
                                    ctx.strokeStyle = node.color;
                                    ctx.lineWidth = 2 / globalScale;
                                    ctx.stroke();

                                    // Draw Inner Circle
                                    ctx.beginPath();
                                    ctx.arc(
                                        node.x,
                                        node.y,
                                        radius,
                                        0,
                                        2 * Math.PI,
                                        false,
                                    );
                                    ctx.fillStyle = node.color;
                                    ctx.fill();

                                    ctx.shadowBlur = 0;

                                    // Draw Type Icon (Simplified)
                                    ctx.fillStyle = "#ffffff";
                                    ctx.font = `${10 / globalScale}px "Font Awesome 5 Free"`;
                                    // Use a simple circle for the icon background if font not loaded
                                    ctx.beginPath();
                                    ctx.arc(
                                        node.x,
                                        node.y,
                                        4,
                                        0,
                                        2 * Math.PI,
                                        false,
                                    );
                                    ctx.fill();

                                    // Main Label (Device Name)
                                    ctx.font = `bold ${11 / globalScale}px Inter, sans-serif`;
                                    ctx.fillStyle = "#1e293b";
                                    ctx.fillText(
                                        label,
                                        node.x,
                                        node.y + radius + 12,
                                    );

                                    // Location label (Only if zoomed in)
                                    if (globalScale > 1.2) {
                                        ctx.font = `${9 / globalScale}px Inter, sans-serif`;
                                        ctx.fillStyle = "#64748b";
                                        ctx.fillText(
                                            node.gardu_induk?.name || "Global",
                                            node.x,
                                            node.y + radius + 22,
                                        );
                                    }
                                }}
                                d3Force={(name, force) => {
                                    if (name === "link") force.distance(150);
                                    if (name === "charge") force.strength(-400);
                                }}
                            />
                        )}
                    </div>

                    {/* Side Info Panel */}
                    <div className="lg:col-span-1 space-y-6">
                        {selectedNode ? (
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-6 sticky top-24">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`p-3 rounded-2xl ${selectedNode.status === "online" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}
                                        >
                                            {getDeviceIcon(selectedNode.type)}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-800 leading-tight">
                                                {selectedNode.name}
                                            </h3>
                                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                                {selectedNode.type}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedNode(null)}
                                        className="text-slate-300 hover:text-slate-500"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                                            LOKASI GARDU INDUK
                                        </span>
                                        <div className="flex items-center gap-2 text-slate-700">
                                            <FaBuilding className="text-slate-400" />
                                            <span className="text-sm font-bold">
                                                {selectedNode.gardu_induk
                                                    ?.name || "Tidak Diketahui"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                                            IP ADDRESS
                                        </span>
                                        <span className="text-sm font-bold text-slate-700">
                                            {selectedNode.ip_address}
                                        </span>
                                    </div>

                                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                                            STATUS
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`w-2.5 h-2.5 rounded-full ${selectedNode.status === "online" ? "bg-emerald-500" : "bg-rose-500"}`}
                                            ></div>
                                            <span
                                                className={`text-sm font-black uppercase ${selectedNode.status === "online" ? "text-emerald-600" : "text-rose-600"}`}
                                            >
                                                {selectedNode.status}
                                            </span>
                                        </div>
                                    </div>

                                    {selectedNode.snmp_data && (
                                        <div className="space-y-3">
                                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <FaMicrochip /> Statistik SNMP
                                            </h4>
                                            <div className="grid grid-cols-1 gap-2">
                                                {Object.entries(
                                                    selectedNode.snmp_data,
                                                ).map(([key, value]) => (
                                                    <div
                                                        key={key}
                                                        className="bg-white rounded-xl p-3 border border-slate-100 flex justify-between items-center"
                                                    >
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                                                            {key.replace(
                                                                "_",
                                                                " ",
                                                            )}
                                                        </span>
                                                        <span className="text-xs font-black text-slate-700">
                                                            {value}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() =>
                                            handleEditDevice(selectedNode)
                                        }
                                        className="w-full flex items-center justify-center gap-2 py-3 bg-cyan-50 hover:bg-cyan-100 text-cyan-600 rounded-2xl font-bold text-xs transition-all active:scale-95"
                                    >
                                        <FaEdit size={12} /> Edit Perangkat
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleDeleteDevice(selectedNode.id)
                                        }
                                        className="w-full flex items-center justify-center gap-2 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl font-bold text-xs transition-all active:scale-95"
                                    >
                                        <FaTrash size={12} /> Hapus Perangkat
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 text-slate-300">
                                    <FaInfoCircle size={24} />
                                </div>
                                <h3 className="text-slate-500 font-bold text-sm">
                                    Pilih Node
                                </h3>
                                <p className="text-slate-400 text-[11px] mt-2 leading-relaxed">
                                    Klik node untuk detail atau gunakan tombol
                                    di atas untuk menambah infrastruktur.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Tambah Perangkat */}
            <Transition show={isDeviceModalOpen} as={Fragment}>
                <Dialog
                    as="div"
                    className="relative z-50"
                    onClose={() => setIsDeviceModalOpen(false)}
                >
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-[32px] bg-white p-8 text-left align-middle shadow-2xl transition-all">
                                    <div className="flex justify-between items-center mb-6">
                                        <Dialog.Title
                                            as="h3"
                                            className="text-xl font-black text-slate-800 tracking-tight"
                                        >
                                            {isEditMode
                                                ? "Edit Perangkat"
                                                : "Tambah Perangkat"}
                                        </Dialog.Title>
                                        <button
                                            onClick={() =>
                                                setIsDeviceModalOpen(false)
                                            }
                                            className="text-slate-300 hover:text-slate-500"
                                        >
                                            <FaTimes />
                                        </button>
                                    </div>
                                    <form
                                        onSubmit={handleAddDevice}
                                        className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200"
                                    >
                                        <div className="space-y-4">
                                            <CustomDropdown
                                                label="Lokasi Gardu Induk"
                                                value={
                                                    deviceForm.data
                                                        .gardu_induk_id
                                                }
                                                onChange={(val) =>
                                                    deviceForm.setData(
                                                        "gardu_induk_id",
                                                        val,
                                                    )
                                                }
                                                options={garduOptions}
                                            />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                                        Nama Perangkat
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={
                                                            deviceForm.data.name
                                                        }
                                                        onChange={(e) =>
                                                            deviceForm.setData(
                                                                "name",
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="w-full rounded-2xl border-slate-100 bg-slate-50 mt-1 text-sm font-bold focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                                        IP Address
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={
                                                            deviceForm.data
                                                                .ip_address
                                                        }
                                                        onChange={(e) =>
                                                            deviceForm.setData(
                                                                "ip_address",
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="w-full rounded-2xl border-slate-100 bg-slate-50 mt-1 text-sm font-bold focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all"
                                                        placeholder="192.168.1.1"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                                Tipe Perangkat
                                            </label>
                                            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mt-2">
                                                {deviceTypes.map((type) => (
                                                    <button
                                                        key={type.value}
                                                        type="button"
                                                        onClick={() =>
                                                            deviceForm.setData(
                                                                "type",
                                                                type.value,
                                                            )
                                                        }
                                                        className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${deviceForm.data.type === type.value ? "border-cyan-500 bg-cyan-50 text-cyan-600" : "border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-100"}`}
                                                    >
                                                        {type.icon}
                                                        <span className="text-[8px] font-black uppercase text-center">
                                                            {type.label}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="border-t border-slate-50 pt-4 mt-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-[12px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                                    <FaMicrochip className="text-cyan-500" />
                                                    Konfigurasi SNMP
                                                </h4>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            deviceForm.data
                                                                .use_snmp
                                                        }
                                                        onChange={(e) =>
                                                            deviceForm.setData(
                                                                "use_snmp",
                                                                e.target
                                                                    .checked,
                                                            )
                                                        }
                                                        className="rounded text-cyan-600 focus:ring-cyan-500"
                                                    />
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                        Aktifkan SNMP
                                                    </span>
                                                </label>
                                            </div>

                                            {deviceForm.data.use_snmp && (
                                                <>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                        <CustomDropdown
                                                            label="Versi SNMP"
                                                            value={
                                                                deviceForm.data
                                                                    .snmp_version
                                                            }
                                                            onChange={(val) =>
                                                                deviceForm.setData(
                                                                    "snmp_version",
                                                                    val,
                                                                )
                                                            }
                                                            options={
                                                                snmpVersions
                                                            }
                                                        />
                                                        <div>
                                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                                                Port
                                                            </label>
                                                            <input
                                                                type="number"
                                                                value={
                                                                    deviceForm
                                                                        .data
                                                                        .snmp_port
                                                                }
                                                                onChange={(e) =>
                                                                    deviceForm.setData(
                                                                        "snmp_port",
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                className="w-full rounded-2xl border-slate-100 bg-slate-50 mt-1 text-sm font-bold focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                                                Timeout (s)
                                                            </label>
                                                            <input
                                                                type="number"
                                                                value={
                                                                    deviceForm
                                                                        .data
                                                                        .snmp_timeout
                                                                }
                                                                onChange={(e) =>
                                                                    deviceForm.setData(
                                                                        "snmp_timeout",
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                className="w-full rounded-2xl border-slate-100 bg-slate-50 mt-1 text-sm font-bold focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all"
                                                            />
                                                        </div>
                                                    </div>

                                                    {deviceForm.data
                                                        .snmp_version !==
                                                    "v3" ? (
                                                        <div className="relative">
                                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                                                SNMP Community
                                                            </label>
                                                            <div className="relative mt-1">
                                                                <input
                                                                    type={
                                                                        showCommunity
                                                                            ? "text"
                                                                            : "password"
                                                                    }
                                                                    value={
                                                                        deviceForm
                                                                            .data
                                                                            .snmp_community
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        deviceForm.setData(
                                                                            "snmp_community",
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className="w-full rounded-2xl border-slate-100 bg-slate-50 text-sm font-bold pr-12 focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setShowCommunity(
                                                                            !showCommunity,
                                                                        )
                                                                    }
                                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-600"
                                                                >
                                                                    {showCommunity ? (
                                                                        <FaEyeSlash
                                                                            size={
                                                                                14
                                                                            }
                                                                        />
                                                                    ) : (
                                                                        <FaEye
                                                                            size={
                                                                                14
                                                                            }
                                                                        />
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-4 bg-slate-50/50 p-4 rounded-[24px] border border-slate-100">
                                                            <div>
                                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                                                    Security
                                                                    Name (User)
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={
                                                                        deviceForm
                                                                            .data
                                                                            .snmp_v3_user
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        deviceForm.setData(
                                                                            "snmp_v3_user",
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className="w-full rounded-2xl border-slate-100 bg-white mt-1 text-sm font-bold focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all"
                                                                />
                                                            </div>

                                                            <CustomDropdown
                                                                label="Security Level"
                                                                value={
                                                                    deviceForm
                                                                        .data
                                                                        .snmp_v3_security_level
                                                                }
                                                                onChange={(
                                                                    val,
                                                                ) =>
                                                                    deviceForm.setData(
                                                                        "snmp_v3_security_level",
                                                                        val,
                                                                    )
                                                                }
                                                                options={
                                                                    snmpSecurityLevels
                                                                }
                                                            />

                                                            {deviceForm.data
                                                                .snmp_v3_security_level !==
                                                                "noAuthNoPriv" && (
                                                                <>
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                        <CustomDropdown
                                                                            label="Auth Protocol"
                                                                            value={
                                                                                deviceForm
                                                                                    .data
                                                                                    .snmp_v3_auth_protocol
                                                                            }
                                                                            onChange={(
                                                                                val,
                                                                            ) =>
                                                                                deviceForm.setData(
                                                                                    "snmp_v3_auth_protocol",
                                                                                    val,
                                                                                )
                                                                            }
                                                                            options={
                                                                                snmpAuthProtocols
                                                                            }
                                                                        />
                                                                        <div>
                                                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                                                                Auth
                                                                                Passphrase
                                                                            </label>
                                                                            <input
                                                                                type="password"
                                                                                value={
                                                                                    deviceForm
                                                                                        .data
                                                                                        .snmp_v3_auth_passphrase
                                                                                }
                                                                                onChange={(
                                                                                    e,
                                                                                ) =>
                                                                                    deviceForm.setData(
                                                                                        "snmp_v3_auth_passphrase",
                                                                                        e
                                                                                            .target
                                                                                            .value,
                                                                                    )
                                                                                }
                                                                                className="w-full rounded-2xl border-slate-100 bg-white mt-1 text-sm font-bold focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all"
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    {deviceForm
                                                                        .data
                                                                        .snmp_v3_security_level ===
                                                                        "authPriv" && (
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                            <CustomDropdown
                                                                                label="Privacy Protocol"
                                                                                value={
                                                                                    deviceForm
                                                                                        .data
                                                                                        .snmp_v3_priv_protocol
                                                                                }
                                                                                onChange={(
                                                                                    val,
                                                                                ) =>
                                                                                    deviceForm.setData(
                                                                                        "snmp_v3_priv_protocol",
                                                                                        val,
                                                                                    )
                                                                                }
                                                                                options={
                                                                                    snmpPrivProtocols
                                                                                }
                                                                            />
                                                                            <div>
                                                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                                                                    Privacy
                                                                                    Passphrase
                                                                                </label>
                                                                                <input
                                                                                    type="password"
                                                                                    value={
                                                                                        deviceForm
                                                                                            .data
                                                                                            .snmp_v3_priv_passphrase
                                                                                    }
                                                                                    onChange={(
                                                                                        e,
                                                                                    ) =>
                                                                                        deviceForm.setData(
                                                                                            "snmp_v3_priv_passphrase",
                                                                                            e
                                                                                                .target
                                                                                                .value,
                                                                                        )
                                                                                    }
                                                                                    className="w-full rounded-2xl border-slate-100 bg-white mt-1 text-sm font-bold focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={deviceForm.processing}
                                            className="w-full py-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-cyan-100 transition-all mt-4 disabled:opacity-50"
                                        >
                                            SIMPAN PERANGKAT
                                        </button>
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Modal Tambah Koneksi */}
            <Transition show={isConnectionModalOpen} as={Fragment}>
                <Dialog
                    as="div"
                    className="relative z-50"
                    onClose={() => setIsConnectionModalOpen(false)}
                >
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-[32px] bg-white p-8 text-left align-middle shadow-2xl transition-all">
                                    <div className="flex justify-between items-center mb-6">
                                        <Dialog.Title
                                            as="h3"
                                            className="text-xl font-black text-slate-800 tracking-tight"
                                        >
                                            Tambah Koneksi Jalur
                                        </Dialog.Title>
                                        <button
                                            onClick={() =>
                                                setIsConnectionModalOpen(false)
                                            }
                                            className="text-slate-300 hover:text-slate-500"
                                        >
                                            <FaTimes />
                                        </button>
                                    </div>
                                    <form
                                        onSubmit={handleAddConnection}
                                        className="space-y-4"
                                    >
                                        <CustomDropdown
                                            label="Dari Perangkat"
                                            value={
                                                connectionForm.data.source_id
                                            }
                                            onChange={(val) =>
                                                connectionForm.setData(
                                                    "source_id",
                                                    val,
                                                )
                                            }
                                            options={deviceOptions}
                                        />
                                        <div className="flex justify-center">
                                            <FaArrowRight className="text-slate-300 rotate-90" />
                                        </div>
                                        <CustomDropdown
                                            label="Ke Perangkat"
                                            value={
                                                connectionForm.data.target_id
                                            }
                                            onChange={(val) =>
                                                connectionForm.setData(
                                                    "target_id",
                                                    val,
                                                )
                                            }
                                            options={deviceOptions}
                                        />
                                        <CustomDropdown
                                            label="Media Transmisi"
                                            value={connectionForm.data.type}
                                            onChange={(val) =>
                                                connectionForm.setData(
                                                    "type",
                                                    val,
                                                )
                                            }
                                            options={connectionTypes}
                                        />
                                        <button
                                            type="submit"
                                            disabled={connectionForm.processing}
                                            className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl shadow-slate-200 transition-all mt-4 disabled:opacity-50"
                                        >
                                            HUBUNGKAN JALUR
                                        </button>
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </DashboardLayout>
    );
}
