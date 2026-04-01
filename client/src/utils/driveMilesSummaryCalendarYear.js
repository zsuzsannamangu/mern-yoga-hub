/**
 * Calendar year used for Admin Finances drive miles / gas summary cards and by-location breakdown.
 *
 * Year **N** applies from **Jan 1, N** through **Apr 15, N+1** (local date). From **Apr 16, N+1**
 * through **Apr 15, N+2**, year **N+1** applies — so you keep the same mileage year through tax
 * season, then roll to the current calendar year.
 *
 * @param {Date} [now]
 * @returns {number}
 */
export function getDriveMilesSummaryCalendarYear(now = new Date()) {
    const y = now.getFullYear();
    const t = now.getTime();
    for (let N = y - 2; N <= y + 2; N++) {
        const start = new Date(N, 0, 1, 0, 0, 0, 0);
        const end = new Date(N + 1, 3, 15, 23, 59, 59, 999);
        if (t >= start.getTime() && t <= end.getTime()) {
            return N;
        }
    }
    return y;
}
