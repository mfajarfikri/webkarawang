import DangerButton from "@/Components/DangerButton";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import Modal from "@/Components/Modal";
import SecondaryButton from "@/Components/SecondaryButton";
import TextInput from "@/Components/TextInput";
import { useForm } from "@inertiajs/react";
import { useRef, useState } from "react";

export default function DeleteUserForm({ className = "" }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: "",
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route("profile.destroy"), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-4 ${className}`}>
            <header className="space-y-1">
                <h2 className="text-sm font-semibold text-red-700">
                    Hapus akun secara permanen
                </h2>

                <p className="text-xs text-gray-500">
                    Setelah akun dihapus, semua data tidak dapat dikembalikan.
                    Pastikan Anda sudah menyimpan informasi penting terlebih
                    dahulu.
                </p>
            </header>

            <DangerButton
                onClick={confirmUserDeletion}
                className="mt-2 inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg shadow-sm w-full sm:w-auto"
            >
                Hapus akun
            </DangerButton>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6 space-y-4">
                    <h2 className="text-base font-semibold text-gray-900">
                        Yakin ingin menghapus akun?
                    </h2>

                    <p className="text-sm text-gray-600">
                        Setelah akun dihapus, semua sumber daya dan data akan
                        hilang permanen. Masukkan kata sandi Anda untuk
                        mengonfirmasi penghapusan akun.
                    </p>

                    <div>
                        <InputLabel
                            htmlFor="password"
                            value="Password"
                            className="sr-only"
                        />

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                            className="mt-1 block w-full"
                            isFocused
                            placeholder="Password"
                        />

                        <InputError
                            message={errors.password}
                            className="mt-2"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <SecondaryButton
                            onClick={closeModal}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Batal
                        </SecondaryButton>

                        <DangerButton
                            className="px-4 py-2 text-sm font-semibold rounded-lg shadow-sm"
                            disabled={processing}
                        >
                            Hapus akun
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
