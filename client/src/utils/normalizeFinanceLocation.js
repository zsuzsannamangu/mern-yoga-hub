/**
 * Map messy / abbreviated studio names to canonical labels used in AdminFinances presets.
 * Unknown strings are returned trimmed (spacing collapsed) unchanged.
 */

/** Northeast studio — generic "The People's Yoga" / TPY maps here. */
export const PEOPLES_YOGA_NE = "The People's Yoga NE";

/** Southeast studio */
export const PEOPLES_YOGA_SE = "The People's Yoga SE";

/** Northwest — generic “Yoga Refuge” maps here */
export const YOGA_REFUGE_NW = 'Yoga Refuge NW';

/** Southeast */
export const YOGA_REFUGE_SE = 'Yoga Refuge SE';

export const THE_PRACTICE_SPACE = 'The Practice Space';

/** Studio name is stylized with mixed case; normalize all casings to this. */
export const YOGA_RIOT = 'YogaRIOT';

/** @deprecated use PEOPLES_YOGA_NE — for legacy miles-key lookup only */
const PEOPLES_LEGACY_NW_LABEL = "The People's Yoga, NW location";
const PEOPLES_LEGACY_SE_LABEL = "The People's Yoga, SE location";
const PEOPLES_LEGACY_GENERIC = "The People's Yoga";

const REFUGE_LEGACY_NW_LABEL = 'Yoga Refuge, NW location';
const REFUGE_LEGACY_SE_LABEL = 'Yoga Refuge, SE location';
const REFUGE_LEGACY_GENERIC = 'Yoga Refuge';

const PRESET_CANONICAL = [
    'The Bhakti Yoga Movement Center',
    'BLHC',
    'Dear Yoga',
    'Danner Boots',
    'Firelight Yoga',
    'Full Bodied Yoga',
    YOGA_REFUGE_NW,
    YOGA_REFUGE_SE,
    PEOPLES_YOGA_NE,
    PEOPLES_YOGA_SE,
    'Heart Spring Health',
    THE_PRACTICE_SPACE,
    'Ready Set Grow',
    YOGA_RIOT,
    'Online',
];

const LEGACY_PEOPLES_LOWERCASE = {
    [PEOPLES_LEGACY_NW_LABEL.toLowerCase()]: PEOPLES_YOGA_NE,
    [PEOPLES_LEGACY_SE_LABEL.toLowerCase()]: PEOPLES_YOGA_SE,
    [PEOPLES_LEGACY_GENERIC.toLowerCase()]: PEOPLES_YOGA_NE,
};

const LEGACY_REFUGE_LOWERCASE = {
    [REFUGE_LEGACY_NW_LABEL.toLowerCase()]: YOGA_REFUGE_NW,
    [REFUGE_LEGACY_SE_LABEL.toLowerCase()]: YOGA_REFUGE_SE,
    [REFUGE_LEGACY_GENERIC.toLowerCase()]: YOGA_REFUGE_NW,
};

const LEGACY_PRACTICE_SPACE_LOWERCASE = {
    'practice space': THE_PRACTICE_SPACE,
};

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

    const legacyPeoples = LEGACY_PEOPLES_LOWERCASE[lower];
    if (legacyPeoples) return legacyPeoples;

    const legacyRefuge = LEGACY_REFUGE_LOWERCASE[lower];
    if (legacyRefuge) return legacyRefuge;

    const legacyPractice = LEGACY_PRACTICE_SPACE_LOWERCASE[lower];
    if (legacyPractice) return legacyPractice;

    // Compact abbreviations (FLY, FBY, TPY, TPY-NE, TPY-SE, …)
    if (lettersOnly === 'fly') return 'Firelight Yoga';
    if (lettersOnly === 'fby') return 'Full Bodied Yoga';
    if (lettersOnly === 'tpyne' || lettersOnly === 'tpynw') return PEOPLES_YOGA_NE;
    if (lettersOnly === 'tpyse') return PEOPLES_YOGA_SE;
    if (lettersOnly === 'tpy') return PEOPLES_YOGA_NE;
    if (lettersOnly === 'yrnw') return YOGA_REFUGE_NW;
    if (lettersOnly === 'yrse') return YOGA_REFUGE_SE;
    if (lettersOnly === 'yr') return YOGA_REFUGE_NW;
    if (lettersOnly === 'blhc') return 'BLHC';
    if (lettersOnly === 'db') return 'Danner Boots';
    if (lettersOnly === 'tps') return THE_PRACTICE_SPACE;
    if (lettersOnly === 'yogariot') return YOGA_RIOT;

    // Firelight Yoga
    if (lower === 'fly' || /\bf\.?\s*l\.?\s*y\.?\b/i.test(s)) return 'Firelight Yoga';
    if (lower.includes('firelight')) return 'Firelight Yoga';

    // Full Bodied Yoga
    if (lower === 'fby' || /\bf\.?\s*b\.?\s*y\.?\b/i.test(s)) return 'Full Bodied Yoga';
    if (lower.includes('full') && lower.includes('bodied')) return 'Full Bodied Yoga';

    // The People's Yoga (NE vs SE — no unqualified third bucket; plain name → NE)
    const looksPeoples =
        /^tpy\b/i.test(s) ||
        lower.includes("people's yoga") ||
        lower.includes('peoples yoga') ||
        (lower.includes('the people') && lower.includes('yoga'));

    if (lower === 'blhc' || /\bb\.?\s*l\.?\s*h\.?\s*c\.?\b/i.test(s)) return 'BLHC';

    if (lower.includes('danner') && lower.includes('boot')) return 'Danner Boots';

    if (lower.includes('practice space')) return THE_PRACTICE_SPACE;

    if (lower.includes('yoga') && lower.includes('riot')) return YOGA_RIOT;

    const looksRefuge =
        /^yr\b/i.test(s) ||
        lower.includes('yoga refuge') ||
        (lower.includes('refuge') && lower.includes('yoga'));

    if (looksRefuge) {
        const hasSE =
            /\bse\b/.test(lower) ||
            lower.includes('southeast') ||
            lower.includes('se location') ||
            /^yr[\s-]+se\b/i.test(s) ||
            /\byoga\s+refuge\s+se\b/i.test(lower);
        const hasNW =
            /\bnw\b/.test(lower) ||
            lower.includes('northwest') ||
            lower.includes('nw location') ||
            /^yr[\s-]+nw\b/i.test(s) ||
            /\byoga\s+refuge\s+nw\b/i.test(lower);

        if (hasSE && !hasNW) return YOGA_REFUGE_SE;
        if (hasNW && !hasSE) return YOGA_REFUGE_NW;
        return YOGA_REFUGE_NW;
    }

    if (looksPeoples) {
        const hasSE =
            /\bse\b/.test(lower) ||
            lower.includes('southeast') ||
            lower.includes('se location') ||
            /^tpy[\s-]+se\b/i.test(s) ||
            /\bpeople'?s?\s+yoga\s+se\b/i.test(lower);
        const hasNE =
            /\bne\b/.test(lower) ||
            lower.includes('northeast') ||
            lower.includes('ne location') ||
            /^tpy[\s-]+ne\b/i.test(s) ||
            /\bpeople'?s?\s+yoga\s+ne\b/i.test(lower) ||
            // Legacy NW wording → NE (studio uses NE + SE)
            /\bnw\b/.test(lower) ||
            lower.includes('northwest') ||
            lower.includes('nw location') ||
            /^tpy[\s-]+nw\b/i.test(s) ||
            /\bpeople'?s?\s+yoga\s+nw\b/i.test(lower);

        if (hasSE && !hasNE) return PEOPLES_YOGA_SE;
        if (hasNE && !hasSE) return PEOPLES_YOGA_NE;
        return PEOPLES_YOGA_NE;
    }

    const presetHit = PRESET_CANONICAL.find((p) => p.toLowerCase() === lower);
    if (presetHit) return presetHit;

    return s;
}

export default normalizeFinanceLocation;
