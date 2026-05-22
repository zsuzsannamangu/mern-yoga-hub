const YOGA_REFUGE_ADDRESS = 'Yoga Refuge NW, 210 NW 17th Ave #101, Portland, OR 97209';

const VALID_FORMATS = ['virtual', 'in-person'];

function normalizeSessionFormat(format) {
    return format === 'in-person' ? 'in-person' : 'virtual';
}

function getLocationForFormat(sessionFormat) {
    return normalizeSessionFormat(sessionFormat) === 'in-person'
        ? YOGA_REFUGE_ADDRESS
        : 'Online (virtual session)';
}

function getFormatLabel(sessionFormat) {
    return normalizeSessionFormat(sessionFormat) === 'in-person'
        ? 'In person at Yoga Refuge NW'
        : 'Virtual';
}

/** Location line for confirmation/reminder emails from a booked slot or appointment. */
function getBookingLocationEmailText(booking) {
    if (booking?.link) {
        return `Join online: ${booking.link}`;
    }
    if (booking?.location) {
        return booking.location;
    }
    return getLocationForFormat(booking?.sessionFormat);
}

module.exports = {
    YOGA_REFUGE_ADDRESS,
    VALID_FORMATS,
    normalizeSessionFormat,
    getLocationForFormat,
    getFormatLabel,
    getBookingLocationEmailText,
};
