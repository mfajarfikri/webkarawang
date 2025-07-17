import { useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import ApplicationLogo from "@/Components/ApplicationLogo";
import { FcGoogle } from "react-icons/fc";

export default function Login({ status, canResetPassword }) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("login"));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <Head title="Login" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="bg-white p-4 rounded-full shadow-lg">
                        <ApplicationLogo className="w-20 h-20" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Selamat Datang Kembali
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Silakan login untuk mengakses dashboard
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-2xl rounded-2xl sm:px-10 border border-gray-100 backdrop-blur-sm bg-opacity-90">
                    {status && (
                        <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200">
                            <p className="text-sm font-medium text-green-800">
                                {status}
                            </p>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={submit}>
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Email
                            </label>
                            <div className="mt-1 relative rounded-lg shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaEnvelope className="h-5 w-5 text-blue-500" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={data.email}
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                    className={`appearance-none block w-full pl-10 px-3 py-2.5 border ${
                                        errors.email
                                            ? "border-red-300"
                                            : "border-gray-300"
                                    } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out`}
                                    placeholder="Masukkan email Anda"
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-2 text-sm text-red-600">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Password
                            </label>
                            <div className="mt-1 relative rounded-lg shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaLock className="h-5 w-5 text-blue-500" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    value={data.password}
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    className={`appearance-none block w-full pl-10 pr-10 px-3 py-2.5 border ${
                                        errors.password
                                            ? "border-red-300"
                                            : "border-gray-300"
                                    } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out`}
                                    placeholder="Masukkan password Anda"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="text-gray-400 hover:text-blue-500 focus:outline-none transition duration-150 ease-in-out"
                                    >
                                        {showPassword ? (
                                            <FaEyeSlash className="h-5 w-5" />
                                        ) : (
                                            <FaEye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            {errors.password && (
                                <p className="mt-2 text-sm text-red-600">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember"
                                    name="remember"
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) =>
                                        setData("remember", e.target.checked)
                                    }
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition duration-150 ease-in-out"
                                />
                                <label
                                    htmlFor="remember"
                                    className="ml-2 block text-sm text-gray-900"
                                >
                                    Ingat saya
                                </label>
                            </div>

                            {canResetPassword && (
                                <div className="text-sm">
                                    <Link
                                        href={route("password.request")}
                                        className="font-medium text-blue-600 hover:text-blue-500 transition duration-150 ease-in-out"
                                    >
                                        Lupa password?
                                    </Link>
                                </div>
                            )}
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl shadow-lg text-base font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ease-in-out transform hover:scale-95 active:scale-100"
                            >
                                {processing ? (
                                    <div className="flex items-center">
                                        <svg
                                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        Logging in...
                                    </div>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" /></svg>
                                        Login
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Divider */}
                    <div className="my-6 flex items-center">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="mx-4 text-gray-400 text-xs font-semibold uppercase">atau</span>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>

                    {/* Google Login Button */}
                    <a
                        href="/auth/google"
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl shadow-lg text-base font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ease-in-out transform hover:scale-95 active:scale-100 mt-4"
                    >
                        <FcGoogle className="h-5 w-5 shadow-xl"/>
                        <span>Login dengan Google</span>
                    </a>

                    {/* Register Link */}
                    {/*
                    <div className="mt-6 text-center">
                        <span className="text-gray-500 text-sm">Belum punya akun?</span>{' '}
                        <Link href={route('register')} className="text-blue-600 font-semibold hover:underline ml-1">Daftar Akun</Link>
                    </div>
                    */}
                </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-sm text-gray-600">
                <p>
                    © {new Date().getFullYear()} PLN UPT Karawang. All rights
                    reserved.
                </p>
            </div>
        </div>
    );
}
