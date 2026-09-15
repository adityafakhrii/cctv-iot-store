<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\OrderStatusLog;
use App\Models\ServiceRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderAndServiceEnhancementsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_admin_can_create_service_request(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $payload = [
            'name' => 'PT Trans Logistik Mandiri',
            'email' => 'tech@translogistik.co.id',
            'phone' => '081234567890',
            'service_type' => 'Instalasi',
            'location' => 'Gudang DC Rungkut, Surabaya',
            'description' => 'Instalasi GPS Tracker dan Sensor Suhu untuk 10 truk pendingin.',
            'note' => 'Prioritas penanganan akhir pekan',
            'status' => 'Baru',
        ];

        $response = $this->actingAs($admin)->post('/admin/service-requests', $payload);
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('service_requests', [
            'name' => 'PT Trans Logistik Mandiri',
            'email' => 'tech@translogistik.co.id',
            'service_type' => 'Instalasi',
            'location' => 'Gudang DC Rungkut, Surabaya',
            'status' => 'Baru',
        ]);
    }

    public function test_non_admin_cannot_create_service_request_via_admin_route(): void
    {
        $customer = User::factory()->create(['is_admin' => false]);

        $payload = [
            'name' => 'John Doe',
            'email' => 'customer@example.com',
            'phone' => '081234567890',
            'service_type' => 'Survey',
            'location' => 'Surabaya',
            'description' => 'Survey lokasi smart farming.',
        ];

        $response = $this->actingAs($customer)->post('/admin/service-requests', $payload);
        $response->assertStatus(403);
    }

    public function test_order_creation_automatically_records_initial_status_log(): void
    {
        $customer = User::factory()->create(['is_admin' => false]);

        $order = Order::create([
            'user_id' => $customer->id,
            'order_number' => 'DDL-202609-LOG01',
            'customer_name' => $customer->name,
            'customer_email' => $customer->email,
            'customer_phone' => '081234567890',
            'customer_address' => 'Jl. Manyar Kertoarjo No. 12, Surabaya',
            'subtotal' => 2500000,
            'total' => 2500000,
            'payment_status' => Order::PAYMENT_PENDING,
            'order_status' => Order::STATUS_PENDING_PAYMENT,
        ]);

        $this->assertDatabaseHas('order_status_logs', [
            'order_id' => $order->id,
            'status' => Order::STATUS_PENDING_PAYMENT,
        ]);

        $this->assertCount(1, $order->statusLogs);
    }

    public function test_order_status_update_appends_status_log(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $customer = User::factory()->create(['is_admin' => false]);

        $order = Order::create([
            'user_id' => $customer->id,
            'order_number' => 'DDL-202609-LOG02',
            'customer_name' => $customer->name,
            'customer_email' => $customer->email,
            'customer_phone' => '081234567890',
            'customer_address' => 'Jl. Diponegoro No. 45, Surabaya',
            'subtotal' => 1200000,
            'total' => 1200000,
            'payment_status' => Order::PAYMENT_PAID,
            'order_status' => Order::STATUS_PROCESSING,
        ]);

        // Admin updates status to dikirim with courier
        $response = $this->actingAs($admin)->patch("/admin/orders/{$order->id}/status", [
            'order_status' => Order::STATUS_SHIPPED,
            'shipping_courier' => 'JNE',
            'tracking_number' => 'JNE998877665544',
        ]);

        $response->assertSessionHas('success');

        $order->refresh();
        $this->assertEquals(Order::STATUS_SHIPPED, $order->order_status);

        $this->assertDatabaseHas('order_status_logs', [
            'order_id' => $order->id,
            'status' => Order::STATUS_SHIPPED,
        ]);

        $latestLog = $order->statusLogs()->latest('id')->first();
        $this->assertStringContainsString('JNE', $latestLog->description);
        $this->assertStringContainsString('JNE998877665544', $latestLog->description);
    }

    public function test_customer_can_confirm_order_received_and_status_becomes_completed(): void
    {
        $customer = User::factory()->create(['is_admin' => false]);

        $order = Order::create([
            'user_id' => $customer->id,
            'order_number' => 'DDL-202609-RCV01',
            'customer_name' => $customer->name,
            'customer_email' => $customer->email,
            'customer_phone' => '081234567890',
            'customer_address' => 'Jl. Kertajaya Indah No. 10, Surabaya',
            'subtotal' => 3500000,
            'total' => 3500000,
            'payment_status' => Order::PAYMENT_PAID,
            'order_status' => Order::STATUS_SHIPPED,
            'shipping_courier' => 'SiCepat',
            'tracking_number' => '002133445566',
        ]);

        $response = $this->actingAs($customer)->patch("/pesanan/{$order->order_number}/terima");
        $response->assertSessionHas('success');

        $order->refresh();
        $this->assertEquals(Order::STATUS_COMPLETED, $order->order_status);

        $this->assertDatabaseHas('order_status_logs', [
            'order_id' => $order->id,
            'status' => Order::STATUS_COMPLETED,
        ]);
    }

    public function test_other_customer_cannot_confirm_order_received(): void
    {
        $owner = User::factory()->create(['email' => 'owner@example.com', 'is_admin' => false]);
        $stranger = User::factory()->create(['email' => 'stranger@example.com', 'is_admin' => false]);

        $order = Order::create([
            'user_id' => $owner->id,
            'order_number' => 'DDL-202609-RCV02',
            'customer_name' => $owner->name,
            'customer_email' => $owner->email,
            'customer_phone' => '081234567890',
            'customer_address' => 'Surabaya',
            'subtotal' => 1000000,
            'total' => 1000000,
            'payment_status' => Order::PAYMENT_PAID,
            'order_status' => Order::STATUS_SHIPPED,
        ]);

        $response = $this->actingAs($stranger)->patch("/akun/pesanan/{$order->order_number}/terima");
        $response->assertStatus(403);

        $order->refresh();
        $this->assertEquals(Order::STATUS_SHIPPED, $order->order_status);
    }

    public function test_customer_can_download_invoice_pdf(): void
    {
        $customer = User::factory()->create(['is_admin' => false]);

        $order = Order::create([
            'user_id' => $customer->id,
            'order_number' => 'DDL-202609-INV01',
            'customer_name' => $customer->name,
            'customer_email' => $customer->email,
            'customer_phone' => '081234567890',
            'customer_address' => 'Surabaya',
            'subtotal' => 2000000,
            'total' => 2000000,
            'payment_status' => Order::PAYMENT_PAID,
            'order_status' => Order::STATUS_SHIPPED,
        ]);

        $response = $this->actingAs($customer)->get("/akun/pesanan/{$order->order_number}/invoice");
        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/pdf');
        $this->assertStringContainsString('Invoice-DDL-202609-INV01.pdf', $response->headers->get('Content-Disposition') ?? '');
    }

    public function test_customer_cannot_download_other_customer_invoice_pdf(): void
    {
        $owner = User::factory()->create(['email' => 'owner2@example.com', 'is_admin' => false]);
        $stranger = User::factory()->create(['email' => 'stranger2@example.com', 'is_admin' => false]);

        $order = Order::create([
            'user_id' => $owner->id,
            'order_number' => 'DDL-202609-INV02',
            'customer_name' => $owner->name,
            'customer_email' => $owner->email,
            'customer_phone' => '081234567890',
            'customer_address' => 'Surabaya',
            'subtotal' => 1500000,
            'total' => 1500000,
            'payment_status' => Order::PAYMENT_PAID,
            'order_status' => Order::STATUS_PROCESSING,
        ]);

        $response = $this->actingAs($stranger)->get("/akun/pesanan/{$order->order_number}/invoice");
        $response->assertStatus(403);
    }

    public function test_admin_can_download_any_order_invoice_pdf(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $customer = User::factory()->create(['is_admin' => false]);

        $order = Order::create([
            'user_id' => $customer->id,
            'order_number' => 'DDL-202609-INV03',
            'customer_name' => $customer->name,
            'customer_email' => $customer->email,
            'customer_phone' => '081234567890',
            'customer_address' => 'Surabaya',
            'subtotal' => 3000000,
            'total' => 3000000,
            'payment_status' => Order::PAYMENT_PAID,
            'order_status' => Order::STATUS_SHIPPED,
        ]);

        $response = $this->actingAs($admin)->get("/admin/orders/{$order->id}/invoice");
        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/pdf');
        $this->assertStringContainsString('Invoice-DDL-202609-INV03.pdf', $response->headers->get('Content-Disposition') ?? '');
    }
}
