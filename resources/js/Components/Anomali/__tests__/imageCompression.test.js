import {
    DIMENSION_STEPS,
    fitWithin,
    jpegName,
} from "../imageCompression";

describe("fitWithin", () => {
    it("scales the longest side down to the limit, keeping aspect ratio", () => {
        expect(fitWithin(6000, 4000, 1920)).toEqual({
            width: 1920,
            height: 1280,
        });
        expect(fitWithin(4000, 6000, 1920)).toEqual({
            width: 1280,
            height: 1920,
        });
    });

    it("never upscales small images", () => {
        expect(fitWithin(800, 600, 1920)).toEqual({ width: 800, height: 600 });
    });

    it("keeps at least one pixel on very thin images", () => {
        expect(fitWithin(10000, 2, 1000)).toEqual({ width: 1000, height: 1 });
    });
});

describe("DIMENSION_STEPS", () => {
    it("starts at 1920px and only gets smaller", () => {
        expect(DIMENSION_STEPS[0]).toBe(1920);
        const sorted = [...DIMENSION_STEPS].sort((a, b) => b - a);
        expect(DIMENSION_STEPS).toEqual(sorted);
    });
});

describe("jpegName", () => {
    it("swaps any extension for .jpg", () => {
        expect(jpegName("DSC_5918.JPG")).toBe("DSC_5918.jpg");
        expect(jpegName("scan.final.png")).toBe("scan.final.jpg");
    });

    it("adds .jpg when there is no extension", () => {
        expect(jpegName("foto")).toBe("foto.jpg");
        expect(jpegName("")).toBe("foto.jpg");
    });
});
