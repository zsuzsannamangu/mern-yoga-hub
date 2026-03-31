import {
    getOneWayMilesForLocation,
    isOnlineCanonicalLocation,
    estimateGasCostUsd,
} from './financeLocationTravel';

/**
 * Per finance row: round-trip miles and estimated gas cost from saved location + browser settings.
 * @param {string} canonicalLocation - already normalized
 * @param {Record<string, number|string>} milesOverrides
 * @param {{ mpg: number, gasPricePerGallon: number }} travelSettings
 * @returns {{ tripMiles: number|null, tripGasCost: number|null }}
 */
export function computeTripMilesAndGasForRow(canonicalLocation, milesOverrides, travelSettings) {
    const canon = canonicalLocation || '';
    if (isOnlineCanonicalLocation(canon)) {
        return { tripMiles: 0, tripGasCost: 0 };
    }
    const oneWay = getOneWayMilesForLocation(canon, milesOverrides);
    if (oneWay == null) {
        return { tripMiles: null, tripGasCost: null };
    }
    const rt = oneWay * 2;
    const gas = estimateGasCostUsd(rt, travelSettings.mpg, travelSettings.gasPricePerGallon);
    return { tripMiles: rt, tripGasCost: gas };
}
