import { usePage } from "@inertiajs/react";

/**
 * Nama izin Spatie yang dipakai route dashboard (lihat routes/web.php).
 * Satu sumber supaya sidebar, tombol aksi, dan middleware tidak saling beda.
 */
export const PERMISSIONS = Object.freeze({
    BERITA_VIEW: "Dashboard Berita",
    BERITA_CREATE: "Buat Berita",
    BERITA_DETAIL: "Detail Berita",
    BERITA_EDIT: "Edit Berita",
    BERITA_DELETE: "Hapus Berita",
    KTT_VIEW: "View Ktt",
    KTT_CREATE: "Buat Ktt",
    KTT_DETAIL: "Detail Ktt",
    ANOMALI_VIEW: "View Anomali",
    ANOMALI_CREATE_FORM: "View Anomali Create",
    ANOMALI_CREATE: "Buat Anomali",
    ANOMALI_REVIEW: "Review Anomali",
    ANOMALI_APPROVE: "Approve Anomali",
    ANOMALI_EXPORT: "Export Anomali",
    ANOMALI_MANAGE: "Kelola Anomali",
    GARDU_VIEW: "View Gardu Induk",
    USER_VIEW: "View User",
    USER_MANAGE: "Kelola User",
    ROLE_VIEW: "View Role",
    ROLE_MANAGE: "Kelola Role",
    PERMISSION_VIEW: "View Permission",
    PERMISSION_MANAGE: "Kelola Permission",
    MENU_VIEW: "View Menu",
    MENU_MANAGE: "Kelola Menu",
    COMPANY_PROFILE_MANAGE: "Kelola Company Profile",
    KINERJA_VIEW: "View Kinerja",
});

/**
 * @param {{ permissions?: string[] } | null | undefined} user
 * @param {string | string[] | undefined} required  satu izin, atau daftar yang semuanya wajib
 * @returns {boolean}
 */
export function hasPermission(user, required) {
    if (!required || (Array.isArray(required) && required.length === 0)) {
        return true;
    }
    const owned = Array.isArray(user?.permissions) ? user.permissions : [];
    const needed = Array.isArray(required) ? required : [required];
    return needed.every((name) => owned.includes(name));
}

/** Pemeriksa izin untuk user yang sedang login. */
export function useCan() {
    const user = usePage().props?.auth?.user;
    return (required) => hasPermission(user, required);
}
