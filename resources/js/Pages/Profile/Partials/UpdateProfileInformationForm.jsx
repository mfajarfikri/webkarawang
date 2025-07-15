import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Transition } from "@headlessui/react";
import { Link, useForm, usePage } from "@inertiajs/react";
import { useEffect, useState, useRef } from "react";
import { router } from "@inertiajs/react";
import { FaCamera, FaSignature, FaUndo } from "react-icons/fa";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.css";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginImageCrop from "filepond-plugin-image-crop";
import FilePondPluginImageResize from "filepond-plugin-image-resize";
import FilePondPluginImageTransform from "filepond-plugin-image-transform";
import FilePondPluginImageEdit from "filepond-plugin-image-edit";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import "filepond-plugin-image-edit/dist/filepond-plugin-image-edit.css";

registerPlugin(
    FilePondPluginFileValidateType,
    FilePondPluginImageExifOrientation,
    FilePondPluginImagePreview,
    FilePondPluginImageCrop,
    FilePondPluginImageResize,
    FilePondPluginImageTransform,
    FilePondPluginImageEdit
);

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = "",
}) {
    const user = usePage().props.auth.user;

    // Foto profil
    const [fotoProfil, setFotoProfil] = useState([]);
    const [uploadLoading, setUploadLoading] = useState(false);
    const fotoProfilInput = useRef();

    const handleFotoProfilChange = (fileItems) => {
        setFotoProfil(fileItems);
        if (fileItems && fileItems[0]) {
            setFotoProfilPreview(URL.createObjectURL(fileItems[0].file));
        }
    };
    const handleUploadFoto = (e) => {
        e.preventDefault();
        if (!fotoProfil[0]) return;
        setUploadLoading(true);
        const formData = new FormData();
        formData.append("foto_profil", fotoProfil[0].file);
        router.post("/profile/upload-media", formData, {
            forceFormData: true,
            onFinish: () => setUploadLoading(false),
        });
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
                    {/* Form Profil */}
                    <header className="w-full">
                        <h3 className="text-lg font-semibold text-blue-700 w-full">
                            Informasi Profil
                        </h3>
                        <p className="mt-1 text-sm text-gray-600 w-full">
                            Perbarui informasi profil akun dan alamat email
                            Anda.
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
                    <div className="bg-blue-50 border-2 h-full border-blue-200 rounded-lg shadow-sm flex flex-col items-center justify-center p-4">
                        <FilePond
                            files={fotoProfil}
                            onupdatefiles={setFotoProfil}
                            allowMultiple={false}
                            maxFiles={1}
                            name="foto_profil"
                            labelIdle='Drag & Drop your picture or <span class="filepond--label-action">Browse</span>'
                            acceptedFileTypes={[
                                "image/png",
                                "image/jpeg",
                                "image/gif",
                            ]}
                            imagePreviewHeight={170}
                            imageCropAspectRatio="1:1"
                            imageResizeTargetWidth={200}
                            imageResizeTargetHeight={200}
                            stylePanelLayout="compact circle"
                            styleLoadIndicatorPosition="center bottom"
                            styleProgressIndicatorPosition="right bottom"
                            styleButtonRemoveItemPosition="left bottom"
                            styleButtonProcessItemPosition="right bottom"
                        />
                        <button
                            type="button"
                            onClick={handleUploadFoto}
                            className="mt-4 flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 text-white font-bold shadow-lg hover:from-blue-800 hover:to-blue-600 disabled:opacity-50 w-full text-base transition-all duration-200"
                            disabled={uploadLoading || !fotoProfil[0]}
                        >
                            <FaCamera className="text-lg" />
                            {uploadLoading ? "Menyimpan..." : "Simpan Foto"}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
