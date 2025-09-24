import React, { useState, useEffect } from 'react';
import { useUserAuth } from './UserAuthContext';
import axios from 'axios';
import './UserForms.scss';
import '../../App.scss';

function UserForms() {
    const { user } = useUserAuth();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch user data to get intake form completion status
    useEffect(() => {
        const fetchUserData = async () => {
            if (!user) return;
            
            try {
                const response = await axios.get(`${process.env.REACT_APP_API}/api/user/${user.id}`);
                setUserData(response.data);
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [user]);

    // Define the forms that users need to fill out
    const forms = [
        {
            name: 'New Client Form',
            link: 'https://docs.google.com/forms/d/e/1FAIpQLScvgtnQnBdWWTJqwQbqo98X_vNYpjuH9x-YpsAlced_xKjbSA/viewform?usp=header',
            description: 'Please fill out this form before your first session',
            isRequired: true,
            isCompleted: userData?.intakeFormCompleted || false
        },
        {
            name: 'Ayurvedic Dosha Quiz',
            link: 'https://www.banyanbotanicals.com/pages/dosha-quiz',
            description: 'Optional quiz to help me understand your Ayurvedic dosha, please share the results with me',
            isRequired: false,
            isCompleted: false // This one is always optional, so we don't track completion
        }
    ];

    if (!user || loading) {
        return <div>Loading forms...</div>;
    }

    return (
        <div className="user-forms">
            <h3 className="section-title">Forms</h3>
            <div className="title-line"></div>
            <p className="forms-description">
                Please complete the following forms before your first session.
            </p>
            
            <div className="forms-table-container">
                <table className="forms-table">
                    <thead>
                        <tr>
                            <th>Form Name</th>
                            <th>Description</th>
                            <th>Completed</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {forms.map((form, index) => (
                            <tr key={index} className="form-row">
                                <td className="form-name">
                                    <strong>{form.name}</strong>
                                </td>
                                <td className="form-description">
                                    {form.description}
                                </td>
                                <td className="form-completed">
                                    <span className={`completion-status ${form.isCompleted ? 'completed' : 'pending'}`}>
                                        {form.isCompleted ? '✓ Completed' : form.isRequired ? '○ Required' : '○ Optional'}
                                    </span>
                                </td>
                                <td className="form-action">
                                    {!form.isCompleted && (
                                        <a
                                            href={form.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="form-link"
                                        >
                                            Fill Out Form
                                        </a>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default UserForms;
