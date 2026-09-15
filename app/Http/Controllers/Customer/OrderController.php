<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Services\MayarService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $query = Order::where(function ($q) use ($user) {
            $q->where('user_id', $user->id)
                ->orWhere('customer_email', $user->email);
        })->with(['items', 'latestPayment']);

        if ($search = $request->input('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhereHas('items', function ($itemQuery) use ($search) {
                        $itemQuery->where('product_name', 'like', "%{$search}%");
                    });
            });
        }

        if ($status = $request->input('status')) {
            $query->where('order_status', $status);
        }

        if ($paymentStatus = $request->input('payment_status')) {
            $query->where('payment_status', $paymentStatus);
        }

        $orders = $query->latest()->paginate(8)->withQueryString();

        return Inertia::render('customer/orders/index', [
            'orders' => $orders,
            'filters' => [
                'q' => $request->input('q', ''),
                'status' => $request->input('status', ''),
                'payment_status' => $request->input('payment_status', ''),
            ],
        ]);
    }

    public function show(Request $request, string $orderNumber, MayarService $mayarService): Response
    {
        $user = $request->user();

        $order = Order::where('order_number', $orderNumber)
            ->with(['items', 'payments', 'latestPayment', 'statusLogs'])
            ->firstOrFail();

        // Ensure user can only view their own orders
        if ($order->user_id !== $user->id && strtolower($order->customer_email) !== strtolower($user->email) && ! $user->is_admin) {
            abort(403, 'Anda tidak memiliki akses untuk melihat rincian pesanan ini.');
        }

        // Active server-side check with Mayar API if order is not yet marked as paid
        if ($order->payment_status !== Order::PAYMENT_PAID && $order->latestPayment?->payment_reference) {
            $status = $mayarService->checkInvoiceStatus($order->latestPayment->payment_reference);
            if ($status && in_array(strtolower($status), ['paid', 'success', 'settlement'])) {
                DB::transaction(function () use ($order) {
                    $order->latestPayment->update([
                        'status' => Payment::STATUS_PAID,
                        'paid_at' => now(),
                    ]);

                    $order->update([
                        'payment_status' => Order::PAYMENT_PAID,
                        'order_status' => Order::STATUS_PAID,
                    ]);
                });

                $order->refresh();
                $order->load(['items', 'payments', 'latestPayment', 'statusLogs']);
            }
        }

        return Inertia::render('customer/orders/show', [
            'order' => $order,
        ]);
    }

    public function confirmReceived(Request $request, string $orderNumber): RedirectResponse
    {
        $user = $request->user();

        $order = Order::where('order_number', $orderNumber)->firstOrFail();

        // Ensure user can only confirm their own orders
        if ($order->user_id !== $user->id && strtolower($order->customer_email) !== strtolower($user->email) && ! $user->is_admin) {
            abort(403, 'Anda tidak memiliki akses untuk mengonfirmasi pesanan ini.');
        }

        // Only orders that are shipped can be confirmed as received
        if ($order->order_status !== Order::STATUS_SHIPPED) {
            return back()->with('error', 'Hanya pesanan dengan status "Dikirim" yang dapat dikonfirmasi telah diterima.');
        }

        $order->update([
            'order_status' => Order::STATUS_COMPLETED,
        ]);

        return back()->with('success', "Pesanan #{$order->order_number} berhasil dikonfirmasi diterima. Terima kasih telah berbelanja di Dodolan Store!");
    }
}

