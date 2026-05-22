export const getAppointmentDurationMinutes = (appointment) => {
    const durationText = appointment?.length || appointment?.duration;
    if (!durationText) return 60;

    const match = String(durationText).match(/(\d+)\s*(min|mins|minutes|hour|hours|hr|hrs)?/i);
    if (!match) return 60;

    const value = Number(match[1]);
    const unit = (match[2] || 'min').toLowerCase();
    if (Number.isNaN(value) || value <= 0) return 60;

    if (unit.startsWith('hour') || unit === 'hr' || unit === 'hrs') {
        return value * 60;
    }
    return value;
};

export const isAppointmentPast = (appointment) => {
    const now = new Date();
    const appointmentStart = new Date(`${appointment.date}T${appointment.time}`);
    const durationMinutes = getAppointmentDurationMinutes(appointment);
    const appointmentEnd = new Date(appointmentStart.getTime() + durationMinutes * 60 * 1000);
    return appointmentEnd < now;
};

const dedupeBookings = (bookings) =>
    bookings.filter((booking, index, self) =>
        index === self.findIndex((b) => b._id === booking._id)
    );

export const categorizeBookings = (bookings) => {
    const uniqueBookings = dedupeBookings(bookings).filter(
        (slot) => slot.status !== 'rescheduled'
    );

    const upcoming = [];
    const past = [];

    uniqueBookings.forEach((slot) => {
        if (isAppointmentPast(slot)) {
            past.push(slot);
        } else {
            upcoming.push(slot);
        }
    });

    upcoming.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA - dateB;
    });

    past.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateB - dateA;
    });

    return { upcoming, past };
};

export const formatTimeWithZone = (dateStr, timeStr) => {
    const date = new Date(`${dateStr}T${timeStr}`);
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZoneName: 'short',
    });
};

export const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-');
    return `${Number(month)}/${Number(day)}/${year}`;
};
