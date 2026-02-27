import { useEffect, useMemo, useRef, useState } from "react";
import { Head, Link, useForm, router } from "@inertiajs/react";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import ApplicationLogo from "@/Components/ApplicationLogo";
import { FcGoogle } from "react-icons/fc";
import axios from "axios";
import { useSnackbar } from "notistack";

export default function Login({ status, canResetPassword }) {
    const { enqueueSnackbar } = useSnackbar();
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, setError, clearErrors, processing, errors } =
        useForm({
            email: "",
            password: "",
            remember: false,
        });
    const [loginError, setLoginError] = useState("");
    const [loading, setLoading] = useState(false);

    const emailRef = useRef(null);
    const passwordRef = useRef(null);

    const emailErrorId = useMemo(() => "login-email-error", []);
    const passwordErrorId = useMemo(() => "login-password-error", []);
    const formErrorId = useMemo(() => "login-form-error", []);

    useEffect(() => {
        if (!status) return;
        enqueueSnackbar(status, { variant: "info" });
    }, [status, enqueueSnackbar]);

    const focusFirstError = (nextErrors) => {
        if (nextErrors?.email) {
            emailRef.current?.focus();
            return;
        }
        if (nextErrors?.password) {
            passwordRef.current?.focus();
        }
    };

    // Perubahan signifikan: gunakan token class (Tailwind) agar konsisten & mudah dirawat.
    const labelCls =
        "block text-xs font-semibold uppercase tracking-wider text-slate-600";
    const inputBaseCls =
        "block w-full rounded-xl border bg-white px-10 py-3 text-[15px] text-slate-900 shadow-sm placeholder:text-slate-400 transition focus:outline-none focus-visible:ring-2";
    const inputNormalCls =
        "border-slate-200 hover:border-slate-300 focus:border-sky-500 focus-visible:ring-sky-500/20";
    const inputErrorCls =
        "border-rose-300 hover:border-rose-300 focus:border-rose-500 focus-visible:ring-rose-500/20";
    const iconCls = "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400";
    const iconErrorCls = "text-rose-500";

    const submit = async (e) => {
        e.preventDefault();
        setLoginError("");
        clearErrors();
        setLoading(true);
        try {
            // Ambil CSRF cookie
            await axios.get("/sanctum/csrf-cookie", {
                withCredentials: true,
            });

            // Lakukan login dengan axios
            const response = await axios({
                method: "post",
                url: "/login",
                data: {
                    email: data.email,
                    password: data.password,
                    remember: data.remember,
                },
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                withCredentials: true,
            });

            enqueueSnackbar(
                "Berhasil masuk. Selamat datang di Dashboard PLN UPT Karawang.",
                {
                    variant: "success",
                },
            );
            // Redirect to dashboard or wherever
            router.visit(route("dashboard.index"));
        } catch (error) {
            if (error.response && error.response.status === 422) {
                // Validation error
                const rawErrors = error.response.data?.errors || {};
                const nextErrors = {
                    email: Array.isArray(rawErrors.email)
                        ? rawErrors.email[0]
                        : rawErrors.email,
                    password: Array.isArray(rawErrors.password)
                        ? rawErrors.password[0]
                        : rawErrors.password,
                };
                const message =
                    error.response.data?.message ||
                    "Email atau password salah.";
                setError(nextErrors);
                setLoginError(message);
                focusFirstError(nextErrors);
                enqueueSnackbar(message, {
                    variant: "error",
                });
                setLoginError(
                    "Terjadi kesalahan saat login. Silakan coba lagi.",
                );
                enqueueSnackbar(
                    "Terjadi kesalahan saat login. Silakan coba lagi.",
                    {
                        variant: "error",
                    },
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Head title="Login" />
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
                {/* Perubahan signifikan: layout 2-kolom (brand panel + card) agar konsisten dengan halaman dashboard/home */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    <div className="lg:col-span-7">
                        <div className="motion-safe:animate-fadeInUp">
                            <Link
                                href={route("home")}
                                className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/70 backdrop-blur px-4 py-3 shadow-sm hover:bg-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30"
                            >
                                <span className="bg-white rounded-2xl p-2 shadow-sm border border-slate-100">
                                    <ApplicationLogo className="w-10 h-10" />
                                </span>
                                <span className="min-w-0">
                                    <span className="block text-xs font-semibold uppercase tracking-widest text-slate-500">
                                        PLN UPT Karawang
                                    </span>
                                    <span className="block text-sm font-bold text-slate-900">
                                        Dashboard Operasional
                                    </span>
                                </span>
                            </Link>

                            <h1 className="mt-8 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                                Masuk untuk melanjutkan
                            </h1>
                            <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-xl">
                                Gunakan kredensial akun Anda untuk mengakses
                                fitur dashboard dan laporan.
                            </p>

                            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                                        Keamanan
                                    </div>
                                    <div className="mt-2 text-sm font-bold text-slate-900">
                                        Autentikasi terproteksi
                                    </div>
                                    <div className="mt-1 text-sm text-slate-600">
                                        Session aman dan akses terkontrol.
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                                        Produktivitas
                                    </div>
                                    <div className="mt-2 text-sm font-bold text-slate-900">
                                        UI konsisten & cepat
                                    </div>
                                    <div className="mt-1 text-sm text-slate-600">
                                        Fokus pada pekerjaan, bukan navigasi.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-5">
                        <div className="motion-safe:animate-fadeInUp rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                            <div className="p-6 sm:p-8 border-b border-slate-100">
                                <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                                    Autentikasi
                                </div>
                                <div className="mt-1 text-lg font-bold text-slate-900">
                                    Masuk
                                </div>
                                <div className="mt-1 text-sm text-slate-600">
                                    Masukkan email dan kata sandi Anda.
                                </div>
                            </div>

                            <div className="p-6 sm:p-8">
                                {loginError ? (
                                    <div
                                        id={formErrorId}
                                        role="alert"
                                        aria-live="assertive"
                                        className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
                                    >
                                        {loginError}
                                    </div>
                                ) : null}

                                <form className="space-y-5" onSubmit={submit}>
                                    <div>
                                        <label
                                            htmlFor="email"
                                            className={labelCls}
                                        >
                                            Email
                                        </label>
                                        <div className="mt-2 relative">
                                            <span
                                                className={`${iconCls} ${
                                                    errors.email
                                                        ? iconErrorCls
                                                        : ""
                                                }`}
                                                aria-hidden="true"
                                            >
                                                <FaEnvelope className="h-4 w-4" />
                                            </span>
                                            <input
                                                ref={emailRef}
                                                id="email"
                                                name="email"
                                                type="email"
                                                autoComplete="email"
                                                required
                                                value={data.email}
                                                onChange={(e) =>
                                                    setData(
                                                        "email",
                                                        e.target.value,
                                                    )
                                                }
                                                aria-invalid={
                                                    errors.email
                                                        ? "true"
                                                        : "false"
                                                }
                                                aria-describedby={
                                                    errors.email
                                                        ? emailErrorId
                                                        : undefined
                                                }
                                                className={`${inputBaseCls} ${
                                                    errors.email
                                                        ? inputErrorCls
                                                        : inputNormalCls
                                                }`}
                                                placeholder="nama@pln.co.id"
                                            />
                                        </div>
                                        {errors.email ? (
                                            <p
                                                id={emailErrorId}
                                                className="mt-2 text-sm text-rose-700 font-semibold"
                                            >
                                                {errors.email}
                                            </p>
                                        ) : null}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="password"
                                            className={labelCls}
                                        >
                                            Kata Sandi
                                        </label>
                                        <div className="mt-2 relative">
                                            <span
                                                className={`${iconCls} ${
                                                    errors.password
                                                        ? iconErrorCls
                                                        : ""
                                                }`}
                                                aria-hidden="true"
                                            >
                                                <FaLock className="h-4 w-4" />
                                            </span>
                                            <input
                                                ref={passwordRef}
                                                id="password"
                                                name="password"
                                                type={
                                                    showPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                autoComplete="current-password"
                                                required
                                                value={data.password}
                                                onChange={(e) =>
                                                    setData(
                                                        "password",
                                                        e.target.value,
                                                    )
                                                }
                                                aria-invalid={
                                                    errors.password
                                                        ? "true"
                                                        : "false"
                                                }
                                                aria-describedby={
                                                    errors.password
                                                        ? passwordErrorId
                                                        : undefined
                                                }
                                                className={`${inputBaseCls} pr-11 ${
                                                    errors.password
                                                        ? inputErrorCls
                                                        : inputNormalCls
                                                }`}
                                                placeholder="Masukkan kata sandi"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword((v) => !v)
                                                }
                                                className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30"
                                                aria-label={
                                                    showPassword
                                                        ? "Sembunyikan kata sandi"
                                                        : "Tampilkan kata sandi"
                                                }
                                            >
                                                {showPassword ? (
                                                    <FaEyeSlash className="h-4 w-4" />
                                                ) : (
                                                    <FaEye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                        {errors.password ? (
                                            <p
                                                id={passwordErrorId}
                                                className="mt-2 text-sm text-rose-700 font-semibold"
                                            >
                                                {errors.password}
                                            </p>
                                        ) : null}
                                    </div>

                                    <div className="flex items-center justify-between gap-3">
                                        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                                            <input
                                                id="remember"
                                                name="remember"
                                                type="checkbox"
                                                checked={data.remember}
                                                onChange={(e) =>
                                                    setData(
                                                        "remember",
                                                        e.target.checked,
                                                    )
                                                }
                                                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                                            />
                                            Ingat saya
                                        </label>

                                        {canResetPassword ? (
                                            <Link
                                                href={route("password.request")}
                                                className="text-sm font-semibold text-sky-700 hover:text-sky-800 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30 rounded"
                                            >
                                                Lupa kata sandi?
                                            </Link>
                                        ) : null}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={processing || loading}
                                        aria-busy={
                                            processing || loading
                                                ? "true"
                                                : "false"
                                        }
                                        className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-600 px-5 py-3 text-white text-sm font-bold shadow-sm hover:from-sky-700 hover:to-cyan-700 transition disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30"
                                    >
                                        {processing || loading ? (
                                            <span className="inline-flex items-center gap-2">
                                                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                                Memproses...
                                            </span>
                                        ) : (
                                            "Masuk"
                                        )}
                                    </button>
                                </form>

                                <div className="my-6 flex items-center">
                                    <div className="flex-1 border-t border-slate-200" />
                                    <span className="mx-4 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                                        atau
                                    </span>
                                    <div className="flex-1 border-t border-slate-200" />
                                </div>

                                <a
                                    href="/auth/google"
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30"
                                >
                                    <FcGoogle className="h-5 w-5" />
                                    <span>Masuk dengan Google</span>
                                </a>
                            </div>
                        </div>

                        <div className="mt-6 text-center text-xs text-slate-500">
                            © {new Date().getFullYear()} PLN UPT Karawang.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
