<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MenuController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $menus = Menu::whereNull('parent_id')
            ->with('submenus') // Relasi rekursif di model akan menangani nesting
            ->orderBy('order')
            ->get();

        return Inertia::render('Dashboard/Menu/Menu', [
            'menus' => $menus,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'parent_id' => 'nullable|exists:menus,id',
            'title' => 'required|string|max:255',
            'url' => 'required|string|max:255',
            'order' => 'required|integer',
            'is_active' => 'required|boolean',
        ]);

        Menu::create($validated);

        return redirect()->back()->with('success', 'Menu berhasil dibuat.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Menu $menu)
    {
        $validated = $request->validate([
            'parent_id' => 'nullable|exists:menus,id',
            'title' => 'required|string|max:255',
            'url' => 'required|string|max:255',
            'order' => 'required|integer',
            'is_active' => 'required|boolean',
        ]);

        $menu->update($validated);

        return redirect()->back()->with('success', 'Menu berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Menu $menu)
    {
        $menu->delete();

        return redirect()->back()->with('success', 'Menu berhasil dihapus.');
    }

    /**
     * Reorder menus.
     */
    public function reorder(Request $request)
    {
        $request->validate([
            'menus' => 'required|array',
            'menus.*.id' => 'required|exists:menus,id',
            'menus.*.order' => 'required|integer',
        ]);

        foreach ($request->menus as $item) {
            Menu::where('id', $item['id'])->update(['order' => $item['order']]);
        }

        return redirect()->back()->with('success', 'Urutan menu berhasil diperbarui.');
    }
}
