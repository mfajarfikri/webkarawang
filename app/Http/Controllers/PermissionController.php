<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class PermissionController extends Controller
{
    public function index()
    {
        $permissions = Permission::all(['id', 'name']);
        return Inertia::render('Dashboard/Permission/Permission', [
            'permissions' => $permissions,
            'errors' => session('errors') ? session('errors')->getBag('default')->toArray() : (object)[],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate(['name' => 'required|unique:permissions,name']);
        Permission::create(['name' => $request->name]);
        return redirect()->back();
    }

    public function destroy(Permission $permission)
    {
        $permission->delete();
        return redirect()->back();
    }
}
