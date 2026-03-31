/**
 * Drive estimates for finances: one-way miles per canonical location (browser localStorage).
 * Defaults tuned for Hyundai Tucson Hybrid (~37–38 mpg combined EPA).
 */

const LS_TRAVEL = 'yogasavor_finance_travel';
const LS_MILES = 'yogasavor_finance_location_miles';

/** EPA combined MPG ballpark for Tucson Hybrid (user can override in UI). */
export const DEFAULT_TUCSON_HYBRID_MPG = 38;

/** Optional default $/gal ; user should set to their area. */
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

export function loadTravelSettings() {
    const parsed = safeParseJson(localStorage.getItem(LS_TRAVEL), {});
    return {
        mpg: typeof parsed.mpg === 'number' && parsed.mpg > 0 ? parsed.mpg : DEFAULT_TUCSON_HYBRID_MPG,
        gasPricePerGallon:
            typeof parsed.gasPricePerGallon === 'number' && parsed.gasPricePerGallon >= 0
                ? parsed.gasPricePerGallon
                : DEFAULT_GAS_PRICE_PER_GALLON,
    };
}

export function saveTravelSettings({ mpg, gasPricePerGallon }) {
    const prev = loadTravelSettings();
    const next = {
        mpg: typeof mpg === 'number' && mpg > 0 ? mpg : prev.mpg,
        gasPricePerGallon:
            typeof gasPricePerGallon === 'number' && gasPricePerGallon >= 0
                ? gasPricePerGallon
                : prev.gasPricePerGallon,
    };
    localStorage.setItem(LS_TRAVEL, JSON.stringify(next));
    return next;
}

export function loadMilesOverrides() {
    const parsed = safeParseJson(localStorage.getItem(LS_MILES), {});
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? { ...parsed } : {};
}

export function saveMilesOverrides(overrides) {
    localStorage.setItem(LS_MILES, JSON.stringify(overrides));
}

export function getOneWayMilesForLocation(canonicalLocation, overridesRaw) {
    if (isOnlineCanonicalLocation(canonicalLocation)) return 0;
    const overrides = overridesRaw || loadMilesOverrides();
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
