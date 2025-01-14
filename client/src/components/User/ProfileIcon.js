import React from 'react';
import '../../App.scss';
import './ProfileIcon.scss';

function ProfileIcon({ user }) {

    const getInitials = () => {
        const firstNameInitial = user?.firstName?.charAt(0)?.toUpperCase() || '?';
        const lastNameInitial = user?.lastName?.charAt(0)?.toUpperCase() || '';
        return `${firstNameInitial}${lastNameInitial}`.trim();
    };

    return (
        <div className="profile-icon">
            <div className="profile-initials">{getInitials()}</div>
        </div>
    );
}

export default ProfileIcon;

