import { PERMISSIONS, hasPermission } from "../permissions";
import { visibleNavGroups } from "@/Layouts/DashboardLayout";

const staff = { permissions: ["View Anomali", "Dashboard Berita", "View Ktt"] };
const admin = { permissions: Object.values(PERMISSIONS) };

describe("hasPermission", () => {
    it("allows items that need no permission", () => {
        expect(hasPermission(staff, undefined)).toBe(true);
        expect(hasPermission(null, [])).toBe(true);
    });

    it("checks a single permission", () => {
        expect(hasPermission(staff, PERMISSIONS.ANOMALI_VIEW)).toBe(true);
        expect(hasPermission(staff, PERMISSIONS.USER_VIEW)).toBe(false);
    });

    it("requires every permission in a list", () => {
        expect(
            hasPermission(admin, [
                PERMISSIONS.ANOMALI_CREATE_FORM,
                PERMISSIONS.ANOMALI_CREATE,
            ]),
        ).toBe(true);
        expect(
            hasPermission({ permissions: ["View Anomali Create"] }, [
                PERMISSIONS.ANOMALI_CREATE_FORM,
                PERMISSIONS.ANOMALI_CREATE,
            ]),
        ).toBe(false);
    });

    it("denies everything gated for a missing user", () => {
        expect(hasPermission(null, PERMISSIONS.BERITA_VIEW)).toBe(false);
        expect(hasPermission({}, PERMISSIONS.BERITA_VIEW)).toBe(false);
    });
});

describe("visibleNavGroups", () => {
    const groups = [
        { items: [{ label: "Dashboard" }] },
        {
            title: "Konten",
            items: [
                { label: "Berita", permission: PERMISSIONS.BERITA_VIEW },
                { label: "Anomali", permission: PERMISSIONS.ANOMALI_VIEW },
            ],
        },
        {
            title: "Data",
            items: [{ label: "User", permission: PERMISSIONS.USER_VIEW }],
        },
        {
            title: "Sistem",
            items: [
                { label: "Role", permission: PERMISSIONS.ROLE_VIEW },
                { label: "Pengaturan" },
            ],
        },
    ];
    const labels = (gs) => gs.flatMap((g) => g.items.map((i) => i.label));

    it("hides User and Role from a regular user", () => {
        const result = visibleNavGroups(groups, staff);
        expect(labels(result)).toEqual([
            "Dashboard",
            "Berita",
            "Anomali",
            "Pengaturan",
        ]);
    });

    it("drops groups left without items", () => {
        const result = visibleNavGroups(groups, staff);
        expect(result.map((g) => g.title)).not.toContain("Data");
    });

    it("shows everything to an admin", () => {
        expect(labels(visibleNavGroups(groups, admin))).toEqual([
            "Dashboard",
            "Berita",
            "Anomali",
            "User",
            "Role",
            "Pengaturan",
        ]);
    });
});
