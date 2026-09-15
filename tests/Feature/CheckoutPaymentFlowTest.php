<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\User;
use App\Services\MayarService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class CheckoutPaymentFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_csrf_token_endpoint_returns_valid_token(): void
    {
        $response = $this->getJson('/csrf-token');

        $response->assertOk()
            ->assertJsonStructure(['token']);

        $this->assertNotEmpty($response->json('token'));
    }

    public function test_orders_show_route_is_accessible_at_pesanan_slug(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $order = Order::create([
            'user_id' => $user->id,
            'order_number' => 'DDL-202609-FLOW01',
            'customer_name' => $user->name,
            'customer_email' => $user->email,
            'customer_phone' => '081234567890',
            'customer_address' => 'Surabaya',
            'subtotal' => 1500000,
            'total' => 1500000,
            'payment_status' => Order::PAYMENT_PENDING,
            'order_status' => Order::STATUS_PENDING_PAYMENT,
        ]);

        // Verify route('orders.show') generates correct path
        $expectedUrl = route('orders.show', ['orderNumber' => $order->order_number]);
        $this->assertStringContainsString('/pesanan/'.$order->order_number, $expectedUrl);

        // Access via /pesanan/{orderNumber}
        $response = $this->actingAs($user)->get("/pesanan/{$order->order_number}");
        $response->assertOk();
    }

    public function test_another_customer_cannot_access_pesanan_slug(): void
    {
        $userA = User::factory()->create(['email' => 'user_a@example.com', 'is_admin' => false]);
        $userB = User::factory()->create(['email' => 'user_b@example.com', 'is_admin' => false]);

        $orderOfA = Order::create([
            'user_id' => $userA->id,
            'order_number' => 'DDL-202609-FLOW02',
            'customer_name' => $userA->name,
            'customer_email' => $userA->email,
            'customer_phone' => '081234567890',
            'customer_address' => 'Surabaya',
            'subtotal' => 500000,
            'total' => 500000,
            'payment_status' => Order::PAYMENT_PENDING,
            'order_status' => Order::STATUS_PENDING_PAYMENT,
        ]);

        $response = $this->actingAs($userB)->get("/pesanan/{$orderOfA->order_number}");
        $response->assertStatus(403);
    }

    public function test_checkout_creates_order_and_returns_order_number_and_redirect_url(): void
    {
        $user = User::factory()->create(['is_admin' => false]);
        $product = Product::first();

        $payload = [
            'customer_name' => $user->name,
            'customer_email' => $user->email,
            'customer_phone' => '081234567890',
            'customer_address' => 'Jl. Pemuda No. 1, Surabaya',
            'items' => [
                ['id' => $product->id, 'quantity' => 1],
            ],
        ];

        $response = $this->actingAs($user)->postJson('/checkout', $payload);

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'order_number',
                'redirect_url',
            ]);

        $orderNumber = $response->json('order_number');
        $this->assertDatabaseHas('orders', [
            'order_number' => $orderNumber,
            'payment_status' => Order::PAYMENT_PENDING,
        ]);
    }

    public function test_order_show_actively_syncs_status_with_mayar_if_paid(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $order = Order::create([
            'user_id' => $user->id,
            'order_number' => 'DDL-202609-FLOW03',
            'customer_name' => $user->name,
            'customer_email' => $user->email,
            'customer_phone' => '081234567890',
            'customer_address' => 'Surabaya',
            'subtotal' => 1000000,
            'total' => 1000000,
            'payment_status' => Order::PAYMENT_PENDING,
            'order_status' => Order::STATUS_PENDING_PAYMENT,
        ]);

        Payment::create([
            'order_id' => $order->id,
            'provider' => 'mayar',
            'provider_reference' => 'inv_test123',
            'payment_reference' => 'inv_test123',
            'amount' => 1000000,
            'method' => 'Mayar Gateway',
            'status' => Payment::STATUS_PENDING,
        ]);

        // Mock MayarService to return 'paid'
        $mockMayar = $this->mock(MayarService::class);
        $mockMayar->shouldReceive('checkInvoiceStatus')
            ->with('inv_test123')
            ->once()
            ->andReturn('paid');

        $response = $this->actingAs($user)->get("/pesanan/{$order->order_number}");
        $response->assertOk();

        // Verify order status is automatically updated to Paid
        $order->refresh();
        $this->assertEquals(Order::PAYMENT_PAID, $order->payment_status);
        $this->assertEquals(Order::STATUS_PAID, $order->order_status);
        $this->assertEquals(Payment::STATUS_PAID, $order->latestPayment->status);
    }

    public function test_forgot_password_sends_email_without_connection_refused_error(): void
    {
        $user = User::factory()->create();

        $response = $this->post('/forgot-password', [
            'email' => $user->email,
        ]);

        $response->assertSessionHas('status');
    }

    public function test_checkout_fails_and_rolls_back_when_mayar_api_fails(): void
    {
        $user = User::factory()->create(['is_admin' => false]);
        $product = Product::first();
        $initialStock = $product->stock;

        // Mock MayarService to simulate API failure/exception
        $mockMayar = $this->mock(MayarService::class);
        $mockMayar->shouldReceive('createPayment')
            ->once()
            ->andThrow(new \RuntimeException('Pembayaran gagal dibuat, silakan coba lagi.'));

        $payload = [
            'customer_name' => $user->name,
            'customer_email' => $user->email,
            'customer_phone' => '081234567890',
            'customer_address' => 'Surabaya',
            'items' => [
                ['id' => $product->id, 'quantity' => 2],
            ],
        ];

        $response = $this->actingAs($user)->postJson('/checkout', $payload);

        // Response must be 422 with the exact error message
        $response->assertStatus(422)
            ->assertJson([
                'message' => 'Pembayaran gagal dibuat, silakan coba lagi.',
            ]);

        // Database rollback assertions: No order, no payment created
        $this->assertDatabaseMissing('orders', [
            'customer_email' => $user->email,
        ]);
        $this->assertDatabaseCount('payments', 0);

        // Stock must remain unchanged (rollback successful)
        $product->refresh();
        $this->assertEquals($initialStock, $product->stock);
    }

    public function test_checkout_fails_and_rolls_back_when_mayar_api_times_out(): void
    {
        $user = User::factory()->create(['is_admin' => false]);
        $product = Product::first();
        $initialStock = $product->stock;

        // Mock MayarService to throw connection exception
        $mockMayar = $this->mock(MayarService::class);
        $mockMayar->shouldReceive('createPayment')
            ->once()
            ->andThrow(new \Illuminate\Http\Client\ConnectionException('cURL error 28: Operation timed out'));

        $payload = [
            'customer_name' => $user->name,
            'customer_email' => $user->email,
            'customer_phone' => '081234567890',
            'customer_address' => 'Surabaya',
            'items' => [
                ['id' => $product->id, 'quantity' => 1],
            ],
        ];

        $response = $this->actingAs($user)->postJson('/checkout', $payload);

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'Pembayaran gagal dibuat, silakan coba lagi.',
            ]);

        // Verify no order or payment created
        $this->assertDatabaseMissing('orders', [
            'customer_email' => $user->email,
        ]);
        $this->assertDatabaseCount('payments', 0);

        // Stock is preserved
        $product->refresh();
        $this->assertEquals($initialStock, $product->stock);
    }

    public function test_mayar_service_throws_exception_when_api_response_is_not_successful(): void
    {
        config(['services.mayar.api_key' => 'live_sample_token_for_faking']);

        Http::fake([
            '*/invoices/create' => Http::response(['message' => 'Invalid API Key'], 401),
        ]);

        $order = Order::create([
            'order_number' => 'DDL-TEST-FAIL-01',
            'customer_name' => 'Test User',
            'customer_email' => 'test@example.com',
            'customer_phone' => '081234567890',
            'customer_address' => 'Surabaya',
            'subtotal' => 100000,
            'total' => 100000,
            'payment_status' => Order::PAYMENT_PENDING,
            'order_status' => Order::STATUS_PENDING_PAYMENT,
        ]);

        $mayarService = new MayarService();

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Pembayaran gagal dibuat, silakan coba lagi.');

        $mayarService->createPayment($order, 'http://localhost/pesanan/DDL-TEST-FAIL-01');
    }

    public function test_mayar_service_returns_payment_details_when_api_succeeds(): void
    {
        config(['services.mayar.api_key' => 'live_sample_token_for_faking']);

        Http::fake([
            '*/invoices/create' => Http::response([
                'data' => [
                    'id' => 'inv_mayar_999',
                    'link' => 'https://mayar.id/inv/test-999',
                ],
            ], 200),
        ]);

        $order = Order::create([
            'order_number' => 'DDL-TEST-SUCCESS-01',
            'customer_name' => 'Test User',
            'customer_email' => 'test@example.com',
            'customer_phone' => '081234567890',
            'customer_address' => 'Surabaya',
            'subtotal' => 100000,
            'total' => 100000,
            'payment_status' => Order::PAYMENT_PENDING,
            'order_status' => Order::STATUS_PENDING_PAYMENT,
        ]);

        $mayarService = new MayarService();
        $result = $mayarService->createPayment($order, 'http://localhost/pesanan/DDL-TEST-SUCCESS-01');

        $this->assertTrue($result['success']);
        $this->assertEquals('inv_mayar_999', $result['payment_reference']);
        $this->assertEquals('https://mayar.id/inv/test-999', $result['payment_url']);
    }

    public function test_customer_can_confirm_order_received_when_status_is_shipped(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $order = Order::create([
            'user_id' => $user->id,
            'order_number' => 'DDL-TEST-RCV-01',
            'customer_name' => $user->name,
            'customer_email' => $user->email,
            'customer_phone' => '081234567890',
            'customer_address' => 'Surabaya',
            'shipping_courier' => 'JNE Express',
            'tracking_number' => 'JNE123456789',
            'subtotal' => 150000,
            'total' => 150000,
            'payment_status' => Order::PAYMENT_PAID,
            'order_status' => Order::STATUS_SHIPPED,
        ]);

        $response = $this->actingAs($user)->patch("/pesanan/{$order->order_number}/terima");

        $response->assertSessionHas('success');

        $order->refresh();
        $this->assertEquals(Order::STATUS_COMPLETED, $order->order_status);
    }

    public function test_customer_cannot_confirm_order_of_another_user(): void
    {
        $userA = User::factory()->create(['is_admin' => false]);
        $userB = User::factory()->create(['is_admin' => false]);

        $order = Order::create([
            'user_id' => $userA->id,
            'order_number' => 'DDL-TEST-RCV-02',
            'customer_name' => $userA->name,
            'customer_email' => $userA->email,
            'customer_phone' => '081234567890',
            'customer_address' => 'Surabaya',
            'shipping_courier' => 'SiCepat',
            'tracking_number' => 'SCP987654321',
            'subtotal' => 200000,
            'total' => 200000,
            'payment_status' => Order::PAYMENT_PAID,
            'order_status' => Order::STATUS_SHIPPED,
        ]);

        $response = $this->actingAs($userB)->patch("/pesanan/{$order->order_number}/terima");

        $response->assertStatus(403);

        $order->refresh();
        $this->assertEquals(Order::STATUS_SHIPPED, $order->order_status);
    }

    public function test_customer_cannot_confirm_order_if_not_shipped(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $order = Order::create([
            'user_id' => $user->id,
            'order_number' => 'DDL-TEST-RCV-03',
            'customer_name' => $user->name,
            'customer_email' => $user->email,
            'customer_phone' => '081234567890',
            'customer_address' => 'Surabaya',
            'subtotal' => 200000,
            'total' => 200000,
            'payment_status' => Order::PAYMENT_PENDING,
            'order_status' => Order::STATUS_PENDING_PAYMENT,
        ]);

        $response = $this->actingAs($user)->patch("/pesanan/{$order->order_number}/terima");

        $response->assertSessionHas('error');

        $order->refresh();
        $this->assertEquals(Order::STATUS_PENDING_PAYMENT, $order->order_status);
    }
}

