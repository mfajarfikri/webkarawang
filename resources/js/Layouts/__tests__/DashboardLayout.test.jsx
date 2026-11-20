import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import DashboardLayout from "../DashboardLayout";

const pageState = { url: "/dashboard", permissions: ["Dashboard Berita"] };

vi.mock("@inertiajs/react", () => ({
    Head: () => null,
    Link: ({ children, href, ...props }) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
    router: { post: vi.fn() },
    usePage: () => ({
        url: pageState.url,
        props: {
            auth: {
                user: {
                    name: "Pengguna Uji",
                    email: "uji@example.test",
                    role: "Admin",
                    wilayah: "UPT Karawang",
                    foto_profil: null,
                    permissions: pageState.permissions,
                },
            },
        },
    }),
}));

vi.mock("notistack", () => ({
    useSnackbar: () => ({ enqueueSnackbar: vi.fn() }),
}));

function renderLayout() {
    return render(
        <DashboardLayout title="Judul Halaman">
            <p>Isi halaman</p>
        </DashboardLayout>,
    );
}

function currentLinks() {
    return screen
        .getAllByRole("link")
        .filter((link) => link.getAttribute("aria-current") === "page");
}

describe("DashboardLayout", () => {
    beforeEach(() => {
        global.route = (name) => `/${name}`;
        localStorage.clear();
        pageState.url = "/dashboard";
    });

    it("renders the page title, children and user identity", () => {
        renderLayout();

        expect(screen.getByText("Judul Halaman")).toBeInTheDocument();
        expect(screen.getByText("Isi halaman")).toBeInTheDocument();
        expect(screen.getByText("Pengguna Uji")).toBeInTheDocument();
    });

    it("marks only the dashboard root link as current on /dashboard", () => {
        renderLayout();

        const current = currentLinks();

        expect(current.length).toBeGreaterThan(0);
        current.forEach((link) =>
            expect(link).toHaveTextContent("Dashboard"),
        );
    });

    it("marks a nested section as current instead of the dashboard root", () => {
        pageState.url = "/dashboard/berita/create?page=2";
        renderLayout();

        const current = currentLinks();

        expect(current.length).toBeGreaterThan(0);
        current.forEach((link) => expect(link).toHaveTextContent("Berita"));
    });

    it("hides menus the user has no permission for", () => {
        renderLayout();

        // Sidebar dirender untuk desktop dan mobile, jadi pakai *AllBy*.
        expect(screen.getAllByRole("link", { name: "Berita" }).length).toBeGreaterThan(0);
        expect(screen.getAllByRole("link", { name: "Pengaturan" }).length).toBeGreaterThan(0);
        expect(screen.queryAllByRole("link", { name: "User" })).toHaveLength(0);
        expect(screen.queryAllByRole("link", { name: "Role" })).toHaveLength(0);
        expect(screen.queryAllByText("Data")).toHaveLength(0);
    });

    it("persists the collapsed sidebar preference", () => {
        renderLayout();

        fireEvent.click(screen.getByLabelText("Ciutkan sidebar"));

        expect(localStorage.getItem("collapsedSidebar")).toBe("true");
        expect(screen.getByLabelText("Perluas sidebar")).toBeInTheDocument();
    });

    it("opens the logout confirmation from the user menu", () => {
        renderLayout();

        fireEvent.click(screen.getByText("Keluar"));

        expect(screen.getByText("Keluar dari akun?")).toBeInTheDocument();
    });
});
