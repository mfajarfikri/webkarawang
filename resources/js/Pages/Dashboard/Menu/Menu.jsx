import React, { useState, Fragment, useEffect } from "react";
import { Head, usePage, router, useForm } from "@inertiajs/react";
import DashboardLayout from "../../../Layouts/DashboardLayout";
import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaBars,
    FaChevronDown,
    FaChevronRight,
    FaSave,
    FaTimes,
    FaLink,
    FaLayerGroup,
} from "react-icons/fa";
import { Dialog, Transition, Switch } from "@headlessui/react";
import { useSnackbar } from "notistack";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function MenuManagement() {
    const { menus: initialMenus } = usePage().props;
    const { enqueueSnackbar } = useSnackbar();
    const [menus, setMenus] = useState(initialMenus);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMenu, setEditingMenu] = useState(null);
    const [expandedMenus, setExpandedMenus] = useState({});

    useEffect(() => {
        setMenus(initialMenus);
    }, [initialMenus]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        processing,
        reset,
        errors,
    } = useForm({
        parent_id: "",
        title: "",
        url: "",
        order: 0,
        is_active: true,
    });

    const toggleExpand = (id) => {
        setExpandedMenus((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const openModal = (menu = null, parentId = null) => {
        if (menu) {
            setEditingMenu(menu);
            setData({
                parent_id: menu.parent_id || "",
                title: menu.title,
                url: menu.url,
                order: menu.order,
                is_active: !!menu.is_active,
            });
        } else {
            setEditingMenu(null);
            reset();
            if (parentId) {
                setData("parent_id", parentId);
            }
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingMenu(null);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingMenu) {
            put(route("dashboard.menu.update", editingMenu.id), {
                onSuccess: () => {
                    enqueueSnackbar("Menu berhasil diperbarui!", {
                        variant: "success",
                    });
                    closeModal();
                },
            });
        } else {
            post(route("dashboard.menu.store"), {
                onSuccess: () => {
                    enqueueSnackbar("Menu berhasil ditambahkan!", {
                        variant: "success",
                    });
                    closeModal();
                },
            });
        }
    };

    const handleDelete = (id) => {
        if (
            confirm(
                "Apakah Anda yakin ingin menghapus menu ini? Semua submenu juga akan dihapus.",
            )
        ) {
            destroy(route("dashboard.menu.destroy", id), {
                onSuccess: () => {
                    enqueueSnackbar("Menu berhasil dihapus!", {
                        variant: "success",
                    });
                },
            });
        }
    };

    const updateNestedMenus = (list, activeId, overId) => {
        const activeIndex = list.findIndex((m) => m.id === activeId);
        const overIndex = list.findIndex((m) => m.id === overId);

        if (activeIndex !== -1 && overIndex !== -1) {
            return {
                updatedList: arrayMove(list, activeIndex, overIndex),
                found: true,
            };
        }

        for (let i = 0; i < list.length; i++) {
            if (list[i].submenus && list[i].submenus.length > 0) {
                const { updatedList, found } = updateNestedMenus(
                    list[i].submenus,
                    activeId,
                    overId,
                );
                if (found) {
                    const newList = [...list];
                    newList[i] = { ...list[i], submenus: updatedList };
                    return { updatedList: newList, found: true };
                }
            }
        }

        return { updatedList: list, found: false };
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (!over) return;

        if (active.id !== over.id) {
            const { updatedList } = updateNestedMenus(menus, active.id, over.id);
            setMenus(updatedList);

            // Find the list that was actually reordered to send to backend
            const findAndSendOrder = (list) => {
                const activeInThisList = list.some((m) => m.id === active.id);
                if (activeInThisList) {
                    const reorderData = list.map((item, index) => ({
                        id: item.id,
                        order: index + 1,
                    }));
                    router.post(
                        route("dashboard.menu.reorder"),
                        { menus: reorderData },
                        {
                            preserveScroll: true,
                            onSuccess: () => {
                                enqueueSnackbar("Urutan menu diperbarui!", {
                                    variant: "success",
                                });
                            },
                        },
                    );
                    return true;
                }
                for (const item of list) {
                    if (item.submenus && findAndSendOrder(item.submenus))
                        return true;
                }
                return false;
            };

            findAndSendOrder(updatedList);
        }
    };

    const SortableMenuItem = ({ menu, level = 0 }) => {
        const {
            attributes,
            listeners,
            setNodeRef,
            transform,
            transition,
            isDragging,
        } = useSortable({ id: menu.id });

        const style = {
            transform: CSS.Transform.toString(transform),
            transition,
            opacity: isDragging ? 0.5 : 1,
            zIndex: isDragging ? 50 : "auto",
        };

        const isExpanded = expandedMenus[menu.id];
        const hasSubmenus = menu.submenus && menu.submenus.length > 0;

        return (
            <div ref={setNodeRef} style={style} className="relative">
                <div
                    className={`flex items-center justify-between p-4 mb-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group ${level > 0 ? "ml-10" : ""}`}
                >
                    {/* Visual Connector for Nested Menus */}
                    {level > 0 && (
                        <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-6 h-px bg-gray-200">
                            <div className="absolute left-0 -top-12 w-px h-12 bg-gray-200"></div>
                        </div>
                    )}

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div
                                {...attributes}
                                {...listeners}
                                className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-50 rounded-xl text-gray-300 hover:text-cyan-500 transition-colors"
                            >
                                <FaBars size={16} />
                            </div>
                            
                            {hasSubmenus || level < 3 ? ( // Limit to 3 levels for UX, but logic supports more
                                <button
                                    onClick={() => toggleExpand(menu.id)}
                                    className={`p-1.5 rounded-lg transition-all duration-200 ${
                                        isExpanded 
                                            ? "bg-cyan-50 text-cyan-600 rotate-0" 
                                            : "hover:bg-gray-50 text-gray-400"
                                    } ${!hasSubmenus ? "opacity-0 pointer-events-none" : ""}`}
                                >
                                    <FaChevronDown size={12} className={`transition-transform duration-200 ${isExpanded ? "" : "-rotate-90"}`} />
                                </button>
                            ) : (
                                <div className="w-7" />
                            )}
                        </div>

                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-800 group-hover:text-cyan-600 transition-colors">
                                    {menu.title}
                                </span>
                                {level === 0 && <FaLayerGroup className="text-gray-300 text-[10px]" title="Menu Utama" />}
                            </div>
                            <div className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                                <FaLink size={10} className="text-gray-300" />
                                <span className="truncate max-w-[150px] sm:max-w-xs">{menu.url}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-3">
                        <div className="hidden sm:flex items-center gap-2 mr-2">
                            <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    menu.is_active 
                                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                                        : "bg-rose-50 text-rose-600 border border-rose-100"
                                }`}
                            >
                                {menu.is_active ? "Aktif" : "Non-aktif"}
                            </span>
                            <span className="px-2.5 py-1 rounded-full bg-slate-50 text-slate-500 border border-slate-100 text-[10px] font-bold">
                                #{menu.order}
                            </span>
                        </div>

                        <div className="flex items-center bg-gray-50/50 rounded-xl p-1 border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => openModal(null, menu.id)}
                                className="p-2 text-cyan-600 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                                title="Tambah Submenu"
                            >
                                <FaPlus size={14} />
                            </button>
                            <button
                                onClick={() => openModal(menu)}
                                className="p-2 text-amber-500 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                                title="Edit"
                            >
                                <FaEdit size={14} />
                            </button>
                            <button
                                onClick={() => handleDelete(menu.id)}
                                className="p-2 text-rose-500 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                                title="Hapus"
                            >
                                <FaTrash size={14} />
                            </button>
                        </div>
                    </div>
                </div>

                {isExpanded && hasSubmenus && (
                    <div className="mb-4">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={menu.submenus.map((s) => s.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {menu.submenus.map((sub) => (
                                    <SortableMenuItem
                                        key={sub.id}
                                        menu={sub}
                                        level={level + 1}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    </div>
                )}
            </div>
        );
    };

    return (
        <DashboardLayout>
            <Head title="Manajemen Menu" />

            <div className="p-4 sm:p-8 max-w-5xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2.5 bg-cyan-600 rounded-2xl shadow-lg shadow-cyan-200">
                                <FaBars className="text-white" />
                            </div>
                            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                                Manajemen Menu
                            </h1>
                        </div>
                        <p className="text-slate-500 text-sm font-medium">
                            Susun navigasi website dengan struktur tak terbatas dan antarmuka drag-and-drop.
                        </p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-2xl shadow-xl shadow-cyan-100 transition-all duration-300 font-bold text-sm active:scale-95"
                    >
                        <FaPlus /> Tambah Menu Utama
                    </button>
                </div>

                <div className="space-y-2">
                    {menus.length > 0 ? (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={menus.map((m) => m.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {menus.map((menu) => (
                                    <SortableMenuItem
                                        key={menu.id}
                                        menu={menu}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    ) : (
                        <div className="text-center py-24 bg-white rounded-[32px] border-2 border-dashed border-slate-100 shadow-inner">
                            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaBars className="text-slate-300 text-2xl" />
                            </div>
                            <h3 className="text-slate-400 font-bold">Belum ada menu</h3>
                            <p className="text-slate-300 text-xs mt-1">Mulai dengan menambahkan menu utama pertama Anda.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Form */}
            <Transition show={isModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-[100]" onClose={closeModal}>
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
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-[32px] bg-white p-8 text-left align-middle shadow-2xl transition-all border border-white">
                                    <div className="flex justify-between items-center mb-8">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-cyan-50 rounded-xl">
                                                <FaEdit className="text-cyan-600" />
                                            </div>
                                            <Dialog.Title
                                                as="h3"
                                                className="text-xl font-black text-slate-800 tracking-tight"
                                            >
                                                {editingMenu
                                                    ? "Edit Menu"
                                                    : "Tambah Menu"}
                                            </Dialog.Title>
                                        </div>
                                        <button
                                            onClick={closeModal}
                                            className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                                        >
                                            <FaTimes size={18} />
                                        </button>
                                    </div>

                                    <form
                                        onSubmit={handleSubmit}
                                        className="space-y-6"
                                    >
                                        <div className="space-y-1.5">
                                            <label className="text-[13px] font-bold text-slate-500 ml-1">
                                                JUDUL MENU
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3.5 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all text-sm font-medium text-slate-700"
                                                value={data.title}
                                                onChange={(e) =>
                                                    setData(
                                                        "title",
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Contoh: Beranda"
                                                required
                                            />
                                            {errors.title && (
                                                <div className="text-rose-500 text-[11px] font-bold ml-1 mt-1 uppercase tracking-wider">
                                                    {errors.title}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[13px] font-bold text-slate-500 ml-1">
                                                URL / ROUTE
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3.5 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all text-sm font-medium text-slate-700"
                                                value={data.url}
                                                onChange={(e) =>
                                                    setData(
                                                        "url",
                                                        e.target.value,
                                                    )
                                                }
                                                onBlur={(e) =>
                                                    setData(
                                                        "url",
                                                        e.target.value.trim(),
                                                    )
                                                }
                                                placeholder="Contoh: /profil atau #"
                                                required
                                            />
                                            {errors.url && (
                                                <div className="text-rose-500 text-[11px] font-bold ml-1 mt-1 uppercase tracking-wider">
                                                    {errors.url}
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[13px] font-bold text-slate-500 ml-1">
                                                    URUTAN
                                                </label>
                                                <input
                                                    type="number"
                                                    className="w-full px-4 py-3.5 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all text-sm font-medium text-slate-700"
                                                    value={data.order}
                                                    onChange={(e) =>
                                                        setData(
                                                            "order",
                                                            e.target.value,
                                                        )
                                                    }
                                                    required
                                                />
                                                {errors.order && (
                                                    <div className="text-rose-500 text-[11px] font-bold ml-1 mt-1 uppercase tracking-wider">
                                                        {errors.order}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <label className="text-[13px] font-bold text-slate-500 ml-1 mb-2">
                                                    STATUS
                                                </label>
                                                <div className="flex items-center gap-3 mt-1 px-1">
                                                    <Switch
                                                        checked={data.is_active}
                                                        onChange={(val) =>
                                                            setData(
                                                                "is_active",
                                                                val,
                                                            )
                                                        }
                                                        className={`${
                                                            data.is_active
                                                                ? "bg-cyan-600 shadow-lg shadow-cyan-200"
                                                                : "bg-slate-200"
                                                        } relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-cyan-500/20`}
                                                    >
                                                        <span
                                                            className={`${
                                                                data.is_active
                                                                    ? "translate-x-6"
                                                                    : "translate-x-1"
                                                            } inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 shadow-sm`}
                                                        />
                                                    </Switch>
                                                    <span className={`text-[13px] font-bold ${data.is_active ? "text-cyan-600" : "text-slate-400"}`}>
                                                        {data.is_active
                                                            ? "AKTIF"
                                                            : "OFF"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-10 flex gap-3">
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="flex-1 flex justify-center items-center gap-2 px-6 py-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-cyan-100 transition-all active:scale-95 disabled:opacity-50"
                                            >
                                                <FaSave size={16} />{" "}
                                                {processing
                                                    ? "MENYIMPAN..."
                                                    : "SIMPAN PERUBAHAN"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={closeModal}
                                                className="px-6 py-4 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-2xl font-bold text-sm transition-all"
                                            >
                                                BATAL
                                            </button>
                                        </div>
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
