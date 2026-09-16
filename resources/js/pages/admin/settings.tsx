import { Head, useForm } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/admin-layout';
import { 
    KeyRound, 
    User, 
    Mail, 
    Phone, 
    Save, 
    ShieldCheck,
    Store,
    Building2,
    MapPin,
    Map,
    Clock,
    Megaphone,
    MessageCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { FormEventHandler, useRef, useState, useEffect } from 'react';
import PasswordInput from '@/components/password-input';
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import type { StoreSettings } from '@/types/store';

interface AdminSettingsProps {
    user: {
        id: number;
        name: string;
        email: string;
        phone?: string;
    };
    passwordRules?: string;
    storeSettings?: StoreSettings;
}

export default function AdminSettings({
    user,
    passwordRules,
    storeSettings,
}: AdminSettingsProps) {
    // Profile Form
    const profileForm = useForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
    });

    // Password Form
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    // Store Settings Form
    const storeForm = useForm({
        store_name: storeSettings?.store_name || 'Dodolan Store',
        company_name: storeSettings?.company_name || 'PT Dodolan Teknologi Nusantara',
        store_phone: storeSettings?.store_phone || '+62 811 5000 3775',
        store_whatsapp: storeSettings?.store_whatsapp || '081150003775',
        store_email: storeSettings?.store_email || 'halo@dodolan.store',
        store_address: storeSettings?.store_address || 'Komp. Fantasy Junction Blok FJ4 No. 15',
        store_city: storeSettings?.store_city || 'Balikpapan, Kalimantan Timur, Indonesia',
        store_postal_code: storeSettings?.store_postal_code || '76114',
        operating_hours: storeSettings?.operating_hours || 'Senin – Sabtu: 08.00 – 17.00 WIB',
        announcement_bar: storeSettings?.announcement_bar || 'Promo Spesial: Diskon Hardware IoT & Gratis Biaya Survey Armada di Kalimantan Timur',
        announcement_link: storeSettings?.announcement_link || '/produk',
        announcement_active: storeSettings?.announcement_active !== false && storeSettings?.announcement_active !== '0',
        store_gmaps_embed: (storeSettings?.store_gmaps_embed as string) || 'https://maps.google.com/maps?q=Balikpapan%2C%20Kalimantan%20Timur&t=&z=14&ie=UTF8&iwloc=&output=embed',
    });

    const [previewMapUrl, setPreviewMapUrl] = useState<string>(() => {
        return (storeSettings?.store_gmaps_embed as string) || 'https://maps.google.com/maps?q=Balikpapan%2C%20Kalimantan%20Timur&t=&z=14&ie=UTF8&iwloc=&output=embed';
    });
    const [isResolvingMap, setIsResolvingMap] = useState<boolean>(false);

    useEffect(() => {
        const raw = storeForm.data.store_gmaps_embed?.trim();
        if (!raw) {
            setPreviewMapUrl('');
            setIsResolvingMap(false);
            return;
        }

        // 1. If iframe src, extract directly
        const iframeMatch = raw.match(/src=["']([^"']+)["']/i);
        if (iframeMatch) {
            setPreviewMapUrl(iframeMatch[1]);
            setIsResolvingMap(false);
            return;
        }

        // 2. If already embed format
        if (raw.includes('output=embed') || raw.includes('/maps/embed')) {
            setPreviewMapUrl(raw);
            setIsResolvingMap(false);
            return;
        }

        // 3. If shortlink (maps.app.goo.gl or goo.gl/maps) or other link, resolve via backend endpoint
        setIsResolvingMap(true);
        const timer = setTimeout(() => {
            fetch(`/admin/settings/resolve-map?url=${encodeURIComponent(raw)}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data?.embed_url) {
                        setPreviewMapUrl(data.embed_url);
                    }
                })
                .catch(() => {})
                .finally(() => {
                    setIsResolvingMap(false);
                });
        }, 350);

        return () => clearTimeout(timer);
    }, [storeForm.data.store_gmaps_embed]);

    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const handleProfileSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        profileForm.patch('/admin/settings/profile', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Profil Administrator berhasil diperbarui!');
            },
        });
    };

    const handlePasswordSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        passwordForm.put('/admin/settings/password', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Kata sandi Administrator berhasil diubah!');
                passwordForm.reset();
            },
            onError: (errors) => {
                if (errors.password) {
                    passwordInput.current?.focus();
                }
                if (errors.current_password) {
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    const handleStoreSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        storeForm.patch('/admin/settings/store', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Pengaturan informasi toko berhasil diperbarui!');
            },
        });
    };

    return (
        <AdminLayout title="Pengaturan & Keamanan Admin">
            <Head title="Pengaturan & Keamanan — Admin Dodolan Store" />

            <div className="space-y-6">
                {/* Page Heading */}
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        Pengaturan Toko &amp; Keamanan Akun
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Kelola informasi profil administrator, kata sandi login, serta data resmi toko dan kontak layanan pelanggan.
                    </p>
                </div>

                {/* Header Profile Badge */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 sm:gap-4">
                        <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white font-black text-lg sm:text-xl shadow-md shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">{user.name}</h2>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                    Super Administrator
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 break-all">{user.email}</p>
                        </div>
                    </div>

                    <div className="w-full sm:w-auto flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                        <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Akses Penuh Kontrol Panel</span>
                    </div>
                </div>

                {/* Store Settings Card (Replaced System Info) */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-7 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <Store className="h-5 w-5 text-emerald-600 shrink-0" />
                                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                    Pengaturan Informasi &amp; Kontak Resmi Toko
                                </h3>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                Perubahan data di bawah ini akan langsung tampil secara dinamis di header navbar, halaman kontak, footer, tentang kami, dan invoice PDF resmi.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleStoreSubmit} className="space-y-6">
                        {/* Section 1: Store & Legal Identity */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                                <Building2 className="h-3.5 w-3.5 text-emerald-600" />
                                <span>Identitas Toko &amp; Badan Usaha</span>
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Nama Toko Publik <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={storeForm.data.store_name}
                                        onChange={(e) => storeForm.setData('store_name', e.target.value)}
                                        placeholder="Contoh: Dodolan Store"
                                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                        required
                                    />
                                    <InputError message={storeForm.errors.store_name} className="mt-1" />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Nama Perusahaan / Legalitas (PT) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={storeForm.data.company_name}
                                        onChange={(e) => storeForm.setData('company_name', e.target.value)}
                                        placeholder="Contoh: PT Dodolan Teknologi Nusantara"
                                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                        required
                                    />
                                    <InputError message={storeForm.errors.company_name} className="mt-1" />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Contact CS & Hotline */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                                <Phone className="h-3.5 w-3.5 text-emerald-600" />
                                <span>Kontak Layanan Pelanggan (CS) &amp; Hotline</span>
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Nomor WhatsApp CS <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <MessageCircle className="absolute left-3 top-3 h-4 w-4 text-emerald-600" />
                                        <input
                                            type="text"
                                            value={storeForm.data.store_whatsapp}
                                            onChange={(e) => storeForm.setData('store_whatsapp', e.target.value)}
                                            placeholder="Contoh: 081150003775"
                                            className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                            required
                                        />
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-1">Tujuan klik tombol WhatsApp dan form pesan.</p>
                                    <InputError message={storeForm.errors.store_whatsapp} className="mt-1" />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Nomor Telepon Kantor / Hotline
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <input
                                            type="text"
                                            value={storeForm.data.store_phone}
                                            onChange={(e) => storeForm.setData('store_phone', e.target.value)}
                                            placeholder="Contoh: +62 811 5000 3775"
                                            className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                        />
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-1">Tampil di header topbar dan footer.</p>
                                    <InputError message={storeForm.errors.store_phone} className="mt-1" />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Alamat Email Resmi <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <input
                                            type="email"
                                            value={storeForm.data.store_email}
                                            onChange={(e) => storeForm.setData('store_email', e.target.value)}
                                            placeholder="Contoh: halo@dodolan.store"
                                            className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                            required
                                        />
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-1">Tampil di halaman kontak dan footer.</p>
                                    <InputError message={storeForm.errors.store_email} className="mt-1" />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Operational Address & Working Hours */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                                <span>Alamat Operasional &amp; Jam Kerja</span>
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Alamat Lengkap Kantor / Gudang <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={storeForm.data.store_address}
                                        onChange={(e) => storeForm.setData('store_address', e.target.value)}
                                        placeholder="Contoh: Komp. Fantasy Junction Blok FJ4 No. 15"
                                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                        required
                                    />
                                    <InputError message={storeForm.errors.store_address} className="mt-1" />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Kota / Wilayah <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={storeForm.data.store_city}
                                        onChange={(e) => storeForm.setData('store_city', e.target.value)}
                                        placeholder="Contoh: Balikpapan, Kalimantan Timur, Indonesia"
                                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                        required
                                    />
                                    <InputError message={storeForm.errors.store_city} className="mt-1" />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Kode Pos
                                    </label>
                                    <input
                                        type="text"
                                        value={storeForm.data.store_postal_code}
                                        onChange={(e) => storeForm.setData('store_postal_code', e.target.value)}
                                        placeholder="Contoh: 76114"
                                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    />
                                    <InputError message={storeForm.errors.store_postal_code} className="mt-1" />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Jam Operasional Layanan <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <input
                                            type="text"
                                            value={storeForm.data.operating_hours}
                                            onChange={(e) => storeForm.setData('operating_hours', e.target.value)}
                                            placeholder="Contoh: Senin – Sabtu: 08.00 – 17.00 WIB"
                                            className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                            required
                                        />
                                    </div>
                                    <InputError message={storeForm.errors.operating_hours} className="mt-1" />
                                </div>

                                <div className="md:col-span-3">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                            Link / Share Google Maps Toko
                                        </label>
                                        {isResolvingMap && (
                                            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                                <Spinner className="h-3 w-3" />
                                                <span>Mengonversi link peta...</span>
                                            </span>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <Map className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <input
                                            type="text"
                                            value={storeForm.data.store_gmaps_embed}
                                            onChange={(e) => storeForm.setData('store_gmaps_embed', e.target.value)}
                                            placeholder="Contoh: https://maps.app.goo.gl/AFT3BPA1cWtKer1e9 atau link Google Maps lainnya"
                                            className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono text-[11px]"
                                        />
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        Tinggal copy link share dari Google Maps (misal <code className="text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1 py-0.5 rounded">https://maps.app.goo.gl/...</code>) atau kode embed iframe. Sistem otomatis mengubahnya jadi peta interaktif.
                                    </p>
                                    <InputError message={storeForm.errors.store_gmaps_embed} className="mt-1" />
                                </div>

                                {/* Live Preview Google Maps */}
                                <div className="md:col-span-3 mt-1">
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                                            <span>Live Preview Peta Google Maps</span>
                                        </div>
                                        {previewMapUrl && (
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                                                Peta Siap Ditampilkan
                                            </span>
                                        )}
                                    </label>

                                    {isResolvingMap ? (
                                        <div className="w-full h-64 sm:h-72 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-850 animate-pulse">
                                            <Spinner className="h-8 w-8 text-emerald-600 mb-2" />
                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                                Menghubungkan link Google Maps...
                                            </p>
                                            <p className="text-[11px] text-slate-400 mt-0.5">
                                                Sedang mengonversi link menjadi peta embed interaktif secara otomatis.
                                            </p>
                                        </div>
                                    ) : previewMapUrl ? (
                                        <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner bg-slate-100 dark:bg-slate-800">
                                            <iframe
                                                src={previewMapUrl}
                                                width="100%"
                                                height="100%"
                                                style={{ border: 0 }}
                                                allowFullScreen
                                                loading="lazy"
                                                referrerPolicy="no-referrer-when-downgrade"
                                                title="Preview Peta Lokasi Toko"
                                                className="w-full h-full"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-full h-36 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-4 text-center bg-slate-50 dark:bg-slate-800/40">
                                            <Map className="h-8 w-8 text-slate-400 mb-1" />
                                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                                Belum ada link peta yang dimasukkan.
                                            </p>
                                            <p className="text-[11px] text-slate-400">
                                                Tempel link Google Maps di atas untuk melihat preview langsung di sini.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Topbar Announcement Bar */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                                <Megaphone className="h-3.5 w-3.5 text-emerald-600" />
                                <span>Banner Pengumuman &amp; Promo Topbar</span>
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Teks Pengumuman Promo
                                    </label>
                                    <input
                                        type="text"
                                        value={storeForm.data.announcement_bar}
                                        onChange={(e) => storeForm.setData('announcement_bar', e.target.value)}
                                        placeholder="Contoh: Promo Spesial: Diskon Hardware IoT & Gratis Biaya Survey Armada di Kalimantan Timur"
                                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    />
                                    <InputError message={storeForm.errors.announcement_bar} className="mt-1" />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Link Tujuan Promo
                                    </label>
                                    <input
                                        type="text"
                                        value={storeForm.data.announcement_link}
                                        onChange={(e) => storeForm.setData('announcement_link', e.target.value)}
                                        placeholder="Contoh: /produk atau /layanan"
                                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    />
                                    <InputError message={storeForm.errors.announcement_link} className="mt-1" />
                                </div>

                                <div className="md:col-span-3">
                                    <label className="inline-flex items-center gap-2.5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={Boolean(storeForm.data.announcement_active)}
                                            onChange={(e) => storeForm.setData('announcement_active', e.target.checked)}
                                            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            Aktifkan Banner Pengumuman di Baris Paling Atas Website
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Save Store Settings Submit Button */}
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                            <button
                                type="submit"
                                disabled={storeForm.processing}
                                className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50 transition active:scale-95 cursor-pointer shadow-sm"
                            >
                                {storeForm.processing ? <Spinner className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                                <span>Simpan Pengaturan Toko</span>
                            </button>
                        </div>
                    </form>
                </div>

                {/* 2-Column Grid: Admin Profile (Left) & Password (Right) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">
                    {/* Left Column: Admin Profile */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-7 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div>
                                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                    Informasi Profil Administrator
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Identitas pengelola platform Dodolan Store.
                                </p>
                            </div>
                            <User className="h-5 w-5 text-emerald-600 shrink-0" />
                        </div>

                        <form onSubmit={handleProfileSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    Nama Lengkap Administrator <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={profileForm.data.name}
                                        onChange={(e) => profileForm.setData('name', e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                        required
                                    />
                                </div>
                                <InputError message={profileForm.errors.name} className="mt-1" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    Alamat Email Login <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <input
                                        type="email"
                                        value={profileForm.data.email}
                                        onChange={(e) => profileForm.setData('email', e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                        required
                                    />
                                </div>
                                <InputError message={profileForm.errors.email} className="mt-1" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    Nomor Telepon / WhatsApp
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={profileForm.data.phone}
                                        onChange={(e) => profileForm.setData('phone', e.target.value)}
                                        placeholder="Contoh: 081150003775"
                                        className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    />
                                </div>
                                <InputError message={profileForm.errors.phone} className="mt-1" />
                            </div>

                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="submit"
                                    disabled={profileForm.processing}
                                    className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50 transition active:scale-95 cursor-pointer shadow-xs"
                                >
                                    {profileForm.processing ? <Spinner className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                                    <span>Simpan Perubahan Profil</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right Column: Update Password Card */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-7 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div>
                                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                    Perbarui Kata Sandi Administrator
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Gunakan kombinasi kata sandi yang aman.
                                </p>
                            </div>
                            <KeyRound className="h-5 w-5 text-emerald-600 shrink-0" />
                        </div>

                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="current_password" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                    Kata Sandi Saat Ini
                                </Label>
                                <PasswordInput
                                    id="current_password"
                                    ref={currentPasswordInput}
                                    value={passwordForm.data.current_password}
                                    onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                    className="rounded-xl border-slate-300 dark:border-slate-700 text-xs mt-1.5 py-2.5"
                                    placeholder="Masukkan kata sandi lama"
                                    autoComplete="current-password"
                                />
                                <InputError message={passwordForm.errors.current_password} className="mt-1" />
                            </div>

                            <div>
                                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                    Kata Sandi Baru
                                </Label>
                                <PasswordInput
                                    id="password"
                                    ref={passwordInput}
                                    value={passwordForm.data.password}
                                    onChange={(e) => passwordForm.setData('password', e.target.value)}
                                    className="rounded-xl border-slate-300 dark:border-slate-700 text-xs mt-1.5 py-2.5"
                                    placeholder="Minimal 8 karakter"
                                    autoComplete="new-password"
                                    passwordrules={passwordRules}
                                />
                                <InputError message={passwordForm.errors.password} className="mt-1" />
                            </div>

                            <div>
                                <Label htmlFor="password_confirmation" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                    Konfirmasi Kata Sandi Baru
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    value={passwordForm.data.password_confirmation}
                                    onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                    className="rounded-xl border-slate-300 dark:border-slate-700 text-xs mt-1.5 py-2.5"
                                    placeholder="Ulangi kata sandi baru"
                                    autoComplete="new-password"
                                    passwordrules={passwordRules}
                                />
                                <InputError message={passwordForm.errors.password_confirmation} className="mt-1" />
                            </div>

                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="submit"
                                    disabled={passwordForm.processing}
                                    className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50 transition active:scale-95 cursor-pointer shadow-xs"
                                >
                                    {passwordForm.processing ? <Spinner className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                                    <span>Simpan Kata Sandi Baru</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
