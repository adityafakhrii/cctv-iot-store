<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Invoice #{{ $order->order_number }} - {{ $storeSettings['store_name'] ?? 'Dodolan Store' }}</title>
    <style>
        /* DOMPDF-safe: no @page margin, use body padding instead */
        @page {
            size: a4 portrait;
            margin: 0;
        }
        body {
            font-family: Helvetica, Arial, sans-serif;
            color: #333333;
            font-size: 9pt;
            line-height: 1.4;
            margin: 0;
            padding: 50px 55px 40px 55px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        td, th {
            vertical-align: top;
        }

        /* === HEADER === */
        .hdr td {
            padding: 0 0 8px 0;
        }
        .brand {
            font-size: 18pt;
            font-weight: bold;
            color: #111111;
            line-height: 1;
        }
        .brand span {
            color: #059669;
        }
        .tagline {
            font-size: 7pt;
            color: #059669;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 2px;
            padding-top: 3px;
        }
        .inv-title {
            font-size: 24pt;
            font-weight: bold;
            color: #cccccc;
            text-align: right;
            letter-spacing: 3px;
            line-height: 1;
        }

        /* === DIVIDER === */
        .divider {
            border: none;
            height: 2px;
            background-color: #059669;
            margin: 0 0 15px 0;
        }

        /* === META === */
        .meta {
            margin-bottom: 18px;
        }
        .meta td {
            font-size: 8.5pt;
            padding: 2px 0;
        }
        .meta .lbl {
            color: #888888;
            width: 85px;
        }
        .meta .val {
            color: #111111;
            font-weight: bold;
        }
        .badge-ok {
            background-color: #d1fae5;
            color: #065f46;
            padding: 1px 8px;
            font-size: 7.5pt;
            font-weight: bold;
            letter-spacing: 0.5px;
        }
        .badge-wait {
            background-color: #fef3c7;
            color: #92400e;
            padding: 1px 8px;
            font-size: 7.5pt;
            font-weight: bold;
            letter-spacing: 0.5px;
        }

        /* === INFO CARDS === */
        .info-wrap {
            margin-bottom: 18px;
        }
        .info-wrap td {
            padding: 0;
        }
        .sec-title {
            font-size: 7pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #059669;
            border-bottom: 1px solid #e0e0e0;
            padding-bottom: 4px;
            margin-bottom: 6px;
        }
        .cust-name {
            font-size: 10pt;
            font-weight: bold;
            color: #111111;
            padding-top: 6px;
        }
        .cust-detail {
            font-size: 8.5pt;
            color: #666666;
            line-height: 1.5;
        }

        /* === ITEMS TABLE === */
        .items {
            margin-bottom: 0;
        }
        .items th {
            background-color: #111111;
            color: #ffffff;
            font-size: 7pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            padding: 8px 10px;
        }
        .items td {
            padding: 10px 10px;
            font-size: 8.5pt;
            border-bottom: 1px solid #eeeeee;
        }
        .items tr:last-child td {
            border-bottom: none;
        }
        .pname {
            font-weight: bold;
            color: #111111;
            font-size: 9pt;
        }
        .psku {
            font-size: 7pt;
            color: #aaaaaa;
        }

        /* === TOTALS === */
        .totals-wrap {
            margin-bottom: 25px;
        }
        .totals td {
            font-size: 8.5pt;
            padding: 4px 10px;
        }
        .totals .tl {
            text-align: right;
            color: #888888;
        }
        .totals .tv {
            text-align: right;
            color: #111111;
            font-weight: bold;
            width: 120px;
        }
        .totals .gt td {
            border-top: 2px solid #111111;
            padding-top: 8px;
            padding-bottom: 8px;
        }
        .totals .gt .tl {
            font-size: 10pt;
            font-weight: bold;
            color: #111111;
            text-transform: uppercase;
        }
        .totals .gt .tv {
            font-size: 12pt;
            font-weight: bold;
            color: #059669;
            width: 120px;
        }

        /* === FOOTER === */
        .foot {
            border-top: 1px solid #e0e0e0;
            padding-top: 12px;
        }
        .foot td {
            font-size: 7.5pt;
            color: #aaaaaa;
            padding: 0;
        }
        .foot .co {
            color: #888888;
            font-weight: bold;
        }
        .sign-co {
            font-size: 8.5pt;
            font-weight: bold;
            color: #111111;
            padding-bottom: 12px;
        }
        .sign-badge {
            font-size: 7pt;
            color: #999999;
            font-weight: bold;
            letter-spacing: 0.5px;
            border: 1px solid #dddddd;
            padding: 2px 8px;
        }

        .pg-foot {
            text-align: center;
            font-size: 7pt;
            color: #cccccc;
            padding-top: 15px;
        }
    </style>
</head>
<body>

    <!-- HEADER -->
    <table class="hdr">
        <tr>
            <td style="width: 55%;">
                <div class="brand">dodolan<span>.</span>store</div>
                <div class="tagline">E-Commerce Platform</div>
            </td>
            <td style="width: 45%;">
                <div class="inv-title">INVOICE</div>
            </td>
        </tr>
    </table>

    <!-- DIVIDER -->
    <hr class="divider"/>

    <!-- META INFO -->
    <table class="meta">
        <tr>
            <td style="width: 55%;">
                <table>
                    <tr>
                        <td class="lbl">No. Invoice</td>
                        <td class="val">: INV-{{ $order->order_number }}</td>
                    </tr>
                    <tr>
                        <td class="lbl">Tanggal</td>
                        <td class="val">: {{ \Carbon\Carbon::parse($order->created_at)->translatedFormat('d F Y') }}</td>
                    </tr>
                    <tr>
                        <td class="lbl">Status</td>
                        <td style="padding: 2px 0;">:
                            @if($order->payment_status === \App\Models\Order::PAYMENT_PAID)
                                <span class="badge-ok">LUNAS</span>
                            @else
                                <span class="badge-wait">BELUM BAYAR</span>
                            @endif
                        </td>
                    </tr>
                    @if($order->payment_status === \App\Models\Order::PAYMENT_PAID && $order->latestPayment?->paid_at)
                    <tr>
                        <td class="lbl">Tgl. Lunas</td>
                        <td class="val">: {{ \Carbon\Carbon::parse($order->latestPayment->paid_at)->translatedFormat('d F Y') }}</td>
                    </tr>
                    @endif
                </table>
            </td>
            <td style="width: 45%;"></td>
        </tr>
    </table>

    <!-- CUSTOMER & SHIPPING -->
    <table class="info-wrap">
        <tr>
            <td style="width: 48%; padding-right: 20px;">
                <div class="sec-title">Ditagihkan Kepada</div>
                <div class="cust-name">{{ $order->customer_name }}</div>
                <div class="cust-detail">
                    {{ $order->customer_phone }}<br/>
                    {{ $order->customer_email }}
                </div>
            </td>
            <td style="width: 4%;"></td>
            <td style="width: 48%;">
                <div class="sec-title">Alamat Pengiriman</div>
                <div class="cust-detail" style="padding-top: 6px; color: #333333;">
                    {{ $order->customer_address }}
                </div>
                @if($order->shipping_courier)
                    <div style="padding-top: 4px; font-size: 8.5pt;">
                        <span style="font-weight: bold; color: #111111;">Kurir:</span> {{ $order->shipping_courier }}
                        @if($order->tracking_number)
                            <br/>
                            <span style="font-weight: bold; color: #111111;">No. Resi:</span> {{ $order->tracking_number }}
                        @endif
                    </div>
                @endif
            </td>
        </tr>
    </table>

    <!-- ITEMS -->
    <table class="items">
        <thead>
            <tr>
                <th style="width: 6%; text-align: center;">#</th>
                <th style="width: 48%; text-align: left;">Produk</th>
                <th style="width: 18%; text-align: right;">Harga</th>
                <th style="width: 10%; text-align: center;">Qty</th>
                <th style="width: 18%; text-align: right;">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @forelse($order->items as $i => $item)
                <tr>
                    <td style="text-align: center; color: #cccccc; font-weight: bold;">{{ $i + 1 }}</td>
                    <td>
                        <div class="pname">{{ $item->product_name }}</div>
                        @if($item->product?->sku)
                            <div class="psku">SKU: {{ $item->product->sku }}</div>
                        @endif
                    </td>
                    <td style="text-align: right; color: #555555;">Rp {{ number_format($item->unit_price, 0, ',', '.') }}</td>
                    <td style="text-align: center; font-weight: bold; color: #111111;">{{ $item->quantity }}</td>
                    <td style="text-align: right; font-weight: bold; color: #111111;">Rp {{ number_format($item->subtotal, 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="5" style="text-align: center; padding: 20px; color: #aaaaaa;">Tidak ada item.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <!-- TOTALS -->
    <table class="totals-wrap">
        <tr>
            <td style="width: 58%;"></td>
            <td style="width: 42%;">
                <table class="totals">
                    <tr>
                        <td class="tl">Subtotal</td>
                        <td class="tv">Rp {{ number_format($order->subtotal, 0, ',', '.') }}</td>
                    </tr>
                    <tr>
                        <td class="tl">Ongkir</td>
                        <td class="tv" style="color: #059669;">Gratis</td>
                    </tr>
                    <tr class="gt">
                        <td class="tl">Total</td>
                        <td class="tv">Rp {{ number_format($order->total, 0, ',', '.') }}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <!-- FOOTER -->
    <table class="foot">
        <tr>
            <td style="width: 55%;">
                <span class="co">{{ $storeSettings['company_name'] ?? 'PT Dodolan Teknologi Nusantara' }}</span><br/>
                {{ $storeSettings['store_address'] ?? 'Komp. Fantasy Junction Blok FJ4 No. 15' }}<br/>
                {{ $storeSettings['store_city'] ?? 'Balikpapan, Kalimantan Timur, Indonesia' }} {{ $storeSettings['store_postal_code'] ?? '76114' }}<br/>
                WA: {{ $storeSettings['store_whatsapp'] ?? '081150003775' }} &bull; {{ $storeSettings['store_email'] ?? 'halo@dodolan.store' }}
            </td>
            <td style="width: 45%; text-align: right;">
                <div style="font-size: 7.5pt; color: #aaaaaa;">{{ !empty($storeSettings['store_city']) ? explode(',', $storeSettings['store_city'])[0] : 'Balikpapan' }}, {{ \Carbon\Carbon::parse($order->created_at)->translatedFormat('d F Y') }}</div>
                <div class="sign-co">{{ $storeSettings['store_name'] ?? 'Dodolan Store' }}</div>
                <span class="sign-badge">AUTHORIZED</span>
            </td>
        </tr>
    </table>

    <div class="pg-foot">
        Dokumen ini diterbitkan secara komputerisasi dan sah tanpa tanda tangan basah.
    </div>

</body>
</html>
