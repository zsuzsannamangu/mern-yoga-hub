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
} from '../../utils/adminAppointments';

const AdminAppointmentsCalendar = () => {
    const navigate = useNavigate();
    const [allUpcomingAppointments, setAllUpcomingAppointments] = useState([]);
    const [calendarMonth, setCalendarMonth] = useState(() => new Date());
    const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);
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
                    <p className="loading-message">Loading appointments…</p>
                ) : (
                    <div className="appointments-calendar-panel">
                        <div className="calendar-layout">
                            <div className="calendar-main">
                                <div className="calendar-controls">
                                    <button type="button" className="calendar-nav-btn" onClick={() => changeCalendarMonth(-1)}>
                                        ←
                                    </button>
                                    <p className="calendar-month-title">
                                        {calendarMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                                    </p>
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
                            </div>
                            <div className="calendar-day-details">
                                {selectedCalendarDate ? (
                                    <>
                                        <h3 className="calendar-details-title">
                                            {formatDate(selectedCalendarDate)}: {selectedDayAppointments.length} appointment
                                            {selectedDayAppointments.length !== 1 ? 's' : ''}
                                        </h3>
                                        {selectedDayAppointments.length > 0 ? (
                                            <ul className="calendar-appointments-list">
                                                {selectedDayAppointments.map((appt) => (
                                                    <li key={appt._id}>
                                                        <strong>{formatTimeWithZone(appt.date, appt.time)}</strong>
                                                        {' · '}
                                                        {appt.firstName} {appt.lastName}
                                                        {' · '}
                                                        {appt.title || appt.sessionType || 'Session'}
                                                        <span className="calendar-appt-actions">
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
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminAppointmentsCalendar;
