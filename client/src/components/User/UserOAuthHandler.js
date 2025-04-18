import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUserAuth } from './UserAuthContext';

const UserOAuthHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useUserAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const userId = searchParams.get('userId');

    console.log("🔁 OAuthHandler received token:", token);
    console.log("🔁 OAuthHandler received userId:", userId);

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
          console.error('OAuth validation failed:', err);
          navigate('/login');
        }
      };

      validateToken();
    } else {
      navigate('/login');
    }
  }, [searchParams, login, navigate]);

  return <div>Signing you in...</div>;
};

export default UserOAuthHandler;
