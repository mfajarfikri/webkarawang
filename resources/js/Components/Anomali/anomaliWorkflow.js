/**
 * Alur proses anomali, diturunkan dari data yang sudah ada di backend.
 *
 * Status di database: New → (review) → Open | Rejected → (jadwal) → Close.
 * Penjadwalan tidak mengubah status, jadi tahap "Terjadwal" dibaca dari
 * tanggal_mulai. Fungsi di sini murni (tanpa efek samping) supaya mudah diuji.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const REVIEW_PERMISSION = "Review Anomali";

/** Urutan tahap pada pipeline proses (Ditolak ditampilkan terpisah). */
export const PIPELINE = ["review", "assigned", "scheduled", "closed"];

export const STAGES = {
    review: {
        label: "Menunggu review",
        short: "Review",
        hint: "Laporan baru menunggu persetujuan MULTG.",
        tone: "amber",
    },
    assigned: {
        label: "Perlu dijadwalkan",
        short: "Dijadwalkan",
        hint: "Disetujui dan ditugaskan ke bidang, belum ada jadwal.",
        tone: "brand",
    },
    scheduled: {
        label: "Terjadwal",
        short: "Dikerjakan",
        hint: "Jadwal pekerjaan sudah ditetapkan, menunggu ditutup.",
        tone: "violet",
    },
    closed: {
        label: "Selesai",
        short: "Selesai",
        hint: "Pekerjaan selesai dan anomali sudah ditutup.",
        tone: "emerald",
    },
    rejected: {
        label: "Ditolak",
        short: "Ditolak",
        hint: "Laporan ditolak saat review.",
        tone: "slate",
    },
};

const ACTIONS = {
    review: { label: "Review", routeName: "dashboard.anomali.review" },
    schedule: { label: "Jadwalkan", routeName: "dashboard.anomali.schedule" },
    close: { label: "Tutup", routeName: "dashboard.anomali.close" },
    detail: { label: "Detail", routeName: "dashboard.anomali.show" },
};

function normalize(value) {
    return (value ?? "").toString().trim().toLowerCase();
}

function toDate(value) {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Tahap proses anomali: review | assigned | scheduled | closed | rejected. */
export function deriveStage(anomali) {
    const status = normalize(anomali?.status);
    if (status === "rejected") return "rejected";
    if (status === "close" || status === "closed") return "closed";
    if (status === "" || status === "new") return "review";
    return anomali?.tanggal_mulai ? "scheduled" : "assigned";
}

/** Pekerjaan terjadwal yang tanggal selesainya sudah lewat (sebelum hari ini). */
export function isOverdue(anomali, today = new Date()) {
    if (deriveStage(anomali) !== "scheduled") return false;
    const end = toDate(anomali?.tanggal_selesai);
    if (!end) return false;
    return startOfDay(end) < startOfDay(today);
}

function daysBetween(from, to) {
    return Math.round((startOfDay(to) - startOfDay(from)) / MS_PER_DAY);
}

/**
 * Posisi pekerjaan terjadwal terhadap jadwalnya:
 * upcoming (hari menuju mulai), ongoing (hari menuju selesai),
 * atau overdue (hari lewat dari tanggal selesai). Null bila tidak terjadwal.
 */
export function scheduleProgress(anomali, today = new Date()) {
    if (deriveStage(anomali) !== "scheduled") return null;
    const start = toDate(anomali?.tanggal_mulai);
    if (!start) return null;
    const end = toDate(anomali?.tanggal_selesai) ?? start;

    if (startOfDay(today) < startOfDay(start)) {
        return { kind: "upcoming", days: daysBetween(today, start) };
    }
    if (startOfDay(today) <= startOfDay(end)) {
        return { kind: "ongoing", days: daysBetween(today, end) };
    }
    return { kind: "overdue", days: daysBetween(end, today) };
}

/** Sejak kapan anomali berada di tahapnya sekarang. */
function stageStartedAt(anomali) {
    switch (deriveStage(anomali)) {
        case "review":
            return toDate(anomali?.created_at);
        case "assigned":
            return toDate(anomali?.tanggal_approve) ?? toDate(anomali?.updated_at);
        case "scheduled":
            return toDate(anomali?.tanggal_mulai);
        default:
            return null;
    }
}

/** Jumlah hari menunggu di tahap sekarang; null bila sudah selesai/ditolak. */
export function waitingDays(anomali, today = new Date()) {
    const since = stageStartedAt(anomali);
    if (!since) return null;
    const diff = startOfDay(today) - startOfDay(since);
    return Math.max(0, Math.round(diff / MS_PER_DAY));
}

function canReview(anomali, user) {
    const permissions = Array.isArray(user?.permissions)
        ? user.permissions
        : [];
    if (!permissions.includes(REVIEW_PERMISSION)) return false;
    // Reviewer tanpa wilayah (mis. admin pusat) boleh mereview semua wilayah.
    if (!user?.wilayah) return true;
    return normalize(user.wilayah) === normalize(anomali?.ultg);
}

function isAssignedToMyField(anomali, user) {
    const myField = normalize(user?.bidang);
    return myField !== "" && myField === normalize(anomali?.bidang_assigned);
}

function action(kind, isMine) {
    return { kind, ...ACTIONS[kind], isMine };
}

/**
 * Satu aksi berikutnya untuk sebuah anomali, dilihat dari pengguna tertentu.
 * `isMine` true berarti anomali menunggu tindakan pengguna ini.
 */
export function nextAction(anomali, user) {
    const stage = deriveStage(anomali);

    if (stage === "review" && canReview(anomali, user)) {
        return action("review", true);
    }
    if (stage === "assigned" && isAssignedToMyField(anomali, user)) {
        return action("schedule", true);
    }
    if (stage === "scheduled" && isAssignedToMyField(anomali, user)) {
        return action("close", true);
    }
    return action("detail", false);
}

/**
 * Aksi tambahan untuk bidang yang ditugaskan: menutup pekerjaan yang selesai
 * tanpa dijadwalkan, atau mengubah jadwal yang sudah ada.
 */
export function secondaryActions(anomali, user) {
    if (!isAssignedToMyField(anomali, user)) return [];
    const stage = deriveStage(anomali);
    if (stage === "assigned") return [action("close", true)];
    if (stage === "scheduled") {
        return [{ ...action("schedule", true), label: "Ubah jadwal" }];
    }
    return [];
}

export function isInMyQueue(anomali, user) {
    return nextAction(anomali, user).isMine;
}

/** Antrian tindakan pengguna: lewat jadwal dulu, lalu yang paling lama menunggu. */
export function buildMyQueue(anomalis, user, today = new Date()) {
    return anomalis
        .filter((a) => isInMyQueue(a, user))
        .map((a) => ({
            anomali: a,
            overdue: isOverdue(a, today),
            waiting: waitingDays(a, today) ?? 0,
        }))
        .sort(
            (x, y) =>
                Number(y.overdue) - Number(x.overdue) || y.waiting - x.waiting,
        )
        .map((entry) => entry.anomali);
}

/** Jumlah anomali per tahap, ditambah jumlah yang lewat jadwal. */
export function countByStage(anomalis, today = new Date()) {
    const counts = {
        review: 0,
        assigned: 0,
        scheduled: 0,
        closed: 0,
        rejected: 0,
        overdue: 0,
    };
    for (const a of anomalis) {
        counts[deriveStage(a)] += 1;
        if (isOverdue(a, today)) counts.overdue += 1;
    }
    return counts;
}
