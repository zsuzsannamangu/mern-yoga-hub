import React, { useState, useEffect } from 'react';
import { adminAxiosInstance } from '../../config/axiosConfig';
import './AdminUsers.scss';
import '../../App.scss';
import AdminNavbar from './AdminNavbar';
import Swal from 'sweetalert2';
import '@sweetalert2/theme-material-ui/material-ui.css';
import { FaTrash } from 'react-icons/fa'; // Trash icon for delete button

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

    // Fetch users when the component mounts
    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="admin-users">
            <AdminNavbar />
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
                            <tr key={user._id}>
                                <td>{index + 1}</td> {/* Display row number */}
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
                                    <button className="delete-button" onClick={() => deleteUser(user._id)}>
                                        <FaTrash />
                                    </button>
                                </td>

                            </tr>
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
        </div>
    );
};

export default AdminUsers;
