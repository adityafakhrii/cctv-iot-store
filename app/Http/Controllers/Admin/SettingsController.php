<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\PasswordUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\StoreSetting;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    /**
     * Display admin profile & security settings.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('admin/settings', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
            ],
            'passwordRules' => Password::defaults()->toPasswordRulesString(),
            'storeSettings' => StoreSetting::getAll(),
        ]);
    }

    /**
     * Update admin profile information.
     */
    public function updateProfile(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:30'],
        ]);

        $user->update($validated);

        return back()->with('success', 'Profil Administrator berhasil diperbarui.');
    }

    /**
     * Update admin password.
     */
    public function updatePassword(PasswordUpdateRequest $request): RedirectResponse
    {
        $request->user()->update([
            'password' => Hash::make($request->password),
        ]);

        return back()->with('success', 'Kata sandi Administrator berhasil diperbarui.');
    }

    /**
     * Update store settings.
     */
    public function updateStore(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'store_name' => ['required', 'string', 'max:100'],
            'company_name' => ['required', 'string', 'max:150'],
            'store_phone' => ['nullable', 'string', 'max:40'],
            'store_whatsapp' => ['required', 'string', 'max:40'],
            'store_email' => ['required', 'email', 'max:100'],
            'store_address' => ['required', 'string', 'max:255'],
            'store_city' => ['required', 'string', 'max:100'],
            'store_postal_code' => ['nullable', 'string', 'max:20'],
            'operating_hours' => ['required', 'string', 'max:100'],
            'announcement_bar' => ['nullable', 'string', 'max:255'],
            'announcement_link' => ['nullable', 'string', 'max:255'],
            'announcement_active' => ['nullable'],
            'store_gmaps_embed' => ['nullable', 'string'],
        ]);

        $validated['announcement_active'] = $request->boolean('announcement_active') ? '1' : '0';

        if (! empty($validated['store_gmaps_embed'])) {
            // If user pastes full <iframe src="..."> code, extract the clean src URL
            if (preg_match('/src=["\']([^"\']+)["\']/', $validated['store_gmaps_embed'], $matches)) {
                $validated['store_gmaps_embed'] = $matches[1];
            }
        }

        StoreSetting::setMany($validated);

        return back()->with('success', 'Pengaturan informasi toko berhasil diperbarui.');
    }

    /**
     * Resolve any Google Maps link (including shortlinks like maps.app.goo.gl) to an embed URL.
     */
    public function resolveMap(Request $request): \Illuminate\Http\JsonResponse
    {
        $url = (string) $request->input('url', '');
        $embedUrl = StoreSetting::convertToEmbedUrl($url);

        return response()->json([
            'embed_url' => $embedUrl,
        ]);
    }
}

