import ApplicationLogo from "@/Components/ApplicationLogo";

/** Logo + wordmark. `tone="dark"` untuk dipakai di atas permukaan gelap. */
export default function BrandMark({ tone = "light", compact = false }) {
    const isDark = tone === "dark";
    return (
        <span className="flex items-center gap-2.5">
            <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    isDark ? "bg-white" : "bg-white ring-1 ring-slate-200"
                }`}
            >
                <ApplicationLogo className="h-7 w-7" />
            </span>
            {!compact && (
                <span className="leading-none">
                    <span
                        className={`block font-display text-[15px] font-extrabold tracking-tight ${
                            isDark ? "text-white" : "text-ink-900"
                        }`}
                    >
                        PLN UPT Karawang
                    </span>
                    <span
                        className={`mt-1 block text-[10px] font-semibold uppercase tracking-[0.18em] ${
                            isDark ? "text-brand-300" : "text-slate-500"
                        }`}
                    >
                        Unit Pelaksana Transmisi
                    </span>
                </span>
            )}
        </span>
    );
}
