/**
 * Map messy / abbreviated studio names to canonical labels used in AdminFinances presets.
 * Unknown strings are returned trimmed (spacing collapsed) unchanged.
 */

const PEOPLES_NW = "The People's Yoga, NW location";
const PEOPLES_SE = "The People's Yoga, SE location";
const PEOPLES_GENERIC = "The People's Yoga";

const PRESET_CANONICAL = [
    'The Bhakti Yoga Movement Center',
    'BLHC',
    'Dear Yoga',
    'Danner Boots',
    'Firelight Yoga',
    'Full Bodied Yoga',
    'Yoga Refuge, NW location',
    'Yoga Refuge, SE location',
    PEOPLES_NW,
    PEOPLES_SE,
    'Heart Spring Health',
    'The Practice Space',
    'Ready Set Grow',
    'Online',
];

function collapseWhitespace(str) {
    return String(str || '')
        .trim()
        .replace(/\s+/g, ' ');
}

/**
 * @param {string | null | undefined} raw
 * @returns {string}
 */
export function normalizeFinanceLocation(raw) {
    const s = collapseWhitespace(raw);
    if (!s) return '';

    const lower = s.toLowerCase();
    const lettersOnly = lower.replace(/[^a-z]/g, '');

    // Compact abbreviations (FLY, FBY, TPY, TPY-NW, …)
    if (lettersOnly === 'fly') return 'Firelight Yoga';
    if (lettersOnly === 'fby') return 'Full Bodied Yoga';
    if (lettersOnly === 'tpynw') return PEOPLES_NW;
    if (lettersOnly === 'tpyse') return PEOPLES_SE;
    if (lettersOnly === 'tpy') return PEOPLES_GENERIC;
    if (lettersOnly === 'blhc') return 'BLHC';
    if (lettersOnly === 'db') return 'Danner Boots';

    // Firelight Yoga
    if (lower === 'fly' || /\bf\.?\s*l\.?\s*y\.?\b/i.test(s)) return 'Firelight Yoga';
    if (lower.includes('firelight')) return 'Firelight Yoga';

    // Full Bodied Yoga
    if (lower === 'fby' || /\bf\.?\s*b\.?\s*y\.?\b/i.test(s)) return 'Full Bodied Yoga';
    if (lower.includes('full') && lower.includes('bodied')) return 'Full Bodied Yoga';

    // The People's Yoga (name + optional NW / SE)
    const looksPeoples =
        /^tpy\b/i.test(s) ||
        lower.includes("people's yoga") ||
        lower.includes('peoples yoga') ||
        (lower.includes('the people') && lower.includes('yoga'));

    if (lower === 'blhc' || /\bb\.?\s*l\.?\s*h\.?\s*c\.?\b/i.test(s)) return 'BLHC';

    if (lower.includes('danner') && lower.includes('boot')) return 'Danner Boots';

    if (looksPeoples) {
        const nw =
            /\bnw\b/.test(lower) ||
            lower.includes('northwest') ||
            lower.includes('nw location') ||
            /^tpy[\s-]+nw\b/i.test(s);
        const se =
            /\bse\b/.test(lower) ||
            lower.includes('southeast') ||
            lower.includes('se location') ||
            /^tpy[\s-]+se\b/i.test(s);
        if (nw && !se) return PEOPLES_NW;
        if (se && !nw) return PEOPLES_SE;
        return PEOPLES_GENERIC;
    }

    const presetHit = PRESET_CANONICAL.find((p) => p.toLowerCase() === lower);
    if (presetHit) return presetHit;

    return s;
}

export default normalizeFinanceLocation;
