<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('store_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });

        // Insert initial default store settings with real user preferences
        $defaults = [
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
        ];

        $now = now();
        $records = [];
        foreach ($defaults as $key => $value) {
            $records[] = [
                'key' => $key,
                'value' => $value,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        DB::table('store_settings')->insert($records);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('store_settings');
    }
};
