import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUserAuth } from './UserAuthContext';
import Swal from 'sweetalert2';
import '@sweetalert2/theme-material-ui/material-ui.css';

const UserOAuthHandler = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useUserAuth();

    useEffect(() => {
        const token = searchParams.get('token');
        const userId = searchParams.get('userId');

        if (token && userId) {
            localStorage.setItem('userToken', token);

            const validateToken = async () => {
                try {
                    const response = await fetch(`${process.env.REACT_APP_API}/api/user/validate-token`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token }),
                    });

                    const data = await response.json();
                    if (data.isValid) {
                        login(data.user, token);
                        navigate(`/user/${userId}`, { replace: true });
                    } else {
                        navigate('/login');
                    }
                } catch (err) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Session expired',
                        text: 'Please try signing in again.',
                    });
                    navigate('/login');
                }
            };

            validateToken();
        } else {
            navigate('/login');
        }
    }, [searchParams, login, navigate]);

    return (
        <div className="loading-container">
            <div className="spinner"></div>
            <p>Signing you in...</p>
        </div>
    );
};

export default UserOAuthHandler;
