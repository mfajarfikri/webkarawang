import {
    deriveStage,
    isOverdue,
    waitingDays,
    nextAction,
    isInMyQueue,
    buildMyQueue,
    countByStage,
    scheduleProgress,
    secondaryActions,
} from "../anomaliWorkflow";

const TODAY = new Date("2026-11-18T10:00:00");

function anomali(overrides = {}) {
    return {
        id: 1,
        slug: "trafo-bocor",
        status: "New",
        ultg: "ULTG Karawang",
        bidang_assigned: null,
        created_at: "2026-11-10T08:00:00",
        tanggal_approve: null,
        tanggal_mulai: null,
        tanggal_selesai: null,
        ...overrides,
    };
}

const multg = {
    bidang: "MULTG",
    wilayah: "ULTG Karawang",
    permissions: ["View Anomali", "Review Anomali"],
};
const harjar = {
    bidang: "Harjar",
    wilayah: "ULTG Karawang",
    permissions: ["View Anomali", "Kelola Anomali"],
};
const harjarNoManage = { ...harjar, permissions: ["View Anomali"] };
const renev = {
    bidang: "Renev",
    wilayah: null,
    permissions: ["View Anomali", "Kelola Anomali"],
};
const viewer = { bidang: null, wilayah: null, permissions: ["View Anomali"] };

describe("deriveStage", () => {
    it("maps New to review and Rejected to rejected", () => {
        expect(deriveStage(anomali({ status: "New" }))).toBe("review");
        expect(deriveStage(anomali({ status: "Rejected" }))).toBe("rejected");
    });

    it("maps Close to closed regardless of schedule", () => {
        expect(
            deriveStage(
                anomali({ status: "Close", tanggal_mulai: "2026-11-01" }),
            ),
        ).toBe("closed");
    });

    it("splits Open into assigned and scheduled by schedule presence", () => {
        expect(deriveStage(anomali({ status: "Open" }))).toBe("assigned");
        expect(
            deriveStage(
                anomali({
                    status: "Open",
                    tanggal_mulai: "2026-11-20",
                    tanggal_selesai: "2026-11-21",
                }),
            ),
        ).toBe("scheduled");
    });

    it("treats legacy in-progress statuses as working stages", () => {
        expect(deriveStage(anomali({ status: "In Progress" }))).toBe(
            "assigned",
        );
        expect(
            deriveStage(
                anomali({ status: "Pending", tanggal_mulai: "2026-11-20" }),
            ),
        ).toBe("scheduled");
    });

    it("handles a missing status as review", () => {
        expect(deriveStage(anomali({ status: null }))).toBe("review");
    });
});

describe("isOverdue", () => {
    it("is true only for scheduled work whose end date has passed", () => {
        const late = anomali({
            status: "Open",
            tanggal_mulai: "2026-11-01",
            tanggal_selesai: "2026-11-17",
        });
        const endsToday = { ...late, tanggal_selesai: "2026-11-18" };
        const closedLate = { ...late, status: "Close" };

        expect(isOverdue(late, TODAY)).toBe(true);
        expect(isOverdue(endsToday, TODAY)).toBe(false);
        expect(isOverdue(closedLate, TODAY)).toBe(false);
    });
});

describe("waitingDays", () => {
    it("counts from report date while waiting for review", () => {
        expect(waitingDays(anomali(), TODAY)).toBe(8);
    });

    it("counts from approval date while waiting for a schedule", () => {
        const a = anomali({
            status: "Open",
            tanggal_approve: "2026-11-15T09:00:00",
        });
        expect(waitingDays(a, TODAY)).toBe(3);
    });

    it("returns null for finished work", () => {
        expect(waitingDays(anomali({ status: "Close" }), TODAY)).toBeNull();
    });
});

describe("scheduleProgress", () => {
    const scheduled = (start, end) =>
        anomali({
            status: "Open",
            tanggal_mulai: start,
            tanggal_selesai: end,
        });

    it("reports days until an upcoming start", () => {
        expect(
            scheduleProgress(scheduled("2026-11-22", "2026-11-24"), TODAY),
        ).toEqual({ kind: "upcoming", days: 4 });
    });

    it("reports ongoing work between start and end, inclusive", () => {
        expect(
            scheduleProgress(scheduled("2026-11-18", "2026-11-18"), TODAY),
        ).toEqual({ kind: "ongoing", days: 0 });
        expect(
            scheduleProgress(scheduled("2026-11-15", "2026-11-20"), TODAY),
        ).toEqual({ kind: "ongoing", days: 2 });
    });

    it("reports how many days past the end date", () => {
        expect(
            scheduleProgress(scheduled("2026-11-10", "2026-11-15"), TODAY),
        ).toEqual({ kind: "overdue", days: 3 });
    });

    it("returns null when the anomaly is not scheduled", () => {
        expect(scheduleProgress(anomali({ status: "Open" }), TODAY)).toBeNull();
        expect(
            scheduleProgress(
                anomali({ status: "Close", tanggal_mulai: "2026-11-01" }),
                TODAY,
            ),
        ).toBeNull();
    });
});

describe("nextAction", () => {
    it("offers Review to a reviewer in the same region", () => {
        expect(nextAction(anomali(), multg)).toMatchObject({
            kind: "review",
            routeName: "dashboard.anomali.review",
            isMine: true,
        });
    });

    it("falls back to Detail for a reviewer from another region", () => {
        const other = anomali({ ultg: "ULTG Purwakarta" });
        expect(nextAction(other, multg)).toMatchObject({
            kind: "detail",
            isMine: false,
        });
    });

    it("lets a reviewer without a region review anything", () => {
        const admin = { ...multg, wilayah: null };
        expect(
            nextAction(anomali({ ultg: "ULTG Purwakarta" }), admin).kind,
        ).toBe("review");
    });

    it("offers Jadwalkan then Tutup to the assigned field", () => {
        const assigned = anomali({ status: "Open", bidang_assigned: "Harjar" });
        const scheduled = {
            ...assigned,
            tanggal_mulai: "2026-11-20",
            tanggal_selesai: "2026-11-22",
        };

        expect(nextAction(assigned, harjar)).toMatchObject({
            kind: "schedule",
            routeName: "dashboard.anomali.schedule",
            isMine: true,
        });
        expect(nextAction(scheduled, harjar)).toMatchObject({
            kind: "close",
            routeName: "dashboard.anomali.close",
            isMine: true,
        });
    });

    it("offers Tutup instead of Jadwalkan when the field lacks Kelola Anomali", () => {
        const assigned = anomali({ status: "Open", bidang_assigned: "Harjar" });
        expect(nextAction(assigned, harjarNoManage)).toMatchObject({
            kind: "close",
            isMine: true,
        });
        expect(secondaryActions(assigned, harjarNoManage)).toEqual([]);
    });

    it("matches the assigned field case-insensitively and lets Renev act across regions", () => {
        const a = anomali({
            status: "Open",
            bidang_assigned: "renev",
            ultg: "ULTG Purwakarta",
        });
        expect(nextAction(a, renev).kind).toBe("schedule");
    });

    it("does not offer field work to other fields or plain viewers", () => {
        const a = anomali({ status: "Open", bidang_assigned: "Hargi" });
        expect(nextAction(a, harjar).kind).toBe("detail");
        expect(nextAction(a, viewer).kind).toBe("detail");
    });

    it("only offers Detail for finished anomalies", () => {
        const closed = anomali({ status: "Close", bidang_assigned: "Harjar" });
        const rejected = anomali({ status: "Rejected" });
        expect(nextAction(closed, harjar).kind).toBe("detail");
        expect(nextAction(rejected, multg).kind).toBe("detail");
    });

    it("tolerates a missing user", () => {
        expect(nextAction(anomali(), null).kind).toBe("detail");
    });
});

describe("secondaryActions", () => {
    const assigned = anomali({ status: "Open", bidang_assigned: "Harjar" });
    const scheduled = {
        ...assigned,
        tanggal_mulai: "2026-11-20",
        tanggal_selesai: "2026-11-22",
    };

    it("lets the assigned field close work that was never scheduled", () => {
        expect(secondaryActions(assigned, harjar)).toEqual([
            expect.objectContaining({
                kind: "close",
                routeName: "dashboard.anomali.close",
            }),
        ]);
    });

    it("lets the assigned field reschedule scheduled work", () => {
        expect(secondaryActions(scheduled, harjar)).toEqual([
            expect.objectContaining({
                kind: "schedule",
                label: "Ubah jadwal",
                routeName: "dashboard.anomali.schedule",
            }),
        ]);
    });

    it("offers nothing extra to other users or finished work", () => {
        expect(secondaryActions(assigned, viewer)).toEqual([]);
        expect(secondaryActions(anomali(), multg)).toEqual([]);
        expect(
            secondaryActions(
                anomali({ status: "Close", bidang_assigned: "Harjar" }),
                harjar,
            ),
        ).toEqual([]);
    });
});

describe("buildMyQueue", () => {
    it("keeps only actionable items, overdue first then longest waiting", () => {
        const fresh = anomali({
            id: 1,
            status: "Open",
            bidang_assigned: "Harjar",
            tanggal_approve: "2026-11-17T08:00:00",
        });
        const stale = anomali({
            id: 2,
            status: "Open",
            bidang_assigned: "Harjar",
            tanggal_approve: "2026-11-01T08:00:00",
        });
        const late = anomali({
            id: 3,
            status: "Open",
            bidang_assigned: "Harjar",
            tanggal_mulai: "2026-11-15",
            tanggal_selesai: "2026-11-16",
        });
        const notMine = anomali({
            id: 4,
            status: "Open",
            bidang_assigned: "Hargi",
        });

        const queue = buildMyQueue([fresh, notMine, stale, late], harjar, TODAY);

        expect(queue.map((a) => a.id)).toEqual([3, 2, 1]);
        expect(isInMyQueue(notMine, harjar)).toBe(false);
    });
});

describe("countByStage", () => {
    it("counts every stage and the overdue subset", () => {
        const counts = countByStage(
            [
                anomali({ status: "New" }),
                anomali({ status: "Open" }),
                anomali({
                    status: "Open",
                    tanggal_mulai: "2026-11-01",
                    tanggal_selesai: "2026-11-02",
                }),
                anomali({ status: "Close" }),
                anomali({ status: "Rejected" }),
            ],
            TODAY,
        );

        expect(counts).toEqual({
            review: 1,
            assigned: 1,
            scheduled: 1,
            closed: 1,
            rejected: 1,
            overdue: 1,
        });
    });
});
