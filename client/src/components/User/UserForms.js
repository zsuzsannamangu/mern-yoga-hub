import React from 'react';
import { useUserAuth } from './UserAuthContext';
import './UserForms.scss';

function UserForms() {
    const { user } = useUserAuth();

    // Define the forms that users need to fill out
    const forms = [
        {
            name: 'New Client Form',
            link: 'https://docs.google.com/forms/d/e/1FAIpQLScvgtnQnBdWWTJqwQbqo98X_vNYpjuH9x-YpsAlced_xKjbSA/viewform?usp=header',
            description: 'Please fill out this form before your first session'
        },
        {
            name: 'Ayurvedic Dosha Quiz',
            link: 'https://www.banyanbotanicals.com/pages/dosha-quiz',
            description: 'Optional quiz to help me understand your Ayurvedic dosha, please share the results with me'
        }
    ];

    if (!user) {
        return <div>Loading forms...</div>;
    }

    return (
        <div className="user-forms">
            <h3 className="section-title">Required Forms</h3>
            <div className="title-line"></div>
            <p className="forms-description">
                Please complete the following forms before your first session. 
                All forms are required for your safety and to provide the best possible care.
            </p>
            
            <div className="forms-table-container">
                <table className="forms-table">
                    <thead>
                        <tr>
                            <th>Form Name</th>
                            <th>Description</th>
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
                                <td className="form-action">
                                    <a
                                        href={form.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="form-link"
                                    >
                                        Fill Out Form
                                    </a>
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
