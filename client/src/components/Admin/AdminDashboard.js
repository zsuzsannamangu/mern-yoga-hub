import React, { useState, useEffect, useRef } from 'react';
import { adminAxiosInstance } from '../../config/axiosConfig';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import './AdminDashboard.scss';
import '../../App.scss';
import { FaTrash } from 'react-icons/fa'; //Trash icon for delete button
import Swal from 'sweetalert2';
import '@sweetalert2/theme-material-ui/material-ui.css';

const AdminDashboard = () => {
    const navigate = useNavigate(); // Navigation function
    const [events, setEvents] = useState([]); // State to store events
    const [selectedEvents, setSelectedEvents] = useState([]); // State for selected events for bulk delete
    const LOCATION_PRESETS = [
        { id: 'bhakti', label: 'The Bhakti Yoga Movement Center', location: 'The Bhakti Yoga Movement Center', signUpLink: 'https://www.thebymc.com/classes' },
        { id: 'dear', label: 'Dear Yoga', location: 'Dear Yoga', signUpLink: 'https://www.dearyogastudio.com/schedule' },
        { id: 'firelight', label: 'Firelight Yoga', location: 'Firelight Yoga', signUpLink: 'https://firelightyoga.com/' },
        { id: 'fullbodied', label: 'Full Bodied Yoga', location: 'Full Bodied Yoga', signUpLink: 'https://fullbodiedyoga.union.site/' },
        { id: 'heartspring', label: 'Heart Spring Health', location: 'Heart Spring Health', signUpLink: 'https://heartspringhealth.com/events/' },
        { id: 'peoples-nw', label: "The People's Yoga, NW location", location: "The People's Yoga, NW location", signUpLink: 'https://thepeoplesyoga.org/events-and-workshops/' },
        { id: 'peoples-se', label: "The People's Yoga, SE location", location: "The People's Yoga, SE location", signUpLink: 'https://thepeoplesyoga.org/events-and-workshops/' },
        { id: 'practice-space', label: 'The Practice Space', location: 'The Practice Space', signUpLink: 'https://thepracticespacepdx.com/' },
        { id: 'ready-set-grow', label: 'Ready Set Grow', location: 'Ready Set Grow', signUpLink: 'https://readysetgrowpdx.com/' },
        { id: 'yoga-refuge-nw', label: 'Yoga Refuge, NW location', location: 'Yoga Refuge, NW location', signUpLink: 'https://www.yogarefugepdx.com/class-schedule' },
        { id: 'yoga-refuge-se', label: 'Yoga Refuge, SE location', location: 'Yoga Refuge, SE location', signUpLink: 'https://www.yogarefugepdx.com/class-schedule' },
        { id: 'other', label: 'Other (new location)', location: '', signUpLink: '' },
    ];

    const [newEvent, setNewEvent] = useState({
        title: '',
        date: '',
        time: '',
        durationMinutes: 60,
        locationPreset: '',
        location: '',
        signUpLink: '',
        repeat: '',
        repeatCount: '',
    }); // State for new event form
    const [loading, setLoading] = useState(false); // State for loading indicator
    const alertShown = useRef(false);
    const [bulkStartDate, setBulkStartDate] = useState('');
    const [bulkEndDate, setBulkEndDate] = useState('');
    const [filterLocation, setFilterLocation] = useState('');
    const [filterTitle, setFilterTitle] = useState('');
    const [bulkLocationText, setBulkLocationText] = useState('');
    const [bulkLink, setBulkLink] = useState('');
    const [bulkTitle, setBulkTitle] = useState('');
    const [bulkDate, setBulkDate] = useState('');
    const [bulkTime, setBulkTime] = useState('');
    const [bulkDurationMinutes, setBulkDurationMinutes] = useState('');
    const [showBulkUpdate, setShowBulkUpdate] = useState(false);

    const toDateTime = (e) => {
        // ensure time is always "HH:MM"
        const time = (e.time || "00:00").padStart(5, "0");
        // build an ISO-ish string so Date parses reliably
        return new Date(`${e.date}T${time}:00`);
    };

    const sortEvents = (list) =>
        [...list].sort((a, b) => toDateTime(a) - toDateTime(b));

    const orderedEvents = sortEvents(events);

    const matchesFilters = (event) => {
        // Date range (optional)
        if (bulkStartDate || bulkEndDate) {
            const d = new Date(`${event.date}T00:00:00`);
            if (bulkStartDate) {
                const start = new Date(`${bulkStartDate}T00:00:00`);
                if (d < start) return false;
            }
            if (bulkEndDate) {
                const end = new Date(`${bulkEndDate}T23:59:59`);
                if (d > end) return false;
            }
        }

        // Location substring (optional)
        if (filterLocation) {
            const loc = (event.location || '').toLowerCase();
            if (!loc.includes(filterLocation.toLowerCase())) return false;
        }

        // Title substring (optional)
        if (filterTitle) {
            const t = (event.title || '').toLowerCase();
            if (!t.includes(filterTitle.toLowerCase())) return false;
        }

        return true;
    };

    const filteredEvents = orderedEvents.filter(matchesFilters);
    const filteredIds = filteredEvents.map((e) => e._id);
    const allFilteredSelected = filteredIds.length > 0 && filteredIds.every((id) => selectedEvents.includes(id));

    const toggleSelectAllFiltered = (checked) => {
        setSelectedEvents((prev) => {
            if (checked) {
                const set = new Set(prev);
                filteredIds.forEach((id) => set.add(id));
                return Array.from(set);
            }
            return prev.filter((id) => !filteredIds.includes(id));
        });
    };

    // Fetch events from the backend
    const fetchEvents = async () => {
        setLoading(true);
        try {
            const res = await adminAxiosInstance.get('/api/events');
            const sortedEvents = res.data.sort((a, b) => {
                const dateTimeA = new Date(`${a.date}T${a.time}`);
                const dateTimeB = new Date(`${b.date}T${b.time}`);
                return dateTimeA - dateTimeB;
            });
            setEvents(sortedEvents);
        } catch (error) {
            if (!alertShown.current) {
                alertShown.current = true;
                Swal.fire({
                    icon: 'error',
                    title: 'Failed to fetch events.',
                    text: error.message,
                    confirmButtonText: 'OK'
                });
            }
        } finally {
            setLoading(false);
        }
    };

    // Add a new event
    const addEvent = async (e) => {
        e.preventDefault();
        if (!newEvent.title || !newEvent.date || !newEvent.time) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Please fill out all fields',
                confirmButtonText: 'OK'
            });
            return;
        }

        try {
            const token = localStorage.getItem('adminToken');

            // Generate recurring events weekly or monthly
            const eventsToAdd = [];
            let currentDate = new Date(newEvent.date);
            const hasRepeat = Boolean(newEvent.repeat);

            const baseEvent = {
                title: newEvent.title,
                date: newEvent.date,
                time: newEvent.time,
                location: newEvent.location,
                signUpLink: newEvent.signUpLink,
                durationMinutes: Number(newEvent.durationMinutes) || 60,
            };

            if (hasRepeat) {
                const repeatCountNum = Number(newEvent.repeatCount);
                const isValidCount = Number.isInteger(repeatCountNum) && repeatCountNum > 0 && repeatCountNum <= 200;

                if (!isValidCount) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Please enter a repeat count between 1 and 200.',
                        confirmButtonText: 'OK'
                    });
                    return;
                }

                for (let i = 0; i < repeatCountNum; i++) {
                    eventsToAdd.push({
                        ...baseEvent,
                        date: currentDate.toISOString().split('T')[0],
                    });

                    if (newEvent.repeat === 'weekly') {
                        currentDate.setDate(currentDate.getDate() + 7);
                    } else if (newEvent.repeat === 'biweekly') {
                        currentDate.setDate(currentDate.getDate() + 14);
                    } else if (newEvent.repeat === 'monthly') {
                        currentDate.setMonth(currentDate.getMonth() + 1);
                    }
                }
            } else {
                eventsToAdd.push(baseEvent);
            }

            // Send each event to the backend
            for (const event of eventsToAdd) {
                await adminAxiosInstance.post('/api/admin/events', event, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Event(s) added successfully',
                confirmButtonText: 'OK'
            });
            // Reset event form fields
            setNewEvent({
                title: '',
                date: '',
                time: '',
                durationMinutes: 60,
                locationPreset: '',
                location: '',
                signUpLink: '',
                repeat: '',
                repeatCount: '',
            });
            fetchEvents();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error adding event.',
                text: error.message,
                confirmButtonText: 'OK'
            });
        }
    };

    // Delete a single event
    const deleteEvent = async (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'This will permanently delete this event.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ff6b6b',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            customClass: {
                confirmButton: 'swal-confirm-button', // Ensures correct text color
            }
        }).then(async (result) => {
            if (!result.isConfirmed) return; // Exit if user cancels

            try {
                const token = localStorage.getItem('adminToken');
                await adminAxiosInstance.delete(`/api/events/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Event deleted successfully',
                    confirmButtonText: 'OK'
                });
                fetchEvents();
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Failed to delete event.',
                    text: error.message,
                    confirmButtonText: 'OK'
                });
            }
        });
    };

    // Select/deselect events for bulk delete
    const handleSelect = (id, isChecked) => {
        setSelectedEvents((prevSelected) =>
            isChecked ? [...prevSelected, id] : prevSelected.filter((eventId) => eventId !== id)
        );
    };

    // Bulk delete selected events
    const handleBulkDelete = async () => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'This will permanently delete this event.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ff6b6b',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            customClass: {
                confirmButton: 'swal-confirm-button', // Ensures correct text color
            }
        }).then(async (result) => {
            if (!result.isConfirmed) return; // Exit if user cancels

            try {
                const token = localStorage.getItem('adminToken');
                await adminAxiosInstance.delete('/api/events/bulk', {
                    headers: { Authorization: `Bearer ${token}` },
                    data: { eventIds: selectedEvents },
                });
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Selected event(s) deleted successfully',
                    confirmButtonText: 'OK'
                });
                setSelectedEvents([]);
                fetchEvents();
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Failed to delete selected events.',
                    text: error.message,
                    confirmButtonText: 'OK'
                });
            }
        });
    };

    const updateEvent = async (id, updatedEvent) => {
        try {
            const token = localStorage.getItem('adminToken');
            await adminAxiosInstance.put(`/api/events/${id}`, updatedEvent, {
                headers: { Authorization: `Bearer ${token}` },
            });
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Event updated successfully',
                confirmButtonText: 'OK'
            });
            fetchEvents();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Failed to update event.',
                text: error.message,
                confirmButtonText: 'OK'
            });
        }
    };

    const buildUpdatePayload = (event, patch) => ({
        title: patch.title ?? event.title,
        date: patch.date ?? event.date,
        time: patch.time ?? event.time,
        durationMinutes: patch.durationMinutes ?? event.durationMinutes,
        location: patch.location ?? event.location,
        signUpLink: patch.signUpLink ?? event.signUpLink,
    });

    const handleBulkUpdate = async () => {
        if (selectedEvents.length === 0) return;

        const selectedSet = new Set(selectedEvents);
        const eventsById = new Map(events.map((e) => [e._id, e]));
        const selected = events.filter((e) => selectedSet.has(e._id));

        const locationValue = bulkLocationText.trim();
        const wantsLocationChange = Boolean(locationValue);

        const titleValue = bulkTitle.trim();
        const dateValue = bulkDate.trim();
        const timeValue = bulkTime.trim();
        const linkValue = bulkLink.trim();
        const durationValueRaw = String(bulkDurationMinutes).trim();
        const durationValue = durationValueRaw ? Number(durationValueRaw) : null;
        const wantsDurationChange = Number.isFinite(durationValue) && durationValue > 0;

        const wantsAnyChange =
            Boolean(titleValue) ||
            Boolean(dateValue) ||
            Boolean(timeValue) ||
            Boolean(wantsDurationChange) ||
            Boolean(wantsLocationChange) ||
            Boolean(linkValue);

        if (!wantsAnyChange) {
            Swal.fire({
                icon: 'info',
                title: 'Nothing to update',
                text: 'Fill in at least one field (title, date, time, location, or link) to apply a bulk update.',
                confirmButtonText: 'OK'
            });
            return;
        }

        try {
            const token = localStorage.getItem('adminToken');
            // Update selected events sequentially to keep API simple/reliable
            for (const ev of selected) {
                const original = eventsById.get(ev._id);
                if (!original) continue;

                const patch = {};
                if (titleValue) patch.title = titleValue;
                if (dateValue) patch.date = dateValue;
                if (timeValue) patch.time = timeValue;
                if (wantsDurationChange) patch.durationMinutes = durationValue;
                if (wantsLocationChange) patch.location = locationValue;
                if (linkValue) patch.signUpLink = linkValue;

                const payload = buildUpdatePayload(original, patch);
                await adminAxiosInstance.put(`/api/events/${ev._id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }

            Swal.fire({
                icon: 'success',
                title: 'Updated successfully',
                text: `Updated ${selected.length} event(s) successfully.`,
                confirmButtonText: 'OK'
            });

            setBulkLocationText('');
            setBulkLink('');
            setBulkTitle('');
            setBulkDate('');
            setBulkTime('');
            setBulkDurationMinutes('');
            setShowBulkUpdate(false);
            setSelectedEvents([]);
            fetchEvents();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Bulk update failed',
                text: error.message,
                confirmButtonText: 'OK'
            });
        }
    };

    const handleLocationPresetChange = (presetId) => {
        const preset = LOCATION_PRESETS.find((p) => p.id === presetId);
        if (!preset) return;

        if (preset.id === 'other') {
            setNewEvent((prev) => ({
                ...prev,
                locationPreset: preset.id,
                location: '',
                signUpLink: '',
            }));
            return;
        }

        setNewEvent((prev) => ({
            ...prev,
            locationPreset: preset.id,
            location: preset.location,
            signUpLink: preset.signUpLink,
        }));
    };

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('adminToken');
                if (!token) throw new Error('No token found');

                await adminAxiosInstance.get('/api/admin/verify', {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } catch (error) {
                if (!alertShown.current) {
                    alertShown.current = true;
                    Swal.fire({
                        icon: 'error',
                        title: 'You are not authorized to access this page. Redirecting to login.',
                        text: error.message,
                        confirmButtonText: 'OK'
                    }).then(() => {
                        navigate('/admin'); // navigate after alert closes
                    });
                }
            }
        };

        checkAuth();
        fetchEvents();
    }, [navigate]);

    return (
        <AdminLayout>
            <div className="admin-dashboard">
            <h3 className="section-title">Manage Classes and Events</h3>
            <form className="event-form" onSubmit={addEvent}>
                <h3>Add New Event</h3>
                <div className="form-group">
                    <label>Title</label>
                    <input
                        type="text"
                        placeholder=""
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label>Date</label>
                    <input
                        type="date"
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label>Time</label>
                    <input
                        type="time"
                        value={newEvent.time}
                        onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label>Length (minutes)</label>
                    <input
                        type="number"
                        min="5"
                        max="600"
                        step="5"
                        value={newEvent.durationMinutes}
                        onChange={(e) => setNewEvent({ ...newEvent, durationMinutes: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label>Location</label>
                    <select
                        value={newEvent.locationPreset}
                        onChange={(e) => handleLocationPresetChange(e.target.value)}
                    >
                        <option value="">Select a location</option>
                        {LOCATION_PRESETS.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.label}
                            </option>
                        ))}
                    </select>
                    {newEvent.locationPreset === 'other' && (
                        <input
                            className="location-other-input"
                            type="text"
                            placeholder="Enter a new location name"
                            value={newEvent.location}
                            onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                        />
                    )}
                </div>
                <div className="form-group">
                    <label>Sign-Up Link</label>
                    <input
                        type="url"
                        placeholder=""
                        value={newEvent.signUpLink}
                        onChange={(e) => setNewEvent({ ...newEvent, signUpLink: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label>Repeat</label>
                    <select
                        value={newEvent.repeat}
                        onChange={(e) => setNewEvent({ ...newEvent, repeat: e.target.value })}
                    >
                        <option value="">None</option>
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Biweekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                </div>
                {newEvent.repeat ? (
                    <div className="form-group">
                        <label>Repeat count</label>
                        <input
                            type="number"
                            min="1"
                            max="200"
                            step="1"
                            value={newEvent.repeatCount}
                            onChange={(e) => setNewEvent({ ...newEvent, repeatCount: e.target.value })}
                        />
                    </div>
                ) : null}
                <button type="submit" className="add-event-button">Add Event</button>
            </form>

            <div className="upcoming-events-container">
                <h3>Upcoming Events</h3>
                {loading ? (
                    <p>Loading events...</p>
                ) : events.length > 0 ? (
                    <>
                        <div className="bulk-controls">
                            <div className="bulk-controls__filters">
                                <div className="bulk-controls-label">Filter by</div>
                                <div className="bulk-controls__dates">
                                    <label>
                                        From
                                        <input
                                            type="date"
                                            value={bulkStartDate}
                                            onChange={(e) => setBulkStartDate(e.target.value)}
                                        />
                                    </label>
                                    <label>
                                        To
                                        <input
                                            type="date"
                                            value={bulkEndDate}
                                            onChange={(e) => setBulkEndDate(e.target.value)}
                                        />
                                    </label>
                                    <label>
                                        Location
                                        <input
                                            type="text"
                                            value={filterLocation}
                                            onChange={(e) => setFilterLocation(e.target.value)}
                                            placeholder="e.g. Yoga Refuge, NW location"
                                            list="admin-location-suggestions"
                                        />
                                    </label>
                                    <datalist id="admin-location-suggestions">
                                        {[...new Set(events.map((e) => (e.location || '').trim()).filter(Boolean))].sort().map((loc) => (
                                            <option key={loc} value={loc} />
                                        ))}
                                    </datalist>
                                    <label>
                                        Title
                                        <input
                                            type="text"
                                            value={filterTitle}
                                            onChange={(e) => setFilterTitle(e.target.value)}
                                            placeholder="e.g. Vinyasa"
                                        />
                                    </label>
                                </div>
                            </div>
                            <div className="bulk-controls__actions">
                                <button
                                    type="button"
                                    className="bulk-action-button"
                                    onClick={() => toggleSelectAllFiltered(true)}
                                    disabled={filteredIds.length === 0}
                                >
                                    Select filtered
                                </button>
                                <button
                                    type="button"
                                    onClick={handleBulkDelete}
                                    disabled={selectedEvents.length === 0}
                                    className="bulk-delete-action-button"
                                    title={selectedEvents.length > 0 ? `Delete selected (${selectedEvents.length})` : 'Delete selected'}
                                    aria-label={selectedEvents.length > 0 ? `Delete selected (${selectedEvents.length})` : 'Delete selected'}
                                >
                                    <FaTrash className="icon" aria-hidden="true" />
                                    Delete selected
                                </button>
                                <button
                                    type="button"
                                    className="bulk-action-button"
                                    onClick={() => setShowBulkUpdate((v) => !v)}
                                    disabled={selectedEvents.length === 0}
                                    aria-expanded={showBulkUpdate}
                                >
                                    {showBulkUpdate ? 'Close update selected' : `Update selected classes/events (${selectedEvents.length})`}
                                </button>
                                <button
                                    type="button"
                                    className="bulk-action-button bulk-action-button--outline"
                                    onClick={() => {
                                        setBulkStartDate('');
                                        setBulkEndDate('');
                                        setFilterLocation('');
                                        setFilterTitle('');
                                        setSelectedEvents([]);
                                        setShowBulkUpdate(false);
                                    }}
                                    disabled={!bulkStartDate && !bulkEndDate && !filterLocation && !filterTitle}
                                >
                                    Clear filters
                                </button>
                                <button
                                    type="button"
                                    className="bulk-action-button bulk-action-button--outline"
                                    onClick={() => setSelectedEvents([])}
                                    disabled={selectedEvents.length === 0}
                                >
                                    Clear selection
                                </button>
                            </div>
                        </div>
                        {showBulkUpdate ? (
                            <div className="bulk-update">
                                <div className="bulk-update__title">
                                    Update selected classes/events ({selectedEvents.length})
                                </div>
                                <div className="bulk-update__hint">
                                    Leave a field blank to keep its current value.
                                </div>
                                <div className="bulk-update__row">
                                    <div className="bulk-update__field">
                                        <label>Title</label>
                                        <input
                                            type="text"
                                            value={bulkTitle}
                                            onChange={(e) => setBulkTitle(e.target.value)}
                                            placeholder="(leave blank to keep)"
                                        />
                                    </div>
                                    <div className="bulk-update__field">
                                        <label>Date</label>
                                        <input
                                            type="date"
                                            value={bulkDate}
                                            onChange={(e) => setBulkDate(e.target.value)}
                                        />
                                    </div>
                                    <div className="bulk-update__field">
                                        <label>Time</label>
                                        <input
                                            type="time"
                                            value={bulkTime}
                                            onChange={(e) => setBulkTime(e.target.value)}
                                        />
                                    </div>
                                    <div className="bulk-update__field">
                                        <label>Length (minutes)</label>
                                        <input
                                            type="number"
                                            min="5"
                                            max="600"
                                            step="5"
                                            value={bulkDurationMinutes}
                                            onChange={(e) => setBulkDurationMinutes(e.target.value)}
                                            placeholder="(leave blank to keep)"
                                        />
                                    </div>
                                    <div className="bulk-update__field">
                                        <label>Location</label>
                                        <input
                                            type="text"
                                            placeholder="(leave blank to keep)"
                                            value={bulkLocationText}
                                            onChange={(e) => setBulkLocationText(e.target.value)}
                                            list="admin-bulk-location-suggestions"
                                        />
                                        <datalist id="admin-bulk-location-suggestions">
                                            {[
                                                ...new Set([
                                                    ...LOCATION_PRESETS.filter((p) => p.id !== 'other').map((p) => p.location),
                                                    ...events.map((e) => (e.location || '').trim()).filter(Boolean),
                                                ]),
                                            ]
                                                .filter(Boolean)
                                                .sort()
                                                .map((loc) => (
                                                    <option key={loc} value={loc} />
                                                ))}
                                        </datalist>
                                    </div>
                                    <div className="bulk-update__field">
                                        <label>Link</label>
                                        <input
                                            type="url"
                                            placeholder="(leave blank to keep)"
                                            value={bulkLink}
                                            onChange={(e) => setBulkLink(e.target.value)}
                                        />
                                    </div>
                                    <div className="bulk-update__actions">
                                        <button
                                            type="button"
                                            className="bulk-action-button"
                                            onClick={handleBulkUpdate}
                                            disabled={selectedEvents.length === 0}
                                        >
                                            Apply update
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                        <div className="events-table-wrap">
                            <table className="events-table">
                                <thead>
                                    <tr>
                                        <th aria-label="Select for bulk delete">
                                            <input
                                                type="checkbox"
                                                checked={allFilteredSelected}
                                                onChange={(e) => toggleSelectAllFiltered(e.target.checked)}
                                                aria-label="Select all"
                                                title="Select all"
                                            />
                                        </th>
                                        <th>Title</th>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Length</th>
                                        <th>Location</th>
                                        <th>Link</th>
                                        <th aria-label="Actions"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEvents.map((event) => (
                                        <tr key={event._id}>
                                            <td className="events-td-check">
                                                <input
                                                    type="checkbox"
                                                    onChange={(e) => handleSelect(event._id, e.target.checked)}
                                                    checked={selectedEvents.includes(event._id)}
                                                    aria-label={`Select ${event.title} for bulk delete`}
                                                />
                                            </td>
                                            <td>
                                                <input type="text" name="title" defaultValue={event.title} className="events-input" />
                                            </td>
                                            <td>
                                                <input type="date" name="date" defaultValue={event.date} className="events-input" />
                                            </td>
                                            <td>
                                                <input type="time" name="time" defaultValue={event.time} className="events-input" />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    name="durationMinutes"
                                                    defaultValue={event.durationMinutes ?? 60}
                                                    min="5"
                                                    max="600"
                                                    step="5"
                                                    className="events-input"
                                                />
                                            </td>
                                            <td>
                                                <input type="text" name="location" defaultValue={event.location} className="events-input" />
                                            </td>
                                            <td className="events-td-link">
                                                <input type="text" name="signUpLink" defaultValue={event.signUpLink} className="events-input" />
                                                {event.signUpLink ? (
                                                    <a
                                                        href={event.signUpLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="events-open-link"
                                                    >
                                                        Open
                                                    </a>
                                                ) : (
                                                    <span className="events-open-link events-open-link--placeholder" aria-hidden="true">
                                                        Open
                                                    </span>
                                                )}
                                            </td>
                                            <td className="events-td-actions">
                                                <button
                                                    type="button"
                                                    className="update-event-button"
                                                    onClick={(e) => {
                                                        const row = e.currentTarget.closest('tr');
                                                        if (!row) return;
                                                        const updatedData = {
                                                            title: row.querySelector('input[name="title"]')?.value || '',
                                                            date: row.querySelector('input[name="date"]')?.value || '',
                                                            time: row.querySelector('input[name="time"]')?.value || '',
                                                            durationMinutes: Number(row.querySelector('input[name="durationMinutes"]')?.value) || 60,
                                                            location: row.querySelector('input[name="location"]')?.value || '',
                                                            signUpLink: row.querySelector('input[name="signUpLink"]')?.value || '',
                                                        };
                                                        updateEvent(event._id, updatedData);
                                                    }}
                                                >
                                                    Update
                                                </button>
                                                <button
                                                    type="button"
                                                    className="delete-single-event-button"
                                                    onClick={() => deleteEvent(event._id)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <p>No events added yet.</p>
                )}
            </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
