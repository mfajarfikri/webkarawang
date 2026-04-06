<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use App\Models\User;
use App\Models\GarduInduk;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $users = User::with('roles')->get();
        $users = $users->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'bidang' => $user->bidang,
                'foto_profil' => $user->foto_profil ? Storage::url($user->foto_profil) : null,
                'role' => $user->roles->pluck('name')->implode(', '),
                'wilayah' => $user->wilayah,
                'gardu_induk_ids' => $user->gardu_induk_ids,
                'gardu_induks' => $user->gardu_induk_ids ? GarduInduk::whereIn('id', $user->gardu_induk_ids)->get(['id','name','ultg']) : [],
            ];
        });
        $garduInduks = GarduInduk::select('id', 'name', 'ultg')->get();
        return inertia('Dashboard/User/index', [
            'users' => $users,
            'garduInduks' => $garduInduks,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|exists:roles,name',
            'wilayah' => 'required|in:UPT Karawang,ULTG Karawang,ULTG Purwakarta',
            'bidang' => 'required|in:Master,Renev,MULTG,Hargi,Harjar,Harpro,K3,GI',
            'gardu_induk_ids' => 'nullable|array',
            'gardu_induk_ids.*' => 'exists:gardu_induks,id',
        ]);
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'wilayah' => $request->wilayah,
            'bidang' => $request->bidang,
            'gardu_induk_ids' => $request->gardu_induk_ids,
        ]);
        $user->assignRole($request->role);
        return redirect()->route('dashboard.user.index')->with('success', 'User berhasil ditambahkan.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = User::findOrFail($id);
        $request->validate([
            'role' => 'required|exists:roles,name',
            'wilayah' => 'required|in:UPT Karawang,ULTG Karawang,ULTG Purwakarta',
            'bidang' => 'required|in:Master,Renev,MULTG,Hargi,Harjar,Harpro,K3,GI',
            'gardu_induk_ids' => 'nullable|array',
            'gardu_induk_ids.*' => 'exists:gardu_induks,id',
        ]);
        $user->wilayah = $request->wilayah;
        $user->bidang = $request->bidang;
        $user->gardu_induk_ids = $request->gardu_induk_ids;
        $user->save();
        $user->syncRoles([$request->role]);
        return redirect()->route('dashboard.user.index')->with('success', 'User berhasil diupdate.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = User::findOrFail($id);
        
        // Hapus foto profil jika ada
        if ($user->foto_profil) {
            Storage::delete($user->foto_profil);
        }
        
        // Hapus tanda tangan jika ada
        if ($user->tanda_tangan_path) {
            Storage::delete($user->tanda_tangan_path);
        }
        
        // Hapus user
        $user->delete();
        
        return redirect()->route('dashboard.user.index')->with('success', 'User berhasil dihapus.');
    }

    public function showAssignRoleForm($id)
    {
        $user = User::findOrFail($id);
        $roles = Role::all(['id', 'name']);
        $userRoles = $user->roles->pluck('name')->toArray();
        $ultg = $user->ultg;
        $gardu_induk_ids = $user->gardu_induk_ids;
        $gardu_induks = $gardu_induk_ids ? \App\Models\GarduInduk::whereIn('id', $gardu_induk_ids)->get(['id','name','ultg']) : [];
        if (request()->has('modal')) {
            return response()->json([
                'roles' => $roles,
                'userRoles' => $userRoles,
                'ultg' => $ultg,
                'bidang' => $user->bidang,
                'gardu_induk_ids' => $gardu_induk_ids,
                'gardu_induks' => $gardu_induks,
            ]);
        }
        return Inertia::render('Dashboard/User/AssignRole', [
            'user' => $user,
            'roles' => $roles,
            'userRoles' => $userRoles,
        ]);
    }

    public function updateRole(Request $request, $id)
    {
        
    }
}
