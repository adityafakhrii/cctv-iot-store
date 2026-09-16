import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { PublicLayout } from '@/layouts/public-layout';
import { ProductCard } from '@/components/product-card';
import {
    ShoppingBag,
    Check,
    PhoneCall,
    ShieldCheck,
    Truck,
    ChevronRight,
    Minus,
    Plus,
    Sparkles,
    Layers
} from 'lucide-react';
import { formatRupiah, getWhatsAppLink } from '@/lib/format';
import { useCart } from '@/hooks/use-cart';
import { useStoreSettings } from '@/hooks/use-store-settings';
import { toast } from 'sonner';

interface ProductDetailProps {
    product: {
        id: number;
        name: string;
        slug: string;
        price: number;
        stock: number;
        stock_status: string;
        image_url: string;
        description: string;
        category?: {
            id: number;
            name: string;
            slug: string;
        };
        images?: Array<{
            id: number;
            path: string;
            image_url: string;
        }>;
    };
    specification: Record<string, string> | null;
    relatedProducts: any[];
}

export default function ProductShow({ product, specification, relatedProducts }: ProductDetailProps) {
    const store = useStoreSettings();
    const { addItem } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(product.image_url);

    const isOutOfStock = product.stock <= 0;

    const handleQuantityChange = (delta: number) => {
        setQuantity((prev) => {
            const next = prev + delta;
            if (next < 1) return 1;
            if (next > product.stock) return product.stock;
            return next;
        });
    };

    const handleAddToCart = () => {
        if (isOutOfStock) return;
        addItem(product, quantity);
        toast.success(`${quantity}x ${product.name} berhasil ditambahkan ke keranjang.`);
    };

    const handleBuyNow = () => {
        if (isOutOfStock) return;
        addItem(product, quantity);
        router.visit('/checkout');
    };

    const waMessage = `Halo ${store.store_name}, saya tertarik dengan produk ${product.name} (Harga: ${formatRupiah(product.price)}). Apakah unit ini ready stock?`;

    return (
        <PublicLayout>
            <Head title={`${product.name} — ${store.store_name}`} />

            {/* Breadcrumb Navigation */}
            <div className="border-b border-slate-200 bg-slate-50 py-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/50">
                <div className="mx-auto flex max-w-[1440px] items-center gap-2 px-4 sm:px-6 lg:px-8">
                    <Link href="/" className="hover:text-emerald-600 transition">Beranda</Link>
                    <ChevronRight className="h-3 w-3 text-slate-400" />
                    <Link href="/produk" className="hover:text-emerald-600 transition">Katalog Produk</Link>
                    <ChevronRight className="h-3 w-3 text-slate-400" />
                    <Link href={`/produk?category=${product.category?.slug}`} className="hover:text-emerald-600 transition">
                        {product.category?.name}
                    </Link>
                    <ChevronRight className="h-3 w-3 text-slate-400" />
                    <span className="text-slate-900 dark:text-white font-semibold truncate max-w-xs sm:max-w-md">
                        {product.name}
                    </span>
                </div>
            </div>

            {/* Main Product Info Container */}
            <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
                    {/* Left: Product Images Gallery */}
                    <div className="lg:col-span-6 space-y-4">
                        <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-md dark:border-slate-800">
                            <img
                                src={selectedImage}
                                alt={product.name}
                                className="h-full w-full object-cover object-center"
                            />
                            {/* Stock Badge */}
                            <div className="absolute top-4 left-4">
                                {isOutOfStock ? (
                                    <span className="inline-flex items-center rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-md">
                                        Stok Habis
                                    </span>
                                ) : product.stock <= 5 ? (
                                    <span className="inline-flex items-center rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-white shadow-md">
                                        Stok Terbatas (Sisa {product.stock} unit)
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-md">
                                        Stok Tersedia ({product.stock} unit)
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Thumbnail Selector if multiple images */}
                        {product.images && product.images.length > 0 && (
                            <div className="flex items-center gap-3 overflow-x-auto pb-2">
                                <button
                                    onClick={() => setSelectedImage(product.image_url)}
                                    className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition ${selectedImage === product.image_url ? 'border-emerald-600' : 'border-slate-200 dark:border-slate-800 opacity-60'
                                        }`}
                                >
                                    <img src={product.image_url} alt="Thumbnail main" className="h-full w-full object-cover" />
                                </button>
                                {product.images.map((img) => (
                                    <button
                                        key={img.id}
                                        onClick={() => setSelectedImage(img.image_url)}
                                        className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition ${selectedImage === img.image_url ? 'border-emerald-600' : 'border-slate-200 dark:border-slate-800 opacity-60'
                                            }`}
                                    >
                                        <img src={img.image_url} alt="Thumbnail" className="h-full w-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Product Details & Buying Actions */}
                    <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
                        <div className="space-y-4">
                            {/* Category & Cert Badge */}
                            <div className="flex items-center gap-2">
                                {product.category && (
                                    <Link
                                        href={`/produk?category=${product.category.slug}`}
                                        className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-400"
                                    >
                                        {product.category.name}
                                    </Link>
                                )}
                                <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                                    Garansi 1 Tahun
                                </span>
                            </div>

                            {/* Title */}
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                                {product.name}
                            </h1>

                            {/* Price */}
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Harga Satuan</span>
                                <div className="text-3xl font-black text-slate-900 dark:text-white">
                                    {formatRupiah(product.price)}
                                </div>
                                <span className="text-[11px] text-slate-500 mt-1 block">
                                    * Harga belum termasuk biaya instalasi dan survey opsional
                                </span>
                            </div>

                            {/* Description */}
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Deskripsi Produk</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                    {product.description}
                                </p>
                            </div>
                        </div>

                        {/* Quantity and Actions Bar */}
                        <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                            {/* Quantity Stepper */}
                            {!isOutOfStock && (
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Jumlah:</span>
                                    <div className="flex items-center rounded-lg border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900">
                                        <button
                                            type="button"
                                            onClick={() => handleQuantityChange(-1)}
                                            disabled={quantity <= 1}
                                            className="p-2.5 text-slate-600 hover:text-slate-900 disabled:opacity-30"
                                        >
                                            <Minus className="h-4 w-4" />
                                        </button>
                                        <span className="w-12 text-center text-sm font-bold text-slate-900 dark:text-white">
                                            {quantity}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleQuantityChange(1)}
                                            disabled={quantity >= product.stock}
                                            className="p-2.5 text-slate-600 hover:text-slate-900 disabled:opacity-30"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <span className="text-xs text-slate-400">
                                        Subtotal: <strong className="text-slate-900 dark:text-white">{formatRupiah(product.price * quantity)}</strong>
                                    </span>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                <button
                                    type="button"
                                    onClick={handleAddToCart}
                                    disabled={isOutOfStock}
                                    className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-emerald-500 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition active:scale-95"
                                >
                                    <ShoppingBag className="h-5 w-5" />
                                    <span>{isOutOfStock ? 'Stok Habis' : 'Tambah ke Keranjang'}</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleBuyNow}
                                    disabled={isOutOfStock}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border-2 border-emerald-600 bg-emerald-50 px-6 py-3.5 text-sm font-bold text-emerald-700 hover:bg-emerald-100 disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed dark:bg-emerald-950/40 dark:text-emerald-400 transition"
                                >
                                    <span>Beli Sekarang</span>
                                </button>
                            </div>

                            {/* Direct WhatsApp Action */}
                            <div className="pt-2">
                                <a
                                    href={getWhatsAppLink(store.store_whatsapp, waMessage)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 transition"
                                >
                                    <PhoneCall className="h-4 w-4 text-emerald-600" />
                                    <span>Tanya Spesifikasi / Penawaran Grosir via WhatsApp</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Technical Specifications Section */}
                {specification && Object.keys(specification).length > 0 && (
                    <div className="mt-16 border-t border-slate-200 pt-12 dark:border-slate-800">
                        <div className="max-w-3xl">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                                <span>Spesifikasi Teknis Hardware</span>
                            </h2>
                            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
                                <table className="w-full text-left text-sm">
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {Object.entries(specification).map(([key, value], idx) => (
                                            <tr key={idx} className={idx % 2 === 0 ? 'bg-slate-50/50 dark:bg-slate-950/30' : ''}>
                                                <td className="w-1/3 px-5 py-3.5 font-bold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider">
                                                    {key}
                                                </td>
                                                <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400 font-mono text-xs">
                                                    {String(value)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Related Products Grid */}
                {relatedProducts && relatedProducts.length > 0 && (
                    <div className="mt-16 border-t border-slate-200 pt-12 dark:border-slate-800">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                            Produk Terkait Lainnya
                        </h2>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                            {relatedProducts.map((relProduct) => (
                                <ProductCard key={relProduct.id} product={relProduct} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
