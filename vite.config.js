import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [
        laravel({
            input: "resources/js/app.jsx",
            refresh: true,
        }),
        react(),
    ],
    optimizeDeps: {
        include: [
            "@tiptap/react",
            "@tiptap/starter-kit",
            "@tiptap/extension-image",
            "@tiptap/extension-link",
            "@tiptap/extension-table",
            "@tiptap/extension-table-header",
            "@tiptap/extension-table-row",
        ],
        exclude: [],
    },
    server: {
        hmr: {
            overlay: false,
        },
    },
});
