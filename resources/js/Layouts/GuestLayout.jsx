import ApplicationLogo from "@/Components/ApplicationLogo";
import { Link } from "@inertiajs/react";

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-grid-ink px-4 py-10">
            <Link
                href="/"
                className="flex items-center gap-3 rounded-full focus:outline-none"
            >
                <span className="rounded-xl bg-white p-1.5">
                    <ApplicationLogo className="h-8 w-8" />
                </span>
                <span className="font-display text-lg font-bold tracking-tight text-white">
                    PLN UPT Karawang
                </span>
            </Link>

            <div className="mt-8 w-full overflow-hidden rounded-2xl border border-white/10 bg-white px-6 py-6 shadow-lift sm:max-w-md sm:px-8 sm:py-8">
                {children}
            </div>

            <p className="mt-6 text-xs text-slate-400">
                © {new Date().getFullYear()} PLN UPT Karawang
            </p>
        </div>
    );
}
