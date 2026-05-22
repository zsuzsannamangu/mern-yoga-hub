const YOGA_REFUGE_ADDRESS = 'Yoga Refuge NW, 210 NW 17th Ave #101, Portland, OR 97209';

const VALID_FORMATS = ['virtual', 'in-person'];

function normalizeSessionFormat(format) {
    return format === 'in-person' ? 'in-person' : 'virtual';
}

/** Use sessionFormat when set; infer from stored location/link for older bookings. */
function inferSessionFormat(booking) {
    const fmt = booking?.sessionFormat;
    if (fmt === 'in-person' || fmt === 'virtual') {
        return normalizeSessionFormat(fmt);
    }

    const loc = (booking?.location || '').toLowerCase();
    if (
        loc.includes('yoga refuge') ||
        loc.includes('17th ave') ||
        loc.includes('portland, or')
    ) {
        return 'in-person';
    }

    if ((booking?.link || '').trim()) {
        return 'virtual';
    }

    return 'virtual';
}

function getDefaultVirtualMeetingLink() {
    return (process.env.DEFAULT_VIRTUAL_MEETING_LINK || process.env.VIRTUAL_MEETING_LINK || '').trim();
}

function getLocationForFormat(sessionFormat) {
    return normalizeSessionFormat(sessionFormat) === 'in-person'
        ? YOGA_REFUGE_ADDRESS
        : '';
}

function getFormatLabel(sessionFormat) {
    return normalizeSessionFormat(sessionFormat) === 'in-person'
        ? 'In person at Yoga Refuge NW'
        : 'Virtual';
}

/**
 * Set location/link on a booking from sessionFormat (and optional admin overrides).
 */
function applySessionLocationToBooking(booking) {
    const format = inferSessionFormat(booking);
    booking.sessionFormat = format;

    const storedLocation = (booking.location || '').trim();
    const storedLink = (booking.link || '').trim();

    if (format === 'in-person') {
        const looksVirtualOnly =
            storedLocation.toLowerCase().includes('online') ||
            storedLocation.toLowerCase().includes('virtual');
        if (!storedLocation || looksVirtualOnly) {
            booking.location = YOGA_REFUGE_ADDRESS;
        } else {
            booking.location = storedLocation;
        }
        if (!booking.isAdminCreated) {
            booking.link = storedLink;
        }
    } else {
        booking.link = storedLink || getDefaultVirtualMeetingLink();
        if (!booking.isAdminCreated) {
            booking.location = storedLocation;
        } else if (!storedLocation) {
            booking.location = '';
        }
    }

    return booking;
}

/**
 * Location block for emails — uses booked format, never generic "we can also meet online".
 */
function buildBookingLocationContent(booking) {
    const format = inferSessionFormat(booking);
    const storedLocation = (booking?.location || '').trim();
    const storedLink = (booking?.link || '').trim();
    const defaultVirtualLink = getDefaultVirtualMeetingLink();

    const textLines = [];
    let html = '';

    if (booking?.isAdminCreated) {
        if (storedLocation && storedLink) {
            textLines.push(`Location: ${storedLocation}`);
            textLines.push(`Join online: ${storedLink}`);
            html = `<p><strong>Location:</strong> ${storedLocation}<br/><a href="${storedLink}">Join Meeting</a></p>`;
        } else if (storedLink) {
            textLines.push(`Join online: ${storedLink}`);
            html = `<p><strong>Virtual session:</strong> <a href="${storedLink}">Join Meeting</a></p>`;
        } else if (storedLocation) {
            textLines.push(`Location: ${storedLocation}`);
            html = `<p><strong>Location:</strong> ${storedLocation}</p>`;
        }
    } else if (format === 'in-person') {
        const address =
            storedLocation &&
            !storedLocation.toLowerCase().includes('online') &&
            !storedLocation.toLowerCase().includes('virtual')
                ? storedLocation
                : YOGA_REFUGE_ADDRESS;
        textLines.push(`Location: ${address}`);
        html = `<p><strong>Location:</strong> ${address}</p>`;
        if (storedLink) {
            textLines.push(`Join online: ${storedLink}`);
            html += `<p><a href="${storedLink}">Join Meeting</a></p>`;
        }
    } else {
        const link = storedLink || defaultVirtualLink;
        if (link) {
            textLines.push(`Join online: ${link}`);
            html = `<p><strong>Virtual session:</strong> <a href="${link}">Join Meeting</a></p>`;
        } else {
            textLines.push('Virtual session (online)');
            html = '<p><strong>Format:</strong> Virtual session (online)</p>';
        }
    }

    if (booking?.length) {
        textLines.push(`Length: ${booking.length}`);
        html += `<p><strong>Length:</strong> ${booking.length}</p>`;
    }

    return { textLines, html };
}

module.exports = {
    YOGA_REFUGE_ADDRESS,
    VALID_FORMATS,
    normalizeSessionFormat,
    inferSessionFormat,
    getDefaultVirtualMeetingLink,
    getLocationForFormat,
    getFormatLabel,
    applySessionLocationToBooking,
    buildBookingLocationContent,
};
