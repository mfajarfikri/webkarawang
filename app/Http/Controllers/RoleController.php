<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $roles = Role::with('permissions')->get(['id', 'name']);
        return Inertia::render('Dashboard/Role/Role', [
            'roles' => $roles,
            'errors' => session('errors') ? session('errors')->getBag('default')->toArray() : (object)[],
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
            'name' => 'required|unique:roles,name',
        ]);
        Role::create(['name' => $request->name]);
        return redirect()->back()->with('success', 'Role berhasil ditambahkan.');
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
    public function edit($id)
    {
        $role = Role::findOrFail($id);
        return Inertia::render('Dashboard/Role/EditRole', [
            'role' => $role,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $role = Role::findOrFail($id);
        $request->validate([
            'name' => 'required|unique:roles,name,' . $role->id,
        ]);
        $role->name = $request->name;
        $role->save();
        return redirect()->route('role.index')->with('success', 'Role berhasil diupdate.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Role $role)
    {
        $role->delete();
        return redirect()->back();
    }

    public function editPermissions($id)
    {
        $role = Role::findOrFail($id);
        $permissions = Permission::all(['id', 'name']);
        $rolePermissions = $role->permissions->pluck('id')->toArray();
        if (request()->has('modal')) {
            return response()->json([
                'permissions' => $permissions,
                'rolePermissions' => $rolePermissions,
            ]);
        }
        return Inertia::render('Dashboard/Role/AssignPermission', [
            'role' => $role,
            'permissions' => $permissions,
            'rolePermissions' => $rolePermissions,
        ]);
    }

    public function updatePermissions(Request $request, $id)
    {
        $role = Role::findOrFail($id);
        $request->validate([
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,id',
        ]);
        $role->syncPermissions($request->permissions ?? []);
        return redirect()->route('role.index')->with('success', 'Permissions updated.');
    }
}
