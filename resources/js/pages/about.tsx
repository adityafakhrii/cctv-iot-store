import { Head, Link } from '@inertiajs/react';
import { PublicLayout } from '@/layouts/public-layout';
import { ShieldCheck, Cpu, Target, Award, CheckCircle2, ChevronRight, PhoneCall } from 'lucide-react';
import { useStoreSettings } from '@/hooks/use-store-settings';
import { getWhatsAppLink } from '@/lib/format';

export default function About() {
    const store = useStoreSettings();

    return (
        <PublicLayout>
            <Head title={`Tentang Kami — ${store.store_name}`} />

            {/* Header Hero */}
            <div className="bg-slate-900 text-white py-16 lg:py-20 border-b border-slate-800">
                <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl space-y-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                            Profil Perusahaan
                        </p>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
                            Membangun Masa Depan Terhubung Melalui Inovasi IoT &amp; Telemetri
                        </h1>
                        <p className="text-base text-slate-300 sm:text-lg leading-relaxed">
                            {store.store_name} ({store.company_name}) adalah perusahaan teknologi yang berfokus pada integrasi perangkat keras IoT, pelacakan armada kendaraan, pemantauan keselamatan AI, dan solusi telemetri industri terdepan.
                        </p>
                    </div>
                </div>
            </div>

            {/* Vision and Mission */}
            <div className="py-16 lg:py-20">
                <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Fokus &amp; Dedikasi</span>
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                                    Solusi End-to-End untuk Efisiensi Bisnis
                                </h2>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                Kami memahami bahwa di era mobilitas tinggi, manajemen armada logistik, keamanan fasilitas industri, dan pemantauan sensor secara real-time adalah faktor penentu profitabilitas perusahaan. 
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                Dodolan Store hadir menjembatani kebutuhan perangkat keras bersertifikasi dengan layanan instalasi profesional dan dukungan purna jual yang andal di seluruh Indonesia.
                            </p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Visi</h4>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                                        Menjadi penyedia hardware IoT dan ekosistem telematika armada kendaraan komersial paling terpercaya di Indonesia.
                                    </p>
                                </div>
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Misi</h4>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                                        Menyediakan perangkat bersertifikasi resmi, instalasi kelistrikan berstandar otomotif, dan pendampingan integrasi sistem telemetri.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Visual Brand Card */}
                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8 text-white shadow-xl">
                            <div className="flex items-center gap-3 border-b border-slate-800 pb-5 mb-5">
                                <img src="/assets/logo/logo-white.png" alt="Dodolan Logo" className="h-8 w-auto" />
                            </div>
                            <h3 className="text-lg font-bold mb-4 text-white">Standar &amp; Jaminan Layanan</h3>
                            <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                                <li className="flex items-start gap-2.5">
                                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                                    <span>Hardware tersertifikasi resmi SDPPI Kominfo dan bergaransi unit 1 tahun.</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                                    <span>Protokol komunikasi terbuka: REST API, MQTT, TCP/IP, dan integrasi GPS Tracker.</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                                    <span>Teknisi lapangan bersertifikat untuk instalasi rapi armada 12V &amp; 24V.</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                                    <span>Dukungan purna jual, suku cadang, dan klaim unit pengganti cepat.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="border-t border-slate-200 bg-slate-50 py-12 dark:border-slate-800 dark:bg-slate-900/50">
                <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Ingin Mengetahui Lebih Jauh Tentang Layanan Kami?
                    </h2>
                    <p className="mt-2 text-sm text-slate-500 max-w-xl mx-auto">
                        Hubungi perwakilan teknis kami untuk mendiskusikan integrasi sistem IoT armada Anda.
                    </p>
                    <div className="mt-6 flex justify-center gap-4">
                        <Link
                            href="/produk"
                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 transition"
                        >
                            <span>Lihat Katalog Produk</span>
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                        <a
                            href={getWhatsAppLink(store.store_whatsapp, `Halo ${store.store_name}, saya ingin info lebih lanjut tentang perusahaan Anda.`)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        >
                            <PhoneCall className="h-4 w-4" />
                            <span>Chat WhatsApp</span>
                        </a>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
