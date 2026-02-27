import React from "react";

export function classNames(...v) {
    return v.filter(Boolean).join(" ");
}

export function Section({
    id,
    eyebrow,
    title,
    subtitle,
    action,
    allowOverflow = false,
    children,
}) {
    return (
        <section id={id} className="scroll-mt-28">
            <div
                className={classNames(
                    "rounded-2xl border border-slate-200 bg-white shadow-sm",
                    allowOverflow ? "overflow-visible" : "overflow-hidden",
                )}
            >
                <div className="p-6 sm:p-8 border-b border-slate-100">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            {eyebrow ? (
                                <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                                    {eyebrow}
                                </div>
                            ) : null}
                            <h2 className="mt-1 text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                                {title}
                            </h2>
                            {subtitle ? (
                                <p className="mt-2 text-sm text-slate-600 max-w-3xl">
                                    {subtitle}
                                </p>
                            ) : null}
                        </div>
                        {action ? (
                            <div className="shrink-0">{action}</div>
                        ) : null}
                    </div>
                </div>
                <div className="p-6 sm:p-8">{children}</div>
            </div>
        </section>
    );
}

export function IconBadge({ icon: Icon, tone = "sky" }) {
    const toneCls =
        tone === "amber"
            ? "bg-amber-50 text-amber-700 border-amber-100"
            : tone === "emerald"
              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
              : tone === "violet"
                ? "bg-violet-50 text-violet-700 border-violet-100"
                : "bg-sky-50 text-sky-700 border-sky-100";

    return (
        <div
            className={classNames(
                "h-10 w-10 rounded-2xl border flex items-center justify-center shadow-sm",
                toneCls,
            )}
        >
            <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
    );
}

export function TextLink({ href, children }) {
    return (
        <a
            href={href}
            className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700 hover:text-sky-900 transition-colors"
        >
            {children}
        </a>
    );
}

export function ButtonLink({ as: As = "a", className, ...props }) {
    return (
        <As
            className={classNames(
                "inline-flex items-center justify-center rounded-2xl bg-sky-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30",
                className,
            )}
            {...props}
        />
    );
}
