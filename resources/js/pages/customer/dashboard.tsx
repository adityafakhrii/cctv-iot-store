import { Link } from '@inertiajs/react';
import { CustomerLayout } from '@/layouts/customer-layout';
import { formatRupiah, formatDate, getWhatsAppLink } from '@/lib/format';
import { useStoreSettings } from '@/hooks/use-store-settings';
import { 
    Clock, 
    PackageCheck, 
    Truck, 
    CheckCircle2, 
    ArrowRight, 
    ShoppingBag, 
    Wrench, 
    PhoneCall, 
    ChevronRight,
    MapPin,
    AlertCircle
} from 'lucide-react';

interface Props {
    stats: {
        total_orders: number;
        pending_payment: number;
        processing: number;
        shipped: number;
        completed: number;
    };
    recentOrders: Array<{
        id: number;
        order_number: string;
        total: number;
        order_status: string;
        payment_status: string;
        created_at: string;
        items: Array<{
            id: number;
            product_name: string;
            quantity: number;
            unit_price: number;
        }>;
    }>;
    recentServices: Array<{
        id: number;
        service_type: string;
        location: string;
        status: string;
        created_at: string;
    }>;
    user: {
        name: string;
        email: string;
        phone: string | null;
        address: string | null;
    };
}

export default function CustomerDashboard({ stats, recentOrders, recentServices, user }: Props) {
    const store = useStoreSettings();
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
            title="Dashboard Akun"
            description="Ringkasan transaksi dan status pesanan armada IoT Anda."
            action={
                <Link
                    href="/produk"
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-500 transition active:scale-95"
                >
                    <ShoppingBag className="h-4 w-4" />
                    <span>Belanja Produk</span>
                </Link>
            }
        >
            {/* Warning if profile address is empty */}
            {(!user.phone || !user.address) && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-200 shadow-xs">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="text-xs">
                            <p className="font-bold">Lengkapi Data Kontak &amp; Alamat Pengiriman</p>
                            <p className="mt-0.5 text-amber-800 dark:text-amber-300 leading-relaxed">
                                Simpan nomor WhatsApp dan alamat pengiriman default Anda agar proses checkout berlangsung otomatis.
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/akun/profil"
                        className="w-full sm:w-auto min-h-[40px] flex items-center justify-center shrink-0 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-xs transition"
                    >
                        Lengkapi Sekarang
                    </Link>
                </div>
            )}

            {/* KPI Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {/* Pending */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 truncate">Menunggu Bayar</span>
                        <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </div>
                    </div>
                    <div className="mt-2.5 text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                        {stats.pending_payment}
                    </div>
                </div>

                {/* Processing */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 truncate">Diproses</span>
                        <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                            <PackageCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </div>
                    </div>
                    <div className="mt-2.5 text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                        {stats.processing}
                    </div>
                </div>

                {/* Shipped */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 truncate">Dikirim</span>
                        <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                            <Truck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </div>
                    </div>
                    <div className="mt-2.5 text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                        {stats.shipped}
                    </div>
                </div>

                {/* Completed */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 truncate">Selesai</span>
                        <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </div>
                    </div>
                    <div className="mt-2.5 text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                        {stats.completed}
                    </div>
                </div>
            </div>

            {/* Recent Orders Section */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
                <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800">
                    <div>
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Pesanan Terbaru</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Daftar transaksi hardware IoT yang baru Anda buat.</p>
                    </div>
                    <Link
                        href="/akun/pesanan"
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-500 flex items-center gap-1 min-h-[36px] px-2"
                    >
                        <span>Semua Pesanan</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>

                {recentOrders.length > 0 ? (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {recentOrders.map((order) => (
                            <div key={order.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                                <div className="space-y-1.5 flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                                            #{order.order_number}
                                        </span>
                                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${getStatusBadge(order.order_status)}`}>
                                            {order.order_status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                                        {order.items?.map((item) => `${item.product_name} (${item.quantity}x)`).join(', ') || 'Item Pesanan'}
                                    </p>
                                    <p className="text-[11px] text-slate-400">
                                        {formatDate(order.created_at)}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                                    <div className="text-left sm:text-right">
                                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Tagihan</span>
                                        <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                                            {formatRupiah(order.total)}
                                        </span>
                                    </div>

                                    <Link
                                        href={`/akun/pesanan/${order.order_number}`}
                                        className="inline-flex min-h-[40px] items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 transition"
                                    >
                                        <span>Rincian</span>
                                        <ChevronRight className="h-3.5 w-3.5" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 sm:p-10 text-center space-y-3">
                        <ShoppingBag className="h-10 w-10 text-slate-300 mx-auto" />
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Belum ada pesanan</p>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                            Anda belum pernah melakukan pemesanan perangkat IoT. Temukan produk berkualitas di katalog kami.
                        </p>
                        <Link
                            href="/produk"
                            className="inline-flex min-h-[44px] items-center justify-center px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs hover:bg-emerald-500 transition"
                        >
                            Jelajah Katalog Produk
                        </Link>
                    </div>
                )}
            </div>

            {/* Quick Link Banner Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Service Request Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                            <Wrench className="h-5 w-5" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Pengajuan Layanan IoT</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            Butuh instalasi perangkat di armada, survey lokasi, atau kalibrasi sensor? Ajukan tiket teknisi langsung.
                        </p>
                    </div>
                    <div className="pt-1">
                        <Link
                            href="/layanan"
                            className="inline-flex min-h-[40px] items-center text-xs font-bold text-emerald-600 hover:underline gap-1"
                        >
                            <span>Ajukan Layanan Baru</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                </div>

                {/* WhatsApp Support Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                            <PhoneCall className="h-5 w-5" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Bantuan &amp; Konsultasi Ahli</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            Ada pertanyaan teknis mengenai kompatibilitas GPS, MDVR, atau integrasi sistem? Hubungi kami langsung.
                        </p>
                    </div>
                    <div className="pt-1">
                        <a
                            href={getWhatsAppLink(store.store_whatsapp, `Halo ${store.store_name}, saya customer (${user.name}) ingin berkonsultasi mengenai pesanan & layanan saya.`)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex min-h-[40px] items-center text-xs font-bold text-emerald-600 hover:underline gap-1"
                        >
                            <span>Chat WhatsApp CS</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                        </a>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
