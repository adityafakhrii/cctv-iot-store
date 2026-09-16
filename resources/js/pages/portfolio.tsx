import { Head, Link } from '@inertiajs/react';
import { PublicLayout } from '@/layouts/public-layout';
import { Briefcase, Building2, Calendar, CheckCircle2, ChevronRight, PhoneCall } from 'lucide-react';
import { useStoreSettings } from '@/hooks/use-store-settings';
import { getWhatsAppLink } from '@/lib/format';

interface Project {
    id: number;
    title: string;
    client: string;
    category: string;
    year: string;
    description: string;
    results: string;
    image: string;
}

interface PortfolioProps {
    projects: Project[];
}

export default function Portfolio({ projects }: PortfolioProps) {
    const store = useStoreSettings();

    return (
        <PublicLayout>
            <Head title={`Portfolio & Implementasi Proyek — ${store.store_name}`} />

            {/* Hero Header */}
            <div className="bg-slate-900 text-white py-16 border-b border-slate-800">
                <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl space-y-3">
                        <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                            Showcase &amp; Rekam Jejak
                        </p>
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                            Implementasi Proyek IoT &amp; Telematika Armada
                        </h1>
                        <p className="text-sm text-slate-400 leading-relaxed sm:text-base">
                            Bukti nyata integrasi perangkat keras Dodolan pada industri transportasi logistik, pertambangan, cold-chain, dan fasilitas komersial.
                        </p>
                    </div>
                </div>
            </div>

            {/* Projects List */}
            <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm hover:shadow-md transition"
                        >
                            <div className="aspect-16/9 w-full bg-slate-950 overflow-hidden relative">
                                <img
                                    src={project.image}
                                    alt={project.title}
                                    className="h-full w-full object-cover object-center"
                                />
                                <div className="absolute top-3 left-3">
                                    <span className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                                        {project.category}
                                    </span>
                                </div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 text-xs text-slate-400">
                                        <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {project.client}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {project.year}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                                        {project.title}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                        {project.description}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-emerald-50/70 p-3.5 dark:bg-emerald-950/40 border border-emerald-500/20">
                                    <div className="flex items-start gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                                        <span>Hasil: {project.results}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Consultation Box */}
                <div className="mt-16 rounded-2xl bg-slate-900 p-8 sm:p-10 text-white border border-slate-800 text-center max-w-3xl mx-auto">
                    <h3 className="text-xl sm:text-2xl font-bold">Ingin Mengimplementasikan Solusi Serupa?</h3>
                    <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                        Kami siap melakukan survey kebutuhan teknis armada Anda dan menyusun proposal implementasi terinci.
                    </p>
                    <div className="mt-6 flex justify-center gap-4">
                        <Link
                            href="/layanan"
                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition"
                        >
                            <span>Ajukan Survey Lokasi</span>
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                        <a
                            href={getWhatsAppLink(store.store_whatsapp, `Halo ${store.store_name}, saya ingin mendiskusikan implementasi proyek IoT.`)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-5 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700"
                        >
                            <PhoneCall className="h-4 w-4" />
                            <span>WhatsApp Tim Proyek</span>
                        </a>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
