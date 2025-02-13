import React from 'react';
import '../../App.scss';
import './ProfileIcon.scss';

/**
 * ProfileIcon Component
 * 
 * Displays a user's initials inside a profile icon.
 * If the user does not have a name, a fallback "?" is shown.
 *
 * @param {Object} props
 * @param {Object} props.user - User object containing `firstName` and `lastName`
 */

function ProfileIcon({ user }) {
    /**
     * Extracts and formats user initials.
     * If `firstName` or `lastName` is missing, a fallback "?" is used.
     * 
     * @returns {string} - The initials of the user (e.g., "AB" for "Alice Brown").
     */

    const getInitials = () => {
        const firstNameInitial = user?.firstName?.charAt(0)?.toUpperCase() || '?';
        const lastNameInitial = user?.lastName?.charAt(0)?.toUpperCase() || '';
        return `${firstNameInitial}${lastNameInitial}`.trim(); // Ensure no extra spaces
    };

    return (
        <div className="profile-icon">
            <div className="profile-initials">{getInitials()}</div>
        </div>
    );
}

export default ProfileIcon;
