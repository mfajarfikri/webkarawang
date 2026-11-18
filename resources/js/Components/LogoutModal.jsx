import { FaSignOutAlt } from "react-icons/fa";
import Modal from "@/Components/Modal";

export default function LogoutModal({ show, onClose, onConfirm }) {
    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="p-6 sm:p-7">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-100">
                    <FaSignOutAlt className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-ink-900">
                    Keluar dari akun?
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                    Anda perlu login kembali untuk mengakses dashboard.
                </p>
                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        className="btn-ghost"
                        onClick={onClose}
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        className="btn bg-rose-600 text-white hover:bg-rose-700"
                        onClick={onConfirm}
                    >
                        Ya, keluar
                    </button>
                </div>
            </div>
        </Modal>
    );
}
