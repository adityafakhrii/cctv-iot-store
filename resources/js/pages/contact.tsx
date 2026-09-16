import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { PublicLayout } from '@/layouts/public-layout';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, MessageSquare, ExternalLink } from 'lucide-react';
import { useStoreSettings } from '@/hooks/use-store-settings';
import { getWhatsAppLink } from '@/lib/format';

export default function Contact() {
    const store = useStoreSettings();
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');

    const getCleanEmbedUrl = (raw?: string) => {
        if (!raw) return '';
        const match = raw.match(/src=["']([^"']+)["']/);
        return match ? match[1] : raw.trim();
    };

    const cleanGmapsUrl = getCleanEmbedUrl(store.store_gmaps_embed);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        const text = `Halo ${store.store_name}, nama saya ${name}. ${message}`;
        window.open(getWhatsAppLink(store.store_whatsapp, text), '_blank');
    };

    return (
        <PublicLayout>
            <Head title={`Kontak Kami — ${store.store_name}`} />

            {/* Header */}
            <div className="bg-slate-900 text-white py-16 border-b border-slate-800">
                <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl space-y-3">
                        <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                            Pusat Layanan &amp; Informasi
                        </p>
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                            Hubungi Tim {store.store_name}
                        </h1>
                        <p className="text-sm text-slate-400 leading-relaxed sm:text-base">
                            Silakan hubungi kami untuk informasi katalog produk, penawaran harga khusus armada (B2B), atau konsultasi instalasi perangkat IoT.
                        </p>
                    </div>
                </div>
            </div>

            {/* Contact Details & Fast Chat Form */}
            <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left: Contact Info Cards */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-6">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                                Kantor &amp; Layanan Pelanggan
                            </h2>

                            <div className="space-y-4 text-sm">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 dark:text-white">Alamat Operasional</div>
                                        <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 font-medium">{store.store_address}</div>
                                        <div className="text-xs text-slate-400 mt-0.5">
                                            {store.store_city} {store.store_postal_code ? `(${store.store_postal_code})` : ''}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                                        <Phone className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 dark:text-white">Telepon / WhatsApp</div>
                                        <div className="text-xs text-slate-500 mt-0.5">
                                            WA: {store.store_whatsapp} {store.store_phone ? `| Telp: ${store.store_phone}` : ''}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 dark:text-white">Email Resmi</div>
                                        <div className="text-xs text-slate-500 mt-0.5">{store.store_email}</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                                        <Clock className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 dark:text-white">Jam Operasional</div>
                                        <div className="text-xs text-slate-500 mt-0.5">{store.operating_hours}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Fast Response Guarantee */}
                        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-50/50 p-6 dark:bg-emerald-950/20">
                            <div className="flex items-center gap-3 mb-2">
                                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                <h3 className="font-bold text-emerald-900 dark:text-emerald-300 text-sm">Respon Cepat via WhatsApp</h3>
                            </div>
                            <p className="text-xs text-emerald-800/80 dark:text-emerald-400/80 leading-relaxed">
                                Pesan yang masuk pada jam operasional akan direspon oleh tim teknis kami dalam waktu kurang dari 15 menit.
                            </p>
                        </div>
                    </div>

                    {/* Right: Quick Direct WhatsApp Form */}
                    <div className="lg:col-span-7">
                        <div className="rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-emerald-600" />
                                <span>Kirim Pesan Langsung ke CS WhatsApp</span>
                            </h2>
                            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                                Tuliskan nama dan kebutuhan Anda di bawah ini, lalu klik tombol untuk langsung terhubung ke chat WhatsApp resmi Dodolan Store.
                            </p>

                            <form onSubmit={handleSendMessage} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                        Nama Anda / Nama Perusahaan
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Contoh: Budi Santoso (PT Maju Logistik)"
                                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                        Pesan / Kebutuhan Perangkat IoT
                                    </label>
                                    <textarea
                                        rows={4}
                                        required
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Contoh: Saya ingin menanyakan harga GPS Tracker GT-400 dan biaya pemasangan untuk 10 unit truk di Surabaya."
                                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-emerald-500 transition active:scale-95"
                                >
                                    <Send className="h-4 w-4" />
                                    <span>Buka Chat WhatsApp Sekarang</span>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Google Maps Embed Section */}
                {cleanGmapsUrl && (
                    <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-emerald-600 shrink-0" />
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                        Lokasi Kantor &amp; Layanan Operasional
                                    </h2>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    Kunjungi kantor operasional kami atau hubungi tim teknis kami untuk instalasi perangkat IoT dan sistem telematika armada.
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <a
                                    href={cleanGmapsUrl.replace('&output=embed', '')}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 transition"
                                >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    <span>Buka di Google Maps</span>
                                </a>
                                <div className="hidden sm:block text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 w-fit">
                                    <span>{store.store_city}</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative w-full h-[380px] sm:h-[450px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner bg-slate-100 dark:bg-slate-800">
                            <iframe
                                src={cleanGmapsUrl}
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title={`Peta Lokasi ${store.store_name}`}
                                className="w-full h-full"
                            />
                        </div>
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
