<?php

namespace Tests\Feature;

use App\Models\StoreSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StoreSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_settings_or_update_store(): void
    {
        $response = $this->get('/admin/settings');
        $response->assertRedirect('/login');

        $patchResponse = $this->patch('/admin/settings/store', [
            'store_name' => 'Toko Baru',
        ]);
        $patchResponse->assertRedirect('/login');
    }

    public function test_customer_cannot_update_store_settings(): void
    {
        $customer = User::factory()->create([
            'is_admin' => false,
        ]);

        $response = $this->actingAs($customer)->patch('/admin/settings/store', [
            'store_name' => 'Toko Palsu',
            'company_name' => 'PT Hacking Berjaya',
            'store_whatsapp' => '081122334455',
            'store_email' => 'hacked@dodolan.store',
            'store_address' => 'Jl. Anonim No. 1',
            'store_city' => 'Jakarta',
            'operating_hours' => '24 Jam',
        ]);

        $response->assertForbidden();
    }

    public function test_admin_can_view_settings_with_store_settings(): void
    {
        $admin = User::factory()->create([
            'is_admin' => true,
        ]);

        $response = $this->actingAs($admin)->get('/admin/settings');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('admin/settings')
            ->has('storeSettings')
            ->where('storeSettings.store_name', 'Dodolan Store')
        );
    }

    public function test_admin_can_update_store_settings(): void
    {
        $admin = User::factory()->create([
            'is_admin' => true,
        ]);

        $payload = [
            'store_name' => 'Dodolan IoT Hub',
            'company_name' => 'PT Dodolan Inovasi Kalimantan',
            'store_phone' => '+62 542 888999',
            'store_whatsapp' => '081199998888',
            'store_email' => 'support@dodolaniot.id',
            'store_address' => 'Jl. Jenderal Sudirman No. 88',
            'store_city' => 'Balikpapan, Kalimantan Timur',
            'store_postal_code' => '76115',
            'operating_hours' => 'Senin – Minggu: 07.00 – 21.00 WITA',
            'announcement_bar' => 'Flash Sale Sensor IoT & GPS Tracker 50% Off!',
            'announcement_link' => '/promo-khusus',
            'announcement_active' => true,
        ];

        $response = $this->actingAs($admin)
            ->from('/admin/settings')
            ->patch('/admin/settings/store', $payload);

        $response->assertRedirect('/admin/settings');
        $response->assertSessionHas('success');

        // Verify in database
        $this->assertDatabaseHas('store_settings', [
            'key' => 'store_name',
            'value' => 'Dodolan IoT Hub',
        ]);
        $this->assertDatabaseHas('store_settings', [
            'key' => 'store_whatsapp',
            'value' => '081199998888',
        ]);
        $this->assertDatabaseHas('store_settings', [
            'key' => 'announcement_active',
            'value' => '1',
        ]);

        // Verify model cache reflection
        $this->assertEquals('Dodolan IoT Hub', StoreSetting::get('store_name'));
        $this->assertEquals('081199998888', StoreSetting::get('store_whatsapp'));
    }

    public function test_admin_can_update_gmaps_embed_and_extract_iframe_src(): void
    {
        $admin = User::factory()->create([
            'is_admin' => true,
        ]);

        $iframeInput = '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12345" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>';

        $payload = [
            'store_name' => 'Dodolan Store',
            'company_name' => 'PT Dodolan Teknologi Nusantara',
            'store_phone' => '+62 811 5000 3775',
            'store_whatsapp' => '081150003775',
            'store_email' => 'halo@dodolan.store',
            'store_address' => 'Komp. Fantasy Junction Blok FJ4 No. 15',
            'store_city' => 'Balikpapan, Kalimantan Timur, Indonesia',
            'store_postal_code' => '76114',
            'operating_hours' => 'Senin – Sabtu: 08.00 – 17.00 WIB',
            'store_gmaps_embed' => $iframeInput,
        ];

        $response = $this->actingAs($admin)
            ->from('/admin/settings')
            ->patch('/admin/settings/store', $payload);

        $response->assertRedirect('/admin/settings');

        // Verify that the iframe src was extracted and saved
        $this->assertDatabaseHas('store_settings', [
            'key' => 'store_gmaps_embed',
            'value' => 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12345',
        ]);
        $this->assertEquals('https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12345', StoreSetting::get('store_gmaps_embed'));
    }

    public function test_admin_can_resolve_gmaps_shortlink_endpoint(): void
    {
        $admin = User::factory()->create([
            'is_admin' => true,
        ]);

        $response = $this->actingAs($admin)->getJson('/admin/settings/resolve-map?url=https://maps.app.goo.gl/AFT3BPA1cWtKer1e9');

        $response->assertOk();
        $response->assertJsonStructure(['embed_url']);
        $embedUrl = $response->json('embed_url');
        $this->assertStringContainsString('output=embed', $embedUrl);
        $this->assertStringContainsString('maps.google.com/maps', $embedUrl);
    }
}
