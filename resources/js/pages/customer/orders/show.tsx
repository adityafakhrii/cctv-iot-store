import { Link, router } from '@inertiajs/react';
import { CustomerLayout } from '@/layouts/customer-layout';
import { formatRupiah, formatDate } from '@/lib/format';
import { 
    ChevronLeft, 
    Printer, 
    CreditCard, 
    Truck, 
    Copy, 
    Check, 
    CheckCircle2, 
    Package, 
    ExternalLink, 
    MapPin,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { getCourierTracker } from '@/lib/courier';

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
    method: string;
    status: string;
    paid_at: string | null;
    created_at: string;
}

interface Order {
    id: number;
    order_number: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    customer_address: string;
    shipping_courier: string | null;
    tracking_number: string | null;
    note: string | null;
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

interface Props {
    order: Order;
}

export default function CustomerOrderShow({ order }: Props) {
    const [copied, setCopied] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const logs: OrderStatusLog[] = (order.status_logs && order.status_logs.length > 0)
        ? order.status_logs
        : (order.timeline_logs || []);

    const tracker = getCourierTracker(order.shipping_courier, order.tracking_number);

    const handleCopyTracking = () => {
        if (!order.tracking_number) return;
        navigator.clipboard.writeText(order.tracking_number);
        setCopied(true);
        toast.success('Nomor resi berhasil disalin!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePrintInvoice = () => {
        window.print();
    };

    const handleConfirmReceived = () => {
        setIsSubmitting(true);
        router.patch(`/pesanan/${order.order_number}/terima`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setShowConfirmModal(false);
                setIsSubmitting(false);
                toast.success(`Pesanan #${order.order_number} berhasil dikonfirmasi diterima!`);
            },
            onError: (errors) => {
                setIsSubmitting(false);
                const message = Object.values(errors)[0] || 'Gagal mengonfirmasi penerimaan pesanan. Silakan coba lagi.';
                toast.error(String(message));
            },
        });
    };

    const steps = [
        { key: 'Menunggu Pembayaran', label: 'Menunggu Bayar' },
        { key: 'Dibayar', label: 'Pembayaran Lunas' },
        { key: 'Diproses', label: 'Sedang Diproses' },
        { key: 'Dikirim', label: 'Dalam Pengiriman' },
        { key: 'Selesai', label: 'Pesanan Selesai' },
    ];

    const getStepIndex = (status: string) => {
        switch (status) {
            case 'Menunggu Pembayaran': return 0;
            case 'Dibayar': return 1;
            case 'Diproses': return 2;
            case 'Dikirim': return 3;
            case 'Selesai': return 4;
            default: return 0;
        }
    };

    const currentStepIndex = getStepIndex(order.order_status);

    return (
        <CustomerLayout
            title={`Pesanan #${order.order_number}`}
            description={`Dipesan pada ${formatDate(order.created_at)} • Rincian status pengiriman, tagihan pembayaran, dan data alamat pesanan.`}
            action={
                <div className="flex items-center gap-2">
                    <Link
                        href="/akun/pesanan"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 text-xs font-bold transition"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span>Kembali</span>
                    </Link>
                    {order.order_status === 'Dikirim' && (
                        <button
                            type="button"
                            onClick={() => setShowConfirmModal(true)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                        >
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Pesanan Diterima</span>
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={handlePrintInvoice}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition shadow-xs"
                    >
                        <Printer className="h-4 w-4" />
                        <span>Cetak Invoice</span>
                    </button>
                </div>
            }
        >
            {/* Visual Order Timeline Tracker */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-5 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
                    <div>
                        <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                            Status Pengiriman &amp; Pemrosesan
                        </h2>
                        <p className="text-[11px] text-slate-400">Tahapan progres perakitan, QC, dan kurir ekspedisi.</p>
                    </div>
                    <span className="self-start sm:self-auto text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                        {order.order_status}
                    </span>
                </div>

                {/* Progress Tracker Steps */}
                <div className="relative">
                    <div className="hidden sm:block absolute top-1/2 left-4 right-4 h-0.5 -translate-y-1/2 bg-slate-200 dark:bg-slate-800 z-0" />
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 sm:gap-4 relative z-10">
                        {steps.map((step, idx) => {
                            const isCompleted = idx <= currentStepIndex;
                            const isCurrent = idx === currentStepIndex;
                            const stepLog = logs.find((l) => l.status === step.key);
                            const stepDate = stepLog?.created_at 
                                ? formatDate(stepLog.created_at) 
                                : (isCompleted ? formatDate(order.created_at) : null);

                            return (
                                <div key={step.key} className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2 p-2 sm:p-0 rounded-xl bg-slate-50/70 sm:bg-transparent dark:bg-slate-800/40 sm:dark:bg-transparent">
                                    <div
                                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold transition shadow-sm ${
                                            isCompleted
                                                ? 'bg-emerald-600 text-white ring-4 ring-emerald-50 dark:ring-emerald-950'
                                                : 'bg-slate-100 text-slate-400 border border-slate-300 dark:bg-slate-800 dark:border-slate-700'
                                        }`}
                                    >
                                        {isCompleted ? <Check className="h-4 w-4" /> : idx + 1}
                                    </div>
                                    <div className="text-left sm:text-center">
                                        <p className={`text-xs font-bold ${isCurrent ? 'text-emerald-600 dark:text-emerald-400' : isCompleted ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                                            {step.label}
                                        </p>
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5 sm:mt-1">
                                            {stepDate || '-'}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Courier & Tracking Number Card */}
            {order.tracking_number && (
                <div className="rounded-2xl border border-purple-200 bg-purple-50/70 p-4 sm:p-6 dark:border-purple-900 dark:bg-purple-950/40 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white shadow-sm">
                            <Truck className="h-5 w-5" />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                                Ekspedisi Pengiriman
                            </span>
                            <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                                {order.shipping_courier || 'Kurir Ekspedisi'}
                            </p>
                            <p className="text-xs font-mono font-bold text-purple-900 dark:text-purple-200 mt-0.5 break-all">
                                Resi: {order.tracking_number}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        {tracker && (
                            <a
                                href={tracker.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex min-h-[44px] items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition shadow-xs cursor-pointer"
                            >
                                <span>{tracker.label}</span>
                                <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                        )}
                        <button
                            type="button"
                            onClick={handleCopyTracking}
                            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-purple-200 text-xs font-bold text-purple-700 hover:bg-purple-50 dark:bg-purple-900 dark:border-purple-800 dark:text-white transition shadow-xs cursor-pointer"
                        >
                            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                            <span>{copied ? 'Tersalin' : 'Salin Nomor Resi'}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Confirm Received Action Card when Order is Shipped */}
            {order.order_status === 'Dikirim' && (
                <div className="rounded-2xl border border-emerald-300 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-emerald-50 p-4 sm:p-6 dark:border-emerald-800 dark:bg-gradient-to-r dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-emerald-950/40 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                            <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                                Konfirmasi Penerimaan Paket
                            </span>
                            <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                                Apakah paket pesanan telah sampai di tujuan?
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 max-w-xl leading-relaxed">
                                Jika Anda telah menerima perangkat IoT ini dalam kondisi lengkap dan berfungsi dengan baik, silakan konfirmasi pesanan telah diterima untuk menyelesaikan transaksi.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowConfirmModal(true)}
                        className="w-full sm:w-auto inline-flex min-h-[44px] items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition shadow-sm cursor-pointer shrink-0"
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Pesanan Diterima</span>
                    </button>
                </div>
            )}

            {/* Order Items Table */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
                <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                    Rincian Produk Pesanan
                </h2>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {order.items.map((item) => (
                        <div key={item.id} className="py-3.5 flex items-center justify-between gap-3 text-xs">
                            <div className="min-w-0 flex-1">
                                <p className="font-bold text-slate-900 dark:text-white line-clamp-2">
                                    {item.product_name}
                                </p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                    {formatRupiah(item.unit_price)} &times; {item.quantity} unit
                                </p>
                            </div>
                            <div className="text-right font-extrabold text-slate-900 dark:text-white shrink-0">
                                {formatRupiah(item.subtotal)}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Subtotal and Total */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex justify-between text-xs text-slate-500">
                        <span>Subtotal Produk</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{formatRupiah(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                        <span>Biaya Pengiriman</span>
                        <span className="font-bold text-emerald-600">Gratis / Penyesuaian</span>
                    </div>
                    <div className="flex justify-between text-sm font-extrabold text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span>Total Tagihan</span>
                        <span className="text-emerald-600 dark:text-emerald-400 text-base sm:text-lg">{formatRupiah(order.total)}</span>
                    </div>
                </div>
            </div>

            {/* 2-Column: Customer Details & Payment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Customer Address Info */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                        <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                            Alamat Pengiriman
                        </h2>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                        <p className="font-bold text-slate-900 dark:text-white">{order.customer_name}</p>
                        <p className="text-slate-500">{order.customer_phone} &bull; {order.customer_email}</p>
                        <p className="pt-1 leading-relaxed text-slate-600 dark:text-slate-400 whitespace-pre-line">{order.customer_address}</p>
                        {order.note && (
                            <p className="pt-2 text-[11px] italic text-slate-400">
                                Catatan: &quot;{order.note}&quot;
                            </p>
                        )}
                    </div>
                </div>

                {/* Payment Gateway Summary */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <CreditCard className="h-4 w-4 text-emerald-600 shrink-0" />
                        <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                            Status Pembayaran
                        </h2>
                    </div>

                    <div className="space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-500">Metode Gateway:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">Mayar Payment</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-slate-500">Status Transaksi:</span>
                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${
                                order.payment_status === 'Paid'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                                {order.payment_status === 'Paid' ? 'Lunas (Paid)' : 'Menunggu Pembayaran'}
                            </span>
                        </div>

                        {order.payment_status !== 'Paid' && (
                            <div className="pt-2">
                                <Link
                                    href={`/pembayaran/${order.order_number}`}
                                    className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition"
                                >
                                    <span>Buka Instruksi Pembayaran Mayar</span>
                                    <ExternalLink className="h-3.5 w-3.5" />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Confirmation Modal Dialog */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
                    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-2xl space-y-4 animate-in zoom-in-95">
                        <div className="flex items-start gap-3.5">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Konfirmasi Pesanan Diterima?
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                    Pastikan seluruh perangkat IoT dan kelengkapan pada pesanan <strong>#{order.order_number}</strong> telah Anda terima dalam kondisi baik dan berfungsi normal.
                                </p>
                            </div>
                        </div>

                        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 text-[11px] text-slate-500 dark:text-slate-400">
                            Status pesanan akan diubah menjadi <strong className="text-emerald-600 dark:text-emerald-400 font-bold">Selesai</strong>. Tindakan ini tidak dapat dibatalkan.
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => setShowConfirmModal(false)}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer"
                            >
                                Periksa Kembali
                            </button>
                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={handleConfirmReceived}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition shadow-xs disabled:opacity-50 cursor-pointer"
                            >
                                {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                <span>Ya, Pesanan Diterima</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </CustomerLayout>
    );
}
