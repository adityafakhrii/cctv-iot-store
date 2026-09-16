<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Order::with(['items', 'latestPayment']);

        if ($search = $request->input('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%")
                    ->orWhere('customer_email', 'like', "%{$search}%");
            });
        }

        if ($paymentStatus = $request->input('payment_status')) {
            $query->where('payment_status', $paymentStatus);
        }

        if ($orderStatus = $request->input('order_status')) {
            $query->where('order_status', $orderStatus);
        }

        $orders = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('admin/orders/index', [
            'orders' => $orders,
            'filters' => [
                'q' => $request->input('q', ''),
                'payment_status' => $request->input('payment_status', ''),
                'order_status' => $request->input('order_status', ''),
            ],
        ]);
    }

    public function show(Order $order): Response
    {
        $order->load(['items', 'payments', 'latestPayment', 'statusLogs']);

        return Inertia::render('admin/orders/show', [
            'order' => $order,
        ]);
    }

    public function updateStatus(Request $request, Order $order): RedirectResponse
    {
        $validated = $request->validate([
            'order_status' => ['required', 'string', 'in:Menunggu Pembayaran,Dibayar,Diproses,Dikirim,Selesai'],
            'shipping_courier' => ['nullable', 'string', 'max:100'],
            'tracking_number' => ['nullable', 'string', 'max:100'],
        ]);

        $updateData = ['order_status' => $validated['order_status']];

        if ($request->has('shipping_courier')) {
            $updateData['shipping_courier'] = $validated['shipping_courier'];
        }
        if ($request->has('tracking_number')) {
            $updateData['tracking_number'] = $validated['tracking_number'];
        }

        $order->update($updateData);

        return back()->with('success', "Pesanan #{$order->order_number} berhasil diperbarui.");
    }

    public function downloadInvoice(Request $request, Order $order): \Symfony\Component\HttpFoundation\Response
    {
        $order->load(['items.product', 'payments', 'latestPayment']);

        $logoPath = public_path('assets/logo/logo-dark.png');
        $logoBase64 = file_exists($logoPath) ? 'data:image/png;base64,' . base64_encode(file_get_contents($logoPath)) : null;

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('invoices.order-invoice', [
            'order' => $order,
            'logoBase64' => $logoBase64,
            'storeSettings' => \App\Models\StoreSetting::getAll(),
        ])->setPaper('a4', 'portrait');

        $filename = "Invoice-{$order->order_number}.pdf";

        if ($request->boolean('preview') || $request->boolean('stream')) {
            return $pdf->stream($filename);
        }

        return $pdf->download($filename);
    }
}
