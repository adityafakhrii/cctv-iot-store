import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { PublicLayout } from '@/layouts/public-layout';
import { 
    Wrench, 
    Search, 
    Activity, 
    CheckCircle2, 
    Send, 
    PhoneCall, 
    ShieldCheck, 
    Clock, 
    Users, 
    FileText, 
    Loader2 
} from 'lucide-react';
import { getWhatsAppLink } from '@/lib/format';
import { useStoreSettings } from '@/hooks/use-store-settings';
import { toast } from 'sonner';

interface ServicesIndexProps {
    selectedType?: string;
}

export default function ServicesIndex({ selectedType = 'Instalasi' }: ServicesIndexProps) {
    const store = useStoreSettings();
    const { flash } = usePage<any>().props;

    const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
        name: '',
        email: '',
        phone: '',
        service_type: selectedType,
        location: '',
        description: '',
        note: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/layanan', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                toast.success('Pengajuan layanan berhasil dikirim! Tim teknisi kami akan segera menghubungi Anda.');
            },
            onError: () => {
                toast.error('Mohon periksa kembali isian formulir Anda.');
            },
        });
    };

    const servicePillars = [
        {
            type: 'Instalasi',
            title: '1. Layanan Instalasi Hardware',
            icon: Wrench,
            color: 'emerald',
            summary: 'Pemasangan rapi dan terstandarisasi oleh teknisi kelistrikan otomotif dan telematika berpengalaman.',
            features: [
                'Pemasangan GPS Tracker armada (Kabel tersembunyi & aman dari pemutusan arus sengaja)',
                'Instalasi sistem AI MDVR 4-Channel & 8-Channel beserta kamera ADAS & DSM',
                'Pemasangan kamera dashcam 4G live streaming & kabel hardwire fuse kit',
                'Instalasi sensor level bahan bakar ultrasonik non-intrusif & sensor suhu BLE',
                'Uji coba live tracking dan verifikasi telemetri sebelum serah terima unit',
            ],
        },
        {
            type: 'Survey',
            title: '2. Layanan Survey Teknis & Audit Armada',
            icon: Search,
            color: 'blue',
            summary: 'Pemeriksaan kelayakan armada dan pemetaan arsitektur IoT sebelum proses pengadaan dan instalasi massal.',
            features: [
                'Survey kondisi aki, alternator, dan voltase sistem kelistrikan kendaraan (12V / 24V)',
                'Audit dimensi tangki BBM (bentuk, sekat baffle, ketebalan plat) untuk sensor BBM',
                'Pemetaan titik pemasangan kamera sudut lebar tanpa blind-spot pada kabin & kargo',
                'Pengukuran kualitas sinyal GSM 4G/GPS di rute operasional perusahaan',
                'Penyusunan laporan BoQ (Bill of Quantity) dan rekomendasi spesifikasi teknis hardware',
            ],
        },
        {
            type: 'Maintenance',
            title: '3. Layanan Maintenance & Kalibrasi',
            icon: Activity,
            color: 'rose',
            summary: 'Pemeliharaan berkala untuk memastikan seluruh sensor telemetri dan perangkat perekam beroperasi 100% akurat.',
            features: [
                'Kalibrasi ulang akurasi sensor bahan bakar ultrasonik dan sensor temperatur',
                'Pengecekan integritas storage SD Card / SSD pada unit MDVR dan dashcam',
                'Pembersihan lensa kamera pengawas outdoor dari debu industri dan residu oli',
                'Pembaruan firmware OTA (Over-The-Air) untuk peningkatan keamanan protokol',
                'Penggantian spare part dan perbaikan klaim garansi resmi unit',
            ],
        },
    ];

    return (
        <PublicLayout>
            <Head title="Layanan Instalasi, Survey & Maintenance IoT — Dodolan Store" />

            {/* Hero Header */}
            <div className="bg-slate-900 text-white py-16 lg:py-20 border-b border-slate-800">
                <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl space-y-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                            Technical Engineering Services
                        </p>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
                            Layanan Instalasi, Survey &amp; Maintenance IoT Nasional
                        </h1>
                        <p className="text-base text-slate-300 sm:text-lg leading-relaxed">
                            Kami menyediakan teknisi bersertifikasi untuk memastikan perangkat telemetri, GPS Tracker, dan AI MDVR Anda terpasang dengan standar keselamatan tertinggi.
                        </p>
                    </div>
                </div>
            </div>

            {/* 3 Pillars Overview */}
            <div className="py-16 lg:py-20">
                <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 space-y-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {servicePillars.map((pillar) => {
                            const IconComponent = pillar.icon;
                            return (
                                <div
                                    key={pillar.type}
                                    className="rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm flex flex-col justify-between"
                                >
                                    <div className="space-y-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                                            <IconComponent className="h-6 w-6" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                            {pillar.title}
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                            {pillar.summary}
                                        </p>
                                        <ul className="space-y-2.5 pt-2 text-xs text-slate-600 dark:text-slate-300">
                                            {pillar.features.map((feat, idx) => (
                                                <li key={idx} className="flex items-start gap-2.5">
                                                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                                                    <span>{feat}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setData('service_type', pillar.type);
                                                document.getElementById('service-form-section')?.scrollIntoView({ behavior: 'smooth' });
                                            }}
                                            className="w-full rounded-xl bg-slate-900 py-2.5 px-4 text-xs font-bold text-white hover:bg-emerald-600 dark:bg-slate-800 dark:hover:bg-emerald-600 transition"
                                        >
                                            Pilih Layanan Ini &darr;
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Service Request Form Section */}
            <div id="service-form-section" className="bg-slate-50 py-16 lg:py-20 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-8">
                        <div className="text-center max-w-xl mx-auto space-y-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Formulir Resmi</span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                                Pengajuan Layanan IoT Dodolan
                            </h2>
                            <p className="text-xs text-slate-500">
                                Isi formulir di bawah ini dengan detail kebutuhan Anda. Teknisi kami akan meninjau dan mengirimkan penawaran teknis dalam 1x24 jam kerja.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Service Type Selection */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                                    Jenis Layanan yang Dibutuhkan <span className="text-rose-500">*</span>
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {['Instalasi', 'Survey', 'Maintenance'].map((type) => {
                                        const isSelected = data.service_type === type;
                                        return (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setData('service_type', type)}
                                                className={`py-3 px-4 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                                                    isSelected
                                                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 shadow-xs'
                                                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                                }`}
                                            >
                                                <CheckCircle2 className={`h-4 w-4 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                                                <span>Layanan {type}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                                {errors.service_type && <p className="mt-1 text-xs text-rose-500">{errors.service_type}</p>}
                            </div>

                            {/* Contact Inputs */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                        Nama Lengkap / PIC <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Contoh: Budi Santoso (PT Maju Trans)"
                                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    />
                                    {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                        Email Perusahaan <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="budi@majutrans.co.id"
                                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    />
                                    {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                        Nomor WhatsApp / HP <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="081234567890"
                                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    />
                                    {errors.phone && <p className="mt-1 text-xs text-rose-500">{errors.phone}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                        Lokasi Pekerjaan / Pool Armada <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={data.location}
                                        onChange={(e) => setData('location', e.target.value)}
                                        placeholder="Contoh: Pool Truk Rungkut Industri, Surabaya"
                                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    />
                                    {errors.location && <p className="mt-1 text-xs text-rose-500">{errors.location}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    Deskripsi Kebutuhan Teknis &amp; Jumlah Unit <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    rows={4}
                                    required
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Contoh: Pemasangan 15 unit AI MDVR 4-Channel pada armada truk Hino Ranger, butuh survey jalur kabel dan estimasi waktu pengerjaan."
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                />
                                {errors.description && <p className="mt-1 text-xs text-rose-500">{errors.description}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    Catatan Tambahan (Opsional)
                                </label>
                                <input
                                    type="text"
                                    value={data.note}
                                    onChange={(e) => setData('note', e.target.value)}
                                    placeholder="Contoh: Jadwal instalasi hanya bisa dilakukan hari Sabtu/Minggu."
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-4 px-6 text-sm font-bold text-white shadow-lg hover:bg-emerald-500 disabled:opacity-50 transition active:scale-95"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            <span>Mengirim Pengajuan Layanan...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4" />
                                            <span>Kirim Permintaan Layanan Sekarang</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Direct Fast WhatsApp Alternative */}
                        <div className="border-t border-slate-100 dark:border-slate-800 pt-6 text-center">
                            <p className="text-xs text-slate-500 mb-3">Butuh respon segera untuk jadwal mendesak?</p>
                            <a
                                href={getWhatsAppLink(store.store_whatsapp, `Halo CS ${store.store_name}, saya butuh bantuan teknisi darurat untuk instalasi/maintenance armada.`)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                            >
                                <PhoneCall className="h-4 w-4" />
                                <span>Hubungi Teknisi Standby via WhatsApp</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
