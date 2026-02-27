<?php

namespace App\Http\Controllers\Dashboard;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\CompanyProfile;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Models\CompanyProfileVersion;
use Illuminate\Support\Facades\Storage;

class CompanyProfileController extends Controller
{
    private function defaultDraftData(): array
    {
        return [
            'company_name' => 'PLN UPT Karawang',
            'tagline' => '[TAGLINE_PLACEHOLDER]',
            'about_editor' => null,
            'logo' => null,
            'cover' => null,
            'address' => '[ALAMAT_KANTOR_PLACEHOLDER]',
            'phone' => '[TELEPON_PLACEHOLDER]',
            'email' => '[EMAIL_PLACEHOLDER]',
            'website' => '[WEBSITE_PLACEHOLDER]',
            'social' => [
                'facebook' => '',
                'instagram' => '',
                'linkedin' => '',
                'twitter' => '',
            ],
            'map' => [
                'lat' => null,
                'lng' => null,
            ],
            'vision_editor' => null,
            'missions' => [
                '[MISI_1]',
                '[MISI_2]',
                '[MISI_3]',
                '[MISI_4]',
                '[MISI_5]',
            ],
            'team' => [
                'photo' => null,
                'members' => [
                    [
                        'name' => '[NAMA_ANGGOTA_1]',
                        'position' => '[JABATAN_1]',
                        'bio' => '[DESKRIPSI_SINGKAT_1]',
                        'photo' => null,
                    ],
                ],
            ],
            'gallery' => [
                'items' => [],
            ],
            'stats' => [
                [
                    'label' => 'Aset Transmisi Dipelihara',
                    'value' => '[N]',
                    'unit' => '[UNIT]',
                    'sourceLabel' => '[SUMBER]',
                    'sourceUrl' => '',
                ],
            ],
            'testimonials' => [
                [
                    'quote' => '[KUTIPAN_TESTIMONI]',
                    'name' => '[NAMA]',
                    'organization' => '[INSTANSI]',
                    'role' => '[PERAN]',
                ],
            ],
        ];
    }

    private function getSingleton(): CompanyProfile
    {
        $profile = CompanyProfile::query()->orderBy('id')->first();
        if ($profile) return $profile;

        return CompanyProfile::create([
            'draft_data' => $this->defaultDraftData(),
            'published_data' => null,
            'status' => 'draft',
            'updated_by' => Auth::id(),
        ]);
    }

    private function nextVersionNumber(int $companyProfileId): int
    {
        $max = CompanyProfileVersion::query()
            ->where('company_profile_id', $companyProfileId)
            ->max('version_number');

        return (int) ($max ?? 0) + 1;
    }

    public function edit()
    {
        $profile = $this->getSingleton();
        $versions = $profile
            ->versions()
            ->orderByDesc('created_at')
            ->limit(30)
            ->get([
                'id',
                'version_number',
                'state',
                'change_note',
                'created_by',
                'created_at',
            ]);

        return Inertia::render('Dashboard/CompanyProfile/Edit', [
            'profile' => [
                'id' => $profile->id,
                'draft_data' => $profile->draft_data,
                'status' => $profile->status,
                'published_at' => $profile->published_at,
                'published_version_id' => $profile->published_version_id,
                'updated_at' => $profile->updated_at,
            ],
            'versions' => $versions,
        ]);
    }

    public function saveDraft(Request $request)
    {
        $profile = $this->getSingleton();

        $validated = $request->validate([
            'draft_data' => ['required', 'array'],
            'draft_data.company_name' => ['required', 'string', 'max:120'],
            'draft_data.tagline' => ['nullable', 'string', 'max:140'],
            'draft_data.address' => ['nullable', 'string', 'max:500'],
            'draft_data.phone' => ['nullable', 'string', 'max:40'],
            'draft_data.email' => ['nullable', 'email', 'max:120'],
            'draft_data.website' => ['nullable', 'string', 'max:200'],
            'draft_data.social' => ['nullable', 'array'],
            'draft_data.map' => ['nullable', 'array'],
            'change_note' => ['nullable', 'string', 'max:500'],
        ]);

        $draftData = $request->input('draft_data');
        if (!is_array($draftData)) {
            $draftData = [];
        }
        unset($draftData['founded_year']);

        $profile->update([
            'draft_data' => $draftData,
            'status' => 'draft',
            'updated_by' => Auth::id(),
        ]);

        $versionNumber = $this->nextVersionNumber($profile->id);
        CompanyProfileVersion::create([
            'company_profile_id' => $profile->id,
            'version_number' => $versionNumber,
            'state' => 'draft',
            'snapshot_data' => $draftData,
            'change_note' => $validated['change_note'] ?? null,
            'created_by' => Auth::id(),
        ]);

        return back()->with('success', 'Draft berhasil disimpan.');
    }

    public function publish(Request $request)
    {
        $profile = $this->getSingleton();

        $validated = $request->validate([
            'draft_data' => ['required', 'array'],
            'draft_data.company_name' => ['required', 'string', 'max:120'],
            'change_note' => ['nullable', 'string', 'max:500'],
        ]);

        $draftData = $request->input('draft_data');
        if (!is_array($draftData)) {
            $draftData = [];
        }
        unset($draftData['founded_year']);

        $versionNumber = $this->nextVersionNumber($profile->id);
        $version = CompanyProfileVersion::create([
            'company_profile_id' => $profile->id,
            'version_number' => $versionNumber,
            'state' => 'published',
            'snapshot_data' => $draftData,
            'change_note' => $validated['change_note'] ?? null,
            'created_by' => Auth::id(), 
        ]);

        $profile->update([
            'draft_data' => $draftData,
            'published_data' => $draftData,
            'status' => 'published',
            'published_version_id' => $version->id,
            'published_at' => now(),
            'updated_by' => Auth::id(),
        ]);

        return back()->with('success', 'Profil berhasil diterbitkan.');
    }

    public function restore(Request $request, CompanyProfileVersion $version)
    {
        $profile = $this->getSingleton();

        if ((int) $version->company_profile_id !== (int) $profile->id) {
            abort(404);
        }

        $snapshot = $version->snapshot_data;
        if (is_array($snapshot)) {
            unset($snapshot['founded_year']);
        }

        $profile->update([
            'draft_data' => $snapshot,
            'status' => 'draft',
            'updated_by' => Auth::id(), 
        ]);

        $versionNumber = $this->nextVersionNumber($profile->id);
        CompanyProfileVersion::create([
            'company_profile_id' => $profile->id,
            'version_number' => $versionNumber,
            'state' => 'draft',
            'snapshot_data' => $snapshot,
            'change_note' => 'Restore dari versi v' . $version->version_number,
            'created_by' => Auth::id(), 
        ]);

        return back()->with('success', 'Versi berhasil dipulihkan sebagai draft.');
    }

    public function publishVersion(Request $request, CompanyProfileVersion $version)
    {
        $profile = $this->getSingleton();

        if ((int) $version->company_profile_id !== (int) $profile->id) {
            abort(404);
        }

        $request->validate([
            'change_note' => ['nullable', 'string', 'max:500'],
        ]);

        $versionNumber = $this->nextVersionNumber($profile->id);

        $snapshot = $version->snapshot_data;
        if (is_array($snapshot)) {
            unset($snapshot['founded_year']);
        }

        $published = CompanyProfileVersion::create([
            'company_profile_id' => $profile->id,
            'version_number' => $versionNumber,
            'state' => 'published',
            'snapshot_data' => $snapshot,
            'change_note' => $request->input('change_note') ?: ('Terbitkan dari versi v' . $version->version_number),
            'created_by' => Auth::id(), 
        ]);

        $profile->update([
            'draft_data' => $snapshot,
            'published_data' => $snapshot,
            'status' => 'published',
            'published_version_id' => $published->id,
            'published_at' => now(),
            'updated_by' => Auth::id(), 
        ]);

        return back()->with('success', 'Versi berhasil diterbitkan.');
    }

    public function upload(Request $request)
    {
        $request->validate([
            'type' => ['required', 'string', 'in:logo,cover,gallery,team,member'],
            'file' => ['required', 'file', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        $type = $request->string('type')->toString();
        $file = $request->file('file');
        $ext = strtolower($file->getClientOriginalExtension() ?: 'jpg');

        $profile = $this->getSingleton();

        $name = uniqid('cp_', true) . '.' . $ext;
        $path = "company-profile/{$profile->id}/{$type}/{$name}";

        Storage::disk('public')->putFileAs(
            dirname($path),
            $file,
            basename($path),
        );

        return response()->json([
            'path' => $path,
            'url' => Storage::url($path),
        ]);
    }
}
