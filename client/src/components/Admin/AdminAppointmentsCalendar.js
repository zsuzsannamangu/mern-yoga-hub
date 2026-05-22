import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAxiosInstance } from '../../config/axiosConfig';
import AdminLayout from './AdminLayout';
import './AdminAppointmentsCalendar.scss';
import '../../App.scss';
import Swal from 'sweetalert2';
import '@sweetalert2/theme-material-ui/material-ui.css';
import {
    categorizeBookings,
    formatDate,
    formatTimeWithZone,
    isAppointmentPast,
} from '../../utils/adminAppointments';

const AdminAppointmentsCalendar = () => {
    const navigate = useNavigate();
    const [allUpcomingAppointments, setAllUpcomingAppointments] = useState([]);
    const [calendarMonth, setCalendarMonth] = useState(() => new Date());
    const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);
    const [sendingReminderKey, setSendingReminderKey] = useState(null);
    const [runningReminderJob, setRunningReminderJob] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchAllUpcomingAppointments = useCallback(async () => {
        setLoading(true);
        try {
            const response = await adminAxiosInstance.get('/api/bookings');
            const allBookings = response.data.bookedSlots || [];
            const { upcoming } = categorizeBookings(allBookings);
            setAllUpcomingAppointments(upcoming);
        } catch (error) {
            console.error('Error fetching upcoming appointments calendar:', error);
            Swal.fire({
                icon: 'error',
                title: 'Failed to load appointments',
                text: 'Please try again later.',
                confirmButtonText: 'OK',
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllUpcomingAppointments();
    }, [fetchAllUpcomingAppointments]);

    const getCalendarDays = () => {
        const year = calendarMonth.getFullYear();
        const month = calendarMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startPadding = firstDay.getDay();
        const days = [];

        for (let i = 0; i < startPadding; i++) {
            days.push(null);
        }
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            days.push(dateStr);
        }
        return days;
    };

    const getAppointmentsForDate = (dateStr) =>
        allUpcomingAppointments.filter((appt) => appt.date === dateStr);

    const selectedDayAppointments = selectedCalendarDate
        ? getAppointmentsForDate(selectedCalendarDate)
        : [];

    const changeCalendarMonth = (offset) => {
        setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
        setSelectedCalendarDate(null);
    };

    const handleRunReminderJob = async () => {
        setRunningReminderJob(true);
        try {
            const response = await adminAxiosInstance.post('/api/admin/diagnostics/run-appointment-reminders');
            const { checked = 0, sent3d = 0, sent2h = 0 } = response.data || {};
            Swal.fire({
                icon: 'success',
                title: 'Reminder check done',
                html: `Checked <strong>${checked}</strong> upcoming appointment(s).<br/>Sent: <strong>${sent3d}</strong> three-day, <strong>${sent2h}</strong> two-hour.<br/><small>Only sends when an appointment is in the automatic time window.</small>`,
                confirmButtonText: 'OK',
            });
            fetchAllUpcomingAppointments();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Reminder check failed',
                text: error.response?.data?.message || 'Please try again.',
                confirmButtonText: 'OK',
            });
        } finally {
            setRunningReminderJob(false);
        }
    };

    const handleSendReminderNow = async (appointmentId, type) => {
        const key = `${appointmentId}-${type}`;
        setSendingReminderKey(key);
        try {
            const response = await adminAxiosInstance.post(
                `/api/admin/appointments/${appointmentId}/send-reminder`,
                { type }
            );
            Swal.fire({
                icon: 'success',
                title: 'Reminder sent',
                text: response.data?.message || 'Email sent successfully.',
                confirmButtonText: 'OK',
            });
            fetchAllUpcomingAppointments();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Could not send reminder',
                text: error.response?.data?.message || 'Please try again.',
                confirmButtonText: 'OK',
            });
        } finally {
            setSendingReminderKey(null);
        }
    };

    const renderReminderButtons = (appointment) => {
        if (appointment.status === 'cancelled' || isAppointmentPast(appointment)) {
            return null;
        }

        return (
            <div className="reminder-action-buttons">
                <button
                    type="button"
                    className="send-reminder-btn"
                    disabled={sendingReminderKey === `${appointment._id}-2hours`}
                    onClick={() => handleSendReminderNow(appointment._id, '2hours')}
                    title="Send 2-hour reminder email now (for testing)"
                >
                    {sendingReminderKey === `${appointment._id}-2hours` ? '…' : '2h reminder'}
                </button>
                <button
                    type="button"
                    className="send-reminder-btn"
                    disabled={sendingReminderKey === `${appointment._id}-3days`}
                    onClick={() => handleSendReminderNow(appointment._id, '3days')}
                    title="Send 3-day reminder email now (for testing)"
                >
                    {sendingReminderKey === `${appointment._id}-3days` ? '…' : '3-day reminder'}
                </button>
            </div>
        );
    };

    const viewClient = (appt) => {
        const uid = appt.userId?._id || appt.userId;
        if (!uid) return;
        navigate('/admin/users', { state: { expandUserId: uid.toString() } });
    };

    return (
        <AdminLayout>
            <div className="admin-appointments-calendar">
                <h3 className="section-title">Upcoming Appointments Calendar</h3>

                {loading ? (
                    <p>Loading appointments…</p>
                ) : (
                    <section className="upcoming-calendar-section">
                        <div className="calendar-section-header">
                            <span className="calendar-count">{allUpcomingAppointments.length} upcoming</span>
                        </div>
                        <div className="reminder-testing-bar">
                            <button
                                type="button"
                                className="run-reminder-job-btn"
                                onClick={handleRunReminderJob}
                                disabled={runningReminderJob}
                            >
                                {runningReminderJob ? 'Running…' : 'Run automatic reminder check'}
                            </button>
                            <p className="reminder-testing-hint">
                                Use <strong>2h reminder</strong> or <strong>3-day reminder</strong> on an appointment below to send a test email immediately.
                            </p>
                        </div>
                        <div className="calendar-controls">
                            <button type="button" className="calendar-nav-btn" onClick={() => changeCalendarMonth(-1)}>
                                ←
                            </button>
                            <h5>
                                {calendarMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                            </h5>
                            <button type="button" className="calendar-nav-btn" onClick={() => changeCalendarMonth(1)}>
                                →
                            </button>
                            <button
                                type="button"
                                className="calendar-today-btn"
                                onClick={() => {
                                    setCalendarMonth(new Date());
                                    const today = new Date();
                                    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                                    setSelectedCalendarDate(todayStr);
                                }}
                            >
                                Today
                            </button>
                        </div>
                        <div className="calendar-weekdays">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                <span key={day}>{day}</span>
                            ))}
                        </div>
                        <div className="calendar-grid">
                            {getCalendarDays().map((dateStr, index) => {
                                if (!dateStr) {
                                    return <div key={`empty-${index}`} className="calendar-day empty" />;
                                }
                                const dayAppointments = getAppointmentsForDate(dateStr);
                                const isSelected = selectedCalendarDate === dateStr;
                                const today = new Date();
                                const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                                const isToday = dateStr === todayStr;

                                return (
                                    <button
                                        key={dateStr}
                                        type="button"
                                        className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''} ${dayAppointments.length > 0 ? 'has-appointments' : ''}`}
                                        onClick={() => setSelectedCalendarDate(dateStr)}
                                    >
                                        <span className="day-number">{Number(dateStr.split('-')[2])}</span>
                                        {dayAppointments.length > 0 && (
                                            <span className="appointment-dot">{dayAppointments.length}</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="calendar-day-details">
                            {selectedCalendarDate ? (
                                <>
                                    <h5>
                                        {formatDate(selectedCalendarDate)} — {selectedDayAppointments.length} appointment
                                        {selectedDayAppointments.length !== 1 ? 's' : ''}
                                    </h5>
                                    {selectedDayAppointments.length > 0 ? (
                                        <ul className="calendar-appointments-list">
                                            {selectedDayAppointments.map((appt) => (
                                                <li key={appt._id}>
                                                    <strong>{formatTimeWithZone(appt.date, appt.time)}</strong>
                                                    {' — '}
                                                    {appt.firstName} {appt.lastName}
                                                    {' — '}
                                                    {appt.title || appt.sessionType || 'Session'}
                                                    <span className="calendar-appt-actions">
                                                        {renderReminderButtons(appt)}
                                                        {appt.userId && (
                                                            <button
                                                                type="button"
                                                                className="view-client-btn"
                                                                onClick={() => viewClient(appt)}
                                                            >
                                                                View client
                                                            </button>
                                                        )}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="no-appointments-msg">No upcoming appointments on this day.</p>
                                    )}
                                </>
                            ) : (
                                <p className="calendar-hint">Click a date to see upcoming appointments for that day.</p>
                            )}
                        </div>
                    </section>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminAppointmentsCalendar;
