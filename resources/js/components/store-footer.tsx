import { Link } from '@inertiajs/react';
import { Phone, Mail, MapPin, ChevronRight } from 'lucide-react';
import { useStoreSettings } from '@/hooks/use-store-settings';
import { getWhatsAppLink } from '@/lib/format';

export function StoreFooter() {
    const store = useStoreSettings();

    return (
        <footer className="border-t border-slate-200 bg-slate-900 text-slate-300 dark:border-slate-800">

            {/* Main Footer Links */}
            <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
                    {/* Brand Column */}
                    <div className="lg:col-span-2 space-y-4">
                        <Link href="/" className="inline-block">
                            <img src="/assets/logo/logo-white.png" alt={store.store_name} className="h-10 w-auto object-contain" />
                        </Link>
                        <p className="text-sm leading-relaxed text-slate-400 max-w-md">
                            {store.company_name} ({store.store_name}) adalah platform penyedia produk IoT terintegrasi, GPS Tracking armada, sistem AI MDVR, CCTV industri, serta solusi telematika untuk efisiensi dan keamanan bisnis Anda.
                        </p>
                        <div className="pt-2">
                            <a
                                href={getWhatsAppLink(store.store_whatsapp, 'Halo CS Dodolan Store, saya butuh bantuan konsultasi.')}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 transition"
                            >
                                <Phone className="h-4 w-4" />
                                <span>Hubungi Customer Support</span>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold text-white uppercase text-xs tracking-wider mb-4">Navigasi</h4>
                        <ul className="space-y-2.5 text-sm">
                            <li><Link href="/" className="hover:text-emerald-400 transition flex items-center gap-1"><ChevronRight className="h-3 w-3 text-slate-600" /> Beranda</Link></li>
                            <li><Link href="/tentang-kami" className="hover:text-emerald-400 transition flex items-center gap-1"><ChevronRight className="h-3 w-3 text-slate-600" /> Tentang Kami</Link></li>
                            <li><Link href="/produk" className="hover:text-emerald-400 transition flex items-center gap-1"><ChevronRight className="h-3 w-3 text-slate-600" /> Katalog Produk</Link></li>
                            <li><Link href="/layanan" className="hover:text-emerald-400 transition flex items-center gap-1"><ChevronRight className="h-3 w-3 text-slate-600" /> Layanan &amp; Survey</Link></li>
                            <li><Link href="/portfolio" className="hover:text-emerald-400 transition flex items-center gap-1"><ChevronRight className="h-3 w-3 text-slate-600" /> Portfolio Project</Link></li>
                            <li><Link href="/kontak" className="hover:text-emerald-400 transition flex items-center gap-1"><ChevronRight className="h-3 w-3 text-slate-600" /> Kontak Perusahaan</Link></li>
                        </ul>
                    </div>

                    {/* Solutions & Categories */}
                    <div>
                        <h4 className="font-bold text-white uppercase text-xs tracking-wider mb-4">Produk IoT</h4>
                        <ul className="space-y-2.5 text-sm">
                            <li><Link href="/produk?category=gps-tracking" className="hover:text-emerald-400 transition">GPS Fleet Tracking</Link></li>
                            <li><Link href="/produk?category=mdvr" className="hover:text-emerald-400 transition">AI MDVR ADAS &amp; DSM</Link></li>
                            <li><Link href="/produk?category=dashcam" className="hover:text-emerald-400 transition">4G Dual Live Dashcam</Link></li>
                            <li><Link href="/produk?category=cctv" className="hover:text-emerald-400 transition">Industrial CCTV</Link></li>
                            <li><Link href="/produk?category=battery" className="hover:text-emerald-400 transition">LiFePO4 IoT Battery</Link></li>
                            <li><Link href="/produk?category=accessories" className="hover:text-emerald-400 transition">Sensor Bahan Bakar &amp; BLE</Link></li>
                        </ul>
                    </div>

                    {/* Contact info */}
                    <div>
                        <h4 className="font-bold text-white uppercase text-xs tracking-wider mb-4">Kontak</h4>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li className="flex items-start gap-2.5">
                                <MapPin className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                                <span>{store.store_address}, {store.store_city} {store.store_postal_code ? `(${store.store_postal_code})` : ''}</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <Phone className="h-4 w-4 shrink-0 text-emerald-400" />
                                <span>{store.store_phone || store.store_whatsapp}</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <Mail className="h-4 w-4 shrink-0 text-emerald-400" />
                                <span>{store.store_email}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Sub-footer */}
            <div className="border-t border-slate-800 bg-slate-950 py-6 text-xs text-slate-500">
                <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
                    <p>© 2026 {store.company_name || store.store_name}. All rights reserved.</p>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="hover:text-slate-300 transition">Portal Internal Admin</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
