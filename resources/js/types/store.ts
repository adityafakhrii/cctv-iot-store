export interface StoreSettings {
    store_name: string;
    company_name: string;
    store_phone: string;
    store_whatsapp: string;
    store_email: string;
    store_address: string;
    store_city: string;
    store_postal_code: string;
    operating_hours: string;
    announcement_bar: string;
    announcement_link: string;
    announcement_active: string | boolean;
    store_gmaps_embed?: string;
    [key: string]: unknown;
}
