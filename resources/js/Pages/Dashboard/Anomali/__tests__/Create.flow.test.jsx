import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import Create from "../Create";

const pageState = { user: { tanda_tangan_path: "ttd/admin.png" } };

vi.mock("@inertiajs/react", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        Head: () => null,
        Link: ({ children, href, ...props }) => (
            <a href={href} {...props}>
                {children}
            </a>
        ),
        router: { get: vi.fn() },
        usePage: () => ({ props: { auth: { user: pageState.user } } }),
    };
});

vi.mock("@/Layouts/DashboardLayout", () => ({
    default: ({ children }) => <div data-testid="layout">{children}</div>,
}));

vi.mock("notistack", () => ({
    useSnackbar: () => ({ enqueueSnackbar: vi.fn() }),
}));

function renderCreate() {
    return render(
        <Create
            gardus={[{ id: 1, name: "GI 150KV Cikampek", ultg: "ULTG Karawang" }]}
            kategoris={[{ id: 1, name: "Kebocoran" }]}
            users={{ id: 1 }}
            userWilayah="ULTG Karawang"
        />,
    );
}

describe("Create anomaly report flow", () => {
    beforeEach(() => {
        global.route = (name) => `/${name}`;
        window.HTMLElement.prototype.scrollIntoView = vi.fn();
        pageState.user = { tanda_tangan_path: "ttd/admin.png" };
    });

    it("blocks moving on while required fields of the step are empty", () => {
        renderCreate();

        fireEvent.click(
            screen.getByRole("button", { name: /Lanjut ke Detail peralatan/ }),
        );

        expect(screen.getByRole("alert")).toHaveTextContent(
            /Lengkapi \d+ isian wajib sebelum lanjut/,
        );
        expect(screen.getByText("Judul wajib diisi.")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /Lanjut ke Detail peralatan/ }),
        ).toBeInTheDocument();
    });

    it("disables going back on the first step", () => {
        renderCreate();

        expect(
            screen.getByRole("button", { name: /Sebelumnya/ }),
        ).toBeDisabled();
    });

    it("warns up front when the reporter has no signature", () => {
        pageState.user = { tanda_tangan_path: null };
        renderCreate();

        expect(
            screen.getByText("Tanda tangan Anda belum diunggah"),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: "Unggah tanda tangan" }),
        ).toHaveAttribute("href", "/dashboard.profile.edit");
    });

    it("does not show the signature warning when a signature exists", () => {
        renderCreate();

        expect(
            screen.queryByText("Tanda tangan Anda belum diunggah"),
        ).not.toBeInTheDocument();
    });
});
