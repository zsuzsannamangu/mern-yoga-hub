const { DateTime } = require('luxon');
const sgMail = require('@sendgrid/mail');
const Finance = require('../models/Finance');

const TIMEZONE = 'America/Los_Angeles';
/** Days before the last class in a series to email the renew reminder */
const RENEW_DAYS_BEFORE_LAST = 2;

if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

function formatDisplayDate(isoDate) {
    const [y, m, d] = String(isoDate || '').split('-').map(Number);
    if (!y || !m || !d) return isoDate;
    return DateTime.fromObject({ year: y, month: m, day: d }, { zone: TIMEZONE }).toFormat(
        'cccc, LLLL d, yyyy'
    );
}

function formatDisplayTime(time) {
    const raw = String(time || '').trim();
    const match = raw.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return raw;
    const hour = Number(match[1]);
    const minute = match[2];
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 || 12;
    return `${h12}:${minute} ${suffix}`;
}

async function sendSeriesRenewEmail(series) {
    const to = process.env.EMAIL_RECEIVER;
    const from = process.env.EMAIL_USER;
    if (!to || !from || !process.env.SENDGRID_API_KEY) {
        console.warn('Finance class renew reminder skipped: email env not configured');
        return false;
    }

    const lastLabel = formatDisplayDate(series.lastDate);
    const firstLabel = formatDisplayDate(series.firstDate);
    const timeLabel = formatDisplayTime(series.time);
    const subject = `Renew class reminder: ${series.className} ends ${lastLabel}`;

    const text = [
        'Reminder to renew this regular class in Class & Financial Tracking.',
        '',
        `Class: ${series.className}`,
        `Location: ${series.location}`,
        `Time: ${timeLabel}`,
        `Series: ${firstLabel} → ${lastLabel} (${series.count} sessions)`,
        '',
        `The last scheduled session is ${lastLabel}. Add the next block of classes so tracking stays current.`,
        '',
        'This is an automated reminder from YogaSavor finances.',
    ].join('\n');

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="margin-bottom: 8px;">Renew class reminder</h2>
        <p>This regular class series is ending soon. Add the next block in <strong>Class &amp; Financial Tracking</strong>.</p>
        <p>
          <strong>Class:</strong> ${series.className}<br/>
          <strong>Location:</strong> ${series.location}<br/>
          <strong>Time:</strong> ${timeLabel}<br/>
          <strong>Series:</strong> ${firstLabel} → ${lastLabel} (${series.count} sessions)
        </p>
        <p>The last scheduled session is <strong>${lastLabel}</strong>.</p>
        <p style="font-size: 12px; color: #666;">This is an automated reminder from YogaSavor finances.</p>
      </div>
    `;

    await sgMail.send({ to, from, subject, text, html });
    return true;
}

/**
 * Find regular-class finance series whose last date is RENEW_DAYS_BEFORE_LAST days away
 * and email admin once per series.
 */
async function processFinanceClassRenewReminders() {
    if (process.env.REMINDER_EMAILS_ENABLED === 'false') {
        return { checked: 0, sent: 0, disabled: true };
    }

    const today = DateTime.now().setZone(TIMEZONE).startOf('day');
    const targetDate = today.plus({ days: RENEW_DAYS_BEFORE_LAST }).toFormat('yyyy-MM-dd');

    const rows = await Finance.find({
        seriesId: { $exists: true, $nin: [null, ''] },
    })
        .select('seriesId date class time location seriesRenewReminderSentAt')
        .lean();

    const bySeries = new Map();
    for (const row of rows) {
        const id = row.seriesId;
        if (!id) continue;
        let group = bySeries.get(id);
        if (!group) {
            group = {
                seriesId: id,
                className: row.class,
                time: row.time,
                location: row.location,
                dates: [],
                reminderAlreadySent: false,
            };
            bySeries.set(id, group);
        }
        group.dates.push(row.date);
        if (row.seriesRenewReminderSentAt) {
            group.reminderAlreadySent = true;
        }
        if (row.class) group.className = row.class;
        if (row.time) group.time = row.time;
        if (row.location) group.location = row.location;
    }

    let checked = 0;
    let sent = 0;

    for (const group of bySeries.values()) {
        if (group.reminderAlreadySent || group.dates.length === 0) continue;
        checked += 1;

        const sorted = [...group.dates].sort();
        const lastDate = sorted[sorted.length - 1];
        const firstDate = sorted[0];
        if (lastDate !== targetDate) continue;

        try {
            const ok = await sendSeriesRenewEmail({
                className: group.className || 'Class',
                location: group.location || '—',
                time: group.time || '',
                firstDate,
                lastDate,
                count: sorted.length,
            });
            if (!ok) continue;

            await Finance.updateMany(
                { seriesId: group.seriesId },
                { $set: { seriesRenewReminderSentAt: new Date() } }
            );
            sent += 1;
            console.log('Finance class renew reminder sent:', {
                seriesId: group.seriesId,
                lastDate,
                className: group.className,
            });
        } catch (error) {
            console.error('Failed to send finance class renew reminder:', {
                seriesId: group.seriesId,
                lastDate,
                message: error.message,
                sendGrid: error.response?.body,
            });
        }
    }

    if (checked > 0 || sent > 0) {
        console.log('Finance class renew reminder run:', {
            checked,
            sent,
            targetDate,
            at: today.toISO(),
        });
    }

    return { checked, sent, targetDate, at: today.toISO() };
}

function startFinanceClassRenewReminderScheduler() {
    let cron;
    try {
        cron = require('node-cron');
    } catch (err) {
        console.warn('node-cron not installed; finance class renew reminders disabled');
        return;
    }

    // 9:00 AM Pacific daily
    cron.schedule(
        '0 9 * * *',
        () => {
            processFinanceClassRenewReminders().catch((err) => {
                console.error('Finance class renew reminder job error:', err);
            });
        },
        { timezone: TIMEZONE }
    );

    setTimeout(() => {
        processFinanceClassRenewReminders().catch((err) => {
            console.error('Finance class renew reminder initial run error:', err);
        });
    }, 45000);

    console.log(
        `Finance class renew reminder scheduler started (daily 9:00 AM ${TIMEZONE}, ${RENEW_DAYS_BEFORE_LAST} days before last class)`
    );
}

module.exports = {
    processFinanceClassRenewReminders,
    startFinanceClassRenewReminderScheduler,
    RENEW_DAYS_BEFORE_LAST,
};
