import { usePage } from '@inertiajs/react';
import type { StoreSettings } from '@/types/store';

const defaultStoreSettings: StoreSettings = {
    store_name: 'Dodolan Store',
    company_name: 'PT Dodolan Teknologi Nusantara',
    store_phone: '+62 811 5000 3775',
    store_whatsapp: '081150003775',
    store_email: 'halo@dodolan.store',
    store_address: 'Komp. Fantasy Junction Blok FJ4 No. 15',
    store_city: 'Balikpapan, Kalimantan Timur, Indonesia',
    store_postal_code: '76114',
    operating_hours: 'Senin – Sabtu: 08.00 – 17.00 WIB',
    announcement_bar: 'Promo Spesial: Diskon Hardware IoT & Gratis Biaya Survey Armada di Kalimantan Timur',
    announcement_link: '/produk',
    announcement_active: '1',
    store_gmaps_embed: 'https://maps.google.com/maps?q=Balikpapan%2C%20Kalimantan%20Timur&t=&z=14&ie=UTF8&iwloc=&output=embed',
};

export function useStoreSettings(): StoreSettings {
    const page = usePage<{ store?: StoreSettings }>();
    return {
        ...defaultStoreSettings,
        ...(page.props.store || {}),
    };
}
