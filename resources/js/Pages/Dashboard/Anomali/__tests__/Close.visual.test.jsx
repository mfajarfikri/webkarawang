import { render } from "@testing-library/react";
import React from "react";
import Close from "../Close";

vi.mock("@inertiajs/react", async () => {
    return {
        Head: () => null,
        Link: ({ children, ...props }) => <a {...props}>{children}</a>,
        router: { get: vi.fn() },
    };
});

vi.mock("@/Layouts/DashboardLayout", () => {
    return {
        default: ({ children }) => <div data-testid="layout">{children}</div>,
    };
});

vi.mock("@/Components/Dashboard/Anomali/PdfPreviewer", () => {
    return {
        default: () => <div data-testid="pdf-previewer" />,
    };
});

describe("Close (visual)", () => {
    it("snapshot layout", () => {
        global.route = () => "/";
        const { container } = render(
            <Close
                anomalis={{
                    slug: "test",
                    status: "Open",
                    judul: "Judul",
                    gardu_induk: { name: "GI A" },
                }}
            />,
        );
        expect(container).toMatchSnapshot();
    });
});

