// UserOAuthHandler.js
import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

const UserOAuthHandler = () => {
  const [searchParams] = useSearchParams();
  const { userId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('userToken', token);
    }

    // Now redirect to the real protected route
    navigate(`/user/${userId}`, { replace: true });
  }, [searchParams, userId, navigate]);

  return <div>Signing you in...</div>;
};

export default UserOAuthHandler;
