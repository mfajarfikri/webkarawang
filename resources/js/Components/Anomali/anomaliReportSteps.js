/**
 * Langkah-langkah form "Lapor Anomali" dan aturan wajib-isinya.
 * Daftar `required` menyalin aturan `required` di AnomaliController@store,
 * supaya kekurangan isian ketahuan di langkahnya, bukan setelah dikirim.
 */

export const REPORT_STEPS = [
    {
        id: 1,
        title: "Informasi anomali",
        hint: "Judul, lokasi, dan klasifikasi",
        required: [
            "judul",
            "ultg",
            "gardu_id",
            "bagian",
            "tipe",
            "kategori_id",
            "penempatan_alat",
        ],
    },
    {
        id: 2,
        title: "Detail peralatan",
        hint: "Data alat dan tanggal kejadian",
        required: ["peralatan", "tanggal_kejadian"],
    },
    {
        id: 3,
        title: "Analisa",
        hint: "Penyebab, akibat, dan usulan",
        required: ["penyebab", "akibat", "usul_saran"],
    },
    {
        id: 4,
        title: "Lampiran",
        hint: "Foto pendukung (opsional)",
        required: [],
    },
    {
        id: 5,
        title: "Tinjau & kirim",
        hint: "Periksa sebelum dikirim",
        required: [],
    },
];

export const LAST_STEP = REPORT_STEPS.length;

export const REQUIRED_FIELDS = new Set(
    REPORT_STEPS.flatMap((step) => step.required),
);

const FIELD_LABELS = {
    judul: "Judul",
    ultg: "ULTG",
    gardu_id: "Gardu induk",
    bagian: "Bagian",
    tipe: "Tipe",
    kategori_id: "Kategori",
    penempatan_alat: "Penempatan alat",
    peralatan: "Peralatan",
    tanggal_kejadian: "Tanggal kejadian",
    penyebab: "Penyebab",
    akibat: "Akibat",
    usul_saran: "Usul dan saran",
};

export function fieldLabel(field) {
    return FIELD_LABELS[field] ?? field;
}

export function requiredMessage(field) {
    return `${fieldLabel(field)} wajib diisi.`;
}

function isEmpty(value) {
    if (value === null || value === undefined) return true;
    if (typeof value === "string") return value.trim() === "";
    return false;
}

export function findStep(stepId) {
    return REPORT_STEPS.find((step) => step.id === stepId) ?? null;
}

/** Field wajib yang belum terisi pada satu langkah, berurutan sesuai form. */
export function missingFields(data, stepId) {
    const step = findStep(stepId);
    if (!step) return [];
    return step.required.filter((field) => isEmpty(data?.[field]));
}

/** Langkah paling awal yang masih punya isian wajib kosong; null bila lengkap. */
export function firstIncompleteStep(data) {
    const step = REPORT_STEPS.find(
        (candidate) => missingFields(data, candidate.id).length > 0,
    );
    return step ? step.id : null;
}

/**
 * Status tampilan sebuah langkah di navigasi:
 * current | done | attention (sudah dilewati tapi belum lengkap) | upcoming.
 */
export function stepStatus(data, stepId, { currentStep, furthest }) {
    if (stepId === currentStep) return "current";
    if (stepId > furthest) return "upcoming";
    return missingFields(data, stepId).length > 0 ? "attention" : "done";
}
