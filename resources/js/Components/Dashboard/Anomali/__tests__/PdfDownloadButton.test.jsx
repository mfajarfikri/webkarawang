import { render, screen } from "@testing-library/react";
import React from "react";
import PdfDownloadButton, {
    getFilenameFromContentDisposition,
} from "../PdfDownloadButton";

vi.mock("axios", () => {
    return {
        default: {
            get: vi.fn(),
        },
    };
});

vi.mock("notistack", () => {
    return {
        useSnackbar: () => ({ enqueueSnackbar: vi.fn() }),
    };
});

describe("PdfDownloadButton", () => {
    it("parsing filename dari Content-Disposition", () => {
        expect(
            getFilenameFromContentDisposition(
                'attachment; filename="anomali_test.pdf"',
            ),
        ).toBe("anomali_test.pdf");

        expect(
            getFilenameFromContentDisposition(
                "attachment; filename*=UTF-8''anomali%20test.pdf",
            ),
        ).toBe("anomali test.pdf");
    });

    it("render tombol download", () => {
        render(<PdfDownloadButton url="/x" />);
        expect(screen.getByRole("button")).toHaveTextContent("Download PDF");
    });
});

