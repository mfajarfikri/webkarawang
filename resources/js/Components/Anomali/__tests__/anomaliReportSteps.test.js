import {
    REPORT_STEPS,
    REQUIRED_FIELDS,
    missingFields,
    firstIncompleteStep,
    stepStatus,
    requiredMessage,
} from "../anomaliReportSteps";

const complete = {
    judul: "Kebocoran minyak trafo",
    ultg: "ULTG Karawang",
    gardu_id: 3,
    bagian: "Hargi",
    tipe: "Major",
    kategori_id: 2,
    penempatan_alat: "Bay trafo 2",
    peralatan: "Trafo",
    tanggal_kejadian: "2026-11-17",
    penyebab: "Seal aus",
    akibat: "Minyak menetes",
    usul_saran: "Ganti seal",
    merek: "",
    lampiran_foto: [],
};

describe("REPORT_STEPS", () => {
    it("has five ordered steps ending with review", () => {
        expect(REPORT_STEPS.map((s) => s.id)).toEqual([1, 2, 3, 4, 5]);
        expect(REPORT_STEPS[4].required).toEqual([]);
    });

    it("mirrors every required rule of the backend store validator", () => {
        expect([...REQUIRED_FIELDS].sort()).toEqual(
            [
                "judul",
                "ultg",
                "gardu_id",
                "bagian",
                "tipe",
                "kategori_id",
                "peralatan",
                "penempatan_alat",
                "tanggal_kejadian",
                "penyebab",
                "akibat",
                "usul_saran",
            ].sort(),
        );
    });
});

describe("missingFields", () => {
    it("returns nothing for a complete step", () => {
        expect(missingFields(complete, 1)).toEqual([]);
        expect(missingFields(complete, 3)).toEqual([]);
    });

    it("treats empty strings, whitespace, null and undefined as missing", () => {
        const data = {
            ...complete,
            judul: "   ",
            gardu_id: null,
            tipe: undefined,
            bagian: "",
        };
        expect(missingFields(data, 1)).toEqual([
            "judul",
            "gardu_id",
            "bagian",
            "tipe",
        ]);
    });

    it("accepts numeric ids", () => {
        expect(missingFields({ ...complete, gardu_id: 7 }, 1)).toEqual([]);
    });

    it("never requires anything on the attachment and review steps", () => {
        expect(missingFields({}, 4)).toEqual([]);
        expect(missingFields({}, 5)).toEqual([]);
    });
});

describe("firstIncompleteStep", () => {
    it("returns null when every required field is filled", () => {
        expect(firstIncompleteStep(complete)).toBeNull();
    });

    it("returns the earliest step with a missing field", () => {
        expect(
            firstIncompleteStep({ ...complete, penyebab: "", judul: "" }),
        ).toBe(1);
        expect(firstIncompleteStep({ ...complete, penyebab: "" })).toBe(3);
    });
});

describe("stepStatus", () => {
    it("marks the current step as current", () => {
        expect(stepStatus(complete, 2, { currentStep: 2, furthest: 3 })).toBe(
            "current",
        );
    });

    it("marks visited complete steps as done and incomplete ones as attention", () => {
        const data = { ...complete, peralatan: "" };
        expect(stepStatus(data, 1, { currentStep: 3, furthest: 3 })).toBe(
            "done",
        );
        expect(stepStatus(data, 2, { currentStep: 3, furthest: 3 })).toBe(
            "attention",
        );
    });

    it("marks steps beyond the furthest visited as upcoming", () => {
        expect(stepStatus({}, 4, { currentStep: 2, furthest: 2 })).toBe(
            "upcoming",
        );
    });
});

describe("requiredMessage", () => {
    it("names the field in Indonesian", () => {
        expect(requiredMessage("gardu_id")).toBe("Gardu induk wajib diisi.");
    });
});
