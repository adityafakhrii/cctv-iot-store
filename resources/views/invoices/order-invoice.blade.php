<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Invoice #{{ $order->order_number }} - Dodolan Store</title>
    <style>
        @page {
            size: A4;
            margin: 18mm 16mm 18mm 16mm;
        }
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1e293b;
            font-size: 11px;
            line-height: 1.45;
            background: #ffffff;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        .header-table {
            margin-bottom: 24px;
            border-bottom: 2px solid #059669;
            padding-bottom: 16px;
        }
        .logo {
            max-height: 46px;
            width: auto;
            display: block;
            margin-bottom: 6px;
        }
        .company-name {
            font-size: 13px;
            font-weight: bold;
            color: #0f172a;
            letter-spacing: 0.5px;
        }
        .company-tagline {
            font-size: 9px;
            color: #059669;
            font-weight: bold;
            margin-bottom: 4px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .company-details {
            font-size: 9.5px;
            color: #64748b;
            line-height: 1.35;
        }
        .invoice-title-cell {
            text-align: right;
            vertical-align: top;
        }
        .invoice-title {
            font-size: 22px;
            font-weight: 900;
            color: #0f172a;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 4px;
        }
        .invoice-subtitle {
            font-size: 9.5px;
            font-weight: bold;
            color: #059669;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            margin-bottom: 10px;
        }
        .meta-table {
            float: right;
            width: auto;
            margin-left: auto;
        }
        .meta-table td {
            padding: 2px 4px;
            font-size: 10px;
        }
        .meta-label {
            color: #64748b;
            text-align: right;
            font-weight: 500;
        }
        .meta-value {
            font-weight: bold;
            color: #0f172a;
            text-align: right;
            font-family: 'Courier New', Courier, monospace;
        }

        /* Status Badge & Stamp */
        .status-badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 4px;
        }
        .status-paid {
            background-color: #ecfdf5;
            color: #047857;
            border: 1px solid #a7f3d0;
        }
        .status-pending {
            background-color: #fffbeb;
            color: #b45309;
            border: 1px solid #fde68a;
        }

        /* Billing & Shipping Section */
        .info-section {
            margin-bottom: 22px;
        }
        .info-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 12px 14px;
            vertical-align: top;
        }
        .info-card-title {
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            color: #059669;
            letter-spacing: 0.8px;
            margin-bottom: 8px;
            border-bottom: 1px dashed #cbd5e1;
            padding-bottom: 4px;
        }
        .info-content {
            font-size: 10px;
            color: #334155;
            line-height: 1.45;
        }
        .info-content strong {
            color: #0f172a;
            font-size: 11px;
        }

        /* Items Table */
        .items-table {
            margin-bottom: 18px;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            overflow: hidden;
        }
        .items-table th {
            background-color: #0f172a;
            color: #ffffff;
            font-weight: 700;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 8px 10px;
            text-align: left;
        }
        .items-table th.text-right {
            text-align: right;
        }
        .items-table th.text-center {
            text-align: center;
        }
        .items-table td {
            padding: 9px 10px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 10.5px;
            vertical-align: middle;
        }
        .items-table tr:nth-child(even) td {
            background-color: #f8fafc;
        }
        .items-table td.text-right {
            text-align: right;
        }
        .items-table td.text-center {
            text-align: center;
        }
        .item-name {
            font-weight: bold;
            color: #0f172a;
            font-size: 11px;
        }
        .item-sku {
            font-size: 9px;
            color: #64748b;
            font-family: 'Courier New', Courier, monospace;
        }

        /* Summary & Totals */
        .summary-table {
            margin-bottom: 24px;
        }
        .payment-box {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 12px;
            vertical-align: top;
        }
        .payment-box-title {
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            color: #0f172a;
            margin-bottom: 6px;
        }
        .totals-box {
            width: 260px;
            float: right;
        }
        .totals-row td {
            padding: 4px 6px;
            font-size: 10.5px;
        }
        .totals-label {
            color: #64748b;
            text-align: right;
        }
        .totals-value {
            color: #0f172a;
            font-weight: bold;
            text-align: right;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        }
        .grand-total-row td {
            background-color: #059669;
            color: #ffffff !important;
            padding: 8px 10px;
            font-size: 13px;
            font-weight: 900;
        }
        .grand-total-row .totals-label {
            color: #ffffff !important;
            text-align: right;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .grand-total-row .totals-value {
            color: #ffffff !important;
            text-align: right;
            font-size: 13px;
        }

        /* Watermark Stamp for LUNAS */
        .stamp-container {
            margin-top: 10px;
            display: inline-block;
            border: 2px dashed #059669;
            border-radius: 8px;
            padding: 6px 14px;
            text-align: center;
            background-color: #f0fdf4;
        }
        .stamp-title {
            font-size: 13px;
            font-weight: 900;
            color: #059669;
            letter-spacing: 2px;
            text-transform: uppercase;
        }
        .stamp-date {
            font-size: 8.5px;
            color: #047857;
            font-weight: bold;
        }

        /* Notes & Terms */
        .notes-section {
            border-top: 1px solid #e2e8f0;
            padding-top: 14px;
            margin-top: 16px;
        }
        .notes-title {
            font-size: 9.5px;
            font-weight: 800;
            color: #0f172a;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }
        .notes-content {
            font-size: 9px;
            color: #64748b;
            line-height: 1.4;
        }

        /* Signature Section */
        .signature-table {
            margin-top: 20px;
        }
        .seal-box {
            width: 180px;
            text-align: center;
            float: right;
        }
        .seal-circle {
            border: 2px solid #059669;
            border-radius: 50%;
            width: 70px;
            height: 70px;
            margin: 0 auto 6px auto;
            text-align: center;
            padding-top: 16px;
            color: #059669;
            font-size: 8px;
            font-weight: bold;
            text-transform: uppercase;
            line-height: 1.1;
        }

        /* Footer */
        .footer {
            margin-top: 25px;
            text-align: center;
            font-size: 8.5px;
            color: #94a3b8;
            border-top: 1px solid #f1f5f9;
            padding-top: 10px;
        }
    </style>
</head>
<body>

    <!-- Header Section -->
    <table class="header-table">
        <tr>
            <td style="width: 58%; vertical-align: top;">
                @if(!empty($logoBase64))
                    <img src="{{ $logoBase64 }}" alt="Dodolan Store Logo" class="logo" />
                @else
                    <div style="font-size: 20px; font-weight: 900; color: #0f172a; margin-bottom: 2px;">
                        dodolan<span style="color: #059669;">.</span>store
                    </div>
                @endif
                <div class="company-name">PT DODOLAN TEKNOLOGI NUSANTARA</div>
                <div class="company-tagline">Enterprise IoT Solutions &amp; Fleet Telematics</div>
                <div class="company-details">
                    Jl. Rungkut Industri Raya No. 45, Rungkut, Surabaya, Jawa Timur 60293<br/>
                    WhatsApp: +62 812-3456-7890 &bull; Email: billing@dodolan.store<br/>
                    Website: https://dodolan.store
                </div>
            </td>
            <td class="invoice-title-cell" style="width: 42%;">
                <div class="invoice-title">INVOICE</div>
                <div class="invoice-subtitle">Faktur Penjualan Resmi</div>
                
                <table class="meta-table">
                    <tr>
                        <td class="meta-label">No. Faktur:</td>
                        <td class="meta-value">INV/{{ date('Ym', strtotime($order->created_at)) }}/{{ $order->order_number }}</td>
                    </tr>
                    <tr>
                        <td class="meta-label">No. Pesanan:</td>
                        <td class="meta-value">#{{ $order->order_number }}</td>
                    </tr>
                    <tr>
                        <td class="meta-label">Tgl. Transaksi:</td>
                        <td class="meta-value" style="font-family: inherit; font-size: 9.5px;">{{ \Carbon\Carbon::parse($order->created_at)->translatedFormat('d F Y, H:i') }} WIB</td>
                    </tr>
                    <tr>
                        <td class="meta-label">Status Bayar:</td>
                        <td style="text-align: right;">
                            @if($order->payment_status === \App\Models\Order::PAYMENT_PAID)
                                <span class="status-badge status-paid">LUNAS</span>
                            @else
                                <span class="status-badge status-pending">MENUNGGU PEMBAYARAN</span>
                            @endif
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <!-- Customer & Shipping Info -->
    <table class="info-section">
        <tr>
            <td style="width: 49%; vertical-align: top;" class="info-card">
                <div class="info-card-title">Ditagihkan Kepada (Billed To):</div>
                <div class="info-content">
                    <strong>{{ $order->customer_name }}</strong><br/>
                    No. WhatsApp/HP: {{ $order->customer_phone }}<br/>
                    Email: {{ $order->customer_email }}<br/>
                    ID Pelanggan: {{ $order->user_id ? 'CUST-'.str_pad($order->user_id, 4, '0', STR_PAD_LEFT) : 'Tamu (Guest)' }}
                </div>
            </td>
            <td style="width: 2%;"></td>
            <td style="width: 49%; vertical-align: top;" class="info-card">
                <div class="info-card-title">Tujuan Pengiriman &amp; Ekspedisi (Ship To):</div>
                <div class="info-content">
                    <strong>Alamat Penerima:</strong><br/>
                    {{ $order->customer_address }}<br/>
                    @if($order->shipping_courier)
                        <div style="margin-top: 4px; padding-top: 4px; border-top: 1px dotted #cbd5e1;">
                            <strong>Kurir:</strong> {{ $order->shipping_courier }}
                            @if($order->tracking_number)
                                &bull; <strong>No. Resi:</strong> <span style="font-family: 'Courier New', Courier, monospace;">{{ $order->tracking_number }}</span>
                            @endif
                        </div>
                    @endif
                </div>
            </td>
        </tr>
    </table>

    <!-- Products / Items Table -->
    <table class="items-table">
        <thead>
            <tr>
                <th style="width: 6%;" class="text-center">No</th>
                <th style="width: 50%;">Deskripsi Produk Hardware &amp; Solusi IoT</th>
                <th style="width: 18%;" class="text-right">Harga Satuan</th>
                <th style="width: 8%;" class="text-center">Qty</th>
                <th style="width: 18%;" class="text-right">Jumlah (IDR)</th>
            </tr>
        </thead>
        <tbody>
            @forelse($order->items as $index => $item)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td>
                        <div class="item-name">{{ $item->product_name }}</div>
                        <div class="item-sku">SKU: {{ $item->product?->sku ?? 'IOT-'.str_pad($item->product_id ?? $item->id, 5, '0', STR_PAD_LEFT) }} &bull; Garansi 12 Bulan</div>
                    </td>
                    <td class="text-right">Rp {{ number_format($item->unit_price, 0, ',', '.') }}</td>
                    <td class="text-center font-bold">{{ $item->quantity }}</td>
                    <td class="text-right font-bold">Rp {{ number_format($item->subtotal, 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="5" class="text-center" style="padding: 16px; color: #94a3b8;">Tidak ada item tertera dalam pesanan ini.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <!-- Totals and Payment Verification Info -->
    <table class="summary-table">
        <tr>
            <!-- Payment Gateway & Verification Info -->
            <td style="width: 55%; vertical-align: top;">
                <div class="payment-box">
                    <div class="payment-box-title">Rincian Pembayaran:</div>
                    <div style="font-size: 10px; color: #475569; line-height: 1.5;">
                        Gateway: <strong>Mayar Indonesia (Official Payment Partner)</strong><br/>
                        @if($order->latestPayment)
                            Metode Bayar: <strong>{{ strtoupper($order->latestPayment->method ?? 'QRIS / Virtual Account / Bank Transfer') }}</strong><br/>
                            ID Referensi: <span style="font-family: 'Courier New', Courier, monospace; font-weight: bold;">{{ $order->latestPayment->payment_reference ?? '-' }}</span><br/>
                            @if($order->latestPayment->paid_at)
                                Waktu Lunas: <strong>{{ \Carbon\Carbon::parse($order->latestPayment->paid_at)->translatedFormat('d F Y, H:i') }} WIB</strong><br/>
                            @endif
                        @else
                            Metode Bayar: <strong>Online Payment (Mayar Gateway)</strong><br/>
                        @endif
                    </div>

                    @if($order->payment_status === \App\Models\Order::PAYMENT_PAID)
                        <div class="stamp-container">
                            <div class="stamp-title">LUNAS / VERIFIED</div>
                            <div class="stamp-date">
                                DIVERIFIKASI SISTEM PADA {{ $order->latestPayment?->paid_at ? \Carbon\Carbon::parse($order->latestPayment->paid_at)->format('d/m/Y H:i') : \Carbon\Carbon::parse($order->created_at)->format('d/m/Y H:i') }} WIB
                            </div>
                        </div>
                    @endif
                </div>
            </td>

            <!-- Totals Box -->
            <td style="width: 45%; vertical-align: top;">
                <table class="totals-box">
                    <tr class="totals-row">
                        <td class="totals-label">Subtotal Produk:</td>
                        <td class="totals-value">Rp {{ number_format($order->subtotal, 0, ',', '.') }}</td>
                    </tr>
                    <tr class="totals-row">
                        <td class="totals-label">Biaya Pengiriman:</td>
                        <td class="totals-value" style="color: #059669;">GRATIS (Rp 0)</td>
                    </tr>
                    <tr class="totals-row">
                        <td class="totals-label">PPN &amp; Biaya Layanan:</td>
                        <td class="totals-value" style="color: #64748b;">Termasuk (0%)</td>
                    </tr>
                    <tr>
                        <td colspan="2" style="padding: 4px 0;"></td>
                    </tr>
                    <tr class="grand-total-row">
                        <td class="totals-label">TOTAL AKHIR:</td>
                        <td class="totals-value">Rp {{ number_format($order->total, 0, ',', '.') }}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <!-- Terms, Notes, and Signature Table -->
    <table class="notes-section">
        <tr>
            <td style="width: 65%; vertical-align: top;">
                <div class="notes-title">Syarat &amp; Ketentuan Garansi Dodolan Store:</div>
                <div class="notes-content">
                    1. Faktur ini merupakan dokumen bukti transaksi dan kepemilikan resmi yang sah dari Dodolan Store.<br/>
                    2. Seluruh hardware IoT dilindungi oleh garansi tukar unit baru / servis resmi selama 12 bulan.<br/>
                    3. Klaim garansi dan asistensi instalasi teknis dapat dilakukan melalui WhatsApp support di +62 812-3456-7890 dengan menunjukkan Nomor Faktur.<br/>
                    4. Segel garansi pada perangkat keras tidak boleh rusak atau terindikasi modifikasi hardware tanpa izin.
                </div>
            </td>
            <td style="width: 35%; text-align: center; vertical-align: top;">
                <div class="seal-box">
                    <div style="font-size: 9.5px; font-weight: bold; color: #0f172a; margin-bottom: 8px;">
                        Surabaya, {{ \Carbon\Carbon::parse($order->created_at)->translatedFormat('d F Y') }}<br/>
                        <span style="font-size: 8.5px; color: #64748b; font-weight: normal;">Dodolan Store Finance &amp; Operations</span>
                    </div>

                    <div class="seal-circle">
                        DODOLAN<br/>
                        STORE<br/>
                        OFFICIAL
                    </div>

                    <div style="font-size: 10px; font-weight: bold; color: #0f172a; text-decoration: underline;">
                        Finance Department
                    </div>
                    <div style="font-size: 8px; color: #059669; font-family: 'Courier New', Courier, monospace;">
                        VERIFIED SECURE DIGITAL
                    </div>
                </div>
            </td>
        </tr>
    </table>

    <!-- Footer -->
    <div class="footer">
        Faktur ini diterbitkan secara otomatis dan sah oleh sistem komputerisasi PT Dodolan Teknologi Nusantara tanpa memerlukan tanda tangan basah fisik.<br/>
        &copy; {{ date('Y') }} Dodolan Store &bull; Inovasi Perangkat Cerdas &bull; https://dodolan.store
    </div>

</body>
</html>
