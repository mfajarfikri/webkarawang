import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import PdfPreviewer from "../PdfPreviewer";

vi.mock("@react-pdf-viewer/core", () => {
    return {
        Worker: ({ children }) => <div data-testid="worker">{children}</div>,
        Viewer: () => <div data-testid="viewer" />,
    };
});

vi.mock("@react-pdf-viewer/default-layout", () => {
    return {
        defaultLayoutPlugin: () => ({}),
    };
});

describe("PdfPreviewer", () => {
    it("menampilkan tab file dan mengganti active index", () => {
        const files = [
            new File(["a"], "a.pdf", { type: "application/pdf" }),
            new File(["b"], "b.pdf", { type: "application/pdf" }),
        ];
        const onActiveIndexChange = vi.fn();
        render(
            <PdfPreviewer
                files={files}
                activeIndex={0}
                onActiveIndexChange={onActiveIndexChange}
            />,
        );

        expect(screen.getByText("a.pdf")).toBeInTheDocument();
        expect(screen.getByText("b.pdf")).toBeInTheDocument();

        fireEvent.click(screen.getByText("b.pdf"));
        expect(onActiveIndexChange).toHaveBeenCalledWith(1);
    });
});

