<?php

use App\Http\Controllers\AboutController;
use App\Http\Controllers\Admin\BannerController as AdminBannerController;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\CustomerController as AdminCustomerController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\ServiceRequestController as AdminServiceRequestController;
use App\Http\Controllers\Admin\SettingsController as AdminSettingsController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\Customer\DashboardController as CustomerDashboardController;
use App\Http\Controllers\Customer\OrderController as CustomerOrderController;
use App\Http\Controllers\Customer\ProfileController as CustomerProfileController;
use App\Http\Controllers\Customer\ServiceRequestController as CustomerServiceRequestController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PortfolioController;
use App\Http\Controllers\ProductCatalogController;
use App\Http\Controllers\ServiceRequestController;
use App\Http\Middleware\EnsureUserIsAdmin;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public Store & Company Profile Routes
|--------------------------------------------------------------------------
*/

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/tentang-kami', [AboutController::class, 'index'])->name('about');
Route::get('/produk', [ProductCatalogController::class, 'index'])->name('products.index');
Route::get('/produk/{slug}', [ProductCatalogController::class, 'show'])->name('products.show');
Route::get('/portfolio', [PortfolioController::class, 'index'])->name('portfolio');
Route::get('/kontak', [ContactController::class, 'index'])->name('contact');

// Services & Requests (Throttled to 10 submissions per minute)
Route::get('/layanan', [ServiceRequestController::class, 'index'])->name('services.index');
Route::post('/layanan', [ServiceRequestController::class, 'store'])->middleware('throttle:10,1')->name('services.store');

// Shopping Cart (Public)
Route::get('/keranjang', fn () => Inertia::render('cart'))->name('cart.index');
Route::match(['get', 'post'], '/keranjang/sync', [CartController::class, 'sync'])
    ->withoutMiddleware([ValidateCsrfToken::class])
    ->name('cart.sync');

// QA & Testing Checklist Tool (Internal QA Review)
Route::get('/test', fn () => Inertia::render('qa-checklist'))->name('qa.test');
Route::get('/qa-checklist', fn () => redirect()->route('qa.test'))->name('qa.checklist');

// CSRF Token for SPA fetch requests
Route::get('/csrf-token', fn () => response()->json(['token' => csrf_token()]))->name('csrf.token');

// Authenticated Checkout & Order Status (Throttled checkout)
Route::middleware(['auth'])->group(function () {
    Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout.index');
    Route::post('/checkout', [CheckoutController::class, 'store'])->middleware('throttle:10,1')->name('checkout.store');
    Route::get('/pesanan/{orderNumber}', [CustomerOrderController::class, 'show'])->name('orders.show');
    Route::patch('/pesanan/{orderNumber}/terima', [CustomerOrderController::class, 'confirmReceived'])->name('orders.confirm-received');
    Route::get('/pesanan/{orderNumber}/invoice', [CustomerOrderController::class, 'downloadInvoice'])->name('orders.invoice');
});

// Payment Gateway & Status
Route::get('/pembayaran/{orderNumber}', [PaymentController::class, 'show'])->name('payment.show');
Route::post('/pembayaran/{orderNumber}/simulate-success', [PaymentController::class, 'simulateSuccess'])->name('payment.simulate');
Route::post('/payments/webhook', [PaymentController::class, 'webhook'])
    ->middleware('throttle:60,1')
    ->withoutMiddleware([ValidateCsrfToken::class])
    ->name('payment.webhook');

/*
|--------------------------------------------------------------------------
| Protected Customer Portal Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth'])->prefix('akun')->name('customer.')->group(function () {
    Route::get('/dashboard', [CustomerDashboardController::class, 'index'])->name('dashboard');
    Route::get('/pesanan', [CustomerOrderController::class, 'index'])->name('orders.index');
    Route::get('/pesanan/{orderNumber}', [CustomerOrderController::class, 'show'])->name('orders.show');
    Route::patch('/pesanan/{orderNumber}/terima', [CustomerOrderController::class, 'confirmReceived'])->name('orders.confirm-received');
    Route::get('/pesanan/{orderNumber}/invoice', [CustomerOrderController::class, 'downloadInvoice'])->name('orders.invoice');
    Route::get('/layanan', [CustomerServiceRequestController::class, 'index'])->name('services.index');
    Route::get('/profil', [CustomerProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profil', [CustomerProfileController::class, 'update'])->name('profile.update');
});

/*
|--------------------------------------------------------------------------
| Protected Admin Routes (Strict Admin Authorization)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', EnsureUserIsAdmin::class])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
    Route::get('/', fn () => redirect()->route('admin.dashboard'));

    // Products Management
    Route::resource('products', AdminProductController::class);

    // Categories Management
    Route::resource('categories', AdminCategoryController::class)->except(['create', 'show', 'edit']);

    // Orders Management
    Route::get('/orders', [AdminOrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order}', [AdminOrderController::class, 'show'])->name('orders.show');
    Route::get('/orders/{order}/invoice', [AdminOrderController::class, 'downloadInvoice'])->name('orders.invoice');
    Route::patch('/orders/{order}/status', [AdminOrderController::class, 'updateStatus'])->name('orders.update-status');

    // Customer Directory
    Route::get('/customers', [AdminCustomerController::class, 'index'])->name('customers.index');

    // Service Requests Management
    Route::get('/service-requests', [AdminServiceRequestController::class, 'index'])->name('service-requests.index');
    Route::post('/service-requests', [AdminServiceRequestController::class, 'store'])->name('service-requests.store');
    Route::patch('/service-requests/{serviceRequest}/status', [AdminServiceRequestController::class, 'updateStatus'])->name('service-requests.update-status');
    Route::delete('/service-requests/{serviceRequest}', [AdminServiceRequestController::class, 'destroy'])->name('service-requests.destroy');

    // Banners Management
    Route::resource('banners', AdminBannerController::class)->except(['create', 'show', 'edit']);

    // Admin Settings & Security
    Route::get('/settings', [AdminSettingsController::class, 'index'])->name('settings.index');
    Route::patch('/settings/profile', [AdminSettingsController::class, 'updateProfile'])->name('settings.profile');
    Route::put('/settings/password', [AdminSettingsController::class, 'updatePassword'])->name('settings.password');
    Route::patch('/settings/store', [AdminSettingsController::class, 'updateStore'])->name('settings.store');
    Route::match(['get', 'post'], '/settings/resolve-map', [AdminSettingsController::class, 'resolveMap'])->name('settings.resolve-map');
});

// Smart Dashboard Redirect
Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', function (Request $request) {
        if ($request->user()?->is_admin) {
            return redirect()->route('admin.dashboard');
        }

        return redirect()->route('customer.dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';
