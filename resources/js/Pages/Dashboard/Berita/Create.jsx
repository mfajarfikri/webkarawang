import { useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, useForm } from "@inertiajs/react";
import { FaImage, FaSave, FaTimes } from "react-icons/fa";

export default function CreateBerita() {
    const [imagePreview, setImagePreview] = useState(null);
    const { data, setData, post, processing, errors, reset } = useForm({
        judul: "",
        isi: "",
        gambar: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("berita.store"));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setData("gambar", file);

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <>
            <Head title="Tambah Berita" />
            <DashboardLayout>
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-3xl mx-auto">
                        <h1 className="text-3xl font-bold text-gray-800 mb-6">
                            Tambah Berita Baru
                        </h1>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Judul Berita
                                </label>
                                <input
                                    type="text"
                                    value={data.judul}
                                    onChange={(e) =>
                                        setData("judul", e.target.value)
                                    }
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Masukkan judul berita"
                                />
                                {errors.judul && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.judul}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Gambar
                                </label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                                    <div className="space-y-1 text-center">
                                        {imagePreview ? (
                                            <div className="relative">
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="mx-auto h-64 w-auto rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setImagePreview(null);
                                                        setData("gambar", null);
                                                    }}
                                                    className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full"
                                                >
                                                    <FaTimes />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <FaImage className="mx-auto h-12 w-12 text-gray-400" />
                                                <p className="text-gray-600">
                                                    Klik atau seret gambar ke
                                                    sini
                                                </p>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            onChange={handleImageChange}
                                            className="sr-only"
                                            id="gambar"
                                            accept="image/*"
                                        />
                                        <label
                                            htmlFor="gambar"
                                            className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                                        >
                                            <span>Upload gambar</span>
                                        </label>
                                    </div>
                                </div>
                                {errors.gambar && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.gambar}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Isi Berita
                                </label>
                                <textarea
                                    value={data.isi}
                                    onChange={(e) =>
                                        setData("isi", e.target.value)
                                    }
                                    rows="6"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Tulis isi berita..."
                                />
                                {errors.isi && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.isi}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => window.history.back()}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                                >
                                    <FaSave className="mr-2" />
                                    Simpan Berita
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}
