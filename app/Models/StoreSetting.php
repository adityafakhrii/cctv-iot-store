<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class StoreSetting extends Model
{
    protected $fillable = [
        'key',
        'value',
    ];

    /**
     * Default fallback values for store settings.
     */
    public static function defaults(): array
    {
        return [
            'store_name' => 'Dodolan Store',
            'company_name' => 'PT Dodolan Teknologi Nusantara',
            'store_phone' => '+62 811 5000 3775',
            'store_whatsapp' => '081150003775',
            'store_email' => 'halo@dodolan.store',
            'store_address' => 'Komp. Fantasy Junction Blok FJ4 No. 15',
            'store_city' => 'Balikpapan, Kalimantan Timur, Indonesia',
            'store_postal_code' => '76114',
            'operating_hours' => 'Senin – Sabtu: 08.00 – 17.00 WIB',
            'announcement_bar' => 'Promo Spesial: Diskon Hardware IoT & Gratis Biaya Survey Armada di Kalimantan Timur',
            'announcement_link' => '/produk',
            'announcement_active' => '1',
            'store_gmaps_embed' => 'https://maps.google.com/maps?q=Balikpapan%2C%20Kalimantan%20Timur&t=&z=14&ie=UTF8&iwloc=&output=embed',
        ];
    }

    /**
     * Get all store settings as key-value array with caching and default fallbacks.
     */
    public static function getAll(): array
    {
        return Cache::rememberForever('store_settings_cache', function () {
            $defaults = static::defaults();
            try {
                $dbSettings = static::pluck('value', 'key')->toArray();
                return array_merge($defaults, $dbSettings);
            } catch (\Throwable $e) {
                return $defaults;
            }
        });
    }

    /**
     * Get a specific setting value.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        $all = static::getAll();
        return $all[$key] ?? $default;
    }

    /**
     * Update or insert a setting value and clear cache.
     */
    public static function set(string $key, ?string $value): void
    {
        if ($key === 'store_gmaps_embed' && ! empty($value)) {
            $value = static::convertToEmbedUrl((string) $value);
        }

        static::updateOrCreate(
            ['key' => $key],
            ['value' => $value]
        );
        Cache::forget('store_settings_cache');
    }

    /**
     * Save multiple settings at once and clear cache.
     */
    public static function setMany(array $settings): void
    {
        foreach ($settings as $key => $value) {
            if ($key === 'store_gmaps_embed' && ! empty($value)) {
                $value = static::convertToEmbedUrl((string) $value);
            }

            static::updateOrCreate(
                ['key' => $key],
                ['value' => is_bool($value) ? ($value ? '1' : '0') : $value]
            );
        }
        Cache::forget('store_settings_cache');
    }

    /**
     * Convert any Google Maps link (shortlink maps.app.goo.gl, iframe code, place URL, or coordinates)
     * into a valid embeddable Google Maps iframe URL.
     */
    public static function convertToEmbedUrl(?string $url): ?string
    {
        if (empty($url)) {
            return null;
        }

        $url = trim($url);

        // 1. If full iframe tag was pasted, extract src attribute
        if (preg_match('/src=["\']([^"\']+)["\']/i', $url, $m)) {
            $url = $m[1];
        }

        // 2. If shortlink (maps.app.goo.gl or goo.gl/maps), resolve redirect destination
        if (str_contains($url, 'maps.app.goo.gl') || str_contains($url, 'goo.gl/maps')) {
            try {
                $response = \Illuminate\Support\Facades\Http::timeout(6)
                    ->withUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')
                    ->withoutRedirecting()
                    ->get($url);

                $redirect = $response->header('Location');
                if ($redirect) {
                    $url = $redirect;
                }
            } catch (\Throwable $e) {
                // Ignore network error and continue parsing URL
            }
        }

        // 3. If already embed format
        if (str_contains($url, 'output=embed') || str_contains($url, '/maps/embed')) {
            return $url;
        }

        // 4. If URL has place coordinates (!3d... and !4d...)
        if (preg_match('/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/', $url, $coord)) {
            $lat = $coord[1];
            $lng = $coord[2];
            if (preg_match('/\/place\/([^\/@?#]+)/', $url, $placeMatch)) {
                $placeName = urldecode(str_replace('+', ' ', $placeMatch[1]));
                return "https://maps.google.com/maps?q=" . urlencode($placeName) . "&ll={$lat},{$lng}&z=17&output=embed";
            }
            return "https://maps.google.com/maps?q={$lat},{$lng}&z=17&output=embed";
        }

        // 5. If URL has @lat,lng
        if (preg_match('/@(-?\d+\.\d+),(-?\d+\.\d+)/', $url, $coord)) {
            $lat = $coord[1];
            $lng = $coord[2];
            if (preg_match('/\/place\/([^\/@?#]+)/', $url, $placeMatch)) {
                $placeName = urldecode(str_replace('+', ' ', $placeMatch[1]));
                return "https://maps.google.com/maps?q=" . urlencode($placeName) . "&ll={$lat},{$lng}&z=17&output=embed";
            }
            return "https://maps.google.com/maps?q={$lat},{$lng}&z=17&output=embed";
        }

        // 6. If URL has /place/Place+Name
        if (preg_match('/\/place\/([^\/@?#]+)/', $url, $placeMatch)) {
            $placeName = urldecode(str_replace('+', ' ', $placeMatch[1]));
            return "https://maps.google.com/maps?q=" . urlencode($placeName) . "&z=16&output=embed";
        }

        // 7. If standard query ?q=...
        $parsed = parse_url($url);
        if (!empty($parsed['query'])) {
            parse_str($parsed['query'], $queryParams);
            if (!empty($queryParams['q'])) {
                return "https://maps.google.com/maps?q=" . urlencode($queryParams['q']) . "&z=16&output=embed";
            }
        }

        return $url;
    }
}
