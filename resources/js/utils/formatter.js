/**
 * Format angka menjadi format Rupiah
 * @param {number|string} angka - Angka yang akan diformat
 * @returns {string} - String dalam format Rupiah
 */
export const formatRupiah = (angka) => {
    if (angka === null || angka === undefined || angka === "") return "-";
    
    // Pastikan angka adalah number
    const number = typeof angka === "string" ? parseFloat(angka.replace(/[^\d]/g, "")) : angka;
    
    // Jika bukan number yang valid, kembalikan tanda strip
    if (isNaN(number)) return "-";
    
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(number);
};