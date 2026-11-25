/**
 * Update Class & Financial Tracking rates from August 2026 onward via the live API
 * (EC2 Mongo is IP-restricted; Render backend can write).
 *
 * - Bhakti yoga teaching: gross $35 / net $32
 * - Yoga Refuge yoga teaching (all variants): gross $45.50 / net $41
 * Only category "yoga teaching". Does not modify chocolate, workshops, therapy, etc.
 * Does not modify any row with date before 2026-08-01.
 *
 * Usage: node server/scripts/updateStudioRatesAug2026.js
 * Dry run:  node server/scripts/updateStudioRatesAug2026.js --dry-run
 */
const dotenv = require('dotenv');
const path = require('path');
const jwt = require('jsonwebtoken');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const CUTOFF = '2026-08-01';
const DRY_RUN = process.argv.includes('--dry-run');
const API_BASE = (process.env.BASE_URL || 'https://connect.yogaandchocolate.com').replace(/\/$/, '');

const BHAKTI = { grossRate: 35, receivedRate: 32 };
const REFUGE = { grossRate: 45.5, receivedRate: 41 };

function isBhakti(location) {
    const s = String(location || '').toLowerCase();
    return s.includes('bhakti') || s === 'bymc' || /\bbymc\b/.test(s);
}

function isYogaRefuge(location) {
    const s = String(location || '').toLowerCase();
    return s.includes('yoga refuge') || s.includes('yogarefuge');
}

function targetRates(location) {
    if (isBhakti(location)) return BHAKTI;
    if (isYogaRefuge(location)) return REFUGE;
    return null;
}

function needsUpdate(row, rates) {
    return Number(row.grossRate) !== rates.grossRate || Number(row.receivedRate) !== rates.receivedRate;
}

async function main() {
    if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET missing from server/.env');
        process.exit(1);
    }

    const token = jwt.sign({ id: 'rate-script', role: 'admin' }, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });
    const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    console.log(`API: ${API_BASE}`);
    console.log(`Cutoff: ${CUTOFF}`, DRY_RUN ? '(dry run)' : '(applying updates)');

    const listRes = await fetch(`${API_BASE}/api/finances`, { headers });
    if (!listRes.ok) {
        const body = await listRes.text();
        console.error('Failed to fetch finances:', listRes.status, body.slice(0, 300));
        process.exit(1);
    }

    const listData = await listRes.json();
    const finances = listData.finances || [];
    console.log(`Total finance rows: ${finances.length}`);

    const candidates = finances.filter((row) => {
        if (String(row.date || '') < CUTOFF) return false;
        if ((row.category || '') !== 'yoga teaching') return false;
        const rates = targetRates(row.location);
        return rates && needsUpdate(row, rates);
    });

    const bhakti = candidates.filter((r) => isBhakti(r.location));
    const refuge = candidates.filter((r) => isYogaRefuge(r.location));

    console.log(`\nTo update — Bhakti: ${bhakti.length}, Yoga Refuge: ${refuge.length}`);
    summarize(bhakti);
    summarize(refuge);

    // Sanity: confirm pre-August rows exist and are not in the update set
    const beforeAugMatching = finances.filter((row) => {
        if (String(row.date || '') >= CUTOFF) return false;
        return !!targetRates(row.location);
    });
    console.log(
        `\nPre-${CUTOFF} Bhakti/Refuge rows left untouched: ${beforeAugMatching.length}`
    );

    if (DRY_RUN || candidates.length === 0) {
        console.log(candidates.length === 0 ? '\nNothing to update.' : '\nDry run — no writes.');
        return;
    }

    let ok = 0;
    let fail = 0;
    for (const row of candidates) {
        const rates = targetRates(row.location);
        const body = {
            date: row.date,
            time: row.time,
            class: row.class,
            location: row.location,
            category: row.category,
            grossRate: rates.grossRate,
            receivedRate: rates.receivedRate,
            rate: rates.receivedRate,
            paymentFrequency: row.paymentFrequency,
            paymentMethod: row.paymentMethod,
            paymentRequestSent: row.paymentRequestSent,
            paid: row.paid,
            taxed: row.taxed,
            teachingRole: row.teachingRole || 'regular',
            tripMiles: row.tripMiles,
            tripGasCost: row.tripGasCost,
        };

        try {
            const res = await fetch(`${API_BASE}/api/finances/${row._id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                fail += 1;
                const errText = await res.text();
                console.error(`Fail ${row._id} ${row.date} ${row.location}:`, res.status, errText.slice(0, 200));
            } else {
                ok += 1;
            }
        } catch (err) {
            fail += 1;
            console.error(`Fail ${row._id}:`, err.message);
        }
    }

    console.log(`\nUpdated: ${ok}, failed: ${fail}`);
}

function summarize(rows) {
    if (!rows.length) return;
    const byLoc = {};
    for (const r of rows) {
        if (!byLoc[r.location]) byLoc[r.location] = { count: 0, samples: new Set() };
        byLoc[r.location].count += 1;
        byLoc[r.location].samples.add(`${r.grossRate}/${r.receivedRate}`);
    }
    for (const [loc, info] of Object.entries(byLoc)) {
        console.log(
            `  ${loc}: ${info.count} rows, current gross/net: ${[...info.samples].join(', ')}`
        );
    }
    const dates = rows.map((r) => r.date).sort();
    console.log(`  date range: ${dates[0]} → ${dates[dates.length - 1]}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
