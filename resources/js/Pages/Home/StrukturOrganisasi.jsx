import { Tree, TreeNode } from "react-organizational-chart";
import { Head } from "@inertiajs/react";
import {
    FaUserTie,
    FaSearchPlus,
    FaSearchMinus,
    FaExpand,
} from "react-icons/fa";
import { TbZoomReset } from "react-icons/tb";
import HomeLayout from "@/Layouts/HomeLayout";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useState, useEffect } from "react";

export default function OrganizationStructure() {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const NodeLabel = ({ data, level = 0 }) => {
        const getBgColor = () => {
            switch (level) {
                case 0:
                    return "bg-gradient-to-br from-[#004B87] to-[#005CA8]"; // Manajer
                case 1:
                    return "bg-gradient-to-br from-[#0066B3] to-[#0076CC]"; // Asisten Manajer
                case 2:
                    return "bg-gradient-to-br from-[#0082CC] to-[#0099E6]"; // Team Leader
                case 3:
                    return "bg-gradient-to-br from-[#0066B3] to-[#0076CC]"; // Manager PDKB
                default:
                    return "bg-gradient-to-br from-[#004B87] to-[#005CA8]"; // PJ dan Staff
            }
        };

        return (
            <div
                className={`
                inline-block
                ${isMobile ? "p-3 min-w-[200px]" : "p-5 min-w-[260px]"}
                rounded-xl shadow-lg
                ${getBgColor()}
                transition-all duration-300
                hover:shadow-xl hover:scale-105
                max-w-[350px]
                backdrop-blur-sm bg-opacity-95
                border-2 border-white/10
            `}
            >
                <div className="flex items-center gap-3">
                    <div
                        className={`
                            ${isMobile ? "w-10 h-10" : "w-12 h-12"}
                            rounded-full 
                            bg-gradient-to-br from-white/30 to-white/10
                            flex items-center justify-center
                            shadow-inner
                            border border-white/20
                        `}
                    >
                        <FaUserTie
                            className={`
                                text-white
                                ${isMobile ? "text-lg" : "text-xl"}
                                drop-shadow-md
                            `}
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3
                            className={`
                                font-bold text-white truncate
                                ${isMobile ? "text-sm" : "text-base"}
                                tracking-wide
                                drop-shadow-md
                            `}
                        >
                            {data.name}
                        </h3>
                        <p
                            className={`
                                text-white/90 truncate
                                ${isMobile ? "text-xs" : "text-sm"}
                                font-medium
                                mt-0.5
                            `}
                        >
                            {data.position || "-"}
                        </p>
                    </div>
                </div>
                {data.staff && data.staff.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/20">
                        <div className="text-white/80 text-xs mb-2 font-medium uppercase tracking-wider">
                            Staff Members
                        </div>
                        <ul
                            className={`
                                space-y-1.5
                                ${isMobile ? "text-xs" : "text-sm"}
                            `}
                        >
                            {data.staff.map((staff, index) => (
                                <li
                                    key={index}
                                    className="
                                        flex items-center gap-2 
                                        bg-white/10 
                                        rounded-lg 
                                        py-1.5 px-2
                                        truncate
                                        text-white/90
                                        hover:bg-white/20 
                                        transition-colors
                                    "
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-white/70"></div>
                                    {staff}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    };

    const renderNode = (nodeData, level = 0) => (
        <TreeNode label={<NodeLabel data={nodeData} level={level} />}>
            {nodeData.children?.map((child) => (
                <TreeNode key={child.id}>
                    {renderNode(child, level + 1)}
                </TreeNode>
            ))}
        </TreeNode>
    );

    const organizationData = {
        name: "MANAJER UPT",
        position: "HARI GUMILANG",
        children: [
            {
                id: 1,
                name: "ASISTEN MANAJER RENEV",
                position: "ARISMAN ARDIYANSYAH",
                children: [
                    {
                        id: 1,
                        name: "TL ENGINEERING",
                        position: "ANGGARA ADI PRADIPTA",
                        staff: [
                            "SONYA FITRI S",
                            "JONATHAN SUBAKTI",
                            "EVINO BAHARI",
                        ],
                    },
                    {
                        id: 2,
                        name: "TL RENUS",
                        position: "-",
                        staff: ["NAELA ROHMUTIYAH", "GILANG", "SRI WAHYUNI"],
                    },
                    {
                        id: 3,
                        name: "TL ASDIGOLDA",
                        position: "WISNU SRI NUGROHO",
                        staff: ["ANDHIKA BAGASKARA"],
                    },
                ],
            },
            {
                id: 2,
                name: "ASMAN KEUANGAN & UMUM",
                position: "DENI RAMDANI, ST",
                children: [
                    {
                        id: 1,
                        name: "TL MUM",
                        position: "DEDI ISWANDI, ST",
                        staff: [
                            "OPERATOR GARDU INDUK",
                            "DISPATCHER",
                            "TEKNISI SCADA",
                        ],
                    },
                    {
                        id: 2,
                        name: "TL KEUANGAN & AKUNTANSI",
                        position: "DEDI ISWANDI, ST",
                        staff: [
                            "OPERATOR GARDU INDUK",
                            "DISPATCHER",
                            "TEKNISI SCADA",
                        ],
                    },
                ],
            },
            {
                id: 3,
                name: "ASMAN KONSTRUKSI",
                position: "YUDI WAHYUDI",
                children: [
                    {
                        id: 1,
                        name: "TL ADKONDALKON",
                        position: "DEDI ISWANDI, ST",
                        staff: [
                            "STAFF KEUANGAN & AKUNTANSI",
                            "STAFF SDM & UMUM",
                            "STAFF LOGISTIK",
                            "STAFF K3L",
                        ],
                    },
                    {
                        id: 2,
                        name: "TL LOGISTIK",
                        position: "DEDI ISWANDI, ST",
                        staff: [
                            "STAFF KEUANGAN & AKUNTANSI",
                            "STAFF SDM & UMUM",
                            "STAFF LOGISTIK",
                            "STAFF K3L",
                        ],
                    },
                ],
            },
            {
                id: 4,
                name: "MANAGER PDKB",
                position: "MASYUR AFIF",
                children: [
                    {
                        id: 1,
                        name: "TL JARINGAN PDKB",
                        position: "DEDI ISWANDI, ST",
                        staff: [
                            "STAFF KEUANGAN & AKUNTANSI",
                            "STAFF SDM & UMUM",
                            "STAFF LOGISTIK",
                            "STAFF K3L",
                        ],
                    },
                    {
                        id: 2,
                        name: "TL GARDU INDUK PDKB",
                        position: "DEDI ISWANDI, ST",
                        staff: [
                            "STAFF KEUANGAN & AKUNTANSI",
                            "STAFF SDM & UMUM",
                            "STAFF LOGISTIK",
                            "STAFF K3L",
                        ],
                    },
                ],
            },
            {
                id: 5,
                name: "PJ LAKSDA",
                position: "IRMA WAHYUNI",
                staff: ["DANNY FIRMAN", "NOVIYANTI TRIWAHYUNI"],
            },
            {
                id: 6,
                name: "PJ K3",
                position: "AGUS",
                staff: ["DIAN RIZKY A"],
            },
            {
                id: 7,
                name: "PJ LINGKUNGAN",
                position: "IRVAN HARDRI",
                staff: ["DIAN RIZKY A"],
            },
        ],
    };

    return (
        <>
            <Head title="Struktur Organisasi" />
            <HomeLayout>
                <div className="min-h-screen bg-gray-50 py-4 sm:py-6 px-2 sm:px-4">
                    <div className="max-w-full mx-auto">
                        {/* Header */}

                        {/* Organization Chart with Zoom Controls */}
                        <div className="relative bg-white rounded-xl shadow-sm">
                            <>
                                <div className="text-center pt-6">
                                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                                        Struktur Organisasi
                                    </h1>
                                    <p className="text-sm sm:text-base text-gray-600">
                                        PLN UPT Karawang
                                    </p>
                                </div>
                            </>
                            <TransformWrapper
                                initialScale={isMobile ? 0.6 : 0.8}
                                minScale={0.2}
                                maxScale={2}
                                centerOnInit={true}
                                limitToBounds={false}
                                doubleClick={{ disabled: true }}
                                panning={{ velocityDisabled: true }}
                                wheel={{ wheelDisabled: false }}
                                pinch={{ pinchDisabled: false }}
                            >
                                {({
                                    zoomIn,
                                    zoomOut,
                                    resetTransform,
                                    instance,
                                }) => (
                                    <>
                                        {/* Zoom Controls */}
                                        <div className="sticky top-2 sm:top-4 right-2 sm:right-4 flex gap-1 sm:gap-2 z-20 justify-end p-2">
                                            <button
                                                onClick={() => zoomIn(0.2)}
                                                className="p-1.5 sm:p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                                                title="Perbesar"
                                            >
                                                <FaSearchPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                                            </button>
                                            <button
                                                onClick={() => zoomOut(0.2)}
                                                className="p-1.5 sm:p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                                                title="Perkecil"
                                            >
                                                <FaSearchMinus className="w-3 h-3 sm:w-4 sm:h-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    resetTransform();
                                                    instance.centerView(0.8);
                                                }}
                                                className="p-1.5 sm:p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                                                title="Reset Zoom"
                                            >
                                                <TbZoomReset className="w-3 h-3 sm:w-4 sm:h-4" />
                                            </button>
                                            <button
                                                onClick={toggleFullscreen}
                                                className="p-1.5 sm:p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                                                title="Fullscreen"
                                            >
                                                <FaExpand className="w-3 h-3 sm:w-4 sm:h-4" />
                                            </button>
                                        </div>

                                        {/* Chart Container */}
                                        <div
                                            className="overflow-hidden"
                                            style={{
                                                height: "calc(100vh - 250px)",
                                            }}
                                        >
                                            <TransformComponent
                                                wrapperStyle={{
                                                    width: "100%",
                                                    height: "100%",
                                                    overflow: "visible",
                                                }}
                                                contentStyle={{
                                                    width: "100%",
                                                    height: "100%",
                                                }}
                                            >
                                                <div className="min-w-fit p-4 sm:p-8">
                                                    <Tree
                                                        lineWidth={
                                                            isMobile
                                                                ? "0.5px"
                                                                : "1px"
                                                        }
                                                        lineColor="#cbd5e1"
                                                        lineBorderRadius="5px"
                                                        label={
                                                            <NodeLabel
                                                                data={
                                                                    organizationData
                                                                }
                                                                level={0}
                                                            />
                                                        }
                                                        className="transform-gpu"
                                                    >
                                                        {organizationData.children?.map(
                                                            (child) =>
                                                                renderNode(
                                                                    child,
                                                                    1
                                                                )
                                                        )}
                                                    </Tree>
                                                </div>
                                            </TransformComponent>
                                        </div>

                                        {/* Zoom Instructions */}
                                        <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 bg-gray-800/80 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 rounded-lg shadow-md z-20">
                                            <p>
                                                Scroll atau pinch untuk zoom,
                                                drag untuk geser
                                            </p>
                                        </div>
                                    </>
                                )}
                            </TransformWrapper>
                        </div>
                    </div>
                </div>
            </HomeLayout>
        </>
    );
}
