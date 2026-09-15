import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { AdminLayout } from '@/layouts/admin-layout';
import { Checkbox } from '@/components/ui/checkbox';
import { CustomSelect } from '@/components/ui/custom-select';
import { ImageUploader } from '@/components/ui/image-uploader';
import { Plus, Edit2, Trash2, Image as ImageIcon, X, Loader2, ExternalLink, Info } from 'lucide-react';
import { toast } from 'sonner';

const CTA_URL_PRESETS = [
    { value: '/produk', label: 'Katalog Semua Produk (/produk)' },
    { value: '/layanan', label: 'Layanan & Instalasi (/layanan)' },
    { value: '/portfolio', label: 'Portfolio Implementasi (/portfolio)' },
    { value: '/tentang-kami', label: 'Tentang Dodolan (/tentang-kami)' },
    { value: '/kontak', label: 'Hubungi Kami / Konsultasi (/kontak)' },
    { value: '/keranjang', label: 'Halaman Keranjang (/keranjang)' },
    { value: '/', label: 'Beranda Utama (/)' },
];

interface Banner {
    id: number;
    title?: string;
    subtitle?: string;
    cta_text?: string;
    cta_url?: string;
    image_url: string;
    display_order: number;
    is_active: boolean;
}

interface BannersIndexProps {
    banners: Banner[];
}

export default function BannersIndex({ banners }: BannersIndexProps) {
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<{
        _method?: string;
        image: File | null;
        title: string;
        subtitle: string;
        cta_text: string;
        cta_url: string;
        display_order: number;
        is_active: boolean;
    }>({
        image: null,
        title: '',
        subtitle: '',
        cta_text: '',
        cta_url: '',
        display_order: 1,
        is_active: true,
    });

    const openCreateModal = () => {
        setEditingBanner(null);
        reset();
        setData({
            image: null,
            title: '',
            subtitle: '',
            cta_text: 'Jelajahi Produk',
            cta_url: '/produk',
            display_order: banners.length + 1,
            is_active: true,
        });
        setIsCreating(true);
    };

    const openEditModal = (b: Banner) => {
        setIsCreating(false);
        setEditingBanner(b);
        setData({
            _method: 'PUT',
            image: null,
            title: b.title || '',
            subtitle: b.subtitle || '',
            cta_text: b.cta_text || '',
            cta_url: b.cta_url || '',
            display_order: b.display_order,
            is_active: b.is_active,
        });
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingBanner) {
            post(`/admin/banners/${editingBanner.id}`, {
                forceFormData: true,
                onSuccess: () => {
                    setEditingBanner(null);
                    toast.success('Banner berhasil diperbarui.');
                },
            });
        } else {
            post('/admin/banners', {
                forceFormData: true,
                onSuccess: () => {
                    setIsCreating(false);
                    reset();
                    toast.success('Banner baru berhasil ditambahkan.');
                },
            });
        }
    };

    const handleDelete = (b: Banner) => {
        if (confirm('Hapus banner promo ini?')) {
            router.delete(`/admin/banners/${b.id}`, {
                onSuccess: () => toast.success('Banner berhasil dihapus.'),
            });
        }
    };

    return (
        <AdminLayout title="Kelola Banner Promo Homepage">
            <Head title="Admin - Banner Promo — Dodolan Store" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            Banner Slider Homepage ({banners.length})
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Kelola banner slider utama untuk promosi hardware IoT dan layanan teknis.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 transition"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Tambah Banner Baru</span>
                    </button>
                </div>

                {/* Banner Specifications Guidance Info Card */}
                <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 dark:border-blue-900/60 dark:bg-blue-950/30 flex flex-col sm:flex-row items-start gap-3.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm mt-0.5">
                        <ImageIcon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                        <p className="font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
                            <span>Panduan Format &amp; Ukuran Banner Promosi</span>
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                Rasio Disarankan 16:9
                            </span>
                        </p>
                        <p className="text-[11px] leading-relaxed">
                            Gunakan rasio <strong>16:9</strong> (resolusi ideal <strong>1200 &times; 675 px</strong>) atau rasio <strong>2:1</strong> (<strong>1200 &times; 600 px</strong>) dengan format <strong>JPG, PNG, atau WEBP</strong> (maks. 5MB). Komposisi gambar utama disarankan berada di sisi kanan agar teks promosi di sisi kiri homepage terbaca kontras dan nyaman dilihat.
                        </p>
                    </div>
                </div>

                {/* Banners Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {banners.map((banner) => (
                        <div
                            key={banner.id}
                            className="rounded-2xl border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-900 shadow-xs flex flex-col justify-between"
                        >
                            <div className="aspect-16/9 w-full bg-slate-950 relative overflow-hidden">
                                <img src={banner.image_url} alt={banner.title || 'Banner'} className="h-full w-full object-cover" />
                                <div className="absolute top-3 left-3">
                                    <span className="rounded-md bg-slate-900/80 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                                        Urutan: {banner.display_order}
                                    </span>
                                </div>
                                <div className="absolute top-3 right-3">
                                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold text-white shadow-sm ${
                                        banner.is_active ? 'bg-emerald-600' : 'bg-slate-600'
                                    }`}>
                                        {banner.is_active ? 'Aktif' : 'Nonaktif'}
                                    </span>
                                </div>
                            </div>

                            <div className="p-4 sm:p-5 space-y-2 flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                                        {banner.title || '(Tanpa Judul)'}
                                    </h3>
                                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                                        {banner.subtitle || '-'}
                                    </p>
                                </div>

                                {banner.cta_url && (
                                    <div className="text-[11px] text-emerald-600 font-semibold truncate pt-2">
                                        CTA: {banner.cta_text || 'Lihat'} &rarr; {banner.cta_url}
                                    </div>
                                )}

                                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => openEditModal(banner)}
                                        className="flex min-h-[40px] items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900/50 text-xs font-bold hover:bg-amber-100 transition"
                                        title="Edit Banner"
                                    >
                                        <Edit2 className="h-3.5 w-3.5" />
                                        <span>Edit</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(banner)}
                                        className="flex min-h-[40px] items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 text-xs font-bold hover:bg-rose-100 transition cursor-pointer"
                                        title="Hapus Banner"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        <span>Hapus</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Banner Create/Edit Modal */}
                {(isCreating || editingBanner) && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
                        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900 shadow-2xl space-y-5 max-h-[90dvh] overflow-y-auto animate-in fade-in zoom-in-95">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                                    {editingBanner ? 'Edit Banner Promo' : 'Tambah Banner Baru'}
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCreating(false);
                                        setEditingBanner(null);
                                    }}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleFormSubmit} className="space-y-4">
                                {/* Banner Aspect Ratio & Size Guidance Box */}
                                <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 dark:border-blue-900/60 dark:bg-blue-950/40 space-y-2.5 text-xs">
                                    <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200 font-bold text-xs">
                                        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                                        <span>Spesifikasi Ukuran &amp; Aspek Rasio Banner</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 pt-0.5">
                                        <div className="bg-white/90 dark:bg-slate-900/90 rounded-lg p-2 border border-blue-100 dark:border-blue-900/50">
                                            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Skala / Aspek Rasio</span>
                                            <span className="font-bold text-slate-900 dark:text-white">16:9 atau 2:1</span>
                                        </div>
                                        <div className="bg-white/90 dark:bg-slate-900/90 rounded-lg p-2 border border-blue-100 dark:border-blue-900/50">
                                            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Resolusi Rekomendasi</span>
                                            <span className="font-bold text-slate-900 dark:text-white">1200 &times; 675 px</span>
                                        </div>
                                    </div>
                                    <ul className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 list-disc list-inside leading-relaxed">
                                        <li><strong>Format &amp; Ukuran File:</strong> JPG, PNG, WEBP (Maksimal 5MB, otomatis dikonversi ke WebP).</li>
                                        <li><strong>Tips Layout:</strong> Teks judul promo tampil di sisi kiri banner pada beranda. Letakkan objek/hardware utama di area tengah hingga kanan agar teks tidak tumpang-tindih di desktop maupun mobile.</li>
                                    </ul>
                                </div>

                                <ImageUploader
                                    id="banner-image-upload"
                                    label="Gambar Banner"
                                    required={!editingBanner}
                                    currentImageUrl={editingBanner?.image_url || null}
                                    onChange={(file) => setData('image', file)}
                                    error={errors.image}
                                    helperText="Format: JPG, PNG, WEBP (Maks. 5MB) • Disarankan 16:9 (1200 × 675 px)"
                                />

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                        Judul Banner
                                    </label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="Contoh: Solusi IoT Fleet Management"
                                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                        Subjudul / Penjelasan
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={data.subtitle}
                                        onChange={(e) => setData('subtitle', e.target.value)}
                                        placeholder="Keterangan singkat..."
                                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                            Teks Tombol CTA
                                        </label>
                                        <input
                                            type="text"
                                            value={data.cta_text}
                                            onChange={(e) => setData('cta_text', e.target.value)}
                                            placeholder="Jelajahi Produk"
                                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                        />
                                        {errors.cta_text && <p className="mt-1 text-xs text-rose-500">{errors.cta_text}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                            Link URL CTA
                                        </label>
                                        <CustomSelect
                                            value={data.cta_url || '/produk'}
                                            onChange={(val) => setData('cta_url', val)}
                                            options={[
                                                ...CTA_URL_PRESETS,
                                                ...(data.cta_url && !CTA_URL_PRESETS.some((o) => o.value === data.cta_url)
                                                    ? [{ value: data.cta_url, label: `Kustom: ${data.cta_url}` }]
                                                    : []),
                                            ]}
                                            className="w-full"
                                        />
                                        {errors.cta_url && <p className="mt-1 text-xs text-rose-500">{errors.cta_url}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                        Urutan Tampil Banner
                                    </label>
                                    <CustomSelect
                                        value={String(data.display_order || 1)}
                                        onChange={(val) => setData('display_order', parseInt(val) || 1)}
                                        options={Array.from(
                                            { length: Math.max(banners.length + (editingBanner ? 0 : 1), Number(data.display_order) || 1, 1) },
                                            (_, i) => {
                                                const num = i + 1;
                                                const total = Math.max(banners.length + (editingBanner ? 0 : 1), Number(data.display_order) || 1, 1);
                                                let label = `Urutan ${num}`;
                                                if (num === 1) label += ' (Slide Pertama / Utama)';
                                                else if (num === total) label += ' (Slide Paling Akhir)';
                                                return {
                                                    value: String(num),
                                                    label,
                                                };
                                            }
                                        )}
                                        className="w-full"
                                    />
                                    {errors.display_order && <p className="mt-1 text-xs text-rose-500">{errors.display_order}</p>}
                                </div>

                                <div
                                    onClick={() => setData('is_active', !data.is_active)}
                                    className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer select-none ${
                                        data.is_active
                                            ? 'border-emerald-500 bg-emerald-50/40 dark:border-emerald-600 dark:bg-emerald-950/20'
                                            : 'border-slate-200 bg-slate-50/70 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/40'
                                    }`}
                                >
                                    <div className="space-y-0.5 pr-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                                                Status Tayang Banner
                                            </span>
                                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                                data.is_active
                                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-300'
                                                    : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                                            }`}>
                                                {data.is_active ? 'Aktif Tayang' : 'Disembunyikan'}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                            {data.is_active ? 'Banner akan tampil di slider beranda toko.' : 'Banner tidak akan ditampilkan di beranda.'}
                                        </p>
                                    </div>
                                    <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                                        <Checkbox
                                            id="banner-status"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', !!checked)}
                                            className="h-5 w-5 rounded-md"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsCreating(false);
                                            setEditingBanner(null);
                                        }}
                                        className="w-full sm:w-auto min-h-[44px] flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50"
                                    >
                                        {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                                        <span>Simpan Banner</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
