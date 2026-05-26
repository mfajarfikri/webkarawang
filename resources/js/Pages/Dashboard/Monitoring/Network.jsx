import React, {
    useState,
    useEffect,
    useCallback,
    useRef,
    useMemo,
    Fragment,
} from "react";
import { Head, useForm, router } from "@inertiajs/react";
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
    FaEye,
    FaEyeSlash,
    FaEdit,
    FaChevronDown as FaChevronDownSolid,
    FaCloud,
    FaExpand,
    FaCompress,
} from "react-icons/fa";
import { Dialog, Transition, Listbox } from "@headlessui/react";
import CytoscapeComponent from "react-cytoscapejs";
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

const iconOptions = [
    { label: "Router", value: "router", icon: <FaNetworkWired /> },
    { label: "Switch", value: "switch", icon: <FaLayerGroup /> },
    { label: "Cloud", value: "cloud", icon: <FaCloud /> },
    { label: "Server", value: "server", icon: <FaServer /> },
    { label: "PC", value: "pc", icon: <FaLaptop /> },
    { label: "Gateway", value: "gateway", icon: <FaGlobe /> },
    { label: "Database", value: "database", icon: <FaDatabase /> },
    { label: "Firewall", value: "firewall", icon: <FaShieldAlt /> },
];

const connectionTypes = [
    { label: "Fiber Optic", value: "fiber" },
    { label: "Ethernet", value: "ethernet" },
    { label: "Wireless", value: "wireless" },
];

const connectionStatuses = [
    { label: "Aktif", value: "active" },
    { label: "Down", value: "down" },
];

const connectionMeta = {
    fiber: { label: "Fiber Optic", color: "#8b5cf6" },
    ethernet: { label: "Ethernet", color: "#0ea5e9" },
    wireless: { label: "Wireless", color: "#f59e0b" },
};

const NODE_POSITIONS_STORAGE_KEY = "network_topology_positions_v1";

const loadStoredNodePositions = () => {
    try {
        const raw = localStorage.getItem(NODE_POSITIONS_STORAGE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") return {};
        return parsed;
    } catch {
        return {};
    }
};

const saveStoredNodePositions = (positions) => {
    try {
        localStorage.setItem(
            NODE_POSITIONS_STORAGE_KEY,
            JSON.stringify(positions),
        );
    } catch {}
};

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
    const [topologyData, setTopologyData] = useState({ nodes: [], links: [] });
    const [loading, setLoading] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [selectedConnectionId, setSelectedConnectionId] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [lastScanTime, setLastScanTime] = useState(null);
    const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
    const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);
    const [showCommunity, setShowCommunity] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isConnectionEditMode, setIsConnectionEditMode] = useState(false);
    const [nodePositions, setNodePositions] = useState(() =>
        loadStoredNodePositions(),
    );
    const nodePositionsRef = useRef(nodePositions);
    const cyPositionsHashRef = useRef("");
    const cyFitSignatureRef = useRef("");

    const { enqueueSnackbar } = useSnackbar();
    const cyRef = useRef(null);
    const topologyMapRef = useRef(null);
    const scanInFlightRef = useRef(false);

    const selectedNode = useMemo(() => {
        if (selectedNodeId == null) return null;
        return (
            topologyData.nodes.find(
                (n) => String(n.id) === String(selectedNodeId),
            ) || null
        );
    }, [selectedNodeId, topologyData.nodes]);

    const selectedConnection = useMemo(() => {
        if (selectedConnectionId == null) return null;
        return (
            topologyData.links.find(
                (l) => String(l.id) === String(selectedConnectionId),
            ) || null
        );
    }, [selectedConnectionId, topologyData.links]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(Boolean(document.fullscreenElement));
        };
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => {
            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange,
            );
        };
    }, []);

    useEffect(() => {
        nodePositionsRef.current = nodePositions;
    }, [nodePositions]);

    const getDefaultNodePosition = useCallback((id) => {
        const str = String(id ?? "");
        let hash = 7;
        for (let i = 0; i < str.length; i += 1) {
            hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
        }

        const spacing = 160;
        const cols = 7;
        const col = hash % cols;
        const row = Math.floor(hash / cols) % cols;

        return {
            x: 120 + col * spacing,
            y: 120 + row * spacing,
        };
    }, []);

    useEffect(() => {
        if (!topologyData.nodes?.length) return;

        const current = nodePositionsRef.current || {};
        let changed = false;
        const next = { ...current };

        for (const node of topologyData.nodes) {
            const id = String(node.id);
            const pos = next[id];
            if (
                !pos ||
                typeof pos !== "object" ||
                typeof pos.x !== "number" ||
                typeof pos.y !== "number"
            ) {
                next[id] = getDefaultNodePosition(id);
                changed = true;
            }
        }

        if (!changed) return;
        setNodePositions(next);
        saveStoredNodePositions(next);
    }, [topologyData.nodes, getDefaultNodePosition]);

    useEffect(() => {
        const cy = cyRef.current;
        if (!cy) return;
        if (!topologyData.nodes?.length) return;

        const positions = nodePositionsRef.current || {};
        const ids = topologyData.nodes.map((n) => String(n.id));

        for (const id of ids) {
            const pos = positions[id];
            if (
                !pos ||
                typeof pos !== "object" ||
                typeof pos.x !== "number" ||
                typeof pos.y !== "number"
            ) {
                return;
            }
        }

        let hash = 17;
        for (const id of ids) {
            const pos = positions[id];
            hash = Math.imul(hash ^ id.length, 16777619);
            hash = Math.imul(hash ^ (Math.round(pos.x) | 0), 16777619);
            hash = Math.imul(hash ^ (Math.round(pos.y) | 0), 16777619);
        }
        const positionsHash = String(hash >>> 0);
        const fitSignature = ids.join("|");

        if (cyPositionsHashRef.current !== positionsHash) {
            cy.startBatch();
            for (const id of ids) {
                const pos = positions[id];
                const node = cy.$id(id);
                if (node && node.length) {
                    node.position({ x: pos.x, y: pos.y });
                }
            }
            cy.endBatch();
            cyPositionsHashRef.current = positionsHash;
        }

        if (cyFitSignatureRef.current !== fitSignature) {
            cyFitSignatureRef.current = fitSignature;
            setTimeout(() => {
                if (!cyRef.current) return;
                cyRef.current.fit(undefined, 40);
            }, 0);
        }
    }, [topologyData.nodes, nodePositions]);

    useEffect(() => {
        if (!cyRef.current) return;
        setTimeout(() => {
            if (!cyRef.current) return;
            cyRef.current.resize();
            cyRef.current.fit(undefined, 40);
        }, 0);
    }, [isFullscreen]);

    const deviceForm = useForm({
        id: null,
        gardu_induk_id: null,
        name: "",
        ip_address: "",
        type: "Router",
        icon_key: "router",
        use_snmp: false,
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
        id: null,
        source_id: "",
        target_id: "",
        type: "fiber",
        status: "active",
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
        if (scanInFlightRef.current) return;
        scanInFlightRef.current = true;
        setIsScanning(true);
        try {
            const response = await axios.get(
                route("dashboard.monitoring.scan"),
            );
            const updatedDevices = response.data;

            if (Array.isArray(updatedDevices)) {
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

                setTopologyData((prev) => {
                    const nodes = prev.nodes.map((n) => {
                        const update = updatedDevices.find(
                            (d) => d.id === n.id,
                        );
                        if (update) {
                            n.status = update.status;
                            n.snmp_data = update.snmp_data;
                            n.last_seen = update.last_seen;
                            n.color =
                                update.status === "online"
                                    ? "#10b981"
                                    : update.status === "offline"
                                      ? "#ef4444"
                                      : "#94a3b8";
                        }
                        return n;
                    });

                    return {
                        ...prev,
                        nodes: [...nodes],
                        links: prev.links.map((l) => ({
                            ...l,
                            source:
                                l.source_id ??
                                (typeof l.source === "object"
                                    ? l.source.id
                                    : l.source),
                            target:
                                l.target_id ??
                                (typeof l.target === "object"
                                    ? l.target.id
                                    : l.target),
                        })),
                    };
                });
                setLastScanTime(new Date());
            }
        } catch (error) {
            console.error("Error scanning status:", error);
            const errorMsg =
                error.response?.data?.error ||
                "Gagal melakukan pemindaian status";
            const details = error.response?.data?.details || "";
            const detailsText =
                typeof details === "string" && details.trim()
                    ? details.trim().slice(0, 180)
                    : "";

            enqueueSnackbar(
                `${errorMsg}${detailsText ? `: ${detailsText}` : ""}`,
                {
                    variant: "error",
                },
            );
        } finally {
            setIsScanning(false);
            scanInFlightRef.current = false;
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
            icon_key: node.icon_key || "router",
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
        const method = isConnectionEditMode ? "put" : "post";
        const targetRoute = isConnectionEditMode
            ? route(
                  "dashboard.monitoring.connection.update",
                  connectionForm.data.id,
              )
            : route("dashboard.monitoring.connection.store");

        connectionForm[method](targetRoute, {
            onSuccess: () => {
                setIsConnectionModalOpen(false);
                setIsConnectionEditMode(false);
                connectionForm.reset();
                fetchTopology();
                enqueueSnackbar(
                    isConnectionEditMode
                        ? "Koneksi berhasil diperbarui"
                        : "Koneksi berhasil ditambahkan",
                    {
                        variant: "success",
                    },
                );
            },
        });
    };

    const handleEditConnection = (connection) => {
        setIsConnectionEditMode(true);
        connectionForm.setData({
            id: connection.id,
            source_id: connection.source_id,
            target_id: connection.target_id,
            type: connection.type,
            status: connection.status || "active",
        });
        setIsConnectionModalOpen(true);
    };

    const handleDeleteConnection = (id) => {
        if (confirm("Hapus koneksi ini?")) {
            router.delete(
                route("dashboard.monitoring.connection.destroy", id),
                {
                    onSuccess: () => {
                        setSelectedConnectionId(null);
                        fetchTopology();
                        enqueueSnackbar("Koneksi berhasil dihapus", {
                            variant: "success",
                        });
                    },
                },
            );
        }
    };

    const handleDeleteDevice = (id) => {
        if (confirm("Hapus perangkat ini dan semua koneksinya?")) {
            router.delete(route("dashboard.monitoring.device.destroy", id), {
                onSuccess: () => {
                    setSelectedNodeId(null);
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

    const getNodeGlyph = useCallback((node) => {
        const key = node.icon_key;
        if (key === "cloud") return "☁";
        if (key === "switch") return "SW";
        if (key === "router") return "RT";
        if (key === "server") return "SV";
        if (key === "pc") return "PC";
        if (key === "gateway") return "GW";
        if (key === "database") return "DB";
        if (key === "firewall") return "FW";

        const t = String(node.type || "").toLowerCase();
        if (t.includes("switch")) return "SW";
        if (t.includes("router")) return "RT";
        if (t.includes("server")) return "SV";
        if (t.includes("laptop") || t.includes("pc")) return "PC";
        if (t.includes("gateway")) return "GW";
        if (t.includes("database")) return "DB";
        if (t.includes("firewall")) return "FW";
        return "NW";
    }, []);

    const deviceOptions = topologyData.nodes.map((n) => ({
        label: `${n.name} (${n.ip_address})`,
        value: n.id,
    }));

    const cyElements = useMemo(() => {
        const statusById = new Map(
            topologyData.nodes.map((n) => [String(n.id), n.status]),
        );

        const nodes = topologyData.nodes.map((n) => ({
            data: {
                id: String(n.id),
                label: `${getNodeGlyph(n)} ${n.name}\n${n.ip_address || ""}`,
                color: n.color || "#94a3b8",
                status: n.status || "unknown",
            },
            classes: n.status === "online" ? "online" : "offline",
            position: nodePositions[String(n.id)] || undefined,
        }));

        const edges = topologyData.links.map((l) => {
            const sourceId = String(l.source_id ?? l.source);
            const targetId = String(l.target_id ?? l.target);
            const sourceStatus = statusById.get(sourceId);
            const targetStatus = statusById.get(targetId);
            const media = l.type || "ethernet";
            const mediaColor = connectionMeta[media]?.color || "#94a3b8";

            const targetIsOffline = targetStatus === "offline";
            const isActive = (l.status || "active") === "active";

            const color = targetIsOffline
                ? "#ef4444"
                : !isActive
                  ? "#94a3b8"
                  : sourceStatus === "online"
                    ? mediaColor
                    : "#94a3b8";

            const classes = isActive
                ? targetIsOffline
                    ? `active flow target-offline ${media}`
                    : `active flow ${media}`
                : targetIsOffline
                  ? `down target-offline ${media}`
                  : `down ${media}`;

            return {
                data: {
                    id: String(l.id ?? `${sourceId}-${targetId}`),
                    source: sourceId,
                    target: targetId,
                    color,
                    status: l.status || "active",
                    type: media,
                },
                classes,
            };
        });

        return [...nodes, ...edges];
    }, [topologyData, getNodeGlyph, nodePositions]);

    const cyStylesheet = useMemo(
        () => [
            {
                selector: "node",
                style: {
                    "background-color": "data(color)",
                    "border-width": 3,
                    "border-color": "#ffffff",
                    "text-valign": "bottom",
                    "text-halign": "center",
                    color: "#0f172a",
                    "font-size": 10,
                    "font-weight": 800,
                    label: "data(label)",
                    "text-wrap": "wrap",
                    "text-max-width": 140,
                    "text-margin-y": 8,
                    width: 28,
                    height: 28,
                },
            },
            {
                selector: "node.online",
                style: {
                    "border-color": "#d1fae5",
                },
            },
            {
                selector: "edge",
                style: {
                    width: 2,
                    "line-color": "data(color)",
                    "curve-style": "bezier",
                    opacity: 0.9,
                    "line-cap": "round",
                    "target-arrow-shape": "none",
                    "mid-target-arrow-shape": "none",
                    "source-arrow-shape": "none",
                    "mid-source-arrow-shape": "none",
                },
            },
            {
                selector: "edge.flow",
                style: {
                    "line-style": "dashed",
                    "line-dash-pattern": [10, 10],
                    "underlay-color": "data(color)",
                    "underlay-opacity": 0.18,
                    "underlay-padding": 2,
                },
            },
            {
                selector: "edge.flow.ethernet",
                style: {
                    "line-dash-pattern": [10, 10],
                    "underlay-padding": 2,
                },
            },
            {
                selector: "edge.flow.fiber",
                style: {
                    "line-dash-pattern": [18, 12],
                    "underlay-padding": 3,
                },
            },
            {
                selector: "edge.flow.wireless",
                style: {
                    "line-dash-pattern": [6, 14],
                    "underlay-padding": 2,
                },
            },
            {
                selector: "edge.target-offline",
                style: {
                    "line-color": "#ef4444",
                    "underlay-color": "#ef4444",
                    "underlay-opacity": 0.22,
                    width: 3,
                },
            },
            {
                selector: "edge.down",
                style: {
                    "line-style": "dashed",
                    opacity: 0.6,
                },
            },
            {
                selector: ":selected",
                style: {
                    "border-width": 5,
                    "border-color": "#06b6d4",
                    "line-color": "#06b6d4",
                },
            },
        ],
        [],
    );

    const toggleFullscreen = useCallback(async () => {
        const el = topologyMapRef.current;
        if (!el) return;

        if (!document.fullscreenElement) {
            await el.requestFullscreen?.();
        } else {
            await document.exitFullscreen?.();
        }
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            const cy = cyRef.current;
            if (!cy) return;

            const current = cy.scratch("_dashOffset") || 0;
            const next = (current + 2) % 1000;
            cy.scratch("_dashOffset", next);
            cy.$("edge.flow").style("line-dash-offset", -next);

            const pulse = cy.scratch("_pulse") || 0;
            const nextPulse = (pulse + 1) % 100;
            cy.scratch("_pulse", nextPulse);
            const alpha =
                0.14 + (Math.sin((nextPulse / 100) * Math.PI * 2) + 1) * 0.06;
            cy.$("edge.flow").style("underlay-opacity", alpha);
        }, 40);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!cyRef.current) return;
        setTimeout(() => {
            if (!cyRef.current) return;
            cyRef.current.resize();
            cyRef.current.fit(undefined, 40);
        }, 0);
    }, [topologyData.nodes.length, topologyData.links.length]);

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
                                onClick={() => {
                                    setIsConnectionEditMode(false);
                                    connectionForm.reset();
                                    setIsConnectionModalOpen(true);
                                }}
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
                            <button
                                onClick={toggleFullscreen}
                                className="p-3 bg-white text-slate-600 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all active:scale-95"
                                title={
                                    isFullscreen
                                        ? "Keluar Layar Penuh"
                                        : "Layar Penuh"
                                }
                            >
                                {isFullscreen ? <FaCompress /> : <FaExpand />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Topology Map */}
                    <div
                        ref={topologyMapRef}
                        className={`lg:col-span-3 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative ${isFullscreen ? "h-screen" : "min-h-[600px]"}`}
                    >
                        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
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
                                    <div className="w-6 h-0.5 rounded-full bg-sky-500"></div>
                                    <span className="text-[11px] font-bold text-slate-600 uppercase">
                                        Ethernet
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-6 h-0.5 rounded-full bg-violet-500"></div>
                                    <span className="text-[11px] font-bold text-slate-600 uppercase">
                                        Fiber
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
                            <div className="absolute inset-0 bg-[#f8fafc]">
                                <CytoscapeComponent
                                    elements={cyElements}
                                    stylesheet={cyStylesheet}
                                    style={{ width: "100%", height: "100%" }}
                                    cy={(cy) => {
                                        cyRef.current = cy;
                                        cy.minZoom(0.2);
                                        cy.maxZoom(2.5);

                                        cy.off("tap", "node");
                                        cy.off("click", "node");
                                        cy.off("select", "node");
                                        cy.off("tap", "edge");
                                        cy.off("click", "edge");
                                        cy.off("select", "edge");
                                        cy.off("tap");
                                        cy.off("dragfree", "node");

                                        const pickNode = (evt) => {
                                            const id = evt.target.id();
                                            evt.target.select();
                                            if (import.meta.env.DEV) {
                                                console.debug(
                                                    "[Network] node pick:",
                                                    id,
                                                );
                                            }
                                            setSelectedNodeId(id);
                                            setSelectedConnectionId(null);
                                        };

                                        cy.on("tap", "node", pickNode);
                                        cy.on("click", "node", pickNode);
                                        cy.on("select", "node", pickNode);

                                        const pickEdge = (evt) => {
                                            const id = evt.target.id();
                                            evt.target.select();
                                            if (import.meta.env.DEV) {
                                                console.debug(
                                                    "[Network] edge pick:",
                                                    id,
                                                );
                                            }
                                            setSelectedConnectionId(id);
                                            setSelectedNodeId(null);
                                        };

                                        cy.on("tap", "edge", pickEdge);
                                        cy.on("click", "edge", pickEdge);
                                        cy.on("select", "edge", pickEdge);

                                        cy.on("tap", (evt) => {
                                            if (evt.target === cy) {
                                                if (import.meta.env.DEV) {
                                                    console.debug(
                                                        "[Network] background tap",
                                                    );
                                                }
                                                setSelectedNodeId(null);
                                                setSelectedConnectionId(null);
                                            }
                                        });

                                        const persistNodePosition = (node) => {
                                            const id = node.id();
                                            const pos = node.position();
                                            if (
                                                !pos ||
                                                typeof pos.x !== "number" ||
                                                typeof pos.y !== "number"
                                            ) {
                                                return;
                                            }

                                            setNodePositions((prev) => {
                                                const next = {
                                                    ...(prev || {}),
                                                    [String(id)]: {
                                                        x: pos.x,
                                                        y: pos.y,
                                                    },
                                                };
                                                saveStoredNodePositions(next);
                                                return next;
                                            });
                                        };

                                        cy.on("dragfree", "node", (evt) => {
                                            persistNodePosition(evt.target);
                                        });

                                        if (!cy.scratch("_layoutDone")) {
                                            cy.scratch("_layoutDone", true);
                                            cy.layout({
                                                name: "preset",
                                                fit: true,
                                                padding: 40,
                                            }).run();
                                        }
                                    }}
                                />
                            </div>
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
                                        onClick={() => setSelectedNodeId(null)}
                                        className="text-slate-300 hover:text-slate-500"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>

                                <div className="space-y-4">
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
                        ) : selectedConnection ? (
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-6 sticky top-24">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 rounded-2xl bg-slate-50 text-slate-700">
                                            <FaLink />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-800 leading-tight">
                                                Koneksi
                                            </h3>
                                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                                {connectionMeta[
                                                    selectedConnection.type
                                                ]?.label ||
                                                    selectedConnection.type}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() =>
                                            setSelectedConnectionId(null)
                                        }
                                        className="text-slate-300 hover:text-slate-500"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                                            DARI
                                        </span>
                                        <span className="text-sm font-bold text-slate-700">
                                            {topologyData.nodes.find(
                                                (n) =>
                                                    String(n.id) ===
                                                    String(
                                                        selectedConnection.source_id,
                                                    ),
                                            )?.name || "Tidak Diketahui"}
                                        </span>
                                    </div>

                                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                                            KE
                                        </span>
                                        <span className="text-sm font-bold text-slate-700">
                                            {topologyData.nodes.find(
                                                (n) =>
                                                    String(n.id) ===
                                                    String(
                                                        selectedConnection.target_id,
                                                    ),
                                            )?.name || "Tidak Diketahui"}
                                        </span>
                                    </div>

                                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                                            STATUS LINK
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`w-2.5 h-2.5 rounded-full ${
                                                    selectedConnection.status ===
                                                    "active"
                                                        ? "bg-emerald-500"
                                                        : "bg-rose-500"
                                                }`}
                                            ></div>
                                            <span
                                                className={`text-sm font-black uppercase ${
                                                    selectedConnection.status ===
                                                    "active"
                                                        ? "text-emerald-600"
                                                        : "text-rose-600"
                                                }`}
                                            >
                                                {selectedConnection.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                                            MEDIA
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-2.5 h-2.5 rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        connectionMeta[
                                                            selectedConnection
                                                                .type
                                                        ]?.color || "#94a3b8",
                                                }}
                                            ></div>
                                            <span className="text-sm font-bold text-slate-700">
                                                {connectionMeta[
                                                    selectedConnection.type
                                                ]?.label ||
                                                    selectedConnection.type}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() =>
                                            handleEditConnection(
                                                selectedConnection,
                                            )
                                        }
                                        className="w-full flex items-center justify-center gap-2 py-3 bg-cyan-50 hover:bg-cyan-100 text-cyan-600 rounded-2xl font-bold text-xs transition-all active:scale-95"
                                    >
                                        <FaEdit size={12} /> Edit Koneksi
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleDeleteConnection(
                                                selectedConnection.id,
                                            )
                                        }
                                        className="w-full flex items-center justify-center gap-2 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl font-bold text-xs transition-all active:scale-95"
                                    >
                                        <FaTrash size={12} /> Hapus Koneksi
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

                                        <div>
                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                                Icon Node
                                            </label>
                                            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mt-2">
                                                {iconOptions.map((opt) => (
                                                    <button
                                                        key={opt.value}
                                                        type="button"
                                                        onClick={() =>
                                                            deviceForm.setData(
                                                                "icon_key",
                                                                opt.value,
                                                            )
                                                        }
                                                        className={`p-3 rounded-2xl border transition-all active:scale-95 flex items-center justify-center ${
                                                            deviceForm.data
                                                                .icon_key ===
                                                            opt.value
                                                                ? "bg-cyan-600 text-white border-cyan-600 shadow-lg shadow-cyan-100"
                                                                : "bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100"
                                                        }`}
                                                        title={opt.label}
                                                    >
                                                        {opt.icon}
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
                    onClose={() => {
                        setIsConnectionModalOpen(false);
                        setIsConnectionEditMode(false);
                        connectionForm.reset();
                    }}
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
                                            {isConnectionEditMode
                                                ? "Edit Koneksi Jalur"
                                                : "Tambah Koneksi Jalur"}
                                        </Dialog.Title>
                                        <button
                                            onClick={() => {
                                                setIsConnectionModalOpen(false);
                                                setIsConnectionEditMode(false);
                                                connectionForm.reset();
                                            }}
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
                                        <CustomDropdown
                                            label="Status Link"
                                            value={connectionForm.data.status}
                                            onChange={(val) =>
                                                connectionForm.setData(
                                                    "status",
                                                    val,
                                                )
                                            }
                                            options={connectionStatuses}
                                        />
                                        <button
                                            type="submit"
                                            disabled={connectionForm.processing}
                                            className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl shadow-slate-200 transition-all mt-4 disabled:opacity-50"
                                        >
                                            {isConnectionEditMode
                                                ? "SIMPAN PERUBAHAN"
                                                : "HUBUNGKAN JALUR"}
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
