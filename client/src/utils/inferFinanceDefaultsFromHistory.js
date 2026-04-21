import { normalizeFinanceLocation } from './normalizeFinanceLocation';

function stripUndefined(obj) {
    return Object.fromEntries(
        Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== '')
    );
}

/** @param {object} entry */
function entryToPartialFormDefaults(entry) {
    if (!entry) return {};
    const g = entry.grossRate ?? entry.rate;
    const r = entry.receivedRate ?? entry.rate;
    return stripUndefined({
        category: entry.category,
        grossRate: g !== undefined && g !== null ? String(g) : undefined,
        receivedRate: r !== undefined && r !== null ? String(r) : undefined,
        paymentFrequency: entry.paymentFrequency,
        paymentMethod: entry.paymentMethod,
        paymentRequestSent: entry.paymentRequestSent,
        taxed: entry.taxed,
        paid: entry.paid,
        teachingRole:
            entry.teachingRole === 'sub' || entry.teachingRole === 'regular'
                ? entry.teachingRole
                : undefined,
    });
}

function compareEntryDateTimeDesc(a, b) {
    const dc = (b.date || '').localeCompare(a.date || '');
    if (dc !== 0) return dc;
    return (b.time || '').localeCompare(a.time || '');
}

/**
 * For each location preset, find finance rows with the same normalized location and
 * copy fields from the most recent row (by date, then time). Used to pre-fill "Add New Entry".
 *
 * @param {Array<object>} entries - `classData` from Admin Finances
 * @param {Array<{ id: string, location: string }>} presets - `LOCATION_PRESETS` (skip `other`)
 * @returns {Record<string, object>} preset id → partial form defaults
 */
export function inferLearnedFinanceDefaultsByPresetId(entries, presets) {
    const result = {};
    if (!Array.isArray(entries) || entries.length === 0 || !Array.isArray(presets)) {
        return result;
    }

    for (const preset of presets) {
        if (!preset || preset.id === 'other') continue;

        const targetLoc = normalizeFinanceLocation(preset.location);
        if (!targetLoc) continue;

        const matching = entries.filter((e) => e && e.location && normalizeFinanceLocation(e.location) === targetLoc);

        if (matching.length === 0) continue;

        matching.sort(compareEntryDateTimeDesc);
        const partial = entryToPartialFormDefaults(matching[0]);
        if (Object.keys(partial).length > 0) {
            result[preset.id] = partial;
        }
    }

    return result;
}
