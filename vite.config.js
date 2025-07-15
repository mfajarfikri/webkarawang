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
            "react",
            "react-dom",
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
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    react: ['react', 'react-dom'],
                    inertia: ['@inertiajs/react'],
                },
            },
        },
    },
    server: {
        hmr: {
            overlay: false,
        },
    },
});
