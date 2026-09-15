import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { AdminLayout } from '@/layouts/admin-layout';
import { CustomSelect } from '@/components/ui/custom-select';
import { formatRupiah, formatDate, getWhatsAppLink } from '@/lib/format';
import { ChevronLeft, Phone, Mail, MapPin, CreditCard, ShoppingCart, CheckCircle2, Truck, RefreshCw, MessageSquare, ExternalLink, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { COURIER_PRESETS, getCourierTracker } from '@/lib/courier';

interface OrderStatusLog {
    id?: number;
    status: string;
    description?: string | null;
    created_at: string;
}

interface OrderItem {
    id: number;
    product_name: string;
    unit_price: number;
    quantity: number;
    subtotal: number;
}

interface Payment {
    id: number;
    provider: string;
    payment_reference: string;
    amount: number;
    status: string;
    paid_at?: string;
}

interface Order {
    id: number;
    order_number: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    customer_address: string;
    shipping_courier?: string;
    tracking_number?: string;
    note?: string;
    subtotal: number;
    total: number;
    payment_status: string;
    order_status: string;
    created_at: string;
    items: OrderItem[];
    payments: Payment[];
    status_logs?: OrderStatusLog[];
    timeline_logs?: OrderStatusLog[];
}

interface OrderShowProps {
    order: Order;
}

export default function OrderShow({ order }: OrderShowProps) {
    const isKnownPreset = order.shipping_courier ? (COURIER_PRESETS as readonly string[]).includes(order.shipping_courier) : false;
    const initialPreset = order.shipping_courier
        ? (isKnownPreset ? order.shipping_courier : 'Lainnya')
        : 'JNE';

    const [status, setStatus] = useState(order.order_status);
    const [courierPreset, setCourierPreset] = useState(initialPreset);
    const [customCourier, setCustomCourier] = useState(isKnownPreset ? '' : (order.shipping_courier || ''));
    const [shippingCourier, setShippingCourier] = useState(order.shipping_courier || 'JNE');
    const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || '');
    const [updating, setUpdating] = useState(false);

    const logs: OrderStatusLog[] = (order.status_logs && order.status_logs.length > 0)
        ? order.status_logs
        : (order.timeline_logs || []);

    const tracker = getCourierTracker(order.shipping_courier, order.tracking_number);

    const handleUpdateStatus = (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);
        router.patch(`/admin/orders/${order.id}/status`, { 
            order_status: status,
            shipping_courier: shippingCourier,
            tracking_number: trackingNumber,
        }, {
            onSuccess: () => {
                setUpdating(false);
                toast.success('Status dan data pengiriman pesanan berhasil diperbarui.');
            },
            onError: () => setUpdating(false),
        });
    };

    const waCustomerMessage = `Halo ${order.customer_name}, kami dari Dodolan Store ingin menginfokan bahwa pesanan Anda #${order.order_number} saat ini berstatus "${order.order_status}"${order.tracking_number ? ` dengan nomor resi ${order.shipping_courier || 'kurir'}: ${order.tracking_number}` : ''}.`;

    return (
        <AdminLayout title={`Detail Pesanan #${order.order_number}`}>
            <Head title={`Admin - Pesanan #${order.order_number} — Dodolan Store`} />

            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center gap-2">
                    <Link
                        href="/admin/orders"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span>Kembali ke Daftar Pesanan</span>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
                    {/* Left 2 Cols: Order Items & Customer Snapshot */}
                    <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                        {/* Order Header Card */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                                <div>
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Nomor Pesanan</span>
                                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-mono">
                                        #{order.order_number}
                                    </h2>
                                </div>
                                <div className="sm:text-right">
                                    <span className="text-[11px] text-slate-400 block">Waktu Transaksi</span>
                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{formatDate(order.created_at)}</span>
                                </div>
                            </div>

                            {/* Customer Details Snapshot */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
                                <div>
                                    <span className="text-slate-400 block text-[11px]">Nama Pemesan:</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{order.customer_name}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-[11px]">Email:</span>
                                    <span className="text-slate-700 dark:text-slate-300 break-all">{order.customer_email}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-[11px]">No. WhatsApp / HP:</span>
                                    <span className="text-slate-700 dark:text-slate-300 font-mono">{order.customer_phone}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-[11px]">Alamat Pengiriman:</span>
                                    <span className="text-slate-700 dark:text-slate-300 leading-relaxed">{order.customer_address}</span>
                                </div>
                                {order.shipping_courier && (
                                    <div>
                                        <span className="text-slate-400 block text-[11px]">Ekspedisi:</span>
                                        <span className="font-bold text-purple-600 dark:text-purple-400">{order.shipping_courier}</span>
                                    </div>
                                )}
                                {order.tracking_number && (
                                    <div>
                                        <span className="text-slate-400 block text-[11px]">Nomor Resi:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{order.tracking_number}</span>
                                            {tracker && (
                                                <a
                                                    href={tracker.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400 underline"
                                                    title={tracker.label}
                                                >
                                                    <span>Lacak</span>
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {order.note && (
                                    <div className="sm:col-span-2">
                                        <span className="text-slate-400 block text-[11px]">Catatan Pesanan:</span>
                                        <span className="text-slate-700 dark:text-slate-300 italic">{order.note}</span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-2">
                                <a
                                    href={getWhatsAppLink(order.customer_phone, waCustomerMessage)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full sm:w-auto inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-emerald-50 text-emerald-700 px-4 py-2.5 text-xs font-bold hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400 transition"
                                >
                                    <MessageSquare className="h-4 w-4" />
                                    <span>Hubungi / Notifikasi Customer via WhatsApp</span>
                                </a>
                            </div>
                        </div>

                        {/* Order Items Table */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-4">
                            <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">
                                Rincian Hardware (Snapshot Harga)
                            </h3>

                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {order.items.map((item) => (
                                    <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                                        <div>
                                            <div className="font-bold text-slate-900 dark:text-white">{item.product_name}</div>
                                            <div className="text-slate-400 text-[11px]">{item.quantity} unit x {formatRupiah(item.unit_price)}</div>
                                        </div>
                                        <div className="font-bold text-slate-900 dark:text-white">
                                            {formatRupiah(item.subtotal)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex justify-between items-baseline text-sm">
                                <span className="font-bold text-slate-900 dark:text-white">Total Tagihan:</span>
                                <span className="font-black text-lg sm:text-xl text-emerald-600 dark:text-emerald-400">{formatRupiah(order.total)}</span>
                            </div>
                        </div>

                        {/* Timeline Kronologi Pesanan */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-emerald-600" />
                                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                                        Timeline Kronologi Pesanan
                                    </h3>
                                </div>
                                <span className="text-[11px] text-slate-400 font-mono">
                                    {logs.length} Riwayat Tercatat
                                </span>
                            </div>

                            <div className="relative pl-4 sm:pl-6 border-l-2 border-slate-200 dark:border-slate-700 ml-3 sm:ml-4 space-y-4 py-1">
                                {logs.map((log, idx) => (
                                    <div key={idx} className="relative group">
                                        <div className={`absolute -left-[23px] sm:-left-[31px] top-1 h-3.5 w-3.5 rounded-full ring-4 ring-white dark:ring-slate-900 ${
                                            log.status === 'Selesai'
                                                ? 'bg-emerald-600'
                                                : log.status === 'Dikirim'
                                                ? 'bg-purple-600'
                                                : log.status === 'Diproses' || log.status === 'Dibayar'
                                                ? 'bg-blue-600'
                                                : 'bg-amber-500'
                                        }`} />

                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                                    log.status === 'Selesai'
                                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                                        : log.status === 'Dikirim'
                                                        ? 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                                                        : log.status === 'Diproses' || log.status === 'Dibayar'
                                                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                                }`}>
                                                    {log.status}
                                                </span>
                                            </div>
                                            <span className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400">
                                                {formatDate(log.created_at)}
                                            </span>
                                        </div>

                                        {log.description && (
                                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                                                {log.description}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Col: Status Management & Payment Log */}
                    <div className="space-y-4 sm:space-y-6">
                        {/* Order Status Transition Form */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-4">
                            <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">
                                Update Status &amp; Pengiriman
                            </h3>

                            <form onSubmit={handleUpdateStatus} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                        Status Progres
                                    </label>
                                    <CustomSelect
                                        value={status}
                                        onChange={(val) => setStatus(val)}
                                        className="w-full"
                                        options={[
                                            { value: 'Menunggu Pembayaran', label: 'Menunggu Pembayaran' },
                                            { value: 'Dibayar', label: 'Dibayar (Lunas)' },
                                            { value: 'Diproses', label: 'Diproses (Packing & QC)' },
                                            { value: 'Dikirim', label: 'Dikirim (Dalam Ekspedisi)' },
                                            { value: 'Selesai', label: 'Selesai (Pesanan Tuntas)' },
                                        ]}
                                    />
                                </div>

                                {(status === 'Dikirim' || status === 'Selesai') && (
                                    <div className="space-y-4 pt-1 border-t border-slate-100 dark:border-slate-800 animate-in fade-in-50 duration-200">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                                Nama Ekspedisi / Kurir
                                            </label>
                                            <CustomSelect
                                                value={courierPreset}
                                                onChange={(val) => {
                                                    setCourierPreset(val);
                                                    if (val === 'Lainnya') {
                                                        setShippingCourier(customCourier);
                                                    } else {
                                                        setShippingCourier(val);
                                                    }
                                                }}
                                                className="w-full"
                                                options={[
                                                    ...COURIER_PRESETS.map((c) => ({ value: c, label: c })),
                                                    { value: 'Lainnya', label: 'Lainnya (Input Manual...)' },
                                                ]}
                                            />
                                            {courierPreset === 'Lainnya' && (
                                                <input
                                                    type="text"
                                                    value={customCourier}
                                                    onChange={(e) => {
                                                        setCustomCourier(e.target.value);
                                                        setShippingCourier(e.target.value);
                                                    }}
                                                    placeholder="Ketik nama ekspedisi / kurir manual..."
                                                    className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                                    required
                                                />
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                                Nomor Resi Pelacakan
                                            </label>
                                            <input
                                                type="text"
                                                value={trackingNumber}
                                                onChange={(e) => setTrackingNumber(e.target.value)}
                                                placeholder="Contoh: JNE1234567890"
                                                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="w-full min-h-[44px] rounded-xl bg-emerald-600 py-2.5 px-4 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50 transition"
                                >
                                    {updating 
                                        ? 'Menyimpan...' 
                                        : (status === 'Dikirim' || status === 'Selesai' ? 'Perbarui Status & Resi' : 'Perbarui Status Pesanan')}
                                </button>
                            </form>
                        </div>

                        {/* Payment Gateway Information */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-3">
                            <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">
                                Informasi Pembayaran
                            </h3>

                            <div className="space-y-2.5 text-xs">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Status Pembayaran:</span>
                                    <span className={`font-bold px-2 py-0.5 rounded-md ${
                                        order.payment_status === 'Paid'
                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                                    }`}>
                                        {order.payment_status}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Provider:</span>
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">Mayar Gateway</span>
                                </div>
                                {order.payments && order.payments.length > 0 && (
                                    <div className="flex justify-between items-center gap-2">
                                        <span className="text-slate-400">Mayar Reference:</span>
                                        <span className="font-mono text-slate-700 dark:text-slate-300 truncate max-w-[150px]">{order.payments[0].payment_reference}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
