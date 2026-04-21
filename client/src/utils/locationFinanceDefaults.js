/**
 * When an admin picks a saved location preset on "Add New Entry" (Admin Finances),
 * merge these fields so common studios do not need manual entry.
 * Keys are `LOCATION_PRESETS[].id` in AdminFinances / AdminDashboard.
 */
export const LOCATION_FINANCE_DEFAULTS_BY_PRESET = {
    fullbodied: {
        category: 'yoga teaching',
        grossRate: '55',
        receivedRate: '55',
        paymentFrequency: 'biweekly',
        paymentMethod: 'deposit',
        paymentRequestSent: 'n/a',
        taxed: 'no',
        paid: 'no',
    },
};

/** Baseline finance fields when the chosen preset has no specific defaults (e.g. Other). */
export const ADD_ENTRY_FINANCE_FIELD_DEFAULTS = {
    category: 'other',
    grossRate: '',
    receivedRate: '',
    paymentFrequency: 'per-class',
    paymentMethod: 'cash',
    paymentRequestSent: 'no',
    taxed: 'no',
    paid: 'no',
};
