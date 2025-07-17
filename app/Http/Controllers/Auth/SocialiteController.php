<?php
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class SocialiteController extends Controller
{
    public function redirect($provider)
    {
        return Socialite::driver($provider)->redirect();
    }

    public function callback($provider)
    {
        $socialUser = Socialite::driver($provider)->user();

        // Cek user sudah ada atau belum
        $user = User::where('email', $socialUser->getEmail())->first();
        if (!$user) {
            // Email tidak terdaftar, tolak login
            return redirect('/login')->withErrors(['email' => 'Email Anda belum terdaftar di sistem. Silakan daftar akun terlebih dahulu atau hubungi admin.']);
        }

        // Email sudah terdaftar, login
        Auth::login($user, true);

        return redirect('/dashboard');
    }
}