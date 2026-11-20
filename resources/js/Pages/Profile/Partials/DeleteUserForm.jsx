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
        <section
            className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${className}`}
        >
            <header className="max-w-xl space-y-1">
                <h3 className="text-sm font-bold text-ink-900">
                    Hapus akun secara permanen
                </h3>

                <p className="text-sm text-slate-600">
                    Setelah akun dihapus, semua data tidak dapat dikembalikan.
                    Pastikan Anda sudah menyimpan informasi penting terlebih
                    dahulu.
                </p>
            </header>

            <DangerButton
                onClick={confirmUserDeletion}
                className="w-full shrink-0 sm:w-auto"
            >
                Hapus akun
            </DangerButton>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="space-y-4 p-6">
                    <h2 className="text-lg font-bold text-ink-900">
                        Yakin ingin menghapus akun?
                    </h2>

                    <p className="text-sm text-slate-600">
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
                        <SecondaryButton onClick={closeModal}>
                            Batal
                        </SecondaryButton>

                        <DangerButton disabled={processing}>
                            Hapus akun
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
