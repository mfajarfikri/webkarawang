import React from "react";

export function classNames(...v) {
    return v.filter(Boolean).join(" ");
}

function SectionHeading({ eyebrow, title, subtitle, action, isPlain }) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
                {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
                <h2
                    className={classNames(
                        "mt-3 font-extrabold text-ink-900",
                        isPlain ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl",
                    )}
                >
                    {title}
                </h2>
                {subtitle ? (
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                        {subtitle}
                    </p>
                ) : null}
            </div>
            {action ? <div className="shrink-0">{action}</div> : null}
        </div>
    );
}

/**
 * Blok konten bersama halaman publik.
 * variant "card" (default) membungkus isi dalam kartu; "plain" tanpa bingkai.
 */
export function Section({
    id,
    eyebrow,
    title,
    subtitle,
    action,
    allowOverflow = false,
    variant = "card",
    children,
}) {
    const isPlain = variant === "plain";
    const heading = (
        <SectionHeading
            eyebrow={eyebrow}
            title={title}
            subtitle={subtitle}
            action={action}
            isPlain={isPlain}
        />
    );

    if (isPlain) {
        return (
            <section id={id} className="scroll-mt-28">
                {heading}
                <div className="mt-8">{children}</div>
            </section>
        );
    }

    return (
        <section id={id} className="scroll-mt-28">
            <div
                className={classNames(
                    "surface",
                    allowOverflow ? "overflow-visible" : "overflow-hidden",
                )}
            >
                <div className="border-b border-slate-100 p-6 sm:p-8">
                    {heading}
                </div>
                <div className="p-6 sm:p-8">{children}</div>
            </div>
        </section>
    );
}

const ICON_TONES = {
    sky: "bg-brand-50 text-brand-700 ring-brand-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    violet: "bg-violet-50 text-violet-700 ring-violet-100",
};

export function IconBadge({ icon: Icon, tone = "sky" }) {
    return (
        <div
            className={classNames(
                "flex h-11 w-11 items-center justify-center rounded-xl ring-1 ring-inset",
                ICON_TONES[tone] || ICON_TONES.sky,
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
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 underline-offset-4 transition-colors hover:text-brand-900 hover:underline"
        >
            {children}
        </a>
    );
}

export function ButtonLink({ as: As = "a", className, ...props }) {
    return (
        <As
            className={classNames(
                "inline-flex items-center justify-center rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition duration-200 hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 active:scale-[0.98]",
                className,
            )}
            {...props}
        />
    );
}
