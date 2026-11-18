import defaultTheme from "tailwindcss/defaultTheme";
import forms from "@tailwindcss/forms";
import colors from "tailwindcss/colors";

// Palet brand tunggal: biru-elektrik PLN. `sky`, `cyan`, dan `blue` di-alias
// ke palet ini supaya seluruh halaman lama otomatis konsisten satu warna.
const brand = {
    50: "#f0f9ff",
    100: "#e0f2fe",
    200: "#b9e6fe",
    300: "#7cd4fd",
    400: "#36bffa",
    500: "#0ba5ec",
    600: "#0086c9",
    700: "#026aa2",
    800: "#065986",
    900: "#0b4a6f",
    950: "#062c41",
};

// Netral gelap untuk permukaan "ink" (hero, sidebar, footer).
const ink = {
    700: "#1c2740",
    800: "#131c31",
    900: "#0c1424",
    950: "#070d19",
};

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php",
        "./storage/framework/views/*.php",
        "./resources/views/**/*.blade.php",
        "./resources/js/**/*.jsx",
    ],

    theme: {
        extend: {
            colors: {
                brand,
                ink,
                sky: brand,
                cyan: brand,
                blue: brand,
                gray: colors.slate,
                volt: "#ffd60a",
            },
            boxShadow: {
                soft: "0 1px 2px rgba(12,20,36,0.04), 0 8px 24px -12px rgba(12,20,36,0.12)",
                lift: "0 2px 4px rgba(12,20,36,0.04), 0 24px 48px -20px rgba(12,20,36,0.22)",
                glow: "0 0 0 1px rgba(11,165,236,0.25), 0 12px 32px -12px rgba(11,165,236,0.45)",
            },
            fontFamily: {
                sans: ["Inter", ...defaultTheme.fontFamily.sans],
                display: [
                    '"Plus Jakarta Sans"',
                    "Inter",
                    ...defaultTheme.fontFamily.sans,
                ],
                inter: ["Inter", ...defaultTheme.fontFamily.sans],
                merriweather: ["Merriweather", ...defaultTheme.fontFamily.sans],
                lato: ["Lato", ...defaultTheme.fontFamily.sans],
                montserrat: ["Montserrat", ...defaultTheme.fontFamily.sans],
            },
            keyframes: {
                slideDownAndFade: {
                    from: { opacity: "0", transform: "translateY(-2px)" },
                    to: { opacity: "1", transform: "translateY(0)" },
                },
                slideLeftAndFade: {
                    from: { opacity: "0", transform: "translateX(2px)" },
                    to: { opacity: "1", transform: "translateX(0)" },
                },
                slideUpAndFade: {
                    from: { opacity: "0", transform: "translateY(2px)" },
                    to: { opacity: "1", transform: "translateY(0)" },
                },
                slideRightAndFade: {
                    from: { opacity: "0", transform: "translateX(-2px)" },
                    to: { opacity: "1", transform: "translateX(0)" },
                },
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideIn: {
                    "0%": { transform: "translateY(20px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
                fadeInUp: {
                    "0%": { transform: "translateY(10px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
                "bounce-slow": {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-5px)" },
                },
            },
            animation: {
                slideDownAndFade:
                    "slideDownAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)",
                slideLeftAndFade:
                    "slideLeftAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)",
                slideUpAndFade:
                    "slideUpAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)",
                slideRightAndFade:
                    "slideRightAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)",
                fadeIn: "fadeIn 0.5s ease-out",
                slideIn: "slideIn 0.5s ease-out",
                fadeInUp: "fadeInUp 0.5s ease-out",
                "bounce-slow": "bounce-slow 2s infinite",
            },
            typography: {
                DEFAULT: {
                    css: {
                        p: {
                            marginBottom: "1rem",
                        },
                        "p:last-child": {
                            marginBottom: "0",
                        },
                        br: {
                            display: "block",
                            content: '""',
                            marginTop: "0.5rem",
                        },
                    },
                },
            },
        },
    },

    plugins: [forms],
};
