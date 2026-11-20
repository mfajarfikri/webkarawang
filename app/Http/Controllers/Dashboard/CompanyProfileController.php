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
            'services' => [
                [
                    'icon' => 'bolt',
                    'name' => '[NAMA_LAYANAN]',
                    'description' => '[DESKRIPSI_LAYANAN]',
                    'features' => ['[FITUR_1]', '[FITUR_2]'],
                ],
            ],
            'portfolio' => [
                [
                    'title' => '[JUDUL_PROYEK]',
                    'category' => '[KATEGORI]',
                    'description' => '[DESKRIPSI_PROYEK]',
                    'client' => '[KLIEN]',
                    'year' => '[TAHUN]',
                    'tags' => ['[TAG_1]'],
                    'url' => '',
                    'image' => null,
                ],
            ],
            'documents' => [
                [
                    'title' => '[JUDUL_DOKUMEN]',
                    'description' => '[DESKRIPSI_DOKUMEN]',
                    'type' => '[TIPE]',
                    'url' => '',
                ],
            ],
            'history' => [],
        ];
    }

    private function mergeWithDefaults(array $data): array
    {
        $defaults = $this->defaultDraftData();
        $merged = array_replace_recursive($defaults, $data ?? []);
        if (! is_array($merged['missions'] ?? null)) {
            $merged['missions'] = [];
        }
        if (! is_array($merged['history'] ?? null)) {
            $merged['history'] = [];
        }
        if (! is_array($merged['stats'] ?? null)) {
            $merged['stats'] = [];
        }
        if (! is_array($merged['testimonials'] ?? null)) {
            $merged['testimonials'] = [];
        }
        if (! is_array($merged['services'] ?? null)) {
            $merged['services'] = [];
        }
        if (! is_array($merged['portfolio'] ?? null)) {
            $merged['portfolio'] = [];
        }
        if (! is_array($merged['documents'] ?? null)) {
            $merged['documents'] = [];
        }
        if (! is_array($merged['gallery'] ?? null)) {
            $merged['gallery'] = ['items' => []];
        }
        if (! is_array($merged['gallery']['items'] ?? null)) {
            $merged['gallery']['items'] = [];
        }
        if (! is_array($merged['team'] ?? null)) {
            $merged['team'] = ['photo' => null, 'members' => []];
        }
        if (! is_array($merged['team']['members'] ?? null)) {
            $merged['team']['members'] = [];
        }
        if (! is_array($merged['social'] ?? null)) {
            $merged['social'] = [];
        }
        if (! is_array($merged['map'] ?? null)) {
            $merged['map'] = ['lat' => null, 'lng' => null];
        }
        return $merged;
    }

    private function getSingleton(): CompanyProfile
    {
        $profile = CompanyProfile::query()->orderBy('id')->first();
        if (! $profile) {
            return CompanyProfile::create([
                'draft_data' => $this->defaultDraftData(),
                'published_data' => null,
                'status' => 'draft',
                'updated_by' => Auth::id(),
            ]);
        }

        $needsUpdate = false;
        $draft = is_array($profile->draft_data) ? $profile->draft_data : [];
        $mergedDraft = $this->mergeWithDefaults($draft);
        if ($mergedDraft !== $draft) {
            $profile->draft_data = $mergedDraft;
            $needsUpdate = true;
        }
        if ($profile->published_data !== null) {
            $published = is_array($profile->published_data) ? $profile->published_data : [];
            $mergedPublished = $this->mergeWithDefaults($published);
            if ($mergedPublished !== $published) {
                $profile->published_data = $mergedPublished;
                $needsUpdate = true;
            }
        }
        if ($needsUpdate) {
            $profile->save();
        }

        return $profile;
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
            'draft_data.map.lat' => ['nullable', 'numeric'],
            'draft_data.map.lng' => ['nullable', 'numeric'],
            'draft_data.logo' => ['nullable'],
            'draft_data.cover' => ['nullable'],
            'draft_data.about_editor' => ['nullable'],
            'draft_data.vision_editor' => ['nullable'],
            'draft_data.missions' => ['nullable', 'array'],
            'draft_data.history' => ['nullable', 'array'],
            'draft_data.team' => ['nullable', 'array'],
            'draft_data.team.photo' => ['nullable'],
            'draft_data.team.members' => ['nullable', 'array'],
            'draft_data.gallery' => ['nullable', 'array'],
            'draft_data.gallery.items' => ['nullable', 'array'],
            'draft_data.stats' => ['nullable', 'array'],
            'draft_data.testimonials' => ['nullable', 'array'],
            'draft_data.services' => ['nullable', 'array'],
            'draft_data.portfolio' => ['nullable', 'array'],
            'draft_data.documents' => ['nullable', 'array'],
            'change_note' => ['nullable', 'string', 'max:500'],
        ]);

        $draftData = $request->input('draft_data');
        if (!is_array($draftData)) {
            $draftData = [];
        }
        $draftData = $this->mergeWithDefaults($draftData);
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
            'draft_data.tagline' => ['nullable', 'string', 'max:140'],
            'draft_data.address' => ['nullable', 'string', 'max:500'],
            'draft_data.phone' => ['nullable', 'string', 'max:40'],
            'draft_data.email' => ['nullable', 'email', 'max:120'],
            'draft_data.website' => ['nullable', 'string', 'max:200'],
            'draft_data.social' => ['nullable', 'array'],
            'draft_data.map' => ['nullable', 'array'],
            'draft_data.map.lat' => ['nullable', 'numeric'],
            'draft_data.map.lng' => ['nullable', 'numeric'],
            'draft_data.logo' => ['nullable'],
            'draft_data.cover' => ['nullable'],
            'draft_data.about_editor' => ['nullable'],
            'draft_data.vision_editor' => ['nullable'],
            'draft_data.missions' => ['nullable', 'array'],
            'draft_data.history' => ['nullable', 'array'],
            'draft_data.team' => ['nullable', 'array'],
            'draft_data.team.photo' => ['nullable'],
            'draft_data.team.members' => ['nullable', 'array'],
            'draft_data.gallery' => ['nullable', 'array'],
            'draft_data.gallery.items' => ['nullable', 'array'],
            'draft_data.stats' => ['nullable', 'array'],
            'draft_data.testimonials' => ['nullable', 'array'],
            'draft_data.services' => ['nullable', 'array'],
            'draft_data.portfolio' => ['nullable', 'array'],
            'draft_data.documents' => ['nullable', 'array'],
            'change_note' => ['nullable', 'string', 'max:500'],
        ]);

        $draftData = $request->input('draft_data');
        if (!is_array($draftData)) {
            $draftData = [];
        }
        $draftData = $this->mergeWithDefaults($draftData);
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
            'type' => ['required', 'string', 'in:logo,cover,gallery,team,member,portfolio'],
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
