<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use App\Models\User;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $users = \App\Models\User::with('roles')->get(['id', 'name', 'email', 'jabatan', 'kedudukan', 'foto_profil']);
        $users = $users->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'jabatan' => $user->jabatan,
                'kedudukan' => $user->kedudukan,
                'foto_profil' => $user->foto_profil,
                'role' => $user->roles->pluck('name')->implode(', '),
            ];
        });
        return inertia('Dashboard/User/User', [
            'users' => $users,
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
        ]);
        $user = \App\Models\User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
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
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function showAssignRoleForm($id)
    {
        $user = User::findOrFail($id);
        $roles = Role::all(['id', 'name']);
        $userRoles = $user->roles->pluck('name')->toArray();
        if (request()->has('modal')) {
            return response()->json([
                'roles' => $roles,
                'userRoles' => $userRoles,
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
        $user = User::findOrFail($id);
        $request->validate([
            'role' => 'required|exists:roles,name',
        ]);
        $user->syncRoles([$request->role]);
        return redirect()->route('dashboard.user.index')->with('success', 'Role user berhasil diupdate.');
    }
}
