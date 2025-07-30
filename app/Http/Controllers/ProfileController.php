<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Log;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
            // Tambahkan url foto profil
            'foto_profil_url' => $user->foto_profil ? Storage::url($user->foto_profil) : null,
            // Tambahkan url tanda tangan
            'tanda_tangan_url' => $user->tanda_tangan_path ? Storage::url($user->tanda_tangan_path) : null,
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('dashboard.profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }

    public function uploadMedia(Request $request)
    {
        $request->validate([
            'foto_profil' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:5048',
        ]);

        $user = $request->user();

        // Hapus foto lama jika ada
        if ($user->foto_profil) {
            Storage::disk('public')->delete($user->foto_profil);
        }

        // Simpan file baru
        $file = $request->file('foto_profil');
        $path = $file->store('profile', 'public');
        $user->foto_profil = $path;
        $user->save();

        // Selalu return JSON response
        return response()->json([
            'success' => true,
            'foto_profil_url' => Storage::url($path),
            'message' => 'Foto profil berhasil diunggah.'
        ]);
    }

    public function tandaTangan(Request $request) {
        try {
            $request->validate([
                'signature' => 'required|string',
            ]);

            $base64 = $request->input('signature');

            if (strpos($base64, 'base64,') !== false) {
                [, $content] = explode(',', $base64);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Format tanda tangan tidak valid.'
                ], 400);
            }

            $imageData = base64_decode($content);
            
            if ($imageData === false) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data tanda tangan tidak valid.'
                ], 400);
            }

            $filename = 'signature_' . time() . '_' . $request->user()->id . '.png';
            $path = 'signatures/' . $filename;
            
            // Ensure the directory exists
            Storage::disk('public')->makeDirectory('signatures');
            
            // Save the signature
            Storage::disk('public')->put($path, $imageData);

            // Optionally save the path to user's profile if the field exists
            try {
                $user = $request->user();
                if (Schema::hasColumn('users', 'tanda_tangan_path')) {
                    $user->tanda_tangan_path = $path;
                    $user->save();
                }
            } catch (\Exception $e) {
                // If the field doesn't exist, just continue without saving to user
                Log::info('tanda_tangan_path field not available: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Tanda tangan berhasil disimpan.',
                'signature_url' => Storage::url($path)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menyimpan tanda tangan: ' . $e->getMessage()
            ], 500);
        }
    }
}
