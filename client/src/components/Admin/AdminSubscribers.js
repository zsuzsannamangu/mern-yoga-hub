import React, { useEffect, useState } from 'react';
import './AdminSubscribers.scss';

const AdminSubscribers = () => {
  const [subscribers, setSubscribers] = useState([]);

  useEffect(() => {
    const fetchSubscribers = async () => {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${process.env.REACT_APP_API}/api/admin/subscribers`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      setSubscribers(data);
    };

    fetchSubscribers();
  }, []);

  return (
    <div className="admin-subscribers">
      <h2>Newsletter Subscribers</h2>
      <ul>
        {subscribers.map(sub => (
          <li key={sub._id}>{sub.email} – {new Date(sub.subscribedAt).toLocaleDateString()}</li>
        ))}
      </ul>
    </div>
  );
};

export default AdminSubscribers;
