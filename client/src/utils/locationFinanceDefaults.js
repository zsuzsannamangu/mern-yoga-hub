/**
 * Static fallbacks when an admin picks a location preset on "Add New Entry" (Admin Finances).
 * Admin Finances merges the latest saved row for that location on top of these defaults
 * (see inferFinanceDefaultsFromHistory.js) when history exists.
 * Keys are `LOCATION_PRESETS[].id` in AdminFinances (keep in sync with that list).
 */

/** Shared profile for in-person / listed teaching venues (payment workflow matches Full Bodied). */
const YOGA_VENUE_AUTOFILL = {
    category: 'yoga teaching',
    grossRate: '',
    receivedRate: '',
    paymentFrequency: 'biweekly',
    paymentMethod: 'deposit',
    paymentRequestSent: 'n/a',
    taxed: 'no',
    paid: 'no',
};

/**
 * Per-preset rate overrides only — all other fields come from {@link YOGA_VENUE_AUTOFILL}.
 * Add rows here when a studio has a standard class rate.
 */
const PRESET_RATE_OVERRIDES = {
    fullbodied: { grossRate: '55', receivedRate: '55' },
};

/** Every finances location preset except `other` gets yoga-venue autofill. */
const FINANCES_LOCATION_PRESET_IDS = [
    'bhakti',
    'blhc',
    'dear',
    'danner-boots',
    'firelight',
    'fullbodied',
    'yoga-refuge-nw',
    'yoga-refuge-se',
    'peoples-yoga-ne',
    'peoples-yoga-se',
    'heartspring',
    'practice-space',
    'ready-set-grow',
    'yoga-riot',
    'online',
];

function buildDefaultsByPreset() {
    const out = {};
    for (const id of FINANCES_LOCATION_PRESET_IDS) {
        out[id] = { ...YOGA_VENUE_AUTOFILL, ...(PRESET_RATE_OVERRIDES[id] || {}) };
    }
    return out;
}

export const LOCATION_FINANCE_DEFAULTS_BY_PRESET = buildDefaultsByPreset();

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
