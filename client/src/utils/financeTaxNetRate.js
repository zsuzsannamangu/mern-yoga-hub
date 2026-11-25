import { normalizeFinanceLocation } from './normalizeFinanceLocation';

/** Average tax/withholding deductions by studio (percent of gross). */
export const TAX_DEDUCTION_PERCENT = {
    bhakti: 8.39,
    refuge: 10.84,
    other: 9.5,
};

/**
 * @param {string | null | undefined} location
 * @returns {number} deduction percent (e.g. 8.39)
 */
export function getTaxDeductionPercent(location) {
    const raw = String(location || '').toLowerCase();
    const n = normalizeFinanceLocation(location || '').toLowerCase();
    const hay = `${raw} ${n}`;

    if (hay.includes('bhakti') || /\bbymc\b/.test(hay)) {
        return TAX_DEDUCTION_PERCENT.bhakti;
    }
    if (hay.includes('yoga refuge') || hay.includes('yogarefuge')) {
        return TAX_DEDUCTION_PERCENT.refuge;
    }
    return TAX_DEDUCTION_PERCENT.other;
}

/**
 * Net = gross × (1 − deduction%). Empty string if gross is missing/invalid.
 * @param {string|number} grossRate
 * @param {string | null | undefined} location
 * @returns {string}
 */
export function calculateTaxedNetRate(grossRate, location) {
    const gross = parseFloat(grossRate);
    if (Number.isNaN(gross) || gross < 0 || grossRate === '' || grossRate == null) {
        return '';
    }
    const pct = getTaxDeductionPercent(location);
    const net = gross * (1 - pct / 100);
    return (Math.round(net * 100) / 100).toFixed(2);
}

/**
 * Short label for UI hints, e.g. "8.39% (Bhakti)".
 * @param {string | null | undefined} location
 */
export function taxDeductionHintLabel(location) {
    const pct = getTaxDeductionPercent(location);
    if (pct === TAX_DEDUCTION_PERCENT.bhakti) return `${pct}% avg (Bhakti)`;
    if (pct === TAX_DEDUCTION_PERCENT.refuge) return `${pct}% avg (Yoga Refuge)`;
    return `${pct}% avg`;
}
