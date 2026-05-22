const { DateTime } = require('luxon');
const sgMail = require('@sendgrid/mail');
const Booking = require('../models/Booking');

const TIMEZONE = 'America/Los_Angeles';

if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

function getAppointmentStart(booking) {
    if (!booking?.date || !booking?.time) return null;

    const [year, month, day] = booking.date.split('-').map(Number);
    const [hour, minute] = booking.time.split(':').map(Number);

    const dt = DateTime.fromObject(
        { year, month, day, hour, minute },
        { zone: TIMEZONE }
    );

    return dt.isValid ? dt : null;
}

function formatAppointmentDateTime(booking) {
    const start = getAppointmentStart(booking);
    if (!start) return { dateLabel: booking.date, timeLabel: booking.time };

    return {
        dateLabel: start.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY),
        timeLabel: `${start.toLocaleString(DateTime.TIME_SIMPLE)} ${start.offsetNameShort}`,
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
        lines.push(
            'Location: In-person sessions are at Yoga Refuge NW, 210 NW 17th Ave #101, Portland, OR 97209. We can also meet online.'
        );
    }

    if (booking.length) {
        lines.push(`Length: ${booking.length}`);
    }

    return lines;
}

function buildReminderEmail(booking, reminderType) {
    const { dateLabel, timeLabel } = formatAppointmentDateTime(booking);
    const sessionTitle = getSessionTitle(booking);
    const locationLines = buildLocationLines(booking);
    const clientLoginUrl = `${process.env.FRONTEND_URL || 'https://www.yogaandchocolate.com'}/login`;

    const isThreeDay = reminderType === '3days';
    const subject = isThreeDay
        ? `Reminder: Your session is in 3 days — ${dateLabel}`
        : `Reminder: Your session is in 2 hours — ${timeLabel}`;

    const intro = isThreeDay
        ? `This is a friendly reminder that your upcoming session with Zsuzsanna Mangu is in about 3 days.`
        : `This is a friendly reminder that your session with Zsuzsanna Mangu starts in about 2 hours.`;

    const locationHtml = locationLines
        .map((line) => `<p>${line.replace(/^Location: /, '<strong>Location:</strong> ').replace(/^Join online: /, '<strong>Join online:</strong> <a href="')}</p>`)
        .join('');

    // Simpler HTML for location block
    let locationBlockHtml = '';
    if (booking.location && booking.link) {
        locationBlockHtml = `<p><strong>Location:</strong> ${booking.location}<br/><a href="${booking.link}">Join Meeting</a></p>`;
    } else if (booking.location) {
        locationBlockHtml = `<p><strong>Location:</strong> ${booking.location}</p>`;
    } else if (booking.link) {
        locationBlockHtml = `<p><a href="${booking.link}">Join Meeting</a></p>`;
    } else {
        locationBlockHtml = `<p><strong>Location:</strong> In-person sessions are at Yoga Refuge NW, 210 NW 17th Ave #101, Portland, OR 97209. We can also meet online.</p>`;
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
        return;
    }

    const now = DateTime.now().setZone(TIMEZONE);

    const bookings = await Booking.find({
        isBooked: true,
        email: { $exists: true, $nin: [null, ''] },
        status: 'scheduled',
    });

    for (const booking of bookings) {
        const apptStart = getAppointmentStart(booking);
        if (!apptStart) continue;

        if (apptStart <= now) continue;

        const hoursUntil = apptStart.diff(now, 'hours').hours;

        try {
            // ~3 days before (70–74 hour window; cron runs every 15 minutes)
            if (!booking.reminder3DaysSentAt && hoursUntil >= 70 && hoursUntil <= 74) {
                await sendReminderForBooking(booking, '3days');
            }

            // ~2 hours before (1.25–2.75 hour window)
            if (!booking.reminder2HoursSentAt && hoursUntil >= 1.25 && hoursUntil <= 2.75) {
                await sendReminderForBooking(booking, '2hours');
            }
        } catch (error) {
            console.error('Failed to send appointment reminder:', {
                bookingId: booking._id,
                email: booking.email,
                reminderType: hoursUntil >= 70 && hoursUntil <= 74 ? '3days' : '2hours',
                message: error.message,
                sendGrid: error.response?.body,
            });
        }
    }
}

function clearAppointmentReminders(booking) {
    if (!booking) return;
    booking.reminder3DaysSentAt = null;
    booking.reminder2HoursSentAt = null;
}

function startAppointmentReminderScheduler() {
    let cron;
    try {
        cron = require('node-cron');
    } catch (err) {
        console.warn('node-cron not installed; appointment reminders disabled');
        return;
    }

    // Every 15 minutes
    cron.schedule('*/15 * * * *', () => {
        processAppointmentReminders().catch((err) => {
            console.error('Appointment reminder job error:', err);
        });
    });

    // Initial run shortly after startup (after DB is ready)
    setTimeout(() => {
        processAppointmentReminders().catch((err) => {
            console.error('Appointment reminder initial run error:', err);
        });
    }, 30000);

    console.log('Appointment reminder scheduler started (every 15 minutes)');
}

module.exports = {
    processAppointmentReminders,
    startAppointmentReminderScheduler,
    clearAppointmentReminders,
    getAppointmentStart,
};
