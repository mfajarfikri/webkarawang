import { Switch } from "@headlessui/react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
    FaChevronLeft,
    FaChevronRight,
    FaNewspaper,
    FaRegImage,
    FaSearch,
} from "react-icons/fa";
import { Card, EmptyState } from "@/Components/Dashboard/ui";

/** Nama berkas gambar pertama; `gambar` bisa berupa string JSON atau array. */
function firstImage(gambar) {
    let list = gambar;
    if (typeof gambar === "string") {
        try {
            list = JSON.parse(gambar);
        } catch {
            return null;
        }
    }
    return Array.isArray(list) && list.length > 0 ? list[0] : null;
}

function formatDate(value) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return format(date, "d MMM yyyy", { locale: localeId });
}

/** Nomor halaman dengan elipsis; null menandai celah. */
function pageItems(current, total) {
    const pages = [];
    for (let page = 1; page <= total; page += 1) {
        const isEdge = page === 1 || page === total;
        if (isEdge || Math.abs(page - current) <= 1) {
            pages.push(page);
        } else if (pages[pages.length - 1] !== null) {
            pages.push(null);
        }
    }
    return pages;
}

function BeritaRow({ item, onToggle }) {
    const image = firstImage(item.gambar);
    const date = formatDate(item.created_at);

    return (
        <li className="flex items-center gap-3 px-5 py-3 sm:gap-4 sm:px-6">
            {image ? (
                <img
                    src={`/storage/berita/${image}`}
                    alt=""
                    loading="lazy"
                    className="h-12 w-12 shrink-0 rounded-xl object-cover ring-1 ring-slate-200"
                />
            ) : (
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                    <FaRegImage className="h-4 w-4" aria-hidden="true" />
                </span>
            )}
            <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-semibold text-ink-900">
                    {item.judul}
                </p>
                {date ? (
                    <p className="mt-0.5 text-xs text-slate-500">{date}</p>
                ) : null}
            </div>
            <Switch
                checked={item.enabled}
                onChange={() => onToggle(item.id, item.enabled)}
                aria-label="Tampilkan di beranda"
                title="Tampilkan di beranda"
                className="group relative inline-flex h-6 w-11 shrink-0 items-center rounded-full bg-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 data-[checked]:bg-brand-600"
            >
                <span className="inline-block h-4 w-4 translate-x-1 rounded-full bg-white shadow-sm transition-transform group-data-[checked]:translate-x-6" />
            </Switch>
        </li>
    );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
    const roundBtn =
        "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold tabular-nums transition-colors disabled:cursor-not-allowed disabled:opacity-40";

    return (
        <nav aria-label="Halaman berita" className="flex items-center gap-1">
            <button
                type="button"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Halaman sebelumnya"
                className={`${roundBtn} text-slate-500 hover:bg-slate-100`}
            >
                <FaChevronLeft className="h-3 w-3" aria-hidden="true" />
            </button>
            {pageItems(currentPage, totalPages).map((page, index) =>
                page === null ? (
                    <span
                        key={`gap-${index}`}
                        className="w-5 text-center text-xs text-slate-400"
                    >
                        …
                    </span>
                ) : (
                    <button
                        key={page}
                        type="button"
                        onClick={() => onPageChange(page)}
                        aria-current={page === currentPage ? "page" : undefined}
                        className={`${roundBtn} ${
                            page === currentPage
                                ? "bg-ink-900 text-white"
                                : "text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                        {page}
                    </button>
                ),
            )}
            <button
                type="button"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Halaman berikutnya"
                className={`${roundBtn} text-slate-500 hover:bg-slate-100`}
            >
                <FaChevronRight className="h-3 w-3" aria-hidden="true" />
            </button>
        </nav>
    );
}

/** Daftar berita dengan sakelar untuk carousel halaman utama. */
export default function BeritaHomepageCard({
    items,
    enabledCount,
    totalCount,
    searchQuery,
    onSearchChange,
    currentPage,
    totalPages,
    onPageChange,
    onToggle,
}) {
    return (
        <Card
            title="Berita di beranda"
            description="Pilih berita yang tampil di carousel halaman utama."
            icon={FaNewspaper}
            padded={false}
            clip={false}
            actions={
                <span className="text-xs font-medium text-slate-500">
                    <span className="font-semibold tabular-nums text-ink-900">
                        {enabledCount}
                    </span>{" "}
                    dari <span className="tabular-nums">{totalCount}</span>{" "}
                    tampil di beranda
                </span>
            }
            footer={
                totalPages > 1 ? (
                    <div className="flex justify-center sm:justify-end">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={onPageChange}
                        />
                    </div>
                ) : null
            }
        >
            <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                <label htmlFor="berita-search" className="sr-only">
                    Cari berita
                </label>
                <div className="relative max-w-md">
                    <FaSearch
                        className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
                        aria-hidden="true"
                    />
                    <input
                        id="berita-search"
                        type="search"
                        value={searchQuery}
                        onChange={onSearchChange}
                        placeholder="Cari judul berita..."
                        className="field-input pl-10"
                    />
                </div>
            </div>
            {items.length > 0 ? (
                <ul className="divide-y divide-slate-100">
                    {items.map((item) => (
                        <BeritaRow key={item.id} item={item} onToggle={onToggle} />
                    ))}
                </ul>
            ) : (
                <EmptyState
                    icon={FaNewspaper}
                    title="Tidak ada berita yang ditemukan"
                    description={
                        searchQuery
                            ? "Coba kata kunci lain."
                            : "Belum ada berita. Tulis berita pertama Anda."
                    }
                />
            )}
        </Card>
    );
}
