import { Booking } from '@/store/adminStore';

/** Wrap a cell value in quotes and escape any internal quotes */
function csvCell(value: unknown): string {
    const s = value === null || value === undefined ? '' : String(value);
    return `"${s.replace(/"/g, '""')}"`;
}

// The Booking type from adminStore has minimal fields since the full
// populated object comes from the backend. We use a local extended type
// to represent the runtime shape.
interface PopulatedBooking {
    _id: string;
    status: string;
    date?: string;
    time?: string;
    totalPrice?: number;
    createdAt?: string;
    customerId?: { firstName?: string; lastName?: string; email?: string; phone?: string };
    serviceId?: { name?: string };
    schedule?: { date?: string; timeSlot?: string; estimatedHours?: number };
    address?: { line1?: string; suburb?: string; city?: string; province?: string; postalCode?: string };
    property?: { bedrooms?: number; bathrooms?: number; sqm?: number; conditionLevel?: string };
    payment?: { status?: string; amount?: number; provider?: string; reference?: string };
    extrasSelected?: string[];
    staffAssignedIds?: { firstName?: string; lastName?: string }[];
    photos?: { before?: string[]; after?: string[] };
}

const HEADERS = [
    'Booking ID',
    'Customer Name',
    'Customer Email',
    'Customer Phone',
    'Service',
    'Status',
    'Date',
    'Time Slot',
    'Est. Hours',
    'Address',
    'Suburb',
    'City',
    'Province',
    'Postal Code',
    'Bedrooms',
    'Bathrooms',
    'Size (sqm)',
    'Condition',
    'Extras',
    'Payment Status',
    'Amount (R)',
    'Payment Provider',
    'Payment Reference',
    'Assigned Staff',
    'Before Photos',
    'After Photos',
    'Created At',
];

export function bookingsToCsv(bookings: Booking[]): string {
    const rows = (bookings as unknown as PopulatedBooking[]).map((b) => {
        const assignedStaffNames = b.staffAssignedIds
            ?.map((s) => `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim())
            .join('; ') ?? '';

        const amountRaw = b.payment?.amount;
        const amount = amountRaw !== undefined
            ? (amountRaw / 100).toFixed(2)   // stored in cents (Paystack)
            : (b.totalPrice ?? '');

        return [
            b._id,
            `${b.customerId?.firstName ?? ''} ${b.customerId?.lastName ?? ''}`.trim(),
            b.customerId?.email ?? '',
            b.customerId?.phone ?? '',
            b.serviceId?.name ?? '',
            b.status,
            b.schedule?.date ? new Date(b.schedule.date).toLocaleDateString('en-ZA') : (b.date ?? ''),
            b.schedule?.timeSlot ?? b.time ?? '',
            b.schedule?.estimatedHours ?? '',
            b.address?.line1 ?? '',
            b.address?.suburb ?? '',
            b.address?.city ?? '',
            b.address?.province ?? '',
            b.address?.postalCode ?? '',
            b.property?.bedrooms ?? '',
            b.property?.bathrooms ?? '',
            b.property?.sqm ?? '',
            b.property?.conditionLevel ?? '',
            b.extrasSelected?.join('; ') ?? '',
            b.payment?.status ?? '',
            amount,
            b.payment?.provider ?? '',
            b.payment?.reference ?? '',
            assignedStaffNames,
            b.photos?.before?.length ?? 0,
            b.photos?.after?.length ?? 0,
            b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-ZA') : '',
        ].map(csvCell).join(',');
    });

    return [HEADERS.map(csvCell).join(','), ...rows].join('\r\n');
}

export function downloadCsv(csv: string, filename: string): void {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
