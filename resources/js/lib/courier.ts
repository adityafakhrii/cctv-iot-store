export interface CourierTrackerInfo {
    name: string;
    url: string;
    label: string;
}

export const COURIER_PRESETS = [
    'JNE',
    'J&T',
    'SiCepat',
    'Anteraja',
    'Lion Parcel',
    'Gosend',
    'GrabExpress',
    'TIKI',
] as const;

export function getCourierTracker(courierName?: string | null, trackingNumber?: string | null): CourierTrackerInfo | null {
    if (!trackingNumber) return null;
    const courier = (courierName || '').toLowerCase().trim();
    const resi = encodeURIComponent(trackingNumber.trim());

    if (courier.includes('jne')) {
        return {
            name: 'JNE Express',
            url: 'https://www.jne.co.id/tracking-package',
            label: 'Lacak di Website JNE',
        };
    }

    if (courier.includes('j&t') || courier.includes('jnt')) {
        return {
            name: 'J&T Express',
            url: 'https://jet.co.id/track',
            label: 'Lacak di Website J&T',
        };
    }

    if (courier.includes('sicepat')) {
        return {
            name: 'SiCepat Ekspres',
            url: 'https://www.sicepat.com/checkAwb',
            label: 'Lacak di Website SiCepat',
        };
    }

    if (courier.includes('anteraja')) {
        return {
            name: 'Anteraja',
            url: 'https://anteraja.id/tracking',
            label: 'Lacak di Website Anteraja',
        };
    }

    if (courier.includes('lion')) {
        return {
            name: 'Lion Parcel',
            url: 'https://lionparcel.com/track',
            label: 'Lacak di Website Lion Parcel',
        };
    }

    if (courier.includes('tiki')) {
        return {
            name: 'TIKI',
            url: 'https://www.tiki.id/id/tracking',
            label: 'Lacak di Website TIKI',
        };
    }

    if (courier.includes('gosend') || courier.includes('gojek')) {
        return {
            name: 'GoSend',
            url: 'https://www.gojek.com/id-id/gosend/',
            label: 'Buka Website GoSend',
        };
    }

    if (courier.includes('grab')) {
        return {
            name: 'GrabExpress',
            url: 'https://express.grab.com/id/',
            label: 'Buka Website GrabExpress',
        };
    }

    // Default / custom courier fallback
    return {
        name: courierName || 'Ekspedisi',
        url: `https://cekresi.com/?noresi=${resi}`,
        label: `Lacak Resi (${courierName || 'Ekspedisi'})`,
    };
}
