import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { AdminLayout } from '@/layouts/admin-layout';
import { CustomSelect } from '@/components/ui/custom-select';
import { formatDate, getWhatsAppLink } from '@/lib/format';
import { Search, Wrench, Phone, Mail, MapPin, CheckCircle2, Trash2, MessageSquare, Plus, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ServiceRequest {
    id: number;
    name: string;
    email: string;
    phone: string;
    service_type: string;
    location: string;
    description: string;
    note?: string;
    status: string;
    created_at: string;
}

interface ServiceRequestIndexProps {
    requests: {
        data: ServiceRequest[];
        current_page: number;
        last_page: number;
        total: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    filters: {
        q: string;
        status: string;
        service_type: string;
    };
}

export default function ServiceRequestsIndex({ requests, filters }: ServiceRequestIndexProps) {
    const [search, setSearch] = useState(filters.q || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        service_type: 'Instalasi',
        location: '',
        description: '',
        note: '',
        status: 'Baru',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/service-requests', { ...filters, q: search }, { preserveState: true, replace: true });
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/service-requests', {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
                toast.success('Pengajuan layanan baru berhasil ditambahkan.');
            },
        });
    };

    const handleFilterChange = (key: string, val: string) => {
        router.get('/admin/service-requests', { ...filters, [key]: val }, { preserveState: true, replace: true });
    };

    const handleStatusUpdate = (req: ServiceRequest, newStatus: string) => {
        router.patch(`/admin/service-requests/${req.id}/status`, { status: newStatus }, {
            onSuccess: () => toast.success(`Status pengajuan berhasil diubah menjadi "${newStatus}".`),
        });
    };

    const handleDelete = (req: ServiceRequest) => {
        if (confirm(`Hapus pengajuan layanan dari "${req.name}"?`)) {
            router.delete(`/admin/service-requests/${req.id}`, {
                onSuccess: () => toast.success('Pengajuan layanan berhasil dihapus.'),
            });
        }
    };

    return (
        <AdminLayout title="Kelola Pengajuan Layanan IoT">
            <Head title="Admin - Service Requests — Dodolan Store" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            Pengajuan Layanan Instalasi, Survey &amp; Maintenance ({requests.total})
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Tindak lanjuti permintaan teknisi armada dari calon klien atau pelanggan.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            reset();
                            setIsCreateModalOpen(true);
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 transition cursor-pointer shrink-0"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Tambah Layanan Baru</span>
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
                    <form onSubmit={handleSearch} className="relative flex-1 w-full">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama pemohon, lokasi, email..."
                            className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    </form>

                    <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                        <CustomSelect
                            value={filters.service_type || ''}
                            onChange={(val) => handleFilterChange('service_type', val)}
                            size="sm"
                            className="w-full sm:w-44"
                            options={[
                                { value: '', label: 'Semua Layanan' },
                                { value: 'Instalasi', label: 'Instalasi' },
                                { value: 'Survey', label: 'Survey' },
                                { value: 'Maintenance', label: 'Maintenance' },
                            ]}
                        />

                        <CustomSelect
                            value={filters.status || ''}
                            onChange={(val) => handleFilterChange('status', val)}
                            size="sm"
                            className="w-full sm:w-44"
                            options={[
                                { value: '', label: 'Semua Status' },
                                { value: 'Baru', label: 'Baru' },
                                { value: 'Diproses', label: 'Diproses' },
                                { value: 'Selesai', label: 'Selesai' },
                            ]}
                        />
                    </div>
                </div>

                {/* Hybrid Responsive Table & Mobile Cards */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
                    {/* Mobile Cards View (< 768px) */}
                    <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                        {requests.data.length > 0 ? (
                            requests.data.map((req) => (
                                <div key={req.id} className="p-4 space-y-3">
                                    <div className="flex items-center justify-between gap-2">
                                        <div>
                                            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                                                {req.name}
                                            </h3>
                                            <div className="text-[11px] text-slate-400 font-mono">{req.phone} • {req.email}</div>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md ${
                                            req.service_type === 'Instalasi'
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                                                : req.service_type === 'Survey'
                                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                                                : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                                        }`}>
                                            {req.service_type}
                                        </span>
                                    </div>

                                    <div className="space-y-1.5 text-xs">
                                        <div className="flex items-start gap-1.5 text-slate-600 dark:text-slate-300">
                                            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                                            <span className="leading-relaxed">{req.location}</span>
                                        </div>
                                        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                                            <div className="font-semibold text-slate-900 dark:text-white mb-0.5">Kebutuhan:</div>
                                            {req.description}
                                            {req.note && <div className="text-[11px] italic text-slate-400 mt-1 border-t border-slate-200 dark:border-slate-700 pt-1">Catatan: {req.note}</div>}
                                        </div>
                                    </div>

                                    {/* Status Updater on Mobile */}
                                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-3">
                                        <span className="text-[11px] font-bold uppercase text-slate-400">Ubah Status:</span>
                                        <CustomSelect
                                            value={req.status}
                                            onChange={(val) => handleStatusUpdate(req, val)}
                                            size="sm"
                                            className="w-36"
                                            options={[
                                                { value: 'Baru', label: 'Baru' },
                                                { value: 'Diproses', label: 'Diproses' },
                                                { value: 'Selesai', label: 'Selesai' },
                                            ]}
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-2 gap-2 pt-1">
                                        <a
                                            href={getWhatsAppLink(req.phone, `Halo Bapak/Ibu ${req.name}, kami dari tim teknisi Dodolan Store ingin menindaklanjuti pengajuan layanan ${req.service_type} di lokasi ${req.location}.`)}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 transition active:scale-[0.99]"
                                        >
                                            <MessageSquare className="h-4 w-4" />
                                            <span>Chat WhatsApp</span>
                                        </a>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(req)}
                                            className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 text-xs font-bold hover:bg-rose-100 transition cursor-pointer"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            <span>Hapus</span>
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-xs text-slate-400">
                                Belum ada pengajuan layanan yang sesuai filter.
                            </div>
                        )}
                    </div>

                    {/* Desktop Table View (>= 768px) */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="px-5 py-3.5">Pemohon</th>
                                    <th className="px-5 py-3.5">Jenis Layanan</th>
                                    <th className="px-5 py-3.5">Lokasi</th>
                                    <th className="px-5 py-3.5">Deskripsi Kebutuhan</th>
                                    <th className="px-5 py-3.5">Status Progres</th>
                                    <th className="px-5 py-3.5">Tanggal</th>
                                    <th className="px-5 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {requests.data.length > 0 ? (
                                    requests.data.map((req) => (
                                        <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                                            <td className="px-5 py-4">
                                                <div className="font-bold text-slate-900 dark:text-white">{req.name}</div>
                                                <div className="text-[10px] text-slate-400">{req.phone} • {req.email}</div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`font-bold px-2 py-0.5 rounded-md ${
                                                    req.service_type === 'Instalasi'
                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                                                        : req.service_type === 'Survey'
                                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                                                        : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                                                }`}>
                                                    {req.service_type}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                                                {req.location}
                                            </td>
                                            <td className="px-5 py-4 text-slate-500 max-w-sm">
                                                <div className="line-clamp-2">{req.description}</div>
                                                {req.note && <div className="text-[10px] italic text-slate-400 mt-0.5">Catatan: {req.note}</div>}
                                            </td>
                                            <td className="px-5 py-4">
                                                <CustomSelect
                                                    value={req.status}
                                                    onChange={(val) => handleStatusUpdate(req, val)}
                                                    size="sm"
                                                    className="w-32"
                                                    options={[
                                                        { value: 'Baru', label: 'Baru' },
                                                        { value: 'Diproses', label: 'Diproses' },
                                                        { value: 'Selesai', label: 'Selesai' },
                                                    ]}
                                                />
                                            </td>
                                            <td className="px-5 py-4 text-slate-400">
                                                {formatDate(req.created_at)}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <a
                                                        href={getWhatsAppLink(req.phone, `Halo Bapak/Ibu ${req.name}, kami dari tim teknisi Dodolan Store ingin menindaklanjuti pengajuan layanan ${req.service_type} di lokasi ${req.location}.`)}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex min-h-[36px] items-center gap-1 rounded-xl bg-emerald-50 text-emerald-700 px-3 py-1.5 font-bold hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400 transition"
                                                        title="Follow up WhatsApp"
                                                    >
                                                        <MessageSquare className="h-3.5 w-3.5" />
                                                        <span>Chat</span>
                                                    </a>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(req)}
                                                        className="p-2 text-slate-400 hover:text-rose-600 transition rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                                                        title="Hapus Pengajuan"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                                            Belum ada pengajuan layanan yang sesuai filter.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {requests.last_page > 1 && (
                        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap justify-center gap-1.5 sm:gap-2">
                            {requests.links.map((link, idx) => link.url ? (
                                <Link
                                    key={idx}
                                    href={link.url}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`min-h-[40px] min-w-[40px] flex items-center justify-center px-3 py-2 rounded-xl text-xs font-semibold transition ${
                                        link.active ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                                    }`}
                                />
                            ) : null)}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Service Request Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
                    <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900 shadow-2xl space-y-4 max-h-[90dvh] overflow-y-auto animate-in zoom-in-95">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                                    <Wrench className="h-4 w-4" />
                                </div>
                                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                                    Tambah Pengajuan Layanan Baru
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsCreateModalOpen(false)}
                                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                                        Nama Pemohon / Perusahaan <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Contoh: PT Armada Logistik / Budi"
                                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    />
                                    {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                                        Email Pemohon <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="budi@example.com"
                                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    />
                                    {errors.email && <p className="text-[11px] text-rose-500 mt-1">{errors.email}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                                        No. WhatsApp / Telepon <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="081234567890"
                                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    />
                                    {errors.phone && <p className="text-[11px] text-rose-500 mt-1">{errors.phone}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                                        Jenis Layanan <span className="text-rose-500">*</span>
                                    </label>
                                    <CustomSelect
                                        value={data.service_type}
                                        onChange={(val) => setData('service_type', val)}
                                        className="w-full"
                                        options={[
                                            { value: 'Instalasi', label: 'Instalasi Perangkat IoT' },
                                            { value: 'Survey', label: 'Survey Lokasi & Armada' },
                                            { value: 'Maintenance', label: 'Maintenance & Kalibrasi Sensor' },
                                        ]}
                                    />
                                    {errors.service_type && <p className="text-[11px] text-rose-500 mt-1">{errors.service_type}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                                        Lokasi Armada / Proyek <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={data.location}
                                        onChange={(e) => setData('location', e.target.value)}
                                        placeholder="Contoh: Pool Truk Waru, Sidoarjo"
                                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    />
                                    {errors.location && <p className="text-[11px] text-rose-500 mt-1">{errors.location}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                                        Status Awal
                                    </label>
                                    <CustomSelect
                                        value={data.status}
                                        onChange={(val) => setData('status', val)}
                                        className="w-full"
                                        options={[
                                            { value: 'Baru', label: 'Baru' },
                                            { value: 'Diproses', label: 'Diproses' },
                                            { value: 'Selesai', label: 'Selesai' },
                                        ]}
                                    />
                                    {errors.status && <p className="text-[11px] text-rose-500 mt-1">{errors.status}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                                    Deskripsi Kebutuhan &amp; Spesifikasi <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Jelaskan kebutuhan teknis armada, jumlah unit, tipe kendaraan, dsb..."
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                />
                                {errors.description && <p className="text-[11px] text-rose-500 mt-1">{errors.description}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                                    Catatan Tambahan (Opsional)
                                </label>
                                <input
                                    type="text"
                                    value={data.note}
                                    onChange={(e) => setData('note', e.target.value)}
                                    placeholder="Jadwal preferensi teknisi atau kontak PIC lapangan"
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    disabled={processing}
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition shadow-sm disabled:opacity-50 cursor-pointer"
                                >
                                    {processing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                    <span>Simpan Pengajuan Layanan</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
