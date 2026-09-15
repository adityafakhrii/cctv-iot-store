import { Link, router } from '@inertiajs/react';
import { CustomerLayout } from '@/layouts/customer-layout';
import { formatRupiah, formatDate } from '@/lib/format';
import { 
    Search, 
    ShoppingBag, 
    ChevronRight, 
    Clock, 
    PackageCheck, 
    Truck, 
    CheckCircle2, 
    ExternalLink,
    Filter,
    Loader2
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { getCourierTracker } from '@/lib/courier';

interface OrderItem {
    id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
}

interface Order {
    id: number;
    order_number: string;
    total: number;
    order_status: string;
    payment_status: string;
    shipping_courier: string | null;
    tracking_number: string | null;
    created_at: string;
    items: OrderItem[];
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    orders: {
        data: Order[];
        links: PaginationLink[];
        total: number;
    };
    filters: {
        q: string;
        status: string;
        payment_status: string;
    };
}

export default function CustomerOrdersIndex({ orders, filters }: Props) {
    const [searchQuery, setSearchQuery] = useState(filters.q || '');
    const [confirmOrder, setConfirmOrder] = useState<Order | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleConfirmReceived = () => {
        if (!confirmOrder) return;
        setIsSubmitting(true);
        router.patch(`/pesanan/${confirmOrder.order_number}/terima`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                const num = confirmOrder.order_number;
                setConfirmOrder(null);
                setIsSubmitting(false);
                toast.success(`Pesanan #${num} berhasil dikonfirmasi diterima!`);
            },
            onError: (errors) => {
                setIsSubmitting(false);
                const message = Object.values(errors)[0] || 'Gagal mengonfirmasi pesanan. Silakan coba lagi.';
                toast.error(String(message));
            },
        });
    };

    const statusTabs = [
        { label: 'Semua Status', value: '' },
        { label: 'Menunggu Pembayaran', value: 'Menunggu Pembayaran' },
        { label: 'Dibayar / Diproses', value: 'Diproses' },
        { label: 'Sedang Dikirim', value: 'Dikirim' },
        { label: 'Selesai', value: 'Selesai' },
    ];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.visit('/akun/pesanan', {
            data: {
                ...filters,
                q: searchQuery,
            },
            preserveState: true,
        });
    };

    const handleStatusTabClick = (statusValue: string) => {
        router.visit('/akun/pesanan', {
            data: {
                ...filters,
                status: statusValue,
            },
            preserveState: true,
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Menunggu Pembayaran':
                return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300';
            case 'Dibayar':
            case 'Diproses':
                return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300';
            case 'Dikirim':
                return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300';
            case 'Selesai':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300';
            default:
                return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300';
        }
    };

    return (
        <CustomerLayout
            title="Riwayat Pesanan"
            description="Lacak status pengiriman, nomor resi kurir, dan riwayat invoice pembayaran Anda."
            action={
                <Link
                    href="/produk"
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-500 transition"
                >
                    <ShoppingBag className="h-4 w-4" />
                    <span>Tambah Pesanan Baru</span>
                </Link>
            }
        >
            {/* Search and Status Filters */}
            <div className="space-y-3 sm:space-y-4">
                {/* Status Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {statusTabs.map((tab) => {
                        const active = filters.status === tab.value;
                        return (
                            <button
                                key={tab.label}
                                type="button"
                                onClick={() => handleStatusTabClick(tab.value)}
                                className={`min-h-[40px] px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                                    active
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs dark:bg-white dark:text-slate-900 dark:border-white'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800'
                                }`}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari no. pesanan (DDL-...) atau nama produk..."
                            className="w-full min-h-[44px] rounded-2xl border border-slate-200 bg-white px-4 pl-10 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                        />
                        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    </div>
                    <button
                        type="submit"
                        className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition"
                    >
                        Cari
                    </button>
                </form>
            </div>

            {/* Orders List */}
            {orders.data.length > 0 ? (
                <div className="space-y-4">
                    {orders.data.map((order) => (
                        <div
                            key={order.id}
                            className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4 hover:border-slate-300 transition"
                        >
                            {/* Card Top Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
                                <div className="flex items-center gap-2.5">
                                    <span className="text-xs font-mono font-extrabold text-slate-900 dark:text-white">
                                        #{order.order_number}
                                    </span>
                                    <span className="text-[11px] text-slate-400">
                                        {formatDate(order.created_at)}
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-1.5">
                                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${getStatusBadge(order.order_status)}`}>
                                        {order.order_status}
                                    </span>
                                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                                        order.payment_status === 'Paid'
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            : 'bg-amber-50 text-amber-700 border-amber-200'
                                    }`}>
                                        {order.payment_status === 'Paid' ? 'Lunas' : 'Belum Lunas'}
                                    </span>
                                </div>
                            </div>

                            {/* Tracking info banner if shipped */}
                            {order.tracking_number && (
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 dark:bg-purple-950/50 dark:border-purple-800 dark:text-purple-200 text-xs gap-2">
                                    <div className="flex items-center gap-2">
                                        <Truck className="h-4 w-4 text-purple-600 shrink-0" />
                                        <span className="leading-relaxed">
                                            Kurir: <strong className="font-bold">{order.shipping_courier || 'Ekspedisi'}</strong> — No. Resi: <strong className="font-mono font-bold tracking-wider">{order.tracking_number}</strong>
                                        </span>
                                    </div>
                                    {getCourierTracker(order.shipping_courier, order.tracking_number) && (
                                        <a
                                            href={getCourierTracker(order.shipping_courier, order.tracking_number)!.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="self-start sm:self-auto inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 hover:text-purple-900 dark:text-purple-300 dark:hover:text-white underline shrink-0"
                                        >
                                            <span>Lacak di Website {order.shipping_courier || 'Kurir'}</span>
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    )}
                                </div>
                            )}

                            {/* Items Preview */}
                            <div className="space-y-2">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between text-xs gap-3">
                                        <div className="text-slate-700 dark:text-slate-300 font-medium line-clamp-1">
                                            {item.product_name} <span className="text-slate-400 font-normal">({item.quantity}x)</span>
                                        </div>
                                        <div className="text-slate-900 dark:text-white font-bold shrink-0">
                                            {formatRupiah(item.unit_price * item.quantity)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Card Footer */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 gap-3">
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Tagihan</span>
                                    <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                                        {formatRupiah(order.total)}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 sm:flex items-center gap-2 pt-1 sm:pt-0">
                                    {order.order_status === 'Menunggu Pembayaran' && (
                                        <Link
                                            href={`/pembayaran/${order.order_number}`}
                                            className="min-h-[42px] flex items-center justify-center px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition"
                                        >
                                            Bayar Sekarang
                                        </Link>
                                    )}

                                    {order.order_status === 'Dikirim' && (
                                        <button
                                            type="button"
                                            onClick={() => setConfirmOrder(order)}
                                            className="min-h-[42px] flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                                        >
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                            <span>Pesanan Diterima</span>
                                        </button>
                                    )}

                                    <Link
                                        href={`/akun/pesanan/${order.order_number}`}
                                        className={`min-h-[42px] flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 transition ${
                                            order.order_status === 'Menunggu Pembayaran' || order.order_status === 'Dikirim' ? '' : 'col-span-2 sm:col-span-1'
                                        }`}
                                    >
                                        <span>Rincian &amp; Lacak</span>
                                        <ChevronRight className="h-3.5 w-3.5" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Pagination */}
                    {orders.links.length > 3 && (
                        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-4">
                            {orders.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    preserveState
                                    className={`min-h-[40px] min-w-[40px] flex items-center justify-center px-3 py-2 rounded-xl text-xs font-bold transition ${
                                        link.active
                                            ? 'bg-emerald-600 text-white'
                                            : link.url
                                            ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300'
                                            : 'opacity-40 cursor-not-allowed text-slate-400'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 text-center space-y-3 dark:border-slate-800 dark:bg-slate-900">
                    <ShoppingBag className="h-12 w-12 text-slate-300 mx-auto" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Tidak ada pesanan ditemukan</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                        {filters.q || filters.status
                            ? 'Tidak ada pesanan yang cocok dengan kriteria filter pencarian Anda.'
                            : 'Anda belum memiliki riwayat pemesanan perangkat IoT di Dodolan Store.'}
                    </p>
                    <div className="pt-2">
                        <Link
                            href="/produk"
                            className="inline-flex min-h-[44px] items-center justify-center px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition"
                        >
                            Belanja Sekarang
                        </Link>
                    </div>
                </div>
            )}

            {/* Confirmation Modal Dialog */}
            {confirmOrder && (
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
                                    Pastikan seluruh perangkat IoT dan kelengkapan pada pesanan <strong>#{confirmOrder.order_number}</strong> telah sampai dalam kondisi baik.
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
                                onClick={() => setConfirmOrder(null)}
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
