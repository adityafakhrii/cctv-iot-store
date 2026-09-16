import { Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { 
    ShoppingBag, 
    Menu, 
    X, 
    PhoneCall, 
    ChevronRight, 
    Search, 
    User, 
    LayoutDashboard, 
    Package, 
    Wrench, 
    Settings, 
    LogOut,
    Shield
} from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useStoreSettings } from '@/hooks/use-store-settings';
import { getWhatsAppLink } from '@/lib/format';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PageProps {
    auth?: {
        user?: {
            id: number;
            name: string;
            email: string;
            is_admin: boolean;
        };
    };
    [key: string]: any;
}

export function StoreHeader() {
    const { url, props } = usePage<PageProps>();
    const authUser = props.auth?.user;
    const store = useStoreSettings();
    const { itemCount } = useCart();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Body scroll lock on mobile menu open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileMenuOpen]);

    const navLinks = [
        { name: 'Beranda', href: '/' },
        { name: 'Tentang Kami', href: '/tentang-kami' },
        { name: 'Produk', href: '/produk' },
        { name: 'Layanan', href: '/layanan' },
        { name: 'Portfolio', href: '/portfolio' },
        { name: 'Kontak', href: '/kontak' },
    ];

    const isActive = (href: string) => {
        if (href === '/') return url === '/';
        return url.startsWith(href);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        router.visit(`/produk?q=${encodeURIComponent(searchQuery.trim())}`);
    };

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95">
            {/* Top Announcement Bar */}
            {store.announcement_active !== '0' && store.announcement_active !== false && store.announcement_bar && (
                <div className="bg-slate-950 border-b border-slate-800 text-xs text-slate-300">
                    <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8 py-2">
                        <div className="flex items-center gap-2 text-[11px] sm:text-xs">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                            <span className="truncate max-w-[280px] sm:max-w-none">{store.announcement_bar}</span>
                            {store.announcement_link && (
                                <Link href={store.announcement_link} className="hidden sm:inline-block font-bold text-white underline hover:text-emerald-400 ml-1">
                                    Lihat Promo
                                </Link>
                            )}
                        </div>
                        <div className="hidden items-center gap-4 md:flex">
                            <a
                                href={getWhatsAppLink(store.store_whatsapp, 'Halo Dodolan Store, saya ingin info produk.')}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1.5 hover:text-emerald-400 transition"
                            >
                                <PhoneCall className="h-3 w-3 text-emerald-400" />
                                <span>CS WhatsApp: {store.store_phone || store.store_whatsapp}</span>
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Navbar */}
            <div className="mx-auto flex h-16 sm:h-20 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                {/* Brand Logo (Left) */}
                <Link href="/" className="flex items-center gap-3 shrink-0 group min-h-[44px]">
                    <img
                        src="/assets/logo/logo-dark.png"
                        alt="Dodolan Store"
                        className="h-8 sm:h-9 w-auto object-contain"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                </Link>

                {/* Center Navigation Links */}
                <nav className="hidden lg:flex items-center justify-center gap-1.5 flex-1 mx-6">
                    {navLinks.map((link) => {
                        const active = isActive(link.href);
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`px-3.5 py-2 text-xs font-bold transition rounded-xl ${active
                                        ? 'text-emerald-700 bg-emerald-50 shadow-xs dark:bg-emerald-950 dark:text-emerald-300'
                                        : 'text-slate-700 hover:text-emerald-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Right: Search Box + Action Icons */}
                <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                    {/* Header Search Box */}
                    <form onSubmit={handleSearchSubmit} className="relative hidden xl:block w-48">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari GPS / MDVR..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                        />
                        <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                    </form>

                    {/* Cart Button */}
                    <Link
                        href="/keranjang"
                        className="relative flex h-10 w-10 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:text-emerald-600 hover:border-emerald-300 transition dark:border-slate-800 dark:text-slate-300 min-h-[44px] min-w-[44px]"
                        title="Keranjang Belanja"
                    >
                        <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
                        {itemCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-extrabold text-white shadow-sm">
                                {itemCount > 99 ? '99+' : itemCount}
                            </span>
                        )}
                    </Link>

                    {/* User Account / Login Button */}
                    {authUser ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    className="flex items-center gap-2 h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 transition text-xs font-bold min-h-[44px]"
                                >
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-extrabold text-white">
                                        {authUser.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="max-w-[90px] truncate hidden md:inline-block">
                                        {authUser.name}
                                    </span>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl border-slate-200 dark:border-slate-800">
                                <DropdownMenuLabel className="font-normal px-2 py-1.5">
                                    <div className="flex flex-col space-y-0.5">
                                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                            {authUser.name}
                                        </p>
                                        <p className="text-[11px] text-slate-500 truncate">
                                            {authUser.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />

                                {authUser.is_admin ? (
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem asChild>
                                            <Link href="/admin/dashboard" className="cursor-pointer flex items-center gap-2 rounded-lg text-xs font-semibold py-2">
                                                <Shield className="h-4 w-4 text-emerald-600" />
                                                <span>Admin Dashboard</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/admin/orders" className="cursor-pointer flex items-center gap-2 rounded-lg text-xs font-semibold py-2">
                                                <Package className="h-4 w-4 text-slate-500" />
                                                <span>Kelola Semua Pesanan</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                ) : (
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem asChild>
                                            <Link href="/akun/dashboard" className="cursor-pointer flex items-center gap-2 rounded-lg text-xs font-semibold py-2">
                                                <LayoutDashboard className="h-4 w-4 text-emerald-600" />
                                                <span>Dashboard Akun</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/akun/pesanan" className="cursor-pointer flex items-center gap-2 rounded-lg text-xs font-semibold py-2">
                                                <Package className="h-4 w-4 text-slate-500" />
                                                <span>Pesanan Saya</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/akun/layanan" className="cursor-pointer flex items-center gap-2 rounded-lg text-xs font-semibold py-2">
                                                <Wrench className="h-4 w-4 text-slate-500" />
                                                <span>Pengajuan Layanan</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/akun/profil" className="cursor-pointer flex items-center gap-2 rounded-lg text-xs font-semibold py-2">
                                                <Settings className="h-4 w-4 text-slate-500" />
                                                <span>Pengaturan Profil &amp; Alamat</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                )}

                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer flex items-center gap-2 rounded-lg text-xs font-semibold py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950">
                                    <LogOut className="h-4 w-4" />
                                    <span>Keluar</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Link
                            href="/login"
                            className="flex items-center gap-1.5 h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:text-emerald-600 hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 transition text-xs font-bold min-h-[44px]"
                            title="Masuk atau Daftar Akun"
                        >
                            <User className="h-3.5 w-3.5" />
                            <span>Masuk</span>
                        </Link>
                    )}

                    {/* Consultation Fast CTA */}
                    <a
                        href={getWhatsAppLink(store.store_whatsapp, 'Halo Dodolan Store, saya ingin berkonsultasi mengenai solusi IoT untuk bisnis saya.')}
                        target="_blank"
                        rel="noreferrer"
                        className="hidden md:inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-500 transition active:scale-95 min-h-[40px]"
                    >
                        <span>Konsultasi IoT</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                    </a>

                    {/* Mobile Menu Toggle */}
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="flex lg:hidden h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 min-h-[44px] min-w-[44px]"
                        aria-label="Toggle navigation menu"
                    >
                        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Navigation */}
            {mobileMenuOpen && (
                <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-8 shadow-2xl animate-in slide-in-from-top-2 duration-200 dark:border-slate-800 dark:bg-slate-950 max-h-[calc(100dvh-70px)] overflow-y-auto">
                    {/* Mobile Search */}
                    <form onSubmit={handleSearchSubmit} className="relative mb-3">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari GPS, Kamera, MDVR..."
                            className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                        />
                        <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                    </form>

                    <div className="flex flex-col space-y-1">
                        {navLinks.map((link) => {
                            const active = isActive(link.href);
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`min-h-[44px] px-3.5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between transition ${active
                                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                            : 'text-slate-800 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900'
                                        }`}
                                >
                                    <span>{link.name}</span>
                                    <ChevronRight className="h-4 w-4 text-slate-400" />
                                </Link>
                            );
                        })}

                        {/* Mobile Auth Links */}
                        <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800">
                            {authUser ? (
                                <div className="space-y-1">
                                    <Link
                                        href={authUser.is_admin ? '/admin/dashboard' : '/akun/dashboard'}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="min-h-[44px] px-3.5 py-2.5 rounded-xl text-sm font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-between"
                                    >
                                        <span>{authUser.is_admin ? 'Admin Dashboard' : 'Dashboard Akun Saya'}</span>
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                    {!authUser.is_admin && (
                                        <>
                                            <Link
                                                href="/akun/pesanan"
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 flex items-center justify-between"
                                            >
                                                <span>Pesanan Saya</span>
                                                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                                            </Link>
                                            <Link
                                                href="/akun/layanan"
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 flex items-center justify-between"
                                            >
                                                <span>Pengajuan Layanan</span>
                                                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                                            </Link>
                                            <Link
                                                href="/akun/profil"
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 flex items-center justify-between"
                                            >
                                                <span>Pengaturan Profil &amp; Alamat</span>
                                                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                                            </Link>
                                        </>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMobileMenuOpen(false);
                                            handleLogout();
                                        }}
                                        className="w-full min-h-[44px] text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span>Keluar</span>
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    href="/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="min-h-[44px] px-3.5 py-2.5 rounded-xl text-sm font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-between"
                                >
                                    <span>Masuk / Daftar Akun</span>
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
