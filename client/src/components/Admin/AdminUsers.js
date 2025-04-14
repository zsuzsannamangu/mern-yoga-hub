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

    // Fetch users when the component mounts
    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="admin-users">
            <AdminNavbar />
            <h3 className="section-title">Manage Users/Clients</h3>
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
                                <td>{user.createdAt}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No users found.</p>
            )}
        </div>
    );
};

export default AdminUsers;
