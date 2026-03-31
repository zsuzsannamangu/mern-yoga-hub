/**
 * Drive estimates for finances (miles + gas). Canonical values load from API in AdminFinances;
 * this module holds Tucson defaults, pure helpers, and one-time legacy localStorage migration.
 */

const LS_TRAVEL = 'yogasavor_finance_travel';
const LS_MILES = 'yogasavor_finance_location_miles';

/**
 * Hyundai Tucson Hybrid (2024–25): EPA combined 38 mpg (FWD) / 37 mpg (AWD). Midpoint for a reasonable default.
 */
export const DEFAULT_TUCSON_HYBRID_MPG = 37.5;

/** Placeholder $/gal when none stored yet (update in Finances → location stats). */
export const DEFAULT_GAS_PRICE_PER_GALLON = 3.65;

export function isOnlineCanonicalLocation(canonical) {
    return (canonical || '').trim().toLowerCase() === 'online';
}

function safeParseJson(raw, fallback) {
    try {
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

/** Old browser-only storage; used only to migrate into MongoDB once. */
export function readLegacyLocationMiles() {
    const parsed = safeParseJson(localStorage.getItem(LS_MILES), {});
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? { ...parsed } : {};
}

export function readLegacyTravelSettings() {
    const parsed = safeParseJson(localStorage.getItem(LS_TRAVEL), {});
    return {
        mpg:
            typeof parsed.mpg === 'number' && parsed.mpg > 0 ? parsed.mpg : DEFAULT_TUCSON_HYBRID_MPG,
        gasPricePerGallon:
            typeof parsed.gasPricePerGallon === 'number' && parsed.gasPricePerGallon >= 0
                ? parsed.gasPricePerGallon
                : DEFAULT_GAS_PRICE_PER_GALLON,
    };
}

export function clearLegacyFinanceTravelLocalStorage() {
    try {
        localStorage.removeItem(LS_TRAVEL);
        localStorage.removeItem(LS_MILES);
    } catch {
        /* ignore */
    }
}

export function getOneWayMilesForLocation(canonicalLocation, overridesRaw) {
    if (isOnlineCanonicalLocation(canonicalLocation)) return 0;
    const overrides =
        overridesRaw != null && typeof overridesRaw === 'object' && !Array.isArray(overridesRaw)
            ? overridesRaw
            : {};
    const v = overrides[canonicalLocation];
    if (typeof v === 'number' && v >= 0) return v;
    if (typeof v === 'string' && v.trim() !== '') {
        const n = parseFloat(v);
        if (!Number.isNaN(n) && n >= 0) return n;
    }
    return null;
}

export function estimateGasCostUsd(totalMiles, mpg, pricePerGallon) {
    if (totalMiles == null || mpg <= 0) return null;
    const gallons = totalMiles / mpg;
    return gallons * pricePerGallon;
}
