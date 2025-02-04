import React, { useState, useEffect } from 'react';
import { adminAxiosInstance } from '../../config/axiosConfig';
import { FaTrash } from 'react-icons/fa';
import './AdminSignups.scss';
import '../../App.scss';
import AdminNavbar from './AdminNavbar';
import Swal from 'sweetalert2';
import '@sweetalert2/theme-material-ui/material-ui.css';

const AdminSignups = () => {
    const [signups, setSignups] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch all signups from the database
    const fetchSignups = async () => {
        setLoading(true);
        try {
            const res = await adminAxiosInstance.get('/api/admin/signups');
            const sortedSignups = res.data.sort((a, b) => new Date(a.date) - new Date(b.date));
            setSignups(sortedSignups);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Failed to fetch class signups.',
                text: 'Please try again later.',
                confirmButtonText: 'OK'
            });
            console.error('Fetch Signups Error:', error.message);
        } finally {
            setLoading(false);
        }
    };

    // Delete a signup by ID
    const deleteSignup = async (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'This will permanently delete the signup.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ff6b6b',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            customClass: {
                confirmButton: 'swal-confirm-button', // Custom class for fixing button text color
            }
        }).then(async (result) => {
            if (!result.isConfirmed) {
                return; // Exit function if user cancels
            }
            try {
                const token = localStorage.getItem('adminToken');
                await adminAxiosInstance.delete(`/api/signup/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Signup deleted successfully.',
                    confirmButtonText: 'OK'
                });
                fetchSignups(); // Refresh the list after deletion
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Failed to delete signup.',
                    text: 'Please try again later.',
                    confirmButtonText: 'OK'
                });
            }
        });
    };

    useEffect(() => {
        fetchSignups();
    }, []);

    return (
        <div className="admin-signups">
            <AdminNavbar />
            <h3 className="section-title">Manage Class Registrations</h3>
            {loading ? (
                <p>Loading signups...</p>
            ) : signups.length > 0 ? (
                <table className="signup-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Class Title</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {signups.map((signup) => (
                            <tr key={signup._id}>
                                <td>{new Date(signup.date).toLocaleDateString()}</td>
                                <td>{signup.classTitle}</td>
                                <td>{signup.name}</td>
                                <td>{signup.email}</td>
                                <td>{signup.phone}</td>
                                <td>
                                    <button
                                        className="delete-button"
                                        onClick={() => deleteSignup(signup._id)}
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No signups found.</p>
            )}
        </div>
    );
};

export default AdminSignups;
