// UserOAuthHandler.js
import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

const UserOAuthHandler = () => {
  const [searchParams] = useSearchParams();
  const { userId: paramUserId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const queryUserId = searchParams.get('userId');
    const finalUserId = queryUserId || paramUserId;

    if (token && finalUserId) {
      localStorage.setItem('userToken', token);
      localStorage.setItem('userId', finalUserId);
      navigate(`/user/${finalUserId}`, { replace: true });
    }
  }, [searchParams, paramUserId, navigate]);

  return <div>Signing you in...</div>;
};

export default UserOAuthHandler;
