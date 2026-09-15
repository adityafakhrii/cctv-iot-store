<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$order = App\Models\Order::with(['items.product', 'payments', 'latestPayment'])->latest()->first();
if (!$order) {
    echo "NO_ORDER\n";
    exit;
}

$logoPath = public_path('assets/logo/logo-dark.png');
$logoBase64 = file_exists($logoPath) ? 'data:image/png;base64,' . base64_encode(file_get_contents($logoPath)) : null;

$pdf = Barryvdh\DomPDF\Facade\Pdf::loadView('invoices.order-invoice', [
    'order' => $order,
    'logoBase64' => $logoBase64,
])->setPaper('a4', 'portrait');

$output = $pdf->output();
file_put_contents(storage_path('test_invoice_v2.pdf'), $output);
echo "GENERATED_PDF_BYTES:" . strlen($output) . "\n";
