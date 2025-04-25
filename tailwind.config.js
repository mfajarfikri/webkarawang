import defaultTheme from "tailwindcss/defaultTheme";
import forms from "@tailwindcss/forms";

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
            fontFamily: {
                sans: ["Figtree", ...defaultTheme.fontFamily.sans],
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
            },
        },
    },

    plugins: [forms],
};
