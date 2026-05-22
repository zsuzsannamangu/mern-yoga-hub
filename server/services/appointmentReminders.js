const { DateTime } = require('luxon');
const sgMail = require('@sendgrid/mail');
const Booking = require('../models/Booking');
const { getBookingLocationEmailText } = require('../utils/sessionFormat');
const TIMEZONE = 'America/Los_Angeles';

// Reminder windows (minutes before appointment)
const THREE_DAY_MIN = 70 * 60; // 70 hours
const THREE_DAY_MAX = 75 * 60; // 75 hours
const TWO_HOUR_MIN = 10; // don't send in the last 10 minutes
const TWO_HOUR_MAX = 130; // up to ~2h 10m before (first cron in this range sends)

if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

function getAppointmentStart(booking) {
    if (!booking?.date || !booking?.time) return null;

    const [year, month, day] = booking.date.split('-').map(Number);
    const timeParts = booking.time.split(':');
    const hour = Number(timeParts[0]);
    const minute = Number(timeParts[1] || 0);

    const dt = DateTime.fromObject(
        { year, month, day, hour, minute },
        { zone: TIMEZONE }
    );

    return dt.isValid ? dt : null;
}

function formatAppointmentDateTime(booking) {
    const start = getAppointmentStart(booking);
    if (!start) {
        return {
            dateLabel: booking.date,
            timeLabel: booking.time,
            whenLabel: `on ${booking.date} at ${booking.time}`,
        };
    }

    const datePart = start.toFormat('MM/dd/yyyy');
    const timePart = start.toFormat('h:mm a');
    const zone = start.offsetNameShort;

    return {
        dateLabel: start.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY),
        timeLabel: `${timePart} ${zone}`,
        whenLabel: `on ${datePart} at ${timePart} ${zone}`,
    };
}

function getSessionTitle(booking) {
    return booking.title || booking.sessionType || 'Yoga Session';
}

function buildLocationLines(booking) {
    const lines = [];

    if (booking.location && booking.link) {
        lines.push(`Location: ${booking.location}`);
        lines.push(`Join online: ${booking.link}`);
    } else if (booking.location) {
        lines.push(`Location: ${booking.location}`);
    } else if (booking.link) {
        lines.push(`Join online: ${booking.link}`);
    } else {
        lines.push(`Location: ${getBookingLocationEmailText(booking)}`);
    }

    if (booking.length) {
        lines.push(`Length: ${booking.length}`);
    }

    return lines;
}

function buildReminderEmail(booking, reminderType) {
    const { dateLabel, timeLabel, whenLabel } = formatAppointmentDateTime(booking);
    const sessionTitle = getSessionTitle(booking);
    const locationLines = buildLocationLines(booking);
    const clientLoginUrl = `${process.env.FRONTEND_URL || 'https://www.yogaandchocolate.com'}/login`;

    const subject = `Reminder: Your session on ${dateLabel} at ${timeLabel}`;
    const intro = `This is a friendly reminder that your session with Zsuzsanna Mangu is ${whenLabel}.`;

    let locationBlockHtml = '';
    if (booking.location && booking.link) {
        locationBlockHtml = `<p><strong>Location:</strong> ${booking.location}<br/><a href="${booking.link}">Join Meeting</a></p>`;
    } else if (booking.location) {
        locationBlockHtml = `<p><strong>Location:</strong> ${booking.location}</p>`;
    } else if (booking.link) {
        locationBlockHtml = `<p><a href="${booking.link}">Join Meeting</a></p>`;
    } else {
        locationBlockHtml = `<p><strong>Location:</strong> ${getBookingLocationEmailText(booking)}</p>`;
    }
    if (booking.length) {
        locationBlockHtml += `<p><strong>Length:</strong> ${booking.length}</p>`;
    }

    const text = [
        `Dear ${booking.firstName},`,
        '',
        intro,
        '',
        `Session: ${sessionTitle}`,
        `Date: ${dateLabel}`,
        `Time: ${timeLabel}`,
        ...locationLines,
        '',
        `Log in to your account to view or make changes: ${clientLoginUrl}`,
        '',
        'Warm regards,',
        'Zsuzsanna',
        '',
        'This is an automated reminder. Please reply directly if you have any questions.',
    ].join('\n');

    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <p>Dear ${booking.firstName},</p>
            <p>${intro}</p>
            <p><strong>Session:</strong> ${sessionTitle}<br/>
            <strong>Date:</strong> ${dateLabel}<br/>
            <strong>Time:</strong> ${timeLabel}</p>
            ${locationBlockHtml}
            <p>Please <a href="${clientLoginUrl}" style="color: #007BFF; text-decoration: none; font-weight: bold;">log in</a> to your account or reply to this email if you need to make changes.</p>
            <p>Warm regards,<br/>Zsuzsanna</p>
            <p style="font-size: 12px; color: #666;">This is an automated reminder. Please reply directly if you have any questions.</p>
        </div>
    `;

    return {
        to: booking.email,
        from: process.env.EMAIL_USER,
        subject,
        text,
        html,
    };
}

async function sendReminderForBooking(booking, reminderType) {
    if (!process.env.EMAIL_USER || !process.env.SENDGRID_API_KEY) {
        console.warn('Appointment reminders skipped: EMAIL_USER or SENDGRID_API_KEY not configured');
        return false;
    }

    const email = buildReminderEmail(booking, reminderType);
    await sgMail.send(email);

    if (reminderType === '3days') {
        booking.reminder3DaysSentAt = new Date();
    } else {
        booking.reminder2HoursSentAt = new Date();
    }
    await booking.save();

    console.log(`Appointment ${reminderType} reminder sent to ${booking.email} for ${booking.date} ${booking.time}`);
    return true;
}

/**
 * Find upcoming booked appointments and send 3-day / 2-hour reminders.
 * Runs on a schedule; each reminder is sent at most once per booking.
 */
async function processAppointmentReminders() {
    if (process.env.REMINDER_EMAILS_ENABLED === 'false') {
        return { checked: 0, sent3d: 0, sent2h: 0, disabled: true };
    }

    const now = DateTime.now().setZone(TIMEZONE);

    const bookings = await Booking.find({
        isBooked: true,
        email: { $exists: true, $nin: [null, ''] },
        status: { $nin: ['cancelled', 'rescheduled'] },
    });

    let checked = 0;
    let sent3d = 0;
    let sent2h = 0;

    for (const booking of bookings) {
        const apptStart = getAppointmentStart(booking);
        if (!apptStart) continue;

        if (apptStart <= now) continue;

        const minutesUntil = apptStart.diff(now, 'minutes').minutes;
        checked += 1;

        try {
            if (!booking.reminder3DaysSentAt && minutesUntil >= THREE_DAY_MIN && minutesUntil <= THREE_DAY_MAX) {
                await sendReminderForBooking(booking, '3days');
                sent3d += 1;
            }

            // Send once when session is ~2 hours away (any cron run between 10 min and 2h 10m before)
            if (!booking.reminder2HoursSentAt && minutesUntil > TWO_HOUR_MIN && minutesUntil <= TWO_HOUR_MAX) {
                await sendReminderForBooking(booking, '2hours');
                sent2h += 1;
            }
        } catch (error) {
            console.error('Failed to send appointment reminder:', {
                bookingId: booking._id,
                email: booking.email,
                minutesUntil: Math.round(minutesUntil),
                status: booking.status,
                message: error.message,
                sendGrid: error.response?.body,
            });
        }
    }

    if (checked > 0 || sent3d > 0 || sent2h > 0) {
        console.log('Appointment reminder run:', {
            checked,
            sent3d,
            sent2h,
            at: now.toISO(),
        });
    }

    return { checked, sent3d, sent2h, at: now.toISO() };
}

function clearAppointmentReminders(booking) {
    if (!booking) return;
    booking.reminder3DaysSentAt = null;
    booking.reminder2HoursSentAt = null;
}

async function ensureBookedSlotsAreScheduled() {
    const result = await Booking.updateMany(
        {
            isBooked: true,
            $or: [
                { status: { $exists: false } },
                { status: null },
                { status: '' },
            ],
        },
        { $set: { status: 'scheduled' } }
    );
    if (result.modifiedCount > 0) {
        console.log(`Appointment reminders: set status=scheduled on ${result.modifiedCount} booking(s)`);
    }
}

function startAppointmentReminderScheduler() {
    let cron;
    try {
        cron = require('node-cron');
    } catch (err) {
        console.warn('node-cron not installed; appointment reminders disabled');
        return;
    }

    ensureBookedSlotsAreScheduled().catch((err) => {
        console.error('Failed to normalize booking statuses for reminders:', err);
    });

    // Every 5 minutes for more reliable 2-hour reminders
    cron.schedule('*/5 * * * *', () => {
        processAppointmentReminders().catch((err) => {
            console.error('Appointment reminder job error:', err);
        });
    });

    setTimeout(() => {
        processAppointmentReminders().catch((err) => {
            console.error('Appointment reminder initial run error:', err);
        });
    }, 30000);

    console.log('Appointment reminder scheduler started (every 5 minutes, Pacific time)');
}

module.exports = {
    processAppointmentReminders,
    startAppointmentReminderScheduler,
    clearAppointmentReminders,
    getAppointmentStart,
    sendReminderForBooking,
};
