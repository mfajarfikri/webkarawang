/**
 * Kompresi foto lampiran di browser sampai di bawah batas ukuran.
 *
 * Dibuat sendiri (bukan Compressor.js) karena Compressor.js diam-diam
 * mengembalikan file asli bila canvas gagal membuat gambar baru; untuk foto
 * kamera berukuran besar itu membuat "hasil kompresi" tetap 10 MB+.
 * Di sini setiap kegagalan dilempar sebagai Error dengan pesan yang jelas.
 */

export const DEFAULT_MAX_BYTES = 2 * 1024 * 1024;

/** Sisi terpanjang yang dicoba berurutan sampai ukuran file cukup kecil. */
export const DIMENSION_STEPS = [1920, 1600, 1280, 1024];

const QUALITY_STEPS = [0.85, 0.75, 0.65];

/** Ukuran baru dengan sisi terpanjang <= maxDimension; tidak pernah memperbesar. */
export function fitWithin(width, height, maxDimension) {
    const longest = Math.max(width, height);
    if (!longest || longest <= maxDimension) return { width, height };
    const scale = maxDimension / longest;
    return {
        width: Math.max(1, Math.round(width * scale)),
        height: Math.max(1, Math.round(height * scale)),
    };
}

/** Nama file dengan ekstensi .jpg (hasil kompresi selalu JPEG). */
export function jpegName(name) {
    const base =
        name && name.includes(".")
            ? name.slice(0, name.lastIndexOf("."))
            : name || "foto";
    return `${base}.jpg`;
}

function loadWithImageElement(file) {
    const url = URL.createObjectURL(file);
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () =>
            resolve({
                source: image,
                width: image.naturalWidth,
                height: image.naturalHeight,
                release: () => URL.revokeObjectURL(url),
            });
        image.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Foto tidak bisa dibaca oleh browser."));
        };
        image.src = url;
    });
}

/** Baca foto; createImageBitmap juga menerapkan orientasi EXIF. */
async function decodeImage(file) {
    if (typeof createImageBitmap === "function") {
        try {
            const bitmap = await createImageBitmap(file, {
                imageOrientation: "from-image",
            });
            return {
                source: bitmap,
                width: bitmap.width,
                height: bitmap.height,
                release: () => bitmap.close?.(),
            };
        } catch {
            // Lanjut ke cara lama untuk browser/format yang tidak didukung.
        }
    }
    return loadWithImageElement(file);
}

function canvasToBlob(canvas, quality) {
    return new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", quality),
    );
}

function drawScaled(decoded, size) {
    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Browser tidak mendukung kompresi foto.");
    // Latar putih supaya PNG transparan tidak menjadi hitam di JPEG.
    context.fillStyle = "#fff";
    context.fillRect(0, 0, size.width, size.height);
    context.drawImage(decoded.source, 0, 0, size.width, size.height);
    return canvas;
}

/**
 * Kembalikan file <= maxBytes. File yang sudah cukup kecil dikembalikan apa
 * adanya; selain itu diperkecil dan dikompres ke JPEG. Melempar Error bila
 * tidak berhasil, tidak pernah diam-diam mengembalikan file asli yang besar.
 */
export async function compressImageToMaxBytes(
    file,
    { maxBytes = DEFAULT_MAX_BYTES } = {},
) {
    if (file.size <= maxBytes) return file;

    const decoded = await decodeImage(file);
    try {
        if (!decoded.width || !decoded.height) {
            throw new Error("Ukuran foto tidak terbaca.");
        }
        for (const dimension of DIMENSION_STEPS) {
            const canvas = drawScaled(
                decoded,
                fitWithin(decoded.width, decoded.height, dimension),
            );
            for (const quality of QUALITY_STEPS) {
                const blob = await canvasToBlob(canvas, quality);
                if (!blob) {
                    throw new Error(
                        "Browser gagal membuat foto terkompresi. Coba foto lain atau perkecil dulu.",
                    );
                }
                if (blob.size <= maxBytes) {
                    return new File([blob], jpegName(file.name), {
                        type: "image/jpeg",
                        lastModified: Date.now(),
                    });
                }
            }
        }
        throw new Error("Foto tetap lebih dari 2 MB setelah dikompres.");
    } finally {
        decoded.release();
    }
}
