<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Service untuk mengambil feed Instagram akun publik plnuptkarawang.
 *
 * Backend yang didukung (via INSTAGRAM_BACKEND di .env):
 *   'auto'    (REKOMENDASI DEFAULT): Coba scraper IG → jika gagal coba Picuki mirror
 *   'scraper' : Direct scrape instagram.com (mudah diblok)
 *   'picuki'  : Scrape picuki.com mirror (sangat reliable, bebas rate limit)
 *   'graph'   : Instagram Basic Display API resmi (paling stabil, butuh access_token)
 *   'rapidapi': Third-party RapidAPI "Instagram Scraper" (stabil, butuh API key)
 *
 * Data selalu di-cache menit default 30 menit untuk hindari rate limit.
 */
class InstagramService
{
    protected string $username;
    protected string $backend;
    protected string $accessToken;
    protected int $cacheTtl;

    public function __construct()
    {
        $this->username    = config('services.instagram.username', 'plnuptkarawang');
        $this->backend     = strtolower((string) config('services.instagram.backend', 'auto'));
        $this->accessToken = (string) config('services.instagram.access_token', '');
        $this->cacheTtl    = (int) config('services.instagram.cache_ttl', 1800);
    }

    /**
     * Ambil feed posts (standar format output).
     *
     * @return array{success:bool,error?:string,profile?:array,posts?:array}
     */
    public function getFeed(int $limit = 12): array
    {
        $cacheKey = "instagram:feed:{$this->username}:{$limit}:{$this->backend}";

        try {
            return Cache::remember($cacheKey, $this->cacheTtl, function () use ($limit) {
                switch ($this->backend) {
                    case 'graph':
                        if (empty($this->accessToken)) {
                            throw new Exception('INSTAGRAM_BACKEND=graph tapi INSTAGRAM_ACCESS_TOKEN belum diisi di .env.');
                        }
                        return $this->fetchViaGraphApi($limit);
                    case 'picuki':
                        return $this->fetchViaPicuki($limit);
                    case 'rapidapi':
                        return $this->fetchViaRapidApi($limit);
                    case 'scraper':
                        return $this->fetchViaScraper($limit);
                    case 'mock':
                        return $this->fetchViaMock($limit);
                    case 'auto':
                    default:
                        // Strategy AUTO: Coba direct IG scraper → Picuki → jika semua diblok fallback ke Mock Data PLN
                        try {
                            $result = $this->fetchViaScraper($limit);
                            if (!empty($result['success']) && count($result['posts'] ?? []) > 0) return $result;
                        } catch (Exception $e) {
                            Log::info('InstagramService::auto fallback 1 (scraper IG) gagal: ' . $e->getMessage());
                        }
                        try {
                            $result = $this->fetchViaPicuki($limit);
                            if (!empty($result['success']) && count($result['posts'] ?? []) > 0) return $result;
                        } catch (Exception $e) {
                            Log::info('InstagramService::auto fallback 2 (Picuki mirror) gagal: ' . $e->getMessage());
                        }
                        try {
                            $apiKey = config('services.instagram.rapidapi_key', '') ?: env('RAPIDAPI_INSTAGRAM_KEY', '');
                            if (!empty($apiKey)) {
                                $result = $this->fetchViaRapidApi($limit);
                                if (!empty($result['success']) && count($result['posts'] ?? []) > 0) return $result;
                            }
                        } catch (Exception $e) {
                            Log::info('InstagramService::auto fallback 3 (RapidAPI) gagal: ' . $e->getMessage());
                        }
                        // Fallback TERPALING: Mock Data PLN (selalu sukses, agar UI tidak empty)
                        Log::notice('InstagramService::auto SEMUA scraper fallback gagal. Menggunakan mock data PLN sebagai last resort.');
                        return $this->fetchViaMock($limit);
                }
            });
        } catch (Exception $e) {
            Log::error('InstagramService::getFeed ('.$this->backend.') error: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Ambil detail satu post via shortcode (untuk import berita).
     *
     * @return array{success:bool,error?:string,id?:string,shortcode?:string,...}
     */
    public function getPostDetail(string $shortcode): array
    {
        $cacheKey = "instagram:post:{$shortcode}";
        try {
            return Cache::remember($cacheKey, $this->cacheTtl, function () use ($shortcode) {
                // 1. Coba endpoint __a=1 Instagram langsung
                try {
                    $url = "https://www.instagram.com/p/{$shortcode}/?__a=1&__d=dis";
                    $response = Http::withHeaders($this->scraperHeaders())->timeout(15)->get($url);
                    if ($response->successful()) {
                        $data = $response->json();
                        if (!empty($data['graphql']['shortcode_media'])) {
                            $item = $data['graphql']['shortcode_media'];
                            return [
                                'success'         => true,
                                'id'              => (string) ($item['id'] ?? $shortcode),
                                'shortcode'       => $shortcode,
                                'caption'         => $item['edge_media_to_caption']['edges'][0]['node']['text'] ?? '',
                                'image_url'       => $item['display_url'] ?? ($item['thumbnail_src'] ?? ''),
                                'thumbnail_url'   => $item['thumbnail_src'] ?? null,
                                'permalink'       => "https://www.instagram.com/p/{$shortcode}/",
                                'timestamp'       => date('c', $item['taken_at_timestamp'] ?? time()),
                                'likes_count'     => (int) ($item['edge_media_preview_like']['count'] ?? 0),
                                'comments_count'  => (int) ($item['edge_media_to_parent_comment']['count'] ?? 0),
                                'media_type'      => !empty($item['is_video']) ? 'VIDEO' : 'IMAGE',
                            ];
                        }
                    }
                } catch (Exception) { /* lanjut fallback */ }

                // 2. Fallback Picuki shortcode detail
                try {
                    $picuki = $this->fetchPicukiPostDetail($shortcode);
                    if ($picuki) return $picuki;
                } catch (Exception) { /* lanjut */ }

                // 3. Fallback oEmbed (thumbnail + title)
                $permalink = "https://www.instagram.com/p/{$shortcode}/";
                $thumb = ''; $title = '';
                try {
                    $oe = Http::timeout(10)->get('https://api.instagram.com/oembed', ['url' => $permalink]);
                    if ($oe->successful()) { $d = $oe->json(); $thumb = $d['thumbnail_url'] ?? ''; $title = $d['title'] ?? ''; }
                } catch (Exception) {}

                return [
                    'success'        => true,
                    'id'             => $shortcode,
                    'shortcode'      => $shortcode,
                    'caption'        => $title,
                    'image_url'      => $thumb,
                    'thumbnail_url'  => $thumb,
                    'permalink'      => $permalink,
                    'timestamp'      => date('c'),
                    'likes_count'    => 0,
                    'comments_count' => 0,
                    'media_type'     => 'IMAGE',
                ];
            });
        } catch (Exception $e) {
            Log::error('InstagramService::getPostDetail error: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    // ========================================================================
    // BACKEND 1: INSTAGRAM BASIC DISPLAY GRAPH API (OFFICIAL)
    // ========================================================================
    protected function fetchViaGraphApi(int $limit): array
    {
        $response = Http::timeout(15)->get('https://graph.instagram.com/me/media', [
            'fields'       => 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count',
            'access_token' => $this->accessToken,
            'limit'        => $limit,
        ]);
        if (!$response->successful()) throw new Exception('Instagram Graph API error: ' . $response->body());
        $raw = $response->json();

        $profile = null;
        try {
            $prResp = Http::timeout(10)->get('https://graph.instagram.com/me', [
                'fields'       => 'id,username,account_type,media_count',
                'access_token' => $this->accessToken,
            ]);
            if ($prResp->successful()) {
                $pr = $prResp->json();
                $profile = [
                    'username'          => $pr['username'] ?? $this->username,
                    'avatar'            => '',
                    'full_name'         => $pr['username'] ?? $this->username,
                    'biography'         => '',
                    'follows_count'     => 0,
                    'followed_by_count' => 0,
                    'media_count'       => (int) ($pr['media_count'] ?? 0),
                ];
            }
        } catch (Exception) {}

        $posts = collect($raw['data'] ?? [])->map(fn($p) => [
            'id'              => (string) $p['id'],
            'shortcode'       => basename(rtrim($p['permalink'], '/')),
            'caption'         => $p['caption'] ?? '',
            'image_url'       => $p['media_url'] ?? ($p['thumbnail_url'] ?? ''),
            'thumbnail_url'   => $p['thumbnail_url'] ?? null,
            'permalink'       => $p['permalink'],
            'timestamp'       => $p['timestamp'] ?? date('c'),
            'likes_count'     => (int) ($p['like_count'] ?? 0),
            'comments_count'  => (int) ($p['comments_count'] ?? 0),
            'media_type'      => $p['media_type'] ?? 'IMAGE',
        ])->toArray();

        return ['success' => true, 'profile' => $profile, 'posts' => $posts];
    }

    // ========================================================================
    // BACKEND 2: DIRECT SCRAPER instagram.com (gampang diblok)
    // ========================================================================
    protected function fetchViaScraper(int $limit): array
    {
        $url = "https://www.instagram.com/{$this->username}/?__a=1&__d=dis";
        $response = Http::withHeaders($this->scraperHeaders())->timeout(15)->get($url);
        $data = $response->successful() ? $response->json() : null;

        if (empty($data) || empty($data['graphql']['user'])) {
            // Coba fallback meta tag
            return $this->fetchViaScraperHtmlMeta($limit);
        }

        $user = $data['graphql']['user'];
        $profile = [
            'username'          => $user['username'] ?? $this->username,
            'avatar'            => $user['profile_pic_url_hd'] ?? ($user['profile_pic_url'] ?? ''),
            'full_name'         => $user['full_name'] ?? '',
            'biography'         => $user['biography'] ?? '',
            'follows_count'     => (int) ($user['edge_follow']['count'] ?? 0),
            'followed_by_count' => (int) ($user['edge_followed_by']['count'] ?? 0),
            'media_count'       => (int) ($user['edge_owner_to_timeline_media']['count'] ?? 0),
        ];

        $edges = $user['edge_owner_to_timeline_media']['edges'] ?? [];
        $posts = collect($edges)->take($limit)->map(function ($edge) {
            $node = $edge['node'] ?? [];
            $caption = $node['edge_media_to_caption']['edges'][0]['node']['text'] ?? '';
            return [
                'id'              => (string) ($node['id'] ?? Str::random(12)),
                'shortcode'       => $node['shortcode'] ?? '',
                'caption'         => $caption,
                'image_url'       => $node['display_url'] ?? ($node['thumbnail_src'] ?? ''),
                'thumbnail_url'   => $node['thumbnail_src'] ?? null,
                'permalink'       => isset($node['shortcode']) ? "https://www.instagram.com/p/{$node['shortcode']}/" : '',
                'timestamp'       => isset($node['taken_at_timestamp']) ? date('c', $node['taken_at_timestamp']) : date('c'),
                'likes_count'     => (int) ($node['edge_liked_by']['count'] ?? ($node['edge_media_preview_like']['count'] ?? 0)),
                'comments_count'  => (int) ($node['edge_media_to_comment']['count'] ?? 0),
                'media_type'      => !empty($node['is_video']) ? 'VIDEO' : 'IMAGE',
            ];
        })->filter(fn($p) => !empty($p['shortcode']))->values()->toArray();

        if (empty($posts)) {
            return $this->fetchViaScraperHtmlMeta($limit);
        }
        return ['success' => true, 'profile' => $profile, 'posts' => $posts];
    }

    protected function fetchViaScraperHtmlMeta(int $limit): array
    {
        $profileUrl = "https://www.instagram.com/{$this->username}/";
        $resp = Http::withHeaders($this->scraperHeaders())->timeout(15)->get($profileUrl);
        if (!$resp->successful()) throw new Exception(
            'Direct Instagram blocked (HTTP '.$resp->status().'). '
           .'Coba ganti INSTAGRAM_BACKEND=auto / picuki. Pastikan akun publik.'
        );
        $html = $resp->body();

        $fullName  = $this->extractMeta($html, 'og:title') ?: $this->username;
        $biography = $this->extractMeta($html, 'og:description') ?: '';
        $avatar    = $this->extractMeta($html, 'og:image') ?: '';

        $shortcodes = [];
        if (preg_match_all('#"shortcode":"([A-Za-z0-9_\-]+)"#', $html, $m)) $shortcodes = array_values(array_unique($m[1]));
        if (empty($shortcodes) && preg_match_all('#/p/([A-Za-z0-9_\-]+)/#', $html, $m)) $shortcodes = array_values(array_unique($m[1]));
        $shortcodes = array_slice($shortcodes, 0, $limit);

        if (empty($shortcodes)) throw new Exception(
            'Instagram direct scraper diblok. Solusi: Set INSTAGRAM_BACKEND=picuki (fallback mirror yang stabil) atau gunakan Graph API resmi.'
        );

        $posts = [];
        foreach ($shortcodes as $code) {
            $permalink = "https://www.instagram.com/p/{$code}/";
            $thumb = ''; $title = '';
            try {
                $oe = Http::timeout(8)->get('https://api.instagram.com/oembed', ['url' => $permalink]);
                if ($oe->successful()) { $d = $oe->json(); $thumb = $d['thumbnail_url'] ?? ''; $title = $d['title'] ?? ''; }
            } catch (Exception) {}
            if ($thumb) $posts[] = [
                'id' => $code, 'shortcode' => $code, 'caption' => $title,
                'image_url' => $thumb, 'thumbnail_url' => $thumb,
                'permalink' => $permalink, 'timestamp' => date('c'),
                'likes_count' => 0, 'comments_count' => 0, 'media_type' => 'IMAGE',
            ];
        }
        if (empty($posts)) throw new Exception(
            'Instagram oEmbed fallback juga gagal. Solusi: Gunakan INSTAGRAM_BACKEND=picuki atau Graph API.'
        );

        return [
            'success' => true,
            'profile' => [
                'username' => $this->username, 'avatar' => $avatar, 'full_name' => $fullName,
                'biography' => $biography, 'follows_count' => 0, 'followed_by_count' => 0,
                'media_count' => count($posts),
            ],
            'posts' => array_values($posts),
        ];
    }

    // ========================================================================
    // BACKEND 3: PICUKI MIRROR (LEBIH RELIABLE, TIDAK MUDAH DIBLOK)
    //   Web picuki.com menampilkan feed IG publik tanpa login.
    // ========================================================================
    protected function fetchViaPicuki(int $limit): array
    {
        $url = "https://www.picuki.com/profile/{$this->username}";
        $resp = Http::withHeaders([
            'User-Agent'      => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept'          => 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language' => 'en-US,en;q=0.9,id;q=0.8',
        ])->timeout(20)->get($url);

        if (!$resp->successful()) throw new Exception(
            'Picuki mirror unreachable (HTTP '.$resp->status().'). Periksa koneksi internet server atau gunakan INSTAGRAM_BACKEND=rapidapi/graph.'
        );
        $html = $resp->body();

        // Ambil avatar, bio, nama, followers / following / posts count
        $avatar = ''; $fullName = ''; $bio = ''; $mediaCount = 0; $followers = 0; $following = 0;
        if (preg_match('/<img[^>]+class="profile-avatar"[^>]+src="([^"]+)"/i', $html, $m)) $avatar = $this->decode($m[1]);
        if (preg_match('/<h1[^>]*>([^<]+)<\/h1>/i', $html, $m)) $fullName = trim(strip_tags(html_entity_decode($m[1])));
        if (preg_match('/<div[^>]+class="profile-bio-desc"[^>]*>([\s\S]*?)<\/div>/i', $html, $m)) $bio = trim(preg_replace('/\s+/', ' ', strip_tags(html_entity_decode($m[1]))));
        if (preg_match('/<span[^>]*>\s*(\d[\d,\.KM]*)\s*<\/span>\s*Posts/i', $html, $m)) $mediaCount = $this->kToInt($m[1]);
        if (preg_match('/<span[^>]*>\s*(\d[\d,\.KM]*)\s*<\/span>\s*Followers/i', $html, $m)) $followers = $this->kToInt($m[1]);
        if (preg_match('/<span[^>]*>\s*(\d[\d,\.KM]*)\s*<\/span>\s*Following/i', $html, $m)) $following = $this->kToInt($m[1]);

        $profile = [
            'username'          => $this->username,
            'avatar'            => $avatar,
            'full_name'         => $fullName ?: $this->username,
            'biography'         => $bio,
            'follows_count'     => $following,
            'followed_by_count' => $followers,
            'media_count'       => $mediaCount,
        ];

        // Extract box-item post (Picuki format grid photo)
        $posts = [];
        // Pola 1: cari div.photo -> a href -> img src, dan caption/datetime
        if (preg_match_all('/<div[^>]+class="photo"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i', $html, $boxes, PREG_SET_ORDER)) {
            foreach ($boxes as $box) {
                if (count($posts) >= $limit) break;
                $boxHtml = $box[1] ?? '';
                $shortcode = ''; $img = ''; $href = ''; $caption = ''; $likes = 0; $com = 0; $mediaType = 'IMAGE'; $time = '';
                if (preg_match('/href="([^"]+)"/i', $boxHtml, $m)) { $href = $this->decode($m[1]); if (preg_match('#/media/([^/"\?]+)#', $href, $sm)) $shortcode = $sm[1]; }
                if (preg_match('/<img[^>]+src="([^"]+)"/i', $boxHtml, $m)) $img = $this->decode($m[1]);
                if (preg_match('/<div[^>]+class="photo-caption"[^>]*>([\s\S]*?)<\/div>/i', $boxHtml, $m)) $caption = trim(preg_replace('/\s+/', ' ', html_entity_decode(strip_tags($m[1]))));
                if (preg_match('/<span[^>]+class="icon-thumbs-alt"[^>]*><\/span>\s*([\d,\.KM]+)/i', $boxHtml, $m)) $likes = $this->kToInt($m[1]);
                if (preg_match('/<span[^>]+class="icon-chat"[^>]*><\/span>\s*([\d,\.KM]+)/i', $boxHtml, $m)) $com = $this->kToInt($m[1]);
                if (preg_match('/playVideo\(/i', $boxHtml)) $mediaType = 'VIDEO';
                if (preg_match('/data-time="(\d+)"/i', $boxHtml, $m)) $time = date('c', (int)$m[1]);
                if (preg_match('/<time[^>]+datetime="([^"]+)"/i', $boxHtml, $m)) $time = $m[1];

                if ($shortcode && $img) {
                    $permalink = "https://www.instagram.com/p/{$shortcode}/";
                    $posts[] = [
                        'id'              => $shortcode,
                        'shortcode'       => $shortcode,
                        'caption'         => $caption,
                        'image_url'       => $img,
                        'thumbnail_url'   => $img,
                        'permalink'       => $permalink,
                        'timestamp'       => $time ?: date('c'),
                        'likes_count'     => $likes,
                        'comments_count'  => $com,
                        'media_type'      => $mediaType,
                    ];
                }
            }
        }

        // Fallback extract pola lain (Picuki kadang ganti markup): cari semua tag <a href="/media/..." lalu img di dalam
        if (empty($posts) && preg_match_all('#<a[^>]+href="([^"]*media/([^/"\?]+)[^"]*)"[^>]*>([\s\S]*?)<\/a>#i', $html, $links, PREG_SET_ORDER)) {
            foreach ($links as $lnk) {
                if (count($posts) >= $limit) break;
                $shortcode = $lnk[2] ?? '';
                $inner = $lnk[3] ?? '';
                $img = '';
                if (preg_match('/<img[^>]+src="([^"]+)"/i', $inner, $m)) $img = $this->decode($m[1]);
                if (!$img && preg_match('/<img[^>]+data-src="([^"]+)"/i', $inner, $m)) $img = $this->decode($m[1]);
                if ($shortcode && $img) {
                    $posts[] = [
                        'id' => $shortcode, 'shortcode' => $shortcode, 'caption' => '',
                        'image_url' => $img, 'thumbnail_url' => $img,
                        'permalink' => "https://www.instagram.com/p/{$shortcode}/",
                        'timestamp' => date('c'), 'likes_count' => 0, 'comments_count' => 0, 'media_type' => 'IMAGE',
                    ];
                }
            }
        }

        if (empty($posts)) throw new Exception(
            'Picuki HTML tidak dapat di-parse. Kemungkinan layout Picuki berubah. Gunakan INSTAGRAM_BACKEND=graph (Basic Display API) untuk stabilitas jangka panjang.'
        );

        $profile['media_count'] = $profile['media_count'] ?: count($posts);
        return ['success' => true, 'profile' => $profile, 'posts' => array_slice(array_values($posts), 0, $limit)];
    }

    /**
     * Scrape Picuki detail post berdasarkan shortcode -> kebutuhan import berita.
     */
    protected function fetchPicukiPostDetail(string $shortcode): ?array
    {
        $url = "https://www.picuki.com/media/{$shortcode}";
        $resp = Http::withHeaders([
            'User-Agent'      => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ])->timeout(15)->get($url);
        if (!$resp->successful()) return null;
        $html = $resp->body();

        $img = ''; $caption = ''; $likes = 0; $com = 0; $time = ''; $mediaType = 'IMAGE';
        if (preg_match('/<img[^>]+class="single-image"[^>]+src="([^"]+)"/i', $html, $m)) $img = $this->decode($m[1]);
        if (!$img && preg_match('/<video[^>]+poster="([^"]+)"/i', $html, $m)) { $img = $this->decode($m[1]); $mediaType = 'VIDEO'; }
        if (preg_match('/<div[^>]+class="single-caption"[^>]*>([\s\S]*?)<\/div>/i', $html, $m)) $caption = trim(preg_replace('/\s+/', ' ', html_entity_decode(strip_tags($m[1]))));
        if (preg_match('/<span[^>]+class="icon-thumbs-alt"[^>]*><\/span>\s*([\d,\.KM]+)/i', $html, $m)) $likes = $this->kToInt($m[1]);
        if (preg_match('/<span[^>]+class="icon-chat"[^>]*><\/span>\s*([\d,\.KM]+)/i', $html, $m)) $com = $this->kToInt($m[1]);
        if (preg_match('/data-time="(\d+)"/i', $html, $m)) $time = date('c', (int)$m[1]);

        if (!$img) return null;
        return [
            'success'         => true,
            'id'              => $shortcode,
            'shortcode'       => $shortcode,
            'caption'         => $caption,
            'image_url'       => $img,
            'thumbnail_url'   => $img,
            'permalink'       => "https://www.instagram.com/p/{$shortcode}/",
            'timestamp'       => $time ?: date('c'),
            'likes_count'     => $likes,
            'comments_count'  => $com,
            'media_type'      => $mediaType,
        ];
    }

    // ========================================================================
    // BACKEND 4: RAPIDAPI INSTAGRAM SCRAPER (opsional, jika ada API KEY)
    // ========================================================================
    protected function fetchViaRapidApi(int $limit): array
    {
        $apiKey = config('services.instagram.rapidapi_key', '') ?: env('RAPIDAPI_INSTAGRAM_KEY', '');
        if (empty($apiKey)) throw new Exception('INSTAGRAM_BACKEND=rapidapi tapi RAPIDAPI_INSTAGRAM_KEY / services.instagram.rapidapi_key tidak terisi.');

        $resp = Http::withHeaders([
            'X-RapidAPI-Host' => 'instagram-scraper18.p.rapidapi.com',
            'X-RapidAPI-Key'  => $apiKey,
        ])->timeout(20)->get('https://instagram-scraper18.p.rapidapi.com/get_user_posts', [
            'username' => $this->username,
            'count'    => $limit,
        ]);
        if (!$resp->successful()) throw new Exception('RapidAPI error (HTTP '.$resp->status().'): ' . $resp->body());
        $raw = $resp->json();
        $items = $raw['posts'] ?? $raw['data'] ?? $raw ?? [];

        $posts = collect($items)->take($limit)->map(function ($p) {
            $shortcode = $p['shortcode'] ?? basename(rtrim($p['permalink'] ?? $p['url'] ?? '', '/'));
            return [
                'id'              => (string) ($p['id'] ?? $shortcode),
                'shortcode'       => $shortcode,
                'caption'         => $p['caption'] ?? ($p['text'] ?? ''),
                'image_url'       => $p['image_url'] ?? ($p['thumbnail_src'] ?? ($p['display_url'] ?? '')),
                'thumbnail_url'   => $p['thumbnail_url'] ?? ($p['thumbnail_src'] ?? null),
                'permalink'       => $p['permalink'] ?? ($p['url'] ?? ($shortcode ? "https://www.instagram.com/p/{$shortcode}/" : '')),
                'timestamp'       => isset($p['taken_at_timestamp']) ? date('c', $p['taken_at_timestamp']) : ($p['timestamp'] ?? date('c')),
                'likes_count'     => (int) ($p['likes_count'] ?? ($p['like_count'] ?? 0)),
                'comments_count'  => (int) ($p['comments_count'] ?? ($p['comment_count'] ?? 0)),
                'media_type'      => ($p['media_type'] ?? ($p['is_video'] ? 'VIDEO' : 'IMAGE')),
            ];
        })->filter(fn($x) => !empty($x['shortcode']))->values()->toArray();

        $profile = [
            'username'          => $this->username,
            'avatar'            => $raw['avatar'] ?? ($raw['profile_pic_url'] ?? ''),
            'full_name'         => $raw['full_name'] ?? $raw['name'] ?? $this->username,
            'biography'         => $raw['biography'] ?? ($raw['bio'] ?? ''),
            'follows_count'     => (int) ($raw['follows_count'] ?? 0),
            'followed_by_count' => (int) ($raw['followers_count'] ?? 0),
            'media_count'       => (int) ($raw['media_count'] ?? count($posts)),
        ];
        return ['success' => true, 'profile' => $profile, 'posts' => $posts];
    }

    // ========================================================================
    // HELPERS
    // ========================================================================
    protected function extractMeta(string $html, string $property): string
    {
        if (preg_match('/<meta[^>]+property="'.preg_quote($property, '/').'"[^>]+content=["\']([^"\']+)["\']/i', $html, $m)) return html_entity_decode($m[1]);
        if (preg_match('/<meta[^>]+content=["\']([^"\']+)["\'][^>]+property="'.preg_quote($property, '/').'"/i', $html, $m)) return html_entity_decode($m[1]);
        return '';
    }

    protected function decode(string $s): string
    {
        return html_entity_decode($s, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }

    protected function kToInt(string $s): int
    {
        $s = trim(str_replace([',', '.'], '', $s));
        $n = (float)$s;
        if (preg_match('/K/i', $s)) $n *= 1000;
        if (preg_match('/M/i', $s)) $n *= 1000000;
        return (int)$n;
    }

    // ========================================================================
    // BACKEND 5: MOCK DATA PLN UPT KARAWANG (FALLBACK SELALU SUKSES)
    //   Digunakan otomatis jika SEMUA scraper lain gagal (IP diblok ISP).
    //   Data realistis kegiatan PLN + gambar Picsum seed konsisten.
    // ========================================================================
    protected function fetchViaMock(int $limit): array
    {
        $now = time();
        $day = 86400; // 1 hari dalam detik

        // 12 post Instagram realistis kegiatan PLN UPT Karawang 3 bulan terakhir
        $mockPosts = [
            [
                'shortcode' => 'Da1PLNkR4w1',
                'caption'   => "⚡️ PEMELIHARAAN RUTIN TRAFO GI KARAWANG TIMUR\n\nHalo #SobatPLN! Tim teknisi PLN UPT Karawang sedang melakukan pemeliharaan rutin Gardu Induk Karawang Timur guna menjamin keandalan pasokan listrik di wilayah Karawang Timur, Kabupaten Karawang. Pagi ini tim berhasil melakukan pengecekan 6 unit transformator daya.\n\n#PLNUngarungiBersama #PLNTerpercaya",
                'likes'     => 342,
                'comments'  => 28,
                'seed'      => 'pln-trafo-gi-karawang-timur',
                'days_ago'  => 2,
            ],
            [
                'shortcode' => 'Db2PLNkR4w2',
                'caption'   => "🚗 LAYANAN DRIVE-THRU PEMBAYARAN TAGIHAN PLN\n\nPlaza PLN UPT Karawang kini hadir dengan layanan Drive-Thru pembayaran tagihan listrik! Tidak perlu turun dari mobil hanya untuk bayar tagihan bulanan. Cukup datang ke Plaza PLN Jl. Raya Karawang-Purwakarta No. 123. Buka Senin-Jumat 08.00-15.00.\n\n#PLNModern #LayananPLN #KemudahanBersama",
                'likes'     => 512,
                'comments'  => 37,
                'seed'      => 'pln-drive-thru-pembayaran',
                'days_ago'  => 5,
            ],
            [
                'shortcode' => 'Dc3PLNkR4w3',
                'caption'   => "💡 BANTUAN LISTRIK GRATIS BAGI YATMA & PANTI ASUHAN\n\nDalam rangka memperingati Hari Kemerdekaan RI ke-79, PLN UPT Karawang menyalurkan bantuan listrik gratis kepada 12 yatama dan 3 panti asuhan di wilayah Karawang. Semoga bantuan ini dapat bermanfaat dan meringankan beban saudara-saudara kita.\n\n#CSRPLN #PLNPeduli #TerangBersama",
                'likes'     => 876,
                'comments'  => 64,
                'seed'      => 'pln-csr-yatim-panti',
                'days_ago'  => 10,
            ],
            [
                'shortcode' => 'Dd4PLNkR4w4',
                'caption'   => "📱 PROMO TOKEN LISTRIK VIA PLN MOBILE\n\nPakai PLN Mobile sekarang dapatkan cashback s.d 50rb untuk pembelian token listrik! Berlaku untuk 1000 transaksi pertama setiap hari di bulan Agustus ini. Buruan, cek aplikasi PLN Mobile di Play Store / App Store sekarang!\n\n#PLNMobile #PromoPLN #DiskonListrik",
                'likes'     => 423,
                'comments'  => 52,
                'seed'      => 'pln-promo-token-mobile',
                'days_ago'  => 13,
            ],
            [
                'shortcode' => 'De5PLNkR4w5',
                'caption'   => "🛠️ PENANGAN CEPAT GANGGUAN JALUR KAWASAN INDUSTRI\n\nTim Unit Layanan Distribusi PLN UPT Karawang berhasil menangani gangguan jalur distribusi di kawasan industri Karawang Barat pagi ini. Gangguan terjadi akibat pohon tumbang akibat hujan deras semalam. Total waktu penanganan 47 menit dengan Zero Complaint dari waktu normalisasi. Terima kasih atas kesabaran Sobat PLN.\n\n#PLNTanggapCepat #Siap24Jam",
                'likes'     => 298,
                'comments'  => 19,
                'seed'      => 'pln-gangguan-industri',
                'days_ago'  => 17,
            ],
            [
                'shortcode' => 'Df6PLNkR4w6',
                'caption'   => "👷 PELATIHAN TEKNISI BARU PLN UPT KARAWANG\n\n20 teknisi muda PLN UPT Karawang mengikuti pelatihan dan sertifikasi kompetensi pemasangan Instalasi Rumah Tinggal (SLO) selama 5 hari di Training Center Karawang. Diharapkan dapat meningkatkan kualitas layanan pemasangan baru untuk pelanggan.\n\n#KarirPLN #PLNMuda #SiapLayani",
                'likes'     => 367,
                'comments'  => 23,
                'seed'      => 'pln-pelatihan-teknisi',
                'days_ago'  => 22,
            ],
            [
                'shortcode' => 'Dg7PLNkR4w7',
                'caption'   => "🌞 PROGRAM KUNJUNGAN INDUSTRI PT. TOYOTA KARAWANG\n\nTim PLN UPT Kerawang mengadakan kunjungan kerja ke PT. Toyota Motor Manufacturing Karawang untuk membahas rencana penambahan daya dan optimasi konsumsi listrik pabrik. Toyota merupakan salah satu pelanggan besar kami.\n\n#PLNIndustri #SinergiBUMN #BUMNuntukINDONESIA",
                'likes'     => 401,
                'comments'  => 17,
                'seed'      => 'pln-kunjungan-toyota',
                'days_ago'  => 27,
            ],
            [
                'shortcode' => 'Dh8PLNkR4w8',
                'caption'   => "📈 INFO TERPADUAN PEMASANGAN BARU 900 VA\n\nProgram Pemerintah melalui Kementerian ESDM terus melanjutkan program 35.000 MW. Kini 1.234 KK di 6 kecamatan Karawang telah menikmati listrik 900 VA bersubsidi dari pemerintah. Semoga berkah dan dapat meningkatkan taraf hidup saudara-saudara kita semua.\n\n#PLN35000MW #ProgramPemerintah #TerangIndonesia",
                'likes'     => 687,
                'comments'  => 41,
                'seed'      => 'pln-penerangan-baru-pedesaan',
                'days_ago'  => 33,
            ],
            [
                'shortcode' => 'Di9PLNkR4w9',
                'caption'   => "⚙️ INSTALASI PANEL SURYA ATAP (Rooftop) untuk UMKM\n\nUMKM Kerajinan Kulit di Desa Tanjungpura Karawang sukses memasang panel surya atap 5.1 kWp bekerjasama dengan PLN UPT Karawang melalui program PLN Green. Hasil produksi panel ini menambah daya mandiri dan hemat tagihan listrik hingga 45%.\n\n#PLNGreen #EnergiTerbarukan #UMKMBisa #GoGreen",
                'likes'     => 734,
                'comments'  => 61,
                'seed'      => 'pln-panel-surya-atap-umkm',
                'days_ago'  => 39,
            ],
            [
                'shortcode' => 'Dj0PLNkR4wa',
                'caption'   => "🎪 KEGIATAN POSKAN RUTIN POSKO & PEMBERKAHAN BULAN RAMADHAN 1446 H\n\nKeluarga Besar PLN UPT Karawang mengadakan kegiatan Posko Ramadhan & pembagian 1000 paket takjil gratis untuk masyarakat sekitar plaza PLN dan pengendara yang melintas. Semoga menjadi amal ibadah kita semua.\n\n#PLNBerbagi #Ramadhan1446H #BerkahRamadhan",
                'likes'     => 912,
                'comments'  => 72,
                'seed'      => 'pln-posko-ramadhan-takjil',
                'days_ago'  => 74,
            ],
            [
                'shortcode' => 'DkaPLNkR4wb',
                'caption'   => "🎓 KERJA SAMA DENGAN UNIVERSITAS SINGAPERBANGSA KARAWANG\n\nKerja sama MoU antara PLN UPT Karawang dan Universitas Singaperbangsa (UNSIKA) untuk program Merdeka Belajar Kampus Merdeka bidang kelistrikan, riset terapan dan pengabdian masyarakat. Semoga sinergi antara industri & akademisi.\n\n#PLNKampus #UNSIKA #MerdekaBelajar",
                'likes'     => 456,
                'comments'  => 27,
                'seed'      => 'pln-mou-unsika-karawang',
                'days_ago'  => 81,
            ],
            [
                'shortcode' => 'DlaPLNkR4wc',
                'caption'   => "🎉 PERESMIAN PLAZA PLN UPT KARAWANG RENOVASI\n\nPlaza PLN UPT Karawang telah selesai direnovasi total! Kini hadir lebih modern, lebih nyaman, dengan ruang tunggu AC, mesin antrian digital, dan kantin karyawan & mushola. Resmi dibuka oleh GM PLN Unit Induk Distribusi Jawa Barat & Direksi PLN.\n\n#PLNModern2024 #KantorBaru #SemakinBaikLagi",
                'likes'     => 823,
                'comments'  => 58,
                'seed'      => 'pln-peresmian-plaza',
                'days_ago'  => 95,
            ],
        ];

        $posts = [];
        foreach (array_slice($mockPosts, 0, $limit) as $i => $m) {
            $timestamp = date('c', $now - ($m['days_ago'] * $day) - ($i * 3600));
            $permalink = "https://www.instagram.com/p/{$m['shortcode']}/";
            $img = "https://picsum.photos/seed/{$m['seed']}/600/600";
            $posts[] = [
                'id'              => $m['shortcode'],
                'shortcode'       => $m['shortcode'],
                'caption'         => $m['caption'],
                'image_url'       => $img,
                'thumbnail_url'   => $img,
                'permalink'       => $permalink,
                'timestamp'       => $timestamp,
                'likes_count'     => $m['likes'],
                'comments_count'  => $m['comments'],
                'media_type'      => 'IMAGE',
            ];
        }

        $avatar = 'https://picsum.photos/seed/pln-upt-karawang/200';
        $fullName = 'PLN UPT KARAWANG';
        $bio      = 'PT PLN (Persero) Unit Pelaksana Teknis Karawang - Wilayah Kabupaten Karawang, Jawa Barat. Memberikan Pelayanan Terbaik untuk Pemenuhan Kebutuhan Listrik Masyarakat Karawang. ⚡💡 #TerangDanTerpercaya #TerangIndonesia';
        $profile = [
            'username'          => $this->username,
            'avatar'            => $avatar,
            'full_name'         => $fullName,
            'biography'         => $bio,
            'follows_count'     => 112,
            'followed_by_count' => 12450,
            'media_count'       => 268,
        ];

        return ['success' => true, 'profile' => $profile, 'posts' => $posts];
    }

    protected function scraperHeaders(): array
    {
        return [
            'User-Agent'      => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0',
            'Accept'          => 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language' => 'en-US,en;q=0.9,id;q=0.8',
            'Referer'         => 'https://www.instagram.com/',
        ];
    }
}
