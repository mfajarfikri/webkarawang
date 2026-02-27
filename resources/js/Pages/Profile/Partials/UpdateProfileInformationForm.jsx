import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Transition } from "@headlessui/react";
import { Link, useForm, usePage } from "@inertiajs/react";
import { useEffect, useState, useRef } from "react";
import { router } from "@inertiajs/react";
import { FaCamera, FaSignature, FaUndo } from "react-icons/fa";
import { useSnackbar } from "notistack";
import axios from "axios";

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = "",
    fotoProfilUrl = null,
}) {
    const user = usePage().props.auth.user;
    const { enqueueSnackbar } = useSnackbar();

    // Foto profil
    const [fotoProfil, setFotoProfil] = useState(null);
    const [fotoProfilPreview, setFotoProfilPreview] = useState(
        fotoProfilUrl || user.foto_profil_url || null
    );
    const [uploadLoading, setUploadLoading] = useState(false);
    const fotoProfilInput = useRef();

    // Sinkronisasi preview jika props berubah (misal setelah upload)
    useEffect(() => {
        setFotoProfilPreview(fotoProfilUrl || user.foto_profil_url || null);
    }, [fotoProfilUrl, user.foto_profil_url]);

    // Saat file dipilih, update preview
    const handleFotoProfilChange = (e) => {
        const file = e.target.files[0];
        setFotoProfil(file);
        if (file) {
            setFotoProfilPreview(URL.createObjectURL(file));
        }
    };

    const handleUploadFoto = async (e) => {
        e.preventDefault();
        if (!fotoProfil) return;
        setUploadLoading(true);
        const formData = new FormData();
        formData.append("foto_profil", fotoProfil);

        try {
            const response = await axios.post(
                route("dashboard.profile.upload-media"),
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            if (response.data?.foto_profil_url) {
                setFotoProfilPreview(response.data.foto_profil_url);
                enqueueSnackbar("Foto profil berhasil diunggah!", {
                    variant: "success",
                });
            }
            setFotoProfil(null);
            if (fotoProfilInput.current) fotoProfilInput.current.value = "";
        } catch (error) {
            let errorMsg = "Gagal mengunggah foto profil!";
            if (
                error.response &&
                error.response.data &&
                error.response.data.errors &&
                error.response.data.errors.foto_profil
            ) {
                errorMsg += " " + error.response.data.errors.foto_profil;
            }
            enqueueSnackbar(errorMsg, {
                variant: "error",
            });
        } finally {
            setUploadLoading(false);
        }
    };
    const handleUploadTandaTangan = (e) => {
        e.preventDefault();
        if (!canvasUrl) return;
        setCanvasLoading(true);
        router.post(
            "/profile/upload-media",
            { tanda_tangan_canvas: canvasUrl },
            {
                onFinish: () => setCanvasLoading(false),
            }
        );
    };

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
        });

    const submit = (e) => {
        e.preventDefault();

        patch(route("dashboard.profile.update"));
    };

    return (
        <section className={className + " w-full"}>
            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2">
                    <header className="w-full space-y-1">
                        <h3 className="text-base md:text-lg font-semibold text-gray-900 w-full">
                            Data akun
                        </h3>
                        <p className="text-xs md:text-sm text-gray-600 w-full">
                            Perbarui informasi profil dan alamat email yang
                            digunakan untuk akun Anda.
                        </p>
                    </header>
                    <form onSubmit={submit} className="mt-6 space-y-6 w-full">
                        <div className="w-full">
                            <InputLabel
                                htmlFor="name"
                                value="Nama"
                                className="w-full"
                            />
                            <TextInput
                                id="name"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                required
                                isFocused
                                autoComplete="name"
                            />
                            <InputError
                                className="mt-2 w-full"
                                message={errors.name}
                            />
                        </div>
                        <div className="w-full">
                            <InputLabel
                                htmlFor="email"
                                value="Email"
                                className="w-full"
                            />
                            <TextInput
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                                required
                                autoComplete="username"
                            />
                            <InputError
                                className="mt-2 w-full"
                                message={errors.email}
                            />
                        </div>
                        {mustVerifyEmail && user.email_verified_at === null && (
                            <div className="w-full">
                                <p className="mt-2 text-sm text-gray-800 w-full">
                                    Your email address is unverified.
                                    <Link
                                        href={route("verification.send")}
                                        method="post"
                                        as="button"
                                        className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                    >
                                        Click here to re-send the verification
                                        email.
                                    </Link>
                                </p>
                                {status === "verification-link-sent" && (
                                    <div className="mt-2 text-sm font-medium text-green-600 w-full">
                                        A new verification link has been sent to
                                        your email address.
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="flex items-center gap-4 w-full">
                            <PrimaryButton
                                disabled={processing}
                                className="w-full sm:w-auto"
                            >
                                Save
                            </PrimaryButton>
                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-gray-600 w-full">
                                    Saved.
                                </p>
                            </Transition>
                        </div>
                    </form>
                </div>
                <div className="col-span-1">
                    <div className="bg-blue-50/80 border border-blue-200 h-full rounded-2xl shadow-sm flex flex-col items-center justify-center p-4 gap-4">
                        <div className="flex flex-col items-center gap-2 w-full">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-200 bg-white flex items-center justify-center">
                                {fotoProfilPreview ? (
                                    <img
                                        src={fotoProfilPreview}
                                        alt="Foto Profil"
                                        className="object-cover w-full h-full"
                                    />
                                ) : (
                                    <span className="text-gray-400 text-5xl">
                                        ?
                                    </span>
                                )}
                            </div>
                            <span className="text-xs text-gray-500 text-center">
                                Foto Profil Saat Ini
                            </span>
                        </div>
                        <input
                            type="file"
                            accept="image/png, image/jpeg, image/gif"
                            className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 mt-2"
                            onChange={handleFotoProfilChange}
                            ref={fotoProfilInput}
                        />
                        <PrimaryButton
                            className="items-center justify-center gap-2 w-full"
                            onClick={handleUploadFoto}
                            disabled={uploadLoading || !fotoProfil}
                        >
                            {uploadLoading ? (
                                <>
                                    <svg
                                        className="animate-spin h-5 w-5 mr-2 text-white"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="none"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v8z"
                                        />
                                    </svg>
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <FaCamera className="text-lg" />
                                    Simpan Foto
                                </>
                            )}
                        </PrimaryButton>
                    </div>
                </div>
            </div>
        </section>
    );
}
