import React, { useState, useEffect } from 'react';
import { adminAxiosInstance } from '../../config/axiosConfig';
import './AdminUsers.scss';
import '../../App.scss';
import AdminLayout from './AdminLayout';
import Swal from 'sweetalert2';
import '@sweetalert2/theme-material-ui/material-ui.css';
import { FaTrash, FaPlus, FaEdit, FaTimes } from 'react-icons/fa'; // Icons for buttons

const AdminUsers = () => {
    const [users, setUsers] = useState([]); // State to store users
    const [loading, setLoading] = useState(false); // State to track loading status
    const [showAddForm, setShowAddForm] = useState(false); // State to control form visibility
    const [newClient, setNewClient] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        preferredName: '',
        pronoun: '',
        city: '',
        zipcode: ''
    });
    // Appointment states
    const [showAppointmentForm, setShowAppointmentForm] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [appointments, setAppointments] = useState({}); // userId -> appointments array
    const [expandedUsers, setExpandedUsers] = useState(new Set()); // Track which users are expanded
    const [newAppointment, setNewAppointment] = useState({
        title: '',
        date: '',
        time: '',
        length: '',
        location: ''
    });

    // Fetch all users from the database
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await adminAxiosInstance.get('/api/admin/users'); // API request to get users
            const sortedUsers = res.data.sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort users by creation date
            setUsers(sortedUsers);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Failed to fetch users.',
                text: 'Please try again later.',
                confirmButtonText: 'OK'
            });
            console.error('Fetch Users Error:', error.message);
        } finally {
            setLoading(false);
        }
    };

    // Delete a user by ID
    const deleteUser = async (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'This will permanently delete the user.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ff6b6b',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            customClass: {
                confirmButton: 'swal-confirm-button',
            }
        }).then(async (result) => {
            if (!result.isConfirmed) return;

            try {
                const token = localStorage.getItem('adminToken');
                await adminAxiosInstance.delete(`/api/admin/users/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'User deleted successfully.',
                    confirmButtonText: 'OK'
                });
                fetchUsers(); // Refresh the list
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Failed to delete user.',
                    text: 'Please try again later.',
                    confirmButtonText: 'OK'
                });
            }
        });
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewClient({ ...newClient, [name]: value });
    };

    // Handle form submission
    const handleAddClient = async (e) => {
        e.preventDefault();
        
        // Validate required fields
        if (!newClient.firstName || !newClient.lastName || !newClient.email) {
            Swal.fire({
                icon: 'error',
                title: 'Missing Required Fields',
                text: 'Please fill in first name, last name, and email.',
                confirmButtonText: 'OK'
            });
            return;
        }

        try {
            const token = localStorage.getItem('adminToken');
            const response = await adminAxiosInstance.post('/api/admin/users', newClient, {
                headers: { Authorization: `Bearer ${token}` },
            });

            Swal.fire({
                icon: 'success',
                title: 'Client Created Successfully!',
                text: 'The client has been created and a welcome email has been sent.',
                confirmButtonText: 'OK'
            });

            // Reset form and close modal
            setNewClient({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                preferredName: '',
                pronoun: '',
                city: '',
                zipcode: ''
            });
            setShowAddForm(false);
            fetchUsers(); // Refresh the list
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Failed to Create Client',
                text: error.response?.data?.message || 'Please try again later.',
                confirmButtonText: 'OK'
            });
        }
    };

    // Fetch appointments for a specific user
    const fetchAppointments = async (userId) => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await adminAxiosInstance.get(`/api/admin/users/${userId}/appointments`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAppointments(prev => ({
                ...prev,
                [userId]: response.data
            }));
        } catch (error) {
            console.error('Error fetching appointments:', error);
        }
    };

    // Handle appointment form input changes
    const handleAppointmentInputChange = (e) => {
        const { name, value } = e.target;
        setNewAppointment({ ...newAppointment, [name]: value });
    };

    // Handle appointment form submission
    const handleAddAppointment = async (e) => {
        e.preventDefault();
        
        if (!newAppointment.title || !newAppointment.date || !newAppointment.time || !newAppointment.length) {
            Swal.fire({
                icon: 'error',
                title: 'Missing Required Fields',
                text: 'Please fill in title, date, time, and length.',
                confirmButtonText: 'OK'
            });
            return;
        }

        try {
            const token = localStorage.getItem('adminToken');
            const response = await adminAxiosInstance.post('/api/admin/appointments', {
                userId: selectedUserId,
                ...newAppointment
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            Swal.fire({
                icon: 'success',
                title: 'Appointment Created Successfully!',
                text: 'The appointment has been created and a confirmation email has been sent.',
                confirmButtonText: 'OK'
            });

            // Reset form and close modal
            setNewAppointment({
                title: '',
                date: '',
                time: '',
                length: '',
                location: ''
            });
            setShowAppointmentForm(false);
            
            // Refresh appointments for this user
            if (selectedUserId) {
                fetchAppointments(selectedUserId);
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Failed to Create Appointment',
                text: error.response?.data?.message || 'Please try again later.',
                confirmButtonText: 'OK'
            });
        }
    };

    // Toggle user expansion
    const toggleUserExpansion = (userId) => {
        const newExpanded = new Set(expandedUsers);
        if (newExpanded.has(userId)) {
            newExpanded.delete(userId);
        } else {
            newExpanded.add(userId);
            // Fetch appointments when expanding
            fetchAppointments(userId);
        }
        setExpandedUsers(newExpanded);
    };

    // Handle reschedule appointment
    const handleRescheduleAppointment = async (appointmentId) => {
        // For now, just show a placeholder - we'll implement this next
        Swal.fire({
            icon: 'info',
            title: 'Reschedule Function',
            text: 'Reschedule functionality will be implemented next.',
            confirmButtonText: 'OK'
        });
    };

    // Handle cancel appointment
    const handleCancelAppointment = async (appointmentId) => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'This will cancel the appointment.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ff6b6b',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, cancel it!',
            cancelButtonText: 'Cancel'
        }).then(async (result) => {
            if (!result.isConfirmed) return;

            try {
                const token = localStorage.getItem('adminToken');
                await adminAxiosInstance.put(`/api/admin/appointments/${appointmentId}/cancel`, {}, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                Swal.fire({
                    icon: 'success',
                    title: 'Appointment Cancelled!',
                    text: 'The appointment has been cancelled successfully.',
                    confirmButtonText: 'OK'
                });

                // Refresh appointments
                if (selectedUserId) {
                    fetchAppointments(selectedUserId);
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Failed to Cancel Appointment',
                    text: error.response?.data?.message || 'Please try again later.',
                    confirmButtonText: 'OK'
                });
            }
        });
    };

    // Format time with timezone
    const formatTimeWithZone = (dateStr, timeStr) => {
        const [hour, minute] = timeStr.split(':');
        const date = new Date(`${dateStr}T${timeStr}`);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZoneName: 'short'
        });
    };

    // Fetch users when the component mounts
    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <AdminLayout>
            <div className="admin-users">
            <div className="users-header">
                <h3 className="section-title">Manage Users/Clients</h3>
                <button 
                    className="add-client-btn" 
                    onClick={() => setShowAddForm(true)}
                >
                    Add New Client
                </button>
            </div>
            {loading ? (
                <p>Loading users...</p>
            ) : users.length > 0 ? (
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>#</th> {/* Number column */}
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Preferred Name</th>
                            <th>Pronoun</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Location</th>
                            <th>Zip</th>
                            <th>User Since</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <React.Fragment key={user._id}>
                                <tr className="user-row" onClick={() => toggleUserExpansion(user._id)}>
                                    <td>{index + 1}</td>
                                    <td>{user.firstName}</td>
                                    <td>{user.lastName}</td>
                                    <td>{user.preferredName}</td>
                                    <td>{user.pronoun}</td>
                                    <td>{user.email}</td>
                                    <td>{user.phone}</td>
                                    <td>{user.city}</td>
                                    <td>{user.zipcode}</td>
                                    <td>{new Date(user.createdAt).toLocaleString('en-US', {
                                        timeZone: 'America/Los_Angeles',
                                        dateStyle: 'medium',
                                        timeStyle: 'short',
                                    })}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button 
                                                className="add-appointment-btn" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedUserId(user._id);
                                                    setShowAppointmentForm(true);
                                                }}
                                                title="Add Appointment"
                                            >
                                                <FaPlus />
                                            </button>
                                            <button 
                                                className="delete-button" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteUser(user._id);
                                                }}
                                                title="Delete User"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                {expandedUsers.has(user._id) && (
                                    <tr className="appointments-row">
                                        <td colSpan="11">
                                            <div className="appointments-container">
                                                <h4>Appointments for {user.firstName} {user.lastName}</h4>
                                                {appointments[user._id] && appointments[user._id].length > 0 ? (
                                                    <div className="appointments-list">
                                                        {appointments[user._id].map((appointment) => (
                                                            <div key={appointment._id} className="appointment-item">
                                                                <div className="appointment-details">
                                                                    <strong>{appointment.title}</strong>
                                                                    <span>{new Date(appointment.date).toLocaleDateString()}</span>
                                                                    <span>{formatTimeWithZone(appointment.date, appointment.time)}</span>
                                                                    <span>{appointment.length}</span>
                                                                    <span>{appointment.location || 'TBD'}</span>
                                                                    <span className={`status ${appointment.status}`}>
                                                                        {appointment.status}
                                                                    </span>
                                                                </div>
                                                                <div className="appointment-actions">
                                                                    <button 
                                                                        className="reschedule-btn"
                                                                        onClick={() => handleRescheduleAppointment(appointment._id)}
                                                                        title="Reschedule"
                                                                    >
                                                                        <FaEdit />
                                                                    </button>
                                                                    <button 
                                                                        className="cancel-btn"
                                                                        onClick={() => handleCancelAppointment(appointment._id)}
                                                                        title="Cancel"
                                                                    >
                                                                        <FaTimes />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p>No appointments scheduled.</p>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No users found.</p>
            )}

            {/* Add Client Modal */}
            {showAddForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Add New Client</h3>
                            <button 
                                className="close-btn" 
                                onClick={() => setShowAddForm(false)}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleAddClient} className="add-client-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="firstName">First Name *</label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={newClient.firstName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="lastName">Last Name *</label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={newClient.lastName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="email">Email *</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={newClient.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="phone">Phone</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={newClient.phone}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="preferredName">Preferred Name</label>
                                    <input
                                        type="text"
                                        id="preferredName"
                                        name="preferredName"
                                        value={newClient.preferredName}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="pronoun">Pronoun</label>
                                    <input
                                        type="text"
                                        id="pronoun"
                                        name="pronoun"
                                        value={newClient.pronoun}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="city">City</label>
                                    <input
                                        type="text"
                                        id="city"
                                        name="city"
                                        value={newClient.city}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="zipcode">Zip Code</label>
                                    <input
                                        type="text"
                                        id="zipcode"
                                        name="zipcode"
                                        value={newClient.zipcode}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="button" onClick={() => setShowAddForm(false)} className="cancel-btn">
                                    Cancel
                                </button>
                                <button type="submit" className="submit-btn">
                                    Create Client
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Appointment Modal */}
            {showAppointmentForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Add New Appointment</h3>
                            <button 
                                className="close-btn" 
                                onClick={() => setShowAppointmentForm(false)}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleAddAppointment} className="add-appointment-form">
                            <div className="form-group">
                                <label htmlFor="title">Title *</label>
                                <select
                                    id="title"
                                    name="title"
                                    value={newAppointment.title}
                                    onChange={handleAppointmentInputChange}
                                    required
                                >
                                    <option value="">Select appointment type</option>
                                    <option value="Yoga Therapy">Yoga Therapy</option>
                                    <option value="Private Yoga">Private Yoga</option>
                                </select>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="date">Date *</label>
                                    <input
                                        type="date"
                                        id="date"
                                        name="date"
                                        value={newAppointment.date}
                                        onChange={handleAppointmentInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="time">Time *</label>
                                    <input
                                        type="time"
                                        id="time"
                                        name="time"
                                        value={newAppointment.time}
                                        onChange={handleAppointmentInputChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="length">Length *</label>
                                    <select
                                        id="length"
                                        name="length"
                                        value={newAppointment.length}
                                        onChange={handleAppointmentInputChange}
                                        required
                                    >
                                        <option value="">Select duration</option>
                                        <option value="60 min">60 min</option>
                                        <option value="75 min">75 min</option>
                                        <option value="90 min">90 min</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="location">Location</label>
                                    <input
                                        type="text"
                                        id="location"
                                        name="location"
                                        value={newAppointment.location}
                                        onChange={handleAppointmentInputChange}
                                        placeholder="Physical address or meeting link"
                                    />
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="button" onClick={() => setShowAppointmentForm(false)} className="cancel-btn">
                                    Cancel
                                </button>
                                <button type="submit" className="submit-btn">
                                    Create Appointment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            </div>
        </AdminLayout>
    );
};

export default AdminUsers;
