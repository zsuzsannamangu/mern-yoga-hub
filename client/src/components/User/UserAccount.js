import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { useUserAuth } from './UserAuthContext';
import './UserAccount.scss';
import '../../App.scss';

function UserAccount() {
    const { user } = useUserAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [userData, setUserData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        preferredName: user?.preferredName || '',
        pronoun: user?.pronoun || '',
        city: user?.city || '',
        zipcode: user?.zipcode || '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData((prev) => ({ ...prev, [name]: value }));
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setUserData({
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            email: user?.email || '',
            phone: user?.phone || '',
            preferredName: user?.preferredName || '',
            pronoun: user?.pronoun || '',
            city: user?.city || '',
            zipcode: user?.zipcode || '',
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${process.env.REACT_APP_API}/api/user/${user.id}/update`, { // Explicitly set backend URL
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    phone: userData.phone,
                    preferredName: userData.preferredName || '',
                    pronoun: userData.pronoun || '',
                    city: userData.city || '',
                    zipcode: userData.zipcode || '',
                }),
            });

            if (response.ok) {
                const updatedUser = await response.json();
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Profile updated successfully!',
                });
                setIsEditing(false);
            } else {
                throw new Error('Failed to update profile.');
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Something went wrong!',
                text: 'Failed to update profile. Please try again later.',
            });
        }
    };

    return (
        <div className="user-account">
            <h3 className="section-title">Account Settings</h3>
            <div className="title-line"></div>
            <form onSubmit={handleSave} className="account-form">
                <div className="form-section">
                    <div className="full-width">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={userData.email}
                            disabled
                        />
                    </div>
                    <div>
                        <label htmlFor="phone">Phone</label>
                        <input
                            type="tel" // Use `tel` for phone numbers
                            id="phone"
                            name="phone"
                            value={userData.phone}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value.length <= 10 && /^[0-9]*$/.test(value)) { // Allow only numbers and up to 10 digits
                                    handleChange(e);
                                }
                            }}
                            disabled={!isEditing}
                        />
                    </div>
                    <div>
                        <label htmlFor="firstName">First Name</label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={userData.firstName}
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                    </div>
                    <div>
                        <label htmlFor="lastName">Last Name</label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={userData.lastName}
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                    </div>
                    <div>
                        <label htmlFor="preferredName">Preferred Name</label>
                        <input
                            type="text"
                            id="preferredName"
                            name="preferredName"
                            value={userData.preferredName}
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                    </div>
                    <div>
                        <label htmlFor="pronoun">Pronoun</label>
                        <input
                            type="text"
                            id="pronoun"
                            name="pronoun"
                            value={userData.pronoun}
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                    </div>
                    <div>
                        <label htmlFor="city">City & State</label>
                        <input
                            type="text"
                            id="city"
                            name="city"
                            value={userData.city}
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                    </div>
                    <div>
                        <label htmlFor="zipcode">Zipcode</label>
                        <input
                            type="number" // Enforces numeric input
                            id="zipcode"
                            name="zipcode"
                            value={userData.zipcode}
                            onChange={(e) => {
                                const value = e.target.value.slice(0, 5); // Restrict to 5 digits
                                if (/^\d*$/.test(value)) { // Allow only numbers
                                    handleChange({ target: { name: 'zipcode', value } });
                                }
                            }}
                            disabled={!isEditing}
                        />
                    </div>
                </div>
                <div className="form-actions">
                    {isEditing ? (
                        <>
                            <button type="button" className="cancel-btn" onClick={handleCancel}>
                                Cancel
                            </button>
                            <button type="submit" className="save-btn">
                                Save
                            </button>
                        </>
                    ) : (
                        <button type="button" className="save-btn" onClick={handleEdit}>
                            Edit
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}

export default UserAccount;
