import { normalizeFinanceLocation } from './normalizeFinanceLocation';
import {
    estimateGasCostUsd,
    isOnlineCanonicalLocation,
    getOneWayMilesForLocation,
} from './financeLocationTravel';

function parseYear(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return null;
    const y = parseInt(dateStr.split('-')[0], 10);
    return Number.isNaN(y) ? null : y;
}

function numericGross(entry) {
    const n = Number(entry.grossRate ?? entry.rate ?? 0);
    return Number.isFinite(n) ? n : 0;
}

function numericReceived(entry) {
    const n = Number(entry.receivedRate ?? entry.rate ?? 0);
    return Number.isFinite(n) ? n : 0;
}

/**
 * @param {object[]} entries - finance rows (all categories)
 * @param {string} canonicalLocation - normalized location label
 * @param {object} opts
 * @param {Record<string, number|string>|null} [opts.milesOverrides]
 * @param {number} opts.mpg
 * @param {number} opts.gasPricePerGallon
 */
export function buildLocationFinanceReport(entries, canonicalLocation, opts) {
    const { milesOverrides, mpg, gasPricePerGallon } = opts;
    const online = isOnlineCanonicalLocation(canonicalLocation);
    const oneWay = getOneWayMilesForLocation(canonicalLocation, milesOverrides);
    const roundTripMilesPerSession =
        online || oneWay == null ? null : oneWay > 0 ? oneWay * 2 : 0;

    const filtered = (entries || []).filter(
        (e) => normalizeFinanceLocation(e.location) === canonicalLocation
    );

    const byYear = {};

    for (const e of filtered) {
        const year = parseYear(e.date);
        if (year == null) continue;
        if (!byYear[year]) {
            byYear[year] = {
                year,
                teachingCount: 0,
                /** Rows at this location (all categories); each row = one round trip for mileage. */
                sessionsForMileage: 0,
                grossTotal: 0,
                receivedTotal: 0,
                grossTeachingValues: [],
            };
        }
        const bucket = byYear[year];
        bucket.grossTotal += numericGross(e);
        bucket.receivedTotal += numericReceived(e);
        if (e.category === 'yoga teaching') {
            bucket.teachingCount += 1;
            bucket.grossTeachingValues.push(numericGross(e));
        }
        if (!online) bucket.sessionsForMileage += 1;
    }

    const years = Object.values(byYear)
        .map((y) => {
            const vals = y.grossTeachingValues;
            const teachingGrossSum = vals.reduce((a, b) => a + b, 0);
            let roundTripMilesTotal = null;
            let gasCost = null;
            if (online) {
                roundTripMilesTotal = 0;
                gasCost = 0;
            } else if (roundTripMilesPerSession != null) {
                if (roundTripMilesPerSession === 0) {
                    roundTripMilesTotal = 0;
                    gasCost = 0;
                } else {
                    roundTripMilesTotal = roundTripMilesPerSession * y.sessionsForMileage;
                    gasCost = estimateGasCostUsd(roundTripMilesTotal, mpg, gasPricePerGallon);
                }
            }

            return {
                year: y.year,
                teachingCount: y.teachingCount,
                sessionsForMileage: y.sessionsForMileage,
                grossTotal: y.grossTotal,
                receivedTotal: y.receivedTotal,
                avgGrossPerTeachingClass: vals.length ? teachingGrossSum / vals.length : null,
                minGrossTeaching: vals.length ? Math.min(...vals) : null,
                maxGrossTeaching: vals.length ? Math.max(...vals) : null,
                roundTripMilesTotal,
                gasCost,
            };
        })
        .sort((a, b) => b.year - a.year);

    const allTeachingGross = filtered
        .filter((e) => e.category === 'yoga teaching')
        .map((e) => numericGross(e));

    const allTime = {
        teachingCount: allTeachingGross.length,
        sessionsForMileage: online ? 0 : filtered.length,
        grossTotal: filtered.reduce((s, e) => s + numericGross(e), 0),
        receivedTotal: filtered.reduce((s, e) => s + numericReceived(e), 0),
        avgGrossPerTeachingClass: allTeachingGross.length
            ? allTeachingGross.reduce((a, b) => a + b, 0) / allTeachingGross.length
            : null,
        minGrossTeaching: allTeachingGross.length ? Math.min(...allTeachingGross) : null,
        maxGrossTeaching: allTeachingGross.length ? Math.max(...allTeachingGross) : null,
    };

    let allTimeMiles = null;
    let allTimeGas = null;
    if (online) {
        allTimeMiles = 0;
        allTimeGas = 0;
    } else if (roundTripMilesPerSession != null) {
        if (roundTripMilesPerSession === 0) {
            allTimeMiles = 0;
            allTimeGas = 0;
        } else {
            allTimeMiles = roundTripMilesPerSession * filtered.length;
            allTimeGas = estimateGasCostUsd(allTimeMiles, mpg, gasPricePerGallon);
        }
    }

    return {
        canonicalLocation,
        entryCount: filtered.length,
        oneWayMilesConfigured: oneWay,
        roundTripMilesPerSession,
        years,
        allTime: {
            ...allTime,
            roundTripMilesTotal: allTimeMiles,
            gasCost: allTimeGas,
        },
    };
}
