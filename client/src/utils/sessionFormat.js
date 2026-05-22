export const SESSION_FORMAT_OPTIONS = [
    { value: 'virtual', label: 'Virtual' },
    { value: 'in-person', label: 'In person at Yoga Refuge NW' },
];

export const YOGA_REFUGE_ADDRESS = 'Yoga Refuge NW, 210 NW 17th Ave #101, Portland, OR 97209';

export function normalizeSessionFormat(format) {
    return format === 'in-person' ? 'in-person' : 'virtual';
}

export function getFormatLabel(format) {
    return normalizeSessionFormat(format) === 'in-person'
        ? 'In person'
        : 'Virtual';
}

export function getFormatDescription(format) {
    return normalizeSessionFormat(format) === 'in-person'
        ? `In person at Yoga Refuge NW (${YOGA_REFUGE_ADDRESS})`
        : 'Virtual (online)';
}

/** Short label for booking slot buttons, e.g. "1pm in-person" */
export function getFormatSlotLabel(format) {
    return normalizeSessionFormat(format) === 'in-person' ? 'in-person' : 'virtual';
}
