import React, { useState, Fragment, useEffect } from "react";
import { Head, usePage, router, useForm } from "@inertiajs/react";
import DashboardLayout from "../../../Layouts/DashboardLayout";
import PageHeader, { HeaderStat } from "@/Components/Dashboard/PageHeader";
import { Badge, Card, EmptyState } from "@/Components/Dashboard/ui";
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

import { PERMISSIONS, useCan } from "@/utils/permissions";
export default function MenuManagement() {
    const canManage = useCan()(PERMISSIONS.MENU_MANAGE);
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
        } = useSortable({ id: menu.id, disabled: !canManage });

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
                    className={`group mb-2.5 flex items-center justify-between gap-3 rounded-2xl border bg-white p-3 transition sm:p-4 ${
                        isDragging
                            ? "border-brand-300 shadow-lift"
                            : "border-slate-200/80 shadow-soft hover:border-slate-300"
                    } ${level > 0 ? "ml-10" : ""}`}
                >
                    {/* Visual Connector for Nested Menus */}
                    {level > 0 && (
                        <div className="absolute -left-6 top-1/2 h-px w-6 -translate-y-1/2 bg-slate-200">
                            <div className="absolute -top-12 left-0 h-12 w-px bg-slate-200"></div>
                        </div>
                    )}

                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex items-center gap-1.5">
                            {canManage ? (
                                <div
                                    {...attributes}
                                    {...listeners}
                                    className="cursor-grab rounded-full p-2 text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-600 active:cursor-grabbing"
                                >
                                    <FaBars size={14} />
                                </div>
                            ) : null}

                            {hasSubmenus || level < 3 ? ( // Limit to 3 levels for UX, but logic supports more
                                <button
                                    onClick={() => toggleExpand(menu.id)}
                                    className={`flex h-7 w-7 items-center justify-center rounded-full transition ${
                                        isExpanded
                                            ? "bg-brand-50 text-brand-700"
                                            : "text-slate-400 hover:bg-slate-100 hover:text-ink-900"
                                    } ${!hasSubmenus ? "pointer-events-none opacity-0" : ""}`}
                                >
                                    <FaChevronDown size={11} className={`transition-transform duration-200 ${isExpanded ? "" : "-rotate-90"}`} />
                                </button>
                            ) : (
                                <div className="w-7" />
                            )}
                        </div>

                        <div className="flex min-w-0 flex-col">
                            <div className="flex items-center gap-2">
                                <span className="truncate font-semibold text-ink-900">
                                    {menu.title}
                                </span>
                                {level === 0 && <FaLayerGroup className="shrink-0 text-[10px] text-slate-300" title="Menu Utama" />}
                                {hasSubmenus && (
                                    <span className="text-[11px] font-medium text-slate-400">
                                        {menu.submenus.length} submenu
                                    </span>
                                )}
                            </div>
                            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                                <FaLink size={9} className="shrink-0 text-slate-300" />
                                <span className="max-w-[150px] truncate font-mono text-[11px] sm:max-w-xs">{menu.url}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
                        <div className="mr-1 hidden items-center gap-2 sm:flex">
                            <Badge tone={menu.is_active ? "emerald" : "rose"} dot>
                                {menu.is_active ? "Aktif" : "Non-aktif"}
                            </Badge>
                            <span className="text-xs font-semibold tabular-nums text-slate-400">
                                #{menu.order}
                            </span>
                        </div>

                        {canManage ? (
                            <div className="flex items-center gap-0.5 transition-opacity focus-within:opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                                <button
                                    onClick={() => openModal(null, menu.id)}
                                    className="btn-icon hover:!bg-brand-50 hover:!text-brand-700"
                                    title="Tambah Submenu"
                                    aria-label="Tambah Submenu"
                                >
                                    <FaPlus size={13} />
                                </button>
                                <button
                                    onClick={() => openModal(menu)}
                                    className="btn-icon"
                                    title="Edit"
                                    aria-label="Edit"
                                >
                                    <FaEdit size={13} />
                                </button>
                                <button
                                    onClick={() => handleDelete(menu.id)}
                                    className="btn-icon hover:!bg-rose-50 hover:!text-rose-600"
                                    title="Hapus"
                                    aria-label="Hapus"
                                >
                                    <FaTrash size={13} />
                                </button>
                            </div>
                        ) : null}
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
        <DashboardLayout title="Manajemen Menu">
            <Head title="Manajemen Menu" />

            <div className="mx-auto max-w-5xl space-y-6">
                <PageHeader
                    icon={FaBars}
                    title="Manajemen Menu"
                    description="Susun navigasi website dengan struktur tak terbatas dan antarmuka drag-and-drop."
                >
                    {canManage ? (
                        <button onClick={() => openModal()} className="btn-brand">
                            <FaPlus className="h-3.5 w-3.5" /> Tambah Menu Utama
                        </button>
                    ) : null}
                </PageHeader>

                {menus.length > 0 ? (
                    <Card
                        title="Struktur Navigasi"
                        description="Seret ikon garis untuk mengubah urutan. Arahkan kursor ke baris untuk aksi tambah, ubah, dan hapus."
                        icon={FaLayerGroup}
                        bodyClassName="bg-slate-50/60"
                    >
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
                    </Card>
                ) : (
                    <div className="surface">
                        <EmptyState
                            icon={FaBars}
                            title="Belum ada menu"
                            description="Mulai dengan menambahkan menu utama pertama Anda."
                        />
                    </div>
                )}
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
                        <div className="fixed inset-0 bg-ink-950/50 backdrop-blur-sm" />
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
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl border border-slate-200/80 bg-white text-left align-middle shadow-lift transition-all">
                                    <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                                                <FaEdit className="h-4 w-4" />
                                            </span>
                                            <Dialog.Title
                                                as="h3"
                                                className="text-base font-bold text-ink-900"
                                            >
                                                {editingMenu
                                                    ? "Edit Menu"
                                                    : "Tambah Menu"}
                                            </Dialog.Title>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="btn-icon"
                                            aria-label="Tutup"
                                        >
                                            <FaTimes size={16} />
                                        </button>
                                    </div>

                                    <form onSubmit={handleSubmit}>
                                        <div className="space-y-4 px-6 py-5">
                                            <div>
                                                <label
                                                    htmlFor="menu-title"
                                                    className="field-label"
                                                >
                                                    Judul Menu
                                                </label>
                                                <input
                                                    id="menu-title"
                                                    type="text"
                                                    className="field-input"
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
                                                    <p className="field-error">
                                                        {errors.title}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor="menu-url"
                                                    className="field-label"
                                                >
                                                    URL / Route
                                                </label>
                                                <input
                                                    id="menu-url"
                                                    type="text"
                                                    className="field-input font-mono"
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
                                                    <p className="field-error">
                                                        {errors.url}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label
                                                        htmlFor="menu-order"
                                                        className="field-label"
                                                    >
                                                        Urutan
                                                    </label>
                                                    <input
                                                        id="menu-order"
                                                        type="number"
                                                        className="field-input tabular-nums"
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
                                                        <p className="field-error">
                                                            {errors.order}
                                                        </p>
                                                    )}
                                                </div>
                                                <div>
                                                    <span className="field-label">
                                                        Status
                                                    </span>
                                                    <div className="flex h-[42px] items-center gap-3">
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
                                                                    ? "bg-emerald-500"
                                                                    : "bg-slate-200"
                                                            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2`}
                                                        >
                                                            <span
                                                                className={`${
                                                                    data.is_active
                                                                        ? "translate-x-6"
                                                                        : "translate-x-1"
                                                                } inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200`}
                                                            />
                                                        </Switch>
                                                        <span className={`text-sm font-semibold ${data.is_active ? "text-emerald-700" : "text-slate-500"}`}>
                                                            {data.is_active
                                                                ? "Aktif"
                                                                : "Nonaktif"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-3">
                                            <button
                                                type="button"
                                                onClick={closeModal}
                                                className="btn-ghost"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="btn-brand"
                                            >
                                                <FaSave className="h-3.5 w-3.5" />
                                                {processing
                                                    ? "Menyimpan..."
                                                    : "Simpan Perubahan"}
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
