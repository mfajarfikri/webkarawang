export default function PrimaryButton({
    className = "",
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center rounded-lg bg-gradient-to-r from-blue-600 to-blue-400 text-white font-semibold shadow hover:from-blue-700 hover:to-blue-500 disabled:opacity-50 px-6 py-2 text-base transition ${
                    disabled ? "opacity-50 cursor-not-allowed" : ""
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
